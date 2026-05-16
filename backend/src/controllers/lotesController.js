const Lote = require('../models/Lote');

exports.listarLotes = async (req, res) => {
    try {
        const lotes = await Lote.find().populate('planoId', 'nome');
        return res.status(200).json({ sucesso: true, dados: lotes });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.criarLotes = async (req, res) => {
    const { ervaAromatica, planoId, quantidadeInicial } = req.body;

    if (!ervaAromatica || !planoId || quantidadeInicial === undefined) {
        return res.status(400).json({ sucesso: false, erro: "Faltam campos obrigatorios" });
    }

    try {
        const novoLote = await Lote.create({ ervaAromatica, planoId, quantidadeInicial, quantidadeAtual: quantidadeInicial });
        return res.status(201).json({ sucesso: true, mensagem: "Lote criado com sucesso", dados: novoLote });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.dividirLote = async (req, res) => {
    const { quantidadeSeparar } = req.body;

    if (!quantidadeSeparar || quantidadeSeparar <= 0) {
        return res.status(400).json({ sucesso: false, erro: "A 'quantidadeSeparar' é obrigatória e deve ser maior que zero." });
    }

    try {
        const loteOriginal = await Lote.findById(req.params.id);
        if (!loteOriginal) return res.status(404).json({ sucesso: false, erro: "Lote não encontrado" });

        if (quantidadeSeparar >= loteOriginal.quantidadeAtual) {
            return res.status(400).json({ sucesso: false, erro: "Quantidade a separar excede a quantidade atual do lote" });
        }

        loteOriginal.quantidadeAtual -= quantidadeSeparar;
        await loteOriginal.save();

        const loteFilho = await Lote.create({
            ervaAromatica: loteOriginal.ervaAromatica,
            planoId: loteOriginal.planoId,
            quantidadeInicial: quantidadeSeparar,
            quantidadeAtual: quantidadeSeparar
        });

        return res.status(200).json({ sucesso: true, mensagem: "Lote dividido com sucesso", dados: { loteOriginal, loteFilho } });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.perdasLote = async (req, res) => {
    const { quantidadePerdida, motivo } = req.body;

    if (!quantidadePerdida || quantidadePerdida <= 0 || !motivo) {
        return res.status(400).json({ sucesso: false, erro: "A quantidade perdida e o motivo são obrigatórios" });
    }

    try {
        const lote = await Lote.findById(req.params.id);
        if (!lote) return res.status(404).json({ sucesso: false, erro: "Lote não encontrado" });

        lote.quantidadeAtual -= quantidadePerdida;
        lote.estado = "Comprometido";
        await lote.save();

        return res.status(200).json({ sucesso: true, mensagem: `Perda de ${quantidadePerdida} plantas registada`, dados: lote });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
