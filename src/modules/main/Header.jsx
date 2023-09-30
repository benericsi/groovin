import back from '../../assets/icons/angle-left-solid.svg';
import forward from '../../assets/icons/angle-right-solid.svg';
import message from '../../assets/icons/envelope-solid.svg';
import notifiation from '../../assets/icons/bell-solid.svg';
import profile from '../../assets/icons/user-solid.svg';
import logOut from '../../assets/icons/arrow-right-from-bracket-solid.svg';

import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

import {NavLink} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {db} from '../../setup/Firebase';

const Header = () => {
  const {currentUser, logout} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState('default');

  const accountLink = currentUser ? `/account/${currentUser.uid}` : '/auth#login';

  useEffect(() => {
    // Fetch the profile image data asynchronously
    const fetchData = async () => {
      try {
        const querySnapshot = await db.collection('users').get();
        querySnapshot.forEach((doc) => {
          if (doc.data().email === currentUser.email) {
            setProfileImage(doc.data().photoURL);
          }
        });
      } catch (error) {
        addToast('error', error.message);
      }
    };

    fetchData();
  }, [currentUser.email]);

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

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return (
    <header className="main-header">
      <div className="header-interactions">
        <div className="header-interaction-item" onClick={goBack}>
          <img src={back} alt="Notifications" className="header-interaction-img" />
        </div>
        <div className="header-interaction-item" onClick={goForward}>
          <img src={forward} alt="Messages" className="header-interaction-img" />
        </div>
      </div>

      <div className="header-interactions">
        <NavLink to="/notifications" className="header-interaction-item" title="Notifications">
          <img src={notifiation} alt="Notifications" className="header-interaction-img" />
        </NavLink>
        <NavLink to="/messages" className="header-interaction-item" title="Messages">
          <img src={message} alt="Messages" className="header-interaction-img" />
        </NavLink>
        <NavLink to={accountLink} className="header-interaction-item" title="Profile">
          <img src={profileImage === 'default' ? profile : profileImage} alt="prof" className={`header-interaction-img ${profileImage !== 'default' ? 'has-img' : ''}`} />
        </NavLink>
        <div className="header-interaction-item " onClick={handleLogOut} title="Log Out">
          <img src={logOut} alt="Log Out" className="header-interaction-img" />
        </div>
      </div>
    </header>
  );
};

export default Header;
