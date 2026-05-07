document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm')

    if(!loginForm) return

    loginForm.addEventListener('submit', function(event){
        const usernameInput = document.getElementById('username').value
        const passwordInput = document.getElementById('password').value

        if(usernameInput ==='admin' && passwordInput === '1234'){
            const utilizadorLogado = {
                nome:'João Administrador',
                perfil:'Administrador',
                username:'admin',
            };

            sessionStorage.setItem('utilizadorAcesso', JSON.stringify(utilizadorLogado))

            window.location.href = 'dashboard.html';
        } else {
            alert('Credenciais inválidas! Tenta "admin" e "1234".');
        }
    });
});