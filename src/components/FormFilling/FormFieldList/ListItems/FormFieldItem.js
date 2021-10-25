import React, {memo, useState} from 'react';
import ResizeableDiv from "../../../commons/ResizeableDiv";
import FormFieldVariable from "./FormFieldVariable";
import FormFieldDesc from "./FormFieldDesc";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import Checkbox from '@mui/material/Checkbox';
import {TextField, Tooltip} from "@mui/material";
import {FieldValueTypes} from "../../../../model/types";

const FormFieldItem = memo((
    {
        idx,
        fieldId,
        fieldValue,
        fieldValueType,
        fieldName,
        fieldDescription,
        fieldPageNum,
        variables,
        openVariableDialog,
        addVariableToField,
        updateField,
        widthFormField,
        resetHighlightFormField,
        highlightFormField,
        disabled = false
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
        setFieldVal(formVariable.name);
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

    const isConstant = () => {
        console.debug({fieldValueType, isConstant: fieldValueType === FieldValueTypes.CONST.name})
        return fieldValueType === FieldValueTypes.CONST.name
    };
    const makeTooltipCheckbox = () => {
        if (isConstant())
            return "Uncheck, if this field is variable.";
        return "Check, if this field is constant.";
    }

    const handleCheckedConstant = (event) => {
        const checked = event.target.checked;
        updateField({index: idx, id: fieldId, valueType: checked ? FieldValueTypes.CONST : FieldValueTypes.VAR})
    }

    const renderInput = () => {
        if (isConstant())
            return <TextField
                multiline={true}
                size={"small"}
                id={"input-" + fieldName}
                defaultValue={fieldValue}
                label={fieldName}
                fullWidth={true}
                variant="outlined"
                color={"secondary"}
                onFocus={handleFocus}
                onBlur={(e) => handleInput(e.target.value)}
                focused
            />
        return <ResizeableDiv overflow={"visible"} width={widthFormField}>
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
                disabled={disabled}
            />
        </ResizeableDiv>

    }
    return (
        <div id={fieldId} style={{position: "relative", display: "flex", width: "100%"}}>
            <Tooltip title={makeTooltipCheckbox()} placement={"top-start"}
                     arrow>
                <Checkbox icon={<TextFieldsIcon fontSize="small"/>}
                          checkedIcon={<TextFieldsIcon color={"secondary"} fontSize="small"/>}
                          onChange={handleCheckedConstant}
                          checked={isConstant()}
                />
            </Tooltip>
            {renderInput()}
            {widthFormField < 100 && <FormFieldDesc id={"desc-" + fieldName}
                                                    descValue={fieldDesc || fieldDescription} // when fieldDescription changes from extern than fieldDesc wont update
                                                    onBlur={handleNewDescription}
                                                    onFocus={handleFocus}
                                                    disabled={disabled}
            />}
        </div>
    );
});

export default FormFieldItem;
