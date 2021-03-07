import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

document.body.addEventListener("ondrop", (e) => {e.preventDefault(); console.log(e)});


ReactDOM.render(<App />, document.getElementById('root'));

