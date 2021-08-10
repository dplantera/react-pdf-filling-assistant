import React, {useEffect, useRef} from 'react';
import UploadPdf from "./UploadPdf";
import {useStore} from "../../../store";


const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const pdfs = useStore(state => state.pdfs)
    const loadFields = useStore(state => state.loadFields);

    const viewerDiv = useRef(null)

    useEffect(() => {
        if (pdfClient.isInitialized) {
            console.debug("PdfViewer: already initialized")
            return
        }
        const lastPDF = pdfs?.[pdfs?.length - 1] ?? {}
        const initPdf = (fileName, data) => {
            console.debug("PdfViewer: initialize")
            pdfClient.init({viewerDiv, fileName, data})
                .then(pdfClient => {
                    pdfClient.on("documentinit", async () => {
                        console.group("PdfViewer: documentinit")
                        let rawFields = await pdfClient.getFormFields();
                        await loadFields(lastPDF, rawFields);
                        setIsPdfReady(true);
                        console.groupEnd()
                    })
                })
        }
        if (pdfs?.length > 0)
            initPdf(lastPDF.name, lastPDF.binary)
    }, [pdfs, pdfClient, setIsPdfReady, loadFields])

    return (
        <div id="viewerContainer"  className={"pdf-viewer-container"} >
            <UploadPdf loadPdf={pdfClient.loadPdf.bind(pdfClient)} setIsPdfReady={setIsPdfReady}/>
            <div id="viewer" className="pdf-viewer" ref={viewerDiv}/>
        </div>
    );
};

export default PdfViewer;
