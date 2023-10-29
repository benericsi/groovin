import '../../assets/css/profile.css';

import {useTitle} from '../../hooks/useTitle';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {db} from '../../setup/Firebase';

import {RiAccountCircleFill} from 'react-icons/ri';

const Profile = () => {
  useTitle('Profile');
  const {uid} = useParams();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const isOwnProfile = currentUser.uid === uid;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserByUid = async (uid) => {
      try {
        showLoader();
        const unsubscribe = db
          .collection('users')
          .doc(uid)
          .onSnapshot((doc) => {
            if (doc.exists) {
              setUserData(doc.data());
            } else {
              addToast('error', 'User was not found.');
              setUserData(null);
            }
          });

        return unsubscribe;
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getUserByUid(uid);
  }, [uid]);

  return (
    <>
      {userData && (
        <div className="user-header">
          <div className="header-pre">
            <div className="user-background"></div>
          </div>
          <div className="user-profile-details">
            <div className="user-profile-image">{userData.photoURL != 'default' ? <img src={userData.photoURL} alt="" /> : <RiAccountCircleFill className="default-photo" />}</div>
            <div className="user-profile-actions">
              <span className="user-profile-name">{userData.displayName}</span>
              <span className="user-profile-edit">{userData.email}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
