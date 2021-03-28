import {actionTypes} from "../actions";
import {ClientStorage} from "../../../utils/ClientStorage";

const storage = new ClientStorage();
export const basicReducer = (state, action) => {
    console.log("basicReducer", action.type, action.payload)
    switch (action.type) {
        case actionTypes.updateAll: {
            console.log("payload", action)
            const context = action.context;
            const newState = [...action.payload];
            if(context) {
                storage.storeObject(context, newState).then(() => console.log(`stored ${context.name}`));
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
                storage.storeObject(context, newState).then(() => console.log(`stored ${context.name}`));
            }
            return newState;
        }
        case actionTypes.updateOne: {
            const element = action.payload;
            if(!element)
                console.warn("no element provided")
            const index = element.index ?? state.findIndex(f => f.id === element.id);
            const prevField = state[index];
            state[element.index] = {...prevField, ...element};
            return state;
        }
        case actionTypes.addOne: {
            const variable = action.payload;
            if(!variable)
                console.warn("no variable provided")
            return [...state, variable];
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}