import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {Typography} from "@material-ui/core";
import {ClientUpload} from "../../../utils/ClientUpload";

export default function UploadPdf({loadPdf, setIsPdfReady}) {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

    const handleOpenFile = (e) => {
        setIsPdfReady(false);
        clientUpload.forFilePicker.uploadAsUint8(e, (uint8, fileName) => {
            loadPdf({data: uint8, filename: fileName})
        })
        handleClose();
    };

    return (
        <div>
            <Button variant="contained" onClick={handleClickOpen} style={{position: "relative", width: "100%"}}>
                Upload PDF
            </Button>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                aria-labelledby="upload-pdf-title"
            >
                <DialogTitle id="upload-pdf-title">{"PDF Hochladen"}</DialogTitle>

                <DialogContent>
                    <input type="file" id="file" name="file" encType="multipart/form-data" hidden={true}/>
                    <div className={"drop-zone"} id={"drop-zone-pdf"} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "400px",
                        height: "200px"
                    }}
                         onDragOver={(e) => {
                             e.preventDefault();
                             pdfDrop().style.backgroundColor = "gray";
                             pdfDrop().style.opacity = "60%"
                         }}
                         onDrop={(e) => {
                             //https://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input
                             e.preventDefault();
                             pdfDrop().style.backgroundColor = "none";
                             setIsPdfReady(false);
                             setOpen(false);
                             clientUpload.forDropEvent.uploadAsUint8(e, (uint8, fileName) => {
                                 loadPdf({data: uint8, filename: fileName})
                             })
                         }}
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