import {getRepository} from "../../utils/ClientStorage";
import {FieldList} from "../../model/types";

export function switchFieldList(fieldLists, pdf) {
    return new Promise(async resolve => {
        const selectedFieldList = fieldLists.find(fl => fl?.isSelected);

        let isSelectedFieldListValid = selectedFieldList?.pdfId === pdf.id;
        if (selectedFieldList){
            console.debug("MutateAction.switchFieldList: field list up-to-date", {selectedFieldList})
            resolve({fieldLists, selectedFieldList });
        }

        if (selectedFieldList && !isSelectedFieldListValid)
            selectedFieldList.isSelected = false;

        const fieldListsFromStore = await getRepository(FieldList).getByIndex({pdfId: pdf.id});
        let newFieldList = fieldListsFromStore?.length <= 0 ? FieldList(pdf.name, pdf.id) : fieldListsFromStore[0];
        newFieldList.name = pdf.name.replace(".pdf", ".csv");
        newFieldList.isSelected = true;
        console.debug("MutateAction.switchFieldList: ", {isSelectedFieldListValid, newFieldList, pdf})

        const updatedFieldLists = [...fieldLists];
        const idxListFromState = fieldLists.findIndex(fl => fl.pdfId === pdf.id);
        if(idxListFromState > -1)
            updatedFieldLists[idxListFromState] = newFieldList;
        else
            updatedFieldLists.push(newFieldList)
        resolve({fieldLists: updatedFieldLists, selectedFieldList: newFieldList});
    })
}

export function addVariableToField(fields, currentField, variable) {
    if (!currentField || !variable) {
        console.warn("MutateAction.addVariableToField: no field or variable provided")
        return {};
    }
    currentField.variable = variable.id;
    currentField.description = currentField.description || variable.description;
    currentField.value = variable.value;

    // update state
    let idxPrvField = currentField.index ?? fields.findIndex(field => field.id === currentField.id);
    if (idxPrvField == null || idxPrvField === -1) {
        console.warn("MutateAction.addVariableToField: field not found")
        return {};
    }

    const prvField = fields[idxPrvField];
    const newField = {...prvField, ...currentField};
    fields[idxPrvField] = newField;

    return {updatedField: newField, updatedFields: [...fields]};
}