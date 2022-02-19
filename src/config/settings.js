import {RuleTypes} from "../components/actions/ruleActions";
import {getRepositoryByClass} from "../utils/ClientStorage";
import {Settings} from "../model/types";

const settingsRepo = getRepositoryByClass(Settings);

const defaultSettings = {
    validation: {
        fields: {
            checkbox: {
                validExportValues: ["yes", "no", "on", "off", "0", "1"],
            },
            radio: {
                validExportValues: ["on", "off", "0", "1"],
            },
        },
    },
    deserialization: {
        multiFieldImport: false,
        csvRules: [
            {
                name: "parse constant fields",
                type: RuleTypes.FIELD,
                transform: (field, flags) => {
                    if (!field.value?.startsWith("/"))
                        return field;
                    field.valueType = {
                        name: "constant",
                    };
                    field.value = field.value.substring(1);
                    return field;
                },
            },
            {
                name: "parse script fields",
                type: RuleTypes.FIELD,
                transform: (field, flags) => {
                    if (!field.value?.startsWith("#"))
                        return field;
                    field.valueType = {
                        name: "script",
                    };
                    field.value = field.value.substring(1);
                    return field;
                },
            },
            {
                name: "parse radio btn values",
                type: RuleTypes.RADIO,
                transform: (value, flags) => {
                    if (!value)
                        return value;

                    if (typeof value !== "string") {
                        console.warn("expected 'string' but got: ", {value})
                        return value;
                    }

                    if (!value?.trim().startsWith("[")) {
                        console.warn("expected '[' at value start")
                        return value;
                    }

                    if (!value?.trim().endsWith("]")) {
                        console.warn("expected ']' at value end")
                        return value;
                    }

                    const valueWithoutFormatting = value.trim().substring(1, value.trim().length - 1);
                    const values = valueWithoutFormatting.split(",");

                    return values;
                },
            },
        ],
    },
    serialization: {
        applyFixes: true,
        multiFieldExport: false,
        csvRules: [
            {
                name: "no double quotes in values",
                type: RuleTypes.CELL,
                validate: (row) => !row.includes("\""),
                fix: (row) => row.replaceAll("\"", '\''),
            },
            {
                name: "no multiline values",
                type: RuleTypes.CELL,
                validate: (value) => !/\r?\n|\r/g.test(value),
                fix: (value) => value.replaceAll(/\r?\n|\r/g, ''),
            },
        ],
        fieldRules: [
            {
                name: "group fields in single field",
                type: RuleTypes.RADIO,
                template: (groupFieldValues) => `$[${groupFieldValues.map(field => field || 'false').join(",")}]`,
            },
            {
                name: "prefix constant field values",
                type: RuleTypes.FIELD_VALUE,
                template: (value, flags) => {
                    if (!flags.isConstant)
                        return value;
                    if (value?.startsWith("/"))
                        return value
                    return `/${value}`
                },
            },
            {
                name: "prefix script field values",
                type: RuleTypes.FIELD_VALUE,
                template: (value, flags) => {
                    if (!flags.isScript)
                        return value;
                    if (value?.startsWith("#"))
                        return value
                    return `#${value}`
                },
            },
        ],
    },
}

export async function loadSettings() {
    const existingSettings = await settingsRepo.getAll();
    let settings = {};
    if (existingSettings?.length <= 0) {
        console.debug("no settings found: creating new")
        let initialSettings = new Settings(defaultSettings);
        settings = await settingsRepo.create(initialSettings);
    } else {
        console.debug("settings found")
        settings = existingSettings[0];
    }
    return settings;
}

export async function addSettings(newSettings) {
    const settings = await loadSettings();
    settings.addJson(newSettings);
    await settingsRepo.update(settings)
    return settings;
}