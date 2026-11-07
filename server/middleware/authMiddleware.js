import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        // Recebe o token enviado pelo usuário
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Acesso negado. Token não fornecido."
            });
        }

        // Separa o token da palavra Bearer
        const token = authHeader.split(" ")[1];

        // Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guarda os dados do usuário na requisição
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token inválido ou expirado."
        });
    }
};

export default authMiddleware;