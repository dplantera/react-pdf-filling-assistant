import React, {createContext, useState} from 'react';
import {FieldListsProvider} from "./FieldListsContext";
import {FormVariableProvider} from "./VariableContext";
import {FormFieldsProvider} from "./FormFieldsContext";

const FormDataProvider = ({children}) => {
    const [pdfClient, setPdfClient] = useState({})

    return (
        <FormDataContext.Provider value={[pdfClient, setPdfClient]}>
            <FieldListsProvider>
                <FormVariableProvider>
                    <FormFieldsProvider>
                        {children}
                    </FormFieldsProvider>
                </FormVariableProvider>
            </FieldListsProvider>
        </FormDataContext.Provider>

    );
}

const FormDataContext = createContext();
export {FormDataProvider}