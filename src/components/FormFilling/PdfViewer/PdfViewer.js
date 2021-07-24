import React, {useEffect, useRef, useState} from 'react';
import UploadPdf from "./UploadPdf";
import {useStore} from "../../../store";


const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const pdfs = useStore(state => state.pdfs)

    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    useEffect(() => {
        if (viewerInstance) {
            console.debug("PdfViewer: already initialized")
            return
        }
        const initPdf = (fileName, data) => {
            console.debug("PdfViewer: initPdf")
            pdfClient.init({viewerDiv, fileName, data})
                .then(pdfClient => {
                    setViewerInstance(pdfClient);
                    pdfClient.on("documentinit", async () => {
                        console.debug("PdfViewer: documentinit")
                        await pdfClient.onReload();
                        setIsPdfReady(true);
                    })
                })
        }
        if (pdfs?.length > 0)
            initPdf(pdfs[0].name, pdfs[0].binary)
    }, [pdfs, pdfClient, setIsPdfReady, viewerInstance])

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
