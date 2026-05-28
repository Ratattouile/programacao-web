const Medicao = require('../models/Medicao');
const Lote = require('../models/Lote');

exports.registarMedicao = async (req, res) => {
    const { loteId, temperatura, humidade, luminosidade } = req.body;

    if (!loteId || temperatura === undefined || humidade === undefined || luminosidade === undefined) {
        return res.status(400).json({ sucesso: false, erro: "Faltam dados da medição." });
    }

    try {
        const loteExiste = await Lote.findById(loteId);
        if (!loteExiste) {
            return res.status(404).json({ sucesso: false, erro: "Lote não encontrado." });
        }

        const novaMedicao = await Medicao.create({ loteId, temperatura, humidade, luminosidade });


        return res.status(201).json({ sucesso: true, mensagem: "Medição registada", dados: novaMedicao });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.listarMedicoes = async (req, res) => {
    try {
        const medicoes = await Medicao.find().populate('loteId', 'ervaAromatica estado').sort({ dataRegisto: -1 });
        return res.status(200).json({ sucesso: true, dados: medicoes });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};