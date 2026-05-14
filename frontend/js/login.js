document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm')

    if(!loginForm) return
    
    loginForm.addEventListener('submit', function(event){
        event.preventDefault()

        const usernameInput = document.getElementById('username').value
        const passwordInput = document.getElementById('password').value

        let utilizadoresGuardados = localStorage.getItem('greenherb_users')
        let arrayUtilizadores = []

        if(utilizadoresGuardados){
            arrayUtilizadores = JSON.parse(utilizadoresGuardados)
        }

        const utilizadorValido = arrayUtilizadores.find(u => u.username === usernameInput)

        const isContaMestre = (usernameInput === 'admin' && passwordInput === '1234')

        if(utilizadorValido || isContaMestre){
            const guardarUtilizador = utilizadorValido ? utilizadorValido :{
                nome: 'João Guerra',
                perfil: 'Administrador',
                username: 'admin'
            }

            sessionStorage.setItem('utilizadorAcesso', JSON.stringify(guardarUtilizador))
            window.location.href = '/views/home.html'
        }else{
            alert('Credenciais Invalidas!');
        }
        
        
        
    });
});