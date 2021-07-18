import {actionTypes} from "../actions";
import {getRepository} from "../../../utils/ClientStorage";
import {dbSchema} from "../../../model/types";


export class BasicReducer {
    get reducer() {
        return this.reduce.bind(this)
    }

    dbParams(action) {
        const defaultParams = {
            keyPath: "id", // db primary key(s)
            onerror: () => console.error("storing: ", action.context.name),
            onsuccess: () => console.info("stored: ", action.context.name),
        }
        if (action.context)
            return {...defaultParams, ...dbSchema(action.context)}
        return defaultParams;
    }

    reduce(state, action) {
        console.debug(`[${this.constructor.name}]:`, action.context?.name, action.type, {state, action})
        switch (action.type) {
            case actionTypes.updateAll: {
                return this.updateAll(state, action);
            }
            case actionTypes.addAll: {
                return this.addAll(state, action);
            }
            case actionTypes.updateOne: {
                return this.updateOne(state, action);
            }
            case actionTypes.addOne: {
                return this.addOne(state, action);
            }
            default: {
                throw new Error(`Unhandled action type: ${action.type}`)
            }
        }
    }

    updateAll(state, action) {
        console.log("payload", action)
        const context = action.context;
        const newState = [...action.payload];
        if (context) {
            getRepository(action.context).updateAll(newState)
        }
        return newState
    }

    addAll(state, action) {
        let elements = action.payload;
        if (!elements || elements?.size < 1)
            return state;

        const newState = [...state, ...elements];
        const context = action.context;
        if (context) {
            getRepository(action.context).createAll(newState)
        }
        return newState;
    }

    addOne(state, action) {
        const variable = action.payload;
        if (!variable)
            console.warn("no variable provided")
        if (action.context) {
            getRepository(action.context).create(variable)
        }
        return [...state, variable];
    }

    updateOne(state, action) {
        const element = action.payload;
        if (!element)
            console.warn("no element provided")
        let index = element.index ?? state.findIndex(f => f.id === element.id);
        // if state is empty - add it
        if (index < 0)
            console.warn("element not found")
        if (index < 0 && state.size < 1)
            index = 0

        const prevField = state[index];
        let newField = {...prevField, ...element};
        state[element.index] = newField;
        if (action.context) {
            getRepository(action.context).update(newField);
        }
        return state;
    }
}