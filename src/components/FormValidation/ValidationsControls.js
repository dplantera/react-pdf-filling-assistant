import React, {useCallback} from 'react';
import {Box, Button, TextField} from "@mui/material";
import {useStore} from "../../store";
import {exportFieldListAsCsv} from "../actions/exportActions";

const ValidationsControls = () => {
    const [fieldLists, updateFieldList] = useStore(state => [state.fieldLists, state.updateFieldList])
    const variables = useStore(state => state.variables);
    const fields = useStore(state => state.fields);

    const settings = useStore(state => state.settings);

    const handleDownloadFields = useCallback(() => {
        exportFieldListAsCsv(fieldLists[0], variables, fields, settings.getSettings())
    }, [variables, fieldLists, fields, settings])

    const handleUpdateFieldListName = useCallback((e) => {
        const index = 0;
        fieldLists[index].name = e.currentTarget.value;
        updateFieldList({index, name: e.currentTarget.value})
    }, [fieldLists, updateFieldList])

    const makeNameWithExtension = (name) => {
        if (!name)
            return "template.csv"
        if (name.endsWith(".csv"))
            return name;
        if (name.endsWith(".pdf"))
            return name.replace(".pdf", ".csv")
        return name + ".csv";
    }

    return (
        <Box container item
             flexDirection={"row"}
             position={"relative"}
             justifyContent={"center"}
             alignContent={"center"}
        >
            <TextField id="standard-basic" label={`Template (csv)`}
                       defaultValue={makeNameWithExtension(fieldLists?.[0]?.name)}
                       variant={"filled"}
                       size={"small"}
                       onBlur={handleUpdateFieldListName}/>
            <Button size={"small"}
                    sx={{
                        color: "#3f51b5",
                        fontWeight: "bold",
                        flexBasis: "10%",
                    }}
                    onClick={handleDownloadFields}>Download Template</Button>
        </Box>
    );
};

export default ValidationsControls;
