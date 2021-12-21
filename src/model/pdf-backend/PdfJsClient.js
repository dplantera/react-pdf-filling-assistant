import {Field, FieldTypes} from "../types";
import DomUtil from "../../utils/dom";

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

function determineFieldType(pdfJsField) {
    if (pdfJsField?.fieldType === "Tx")
        return FieldTypes.TEXT;
    if (!!pdfJsField?.checkBox)
        return FieldTypes.CHECK;
    if (!!pdfJsField?.radioButton)
        return FieldTypes.RADIO;
    return FieldTypes.TEXT;
}

function toDomainGroupField(fieldName, pdfJsFieldArray) {
    const firstField = {...pdfJsFieldArray?.[0]};
    const fieldType = determineFieldType(firstField);
    const groupField = Field(firstField, fieldName, firstField.fieldValue, {pageNum: firstField.pageNum}, undefined, fieldType );
    
    if(fieldType !== FieldTypes.RADIO)
        return [groupField]
    
    const groupChildren = pdfJsFieldArray
        .map(child => {
            const fieldType = determineFieldType(child);
            if(fieldType !== FieldTypes.RADIO)
                console.error("that should not happen - Single RadioBtn found", {fieldName, child, fieldType})
            const groupChildKey = `${child.fieldName}-${child.buttonValue}`;
            const groupChild = Field(child, groupChildKey, child.fieldValue, {pageNum: child.pageNum}, undefined, fieldType);
            groupChild.groupInfo.parent = groupField.name;
            return  groupChild;
        } );
    groupField.groupInfo.children = groupChildren.map(child => child.name);
    return [groupField, ...groupChildren];
}

function toDomainField(fieldName, pdfJsField) {
    const fieldType = determineFieldType(pdfJsField);
    const {fieldName: name, fieldValue: value, pageNum} = pdfJsField;
    if (fieldType === FieldTypes.RADIO)
        console.error("that should not happen - Single RadioBtn found", {fieldName, pdfJsField, fieldType})
    return Field(pdfJsField, name, value, {pageNum}, undefined, fieldType);
}

function transformToDomainFields(pdfjsFields) {
    const nameToPdfjsField = pdfjsFields.reduce((map, field) => {
        let {fieldName: keyFieldName} = field;
        let valueInMap = map[keyFieldName];
        if (!valueInMap)
            map[keyFieldName] = field
        else if (Array.isArray(valueInMap))
            valueInMap.push(field);
        else
            map[keyFieldName] = [valueInMap, field]
        return map;
    }, {})
    console.debug({nameToPdfjsField});
    const fields = [];
    Object.entries(nameToPdfjsField).forEach(([fieldName, fieldOrGroup]) => {
        if (Array.isArray(fieldOrGroup))
            fields.push(...toDomainGroupField(fieldName, fieldOrGroup))
        else
            fields.push(toDomainField(fieldName, fieldOrGroup));
    });
    return fields;
}

export default class PdfJsClient {
    constructor() {
        this.viewerDiv = null;
        this.urlPath = null;
        this.filename = null;
        this.pdf = null;
        this.pdfMeta = null;
        this.pages = null;
        this.isInitialized = false;
    }

    async init({pdfViewer, url, path, data, fileName = "unnamed.pdf"}) {
        console.group("PdfJsClient.init")
        return new Promise(async resolve => {
            this.isInitialized = false;
            this.urlPath = url || path;
            this.filename = this.urlPath ? this.urlPath.split("/").reverse()[0] : fileName;
            this.viewer = pdfViewer;

            await this.loadPdf({url: this.urlPath, data, fileName})
            console.debug("PdfJsClient: initialized backend.")
            this.isInitialized = true;

            console.groupEnd();
            resolve(this)
        })
    }

    async loadPdf({url, data, filename}) {
        return new Promise(async resolve => {
            console.debug("PdfJsClient.loadPDf")
            const loadPdfIntoBackend = async () => {
                if (filename) this.filename = filename;

                const cfg = {
                    cMapUrl: CMAP_URL,
                    cMapPacked: CMAP_PACKED
                }
                if (url) cfg.url = url
                else if (data) cfg.data = data
                const pdf = await this.viewer.pdfjs.getDocument(cfg).promise;
                const pdfMeta = await pdf.getMetadata();

                const pages = [];
                for (let i = 1; i <= pdf._pdfInfo.numPages; i++) {
                    const page = await pdf.getPage(i);
                    pages.push(page);
                }
                const {PDFFormatVersion, IsAcroFormPresent, Title} = pdfMeta.info
                console.debug("PdfJsClient: pdf loaded:", {
                    PDFFormatVersion,
                    IsAcroFormPresent,
                    Title,
                    docId: pdfMeta.metadata ? pdfMeta.metadata.get("xmpmm:documentid") : "",
                    pages: pdf._pdfInfo.numPages,
                    ...pdfMeta.metadata,
                    all_meta: pdfMeta
                })

                this.pdf = pdf;
                this.pdfMeta = pdfMeta;
                this.pages = pages;
            }

            const loadPdfIntoViewer = async () => {
                let urlPathOrBins;
                if (data) urlPathOrBins = new Uint8Array(data).buffer
                else if (url) urlPathOrBins = url;

                if (!this.viewer) {
                    console.warn("PdfJsClient: viewer not ready");
                    return
                }
                await this.viewer.loadPdf(urlPathOrBins)
            }
            await loadPdfIntoBackend();
            await loadPdfIntoViewer();
            console.debug("PdfJsClient.loadPDf: done")
            resolve(true);
        })
    }

    async goToPage(num) {
        this.viewer.goToPage(num);
    }

    async getFormFields(includeReadOnly = false) {
        return new Promise(async resolve => {
            // todo:optimize - a lot of loops
            // according to SO, should run in parallel and sequentially resolving promises
            const allAnnotations = []
            await this.pages.reduce(async (promise, page) => {
                await promise;
                const annos = await page.getAnnotations();
                allAnnotations.push(...annos.map(anno => {
                    return {...anno, pageNum: page.pageNumber}
                }))
            }, Promise.resolve())

            const pdfjsFormFields = allAnnotations.filter(annotation => (includeReadOnly || !annotation.readOnly) && annotation.fieldType);
            const formFields = transformToDomainFields(pdfjsFormFields);
            console.debug("PdfJsClient: loaded fields:", {
                allAnnotations,
                filtered: pdfjsFormFields,
                imported: formFields
            })
            resolve(formFields)
        })
    }

    selectField(field) {
        const doSelectField = (fieldName) => {
            const el = this.getElement(fieldName);
            el.style.backgroundColor = "yellow";
            DomUtil.scrollIntoView(el)
        }
        const fieldName = field.name ?? field;
        let fieldPageNum = field.location.pageNum;
        if (this.viewer.refPageNum.current === fieldPageNum) {
            doSelectField(fieldName);
        } else {
            this.goToPage(fieldPageNum)
                .then(() => doSelectField(fieldName));
        }
    }

    getElement(field) {
        const fieldName = field.name ?? field;
        let elements = this.viewer.refDocument.current?.querySelector(`[name='${fieldName}']`);
        if (!elements || elements.length < 1) {
            console.error("PdfJsClient: select field failed for: ", fieldName)
            return document.createElement("div")
        }
        if (Array.isArray(elements))
            return elements[0].parentNode;
        return elements.parentNode;
    }

    unselectField(field) {
        const fieldName = field.name ?? field;
        const el = this.getElement(fieldName);
        if (!el) return
        el.style.backgroundColor = "";
    }
}



