import {ClientDownload} from "../../utils/ClientDownload";
import {transformToCsvRows} from "./export/exportCsv";

const downloadClient = new ClientDownload();

export function exportFieldListAsCsv(fieldList, variables, fields, settings){
    const rowsValidated = transformToCsvRows(fieldList, variables, fields, settings)
    downloadClient.forCsv
        .changeSettings({useBOM: true})
        .download(rowsValidated, fieldList.name);
}