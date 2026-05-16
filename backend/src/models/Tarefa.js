const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    loteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote', required: true },
    estado: { type: String, default: 'Pendente', enum: ['Pendente', 'Concluída'] },
    responsavel: { type: String, required: true },
    prazoLimite: { type: Date, required: true },
    dataExecucao: { type: Date, default: null }
});

module.exports = mongoose.model('Tarefa', tarefaSchema);
