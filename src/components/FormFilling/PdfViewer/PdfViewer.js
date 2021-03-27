import React, {useEffect, useRef, useState} from 'react';
import UploadPdf from "./UploadPdf";

const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    useEffect(() => {
        if (viewerInstance) {
            console.log("pdf viewer already initialized")
            return
        }

        pdfClient.init({viewerDiv, initialPdf: '/files/form2.pdf'})
            .then(pdfClient => {
                setViewerInstance(pdfClient);
                pdfClient.on("documentinit", async () => {
                    await pdfClient.onReload();
                    setIsPdfReady(true);
                })
            })
    }, [pdfClient, setIsPdfReady, viewerInstance])

    return (
        <div id="viewerContainer" style={{
            position: "relative",
            width: "65%",
            height: "100%",
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
