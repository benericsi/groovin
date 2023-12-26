import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';

const ProfileSubNav = ({uid, isOwnProfile}) => {
  const location = useLocation().pathname;

  return (
    <nav className="user-nav">
      <ul className="user-nav-list">
        <li className="user-nav-list-item">
          <NavLink to={`/profile/${uid}`} className={`user-nav-link ${location === `/profile/${uid}` ? 'active' : 'inactive'}`}>
            Profile
          </NavLink>
        </li>
        <li className="user-nav-list-item">
          <NavLink to={`/profile/${uid}/playlists`} className={`user-nav-link ${location === `/profile/${uid}/playlists` ? 'active' : 'inactive'}`}>
            Playlists
          </NavLink>
        </li>
        <li className="user-nav-list-item">
          <NavLink to={`/profile/${uid}/friends`} className={`user-nav-link ${location === `/profile/${uid}/friends` ? 'active' : 'inactive'}`}>
            Friends
          </NavLink>
        </li>
        {isOwnProfile ? (
          <>
            <li className="user-nav-list-item">
              <NavLink to={`/profile/${uid}/requests`} className={`user-nav-link ${location === `/profile/${uid}/requests` ? 'active' : 'inactive'}`}>
                Requests
              </NavLink>
            </li>
            <li className="user-nav-list-item">
              <NavLink to={`/profile/${uid}/messages`} className={`user-nav-link ${location === `/profile/${uid}/messages` ? 'active' : 'inactive'}`}>
                Messages
              </NavLink>
            </li>
            <li className="user-nav-list-item">
              <NavLink to={`/profile/${uid}/notifications`} className={`user-nav-link ${location === `/profile/${uid}/notifications` ? 'active' : 'inactive'}`}>
                Notifications
              </NavLink>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
};

export default ProfileSubNav;
