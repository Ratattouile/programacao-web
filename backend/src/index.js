require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express()

//middleware
app.use(cors())
app.use(express.json())

const planosRoutes = require('./routes/planosRoutes.js');
const lotesRoutes = require('./routes/lotesRoutes.js')
const tarefasRoutes = require('./routes/tarefasRoutes.js')
const alertasRoutes = require('./routes/alertasRoutes.js')
const authRoutes = require('./routes/authRoutes.js')


app.use('/api/auth', authRoutes)
app.use('/api/planos', planosRoutes)
app.use('/api/lotes', lotesRoutes)
app.use('/api/tarefas', tarefasRoutes)
app.use('/api/alertas', alertasRoutes)








const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});