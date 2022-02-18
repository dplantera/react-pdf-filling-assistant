import React from 'react';
import Button from "@mui/material/Button";

const FormItemsControls = ({widthFormField, setWidthFormField, simple, setSimple}) => {

    const StyledButton = ({children, ...props}) => {
        return <Button variant={"contained"} sx={{
            backgroundColor: "#d5d5d5",
            color: "black",
            ":hover": {
                backgroundColor: "rgba(63,81,181,0.47)"
            }
        }} size={"small"} style={{height: "100%"}} {...props}> {children} </Button>
    }

    return (
        <div className={"field-items-controls"}>
            <StyledButton onClick={(e) => {
                widthFormField <= 50 ? setWidthFormField(100) : setWidthFormField(50)
            }}>{widthFormField >= 100 ? "Show" : "Hide"} Description</StyledButton>
            <StyledButton onClick={() => setSimple(!simple)}>Show {simple ? "Expert" : "Simple"}</StyledButton>
        </div>
    );
};

export default FormItemsControls;
