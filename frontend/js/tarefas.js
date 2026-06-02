import { guardarOperacaoPendente, sincronizarPendentes } from './db.js';

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
    await carregarTarefas(token);

    const modal = document.getElementById('modalNovaTarefa');
    document.getElementById('btnNovaTarefa').addEventListener('click', async () => {
        try {
            const res = await fetch('http://localhost:5000/api/lotes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { dados: lotes } = await res.json();
            const selectLote = document.getElementById('tarefaLote');
            selectLote.innerHTML = '<option value="" disabled selected>Seleciona um lote...</option>';
            lotes.filter(l => l.estado === 'Ativo').forEach(l => {
                const opt = document.createElement('option');
                opt.value = l._id;
                opt.textContent = `${l.ervaAromatica} (${l._id.slice(-6)})`;
                selectLote.appendChild(opt);
            });
            modal.style.display = 'flex';
        } catch (err) {
            alert('Erro ao carregar lotes.');
        }
    });

    document.getElementById('btnFecharModalTarefa').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('btnCancelarTarefa').addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovaTarefa').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            tipo: document.getElementById('tarefaTipo').value,
            loteId: document.getElementById('tarefaLote').value,
            responsavel: document.getElementById('tarefaResponsavel').value,
            prazoLimite: document.getElementById('tarefaPrazo').value
        };

        const prazo = new Date(document.getElementById('tarefaPrazo').value);
        if (prazo <= new Date()) {
            return alert('O prazo limite deve ser no futuro.');
        }

        try {
            const res = await fetch('http://localhost:5000/api/tarefas', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const dados = await res.json();
            if (dados.sucesso) {
                modal.style.display = 'none';
                await carregarTarefas(token);
            } else {
                alert(dados.erro);
            }
        } catch (err) {
            await guardarOperacaoPendente('http://localhost:5000/api/tarefas', 'POST', body);
            alert('Sem ligação. A operação será enviada automaticamente quando estiveres online.');
            modal.style.display = 'none';
        }
    });
});

async function carregarTarefas(token) {
    try {
        const resposta = await fetch('http://localhost:5000/api/tarefas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { dados: tarefas } = await resposta.json();

        const pendentes = tarefas.filter(t => t.estado === 'Pendente');
        const executadas = tarefas.filter(t => t.estado === 'Concluída');

        document.getElementById('contPendentes').textContent = `${pendentes.length} tarefas`;
        document.getElementById('contExecutadas').textContent = `${executadas.length} tarefas`;

        const agora = new Date();
        const tbodyPendentes = document.getElementById('tabelaTarefasPendentes');
        tbodyPendentes.innerHTML = '';
        pendentes.forEach((t, index) => {
            const prazo = new Date(t.prazoLimite);
            const atrasada = prazo < agora;
            const prazoStr = atrasada
                ? `<span class="late">${prazo.toLocaleString('pt-PT')} — Atrasada</span>`
                : prazo.toLocaleString('pt-PT');
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${250 + index * 100}ms`;
            tr.innerHTML = `
                <td>${t.tipo}</td>
                <td class="lot-id">${t.loteId?.ervaAromatica || t.loteId}</td>
                <td>${prazoStr}</td>
                <td>${t.responsavel}</td>
                <td><button class="btn-action green" onclick="executarTarefa('${t._id}')">Executar</button></td>
            `;
            tbodyPendentes.appendChild(tr);
        });

        const tbodyExecutadas = document.getElementById('tabelaTarefasExecutadas');
        tbodyExecutadas.innerHTML = '';
        executadas.forEach((t, index) => {
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${250 + index * 100}ms`;
            tr.innerHTML = `
                <td>${t.tipo}</td>
                <td class="lot-id">${t.loteId?.ervaAromatica || t.loteId}</td>
                <td>${new Date(t.dataExecucao).toLocaleString('pt-PT')}</td>
                <td>${t.responsavel}</td>
                <td><span class="badge concluded">Concluída</span></td>
            `;
            tbodyExecutadas.appendChild(tr);
        });
    } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
    }
}

async function executarTarefa(id) {
    if (!confirm('Tens a certeza que queres marcar esta tarefa como executada?')) return;
    const token = sessionStorage.getItem('token');
    try {
        await fetch(`http://localhost:5000/api/tarefas/${id}/executar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        await carregarTarefas(token);
    } catch (err) {
        await guardarOperacaoPendente(`http://localhost:5000/api/tarefas/${id}/executar`, 'PATCH', null);
        alert('Sem ligação. A operação será enviada automaticamente quando estiveres online.');
    }
}