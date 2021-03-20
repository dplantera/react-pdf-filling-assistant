import React, {useState} from "react";
import FormFieldItem from "./ListItems/FormFieldItem";
import FormItemsControls from "./Controls/FormItemsControls";
import FormListControls from "./Controls/FormListControls";


const FormFieldList = (
    {
        fieldLists,
        setFields,
        fields,
        highlightFormField,
        resetHighlightFormField,
        formVariables,
        setFormVariables
    }
) => {
    const [widthFormField, setWidthFormField] = useState(50);

    const updateFieldDesc = (e, field, idx) => {
        if ((e && !e.currentTarget.value) || !field.description)
            return

        const copyFields = [...fields];
        if (e && idx)
            copyFields[idx].description = e.currentTarget.value;
        else if (field.description && idx)
            copyFields[idx].description = field.description;

        setFields(copyFields);
        console.log(`updated desc '${field.name}': ${field.description}`)
    }

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
            <FormListControls fieldLists={fieldLists} formVariables={formVariables}/>
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
                        field={field}
                        key={"field-" + field.name}
                        idx={idx}
                        widthFormField={widthFormField}
                        formVariables={formVariables}
                        setFormVariables={setFormVariables}
                        updateFieldDesc={(e, field) => updateFieldDesc(e, field, idx)}
                        resetHighlightFormField={resetHighlightFormField}
                        highlightFormField={highlightFormField}
                    />
                })}
            </div>
        </div>
    );
};

export default FormFieldList;
