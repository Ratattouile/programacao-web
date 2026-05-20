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

    const regulares = dados.dados.filter(p => p.tipo === 'Regular').length;
    const pontuais = dados.dados.filter(p => p.tipo === 'Pontual').length;
    document.getElementById('contPlanosRegulares').textContent = regulares;
    document.getElementById('contPlanosPontuais').textContent = pontuais;

    const tbody = document.getElementById('tabelaPlanos');
    tbody.innerHTML = '';

    dados.dados.forEach(plano => {
        let corBadge = 'active';
        if (plano.tipo === 'Pontual') corBadge = 'concluded';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${plano.nome}</td>
            <td>${plano.ervaAromatica}</td>
            <td><span class="badge ${corBadge}">${plano.tipo}</span></td>
            <td>${plano.automacao}</td>
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

        const resposta = await fetch('http://localhost:5000/api/planos', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, ervaAromatica, tipo, automacao })
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
