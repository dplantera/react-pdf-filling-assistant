import React from 'react';
import {Button} from "@material-ui/core";

const FormItemsControls = ({widthFormField, setWidthFormField}) => {
    return (
        <div className={"field-items-controls"} style={{
            position: "relative",
            display: "flex",
            width: "98%",
            maxHeight: "10%",
            gap: "10px",
            flexDirection: "column",
        }}>
            <Button variant={"contained"} size={"small"} style={{height: "100%"}} onClick={(e) => {
                if (widthFormField <= 50)
                    setWidthFormField(100)
                else setWidthFormField(50)
            }}>Beschreibung umschalten</Button>
        </div>
    );
};

export default FormItemsControls;