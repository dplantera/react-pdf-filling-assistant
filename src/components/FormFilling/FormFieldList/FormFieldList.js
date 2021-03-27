import React, {memo, useCallback, useState} from "react";
import FormFieldItem from "./ListItems/FormFieldItem";
import FormItemsControls from "./Controls/FormItemsControls";
import FormListControls from "./Controls/FormListControls";
import NewVariableDialog from "./NewVariableDialog";
import {useAddVariable} from "../../hooks/AddVariableContext";
import {useFormActions} from "../../hooks/FormActionContext";

const FormFieldList = memo((
    {
        pdfClient,
    }
) => {
    const {state: {fields, variables}, updateField, addVariableToField} = useFormActions();
    const {openVariableDialog} = useAddVariable();
    const [widthFormField, setWidthFormField] = useState(50);

    const _highlightFormField = useCallback((name, pageNum) => {
        pdfClient.selectField({name, location: {pageNum}})
    }, [pdfClient])

    const _resetHighlightFormField = useCallback((name) => {
        pdfClient.unselectField({name})
    }, [pdfClient])


    return (
        <div style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: `50%`,
            top: "10px",
            /*
                todo: get rid of that by a more sophisticated resizing logic
                this is a workaround: so the css resizing corner is more prominent to the user
                viewHeight - borderFieldList - top - parentTop - heightAppBar
            */
            height: `calc(100vh - 2px - 10px - 10px - 64px)`,
            minWidth: "35%",
            gap: "10px",
            resize: "horizontal",
            borderTop: "1px",
            borderBottom: "1px",
            overflow: "auto",
        }}
        >
            <FormListControls formVariables={variables}/>
            <FormItemsControls widthFormField={widthFormField} setWidthFormField={setWidthFormField}/>
            <div className={"field-list"} style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                gap: "10px",
                overflow: "auto",
                paddingTop: "10px"
            }}>
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
