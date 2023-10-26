import '../../assets/css/main-page.css';

import React from 'react';
import {Outlet} from 'react-router-dom';

const Main = () => {
  return (
    <div className="main-wrapper">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Main;
