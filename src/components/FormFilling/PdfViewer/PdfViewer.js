import React, {useEffect, useRef, useState} from 'react';
import {FieldList} from "../../../model/types";
import UploadPdf from "./UploadPdf";
import {useFormFields} from "../../hooks/FormContext";
import {useFieldLists} from "../../hooks/FieldListsContext";


const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const [, setFields] = useFormFields();
    const [, setFieldLists] = useFieldLists();

    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    useEffect(() => {
        if (viewerInstance) {
            console.log("pdf viewer already initialized")
            return
        }

        pdfClient.init({viewerDiv, initialPdf: '/files/form2.pdf'})
            .then(pdfClient => {
                setViewerInstance(pdfClient)
                pdfClient.on("documentinit", async () => {
                    const formFields = await pdfClient.getFormFields();
                    console.log("pdf initialised...")
                    setFieldLists([FieldList(pdfClient.getPdfName(), formFields)])
                    setFields(formFields);
                    setIsPdfReady(true)
                })
            })
    }, [viewerInstance, pdfClient, setFieldLists, setIsPdfReady, setFields])

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
