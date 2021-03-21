import React, {useState} from 'react';
import ResizeableDiv from "../../../commons/ResizeableDiv";
import FormFieldVariable from "./FormFieldVariable";
import FormFieldDesc from "./FormFieldDesc";
import {useFormVariables} from "../../../hooks/VariableContext";

const FormFieldItem = (
    {
        field,
        itemKey,
        idx,
        setFields,
        widthFormField,
        resetHighlightFormField,
        highlightFormField
    }
) => {
    const [formVariables] = useFormVariables();
    const [fieldDesc, setFieldDesc] = useState(field.desc);


    const onFocus = (e) => {
        highlightFormField(e, field);
    }
    const onInputSet = (inputVal) => {
        if(!inputVal)
            return;
        field.value = inputVal;
        // const updatedField = {...field, value: inputVal};
        // setFields({field: updatedField, index: idx}, "update-one")
    }

    const onVariableSet = (formVariable) => {
        setFields({field, formVariable}, "add-variable");
        setFieldDesc(formVariable.description);
    }

    const onDescriptionSet = (e) => {
        resetHighlightFormField(e, field);
        const description = e.currentTarget.value || fieldDesc || "";
        setFields({field: {...field, description}, index: idx}, "update-one")
        setFieldDesc(description);
    }

    return (
        <div key={itemKey}
             style={{position: "relative", display: "flex", width: "100%"}}>
            <ResizeableDiv overflow={"visible"} width={widthFormField}>
                <FormFieldVariable
                    fieldName={field.name}
                    fieldValue={field.value}
                    formVariables={formVariables}
                    highlightFormField={highlightFormField}
                    resetHighlightFormField={resetHighlightFormField}
                    onVariableSet={onVariableSet}
                    onInputSet={onInputSet}
                    onBlur={(e) => {
                        resetHighlightFormField(e, field)
                    }}
                    onFocus={onFocus}
                />
            </ResizeableDiv>
            <FormFieldDesc id={"desc-" + field.name}
                           descValue={fieldDesc}
                           onBlur={onDescriptionSet}
                           onFocus={onFocus}
            />
        </div>
    );
};

export default FormFieldItem;
