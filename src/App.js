import React, {useEffect, useRef} from 'react';
import {Link, Route, Switch} from 'react-router-dom';
import {AppBar, Button, List, Toolbar, Typography} from "@material-ui/core";
import './App.css';
import FormFillingMain from "./components/FormFilling/FormFillingMain";
import FormVariablesMain from "./components/FormVariables/FormVariablesMain";
import {useStore} from "./store";
import Settings from "./components/FormFilling/Settings/Settings";

const App = () => {
        const refLoadPdfs = useRef(useStore.getState().loadPdfs)
        const refLoadVariables = useRef(useStore.getState().loadVariables)

        useEffect(() => useStore.subscribe(
            loadPdfs => (refLoadPdfs.current = loadPdfs),
            state => state.loadPdfs
        ), [])
        useEffect(() => useStore.subscribe(
            loadVariables => (refLoadVariables.current = loadVariables),
            state => state.loadVariables
        ), [])

        useEffect(() => {
            const loadInitialData = async () => {
                await refLoadPdfs.current();
                await refLoadVariables.current();
            }
            loadInitialData().then(() => console.debug("App: data loaded"))
        }, []);

        const handleReload = () => {
            window.location.reload(true);
        }

        return <main>
            <div className="App">
                <AppBar className={"app-bar"} position="static">
                    <Toolbar className={"app-bar-menu"}>
                        <Typography onClick={handleReload} onTouchEnd={handleReload} variant="h5">PDF Form
                            Assistant</Typography>
                        <List>
                            <Button component={Link} to={"/"} style={{textDecoration: 'none', color: "white"}}
                            >Fill Form</Button>
                            <Button component={Link} to={"/variables"} style={{color: "white"}}
                            >Manage Variables</Button>
                        </List>
                        <Settings/>
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
