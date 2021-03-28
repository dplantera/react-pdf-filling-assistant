import React, {createContext} from 'react';
import {FieldListsProvider} from "./contextWithState/FieldListsContext";
import {FormVariableProvider} from "./contextWithState/VariableContext";
import {FormFieldsProvider} from "./contextWithState/FormFieldsContext";

const FormDataProvider = ({children}) => {
    return (
        <FormDataContext.Provider value={{}}>
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