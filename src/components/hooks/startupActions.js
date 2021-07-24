import {Field, FieldList, FormVariable, Pdf} from "../../model/types";
import {ClientUpload} from "../../utils/ClientUpload";
import {getRepository} from "../../utils/ClientStorage";

const clientUpload = new ClientUpload();

const pdfRepo = getRepository(Pdf);
const fieldListRepo = getRepository(FieldList);
const fieldRepo = getRepository(Field);
const formVariableRepo = getRepository(FormVariable);

export function initializePdfFormFields({pdfClient, updateFieldLists, updateFields}) {
    pdfClient.onReload = async () => {
        const loadFromDb = async () => {
            return new Promise(async resolve => {
                try {
                    console.debug("pdf initialised...");
                    // get current pdf id
                    // const pdfs = await storage.get(Pdf);
                    const pdfs = await pdfRepo.getAll();
                    const currentPdf = pdfs[0];
                    // get fieldlist by current pdf id
                    const fieldLists = await fieldListRepo.getByIndex({pdfId: currentPdf.id});
                    let selectedList = fieldLists.length > 0 ? fieldLists[0]: FieldList(currentPdf.name, currentPdf.id);
                    if (fieldLists.length > 1)
                        selectedList = fieldLists.find(list => list.isSelected);
                    else if (!selectedList?.isSelected)
                        selectedList.isSelected = true;

                    if (!selectedList?.pdfId) {
                        console.error("...no field list found: ", {selectedList})
                        resolve(false);
                    }
                    // get fields by id [rawFieldName, fieldListId]
                    const fieldsFromDb = await fieldRepo.getByIndex( {fieldListId: selectedList.id})
                    console.debug("...loaded fields DB: ", {
                        fields: fieldsFromDb,
                        pdfs,
                        currentPdf,
                        fieldLists,
                        selectedList
                    })
                    // merge fields by name with dbFields
                    const fieldsRaw = await pdfClient.getFormFields();
                    const mergedFields = fieldsRaw.map(fieldRaw => {
                        const fieldDomain = fieldsFromDb.find(fieldDb => fieldDb.name === fieldRaw.name);
                        if (!fieldRaw.fieldListId && !fieldDomain)
                            return {...fieldRaw, fieldListId: selectedList.id}
                        return {...fieldRaw, ...fieldDomain};
                    })
                    // update fields with mergedFields
                    updateFieldLists([selectedList])
                    updateFields(mergedFields);
                    pdfClient.isReady = true;
                    resolve(true);
                } catch (err) {
                    console.error("failed loading fields from db", err)
                    resolve(false);
                }
            })
        }

        const initField = async () => {
            console.debug("loading inital fields")
            const pdfs = await pdfRepo.getAll();
            const currentPdf = pdfs[0];

            // todo: handle accordingly when supporting multiple pdfs
            await fieldListRepo.deleteAll();
            await fieldRepo.deleteAll();

            const fieldList = FieldList(pdfClient.getPdfName(), currentPdf?.id);
            fieldList.isSelected = true;
            const fieldsRaw = await pdfClient.getFormFields();
            const fieldsDomain = fieldsRaw.map(fieldRaw => ({...fieldRaw, ...{fieldListId: fieldList.id}}));
            updateFieldLists([fieldList]);
            updateFields(fieldsDomain);
            pdfClient.isReady = true;
        }
        const isLoadedFromDB = await loadFromDb();
        if (!isLoadedFromDB) await initField();
    }
}

export function initializePdf(updatePdfs) {
    const loadInitialPdf = async () => {
        const loadDefault = () => {
            clientUpload.forStaticFile
                .uploadAsUint8('/files/form2.pdf')
                .then(([data, fileName]) => {
                    console.info("loading default pdf ", fileName);
                    updatePdfs([Pdf(fileName, data)]);
                })
        }
        try {
            const pdfs = await pdfRepo.getAll();
            if (!pdfs[0].binary)
                loadDefault();
            else{
                console.debug("PDF: loaded from storage")
                updatePdfs(pdfs);
            }
        } catch (error) {
            console.error(error)
            loadDefault();
        }
    }
    loadInitialPdf().then(() => console.debug("initial pdf loaded..."))
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
            console.debug("Variables loaded...")
            resolve([...mergedFromFileAndDB, ...onlyInDb]);
        })
    }
    loadVariables().then(updateVariables)
}
