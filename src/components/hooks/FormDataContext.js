import React, {createContext} from 'react';
import {FieldListsProvider} from "./contextWithState/FieldListsContext";
import {FormVariableProvider} from "./contextWithState/VariableContext";
import {FormFieldsProvider} from "./contextWithState/FormFieldsContext";
import {PdfProvider} from "./contextWithState/PdfContext";

const FormDataProvider = ({children}) => {
    return (
        <FormDataContext.Provider value={{}}>
            <PdfProvider>
                <FieldListsProvider>
                    <FormVariableProvider>
                        <FormFieldsProvider>
                            {children}
                        </FormFieldsProvider>
                    </FormVariableProvider>
                </FieldListsProvider>
            </PdfProvider>
        </FormDataContext.Provider>
    );
}

const FormDataContext = createContext();
export {FormDataProvider}