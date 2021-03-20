import React from 'react';
import {CircularProgress} from "@material-ui/core";

const Spinner = () => {
    return (
        <div style={{
            position: "absolute", display: "flex", width: "100vw", height: "100vh", alignItems: "center",
            justifyContent: "center",
        }}>
            <div className={"spinner-background"} style={{
                position: "absolute", width: "100vw", height: "100vh", backgroundColor: "gray", opacity: "40%"
            }}/>
            <CircularProgress/>
        </div>
    );
};

export default Spinner;
