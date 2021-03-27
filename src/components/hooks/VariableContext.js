import React, {createContext, useEffect} from 'react';
import {actionTypes} from "./FormActionContext";

const formVariableReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.updateAll: {
            return [...action.payload]
        }
        case actionTypes.addAll: {
            return [...state, ...action.payload]
        }

        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

const initialState = []
const FormVariableProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(formVariableReducer, initialState)

    useEffect(() => {

    }, [])

    return (
        <store.Provider value={[state, dispatch]}>
            {children}
        </store.Provider>
    );
}

const store = createContext(initialState);

function useFormVariables() {
    // returns values from provider - so evererything in value
    const context = React.useContext(store)

    if (context === undefined) {
        throw new Error('useFormVariables must be used within a FormVariableProvider')
    }

    return context

}

export {FormVariableProvider, useFormVariables}