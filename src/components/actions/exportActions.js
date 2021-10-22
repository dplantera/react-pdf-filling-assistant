import {ClientDownload} from "../../utils/ClientDownload";

const downloadClient = new ClientDownload();


export function exportFieldListAsCsv (fieldList, variables, fields) {
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        const getVariable = (field) => variables.find(v => v.id === field.variable);
        let value = field.variable ? getVariable(field)?.value ?? "" : field.value || "";
        value = value.replace(/\r?\n|\r/g, '');
        return [field.name, value, field.description]
    })
    downloadClient.forCsv
        .changeSettings({useBOM: true})
        .download(rows, fieldList.name);
}