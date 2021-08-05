import create from "zustand";
import {getRepository} from "./utils/ClientStorage";
import {Field, FieldList, FormVariable, Pdf} from "./model/types";
import {
    retrieveInitialFormFields,
    retrieveInitialFormVariables,
    retrieveInitialPdfs
} from "./components/actions/startupActions";
import {addVariableToField, switchFieldList} from "./components/actions/mutateActions";

const createPdfSlice = (set, get) => ({
    pdfs: [],
    updatePdf: async (pdf) => {
        //todo: fix this workaround when supporting multiple pdfs
        await getRepository(Pdf).deleteAll();
        set({pdfs: persist.updateOne(get().pdfs, {payload: pdf, context: Pdf})})
    },
    updatePdfs: async (pdfs) => {
        //todo: fix this workaround when supporting multiple pdfs
        await getRepository(Pdf).deleteAll();
        await getRepository(FieldList).deleteAll();
        set({pdfs: persist.updateAll(get().pdfs, {payload: pdfs, context: Pdf})})
    },
    selectPdf: async (pdf) => {
        if (!get().pdfs.find(p => p.id === pdf.id))
            await get().updatePdf(pdf)
        // switch fieldList
        get().switchFieldList(pdf)
            .then(() => console.debug("Store.selectPdf: done"))
            .catch((err) => console.error(err))
            .finally(() => {
                return pdf;
            })
    },
    loadPdfs: () => {
        retrieveInitialPdfs().then(pdfs => set({pdfs}))
    }
});

const createFieldListSlice = (set, get) => ({
    fieldLists: [],
    updateFieldLists: (fieldLists) => set({
        fieldLists: persist.updateAll(get().fieldLists, {
            payload: fieldLists,
            context: FieldList
        })
    }),
    updateFieldList: (fieldList) => set({
        fieldLists: persist.updateOne(get().fieldLists, {
            payload: fieldList,
            context: FieldList
        })
    }),
    switchFieldList: async (pdf) => {
        const newFieldList = await switchFieldList(get().fieldLists, pdf);
        await get().updateFieldList(newFieldList);
        return newFieldList;
    }
});

const createFieldSlice = (set, get) => ({
    fields: [],
    addFields: (fields) => set({fields: persist.addAll(get().fields, {payload: fields, context: Field})}),
    updateFields: (fields) => set({fields: persist.updateAll(get().fields, {payload: fields, context: Field})}),
    updateField: (field) => set({fields: persist.updateOne(get().fields, {payload: field, context: Field})}),
    loadFields: async (pdf, fieldsRaw) => {
        const selectedList = await get().switchFieldList(pdf);
        const fields = await retrieveInitialFormFields({selectedList, fieldsRaw});
        console.debug("Store.loadFields: ", {selectedList, fields})
        set({fields: fields ?? []})
    }
});

const createVariableSlice = (set, get) => ({
    variables: [],
    addVariables: (variables) => set({
        variables: persist.addAll(get().variables, {
            payload: variables,
            context: FormVariable
        })
    }),
    updateVariables: (variables) => set({
        variables: persist.updateAll(get().variables, {
            payload: variables,
            context: FormVariable
        })
    }),
    addVariable: (variable) => set({
        variables: persist.addOne(get().variables, {
            payload: variable,
            context: FormVariable
        })
    }),
    loadVariables: () => retrieveInitialFormVariables().then(variables => set({variables}))
});

const createFormActionSlice = (set, get) => ({
    addVariableToField: async (variable, currentField) => {
        const fields = get().fields;
        const {updatedFields, updatedField} = addVariableToField(fields, currentField, variable)
        if (!updatedField) return
        await persist.updateOne(fields, {payload: updatedField, context: Field})
        set({fields: updatedFields});
    }
});


const persist = {
    updateAll(state, action) {
        console.debug("Store.updateAll: ", {state, action})
        const context = action.context;
        const updated = action.payload;
        // using map to access updates in constant time
        const idToUpdatedElement = updated.reduce((map, element) => {
            if (!element.id) {
                const newObject = Object.assign(element, context())
                map[newObject.id] = newObject;
                console.warn("Store.updateAll: do not use update to create objects...", {newObject})
            } else
                map[element.id] = element
            return map;
        }, {});
        // determine updates
        const updatedState = state.reduce((prvState, prvElement, index) => {
            if (idToUpdatedElement[prvElement.id])
                prvState[index] = {...prvElement, ...idToUpdatedElement[prvElement.id]}
            return prvState;
        }, [...state])
        // determine new elements
        const existingIds = state.map( element => element.id);
        const newElements = Object.values(idToUpdatedElement).filter(element => !existingIds.includes(element.id));

        const newState = [...updatedState, ...newElements]
        if (context) {
            getRepository(action.context).updateAll(newState)
        }
        return newState
    },
    addAll(state, action) {
        console.debug("Store.addAll: ", {state, action})
        let elements = action.payload;
        if (!elements || elements?.size < 1)
            return state;

        const newState = [...state, ...elements];
        const context = action.context;
        if (context) {
            getRepository(action.context).createAll(newState).then(res => console.debug(`persited ${newState}`))
        }
        return newState;
    },
    addOne(state, action) {
        console.debug("Store.addOne: ", {state, action})
        const variable = action.payload;
        if (!variable)
            console.warn("addOne: no variable provided")
        if (action.context) {
            getRepository(action.context).create(variable)
        }
        return [...state, variable];
    },
    updateOne(state, action) {
        console.debug("Store.updateOne: ", {state, action})
        const element = action.payload;
        if (!element)
            console.warn("Store.updateOne: no element provided")
        let index = element.index ?? state.findIndex(f => f.id === element.id);
        // if state is empty - add it
        if (index < 0)
            console.warn("Store.updateOne: element not found")
        if (index < 0 && state.length < 1)
            index = 0
        console.warn({index, state, element})

        const prevField = state[index];
        let newField = {...prevField, ...element};
        state[index] = newField;
        if (action.context) {
            getRepository(action.context).update(newField);
        }
        return [...state];
    }
}


export const useStore = create((set, get) => ({
    ...createPdfSlice(set, get),
    ...createFieldListSlice(set, get),
    ...createFieldSlice(set, get),
    ...createVariableSlice(set, get),
    ...createFormActionSlice(set, get)
}))
