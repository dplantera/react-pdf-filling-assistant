import React, {createContext} from 'react';
import {actionTypes} from "./FormActionContext";

const formFieldsReducer = (state, action) => {
    console.log("fieldsReduc", action.type, action.payload)
    switch (action.type) {
        case actionTypes.updateAll: {
            return [...action.payload]
        }
        case actionTypes.addAll: {
            return [...state, ...action.payload]
        }

        case actionTypes.updateOne: {
            const field = action.payload;
            if(!field)
                console.warn("no field provided")
            const index = field.index ?? state.findIndex(f => f.id === field.id);
            const prevField = state[index];
            state[field.index] = {...prevField, ...field};
            return state;
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

const initialState = [];
const FormFieldsProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(formFieldsReducer, initialState)
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