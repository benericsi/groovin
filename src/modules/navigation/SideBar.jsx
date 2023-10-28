import '../../assets/css/sidebar.css';

import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';

import {AiFillHome, AiOutlineHome} from 'react-icons/ai';
import {BiSearchAlt, BiSolidSearchAlt2} from 'react-icons/bi';
import {IoMusicalNotesOutline, IoMusicalNotesSharp} from 'react-icons/io5';
import {IoPersonSharp, IoPersonOutline} from 'react-icons/io5';
import {PiVinylRecordLight, PiVinylRecordFill} from 'react-icons/pi';
import {PiPlaylistLight, PiPlaylistFill} from 'react-icons/pi';
import {HiOutlineHeart, HiHeart} from 'react-icons/hi';
import {LiaStarSolid, LiaStar} from 'react-icons/lia';
import {PiRadioFill, PiRadioLight} from 'react-icons/pi';
import {RiAccountCircleFill, RiAccountCircleLine} from 'react-icons/ri';
import {IoPeopleOutline, IoPeopleSharp} from 'react-icons/io5';
import {HiEnvelope, HiOutlineEnvelope} from 'react-icons/hi2';
import {BiSolidBell, BiBell} from 'react-icons/bi';
import {BiLogOut} from 'react-icons/bi';

const MIN_WIDTH = 15;
//const JUMP_AT = 15;
const MAX_WIDTH = 25;

const SideBar = () => {
  const {currentUser, logout} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const navigate = useNavigate();

  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(MIN_WIDTH);
  //const [isSideOpen, setIsSideOpen] = useState(false); ${isSideOpen ? 'opened' : ''}
  const location = useLocation().pathname;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    const newWidth = e.clientX / 16;
    if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) {
      setSidebarWidth(newWidth);
    } else if (newWidth <= MIN_WIDTH) {
      setSidebarWidth(MIN_WIDTH);
    } else if (newWidth >= MAX_WIDTH) {
      setSidebarWidth(MAX_WIDTH);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
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
    <aside className={`side-bar ${isResizing ? 'resizing' : ''}`} style={{width: `${sidebarWidth}rem`}}>
      <div className="resize-handle" onMouseDown={handleMouseDown}></div>
      <ul className="side-list">
        <li className="logo">
          <NavLink to="/" className="side-link">
            <h1>Groovin</h1>
          </NavLink>
        </li>

        <span className="part-title">General</span>
        <li className="side-list-item">
          <NavLink to="/" className="side-link">
            {location === '/' ? <AiFillHome className="side-svg" /> : <AiOutlineHome className="side-svg" />}
            <span className="side-text">Home</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/search" className="side-link">
            {location === '/search' ? <BiSolidSearchAlt2 className="side-svg" /> : <BiSearchAlt className="side-svg" />}
            <span className="side-text">Search</span>
          </NavLink>
        </li>

        <span className="part-title">Library</span>
        <li className="side-list-item">
          <NavLink to="/playlists" className="side-link">
            {location === '/playlists' ? <PiPlaylistFill className="side-svg" /> : <PiPlaylistLight className="side-svg" />}
            <span className="side-text">Playlists</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/favs" className="side-link">
            {location === '/favs' ? <HiHeart className="side-svg" /> : <HiOutlineHeart className="side-svg" />}
            <span className="side-text">Favourites</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/artists" className="side-link">
            {location === '/artists' ? <IoPersonSharp className="side-svg" /> : <IoPersonOutline className="side-svg" />}
            <span className="side-text">Artists</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/albums" className="side-link">
            {location === '/albums' ? <PiVinylRecordFill className="side-svg" /> : <PiVinylRecordLight className="side-svg" />}
            <span className="side-text">Albums</span>
          </NavLink>
        </li>

        <span className="part-title">Discover</span>
        <li className="side-list-item">
          <NavLink to="/songs" className="side-link">
            {location === '/songs' ? <IoMusicalNotesSharp className="side-svg" /> : <IoMusicalNotesOutline className="side-svg" />}
            <span className="side-text">Songs</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/genres" className="side-link">
            {location === '/genres' ? <LiaStarSolid className="side-svg" /> : <LiaStar className="side-svg" />}
            <span className="side-text">Genres</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/radio" className="side-link">
            {location === '/radio' ? <PiRadioFill className="side-svg" /> : <PiRadioLight className="side-svg" />}
            <span className="side-text">Radio</span>
          </NavLink>
        </li>

        <span className="part-title">Account</span>
        <li className="side-list-item">
          <NavLink to={`/profile/${currentUser.uid}`} className="side-link">
            {location.startsWith('/profile') ? <RiAccountCircleFill className="side-svg" /> : <RiAccountCircleLine className="side-svg" />}
            <span className="side-text">Profile</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/friends" className="side-link">
            {location === '/friends' ? <IoPeopleSharp className="side-svg" /> : <IoPeopleOutline className="side-svg" />}
            <span className="side-text">Friends</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/messages" className="side-link">
            {location === '/messages' ? <HiEnvelope className="side-svg" /> : <HiOutlineEnvelope className="side-svg" />}
            <span className="side-text">Messages</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <NavLink to="/notifications" className="side-link">
            {location === '/notifications' ? <BiSolidBell className="side-svg" /> : <BiBell className="side-svg" />}
            <span className="side-text">Notifications</span>
          </NavLink>
        </li>
        <li className="side-list-item">
          <div className="side-link" onClick={handleLogOut}>
            <BiLogOut className="side-svg" />
            <span className="side-text">Log Out</span>
          </div>
        </li>
      </ul>
    </aside>
  );
};

export default SideBar;
