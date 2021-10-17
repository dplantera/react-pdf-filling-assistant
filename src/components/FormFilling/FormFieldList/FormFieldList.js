import React, {memo, useCallback, useState} from "react";
import FormFieldItem from "./ListItems/FormFieldItem";
import FormItemsControls from "./Controls/FormItemsControls";
import FormListControls from "./Controls/FormListControls";
import NewVariableDialog from "./NewVariableDialog";
import {useAddVariable} from "../../hooks/AddVariableContext";
import {useStore} from "../../../store";
import {FieldTypes} from "../../../model/types";
import FormGroupItem from "./ListItems/FormGroupItem";
import {ListItem} from "@mui/material";

const storeSelector = (state) => ({
    variables: state.variables,
    fields: state.fields,
    updateField: state.updateField,
    addVariableToField: state.addVariableToField
})

const FormFieldList = memo((
    {
        pdfClient,
    }
) => {
    const {variables, fields, updateField, addVariableToField} = useStore(storeSelector);

    const {openVariableDialog} = useAddVariable();
    const [widthFormField, setWidthFormField] = useState(50);

    const _highlightFormField = useCallback((name, pageNum) => {
        pdfClient.selectField({name, location: {pageNum}})
    }, [pdfClient])

    const _resetHighlightFormField = useCallback((name) => {
        pdfClient.unselectField({name})
    }, [pdfClient])

    const makePropsForField = (key, idx, field, fieldToHighlight) => {
        return {
            key,
            idx,
            fieldId: field.id,
            fieldValue: field.value,
            fieldName: field.name,
            fieldDescription: field.description,
            fieldPageNum: field.location?.pageNum,
            variables: variables,
            openVariableDialog: openVariableDialog,
            addVariableToField: addVariableToField,
            updateField: updateField,
            widthFormField: widthFormField,
            resetHighlightFormField: fieldToHighlight
                ? () => _resetHighlightFormField(fieldToHighlight.name)
                : _resetHighlightFormField,
            highlightFormField: fieldToHighlight
                ? () => _highlightFormField(fieldToHighlight.name, fieldToHighlight.location.pageNum)
                : _highlightFormField,
        }
    }
    const isRadioBtnGroup = (field) => field.type.name === FieldTypes.RADIO.name && !field.groupInfo.parent;
    const isNotRadioBtn = (field) => field.type.name !== FieldTypes.RADIO.name;

    return (
        <div className={"field-list-container"}>
            <FormListControls formVariables={variables}/>
            <FormItemsControls widthFormField={widthFormField} setWidthFormField={setWidthFormField}/>
            <div className={"field-list"}>
                {fields.map((field, idx) => {
                    if (isRadioBtnGroup(field))
                        return (
                            <FormGroupItem
                                GroupComponent={FormFieldItem}
                                GroupComponentProps={{...makePropsForField("field-" + field.name, idx, field)}}
                            >
                                {field.groupInfo.children
                                    .map(childName => fields.findIndex(({name}) => childName === name))
                                    .map(childIdx => {
                                        const child = fields[childIdx];
                                        return <ListItem><FormFieldItem
                                            {...makePropsForField("child-" + child.name, childIdx, child, field)}
                                        /></ListItem>
                                    })}
                            </FormGroupItem>
                        )
                    else if (isNotRadioBtn(field)) {
                        return <FormFieldItem
                            {...makePropsForField("field-" + field.name, idx, field)}
                        />
                    }
                    return null;
                })}
                <NewVariableDialog/>
            </div>
        </div>
    )
})

export default FormFieldList;
