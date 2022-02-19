import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import React, {createRef, memo, useCallback, useRef, useState} from "react";
import {ViewerToolbar} from "./ViewerToolbar";
import {Card, CircularProgress, Drawer} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import dom from '../../../utils/dom'

// there is known issue with create react app directly using the lib for worker https://github.com/mozilla/pdf.js/issues/10997
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const useStyles = makeStyles(() => {
    let heightToolbar = 35;
    return {
        sidebar: {
            position: "absolute",
            top: heightToolbar,
            backgroundColor: "#eee",
            minWidth: 25,
            height: `calc(100% - ${heightToolbar}px)`,
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

    const getPageCanvas = useCallback(
        (page = pageNumber) => {
            const indexPage = page <= 0 ? 0 : page - 1;
            return refPages.current[indexPage].current
        },
        [pageNumber],
    );


    const renderPages = () => {
        const Pages = [];
        for (let i = 0; i < numPages; i++) {
            refPages.current[i] = createRef();
            Pages.push(
                <Card key={i}>
                    <Page
                        inputRef={refPages.current[i]}
                        pageNumber={i + 1}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer renderForms
                        onGetAnnotationsSuccess={(annotations) => console.debug("ReactPdfViewer.onGetAnnotationsSuccess")}
                    />
                </Card>,
            )
        }
        return Pages;
    }
    const scrollIntoView = useCallback(
        (page) => {
            const pageCanvas = getPageCanvas(page);
            dom.scrollIntoView(pageCanvas);
        },
        [getPageCanvas],
    );


    const handlePageNumberChanged = useCallback((newPageNum) => {
        console.debug("ReactPdfViewer.handlePageNumberChanged ", newPageNum)
        refPageNum.current = newPageNum;
        setPageNumber(newPageNum);
        scrollIntoView(newPageNum);
    }, [scrollIntoView])

    function handleDocumentLoadSuccess(pdfProxy) {
        setNumPages(pdfProxy.numPages);
        onDocumentLoaded({
            pdfProxy,
            scrollIntoView,
        })
    }

    if (!file)
        onInit?.({pdfjs, loadPdf: setFile, goToPage: handlePageNumberChanged, getPageCanvas, refDocument, refPageNum})

    return (
        <div id="viewerContainer" className={"pdf-viewer-container"}>
            <ViewerToolbar pageNum={pageNumber} setPageNum={setPageNumber} numPages={numPages}
                           onChangedNumPage={handlePageNumberChanged}
                           scale={scale} onZoomed={setScale}/>
            <Drawer variant="permanent" open={true} classes={{paperAnchorLeft: classes.sidebar}}/>
            <div id="viewer" className="react-pdf-viewer">

                <div className={"document-container"}>
                    <Document
                        inputRef={refDocument}
                        file={file}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        loading={<CircularProgress/>}
                        onPassword={() => {
                            console.log("Password ----")
                        }}
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

export default memo(ReactPdfViewer);
