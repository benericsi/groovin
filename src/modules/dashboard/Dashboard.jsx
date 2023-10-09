import '../../assets/css/dashboard.css';

import Nav from '../navigation/Nav';
import Main from '../main/Main';

import React, {useEffect} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';

const Dashboard = () => {
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    document.title = 'Dashboard | Groovin.';

    const fetchUserData = async () => {
      try {
        showLoader();
        const querySnapshot = await db.collection('users').doc(currentUser.uid).get();
        currentUser.updateProfile({
          displayName: querySnapshot.data().firstName + ' ' + querySnapshot.data().lastName,
          photoURL: querySnapshot.data().photoURL,
        });
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    fetchUserData();
  }, [currentUser]);

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
