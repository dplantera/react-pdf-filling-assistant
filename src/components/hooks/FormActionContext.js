import React, {createContext, useCallback, useEffect} from 'react';
import {useFieldLists} from "./FieldListsContext";
import {useFormVariables} from "./VariableContext";
import {useFormFields} from "./FormFieldsContext";

export const actionTypes = {
    addAll: "ADD_ALL",
    addOne: "ADD_ONE",
    updateAll: "UPDATE_ALL",
    updateOne: "UPDATE_ONE",
    addVariableToField: "ADD_VARIABLE_TO_FIELD",
}

const actions = (() => {
    return {
        addAll: (payload) => {
            return {type: actionTypes.addAll, payload}
        },
        addOne: (payload) => {
            return {type: actionTypes.addOne, payload}
        },
        updateAll: (payload) => {
            return {type: actionTypes.updateAll, payload}
        },
        updateOne: (payload) => {
            return {type: actionTypes.updateOne, payload}
        },
        addVariableToField: (payload) => {
            return {type: actionTypes.addVariableToField, payload}
        },
    }
})()

const noop = () => {
};

const formReducer = (state, action, states) => {
    console.log("formReducer", action.type, action.payload, state, states)
    switch (action.type) {
        case actionTypes.addVariableToField: {
            const currentField = action.payload?.field;
            const variable = action.payload?.variable;
            if (!currentField || !variable) {
                console.warn("no field or variable provided", action)
                return noop;
            }

            currentField.variable = variable;
            currentField.description = currentField.description || variable.description;
            currentField.value = variable.value;

            // update state
            let idxPrvField = currentField.index ?? states.fields.findIndex(field => field.id === currentField.id);
            if (idxPrvField == null || idxPrvField === -1) {
                console.warn("field not found", action)
                return noop;
            }
            const prvField = states.fields[idxPrvField];
            let updatedField = {...prvField, ...currentField};

            // callback needed otherwise error
            return () => {
                // console.log("update ", state.fields[idxPrvField]);
                states.dispatchFields(actions.updateOne(updatedField));
            }
            // return state;
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}


const FormActionProvider = ({children}) => {
    const [fieldLists, dispatchFieldLists] = useFieldLists();
    const [fields, dispatchFields] = useFormFields();
    const [variables, dispatchVars] = useFormVariables();

    const reducer = useCallback((state, action) => {
        return formReducer(state, action, {
            fieldLists,
            fields,
            variables,
            dispatchVars,
            dispatchFields,
            dispatchFieldLists
        })
    }, [dispatchVars, dispatchFields, dispatchFieldLists, fieldLists, fields, variables])

    const [callback, dispatch] = React.useReducer(reducer, noop)

    useEffect(() => {
        callback();
    }, [callback])

    useEffect(() => {
        const idxSelectedList = fieldLists.findIndex(list => list.isSelected);
        if (idxSelectedList === -1) return;

        dispatchFieldLists(actions.updateOne({index: idxSelectedList, fields}))
    }, [fields, fieldLists, dispatchFieldLists])

    const addVariableToField = useCallback((variable, field) => {
        dispatch(actions.addVariableToField({variable, field}));
        // todo: doesnt work - callback is updated in next render
        // dispatchFields(actions.updateAll(callback));
    }, [dispatch])
    const updateFieldLists = useCallback((fieldLists) => dispatchFieldLists(actions.updateAll(fieldLists)), [dispatchFieldLists])
    const addFields = useCallback((fields) => dispatchFields(actions.addAll(fields)), [dispatchFields])
    const updateFields = useCallback((fields) => dispatchFields(actions.updateAll(fields)), [dispatchFields])
    const updateField = useCallback((field) => dispatchFields(actions.updateOne(field)), [dispatchFields])
    const addVariables = useCallback((variables) => dispatchVars(actions.addAll(variables)), [dispatchVars]);
    const updateVariables = useCallback((variables) => dispatchVars(actions.updateAll(variables)), [dispatchVars])

    const formActions = {
        state: {fieldLists, fields, variables},
        updateFieldLists,
        addFields,
        updateFields,
        updateField,
        addVariables,
        updateVariables,
        addVariableToField,
        dispatch
    }

    console.log("rendering actions...")
    return (
        <FormActionsContext.Provider value={formActions}>
            {children}
        </FormActionsContext.Provider>
    );
}

const FormActionsContext = createContext();

function useFormActions() {
    // returns values from provider - so evererything in value
    const context = React.useContext(FormActionsContext)

    if (context === undefined) {
        throw new Error('useForm must be used within a FormFieldProvider')
    }

    return context
}

export {FormActionProvider, useFormActions}