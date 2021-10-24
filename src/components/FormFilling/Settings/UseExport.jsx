import React from 'react';
import {useCodeEditor} from "../../hooks/useCodeEditor";
import {useStore} from "../../../store";

export const useExport = () => {
    const [settings, saveSettings] = useStore(state => [state.settings, state.saveSettings])
    const {show: showEditor, RenderCodeEditor} = useCodeEditor({defaultLanguage: "javascript"});

    const handleSave = async (code) => {
        await saveSettings(code)
    }

    const show = () => showEditor(
        settings.getJson(true),
        handleSave
    )

    return {
        show,
        RenderExport: RenderCodeEditor
    };
};