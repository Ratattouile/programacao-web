document.addEventListener('DOMContentLoaded', async () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');
    if (!utilizadorAcesso) { 
        window.location.href = '/frontend/views/login.html'; 
        return; 
    }

    const utilizador = JSON.parse(utilizadorAcesso);
    const token = sessionStorage.getItem('token'); 

    document.getElementById('userDisplay').textContent = utilizador.nome;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear(); 
        window.location.href = '/frontend/views/login.html';
    });

    if(!document.getElementById('homeDetect')) return;

    const setBtn = document.getElementById('set-btn');
    setBtn.style.display = (utilizador.cargo === 'Administrador') ? '' : 'none';

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        const [resLotes, resAlertas, resTarefas] = await Promise.all([
            fetch('http://localhost:5000/api/lotes', { headers }),
            fetch('http://localhost:5000/api/alertas', { headers }),
            fetch('http://localhost:5000/api/tarefas', { headers })
        ]);

        const { dados: lotes } = await resLotes.json();
        const { dados: alertas } = await resAlertas.json();
        const { dados: tarefas } = await resTarefas.json();

        // Contadores
        const lotesAtivos = lotes.filter(l => l.estado === 'Ativo');
        animarContador(document.getElementById('contLotesAtivos'), lotesAtivos.length);
        document.getElementById('infoLotes').textContent = `${lotes.length} lotes no total`;

        const alertasPendentes = alertas.filter(a => a.estado === 'Pendente');
        animarContador(document.getElementById('contAlertasPendentes'), alertasPendentes.length);
        const criticos = alertasPendentes.filter(a => a.gravidade === 'Crítico').length;
        document.getElementById('infoAlertas').textContent = `${criticos} crítico(s)`;

        const hoje = new Date().toDateString();
        const tarefasHoje = tarefas.filter(t => new Date(t.prazoLimite).toDateString() === hoje);
        const tarefasPendentes = tarefasHoje.filter(t => t.estado === 'Pendente');
        animarContador(document.getElementById('contTarefasHoje'), tarefasHoje.length);
        document.getElementById('infoTarefas').textContent = `${tarefasPendentes.length} por completar`;

        // Tabela lotes recentes
        const tbody = document.getElementById('tabelaLotes');
        tbody.innerHTML = '';
        lotes.slice(0, 5).forEach((lote, index) => {
            let corBadge = 'active';
            if (lote.estado === 'Comprometido') corBadge = 'warning';
            if (lote.estado === 'Concluído') corBadge = 'concluded';
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${250 + index * 100}ms`;
            tr.innerHTML = `
                <td class="lot-id">${lote._id}</td>
                <td>${lote.ervaAromatica}</td>
                <td><span class="badge ${corBadge}">${lote.estado}</span></td>
                <td>${lote.planoId?.nome || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Erro a carregar a dashboard:", err);
    }
});

function loadStart() {
    const b = document.getElementById('loadingBar');
    b.style.opacity = '1'; b.style.width = '70%';
}

function loadEnd() {
    const b = document.getElementById('loadingBar');
    b.style.width = '100%';
    setTimeout(() => { b.style.opacity = '0'; b.style.width = '0%'; }, 350);
}