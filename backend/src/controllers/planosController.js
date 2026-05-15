



exports.listarPlanos = (req,res) => {
    const planos = [
        { id: "PLN-001", nome: "Plano Inverno", ervaAromatica: "Manjericão", tipo: "Regular", estadoAutorizacao: "Aprovado" }

    ]

    return res.status(200).json({
        sucesso:true,
        dados:planos
    })
}

exports.criarPlanos = (req, res) => {
    const {nome, ervaAromatica, tipo, automacao, regrasAutomacao} = req.body

    if(!nome || !ervaAromatica || !tipo || !automacao){
        return res.status(400).json({
            sucesso:false,
            erro:"faltam campos obrigatorios",
        })
    }

    let estadoAutorizacao = tipo === "Pontual" ? "Pendente" : "Aprovado"

    const novoPlano = {
        id: "PLN-" + Math.floor(Math.random() * 10000),
        nome,
        ervaAromatica,
        tipo,
        automacao,
        regrasAutomacao: regrasAutomacao || "",
        estadoAutorizacao,
        dataCriacao: new Date().toISOString()
    }

    return res.status(201).json({
        sucesso:true,
        mensagem:"Plano criado com sucesso",
        dados:novoPlano
    })

}


exports.autorizarPlano = (req,res) =>{
    const idDoPlano = req.params.id;

    return res.status(200).json({
        sucesso:true,
        mensagem:`Plano ${idDoPlano} autorizado com sucesso`,
        dados:{
            id:idDoPlano,
            estadoAutorizacao:"Aprovado"
        }
    })
}