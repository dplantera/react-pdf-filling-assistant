import React from 'react';
import VariablesIO from "./VariablesIO";
import {Button, TextField} from "@material-ui/core";
import {ClientDownload} from "../../../../utils/ClientDownload";
import {useFieldLists} from "../../../hooks/FieldListsContext";

const downloadClient = new ClientDownload();
const downloadCsv = (e, fieldList) => {
    const rows = fieldList.fields.map(field => {
        let value = field.variable ? field.variable.value : field.value || "";
        value = value.replace(/\r?\n|\r/g, '');
        return [field.name, value, field.description]
    })
    downloadClient.forCsv.download(rows, fieldList.name);
}

const FormListControls = () => {
    const [fieldLists] = useFieldLists();

    return (
        <div className={"field-list-controls"} style={{
            position: "relative",
            display: "flex",
            width: "98%",
            maxHeight: "10%",
            gap: "10px",
            flexDirection: "column",
            // border: "3px solid"
        }}>
            {fieldLists.map((fieldList) => {
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
            })}
            <VariablesIO />
        </div>
    );
};

export default FormListControls;
