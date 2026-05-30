let loteIdSelecionado = null;
function dividirLote(id) {
    loteIdSelecionado = id;
    document.getElementById('modalDividirLote').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', async () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');
    if (!utilizadorAcesso) { window.location.href = '/frontend/views/login.html'; return; }

    const utilizador = JSON.parse(utilizadorAcesso);
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) userDisplay.textContent = utilizador.nome;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('utilizadorAcesso');
        sessionStorage.removeItem('token');
        window.location.href = '/frontend/views/login.html';
    });

    const token = sessionStorage.getItem('token');
    const resposta = await fetch('http://localhost:5000/api/lotes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dados = await resposta.json();

    const respostaPlantas = await fetch('http://localhost:5000/api/plantas', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dadosPlantas = await respostaPlantas.json();

    const selectErva = document.getElementById('loteErva');
    selectErva.innerHTML = '<option value="" disabled selected>Seleciona uma erva...</option>';

    dadosPlantas.dados.forEach(planta => {
        const option = document.createElement('option');
        option.value = planta.nome;
        option.textContent = `${planta.nome} (${planta.especie})`;
        selectErva.appendChild(option);
    });


    const tbody = document.getElementById('tabelaLotes');
    tbody.innerHTML = '';

    dados.dados.forEach((lote, index) => {
        let corBadge = 'active';
        if (lote.estado === 'Comprometido') corBadge = 'warning';
        if (lote.estado === 'Concluído') corBadge = 'concluded';

        const dataInicio = new Date(lote.dataInicio).toLocaleDateString('pt-PT');

        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        tr.innerHTML = `
            <td class="lot-id">${lote._id.substring(lote._id.length - 6).toUpperCase()}</td>
            <td>${lote.ervaAromatica}</td>
            <td>${lote.planoId?.nome || '-'}</td>
            <td>${lote.quantidadeAtual}</td>
            <td>${lote.quantidadeInicial}</td>
            <td>${dataInicio}</td>
            <td><span class="badge ${corBadge}">${lote.estado}</span></td>
            <td>
                <div class="actions-group">
                    <button class="btn-action ghost" onclick="dividirLote('${lote._id}')">Dividir</button>
                    <button class="btn-action ghost" onclick="abrirModalSensores('${lote._id}', '${lote.ervaAromatica}')">Medição</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const btnNovoLote = document.getElementById('btnNovoLote');
    const modal = document.getElementById('modalNovoLote');
    const btnFechar = document.getElementById('btnFecharModal');

    btnNovoLote.addEventListener('click', async () => {
        const resposta = await fetch('http://localhost:5000/api/planos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();
        const select = document.getElementById('lotePlano');
        select.innerHTML = '';
        dados.dados.forEach(p => {
            select.innerHTML += `<option value="${p._id}">${p.nome}</option>`;

        });
        modal.style.display = 'flex';
    });

    btnFechar.addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovoLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ervaAromatica = document.getElementById('loteErva').value;
        const planoId = document.getElementById('lotePlano').value;
        const quantidadeInicial = parseInt(document.getElementById('loteQuantidade').value);

        const resposta = await fetch('http://localhost:5000/api/lotes', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ervaAromatica, planoId, quantidadeInicial })
        });

        const dados = await resposta.json();
        if (dados.sucesso) {
            modal.style.display = 'none';
            location.reload();
        } else {
            alert(dados.erro);
        }
    });

    document.getElementById('btnFecharModalDividir').addEventListener('click', () => {
        document.getElementById('modalDividirLote').style.display = 'none';
    });

    document.getElementById('formDividirLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const quantidadeSeparar = parseInt(document.getElementById('dividirQuantidade').value);

        if (!quantidadeSeparar || quantidadeSeparar <= 0) {
            return alert('A quantidade a separar deve ser maior que zero.');
        }

        const resposta = await fetch(`http://localhost:5000/api/lotes/${loteIdSelecionado}/dividir`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidadeSeparar })
        });

        const dados = await resposta.json();
        if (dados.sucesso) {
            document.getElementById('modalDividirLote').style.display = 'none';
            location.reload();
        } else {
            alert(dados.erro);
        }
    });
});


const modalSensores = document.getElementById('modalSensores');
const btnFecharSensores = document.getElementById('btnFecharModalSensores');
const tabelaHistorico = document.getElementById('tabelaHistoricoMedicoes');

if (btnFecharSensores) {
    btnFecharSensores.addEventListener('click', () => modalSensores.style.display = 'none');
}

async function abrirModalSensores(loteId, ervaAromatica) {
    document.getElementById('sensorLoteId').value = loteId;
    document.getElementById('sensoresLoteNome').textContent = `Lote de ${ervaAromatica}`;

    tabelaHistorico.innerHTML = '<tr><td colspan="4" style="text-align:center;">A carregar dados...</td></tr>';
    modalSensores.style.display = 'flex';

    try {
        const token = sessionStorage.getItem('token');
        const resposta = await fetch('http://localhost:5000/api/medicoes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();

        if (dados.sucesso) {
            const medicoesDesteLote = dados.dados.filter(m => m.loteId && m.loteId._id === loteId);

            tabelaHistorico.innerHTML = '';

            if (medicoesDesteLote.length === 0) {
                tabelaHistorico.innerHTML = '<tr><td colspan="4" style="text-align:center;">Sem medições registadas.</td></tr>';
            } else {
                medicoesDesteLote.forEach(medicao => {
                    const dataFormatada = new Date(medicao.dataRegisto).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${dataFormatada}</td>
                        <td>${medicao.temperatura} ºC</td>
                        <td>${medicao.humidade} %</td>
                        <td>${medicao.luminosidade} lx</td>
                        
                    `;
                    tabelaHistorico.appendChild(tr);
                });
            }
        }
    } catch (err) {
        tabelaHistorico.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #ff6b6b;">Erro ao carregar histórico.</td></tr>';
    }
}

document.getElementById('formSimularMedicao').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    const loteId = document.getElementById('sensorLoteId').value;
    const temperatura = document.getElementById('simTemp').value;
    const humidade = document.getElementById('simHum').value;
    const luminosidade = document.getElementById('simLuz').value;

    if (temperatura === '' || humidade === '' || luminosidade === '') {
        return alert('Preenche todos os campos da medição.');
    }
    if (humidade < 0 || humidade > 100) {
        return alert('A humidade deve estar entre 0% e 100%.');
    }
    if (luminosidade < 0) {
        return alert('A luminosidade não pode ser negativa.');
    }

    try {
        const resposta = await fetch('http://localhost:5000/api/medicoes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loteId, temperatura, humidade, luminosidade })
        });

        const dados = await resposta.json();
        if (dados.sucesso) {
            document.getElementById('formSimularMedicao').reset();
            const erva = document.getElementById('sensoresLoteNome').textContent.replace('Lote de ', '');
            abrirModalSensores(loteId, erva);
        } else {
            alert("Erro ao enviar leitura: " + dados.erro);
        }
    } catch (err) {
        alert("Erro de comunicação com o servidor.");
    }
});

const btnExportar = document.getElementById('btnExportarCSV');
if (btnExportar) {
    btnExportar.addEventListener('click', async () => {
        const token = sessionStorage.getItem('token');
        try {
            const resposta = await fetch('http://localhost:5000/api/lotes/exportar', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Converte a resposta num Ficheiro (Blob)
            const blob = await resposta.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'Relatorio_Lotes_GreenHerb.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert("Erro ao exportar ficheiro.");
        }
    });
}
