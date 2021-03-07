import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {Typography} from "@material-ui/core";

export default function UploadPdf({loadPdf, setIsPdfReady}) {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const pdfDrop = () => {
        return document.getElementById("drop-zone-pdf")
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="contained" onClick={handleClickOpen}>
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
                             console.log("over")
                             pdfDrop().style.backgroundColor = "gray";
                             pdfDrop().style.opacity = "60%"
                         }}
                         onDrop={(e) => {
                             //https://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input
                             e.preventDefault();
                             pdfDrop().style.backgroundColor = "none";
                             console.log("reading pdf...", )
                             setOpen(false)
                             setIsPdfReady(false)

                             const fileInput = document.getElementById("file");
                             fileInput.files = e.dataTransfer.files;
                             let file = e.dataTransfer.files[0];
                             const fileReader = new FileReader();
                             fileReader.onload = function () {
                                 const bytearray = new Uint8Array(this.result);
                                 loadPdf(bytearray, file.name);
                             };
                             fileReader.readAsArrayBuffer(file)
                             console.log("done reading: ", file.name)

                             // If you want to use some of the dropped files
                             const dT = new DataTransfer();
                             dT.items.add(file);
                             // dT.items.add(e.dataTransfer.files[3]);
                             fileInput.files = dT.files;
                         }}
                    >
                        <Typography>Drag and Drop</Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        PDF öffnen
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}