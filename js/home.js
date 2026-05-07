document.addEventListener('DOMContentLoaded', () =>{
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso')

    if(!utilizadorAcesso){
        window.location.href = '/views/login.html'
        return;

    }

    const utilizador = JSON.parse(utilizadorAcesso);
    const userDisplay = document.getElementById('userDisplay')

    if(userDisplay){
        userDisplay.textContent =`${utilizador.nome}`
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Limpa a sessão
            sessionStorage.removeItem('utilizadorAcesso');
            // Volta para a página inicial
            window.location.href = '/views/login.html';
        });
    }


    async function carregarTabela(){
        try {
            const lotes = await getLotes()
            const tbody = document.getElementById('tabelaLotes')

            tbody.innerHTML = '';

            lotes.forEach(lote => {
                let corBadge = 'active'
                if(lote.estado === 'Comprometido') corBadge = 'warning';
                if(lote.estado === 'Concluido') corBadge = 'badge';
                
                const tr = document.createElement('tr')
                tr.innerHTML = `
                    <td>${lote.id}</td>
                    <td>${lote.erva}</td>
                    <td><span class="badge ${corBadge}">${lote.estado}</td>
                    <td>${lote.plano}</td>
                
                
                `
                tbody.appendChild(tr)
                
            });
        } catch (error) {
            console.error('Erro ao carregar a base de dados', erro)
        }
    }

    carregarTabela();
})