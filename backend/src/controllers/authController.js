




exports.register = (req,res) => {
    const {nome,email,password,cargo} = req.body


    if(!nome || !email || !password || ! cargo){
        return res.status(400).json({
            sucesso: false,
            erro: "Faltam campos: nome, email, password e cargo (ex: Administrador, Tecnico)."
        });
    }

    const novoUtilizador = {
        id:"USR-" + Math.floor(Math.random() * 10000),
        nome,
        email,
        cargo,
        dataRegisto:new Date().toISOString()
    }

    return res.status(201).json({
        sucesso: true,
        mensagem: "Conta criada com sucesso!",
        dados: novoUtilizador
    });

}

exports.login = (req,res) => {
    const {email,password} = req.body

    if(!email || !password){
        return res.status(400).json({
            sucesso: false,
            erro: "Email e password são obrigatórios."
        });
    }

    if(email === "admin@estufa.com" || password === "123"){
        return res.status(200).json({
            sucesso: true,
            mensagem: "Login efetuado com sucesso!",
            dados: {
                id: "USR-001",
                nome: "Administrador Principal",
                cargo: "Administrador",
                token: "token_falso_para_ja_123456789" 
            }
        });
    }else{
        return res.status(401).json({
            sucesso: false,
            erro: "Credenciais inválidas. Tenta admin@estufa.pt e 123456."
        });
    }
}