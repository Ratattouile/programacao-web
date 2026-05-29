const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    utilizador: { type: String, required: true }, 
    cargo: { type: String, required: true },      
    acao: { type: String, required: true },       
    detalhes: { type: String },                   
    dataRegisto: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);