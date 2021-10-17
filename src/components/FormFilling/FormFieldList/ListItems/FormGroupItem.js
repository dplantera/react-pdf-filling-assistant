import React, {memo} from 'react';
import ResizeableDiv from "../../../commons/ResizeableDiv";
import FormFieldVariable from "./FormFieldVariable";
import FormFieldDesc from "./FormFieldDesc";
import {Card} from "@material-ui/core";

const FormGroupItem = memo((
    {
        groupField,
        groupChildren,
        variables,
        openVariableDialog,
        addVariableToField,
        updateField,
        widthFormField,
        resetHighlightFormField,
        highlightFormField
    }
) => {
    const handleFocus = (fieldName, fieldPageNum) => {
        highlightFormField(fieldName, fieldPageNum);
    }
    const handleInput = (fieldId, inputVal) => {
        if (!inputVal)
            return;

        updateField({id: fieldId, value: inputVal});
        // setFieldVal(inputVal);
    }

    const handleNewVariable = (formVariable, _fieldId) => {
        addVariableToField(formVariable, {id: _fieldId});
        // setFieldVal(formVariable.name);
        // setFieldDesc(formVariable.description);
    }

    const handleNewDescription = (fieldId, description) => {
        resetHighlightFormField(groupField.name);
        updateField({id: fieldId, description});
        // setFieldDesc(description);
    }

    const handleClear = (fieldId) => {
        console.group("handleClear")

        // setFieldVal("");
        // setFieldDesc("");
        updateField({id: fieldId, variable: "", value: "", description: ""})
        console.groupEnd();
    }

    const RenderFieldItem = ({field}) => {
        const {name: fieldName, description: fieldDesc, value: fieldVal} = field;
        return (<div style={{position: "relative", display: "flex", width: "100%"}}>
            <ResizeableDiv overflow={"visible"} width={widthFormField}>
                <FormFieldVariable
                    fieldName={fieldName}
                    fieldValue={fieldVal} // fieldValue is default to fieldVal but when fieldValue changes from extern than fieldVal wont update
                    formVariables={variables}
                    onVariableSet={(variable) => handleNewVariable(variable, field.id)}
                    onInputSet={(inputValue) => handleInput(field.id, inputValue)}
                    onBlur={(e) => {
                        resetHighlightFormField(fieldName)
                    }}
                    onClear={() => handleClear(field.id)}
                    onFocus={() => handleFocus(field.name, field.location.pageNum)}
                    openVariableDialog={openVariableDialog}
                />
            </ResizeableDiv>
            {widthFormField < 100 && <FormFieldDesc id={"desc-" + fieldName}
                                                    descValue={fieldDesc}
                                                    onBlur={(e) => handleNewDescription(e.currentTarget.value || fieldDesc || "")}
                                                    onFocus={() => handleFocus(field.name, field.location.pageNum)}
            />}
        </div>);
    }

    return (
        <div style={{display: "flex", flex: "0 1", position: "relative", width: "100%"}}>
            <h6>{groupField.name}</h6>
            <Card style={{marginTop: 5, flexGrow: 1, padding: 5}}>
                {groupChildren.map( (field, idx) => <RenderFieldItem key={idx} field={field}/>)}
            </Card>
        </div>
    );
})

export default FormGroupItem;
