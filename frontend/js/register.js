document.addEventListener('DOMContentLoaded', () =>{
    const registerForm = document.getElementById('registerForm')

    if(!registerForm) return

    registerForm.addEventListener('submit', function(event){
        event.preventDefault()

        const nome = document.getElementById('nome').value
        const perfil = document.getElementById('perfil').value
        const username = document.getElementById('regUsername').value
        const password = document.getElementById('regPassword').value

        const novoUtilizador = {
            nome:nome,
            perfil:perfil,
            username:username,
            password:password
        }

        console.log(novoUtilizador)

        let utilizadoresGuardados = localStorage.getItem('greenherb_users')

        let arrayUtilizadores = []

        if(utilizadoresGuardados){
            arrayUtilizadores = JSON.parse(utilizadoresGuardados)
        }

        const utilizadorExiste = arrayUtilizadores.find(u => u.username === username)

        if(utilizadorExiste){
            alert("esse username ja existe!")
            return
        }

        arrayUtilizadores.push(novoUtilizador)
        localStorage.setItem('greenherb_users', JSON.stringify(arrayUtilizadores))

        alert('Conta criada com sucesso!')

        window.location.href = '/views/login.html'




    })


})