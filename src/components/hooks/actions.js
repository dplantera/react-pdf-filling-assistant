import {FieldList, FormVariable} from "../../model/types";

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

export function initializeFormVariables(updateVariables) {
    fetch("/variables.json")
        .then(res => res.json())
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

            updateVariables(variablesFromDB)
        })
}