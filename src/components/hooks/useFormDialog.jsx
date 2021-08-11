import React, {useRef} from 'react';
import {Dialog, TextField} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

export const defaultOptions = {
    isRequired: (property) => false,
    isMultiLine: (property) => false,
    getType: (property) => "text",
    getLabel: (property) => property
}

export const useFormDialog = ({
                                  title = "",
                                  contentText = "",
                                  options,
                                  fieldBlacklist = []
                              }) => {
    const [open, setOpen] = React.useState(false);
    const refFormData = useRef({});

    const actions = {
        hide: () => setOpen(false),
        show: (_defaultFormData = {}) => {
            refFormData.current = {..._defaultFormData}
            setOpen(true);
        },
    }

    const renderInputFields = () => {
        const _options = {...defaultOptions, ...options};
        return Object.keys(refFormData.current).reduce((acc, property) => {
            if (fieldBlacklist.includes(property))
                return acc;

            acc.push(<TextField
                key={property}
                autoFocus
                multiline={_options.isMultiLine(property)}
                margin="dense"
                id={property}
                defaultValue={refFormData.current[property]}
                onChange={(e) => {
                    refFormData.current = {...refFormData.current, [property]: e.target.value}
                }}
                label={_options.getLabel(property)}
                type={_options.getType(property)}
                required={_options.isRequired(property)}
                fullWidth={true}
            />)
            return acc;
        }, [])
    }

    const RenderFormDialog = ({onClose = actions.hide, onSubmit = actions.hide, onCancel = actions.hide}) => {
        return (
            <Dialog open={open} onClose={() => onClose(refFormData.current)} aria-labelledby="new-variable-dialog">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(refFormData.current)
                }}>
                    <DialogTitle id="new-variable-dialog"> {title}
                    </DialogTitle>
                    <DialogContent>
                        {contentText && <DialogContentText>{contentText}</DialogContentText>}
                        {renderInputFields()}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => onCancel(refFormData.current)} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    return {
        ...actions,
        RenderFormDialog
    }


};

