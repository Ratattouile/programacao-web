const Utilizador = require('../models/Utilizador');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { nome, username, password, cargo } = req.body;

    if (!nome || !username || !password || !cargo) {
        return res.status(400).json({ sucesso: false, erro: "Faltam campos: nome, username, password e cargo." });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const existente = await Utilizador.findOne({ username });
        if (existente) return res.status(409).json({ sucesso: false, erro: "Username já registado" });

        const novoUtilizador = await Utilizador.create({ nome, username, password: passwordHash, cargo });
        return res.status(201).json({ sucesso: true, mensagem: "Conta criada com sucesso!", dados: { id: novoUtilizador._id, nome, cargo } });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ sucesso: false, erro: "Username e password são obrigatórios." });
    }

    try {
        const utilizador = await Utilizador.findOne({ username });

        if (!utilizador) return res.status(401).json({ sucesso: false, erro: "Credenciais inválidas." });

        const passwordCorreta = await bcrypt.compare(password, utilizador.password);
        if (!passwordCorreta) return res.status(401).json({ sucesso: false, erro: "Credenciais inválidas." });

        return res.status(200).json({
            sucesso: true,
            mensagem: "Login efetuado com sucesso!",
            dados: { id: utilizador._id, nome: utilizador.nome, cargo: utilizador.cargo }
        });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
