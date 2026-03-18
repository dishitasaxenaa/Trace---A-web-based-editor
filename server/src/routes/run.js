import { Router }  from "express";
import { runCode } from "../controllers/runController.js";

const router = Router();

// POST /api/run
// Body: { language: "python" | "cpp", code: string }
router.post("/run", runCode);

export default router;