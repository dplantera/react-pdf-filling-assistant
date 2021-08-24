import React from 'react';
import PropTypes from 'prop-types';
import {List, ListSubheader} from "@material-ui/core";
import DisplayFileItem from "./DisplayFileItem";
import {Upload} from "../../../utils/upload";


const DisplayFileList = ({files, selectedFiles, subheader, onSelectionChanged}) => {

    const findByNameAndSize = (_files, name, size) => {
        return _files.find(file => file.name === name && file.size === size)
    }
    const containsByNameAndSize = (_selection, fileName, fileSize) => {
        return _selection.some(file => file.name === fileName && file.size === fileSize);
    }

    const handleChecked = (checked, fileName, fileSize) => {
        const isInSelection = containsByNameAndSize(selectedFiles, fileName, fileSize);
        if (checked && isInSelection)
            return

        const selectedFile = findByNameAndSize(files, fileName, fileSize);
        const newSelection = checked
            ? [...selectedFiles, selectedFile]
            : selectedFiles.filter(file => file.name !== selectedFile.name && file.size !== selectedFile.size);
        onSelectionChanged?.(newSelection);
    };

    const handleAction = async (_fileName, _fileSize) => {
        const fileToOpen = findByNameAndSize(files, _fileName, _fileSize);
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

    const isSelected = (fileName, size) => {
        return containsByNameAndSize(selectedFiles, fileName, size);
    }

    return (
        <React.Fragment>
            <List subheader={renderSubHeader()}>
                {files.map(({name, size, type}, idx) => <DisplayFileItem key={idx}
                                                                         itemId={idx}
                                                                         checked={isSelected(name, size)}
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
