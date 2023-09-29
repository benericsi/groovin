import '../assets/css/user-card.css';

import {Link} from 'react-router-dom';

const UserCard = ({user}) => {
  //console.log(user);

  return (
    <Link to={`/account/${user.uid}`} className="user-card">
      <div className="user-card-photo">
        <img src={user.photoURL} alt="User" />
      </div>
      <div className="user-card-name">{user.firstName + ' ' + user.lastName}</div>
      <span className="user-card-role">{user.role}</span>
    </Link>
  );
};

export default UserCard;
