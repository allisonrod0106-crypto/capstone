# STEP-BY-STEP-GUIDE
## Table of Contents

1. [Daily Journal Backend](#1-backend)


## Backend
A complete walkthrough of how the back-end was built, from project setup through testing every route in Thunder Client.

---

## Backend Table of Contents

1. [Project Setup](#1-project-setup)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Folder Structure](#3-folder-structure)
4. [Environment Variables](#4-environment-variables)
5. [Connecting to MongoDB with Mongoose](#5-connecting-to-mongodb-with-mongoose)
6. [Defining Mongoose Models](#6-defining-mongoose-models)
7. [Authentication Middleware](#7-authentication-middleware)
8. [Building the API Routes](#8-building-the-api-routes)
9. [Running the Server](#9-running-the-server)
10. [Testing in Thunder Client](#10-testing-in-thunder-client)

---

## 1. Project Setup

```bash
mkdir journal-backend
cd journal-backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install --save-dev nodemon
```

Update `package.json` with a dev script:

```json
"scripts": {
  "start": "node src/server.js",
  "dev":   "nodemon src/server.js"
}
```

---

## 2. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Click **Create a New Project**, name it `journal`.
3. Build a free **M0 cluster** (choose any region).
4. Under **Database Access** → Add a database user with a username and password. Save these.
5. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for local dev.
6. Click **Connect** on your cluster → **Connect your application** → copy the connection string.
7. Replace `<username>` and `<password>` in the string with your database user credentials.

The URI looks like:
```
mongodb+srv://alice:mypassword@cluster0.xxxxx.mongodb.net/journal?retryWrites=true&w=majority
```

---

## 3. Folder Structure

```
journal-backend/
├── src/
│   ├── server.js              # Entry point
│   ├── db/
│   │   └── database.js        # Mongoose connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Entry.js           # Entry schema
│   │   └── Streak.js          # Streak schema
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── users.js           # /api/users
│   │   ├── prompts.js         # /api/prompts
│   │   ├── entries.js         # /api/entries
│   │   └── streaks.js         # /api/streaks
│   └── utils/
│       └── streak.js          # Streak update logic
├── .env                       # Secret config (never commit this)
├── .env.example               # Template to share with team
├── .gitignore
└── package.json
```

---

## 4. Environment Variables

Create a `.env` file in the project root (never commit this file):

```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/journal?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

The `.gitignore` includes:
```
.env
node_modules/
```

Load these in code with `require('dotenv').config()` at the top of `server.js`.

---

## 5. Connecting to MongoDB with Mongoose

**`src/db/database.js`**

```js
const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in your .env file.');
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = { connectDb };
```

Called in `server.js` before `app.listen()` so the server only starts once the database is ready.

---

## 6. Defining Mongoose Models

### Why Mongoose?

Mongoose gives us schema validation, type casting, and helpful instance methods out of the box — so we don't have to write raw MongoDB queries.

### User Model

Key decisions:
- `email` is stored lowercase with a regex validator.
- Password is hashed with `bcrypt` in a `pre('save')` hook — the plain-text password never touches the database.
- `comparePassword()` is an instance method used at login.

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

### Entry Model

- References `User` via `userId` (ObjectId ref).
- Compound index on `{ userId, createdAt }` for fast sorted lookups.
- Text index on `{ prompt, response }` enables MongoDB's `$text` search.

### Streak Model

- One streak document per user (`userId` is `unique`).
- `lastEntryDate` is stored as `YYYY-MM-DD` string for simple date comparison without timezone issues.

---

## 7. Authentication Middleware

**`src/middleware/auth.js`**

All protected routes import and use this middleware:

```js
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
```

The decoded `req.user` object is then available in every protected route handler.

---

## 8. Building the API Routes

### POST /api/users/register

1. Validate that `username`, `email`, and `password` are present.
2. Check MongoDB for an existing user with the same username or email.
3. Call `User.create()` — the `pre('save')` hook hashes the password automatically.
4. Sign a JWT with `jwt.sign({ sub: user._id, username }, secret, { expiresIn })`.
5. Return `201` with the token and safe user fields (no password).

### POST /api/users/login

1. Find user by email.
2. Call `user.comparePassword(password)` — returns a boolean.
3. If valid, sign and return a JWT.
4. If invalid, always return `401` with a generic message (never reveal which field was wrong).

### GET /api/prompts/daily

- No database call needed; prompts are stored as a JS array.
- Uses `(dayOfYear + userIdHash) % prompts.length` so each user gets a consistent but personalised prompt per day, rotating at midnight.

### POST /api/entries

1. Validate `prompt` and `response`.
2. Save a new `Entry` document with `userId` from `req.user`.
3. Call `updateStreak(userId)` — this is idempotent (writing twice on the same day won't double the streak).
4. Return `201` with the created entry.

### GET /api/entries

- Filters by `userId` from the JWT.
- Supports `?search=<text>` using MongoDB's `$text` index.
- Supports `?page` and `?limit` for pagination.

### GET /api/streaks

- Fetches the user's streak document.
- Applies a **lazy reset**: if `lastEntryDate` is neither today nor yesterday, `currentStreak` is reset to `0` and saved before responding. This avoids needing a scheduled job.

---

## 9. Running the Server

```bash
# Make sure .env is configured with your MongoDB URI and JWT_SECRET
npm run dev
```

Expected output:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
Journal API running on http://localhost:3000
```

If you see `Failed to connect to MongoDB`, double-check:
- Your `.env` values (no quotes around values, no trailing spaces)
- Atlas Network Access allows your current IP
- Atlas Database Access user credentials are correct

---

## 10. Testing in Thunder Client

Install the **Thunder Client** extension in VS Code (`thunderclient.thunder-client`).

### Step 1 — Register a user

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/users/register`
- **Body (JSON):**
  ```json
  {
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- **Expected:** `201` with a `token` field.
- **Copy the token** — you'll need it for all protected routes.

---

### Step 2 — Log in

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/users/login`
- **Body (JSON):**
  ```json
  { "email": "alice@example.com", "password": "password123" }
  ```
- **Expected:** `200` with a fresh `token`.

---

### Step 3 — Get today's prompt

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/prompts/daily`
- **Header:** `Authorization: Bearer <your_token>`
- **Expected:** `200` with a `prompt` object and today's `date`.

---

### Step 4 — Create a journal entry

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/entries`
- **Header:** `Authorization: Bearer <your_token>`
- **Body (JSON):**
  ```json
  {
    "prompt": "What are three things you're grateful for today?",
    "response": "My family, a good cup of coffee, and this project finally working."
  }
  ```
- **Expected:** `201` with the saved entry.

---

### Step 5 — List past entries

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/entries`
- **Header:** `Authorization: Bearer <your_token>`
- **Expected:** `200` with an `entries` array and `pagination` info.

Try search: `http://localhost:3000/api/entries?search=grateful`

---

### Step 6 — Check streaks

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/streaks`
- **Header:** `Authorization: Bearer <your_token>`
- **Expected:** `200` with `currentStreak`, `longestStreak`, and `lastEntryDate`.

---

### Common Thunder Client Errors

| Error | Likely cause |
| ----- | ------------ |
| `ECONNREFUSED` | Server isn't running — check `npm run dev` |
| `401 Missing Authorization header` | Token not set or wrong header name |
| `401 Invalid or expired token` | Token is old — log in again to get a fresh one |
| `500 Internal server error` | Check terminal — usually a MongoDB or validation issue |

## 11. Front-End Setup (Milestone 3)

### Tech Stack
- **Vue 3** with Vite
- **Vue Router** for navigation
- **Pinia** for state management
- **Axios** for HTTP requests

---

### Prerequisites
Make sure the backend is already running before starting the frontend.

---

### Installation

```bash
# From the capstone folder (one level above journal-backend)
npm create vite@latest journal-frontend -- --template vue
cd journal-frontend
npm install vue-router pinia axios
```

---

### Folder Structure
journal-frontend/
├── src/
│   ├── api/
│   │   └── axios.js        # Axios instance with token interceptor
│   ├── stores/
│   │   └── auth.js         # Pinia auth store (login, register, logout)
│   ├── router/
│   │   └── index.js        # Vue Router with route guards
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Register.vue    # Registration form
│   │   ├── Login.vue       # Login form
│   │   ├── Journal.vue     # Daily prompt + entry submission
│   │   └── History.vue     # Past entries with search
│   ├── App.vue
│   └── main.js
└── package.json

---

### Environment

The frontend expects the backend running at `http://localhost:3000`.
If you changed the backend port, update `src/api/axios.js` to match.

---

### Running Both Servers

Open two terminal tabs:

```bash
# Terminal 1 — backend
cd journal-backend
npm run dev

# Terminal 2 — frontend
cd journal-frontend
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:3000`

---

### Testing the Full User Journey

1. Go to `http://localhost:5173/register`
2. Create an account — you should land on `/journal`
3. Read today's prompt and write a response, click **Save Entry**
4. Click **View past entries** — your entry should appear
5. Check MongoDB Atlas → `entries` collection to confirm it persisted

---

### Route Guard Behaviour

Protected routes (`/journal`, `/history`) redirect to `/login` if no token is found in localStorage. To test this, open DevTools → Application → Local Storage → delete the `token` entry, then try visiting `/journal` directly.

---

### Common Issues

| Problem | Fix |
|---|---|
| Prompt doesn't load | Make sure backend is running on port 3000 |
| `401` errors on all requests | Token missing or expired — log out and log in again |
| Port 3000 already in use | Run `kill -9 $(lsof -ti:3000)` then restart backend |
| CORS error in console | Make sure `cors()` is in `server.js` on the backend |

## 12. Deployment

> Note: This project uses Render (back-end) and Netlify (front-end) instead of Railway and GitHub Pages.
> Both are free and easier to set up for a monorepo project.

---

### Back-end — Render

1. Push your full repo to GitHub if you haven't already:
```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
```

2. Go to [render.com](https://render.com) and sign up with your GitHub account

3. Click **New** → **Web Service**

4. Select your GitHub repo

5. Fill in the settings:

   | Setting | Value |
   |---|---|
   | Name | `journal-backend` |
   | Root Directory | `journal-backend` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node src/server.js` |
   | Instance Type | `Free` |
   | Region | Choose closest to you |

6. Scroll down to **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | Your full Atlas connection string |
   | `JWT_SECRET` | Your secret key |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | Add this after you get your Netlify URL |

7. Click **Create Web Service** — Render will build and deploy automatically

8. If the deploy fails with a MongoDB connection error, go to MongoDB Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**, then redeploy

9. Copy your live backend URL from the top of the Render dashboard, it looks like: https://journal-backend.onrender.com

> **Note:** Free Render services spin down after 15 minutes of inactivity and take ~30 seconds to wake up on the first request. This is normal for a free tier.

---

### Setting Environment Variables on Render

To add or update environment variables after deployment:

1. Go to your Render dashboard → click your service
2. Click the **Environment** tab
3. Click **Add Environment Variable**
4. Enter the key and value
5. Click **Save** — Render redeploys automatically, no manual rebuild needed

---

### Front-end — Netlify

1. Make sure `src/api/axios.js` uses an environment variable for the base URL:
```js
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
   })
```

2. Create `journal-frontend/public/_redirects` with this content: /* /index.html 200
This is required so Vue Router works on direct URL visits and page refresh.

3. Commit and push both changes:
```bash
   git add .
   git commit -m "configure env variable and add Netlify redirects"
   git push
```

4. Go to [netlify.com](https://netlify.com) and sign up with your GitHub account

5. Click **Add new site** → **Import an existing project** → **GitHub**

6. Select your repo and fill in the build settings:

   | Setting | Value |
   |---|---|
   | Base directory | `journal-frontend` |
   | Build command | `npm run build` |
   | Publish directory | `journal-frontend/dist` |

7. Click **Add environment variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL |

8. Click **Deploy site** — after ~2 minutes you'll get a live URL like: This is required so Vue Router works on direct URL visits and page refresh.

3. Commit and push both changes:
```bash
   git add .
   git commit -m "configure env variable and add Netlify redirects"
   git push
```

4. Go to [netlify.com](https://netlify.com) and sign up with your GitHub account

5. Click **Add new site** → **Import an existing project** → **GitHub**

6. Select your repo and fill in the build settings:

   | Setting | Value |
   |---|---|
   | Base directory | `journal-frontend` |
   | Build command | `npm run build` |
   | Publish directory | `journal-frontend/dist` |

7. Click **Add environment variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL |

8. Click **Deploy site** — after ~2 minutes you'll get a live URL like: This is required so Vue Router works on direct URL visits and page refresh.

3. Commit and push both changes:
```bash
   git add .
   git commit -m "configure env variable and add Netlify redirects"
   git push
```

4. Go to [netlify.com](https://netlify.com) and sign up with your GitHub account

5. Click **Add new site** → **Import an existing project** → **GitHub**

6. Select your repo and fill in the build settings:

   | Setting | Value |
   |---|---|
   | Base directory | `journal-frontend` |
   | Build command | `npm run build` |
   | Publish directory | `journal-frontend/dist` |

7. Click **Add environment variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL |

8. Click **Deploy site** — after ~2 minutes you'll get a live URL like: https://rad-horse-f722f0.netlify.app
---

### Linking the Front-end to the Back-end

The frontend talks to the backend via the `VITE_API_URL` environment variable set in Netlify. Every API request from the Vue app is automatically sent to your Render backend URL.

To update the backend URL the frontend points to:
1. Go to Netlify → your site → **Site configuration** → **Environment variables**
2. Update `VITE_API_URL`
3. Go to **Deploys** → **Trigger deploy** → **Deploy site** to rebuild with the new value

---

### CORS Configuration

The backend must explicitly allow requests from the frontend URL. In `src/server.js`:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}))
```

After deploying the frontend, add `FRONTEND_URL` to your Render environment variables:

| Key | Value |
|---|---|
| `FRONTEND_URL` | Your Netlify URL |

Render redeploys automatically after saving. Without this, the browser will block all API requests from the frontend with a CORS error.

---

### Verifying the Full Deployment

1. Visit your Netlify URL
2. Register a new account
3. Write a journal entry, save the response, gratitudes, and goals
4. Click View History — your entry should appear
5. Check MongoDB Atlas → Browse Collections → `entries` — the document should be there

---

### Troubleshooting

| Problem | Fix |
|---|---|
| Render deploy fails with MongoDB error | Allow all IPs in Atlas Network Access |
| Frontend shows blank page on refresh | Make sure `_redirects` file exists in `public/` |
| API requests blocked with CORS error | Add `FRONTEND_URL` to Render environment variables |
| Backend takes 30s to respond | Normal for free Render tier — it's waking up from sleep |
| Netlify build fails | Check the Base directory is set to `journal-frontend` |