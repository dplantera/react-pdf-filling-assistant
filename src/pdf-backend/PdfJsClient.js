import {Field} from "./model";

const pdfjsLib = require('pdfjs-dist')

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

// there is known issue with react directly using the lib for worker https://github.com/mozilla/pdf.js/issues/10997
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/npm/pdfjs-dist@2.6.347/build/pdf.worker.js'

export default class PdfJsClient {
    constructor() {
        this.viewerDiv = null;
        this._iframe = null;
        this.urlPath = null;
        this.filename = null;
        this.pdf = null;
        this.pdfMeta = null;
        this.pages = null;
    }

    get viewer() {
        return this._iframe.contentWindow.PDFViewerApplication
    };

    get on() {
        return this.viewer.eventBus.on.bind(this.viewer.eventBus)
    }

    get off() {
        return this.viewer.eventBus.off.bind(this.viewer.eventBus)
    }

    async init({viewerDiv, initialPdf}) {
        this.viewerDiv = viewerDiv;
        this.urlPath = initialPdf;
        this.filename = initialPdf.split("/").reverse()[0]
        const iframe = document.createElement('iframe')
        // using the default viewer for rendering
        iframe.src = `/pdfjs-2.6.347-dist/web/viewer.html?file=${this.urlPath}`;
        iframe.width = '100%';
        iframe.height = '100%';
        this.viewerDiv.current.appendChild(iframe);
        this._iframe = iframe;

        await this.loadPdf({url: this.urlPath})
        console.log("pdfjs backend initialized")
        return this;
    }

    async loadPdf({url, data, filename}) {
        if (filename) this.filename = filename;

        const cfg = {
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED
        }
        if (url) cfg.url = url
        else if (data) cfg.data = data
        const pdf = await pdfjsLib.getDocument(cfg).promise;
        const pdfMeta = await pdf.getMetadata();
        const pages = [];
        for (let i = 1; i <= pdf._pdfInfo.numPages; i++) {
            const page = await pdf.getPage(i);
            pages.push(page);
        }
        const {PDFFormatVersion, IsAcroFormPresent, Title} = pdfMeta.info
        console.log({
            PDFFormatVersion, IsAcroFormPresent, Title,
            docId: pdfMeta.metadata.get("xmpmm:documentid"), pages: pdf._pdfInfo.numPages,
            ...pdfMeta.metadata, all_meta: pdfMeta
        })

        this.pdf = pdf;
        this.pdfMeta = pdfMeta;
        this.pages = pages;

        let urlPathOrBins;
        if (data) urlPathOrBins = new Uint8Array(data)
        else if (url) urlPathOrBins = url;

        await this.viewer.open(urlPathOrBins)
    }

    cleanUpExternListeners(listener) {
        const allListener = this.viewer.eventBus._listeners[listener];
        const filtered = allListener.filter((el, idx) => !el.external || (el.external && (idx === allListener.length - 1))
        );
        this.viewer.eventBus._listeners[listener] = filtered;

        if (allListener.length !== filtered.length)
            console.log("cleaned up event listeners: " + listener, {allListener, filtered})
    }

    goToPage(num, callback) {
        // we need to wait for form fields to be rendered...
        this.cleanUpExternListeners("pagechanging")
        this.on('pagechanging', () => {
            if (num !== this.viewer.page)
                return
            callback()
        });
        this.viewer.pdfViewer.currentPageNumber = num;
    }

    async getFormFields(includeReadOnly = false) {
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
        console.log("loaded fields:", {
            formFields,
            excluded: allAnnotations.filter(e => !formFields.includes(e)),
            dups: filtered
        })

        return filtered.map(field => {
            return Field(field, field.fieldName, field.fieldValue, {pageNum: field.pageNum})
        });
    }

    selectField(field) {
        const doSelectField = (field) => {
            const el = this.getElement(field);
            el.style.backgroundColor = "yellow";
            el.scrollIntoView({
                behavior: 'auto',
                block: 'nearest',
                inline: 'center'
            });
        }

        if (this.viewer.page === field.location.pageNum) {
            doSelectField(field);
        } else {
            this.goToPage(field.location.pageNum, (e) => {
                doSelectField(field)
            });
        }
    }

    getElement(field) {
        let elements = this._iframe.contentDocument.getElementsByName(field.name);
        if (!elements || elements.length < 1) {
            console.error("select field failed for: ", field)
            return document.createElement("div")
        }
        return elements[0].parentNode;
    }

    unselectField(field) {
        const el = this.getElement(field)
        if (!el) return
        el.style.backgroundColor = "";
    }

    getPdfName() {
        return this.filename.replace(".pdf", "");
    }
}



