import React, {memo} from 'react';
import {Collapse, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";

const FormGroupItem = memo(({
                                children,
                                GroupComponent,
                                GroupComponentProps,
                                disableGroupItem = false
                            }
) => {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };
    const style = {
        itemBtn: {justifyContent: "center"},
        itemText: {
            '& .MuiTypography-root': {
                fontSize: "0.9rem",
                userSelect: "none"
            },
        }
    }
    return <List dense>
        <Tooltip  title={disableGroupItem ? "Clear the underlying group-fields to activate this field again" : ""}
        placement={"top-start"} arrow
        >
            <ListItem dense disablePadding>
                <ListItemButton onClick={handleClick} alignItems={"center"} sx={style.itemBtn}>
                    {open ? <ExpandLess/> : <ExpandMore/>}
                </ListItemButton>
                <GroupComponent {...GroupComponentProps} disabled={disableGroupItem}/>
            </ListItem>
        </Tooltip>
        <Collapse in={open} timeout="auto">
            <List>
                <ListItemText sx={style.itemText}>In a group only the "export value" (.*-FieldName) counts to select
                    the
                    corresponding button</ListItemText>
                {children}
            </List>
        </Collapse>
    </List>
})

export default FormGroupItem;
