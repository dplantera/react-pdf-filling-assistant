import React, {useState} from 'react';
import DataTable from "../commons/DataTable/DataTable";
import {useStore} from "../../store";
import "./FormVariablesList.css"
import VariablesIO from "../FormFilling/FormFieldList/Controls/VariablesIO";
import {useFormDialog} from "../hooks/useFormDialog";

const defaultColumns = [
    {field: 'id', headerName: 'ID', width: 70,},
    {field: 'name', headerName: 'Name', width: 130, description: 'Name der Variable', editable: true},
    {field: 'value', headerName: 'Value', width: 130, description: 'Definition der Variable', editable: true},
    {field: 'exampleValue', headerName: 'Example', width: 130, description: 'Ausprägung der Variable', editable: true},
    {field: 'description', headerName: 'Description', sortable: false, width: 160, editable: true},
];

const FormVariablesList = () => {
    const [variables, deleteVariables, updateVariable] = useStore(state => [state.variables, state.deleteVariables, state.updateVariable])
    const {RenderFormDialog, show, hide} = useFormDialog({
        title: "Add Form-Field Variable",
        options: {
            isRequired: (property) => ["name", "value"].includes(property),
            isMultiLine: (property) => ["value"].includes(property),
            getLabel: (fieldName) => {return {"name": "Name"}?.[fieldName] ?? fieldName}
        },
        fieldBlacklist: ["id"]
    })

    const [columns] = useState(defaultColumns)

    const handleEditRow = (row) => {
        show(row);
    }

    const handleClose = (formData) => {
        updateVariable(formData)
        hide();
    }
    const handleSubmit = (formData) => {
        updateVariable(formData)
        hide();
    }
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

            />
            <RenderFormDialog onClose={handleClose} onSubmit={handleSubmit}/>
        </div>
    );
};

export default FormVariablesList;
