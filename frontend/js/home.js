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

    
    const setBtn = document.getElementById('set-btn');
    setBtn.style.display = (utilizador.cargo === 'Administrador') ? '' : 'none';
    
    if (!document.getElementById('btnImportarCSV')) return;

    const ficheiroCSV = document.getElementById('ficheiroCSV');
    if (ficheiroCSV) {
        ficheiroCSV.addEventListener('change', () => {
            const dropZone = document.getElementById('fileDropZone');
            const fileLabel = document.getElementById('fileLabel');
            if (ficheiroCSV.files.length > 0) {
                fileLabel.textContent = ficheiroCSV.files[0].name;
                dropZone.classList.add('has-file');
            } else {
                fileLabel.textContent = 'Selecionar ficheiro .csv';
                dropZone.classList.remove('has-file');
            }
        });
    }

    const btnImportar = document.getElementById('btnImportarCSV');
    if (btnImportar) {
        btnImportar.addEventListener('click', async () => {
            const inputFicheiro = document.getElementById('ficheiroCSV');
            
            if (inputFicheiro.files.length === 0) {
                return alert('Por favor, escolha um ficheiro CSV primeiro!');
            }

            const formData = new FormData();
            formData.append('ficheiro', inputFicheiro.files[0]);

            try {
                const resposta = await fetch('http://localhost:5000/api/plantas/importar', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const dados = await resposta.json();

                if (dados.sucesso) {
                    alert('Sucesso! ' + dados.mensagem);
                    inputFicheiro.value = '';
                    document.getElementById('fileLabel').textContent = 'Selecionar ficheiro .csv';
                    document.getElementById('fileDropZone').classList.remove('has-file');
                } else {
                    alert('Erro na importação: ' + dados.erro);
                }
            } catch (err) {
                alert('Erro de ligação ao servidor.');
            }
        });
    }

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