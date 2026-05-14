require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express()

//middleware
app.use(cors())
app.use(express.json())

const routes = require('./routes/planosRoutes.js');



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});