import React, {useEffect, useRef} from 'react';
import FormVariablesList from "./FormVariablesList";
import {useVariableDialog} from "../hooks/useVariableDialog";
import {useCodeEditor} from "../hooks/useCodeEditor";
import {FormVariable} from "../../model/types";
import {useStore} from "../../store";


function copyObject(object, propBlacklist = []) {
    return Object.keys(object).reduce((copy, key) => {
        if (propBlacklist.includes(key))
            return copy;
        copy[key] = object[key];
        return copy;
    }, {})
}

const FormVariablesMain = () => {
    const refUpdateVariable = useRef(useStore.getState().updateVariable)
    const refAddVariable = useRef(useStore.getState().addVariable)
    const refDeleteVariables = useRef(useStore.getState().deleteVariables)

    useEffect(() => {
        useStore.subscribe(
            updateVariable => (refUpdateVariable.current = updateVariable),
            state => state.updateVariable
        )
        useStore.subscribe(
            addVariable => (refAddVariable.current = addVariable),
            state => state.addVariable
        )
        useStore.subscribe(
            deleteVariables => (refDeleteVariables.current = deleteVariables),
            state => state.deleteVariables
        )
    }, [])

    const {VariableDialog, show} = useVariableDialog({
        defaultType: "edit",
        updateVariable: refUpdateVariable.current,
        deleteVariables: refDeleteVariables.current,
        addVariable: refAddVariable.current
    });
    const {show: openCodeEditor, RenderCodeEditor} = useCodeEditor({defaultLanguage: "velocity"})

    const handleCellDoubleClick = (state) => {
        const {field, row} = state;
        if (field === "value")
            openCodeEditor(row.value, (code) => {
                console.log("handleCellDoubleClick", {row, code})
                refUpdateVariable.current({...row, value: code})
            });
    }

    const handleCreateRow = (row) => {
        const shouldDuplicate = Object.keys(row).length > 0;
        let newRow = FormVariable();
        if (shouldDuplicate)
            newRow = {...newRow, ...copyObject(row, ["id"])};
        show(newRow, "new")
    };

    const handleDeleteVariables = (idsToDelete) => {
        console.debug("FormVariablesList: delete", {idsToDelete})
        const isSure = window.confirm(`Do you really want to delete these rows? (ID):\n> ${idsToDelete.join("\n> ")}`)
        if (isSure)
            refDeleteVariables.current(idsToDelete);
    }

    const handleEditRow = (row) => show(row);

    return (
        <React.Fragment>
            <FormVariablesList onCreateRowVariable={handleCreateRow}
                               onEditVariableValue={handleCellDoubleClick}
                               onEditVariable={handleEditRow}
                               onPartialUpdateVariable={refUpdateVariable.current}
                               onDeleteVariable={handleDeleteVariables}/>
            <VariableDialog/>
            <RenderCodeEditor/>
        </React.Fragment>

    );
};

export default FormVariablesMain;
