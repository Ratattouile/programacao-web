const Medicao = require('../models/Medicao');
const Planta = require('../models/Planta');
const Alerta = require('../models/Alerta');
const Lote = require('../models/Lote');
const Plano = require('../models/Plano');
const Tarefa = require('../models/Tarefa');

function mapearTarefa(variavel) {
    if (variavel === 'temperatura') return 'Monitorização';
    if (variavel === 'humidade') return 'Rega';
    if (variavel === 'luminosidade') return 'Monitorização';
    return 'Monitorização';
}

exports.registarMedicao = async (req, res) => {
    const { loteId, temperatura, humidade, luminosidade } = req.body;

    if (!loteId || temperatura === undefined || humidade === undefined || luminosidade === undefined) {
        return res.status(400).json({ sucesso: false, erro: "Faltam dados da medição." });
    }

    try {
        const loteExiste = await Lote.findById(loteId).populate('planoId');
        if (!loteExiste) {
            return res.status(404).json({ sucesso: false, erro: "Lote não encontrado." });
        }

        // Validação de coerência dos dados (RF 4.7 - dados incoerentes / falha de sensores)
        const incoerentes = [];
        if (Number.isNaN(temperatura) || temperatura < -50 || temperatura > 80) incoerentes.push(`Temperatura inválida: ${temperatura}`);
        if (Number.isNaN(humidade) || humidade < 0 || humidade > 100) incoerentes.push(`Humidade inválida: ${humidade}`);
        if (Number.isNaN(luminosidade) || luminosidade < 0) incoerentes.push(`Luminosidade inválida: ${luminosidade}`);

        const novaMedicao = await Medicao.create({ loteId, temperatura, humidade, luminosidade });

        if (incoerentes.length > 0) {
            await Alerta.create({
                loteId,
                gravidade: 'Crítico',
                descricao: `Falha de sensor / dados incoerentes: ${incoerentes.join('; ')}`
            });
            return res.status(201).json({ sucesso: true, mensagem: "Medição registada com dados incoerentes", dados: novaMedicao });
        }

        const plano = loteExiste.planoId;

        // Só planos Regulares têm limites definidos
        if (plano && plano.tipo === 'Regular') {
            const violacoes = [];

            if (temperatura < plano.tempMinima || temperatura > plano.tempMaxima) {
                violacoes.push({ variavel: 'temperatura', valor: temperatura, min: plano.tempMinima, max: plano.tempMaxima });
            }
            if (humidade < plano.humidadeMinima || humidade > plano.humidadeMaxima) {
                violacoes.push({ variavel: 'humidade', valor: humidade, min: plano.humidadeMinima, max: plano.humidadeMaxima });
            }
            if (luminosidade < plano.luminosidadeMinima || luminosidade > plano.luminosidadeMaxima) {
                violacoes.push({ variavel: 'luminosidade', valor: luminosidade, min: plano.luminosidadeMinima, max: plano.luminosidadeMaxima });
            }

            for (const v of violacoes) {
                const desc = `${v.variavel} fora do plano "${plano.nome}": ${v.valor} (esperado ${v.min}-${v.max})`;

                if (plano.modoAutomacao === 'Automático') {
                    // MODO AUTOMÁTICO: executa a ação criando uma tarefa
                    await Tarefa.create({
                        tipo: mapearTarefa(v.variavel),
                        loteId,
                        responsavel: 'Sistema (Automático)',
                        prazoLimite: new Date(Date.now() + 60 * 60 * 1000),
                        estado: 'Pendente'
                    });
                    await Alerta.create({
                        loteId,
                        gravidade: 'Aviso',
                        descricao: `[AUTOMÁTICO] ${desc} — tarefa de ${mapearTarefa(v.variavel)} criada automaticamente.`
                    });
                } else {
                    // MODO MANUAL: apenas sugere
                    await Alerta.create({
                        loteId,
                        gravidade: 'Aviso',
                        descricao: `[SUGESTÃO] ${desc} — recomenda-se ${mapearTarefa(v.variavel)}.`
                    });
                }
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