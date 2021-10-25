import React, {useState} from 'react';
import {List, Divider, ListItem, ListItemIcon, ListItemText, Drawer, IconButton} from "@mui/material";
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import {clearLocalStorage} from "../../actions/cleanupActions";
import {useExport} from "./UseExport";

const Settings = () => {
    const [open, setOpen] = useState(false);
    const {show, RenderExport} = useExport();
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
                <List>
                    <ListItem button
                              sx={{width: 250}}
                              role="presentation"
                              onClick={() => handleSelection(clearLocalStorage)}
                              onKeyDown={toggleDrawer(false)}
                    >
                        <ListItemIcon>
                            <StorageIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"Clear Storage"}/>
                    </ListItem>
                    <Divider/>
                    <ListItem button
                              sx={{width: 250}}
                              role="presentation"
                              onClick={() => show()}
                    >
                        <ListItemIcon>
                            <StorageIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"Export Settings"}/>
                    </ListItem>
                </List>
                <RenderExport/>
            </Drawer>
        </React.Fragment>
    )

};

export default Settings;
