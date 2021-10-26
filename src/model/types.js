import {v4 as uuidv4} from 'uuid';
import {Entity} from "client-persistence";
import serializeJs from "serialize-javascript";

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

export const FieldValueTypes = {
    "VAR": {
        name: "variable"
    },
    "CONST": {
        name: "constant"
    },
    "SCRIPT": {
        name: "script"
    }
}

export const FieldTypes = {
    "RADIO": {
        name: "radio",
        valueType: FieldValueTypes.VAR
    },
    "CHECK": {
        name: "check",
        valueType: FieldValueTypes.VAR

    },
    "TEXT": {
        name: "text",
        valueType: FieldValueTypes.VAR
    }
}


function deserializeScript(serializedJavascript) {
    // eslint-disable-next-line
    return eval("(" + serializedJavascript + ")");
}

export class Settings extends Entity {
    constructor(json) {
        super();
        this.addPlainJs(json);
    }

    addPlainJs(obj) {
        this.json =  serializeJs(obj, {space: 2, unsafe: true})
    }

    addJson(json) {
        this.json = json;
    }

    getJson(beautify) {
        if (beautify)
            return serializeJs(this.getSettings(), {space: 2, unsafe: true})
        return this.json;
    }

    getSettings() {
        return deserializeScript(this.json);
    }
}

export const Field = (refPdf = null, name, value, location, fieldListId, type, valueType) => {

    return {
        id: name ?? refPdf?.name,
        refPdf: refPdf ?? null,
        name: name ?? refPdf?.name,
        value: value ?? refPdf?.value,
        description: "",
        type: type ?? FieldTypes.TEXT,
        valueType: valueType ?? type.valueType,
        groupInfo: {
            parent: undefined,
            children: []
        },
        location: location ?? {pageNum: refPdf?.pageNum},
        fieldListId,
        variable: null
    }
}

const makeId = (val) => {
    return val?.toLowerCase().replace(/\s/g, "");
}

export const FormVariable = (name, value, description, exampleValue) => {

    const formVariable = {
        id: makeId(name) ?? makeId(value) ?? uuidv4(),
        name: name || value || "",
        value: value || name || "",
        description: description || "",
        exampleValue: exampleValue || ""
    };

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