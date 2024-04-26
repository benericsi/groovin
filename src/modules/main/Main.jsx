import '../../assets/css/main-page.css';

import React from 'react';
import {useMediaQuery} from 'react-responsive';
import {Outlet} from 'react-router-dom';

import {usePlayer} from '../../hooks/usePlayer';

import DesktopNavbar from '../navigation/DesktopNavbar';
import MobileNavbar from '../navigation/MobileNavbar';
import MainHeader from './MainHeader';
import AudioPlayer from '../player/AudioPlayer';

const Main = () => {
  const {playing} = usePlayer();

  const isMobile = useMediaQuery({query: '(max-width: 1200px)'});

  function renderSideBar() {
    return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
  }

  return (
    <>
      <div className={`main-wrapper ${playing ? 'playing' : ''}`}>
        {renderSideBar()}
        <main className="main-content">
          <MainHeader />
          <div className="main-body">
            <Outlet />
          </div>
        </main>
      </div>
      {playing ? <AudioPlayer /> : null}
    </>
  );
};

export default Main;
