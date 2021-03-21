import React, {useEffect, useState} from "react";
import FormFieldItem from "./ListItems/FormFieldItem";
import FormItemsControls from "./Controls/FormItemsControls";
import FormListControls from "./Controls/FormListControls";
import NewVariableDialog from "./ListItems/NewVariableDialog";
import {FormVariable} from "../../../model/types";
import {useFormFields} from "../../hooks/FormContext";
import {useFormVariables} from "../../hooks/VariableContext";
import {AddVariableProvider} from "../../hooks/AddVariableContext";

const FormFieldList = (
    {
        highlightFormField,
        resetHighlightFormField,
    }
) => {
    const [fields, setFields] = useFormFields();
    const [formVariables, setFormVariables] = useFormVariables();
    const [widthFormField, setWidthFormField] = useState(50);

    useEffect(() => {
        fetch("/variables.json")
            .then(res => res.json())
            .then((data) => {
                const variablesFromDB = Object.keys(data).reduce((acc, key) => {
                    const entityType = data[key].type;
                    const attributes = data[key].attributes;

                    const vars = Object.keys(attributes)
                        .map(key => {
                            return FormVariable(
                                entityType.name + " " + key,
                                entityType.accessKey + "." + attributes[key].name,
                                attributes[key].description,
                                attributes[key].exampleValue
                            )
                        })
                    return [...acc, ...vars];
                }, []);
                setFormVariables(variablesFromDB)
            })
    }, [setFormVariables])

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
            <FormListControls formVariables={formVariables}/>
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
                <AddVariableProvider>
                    {fields.map((field, idx) => {
                        return <FormFieldItem
                            field={field}
                            key={"field-" + field.name}
                            itemKey={"field-" + field.name}
                            idx={idx}
                            setFields={setFields}
                            widthFormField={widthFormField}
                            resetHighlightFormField={resetHighlightFormField}
                            highlightFormField={highlightFormField}
                        />
                    })}
                    <NewVariableDialog/>
                </AddVariableProvider>
            </div>
        </div>
    );
};

export default FormFieldList;
