import {useEffect} from 'react';
import '../../assets/css/authentication.css';

import AuthTabs from './AuthTabs';

const Authentication = () => {
  useEffect(() => {
    document.title = 'Authentication | Groovin.';
  }, []);

  return (
    <>
      <div className="auth-page">
        <div className="auth-container">
          <AuthTabs />
        </div>
      </div>
    </>
  );
};

export default Authentication;
