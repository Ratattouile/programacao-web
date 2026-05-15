






exports.listarTarefas = (req,res) => {
    const tarefas = [
        { id: "TAR-001", tipo: "Rega", loteId: "L-001", estado: "Pendente", responsavel: "ola", prazoLimite: "2019-08-24T14:15:22Z", dataExecucao:"2019-08-24T14:15:22Z"}

    ]

    return res.status(200).json({
        sucesso:true,
        dados:tarefas
    })
}


exports.criarTarefas = (req, res) => {
    const {tipo, loteId, responsavel, prazoLimite} = req.body

    if(!tipo || !loteId || !responsavel || !prazoLimite){
        return res.status(400).json({
            sucesso:false,
            erro:"faltam campos obrigatorios",
        })
    }

    const novaTarefa = {
        id: "TAR-" + Math.floor(Math.random() * 10000), 
        tipo,
        loteId,
        estado: "Pendente", 
        responsavel,
        prazoLimite,
        dataExecucao: null 
    };



    return res.status(201).json({
        sucesso:true,
        mensagem:"tarefa criado com sucesso",
        dados:novaTarefa
    })

}


exports.executarTarefa = (req,res) =>{
    const idDaTarefa = req.params.id;

    return res.status(200).json({
        sucesso:true,
        mensagem:`Plano ${idDaTarefa} autorizado com sucesso`,
        dados:{
            id:idDaTarefa,
        }
    })
}


