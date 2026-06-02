import { guardarOperacaoPendente, sincronizarPendentes, guardarAlertasCache, obterAlertasCache, atualizarAlertaCache } from './db.js';

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

    await carregarAlertas();
});

async function carregarAlertas() {
    const token = sessionStorage.getItem('token');
    let alertas = [];
    try {
        const resposta = await fetch('http://localhost:5000/api/alertas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (dados.sucesso) {
            alertas = dados.dados;
            await guardarAlertasCache(alertas);
        } else {
            throw new Error(dados.erro);
        }
    } catch (err) {
        console.warn('Offline — a ler alertas do cache');
        alertas = await obterAlertasCache();
    }

    const pendentes = alertas.filter(a => a.estado === 'Pendente');

    const alertDot = document.querySelector('.alert-dot');
    if (alertDot) alertDot.style.display = pendentes.length > 0 ? 'block' : 'none';

    if (!document.getElementById('tabelaAlertas')) return;

    animarContador(document.getElementById('contCriticos'), pendentes.filter(a => a.gravidade === 'Crítico').length);
    animarContador(document.getElementById('contAvisos'), pendentes.filter(a => a.gravidade === 'Aviso').length);
    animarContador(document.getElementById('contInformativos'), pendentes.filter(a => a.gravidade === 'Informativo').length);

    const tbody = document.getElementById('tabelaAlertas');
    tbody.innerHTML = '';
    pendentes.forEach((a, index) => {
        const data = new Date(a.dataCriacao).toLocaleString('pt-PT');
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
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
}

async function resolverAlerta(id) {
    const token = sessionStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/alertas/${id}/resolver`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.sucesso) await carregarAlertas();
    } catch (err) {
        await guardarOperacaoPendente(`http://localhost:5000/api/alertas/${id}/resolver`, 'PATCH', null);
        await atualizarAlertaCache(id, { estado: 'Resolvido', _pendente: true });
        await carregarAlertas();
    }
}

async function ignorarAlerta(id) {
    const token = sessionStorage.getItem('token');
    const justificacao = document.getElementById(`justif-${id}`).value;
    try {
        const res = await fetch(`http://localhost:5000/api/alertas/${id}/ignorar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ justificacao })
        });
        const json = await res.json();
        if (json.sucesso) await carregarAlertas();
    } catch (err) {
        await guardarOperacaoPendente(`http://localhost:5000/api/alertas/${id}/ignorar`, 'PATCH', { justificacao });
        await atualizarAlertaCache(id, { estado: 'Ignorado', justificacao, _pendente: true });
        await carregarAlertas();
    }
}

window.resolverAlerta = resolverAlerta;
window.ignorarAlerta = ignorarAlerta;