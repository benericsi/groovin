import {Link} from 'react-router-dom';
import profile from '../../assets/icons/user-solid.svg';

const Notification = ({notification, removeNotification}) => {
  // Convert Firestore Timestamp to JavaScript Date
  const createdAtDate = notification.timestamp.toDate();

  // Format the date components
  const year = createdAtDate.getFullYear();
  const month = String(createdAtDate.getMonth() + 1).padStart(2, '0');
  const day = String(createdAtDate.getDate()).padStart(2, '0');
  const hours = String(createdAtDate.getHours()).padStart(2, '0');
  const minutes = String(createdAtDate.getMinutes()).padStart(2, '0');
  const seconds = String(createdAtDate.getSeconds()).padStart(2, '0');

  // Create the formatted date string
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  const linkTo = '/account/' + notification.sender;

  return (
    <>
      <Link to={linkTo} className="notification-item">
        <div className="notification-remove" onClick={removeNotification}>
          &times;
        </div>
        <img className="notification-img" src={notification.senderPhoto === 'default' ? profile : notification.senderPhoto} alt=""></img>
        <div className="notification-text">
          <h3>{notification.type}</h3>
          <p>{notification.senderName + ' ' + notification.message}</p>
          <p>{formattedDate}</p>
        </div>
      </Link>
    </>
  );
};

export default Notification;
