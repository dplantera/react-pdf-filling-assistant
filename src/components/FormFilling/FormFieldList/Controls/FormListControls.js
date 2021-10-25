import React, {useCallback} from 'react';
import {Button, TextField} from "@material-ui/core";
import {useStore} from "../../../../store";
import UploadDialog from "../../../commons/UploadDialog";
import {importFieldsAndVarsFromCsv} from "../../../actions/importActions";
import {exportFieldListAsCsv} from "../../../actions/exportActions";

const FormListControls = () => {
    const [fieldLists, updateFieldList] = useStore(state => [state.fieldLists, state.updateFieldList])
    const [variables, updateVariables] = useStore(state => [state.variables, state.updateVariables])
    const [fields, updateFields] = useStore(state => [state.fields, state.updateFields])
    const settings = useStore(state => state.settings)
    const addVariableToField = useStore(state => state.addVariableToField)

    const handleDownloadPdf = useCallback((e, index) => {
        exportFieldListAsCsv(fieldLists[index], variables, fields, settings.getSettings())
    }, [variables, fieldLists, fields, settings])

    const handleUploadCsv = (text, filename) => {
        const importResult = importFieldsAndVarsFromCsv(text, fields, variables, addVariableToField);
        updateVariables(importResult.newVariables);
        updateFields(importResult.newFields);
    };

    const makeNameWithExtension = (name) => {
        if(!name)
            return "template.csv"
        if(name.endsWith(".csv"))
            return name;
        if(name.endsWith(".pdf"))
            return name.replace(".pdf", ".csv")
        return name + ".csv";
    }

    return (
        <div className={"field-list-controls"} >
            {fieldLists.map((fieldList, index) => {
                return <div key={fieldList.name}
                            style={{position: "relative", display: "flex", width: "100%", alignItems: "center", gap: "20px"}}>
                    <TextField id="standard-basic" label={`CSV ${index}`} defaultValue={makeNameWithExtension(fieldList.name)}
                               fullWidth={true}
                               onBlur={(e) => {
                                   fieldList.name = e.currentTarget.value;
                                   updateFieldList({index, name: e.currentTarget.value})
                               }}/>
                    <UploadDialog onUploadText={handleUploadCsv}
                                  acceptedFileExt={[".csv"]}
                                  title={"Upload Variables"}/>
                    <Button size={"small"} style={{height: "50%"}}
                            onClick={(e) => handleDownloadPdf(e, index)}>Download</Button>
                </div>
            })}
        </div>
    );
};

export default FormListControls;
