import { guardarOperacaoPendente, sincronizarPendentes, guardarTarefasCache, obterTarefasCache, adicionarTarefaCache, atualizarTarefaCache } from './db.js';

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
        const tipo = document.getElementById('tarefaTipo').value;
        const loteId = document.getElementById('tarefaLote').value;
        const responsavel = document.getElementById('tarefaResponsavel').value;
        const prazoLimite = document.getElementById('tarefaPrazo').value;
        const body = { tipo, loteId, responsavel, prazoLimite };

        const prazo = new Date(prazoLimite);
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
            const tarefaTemp = { _id: 'temp_' + Date.now(), tipo, loteId, responsavel, prazoLimite, estado: 'Pendente', _pendente: true };
            await guardarOperacaoPendente('http://localhost:5000/api/tarefas', 'POST', body);
            await adicionarTarefaCache(tarefaTemp);
            modal.style.display = 'none';
            await carregarTarefas(token);
        }
    });
});

async function carregarTarefas(token) {
    let tarefas = [];
    try {
        const resposta = await fetch('http://localhost:5000/api/tarefas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (dados.sucesso) {
            tarefas = dados.dados;
            await guardarTarefasCache(tarefas);
        } else {
            throw new Error(dados.erro);
        }
    } catch (err) {
        console.warn('Offline - a ler tarefas do cache');
        tarefas = await obterTarefasCache();
        const ud = document.getElementById('userDisplay');
        if (ud && !ud.innerHTML.includes('Offline')) {
            ud.innerHTML += ' <span style="color:#c9a84c">(Offline)</span>';
        }
    }

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
        if (t._pendente) tr.style.opacity = '0.55';
        const acao = t._pendente
            ? '<span style="color:rgba(255,255,255,0.3);font-size:12px">A sincronizar</span>'
            : `<button class="btn-action green" onclick="executarTarefa('${t._id}')">Executar</button>`;
        tr.innerHTML = `
            <td>${t.tipo}</td>
            <td class="lot-id">${t.loteId?.ervaAromatica || t.loteId}</td>
            <td>${prazoStr}</td>
            <td>${t.responsavel}</td>
            <td>${acao}</td>
        `;
        tbodyPendentes.appendChild(tr);
    });

    const tbodyExecutadas = document.getElementById('tabelaTarefasExecutadas');
    tbodyExecutadas.innerHTML = '';
    executadas.forEach((t, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        if (t._pendente) tr.style.opacity = '0.55';
        const dataExec = t.dataExecucao ? new Date(t.dataExecucao).toLocaleString('pt-PT') : '-';
        tr.innerHTML = `
            <td>${t.tipo}</td>
            <td class="lot-id">${t.loteId?.ervaAromatica || t.loteId}</td>
            <td>${dataExec}</td>
            <td>${t.responsavel}</td>
            <td><span class="badge concluded">Concluída${t._pendente ? ' (a sincronizar)' : ''}</span></td>
        `;
        tbodyExecutadas.appendChild(tr);
    });
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
        await atualizarTarefaCache(id, { estado: 'Concluída', dataExecucao: new Date().toISOString(), _pendente: true });
        await carregarTarefas(token);
    }
}

window.executarTarefa = executarTarefa;