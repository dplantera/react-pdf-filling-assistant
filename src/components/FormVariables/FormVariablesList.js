import React, {useState} from 'react';
import DataTable from "../commons/DataTable/DataTable";
import {useStore} from "../../store";
import "./FormVariablesList.css"
import VariablesIO from "../FormFilling/FormFieldList/Controls/VariablesIO";
import {useVariableDialog} from "../hooks/useVariableDialog";
import {FormVariable} from "../../model/types";

const defaultColumns = [
    {field: 'id', headerName: 'ID', width: 70,},
    {field: 'name', headerName: 'Name', width: 130, description: 'Name der Variable', editable: true},
    {field: 'value', headerName: 'Value', width: 130, description: 'Definition der Variable', editable: true},
    {field: 'exampleValue', headerName: 'Example', width: 130, description: 'Ausprägung der Variable', editable: true},
    {field: 'description', headerName: 'Description', sortable: false, width: 160, editable: true},
];

function copyObject(object, propBlacklist = []) {
    return Object.keys(object).reduce((copy, key) => {
        if (propBlacklist.includes(key))
            return copy;
        copy[key] = object[key];
        return copy;
    }, {})
}

const FormVariablesList = () => {
    const [variables, deleteVariables, updateVariable, addVariable] = useStore(state => [state.variables, state.deleteVariables, state.updateVariable, state.addVariable])
    const {VariableDialog, show} = useVariableDialog({defaultType: "edit"});

    const [columns] = useState(defaultColumns)

    const handleEditRow = (row) => show(row);
    const handleCreateRow = (row) => {
        const shouldDuplicate = Object.keys(row).length > 0;
        let newRow = FormVariable();
        if (shouldDuplicate)
            newRow = {...newRow, ...copyObject(row, ["id"])};
        addVariable(newRow)
        show(newRow, "new")
    };

    const handleDelete = (idsToDelete) => {
        console.debug("FormVariablesList: delete", {idsToDelete})
        const isSure = window.confirm(`Do you really want to delete these rows? (ID):\n> ${idsToDelete.join("\n> ")}`)
        if (isSure)
            deleteVariables(idsToDelete);
    }
    return (
        <div className={"form-variables-list"}>
            <div className={"variables-in-out"}>
                <VariablesIO/>
            </div>
            <DataTable tableData={variables} tableSchema={columns}
                       onDelete={handleDelete}
                       onCellEditCommit={(cell) => {
                           console.log({cell})
                           updateVariable({id: cell.id, [cell.field]: cell.value})
                       }}
                       onEdit={handleEditRow}
                       onCreate={handleCreateRow}
            />
            <VariableDialog/>
        </div>
    );
};

export default FormVariablesList;
