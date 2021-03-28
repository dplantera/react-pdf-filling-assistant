import {actions, actionTypes, noop} from "../actions";
import {Field} from "../../../model/types";

export const formReducer = (state, action, states) => {
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

            // callback needed otherwise error due to rendering parent while rendering child
            return () => {
                // console.log("update ", state.fields[idxPrvField]);
                states.dispatchFields(actions(Field).updateOne(updatedField));
            }
            // return state;
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}