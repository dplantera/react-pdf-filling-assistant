import React, {createContext, useCallback} from 'react';

/*
    right now this context is not very useful...
    it was planed to have multiple lists with vars..
    yet, maybe this will be included in fields or vise versa
*
* */

const fieldListsReducer = (state, action) => {

    switch (action.type) {
        case 'update-all': {
            console.log({state, action})
            return [...action.payload]
        }

        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

const initialState = [];
const FieldListsProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(fieldListsReducer, initialState)

    // convenient method - so hook is usable like useState
    const setState = useCallback((payload, actionType="update-all") => {
        if(!payload){
            console.warn("no payload provided")
            return
        }
        dispatch({type:actionType, payload});
    }, [dispatch])

    return (
        <FieldListsContext.Provider value={[state, setState, dispatch]}>
            {children}
        </FieldListsContext.Provider>
    );
}

const FieldListsContext = createContext();
function useFieldLists() {
    // returns values from provider - so everything in value
    const context = React.useContext(FieldListsContext)

    if (context === undefined) {
        throw new Error('useFieldLists must be used within a FieldListsProvider')
    }

    return context

}

export {FieldListsProvider, useFieldLists}