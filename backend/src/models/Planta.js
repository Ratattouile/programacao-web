const mongoose = require('mongoose');



const plantaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    especie: { type: String },
    tempMinima: { type: Number },
    tempMaxima: { type: Number },
    humidadeMinima: { type: Number },
    humidadeMaxima: { type: Number },
    cicloDeVida: { type: Number }, 
    intervaloRega: { type: Number } 
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Planta', plantaSchema)