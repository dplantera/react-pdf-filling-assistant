import React, {memo, useCallback, useState} from "react";
import FormFieldItem from "./ListItems/FormFieldItem";
import FormItemsControls from "./Controls/FormItemsControls";
import FormListControls from "./Controls/FormListControls";
import NewVariableDialog from "./NewVariableDialog";
import {useAddVariable} from "../../hooks/AddVariableContext";
import {useStore} from "../../../store";
import "./FormFieldList.css"

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


    return (
        <div className={"field-list-container"}>
            <FormListControls formVariables={variables}/>
            <FormItemsControls widthFormField={widthFormField} setWidthFormField={setWidthFormField}/>
            <div className={"field-list"} >
                {fields.map((field, idx) => {
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
                })}
                <NewVariableDialog/>
            </div>
        </div>
    );
});

export default FormFieldList;
