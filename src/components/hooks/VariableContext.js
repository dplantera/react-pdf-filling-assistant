import React, {createContext, useCallback} from 'react';

const formVariableReducer = (state, action) => {

    switch (action.type) {
        case 'update-all': {
            console.log(action.type, {state, action})
            return [...action.payload]
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

const initialState = [];
const FormVariableProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(formVariableReducer, initialState)

    // convenient method - so hook is usable like useState
    const setState = useCallback((payload, actionType="update-all") => {
        if(!payload){
            console.warn("no payload provided")
            return
        }
        dispatch({type:actionType, payload});
    },[dispatch])

    return (
        <FormVariableContext.Provider value={[state, setState, dispatch]}>
            {children}
        </FormVariableContext.Provider>
    );
}

const FormVariableContext = createContext();
function useFormVariables() {
    // returns values from provider - so evererything in value
    const context = React.useContext(FormVariableContext)

    if (context === undefined) {
        throw new Error('useFormVariables must be used within a FormVariableProvider')
    }

    return context

}

export {FormVariableProvider, useFormVariables}