import '../../assets/css/friends.css';

import {Link, useOutletContext} from 'react-router-dom';
import {useTitle} from '../../hooks/useTitle';
import {useEffect, useState} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';

const Friends = () => {
  useTitle('Friends');
  const {uid} = useOutletContext();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [friends, setFriends] = useState(null);

  useEffect(() => {
    // Get the other id from a friends collection document where the uid is the user1 or user2 and then get the user document for that id using onSnapshot
    showLoader();
    const unsubscribe = db
      .collection('friends')
      .where('user1', '==', uid)
      .onSnapshot(
        (snapshot) => {
          const friends = snapshot.docs.map((doc) => doc.data().user2);
          db.collection('friends')
            .where('user2', '==', uid)
            .onSnapshot(
              (snapshot) => {
                const friends2 = snapshot.docs.map((doc) => doc.data().user1);
                const friendsCombined = [...friends, ...friends2];
                if (friendsCombined.length === 0) {
                  setFriends([]);
                  hideLoader();
                  return;
                }

                db.collection('users')
                  .where(firebase.firestore.FieldPath.documentId(), 'in', friendsCombined)
                  .onSnapshot(
                    (snapshot) => {
                      const friends = snapshot.docs.map((doc) => {
                        return {
                          id: doc.id,
                          ...doc.data(),
                        };
                      });
                      setFriends(friends);
                      hideLoader();
                    },
                    (error) => {
                      addToast('error', error.message);
                      hideLoader();
                    }
                  );
              },
              (error) => {
                addToast('error', error.message);
                hideLoader();
              }
            );
        },
        (error) => {
          addToast('error', error.message);
          hideLoader();
        }
      );

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return (
    <section className="friends-section">
      {friends !== null && friends.length === 0 && <h2>There are no friends yet.</h2>}
      <div className="friends-container">
        {friends &&
          friends.map((friend, index) => (
            <Link to={`/profile/${friend.id}`} className="friend-card" key={index}>
              <div className="friend-card-photo">{friend.photoURL !== 'default' ? <img src={friend.photoURL} alt="" /> : ''}</div>
              <div className="friend-card-name">{friend.displayName}</div>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default Friends;
