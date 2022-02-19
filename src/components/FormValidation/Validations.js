import React, {useEffect, useState} from 'react';
import {Divider, List, ListItem, ListItemIcon, ListItemText, Typography} from "@mui/material";
import {useStore} from "../../store";
import {FieldTypes} from "../../model/types";
import {Result} from "../../utils/Result";
import {PERMISSIONS_KNOWN} from "../../model/pdf-backend/PdfJsClient";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';

const Severity = {
    WARN: "WARN",
    ERROR: "ERROR",
    INFO: "INFO",
}

const Validation = ({name, description, condition, severity = Severity.ERROR, type}) => {
    const _validationProps = {name, description, severity, type};
    const _validation = {..._validationProps};
    _validation.apply = (fields) => condition?.(fields)
        ? Result.Ok({..._validationProps})
        : Result.Fail({..._validationProps});
    return _validation;
}

const FieldsValidation = (props) => Validation({...props, type: "FIELDS_VALIDATION"})
const DocumentValidation = (props) => Validation({...props, type: "DOCUMENT_VALIDATION"})

const toValidate = ({validation, pdfMeta}) => {
    const fieldsValidation = validation?.fields;
    const permissions = pdfMeta.permissions ?? {};
    const neededPermissions = [PERMISSIONS_KNOWN.ASSEMBLE, PERMISSIONS_KNOWN.MODIFY_CONTENTS, PERMISSIONS_KNOWN.MODIFY_ANNOTATIONS];
    return [
        FieldsValidation({
            severity: Severity.WARN,
            name: "HAS_FIELDS",
            description: "Forms can only be filled if form fields are present.",
            condition: (fields) => fields.length > 0,
        }),
        FieldsValidation({
            severity: Severity.WARN,
            name: "HAS_RADIOS_WITH_KNOWN_EXPORT",
            description: `The export value of a RadioBtn should comprise either: ${fieldsValidation?.radio?.validExportValues?.join(", ")}`,
            condition: (fields) => {
                const validExportValues = fieldsValidation?.radio?.validExportValues;
                const isRadio = (field) => field.type.name === FieldTypes.RADIO.name;
                const isRadioGroup = (radio) => !radio.groupInfo.parent;
                const radioGroups = fields.filter(isRadio).filter(isRadioGroup);

                const toExportValue = (parent, child) => child.replaceAll(`${parent}-`, "")
                const haveValidExportValues = (parent, children) => children.every(c => {
                    const exportValue = toExportValue(parent, c);
                    return validExportValues?.includes(exportValue.toLowerCase())
                })
                return radioGroups.every(radio => haveValidExportValues(radio.name, radio.groupInfo.children));
            },
        }),
        FieldsValidation({
            severity: Severity.WARN,
            name: "HAS_CHECKBOXES_WITH_KNOWN_EXPORT",
            description: `The export value of a CheckBox should comprise either: ${fieldsValidation?.checkbox?.validExportValues?.join(", ")}`,
            condition: (fields) => {
                const validExportValues = fieldsValidation?.checkbox?.validExportValues;
                const isCheckbox = (field) => field.type.name === FieldTypes.CHECK.name;
                const checkboxes = fields.filter(isCheckbox);
                const hasValidExportValues = (cb) => validExportValues?.includes(cb.toLowerCase());
                return checkboxes.every(cb => hasValidExportValues(cb.refPdf.exportValue));
            },
        }),
        DocumentValidation({
            severity: Severity.WARN,
            name: "HAS_ALL_PERMISSIONS",
            description: `All permissions on the document are needed to avoid errors.`,
            condition: () => !permissions.hasRestrictions,
        }),
        DocumentValidation({
            severity: Severity.ERROR,
            name: "HAS_NECESSARY_PERMISSIONS",
            description: `Document permission needed: [ ${neededPermissions.join(", ")} ]`,
            condition: () => {
                return !permissions.hasRestrictions || neededPermissions.every(per => permissions.permissions.includes(per))
            },
        }),
        DocumentValidation({
            severity: Severity.WARN,
            name: "HAS_NO_MACROS",
            description: `Document should be free from any macros or functionality to avoid display issues.`,
            condition: () => {
                return !pdfMeta.hasJSActions
            },
        }),
        DocumentValidation({
            severity: Severity.WARN,
            name: "NO_XFA_FORMAT",
            description: `Document comprises XFA format which may be incompatible with PDF automation software.`,
            condition: () => {
                return !pdfMeta.isPureXfa && !pdfMeta.isXFAPresent
            },
        }),

        DocumentValidation({
            severity: Severity.WARN,
            name: "NO_LARGE_DOCUMENTS",
            description: `Document should be of reasonable filesize.`,
            condition: () => {
                const size = pdfMeta.fileSize;
                if (!size)
                    return true;

                switch (size.unit) {
                    //'B', 'kB', 'MB', 'GB', 'TB'
                    case 'B':
                        return true;
                    case 'kB':
                        return size.value < 3000
                    case 'MB':
                        return size.value < 3
                    case 'GB':
                    case 'TB':
                        return false;
                    default:
                        return true;
                }
            },
        }),
    ]

}

const getIcon = (severity) => {
    switch (severity) {
        case Severity.ERROR:
            return () => <CancelIcon sx={{color: "red"}}/>;
        case Severity.WARN:
            return () => <WarningIcon sx={{color: "orange"}}/>;
        case Severity.INFO:
            return () => <HelpIcon sx={{color: "blue"}}/>
        default:
            return () => <CheckCircleIcon sx={{color: "green"}}/>;
    }
}

const Validations = ({pdfClient}) => {
    const fields = useStore(state => state.fields);
    const [validated, setValidated] = useState([])
    const settingsStore = useStore((state) => state.settings);

    useEffect(() => {
        const settings = settingsStore?.getSettings?.();
        setValidated(toValidate({
            pdfMeta: pdfClient.pdfMeta ?? {},
            validation: settings?.validation ?? {},
        }).map(validation => validation.apply(fields)))
    }, [settingsStore, fields, setValidated, pdfClient.pdfMeta])

    return (
        <List sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
            maxHeight: "88vh",
        }}>
            {validated.map((result, i) => {
                const value = result.getOrElse(result.error);
                const Icon = result.isSuccess() ? getIcon() : getIcon(value.severity);
                return (
                    <>
                        <ListItem key={i} dense>
                            <ListItemIcon>
                                <Icon/>
                            </ListItemIcon>
                            <ListItemText primary={result.isSuccess() ? `${value.name}` : `${value.description}`}
                            />
                            <Typography variant={"body1"}>
                            </Typography>
                        </ListItem>
                        <Divider/>
                    </>
                )
            })}

        </List>
    );
};

export default Validations;