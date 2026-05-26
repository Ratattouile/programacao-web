const express = require('express')

const router = express.Router()
const plantasController = require('../controllers/plantasController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');

const upload = multer({ dest: 'uploads/' });



router.get('/', authMiddleware, plantasController.listarPlantas);
// router.post('/', authMiddleware, plantasController.registarPlantas);
router.post('/importar', authMiddleware, upload.single('ficheiro'), plantasController.plantasImportar);

module.exports = router