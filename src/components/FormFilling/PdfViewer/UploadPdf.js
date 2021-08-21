import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Typography} from "@material-ui/core";
import {ClientUpload} from "../../../utils/ClientUpload";
import {Pdf} from "../../../model/types";
import {useStore} from "../../../store";

export default function UploadPdf({loadPdf, setIsPdfReady}) {
    const [open, setOpen] = React.useState(false);
    const selectPdf = useStore(state => state.selectPdf)

    const clientUpload = new ClientUpload();
    const pdfDrop = () => {
        return document.getElementById("drop-zone-pdf")
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLoadPdf = async (fileName, uint8) => {
        await selectPdf(Pdf(fileName, uint8));
        await loadPdf({data: uint8, filename: fileName})
        console.info("UploadPdf: done")
    }
    const handleOpenFile =  (e) => {
        console.group("handleOpenFile")
        setIsPdfReady(false);
        clientUpload.forFilePicker.uploadAsUint8(e, async (uint8, fileName) => {
            await handleLoadPdf(fileName, uint8);
            console.groupEnd()
        })
        handleClose();
    };

    const handleDropFile = (e) => {
        //https://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input
        e.preventDefault();
        pdfDrop().style.backgroundColor = "none";
        handleClose();
        setIsPdfReady(false);
        clientUpload.forDropEvent.uploadAsUint8(e, async (uint8, fileName) => {
            await handleLoadPdf(fileName, uint8);
        })
    }

    return (
        <div>
            <Button variant="contained" onClick={handleClickOpen} style={{position: "relative", width: "100%"}}>
                Upload PDF
            </Button>
            <Dialog
                fullScreen={false}
                open={open}
                onClose={handleClose}
                aria-labelledby="upload-pdf-title"
                classes={{paper: "dialog-upload"}}
            >
                <DialogTitle id="upload-pdf-title">{"Upload PDF"}</DialogTitle>

                <DialogContent
                >
                    <input type="file" id="file" name="file" encType="multipart/form-data" hidden={true}/>
                    <div className={"drop-zone"} id={"drop-zone-pdf"} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%"
                    }}
                         onDragOver={(e) => {
                             e.preventDefault();
                             pdfDrop().style.backgroundColor = "gray";
                             pdfDrop().style.opacity = "60%"
                         }}
                         onDrop={handleDropFile}
                    >
                        <Typography>Drag and Drop</Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <label htmlFor="pdf-file-upload">
                        <Button variant="contained" color="primary" component="span">
                            Upload PDF
                        </Button>
                    </label>
                    <input accept=".pdf" style={{display: "none"}} id="pdf-file-upload" type="file"
                           onChange={handleOpenFile}/>
                </DialogActions>
            </Dialog>
        </div>
    );
}