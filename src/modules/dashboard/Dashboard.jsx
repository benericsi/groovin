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
      <section className="dashboard">
        <Nav />
        <Main />
      </section>
    </>
  );
};

export default Dashboard;
