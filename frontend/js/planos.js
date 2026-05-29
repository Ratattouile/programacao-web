document.addEventListener('DOMContentLoaded', async () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');
    if (!utilizadorAcesso) { window.location.href = '/frontend/views/login.html'; return; }

    const utilizador = JSON.parse(utilizadorAcesso);
    document.getElementById('userDisplay').textContent = utilizador.nome;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('utilizadorAcesso');
        sessionStorage.removeItem('token');
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

    dadosPlantas.dados.forEach(planta => {
        const option = document.createElement('option');
        option.value = planta.nome;
        option.textContent = `${planta.nome} (${planta.especie})`;
        selectErva.appendChild(option);
    });


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

        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        tr.innerHTML = `
            <td>${plano.nome}</td>
            <td>${plano.ervaAromatica}</td>
            <td><span class="badge ${corBadge}">${plano.tipo}</span></td>
            <td>${plano.automacao}</td>
            <td>${plano.tarefa || '-'}</td>
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

    btnNovoPlano.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    });

    document.getElementById('btnFecharModalPlano').addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovoPlano').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('planoNome').value;
        const ervaAromatica = document.getElementById('planoErva').value;
        const tipo = document.getElementById('planoTipo').value;
        const automacao = document.getElementById('planoAutomacao').value;
        const tarefa = document.getElementById('planoTarefa').value;

        const resposta = await fetch('http://localhost:5000/api/planos', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, ervaAromatica, tipo, automacao, tarefa })
        });

        const dados = await resposta.json();
        if (dados.sucesso) {
            modal.style.display = 'none';
            location.reload();
        } else {
            alert(dados.erro);
        }
    });

});

async function autorizarPlano(id) {
    const token = sessionStorage.getItem('token');
    await fetch(`http://localhost:5000/api/planos/${id}/autorizar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    location.reload();
}
