import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';
import React, {Fragment, memo} from "react";
import {TextField} from "@material-ui/core";
import {FormVariable} from "../../../../model/types";


const filter = createFilterOptions();

const FormFieldVariable = memo((
    {
        fieldName,
        fieldValue,
        formVariables,
        onVariableSet,
        onInputSet,
        onBlur,
        onFocus,
        openVariableDialog
    }) => {
    const selectVariable = (formVariable) => {
        if (!formVariable) {
            console.log("selectVariable", {formVariable})
            console.trace()
            return;
        }
        onVariableSet(formVariable);
    }

    const onAddVariable = (e) => {
        console.log("event..", e);
        selectVariable(e.detail);

        document.removeEventListener("add-variable", onAddVariable);
    }

    const _openVariableDialog = (newVal) => {
        document.addEventListener("add-variable", onAddVariable);
        openVariableDialog(newVal);
    }

    const _onBlurInput = (e) => {
        // setFormVariable({name: e.target.value});
        console.log({e}, e.target.value)
        onInputSet(e.target.value);
        onBlur(e);
    }

    return (
        <Fragment>
            <Autocomplete
                /*getOptionLabel destructs var for options*/
                value={fieldValue}
                onChange={(event, newValue) => {
                    if (!newValue)
                        return;

                    const newVar = FormVariable(newValue.inputValue, newValue.inputValue);
                    if (typeof newValue === 'string') {
                        // types and hits enter
                        // timeout to avoid instant validation of the dialog's form.
                        setTimeout(() => {
                            const newOption = FormVariable(newValue, newValue);
                            _openVariableDialog(newOption);
                        });
                        // click Add x
                    } else if (newValue && newValue.inputValue) {
                        _openVariableDialog(newVar);
                        // Selects existing option
                    } else if (newValue) {
                        selectVariable(newValue);
                    }
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    // when creating new variable
                    if (params.inputValue !== '') {
                        filtered.push({
                            inputValue: params.inputValue,
                            name: `Add "${params.inputValue}"`,
                        });
                    }

                    return filtered;
                }}
                id={"var-input-" + fieldName}
                options={formVariables}
                // Textbox display Value
                getOptionLabel={(variableOption) => {
                    if (typeof variableOption === 'string') {
                        return variableOption;
                    }
                    if (variableOption.inputValue) {
                        return variableOption.inputValue;
                    }
                    return variableOption.name;
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
                               id={"input-" + fieldName}
                               label={fieldName}
                               fullWidth={true}
                               variant="outlined"
                               onBlur={_onBlurInput}
                               onFocus={onFocus}/>
                )}
            />
        </Fragment>
    );
});

export default FormFieldVariable;