import "./utils/logging";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import * as serviceWorker from './serviceWorkerRegistration';

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>,
    document.getElementById('root')
)

serviceWorker.register();
