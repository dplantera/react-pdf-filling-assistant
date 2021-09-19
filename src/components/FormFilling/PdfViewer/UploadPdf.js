import React from 'react';
import Button from '@material-ui/core/Button';
import {Pdf} from "../../../model/types";
import {useStore} from "../../../store";
import {useImportFilesDialog} from "../../hooks/useImportFilesDialog";
import {getFileExtensionFromFile, isPdfMimeType, Upload} from "../../../utils/upload";
import {importFieldsAndVarsFromCsv} from "../../actions/importActions";

export default function UploadPdf({loadPdf, setIsPdfReady}) {
    const {show, hide, RenderImportFilesDialog} = useImportFilesDialog();
    const selectPdf = useStore(state => state.selectPdf)
    const [variables, updateVariables] = useStore(state => [state.variables, state.updateVariables])
    const [fields, updateFields] = useStore(state => [state.fields, state.updateFields])
    const addVariableToField = useStore(state => state.addVariableToField)

    const handleLoadPdf = async (fileName, uint8) => {
        await selectPdf(Pdf(fileName, uint8));
        await loadPdf({data: uint8, filename: fileName})
        console.info("UploadPdf: done")
    }

    const handleUploadText = async (file) => {
        console.group("handleUploadText")
        const [text, fileName] = await Upload.uploadAsText(file)
        console.log({text, fileName})
        const importResult = importFieldsAndVarsFromCsv(text, fields, variables, addVariableToField);
        updateVariables(importResult.newVariables);
        updateFields(importResult.newFields);
        console.groupEnd()
    }

    const handleUploadPdf = async (file) => {
        console.group("handleUploadPdf")
        const [data, fileName] = await Upload.uploadAsUint8(file)
        console.log({data, fileName})
        setIsPdfReady(false);
        await handleLoadPdf(fileName, data);
        console.groupEnd()
    }

    const handleImport = async (files) => {
        const isCsvByExtOrMimeType = (file) => ".csv" === getFileExtensionFromFile(file);
        const pdfs = files.filter(file => isPdfMimeType(file.type));
        const csvFiles = files.filter(file => isCsvByExtOrMimeType(file));
        const other = files.filter(file => !(isPdfMimeType(file.type) || isCsvByExtOrMimeType(file)))
        //todo: change when multiple files are supported
        if (pdfs.length > 1 || csvFiles.length > 1)
            console.warn("Currently only one pdf and template is supported")
        if(other.length > 0)
            console.error("unsupported filetypes: ", {other})

        hide();
        if (pdfs.length > 0)
            await handleUploadPdf(pdfs[0])
        if (csvFiles.length > 0)
            await handleUploadText(csvFiles[0])
    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={show} style={{position: "relative", width: "100%", zIndex:1202}}>
                Upload PDF or Template
            </Button>
            <RenderImportFilesDialog
                title={"Upload PDF or Template"}
                onImport={handleImport}
                onCancel={hide}
                onClose={hide}
                acceptedFileExt={[".pdf", ".csv"]}/>
        </React.Fragment>
    );
}