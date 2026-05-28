const Plano = require('../models/Plano');

exports.listarPlanos = async (req, res) => {
    try {
        const planos = await Plano.find().sort({dataCriacao:-1}); //mais recentes primeiro
        return res.status(200).json({ sucesso: true, dados: planos });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.criarPlanos = async (req, res) => {
    try {
        const dadosPlano = req.body;

        dadosPlano.estadoAutorizacao = dadosPlano.tipo === "Pontual" ? "Pendente" : "Aprovado";

        const novoPlano = await Plano.create(dadosPlano);
        
        return res.status(201).json({ sucesso: true, mensagem: "Plano criado com sucesso", dados: novoPlano });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ sucesso: false, erro: "Faltam campos obrigatórios para este tipo de plano específico." });
        }
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.autorizarPlano = async (req, res) => {
    try {
        const plano = await Plano.findByIdAndUpdate(req.params.id, { estadoAutorizacao: "Aprovado" }, { new: true });
        if (!plano) return res.status(404).json({ sucesso: false, erro: "Plano não encontrado" });
        return res.status(200).json({ sucesso: true, mensagem: "Plano autorizado com sucesso", dados: plano });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
