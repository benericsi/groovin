import back from '../../assets/icons/angle-left-solid.svg';
import forward from '../../assets/icons/angle-right-solid.svg';
import message from '../../assets/icons/envelope-solid.svg';
import notifiation from '../../assets/icons/bell-solid.svg';
import profile from '../../assets/icons/user-solid.svg';
import logOut from '../../assets/icons/arrow-right-from-bracket-solid.svg';

import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

const Header = () => {
  const {currentUser, logout} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const navigate = useNavigate();

  const handleLogOut = (e) => {
    e.preventDefault();
    showLoader();

    logout()
      .then(() => {
        addToast('success', 'You have logged out successfully!');
        hideLoader();
        navigate('/auth#login');
      })
      .catch((error) => {
        addToast('error', error.message);
        hideLoader();
      });
  };

  return (
    <header className="main-header">
      <div className="header-interactions">
        <div className="header-interaction-item">
          <img src={back} alt="Notifications" className="header-interaction-img" />
        </div>
        <div className="header-interaction-item">
          <img src={forward} alt="Messages" className="header-interaction-img" />
        </div>
      </div>

      <div className="header-interactions">
        <div className="header-interaction-item" title="Notifications">
          <img src={notifiation} alt="Notifications" className="header-interaction-img" />
        </div>
        <div className="header-interaction-item" title="Messages">
          <img src={message} alt="Messages" className="header-interaction-img" />
        </div>
        <div className="header-interaction-item" title="Profile">
          <img src={profile} alt="Profile Pic" className="header-interaction-img" />
        </div>
        <div className="header-interaction-item" onClick={handleLogOut} title="Log Out">
          <img src={logOut} alt="Log Out" className="header-interaction-img" />
        </div>
      </div>
    </header>
  );
};

export default Header;
