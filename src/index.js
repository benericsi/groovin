import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';
import {BrowserRouter as Router} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <App />
    </QueryParamProvider>
  </Router>
);
