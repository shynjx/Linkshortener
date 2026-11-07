
import express from "express";

import {
    createUrl,
    getUrlStats
} from "../controllers/urlController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Criar URL encurtada
router.post("/", authMiddleware, createUrl);

// Buscar estatísticas do usuário
router.get("/stats", authMiddleware, getUrlStats);

export default router;
