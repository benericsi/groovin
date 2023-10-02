import '../../assets/css/notifications.css';
import CommonBody from '../../common/CommonBody';
import Notification from './Notififcation';

import React, {useEffect, useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';

const Notifications = () => {
  const {currentUser} = useAuth();
  const [notifications, setNotifications] = useState([]);

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    const fetchUserNotifications = async () => {
      showLoader();

      try {
        //notifactions collection currentuser.uid doc userNotifications collection
        const querySnapshot = await db.collection('notifications').doc(currentUser.uid).collection('userNotifications').get();
        querySnapshot.forEach((snapshot) => {
          console.log(snapshot.data());
          // order by createdAt
        });
        hideLoader();
      } catch (error) {
        addToast('error', error.message);
        hideLoader();
      }
    };

    fetchUserNotifications();
  }, []);

  return (
    <CommonBody>
      <h1>Notifications</h1>
      <div className="notification-container"></div>
    </CommonBody>
  );
};

export default Notifications;
