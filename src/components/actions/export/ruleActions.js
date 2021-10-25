import {FieldTypes} from "../../../model/types";

const RuleTypesCSV = {
    CELL: {name: "cell"}
}

export const RuleTypes = {
    ...FieldTypes,
    ...RuleTypesCSV,
    FIELD_VALUE: {name: "value"},
    FIELD_DESCRIPTION: {name: "description"},
    FIELD_NAME: {name: "name"},
}

export function areEqualRuleTypes(typeA, typeB) {
    if (!typeA || !typeB) return false;
    if (typeA === typeB) return true;
    return typeA.name && typeA.name === typeB.name;
}

export function applyRules(value, type, ruleSet, applyFixes) {
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