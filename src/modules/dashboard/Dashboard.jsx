import '../../assets/css/dashboard.css';

import Nav from '../navigation/Nav';
import Main from '../main/Main';

import React, {useEffect} from 'react';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard | Groovin.';
  }, []);

  return (
    <>
      <div className="dashboard">
        <Nav />
        <Main />
      </div>
    </>
  );
};

export default Dashboard;
