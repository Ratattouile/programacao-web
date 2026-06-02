let loteIdSelecionado = null;

function dividirLote(id) {
    loteIdSelecionado = id;
    document.getElementById('modalDividirLote').style.display = 'flex';
}

async function abrirModalSensores(loteId, ervaAromatica) {
    const modalSensores = document.getElementById('modalSensores');
    const tabelaHistorico = document.getElementById('tabelaHistoricoMedicoes');
    
    document.getElementById('sensorLoteId').value = loteId;
    document.getElementById('sensoresLoteNome').textContent = `Lote de ${ervaAromatica}`;

    tabelaHistorico.innerHTML = '<tr><td colspan="4" style="text-align:center;">A carregar dados...</td></tr>';
    modalSensores.style.display = 'flex';

    let listaMedicoes = [];

    try {
        const token = sessionStorage.getItem('token');
        const resposta = await fetch('http://localhost:5000/api/medicoes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();

        if (dados.sucesso) {
            listaMedicoes = dados.dados;
            await guardarMedicoesCache(listaMedicoes);
        } else {
            throw new Error("Erro da API");
        }
    } catch (err) {
        console.warn("Offline: A carregar histórico de medições da gaveta...");
        
        listaMedicoes = await obterMedicoesCache() || [];
        
        document.getElementById('sensoresLoteNome').innerHTML = `Lote de ${ervaAromatica} <span style="color:orange; font-size: 0.8em;">(Offline)</span>`;
    }

    const medicoesDesteLote = listaMedicoes.filter(m => m.loteId && m.loteId._id === loteId);
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
    let listaLotes = [];
    let listaPlantas = [];


    try {
        const resposta = await fetch('http://localhost:5000/api/lotes', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const dados = await resposta.json();
        
        if (dados.sucesso) {
            listaLotes = dados.dados; 
            await guardarLotesCache(listaLotes);
            console.log("Online: Lotes carregados da API e guardados na gaveta.");
        } else {
            throw new Error(dados.erro || "Falha na resposta da API");
        }

    } catch (err) {
        console.warn("Offline (ou Erro de Código): A ir buscar os lotes à gaveta...", err); 
        listaLotes = await obterLotesCache() || [];
        
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay && !userDisplay.innerHTML.includes('Modo Offline')) {
            userDisplay.innerHTML += ' <span style="color:orange;">(Modo Offline)</span>';
        }
    }

   
    try {
        const respostaPlantas = await fetch('http://localhost:5000/api/plantas', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const dadosPlantas = await respostaPlantas.json();
        
        if (dadosPlantas.sucesso) {
            listaPlantas = dadosPlantas.dados;
            await guardarPlantasCache(listaPlantas);
        } else {
            throw new Error("Falha ao carregar plantas");
        }
    } catch (err) {
        console.warn("Offline: A carregar Plantas da Cache Local...", err);
        listaPlantas = await obterPlantasCache() || [];
    }


    const selectErva = document.getElementById('loteErva');
    if (selectErva && listaPlantas.length > 0) {
        selectErva.innerHTML = '<option value="" disabled selected>Seleciona uma erva...</option>';
        listaPlantas.forEach(planta => {
            const option = document.createElement('option');
            option.value = planta.nome;
            option.textContent = `${planta.nome} (${planta.especie})`;
            selectErva.appendChild(option);
        });
    }

    const tbody = document.getElementById('tabelaLotes');
    tbody.innerHTML = '';
    listaLotes.forEach((lote, index) => {
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
        modal.style.display = 'flex'; 
        
        const select = document.getElementById('lotePlano');
        select.innerHTML = '<option value="" disabled selected>A carregar planos...</option>';
        try {
            console.log("1. A pedir planos à API...");
            const resposta = await fetch('http://localhost:5000/api/planos', { headers: { 'Authorization': `Bearer ${token}` } });
            const dados = await resposta.json();
            
            console.log("2. Resposta da API recebida:", dados); 
            
            if (dados.sucesso) {
                const listaPlanos = dados.dados;
                console.log("3. Planos extraídos:", listaPlanos);
                
                await guardarPlanosCache(listaPlanos); 
                console.log("4. Planos guardados na gaveta com sucesso!");
                
                select.innerHTML = '';
                listaPlanos.forEach(p => { select.innerHTML += `<option value="${p._id}">${p.nome}</option>`; });
            } else {
                console.error("A API respondeu sem sucesso:", dados);
            }
        } catch(err) {
            console.error("Erro ao carregar/guardar os Planos:", err);
            
            const listaPlanos = await obterPlanosCache() || [];
            select.innerHTML = '';
            
            if (listaPlanos.length > 0) {
                listaPlanos.forEach(p => { select.innerHTML += `<option value="${p._id}">${p.nome}</option>`; });
            } else {
                select.innerHTML = '<option value="offline_plano_1">Plano Temporário (Modo Offline)</option>';
            }
        }
        // modal.style.display = 'flex';
    });

    btnFechar.addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('formNovoLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ervaAromatica = document.getElementById('loteErva').value;
        const planoId = document.getElementById('lotePlano').value;
        const quantidadeInicial = parseInt(document.getElementById('loteQuantidade').value);
        const dadosLote = { ervaAromatica, planoId, quantidadeInicial };

        try {
            const resposta = await fetch('http://localhost:5000/api/lotes', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosLote)
            });
            const dados = await resposta.json();
            if (dados.sucesso) {
                modal.style.display = 'none';
                location.reload(); 
            } else { alert(dados.erro); }
        } catch (erro) {
            console.warn("Sem ligação! A guardar lote localmente...");
            await adicionarLotePendente(dadosLote); 
            modal.style.display = 'none';
            alert('⚠️ Estás offline. O Lote foi guardado no browser e será enviado automaticamente quando a net voltar!');
        }
    });

    document.getElementById('btnFecharModalDividir').addEventListener('click', () => {
        document.getElementById('modalDividirLote').style.display = 'none';
    });
    const btnFecharSensores = document.getElementById('btnFecharModalSensores');
    if (btnFecharSensores) {
        btnFecharSensores.addEventListener('click', () => document.getElementById('modalSensores').style.display = 'none');
    }

    document.getElementById('formDividirLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const quantidadeSeparar = parseInt(document.getElementById('dividirQuantidade').value);
        if (!quantidadeSeparar || quantidadeSeparar <= 0) return alert('A quantidade a separar deve ser maior que zero.');

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
            } else { alert(dados.erro); }
        } catch(err) {
            alert('Ação indisponível em modo offline.');
        }
    });

    const formMedicao = document.getElementById('formSimularMedicao');
    if (formMedicao) {
        formMedicao.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loteId = document.getElementById('sensorLoteId').value;
            const temperatura = document.getElementById('simTemp').value;
            const humidade = document.getElementById('simHum').value;
            const luminosidade = document.getElementById('simLuz').value;

            if (temperatura === '' || humidade === '' || luminosidade === '') return alert('Preenche todos os campos.');
            if (humidade < 0 || humidade > 100) return alert('A humidade deve estar entre 0 e 100%.');

            const dadosMedicao = { loteId, temperatura, humidade, luminosidade };

            try {
                const resposta = await fetch('http://localhost:5000/api/medicoes', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosMedicao)
                });
                const dados = await resposta.json();
                
                if (dados.sucesso) {
                    document.getElementById('formSimularMedicao').reset();
                    const erva = document.getElementById('sensoresLoteNome').textContent.replace('Lote de ', '').replace(' (Offline)', '').trim();
                    abrirModalSensores(loteId, erva);
                } else { alert("Erro ao enviar: " + dados.erro); }
                
            } catch (err) {
                console.warn("Offline: A guardar medição localmente...");
                await adicionarMedicaoPendente(dadosMedicao);
                
                document.getElementById('formSimularMedicao').reset();
                alert('Estás offline. A leitura foi guardada no telemóvel e será enviada à base de dados quando a net voltar!');
            }
        });
    }

    const btnExportar = document.getElementById('btnExportarCSV');
    if (btnExportar) {
        btnExportar.addEventListener('click', async () => {
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
                alert("Erro ao exportar. Verifica a tua ligação.");
            }
        });
    }
});


