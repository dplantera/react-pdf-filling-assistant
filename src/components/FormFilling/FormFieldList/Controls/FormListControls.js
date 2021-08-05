import React, {useCallback} from 'react';
import VariablesIO from "./VariablesIO";
import {Button, TextField} from "@material-ui/core";
import {ClientDownload} from "../../../../utils/ClientDownload";
import {useStore} from "../../../../store";
import UploadDialog from "../../../commons/UploadDialog";
import {importFieldsFromCsv} from "../../../../model/import";

const downloadClient = new ClientDownload();
const downloadCsv = (e, fieldList, variables, fields) => {
    const fieldsInList = fields.filter(field => field.fieldListId === fieldList.id);
    const rows = fieldsInList.map(field => {
        const getVariable = (field) => variables.find(v => v.id === field.variable);
        let value = field.variable ? getVariable(field)?.value ?? "" : field.value || "";
        value = value.replace(/\r?\n|\r/g, '');
        return [field.name, value, field.description]
    })
    downloadClient.forCsv
        .changeSettings({useBOM: true})
        .download(rows, fieldList.name);
}

const FormListControls = () => {
    const [fieldLists, updateFieldList] = useStore(state => [state.fieldLists, state.updateFieldList])
    const [variables, updateVariables] = useStore(state => [state.variables, state.updateVariables])
    const [fields, updateFields] = useStore(state => [state.fields, state.updateFields])
    const addVariableToField = useStore(state => state.addVariableToField)

    const handleDownloadPdf = useCallback((e, index) => {
        downloadCsv(e, fieldLists[index], variables, fields)
    }, [variables, fieldLists, fields])

    // todo: refactor - move into own file
    const handleUploadCsv = (text, filename, options) => {
        const importResult = importFieldsFromCsv(text, fields, variables, addVariableToField);
        updateVariables(importResult.variables);
        updateFields(importResult.fields);
    };

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
                            style={{position: "relative", display: "flex", width: "100%", alignItems: "center", gap: "20px"}}>
                    <TextField id="standard-basic" label={`CSV ${fieldList.id}`} defaultValue={fieldList.name + ".csv"}
                               fullWidth={true}
                               onBlur={(e) => {
                                   fieldList.name = e.currentTarget.value;
                                   updateFieldList({index, name: e.currentTarget.value})
                               }}/>
                    <Button size={"small"} style={{height: "50%"}}
                            onClick={(e) => handleDownloadPdf(e, index)}>Download</Button>
                    <UploadDialog handleUpload={handleUploadCsv}
                                  title={"Template Hochladen"}/>
                </div>
            })}
            <VariablesIO/>
        </div>
    );
};

export default FormListControls;
