import {useEffect} from 'react';
import {FieldList, FormVariable} from "../../../model/types";
import {useFormVariables} from "../../hooks/VariableContext";
import {useFieldLists} from "../../hooks/FieldListsContext";
import {useFormFields} from "../../hooks/FormFieldsContext";

//todo: move to context or something
const Initialize = ({pdfClient}) => {
    const [, dispatchLists] = useFieldLists();
    const [, dispatchVars] = useFormVariables();
    const [, dispatchFields] = useFormFields();

    useEffect(() => {
        pdfClient.onReload = async () => {
            console.log("pdf initialised...");
            const fields = await pdfClient.getFormFields();
            const fieldList = FieldList(pdfClient.getPdfName(), fields);
            fieldList.isSelected = true;
            dispatchLists({type: "UPDATE_ALL", payload: [fieldList]});
            dispatchFields({type: "UPDATE_ALL", payload: fields});
            pdfClient.isReady = true;
        }
    }, [pdfClient, dispatchLists, dispatchFields])


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

                dispatchVars({type: "UPDATE_ALL", payload: variablesFromDB});
            })
    }, [dispatchVars])


    return null;
};

export default Initialize;
