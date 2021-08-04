import React, {useEffect, useRef, useState} from 'react';
import UploadPdf from "./UploadPdf";
import {useStore} from "../../../store";


const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const pdfs = useStore(state => state.pdfs)
    const loadFields = useStore(state => state.loadFields);

    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    useEffect(() => {
        if (viewerInstance && pdfClient.isInitialized) {
            console.debug("PdfViewer: already initialized")
            return
        }
        const lastPDF = pdfs?.[pdfs?.length - 1] ?? {}
        const initPdf = (fileName, data) => {
            console.debug("PdfViewer: initPdf")
            pdfClient.init({viewerDiv, fileName, data})
                .then(pdfClient => {
                    setViewerInstance(pdfClient);
                    pdfClient.on("documentinit", async () => {
                        let rawFields = await pdfClient.getFormFields();
                        await loadFields(lastPDF, rawFields);
                        console.debug("PdfViewer: documentinit")
                        setIsPdfReady(true);
                    })
                })
        }
        if (pdfs?.length > 0)
            initPdf(lastPDF.name, lastPDF.binary)
    }, [pdfs, pdfClient, setIsPdfReady, viewerInstance, loadFields])

    return (
        <div id="viewerContainer" style={{
            position: "relative",
            width: "65%",
            // height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            justifyContent: "center"
        }}>
            <UploadPdf loadPdf={pdfClient.loadPdf.bind(pdfClient)} setIsPdfReady={setIsPdfReady}/>
            <div id="viewer" className="pdfViewer" ref={viewerDiv}
                 style={{position: "relative", width: "99%", height: "100%"}}/>
        </div>
    );
};

export default PdfViewer;
