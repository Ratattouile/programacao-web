const mongoose = require('mongoose');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB ligado com sucesso');
    } catch (err) {
        console.error('Erro ao ligar ao MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
