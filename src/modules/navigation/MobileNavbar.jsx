import mobileNavStyle from '../../assets/css/mobile_navbar.module.css';

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

const MobileNavbar = () => {
  const {currentUser, logout} = useAuth();
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [isNavOpen, setIsNavOpen] = useState(false);

  const navbarClassNames = `${mobileNavStyle['nav-aside-wrapper']} ${isNavOpen ? mobileNavStyle['opened'] : ''}`;

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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <header className={mobileNavStyle['mobile-header-wrapper']}>
        <ul className={mobileNavStyle['header-list']}>
          <li className={mobileNavStyle['header-list-item']}>
            <span className={`${mobileNavStyle['header-link']} `} onClick={toggleNav}>
              {isNavOpen ? <CgClose className={mobileNavStyle['header-svg']} /> : <CgMenuGridO className={mobileNavStyle['header-svg']} />}
            </span>
            <span className={`${mobileNavStyle['header-link']} `}>
              <span className={mobileNavStyle['header-svg']}></span>
            </span>
            <NavLink to="/" className={`${mobileNavStyle['logo']} `}>
              <h2>Groovin</h2>
            </NavLink>
            <NavLink to="/search" className={`${mobileNavStyle['header-link']} ${location === '/seacrh' ? mobileNavStyle['active'] : ''}`}>
              {location === '/search' ? <BiSolidSearchAlt2 className={mobileNavStyle['header-svg']} /> : <BiSearchAlt className={mobileNavStyle['header-svg']} />}
            </NavLink>
            <NavLink to={`/profile/${currentUser.uid}`} className={`${mobileNavStyle['header-link']} ${location.startsWith('/profile') ? mobileNavStyle['active'] : ''}`}>
              {location.startsWith('/profile') ? <RiAccountCircleFill className={mobileNavStyle['header-svg']} /> : <RiAccountCircleLine className={mobileNavStyle['header-svg']} />}
            </NavLink>
          </li>
        </ul>
      </header>

      <aside className={navbarClassNames}>
        <div className={mobileNavStyle['nav-aside']}>
          <ul className={mobileNavStyle['side-list']}>
            <li className={mobileNavStyle['side-list-item']}>
              <NavLink to="/artists" className={`${mobileNavStyle['side-link']} ${location === '/artists' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
                {location === '/artists' ? <IoPersonSharp className={mobileNavStyle['side-svg']} /> : <IoPersonOutline className={mobileNavStyle['side-svg']} />}
                <span className={mobileNavStyle['side-text']}>Artists</span>
              </NavLink>
            </li>

            <li className={mobileNavStyle['side-list-item']}>
              <NavLink to="/albums" className={`${mobileNavStyle['side-link']} ${location === '/albums' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
                {location === '/albums' ? <PiVinylRecordFill className={mobileNavStyle['side-svg']} /> : <PiVinylRecordLight className={mobileNavStyle['side-svg']} />}
                <span className={mobileNavStyle['side-text']}>Albums</span>
              </NavLink>
            </li>

            <li className={mobileNavStyle['side-list-item']}>
              <NavLink to="/songs" className={`${mobileNavStyle['side-link']} ${location === '/songs' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
                {location === '/songs' ? <IoMusicalNotesSharp className={`${mobileNavStyle['side-svg']} ${mobileNavStyle['scale-down']}`} /> : <IoMusicalNotesOutline className={`${mobileNavStyle['side-svg']} ${mobileNavStyle['scale-down']}`} />}
                <span className={mobileNavStyle['side-text']}>Songs</span>
              </NavLink>
            </li>

            <li className={mobileNavStyle['side-list-item']}>
              <NavLink to="/genres" className={`${mobileNavStyle['side-link']} ${location === '/genres' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
                {location === '/genres' ? <LiaStarSolid className={`${mobileNavStyle['side-svg']} ${mobileNavStyle['scale-down']}`} /> : <LiaStar className={`${mobileNavStyle['side-svg']} ${mobileNavStyle['scale-down']}`} />}
                <span className={mobileNavStyle['side-text']}>Genres</span>
              </NavLink>
            </li>

            <li className={`${mobileNavStyle['side-list-item']}`}>
              <NavLink to="/radio" className={`${mobileNavStyle['side-link']} ${location === '/radio' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
                {location === '/radio' ? <PiRadioFill className={mobileNavStyle['side-svg']} /> : <PiRadioLight className={mobileNavStyle['side-svg']} />}
                <span className={mobileNavStyle['side-text']}>Radio</span>
              </NavLink>
            </li>

            <li className={mobileNavStyle['side-list-item']}>
              <NavLink to="/playlists" className={`${mobileNavStyle['side-link']} ${location === '/playlists' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
                {location === '/playlists' ? <PiPlaylistFill className={mobileNavStyle['side-svg']} /> : <PiPlaylistLight className={mobileNavStyle['side-svg']} />}
                <span className={mobileNavStyle['side-text']}>Playlists</span>
              </NavLink>
            </li>

            <li className={mobileNavStyle['side-list-item']}>
              <NavLink to="" className={mobileNavStyle['side-link']} onClick={handleLogOut}>
                <BiLogOut className={mobileNavStyle['side-svg']} />
                <span className={mobileNavStyle['side-text']}>Log Out</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>

      <nav className={mobileNavStyle['nav-bar']}>
        <ul className={mobileNavStyle['nav-list']}>
          <li className={`${mobileNavStyle['nav-list-item']}`}>
            <NavLink to="/friends" className={`${mobileNavStyle['nav-link']} ${location === '/friends' ? mobileNavStyle['active'] : mobileNavStyle['inactive']} `}>
              {location === '/friends' ? <IoPeopleSharp className={mobileNavStyle['navbar-svg']} /> : <IoPeopleOutline className={mobileNavStyle['navbar-svg']} />}
            </NavLink>
          </li>

          <li className={mobileNavStyle['nav-list-item']}>
            <NavLink to="/favs" className={`${mobileNavStyle['nav-link']} ${location === '/favs' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
              {location === '/favs' ? <HiHeart className={mobileNavStyle['navbar-svg']} /> : <HiOutlineHeart className={mobileNavStyle['navbar-svg']} />}
            </NavLink>
          </li>

          <li className={mobileNavStyle['nav-list-item']}>
            <NavLink to="/" className={`${mobileNavStyle['nav-link']} ${location === '/' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
              {location === '/' ? <AiFillHome className={mobileNavStyle['navbar-svg']} /> : <AiOutlineHome className={mobileNavStyle['navbar-svg']} />}
            </NavLink>
          </li>

          <li className={mobileNavStyle['nav-list-item']}>
            <NavLink to="/messages" className={`${mobileNavStyle['nav-link']} ${location === '/messages' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
              {location === '/messages' ? <HiEnvelope className={mobileNavStyle['navbar-svg']} /> : <HiOutlineEnvelope className={mobileNavStyle['navbar-svg']} />}
              <span className={mobileNavStyle['new-notification']}></span>
            </NavLink>
          </li>

          <li className={mobileNavStyle['nav-list-item']}>
            <NavLink to="/notifications" className={`${mobileNavStyle['nav-link']} ${location === '/notifications' ? mobileNavStyle['active'] : mobileNavStyle['inactive']}`}>
              {location === '/notifications' ? <BiSolidBell className={mobileNavStyle['navbar-svg']} /> : <BiBell className={mobileNavStyle['navbar-svg']} />}
              <span className={mobileNavStyle['new-notification']}></span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default MobileNavbar;
