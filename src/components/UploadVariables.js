import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {Typography} from "@material-ui/core";
import {ClientUpload} from "../utils/ClientUpload";
import {FormVariable} from "../pdf-backend/model";

export default function UploadVariables({formVariables, setFormVariables}) {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const clientUpload = new ClientUpload();
    const varDrop = () => {
        return document.getElementById("drop-zone-var")
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function handleUploadCsv(text) {
        //name;value;desc;example
        const rows = text.split("\n");
        const vars = rows.map(row => {
            const [name, value, desc, example] = row.split(";");
            console.log({name, value, desc, example})

            if (name && !value)
                return FormVariable(name, name, desc, example)

            if (!name && value)
                return FormVariable(value, value, desc, example)

            return FormVariable(name, value, desc, example)
        })

        //naiv implementation
        setFormVariables([...formVariables, ...vars])
    }

    const handleOpenFile = (e) => {
        clientUpload.forFilePicker.uploadAsText(e, (text, fileName) => {
            handleUploadCsv(text);
        })
        handleClose();
    };

    return (
        <div>
            <Button onClick={handleClickOpen} size={"small"} style={{height: "50%"}} >
                Upload
            </Button>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                aria-labelledby="upload-var-title"
            >
                <DialogTitle id="upload-var-title">{"Variablen Hochladen"}</DialogTitle>

                <DialogContent>
                    <input type="file" id="file" name="file" encType="multipart/form-data" hidden={true}/>
                    <div className={"drop-zone"} id={"drop-zone-var"} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "400px",
                        height: "200px"
                    }}
                         onDragOver={(e) => {
                             e.preventDefault();
                             varDrop().style.backgroundColor = "gray";
                             varDrop().style.opacity = "60%"
                         }}
                         onDrop={(e) => {
                             //https://stackoverflow.com/questions/22048395/how-to-open-a-local-var-in-pdfjs-using-file-input
                             e.preventDefault();
                             varDrop().style.backgroundColor = "none";
                             setOpen(false);

                             clientUpload.forDropEvent.uploadAsText(e, (text, fileName) => {
                                 handleUploadCsv(text);
                             })
                         }}
                    >
                        <Typography>Drag and Drop</Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <label htmlFor="var-file-upload">
                        <Button variant="contained" color="primary" component="span">
                            Upload Variables
                        </Button>
                    </label>
                    <input accept=".csv" style={{display: "none"}} id="var-file-upload" type="file"
                           onChange={handleOpenFile}/>
                </DialogActions>
            </Dialog>
        </div>
    );
}