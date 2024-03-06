import {useQueryParam, StringParam} from 'use-query-params';
import {useTitle} from '../../hooks/useTitle';
import Login from './Login';
import Signup from './Signup';

const AuthTabs = () => {
  const [tab = 'log', setTab] = useQueryParam('tab', StringParam);
  useTitle(tab === 'log' ? 'Log In' : 'Sign Up');

  return (
    <>
      <div className="tabs_wrapper">
        <div className="tabs_header">
          <span onClick={() => setTab('log')} className={tab === 'log' ? 'tabs_header_item active-tab' : 'tabs_header_item'}>
            <h3>LogIn</h3>
          </span>
          <span onClick={() => setTab('reg')} className={tab === 'reg' ? 'tabs_header_item active-tab' : 'tabs_header_item'}>
            <h3>SignUp</h3>
          </span>
        </div>
        <div className="tabs_content">
          <div className={tab === 'log' ? 'tabs_content_item active-content' : 'tabs_content_item'}>
            <Login />
          </div>
          <div className={tab === 'reg' ? 'tabs_content_item active-content' : 'tabs_content_item'}>
            <Signup />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthTabs;
