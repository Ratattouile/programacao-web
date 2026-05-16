const Alerta = require('../models/Alerta');

exports.listarAlertas = async (req, res) => {
    try {
        const alertas = await Alerta.find().populate('loteId', 'ervaAromatica');
        return res.status(200).json({ sucesso: true, dados: alertas });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.resolverAlerta = async (req, res) => {
    try {
        const alerta = await Alerta.findByIdAndUpdate(req.params.id, { estado: "Resolvido" }, { new: true });
        if (!alerta) return res.status(404).json({ sucesso: false, erro: "Alerta não encontrado" });
        return res.status(200).json({ sucesso: true, mensagem: "Alerta resolvido com sucesso", dados: alerta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.ignorarAlerta = async (req, res) => {
    const { justificacao } = req.body;

    try {
        const alerta = await Alerta.findByIdAndUpdate(
            req.params.id,
            { estado: "Ignorado", justificacao: justificacao || '' },
            { new: true }
        );
        if (!alerta) return res.status(404).json({ sucesso: false, erro: "Alerta não encontrado" });
        return res.status(200).json({ sucesso: true, mensagem: "Alerta ignorado", dados: alerta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
