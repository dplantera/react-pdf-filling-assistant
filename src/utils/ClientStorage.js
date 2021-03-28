export class ClientStorage {
    constructor() {
        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        this.connection = null;
        this.objectStores = {};
        this.dbName = "pdf_form_assist";
        this.version = undefined;
    }


    hasObjectStore(name) {
        let hasObjectStore = Object.keys(this.objectStores).includes(name);
        console.info("hasObjectStore: " + name, hasObjectStore)
        return hasObjectStore;
    }

    async getDb(name = this.dbName) {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = await this.open();
            } catch (err) {
                reject(err);
            }
            resolve(db)
        })
    }

    async createObjectStoreIfNeeded(clazz) {
        let db = await this.getDb();
        if (!this.version)
            this.version = db.version;

        if (!db.objectStoreNames.contains(clazz.name))
            this.version++;

        console.info("createObjectStoreIfNeeded ", clazz.name, db.version, this.version)
        if (db.version === this.version) {
            console.log("no need to upgrade: ", clazz.name)
            return Promise.resolve(db);
        }
        db.close();

        db = await this.open(this.dbName, this.version, (e) => {
            let db = e.target.result;
            this.version = db.version;
            let objectStore;
            objectStore = db.createObjectStore(clazz.name, {keyPath: "id"});
            this.objectStores[objectStore.name] = objectStore;
            console.log("%c upgradeneeded...:", 'background: #222; color: #bada55', this.objectStores)
        });

        return Promise.resolve(db);
    }

    async open(dbName = this.dbName, version = undefined, upgradeNeeded = () => {
    }) {
        const request = this.indexedDB.open(this.dbName, version)
        return new Promise((resolve, reject) => {
            request.onblocked = (e) => reject(e);
            request.onupgradeneeded = upgradeNeeded;
            request.onerror = (e) => reject(e.target.error);
            request.onsuccess = (e) => resolve(e.target.result);
        });
    }

    async getObjectStore(clazz) {
        if (this.objectStores[clazz.name])
            return this.objectStores[clazz.name]

        const db = await this.createObjectStoreIfNeeded(clazz);
        db.onversionchange = (e) => {
            console.log("reloading db", e);
            db.close();
            this.objectStores[clazz.name] = null;
        };

        this.objectStores[clazz.name] = db;
        return db;
    }

    async storeObject(clazz, value) {
        const db = await this.getObjectStore(clazz);
        const tx = db.transaction(clazz.name, 'readwrite');
        tx.oncomplete = (e) => {
            console.log("transaction ", e)
        }
        const store = tx.objectStore(clazz.name);

        if(Array.isArray(value))
            value = value.map(val => {
                const filtered =  Object.keys(val).reduce((acc, key) => {
                    if(typeof val[key] !== 'function')
                        acc[key] = val[key];
                    return acc;
                }, {})
                const request = store.add(filtered);
                request.onsuccess = (e) => console.info("success: " + clazz.name, e)
                request.onerror = (e) => console.error("error: " + clazz.name, e)
                return filtered;
            })
        else console.log("not an array", value)


        console.log(store)
        console.log("storeObject", {db});
        localStorage.setItem(clazz.name, JSON.stringify(value));
        // db.close()
    }

    async load(clazz) {
        const rawJson = localStorage.getItem(clazz.name);
        return JSON.parse(rawJson);
    }
}