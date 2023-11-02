import '../../assets/css/friends.css';

import {useOutletContext, Link} from 'react-router-dom';
import {useTitle} from '../../hooks/useTitle';
import {useEffect, useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';

const Friends = () => {
  useTitle('Friends');
  const [uid] = useOutletContext();

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const getFriendsByUid = () => {
      showLoader();
      try {
        db.collection('users')
          .where('friends', 'array-contains', uid)
          .onSnapshot((snapshot) => {
            const friends = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setFriends(friends);
          });
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getFriendsByUid();
  }, [uid]);

  return (
    <section className="friends-section">
      {friends.length === 0 && <h2>There are no friends yet.</h2>}
      <div className="friends-container">
        {friends &&
          friends.map((friend) => (
            <Link to={`/profile/${friend.id}`} className="friend-card" key={friend.id}>
              <div className="friend-card-photo">{friend.photoURL !== 'default' ? <img src={friend.photoURL} alt="" /> : ''}</div>
              <div className="friend-card-name">{friend.displayName}</div>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default Friends;
