import '../../assets/css/authentication.css';

import {useState} from 'react';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm.jsx';

const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState(1);

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  return (
    <>
      <div className="tabs-wrapper">
        <div className="tabs-header">
          <a href="#login" onClick={() => handleTabClick(1)} className={activeTab === 1 ? 'tabs-header-item active-tab' : 'tabs-header-item'}>
            <h3>Log In</h3>
          </a>
          <a href="#signup" onClick={() => handleTabClick(2)} className={activeTab === 2 ? 'tabs-header-item active-tab' : 'tabs-header-item'}>
            <h3>Sign Up</h3>
          </a>
        </div>
        <div className="tabs-content">
          <div className={activeTab === 1 ? 'tabs-content-item active-content' : 'tabs-content-item'}>
            <LoginForm />
          </div>
          <div className={activeTab === 2 ? 'tabs-content-item active-content' : 'tabs-content-item'}>
            <SignupForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthTabs;
