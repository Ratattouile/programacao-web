const express = require('express')

const router = express.Router()
const plantasController = require('../controllers/plantasController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');

const multer = require('multer');

const upload = multer({ dest: 'uploads/' });



router.get('/', authMiddleware, plantasController.listarPlantas);

router.get('/:id', authMiddleware, plantasController.obterPlanta);

router.post('/', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), plantasController.criarPlanta);

router.put('/:id', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), plantasController.atualizarPlanta);

router.delete('/:id', authMiddleware, verificarCargo('Administrador'), plantasController.eliminarPlanta);

// router.post('/', authMiddleware, plantasController.registarPlantas);
router.post('/importar', authMiddleware, upload.single('ficheiro'), plantasController.plantasImportar);

module.exports = router