import React, {useCallback} from 'react';
import UploadPdf from "./UploadPdf";
import {useStore} from "../../../store";
import ReactPdfViewer from "./ReactPdfViewer";
import DomUtil from "../../../utils/dom";

function registerFieldSelectionHandler(pdfViewer) {
    const doc = pdfViewer.refDocument.current;
    if (!doc) return
    doc.addEventListener("click", (e) => {
        const {target} = e;
        if (target?.tagName !== "INPUT")
            return;

        const el = document.getElementById(target.name);
        if (!el) {
            console.warn("failed to select: ", {field: el})
            return;
        }
        el.style.backgroundColor = "yellow";
        DomUtil.scrollIntoView(el)

        const listener = target.addEventListener("blur", () => {
            el.style.backgroundColor = "";
            target.removeEventListener("blur", listener);
        })
    })
}

const PdfViewer = ({pdfClient, setIsPdfReady, withFieldHighlighting = true}) => {
    const pdfs = useStore(state => state.pdfs)
    const loadFields = useStore(state => state.loadFields);


    const lastPDF = pdfs?.[pdfs?.length - 1] ?? {}
    if (!lastPDF)
        setIsPdfReady(true);

    const handleDocumentLoaded = async ({pdfProxy}) => {
        console.log("PdfViewer.handleDocumentLoaded")
        console.log({pdfProxy})
        let rawFields = await pdfClient.getFormFields().catch(err => console.error(err));
        await loadFields(lastPDF, rawFields).catch(err => console.error(err));
        setIsPdfReady(true);
    }

    const handleOnInit = useCallback((pdfViewer) => {
            console.debug("PdfViewer: handleOnInit")
            if (pdfClient.isInitialized) {
                console.debug("PdfViewer: already initialized")
                setIsPdfReady(true);
                return
            }
            const initPdf = (fileName, data) => {
                pdfClient.init({pdfViewer, fileName, data})
            }

            if (pdfs?.length > 0)
                initPdf(lastPDF.name, lastPDF.binary)

            if (withFieldHighlighting)
                registerFieldSelectionHandler(pdfViewer)
        }
        , [pdfs, lastPDF.binary, lastPDF.name, pdfClient, setIsPdfReady, withFieldHighlighting])
    return (
        <div id="viewerContainer" className={"pdf-viewer-container"}>
            <UploadPdf loadPdf={pdfClient?.loadPdf.bind(pdfClient)} setIsPdfReady={setIsPdfReady}/>
            <ReactPdfViewer onDocumentLoaded={handleDocumentLoaded}
                            onInit={handleOnInit}
                            pdfSource={null}
            />
        </div>
    );
};

export default PdfViewer;
