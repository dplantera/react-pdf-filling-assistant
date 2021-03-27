/*
        Entities
 */
export const Pdf = (name, refPdf) => {
    return {
        name,
        refPdf
    }
}

export const Field = (refPdf = null, name, value, location) => {
    return {
        id: name ?? refPdf?.name,
        refPdf: refPdf ?? null,
        name: name ?? refPdf?.name,
        value: value ?? refPdf?.value,
        description: "",
        location: location ?? {pageNum: refPdf?.pageNum},
        refFieldlist: [],
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
        if(!other) return false;

        return formVariable.id === other.id || formVariable.value === other.value;
    }

    return formVariable
}

let fieldLIstId = 1;
export const FieldList = (name, fields) => {
    return {
        id: fieldLIstId++,
        name: name,
        fields: fields,
        isSelected: false,
    }
}