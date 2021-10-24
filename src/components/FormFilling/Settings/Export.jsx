import React, {useEffect} from 'react';
import {useCodeEditor} from "../../hooks/useCodeEditor";
import {useStore} from "../../../store";

const Export = () => {
    const {show, hide, RenderCodeEditor} = useCodeEditor({defaultLanguage: "javascript"});
    const {} = useStore(state => state.settings)
    useEffect(() => show(), [show])

    return (
        <RenderCodeEditor>

        </RenderCodeEditor>
    );
};

export default Export;
