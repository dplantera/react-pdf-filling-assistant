import React, {memo, useCallback, useState} from "react";
import FormFieldItem from "./ListItems/FormFieldItem";
import FormItemsControls from "./Controls/FormItemsControls";
import FormListControls from "./Controls/FormListControls";
import NewVariableDialog from "./NewVariableDialog";
import {useAddVariable} from "../../hooks/AddVariableContext";
import {useStore} from "../../../store";
import {FieldTypes} from "../../../model/types";
import FormGroupItem from "./ListItems/FormGroupItem";

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
    const {variables, fields, updateField , addVariableToField} = useStore(storeSelector);

    const {openVariableDialog} = useAddVariable();
    const [widthFormField, setWidthFormField] = useState(50);

    const _highlightFormField = useCallback((name, pageNum) => {
        pdfClient.selectField({name, location: {pageNum}})
    }, [pdfClient])

    const _resetHighlightFormField = useCallback((name) => {
        pdfClient.unselectField({name})
    }, [pdfClient])

    const RenderRadioButton = ({groupField}) => {

        return <FormGroupItem
            groupField={groupField}
            groupChildren={groupField.groupInfo.children.map(childName => fields.find(({name}) => childName === name ))}
            variables={variables}
            openVariableDialog={openVariableDialog}
            addVariableToField={addVariableToField}
            updateField={updateField}
            widthFormField={widthFormField}
            resetHighlightFormField={_resetHighlightFormField}
            highlightFormField={_highlightFormField}
        />
    }

    return (
        <div className={"field-list-container"}>
            <FormListControls formVariables={variables}/>
            <FormItemsControls widthFormField={widthFormField} setWidthFormField={setWidthFormField}/>
            <div className={"field-list"} >
                {fields.map((field, idx) => {
                    if(field.type.name === FieldTypes.RADIO.name && !field.groupInfo.parent)
                        return <RenderRadioButton key={idx} groupField={field}/>
                    else if (field.type.name !== FieldTypes.RADIO.name)
                    {
                        return <FormFieldItem
                            key={"field-" + field.name}
                            idx={idx}
                            fieldId={field.id}
                            fieldValue={field.value}
                            fieldName={field.name}
                            fieldDescription={field.description}
                            fieldPageNum={field.location?.pageNum}
                            variables={variables}
                            //causes rerender
                            openVariableDialog={openVariableDialog}
                            addVariableToField={addVariableToField}
                            updateField={updateField}
                            widthFormField={widthFormField}
                            resetHighlightFormField={_resetHighlightFormField}
                            highlightFormField={_highlightFormField}
                        />
                    }
                    return null;
                })}
                <NewVariableDialog/>
            </div>
        </div>
    );
});

export default FormFieldList;
