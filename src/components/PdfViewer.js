import React, {useEffect, useRef, useState} from 'react';
import {FieldList} from "../pdf-backend/model";


const PdfViewer = ({pdfClient, setFields, setFieldLists, setIsPdfReady}) => {
    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    useEffect(() => {
        if (viewerInstance) {
            console.log("pdf viewer already initialized")
            return
        }

        pdfClient.init({viewerDiv, initialPdf: '/files/form.pdf'})
            .then(  pdfClient => {
                setViewerInstance(pdfClient)
                pdfClient.on("pagesloaded", async () => {
                    const formFields = await pdfClient.getFormFields();
                    setFields(formFields)
                    setFieldLists([FieldList(pdfClient.getPdfName(), formFields)])
                    setIsPdfReady(true)
                })
            })
    }, [viewerInstance,pdfClient, setFields, setFieldLists, setIsPdfReady])

    return (
        <div id="viewerContainer" style={{position: "relative", width: "70%", height: "97%"}}>
            <div id="viewer" className="pdfViewer" ref={viewerDiv}
                 style={{position: "relative", width: "99%", height: "100%"}}/>
        </div>
    );
};

export default PdfViewer;
