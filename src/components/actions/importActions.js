import {addVariableToField} from "./mutateActions";
import {FormVariable} from "../../model/types";


export function importFieldsAndVarsFromCsv(text, fields, variables) {
    // field candidate must exist in current FieldList. Before changing this we need to support multiple FieldLists
    const fieldCandidates = parseFieldsFromCsv(text, fields);
    return evaluateFieldCandidates(fields, variables, fieldCandidates)
}

export function evaluateFieldCandidates(fields, variables, fieldCandidates) {
    console.debug("Import.evaluateFieldCandidates: ", fieldCandidates);
    const result = {
        newFields: [], ignoredField: [], newVariables: [], error: [],
    }
    fieldCandidates.forEach(fieldCandidate => {
        const existingField = getExistingField(fields, fieldCandidate);
        if (!existingField) {
            console.warn("Import.evaluateFieldCandidates: no existingField (did you load the correct pdf?)");
            result.error.push(fieldCandidate);
            return;
        }

        const isValueMatching = existingField && existingField.value === fieldCandidate.value;
        if (isValueMatching) {
            result.ignoredField.push(existingField);
            return;
        }

        if (!isValueMatching) {
            fieldCandidate.id = null;
            let newField = {...existingField, ...fieldCandidate}

            let existingVariable = variables.find(variable => variable.id === existingField.variable || variable.value === newField.value);
            let needsNewVariable = !existingVariable || existingVariable.id !== existingField.variable;
            if (needsNewVariable) {
                let newVariable = FormVariable(newField.value, newField.value, newField.description, newField.example);

                if (existingVariable?.id === newVariable.id)
                    console.debug("Import.evaluateFieldCandidates: variable exists ", {existingVariable, newVariable})

                result.newVariables.push(newVariable)
                const {updatedField} = addVariableToField(fields, existingField, newVariable);
                newField = {...newField, ...updatedField};

            }
            result.newFields.push(newField);
        }
    })
    if (result.error.length > 0)
        console.error(`Import.evaluateCandidates: loading fields - ${result.error.length} errors`)
    if (fieldCandidates.length === result.ignoredField.length)
        console.info("Import.evaluateFieldCandidates: all fields ignored", result);
    if (result.newFields.length <= 0 && result.error.length <= 0)
        console.info("Import.evaluateFieldCandidates: fields up-to-date", result);

    console.debug("Import.evaluateFieldCandidates: done: ", result);
    return result
}

function parseFieldsFromCsv(text, fields) {
    const rows = text.split("\n");
    return rows.reduce((result, row) => {
        const [name, value, desc, example] = row.split(";");

        const isEmpty = (str) => {
            return str === null || str?.length <= 0;
        }

        if (isEmpty(name) || isEmpty(value))
            return result;

        const idxExistingField = fields.findIndex(field => field.name === name);
        if (idxExistingField < 0)
            return result;

        const newField = {...fields[idxExistingField], value};

        if (desc)
            newField.description = desc;
        if (example)
            newField.example = example;

        result.push(newField);
        return result;
    }, [])
}

function getExistingField(fields, fieldCandidate) {
    const idxExistingField = fields.findIndex(field => field.id === fieldCandidate.id);
    if (idxExistingField < 0)
        return null;
    return fields[idxExistingField];
}