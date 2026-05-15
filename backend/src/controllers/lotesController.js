



exports.listarLotes = (req,res) => {
        const lotes = [{
            id:"L-001",
            ervaAromatica:"Manjericao",
            planoId:"PLN-001",
            estado:"Ativo",
            quantidadeInicial:0,
            quantidadeAtual:0,
            dataInicio:"2019-08-24",
            dataFim:"2019-08-24"
        }]

        return res.status(200).json({
            sucesso:true,
            dados:lotes
        })
}

exports.criarLotes = (req,res) => {
    const {ervaAromatica, planoId, quantidadeInicial} = req.body

    if(!ervaAromatica || !planoId || quantidadeInicial === undefined){
        return res.status(400).json({
            sucesso:false,
            erro:"Faltam campos obrigatorios"
        })
    }

    const novoLote = {
        id:"L" + Math.floor(Math.random() * 10000),
        ervaAromatica,
        planoId,
        quantidadeInicial,
        quantidadeAtual:quantidadeInicial,
        estado:"Ativo",
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim:null
    }

    return res.status(200).json({
        sucesso:true,
        mensagem:"Lote criado com sucesso",
        dados:novoLote
    })

}

exports.dividirLote = (req,res) => {
    const idLoteOriginal = req.params.id

    const {quantidadeSeparar} = req.body

    if (!quantidadeSeparar || quantidadeSeparar <= 0) {
        return res.status(400).json({
            sucesso: false,
            erro: "A 'quantidadeSeparar' é obrigatória e deve ser maior que zero."
        });
    }

    const novoLoteId = "L-" + Math.floor(Math.random() * 10000);

    return res.status(200).json({
        sucesso: true,
        mensagem: `Lote ${idLoteOriginal} dividido com sucesso. Lote filho ${novoLoteId} gerado!`,
        dados: {
            loteOriginal: idLoteOriginal,
            quantidadeRetirada: quantidadeSeparar,
            loteFilhoGerado: {
                id: novoLoteId,
                quantidadeInicial: quantidadeSeparar,
                quantidadeAtual: quantidadeSeparar,
                estado: "Ativo"
            }
        }
    });
};


exports.perdasLote = (req,res) => {
    const idLoteDividir = req.params.id

    const {quantidadePerdida, motivo} = req.body

     if (!quantidadePerdida || quantidadePerdida <= 0 || !motivo ) {
        return res.status(400).json({
            sucesso: false,
            erro: "A quantidade Perdida e o motivo sao obrigatorios"
        });
    }

      const novoLoteId = "L-" + Math.floor(Math.random() * 10000);

   return res.status(200).json({
        sucesso: true,
        mensagem: `Perda de ${quantidadePerdida} plantas registada no Lote ${novoLoteId}.`,
        dados: {
            loteId: novoLoteId,
            quantidadePerdida: quantidadePerdida,
            motivo: motivo,
            estadoAtualizado: "Comprometido" // Simulamos que o lote ficou afetado
        }
    });
};

