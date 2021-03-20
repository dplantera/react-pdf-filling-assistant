import React from 'react';
import ResizeableDiv from "../../../commons/ResizeableDiv";
import FormFieldVariable from "./FormFieldVariable";
import {TextField} from "@material-ui/core";

const FormFieldItem = (
    {
        field,
        key,
        idx,
        widthFormField,
        formVariables,
        setFormVariables,
        updateFieldDesc,
        resetHighlightFormField,
        highlightFormField
    }
) => {
    return (
        <div key={key}
             style={{position: "relative", display: "flex", width: "100%"}}>
            <ResizeableDiv overflow={"visible"} width={widthFormField}>
                <FormFieldVariable
                    field={field}
                    formVariables={formVariables}
                    updateFieldDesc={(e, field) => updateFieldDesc(e, field, idx)}
                    setFormVariables={setFormVariables}
                    resetHighlightFormField={resetHighlightFormField}
                    highlightFormField={highlightFormField}
                />
            </ResizeableDiv>
            <TextField
                key={"desc-" + field.name}
                multiline={true}
                id={"desc-" + field.name}
                label={"Beschreibung"}
                variant="outlined"
                fullWidth={true}
                value={field.description}
                onBlur={(e) => {
                    updateFieldDesc(e, field);
                    resetHighlightFormField(e, field)
                }}
                onFocus={(e) => highlightFormField(e, field)}
            />
        </div>
    );
};

export default FormFieldItem;
