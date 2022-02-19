import React, {useEffect, useState} from 'react';
import PdfJsClient from "../../model/pdf-backend/PdfJsClient";
import PdfViewer from "../commons/PdfViewer/PdfViewer";
import useSpinner from "../hooks/useSpinner";

import {Box, Grid} from "@mui/material";
import Validations from "./Validations";
import ValidationsControls from "./ValidationsControls";

const FormValidationMain = () => {
    const [pdfClient] = useState(new PdfJsClient())
    const [isPdfReady, setIsPdfReady] = useState(false);
    const {Spinner, show, hide} = useSpinner();

    useEffect(() => {
        if (!isPdfReady) show()
        else hide()
    }, [isPdfReady, show, hide])
    return (
        <Grid container
              direction={"row"}
              rowGap={1.5}
              position={"relative"}
              justifyContent={"start"}
              alignItems={"start"}>
            <Box item width={"100%"}/>
            <Box maxWidth={"40%"}>
                <ValidationsControls/>
                <Validations pdfClient={pdfClient}/>
            </Box>
            <Box maxWidth={"60%"}>
                <PdfViewer
                    setIsPdfReady={setIsPdfReady}
                    pdfClient={pdfClient}
                    withFieldHighlighting={false}
                />
            </Box>
            <Spinner/>
        </Grid>
    );
};

export default FormValidationMain;
