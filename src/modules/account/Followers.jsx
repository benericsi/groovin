import UserCard from '../../common/UserCard';
import {useAuth} from '../../hooks/useAuth';
import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';

const Followers = ({uid}) => {
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [userData, setUserData] = useState({});

  useEffect(() => {
    showLoader();

    const fetchUserData = async () => {
      try {
        const querySnapshot = await db.collection('users').get();
        querySnapshot.forEach((doc) => {
          if (doc.data().uid === uid) {
            setUserData(doc.data());
            hideLoader();
          }
        });
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
      }
    };

    fetchUserData();
  }, [uid]);

  return (
    <section className="list-section">
      <h1>Followers</h1>
      <div className="list-container">
        <UserCard user={userData} />
        <UserCard user={userData} />
        <UserCard user={userData} />
        <UserCard user={userData} />
        <UserCard user={userData} />
        <UserCard user={userData} />
        <UserCard user={userData} />
      </div>
    </section>
  );
};

export default Followers;
