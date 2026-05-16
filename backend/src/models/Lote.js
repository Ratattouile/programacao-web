const mongoose = require('mongoose');

const loteSchema = new mongoose.Schema({
    ervaAromatica: { type: String, required: true },
    planoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plano', required: true },
    estado: { type: String, default: 'Ativo', enum: ['Ativo', 'Comprometido', 'Concluído'] },
    quantidadeInicial: { type: Number, required: true },
    quantidadeAtual: { type: Number, required: true },
    dataInicio: { type: Date, default: Date.now },
    dataFim: { type: Date, default: null }
});

module.exports = mongoose.model('Lote', loteSchema);
