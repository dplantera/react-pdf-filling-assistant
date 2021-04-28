import React, {createContext, useCallback, useEffect} from 'react';
import {useFieldLists} from "./contextWithState/FieldListsContext";
import {useFormVariables} from "./contextWithState/VariableContext";
import {useFormFields} from "./contextWithState/FormFieldsContext";
import {formReducer} from "./reducer/DomainReducer";
import {actions, initializeFormVariables, initializePdf, initializePdfFormFields, noop} from "./actions";
import {Field, FieldList, FormVariable, Pdf} from "../../model/types";
import {usePdf} from "./contextWithState/PdfContext";

const FormActionProvider = ({children, pdfClient}) => {
    const [fieldLists, dispatchFieldLists] = useFieldLists();
    const [fields, dispatchFields] = useFormFields();
    const [variables, dispatchVars] = useFormVariables();
    const [pdfs, dispatchPdfs] = usePdf();

    const combinedReducer = useCallback((state, action) => {
        return formReducer(state, action, {
            fieldLists,
            fields,
            variables,
            dispatchVars,
            dispatchFields,
            dispatchFieldLists
        })
    }, [dispatchVars, dispatchFields, dispatchFieldLists, fieldLists, fields, variables])

    const [callback, dispatch] = React.useReducer(combinedReducer, noop)

    const updatePdfs = useCallback((pdf) => {
        dispatchPdfs(actions(Pdf).updateAll(pdf));
    }, [dispatchPdfs]);
    const updateFieldLists = useCallback((fieldLists) => dispatchFieldLists(actions(FieldList).updateAll(fieldLists)), [dispatchFieldLists]);
    const updateFieldList = useCallback((fieldList) => dispatchFieldLists(actions(FieldList).updateOne(fieldList)), [dispatchFieldLists]);
    const addFields = useCallback((fields) => dispatchFields(actions(Field).addAll(fields)), [dispatchFields]);
    const updateFields = useCallback((fields) => dispatchFields(actions(Field).updateAll(fields)), [dispatchFields]);
    const updateField = useCallback((field) => dispatchFields(actions(Field).updateOne(field)), [dispatchFields]);
    const addVariables = useCallback((variables) => dispatchVars(actions(FormVariable).addAll(variables)), [dispatchVars]);
    const addVariable = useCallback((variable) => dispatchVars(actions(FormVariable).addOne(variable)), [dispatchVars]);
    const updateVariables = useCallback((variables) => dispatchVars(actions(FormVariable).updateAll(variables)), [dispatchVars]);
    const addVariableToField = useCallback((variable, field) => {
        dispatch(actions(Field).addVariableToField({variable, field}));
        // todo: doesnt work - callback is updated in next render
        // dispatchFields(actions.updateAll(callback));
    }, [dispatch]);

    /*
    *   Sync Effects
    */
    // execute callbacks from domainReducer
    useEffect(callback, [callback])

    /*
    * Init Effects
    */
    useEffect(() => {
        const props = {pdfClient, updateFieldLists, updateFields};
        initializePdfFormFields(props);
    }, [pdfClient, updateFieldLists, updateFields])

    useEffect(() => {
        initializeFormVariables(updateVariables);
    }, [updateVariables]);

    useEffect(() => {
        initializePdf(updatePdfs);
    }, [updatePdfs]);


    console.log("rendering actions...")
    return (
        <FormActionsContext.Provider value={ {
            state: {fieldLists, fields, variables, pdfs},
            updateFieldLists,
            updateFieldList,
            addFields,
            updateFields,
            updateField,
            addVariables,
            updateVariables,
            addVariable,
            addVariableToField,
            updatePdfs,
            dispatch
        }}>
            {children}
        </FormActionsContext.Provider>
    );
}

const FormActionsContext = createContext();

function useFormActions() {
    // returns values from provider - so evererything in value
    const context = React.useContext(FormActionsContext)
    if (context === undefined) {
        throw new Error('useForm must be used within a FormFieldProvider')
    }
    return context
}

export {FormActionProvider, useFormActions}