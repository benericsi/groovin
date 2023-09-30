import '../assets/css/user-card.css';

import {Link} from 'react-router-dom';
import {db} from '../setup/Firebase';
import {useLoader} from '../hooks/useLoader';
import {useToast} from '../hooks/useToast';
import {useEffect, useState} from 'react';

const UserCard = ({user}) => {
  const [userData, setUserData] = useState({});
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    showLoader();

    const fetchUserData = async () => {
      try {
        if (user === '') {
          addToast('info', 'There are no followers yet.');
          hideLoader();
          return;
        }
        const userDoc = await db.collection('users').doc(user).get();

        if (!userDoc.exists) {
          hideLoader();
          return;
        } else {
          setUserData(userDoc.data());
          hideLoader();
        }
      } catch (error) {
        addToast('error', error.message);
        hideLoader();
      }
    };

    fetchUserData();
  }, [user]);

  return user === '' ? null : (
    <Link to={`/account/${user}`} className="user-card">
      <div className="user-card-photo">
        <img src={userData.photoURL} alt="User" />
      </div>
      <div className="user-card-name">{userData.firstName + ' ' + userData.lastName}</div>
      <span className="user-card-role">{userData.role}</span>
    </Link>
  );
};

export default UserCard;
