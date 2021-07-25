import React, {useEffect, useRef} from 'react';
import {Link, Route, Switch} from 'react-router-dom';
import {AppBar, Button, List, Toolbar, Typography} from "@material-ui/core";
import './App.css';
import FormFillingMain from "./components/FormFilling/FormFillingMain";
import FormVariablesMain from "./components/FormVariables/FormVariablesMain";
import {useStore} from "./store";
import {initializeFormVariables, initializePdf} from "./components/hooks/startupActions";

const App = () => {
        const refUpdateVariables = useRef(useStore.getState().updateVariables)
        const refSelectPdf = useRef(useStore.getState().selectPdf)

        // prevent rerender by 'hooks changed'
        useEffect(() => useStore.subscribe(
            updateVariables => (refUpdateVariables.current = updateVariables),
            state => state.updateVariables
        ), [])
        useEffect(() => useStore.subscribe(
            selectPdf => (refSelectPdf.current = selectPdf),
            state => state.selectPdf
        ), [])

        // reload variables and fields from storage
        useEffect(() => initializeFormVariables(refUpdateVariables.current), []);
        useEffect(() => initializePdf(refSelectPdf.current), []);

        console.debug("App rendered")
        return <main>
            <div className="App">
                <AppBar position="static">
                    <Toolbar style={{display: "flex", justifyContent: "space-between"}}>
                        <Typography variant="h5">PDF Form Assistant</Typography>
                        <List>
                            <Button component={Link} to={"/"} style={{textDecoration: 'none', color: "white"}}
                            >PDF befüllen</Button>
                            <Button component={Link} to={"/variables"} style={{color: "white"}}>Variablen</Button>
                        </List>
                    </Toolbar>
                </AppBar>
                <Switch>
                    <Route path="/" component={props => <FormFillingMain {...props} />} exact/>
                    <Route path="/variables" component={props => <FormVariablesMain {...props} />} exact/>
                </Switch>
            </div>
        </main>
    }
;

export default App;
