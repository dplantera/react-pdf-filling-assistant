import React, {memo, useState} from 'react';
import ResizeableDiv from "../../../commons/ResizeableDiv";
import FormFieldVariable from "./FormFieldVariable";
import FormFieldDesc from "./FormFieldDesc";

const FormFieldItem = memo((
    {
        idx,
        fieldId,
        fieldValue,
        fieldName,
        fieldDescription,
        fieldPageNum,
        variables,
        openVariableDialog,
        addVariableToField,
        updateField,
        widthFormField,
        resetHighlightFormField,
        highlightFormField
    }
) => {
    const [fieldVal, setFieldVal] = useState(fieldValue);
    const [fieldDesc, setFieldDesc] = useState(fieldDescription);

    const handleFocus = () => {
        highlightFormField(fieldName, fieldPageNum);
    }
    const handleInput = (inputVal) => {
        if (!inputVal)
            return;

        updateField({index: idx, id: fieldId, value: inputVal});
        setFieldVal(inputVal);
    }

    const handleNewVariable = (formVariable) => {
        addVariableToField(formVariable, {id: fieldId, index: idx});
        // setFieldVal(formVariable.name);
        setFieldDesc(formVariable.description);
    }

    const handleNewDescription = (e) => {
        resetHighlightFormField(fieldName);
        const description = e.currentTarget.value || fieldDesc || "";

        updateField({index: idx, id: fieldId, description});
        setFieldDesc(description);
    }

    const handleClear = () => {
        console.group("handleClear")

        setFieldVal("");
        setFieldDesc("");
        updateField({index: idx, id: fieldId, variable: "", value: "", description: ""})
        console.groupEnd();
    }


    return (
        <div style={{position: "relative", display: "flex", width: "100%"}}>
            <ResizeableDiv overflow={"visible"} width={widthFormField}>
                <FormFieldVariable
                    fieldName={fieldName}
                    fieldValue={fieldVal || fieldValue} // fieldValue is default to fieldVal but when fieldValue changes from extern than fieldVal wont update
                    formVariables={variables}
                    onVariableSet={handleNewVariable}
                    onInputSet={handleInput}
                    onBlur={(e) => {
                        resetHighlightFormField(fieldName)
                    }}
                    onClear={handleClear}
                    onFocus={handleFocus}
                    openVariableDialog={openVariableDialog}
                />
            </ResizeableDiv>
            {widthFormField < 100 && <FormFieldDesc id={"desc-" + fieldName}
                                                    descValue={fieldDesc || fieldDescription} // when fieldDescription changes from extern than fieldDesc wont update
                                                    onBlur={handleNewDescription}
                                                    onFocus={handleFocus}
            />}
        </div>
    );
});

export default FormFieldItem;
