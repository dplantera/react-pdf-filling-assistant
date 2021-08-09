import React from 'react';
import {Button} from "@material-ui/core";

const FormItemsControls = ({widthFormField, setWidthFormField}) => {
    return (
        <div className={"field-items-controls"} >
            <Button variant={"contained"} size={"small"} style={{height: "100%"}} onClick={(e) => {
                if (widthFormField <= 50)
                    setWidthFormField(100)
                else setWidthFormField(50)
            }}>Toggle Description</Button>
        </div>
    );
};

export default FormItemsControls;
