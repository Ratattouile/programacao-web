const Medicao = require('../models/Medicao');
const Planta = require('../models/Planta');
const Alerta = require('../models/Alerta');
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

        const ervaAtual = loteExiste.ervaAromatica.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const plantas = await Planta.find();
        const planta = plantas.find(p =>
            p.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === ervaAtual
        );
        if (planta) {
            if (planta.tempMinima !== undefined && temperatura < planta.tempMinima) {
                await Alerta.create({
                    loteId,
                    gravidade: temperatura < planta.tempMinima - 5 ? 'Crítico' : 'Aviso',
                    descricao: `Temperatura abaixo do mínimo para ${planta.nome}: ${temperatura}°C (mínimo: ${planta.tempMinima}°C)`,
                    estado: 'Pendente'
                });
            } else if (planta.tempMaxima !== undefined && temperatura > planta.tempMaxima) {
                await Alerta.create({
                    loteId,
                    gravidade: temperatura > planta.tempMaxima + 5 ? 'Crítico' : 'Aviso',
                    descricao: `Temperatura acima do máximo para ${planta.nome}: ${temperatura}°C (máximo: ${planta.tempMaxima}°C)`,
                    estado: 'Pendente'
                });
            }

            if (planta.humidadeMinima !== undefined && humidade < planta.humidadeMinima) {
                await Alerta.create({
                    loteId,
                    gravidade: 'Aviso',
                    descricao: `Humidade abaixo do mínimo para ${planta.nome}: ${humidade}% (mínimo: ${planta.humidadeMinima}%)`,
                    estado: 'Pendente'
                });
            } else if (planta.humidadeMaxima !== undefined && humidade > planta.humidadeMaxima) {
                await Alerta.create({
                    loteId,
                    gravidade: 'Aviso',
                    descricao: `Humidade acima do máximo para ${planta.nome}: ${humidade}% (máximo: ${planta.humidadeMaxima}%)`,
                    estado: 'Pendente'
                });
            }
        }
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