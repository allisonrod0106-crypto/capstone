# Project Reflection — Daily Journal Web App

## Overview

This project is a full-stack daily journaling web app built over four milestones. Users can register, log in, receive a daily writing prompt, record journal entries with goals and gratitudes, track their writing streaks, and view their entry history. The app is deployed with a Vue frontend on Netlify and a Node.js/Express backend on Render, connected to a MongoDB Atlas database.

---

## What I Built

The app covers the full stack:

- **Back-end:** Node.js and Express REST API with six endpoints covering authentication, daily prompts, journal entries, and streak tracking. Data is stored in MongoDB Atlas using Mongoose models for Users, Entries, and Streaks.
- **Front-end:** Vue 3 app scaffolded with Vite, using Vue Router for navigation, Pinia for state management, and Axios for API communication.
- **Authentication:** JWT-based auth with protected routes on both the backend (middleware) and frontend (navigation guards).
- **Features:** Daily writing prompts that rotate per user per day, separate save buttons for journal responses, goals, and gratitudes, a writing streak tracker, entry history with search, and a colour theme switcher with four themes.

---

## What Went Well

The part of the project I'm most proud of is the **theme switcher and styling**. Getting the app to feel visually polished and letting users personalise their experience with different colour schemes was something I really enjoyed working on. Using CSS custom properties (variables) meant that switching themes only required updating a handful of values on the root element — the whole app responded instantly without any page reload. It was a good lesson in how powerful CSS variables can be when used consistently across a global stylesheet.

The overall styling process also helped me understand how much difference a clear visual system makes. Starting with a single global CSS file and defining consistent classes like `.card`, `.prompt-box`, and `.form-group` made it much easier to keep every page feeling like part of the same app.

---

## The Biggest Challenge

The hardest part of the project was **deployment on Render and Netlify**. There were several issues that were not obvious at first:

- MongoDB Atlas had IP whitelisting enabled, which blocked Render's servers from connecting. The fix was to allow access from all IPs, but understanding why the error was happening took time.
- The frontend and backend live in the same GitHub repository (a monorepo), which required configuring both Render and Netlify to look at the correct subfolder rather than the repo root.
- CORS errors appeared after deployment because the `FRONTEND_URL` environment variable on Render was initially set to a deploy-specific Netlify URL instead of the permanent one, causing the browser to block all API requests.
- The `node_modules` folder was accidentally committed to GitHub, which bloated the repository and had to be removed from git tracking with `git rm --cached`.

Each of these issues required reading error messages carefully and understanding how the different services communicate. Getting through them built a lot of confidence in debugging deployment problems.

---

## What I Would Do Differently

**Better error handling and validation** is the area I would improve most. Right now, errors surface as generic messages like "Something went wrong." A better approach would be to show specific, user-friendly messages for every failure case — for example, distinguishing between a network error and a validation error, or telling the user exactly which field is invalid on a form.

I would also add **mood tracking** as an additional journal feature. Each entry could include a mood rating (a simple 1–5 scale or an emoji selector), which would allow users to look back at their history and spot patterns between their mood and their writing. Over time this could surface insights like which days of the week tend to feel better, or whether writing streaks correlate with more positive moods.

---

## Key Lessons

- **Environment variables matter.** Managing different values for local development and production (MongoDB URI, JWT secret, API base URL, CORS origin) was one of the most important practical skills this project taught. Getting them wrong caused almost every deployment issue.
- **Read the error message first.** Most problems — CORS, MongoDB connection failures, port conflicts — had clear error messages that pointed directly to the solution. Taking the time to read the full error instead of guessing saved a lot of time.
- **Commit often and with clear messages.** Keeping commits small and descriptive made it easy to track what changed and when, and gave a clear picture of how the project developed over time.
- **Full-stack thinking.** Building both sides of the app made it clear how much the frontend and backend depend on each other — a change to an API response shape, a new field on a model, or a missing CORS header all have immediate consequences on the other side.
