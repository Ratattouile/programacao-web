import { guardarOperacaoPendente, sincronizarPendentes, guardarLotesCache, obterLotesCache, guardarPlantasCache, obterPlantasCache, guardarPlanosCache, obterPlanosCache, guardarMedicoesCache, obterMedicoesCache, adicionarLoteCache } from './db.js';

let loteIdSelecionado = null;

function dividirLote(id) {
    loteIdSelecionado = id;
    document.getElementById('modalDividirLote').style.display = 'flex';
}

function calcularProgressoCiclo(lote) {
    const duracaoPrevista = lote.planoId?.duracaoCicloPrevista;
    if (!duracaoPrevista || !lote.dataInicio) return '-';

    const inicio = new Date(lote.dataInicio);
    const fim = lote.dataFim ? new Date(lote.dataFim) : new Date();
    const diasDecorridos = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24));
    const diff = diasDecorridos - duracaoPrevista;

    let estado, cor;
    if (lote.estado === 'Concluído') {
        if (diff <= 0) { estado = `Concluído ${Math.abs(diff)}d adiantado`; cor = '#5ecc8a'; }
        else { estado = `Concluído ${diff}d atrasado`; cor = '#ed9b5a'; }
    } else {
        if (diasDecorridos > duracaoPrevista) { estado = `${diasDecorridos}/${duracaoPrevista}d - atrasado`; cor = '#e57373'; }
        else { estado = `${diasDecorridos}/${duracaoPrevista}d`; cor = 'rgba(255,255,255,0.75)'; }
    }
    return `<span style="color:${cor}">${estado}</span>`;
}

