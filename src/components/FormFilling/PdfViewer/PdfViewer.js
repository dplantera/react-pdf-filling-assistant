import React, {useCallback} from 'react';
import UploadPdf from "./UploadPdf";
import {useStore} from "../../../store";
import ReactPdfViewer from "./ReactPdfViewer";


const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const pdfs = useStore(state => state.pdfs)
    const loadFields = useStore(state => state.loadFields);


    const lastPDF = pdfs?.[pdfs?.length - 1] ?? {}

    const handleDocumentLoaded = async ({pdfProxy}) => {
        console.log("PdfViewer.handleDocumentLoaded")
        let rawFields = await pdfClient.getFormFields();
        await loadFields(lastPDF, rawFields);
        setIsPdfReady(true);
    }

    const handleOnInit = useCallback((pdfViewer) => {
            console.debug("PdfViewer: handleOnInit")
            if (pdfClient.isInitialized) {
                console.debug("PdfViewer: already initialized")
                return
            }
            const initPdf = (fileName, data) => {
                pdfClient.init({pdfViewer, fileName, data})
            }

            if (pdfs?.length > 0)
                initPdf(lastPDF.name, lastPDF.binary)
        }
    , [pdfs, loadFields])

    return (
        <div id="viewerContainer" className={"pdf-viewer-container"}>
            <UploadPdf loadPdf={pdfClient?.loadPdf.bind(pdfClient)} setIsPdfReady={setIsPdfReady}/>
            <ReactPdfViewer onDocumentLoaded={handleDocumentLoaded}
                            onInit={handleOnInit}
                            pdfSource={null}/>
        </div>
    );
};

export default PdfViewer;
