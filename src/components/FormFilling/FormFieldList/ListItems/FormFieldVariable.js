import React, {Fragment, memo} from "react";
import {FormVariable} from "../../../../model/types";
import {createFilterOptions, TextField, Autocomplete} from "@mui/material";


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
        onClear,
        openVariableDialog,
        ...innerInputProps
    }) => {
    const selectVariable = (formVariable) => {
        if (!formVariable) {
            console.trace()
            return;
        }
        onVariableSet(formVariable);
    }

    const onAddVariable = (e) => {
        selectVariable(e.detail);

        document.removeEventListener("add-variable", onAddVariable);
    }

    const _openVariableDialog = (newVal) => {
        document.addEventListener("add-variable", onAddVariable);
        openVariableDialog(newVal);
    }

    const _onBlurInput = (e) => {
        // setFormVariable({name: e.target.value});
        onInputSet(e.target.value);
        onBlur(e);
    }

    const handleInputChanged = (event, value, reason) => {
        switch (reason){
            case "clear": onClear(); break;
            case "reset": break;
            case "input": break;
            default:
                console.error("handleInputChanged: unknown reason", {reason});
        }
    }

    return (
        <Fragment>
            <Autocomplete
                size={"small"}
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
                renderOption={(props, option, { selected }) => (
                   <li {...props}>
                       {option.name}
                  </li>
                )}
                style={{fontFamily: 'Source Code Pro'}}
                freeSolo
                onInputChange={handleInputChanged}
                {...innerInputProps}
                renderInput={params => (
                    <TextField {...params}
                               multiline={true}
                               size={"small"}
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