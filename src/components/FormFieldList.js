import {Button, TextField} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import ResizeableCard from "./ResizeableCard";
import {ClientDownload} from "../utils/ClientDownload";
import FormFieldVariable from "./FormFieldVariable";
import {FormVariable} from "../pdf-backend/model"

const downloadClient = new ClientDownload();


const downloadCsv = (e, fieldList) => {
    const rows = fieldList.fields.map(field => {
        let value = field.variable ? field.variable.value : field.value || "";
        value = value.replace(/\r?\n|\r/g, '');
        return [field.name, value, field.description]
    })
    downloadClient.forCsv.download(rows, fieldList.name);
}


const FormFieldList = ({fieldLists, setFields, fields, highlightFormField, resetHighlightFormField}) => {
    const [width, setWidth] = useState(100);
    const [formVariables, setFormVariables] = useState([]);

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === " ") {

                const fieldDiv = e.target;
                const formField = fields.find(field => {
                    const targetName = fieldDiv.id;
                    console.log(field.name, fieldDiv.id)
                    return field.name === targetName
                })
                console.log("combo!", fieldDiv.selectionStart, fieldDiv.selectionEnd, fieldDiv.id, fieldDiv, formField)
                if (!formField)
                    return;
            }
        })
    }, [fields])

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

                setFormVariables(variablesFromDB);
            })
    }, [setFormVariables])

    const updateFieldDesc = (e, field, idx) => {
        if((e && !e.currentTarget.value ) || !field.description)
            return

        const copyFields = [...fields];
        if(e && idx)
            copyFields[idx].description = e.currentTarget.value;
        else if (field.description && idx)
            copyFields[idx].description = field.description;

        setFields(copyFields);
        console.log(`updated desc '${field.name}': ${field.description}`)
    }

    const renderFields = (fields) => {
        return fields.map((field, idx) => {
            return <div key={"field-" + idx + "-" + field.name}
                        style={{position: "relative", display: "flex", width: "100%"}}>
                <ResizeableCard overflow={"visible"} width={width}>
                    <FormFieldVariable
                        field={field}
                        formVariables={formVariables}
                        updateFieldDesc={(e, field) => updateFieldDesc(e, field, idx)}
                        setFormVariables={setFormVariables}
                        resetHighlightFormField={resetHighlightFormField}
                        highlightFormField={highlightFormField}
                    />
                </ResizeableCard>
                <TextField
                    multiline={true}
                    id={"desc-" + field.name}
                    label={"Beschreibung"}
                    variant="outlined"
                    fullWidth={true}
                    value={field.description}
                    onBlur={(e) => {
                        updateFieldDesc(e, field);
                        resetHighlightFormField(e, field)
                    }}
                    onFocus={(e) => highlightFormField(e, field)}
                />
            </div>
        })
    }

    const renderFieldListControl = (fieldLists) => {
        return fieldLists.map((fieldList) => {
            return <div key={fieldList.name}
                        style={{position: "relative", display: "flex", width: "100%", alignItems: "center"}}>
                <TextField id="standard-basic" label={`CSV ${fieldList.id}`} defaultValue={fieldList.name + ".csv"}
                           fullWidth={true}
                           onBlur={(e) => {
                               fieldList.name = e.currentTarget.value;
                           }}/>
                <Button size={"small"} style={{height: "50%"}}
                        onClick={(e) => downloadCsv(e, fieldList)}>Download</Button>
            </div>
        })
    }

    console.log("rendered fieldlist...")
    return (
        <ResizeableCard defaultWidth={30}>
            <div className={"field-list-controls"} style={{
                position: "relative",
                display: "flex",
                width: "98%",
                maxHeight: "10%",
                gap: "10px",
                // border: "3px solid"
            }}>
                {renderFieldListControl(fieldLists)}
            </div>
            <div className={"field-list-controls"} style={{
                position: "relative",
                display: "flex",
                width: "98%",
                maxHeight: "10%",
                gap: "10px",
                // border: "3px solid"
            }}>
                <Button variant={"contained"} size={"small"} style={{height: "100%"}} onClick={(e) => {
                    if (width <= 50)
                        setWidth(100)
                    else setWidth(50)
                }}>Beschreibung umschalten</Button>
            </div>
            <div className={"field-list"} style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                gap: "10px",
                overflow: "auto"
            }}>
                {renderFields(fields)}
            </div>
        </ResizeableCard>
    );
};

export default FormFieldList;
