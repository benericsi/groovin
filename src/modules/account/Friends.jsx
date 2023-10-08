import UserCard from '../../common/UserCard';
import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';

const Friends = ({uid}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    showLoader();

    const fetchFriendList = async () => {
      try {
        const friendsDoc = await db.collection('friends').doc(uid).get();

        if (!friendsDoc.exists) {
          addToast('info', 'There are no friends yet.');
          hideLoader();
          return;
        } else if (friendsDoc.data().friendList.length === 0) {
          addToast('info', 'There are no friends yet.');
          hideLoader();
          return;
        } else {
          setFriends(friendsDoc.data().friendList);
          hideLoader();
        }
      } catch (error) {
        addToast('error', error.message);
        hideLoader();
      }
    };

    fetchFriendList();
  }, [uid]);

  return (
    <section className="list-section">
      <h1>Friends</h1>
      <div className="list-container">{friends && friends.map((friend) => <UserCard key={friend} user={friend} />)}</div>
    </section>
  );
};

export default Friends;
