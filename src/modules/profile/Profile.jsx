import '../../assets/css/profile.css';

import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {db, storage} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {Outlet, useNavigate} from 'react-router-dom';
import firebase from 'firebase/compat/app';

import FriendButton from './FriendButton';
import PopUp from '../../common/PopUp';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

import {RiAccountCircleFill} from 'react-icons/ri';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {BiEdit} from 'react-icons/bi';
import ProfileSubNav from './ProfileSubNav';

const Profile = () => {
  const navigate = useNavigate();

  const {uid} = useParams();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputPhoto, setInputPhoto] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    setIsOwnProfile(uid === currentUser.uid);
  }, [uid, currentUser]);

  useEffect(() => {
    // get user data real time with unsubscribe
    const unsubscribe = db
      .collection('users')
      .doc(uid)
      .onSnapshot((snapshot) => {
        setUserData(snapshot.data());
        setInputName(snapshot.data().displayName);

        if (snapshot.id === currentUser.uid) {
          currentUser.updateProfile({
            firstName: snapshot.data().firstName,
            lastName: snapshot.data().lastName,
            displayName: snapshot.data().displayName,
            photoURL: snapshot.data().photoURL,
          });
        }
      });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    const requestRef = db.collection('requests');
    // Check if there's a friend request between the current user and the user being viewed
    const unsubscribe = requestRef
      .where('sender', '==', currentUser.uid)
      .where('receiver', '==', uid)
      .where('status', '==', 'pending')
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          setFriendStatus('pending');
        } else {
          // Listen for accepted requests
          requestRef
            .where('sender', 'in', [currentUser.uid, uid])
            .where('receiver', 'in', [currentUser.uid, uid])
            .where('status', '==', 'accepted')
            .onSnapshot((snapshot) => {
              if (!snapshot.empty) {
                setFriendStatus('friends');
              } else {
                setFriendStatus('none');
              }
            });
        }
      });

    return () => {
      unsubscribe();
    };
  }, [currentUser.uid, uid]);

  const onFriendButtonClick = async () => {
    switch (friendStatus) {
      case 'none': {
        // Check if the user already sent you a friend request
        const isRequestRecieved = await db.collection('requests').where('sender', '==', uid).where('receiver', '==', currentUser.uid).where('status', '==', 'pending').get();
        if (!isRequestRecieved.empty) {
          addToast('info', 'You already have a friend request from this user. See your requests page!');
          navigate(`/profile/${currentUser.uid}/requests`);
          return;
        }

        db.collection('requests')
          .add({
            sender: currentUser.uid,
            senderName: currentUser.displayName,
            senderPhoto: currentUser.photoURL,
            receiver: uid,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            addToast('success', 'Friend request sent!');

            // Send notification to the user
            db.collection('notifications').add({
              sender: currentUser.uid,
              senderName: currentUser.displayName,
              senderPhoto: currentUser.photoURL,
              receiver: uid,
              type: 'New Friend Request',
              message: `${currentUser.displayName} sent you a friend request!`,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
          })
          .catch((error) => {
            addToast('error', error.message);
          });
        break;
      }

      case 'pending': {
        db.collection('requests')
          .where('sender', '==', currentUser.uid)
          .where('receiver', '==', uid)
          .where('status', '==', 'pending')
          .get()
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              doc.ref.delete();
            });
          })
          .then(() => {
            addToast('success', 'Friend request cancelled!');

            // Delete notification
            db.collection('notifications')
              .where('sender', '==', currentUser.uid)
              .where('receiver', '==', uid)
              .where('type', '==', 'New Friend Request')
              .get()
              .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                  doc.ref.delete();
                });
              });
          })
          .catch((error) => {
            addToast('error', error.message);
          });
        break;
      }

      case 'friends': {
        db.collection('requests')
          .where('sender', 'in', [currentUser.uid, uid])
          .where('receiver', 'in', [currentUser.uid, uid])
          .where('status', '==', 'accepted')
          .get()
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              doc.ref.delete();
            });
          })
          .then(() => {
            addToast('success', 'Friend removed!');

            // Send notification to the user
            db.collection('notifications').add({
              sender: currentUser.uid,
              senderName: currentUser.displayName,
              senderPhoto: currentUser.photoURL,
              receiver: uid,
              type: 'Friend Removed',
              message: `${currentUser.displayName} removed you from their friend list!`,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
          })
          .catch((error) => {
            addToast('error', error.message);
          });

        db.collection('friends')
          .where('user1', 'in', [currentUser.uid, uid])
          .where('user2', 'in', [currentUser.uid, uid])
          .get()
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              doc.ref.delete();
            });
          });

        break;
      }
    }
  };

  const acceptRequest = async (e, request) => {
    e.preventDefault();

    try {
      showLoader();

      // Update requuest status to accepted
      await db.collection('requests').doc(request.id).update({
        status: 'accepted',
      });

      // Create friend relationship
      await db.collection('friends').add({
        user1: request.sender,
        user2: request.receiver,
      });

      // Send notification to the user
      db.collection('notifications').add({
        sender: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        receiver: request.sender,
        type: 'Friend Request Accepted',
        message: `${currentUser.displayName} accepted your friend request!`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      addToast('success', 'Friend request accepted!');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const declineRequest = async (e, request) => {
    e.preventDefault();

    try {
      showLoader();
      await db.collection('requests').doc(request.id).delete();

      // Send notification to the user
      db.collection('notifications').add({
        sender: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        receiver: request.sender,
        type: 'Friend Request Declined',
        message: `${currentUser.displayName} declined your friend request!`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      addToast('success', 'Friend request declined!');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

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
      const fileRef = storageRef.child(`profile-pictures/${uid}`);

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
          <Button type="button" text="Save" className="dark" onClick={(e) => handleModifyUser(e)} />
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
                <button className="user-profile-edit" onClick={() => togglePopUp()}>
                  <BiEdit /> Edit Profile
                </button>
              ) : (
                <FriendButton friendStatus={friendStatus} onFriendButtonClick={onFriendButtonClick} />
              )}
            </div>
          </div>

          <ProfileSubNav uid={uid} isOwnProfile={isOwnProfile} />
        </div>
      )}

      <div className="user-body">
        <Outlet context={{uid, acceptRequest, declineRequest, isOwnProfile}} />
      </div>
    </>
  );
};

export default Profile;
