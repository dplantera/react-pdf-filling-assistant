const filterFunctions = (object) => {
    return Object.keys(object).reduce((acc, key) => {
        if (typeof object[key] !== 'function')
            acc[key] = object[key];
        return acc;
    }, {})
}
function transform(clazz, value) {
    const domainObject = clazz();
    return {...domainObject, ...value}
}

export class ClientStorage {
    static __instance;

    constructor() {
        if (ClientStorage.__instance)
            throw new Error("use ClientStorage.instance")
        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        this.connection = null;
        this.objectStores = {};
        this.dbName = "pdf_form_assist";
        this.version = undefined;
    }

    static get instance() {
        if (!ClientStorage.__instance)
            ClientStorage.__instance = new ClientStorage();

        return ClientStorage.__instance;
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
                db = await this.openDbConnection();
            } catch (err) {
                reject(err);
            }
            resolve(db)
        })
    }

    async createObjectStoreIfNeeded(clazz) {
        let db = await this.getDb();
        console.log(clazz.name + " - version: " + db.version + " | " + this.version)
        if (!this.version)
            this.version = db.version;

        if (!db.objectStoreNames.contains(clazz.name))
            this.version++;

        if (db.version === this.version) {
            console.log("no need to upgrade: ", clazz.name)
            return db;
        }
        db.close();

        return await this.openDbConnection(this.dbName, this.version, (e) => {
            let db = e.target.result;
            this.version = db.version;
            if (!db.objectStoreNames.contains(clazz.name)) {
                const objectStore = db.createObjectStore(clazz.name, {keyPath: "id"});
                console.log("objectStore created: ", objectStore);
            }
        });
    }

    async openDbConnection(dbName = this.dbName, version = undefined, upgradeNeeded = () => {
    }) {
        const request = this.indexedDB.open(this.dbName, version)
        return new Promise((resolve, reject) => {
            request.onblocked = (e) => reject(e);
            request.onupgradeneeded = upgradeNeeded;
            request.onerror = (e) => reject(e.target.error);
            request.onsuccess = (e) => resolve(e.target.result);
        });
    }

    async storeTransaction(clazz) {
        let db;

        if (this.objectStores[clazz.name])
            db = this.objectStores[clazz.name]
        else
            db = await this.createObjectStoreIfNeeded(clazz);

        db.onversionchange = (e) => {
            console.log("reloading db: " + clazz.name, e);
            db.close();
            this.objectStores[clazz.name] = null;
        };

        // make transaction
        const tx = db.transaction(clazz.name, 'readwrite');
        // tx.oncomplete = (e) => {console.log("transaction ", e)}
        const store = tx.objectStore(clazz.name);

        this.objectStores[clazz.name] = db;

        return store;
    }


    async storeRequest(clazz, requestParams) {

        async function makeRequest(clazz, storeOperation, params) {
            const noop = () => {
            };
            const onerror = params.onerror ?? noop;
            const onsuccess = params.onsuccess ?? noop;
            const request = await storeOperation();
            request.onsuccess = onsuccess
            request.onerror = onerror
            return request;
        }


        const store = await this.storeTransaction(clazz);
        return {
            add: async (object) => {
                return await makeRequest(clazz, () => store.add(object), requestParams)
            },
            put: async (object) => {
                return await makeRequest(clazz, () => store.put(object), requestParams)
            },
            getAll: async (query, params = requestParams) => {
                return await makeRequest(clazz, () => store.getAll(query), params);
            },
            get: async (query, params = requestParams) => {
                return await makeRequest(clazz, () => store.get(query), params)
            }
        }
    }

    async updateObject(clazz, value, params) {
        const request = await this.storeRequest(clazz, params);
        if (Array.isArray(value))
            value.map(async val => {
                const filtered = filterFunctions(val);
                await request.put(filtered);
                return filtered;
            })
        else {
            const filtered = filterFunctions(value);
            await request.put(filtered)
        }
    }

    async storeObject(clazz, value, params) {
        const request = await this.storeRequest(clazz, params);
        if (Array.isArray(value))
            value.map(async val => {
                const filtered = filterFunctions(val);
                await request.add(filtered);
                return filtered;
            })
        else {
            const filtered = filterFunctions(value);
            await request.add(filtered)
        }
    }

    async getById(clazz, key) {
        const request = await this.storeRequest(clazz, {});

        return new Promise(async resolve => {
            await request.get(key, {
                onsuccess: ({target: {result}}) => {
                    resolve(transform(clazz, result));
                }
            });
        })
    }

    async get(clazz, {keys, query, params} = {}) {
        return new Promise((async (resolve, reject) => {
            let request;
            try {
                request = await this.storeRequest(clazz, params || {});
                const results = [];
                if (keys && Array.isArray(keys)) {
                    for(let key of keys ){
                        const result = await this.getById(clazz, key);
                        results.push(result);
                    }
                    resolve(results);
                }

                if (!keys) {
                    await request.getAll(query, {
                        onsuccess: ({target: {result}}) => {
                            console.log("getting...1", result)
                            resolve(result.map(val => ({...clazz(), ...val})))
                        }
                    });
                }
            } catch (e) {
                reject(e)
            }

        }))
    }

    async load(clazz) {
        return this.get(clazz);
    }
}