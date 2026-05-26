const Planta = require('../models/Plantas');

exports.listarPlantas = async (req, res) => {
    try{
        const plantas = await Planta.find();
        return res.status(200).json({ sucesso: true, dados: plantas });
    }catch(err){
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.obterPlanta = async (req, res) => {
    try {
        const planta = await Planta.findById(req.params.id);
        if (!planta) return res.status(404).json({ sucesso: false, erro: "Planta não encontrada" });
        return res.status(200).json({ sucesso: true, dados: planta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.criarPlanta = async (req, res) => {
    const { nome, especie, tempMinima, tempMaxima, humidadeMinima, humidadeMaxima, cicloDeVida, intervaloRega } = req.body;

    if (!nome || !especie || tempMinima == null || tempMaxima == null ||
        humidadeMinima == null || humidadeMaxima == null || cicloDeVida == null || intervaloRega == null) {
        return res.status(400).json({ sucesso: false, erro: "Faltam campos obrigatórios" });
    }

    if (tempMinima >= tempMaxima) {
        return res.status(400).json({ sucesso: false, erro: "tempMinima deve ser menor que tempMaxima" });
    }

    if (humidadeMinima >= humidadeMaxima) {
        return res.status(400).json({ sucesso: false, erro: "humidadeMinima deve ser menor que humidadeMaxima" });
    }

    try {
        const novaPlanta = await Planta.create({ nome, especie, tempMinima, tempMaxima, humidadeMinima, humidadeMaxima, cicloDeVida, intervaloRega });
        return res.status(201).json({ sucesso: true, mensagem: "Planta criada com sucesso", dados: novaPlanta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.atualizarPlanta = async (req, res) => {
    try {
        const planta = await Planta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!planta) return res.status(404).json({ sucesso: false, erro: "Planta não encontrada" });
        return res.status(200).json({ sucesso: true, mensagem: "Planta atualizada com sucesso", dados: planta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.eliminarPlanta = async (req, res) => {
    try {
        const planta = await Planta.findByIdAndDelete(req.params.id);
        if (!planta) return res.status(404).json({ sucesso: false, erro: "Planta não encontrada" });
        return res.status(200).json({ sucesso: true, mensagem: "Planta eliminada com sucesso" });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
