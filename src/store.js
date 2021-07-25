import create from "zustand";
import {getRepository} from "./utils/ClientStorage";
import {Field, FieldList, FormVariable, Pdf} from "./model/types";

const createPdfSlice = (set, get) => ({
    pdfs: [],
    updatePdf: async (pdf) => set({pdfs: persist.updateOne(get().pdfs, {payload: pdf, context: Pdf})}),
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
        const selectedFieldList = get().fieldLists.find(fl => fl?.isSelected);

        let isSelectedFieldListValid = selectedFieldList?.pdfId === pdf.id;
        if(selectedFieldList)
            return selectedFieldList;

        console.debug("Store.switchFieldList: ", {isSelectedFieldListValid})
        if (selectedFieldList && !isSelectedFieldListValid)
            selectedFieldList.isSelected = false;
        if (!selectedFieldList || !isSelectedFieldListValid) {
            const fieldListsFromStore = await getRepository(FieldList).getByIndex({pdfId: pdf.id});
            let newFieldList = fieldListsFromStore?.length <= 0 ? FieldList(pdf.name, pdf.id) : fieldListsFromStore[0];
            newFieldList.isSelected = true;
            await get().updateFieldList(newFieldList);
            return newFieldList;
        }
    }
});

const createFieldSlice = (set, get) => ({
    fields: [],
    addFields: (fields) => set({fields: persist.addAll(get().fields, {payload: fields, context: Field})}),
    updateFields: (fields) => set({fields: persist.updateAll(get().fields, {payload: fields, context: Field})}),
    updateField: (field) => set({fields: persist.updateOne(get().fields, {payload: field, context: Field})}),
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
});

const createFormActionSlice = (set, get) => ({
    addVariableToField: async (variable, currentField) => {
        const fields = get().fields;
        if (!currentField || !variable) {
            console.warn("Store.addVariableToField: no field or variable provided")
            return;
        }
        currentField.variable = variable.id;
        currentField.description = currentField.description || variable.description;
        currentField.value = variable.value;

        // update state
        let idxPrvField = currentField.index ?? fields.findIndex(field => field.id === currentField.id);
        if (idxPrvField == null || idxPrvField === -1) {
            console.warn("Store.addVariableToField: field not found")
            return;
        }
        const prvField = fields[idxPrvField];
        let updatedField = {...prvField, ...currentField};

        const newState = await persist.updateOne(fields, {payload: updatedField, context: Field})
        set({fields: newState});
    }
});


const persist = {
    updateAll(state, action) {
        console.debug("Store.updateAll: ", {state, action})
        const context = action.context;
        const newState = [...action.payload];
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
