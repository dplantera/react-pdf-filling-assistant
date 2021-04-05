import {actionTypes} from "../actions";
import {ClientStorage} from "../../../utils/ClientStorage";

const storage =  ClientStorage.instance;
export const basicReducer = (state, action) => {
    console.log("basicReducer", action.type, action.payload)
    const context = action.context;
    const dbParams = {
        onerror: () => console.error("storing: ", context.name),
        onsuccess: () => console.info("stored: ", context.name),
    }
    switch (action.type) {
        case actionTypes.updateAll: {
            console.log("payload", action)
            const newState = [...action.payload];
            if(context) {
                storage.updateObject(context, newState, dbParams);
            }
            return newState
        }
        case actionTypes.addAll: {
            let elements = action.payload;
            if(!elements || elements?.size < 1)
                return state;

            const newState = [...state, ...elements];
            const context = action.context;
            if(context) {
                storage.storeObject(context, newState, dbParams);
            }
            return newState;
        }
        case actionTypes.updateOne: {
            const element = action.payload;
            if(!element)
                console.warn("no element provided")
            const index = element.index ?? state.findIndex(f => f.id === element.id);
            const prevField = state[index];
            let newField = {...prevField, ...element};
            state[element.index] = newField;
            if(context) {
                storage.updateObject(context, newField, dbParams);
            }
            return state;
        }
        case actionTypes.addOne: {
            const variable = action.payload;
            if(!variable)
                console.warn("no variable provided")
            if(context) {
                storage.storeObject(context, variable, dbParams);
            }
            return [...state, variable];
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}