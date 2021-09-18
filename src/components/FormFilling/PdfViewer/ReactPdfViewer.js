import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import React, {createRef, useRef, useState} from "react";
import UploadPdf from "./UploadPdf";
import {ViewerToolbar} from "./ViewerToolbar";
import {Card, CircularProgress, Drawer} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
window.refPages = {};

const useStyles = makeStyles(() => {
    let offsetTop = 80;
    return {
        sidebar: {
            position: "absolute",
            top: offsetTop,
            backgroundColor: "#eee",
            minWidth: 25,
            height: `calc(100% - ${offsetTop}px)`
        },
    }
})

const ReactPdfViewer = ({pdfClient, setIsPdfReady}) => {
    const [scale, setScale] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const refPages = useRef([]);

    const classes = useStyles();

    const getPageCanvas = (page = pageNumber) => {
        const indexPage = page <= 0 ? 0 : page - 1;
        return refPages.current[indexPage].current
    }

    function onDocumentLoadSuccess(pdfProxy) {
        console.log({pdfProxy})
        pdfProxy.getPage(1).then(rest => {
            console.log({page: rest})
        })
        window.refPages = refPages.current;
        setNumPages(pdfProxy.numPages);
    }

    const renderPages = () => {
        const Pages = [];
        for (let i = 0; i < numPages; i++) {
            refPages.current[i] = createRef();
            Pages.push(
                <Card>
                    <Page key={i}
                          inputRef={refPages.current[i]}
                          pageNumber={i + 1}
                          scale={scale}
                          renderTextLayer={false}
                          renderAnnotationLayer renderInteractiveForms
                          onGetAnnotationsSuccess={(annotations) => console.log({annotations})}
                    />
                </Card>
            )
        }
        return Pages;
    }
    const scrollIntoView = (page) => {
        const pageCanvas = getPageCanvas(page);
        if (pageCanvas.scrollIntoViewIfNeeded) {
            pageCanvas.scrollIntoViewIfNeeded();  // https://stackoverflow.com/a/54515025
        } else {
            let inlineCenter = {behavior: 'auto', block: 'center', inline: 'center'};
            pageCanvas.scrollIntoView(inlineCenter);
        }
    }

    const handlePageNumberChanged = (newPageNum) => {
        setPageNumber(newPageNum);
        scrollIntoView(newPageNum);
    }

    return (
        <div id="viewerContainer" className={"pdf-viewer-container"}>
            <UploadPdf loadPdf={pdfClient.loadPdf.bind(pdfClient)} setIsPdfReady={setIsPdfReady}/>
            <ViewerToolbar page={pageNumber} numPages={numPages} onChangedNumPage={handlePageNumberChanged}
                           scale={scale} onZoomed={setScale}/>
            <Drawer variant="permanent" open={true} classes={{paperAnchorLeft: classes.sidebar}}/>
            <div id="viewer" className="react-pdf-viewer">

                <div className={"document-container"}>
                    <Document
                        file="files/pdf-form-assistant_example.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<CircularProgress/>}
                    >
                        <div className={"page-container flex-column"}>
                            {renderPages()}
                        </div>
                    </Document>
                </div>
            </div>
        </div>
    );
};

export default ReactPdfViewer;
