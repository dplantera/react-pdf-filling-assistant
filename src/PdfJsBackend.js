/*Super ugly code... rewrite all of it*/
const pdfjsLib = require('pdfjs-dist')

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

// there is known issue with react directly using the lib for worker https://github.com/mozilla/pdf.js/issues/10997
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/npm/pdfjs-dist@2.6.347/build/pdf.worker.js'

let pdfjsInstance = {};

export const PdfJs = (viewerDiv, initialPdf) => {
    let src = initialPdf;
    let iframe, pdf, pages, pdfMeta = null;

    pdfjsInstance = {
        src,
        iframe,
        pdfMeta,
        pdf,
        pages,
        init: async () => {
            // using the default viewer for rendering
            iframe = document.createElement('iframe');
            iframe.src = `/pdfjs-2.6.347-dist/web/viewer.html?file=${src}`;
            iframe.width = '100%';
            iframe.height = '100%';
            viewerDiv.current.appendChild(iframe);
            pdfjsInstance.iframe = iframe;

            // render yourself - a lot to do ..., maybe sometime else
            // const container = viewerDiv.current.parentNode;
            // const eventBus = new UIUtils.EventBus();
            // const pdfViewer = new PDFViewer({
            //     container,
            //     eventBus,
            // });
            // await loadPdf();
            // pdfViewer.setDocument(pdf);

            // using the api directly for e.g. extracting form fields
            await pdfjsInstance.loadPdf({url:src})
            console.log("pdfjs backend loaded")
            return pdfjsInstance;
        },
        getAllFormFields: async (includeReadOnly = false) => {
            // according to SO, should run in parallel and sequentially resolving promises
            const allAnnotations = []
            await pdfjsInstance.pages.reduce(async (promise, page) => {
                await promise;
                const annos = await page.getAnnotations()
                allAnnotations.push(...annos)
            }, Promise.resolve())

            const formFields = await allAnnotations.filter(annotation => (includeReadOnly || !annotation.readOnly) && annotation.fieldType);
            //remove duplacets
            const names = formFields.map(field => {return field.fieldName});
            let filtered = formFields.filter(({fieldName}, index) => !names.includes(fieldName, index+1))
            console.log("loaded fields:", {
                formFields,
                excluded: allAnnotations.filter(e => !formFields.includes(e)),
                dups: filtered
            })
            return filtered;
        },
        loadPdf: async ({url, data}) => {
            const cfg = {
                cMapUrl: CMAP_URL,
                cMapPacked: CMAP_PACKED
            }
            if(url) cfg.url = url
            else if(data) cfg.data = data

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

            pdfjsInstance.pdf = pdf;
            pdfjsInstance.pdfMeta = pdfMeta;
            pdfjsInstance.pages = pages;

            let urlPathOrBins;
            if(data) urlPathOrBins = new Uint8Array(data)
            else if (url) urlPathOrBins = url;

            pdfjsInstance.viewer = pdfjsInstance.iframe.contentWindow.PDFViewerApplication;
            await pdfjsInstance.iframe.contentWindow.PDFViewerApplication.open(urlPathOrBins)
        }
    }
    return pdfjsInstance;
}