function renderLotes(lotes) {
    const tbody = document.getElementById('tabelaLotes');
    tbody.innerHTML = '';
    lotes.forEach((lote, index) => {
        let corBadge = 'active';
        if (lote.estado === 'Comprometido') corBadge = 'warning';
        if (lote.estado === 'Concluído') corBadge = 'concluded';
        const dataInicio = new Date(lote.dataInicio).toLocaleDateString('pt-PT');
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        if (lote._pendente) tr.style.opacity = '0.55';
        const idCol = lote._pendente
            ? '<span style="color:#c9a84c">A sincronizar</span>'
            : lote._id.substring(lote._id.length - 6).toUpperCase();
        const progresso = lote._pendente ? '-' : calcularProgressoCiclo(lote);
        const acoes = lote._pendente
            ? '<span style="color:rgba(255,255,255,0.3);font-size:12px">Pendente...</span>'
            : `<div class="actions-group">
                    <button class="btn-action ghost" onclick="dividirLote('${lote._id}')">Dividir</button>
                    <button class="btn-action ghost" onclick="abrirModalSensores('${lote._id}', '${lote.ervaAromatica}')">Medição</button>
                </div>`;
        tr.innerHTML = `
            <td class="lot-id">${idCol}</td>
            <td>${lote.ervaAromatica}</td>
            <td>${lote.planoId?.nome || '-'}</td>
            <td>${lote.quantidadeAtual}</td>
            <td>${lote.quantidadeInicial}</td>
            <td>${dataInicio}</td>
            <td>${progresso}</td>
            <td><span class="badge ${corBadge}">${lote.estado}</span></td>
            <td>${acoes}</td>
        `;
        tbody.appendChild(tr);
    });
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

    let dados = { dados: [] };
    let dadosPlantas = { dados: [] };

    try {
        const respostaLotes = await fetch('http://localhost:5000/api/lotes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        dados = await respostaLotes.json();
        if (dados.sucesso) await guardarLotesCache(dados.dados);
    } catch (err) {
        console.warn('Offline - a ler lotes do cache');
        dados = { dados: await obterLotesCache() };
        const ud = document.getElementById('userDisplay');
        if (ud && !ud.innerHTML.includes('Offline')) {
            ud.innerHTML += ' <span style="color:#c9a84c">(Offline)</span>';
        }
    }

    try {
        const respostaPlantas = await fetch('http://localhost:5000/api/plantas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        dadosPlantas = await respostaPlantas.json();
        if (dadosPlantas.sucesso) await guardarPlantasCache(dadosPlantas.dados);
    } catch (err) {
        dadosPlantas = { dados: await obterPlantasCache() };
    }

    const selectErva = document.getElementById('loteErva');
    selectErva.innerHTML = '<option value="" disabled selected>Seleciona uma erva...</option>';
    dadosPlantas.dados.forEach(planta => {
        const option = document.createElement('option');
        option.value = planta.nome;
        option.textContent = `${planta.nome} (${planta.especie})`;
        selectErva.appendChild(option);
    });

    renderLotes(dados.dados);

    const btnNovoLote = document.getElementById('btnNovoLote');
    const modal = document.getElementById('modalNovoLote');
    const btnFechar = document.getElementById('btnFecharModal');

    btnNovoLote.addEventListener('click', async () => {
        const select = document.getElementById('lotePlano');
        try {
            const resposta = await fetch('http://localhost:5000/api/planos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();
            if (dados.sucesso) await guardarPlanosCache(dados.dados);
            select.innerHTML = '';
            dados.dados.forEach(p => {
                select.innerHTML += `<option value="${p._id}">${p.nome}</option>`;
            });
            modal.style.display = 'flex';
        } catch (err) {
            const planos = await obterPlanosCache();
            select.innerHTML = '';
            planos.forEach(p => {
                select.innerHTML += `<option value="${p._id}">${p.nome}</option>`;
            });
            modal.style.display = 'flex';
        }
    });

    btnFechar.addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovoLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ervaAromatica = document.getElementById('loteErva').value;
        const planoId = document.getElementById('lotePlano').value;
        const quantidadeInicial = parseInt(document.getElementById('loteQuantidade').value);

        if (quantidadeInicial <= 0) {
            return alert('A quantidade inicial deve ser maior que zero.');
        }

        try {
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
        } catch (err) {
            const loteTemp = {
                _id: 'temp_' + Date.now(),
                ervaAromatica,
                quantidadeInicial,
                quantidadeAtual: quantidadeInicial,
                estado: 'Ativo',
                dataInicio: new Date().toISOString(),
                planoId: null,
                _pendente: true
            };
            await guardarOperacaoPendente('http://localhost:5000/api/lotes', 'POST', { ervaAromatica, planoId, quantidadeInicial });
            await adicionarLoteCache(loteTemp);
            modal.style.display = 'none';
            const lotesCache = await obterLotesCache();
            renderLotes(lotesCache);
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

        try {
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
        } catch (err) {
            await guardarOperacaoPendente(`http://localhost:5000/api/lotes/${loteIdSelecionado}/dividir`, 'POST', { quantidadeSeparar });
            alert('Sem ligação. A operação será enviada automaticamente quando estiveres online.');
            document.getElementById('modalDividirLote').style.display = 'none';
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
            await guardarMedicoesCache(dados.dados);
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
        const todas = await obterMedicoesCache();
        const medicoesDesteLote = todas.filter(m => m.loteId && m.loteId._id === loteId);
        tabelaHistorico.innerHTML = '';
        if (medicoesDesteLote.length === 0) {
            tabelaHistorico.innerHTML = '<tr><td colspan="4" style="text-align:center;">Sem medições em cache.</td></tr>';
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
    if (Number(humidade) < 0 || Number(humidade) > 100) {
        return alert('A humidade deve estar entre 0% e 100%.');
    }
    if (Number(luminosidade) < 0) {
        return alert('A luminosidade não pode ser negativa.');
    }

    try {
        const resposta = await fetch('http://localhost:5000/api/medicoes', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ loteId, temperatura, humidade, luminosidade })
        });
        const dados = await resposta.json();
        if (dados.sucesso) {
            document.getElementById('formSimularMedicao').reset();
            const erva = document.getElementById('sensoresLoteNome').textContent.replace('Lote de ', '');
            abrirModalSensores(loteId, erva);
        } else {
            alert('Erro ao enviar leitura: ' + dados.erro);
        }
    } catch (err) {
        await guardarOperacaoPendente('http://localhost:5000/api/medicoes', 'POST', { loteId, temperatura, humidade, luminosidade });
        alert('Sem ligação. A operação será enviada automaticamente quando estiveres online.');
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
            const blob = await resposta.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Relatorio_Lotes_GreenHerb.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert('Sem ligação. Não é possível exportar o relatório offline.');
        }
    });
}

window.dividirLote = dividirLote;
window.abrirModalSensores = abrirModalSensores;