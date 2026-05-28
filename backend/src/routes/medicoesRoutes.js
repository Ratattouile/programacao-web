const express = require('express');
const router = express.Router();
const medicoesController = require('../controllers/medicoesController');
const authMiddleware = require('../middleware/authMiddleware');



router.get('/', authMiddleware, medicoesController.listarMedicoes)

router.post('/', authMiddleware, medicoesController.registarMedicao)


module.exports = router