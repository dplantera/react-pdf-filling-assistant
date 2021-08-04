import React, {useCallback} from 'react';
import VariablesIO from "./VariablesIO";
import {Button, TextField} from "@material-ui/core";
import {ClientDownload} from "../../../../utils/ClientDownload";
import {useStore} from "../../../../store";
import UploadDialog from "../../../commons/UploadDialog";
import {FormVariable} from "../../../../model/types";

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
        //name;value;desc;example
        const rows = text.split("\n");

        // field candidate must exist in current FieldList. Before changing this we need to support multiple FieldLists
        const fieldCandidates = rows.reduce((result, row) => {
            const [name, value, desc, example] = row.split(";");

            const isEmpty = (str) => {
                return str === null || str?.length <= 0;
            }

            if (isEmpty(name) || isEmpty(value))
                return result;

            const idxExistingField = fields.findIndex(field => field.name === name);
            if (idxExistingField < 0)
                return result;

            const newField = {...fields[idxExistingField], value};

            if (desc)
                newField.description = desc;
            if (example)
                newField.example = example;

            result.push(newField);
            return result;
        }, [])

        const newFields = [], ignoredField = [], error = [], newVariables = [];
        console.debug("FormListControl: evaluating candidates: ", fieldCandidates);
        fieldCandidates.forEach(fieldCandidate => {
            const idxExistingField = fields.findIndex(field => field.id === fieldCandidate.id);
            if (idxExistingField < 0) {
                console.warn("FormListControl: no existingField (did you load the correct pdf?)");
                error.push(fieldCandidate);
                return;
            }

            const existingField = fields[idxExistingField];
            const isValueMatching = existingField && existingField.value === fieldCandidate.value;
            if (isValueMatching) {
                ignoredField.push(existingField);
                return;
            }

            if (!isValueMatching) {
                fieldCandidate.id = null;
                newFields.push(fieldCandidate);

                let existingVariable = variables.find(variable => variable.id === existingField.variable || variable.value === fieldCandidate.value);

                let needsNewVariable = !existingVariable || existingVariable.id !== existingField.variable;
                if (needsNewVariable) {
                    let newVariable = FormVariable(fieldCandidate.value, fieldCandidate.value, fieldCandidate.description, fieldCandidate.example);

                    if(existingVariable?.id === newVariable.id)
                        console.debug("FormListControl: variable exists ", {existingVariable, newVariable})

                    newVariables.push(newVariable)
                    addVariableToField(newVariable, existingField).then(() =>
                        console.log("FormListControl: addVariableToField", {existingField, newVariable})
                    )
                }
            }
        })
        if (error.length > 0)
            console.error("FormListControl: error loading fields", {error})

        let result = {newFields, ignoredField, newVariables};
        if(fieldCandidates.length === ignoredField.length) {
            console.info("FormListControl: all fields ignored", result);
            return;
        }

        if (newFields.length <= 0 && error.length <= 0) {
            console.info("FormListControl: fields up-to-date", result);
            return;
        }

        console.debug("FormListControl: updating fields and variables", result)
        updateVariables([...variables, ...newVariables]);
        updateFields(fields);
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
