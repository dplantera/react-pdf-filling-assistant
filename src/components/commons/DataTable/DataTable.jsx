import React, {useCallback, useEffect, useRef, useState} from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
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

const MyFooter = ({onDelete, ...rest}) => {
    const {state} = useGridSlotComponentProps();
    const hasSelectedRows = () => state?.selection?.length > 0;

    return <GridFooterContainer>
        <div style={{display: "flex", flexDirection: "column", paddingTop: "1rem"}}>
            <GridSelectedRowCount selectedRowCount={state?.selection?.length ?? 0}/>
            {hasSelectedRows() && <Button
                color="secondary"
                startIcon={<DeleteIcon/>}
                size={"small"}
                onClick={() => {
                    onDelete?.(state?.selection)
                }}
            >
                Delete
            </Button>}
        </div>
        <GridPagination {...rest}/>
    </GridFooterContainer>
}

const DataTable = ({tableData, tableSchema, onDelete, ...rest}) => {
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
            classes={{}}
            components={{
                Toolbar: GridToolbar,
                Footer: MyFooter,
            }}
            componentsProps={{
                footer: {rows: tableData, onDelete: onDelete},
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
    onCellEditCommit: PropTypes.func,
    onSelectionModelChange: PropTypes.func,
    onDelete: PropTypes.func
};