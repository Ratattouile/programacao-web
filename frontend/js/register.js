document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm')

    if (!registerForm) return

    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault()

        const nome = document.getElementById('nome').value;
        const cargo = document.getElementById('perfil').value;
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;

        const resposta = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, username, password, cargo })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            alert('Conta criada com sucesso!');
            window.location.href = '/frontend/views/login.html';
        } else {
            alert(dados.erro);
        }
    });


})