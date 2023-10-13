import './assets/css/globals.css';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Authentication from './modules/auth/Authentication';
import Dashboard from './modules/dashboard/Dashboard';
import ResetPassword from './modules/auth/ResetPassword';

import AuthProvider from './setup/AuthProvider';
import ToastProvider from './setup/ToastProvider';
import ToastContainer from './common/ToastContainer';
import LoaderProvider from './setup/LoaderProvider';

import PrivateRoute from './setup/PrivateRoute';

const App = () => {
  return (
    <>
      <Router>
        <LoaderProvider>
          <ToastProvider>
            <AuthProvider>
              <Routes>
                <Route path="/:page" element={<PrivateRoute />}>
                  <Route path="/:page" element={<Dashboard />} />
                  <Route path="/:page/:uid" element={<Dashboard />}>
                    <Route path="/:page/:uid/:page" element={<Dashboard />} />
                  </Route>
                </Route>
                <Route exact path="/" element={<PrivateRoute />}>
                  <Route exact path="/" element={<Dashboard />} />
                </Route>
                <Route path="/auth" element={<Authentication />} />
                <Route path="/reset-pass" element={<ResetPassword />} />
              </Routes>
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </LoaderProvider>
      </Router>
    </>
  );
};

export default App;
