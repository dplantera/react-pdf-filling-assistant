//based on https://codesandbox.io/s/resizable-drawer-34ife?from-embed=&file=/src/CustomDrawer.js

import React, {useCallback, useEffect, useRef} from "react";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles(theme => ({
    drawer: {
        flexShrink: 0
    },
    dragger: {
        width: "3px",
        cursor: "ew-resize",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: "#f4f7f9"
    }
}));

const ResizeableCard = ({children, minWidth = 10, maxWidth = 100, defaultWidth=50, overflow = "hide", width}) => {
    const classes = useStyles();
    const [drawerWidth, setDrawerWidth] = React.useState(defaultWidth);
    const cardRef = useRef(null)

    const handleMouseDown = e => {
        document.addEventListener("mouseup", handleMouseUp, true);
        document.addEventListener("mousemove", handleMouseMove, true);
    };

    const handleMouseUp = () => {
        document.removeEventListener("mouseup", handleMouseUp, true);
        document.removeEventListener("mousemove", handleMouseMove, true);
    };

    const handleMouseMove = useCallback((e) => {
        const parentWidth = cardRef.current.offsetParent.clientWidth;
        const parentOffsetLeft= cardRef.current.offsetParent.offsetLeft || 0;
        if(!parentWidth)
            return
        const newWidth = 100 * ((e.clientX - parentOffsetLeft) / parentWidth);
        if (newWidth > minWidth && newWidth < maxWidth) {
            setDrawerWidth(newWidth);
        }
    }, [minWidth, maxWidth]);

    useEffect(() => {
        setDrawerWidth(width)
    }, [width])

    return (
        <div ref={cardRef} variant="outlined" style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: `${drawerWidth}%`,
            height: "98%",
            gap: "10px",
            overflow: overflow
        }}
              className={classes.drawer}
        >
            {children}
            <div onMouseDown={handleMouseDown} className={classes.dragger} />
        </div>
    );
}

export default ResizeableCard;
