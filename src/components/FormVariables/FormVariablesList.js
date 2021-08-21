import React, {memo, useState} from 'react';
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


const FormVariablesList = ({onCreateRowVariable, onEditVariable, onEditVariableValue, onPartialUpdateVariable, onDeleteVariable}) => {
    const variables = useStore(state => state.variables)
    const [columns] = useState(defaultColumns)

    const handleCellUpdate = (cell) => {
        onPartialUpdateVariable?.({id: cell.id, [cell.field]: cell.value})
    }

    return (
        <div className={"form-variables-list"}>
            <div className={"variables-in-out"}>
                <VariablesIO/>
            </div>
            <DataTable tableData={variables} tableSchema={columns}
                       onDelete={onDeleteVariable}
                       onCellEditCommit={handleCellUpdate}
                       onEdit={onEditVariable}
                       onCreate={onCreateRowVariable}
                       onCellDoubleClick={onEditVariableValue}
            />
        </div>
    );
};

export default memo(FormVariablesList);
