import React, {useEffect, useRef, useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "./PdfViewer/PdfViewer";
import Spinner from "../commons/Spinner";
import {AddVariableProvider} from "../hooks/contextWithState/AddVariableContext";
import {initializePdfFormFields} from "../hooks/startupActions";
import {useStore} from "../../store";


const pdfClient = new PdfJsClient();

const FormFillingMain = () => {
    const refSwitchFieldList = useRef(useStore.getState().switchFieldList)
    const refUpdateFields = useRef(useStore.getState().updateFields)

    const [isPdfReady, setIsPdfReady] = useState(false);

    useEffect(() =>
        useStore.subscribe(
            switchFieldList => (refSwitchFieldList.current = switchFieldList) ,
            state => state.switchFieldList
        ), [])

    useEffect(() =>
        useStore.subscribe(
            updateFieldLists => (refUpdateFields.current = updateFieldLists) ,
            state => state.updateFields
        ), [])

    useEffect(() => {
        initializePdfFormFields({
            pdfClient,
            switchFieldList: refSwitchFieldList.current,
            updateFields: refUpdateFields.current});
    }, [])


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