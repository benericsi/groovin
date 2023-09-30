import '../../assets/css/notifications.css';
import CommonBody from '../../common/CommonBody';
import Notification from './Notififcation';

import React, {useState} from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  return (
    <CommonBody>
      <h1>Notifications</h1>
      <div className="notification-container">
        <Notification />
        <Notification />
        <Notification />
        <Notification />
      </div>
    </CommonBody>
  );
};

export default Notifications;
