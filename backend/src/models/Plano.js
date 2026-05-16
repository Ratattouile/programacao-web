const mongoose = require('mongoose');

const planoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    ervaAromatica: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Regular', 'Pontual'] },
    automacao: { type: String, required: true },
    regrasAutomacao: { type: String, default: '' },
    estadoAutorizacao: { type: String, default: 'Aprovado', enum: ['Aprovado', 'Pendente'] },
    dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plano', planoSchema);
