import {ClientDownload} from "../../utils/ClientDownload";
import {FieldTypes} from "../../model/types";

const downloadClient = new ClientDownload();

const RuleTypesCSV = {
    CELL: {name: "cell"}
}

const RuleTypes = {
    ...FieldTypes,
    ...RuleTypesCSV,
    FIELD_VALUE: {name: "value"},
    FIELD_DESCRIPTION: {name: "description"},
    FIELD_NAME: {name: "name"},
}

// $[ '$!att.var' == '$!test', $var1, $var2 ]
const exportOptions = {
    serialization: {
        applyFixes: true,
        multiFieldExport: false,
        csvRules: [
            {
                name: "no double quotes in values",
                type: RuleTypesCSV.CELL,
                validate: (row) => !row.includes("\""),
                fix: (row) => row.replaceAll("\"", '\'')
            },
            {
                name: "no multiline values",
                type: RuleTypesCSV.CELL,
                validate: (value) => /\r?\n|\r/g.test(value),
                fix: (value) => value.replaceAll(/\r?\n|\r/g, '')
            }
        ],
        fieldRules: [
            {
                name: "group fields in single field",
                type: RuleTypes.RADIO,
                template: (groupFieldValues) => `$[${groupFieldValues.map(field => field || 'false').join(",")}]`
            }
        ]
    }
}

function areEqualRuleTypes(typeA, typeB) {
    if (!typeA || !typeB) return false;
    if (typeA === typeB) return true;
    return typeA.name && typeA.name === typeB.name;
}

function applyRules(value, type, ruleSet, applyFixes) {
    const rules = ruleSet?.filter(rule => areEqualRuleTypes(rule?.type, type));
    let validValue = value;
    if (!validValue) return "";
    rules.forEach(rule => {
        const isValidationRule = rule.validate !== undefined || rule.fix;
        if (isValidationRule && !rule?.validate?.(validValue)) {
            applyFixes ? console.debug("fixing: " + rule.name, {validValue}) : console.error(rule.name, {value, rule});
            validValue = applyFixes && rule.fix ? rule.fix(validValue) : validValue;
        }
        if (rule.template) {
            console.debug("applying template: " + rule.name);
            validValue = rule.template(validValue);
        }
    })
    return validValue;
}

const applyFieldRules = (val, type) => applyRules(val, type, exportOptions.serialization.fieldRules, exportOptions.serialization.applyFixes);
const applyCsvRules = (val, type) => applyRules(val, type, exportOptions.serialization.csvRules, exportOptions.serialization.applyFixes);
const getVariable = (field, variables) => variables.find(v => v.id === field.variable);
const getValue = (field, variables) => field.variable ? getVariable(field, variables)?.value ?? "" : field.value || "";

export function exportFieldListAsCsv(fieldList, variables, fields) {
    console.group("exportFieldListAsCsv")
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        switch (field.type.name) {
            case RuleTypes.RADIO.name:
                return applyCsvRulesRadioBtn(field, variables, fields);
            default:
                return applyCsvRulesDefault(field, variables, fields);
        }
    })
    const rowsValidated = rows.filter(row => row != null).map(row => row.map(cell => cell ? applyCsvRules(cell, RuleTypesCSV.CELL) : cell));
    downloadClient.forCsv
        .changeSettings({useBOM: true})
        .download(rowsValidated, fieldList.name);
    console.groupEnd()
}

function applyCsvRulesRadioBtn(field, variables, fields) {
    console.group("applyCsvRulesRadioBtn");
    let shouldExportAsSingleField = !exportOptions.serialization.multiFieldExport;
    const hasFieldChildren = field?.groupInfo?.children?.length > 0;
    if (shouldExportAsSingleField && !hasFieldChildren)
        return null;

    const groupField = {...field};
    const groupChildren = field.groupInfo.children.map(childId => fields.find(child => child.id === childId));
    try {
        if (shouldExportAsSingleField) {
            console.log({groupField, groupChildren})
            let groupValues = groupChildren.map(child => getValue(child, variables));
            groupField.value = applyFieldRules(groupValues, field.type);
            groupField.type = FieldTypes.TEXT;
            console.groupEnd();
            return applyCsvRulesDefault(groupField, variables)
        }
        console.groupEnd();
        return [field.name, getValue(field, variables), ...groupChildren.map(child => [child.name, getValue(child, variables)])]
    } catch (error) {
        console.error("csv rules failed: ", {groupField, error})
    }
}

function applyCsvRulesDefault(field, variables) {
    console.group("applyCsvRulesRadioBtn");
    let value = getValue(field, variables);
    value = applyFieldRules(value, RuleTypes.FIELD_VALUE);
    const fieldName = applyFieldRules(field.name, RuleTypes.FIELD_NAME);
    const fieldDesc = applyFieldRules(field.description, RuleTypes.FIELD_DESCRIPTION);
    console.groupEnd();
    return [fieldName, value, fieldDesc]
}

