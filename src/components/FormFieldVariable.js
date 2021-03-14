import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';
import React, {useState, Fragment} from "react";
import {Dialog, TextField} from "@material-ui/core";
import {FormVariable} from "../pdf-backend/model";

const filter = createFilterOptions();

export default function FormFieldVariable({ field,
                                              formVariables,
                                              setFormVariables,
                                              updateFieldDesc,
                                              highlightFormField,
                                              resetHighlightFormField
                                          }) {
    const [formVariable, setFormVariable] = useState(FormVariable(field.value,field.value));
    const [open, toggleOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(FormVariable());

    const handleClose = () => {
        setDialogValue(FormVariable());

        toggleOpen(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // update variable options
        setFormVariables([...formVariables, dialogValue])
        updateFieldWithVariable(dialogValue);
        handleClose();
    };

    const updateFieldWithVariable = (formVariable) => {
        field.variable = formVariable;
        console.log({formVariable})
        if(!field.description && formVariable.description )
            field.description = formVariable.description;

        setFormVariable(formVariable);
        updateFieldDesc(null, field);
        console.log("added variable to field: " + field.name)
    }
    return (
        <Fragment>
            <Autocomplete
                value={formVariable}
                onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                        // types and hits enter
                        // timeout to avoid instant validation of the dialog's form.
                        setTimeout(() => {
                            toggleOpen(true);
                            setDialogValue({
                                name: newValue,
                                value: newValue,
                            });
                        });
                        // click Add x
                    } else if (newValue && newValue.inputValue) {
                        toggleOpen(true);
                        setDialogValue({
                            name: newValue.inputValue,
                            value: newValue.inputValue,
                        });
                        // Selects existing option
                    } else {
                        updateFieldWithVariable(newValue);
                    }
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    if (params.inputValue !== '') {
                        filtered.push({
                            inputValue: params.inputValue,
                            name: `Add "${params.inputValue}"`,
                        });
                    }

                    return filtered;
                }}
                id={field.name}
                options={formVariables}
                getOptionLabel={(option) => {
                    // e.g formVariable selected with enter, right from the input
                    if (typeof option === 'string') {
                        return option;
                    }
                    if (option.inputValue) {
                        return option.inputValue;
                    }
                    return option.name;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                renderOption={(option) => option.name}
                style={{fontFamily: 'Source Code Pro'}}
                freeSolo
                renderInput={(params) => (
                    <TextField {...params}
                               multiline={true}
                               id={"input-" + field.name}
                               label={field.name}
                               fullWidth={true}
                               variant="outlined"
                               onBlur={(e) => {
                                   resetHighlightFormField(e, field)
                               }}
                               onFocus={(e) => highlightFormField(e, field)}/>
                )}
            />

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-name">
                <form onSubmit={handleSubmit}>
                    <DialogTitle id="form-dialog-name">Add a new film</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Neue Formularfeld Variable anlegen
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
                            value={dialogValue.description}
                            onChange={(event) => setDialogValue({...dialogValue, description: event.target.value})}
                            label="Beschreibung"
                            type="string"
                        />
                        <TextField
                            margin="dense"
                            id="example-value"
                            value={dialogValue.exampleValue}
                            onChange={(event) => {
                                console.log({event, targetVal: event.target.value, dialogValue})
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
        </Fragment>
    );
}