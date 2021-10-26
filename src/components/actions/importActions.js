import * as csvImport from "./import/importCsv";


export function importFieldsAndVarsFromCsv(text, fields, variables, selectedFieldList, settings) {
    return csvImport.importFieldsAndVars(text, fields, variables, selectedFieldList, settings)
}
