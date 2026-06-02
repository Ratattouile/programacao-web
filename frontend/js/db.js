const DB_NAME = 'greenherb-db';
const DB_VERSION = 1;

export function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('pendingOps')) {
                db.createObjectStore('pendingOps', { keyPath: 'id', autoIncrement: true });
            }
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

export async function sincronizarPendentes() {
    const ops = await listarOperacoesPendentes();
    if (ops.length === 0) return;

    const token = sessionStorage.getItem('token');
    let algumFalhou = false;

    for (const op of ops) {
        try {
            const res = await fetch(op.url, {
                method: op.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
}

window.addEventListener('online', async () => {
    console.log("Conexão restabelecida! A tentar sincronizar...");
    const sucesso = await sincronizarPendentes();
    if (sucesso) location.reload();
});

if (navigator.onLine) {
    console.log("Página carregada com internet. A verificar pendentes no IndexedDB...");
    sincronizarPendentes().then(sucesso => {
        if (sucesso) {
            console.log("Sincronização de arranque concluída!");
        }
    });
}