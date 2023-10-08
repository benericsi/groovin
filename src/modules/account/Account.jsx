import '../../assets/css/account.css';

import editPen from '../../assets/icons/pen-solid.svg';
import profile from '../../assets/icons/user-solid.svg';
import ellipsis from '../../assets/icons/ellipsis-solid.svg';

import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db, storage} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {Link} from 'react-router-dom';

import CommonHeader from '../../common/CommonHeader';
import CommonBody from '../../common/CommonBody';
import PopUp from '../../common/PopUp';
import Input from '../../common/Input';
import Button from '../../common/Button';
import {useAuth} from '../../hooks/useAuth';

const Account = ({uid}) => {
  const {currentUser} = useAuth();

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [userData, setUserData] = useState({});
  const [followerCount, setFollowerCount] = useState(0);
  const [isPopUpActive, setIsPopUpActive] = useState(false);

  const [inputPhoto, setInputPhoto] = useState(null);
  const [inputName, setInputName] = useState();

  const [isUserActionsActive, setIsUserActionsActive] = useState(false);
  const isOwnProfile = currentUser.uid === uid;

  useEffect(() => {
    const fetchUserData = async () => {
      showLoader();
      try {
        const querySnapshot = await db.collection('users').doc(uid).get();
        setUserData(querySnapshot.data());
        setInputPhoto(querySnapshot.data().photoURL);
        setInputName(querySnapshot.data().firstName + ' ' + querySnapshot.data().lastName);
        hideLoader();
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
      }
    };

    const getFollowerCount = async () => {
      showLoader();
      try {
        const querySnapshot = await db.collection('followers').doc(uid).get();
        if (!querySnapshot.exists) {
          hideLoader();
          return;
        }
        setFollowerCount(querySnapshot.data().followers.length);
        hideLoader();
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
      }
    };

    fetchUserData();
    getFollowerCount();
  }, [uid]);

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const handleModifyUser = async () => {
    showLoader();

    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`profile-images/${uid}`);
      await fileRef.put(inputPhoto);

      // Get the image URL from Firebase Storage
      const imageUrl = await fileRef.getDownloadURL();

      await db
        .collection('users')
        .doc(uid)
        .update({
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
          photoURL: inputPhoto ? imageUrl : 'default',
        });

      hideLoader();
      addToast('success', 'Credentials successfully saved!');
      togglePopUp();
      window.location.reload();
    } catch (error) {
      hideLoader();
      addToast('error', error.message);
    }
  };

  const toggleUserActions = () => {
    setIsUserActionsActive(!isUserActionsActive);
  };

  return (
    <>
      {isOwnProfile && (
        <PopUp isPopUpActive={isPopUpActive} onClose={togglePopUp}>
          <Input
            type="text"
            value={inputName}
            label="Full Name"
            onChange={(value) => {
              setInputName(value);
            }}
            className="input-field"
          />
          <input type="file" accept="image/*" onChange={(e) => setInputPhoto(e.target.files[0])} className="input-field" />
          <Button type="button" text="Save" className="btn-dark" onClick={handleModifyUser} />
        </PopUp>
      )}
      <CommonHeader>
        <div className="profile-photo">
          <button>
            <img src={userData.photoURL == 'default' ? profile : userData.photoURL} className={userData.photoURL == 'default' ? 'default' : ''} />
          </button>
          {isOwnProfile && (
            <div className="profile-photo-edit" onClick={togglePopUp}>
              <img src={editPen} alt="" />
              <span>Change picture</span>
            </div>
          )}
        </div>
        <div className="profile-info">
          <span className="role">{userData.role}</span>
          <h1 className="name">{userData.firstName + ' ' + userData.lastName}</h1>
          <span className="email">
            28 public playlist -{' '}
            <Link to={`/account/${uid}/friends`}>
              {followerCount} {followerCount > 1 ? 'friends' : 'friend'}
            </Link>
          </span>
        </div>
      </CommonHeader>
      <CommonBody>
        {!isOwnProfile ? (
          <div className="btn-user-action-container">
            <img src={ellipsis} alt="" className="btn-user-action" onClick={toggleUserActions} />
            {isUserActionsActive ? (
              <ul className="user-actions-list">
                <li className="user-actions-item">
                  <button className="btn-user-action">
                    <span>Add friend</span>
                  </button>
                </li>
                <li className="user-actions-item">
                  <button className="btn-user-action">
                    <span>Send message</span>
                  </button>
                </li>
                <li className="user-actions-item">
                  <button className="btn-user-action">
                    <span>Share</span>
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
        ) : null}
      </CommonBody>
    </>
  );
};

export default Account;
