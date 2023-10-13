import {NavLink} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useEffect, useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';

const UserList = () => {
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [friends, setFriends] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    const fetchFriendIds = async () => {
      showLoader();
      try {
        // Get friend ids
        const doc = await db.collection('friends').doc(currentUser.uid).get();
        const data = doc.data();

        // Get friend data
        const users = [];
        const doc2 = await db.collection('users').orderBy('lastName').get();
        doc2.forEach((user) => {
          if (data.friendList.includes(user.id)) {
            users.push(user.data());
          }
        });
        setFriends(users);

        // Get other users
        const others = [];
        const doc3 = await db.collection('users').orderBy('lastName').get();
        doc3.forEach((other) => {
          if (!data.friendList.includes(other.id) && other.id !== currentUser.uid) {
            others.push(other.data());
          }
        });
        setOtherUsers(others);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    fetchFriendIds();
  }, []);

  return (
    <aside className="users-list-container">
      <h2>Friends</h2>
      {friends.length > 0 ? (
        <>
          <ul className="users-list">
            {friends &&
              friends.map((friend) => (
                <NavLink to={`/messages/${friend.uid}`} className="users-list-item" key={friend.uid}>
                  <img src={friend.photoURL} alt={friend.firstName} />
                  <h4>{friend.lastName + ' ' + friend.firstName}</h4>
                </NavLink>
              ))}
          </ul>
        </>
      ) : (
        <p>No friends yet.</p>
      )}
      <h2>Others</h2>
      {otherUsers.length > 0 ? (
        <>
          <ul className="users-list">
            {otherUsers &&
              otherUsers.map((user) => (
                <NavLink to={`/messages/${user.uid}`} className="users-list-item" key={user.uid}>
                  <img src={user.photoURL} alt={user.firstName} />
                  <h4>{user.lastName + ' ' + user.firstName}</h4>
                </NavLink>
              ))}
          </ul>
        </>
      ) : (
        <p>No other users.</p>
      )}
    </aside>
  );
};

export default UserList;
