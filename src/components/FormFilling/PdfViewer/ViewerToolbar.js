import React, {useState} from "react";
import ZoomInTwoToneIcon from '@mui/icons-material/ZoomInTwoTone';
import ZoomOutTwoToneIcon from '@mui/icons-material/ZoomOutTwoTone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {Box, IconButton, MenuItem, Select, TextField, Typography} from "@material-ui/core";
//https://react-pdf-viewer.dev/

const zoomOptions = [50,75,100,125,150,200]
const adjustZoomToOption = (zoom, isGoingUp = true) => {
    if(zoom <= zoomOptions[0]) return zoomOptions[0];
    if(zoom >= zoomOptions[zoomOptions.length - 1]) return zoomOptions[zoomOptions.length - 1];
    // scan right to left
    for(let i = zoomOptions.length; i > 1 ; i--) {
        let upper = zoomOptions[i - 1];
        let lower = zoomOptions[i - 2];

        if(zoom === upper)
            return upper;
        if(zoom === lower)
            return lower;

        // 150  175   200
       if(zoom < upper && zoom > lower)
           return isGoingUp? upper : lower;
    }
    return 100;
}

export const ViewerToolbar = ({page = 0, numPages = 0, onChangedNumPage, scale, onZoomed}) => {
    const [zoom, setZoom] = useState(scale * 100);
    const [pageNum, setPageNum] = useState(page)

    const ZOOM_STEP = 25;
    const renderZoomMenu = () => {

        return  <Select
            value={zoom}
            autoWidth={true}
            onChange={(e) => handleZoomed(e.target.value)}
        >
            <MenuItem value={"fit"}>{`Actual fit`}</MenuItem>
            <MenuItem value={"fit-page"}>{`Page fit`}</MenuItem>
            <MenuItem value={"fit-width"}>{`Page width`}</MenuItem>
            {zoomOptions.map((option , idx)=><MenuItem key={idx} value={option}>{`${option} %`}</MenuItem>
            )}
        </Select>
    }

    const Btn = ({BtnIcon, label, onClick}) => {return <IconButton aria-label={label} size={"small"} onClick={onClick}> <BtnIcon fontSize="small"/> </IconButton>};

    const handlePageNumberChanged = (newPage) => {
        if(newPage <= 0 && numPages > 0)
            newPage = 1;
        if(newPage > numPages)
            newPage = numPages;
        setPageNum(newPage);
        onChangedNumPage(newPage);
    }

    const handleZoomed = (_zoom) => {
        if(typeof _zoom === "string") {
            console.debug("not yet implemented");
            return;
        }

        const adjustedZoom = adjustZoomToOption(_zoom, _zoom > zoom);
        setZoom(adjustedZoom);
        const _scale = parseFloat((adjustedZoom / 100).toFixed(2));
        console.log({adjustedZoom, _zoom, _scale})
        onZoomed(_scale);
    }

    return <div className={"viewer-toolbar"}>
        <div className={"controls-left"}>
            <Box sx={{ width: 25, display:"inline-block"}}/>
            <Btn BtnIcon={KeyboardArrowUpIcon} label={"Previous Page"} onClick={() => handlePageNumberChanged(page + 1)}/>
            <TextField
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                hiddenLabel
                value={pageNum}
                onChange={(e) => handlePageNumberChanged(parseInt(e.target.value))}
                variant="filled"
                size="small"
                style={{maxWidth:"50px", display:"inline-block"}}
            />
            <Typography display={"inline"} variant="h6"  >  / {numPages}</Typography>
            <Btn BtnIcon={KeyboardArrowDownIcon} label={"Next Page"} onClick={() => handlePageNumberChanged(page - 1 )}/>
        </div>

        <div className={"controls-center"}>
            <Btn BtnIcon={ZoomInTwoToneIcon} label={"Zoom In"} onClick={() => handleZoomed(zoom + ZOOM_STEP)}/>
            {renderZoomMenu()}
            <Btn BtnIcon={ZoomOutTwoToneIcon} label={"Zoom Out"} onClick={() =>  handleZoomed(zoom - ZOOM_STEP)}/>
        </div>
        <div className={"controls-right"}></div>

    </div>;
}