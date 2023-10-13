import {Link} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useEffect, useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';

const UserList = () => {
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [users, setUsers] = useState([]);

  // fetch all users from firestore
  useEffect(() => {
    const fetchUsers = async () => {
      showLoader();
      try {
        const querySnapshot = await db.collection('users').orderBy('lastName').get();
        const data = querySnapshot.docs.map((doc) => doc.data());
        // filter out current user
        const filteredData = data.filter((user) => user.uid !== currentUser.uid);
        setUsers(filteredData);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };
    fetchUsers();
  }, []);

  return (
    <ul className="users-list">
      {users &&
        users.map((user) => (
          <Link to={`/messages/${user.uid}`} className="users-list-item" key={user.photoURL}>
            <img src={user.photoURL} alt={user.firstName} />
            <h3>{user.lastName + ' ' + user.firstName}</h3>
          </Link>
        ))}
    </ul>
  );
};

export default UserList;
