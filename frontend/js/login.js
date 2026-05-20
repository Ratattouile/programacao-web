document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm')

    if (!loginForm) return

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const resposta = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            sessionStorage.setItem('utilizadorAcesso', JSON.stringify(dados.dados));
            sessionStorage.setItem('token', dados.dados.token);
            window.location.href = '/frontend/views/home.html';
        } else {
            alert(dados.erro);
        }
    });
});