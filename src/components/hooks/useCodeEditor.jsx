import React, {useRef, useState} from 'react';
import {CodeEditor} from "../commons/CodeEditor/CodeEditor";


export const useCodeEditor = ({defaultLanguage}) => {
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = useState("")
    const refHandleSave = useRef(() => {
    });

    const show = (_code, onSave) => {
        setCode(_code);
        refHandleSave.current = onSave;
        setOpen(true);
    };
    const hide = () => setOpen(false);

    const handleSave = (_code) => {
        refHandleSave.current?.(_code);
    }

    const handleSubmit = (_code) => {
        handleSave(_code);
        hide();
    }

    const RenderCodeEditor = ({language, header, ...rest}) => {
        return <CodeEditor
            open={open}
            codeString={code}
            codeLanguage={language ?? defaultLanguage}
            onSave={handleSave}
            onSubmit={handleSubmit}
            onClose={hide}
            header={<h1>Code Editor</h1>}
            {...rest}/>
    }

    return {
        show,
        hide,
        RenderCodeEditor
    };
};

