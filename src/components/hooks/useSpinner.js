import React, {memo, useCallback, useState} from 'react';
import {Backdrop, CircularProgress} from "@material-ui/core";


const useSpinner = () => {
    const [open, setOpen] = useState(false);

    const show = useCallback(() => {
        setOpen(true);
    }, [])
    const hide = useCallback(() => {
        setOpen(false)
    }, [])

    const Spinner = memo(({props}) => <Backdrop
        open={open}
        onClick={hide}
        style={{
            position: "absolute",
            zIndex: 1201,
            height: "100%",
            width: "100%"
        }}

        {...props}
    >
        <CircularProgress color="inherit"/>
    </Backdrop>);


    return {
        show,
        hide,
        Spinner
    };
};

export default useSpinner;
