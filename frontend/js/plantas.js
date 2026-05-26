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

    const token = sessionStorage.getItem('token');

    async function carregarPlantas() {
        const resposta = await fetch('http://localhost:5000/api/plantas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const tbody = document.getElementById('tabelaPlantas');
        tbody.innerHTML = '';

        dados.dados.forEach(planta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${planta.nome}</td>
                <td>${planta.especie}</td>
                <td>${planta.tempMinima} – ${planta.tempMaxima}</td>
                <td>${planta.humidadeMinima} – ${planta.humidadeMaxima}</td>
                <td>${planta.cicloDeVida}</td>
                <td>${planta.intervaloRega}</td>
                <td>
                    <div class="actions-group">
                        <button class="btn-action red" onclick="eliminarPlanta('${planta._id}')">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    await carregarPlantas();

    const modal = document.getElementById('modalNovaPlanta');
    document.getElementById('btnNovaPlanta').addEventListener('click', () => modal.style.display = 'flex');
    document.getElementById('btnFecharModalPlanta').addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovaPlanta').addEventListener('submit', async (e) => {
        e.preventDefault();

        const body = {
            nome: document.getElementById('plantaNome').value,
            especie: document.getElementById('plantaEspecie').value,
            tempMinima: parseFloat(document.getElementById('plantaTempMin').value),
            tempMaxima: parseFloat(document.getElementById('plantaTempMax').value),
            humidadeMinima: parseFloat(document.getElementById('plantaHumMin').value),
            humidadeMaxima: parseFloat(document.getElementById('plantaHumMax').value),
            cicloDeVida: parseInt(document.getElementById('plantaCiclo').value),
            intervaloRega: parseInt(document.getElementById('plantaRega').value)
        };

        const resposta = await fetch('http://localhost:5000/api/plantas', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const dados = await resposta.json();
        if (dados.sucesso) {
            modal.style.display = 'none';
            e.target.reset();
            await carregarPlantas();
        } else {
            alert(dados.erro);
        }
    });
});

async function eliminarPlanta(id) {
    if (!confirm('Tens a certeza que queres eliminar esta planta?')) return;
    const token = sessionStorage.getItem('token');
    const resposta = await fetch(`http://localhost:5000/api/plantas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dados = await resposta.json();
    if (dados.sucesso) location.reload();
    else alert(dados.erro);
}
