import React, {useState} from 'react';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import PropTypes from "prop-types";
import {makeStyles} from "@material-ui/core/styles";
import DisplayFileList from "./DisplayFileList";
import {Typography} from "@material-ui/core";
import {Upload} from "../../../utils/upload";


const getDropZone = () => {
    return document.getElementById("import-file-dialog")
};

const useStyles = makeStyles((theme) => ({
        "import-file-dialog": {
            width: "min(800px, 80%)",
            height: "min(600px, 80%)",
            minWidth: 200,
            minHeight: 221,
            maxWidth: "unset",
            maxHeight: "unset",
        },
        dragDrop: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%)"
        }
    })
);


export const ImportFilesDialog = ({
                                      open,
                                      title,
                                      onClose,
                                      onImport,
                                      onCancel,
                                      acceptedFileExt = [".csv", ".pdf"]
                                  }) => {
    const [files, setFiles] = useState([]);
    const [filesSelected, setFilesSelected] = useState([]);

    const classes = useStyles();

    const assertFileExtension = (_files) => {
        const filetype = (file) => file?.name?.replace(/.*(?=\.)/g, "") || file?.type?.replace(/.*\//g, ".");
        return _files.filter(file => {
            if(!acceptedFileExt.includes(filetype(file))) {
                console.error(new Error("file type not supported"), {file});
                return false;
            }
            return true;
        })
    }

    const onUpload = async (e) => {
        const _filesToRead = Upload.getFilesToRead(e);
        const _filesToReadValid = assertFileExtension(_filesToRead);
        setFiles([...files, ..._filesToReadValid])
        setFilesSelected([...filesSelected, ..._filesToReadValid])
    }

    const onDrop = async (e) => {
        e.preventDefault();
        console.log("drop")

        getDropZone().style.backgroundColor = "white";
        getDropZone().style.opacity = "100%"
        await onUpload(e);
    }

    const handleImport = () => {
        onImport?.(filesSelected);
    }

    return (<Dialog
            fullScreen={false}
            open={open}
            onClose={onClose}
            aria-labelledby="upload-var-title"
            classes={{paper: classes["import-file-dialog"]}}
            onDragOver={(e) => {
                console.log("over")
                e.preventDefault();
                getDropZone().style.backgroundColor = "gray";
                getDropZone().style.opacity = "60%"
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                console.log("leaving")
                getDropZone().style.backgroundColor = "white";
                getDropZone().style.opacity = "100%"
            }}
            onDrop={onDrop}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent id={"import-file-dialog"}>
                <DisplayFileList files={files}
                                 selectedFiles={filesSelected}
                                 subheader={<h2>Select files for import</h2>}
                                 onSelectionChanged={setFilesSelected}
                />
                <input type="file" id="file" name="file" encType="multipart/form-data" hidden={true}/>
                {files.length <= 0 && <div className={classes.dragDrop}>
                    <Typography variant={"h3"}>Drag & Drop</Typography>
                </div>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" component="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="contained" color="secondary" component="button" onClick={handleImport}>
                    Import Files
                </Button>
                <label htmlFor="var-file-upload">
                    <Button variant="contained" color="primary" component="span">
                        Select Files
                    </Button>
                </label>
                <input accept={acceptedFileExt.join(",")} multiple style={{display: "none"}} id="var-file-upload"
                       type="file"
                       onChange={onUpload}/>
            </DialogActions>
        </Dialog>
    );
};

ImportFilesDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    onImport: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    acceptedFileExt: PropTypes.array,
};

