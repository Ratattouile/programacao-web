const mongoose = require('mongoose');

const planoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    ervaAromatica: { type: String, required: true },
    modoAutomacao: { type: String, required: true, enum: ['Manual', 'Automático'], default: 'Manual' },
    estadoAutorizacao: { type: String, default: 'Aprovado', enum: ['Aprovado', 'Pendente', 'Rejeitado'] }, 
    tipo: { type: String, required: true, enum: ['Regular', 'Pontual', 'Emergencia'] },
    tempMinima: { type: Number, required: function() { return this.tipo === 'Regular'; } },
    tempMaxima: { type: Number, required: function() { return this.tipo === 'Regular'; } },
    humidadeMinima: { type: Number, required: function() { return this.tipo === 'Regular'; } },
    humidadeMaxima: { type: Number, required: function() { return this.tipo === 'Regular'; } },
    luminosidadeMinima: { type: Number, required: function() { return this.tipo === 'Regular'; } },
    luminosidadeMaxima: { type: Number, required: function() { return this.tipo === 'Regular'; } },
    planoRega: { type: String, required: function() { return this.tipo === 'Regular'; } },
    planoFertilizacao: { type: String, required: function() { return this.tipo === 'Regular'; } }, 
    duracaoCicloPrevista: { type: Number, required: function() { return this.tipo === 'Regular'; } }, 
    intervaloIntervencao: { type: Number, required: function() { return this.tipo === 'Emergencia'; } }, 
    tipoIntervencao: { type: String, required: function() { return this.tipo === 'Emergencia'; } }, 
    dosagem: { type: String, required: function() { return this.tipo === 'Emergencia'; } }, 
    tarefaPontual: { type: String, required: function() { return this.tipo === 'Pontual'; } },
    regrasAutomacao: { type: String, default: '' },
    tarefa: { type: String, required: true, enum: ['Rega', 'Fertilização', 'Colheita', 'Monitorização'] },
    dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plano', planoSchema);
