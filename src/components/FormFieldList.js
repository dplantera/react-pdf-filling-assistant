import {Button, TextField} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import ResizeableCard from "./ResizeableCard";

const updateFieldDesc = (e, field) => {
    field.description = e.currentTarget.value;
    console.log(`updated desc '${field.name}': ${field.description}`)
}

const updateFieldValue = (e, field) => {
    field.value = e.currentTarget.value;
    console.log(`updated value '${field.name}': ${field.value}`)
}

const downloadCsv = (e, fieldList) => {
    const separator_default = ";";
    const settings = {separator: separator_default};

    const rows = fieldList.fields.map(fl => {
        const value = fl.value ? fl.value.replace(/\r?\n|\r/g, '') : "";
        return [fl.name, value, fl.description]
    })
    let csvContent = rows.map(e => e.join(settings.separator)).join("\n");
    let universalBOM = "\uFEFF";

    const encodedUri = encodeURIComponent(universalBOM + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
    link.setAttribute("download", fieldList.name + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click();
}


const FormFieldList = ({fieldLists, fields, highlightFormField, resetHighlightFormField}) => {
    const [width, setWidth] = useState(100);

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === " ") {
                const fieldDiv = e.target;
                const formField = fields.find(field => {
                    const targetName = fieldDiv.id;
                    return field.name === targetName
                })
                if (!formField)
                    return;

                console.log("combo!", fieldDiv.selectionStart, fieldDiv.selectionEnd, fieldDiv, formField)
            }
        })
    }, [])

    const renderFields = (fields) => {
        return fields.map((field, idx) => {
            return <div key={"field-" + idx + "-" + field.name}
                        style={{position: "relative", display: "flex", width: "100%"}}>
                <ResizeableCard overflow={"visible"} width={width}>
                    <TextField multiline={true}
                               id={field.name}
                               label={field.name}
                               defaultValue={field.value}
                               fullWidth={true}
                               variant="outlined"
                               onBlur={(e) => {
                                   updateFieldValue(e, field);
                                   resetHighlightFormField(e, field)
                               }}
                               style={{fontFmily: 'Source Code Pro'}}
                               onFocus={(e) => highlightFormField(e, field)}
                    />
                </ResizeableCard>
                <TextField
                    multiline={true}
                    id={"desc-" + field.name}
                    label={"Beschreibung"}
                    variant="outlined"
                    fullWidth={true}
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
