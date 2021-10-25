import {Field, FieldList, FormVariable, Pdf} from "../model/types";
import {IDBRepository, StoreConfig} from "client-persistence";

StoreConfig.NAME_DB_DEFAULT = "pdf-form-db";
StoreConfig.getInstance().add([
    {
        store: Pdf.name,
        storeConfig: { autoIncrement: false }
    },
    {
        store: FormVariable.name,
        storeConfig: { autoIncrement: false }
    },
    {
        store: Field.name,
        storeConfig: {
            autoIncrement: false,
            keyPath: ["id", "fieldListId"],
            indices: [{name: "fieldListId"}, {name: "name"}]
        }
    },
    {
        store: FieldList.name,
        storeConfig: {
            autoIncrement: false,
            indices: [{name: "pdfId"}]
        }
    }
])

const repositories = {}
export function getRepository(jsObject) {
    let repoName = jsObject.name;
    if(!Object.keys(repositories).includes(repoName))
        repositories[repoName] = new IDBRepository(repoName);

    return repositories[repoName];
}
export function getRepositoryByClass(clazz) {
    const name = clazz.constructor.name;
    if(!Object.keys(repositories).includes(name))
        repositories[name] = new IDBRepository(clazz);

    return repositories[name];
}