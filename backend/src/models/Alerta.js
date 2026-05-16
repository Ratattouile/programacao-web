const mongoose = require('mongoose');

const alertaSchema = new mongoose.Schema({
    loteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote', required: true },
    gravidade: { type: String, required: true, enum: ['Informativo', 'Aviso', 'Crítico'] },
    descricao: { type: String, required: true },
    justificacao: { type: String, default: '' },
    estado: { type: String, default: 'Pendente', enum: ['Pendente', 'Resolvido', 'Ignorado'] },
    dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alerta', alertaSchema);
