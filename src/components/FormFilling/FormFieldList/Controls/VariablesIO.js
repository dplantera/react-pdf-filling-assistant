import React, {useState} from 'react';
import UploadVariables from "./UploadVariables";
import {Button, TextField} from "@material-ui/core";
import {ClientDownload} from "../../../../utils/ClientDownload";
import {useStore} from "../../../../store";

const downloadClient = new ClientDownload();

const VariablesIO = () => {
    const [fileName, setFileName] = useState("variables")
    const [variables, addVariables] = useStore( state => [state.variables, state.addVariables])

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

    return (
        <div style={{position: "relative", display: "flex", width: "100%", alignItems: "center", gap: " 20px"}}>
            <TextField id="vars-export-name" label={`Variables export name`} defaultValue={fileName + ".csv"}
                       fullWidth={true}
                       onBlur={(e) => {
                           setFileName(e.currentTarget.value)
                       }}/>
            <Button id="btn-vars-download" size={"small"} style={{height: "50%"}}
                    onClick={(e) => downloadCsv(e, variables)}>Download</Button>
            <UploadVariables formVariables={variables} addVariables={addVariables}/>
        </div>
    );
};

export default VariablesIO;
