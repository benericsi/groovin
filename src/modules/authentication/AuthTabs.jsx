import {useQueryParam, StringParam} from 'use-query-params';
import {useTitle} from '../../hooks/useTitle';
import Login from './Login';
import Signup from './Signup';

const AuthTabs = () => {
  const [tab = 'log', setTab] = useQueryParam('tab', StringParam);
  useTitle(tab === 'log' ? 'Log In' : 'Sign Up');

  return (
    <>
      <div className="tabs-wrapper">
        <div className="tabs-header">
          <span onClick={() => setTab('log')} className={tab === 'log' ? 'tabs-header-item active-tab' : 'tabs-header-item'}>
            <h3>LogIn</h3>
          </span>
          <span onClick={() => setTab('reg')} className={tab === 'reg' ? 'tabs-header-item active-tab' : 'tabs-header-item'}>
            <h3>SignUp</h3>
          </span>
        </div>
        <div className="tabs-content">
          <div className={tab === 'log' ? 'tabs-content-item active-content' : 'tabs-content-item'}>
            <Login />
          </div>
          <div className={tab === 'reg' ? 'tabs-content-item active-content' : 'tabs-content-item'}>
            <Signup />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthTabs;
