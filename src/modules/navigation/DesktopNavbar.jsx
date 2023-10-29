import desktopNavStyle from '../../assets/css/desktop_navbar.module.css';

import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import React, {useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

import {CgMenuGridO, CgClose} from 'react-icons/cg';
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

const MIN_WIDTH = 5;
const JUMP_AT = 15;
const MAX_WIDTH = 30;

const DesktopNavbar = () => {
  const {currentUser, logout} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [isResizing, setIsResizing] = useState(false);
  const [navbarWidth, setNavbarWidth] = useState(MIN_WIDTH);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation().pathname;

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    setNavbarWidth(isNavOpen ? MIN_WIDTH : JUMP_AT);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();

    if (e.clientX / 16 > MIN_WIDTH && e.clientX / 16 <= MAX_WIDTH) {
      if (e.clientX / 16 < JUMP_AT) {
        setNavbarWidth(MIN_WIDTH);
        setIsNavOpen(false);
      } else {
        setNavbarWidth(e.clientX / 16);
        setIsNavOpen(true);
      }
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
    <aside className={`${desktopNavStyle['nav-bar']} ${isNavOpen ? desktopNavStyle['opened'] : ''} ${isResizing ? desktopNavStyle['resizing'] : ''}`} style={{width: `${navbarWidth}rem`}}>
      <div className={desktopNavStyle['resize-handle']} onMouseDown={handleMouseDown}></div>
      <div className={desktopNavStyle['open-close-navbar']} onClick={toggleNav}>
        {isNavOpen ? <CgClose /> : <CgMenuGridO />}
      </div>

      <ul className={desktopNavStyle['nav-list']}>
        <li className={desktopNavStyle['logo']}>
          <NavLink to="/" className={desktopNavStyle['nav-link']}>
            <h4>{isNavOpen ? 'Groovin' : 'Grvn'}</h4>
          </NavLink>
        </li>

        <li className={desktopNavStyle['nav-list-item']}>
          <span className={desktopNavStyle['part-title']}>General</span>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/" className={`${desktopNavStyle['nav-link']} ${location === '/' ? desktopNavStyle['active'] : ''}`}>
            {location === '/' ? <AiFillHome className={desktopNavStyle['nav-svg']} /> : <AiOutlineHome className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Home</span>
          </NavLink>
        </li>
        <li className={`${desktopNavStyle['nav-list-item']} ${desktopNavStyle['last-in-group']}`}>
          <NavLink to="/search" className={`${desktopNavStyle['nav-link']} ${location === '/search' ? desktopNavStyle['active'] : ''}`}>
            {location === '/search' ? <BiSolidSearchAlt2 className={desktopNavStyle['nav-svg']} /> : <BiSearchAlt className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Search</span>
          </NavLink>
        </li>

        <li className={desktopNavStyle['nav-list-item']}>
          <span className={desktopNavStyle['part-title']}>Library</span>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/playlists" className={`${desktopNavStyle['nav-link']} ${location === '/playlists' ? desktopNavStyle['active'] : ''}`}>
            {location === '/playlists' ? <PiPlaylistFill className={desktopNavStyle['nav-svg']} /> : <PiPlaylistLight className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Playlists</span>
          </NavLink>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/favs" className={`${desktopNavStyle['nav-link']} ${location === '/favs' ? desktopNavStyle['active'] : ''}`}>
            {location === '/favs' ? <HiHeart className={desktopNavStyle['nav-svg']} /> : <HiOutlineHeart className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Favourites</span>
          </NavLink>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/artists" className={`${desktopNavStyle['nav-link']} ${location === '/artists' ? desktopNavStyle['active'] : ''}`}>
            {location === '/artists' ? <IoPersonSharp className={desktopNavStyle['nav-svg']} /> : <IoPersonOutline className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Artists</span>
          </NavLink>
        </li>
        <li className={`${desktopNavStyle['nav-list-item']} ${desktopNavStyle['last-in-group']}`}>
          <NavLink to="/albums" className={`${desktopNavStyle['nav-link']} ${location === '/albums' ? desktopNavStyle['active'] : ''}`}>
            {location === '/albums' ? <PiVinylRecordFill className={desktopNavStyle['nav-svg']} /> : <PiVinylRecordLight className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Albums</span>
          </NavLink>
        </li>

        <li className={desktopNavStyle['nav-list-item']}>
          <span className={desktopNavStyle['part-title']}>Discover</span>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/songs" className={`${desktopNavStyle['nav-link']} ${location === '/songs' ? desktopNavStyle['active'] : ''}`}>
            {location === '/songs' ? <IoMusicalNotesSharp className={desktopNavStyle['nav-svg']} /> : <IoMusicalNotesOutline className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Songs</span>
          </NavLink>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/genres" className={`${desktopNavStyle['nav-link']} ${location === '/genres' ? desktopNavStyle['active'] : ''}`}>
            {location === '/genres' ? <LiaStarSolid className={desktopNavStyle['nav-svg']} /> : <LiaStar className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Genres</span>
          </NavLink>
        </li>
        <li className={`${desktopNavStyle['nav-list-item']} ${desktopNavStyle['last-in-group']}`}>
          <NavLink to="/radio" className={`${desktopNavStyle['nav-link']} ${location === '/radio' ? desktopNavStyle['active'] : ''}`}>
            {location === '/radio' ? <PiRadioFill className={desktopNavStyle['nav-svg']} /> : <PiRadioLight className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Radio</span>
          </NavLink>
        </li>

        <li className={desktopNavStyle['nav-list-item']}>
          <span className={desktopNavStyle['part-title']}>Account</span>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to={`/profile/${currentUser.uid}`} className={`${desktopNavStyle['nav-link']} ${location.startsWith('/profile') ? desktopNavStyle['active'] : ''}`}>
            {location.startsWith('/profile') ? <RiAccountCircleFill className={desktopNavStyle['nav-svg']} /> : <RiAccountCircleLine className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Profile</span>
          </NavLink>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/friends" className={`${desktopNavStyle['nav-link']} ${location === '/friends' ? desktopNavStyle['active'] : ''}`}>
            {location === '/friends' ? <IoPeopleSharp className={desktopNavStyle['nav-svg']} /> : <IoPeopleOutline className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Friends</span>
          </NavLink>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/messages" className={`${desktopNavStyle['nav-link']} ${location === '/messages' ? desktopNavStyle['active'] : ''}`}>
            {location === '/messages' ? <HiEnvelope className={desktopNavStyle['nav-svg']} /> : <HiOutlineEnvelope className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Messages</span>
          </NavLink>
        </li>
        <li className={desktopNavStyle['nav-list-item']}>
          <NavLink to="/notifications" className={`${desktopNavStyle['nav-link']} ${location === '/notifications' ? desktopNavStyle['active'] : ''}`}>
            {location === '/notifications' ? <BiSolidBell className={desktopNavStyle['nav-svg']} /> : <BiBell className={desktopNavStyle['nav-svg']} />}
            <span className={desktopNavStyle['nav-text']}>Notifications</span>
          </NavLink>
        </li>
        <li className={`${desktopNavStyle['nav-list-item']} ${desktopNavStyle['last-in-group']}`}>
          <div className={desktopNavStyle['nav-link']} onClick={handleLogOut}>
            <BiLogOut className={desktopNavStyle['nav-svg']} />
            <span className={desktopNavStyle['nav-text']}>Log Out</span>
          </div>
        </li>
      </ul>
    </aside>
  );
};

export default DesktopNavbar;
