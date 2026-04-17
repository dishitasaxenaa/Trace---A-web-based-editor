# 🚀 Trace — Code Execution Platform with AI Assistance

Trace is a full-stack code execution platform that allows users to write, run, and test code in real time, with integrated AI assistance for explanations and guidance.

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 💻 **Multi-language Execution** | Supports Python and C++ code execution natively. |
| ⚡ **Real-time Output** | Instant output with robust input/output handling. |
| 🧪 **Test Case Support** | Run custom inputs for logic validation and debugging. |
| 🤖 **AI Assistance** | Integrated Groq-powered AI for code explanations and hints. |
| 🧱 **Modular UI** | Purpose-built sections for Editor, Test Panel, and AI Chat. |
| 🔐 **Safety Controls** | Implementation of execution timeouts and basic code filtering. |

---

## 🧠 How It Works

Trace follows a streamlined workflow to ensure low-latency execution and helpful feedback:

1.  **Input:** The user writes code in the browser-based editor.
2.  **Storage:** The backend captures the code and stores it in a temporary local file.
3.  **Execution:** The system triggers a `child_process` to run the compiler/interpreter.
4.  **Capture:** Standard output (stdout) and errors (stderr) are captured in real-time.
5.  **Response:** The result is piped back to the frontend for display.

| Step | Action | Outcome |
| :--- | :--- | :--- |
| 1 | Write Code | Editor captures syntax |
| 2 | Temporary Save | File created in `server/tmp` |
| 3 | `child_process` | Native compilation/interpretation |
| 4 | Stream Results | Output/Errors buffered |
| 5 | UI Update | Results rendered in terminal panel |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, CSS3 |
| **Backend** | Node.js, Express.js |
| **Execution** | Node `child_process` API |
| **AI Integration** | Groq Cloud API (Llama-3/Mixtral) |

---

## 📂 Project Structure

```text
TRACE/
├── frontend/    # React application (Vite-based UI)
│   ├── src/
│   └── public/
└── server/      # Node.js backend (Execution logic & APIs)
    ├── routes/
    └── index.js
```

##  ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/trace.git
cd trace
```

### 2. Backend Setup

```bash
cd server
npm install
```
Create a .env file in the server directory and add your API key:
```bash
GROQ_API_KEY=your_api_key_here
PORT=5000
```
Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 🔑 Environment Variables
| Variable | Description | Example |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | API key for AI integration | `gsk_xxxxx` |

### 👩‍💻 Author
Dishita Saxena
