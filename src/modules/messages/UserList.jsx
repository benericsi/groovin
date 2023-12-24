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

  const [friends, setFriends] = useState(null);
  const [others, setOthers] = useState(null);

  useEffect(() => {
    const fetchUserList = async () => {
      showLoader();
      try {
        const friendsRef = db.collection('friends');

        const friendsSnapshot = await friendsRef.where('user1', '==', currentUser.uid).get();
        const friendIds = friendsSnapshot.docs.map((doc) => doc.data().user2);
        const friendsData = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendRef = db.collection('users').doc(friendId);
            const friendSnapshot = await friendRef.get();
            return {...friendSnapshot.data(), uid: friendSnapshot.id};
          })
        );

        const friendsSnapshotReverse = await friendsRef.where('user2', '==', currentUser.uid).get();
        const friendsIdReverse = friendsSnapshotReverse.docs.map((doc) => doc.data().user1);
        const friendsDataReverse = await Promise.all(
          friendsIdReverse.map(async (friendId) => {
            const friendRef = db.collection('users').doc(friendId);
            const friendSnapshot = await friendRef.get();
            return {...friendSnapshot.data(), uid: friendSnapshot.id};
          })
        );

        const allFriendIds = [...friendIds, ...friendsIdReverse];
        const allFriends = [...friendsData, ...friendsDataReverse];
        const sortedFriends = allFriends.sort((a, b) => a.lastName.localeCompare(b.lastName));
        setFriends(sortedFriends);

        const allUsersRef = db.collection('users');
        const allUsersSnapshot = await allUsersRef.get();

        const allUsersData = allUsersSnapshot.docs.filter((doc) => doc.id !== currentUser.uid && !allFriendIds.includes(doc.id)).map((doc) => ({...doc.data(), uid: doc.id}));
        const sortedOthers = allUsersData.sort((a, b) => a.lastName.localeCompare(b.lastName));
        setOthers(sortedOthers);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    fetchUserList();
  }, []);

  return (
    <div className="user-list-container">
      <h2>Friends</h2>
      {friends !== null && friends.length == 0 && <h4 className="text-empty">No friends yet.</h4>}
      <ul className="user-list">
        {friends &&
          friends.map((friend) => (
            <NavLink to={`/profile/${currentUser.uid}/messages/${friend.uid}`} className="user-list-item" key={friend.uid}>
              <img src={friend.photoURL} alt={friend.firstName} />
              <h4>{friend.lastName + ' ' + friend.firstName}</h4>
            </NavLink>
          ))}
      </ul>

      <h2>Others</h2>
      {others !== null && others.length == 0 && <h4 className="text-empty">No other users.</h4>}
      <ul className="user-list">
        {others &&
          others.map((user) => (
            <NavLink to={`/profile/${currentUser.uid}/messages/${user.uid}`} className="user-list-item" key={user.uid}>
              <img src={user.photoURL} alt={user.firstName} />
              <h4>{user.lastName + ' ' + user.firstName}</h4>
            </NavLink>
          ))}
      </ul>
    </div>
  );
};

export default UserList;
