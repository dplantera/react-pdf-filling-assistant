import {FieldTypes, FieldValueTypes} from "../../../model/types";
import {applyRules, RuleTypes} from "../ruleActions";

let exportSettings = {};

const applyFieldRules = (val, type, flags) => applyRules(val, type, exportSettings.fieldRules, flags);
const applyCsvRules = (val, type, flags) => applyRules(val, type, exportSettings.csvRules, flags);
const getVariable = (field, variables) => variables.find(v => v.id === field.variable);
const getValue = (field, variables) => field.variable ? getVariable(field, variables)?.value ?? "" : field.value || "";

export function transformToCsvRows(fieldList, variables, fields, settings) {
    exportSettings = settings.serialization;
    const flagsExport = {
        applyFixes: exportSettings.applyFixes,
    }
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        const flagsField = {
            ...flagsExport,
            isConstant: field.valueType.name === FieldValueTypes.CONST.name,
            isScript: field.valueType.name === FieldValueTypes.SCRIPT.name
        };
        switch (field.type.name) {
            case RuleTypes.RADIO.name:
                return applyCsvRulesRadioBtn(field, variables, fields, flagsField);
            default:
                return applyCsvRulesDefault(field, variables, flagsField);
        }
    })
    return rows.filter(row => row != null).map(row => row.map(cell => cell ? applyCsvRules(cell, RuleTypes.CELL, flagsExport) : cell))
}

function applyCsvRulesRadioBtn(field, variables, fields, fieldFlags) {
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

            groupField.value = applyFieldRules(groupValues, field.type, fieldFlags);
            groupField.type = FieldTypes.TEXT;
            return applyCsvRulesDefault(groupField, variables, fieldFlags)
        }
        return [field.name, getValue(field, variables), ...groupChildren.map(child => [child.name, getValue(child, variables)])]
    } catch (error) {
        console.error("csv rules failed: ", {groupField, error})
    }
}

function applyCsvRulesDefault(field, variables, fieldFlags) {
    let value = getValue(field, variables);
    value = applyFieldRules(value, RuleTypes.FIELD_VALUE, fieldFlags);
    const fieldName = applyFieldRules(field.name, RuleTypes.FIELD_NAME, fieldFlags);
    const fieldDesc = applyFieldRules(field.description, RuleTypes.FIELD_DESCRIPTION, fieldFlags);
    return [fieldName, value, fieldDesc]
}