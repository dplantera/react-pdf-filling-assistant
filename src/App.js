import React, {useState} from 'react';
import './App.css';
import {AppBar, CircularProgress, Toolbar, Typography} from "@material-ui/core";
import UploadPdf from "./components/UploadPdf";
import PdfViewer from "./components/PdfViewer";
import FormFieldList from "./components/FormFieldList";
import PdfJsClient from "./pdf-backend/PdfJsClient";

const pdfClient = new PdfJsClient();

const App = () => {
        const [isPdfReady, setIsPdfReady] = useState(false);
        const [fields, setFields] = useState([]);
        const [fieldLists, setFieldLists] = useState([]);

        const highlightFormField = (e, field) => {
            pdfClient.selectField(field.name)
        }

        const resetHighlightFormField = (e, field) => {
            pdfClient.unselectField(field.name)
        }

        const renderSpinner = () => {
            return <div style={{
                position: "absolute", display: "flex", width: "100vw", height: "100vh", alignItems: "center",
                justifyContent: "center",
            }}>
                <div className={"spinner-background"} style={{
                    position: "absolute", width: "100vw", height: "100vh", backgroundColor: "gray", opacity: "40%"
                }}/>
                <CircularProgress/>
            </div>;
        }

        return (
            <div className="App">
                <AppBar position="static">
                    <Toolbar style={{display: "flex", justifyContent: "space-between"}}>
                        <Typography variant="h5">PDF Filling Assistant</Typography>
                        <UploadPdf loadPdf={pdfClient.loadPdf.bind(pdfClient)} setIsPdfReady={setIsPdfReady}/>
                    </Toolbar>
                </AppBar>
                <div className={"flex-container"}
                     style={{position: "relative", display: "flex", width: "100%", height: "94%"}}>

                    <FormFieldList highlightFormField={highlightFormField}
                                   resetHighlightFormField={resetHighlightFormField}
                                   fieldLists={fieldLists}
                                   fields={fields}
                    />
                    <PdfViewer
                        setIsPdfReady={setIsPdfReady}
                        pdfClient={pdfClient}
                        setFields={setFields}
                        setFieldLists={setFieldLists}
                    />
                </div>
                {!isPdfReady && renderSpinner()}
            </div>
        );
    }
;

export default App;
