import React, {useEffect, useRef, useState} from 'react';
import {Field} from "./model";
import * as pdfJs from "./PdfJsBackend";

const PdfViewer = ({setIsPdfReady, setPdfApi, onFieldsLoaded}) => {
    const [viewerInstance, setViewerInstance] = useState(null)
    const viewerDiv = useRef(null)

    const updated = () => {
        setIsPdfReady(false)
        setIsPdfReady(true)
    }

    function initPdfApi(instance) {
        const getElement = (name) => {
            const iframe = viewerDiv.current.firstChild;
            let elements = iframe.contentDocument.getElementsByName(name);
            if (!elements || elements.length < 1) {
                console.error("select field failed for: ", name)
                return
            }
            return elements[0].parentNode;
        }
        const pdfApi = {
            getFormFields: async () => {
                const fields = await instance.getAllFormFields();
                return fields.map(field => {return Field(field, field.fieldName, field.fieldValue)})
            },
            selectField: (name) => {
                const el = getElement(name)
                el.style.backgroundColor = "yellow";
                el.scrollIntoView({
                    behavior: 'auto',
                    block: 'nearest',
                    inline: 'center'
                });
            },
            unselectField: (name) => {
                const el = getElement(name)
                el.style.backgroundColor = "";
            },
            loadPdf: (arrayBuffer, name) => {
                instance.loadPdf({data: arrayBuffer});
            },
            getPdfName: () => {
                console.warn("getPdfName not implemented yet")
                return "test" // filename.replace(".pdf", "");
            },
        }
        setPdfApi(pdfApi);
    }

    useEffect(() => {
        if (viewerInstance) {
            console.log("pdf viewer already initialised")
            return
        }

        pdfJs.PdfJs(viewerDiv, '/files/form.pdf')
            .init()
            .then(instance => {
                initPdfApi(instance);
                setViewerInstance(instance)

                instance.viewer.eventBus.on("pagesloaded", () => {
                    updated()
                })
            });
    }, [])

    return (
        <div id="viewerContainer" style={{position: "relative", width: "70%", height: "97%"}}>
            <div id="viewer" className="pdfViewer" ref={viewerDiv}
                 style={{position: "relative", width: "99%", height: "100%"}}/>
        </div>
    );
};

export default PdfViewer;
