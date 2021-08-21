import React, {memo, useState} from 'react';
import {useFormDialog} from "./useFormDialog";

export const useVariableDialog = ({
                                      defaultType,
                                      updateVariable,
                                      deleteVariables,
                                      addVariable
                                  } = {defaultType: "new"}) => {
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


    const updateOrCreate = (formData) => {
        if (!formData || !formData?.id) {
            console.error("useVariableDialog: no id found")
            return;
        }
        dialogType === "new" ? addVariable(formData) : updateVariable(formData);
    }

    const handleClose = (formData) => {
        updateOrCreate(formData)
        hide();
    }
    const handleSubmit = (formData) => {
        updateOrCreate(formData)
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

    const VariableDialog = memo(() => <div>
        <RenderFormDialog onClose={handleClose}
                          onSubmit={handleSubmit}
                          onCancel={handleCancel}/>
    </div>)
    return {
        show,
        hide,
        VariableDialog
    };
};
