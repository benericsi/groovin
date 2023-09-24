import './assets/css/globals.css';

import Authentication from './modules/auth/Authentication';
import AuthProvider from './setup/AuthProvider';
import ToastProvider from './setup/ToastProvider';
import ToastContainer from './common/ToastContainer';
import LoaderProvider from './setup/LoaderProvider';
import Loader from './common/Loader';

const App = () => {
  return (
    <>
      <LoaderProvider>
        <Loader />
        <ToastProvider>
          <AuthProvider>
            <Authentication />
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
      </LoaderProvider>
    </>
  );
};

export default App;
