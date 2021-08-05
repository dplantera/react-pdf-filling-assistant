import {getRepository} from "../../utils/ClientStorage";
import {FieldList} from "../../model/types";

export function switchFieldList(fieldLists, pdf) {
    return new Promise(async resolve => {
        const selectedFieldList = fieldLists.find(fl => fl?.isSelected);

        let isSelectedFieldListValid = selectedFieldList?.pdfId === pdf.id;
        if (selectedFieldList)
            resolve(selectedFieldList);

        console.debug("Store.switchFieldList: ", {isSelectedFieldListValid})
        if (selectedFieldList && !isSelectedFieldListValid)
            selectedFieldList.isSelected = false;

        const fieldListsFromStore = await getRepository(FieldList).getByIndex({pdfId: pdf.id});
        let newFieldList = fieldListsFromStore?.length <= 0 ? FieldList(pdf.name, pdf.id) : fieldListsFromStore[0];
        newFieldList.isSelected = true;
        resolve(newFieldList);
    })
}

export function addVariableToField(fields, currentField, variable) {
    if (!currentField || !variable) {
        console.warn("Store.addVariableToField: no field or variable provided")
        return null;
    }
    currentField.variable = variable.id;
    currentField.description = currentField.description || variable.description;
    currentField.value = variable.value;

    // update state
    let idxPrvField = currentField.index ?? fields.findIndex(field => field.id === currentField.id);
    if (idxPrvField == null || idxPrvField === -1) {
        console.warn("Store.addVariableToField: field not found")
        return null;
    }
    const prvField = fields[idxPrvField];

    return {...prvField, ...currentField};
}