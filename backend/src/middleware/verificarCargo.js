module.exports = (...cargosPermitidos) => {
    return(req, res, next) => {
        const cargo = req.user.cargo;
        if(!cargosPermitidos.includes(cargo)){
            return res.status(403).json({sucesso: false, erro: "Não tens permissão para esta ação!"});
        }
        next();
    };
};