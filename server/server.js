
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import { redirectUrl } from "./controllers/urlController.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);

// Página inicial
app.get("/", (req, res) => {
    res.json({
        message: "LinkShortener API funcionando!"
    });
});

// Redirecionamento dos links curtos
app.get("/:shortCode", redirectUrl);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Falha ao iniciar servidor:", error.message);
    }
};

startServer();
