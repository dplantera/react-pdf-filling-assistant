import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {List, ListSubheader} from "@material-ui/core";
import DisplayFileItem from "./DisplayFileItem";
import {Upload} from "../../../utils/upload";


const DisplayFileList = ({files, subheader, onSelectionChanged}) => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const getFilesFromSelection = (selection) => selection.sort().map(idxSelection => files[idxSelection]);

    const handleChecked = (checked, index) => {
        const isInSelection = selectedFiles.includes(index);
        if (checked && isInSelection)
            return
        const newSelection = checked
            ? [...selectedFiles, index]
            : selectedFiles.filter(idxSelection => idxSelection !== index);
        setSelectedFiles(newSelection)

        onSelectionChanged?.(getFilesFromSelection(newSelection))
    };

    const handleAction = async (fileId) => {
        const fileToOpen = files[fileId];
        const [data, fileName] = await Upload.uploadAsUint8(fileToOpen);
        console.debug("DisplayFileList.handleAction: ", {fileToOpen, fileName})

        const type = fileToOpen?.type?.endsWith("pdf") ? fileToOpen.type : "txt";
        const fileURL = URL.createObjectURL(new Blob(
            [data], {type}
        ));
        window.open(fileURL)
    };

    const renderSubHeader = () => {
        if (!subheader)
            return null;
        return (
            <ListSubheader component="div" id="nested-list-subheader">
                {subheader}
            </ListSubheader>
        )
    }

    useEffect(() => {
        const selection = files.map((file,idx) => {return idx});
        setSelectedFiles(selection);
        onSelectionChanged?.(getFilesFromSelection(selection))
    }, [files, setSelectedFiles])

    return (
        <React.Fragment>
            <List subheader={renderSubHeader()}>
                {files.map(({name, size, type}, idx) => <DisplayFileItem key={idx}
                                                                         itemId={idx}
                                                                         checked={selectedFiles.includes(idx)}
                                                                         fileName={name}
                                                                         fileType={type} fileSize={size}
                                                                         onChecked={handleChecked}
                                                                         onAction={handleAction}/>)}
            </List>

        </React.Fragment>
    );
};

DisplayFileList.propTypes = {
    files: PropTypes.array,
    onSelectionChanged: PropTypes.func
};

export default DisplayFileList;
