import React from 'react';
import {NavLink, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

import {HiOutlineChevronLeft, HiOutlineChevronRight} from 'react-icons/hi';
import {RiAccountCircleFill, RiAccountCircleLine} from 'react-icons/ri';
import {HiEnvelope, HiOutlineEnvelope} from 'react-icons/hi2';
import {BiSolidBell, BiBell} from 'react-icons/bi';
import {BiLogOut} from 'react-icons/bi';

const MainHeader = () => {
  const {currentUser, logout} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const navigate = useNavigate();
  const location = useLocation().pathname;

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  const handleLogOut = (e) => {
    e.preventDefault();
    showLoader();

    logout()
      .then(() => {
        addToast('success', 'You have successfully logged out!');
        hideLoader();
        navigate('/auth');
      })
      .catch((error) => {
        addToast('error', error.message);
        hideLoader();
      });
  };

  return (
    <nav className="main-header">
      <div className="header-interactions">
        <div className="header-interaction-item" onClick={goBack}>
          <HiOutlineChevronLeft className="header-interaction-img" />
        </div>
        <div className="header-interaction-item" onClick={goForward}>
          <HiOutlineChevronRight className="header-interaction-img" />
        </div>
      </div>

      <div className="header-interactions">
        <NavLink to="/notifications" className="header-interaction-item" title="Notifications">
          {location === '/notifications' ? <BiSolidBell className="header-interaction-img" /> : <BiBell className="header-interaction-img" />}
        </NavLink>
        <NavLink to="/messages" className="header-interaction-item" title="Messages">
          {location === '/messages' ? <HiEnvelope className="header-interaction-img" /> : <HiOutlineEnvelope className="header-interaction-img" />}
        </NavLink>
        <NavLink to={`/profile/${currentUser.uid}`} className="header-interaction-item" title="Profile">
          {location === `/profile/${currentUser.uid}` ? <RiAccountCircleFill className="header-interaction-img" /> : <RiAccountCircleLine className="header-interaction-img" />}
        </NavLink>
        <div className="header-interaction-item " onClick={handleLogOut} title="Log Out">
          <BiLogOut className="header-interaction-img" />
        </div>
      </div>
    </nav>
  );
};

export default MainHeader;
