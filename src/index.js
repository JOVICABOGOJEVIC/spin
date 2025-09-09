import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactDOMShim from 'react-dom';
import {Provider} from 'react-redux';
import store from './redux/store'
import './index.css';
import './styles/themes.css';
import App from './App';

// Dodajemo unstable_batchedUpdates funkciju na ReactDOM objekat ako ne postoji
if (!ReactDOMShim.unstable_batchedUpdates) {
  ReactDOMShim.unstable_batchedUpdates = (callback) => callback();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
    <App />
    </Provider>
);


