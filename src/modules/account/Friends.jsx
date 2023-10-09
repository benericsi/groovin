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

        setFriends(friendsDoc.data().friendList);
        hideLoader();
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
      {friends.length === 0 && <h2 className="no-data">There are no friends yet.</h2>}
      <div className="list-container">{friends && friends.map((friend) => <UserCard key={friend} user={friend} />)}</div>
    </section>
  );
};

export default Friends;
