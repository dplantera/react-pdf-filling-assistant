import React from 'react';
import './App.css';
import {AppBar, Toolbar, Typography} from "@material-ui/core";
import FormFillingMain from "./components/FormFilling/FormFillingMain";

const App = () => {
        return (
            <div className="App">
                <AppBar position="static">
                    <Toolbar style={{display: "flex", justifyContent: "space-between"}}>
                        <Typography variant="h5">PDF Form Assistant</Typography>
                    </Toolbar>
                </AppBar>
                <FormFillingMain/>
            </div>
        );
    }
;

export default App;
