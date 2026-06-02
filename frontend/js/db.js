const DB_NAME = 'greenherb-db';
const DB_VERSION = 4;

export function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('pendingOps')) {
                db.createObjectStore('pendingOps', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('lotes')) db.createObjectStore('lotes', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('plantas')) db.createObjectStore('plantas', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('planos')) db.createObjectStore('planos', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('medicoes')) db.createObjectStore('medicoes', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('tarefas')) db.createObjectStore('tarefas', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('alertas')) db.createObjectStore('alertas', { keyPath: '_id' });
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    });
}

export async function guardarOperacaoPendente(url, method, body) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pendingOps', 'readwrite');
        tx.objectStore('pendingOps').add({ url, method, body, timestamp: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function listarOperacoesPendentes() {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pendingOps', 'readonly');
        const req = tx.objectStore('pendingOps').getAll();
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = reject;
    });
}

export async function eliminarOperacaoPendente(id) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pendingOps', 'readwrite');
        tx.objectStore('pendingOps').delete(id);
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

let _aSincronizar = false;
export async function sincronizarPendentes() {
    if (_aSincronizar) return false;
    _aSincronizar = true;
    try {
        const ops = await listarOperacoesPendentes();
        if (ops.length === 0) return true;

        const token = sessionStorage.getItem('token');
        let algumFalhou = false;

        for (const op of ops) {
            try {
                const res = await fetch(op.url, {
                    method: op.method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: op.body ? JSON.stringify(op.body) : undefined
                });
                if (res.ok) {
                    await eliminarOperacaoPendente(op.id);
                } else {
                    algumFalhou = true;
                }
            } catch {
                algumFalhou = true;
                break;
            }
        }
        return !algumFalhou;
    } finally {
        _aSincronizar = false;
    }
}

function guardarCache(store, lista) {
    return abrirDB().then(db => {
        const tx = db.transaction(store, 'readwrite');
        const os = tx.objectStore(store);
        os.clear();
        lista.forEach(item => {
            if (item && item._id) os.put(item);
            else if (item && item.id) { item._id = item.id; os.put(item); }
        });
    });
}

function obterCache(store) {
    return abrirDB().then(db => new Promise((resolve) => {
        const req = db.transaction(store, 'readonly').objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
    }));
}

async function adicionarItemCache(store, item) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function atualizarItemCache(store, id, alteracoes) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const os = tx.objectStore(store);
        const req = os.get(id);
        req.onsuccess = () => {
            const item = req.result;
            if (item) {
                Object.assign(item, alteracoes);
                os.put(item);
            }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export const guardarLotesCache = (l) => guardarCache('lotes', l);
export const obterLotesCache = () => obterCache('lotes');
export const guardarPlantasCache = (l) => guardarCache('plantas', l);
export const obterPlantasCache = () => obterCache('plantas');
export const guardarPlanosCache = (l) => guardarCache('planos', l);
export const obterPlanosCache = () => obterCache('planos');
export const guardarMedicoesCache = (l) => guardarCache('medicoes', l);
export const obterMedicoesCache = () => obterCache('medicoes');
export const guardarTarefasCache = (l) => guardarCache('tarefas', l);
export const obterTarefasCache = () => obterCache('tarefas');
export const guardarAlertasCache = (l) => guardarCache('alertas', l);
export const obterAlertasCache = () => obterCache('alertas');
export const adicionarLoteCache = (i) => adicionarItemCache('lotes', i);
export const adicionarPlantaCache = (i) => adicionarItemCache('plantas', i);
export const adicionarPlanoCache = (i) => adicionarItemCache('planos', i);
export const adicionarTarefaCache = (i) => adicionarItemCache('tarefas', i);
export const adicionarMedicaoCache = (i) => adicionarItemCache('medicoes', i);
export const atualizarTarefaCache = (id, alt) => atualizarItemCache('tarefas', id, alt);
export const atualizarAlertaCache = (id, alt) => atualizarItemCache('alertas', id, alt);
export const atualizarLoteCache = (id, alt) => atualizarItemCache('lotes', id, alt);

window.addEventListener('online', async () => {
    console.log("Evento online disparado! A sincronizar...");
    const sucesso = await sincronizarPendentes();
    if (sucesso) location.reload();
});

(async () => {
    const pendentes = await listarOperacoesPendentes();
    if (pendentes.length === 0) return;
    console.log(`${pendentes.length} operações pendentes. A tentar sincronizar...`);
    const sucesso = await sincronizarPendentes();
    if (sucesso) {
        const restantes = await listarOperacoesPendentes();
        if (restantes.length === 0) {
            console.log("Sincronização concluída!");
            location.reload();
        }
    }
})();