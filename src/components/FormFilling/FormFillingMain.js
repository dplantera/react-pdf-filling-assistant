import React, {useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "./PdfViewer/PdfViewer";
import Spinner from "../commons/Spinner";
import {AddVariableProvider} from "../hooks/AddVariableContext";
import "./FormFillingMain.css"


const FormFillingMain = () => {
    const [pdfClient] = useState(new PdfJsClient())
    const [isPdfReady, setIsPdfReady] = useState(false);

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
            {(!isPdfReady) && <Spinner/>}
        </div>
    );
};

export default FormFillingMain;
