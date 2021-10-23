import React, {memo} from 'react';
import {Collapse, List, ListItem, ListItemButton, ListItemText} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";

const FormGroupItem = memo(({
                                children,
                                GroupComponent,
                                GroupComponentProps
                            }
) => {
    const [open, setOpen] = React.useState(true);

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
    if (true)
        return <List dense>
            <ListItem dense disablePadding >
                <ListItemButton onClick={handleClick} alignItems={"center"} sx={style.itemBtn}>
                    {open ? <ExpandLess/> : <ExpandMore/>}
                </ListItemButton>
                <GroupComponent {...GroupComponentProps}/>

            </ListItem>
            <Collapse in={open} timeout="auto" >
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
