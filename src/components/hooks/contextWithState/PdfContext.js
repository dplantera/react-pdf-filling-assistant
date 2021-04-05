import React, {createContext} from 'react';
import {basicReducer} from "../reducer/BasicReducer";

const PdfProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(basicReducer, [{}])

    return (
        <PdfContext.Provider value={[state, dispatch]}>
            {children}
        </PdfContext.Provider>
    );
}

const PdfContext = createContext();

function usePdf() {
    // returns values from provider - so evererything in value
    const context = React.useContext(PdfContext)

    if (context === undefined) {
        throw new Error('usePdf must be used within a usePdf')
    }

    return context

}

export {PdfProvider, usePdf}