import { guardarOperacaoPendente, sincronizarPendentes, guardarPlantasCache, obterPlantasCache, adicionarPlantaCache } from './db.js';

let _plantasToken = null;
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

document.getElementById('btnImportarCSV').addEventListener('click', async (e) => {
    e.preventDefault(); 
    console.log("O botão foi clicado e o preventDefault funcionou!");
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
        alert('Erro de ligação ao servidor. Verifica se tens rede.');
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
            const plantaTemp = { _id: 'temp_' + Date.now(), ...body, _pendente: true };
            await guardarOperacaoPendente('http://localhost:5000/api/plantas', 'POST', body);
            await adicionarPlantaCache(plantaTemp);
            modal.style.display = 'none';
            e.target.reset();
            await carregarPlantas();
        }
    });
});

async function carregarPlantas() {
    let lista = [];
    try {
        const resposta = await fetch('http://localhost:5000/api/plantas', {
            headers: { 'Authorization': `Bearer ${_plantasToken}` }
        });
        const dados = await resposta.json();
        if (dados.sucesso) {
            lista = dados.dados;
            await guardarPlantasCache(lista);
        } else {
            throw new Error(dados.erro);
        }
    } catch (err) {
        console.warn('Offline - a ler plantas do cache');
        lista = await obterPlantasCache();
        const ud = document.getElementById('userDisplay');
        if (ud && !ud.innerHTML.includes('Offline')) {
            ud.innerHTML += ' <span style="color:#c9a84c">(Offline)</span>';
        }
    }

    const tbody = document.getElementById('tabelaPlantas');
    tbody.innerHTML = '';
    lista.forEach((planta, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        if (planta._pendente) tr.style.opacity = '0.55';
        const acoes = planta._pendente
            ? '<span style="color:rgba(255,255,255,0.3);font-size:12px">A sincronizar</span>'
            : `<div class="actions-group"><button class="btn-action red" onclick="eliminarPlanta('${planta._id}')">Eliminar</button></div>`;
        tr.innerHTML = `
            <td>${planta.nome}</td>
            <td>${planta.especie}</td>
            <td>${planta.tempMinima} – ${planta.tempMaxima}</td>
            <td>${planta.humidadeMinima} – ${planta.humidadeMaxima}</td>
            <td>${planta.cicloDeVida}</td>
            <td>${planta.intervaloRega}</td>
            <td>${acoes}</td>
        `;
        tbody.appendChild(tr);
    });
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

window.eliminarPlanta = eliminarPlanta;