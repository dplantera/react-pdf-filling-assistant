import React, {useEffect, useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "./PdfViewer/PdfViewer";
import Spinner from "../commons/Spinner";
import {AddVariableProvider} from "../hooks/contextWithState/AddVariableContext";
import {initializeFormVariables, initializePdf, initializePdfFormFields} from "../hooks/actions";
import {useStore} from "../../store";


const pdfClient = new PdfJsClient();

const storeSelector = (state) => ({
    updatePdfs:state.updatePdfs,
    updateFields: state.updateFields,
    updateFieldLists: state.updateFieldLists,
    updateVariables: state.updateVariables
})

const FormFillingMain = () => {
    const [isPdfReady, setIsPdfReady] = useState(false);
    const {updatePdfs, updateFields , updateFieldLists, updateVariables} = useStore(storeSelector)

    useEffect(() => {
        initializePdfFormFields({pdfClient, updateFieldLists, updateFields});
    }, [updateFieldLists, updateFields])

    useEffect(() => {
        initializeFormVariables(updateVariables);
    }, [updateVariables]);

    useEffect(() => {
        initializePdf(updatePdfs);
    }, [updatePdfs]);

    return (
        <div className="form-filling-main" style={{position: "relative", display: "flex", justifyContent: "center"}}>
            <div className={"form-filling-container"}
                 style={{position: "relative", display: "flex", width: "98%", height: "98%", top: "10px"}}>
                <AddVariableProvider>
                    <FormFieldList pdfClient={pdfClient}/>
                </AddVariableProvider>
                <PdfViewer
                    setIsPdfReady={setIsPdfReady}
                    pdfClient={pdfClient}
                />
            </div>
            {!isPdfReady && <Spinner/>}
        </div>
    );
};

export default FormFillingMain;
