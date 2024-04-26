import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';
import {BrowserRouter as Router} from 'react-router-dom';
import LoaderProvider from './context/LoaderProvider';
import ToastContainer from './component/ToastContainer';
import ToastProvider from './context/ToastProvider';
import AuthProvider from './context/AuthProvider';
import PlayerProvider from './context/PlayerProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <LoaderProvider>
        <ToastProvider>
          <AuthProvider>
            <PlayerProvider>
              <ToastContainer />
              <App />
            </PlayerProvider>
          </AuthProvider>
        </ToastProvider>
      </LoaderProvider>
    </QueryParamProvider>
  </Router>
);
