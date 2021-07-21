import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {Checkbox, FormControlLabel, Typography} from "@material-ui/core";
import {ClientUpload} from "../../../../utils/ClientUpload";
import {FormVariable} from "../../../../model/types";

export default function UploadVariables({formVariables, addVariables}) {
    const [open, setOpen] = React.useState(false);
    const [overwriteExisting, setOverwriteExisting] = useState(true);
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
        const vars = rows.reduce((result, row) => {
            const [name, value, desc, example] = row.split(";");

            const isEmpty = (str) => {
                return str === null || !(str?.length > 0);
            }

            if (isEmpty(name) && isEmpty(value))
                return result;

            const getVarCandidate = (name, value) => {
                if (!isEmpty(name) && isEmpty(value)) return FormVariable(name, name, desc, example);
                if (isEmpty(name) && !isEmpty(value)) return FormVariable(value, value, desc, example);
                return FormVariable(name, value, desc, example);

            }
            result.push(getVarCandidate(name, value));

            return result;
        }, [])

        const ignored = [];
        const overwritten = [];
        const newVariables = [];
        vars.forEach(varCandidate => {
            const isEqual = (candidate, other) => {
                if (!other) return false;
                return candidate.id === other.id || candidate.value === other.value;
            }
            const idxExisting = formVariables.findIndex(existVar => isEqual(varCandidate, existVar));
            if (idxExisting === -1) {
                newVariables.push(varCandidate);
            } else if (overwriteExisting) {
                const existing = formVariables[idxExisting];
                overwritten.push(existing);
                formVariables[idxExisting] = {...existing, ...varCandidate};
            } else {
                ignored.push(varCandidate);
            }
        })

        console.log({newVariables, overwritten, ignored})
        addVariables(newVariables);
        //todo: update overwritten
    }

    const handleOpenFile = (e) => {
        clientUpload.forFilePicker.uploadAsText(e, (text, fileName) => {
            handleUploadCsv(text);
        })
        handleClose();
    };

    return (
        <div>
            <Button onClick={handleClickOpen} size={"small"} style={{height: "50%"}}>
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={overwriteExisting}
                                onChange={(e) => setOverwriteExisting(e.target.checked)}
                                name="checkedI"
                            />
                        }
                        label={`Bestehende Variablen werden ${overwriteExisting ? "überschrieben" : "übersprungen"}`}
                    />
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