import React from 'react';
import {TextField} from "@material-ui/core";

const FormFieldDesc = ({key, descValue, onBlur, onFocus}) => {

    return (
        <TextField
            id={key}
            key={key}
            defaultValue={descValue}
            multiline
            variant="outlined"
            fullWidth={true}
            onBlur={onBlur}
            onFocus={onFocus}
            label={"Description"}
            /*  without it - label wont move (shrink) when value updates from outside   */
            InputLabelProps={{
                shrink: true
            }}
        />
    );
};

export default FormFieldDesc;
