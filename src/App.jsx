import './assets/css/globals.css';

import {Routes, Route} from 'react-router-dom';
import Authentication from './modules/authentication/Authentication';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Authentication />} />
    </Routes>
  );
}

export default App;
