import '../../assets/css/main-page.css';

import React from 'react';
import {Outlet} from 'react-router-dom';
import SideBar from '../navigation/SideBar';

const Main = () => {
  return (
    <div className="main-wrapper">
      <SideBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Main;
