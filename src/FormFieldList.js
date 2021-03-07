import {Button, Card, TextField} from "@material-ui/core";
import React from "react";
import {FieldList} from "./model";

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

    const rows = fieldList.fields.map(fl => [fl.name, fl.value, fl.description])
    let csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(settings.separator)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fieldList.name + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click();
}


const FormFieldList = ({fieldLists, fields, highlightFormField, resetHighlightFormField}) => {

    const renderFields = (fields) => {
        return fields.map((field, idx) => {
            return <div key={"field-" + idx + "-" + field.name}
                        style={{position: "relative", display: "flex", width: "100%"}}>
                <TextField
                    id={field.name}
                    label={field.name}
                    defaultValue={field.value}
                    variant="outlined"
                    onBlur={(e) => {
                        updateFieldValue(e, field);
                        resetHighlightFormField(e, field)
                    }}
                    onFocus={(e) => highlightFormField(e, field)}
                />
                <TextField
                    id={"desc-" + field.name}
                    label={"Beschreibung"}
                    variant="outlined"
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
                           onBlur={(e) => {fieldList.name = e.currentTarget.value;}}/>
                <Button size={"small"} style={{height: "50%"}} onClick={(e) => downloadCsv(e, fieldList)}>Download</Button>
            </div>
        })
    }

    return (
        <Card variant="outlined" style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "30%",
            height: "98%",
            gap: "10px",
            overflow: ""
        }}>
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

        </Card>
    );
};

export default FormFieldList;
