const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/utilizadores', authMiddleware, verificarCargo('Administrador'), authController.listarUtilizadores);
router.post('/utilizadores', authMiddleware, verificarCargo('Administrador'), authController.register);
router.get('/utilizadores/logs', authMiddleware, verificarCargo('Administrador'), authController.historicoUtilizadores);
router.patch('/utilizadores/:id/cargo', authMiddleware, verificarCargo('Administrador'), authController.alterarCargo);
router.delete('/utilizadores/:id', authMiddleware, verificarCargo('Administrador'), authController.eliminarUtilizador);

module.exports = router;