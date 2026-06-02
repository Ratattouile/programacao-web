require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();

//middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/frontend', express.static('frontend'));

const planosRoutes = require('./routes/planosRoutes.js');
const lotesRoutes = require('./routes/lotesRoutes.js')
const tarefasRoutes = require('./routes/tarefasRoutes.js')
const alertasRoutes = require('./routes/alertasRoutes.js')
const authRoutes = require('./routes/authRoutes.js')
const plantasRoutes = require('./routes/plantasRoutes.js')
const medicoesRoutes = require('./routes/medicoesRoutes.js')



app.use('/api/auth', authRoutes)
app.use('/api/planos', planosRoutes)
app.use('/api/lotes', lotesRoutes)
app.use('/api/tarefas', tarefasRoutes)
app.use('/api/alertas', alertasRoutes)
app.use('/api/plantas', plantasRoutes)
app.use('/api/medicoes', medicoesRoutes)



connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});