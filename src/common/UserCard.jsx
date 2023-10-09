import '../assets/css/user-card.css';

import {Link} from 'react-router-dom';
import {db} from '../setup/Firebase';
import {useLoader} from '../hooks/useLoader';
import {useToast} from '../hooks/useToast';
import {useEffect, useState} from 'react';

import profile from '../assets/icons/user-solid.svg';

const UserCard = ({user}) => {
  const [userData, setUserData] = useState({});
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      showLoader();
      try {
        if (user === '') {
          addToast('info', 'There are no users yet.');
          return;
        }
        const userDoc = await db.collection('users').doc(user).get();

        if (!userDoc.exists) {
          return;
        } else {
          setUserData(userDoc.data());
        }
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    fetchUserData();
  }, [user]);

  return user === '' ? null : (
    <Link to={`/account/${user}`} className="user-card">
      <div className="user-card-photo">
        <img src={userData.photoURL == 'default' ? profile : userData.photoURL} className={userData.photoURL == 'default' ? 'default' : ''} />
      </div>
      <div className="user-card-name">{userData.firstName + ' ' + userData.lastName}</div>
      <span className="user-card-role">{userData.role}</span>
    </Link>
  );
};

export default UserCard;
