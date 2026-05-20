
const express = require('express');
const router = express.Router();
const planosController = require('../controllers/planosController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, planosController.listarPlanos)

router.post('/', authMiddleware, planosController.criarPlanos)

router.patch('/:id/autorizar', authMiddleware, planosController.autorizarPlano)



module.exports = router

