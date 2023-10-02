import profile from '../../assets/icons/user-solid.svg';

const Notification = ({notification}) => {
  return (
    <>
      <article className="notification-item">
        <div className="notification-remove">&times;</div>
        <img className="notification-img" src={notification.photoURL == 'default' ? profile : notification.photoURL}></img>
      </article>
    </>
  );
};

export default Notification;
