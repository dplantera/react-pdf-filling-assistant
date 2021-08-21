import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Checkbox, FormControlLabel, Typography} from "@material-ui/core";
import {ClientUpload} from "../../utils/ClientUpload";

export default function UploadDialog({handleUpload, uploadOptions, title}) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = useState({...uploadOptions});

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

    const handleCheckedOption = (e) => {
        console.debug({e, target: e.target, value: e.target.value, checked: e.target.checked})
        const name = e.target.name;

        if (!Object.keys(options).includes(name)) {
            console.warn("UploadDialog: no option found for " + name);
            return;
        }
        options[name].value = e.target.checked;
        setOptions({...options});
    }

    const handleOpenFile = (e) => {
        clientUpload.forFilePicker.uploadAsText(e, (text, fileName) => {
            handleUpload(text, fileName, options);
        })
        handleClose();
    };

    const handleDropFile = (e) => {
        //https://stackoverflow.com/questions/22048395/how-to-open-a-local-var-in-pdfjs-using-file-input
        e.preventDefault();
        varDrop().style.backgroundColor = "none";
        setOpen(false);

        clientUpload.forDropEvent.uploadAsText(e, (text, fileName) => {
            handleUpload(text, fileName, options);
        })
    }

    const renderOptions = () => {
        return Object.keys(options).map((optionKey, index) => {
            const opt = options[optionKey];
            const optName = optionKey;
            return <FormControlLabel key={index}
                                     control={<Checkbox checked={opt.value} onChange={handleCheckedOption}
                                                        name={optName}/>}
                                     label={opt.label}/>
        })
    }

    return (
        <div>
            <Button onClick={handleClickOpen} size={"small"} style={{height: "50%"}}>
                Upload
            </Button>
            <Dialog
                fullScreen={false}
                open={open}
                onClose={handleClose}
                aria-labelledby="upload-var-title"
                classes={{paper: "dialog-upload"}}
            >
                <DialogTitle id="upload-var-title">{title}</DialogTitle>

                <DialogContent>
                    {renderOptions()}
                    <input type="file" id="file" name="file" encType="multipart/form-data" hidden={true}/>
                    <div className={"drop-zone"} id={"drop-zone-var"} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%"
                    }}
                         onDragOver={(e) => {
                             e.preventDefault();
                             varDrop().style.backgroundColor = "gray";
                             varDrop().style.opacity = "60%"
                         }}
                         onDrop={handleDropFile}
                    >
                        <Typography>Drag and Drop</Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <label htmlFor="var-file-upload">
                        <Button variant="contained" color="primary" component="span">
                            Upload
                        </Button>
                    </label>
                    <input accept=".csv" style={{display: "none"}} id="var-file-upload" type="file"
                           onChange={handleOpenFile}/>
                </DialogActions>
            </Dialog>
        </div>
    );
}