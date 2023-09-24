import './assets/css/globals.css';

import Authentication from './modules/auth/Authentication';
import AuthProvider from './setup/AuthProvider';

const App = () => {
  return (
    <>
      <AuthProvider>
        <Authentication />
      </AuthProvider>
    </>
  );
};

export default App;
