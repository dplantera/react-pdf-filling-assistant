import React, {memo, useState} from 'react';
import {useStore} from "../../store";
import {useFormDialog} from "./useFormDialog";


export const useVariableDialog = ({defaultType} = {defaultType: "new"}) => {
    const [updateVariable, deleteVariables, addVariable] = useStore(state => [state.updateVariable, state.deleteVariables, state.addVariable])
    const [dialogType, setDialogType] = useState(defaultType)
    const {RenderFormDialog, show: _show, hide} = useFormDialog({
        title: `${dialogType === "new" ? "Add" : "Edit"} Form-Field Variable`,
        options: {
            isRequired: (property) => ["name", "value"].includes(property),
            isMultiLine: (property) => ["value"].includes(property),
            getLabel: (fieldName) => {
                return {"name": "Name"}?.[fieldName] ?? fieldName
            }
        },
        fieldBlacklist: ["id"]
    })

    const maybeDeleted = (formData) => {
        if (!formData.value || !formData.name) {
            deleteVariables([formData])
            return true;
        }
        return false;
    }
    const doDeleteUpdateOrCreate = (formData) => {
        if (!formData || !formData?.id){
            console.error("useVariableDialog: no id found")
            return;
        }
        if (!maybeDeleted(formData))
            dialogType === "new" ? addVariable(formData) : updateVariable(formData);
    }

    const handleClose = (formData) => {
        doDeleteUpdateOrCreate(formData)
        hide();
    }
    const handleSubmit = (formData) => {
        doDeleteUpdateOrCreate(formData)
        hide();
    }
    const handleCancel = (formData) => {
        if (dialogType === "new" && formData?.id)
            deleteVariables([formData])
        hide();
    }

    const show = (formData, type = defaultType) => {
        setDialogType(type);
        _show(formData);
    }

    const VariableDialog = memo(() => <RenderFormDialog onClose={handleClose}
                                                        onSubmit={handleSubmit}
                                                        onCancel={handleCancel}/>)
    return {
        show,
        hide,
        VariableDialog
    };
};
