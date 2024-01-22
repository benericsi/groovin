import '../../assets/css/main-page.css';

import React from 'react';
import {useMediaQuery} from 'react-responsive';
import {Outlet} from 'react-router-dom';
import DesktopNavbar from '../navigation/DesktopNavbar';
import MobileNavbar from '../navigation/MobileNavbar';
import MainHeader from './MainHeader';

const Main = () => {
  const isMobile = useMediaQuery({query: '(max-width: 1200px)'});

  function renderSideBar() {
    return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
  }

  return (
    <div className="main-wrapper">
      {renderSideBar()}
      <main className="main-content">
        <MainHeader />
        <div className="main-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Main;
