const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarCargo = require('../middleware/verificarCargo');

//router.get('/utilizadores', authMiddleware, verificarCargo('Administrador'), controller.listar);

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

