# Trace - Web-Based Code Editor With AI Assistance

Trace is a full-stack web-based code editor where users can write code, run it with custom input, compare actual and expected output, and ask an AI assistant for explanations, hints, complexity analysis, and optimization help.

It is designed for students and coding-practice users who want the editor, test panel, console, and AI helper in one workspace.

## Features

- Monaco-based code editor
- Custom test input and expected output comparison
- Console output panel
- Groq-powered AI assistant
- Quick actions for explaining, optimizing, and analyzing code
- Backend validation and safety checks
- Docker-based execution in the current backend code

## Tech Stack

- Frontend: React, Vite, Monaco Editor
- Backend: Node.js, Express.js, CORS, dotenv
- Execution: Docker through Node `child_process.spawn`
- AI: Groq OpenAI-compatible API

## Execution Flow

1. The frontend sends code, language, and optional input to `POST /api/run`.
2. `runController.js` validates the request.
3. `codeGuard.js` blocks obvious unsafe code patterns.
4. `executor.js` runs the code inside a temporary Docker container.
5. The backend returns `{ output, error }` to the frontend.

Docker is used as the intended sandboxing layer so user code does not run directly on the host machine. The executor applies limits such as no network access, memory/CPU caps, read-only filesystem, auto cleanup, and timeout handling.

## Language Support

The backend Docker executor has mappings for Python, C++, JavaScript, Java, Go, and Rust.

Currently, the frontend maps Python and C++ end-to-end. The remaining languages need frontend mapping updates before full UI support.

## AI Assistant

The AI assistant is implemented in `AIPanel.jsx`. It sends the user's message, current code, selected language, and chat history to `POST /api/ai/chat`.

The backend calls Groq using `GROQ_API_KEY`, which keeps the API key hidden from browser JavaScript.

## Setup

Backend:

```bash
cd server
npm install
npm run dev
```

Create `server/.env`:

```bash
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite runs on port `5173` and proxies `/api` requests to `http://localhost:5000`.

## API Endpoints

- `POST /api/run` - executes submitted code.
- `POST /api/ai/chat` - sends code-aware chat requests to the AI assistant.
- `GET /health` - returns backend health status.
  
## Author

Dishita Saxena
