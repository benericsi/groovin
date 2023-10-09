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
    showLoader();

    const fetchUserNotifications = async () => {
      try {
        //notifactions collection currentuser.uid doc userNotifications collection
        const querySnapshot = await db.collection('notifications').doc(currentUser.uid).collection('notifications').orderBy('timestamp', 'asc').get();
        const sortedNotifications = querySnapshot.docs.map((snapshot) => snapshot.data());
        setNotifications(sortedNotifications);
      } catch (error) {
        addToast('error', error.message);
        hideLoader();
      }
    };

    fetchUserNotifications();
    hideLoader();
  }, [notifications]);

  return (
    <CommonBody>
      <h1>Notifications</h1>
      {notifications.length === 0 && <h2 className="no-data">You have no notifications.</h2>}
      <div className="notification-container">{notifications && notifications.map((notification) => <Notification key={notification.timestamp} notification={notification} />)}</div>
    </CommonBody>
  );
};

export default Notifications;
