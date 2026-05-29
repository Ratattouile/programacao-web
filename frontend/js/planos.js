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

  
    const resposta = await fetch('http://localhost:5000/api/planos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dados = await resposta.json();

    const respostaPlantas = await fetch('http://localhost:5000/api/plantas', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dadosPlantas = await respostaPlantas.json();

    const selectErva = document.getElementById('planoErva');
    selectErva.innerHTML = '<option value="" disabled selected>Seleciona uma erva...</option>';

    if (dadosPlantas.sucesso && dadosPlantas.dados) {
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
    
    document.getElementById('contPlanosRegulares').textContent = regulares;
    document.getElementById('contPlanosPontuais').textContent = pontuais;
    document.getElementById('contPlanosEmergencias').textContent = emergencias;
    animarContador(document.getElementById('contPlanosRegulares'), regulares);
    animarContador(document.getElementById('contPlanosPontuais'), pontuais);
    animarContador(document.getElementById('contPlanosEmergencias'), emergencias);

    const tbody = document.getElementById('tabelaPlanos');
    tbody.innerHTML = '';

    dados.dados.forEach(plano => {
       let corBadge = 'active';
    dados.dados.forEach((plano, index) => {
        let corBadge = 'active';
        if (plano.tipo === 'Pontual') corBadge = 'concluded';
        if (plano.tipo === 'Emergencia') corBadge = 'warning';

        let detalhesTexto = '-';
        if (plano.tipo === 'Regular') {
            detalhesTexto = `Ciclo: ${plano.duracaoCicloPrevista || '?'} dias`;
        } else if (plano.tipo === 'Emergencia') {
            detalhesTexto = plano.tipoIntervencao || '-';
        } else if (plano.tipo === 'Pontual') {
            detalhesTexto = plano.tarefaPontual || '-';
        }

        let corEstado = plano.estadoAutorizacao === 'Aprovado' ? 'color: #a8e6a8;' : 'color: #ffcc00;';

        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        tr.innerHTML = `
            <td>${plano.nome}</td>
            <td>${plano.ervaAromatica}</td>
            <td><span class="badge ${corBadge}">${plano.tipo}</span></td>
            <td>${plano.modoAutomacao || plano.automacao || 'Manual'}</td>
            <td>${detalhesTexto}</td>
            <td style="${corEstado} font-weight: 500;">${plano.estadoAutorizacao}</td>
            <td>
                <div class="actions-group">
                    ${plano.estadoAutorizacao === 'Pendente' ? `<button class="btn-action blue" onclick="autorizarPlano('${plano._id}')">Autorizar</button>` : ''}
                </div>
            </td>
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

    if (selectTipo) {
        selectTipo.addEventListener('change', atualizarCamposVisiveis);
    }

    btnNovoPlano.addEventListener('click', (e) => {
        e.preventDefault();
        atualizarCamposVisiveis(); 
        modal.style.display = 'flex';
    });

    document.getElementById('btnFecharModalPlano').addEventListener('click', () => modal.style.display = 'none');
    
    const btnFechar2 = document.getElementById('btnFecharModalPlano2');
    if (btnFechar2) {
        btnFechar2.addEventListener('click', () => modal.style.display = 'none');
    }


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
                alert("Erro ao criar: " + dadosForm.erro);
            }
        } catch (err) {
            alert("Erro de comunicação com o servidor.");
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
            alert("O Backend recusou: " + dados.erro);
        }
    } catch (err) {
        alert("Erro de ligação. O backend está ligado?");
    }
}
