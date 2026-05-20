
const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, alertasController.listarAlertas)

router.patch('/:id/resolver', authMiddleware, alertasController.resolverAlerta)

router.patch('/:id/ignorar', authMiddleware, alertasController.ignorarAlerta)



module.exports = router

