# Daily Journal Web App v1.0.0

## Project Overview
The Daily Journal Web App solves the problem of inconsistent journaling by providing users with daily writing prompts, allowing them to build a sustainable habit of self-reflection and personal growth tracking.

## Who Uses It & What It Lets Them Do
The app is for anyone who wants to journal but struggles with the "blank page" problem. It lets users write daily journal entries in response to randomized prompts, track their progress over time, and explore their thoughts and emotions in a structured, yet flexible format.

## Chosen Idea & Core Features
- **Daily Prompts**: Users are presented with a new writing prompt each day, covering themes like self-reflection, gratitude, and goal-setting.
- **Timed vs. Unrestricted Writing**: Users can choose between a 60-second timed session or an open-ended writing mode, depending on their preferences.
- **Journal Entry History**: Users can view and search their past journal entries, allowing them to track their personal growth and development.

## Data Model
- **Users**: `username`, `email`, `password`, `createdAt`, `updatedAt`
- **Entries**: `userId`, `prompt`, `response`, `createdAt`
- **Streaks**: `userId`, `currentStreak`, `longestStreak`, `createdAt`, `updatedAt`

## API Endpoints
| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/users/register` | Create a new user account |
| POST | `/api/users/login` | Authenticate a user and return a JWT token |
| GET | `/api/prompts/daily` | Retrieve the daily writing prompt |
| POST | `/api/entries` | Create a new journal entry |
| GET | `/api/entries` | Retrieve a user's past journal entries |
| GET | `/api/streaks` | Retrieve a user's current and longest streaks |

## Authentication
Yes, the app requires authentication. Users need to sign up and log in to access their personal journal entries and track their writing progress over time.
