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

    const clearGroupWhenChildSet = useCallback((field, _childField) => {
        if (_childField.value || _childField.variable) {
            updateField({id: field.id, value: "", variable: "", description: ""})
        }
        updateField(_childField);
    }, [updateField])

    const makePropsForField = (idx, field, fieldToHighlight) => {
        return {
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
                    if (isRadioBtnGroup(field)) {
                        const idxChildren = field.groupInfo.children.map(childName => fields.findIndex(({name}) => childName === name));
                        const isGroupEnabled = idxChildren.some(childIdx => !!fields[childIdx]?.variable)
                        return (
                            <FormGroupItem
                                key={"field-" + field.name}
                                GroupComponent={FormFieldItem}
                                GroupComponentProps={{...makePropsForField(idx, field)}}
                                disableGroupItem={isGroupEnabled}
                            >
                                {field.groupInfo.children
                                    .map(childName => fields.findIndex(({name}) => childName === name))
                                    .map(childIdx => {
                                        if(childIdx === -1) {
                                            console.warn("not found: group child - are you importing?", {field, fields})
                                            return null;
                                        }

                                        const child = fields[childIdx];
                                        return (
                                            <ListItem key={"child-" + child.name}>
                                                <FormFieldItem
                                                    {...makePropsForField(childIdx, child, field)}
                                                    updateField={(_childField) => {
                                                        clearGroupWhenChildSet(field, _childField);
                                                    }
                                                    }
                                                />
                                            </ListItem>
                                        )
                                    })}
                            </FormGroupItem>
                        )
                    } else if (isNotRadioBtn(field)) {
                        return (
                            <FormFieldItem key={"field-" + field.name} {...makePropsForField(idx, field)}/>
                        )
                    }
                    return null;
                })}
                <NewVariableDialog/>
            </div>
        </div>
    )
})

export default FormFieldList;
