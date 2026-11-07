import express from "express";
import {
    register,
    login
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// Rota protegida
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Acesso autorizado!",
        user: req.user
    });
});

export default router;