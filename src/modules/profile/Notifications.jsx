import '../../assets/css/notifications.css';

import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';
import {useEffect, useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {Link} from 'react-router-dom';
import {db} from '../../setup/Firebase';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';

const Notifications = () => {
  useAccessControl();
  useTitle('Notifications');

  const {currentUser} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    // Get notifications where the reciever is the current user
    const unsubscribe = db
      .collection('notifications')
      .where('receiver', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot((snapshot) => {
        const notifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert the timestamp to a Date object
          const createdAt = new Date(data.createdAt.seconds * 1000);
          // Format the date
          const formattedDate = createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          });

          return {
            id: doc.id,
            ...data,
            createdAt: formattedDate,
          };
        });

        setNotifications(notifications);
      });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const removeNotification = (e, id) => {
    e.preventDefault();
    try {
      showLoader();
      db.collection('notifications').doc(id).delete();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const linkTo = (notification) => {
    let link = '';

    if (notification.type.startsWith('New Playlist')) {
      link = `/profile/${notification.sender}/playlists`;
    } else {
      switch (notification.type) {
        case 'New Message':
          link = `/profile/${notification.receiver}/messages/${notification.sender}`;
          break;
        case 'New Friend Request':
          link = `/profile/${notification.receiver}/requests`;
          break;
        default:
          link = `/profile/${notification.sender}`;
          break;
      }
    }

    return link;
  };

  return (
    <section className="notifications-section">
      {notifications !== null && notifications.length === 0 && <h2>There are no notifications yet.</h2>}
      <div className="notifications-container">
        {notifications &&
          notifications.map((notification, index) => (
            <Link to={linkTo(notification)} className="notification-card" key={index}>
              <div className="notification-remove" onClick={(e) => removeNotification(e, notification.id)}>
                &times;
              </div>
              <div className="notification-card-photo">{notification.senderPhoto !== 'default' ? <img src={notification.senderPhoto} alt="" /> : ''}</div>
              <div className="notification-text">
                <h3>{notification.type}</h3>
                <p>{notification.message}</p>
                <p>{notification.createdAt}</p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default Notifications;
