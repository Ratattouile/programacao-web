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
    const resposta = await fetch('http://localhost:5000/api/tarefas', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const { dados: tarefas } = await resposta.json();

    const pendentes = tarefas.filter(t => t.estado === 'Pendente');
    const executadas = tarefas.filter(t => t.estado === 'Concluída');

    const tbodyPendentes = document.getElementById('tabelaTarefasPendentes');
    tbodyPendentes.innerHTML = '';
    pendentes.forEach(t => {
        const prazo = new Date(t.prazoLimite).toLocaleString('pt-PT');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.tipo}</td>
            <td class="lot-id">${t.loteId?.ervaAromatica || t.loteId}</td>
            <td>${prazo}</td>
            <td>${t.responsavel}</td>
            <td><button class="btn-action green" onclick="executarTarefa('${t._id}')">Executar</button></td>
        `;
        tbodyPendentes.appendChild(tr);
    });

    const tbodyExecutadas = document.getElementById('tabelaTarefasExecutadas');
    tbodyExecutadas.innerHTML = '';
    executadas.forEach(t => {
        const dataExecucao = new Date(t.dataExecucao).toLocaleString('pt-PT');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.tipo}</td>
            <td class="lot-id">${t.loteId?.ervaAromatica || t.loteId}</td>
            <td>${dataExecucao}</td>
            <td>${t.responsavel}</td>
            <td><span class="badge concluded">Concluída</span></td>
        `;
        tbodyExecutadas.appendChild(tr);
    });
});

async function executarTarefa(id) {
    const token = sessionStorage.getItem('token');
    await fetch(`http://localhost:5000/api/tarefas/${id}/executar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    location.reload();
}
