import React, {useState} from 'react';
import DataTable from "../commons/DataTable/DataTable";
import {useStore} from "../../store";
import "./FormVariablesList.css"
import VariablesIO from "../FormFilling/FormFieldList/Controls/VariablesIO";

const defaultColumns = [
    {field: 'id', headerName: 'ID', width: 70,},
    {field: 'name', headerName: 'Name', width: 130, description: 'Name der Variable', editable: true},
    {field: 'value', headerName: 'Value', width: 130, description: 'Definition der Variable', editable: true},
    {field: 'exampleValue', headerName: 'Example', width: 130, description: 'Ausprägung der Variable'},
    {
        field: 'description',
        headerName: 'Description',
        sortable: false,
        width: 160,
    },
];

const FormVariablesList = () => {
    const [variables, deleteVariables] = useStore(state => [state.variables, state.deleteVariables])
    const [columns] = useState(defaultColumns)

    const handleDelete = (idsToDelete) => {
        console.debug("FormVariablesList: delete", {idsToDelete})
        const isSure = window.confirm(`Do you really want to delete these rows? (ID):\n> ${idsToDelete.join("\n> ")}`)
        if (isSure)
            deleteVariables(idsToDelete);
    }
    return (
        <div className={"form-variables-list"}>
            <div style={{width: "50%", paddingLeft: "25px"}}>
                <VariablesIO/>
            </div>
            <DataTable tableData={variables} tableSchema={columns} onDelete={handleDelete}
            />
        </div>
    );
};

export default FormVariablesList;
