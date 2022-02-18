import React, {useEffect, useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "../commons/PdfViewer/PdfViewer";
import {AddVariableProvider} from "../hooks/AddVariableContext";
import "./FormFillingMain.css"
import useSpinner from "../hooks/useSpinner";


const FormFillingMain = () => {
    const [pdfClient] = useState(new PdfJsClient())
    const [isPdfReady, setIsPdfReady] = useState(false);
    const {Spinner, show, hide} = useSpinner();

    useEffect(() => {
        if(!isPdfReady) show()
        else hide()
    }, [isPdfReady, show, hide])
    return (
        <div className="form-filling-main">
            <div className={"form-filling-container"}>
                <AddVariableProvider>
                    <FormFieldList pdfClient={pdfClient}/>
                </AddVariableProvider>
                <PdfViewer
                    setIsPdfReady={setIsPdfReady}
                    pdfClient={pdfClient}
                />
            </div>
            <Spinner/>
        </div>
    );
};

export default FormFillingMain;
