import './assets/css/globals.css';

import React, {lazy, Suspense} from 'react';
import {Routes, Route} from 'react-router-dom';

import Loader from './common/Loader';
import PrivateRoute from './setup/PrivateRoute';
const Authentication = lazy(() => import('./modules/authentication/Authentication'));
const Main = lazy(() => import('./modules/main/Main'));
const Dashboard = lazy(() => import('./modules/main/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/auth" element={<Authentication />} />

        <Route element={<PrivateRoute />}>
          <Route exact path="/" element={<Main />}>
            <Route index element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
