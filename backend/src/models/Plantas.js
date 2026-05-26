const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    especie: { type: String, required: true },
    tempMinima: { type: Number, required: true },
    tempMaxima: { type: Number, required: true },
    humidadeMinima: { type: Number, required: true },
    humidadeMaxima: { type: Number, required: true },
    cicloDeVida: { type: Number, required: true },
    intervaloRega: { type: Number, required: true }
},{
    timestamps: true
});

module.exports = mongoose.model('Planta', plantaSchema);