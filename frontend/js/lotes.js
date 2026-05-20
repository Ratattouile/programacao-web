document.addEventListener('DOMContentLoaded', async () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');
    if (!utilizadorAcesso) { window.location.href = '/frontend/views/login.html'; return; }

    const utilizador = JSON.parse(utilizadorAcesso);
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) userDisplay.textContent = utilizador.nome;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('utilizadorAcesso');
        sessionStorage.removeItem('token');
        window.location.href = '/frontend/views/login.html';
    });

    const token = sessionStorage.getItem('token');
    const resposta = await fetch('http://localhost:5000/api/lotes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dados = await resposta.json();

    const tbody = document.getElementById('tabelaLotes');
    tbody.innerHTML = '';

    dados.dados.forEach(lote => {
        let corBadge = 'active';
        if (lote.estado === 'Comprometido') corBadge = 'warning';
        if (lote.estado === 'Concluído') corBadge = 'concluded';

        const dataInicio = new Date(lote.dataInicio).toLocaleDateString('pt-PT');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="lot-id">${lote._id}</td>
            <td>${lote.ervaAromatica}</td>
            <td>${lote.planoId?.nome || '-'}</td>
            <td>${dataInicio}</td>
            <td><span class="badge ${corBadge}">${lote.estado}</span></td>
            <td>
                <div class="actions-group">
                    <button class="btn-action ghost" onclick="dividirLote('${lote._id}')">Dividir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const btnNovoLote = document.getElementById('btnNovoLote');
    const modal = document.getElementById('modalNovoLote');
    const btnFechar = document.getElementById('btnFecharModal');

    // abrir modal e carregar planos no select
    btnNovoLote.addEventListener('click', async () => {
        const resposta = await fetch('http://localhost:5000/api/planos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();
        const select = document.getElementById('lotePlano');
        select.innerHTML = '';
        dados.dados.forEach(p => {
            select.innerHTML += `<option value="${p._id}">${p.nome}</option>`;
        });
        modal.style.display = 'flex';
    });

    btnFechar.addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovoLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ervaAromatica = document.getElementById('loteErva').value;
        const planoId = document.getElementById('lotePlano').value;
        const quantidadeInicial = parseInt(document.getElementById('loteQuantidade').value);

        const resposta = await fetch('http://localhost:5000/api/lotes', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ervaAromatica, planoId, quantidadeInicial })
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
