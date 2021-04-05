import React, {useEffect, useRef, useState} from 'react';
import UploadPdf from "./UploadPdf";
import {ClientUpload} from "../../../utils/ClientUpload";
import {Pdf} from "../../../model/types";
import {ClientStorage} from "../../../utils/ClientStorage";
import {useFormActions} from "../../hooks/FormActionContext";

const clientUpload = new ClientUpload();
const storage = ClientStorage.instance;
const PdfViewer = ({pdfClient, setIsPdfReady}) => {
    const {updatePdf} = useFormActions();
    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    useEffect(() => {
        if (viewerInstance) {
            console.log("pdf viewer already initialized")
            return
        }
        const initPdf = (data, fileName) => {
            pdfClient.init({viewerDiv, data, fileName})
                .then(pdfClient => {
                    setViewerInstance(pdfClient);
                    pdfClient.on("documentinit", async () => {
                        await pdfClient.onReload();
                        setIsPdfReady(true);
                    })
                })
        }

        const loadInitialPdf = async () => {
            const loadDefault = () => {
                clientUpload.forStaticFile
                    .uploadAsUint8('/files/form2.pdf')
                    .then(([data, fileName]) => {
                        console.info("loading default pdf ", fileName);
                        initPdf(data, fileName);
                        updatePdf(Pdf(fileName, data));
                    })
            }
            try {
                const pdfs = await storage.get(Pdf, {keys: [1]});
                if(!pdfs[0].binary)
                    loadDefault();
                else
                    initPdf(pdfs[0].binary, pdfs[0].name)
            } catch (error) {
                console.log(error)
                loadDefault();
            }
        }
        loadInitialPdf().then(() => console.log("initial pdf loaded..."))

    }, [pdfClient, setIsPdfReady, viewerInstance, updatePdf])

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
