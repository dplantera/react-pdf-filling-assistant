import React, {useCallback, useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "./PdfViewer/PdfViewer";
import Spinner from "../commons/Spinner";
import {FormFieldsProvider} from "../hooks/FormContext";
import {FormVariableProvider} from "../hooks/VariableContext";
import {FieldListsProvider} from "../hooks/FieldListsContext";

const pdfClient = new PdfJsClient();

const FormFillingMain = () => {
    const [isPdfReady, setIsPdfReady] = useState(false);


    const highlightFormField = useCallback((e, field) => {
        pdfClient.selectField(field)
    }, [])

    const resetHighlightFormField = useCallback((e, field) => {
        pdfClient.unselectField(field)
    }, [])

    return (
        <div className="form-filling-main" style={{position: "relative", display: "flex", justifyContent: "center"}}>
            <div className={"form-filling-container"}
                 style={{position: "relative", display: "flex", width: "98%", height: "98%", top: "10px"}}>
                <FieldListsProvider>
                    <FormFieldsProvider>
                        <FormVariableProvider>
                            <FormFieldList highlightFormField={highlightFormField}
                                           resetHighlightFormField={resetHighlightFormField}
                            />
                        </FormVariableProvider>
                        <PdfViewer
                            setIsPdfReady={setIsPdfReady}
                            pdfClient={pdfClient}
                        />
                    </FormFieldsProvider>
                </FieldListsProvider>
            </div>
            {!isPdfReady && <Spinner/>}
        </div>
    );
};

export default FormFillingMain;
