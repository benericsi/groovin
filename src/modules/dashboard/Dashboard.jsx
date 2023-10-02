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
      showLoader();

      try {
        const querySnapshot = await db.collection('users').doc(currentUser.uid).get();
        currentUser.updateProfile({
          displayName: querySnapshot.data().firstName + ' ' + querySnapshot.data().lastName,
          photoURL: querySnapshot.data().photoURL,
        });

        hideLoader();
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
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
