import {useEffect} from 'react';
import {FieldList, FormVariable} from "../../../model/types";
import {useFormVariables} from "../../hooks/contextWithState/VariableContext";
import {useFieldLists} from "../../hooks/contextWithState/FieldListsContext";
import {useFormFields} from "../../hooks/contextWithState/FormFieldsContext";

//todo: move to context or something
const Initialize = ({pdfClient}) => {
    const [, dispatchLists] = useFieldLists();
    const [, dispatchVars] = useFormVariables();
    const [, dispatchFields] = useFormFields();




    return null;
};

export default Initialize;
