const Planta = require('../models/Planta')
const fs = require('fs')
const csv = require('csv-parser')






exports.listarPlantas = async(req,res) => {
    try{
        const todasPlantas = await Planta.find();
        return res.status(200).json({ sucesso: true, dados: todasPlantas});
    }catch (err){
       return res.status(500).json({ sucesso: false, erro: err.message });     
    }

}



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
}