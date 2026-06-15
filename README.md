# Candor | AI Interview Pro

Candor (AI Interview Pro) is a full-stack application that simulates realistic technical interviews using AI. Candidates can register, upload a CV or resume, pick a target role and seniority, then engage in an interactive interview chat. After the session completes, the app generates an AI-driven evaluation report and tracks performance over time.

## 🚀 Features

- User authentication: register, login, and secure profile access
- Resume/CV upload: PDF or image support with structured candidate parsing
- AI-powered interview simulation: context-aware interview questions tailored to candidate skills, experience, and chosen role
- Chat-based interview interface: sequential, realistic question/answer flow
- Feedback generation: AI evaluation with scores, strengths, weaknesses, and recommendations
- Interview history: track completed sessions and average score
- Theme toggle: light/dark mode in the UI

## 🧱 Architecture

The project is split into two main parts:

- `client/`: Next.js 14+ frontend using React and Tailwind CSS
- `server/`: Express-based backend API with MongoDB, OpenAI, LangChain, and resume parsing

## 📁 Project Structure

- `client/`
  - `src/app/`: Next.js application entrypoint and page layout
  - `src/components/`: UI components for auth, upload, chat, and report
  - `src/context/`: authentication and theme providers
  - `src/lib/api.ts`: frontend API helpers

- `server/`
  - `src/controllers/`: request handlers for auth and interview workflow
  - `src/routes/`: Express route definitions
  - `src/services/`: AI interview, CV parsing, and auth logic
  - `src/models/`: Mongoose schemas for `User` and `Interview`
  - `src/config/`: database, OpenAI, and upload configuration

## ⚙️ Requirements

- Node.js 20+ (recommended)
- npm
- MongoDB instance or MongoDB Atlas
- OpenAI API key

## 🔧 Environment Variables

Create a `.env` file in the `server/` folder with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

`CLIENT_URL` is used for CORS configuration and defaults to `http://localhost:3000`.

## 📦 Installation

Install dependencies for both the client and server.

```bash
cd client
npm install

cd ../server
npm install
```

## 🧪 Running Locally

Start the server first, then start the frontend.

```bash
cd server
npm run dev
```

```bash
cd ../client
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 🧠 How It Works

1. User registers or logs in via the frontend.
2. Candidate uploads a CV/resume and chooses a target role + seniority.
3. The backend parses the resume using OpenAI and extracts structured profile data.
4. The AI interview service starts a session and asks role-specific questions.
5. The user answers through the chat UI.
6. When finished, the backend generates an evaluation report using AI.
7. Completed interviews are stored and aggregated per user.

## 🧩 API Endpoints

### Auth

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Log in and receive credentials
- `GET /api/auth/profile` — Fetch authenticated user profile

### Interview

- `POST /api/interviews/upload-cv` — Upload CV, create interview session, and start the AI interview
- `GET /api/interviews/` — List user interviews
- `GET /api/interviews/:sessionId` — Fetch interview session details
- `POST /api/interviews/:sessionId/message` — Send user message and receive AI response
- `POST /api/interviews/:sessionId/finish` — Complete interview and generate feedback

## 🛠️ Technology Stack

- Frontend: Next.js, React, Tailwind CSS, TypeScript
- Backend: Node.js, Express, MongoDB, Mongoose
- AI: OpenAI, LangChain
- Resume parsing: `pdf-parse`, OpenAI text/image parsing
- Authentication: JWT-based route protection

## ✅ Notes

- The server expects `OPENAI_API_KEY` in environment variables.
- Uploaded CVs are parsed into structured JSON and stored with interview sessions.
- AI prompts are designed to keep the interview sequential and role-specific.
- Feedback uses JSON output so the app can render score and recommendations cleanly.

## 📌 Troubleshooting

- If the backend cannot connect to MongoDB, confirm `MONGODB_URI` is valid.
- If OpenAI requests fail, verify your `OPENAI_API_KEY` and API access.
- If the frontend or backend fails to start, check for package version mismatches and run `npm install` again.

## 🌟 Recommended Improvements

- Add a dedicated root `package.json` to manage both workspaces together.
- Add tests for API routes, auth, and interview logic.
- Add file upload validation at the frontend.
- Add a production deployment guide.

---

Built for AI-driven interview preparation with resume analysis, interactive chat, and structured feedback.
