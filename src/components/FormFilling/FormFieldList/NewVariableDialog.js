import React, {useEffect, useState} from 'react';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import {Dialog, TextField} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {FormVariable} from "../../../model/types";
import {useAddVariable} from "../../hooks/AddVariableContext";
import {useStore} from "../../../store";

const NewVariableDialog = () => {
    const addVariable = useStore(state => state.addVariable)

    const {openDialog, setOpenDialog, newValue, setNewValue} = useAddVariable();
    const [dialogValue, setDialogValue] = useState(newValue);

    const handleClose = () => {
        let emptyVar = FormVariable();
        setDialogValue(emptyVar);
        setNewValue(emptyVar)
        setOpenDialog(false);
    };

    const emitAddVariable = (newVar) => {
        const eventAddVariable = new CustomEvent("add-variable", {detail: newVar, bubbles: false});
        document.dispatchEvent(eventAddVariable);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setNewValue(dialogValue);
        emitAddVariable(dialogValue);
        addVariable(dialogValue);
        handleClose();
    };

    useEffect(() => {
        setDialogValue(newValue);
    }, [newValue])

    return (
        <Dialog open={openDialog} onClose={handleClose} aria-labelledby="new-variable-dialog">
            <form onSubmit={handleSubmit}>
                <DialogTitle id="new-variable-dialog">Add a new film</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Neue Feldvariable anlegen
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        value={dialogValue.name}
                        onChange={(event) => setDialogValue({...dialogValue, name: event.target.value})}
                        label="Name"
                        type="text"
                        required={true}
                    />
                    <TextField
                        margin="dense"
                        id="variable"
                        multiline
                        fullWidth
                        value={dialogValue.value}
                        onChange={(event) => setDialogValue({...dialogValue, value: event.target.value})}
                        label="Variable"
                        type="text"
                        required={true}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        fullWidth
                        value={dialogValue.description ?? ""}
                        onChange={(event) => setDialogValue({...dialogValue, description: event.target.value})}
                        label="Beschreibung"
                        type="string"
                    />
                    <TextField
                        margin="dense"
                        id="example-value"
                        value={dialogValue.exampleValue ?? ""}
                        onChange={(event) => {
                            setDialogValue({...dialogValue, exampleValue: event.target.value});
                        }}
                        label="Beispiel Wert"
                        type="string"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default NewVariableDialog;
