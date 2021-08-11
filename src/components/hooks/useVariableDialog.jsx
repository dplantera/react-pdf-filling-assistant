import React, {memo} from 'react';
import {useStore} from "../../store";
import {useFormDialog} from "./useFormDialog";


export const useVariableDialog = ({type} = {type: "new"}) => {
    const [updateVariable] = useStore(state => [state.updateVariable])
    const {RenderFormDialog, show, hide} = useFormDialog({
        title: `${type === "new" ? "Add" : "Edit"} Form-Field Variable`,
        options: {
            isRequired: (property) => ["name", "value"].includes(property),
            isMultiLine: (property) => ["value"].includes(property),
            getLabel: (fieldName) => {
                return {"name": "Name"}?.[fieldName] ?? fieldName
            }
        },
        fieldBlacklist: ["id"]
    })

    const handleClose = (formData) => {
        updateVariable(formData)
        hide();
    }
    const handleSubmit = (formData) => {
        updateVariable(formData)
        hide();
    }

    const NewVariableDialog = memo(() => <RenderFormDialog onClose={handleClose} onSubmit={handleSubmit}/>)
    return {
        show,
        hide,
        NewVariableDialog
    };
};
