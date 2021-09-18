import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import React, {createRef, useCallback, useRef, useState} from "react";
import {ViewerToolbar} from "./ViewerToolbar";
import {Card, CircularProgress, Drawer} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const useStyles = makeStyles(() => {
    let heightToolbar = 35;
    return {
        sidebar: {
            position: "absolute",
            top: heightToolbar,
            backgroundColor: "#eee",
            minWidth: 25,
            height: `calc(100% - ${heightToolbar}px)`
        },
    }
})

const ReactPdfViewer = ({onDocumentLoaded, onInit, pdfSource}) => {
    const [file, setFile] = useState(pdfSource);
    const [scale, setScale] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const refPages = useRef([]);
    const refDocument = useRef(null);
    const classes = useStyles();

    const refPageNum = useRef(pageNumber);

    const getPageCanvas = (page = pageNumber) => {
        const indexPage = page <= 0 ? 0 : page - 1;
        return refPages.current[indexPage].current
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
                          onGetAnnotationsSuccess={(annotations) => console.debug("ReactPdfViewer.onGetAnnotationsSuccess")}
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

    const handlePageNumberChanged = useCallback(
        (newPageNum) => {
            console.debug("ReactPdfViewer.handlePageNumberChanged ", newPageNum)
            refPageNum.current = newPageNum;
            setPageNumber(newPageNum);
            scrollIntoView(newPageNum);
        },
        [setPageNumber, scrollIntoView],
    );

    function handleDocumentLoadSuccess(pdfProxy) {
        setNumPages(pdfProxy.numPages);
        onDocumentLoaded({
            pdfProxy,
            scrollIntoView,
        })
    }

    if (!file)
        onInit?.({loadPdf: setFile, goToPage: handlePageNumberChanged, getPageCanvas, refDocument, refPageNum})

    return (
        <div id="viewerContainer" className={"pdf-viewer-container"}>
            <ViewerToolbar page={pageNumber} numPages={numPages} onChangedNumPage={handlePageNumberChanged}
                           scale={scale} onZoomed={setScale}/>
            <Drawer variant="permanent" open={true} classes={{paperAnchorLeft: classes.sidebar}}/>
            <div id="viewer" className="react-pdf-viewer">

                <div className={"document-container"}>
                    <Document
                        inputRef={refDocument}
                        file={file}
                        onLoadSuccess={handleDocumentLoadSuccess}
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
