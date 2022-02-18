import {getRepository} from "../../utils/ClientStorage";
import {Field, FieldList, Pdf} from "../../model/types";

const {IDBClient} = require("client-persistence");


export function clearLocalStorage () {
    const idb = new IDBClient();
    console.debug("clearLocalStorage")
    const shouldDelete = window.confirm("Do you really wish to delete all local data? Keep in mind, thats all data because there is no server");
    console.debug("clearLocalStorage", shouldDelete)

    if(shouldDelete)
    idb.deleteDb().then(() => {
        alert("All Data deleted - Have a great day!")
        window.location.reload();
    })
}

export async function clearCurrentPdf () {
    console.debug("clearCurrentPdf")
    const shouldDelete = window.confirm("Do you really wish to the current PDF and Fields?");
    console.debug("clearCurrentPdf", shouldDelete)

    if(shouldDelete) {
        const pdfRepo = getRepository(Pdf);
        const fieldRepo = getRepository(Field);
        const fieldListRepo = getRepository(FieldList);
        await Promise.all([pdfRepo.clear(), fieldRepo.clear(), fieldListRepo.clear()]);
        alert("PDF deleted - Have a great day!")
        window.location.reload();
    }
}