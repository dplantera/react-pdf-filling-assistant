import {Field} from "../types";

const pdfjsLib = require('pdfjs-dist')

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

// there is known issue with react directly using the lib for worker https://github.com/mozilla/pdf.js/issues/10997
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/npm/pdfjs-dist@2.8.335/build/pdf.worker.js'

export default class PdfJsClient {
    constructor() {
        this.viewerDiv = null;
        this._iframe = null;
        this.urlPath = null;
        this.filename = null;
        this.pdf = null;
        this.pdfMeta = null;
        this.pages = null;
        this.isReady = false;
        this.onReload = () => {
        };
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

    async init({viewerDiv, url, path, data, fileName = "unnamed.pdf"}) {
        return new Promise(async resolve => {
            this.isReady = false;
            this.viewerDiv = viewerDiv;
            this.urlPath = url || path;
            this.filename = this.urlPath? this.urlPath.split("/").reverse()[0]: fileName;
            const iframe = document.createElement('iframe')
            // using the default viewer for rendering
            iframe.src = `/pdfjs-2.8.335-dist/web/viewer.html`;
            iframe.width = '100%';
            iframe.height = '100%';
            this.viewerDiv.current.appendChild(iframe);
            this._iframe = iframe;

            await this.loadPdf({url: this.urlPath, data, fileName})
            console.debug("PdfJsClient: initialized backend.")
            this.isReady = true;
            resolve(this)
        })
    }

    async loadPdf({url, data, filename}) {
        return new Promise(async resolve => {
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
            console.debug("PdfJsClient: pdf loaded:", {
                PDFFormatVersion, IsAcroFormPresent, Title,
                docId: pdfMeta.metadata ? pdfMeta.metadata.get("xmpmm:documentid") : "", pages: pdf._pdfInfo.numPages,
                ...pdfMeta.metadata, all_meta: pdfMeta
            })

            this.pdf = pdf;
            this.pdfMeta = pdfMeta;
            this.pages = pages;

            let urlPathOrBins;
            if (data) urlPathOrBins = new Uint8Array(data)
            else if (url) urlPathOrBins = url;

            if(!this.viewer) {
                console.warn("PdfJsClient: viewer not ready");
                return urlPathOrBins;
            }
            await this.viewer.open(urlPathOrBins)
            resolve(urlPathOrBins);
        })
    }

    cleanUpExternListeners(listener) {
        const allListener = this.viewer.eventBus._listeners[listener];
        const filtered = allListener.filter((el, idx) => !el.external || (el.external && (idx === allListener.length - 1))
        );
        this.viewer.eventBus._listeners[listener] = filtered;

        if (allListener.length !== filtered.length)
            console.debug("PdfJsClient: cleaned-up event listeners: " + listener, {allListener, filtered})
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
            el.scrollIntoView({
                behavior: 'auto',
                block: 'nearest',
                inline: 'center'
            });
        }
        const fieldName = field.name ?? field;
        let fieldPageNum = field.location.pageNum;
        if (this.viewer.page === fieldPageNum) {
            doSelectField(fieldName);
        } else {
            this.goToPage(fieldPageNum, (e) => {
                doSelectField(fieldName)
            });
        }
    }

    getElement(field) {
        const fieldName = field.name ?? field;
        let elements = this._iframe.contentDocument.getElementsByName(fieldName);
        if (!elements || elements.length < 1) {
            console.error("PdfJsClient: select field failed for: ", fieldName)
            return document.createElement("div")
        }
        return elements[0].parentNode;
    }

    unselectField(field) {
        const fieldName = field.name ?? field;
        const el = this.getElement(fieldName);
        if (!el) return
        el.style.backgroundColor = "";
    }

    getPdfName() {
        return this.filename.replace(".pdf", "");
    }
}


