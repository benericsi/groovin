import React from 'react';
import {NavLink, useNavigate, useLocation, useParams} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

import {HiOutlineChevronLeft, HiOutlineChevronRight} from 'react-icons/hi';
import {RiAccountCircleFill, RiAccountCircleLine} from 'react-icons/ri';
import {HiEnvelope, HiOutlineEnvelope} from 'react-icons/hi2';
import {BiSolidBell, BiBell} from 'react-icons/bi';
import {BiLogOut} from 'react-icons/bi';

const MainHeader = () => {
  const {partnerId} = useParams();
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
        <NavLink to={`/profile/${currentUser.uid}/notifications`} className={`header-interaction-item ${location === `/profile/${currentUser.uid}/notifications` ? 'active' : 'inactive'}`} title="Notifications">
          {location === `/profile/${currentUser.uid}/notifications` ? <BiSolidBell className="header-interaction-img" /> : <BiBell className="header-interaction-img" />}
        </NavLink>
        <NavLink to={`/profile/${currentUser.uid}/messages`} className={`header-interaction-item ${location === `/profile/${currentUser.uid}/messages` || location === `/profile/${currentUser.uid}/messages/${partnerId}` ? 'active' : 'inactive'}`} title="Messages">
          {location === `/profile/${currentUser.uid}/messages` || location === `/profile/${currentUser.uid}/messages/${partnerId}` ? <HiEnvelope className="header-interaction-img" /> : <HiOutlineEnvelope className="header-interaction-img" />}
        </NavLink>
        <NavLink to={`/profile/${currentUser.uid}`} className={`header-interaction-item ${location === `/profile/${currentUser.uid}` ? 'active' : 'inactive'}`} title="Profile">
          {location === `/profile/${currentUser.uid}` ? <RiAccountCircleFill className="header-interaction-img" /> : <RiAccountCircleLine className="header-interaction-img" />}
        </NavLink>
        <div className="header-interaction-item " onClick={handleLogOut} title="Log Out">
          <BiLogOut className="header-interaction-img logout" />
        </div>
      </div>
    </nav>
  );
};

export default MainHeader;
