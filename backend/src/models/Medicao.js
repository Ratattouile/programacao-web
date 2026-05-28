const mongoose = require('mongoose')

const medicaoSchema = new mongoose.Schema({
    loteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lote', 
        required: true 
    },
    temperatura: { 
        type: Number, 
        required: true 
    },
    humidade: { 
        type: Number, 
        required: true 
    },
    luminosidade: { 
        type: Number, 
        required: true 
    },
    dataRegisto: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports =  mongoose.model('Medição', medicaoSchema)
