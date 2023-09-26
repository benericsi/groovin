import '../../assets/css/dashboard.css';

import Button from '../../common/Button';

import Nav from '../navigation/Nav';

import React, {useEffect} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useNavigate} from 'react-router-dom';

const Dashboard = () => {
  const {currentUser, logout} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const history = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard | Groovin.';
  }, []);

  const handleLogOut = (e) => {
    e.preventDefault();
    showLoader();

    logout()
      .then(() => {
        // Logout was successful
        hideLoader();
        addToast('success', 'You have been logged out successfully!');
        history('/auth#login');
      })
      .catch((error) => {
        hideLoader();
        addToast('error', error.message);
      });
  };

  return (
    <>
      <section className="dashboard">
        <Nav />
        <h1>Dashboard</h1>
        <Button text="Log out" className="btn-light" onClick={handleLogOut} />
        <p>{currentUser.email}</p>
      </section>
    </>
  );
};

export default Dashboard;
