import {FieldList, FormVariable, Pdf} from "../../model/types";
import {ClientUpload} from "../../utils/ClientUpload";
import {ClientStorage} from "../../utils/ClientStorage";

export const actionTypes = {
    addAll: "ADD_ALL",
    addOne: "ADD_ONE",
    updateAll: "UPDATE_ALL",
    updateOne: "UPDATE_ONE",
    addVariableToField: "ADD_VARIABLE_TO_FIELD",
}

export const noop = () => {
};

export const actions = (context) => {
    return {
        addAll: (payload) => {
            return {type: actionTypes.addAll, payload, context}
        },
        addOne: (payload) => {
            return {type: actionTypes.addOne, payload, context}
        },
        updateAll: (payload) => {
            return {type: actionTypes.updateAll, payload, context}
        },
        updateOne: (payload) => {
            return {type: actionTypes.updateOne, payload, context}
        },
        addVariableToField: (payload) => {
            return {type: actionTypes.addVariableToField, payload, context}
        },
    }
}

const clientUpload = new ClientUpload();
const storage = ClientStorage.instance;

export function initializePdfFormFields({pdfClient, updateFieldLists, updateFields}) {
    pdfClient.onReload = async () => {
        console.log("pdf initialised...");
        const fields = await pdfClient.getFormFields();
        const fieldList = FieldList(pdfClient.getPdfName(), fields);
        fieldList.isSelected = true;
        updateFields(fields);
        updateFieldLists([fieldList]);
        pdfClient.isReady = true;
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
            const pdfs = await storage.get(Pdf, {keys: [1]});
            if (!pdfs[0].binary)
                loadDefault();
            else
                updatePdfs(pdfs);
        } catch (error) {
            console.log(error)
            loadDefault();
        }
    }
    loadInitialPdf().then(() => console.log("initial pdf loaded..."))
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
            const vars = storage.get(FormVariable);
            resolve(vars);
        })
    }
    const loadVariables = async () => {
        return new Promise(async resolve => {
            const variablesFromFile = await loadVariablesFromFile();
            const variablesFromDb = await loadVariablesFromDb();
            const idsFromFile = variablesFromFile.map(varFile => varFile.id);
            const onlyInDb = variablesFromDb.reduce((acc, varDb) => {
                if(!idsFromFile.includes(varDb.id))
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

            resolve([...mergedFromFileAndDB, ...onlyInDb]);
        })
    }
    loadVariables().then(updateVariables)
}