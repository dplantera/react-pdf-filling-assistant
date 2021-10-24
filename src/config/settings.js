import {RuleTypes} from "../components/actions/export/ruleActions";
import {getRepositoryByClass} from "../utils/ClientStorage";
import {Settings} from "../model/types";

const settingsRepo = getRepositoryByClass(Settings);

// $[ '$!att.var' == '$!test', $var1, $var2 ]
const defaultSettings = {
    serialization: {
        applyFixes: true,
        multiFieldExport: false,
        csvRules: [
            {
                name: "no double quotes in values",
                type: RuleTypes.CELL,
                validate: (row) => !row.includes("\""),
                fix: (row) => row.replaceAll("\"", '\'')
            },
            {
                name: "no multiline values",
                type: RuleTypes.CELL,
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

export async function loadSettings() {
    const existingSettings = await settingsRepo.getAll();
    let settings = {};
    if (existingSettings?.length <= 0) {
        console.debug("no settings found: creating new")
        let initialSettings = new Settings(defaultSettings);
        console.log({json: initialSettings.getSettings()})
        settings = await settingsRepo.create(initialSettings);
    } else {
        console.debug("settings found: ", {existingSettings})
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