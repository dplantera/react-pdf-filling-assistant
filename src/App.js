import React, {useEffect, useState} from 'react';
import './App.css';
import {AppBar, CircularProgress, Toolbar, Typography} from "@material-ui/core";
import UploadPdf from "./UploadPdf";
import PdfViewer from "./PdfViewer";
import {FieldList, Pdf} from "./model";
import FormFieldList from "./FormFieldList";
import {pdfApi as pdfApiI} from "./pdfApi"

const App = () => {
        const [isPdfReady, setIsPdfReady] = useState(false);
        const [fields, setFields] = useState([]);
        const [fieldLists, setFieldLists] = useState([]);
        const [pdf, setPdf] = useState(null);
        const [pdfApi, setPdfApi] = useState(pdfApiI)

        useEffect(() => {
            if (!isPdfReady) {
                console.log("pdf not ready...")
                return;
            }
            // probably only a dev issue when updating app.js UI get async wit instances
            const pdfName = pdfApi.getPdfName();
            setPdf(Pdf(pdfName, null));
            console.log("loading fields...")
            pdfApi.getFormFields().then(fields => {
                setFields(fields);
                setFieldLists([FieldList(pdfName, fields)])
            });
        }, [isPdfReady])

        const highlightFormField = (e, field) => {
            pdfApi.selectField(field.name)
        }

        const resetHighlightFormField = (e, field) => {
            pdfApi.unselectField(field.name)
        }

        return (
            <div className="App">
                <AppBar position="static">
                    <Toolbar style={{display: "flex", justifyContent: "space-between"}}>
                        <Typography variant="h5">PDF Filling Assistant</Typography>
                        <UploadPdf loadPdf={pdfApi.loadPdf} setIsPdfReady={setIsPdfReady}/>
                    </Toolbar>
                </AppBar>
                <div className={"flex-container"}
                     style={{position: "relative", display: "flex", width: "100%", height: "94%"}}>

                    <FormFieldList highlightFormField={highlightFormField}
                                   resetHighlightFormField={resetHighlightFormField}
                                   fieldLists={fieldLists}
                                   fields={fields}
                                   pdf={pdf}
                />
                    <PdfViewer
                        setIsPdfReady={setIsPdfReady}
                        setPdfApi={setPdfApi}
                    />
                </div>
                {!isPdfReady
                && <div style={{
                    position: "absolute", display: "flex", width: "100vw", height: "100vh", alignItems: "center",
                    justifyContent: "center",
                }}>
                    <div className={"spinner-background"} style={{
                        position: "absolute", width: "100vw", height: "100vh", backgroundColor: "gray", opacity: "40%"
                    }}/>
                    <CircularProgress/>
                </div>
                }
            </div>
        );
    }
;

export default App;
