/*
        Entities
 */
export const Pdf = (name, refPdf) => {
    return {
        name,
        refPdf
    }
}

export const Field = (refPdf, name, value, location) => {
    return {
        refPdf,
        name: name || refPdf.name,
        value: value ? value : refPdf.value,
        description: "",
        location: location || {pageNum: refPdf.pageNum},
        variable: null
    }
}

export const FormVariable = (name, value, description, exampleValue) => {
    const formVariable = {
        name: name || value || "",
        value: value || name || "",
        description: description || "",
        exampleValue: exampleValue || ""
    };
    return formVariable
}

export const FieldList = (name, fields) => {
    let id = 0;
    return {
        id: id++,
        name: name,
        fields: fields
    }
}