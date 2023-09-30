import UserCard from '../../common/UserCard';
import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';

const Following = ({uid}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const [follows, setFollows] = useState([]);

  useEffect(() => {
    showLoader();

    const fetchFollowingIds = async () => {
      try {
        const followingDoc = await db.collection('follows').doc(uid).get();

        if (!followingDoc.exists || followingDoc.data().following.length === 0) {
          addToast('info', 'There are no follows yet.');
          hideLoader();
          return;
        } else {
          setFollows(followingDoc.data().following);
          hideLoader();
        }
      } catch (error) {
        addToast('error', error.message);
        hideLoader();
      }
    };

    fetchFollowingIds();
  }, [uid]);

  return (
    <section className="list-section">
      <h1>Follows</h1>
      <div className="list-container">
        {follows.map((follow) => (
          <UserCard key={follow} user={follow} />
        ))}
      </div>
    </section>
  );
};

export default Following;
