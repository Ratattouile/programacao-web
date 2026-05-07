const DB_NAME = 'GreenherbDB'
const DB_VERSION = 1


function initDB(){
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME,DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = event.target.result

            if(!db.objectStoreNames.contains('lotes')){
                const objectStore = db.createObjectStore('lotes', {keyPath: 'id'})

                objectStore.transaction.oncomplete = () => {
                    const loteTx = db.transaction('lotes', 'readwrite').objectStore('lotes')
                    loteTx.add({id:'L-2023-001', erva:'Manjericão', estado:'Ativo', plano:'Regular'});
                    loteTx.add({ id: 'L-2023-002', erva: 'Hortelã', estado: 'Comprometido', plano: 'Emergência' });
                    loteTx.add({ id: 'L-2023-003', erva: 'Alecrim', estado: 'Concluído', plano: 'Regular' });
                }
            }
        }

        request.onsuccess = (event)=> resolve(event.target.result);
        request.onerror = (event) => reject('Erro ao abrir o IndexedDB')
    })
}


function getLotes(){
    return new Promise(async (resolve, reject) => {
        try {

            const db = await initDB()
            const transaction = db.transaction('lotes', 'readonly')
            const store = transaction.objectStore('lotes')
            const request = store.getAll()

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            
        } catch (error) {

            reject(error)
            
        }
    })
}