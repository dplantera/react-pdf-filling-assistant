import {FieldTypes, FormVariable} from "../../../model/types";
import {addVariableToField} from "../mutateActions";
import {applyRules, RuleTypes} from "../ruleActions";

let importSettings = {};

export function importFieldsAndVars(text, fields, variables, selectedFieldList, settings) {
    // field candidate must exist in current FieldList. Before changing this we need to support multiple FieldLists
    importSettings = settings.deserialization;
    const flagsImport = {
        parseRadioChildInOwnField: !importSettings.multiFieldImport,
    }

    const fieldCandidates = parseFieldsFromCsv(text, fields, flagsImport);
    return evaluateFieldCandidates(fields, variables, fieldCandidates, selectedFieldList)
}


function evaluateFieldCandidate(result, existingField, fieldCandidate, selectedFieldList, fields, variables) {
    //todo: fix (multiple fieldlists workaround - unsupported)
    let fieldListIdForNewFields = selectedFieldList?.id ?? existingField.id;

    const isValueMatching = existingField && existingField.value === fieldCandidate.value;
    if (isValueMatching && existingField.id !== fieldListIdForNewFields) {
        result.updatedFields.push({...existingField, fieldListId: fieldListIdForNewFields});
        return;
    }

    if (isValueMatching) {
        result.ignoredField.push({...existingField});
        return;
    }

    if (!isValueMatching) {
        delete fieldCandidate.id;
        let newField = {...existingField, ...fieldCandidate}

        let existingVariable = variables.find(variable => variable.id === existingField.variable || variable.value === newField.value);
        let needsNewVariable = !existingVariable || existingVariable.id !== existingField.variable;
        if (needsNewVariable) {
            let newVariable = FormVariable(newField.value, newField.value, newField.description, newField.example);

            if (existingVariable?.id === newVariable.id)
                console.debug("Import.evaluateFieldCandidates: variable exists ", {existingVariable, newVariable})

            result.newVariables.push(newVariable)
            const {updatedField: newFieldWithVariable} = addVariableToField(fields, {...newField}, newVariable);
            console.debug({
                newFieldWithVariable,
                newField
            })
            newField = newFieldWithVariable;
        }
        const newFieldWithUpdatedFieldListId = {...newField, fieldListId: fieldListIdForNewFields};
        result.newFields.push(newFieldWithUpdatedFieldListId);
    }
}

export function evaluateFieldCandidates(fields, variables, fieldCandidates, selectedFieldList) {
    console.debug("Import.evaluateFieldCandidates: ", {fieldCandidates, selectedFieldList});
    const result = {
        newFields: [], updatedFields: [], ignoredField: [], newVariables: [], error: [],
    }
    fieldCandidates.forEach(fieldCandidate => {
        const existingField = getExistingField(fields, fieldCandidate);
        if (!existingField) {
            console.warn("Import.evaluateFieldCandidates: no existingField (did you load the correct pdf?)");
            result.error.push(fieldCandidate);
            return;
        }
        evaluateFieldCandidate(result, existingField, fieldCandidate, selectedFieldList, fields, variables);
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


function parseGroupField(result, groupField, fields, flags) {
    const children = groupField.groupInfo.children?.map(childId => fields.find(field => field.id === childId));
    const value = groupField.value;
    console.log("parseGroupField", {groupField, children, flags})

    if (!flags.parseRadioChildInOwnField)
        return;
    if (children?.length <= 0) {
        console.debug("parseGroupField: no children found.", {value, children});
        return;
    }

    const childValues = applyRules(value, RuleTypes.RADIO, importSettings.csvRules, flags);
    if (children.length !== childValues.length)
        console.warn("parseGroupField: mismatch number of group children", {children, childValues})
    children.forEach((child, idx) => {
        const childCandidate = {...child}
        childCandidate.value = childValues?.[idx]?.trim() ?? "";
        result.push(childCandidate);
    })

    console.debug("parseGroupField: done", {children, childValues, value})
}

export function parseFieldsFromCsv(text, fields, flags) {
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

        let existingField = fields[idxExistingField];

        const newField = {...existingField, value};

        if (desc)
            newField.description = desc;
        if (example)
            newField.example = example;

        const transformedField = applyRules(newField, RuleTypes.FIELD, importSettings.csvRules, flags);
        if (existingField.type.name === FieldTypes.RADIO.name && !existingField.groupInfo.parent)
            parseGroupField(result, transformedField, fields, flags)
        result.push(transformedField);
        return result;
    }, [])
}

function getExistingField(fields, fieldCandidate) {
    const idxExistingField = fields.findIndex(field => field.id === fieldCandidate.id);
    if (idxExistingField < 0)
        return null;
    return fields[idxExistingField];
}