import {FormVariable} from "./types";


export function importFieldsFromCsv(text, fields, variables, addVariableToField) {
    const rows = text.split("\n");

    // field candidate must exist in current FieldList. Before changing this we need to support multiple FieldLists
    const fieldCandidates = rows.reduce((result, row) => {
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

    const newFields = [], ignoredField = [], error = [], newVariables = [];
    console.debug("FormListControl: evaluating candidates: ", fieldCandidates);
    fieldCandidates.forEach(fieldCandidate => {
        const idxExistingField = fields.findIndex(field => field.id === fieldCandidate.id);
        if (idxExistingField < 0) {
            console.warn("FormListControl: no existingField (did you load the correct pdf?)");
            error.push(fieldCandidate);
            return;
        }

        const existingField = fields[idxExistingField];
        const isValueMatching = existingField && existingField.value === fieldCandidate.value;
        if (isValueMatching) {
            ignoredField.push(existingField);
            return;
        }

        if (!isValueMatching) {
            fieldCandidate.id = null;
            newFields.push(fieldCandidate);

            let existingVariable = variables.find(variable => variable.id === existingField.variable || variable.value === fieldCandidate.value);

            let needsNewVariable = !existingVariable || existingVariable.id !== existingField.variable;
            if (needsNewVariable) {
                let newVariable = FormVariable(fieldCandidate.value, fieldCandidate.value, fieldCandidate.description, fieldCandidate.example);

                if (existingVariable?.id === newVariable.id)
                    console.debug("FormListControl: variable exists ", {existingVariable, newVariable})

                newVariables.push(newVariable)
                addVariableToField(newVariable, existingField).then(() =>
                    console.log("FormListControl: addVariableToField", {existingField, newVariable})
                )
            }
        }
    })
    if (error.length > 0)
        console.error("FormListControl: error loading fields", {error})

    let result = {newFields, ignoredField, newVariables};
    if (fieldCandidates.length === ignoredField.length) {
        console.info("FormListControl: all fields ignored", result);
        return;
    }

    if (newFields.length <= 0 && error.length <= 0) {
        console.info("FormListControl: fields up-to-date", result);
        return;
    }

    console.debug("FormListControl: updating fields and variables", result)
    return {
        variables: [...variables, ...newVariables],
        fields
    }
}