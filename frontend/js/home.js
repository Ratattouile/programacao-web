document.addEventListener('DOMContentLoaded', () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');

    if (!utilizadorAcesso) {
        window.location.href = '/frontend/views/login.html';
        return;
    }

    const utilizador = JSON.parse(utilizadorAcesso);
    const userDisplay = document.getElementById('userDisplay');

    if (userDisplay) {
        userDisplay.textContent = `${utilizador.nome}`;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('utilizadorAcesso');
            window.location.href = '/frontend/views/login.html';
        });
    }

    async function carregarTabela() {
        try {
            const lotes = await getLotes();
            const tbody = document.getElementById('tabelaLotes');

            tbody.innerHTML = '';

            lotes.forEach(lote => {
                let corBadge = 'active';
                if (lote.estado === 'Comprometido') corBadge = 'warning';
                if (lote.estado === 'Concluido') corBadge = 'concluded';

                let corPlano = '';
                if (lote.plano === 'Emergência') corPlano = 'emergency';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="lot-id">${lote.id}</td>
                    <td>${lote.erva}</td>
                    <td><span class="badge ${corBadge}">${lote.estado}</span></td>
                    <td><span class="plan-tag ${corPlano}">${lote.plano}</span></td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro ao carregar a base de dados', error);
        }
    }

    carregarTabela();
});