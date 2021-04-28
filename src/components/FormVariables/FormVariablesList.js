import React, {useCallback, useEffect, useRef, useState} from 'react';
import {DataGrid} from '@material-ui/data-grid';
import {ClientStorage} from "../../utils/ClientStorage";
import {FormVariable} from "../../model/types";

const storage = ClientStorage.instance;
const defaultColums = [
    {field: 'id', headerName: 'ID', width: 70,},
    {field: 'name', headerName: 'Name', width: 130, description: 'Name der Variable'},
    {field: 'value', headerName: 'Value', width: 130, description: 'Definition der Variable'},
    {field: 'exampleValue', headerName: 'Example', width: 130, description: 'Ausprägung der Variable'},
    {
        field: 'description',
        headerName: 'Description',
        sortable: false,
        width: 160,
        // valueGetter: (params) =>
        //     `${params.getValue('name') || ''} ${params.getValue('value') || ''}`,
    },
];


const getColSizes = (vars) => {

    const getMaxWidth = (key, entities) => {
        return entities.reduce( (acc, entity) => {
            if(typeof entity[key] === "string")
                return Math.max(acc, entity[key].length)

            if(entity[key] > 0)
                return Math.max(acc, entity[key])

            return acc;
        }, 0)
    }

    return vars.reduce((allVarSizes, varr) => {
        const varSizes = {};
        Object.keys(varr)
            .reduce((previous, varKey) => {
                previous[varKey] = getMaxWidth(varKey, [varr, allVarSizes, previous])
                return previous;
            }, varSizes)
        return {...allVarSizes, ...varSizes };
    }, {})
}


const FormVariablesList = () => {
    const [variables, setVariables] = useState([]);
    const [columns, setColumns] = useState(defaultColums)

    const columnsRef = useRef(columns);

    const updateColWidth = useCallback((vars) => {
            const scalePixelFactor = 10;
            const colSizes = getColSizes(vars);
            const uptCols = columnsRef.current.map(col => {
                const sizeContent = colSizes[col.field];
                if (sizeContent) {
                    return {...col, width: sizeContent * (scalePixelFactor)}
                }
                return col;
            })
            setColumns(uptCols);
        }, [setColumns, columnsRef], )

    useEffect(() => {
        storage.load(FormVariable)
            .then(vars => {
                vars.map(varr => {
                    console.log(varr.exampleValue, varr.exampleValue.length)
                    return varr;
                })
                setVariables(vars);
                updateColWidth(vars);
            });

    }, [setVariables, updateColWidth])

    return (
        <div style={{position: "relative", width: '100%'}}>
            <DataGrid rows={variables} columns={columns} pageSize={5} checkboxSelection  autoHeight autoPageSize/>
        </div>
    );
};

export default FormVariablesList;
