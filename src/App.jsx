import './assets/css/globals.css';

import Authentication from './modules/auth/Authentication';
import AuthProvider from './setup/AuthProvider';
import ToastProvider from './setup/ToastProvider';
import ToastContainer from './common/ToastContainer';

const App = () => {
  return (
    <>
      <ToastProvider>
        <AuthProvider>
          <Authentication />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </>
  );
};

export default App;
