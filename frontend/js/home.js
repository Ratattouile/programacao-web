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
    const headers = { 'Authorization': `Bearer ${token}` };

    const [resLotes, resAlertas, resTarefas] = await Promise.all([
        fetch('http://localhost:5000/api/lotes', { headers }),
        fetch('http://localhost:5000/api/alertas', { headers }),
        fetch('http://localhost:5000/api/tarefas', { headers })
    ]);

    const { dados: lotes } = await resLotes.json();
    const { dados: alertas } = await resAlertas.json();
    const { dados: tarefas } = await resTarefas.json();

    // contadores
    const lotesAtivos = lotes.filter(l => l.estado === 'Ativo');
    document.getElementById('contLotesAtivos').textContent = lotesAtivos.length;
    document.getElementById('infoLotes').textContent = `${lotes.length} lotes no total`;

    const alertasPendentes = alertas.filter(a => a.estado === 'Pendente');
    document.getElementById('contAlertasPendentes').textContent = alertasPendentes.length;
    const criticos = alertasPendentes.filter(a => a.gravidade === 'Crítico').length;
    document.getElementById('infoAlertas').textContent = `${criticos} crítico(s)`;

    const hoje = new Date().toDateString();
    const tarefasHoje = tarefas.filter(t => new Date(t.prazoLimite).toDateString() === hoje);
    const tarefasPendentes = tarefasHoje.filter(t => t.estado === 'Pendente');
    document.getElementById('contTarefasHoje').textContent = tarefasHoje.length;
    document.getElementById('infoTarefas').textContent = `${tarefasPendentes.length} por completar`;

    // tabela lotes recentes
    const tbody = document.getElementById('tabelaLotes');
    tbody.innerHTML = '';
    lotes.slice(0, 5).forEach(lote => {
        let corBadge = 'active';
        if (lote.estado === 'Comprometido') corBadge = 'warning';
        if (lote.estado === 'Concluído') corBadge = 'concluded';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="lot-id">${lote._id}</td>
            <td>${lote.ervaAromatica}</td>
            <td><span class="badge ${corBadge}">${lote.estado}</span></td>
            <td>${lote.planoId?.nome || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
});
