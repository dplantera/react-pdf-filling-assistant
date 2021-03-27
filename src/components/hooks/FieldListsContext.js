import React, {createContext} from 'react';
import {actionTypes} from "./FormActionContext";

const fieldListsReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.updateAll: {
            return [...action.payload]
        }
        case actionTypes.addAll: {
            return [...state, ...action.payload]
        }
        case actionTypes.updateOne: {
            const fieldList = action.payload;
            if(!fieldList)
                console.warn("no fieldList provided")
            const index = fieldList.index ?? state.findIndex(f => f.id === fieldList.id);
            const prevField = state[index];
            state[fieldList.index] = {...prevField, ...fieldList};
            return state;
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

const initialState = [];
const FieldListsProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(fieldListsReducer, initialState)

    return (
        <FieldListsContext.Provider value={[state, dispatch]}>
            {children}
        </FieldListsContext.Provider>
    );
}

const FieldListsContext = createContext();
function useFieldLists() {
    const context = React.useContext(FieldListsContext)

    if (context === undefined) {
        throw new Error('useFieldLists must be used within a FieldListsProvider')
    }

    return context

}

export {FieldListsProvider, useFieldLists}