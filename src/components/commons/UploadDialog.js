import React from 'react';
import {useImportFilesDialog} from "../hooks/useImportFilesDialog";
import {isPdfMimeType, Upload} from "../../utils/upload";
import Button from "@material-ui/core/Button";

export default function UploadDialog({onUploadText, onUploadPdf, title, acceptedFileExt}) {
    const {show, hide, RenderImportFilesDialog} = useImportFilesDialog();

    const handleUploadText = async (file) => {
        const [text, fileName] = await Upload.uploadAsText(file)
        console.log({text, fileName})
        onUploadText?.(text, fileName);
    }

    const handleUploadPdf = async (file) => {
        const [data, fileName] = await Upload.uploadAsUint8(file)
        console.log({data, fileName})
        onUploadPdf?.(data, fileName);
    }

    const handleImport = (files) => {
        files.forEach(async file => {
            if (isPdfMimeType(file.type))
                await handleUploadPdf(file)
            else
                await handleUploadText(file)
        })
        hide();
    }

    return (
        <React.Fragment>
            <Button onClick={show} size={"small"} style={{height: "50%"}}>
                Upload
            </Button>
            <RenderImportFilesDialog
                title={title}
                onImport={handleImport}
                onCancel={hide}
                onClose={hide}
                acceptedFileExt={acceptedFileExt}/>
        </React.Fragment>
    );
}