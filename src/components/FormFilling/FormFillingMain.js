import React, {useEffect, useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import FormFieldList from "./FormFieldList/FormFieldList";
import PdfViewer from "./PdfViewer/PdfViewer";
import {FormVariable} from "../../model/types";
import Spinner from "../commons/Spinner";

const pdfClient = new PdfJsClient();

const FormFillingMain = () => {
    const [isPdfReady, setIsPdfReady] = useState(false);
    const [fields, setFields] = useState([]);
    const [fieldLists, setFieldLists] = useState([]);
    const [formVariables, setFormVariables] = useState([]);

    useEffect(() => {
        fetch("/variables.json")
            .then(res => res.json())
            .then((data) => {
                const variablesFromDB = Object.keys(data).reduce((acc, key) => {
                    const entityType = data[key].type;
                    const attributes = data[key].attributes;

                    const vars = Object.keys(attributes)
                        .map(key => {
                            return FormVariable(
                                entityType.name + " " + key,
                                entityType.accessKey + "." + attributes[key].name,
                                attributes[key].description,
                                attributes[key].exampleValue
                            )
                        })
                    return [...acc, ...vars];
                }, []);

                setFormVariables(variablesFromDB);
            })
    }, [setFormVariables])

    const highlightFormField = (e, field) => {
        pdfClient.selectField(field)
    }

    const resetHighlightFormField = (e, field) => {
        pdfClient.unselectField(field)
    }

    return (
        <div className="form-filling-main" style={{position: "relative", display: "flex", justifyContent: "center"}}>
            <div className={"form-filling-container"}
                 style={{position: "relative", display: "flex", width: "98%", height: "98%", top: "10px"}}>

                <FormFieldList highlightFormField={highlightFormField}
                               resetHighlightFormField={resetHighlightFormField}
                               fieldLists={fieldLists}
                               fields={fields}
                               setFields={setFields}
                               formVariables={formVariables}
                               setFormVariables={setFormVariables}
                />
                <PdfViewer
                    setIsPdfReady={setIsPdfReady}
                    pdfClient={pdfClient}
                    setFields={setFields}
                    setFieldLists={setFieldLists}
                />
            </div>
            {!isPdfReady && <Spinner/>}
        </div>
    );
};

export default FormFillingMain;
