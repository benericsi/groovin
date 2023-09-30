import '../../assets/css/account.css';

import editPen from '../../assets/icons/pen-solid.svg';
import profile from '../../assets/icons/user-solid.svg';

import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {db} from '../../setup/Firebase';
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
  const [followingCount, setFollowingCount] = useState(0);
  const [isPopUpActive, setIsPopUpActive] = useState(false);

  const [inputPhoto, setInputPhoto] = useState();
  const [inputName, setInputName] = useState();

  const [isFollowed, setIsFollowed] = useState(false);
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

    const getFollowingCount = async () => {
      showLoader();

      try {
        const querySnapshot = await db.collection('follows').doc(uid).get();
        if (!querySnapshot.exists) {
          hideLoader();
          return;
        }
        setFollowingCount(querySnapshot.data().following.length);
        hideLoader();
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
      }
    };

    const getIsFollowed = async () => {
      showLoader();

      try {
        const querySnapshot = await db.collection('followers').doc(uid).get();
        if (!querySnapshot.exists) {
          hideLoader();
          return;
        }
        const followers = querySnapshot.data().followers;
        const isFollowed = followers.includes(currentUser.uid);
        setIsFollowed(isFollowed);
        hideLoader();
      } catch (error) {
        hideLoader();
        addToast('error', error.message);
      }
    };

    fetchUserData();
    getFollowerCount();
    getFollowingCount();
    getIsFollowed();
  }, [uid, isFollowed]);

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const handleModifyUser = async () => {
    showLoader();

    try {
      await db
        .collection('users')
        .doc(uid)
        .update({
          photoURL: inputPhoto == '' ? 'default' : inputPhoto,
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
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

  const handleFollow = (currentUserId, userToFollowId, isCurrentlyFollowed) => async () => {
    showLoader();

    try {
      if (isCurrentlyFollowed) {
        await db
          .collection('followers')
          .doc(userToFollowId)
          .update({
            followers: firebase.firestore.FieldValue.arrayRemove(currentUserId),
          });

        await db
          .collection('follows')
          .doc(currentUserId)
          .update({
            following: firebase.firestore.FieldValue.arrayRemove(userToFollowId),
          });

        //send notification
        await db
          .collection('notifications')
          .doc(userToFollowId)
          .collection('userNotifications')
          .add({
            type: 'follow',
            message: `${currentUser.displayName} stopped following you.`,
            sender: currentUserId,
            photoURL: currentUser.photoURL,
            name: currentUser.displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

        setIsFollowed(false);
        hideLoader();
      } else {
        await db
          .collection('followers')
          .doc(userToFollowId)
          .update({
            followers: firebase.firestore.FieldValue.arrayUnion(currentUserId),
          });

        await db
          .collection('follows')
          .doc(currentUserId)
          .update({
            following: firebase.firestore.FieldValue.arrayUnion(userToFollowId),
          });

        //send notification
        await db
          .collection('notifications')
          .doc(userToFollowId)
          .collection('userNotifications')
          .add({
            type: 'follow',
            message: `${currentUser.displayName} started following you.`,
            sender: currentUserId,
            photoURL: currentUser.photoURL,
            name: currentUser.displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

        setIsFollowed(true);
        hideLoader();
      }
    } catch (error) {
      hideLoader();
      addToast('error', error.message);
    }
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
          <Input
            type="text"
            value={inputPhoto}
            label="Photo URL"
            onChange={(value) => {
              setInputPhoto(value);
            }}
            className="input-field"
          />
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
            28 public playlist - <Link to={`/account/${uid}/followers`}>{followerCount} followers</Link> - <Link to={`/account/${uid}/following`}> {followingCount} follows</Link>
          </span>
        </div>
      </CommonHeader>
      <CommonBody>
        {!isOwnProfile ? (
          <div className="btn-user-action-container">
            <Button type="button" text={isFollowed ? 'Unfollow' : 'Follow'} className="btn-light btn-user-action" onClick={handleFollow(currentUser.uid, uid, isFollowed)} />
            <Button type="button" text="Message" className="btn-light btn-user-action" />
          </div>
        ) : null}
      </CommonBody>
    </>
  );
};

export default Account;
