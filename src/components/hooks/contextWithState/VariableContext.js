import React, {createContext} from 'react';
import {basicReducer} from "../reducer/BasicReducer";

const initialState = []
const FormVariableProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(basicReducer, initialState)

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