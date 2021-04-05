import React, {createContext} from 'react';
import {BasicReducer} from "../reducer/BasicReducer";

const basicReducer = new BasicReducer().reducer
const initialState = [];
const FieldListsProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(basicReducer, initialState)

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