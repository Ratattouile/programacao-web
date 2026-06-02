import { guardarOperacaoPendente, sincronizarPendentes, guardarPlanosCache, obterPlanosCache, guardarPlantasCache, obterPlantasCache, adicionarPlanoCache, atualizarItemCache } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');
    if (!utilizadorAcesso) { window.location.href = '/frontend/views/login.html'; return; }

    const utilizador = JSON.parse(utilizadorAcesso);
    document.getElementById('userDisplay').textContent = utilizador.nome;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/frontend/views/login.html';
    });

    const token = sessionStorage.getItem('token');

    let dados = { dados: [] };
    let dadosPlantas = { dados: [] };

    try {
        const resposta = await fetch('http://localhost:5000/api/planos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        dados = await resposta.json();
        if (dados.sucesso) await guardarPlanosCache(dados.dados);
    } catch (err) {
        console.warn('Offline - a ler planos do cache');
        dados = { dados: await obterPlanosCache() };
        const ud = document.getElementById('userDisplay');
        if (ud && !ud.innerHTML.includes('Offline')) {
            ud.innerHTML += ' <span style="color:#c9a84c">(Offline)</span>';
        }
    }

    try {
        const respostaPlantas = await fetch('http://localhost:5000/api/plantas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        dadosPlantas = await respostaPlantas.json();
        if (dadosPlantas.sucesso) await guardarPlantasCache(dadosPlantas.dados);
    } catch (err) {
        dadosPlantas = { dados: await obterPlantasCache() };
    }

    const selectErva = document.getElementById('planoErva');
    selectErva.innerHTML = '<option value="" disabled selected>Seleciona uma erva...</option>';
    if (dadosPlantas.dados) {
        dadosPlantas.dados.forEach(planta => {
            const option = document.createElement('option');
            option.value = planta.nome;
            option.textContent = `${planta.nome} (${planta.especie})`;
            selectErva.appendChild(option);
        });
    }

    const regulares = dados.dados.filter(p => p.tipo === 'Regular').length;
    const pontuais = dados.dados.filter(p => p.tipo === 'Pontual').length;
    const emergencias = dados.dados.filter(p => p.tipo === 'Emergencia').length;

    animarContador(document.getElementById('contPlanosRegulares'), regulares);
    animarContador(document.getElementById('contPlanosPontuais'), pontuais);
    animarContador(document.getElementById('contPlanosEmergencias'), emergencias);

    const tbody = document.getElementById('tabelaPlanos');
    tbody.innerHTML = '';
    dados.dados.forEach((plano, index) => {
        let corBadge = 'active';
        if (plano.tipo === 'Pontual') corBadge = 'concluded';
        if (plano.tipo === 'Emergencia') corBadge = 'warning';

        let detalhesTexto = '-';
        if (plano.tipo === 'Regular') detalhesTexto = `Ciclo: ${plano.duracaoCicloPrevista || '?'} dias`;
        else if (plano.tipo === 'Emergencia') detalhesTexto = plano.tipoIntervencao || '-';
        else if (plano.tipo === 'Pontual') detalhesTexto = plano.tarefaPontual || '-';

        let corEstado = plano.estadoAutorizacao === 'Aprovado' ? 'color: #a8e6a8;' : 'color: #ffcc00;';

        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        if (plano._pendente) tr.style.opacity = '0.55';
        const acoes = plano._pendente
            ? '<span style="color:rgba(255,255,255,0.3);font-size:12px">A sincronizar</span>'
            : `<div class="actions-group">${plano.estadoAutorizacao === 'Pendente' ? `<button class="btn-action blue" onclick="autorizarPlano('${plano._id}')">Autorizar</button>` : ''}</div>`;
        tr.innerHTML = `
            <td>${plano.nome}</td>
            <td>${plano.ervaAromatica}</td>
            <td><span class="badge ${corBadge}">${plano.tipo}</span></td>
            <td>${plano.modoAutomacao || plano.automacao || 'Manual'}</td>
            <td>${detalhesTexto}</td>
            <td style="${corEstado} font-weight: 500;">${plano.estadoAutorizacao}</td>
            <td>${acoes}</td>
        `;
        tbody.appendChild(tr);
    });

    const btnNovoPlano = document.getElementById('btnNovoPlano');
    const modal = document.getElementById('modalNovoPlano');
    const selectTipo = document.getElementById('planoTipo');
    const divRegular = document.getElementById('camposRegular');
    const divEmergencia = document.getElementById('camposEmergencia');
    const divPontual = document.getElementById('camposPontual');

    function atualizarCamposVisiveis() {
        if (divRegular) divRegular.style.display = 'none';
        if (divEmergencia) divEmergencia.style.display = 'none';
        if (divPontual) divPontual.style.display = 'none';
        const tipo = selectTipo.value;
        if (tipo === 'Regular' && divRegular) divRegular.style.display = 'block';
        if (tipo === 'Emergencia' && divEmergencia) divEmergencia.style.display = 'block';
        if (tipo === 'Pontual' && divPontual) divPontual.style.display = 'block';
    }

    if (selectTipo) selectTipo.addEventListener('change', atualizarCamposVisiveis);

    btnNovoPlano.addEventListener('click', (e) => {
        e.preventDefault();
        atualizarCamposVisiveis();
        modal.style.display = 'flex';
    });

    document.getElementById('btnFecharModalPlano').addEventListener('click', () => modal.style.display = 'none');
    const btnFechar2 = document.getElementById('btnFecharModalPlano2');
    if (btnFechar2) btnFechar2.addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovoPlano').addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            nome: document.getElementById('planoNome').value,
            ervaAromatica: document.getElementById('planoErva').value,
            tipo: document.getElementById('planoTipo').value,
            modoAutomacao: document.getElementById('planoAutomacao').value,
            tarefa: document.getElementById('planoTarefa') ? document.getElementById('planoTarefa').value : ''
        };

        if (payload.tipo === 'Regular') {
            payload.tempMinima = document.getElementById('tempMin').value;
            payload.tempMaxima = document.getElementById('tempMax').value;
            payload.humidadeMinima = document.getElementById('humMin').value;
            payload.humidadeMaxima = document.getElementById('humMax').value;
            payload.luminosidadeMinima = document.getElementById('luzMin').value;
            payload.luminosidadeMaxima = document.getElementById('luzMax').value;
            payload.planoRega = document.getElementById('planoRega').value;
            payload.planoFertilizacao = document.getElementById('planoFertilizacao').value;
            payload.duracaoCicloPrevista = document.getElementById('duracaoCiclo').value;
        }
        if (payload.tipo === 'Emergencia') {
            payload.intervaloIntervencao = document.getElementById('intervaloIntervencao').value;
            payload.tipoIntervencao = document.getElementById('tipoIntervencao').value;
            payload.dosagem = document.getElementById('dosagem').value;
        }
        if (payload.tipo === 'Pontual') {
            payload.tarefaPontual = document.getElementById('tarefaPontual').value;
        }

        try {
            const respostaForm = await fetch('http://localhost:5000/api/planos', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const dadosForm = await respostaForm.json();
            if (dadosForm.sucesso) {
                modal.style.display = 'none';
                location.reload();
            } else {
                alert('Erro ao criar: ' + dadosForm.erro);
            }
        } catch (err) {
            const planoTemp = { _id: 'temp_' + Date.now(), ...payload, estadoAutorizacao: 'Pendente', _pendente: true };
            await guardarOperacaoPendente('http://localhost:5000/api/planos', 'POST', payload);
            await adicionarPlanoCache(planoTemp);
            modal.style.display = 'none';
            location.reload();
        }
    });
});

async function autorizarPlano(id) {
    const token = sessionStorage.getItem('token');
    try {
        const resposta = await fetch(`http://localhost:5000/api/planos/${id}/autorizar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (dados.sucesso) {
            location.reload();
        } else {
            alert('O Backend recusou: ' + dados.erro);
        }
    } catch (err) {
        await guardarOperacaoPendente(`http://localhost:5000/api/planos/${id}/autorizar`, 'PATCH', null);
        await atualizarItemCache('planos', id, { estadoAutorizacao: 'Aprovado', _pendente: true });
        location.reload();
    }
}

window.autorizarPlano = autorizarPlano;