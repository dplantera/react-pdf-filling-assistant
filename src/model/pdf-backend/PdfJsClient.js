import {Field} from "../types";

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

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

            const formFields = await allAnnotations.filter(annotation => (includeReadOnly || !annotation.readOnly) && annotation.fieldType);
            //remove duplicates
            const names = formFields.map(field => {
                return field.fieldName
            });
            let filtered = formFields.filter(({fieldName}, index) => !names.includes(fieldName, index + 1))
            console.debug("PdfJsClient: loaded fields:", {
                formFields,
                excluded: allAnnotations.filter(e => !formFields.includes(e)),
                dups: filtered
            })

            resolve(filtered.map(field => {
                return Field(field, field.fieldName, field.fieldValue, {pageNum: field.pageNum})
            }))
        })
    }

    selectField(field) {
        const doSelectField = (fieldName) => {
            const el = this.getElement(fieldName);
            el.style.backgroundColor = "yellow";
            el.scrollIntoView();
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
        if(Array.isArray(elements))
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



