const Lote = require('../models/Lote');
const Alerta = require('../models/Alerta');
const { registarLog } = require('../utils/auditoria');

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
        await registarLog(req, 'Criou Lote', `Erva: ${ervaAromatica} | Qtd: ${quantidadeInicial}`);
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
        await registarLog(req, 'Dividiu Lote', `Separou ${quantidadeSeparar} plantas do Lote original (${loteOriginal._id})`);
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
        await registarLog(req, 'Registou Perda', `Lote: ${lote._id} | Qtd Perdida: ${quantidadePerdida} | Motivo: ${motivo}`);

        await Alerta.create({
            loteId: lote._id,
            gravidade: 'Crítico',
            descricao: `Perda de ${quantidadePerdida} plantas registada. Motivo: ${motivo}`
        });

        return res.status(200).json({ sucesso: true, mensagem: `Perda de ${quantidadePerdida} plantas registada`, dados: lote });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};


exports.exportarCSV = async (req, res) => {
    try {
        const lotes = await Lote.find().populate('planoId', 'nome');

        let csv = 'ID Lote,Erva Aromatica,Plano,Quantidade Inicial,Quantidade Atual,Estado,Data Inicio\n';

        lotes.forEach(lote => {
            const planoNome = lote.planoId ? lote.planoId.nome : 'Sem plano';
            const data = new Date(lote.dataInicio).toLocaleDateString('pt-PT');

            csv += `${lote._id},${lote.ervaAromatica},${planoNome},${lote.quantidadeInicial},${lote.quantidadeAtual},${lote.estado},${data}\n`;
        });

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('relatorio_lotes.csv');
        return res.send(csv);
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

