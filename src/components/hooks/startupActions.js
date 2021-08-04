import {Field, FormVariable, Pdf} from "../../model/types";
import {ClientUpload} from "../../utils/ClientUpload";
import {getRepository} from "../../utils/ClientStorage";

const clientUpload = new ClientUpload();

const pdfRepo = getRepository(Pdf);
const fieldRepo = getRepository(Field);
const formVariableRepo = getRepository(FormVariable);

async function loadFormFieldsFromDB(selectedList) {
    return new Promise(async resolve => {
        try {
            // get fields by id [rawFieldName, fieldListId]
            if (!selectedList?.pdfId) {
                console.warn("Startup.handleReloadPdf: ...no field list found: ", {selectedList})
                resolve([]);
            }
            const fieldsFromDb = await fieldRepo.getByIndex({fieldListId: selectedList.id})
            resolve(fieldsFromDb);
        } catch (err) {
            console.error("Startup.handleReloadPdf^failed loading fields", err)
            resolve([]);
        }
    })
}

export async function retrieveInitialFormFields({selectedList, fieldsRaw}) {
    console.debug("Startup.retrieveInitialFormFields")
    return new Promise(async resolve => {
        const fieldsFromDb = await loadFormFieldsFromDB(selectedList)

        const mergedFields = fieldsRaw.map(fieldRaw => {
            const fieldDomain = fieldsFromDb.find(fieldDb => fieldDb.name === fieldRaw.name);
            let isNewField = !fieldRaw.fieldListId && !fieldDomain;
            if (isNewField)
                return {...fieldRaw, fieldListId: selectedList.id}

            delete fieldDomain.refPdf
            delete fieldDomain.location
            return {...fieldRaw, ...fieldDomain};
        })
        console.debug("Startup.handleReloadPdf: ", {fieldsFromDb, fieldsRaw, mergedFields})
        // update fields with mergedFields

        fieldRepo.updateAll(mergedFields)
            .then((res) => console.debug("StartupAction: done persist mergedFields", {res}) )
            .catch(error => console.error("StartupAction: failed persist mergedFields", {error}))
        resolve(mergedFields);
    })
}

export async function retrieveInitialPdfs() {
    return new Promise(async resolve => {
        const loadDefault = () => {
            return new Promise(async resolve => {
                const [data, fileName] = await clientUpload.forStaticFile.uploadAsUint8('/files/pdf-form-assistant_example.pdf')
                console.info("Startup.initializePdf: loading default pdf ", fileName);
                resolve(Pdf(fileName, data));
            })
        }
        try {
            const pdfs = await pdfRepo.getAll();
            const hasStoredPdfs = pdfs?.length > 0;
            console.debug(`Startup.initializePdf: loading from ${hasStoredPdfs ? 'storage' : 'default'}`)
            const initialPdf = !hasStoredPdfs ? [await loadDefault()] : pdfs;
            resolve(initialPdf);
        } catch (error) {
            console.error(error)
            resolve([await loadDefault()])
        }
    })
}

export async function retrieveInitialFormVariables() {
    const loadVariablesFromFile = async () => {
        return new Promise(async (resolve) => {
            const data = await clientUpload.forStaticFile.uploadAsJson("/variables.json")
            const variablesFromDB = Object.keys(data).reduce((acc, key) => {
                const entityType = data[key].type;
                const attributes = data[key].attributes;

                const vars = Object.keys(attributes)
                    .map(key => {
                        return FormVariable(
                            entityType.name + " " + key,
                            entityType.accessKey + "." + attributes[key].name,
                            attributes[key].description,
                            attributes[key].exampleValue
                        )
                    })
                return [...acc, ...vars];
            }, []);
            resolve(variablesFromDB)
        })
    }
    const loadVariablesFromDb = async () => {
        return new Promise(resolve => {
            const vars = formVariableRepo.getAll();
            resolve(vars);
        })
    }
    const loadVariables = async () => {
        return new Promise(async resolve => {
            const variablesFromFile = await loadVariablesFromFile();
            const variablesFromDb = await loadVariablesFromDb();
            const idsFromFile = variablesFromFile.map(varFile => varFile.id);
            const onlyInDb = variablesFromDb.reduce((acc, varDb) => {
                if (!idsFromFile.includes(varDb.id))
                    acc.push(varDb);
                return acc;
            }, [])
            const mergedFromFileAndDB = variablesFromFile.reduce((acc, varFile) => {
                const varDb = variablesFromDb.find(varDb => varFile.id === varDb.id);
                if (varDb)
                    acc.push({...varFile, ...varDb})
                else
                    acc.push(varFile);

                return acc;
            }, []);
            console.debug("Startup.loadVariables: done.")
            resolve([...mergedFromFileAndDB, ...onlyInDb]);
        })
    }
    return await loadVariables();
}
