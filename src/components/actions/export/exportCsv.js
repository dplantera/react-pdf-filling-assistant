import {FieldTypes} from "../../../model/types";
import {applyRules, RuleTypes} from "./ruleActions";

let exportSettings = {};

const applyFieldRules = (val, type) => applyRules(val, type, exportSettings.fieldRules, exportSettings.applyFixes);
const applyCsvRules = (val, type) => applyRules(val, type, exportSettings.csvRules, exportSettings.applyFixes);
const getVariable = (field, variables) => variables.find(v => v.id === field.variable);
const getValue = (field, variables) => field.variable ? getVariable(field, variables)?.value ?? "" : field.value || "";

export function transformToCsvRows(fieldList, variables, fields, settings) {
    exportSettings = settings.serialization;
    console.group("exportFieldListAsCsv")
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        switch (field.type.name) {
            case RuleTypes.RADIO.name:
                return applyCsvRulesRadioBtn(field, variables, fields);
            default:
                return applyCsvRulesDefault(field, variables);
        }
    })
    const rowsValidated = rows.filter(row => row != null).map(row => row.map(cell => cell ? applyCsvRules(cell, RuleTypes.CELL) : cell));
    console.groupEnd()
    return rowsValidated
}

function applyCsvRulesRadioBtn(field, variables, fields) {
    console.group("applyCsvRulesRadioBtn");
    let shouldExportAsSingleField = !exportSettings.multiFieldExport;
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