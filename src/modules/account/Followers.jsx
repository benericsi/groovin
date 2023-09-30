import UserCard from '../../common/UserCard';
import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';

const Followers = ({uid}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    showLoader();

    const fetchFollowerIds = async () => {
      try {
        const followerDoc = await db.collection('followers').doc(uid).get();

        if (!followerDoc.exists) {
          addToast('info', 'There are no followers yet.');
          hideLoader();
          return;
        } else {
          setFollowers(followerDoc.data().followers);
          hideLoader();
        }
      } catch (error) {
        addToast('error', error.message);
        hideLoader();
      }
    };

    fetchFollowerIds();
  }, [uid]);

  return (
    <section className="list-section">
      <h1>Followers</h1>
      <div className="list-container">
        {followers.map((follower) => (
          <UserCard key={follower} user={follower} />
        ))}
      </div>
    </section>
  );
};

export default Followers;
