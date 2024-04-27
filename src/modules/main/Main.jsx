import '../../assets/css/main-page.css';

import React from 'react';
import {useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import {Outlet} from 'react-router-dom';

import {usePlayer} from '../../hooks/usePlayer';

import DesktopNavbar from '../navigation/DesktopNavbar';
import MobileNavbar from '../navigation/MobileNavbar';
import MainHeader from './MainHeader';
import AudioPlayer from '../player/AudioPlayer';
import Queue from '../queue/Queue';

const Main = () => {
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const player = usePlayer();

  const isMobile = useMediaQuery({query: '(max-width: 1200px)'});

  function renderSideBar() {
    return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
  }

  const toggleQueueOpen = () => {
    setIsQueueOpen(!isQueueOpen);
  };

  return (
    <>
      <div className={`main-wrapper ${player.currentSong ? 'playing' : ''}`}>
        {renderSideBar()}
        <main className="main-content">
          <MainHeader />
          <div className="main-body">
            <Outlet />
          </div>
        </main>
        {isQueueOpen ? <Queue setIsQueueOpen={setIsQueueOpen} /> : null}
      </div>
      {player.currentSong ? <AudioPlayer isQueueOpen={isQueueOpen} toggleQueueOpen={toggleQueueOpen} /> : null}
    </>
  );
};

export default Main;
