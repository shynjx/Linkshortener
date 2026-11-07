
import Url from "../models/Url.js";
import { nanoid } from "nanoid";
import validator from "validator";

// Criar URL encurtada
export const createUrl = async (req, res) => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl) {
            return res.status(400).json({
                message: "Informe uma URL"
            });
        }

        if (!validator.isURL(originalUrl)) {
            return res.status(400).json({
                message: "URL inválida"
            });
        }

        const shortCode = nanoid(7);

        const newUrl = await Url.create({
            originalUrl,
            shortCode,
            user: req.user.id
        });

        res.status(201).json({
            message: "URL encurtada com sucesso!",
            originalUrl,
            shortUrl: `http://localhost:8000/${shortCode}`,
            shortCode,
            clicks: 0
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao encurtar URL",
            error: error.message
        });
    }
};

// Redirecionar URL
export const redirectUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const url = await Url.findOneAndUpdate(
            { shortCode },
            { $inc: { clicks: 1 } },
            { new: true }
        );

        if (!url) {
            return res.status(404).json({
                message: "URL não encontrada"
            });
        }

        return res.redirect(url.originalUrl);

    } catch (error) {
        res.status(500).json({
            message: "Erro ao redirecionar URL",
            error: error.message
        });
    }
};


export const getUrlStats = async (req, res) => {
    try {
        // Buscar URLs do usuário logado
        const urls = await Url.find({
            user: req.user.id
        }).sort({ clicks: -1, createdAt: -1 }).lean();

        // Calcular estatísticas
        const totalLinks = urls.length;

        const totalClicks = urls.reduce(
            (total, url) => total + url.clicks,
            0
        );

        // Cinco links mais acessados
        const topLinks = urls.slice(0, 5);

        // Cinco links criados recentemente
        const recentLinks = [...urls]
            .sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(0, 5);

        res.status(200).json({
            totalLinks,
            totalClicks,
            topLinks,
            recentLinks
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao buscar estatísticas",
            error: error.message
        });
    }
};
    