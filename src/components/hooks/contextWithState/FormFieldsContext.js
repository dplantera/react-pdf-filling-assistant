import React, {createContext} from 'react';
import {BasicReducer} from "../reducer/BasicReducer";

const initialState = [];
const basicReducer = new BasicReducer().reducer
const FormFieldsProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(basicReducer, initialState)
    return (
        <FormFieldContext.Provider value={[state, dispatch]}>
            {children}
        </FormFieldContext.Provider>

    );
}

const FormFieldContext = createContext();

function useFormFields() {
    const context = React.useContext(FormFieldContext)

    if (context === undefined) {
        throw new Error('useFormFields must be used within a FormFieldProvider')
    }

    return context

}

export {FormFieldsProvider, useFormFields}