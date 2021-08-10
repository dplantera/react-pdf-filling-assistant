import React, {useState} from 'react';
import DataTable from "../commons/DataTable/DataTable";
import {useStore} from "../../store";
import "./FormVariablesList.css"
import VariablesIO from "../FormFilling/FormFieldList/Controls/VariablesIO";

const defaultColumns = [
    {field: 'id', headerName: 'ID', width: 70,},
    {field: 'name', headerName: 'Name', width: 130, description: 'Name der Variable', editable: true},
    {field: 'value', headerName: 'Value', width: 130, description: 'Definition der Variable', editable: true},
    {field: 'exampleValue', headerName: 'Example', width: 130, description: 'Ausprägung der Variable', editable: true},
    {field: 'description', headerName: 'Description', sortable: false, width: 160, editable: true},
];

const FormVariablesList = () => {
    const [variables, deleteVariables, updateVariable] = useStore(state => [state.variables, state.deleteVariables, state.updateVariable])
    const [columns] = useState(defaultColumns)

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
                       }
                       }
            />
        </div>
    );
};

export default FormVariablesList;
