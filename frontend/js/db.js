const DB_NAME = 'GreenherbDB';
const DB_VERSION = 8; 

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('lotes')) db.createObjectStore('lotes', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('plantas')) db.createObjectStore('plantas', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('planos')) db.createObjectStore('planos', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('lotes_pendentes')) db.createObjectStore('lotes_pendentes', { keyPath: 'id_local', autoIncrement: true });
            if (!db.objectStoreNames.contains('medicoes')) db.createObjectStore('medicoes', { keyPath: '_id' });
            if (!db.objectStoreNames.contains('medicoes_pendentes')) db.createObjectStore('medicoes_pendentes', { keyPath: 'id_local', autoIncrement: true });
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Erro ao abrir a base de dados');
    });
}

// --- FUNÇÕES DA CACHE ---
async function guardarLotesCache(lotes) {
    const db = await initDB();
    const tx = db.transaction('lotes', 'readwrite');
    tx.objectStore('lotes').clear(); 
    
    lotes.forEach(lote => {
        if (lote && lote._id) {
            tx.objectStore('lotes').put(lote);
        } else if (lote && lote.id) {
            lote._id = lote.id; 
            tx.objectStore('lotes').put(lote);
        }
    }); 
}

async function guardarPlantasCache(plantas) {
    const db = await initDB();
    const tx = db.transaction('plantas', 'readwrite');
    tx.objectStore('plantas').clear();
    
    plantas.forEach(planta => {
        if (planta && planta._id) {
            tx.objectStore('plantas').put(planta);
        } else if (planta && planta.id) {
            planta._id = planta.id;
            tx.objectStore('plantas').put(planta);
        }
    });
}

async function guardarPlanosCache(planos) {
    const db = await initDB();
    const tx = db.transaction('planos', 'readwrite');
    tx.objectStore('planos').clear();
    
    planos.forEach(plano => {
        if (plano && plano._id) {
            tx.objectStore('planos').put(plano);
        } else if (plano && plano.id) {
            plano._id = plano.id;
            tx.objectStore('planos').put(plano);
        }
    });
}

async function obterLotesCache() {
    const db = await initDB();
    return new Promise((resolve) => {
        const req = db.transaction('lotes', 'readonly').objectStore('lotes').getAll();
        req.onsuccess = () => resolve(req.result);
    });
}



async function obterPlantasCache() {
    const db = await initDB();
    return new Promise((resolve) => {
        const req = db.transaction('plantas', 'readonly').objectStore('plantas').getAll();
        req.onsuccess = () => resolve(req.result);
    });
}



async function obterPlanosCache() {
    const db = await initDB();
    return new Promise((resolve) => {
        const req = db.transaction('planos', 'readonly').objectStore('planos').getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

function adicionarLotePendente(dadosLote) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await initDB();
            const tx = db.transaction('lotes_pendentes', 'readwrite');
            dadosLote.dataTentativa = new Date().toISOString(); 
            const request = tx.objectStore('lotes_pendentes').add(dadosLote);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (error) { reject(error); }
    });
}

async function guardarMedicoesCache(medicoes) {
    const db = await initDB();
    const tx = db.transaction('medicoes', 'readwrite');
    tx.objectStore('medicoes').clear();
    
    medicoes.forEach(medicao => {
        if (medicao && medicao._id) {
            tx.objectStore('medicoes').put(medicao);
        } else if (medicao && medicao.id) {
            medicao._id = medicao.id;
            tx.objectStore('medicoes').put(medicao);
        }
    });
}

async function obterMedicoesCache() {
    const db = await initDB();
    return new Promise((resolve) => {
        const req = db.transaction('medicoes', 'readonly').objectStore('medicoes').getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

function adicionarMedicaoPendente(dadosMedicao) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await initDB();
            const tx = db.transaction('medicoes_pendentes', 'readwrite');
            dadosMedicao.dataTentativa = new Date().toISOString(); 
            const request = tx.objectStore('medicoes_pendentes').add(dadosMedicao);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (error) { reject(error); }
    });
}