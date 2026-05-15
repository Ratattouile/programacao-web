


exports.listarAlertas = (req,res) => {
    const alertas = [
        { id: "PLN-001", loteId: "L-001", gravidade: "Informativo", descricao: "tudo a arder", justificacao: "safe", dataCriacao:"2019-08-24T14:15:22Z" }

    ]

    return res.status(200).json({
        sucesso:true,
        dados:alertas
    })
}


exports.resolverAlerta = (req,res) =>{
    const idDoAlerta = req.params.id;

    return res.status(200).json({
        sucesso:true,
        mensagem:`Alerta ${idDoAlerta} autorizado com sucesso`,
        dados:{
            id:idDoAlerta,
        }
    })
}

exports.ignorarAlerta = (req,res) =>{
    const idDoAlerta = req.params.id;

    return res.status(200).json({
        sucesso:true,
        mensagem:`Alerta ${idDoAlerta} autorizado com sucesso`,
        dados:{
            id:idDoAlerta,
            justificacao: "Sensor avariado, leitura falsa."
        }
    })
 }
