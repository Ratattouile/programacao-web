const Planta = require('../models/Planta')
const fs = require('fs')
const csv = require('csv-parser')
const { registarLog } = require('../utils/auditoria');



exports.listarPlantas = async(req,res) => {
    try{
        const todasPlantas = await Planta.find();
        return res.status(200).json({ sucesso: true, dados: todasPlantas});
    }catch (err){
       return res.status(500).json({ sucesso: false, erro: err.message });     
    }

}

exports.criarPlanta = async (req, res) => {
    const { nome, especie, tempMinima, tempMaxima, humidadeMinima, humidadeMaxima, cicloDeVida, intervaloRega } = req.body;

    if (!nome || !especie || tempMinima == null || tempMaxima == null ||
        humidadeMinima == null || humidadeMaxima == null || cicloDeVida == null || intervaloRega == null) {
        return res.status(400).json({ sucesso: false, erro: "Faltam campos obrigatórios" });
    }

    if (tempMinima > tempMaxima) {
        return res.status(400).json({ sucesso: false, erro: "tempMinima deve ser menor que tempMaxima" });
    }

    if (humidadeMinima > humidadeMaxima) {
        return res.status(400).json({ sucesso: false, erro: "humidadeMinima deve ser menor que humidadeMaxima" });
    }

    try {
        const novaPlanta = await Planta.create({ nome, especie, tempMinima, tempMaxima, humidadeMinima, humidadeMaxima, cicloDeVida, intervaloRega });
        await registarLog(req, 'Criou Planta', `Nome: ${nome} | Espécie: ${especie}`);
        return res.status(201).json({ sucesso: true, mensagem: "Planta criada com sucesso", dados: novaPlanta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.plantasImportar = async (req,res)=>{
  
    if (!req.file) {
        return res.status(400).json({ sucesso: false, erro: "Ficheiro não encontrado. Verifica a etiqueta 'ficheiro'." });
    }

    const resultados = [];

    fs.createReadStream(req.file.path).pipe(csv()).on('data', (linha) => {
        resultados.push(linha)
    })
    .on('end', async() => {
        try{
            await Planta.insertMany(resultados)
            fs.unlinkSync(req.file.path)
            return res.status(201).json({
                sucesso:true,
                mensagem:"Importaçao concluida"
            })

        }catch (err) {
                fs.unlinkSync(req.file.path);
                
                if (err.code === 11000) {
                    return res.status(409).json({ sucesso: false, erro: "Algumas plantas neste CSV já existem na Base de Dados!" });
                }

                return res.status(500).json({ sucesso: false, erro: "Erro ao gravar: " + err.message });
            }
    })
    .on('error', (err) => {
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ sucesso: false, erro: "Erro a processar o ficheiro CSV: " + err.message });
        });
}

exports.obterPlanta = async (req, res) => {
    try {
        const planta = await Planta.findById(req.params.id);
        if (!planta) return res.status(404).json({ sucesso: false, erro: "Planta não encontrada" });
        return res.status(200).json({ sucesso: true, dados: planta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.atualizarPlanta = async (req, res) => {
    try {
        const planta = await Planta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        await registarLog(req, 'Atualizou Planta', `Atualizou a planta: ${planta.nome}`);        
        if (!planta) return res.status(404).json({ sucesso: false, erro: "Planta não encontrada" });
        return res.status(200).json({ sucesso: true, mensagem: "Planta atualizada com sucesso", dados: planta });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};

exports.eliminarPlanta = async (req, res) => {
    try {
        const planta = await Planta.findByIdAndDelete(req.params.id);
        await registarLog(req, 'Eliminou Planta', `Apagou a planta: ${planta.nome}`);        
        if (!planta) return res.status(404).json({ sucesso: false, erro: "Planta não encontrada" });
        return res.status(200).json({ sucesso: true, mensagem: "Planta eliminada com sucesso" });
    } catch (err) {
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
};
