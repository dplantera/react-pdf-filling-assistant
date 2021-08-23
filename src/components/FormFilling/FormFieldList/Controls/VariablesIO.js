import React, {useState} from 'react';
import {Button, TextField} from "@material-ui/core";
import {ClientDownload} from "../../../../utils/ClientDownload";
import {useStore} from "../../../../store";
import {FormVariable} from "../../../../model/types";
import UploadDialog from "../../../commons/UploadDialog";

const downloadClient = new ClientDownload();

const VariablesIO = () => {
    const [fileName, setFileName] = useState("variables")
    const [variables, updateVariables] = useStore(state => [state.variables, state.updateVariables])

    const downloadCsv = (e, variables) => {
        const rows = variables.map(variable => {
            const getOneLineString = (string) => {
                let outStr = string ?? "";
                return outStr.replace(/\r?\n|\r/g, '')
            };
            const value = getOneLineString(variable.value);
            return [variable.name, value, variable.description, variable.exampleValue]
        })
        downloadClient.forCsv.download(rows, fileName);
    }

    function handleUploadCsv(text, filename) {
        //name;value;desc;example
        const rows = text.split("\n");
        const vars = rows.reduce((result, row) => {
            const [name, value, desc, example] = row.split(";");

            const isEmpty = (str) => {
                return str === null || !(str?.length > 0);
            }

            if (isEmpty(name) && isEmpty(value))
                return result;

            const getVarCandidate = (name, value) => {
                if (!isEmpty(name) && isEmpty(value)) return FormVariable(name, name, desc, example);
                if (isEmpty(name) && !isEmpty(value)) return FormVariable(value, value, desc, example);
                return FormVariable(name, value, desc, example);

            }
            result.push(getVarCandidate(name, value));

            return result;
        }, [])

        const ignored = [];
        const overwritten = [];
        const newVariables = [];
        const existingVariables = [...variables];
        vars.forEach(varCandidate => {
            const isEqual = (candidate, other) => {
                if (!other) return false;
                return candidate.id === other.id || candidate.value === other.value;
            }
            const idxExisting = existingVariables.findIndex(existVar => isEqual(varCandidate, existVar));
            const isNewVariable = idxExisting === -1;
            if (isNewVariable) {
                newVariables.push(varCandidate);
            } else {
                const existing = existingVariables[idxExisting];
                overwritten.push(existing);
                existingVariables[idxExisting] = {...existing, ...varCandidate};
            }
        })

        if (newVariables.length <= 0 && overwritten.length <= 0) {
            console.info("VariablesIO: variables up-to-date.", {newVariables, overwritten, ignored})
            return
        }

        console.info("VariablesIO: done uploading.", {newVariables, overwritten, ignored})
        updateVariables([...variables, ...newVariables]);
    }

    return (
        <div style={{position: "relative", display: "flex", width: "100%", alignItems: "center", gap: " 20px"}}>
            <TextField id="vars-export-name" label={`Variables export name`} defaultValue={fileName + ".csv"}
                       fullWidth={true}
                       onBlur={(e) => {
                           setFileName(e.currentTarget.value)
                       }}/>

            <UploadDialog onUploadText={handleUploadCsv}
                          acceptedFileExt={[".csv"]}
                          title={"Upload Variables"}/>
            <Button id="btn-vars-download" size={"small"} style={{height: "50%"}}
                    onClick={(e) => downloadCsv(e, variables)}>Download</Button>
        </div>
    );
};

export default VariablesIO;
