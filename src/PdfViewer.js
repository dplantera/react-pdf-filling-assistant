/**
 * This viewer is based on https://github.com/PDFTron/webviewer-react-sample
 * I've used it for this demo project and I've contacted the sales team for clarification.
 *
 * Please bear in mind the PDFTron license for the WebViewer SDK:
 *
 * Copyright 2020 PDFTron Systems Inc. All rights reserved.
 * WebViewer React UI project/codebase or any derived works is only permitted in solutions with an active commercial PDFTron WebViewer license.
 * For exact licensing terms please refer to your commercial WebViewer license. For use in other scenario, please contact sales@pdftron.com
 *
 */
import React, {useEffect, useRef, useState} from 'react';
import {Field} from "./model";
import WebViewer from "@pdftron/webviewer";


const getFields = (annotationManager) => {
    const getFieldsRecursive = (field, fields) => {
        if (field.type)
            fields.push(Field(field))
        else
            console.log("no type: ", field)

        field.children.forEach((field) => getFieldsRecursive(field, fields));
        return fields;
    }
    const getAllFields = () => {
        const fieldManager = annotationManager.getFieldManager();
        let allFields = [];
        fieldManager.forEachField(async (field) => {
            let fields = getFieldsRecursive(field, []);
            allFields = [...allFields, ...fields]
        });
        return allFields;
    }
    return getAllFields();
}

const PdfViewer = ({setIsPdfReady, setPdfApi}) => {
    const [viewerInstance, setViewerInstance] = useState(null)
    const [viewerDiv] = useState(useRef(null))

    function onPdfFieldsUpdated() {
        setIsPdfReady(false);
        setIsPdfReady(true);
    }

    function initPdfApi(instance) {
        const {docViewer} = instance;
        const pdfApi = {
            getFormFields: () => {
                return getFields(docViewer.getAnnotationManager())
            },
            selectField: (name) => {
                const iframe = viewerDiv.current.firstChild;
                const el = iframe.contentDocument.getElementById(name);
                if (!el) {
                    console.error("select field failed for: ", name)
                    return
                }
                el.style.backgroundColor = "yellow";
                el.scrollIntoView({
                    behavior: 'auto',
                    block: 'nearest',
                    inline: 'center'
                });
            },
            unselectField: (name) => {
                const iframe = viewerDiv.current.firstChild;
                const el = iframe.contentDocument.getElementById(name);
                el.style.backgroundColor = "";
            },
            loadPdf: (arrayBuffer, name) => {
                // `arrayBuffer` is your buffer data which can come
                // from sources such as a server or the filesystem
                const arr = new Uint8Array(arrayBuffer);
                const blob = new Blob([arr], {type: 'application/pdf'});
                instance.loadDocument(blob, {filename: name});
            },
            getPdfName: () => {
                let filename = docViewer.getDocument().getFilename();
                return filename.replace(".pdf", "");
            },
        }
        setPdfApi(pdfApi);
    }

    useEffect(() => {
        if(viewerInstance) {
            console.log("pdf viewer already initialised")
            return
        }

        WebViewer(
            {
                path: '/webviewer/lib',
                initialDoc: '/files/form.pdf',
                // fullAPI: true
            },
            viewerDiv.current,
        ).then((instance) => {
            setViewerInstance(instance);
            initPdfApi(instance);

            instance.docViewer.on('annotationsLoaded', async () => {
                onPdfFieldsUpdated();
            });
        });

    }, [])

    return (
        <div style={{position: "relative", width: "70%", height: "97%"}}>
            <div className="pdfviewer" ref={viewerDiv} style={{position: "relative", width: "99%", height: "100%"}}/>
        </div>
    );
};

export default PdfViewer;
