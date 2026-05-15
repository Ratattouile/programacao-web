
const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');


router.get('/', alertasController.listarAlertas)

router.patch('/:id/resolver', alertasController.resolverAlerta)

router.patch('/:id/ignorar', alertasController.ignorarAlerta)



module.exports = router

