import React, {createContext} from 'react';
import {PdfReducer} from "../reducer/DomainReducer";

const reducer = new PdfReducer().reducer
const PdfProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(reducer, [])

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