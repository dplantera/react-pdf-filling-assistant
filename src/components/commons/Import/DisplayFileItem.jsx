import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {Checkbox, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {InsertDriveFile, PictureAsPdf} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {isPdfMimeType} from "../../../utils/upload";

//https://stackoverflow.com/a/8471438
const bytesToMegaBytes = (bytes, digits = 2) => (bytes / (1024 * 1024)).toFixed(digits);
const useStyles = makeStyles((theme) => ({
        container: {
            maxWidth: "min(800px, 100%)",
            maxHeight: "min(600px, 100%)",
        }
    })
);

const renderIconByFileType = (fileType) => {
    if (isPdfMimeType(fileType))
        return <PictureAsPdf color={"secondary"} />
    return <InsertDriveFile/>
}
const DisplayFileItem = ({itemId, fileName, fileSize, fileType, onChecked, onAction, checked}) => {
    const byteToMb = bytesToMegaBytes(fileSize ?? 0, 4);
    const classes = useStyles();

    const handleCheckedChange = useCallback((e) => onChecked?.(e.target.checked, fileName, fileSize), [onChecked, itemId, fileName, fileSize]);
    const handleAction = useCallback(() => onAction?.(fileName, fileSize), [onAction, itemId, fileName, fileSize]);

    return (
        <ListItem classes={{container: classes.container}} divider>
            <ListItemIcon>
                <Checkbox checked={checked} onChange={handleCheckedChange}
                />
            </ListItemIcon>
            <ListItemText primary={fileName} secondary={<>{byteToMb ?? "unknown size"} MB</>}/>
            <ListItemSecondaryAction edge={"start"}>
                <IconButton size={"medium"} aria-label="open file" onClick={handleAction}>
                    {renderIconByFileType(fileType)}
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

DisplayFileItem.propTypes = {
    fileName: PropTypes.string,
    fileSize: PropTypes.number,
    fileType: PropTypes.string,
    onChecked: PropTypes.func,
    onAction: PropTypes.func,
};

export default DisplayFileItem;
