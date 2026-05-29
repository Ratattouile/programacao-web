const Log = require('../models/LogsAuditoria');

exports.registarLog = async (req, acao, detalhes = '') => {
    try {
        const utilizadorId = req.user.id ? req.user.id : 'Sistema';
        const utilizadorCargo = req.user.cargo ? req.user.cargo : 'N/A';
        await Log.create({
            utilizador: utilizadorId,
            cargo: utilizadorCargo,
            acao: acao,
            detalhes: detalhes

        });

        const dataAgora = new Date().toLocaleString('pt-PT');
        
        console.log(`[${dataAgora}] ${utilizadorId} (${utilizadorCargo}): ${acao} | ${detalhes}`);
    } catch (err) {
        console.error("Erro ao gravar log de auditoria:", err);
    }
};