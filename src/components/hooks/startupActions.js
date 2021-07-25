import {Field, FieldList, FormVariable, Pdf} from "../../model/types";
import {ClientUpload} from "../../utils/ClientUpload";
import {getRepository} from "../../utils/ClientStorage";

const clientUpload = new ClientUpload();

const pdfRepo = getRepository(Pdf);
const fieldListRepo = getRepository(FieldList);
const fieldRepo = getRepository(Field);
const formVariableRepo = getRepository(FormVariable);

export function initializePdfFormFields({pdfClient, switchFieldList, updateFields}) {
    console.debug("Startup.initializePdfFormFields")
    pdfClient.onReload = async () => {
        console.debug("Startup.initializePdfFormFields: pdfClient.onReload")
        const pdfs = await pdfRepo.getAll();
        const currentPdf = pdfs[0];

        const loadFromDb = async () => {
            console.debug("Startup.pdfClient.onReload: loadFromDb")
            return new Promise(async resolve => {
                try {
                    // get fields by id [rawFieldName, fieldListId]
                    const selectedList = await switchFieldList(currentPdf)
                    if (!selectedList?.pdfId) {
                        console.error("Startup.pdfClient.onReload: ...no field list found: ", {selectedList})
                        resolve(false);
                    }

                    const fieldsFromDb = await fieldRepo.getByIndex( {fieldListId: selectedList.id})

                    // merge fields by name with dbFields
                    const fieldsRaw = await pdfClient.getFormFields();
                    const mergedFields = fieldsRaw.map(fieldRaw => {
                        const fieldDomain = fieldsFromDb.find(fieldDb => fieldDb.name === fieldRaw.name);
                        if (!fieldRaw.fieldListId && !fieldDomain)
                            return {...fieldRaw, fieldListId: selectedList.id}
                        return {...fieldRaw, ...fieldDomain};
                    })
                    // update fields with mergedFields
                    updateFields(mergedFields);
                    pdfClient.isReady = true;
                    resolve(true);
                } catch (err) {
                    console.error("Startup.failed loading fields from db", err)
                    resolve(false);
                }
            })
        }

        const initField = async () => {
            console.debug("Startup.pdfClient.onReload: initializePdfFormFields: initField")
            // todo: handle accordingly when supporting multiple pdfs
            await fieldListRepo.deleteAll();
            await fieldRepo.deleteAll();

            const fieldList = await switchFieldList(currentPdf);
            const fieldsRaw = await pdfClient.getFormFields();
            const fieldsDomain = fieldsRaw.map(fieldRaw => ({...fieldRaw, ...{fieldListId: fieldList.id}}));

            updateFields(fieldsDomain);
            pdfClient.isReady = true;
        }
        const isLoadedFromDB = await loadFromDb();
        if (!isLoadedFromDB) await initField();
    }
}

export function initializePdf(selectPdf) {
    const loadInitialPdf = async () => {
        const loadDefault = () => {
            clientUpload.forStaticFile
                .uploadAsUint8('/files/pdf-form-assistant_example.pdf')
                .then(([data, fileName]) => {
                    console.info("Startup.initializePdf: loading default pdf ", fileName);
                    selectPdf(Pdf(fileName, data));
                })
        }
        try {
            const pdfs = await pdfRepo.getAll();
            if (!pdfs[0]?.binary)
                loadDefault();
            else{
                console.debug("Startup.initializePdf: loaded from storage")
                selectPdf(pdfs[0]);
            }
        } catch (error) {
            console.error(error)
            loadDefault();
        }
    }
    loadInitialPdf()
        .then(() => console.debug("Startup.initializePdf: done"))
}

export function initializeFormVariables(updateVariables) {
    const loadVariablesFromFile = async () => {
        return new Promise((resolve => {
            clientUpload.forStaticFile.uploadAsJson("/variables.json")
                .then((data) => {
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
        }))
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
    loadVariables().then(updateVariables)
}
