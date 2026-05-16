const Tarefa = require('../models/Tarefa');

exports.listarTarefas = async (req, res) => {
    try {
        const tarefas = await Tarefa.find().populate('loteId', 'ervaAromatica');
        return res.status(200).json({ sucesso: true, dados: tarefas });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.criarTarefas = async (req, res) => {
    const { tipo, loteId, responsavel, prazoLimite } = req.body;

    if (!tipo || !loteId || !responsavel || !prazoLimite) {
        return res.status(400).json({ sucesso: false, erro: "Faltam campos obrigatorios" });
    }

    try {
        const novaTarefa = await Tarefa.create({ tipo, loteId, responsavel, prazoLimite });
        return res.status(201).json({ sucesso: true, mensagem: "Tarefa criada com sucesso", dados: novaTarefa });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.executarTarefa = async (req, res) => {
    try {
        const tarefa = await Tarefa.findByIdAndUpdate(
            req.params.id,
            { estado: "Concluída", dataExecucao: new Date() },
            { new: true }
        );
        if (!tarefa) return res.status(404).json({ sucesso: false, erro: "Tarefa não encontrada" });
        return res.status(200).json({ sucesso: true, mensagem: "Tarefa executada com sucesso", dados: tarefa });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
