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

    hideLoader();
  }, [uid]);

  return (
    <section className="list-section">
      <h1>Friends</h1>
      <div className="list-container">{friends && friends.map((friend) => <UserCard key={friend} user={friend} />)}</div>
    </section>
  );
};

export default Friends;
