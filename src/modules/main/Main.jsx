import '../../assets/css/main-page.css';

import React from 'react';
import {Outlet} from 'react-router-dom';
import SideBar from '../navigation/SideBar';
import MainHeader from './MainHeader';

const Main = () => {
  return (
    <div className="main-wrapper">
      <SideBar />
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
