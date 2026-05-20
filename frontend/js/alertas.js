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
    const resposta = await fetch('http://localhost:5000/api/alertas', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const { dados: alertas } = await resposta.json();

    const pendentes = alertas.filter(a => a.estado === 'Pendente');

    document.getElementById('contCriticos').textContent = pendentes.filter(a => a.gravidade === 'Crítico').length;
    document.getElementById('contAvisos').textContent = pendentes.filter(a => a.gravidade === 'Aviso').length;
    document.getElementById('contInformativos').textContent = pendentes.filter(a => a.gravidade === 'Informativo').length;

    const tbody = document.getElementById('tabelaAlertas');
    tbody.innerHTML = '';
    pendentes.forEach(a => {
        const data = new Date(a.dataCriacao).toLocaleString('pt-PT');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${data}</td>
            <td class="lot-id">${a.loteId?.ervaAromatica || a.loteId}</td>
            <td><span class="badge ${a.gravidade === 'Crítico' ? 'danger' : a.gravidade === 'Aviso' ? 'warning' : 'concluded'}">${a.gravidade}</span></td>
            <td>${a.descricao}</td>
            <td>
                <div class="actions-group">
                    <button class="btn-action green" onclick="resolverAlerta('${a._id}')">Resolver</button>
                    <input class="justif-input" type="text" id="justif-${a._id}" placeholder="Justificação...">
                    <button class="btn-action ghost" onclick="ignorarAlerta('${a._id}')">Ignorar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

async function resolverAlerta(id) {
    const token = sessionStorage.getItem('token');
    await fetch(`http://localhost:5000/api/alertas/${id}/resolver`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    location.reload();
}

async function ignorarAlerta(id) {
    const token = sessionStorage.getItem('token');
    const justificacao = document.getElementById(`justif-${id}`).value;
    await fetch(`http://localhost:5000/api/alertas/${id}/ignorar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificacao })
    });
    location.reload();
}
