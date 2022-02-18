import React from 'react';
import Button from '@mui/material/Button';
import {Pdf} from "../../../model/types";
import {useStore} from "../../../store";
import {useImportFilesDialog} from "../../hooks/useImportFilesDialog";
import {getFileExtensionFromFile, isPdfMimeType, Upload} from "../../../utils/upload";
import {importFieldsAndVarsFromCsv} from "../../actions/importActions";

export default function UploadPdf({loadPdf, setIsPdfReady}) {
    const settings = useStore(state => state.settings)
    const {show, hide, RenderImportFilesDialog} = useImportFilesDialog();
    const selectPdf = useStore(state => state.selectPdf)
    const [variables, updateVariables] = useStore(state => [state.variables, state.updateVariables])
    const [fields, updateFields] = useStore(state => [state.fields, state.updateFields])

    const handleLoadPdf = async (fileName, uint8) => {
        const fieldList = await selectPdf(Pdf(fileName, uint8));
        await loadPdf({data: uint8, filename: fileName})
        console.info("UploadPdf: done")
        return fieldList;
    }

    const handleUploadText = async (file, selectedFieldList) => {
        console.group("handleUploadText")
        const [text, fileName] = await Upload.uploadAsText(file)
        console.log({text, fileName})
        const importResult = importFieldsAndVarsFromCsv(text, fields, variables, selectedFieldList, settings.getSettings());
        updateVariables(importResult.newVariables);
        updateFields(importResult.newFields);
        updateFields(importResult.updatedFields);
        console.groupEnd()
    }

    const handleUploadPdf = async (file) => {
        console.group("handleUploadPdf")
        const [data, fileName] = await Upload.uploadAsUint8(file)
        console.log({data, fileName})
        setIsPdfReady(false);
        const selectedFieldList = await handleLoadPdf(fileName, data);
        console.groupEnd()
        return selectedFieldList;
    }

    // todo: this imports pdfs and templates but the template content won't persist...
    const handleImport = async (files) => {
        const isCsvByExtOrMimeType = (file) => ".csv" === getFileExtensionFromFile(file);
        const pdfs = files.filter(file => isPdfMimeType(file.type));
        const csvFiles = files.filter(file => isCsvByExtOrMimeType(file));
        const other = files.filter(file => !(isPdfMimeType(file.type) || isCsvByExtOrMimeType(file)))
        //todo: change when multiple files are supported
        if (pdfs.length > 1 || csvFiles.length > 1)
            window.alert("Currently only one pdf and template is supported")
        if (other.length > 0)
            console.error("unsupported filetypes: ", {other})

        hide();
        let selectedFieldList = undefined;
        if (pdfs.length > 0)
            selectedFieldList = await handleUploadPdf(pdfs[0])
        if (csvFiles.length > 0)
            await handleUploadText(csvFiles[0], selectedFieldList)
    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={show} color={"primary"} sx={ {
                color: "#3f51b5",
                fontSize: "1em",
                fontWeight: "bold",
                backgroundColor: "rgb(201, 203, 212)",
                ":hover": {
                    backgroundColor: "rgba(63,81,181,0.47)"
                }
            }}>
                Upload PDF
            </Button>
            <RenderImportFilesDialog
                title={"Upload PDF"}
                onImport={handleLoadPdf}
                onCancel={hide}
                onClose={hide}
                acceptedFileExt={[".pdf"]}/>
        </React.Fragment>
    );
}