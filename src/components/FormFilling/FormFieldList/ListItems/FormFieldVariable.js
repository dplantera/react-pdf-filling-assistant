import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';
import React, {useState, Fragment} from "react";
import {TextField} from "@material-ui/core";
import {useAddVariable} from "../../../hooks/AddVariableContext";
import {FormVariable} from "../../../../model/types";


const filter = createFilterOptions();

export default function FormFieldVariable({
                                              fieldName,
                                              fieldValue,
                                              formVariables,
                                              onVariableSet,
                                              onInputSet,
                                              onBlur,
                                              onFocus
                                          }) {
    const {openVariableDialog} = useAddVariable();
    const [formVariable, setFormVariable] = useState(FormVariable(fieldValue, fieldValue));

    const selectVariable = (formVariable) => {
        onVariableSet(formVariable);
        setFormVariable(formVariable);
    }

    const _onBlurInput = (e) => {
        setFormVariable({name: e.target.value});
        onInputSet(e.target.value);
        onBlur(e);
    }

    return (
        <Fragment>
            <Autocomplete
                /*getOptionLabel destructs var for options*/
                value={formVariable}
                onChange={(event, newValue) => {
                    const newVar = FormVariable(newValue.inputValue, newValue.inputValue);
                    if (typeof newValue === 'string') {
                        // types and hits enter
                        // timeout to avoid instant validation of the dialog's form.
                        setTimeout(() => {
                            const newOption = FormVariable(newValue, newValue);
                            openVariableDialog(newOption);
                        });
                        // click Add x
                    } else if (newValue && newValue.inputValue) {
                        openVariableDialog(newVar);
                        // Selects existing option
                    } else {
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
                getOptionLabel={(variableOption) => {
                    // e.g formVariable selected with enter, right from the input
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
}