window.addEventListener('online', sincronizarTudo);
window.addEventListener('load', sincronizarTudo);

async function sincronizarTudo() {
    await sincronizarLotesPendentes();
    await sincronizarMedicoesPendentes();
}

async function sincronizarMedicoesPendentes() {
    try {
        const db = await initDB();
        const tx = db.transaction('medicoes_pendentes', 'readonly');
        const store = tx.objectStore('medicoes_pendentes');
        const request = store.getAll();

        request.onsuccess = async () => {
            const medicoesPendentes = request.result;
            if (medicoesPendentes.length === 0) return;

            console.log(`📡 A sincronizar ${medicoesPendentes.length} medições pendentes...`);

            for (let medicao of medicoesPendentes) {
                const token = sessionStorage.getItem('token');
                const { id_local, dataTentativa, ...dadosParaAPI } = medicao; 

                const resposta = await fetch('http://localhost:5000/api/medicoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(dadosParaAPI)
                });

                if (resposta.ok) {
                    const txDelete = db.transaction('medicoes_pendentes', 'readwrite');
                    txDelete.objectStore('medicoes_pendentes').delete(medicao.id_local);
                }
            }
            alert('As leituras de sensores que fizeste offline foram sincronizadas!');
        };
    } catch (erro) {
        console.error("Erro na sincronização de medições:", erro);
    }
}

async function sincronizarLotesPendentes() {
    try {
        const db = await initDB();
        const tx = db.transaction('lotes_pendentes', 'readonly');
        const store = tx.objectStore('lotes_pendentes');
        const request = store.getAll();

        request.onsuccess = async () => {
            const lotesPendentes = request.result;
            if (lotesPendentes.length === 0) return;

            console.log(` A net voltou! A sincronizar ${lotesPendentes.length} lotes pendentes...`);

            for (let lote of lotesPendentes) {
                const token = sessionStorage.getItem('token');
                const { id_local, dataTentativa, ...dadosParaAPI } = lote; 

                const resposta = await fetch('http://localhost:5000/api/lotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(dadosParaAPI)
                });

                if (resposta.ok) {
                    const txDelete = db.transaction('lotes_pendentes', 'readwrite');
                    txDelete.objectStore('lotes_pendentes').delete(lote.id_local);
                }
            }
            alert('Os lotes que criaste offline foram agora sincronizados com o servidor!');
            location.reload(); 
        };
    } catch (erro) {
        console.error("Erro na sincronização:", erro);
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/frontend/sw.js') 
            .then(reg => console.log('Service Worker registado!', reg))
            .catch(err => console.error('Erro no SW', err));
    });
}