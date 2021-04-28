import {v4 as uuidv4} from 'uuid';


/*
        Entities
 */
export const Pdf = (name, binary, id) => {
    id = id ?? uuidv4();
    return {
        id,
        name,
        binary
    }
}

export const Field = (refPdf = null, name, value, location, fieldListId) => {
    return {
        id: name ?? refPdf?.name,
        refPdf: refPdf ?? null,
        name: name ?? refPdf?.name,
        value: value ?? refPdf?.value,
        description: "",
        location: location ?? {pageNum: refPdf?.pageNum},
        fieldListId,
        variable: null
    }
}

const makeId = (val) => {
    return val?.toLowerCase().replace(/\s/g, "");
}

let varId = 1;
export const FormVariable = (name, value, description, exampleValue) => {

    const formVariable = {
        id: makeId(name) ?? makeId(value) ?? varId++,
        name: name || value || "",
        value: value || name || "",
        description: description || "",
        exampleValue: exampleValue || ""
    };

    formVariable.isEqual = (other) => {
        if (!other) return false;

        return formVariable.id === other.id || formVariable.value === other.value;
    }

    return formVariable
}

export const FieldList = (name, pdfId) => {
    const id = uuidv4();
    return {
        id,
        pdfId,
        name,
        isSelected: false,
    }
}

export const dbSchemaMap = {
    [Field.name]: {
        keyPath: ["id", "fieldListId"],
        indices: [{name: "fieldListId"}, {name: "name"}]
    },
    [FieldList.name]: {
        indices: [{name: "pdfId"}]
    },
}

export function dbSchema(clazz) {
    return dbSchemaMap[clazz] ?? {};
}