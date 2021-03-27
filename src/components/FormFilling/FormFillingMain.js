import React, {useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "./PdfViewer/PdfViewer";
import Spinner from "../commons/Spinner";
import {FormDataProvider} from "../hooks/FormContext";
import {FormActionProvider} from "../hooks/FormActionContext";
import Initialize from "./FormFieldList/Initialize";
import {AddVariableProvider} from "../hooks/AddVariableContext";

const pdfClient = new PdfJsClient();

const FormFillingMain = () => {
    const [isPdfReady, setIsPdfReady] = useState(false);

    return (
        <div className="form-filling-main" style={{position: "relative", display: "flex", justifyContent: "center"}}>
            <div className={"form-filling-container"}
                 style={{position: "relative", display: "flex", width: "98%", height: "98%", top: "10px"}}>
                <FormDataProvider>
                    <FormActionProvider>
                        <Initialize pdfClient={pdfClient}
                        />
                        <AddVariableProvider>
                            <FormFieldList pdfClient={pdfClient}/>
                        </AddVariableProvider>
                        <PdfViewer
                            setIsPdfReady={setIsPdfReady}
                            pdfClient={pdfClient}
                        />
                    </FormActionProvider>
                </FormDataProvider>
            </div>
            {!isPdfReady && <Spinner/>}
        </div>
    );
};

export default FormFillingMain;
