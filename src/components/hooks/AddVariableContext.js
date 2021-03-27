import React, {createContext, useState} from 'react';

const AddVariableProvider = ({children}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [newValue, setNewValue] = useState({});

    // todo: maybe use selected field?: const [selectedField] = useFormFields();
    const openVariableDialog = (newVar, callback) => {
        console.log("openVariableDialog", {callback, newValue})
        setNewValue(newVar);
        setOpenDialog(true);
    }


    return (
        <AddVariableContext.Provider value={
            {
                openDialog, setOpenDialog,
                newValue, setNewValue,
                openVariableDialog
            }}>
            {children}
        </AddVariableContext.Provider>
    );
}

const AddVariableContext = createContext();

function useAddVariable() {
    // returns values from provider - so evererything in value
    const context = React.useContext(AddVariableContext)

    if (context === undefined) {
        throw new Error('useAddVariable must be used within a AddVariableProvider')
    }

    return context

}

export {AddVariableProvider, useAddVariable}