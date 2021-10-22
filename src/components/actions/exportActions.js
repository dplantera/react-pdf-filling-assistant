import {ClientDownload} from "../../utils/ClientDownload";
import {FieldTypes} from "../../model/types";

const downloadClient = new ClientDownload();

// $[ '$!att.var' == '$!test', $var1, $var2 ]
const exportOptions = {
    serialization: {
        applyFixes: true,
        multiFieldExport: false,
        csvRules: [
            {
                name: "no double quotes in rows",
                type: "row",
                validate: (row) => !row.includes("\""),
                fix: (row) => row.replaceAll("\"", '\'')
            }
        ],
        fieldRules: [
            {
                name: "no multiline values",
                type: 'value',
                validate: (value) => /\r?\n|\r/g.test(value),
                fix: (value) => value.replaceAll(/\r?\n|\r/g, '')
            },
            {
                name: "group fields in single field",
                type: FieldTypes.RADIO.name,
                template: (groupFieldValues) => `$[${groupFieldValues.map(field => field || 'false').join(",")}]`
            }
        ]
    }

}

const getVariable = (field, variables) => variables.find(v => v.id === field.variable);

function applyRules(value, type, ruleSet, applyFixes) {
    const rules = ruleSet?.filter(rule => rule?.type === "all" || rule?.type === type)
    let validValue = value;
    if(!validValue) return "";
    rules.forEach(rule => {
        const isValidationRule = rule.validate !== undefined || rule.fix;
        if (isValidationRule && !rule?.validate?.(validValue)) {
            applyFixes? console.debug("fixing: " + rule.name, {validValue}) : console.error(rule.name, {value, rule});
            validValue = applyFixes && rule.fix ? rule.fix(validValue) : validValue;
        }
        if(rule.template) {
            console.debug("applying template: " + rule.name);
            validValue = rule.template(validValue);
        }
    })
    return validValue;
}

const applyFieldRules = (val, type) => applyRules(val, type, exportOptions.serialization.fieldRules, exportOptions.serialization.applyFixes);

function applyRadioRules(field, variables, fields) {
    let shouldExportAsSingleField = !exportOptions.serialization.multiFieldExport;
    const hasFieldChildren = field?.groupInfo?.children?.length > 0;
    if(shouldExportAsSingleField && !hasFieldChildren)
        return null;

    const groupField = {...field};
    const groupChildren = field.groupInfo.children.map(childId => fields.find( child => child.id === childId));

    const getVal = (_field) => {
        console.debug({_field})
        return _field.variable ? getVariable(_field, variables)?.value ?? "" : _field.value || ""
    };

    if(shouldExportAsSingleField) {
        console.log({groupField, groupChildren})
        let groupValues = groupChildren.map(child => getVal(child));
        groupField.value = applyFieldRules(groupValues, field.type.name);
        groupField.type = FieldTypes.TEXT;
        return applyFieldRulesDefault(groupField, variables, fields)
    }
    console.groupEnd();
    return [field.name, getVal(field), ...groupChildren.map(child => [child.name, getVal(child) ])]
}

function applyFieldRulesDefault (field, variables, fields) {
    let value = field.variable ? getVariable(field, variables)?.value ?? "" : field.value || "";
    value = applyFieldRules(value, "value");
    const fieldName = applyFieldRules(field.name, field.type?.name);
    const fieldDesc = applyFieldRules(field.description, field.type?.name);
    return [fieldName, value, fieldDesc]
}

export function exportFieldListAsCsv(fieldList, variables, fields) {
    console.group("exportFieldListAsCsv")
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        switch (field.type.name) {
            case FieldTypes.RADIO.name:
                return applyRadioRules(field, variables, fields);
            default:
                return applyFieldRulesDefault(field, variables, fields);
        }
    })
    const rowsValidated = rows.filter(row => row != null).map(row => row.map(cell => cell? applyRules(cell, "row", exportOptions.serialization.csvRules, exportOptions.serialization.applyFixes): cell));
    downloadClient.forCsv
        .changeSettings({useBOM: true})
        .download(rowsValidated, fieldList.name);
    console.groupEnd()
}

