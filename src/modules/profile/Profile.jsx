import '../../assets/css/profile.css';

import Button from '../../ui/Button';
import Input from '../../ui/Input';
import PopUp from '../../common/PopUp';

import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {Outlet, useParams, NavLink, useLocation, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {db, storage} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';

import {RiAccountCircleFill} from 'react-icons/ri';
import {BiEdit} from 'react-icons/bi';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {BiUserPlus, BiUserMinus} from 'react-icons/bi';
import {MdOutlineCancel} from 'react-icons/md';

const Profile = () => {
  const {uid} = useParams();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();
  const navigate = useNavigate();
  const location = useLocation().pathname;

  const isOwnProfile = currentUser.uid === uid;
  const [userData, setUserData] = useState(null);

  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [inputName, setInputName] = useState(currentUser.displayName);
  const [inputPhoto, setInputPhoto] = useState(null);

  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    const getUserByUid = async () => {
      showLoader();
      try {
        const unsubscribe = db
          .collection('users')
          .doc(uid)
          .onSnapshot((doc) => {
            if (doc.exists) {
              setUserData(doc.data());
              setInputName(doc.data().displayName);
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

    const getFriendStatus = async () => {
      showLoader();
      try {
        const unsubscribe = db
          .collection('requests')
          .where('sender', 'in', [currentUser.uid, uid])
          .where('receiver', 'in', [currentUser.uid, uid])
          .where('status', '==', 'accepted')
          .onSnapshot((doc) => {
            if (doc.empty) {
              setFriendStatus('not-friends');
            } else {
              doc.forEach((doc) => {
                if (doc.data().status === 'pending') {
                  setFriendStatus('pending');
                } else if (doc.data().status === 'accepted') {
                  setFriendStatus('accepted');
                }
              });
            }
          });

        return unsubscribe;
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getUserByUid();
    if (!isOwnProfile) {
      getFriendStatus();
    }
  }, [uid]);

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const handleModifyUser = async (e) => {
    e.preventDefault();
    // Prevent user from changing their name to an empty string
    if (inputName === '') {
      setInputName(userData.displayName);
      addToast('error', 'Name cannot be empty!');
      return;
    }

    try {
      showLoader();
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`profile-images/${uid}`);

      if (!inputPhoto) {
        // Prevent user from changing photo
        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: inputName.split(' ')[0],
            lastName: inputName.split(' ')[1],
            displayName: inputName,
          });

        currentUser.updateProfile({
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
          displayName: inputName,
        });

        addToast('success', 'Credentials successfully saved!');
        togglePopUp();
      } else {
        await fileRef.put(inputPhoto);
        const imageUrl = await fileRef.getDownloadURL();

        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: inputName.split(' ')[0],
            lastName: inputName.split(' ')[1],
            displayName: inputName,
            photoURL: inputPhoto ? imageUrl : 'default',
          });

        currentUser.updateProfile({
          firstName: inputName.split(' ')[0],
          lastName: inputName.split(' ')[1],
          displayName: inputName,
          photoURL: inputPhoto ? imageUrl : 'default',
        });

        addToast('success', 'Credentials successfully saved!');
        togglePopUp();
      }
    } catch (error) {
      addToast('error', error.message);
      return;
    } finally {
      hideLoader();
    }
  };

  const handleFriendAction = async (e) => {
    e.preventDefault();

    switch (friendStatus) {
      case 'not-friends': {
        showLoader();
        try {
          const friendRequestRef = db.collection('requests');
          const friendRequest = {
            sender: currentUser.uid,
            receiver: uid,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          };

          // Check if friend request already exists
          const friendRequestDoc = await friendRequestRef.where('sender', '==', currentUser.uid).where('receiver', '==', uid).where('status', '==', 'pending').get();
          if (!friendRequestDoc.empty) {
            addToast('error', 'Friend request already sent!');
            return;
          }

          // Check if the user already sent a friend request
          const friendRequestDoc2 = await friendRequestRef.where('sender', '==', uid).where('receiver', '==', currentUser.uid).where('status', '==', 'pending').get();
          if (!friendRequestDoc2.empty) {
            addToast('info', 'You already have a friend request from this user. See your requests page!');
            navigate(`/profile/${currentUser.uid}/requests`);
            return;
          }

          await friendRequestRef.add(friendRequest);
          addToast('success', 'Friend request sent!');
          setFriendStatus('pending');
        } catch (error) {
          addToast('error', error.message);
        } finally {
          hideLoader();
        }

        break;
      }

      case 'pending': {
        showLoader();
        try {
          const friendRequestRef = db.collection('requests');
          const friendRequestDoc = await friendRequestRef.where('sender', '==', currentUser.uid).where('receiver', '==', uid).where('status', '==', 'pending').get();

          friendRequestDoc.forEach((doc) => {
            doc.ref.delete();
          });

          addToast('success', 'Friend request cancelled!');
          setFriendStatus('not-friends');
        } catch (error) {
          addToast('error', error.message);
        } finally {
          hideLoader();
        }

        break;
      }

      case 'accepted': {
        showLoader();
        try {
          const friendRequestRef = db.collection('requests');
          const friendRequestDoc = await friendRequestRef.where('sender', 'in', [currentUser.uid, uid]).where('receiver', 'in', [currentUser.uid, uid]).where('status', '==', 'accepted').get();

          friendRequestDoc.forEach((doc) => {
            doc.ref.delete();
          });

          await db
            .collection('users')
            .doc(currentUser.uid)
            .update({
              friends: firebase.firestore.FieldValue.arrayRemove(uid),
            });

          await db
            .collection('users')
            .doc(uid)
            .update({
              friends: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
            });

          addToast('success', 'Friend removed.');
          setFriendStatus('not-friends');
        } catch (error) {
          addToast('error', error.message);
        } finally {
          hideLoader();
        }
        break;
      }
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
          <input type="file" accept="image/*" onChange={(e) => setInputPhoto(e.target.files[0])} className="input-field light" />
          <Button type="button" text="Save" className="dark" onClick={handleModifyUser} />
        </PopUp>
      )}
      {userData && (
        <div className="user-header">
          <div className="header-pre">
            <div className="user-background"></div>
          </div>
          <div className="user-profile-details">
            <div className="user-profile-image">
              {userData.photoURL !== 'default' ? <img src={userData.photoURL} alt="" /> : <RiAccountCircleFill className="default-photo" />}
              {isOwnProfile ? (
                <div className="story">
                  <AiOutlinePlusCircle />
                  <span>Add to story</span>
                </div>
              ) : null}
            </div>
            <div className="user-profile-actions">
              <span className="user-profile-name">{userData.displayName}</span>
              {isOwnProfile ? (
                <button className="user-profile-edit" onClick={togglePopUp}>
                  <BiEdit /> Edit Profile
                </button>
              ) : (
                <button className="friend-action" onClick={handleFriendAction}>
                  {friendStatus === 'not-friends' ? (
                    <>
                      <BiUserPlus />
                      Add Friend
                    </>
                  ) : friendStatus === 'pending' ? (
                    <>
                      <MdOutlineCancel />
                      Cancel Request
                    </>
                  ) : friendStatus === 'accepted' ? (
                    <>
                      <BiUserMinus />
                      Remove Friend
                    </>
                  ) : null}
                </button>
              )}
            </div>
          </div>
          <nav className="user-nav">
            <ul className="user-nav-list">
              <li className="user-nav-list-item">
                <NavLink to={`/profile/${uid}`} className={`user-nav-link ${location === `/profile/${uid}` ? 'active' : 'inactive'}`}>
                  Profile
                </NavLink>
              </li>
              <li className="user-nav-list-item">
                <NavLink to={`/profile/${uid}/friends`} className={`user-nav-link ${location === `/profile/${uid}/friends` ? 'active' : 'inactive'}`}>
                  Friends {userData.friends.length}
                </NavLink>
              </li>
              {isOwnProfile ? (
                <>
                  <li className="user-nav-list-item">
                    <NavLink to={`/profile/${uid}/requests`} className={`user-nav-link ${location === `/profile/${uid}/requests` ? 'active' : 'inactive'}`}>
                      Requests
                    </NavLink>
                  </li>
                  <li className="user-nav-list-item">
                    <NavLink to={`/profile/${uid}/messages`} className={`user-nav-link ${location === `/profile/${uid}/messages` ? 'active' : 'inactive'}`}>
                      Messages
                    </NavLink>
                  </li>
                  <li className="user-nav-list-item">
                    <NavLink to={`/profile/${uid}/notifications`} className={`user-nav-link ${location === `/profile/${uid}/notifications` ? 'active' : 'inactive'}`}>
                      Notifications
                    </NavLink>
                  </li>
                </>
              ) : null}
              <li className="user-nav-list-item"></li>
            </ul>
          </nav>
        </div>
      )}

      <div className="user-body">
        <Outlet context={[uid, isOwnProfile]} />
      </div>
    </>
  );
};

export default Profile;
