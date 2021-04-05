import React, {useCallback} from 'react';
import VariablesIO from "./VariablesIO";
import {Button, TextField} from "@material-ui/core";
import {ClientDownload} from "../../../../utils/ClientDownload";
import {useFormActions} from "../../../hooks/FormActionContext";

const downloadClient = new ClientDownload();
const downloadCsv = (e, fieldList, variables, fields) => {
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        const getVariable = (field) => variables.find( v => v.id === field.variable);
        let value = field.variable ? getVariable(field)?.value: field.value || "";
        value = value.replace(/\r?\n|\r/g, '');
        return [field.name, value, field.description]
    })
    downloadClient.forCsv.download(rows, fieldList.name);
}

const FormListControls = () => {
    const {state: {fieldLists, variables, fields}, updateFieldList } = useFormActions();

    const handleDownloadPdf = useCallback((e, index) => {
        downloadCsv(e, fieldLists[index], variables, fields)
    }, [variables, fieldLists, fields])

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
            {fieldLists.map((fieldList, index) => {
                return <div key={fieldList.name}
                            style={{position: "relative", display: "flex", width: "100%", alignItems: "center"}}>
                    <TextField id="standard-basic" label={`CSV ${fieldList.id}`} defaultValue={fieldList.name + ".csv"}
                               fullWidth={true}
                               onBlur={(e) => {
                                   fieldList.name = e.currentTarget.value;
                                   updateFieldList({index, name:e.currentTarget.value})
                               }}/>
                    <Button size={"small"} style={{height: "50%"}}
                            onClick={(e) => handleDownloadPdf(e, index)}>Download</Button>
                </div>
            })}
            <VariablesIO />
        </div>
    );
};

export default FormListControls;
