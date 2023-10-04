import profile from '../../assets/icons/user-solid.svg';

const Notification = ({notification}) => {
  // Convert Firestore Timestamp to JavaScript Date
  const createdAtDate = notification.createdAt.toDate();

  // Format the date components
  const year = createdAtDate.getFullYear();
  const month = String(createdAtDate.getMonth() + 1).padStart(2, '0');
  const day = String(createdAtDate.getDate()).padStart(2, '0');
  const hours = String(createdAtDate.getHours()).padStart(2, '0');
  const minutes = String(createdAtDate.getMinutes()).padStart(2, '0');
  const seconds = String(createdAtDate.getSeconds()).padStart(2, '0');

  // Create the formatted date string
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return (
    <>
      <article className="notification-item">
        <div className="notification-remove">&times;</div>
        <img className="notification-img" src={notification.photoURL === 'default' ? profile : notification.photoURL} alt=""></img>
        <p>{notification.message}</p>
        <p>{formattedDate}</p>
      </article>
    </>
  );
};

export default Notification;
