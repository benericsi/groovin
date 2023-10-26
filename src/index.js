import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';
import {BrowserRouter as Router} from 'react-router-dom';
import LoaderProvider from './setup/LoaderProvider';
import ToastContainer from './common/ToastContainer';
import ToastProvider from './setup/ToastProvider';
import AuthProvider from './setup/AuthProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <LoaderProvider>
        <ToastProvider>
          <AuthProvider>
            <ToastContainer />
            <App />
          </AuthProvider>
        </ToastProvider>
      </LoaderProvider>
    </QueryParamProvider>
  </Router>
);
