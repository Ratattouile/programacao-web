document.addEventListener('DOMContentLoaded', () =>{
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso')

    if(!utilizadorAcesso){
        window.location.href = 'login.html'
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
            window.location.href = 'login.html';
        });
    }
})