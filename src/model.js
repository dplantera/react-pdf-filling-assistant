/*
        Entities
 */
export const Pdf = (name, refPdf) => {
    return {
        name,
        refPdf
    }
}

export const Field = (refPdf, name, value) => {
    return {
        refPdf,
        name: name || refPdf.name,
        value: value ? value : refPdf.value,
        description: ""
    }
}

export const FieldList = (name, fields) => {
    let id = 0;
    return {
        id: id++,
        name: name,
        fields: fields
    }
}