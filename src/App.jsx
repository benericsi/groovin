import './assets/css/globals.css';

import React, {lazy, Suspense} from 'react';
import {Routes, Route} from 'react-router-dom';

import Loader from './common/Loader';
import PrivateRoute from './setup/PrivateRoute';
const Authentication = lazy(() => import('./modules/authentication/Authentication'));
const Main = lazy(() => import('./modules/main/Main'));
const Dashboard = lazy(() => import('./modules/main/Dashboard'));
const Profile = lazy(() => import('./modules/profile/Profile'));
const ErrorPage = lazy(() => import('./common/ErrorPage'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/auth" element={<Authentication />} />

        <Route element={<PrivateRoute />}>
          <Route exact path="/" element={<Main />}>
            <Route index element={<Dashboard />} />
            <Route path="/profile">
              <Route path=":uid" element={<Profile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
