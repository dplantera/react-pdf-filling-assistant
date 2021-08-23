import React, {useState} from 'react';
import PropTypes from "prop-types";
import {ImportFilesDialog} from "../commons/Import/ImportFilesDialog";

export const useImportFilesDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

    const show = () => setIsOpen(true);
    const hide = () => setIsOpen(false);

    const RenderImportFilesDialog = (args) => <ImportFilesDialog open={isOpen} onClose={hide} {...args}/>
    RenderImportFilesDialog.propTypes = {
        title: PropTypes.string,
        onImport: PropTypes.func,
        onCancel: PropTypes.func,
        onClose: PropTypes.func,
        acceptedFileExt: PropTypes.array,
    }
    return {
        show,
        hide,
        RenderImportFilesDialog
    }
};

