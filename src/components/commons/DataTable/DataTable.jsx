import React, {useCallback, useEffect, useRef, useState} from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';

import {
    DataGrid,
    GridFooterContainer,
    GridPagination,
    GridSelectedRowCount,
    GridToolbar, useGridSlotComponentProps
} from '@material-ui/data-grid';
import "./DataTable.css"
import {determineTableSchema, updateColumnsWidth} from "./dataTableHelper";
import PropTypes from "prop-types";
import {Button} from "@material-ui/core";

const MyFooter = ({onDelete, onEdit, onCreate, ...rest}) => {
    const {state} = useGridSlotComponentProps();
    const hasSelectedRows = () => state?.selection?.length > 0;
    const isOnlyOneRowSelected = () => state?.selection?.length === 1;

    const getFirstSelectedRowData = () => {
        const idSelectedRow = state?.selection?.[0] ?? "";
        return state?.rows.idRowsLookup?.[idSelectedRow] ?? {};
    }

    return <GridFooterContainer>
        <div style={{display: "flex", paddingTop: "1rem"}}>
            <GridSelectedRowCount selectedRowCount={state?.selection?.length ?? 0}/>
            {(!hasSelectedRows() || isOnlyOneRowSelected()) && <Button
                color="primary"
                startIcon={<AddIcon/>}
                size={"small"}
                onClick={() => {
                    onCreate?.(getFirstSelectedRowData())
                }}
            >{isOnlyOneRowSelected() ? "Copy" : "Add"} </Button>}
            {hasSelectedRows() && <Button
                color="secondary"
                startIcon={<DeleteIcon/>}
                size={"small"}
                onClick={() => {
                    onDelete?.(state?.selection)
                }}
            >Delete </Button>}
            {isOnlyOneRowSelected() && <Button
                color="primary"
                startIcon={<EditIcon/>}
                size={"small"}
                onClick={() => {
                    onEdit?.(getFirstSelectedRowData())
                }}
            >Edit</Button>}
        </div>
        <GridPagination {...rest}/>
    </GridFooterContainer>
}

const DataTable = ({tableData, tableSchema, onDelete, onEdit, onCreate, onCellDoubleClick, ...rest}) => {
    const [columns, setColumns] = useState(determineTableSchema(tableData, tableSchema))
    const {pages, setPages} = useState(100);

    const columnsRef = useRef(columns);

    const updateColWidth = useCallback((data) => {
        setColumns(updateColumnsWidth(data, columnsRef.current));
    }, [setColumns, columnsRef],)

    useEffect(() => {
        updateColWidth(tableData);
    }, [tableData, updateColWidth])

    return (
        <DataGrid
            rows={tableData} columns={columns} checkboxSelection pageSize={pages} onPageSizeChange={setPages}
            onCellDoubleClick={onCellDoubleClick}
            classes={{}}
            components={{
                Toolbar: GridToolbar,
                Footer: MyFooter,
            }}
            componentsProps={{
                footer: {rows: tableData, onDelete, onEdit, onCreate},
            }}
            density={"compact"}
            {...rest}

        />
    );
};

export default DataTable;

DataTable.propTypes = {
    tableData: PropTypes.array,
    tableSchema: PropTypes.array,
    onEdit: PropTypes.func,
    onCreate: PropTypes.func,
    onDelete: PropTypes.func,
    onCellDoubleClick: PropTypes.func,
    onCellEditCommit: PropTypes.func,
};