import React, {useState} from 'react';
import {List, Divider, ListItem, ListItemIcon, ListItemText, Drawer, Box, IconButton} from "@mui/material";
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import {clearLocalStorage} from "../../actions/cleanupActions";

const Settings = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = (_open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setOpen(_open);
    };

    const handleSelection = (action) => {
        action?.();
        toggleDrawer(false);
    }
    const list = () => (
        <Box
            sx={{width: 250}}
            role="presentation"
            onClick={() => handleSelection(clearLocalStorage)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem button>
                    <ListItemIcon>
                        <StorageIcon/>
                    </ListItemIcon>
                    <ListItemText primary={"Clear Storage"}/>
                </ListItem>
            </List>
            <Divider/>
        </Box>
    );

    return (
        <React.Fragment>
            <IconButton onClick={toggleDrawer(true)} style={{textDecoration: 'none', color: "white"}}
                        aria-label={"Settings"}>
                <SettingsIcon/>
            </IconButton>
            <Drawer
                anchor={"right"}
                open={open}
                sx={{
                    zIndex: 1203
                }}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
        </React.Fragment>
    )

};

export default Settings;
