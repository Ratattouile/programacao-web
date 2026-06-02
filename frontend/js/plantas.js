let _plantasToken = null;
import { guardarOperacaoPendente, sincronizarPendentes } from './db.js';

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

    _plantasToken = sessionStorage.getItem('token');

    if (!document.getElementById('btnImportarCSV')) return;

    document.getElementById('btnImportarCSV').addEventListener('click', async () => {
        const inputFicheiro = document.getElementById('ficheiroCSV');
        if (inputFicheiro.files.length === 0) {
            return alert('Por favor, escolha um ficheiro CSV primeiro!');
        }
        const formData = new FormData();
        formData.append('ficheiro', inputFicheiro.files[0]);
        try {
            const resposta = await fetch('http://localhost:5000/api/plantas/importar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${_plantasToken}` },
                body: formData
            });
            const dados = await resposta.json();
            if (dados.sucesso) {
                alert('Sucesso! ' + dados.mensagem);
                inputFicheiro.value = '';
                document.getElementById('fileLabel').textContent = 'Selecionar ficheiro .csv';
                document.getElementById('fileDropZone').classList.remove('has-file');
                await carregarPlantas();
            } else {
                alert('Erro na importação: ' + dados.erro);
            }
        } catch (err) {
            alert('Erro de ligação ao servidor.');
        }
    });

    const ficheiroCSV = document.getElementById('ficheiroCSV');
    if (ficheiroCSV) {
        ficheiroCSV.addEventListener('change', () => {
            const dropZone = document.getElementById('fileDropZone');
            const fileLabel = document.getElementById('fileLabel');
            if (ficheiroCSV.files.length > 0) {
                fileLabel.textContent = ficheiroCSV.files[0].name;
                dropZone.classList.add('has-file');
            } else {
                fileLabel.textContent = 'Selecionar ficheiro .csv';
                dropZone.classList.remove('has-file');
            }
        });
    }

    await carregarPlantas();

    const modal = document.getElementById('modalNovaPlanta');
    document.getElementById('btnNovaPlanta').addEventListener('click', () => modal.style.display = 'flex');
    document.getElementById('btnFecharModalPlanta').addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovaPlanta').addEventListener('submit', async (e) => {
        e.preventDefault();

        const tempMin = parseFloat(document.getElementById('plantaTempMin').value);
        const tempMax = parseFloat(document.getElementById('plantaTempMax').value);
        const humMin = parseFloat(document.getElementById('plantaHumMin').value);
        const humMax = parseFloat(document.getElementById('plantaHumMax').value);
        const ciclo = parseInt(document.getElementById('plantaCiclo').value);
        const rega = parseInt(document.getElementById('plantaRega').value);

        if (tempMin >= tempMax) return alert('A temperatura mínima deve ser menor que a máxima.');
        if (humMin >= humMax) return alert('A humidade mínima deve ser menor que a máxima.');
        if (ciclo <= 0 || rega <= 0) return alert('Ciclo de vida e intervalo de rega devem ser maiores que zero.');

        const body = {
            nome: document.getElementById('plantaNome').value,
            especie: document.getElementById('plantaEspecie').value,
            tempMinima: tempMin,
            tempMaxima: tempMax,
            humidadeMinima: humMin,
            humidadeMaxima: humMax,
            cicloDeVida: ciclo,
            intervaloRega: rega
        };

        try {
            const resposta = await fetch('http://localhost:5000/api/plantas', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${_plantasToken}`, 'Content-Type': 'application/json' },
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
        } catch (err) {
            await guardarOperacaoPendente('http://localhost:5000/api/plantas', 'POST', body);
            alert('Sem ligação. A operação será enviada automaticamente quando estiveres online.');
            modal.style.display = 'none';
        }
    });
});

async function carregarPlantas() {
    try {
        const resposta = await fetch('http://localhost:5000/api/plantas', {
            headers: { 'Authorization': `Bearer ${_plantasToken}` }
        });
        const dados = await resposta.json();
        const tbody = document.getElementById('tabelaPlantas');
        tbody.innerHTML = '';
        dados.dados.forEach((planta, index) => {
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${250 + index * 100}ms`;
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
    } catch (err) {
        console.error('Erro ao carregar plantas:', err);
    }
}

async function eliminarPlanta(id) {
    if (!confirm('Tens a certeza que queres eliminar esta planta?')) return;
    try {
        const resposta = await fetch(`http://localhost:5000/api/plantas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${_plantasToken}` }
        });
        const dados = await resposta.json();
        if (dados.sucesso) await carregarPlantas();
        else alert(dados.erro);
    } catch (err) {
        await guardarOperacaoPendente(`http://localhost:5000/api/plantas/${id}`, 'DELETE', null);
        alert('Sem ligação. A operação será enviada automaticamente quando estiveres online.');
    }
}
