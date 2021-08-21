import React, {memo, useState} from 'react';
import Save from "../commons/Save";

export const useSave = () => {
    const [visible, setVisible] = useState(false);
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    const RenderSave = memo((args) => <Save show={visible} onDone={hide} {...args}/>)
    return {
        show,
        RenderSave
    };
}
