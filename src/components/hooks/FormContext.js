import React, {createContext, useCallback} from 'react';
import {useFieldLists} from "./FieldListsContext";

const formFieldsReducer = (state, action, fieldLists) => {

    switch (action.type) {
        case 'update-all': {
            console.log({state, action})
            const newFields = [...action.payload];

            //todo: fix workaround
            fieldLists[0].fields = newFields;
            return newFields;
        }
        case 'update-one': {
            const {field, index}= action.payload;

            console.log(action?.type, {state, action})
            if(!field) {
                console.warn("no field or variable provided", action)
                return state;
            }

            const idxField = index ?? state.findIndex(f => f.id === field.id);
            if(!idxField || idxField === -1) {
                console.warn("field not found", action)
                return state;
            }

            state[idxField] = field;
            // argh performance
            // fieldLists[0].fields = state;
            // return [...state]
            console.trace()
            console.log(action?.type, {state, action})
            return state;
        }
        case 'add-variable': {
            const currentField = action.payload?.field;
            const variable = action.payload?.formVariable;
            if(!currentField || !variable) {
                console.warn("no field or variable provided", action)
                return state;
            }
            currentField.variable = variable;
            currentField.description = currentField.description || variable.description;

            // update state
            let idxPrvField = state.findIndex(field => field.id === currentField.id);
            if(idxPrvField === -1) {
                console.warn("field not found", action)
                return state;
            }
            const prvField = state[idxPrvField];
            state[idxPrvField] = {...prvField, ...currentField}
            // argh performance
            // fieldLists[0].fields = state;
            // return [...state]
            return state;
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

const initialState = [];
const FormFieldsProvider = ({children}) => {
    const [fieldLists] = useFieldLists();
    const [state, dispatch] = React.useReducer((state, action) => formFieldsReducer(state, action, fieldLists), initialState)

    // convenient method - so hook is usable like useState
    const setState = useCallback((payload, actionType="update-all") => {
        if(!payload){
            console.warn("no payload provided")
            return
        }
        dispatch({type:actionType, payload});
    }, [dispatch])

    return (
        // todo:selectedField: value={[state, setState, {dispatch, selectedField, setSelectedField}}
        <FormFieldContext.Provider value={[state, setState, dispatch]}>
            {children}
        </FormFieldContext.Provider>
    );
}

const FormFieldContext = createContext();
function useFormFields() {
    // returns values from provider - so evererything in value
    const context = React.useContext(FormFieldContext)

    if (context === undefined) {
        throw new Error('useFormFields must be used within a FormFieldProvider')
    }

    return context

}

export {FormFieldsProvider, useFormFields}