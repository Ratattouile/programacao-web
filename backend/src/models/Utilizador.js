const mongoose = require('mongoose');

const utilizadorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cargo: { type: String, required: true, enum: ['Administrador', 'Técnico', 'Responsavel Tecnico'] },
    dataRegisto: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Utilizador', utilizadorSchema);
