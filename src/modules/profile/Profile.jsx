import '../../assets/css/profile.css';

import React, {useEffect, useState, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {db, storage} from '../../setup/Firebase';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {useDebounce} from '../../hooks/useDebounce';
import {Outlet, useNavigate} from 'react-router-dom';
import firebase from 'firebase/compat/app';

import FriendButton from './FriendButton';
import Modal from '../../component/Modal';
import Input from '../form/Input';
import Button from '../form/Button';
import Dropzone from '../form/Dropzone';

import {AiOutlinePlusCircle, AiFillEdit} from 'react-icons/ai';
import {BiEdit} from 'react-icons/bi';
import ProfileSubNav from './ProfileSubNav';
import {MdOutlineSaveAlt} from 'react-icons/md';
import {TbCircleOff} from 'react-icons/tb';

const DEFAULT_PHOTO_URL = 'https://firebasestorage.googleapis.com/v0/b/groovin-redesign.appspot.com/o/profile-pictures%2F549507b290b7b3ee0626e5710a354f39.jpg?alt=media&token=e3b32a47-adec-4775-92ba-326f8f619823';

const ModifyProfileForm = ({userData, toggleModal}) => {
  const [name, setName] = useState(userData.displayName);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const {currentUser} = useAuth();
  const {uid} = useParams();

  useDebounce(
    () => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: '',
      }));
    },
    0,
    [name]
  );

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.map((file) => {
      const reader = new FileReader();

      reader.onload = function () {
        setImage(file);
      };

      reader.readAsDataURL(file);
      return file;
    });
  }, []);

  const onDropRejected = (fileRejections) => {
    if (fileRejections[0].errors[0].code === 'file-too-large') {
      addToast('error', 'The file is too large. Maximum size is 1MB.');
    } else {
      addToast('error', 'The file is not an image. Please upload an image file.');
    }
  };

  const onFileDialogCancel = useCallback(() => {
    setImage(null);
  }, []);

  const handleModifyUser = async (e) => {
    e.preventDefault();
    // Prevent user from changing their name to an empty string
    const inputFields = {name};

    const emptyInputs = Object.keys(inputFields).filter((key) => inputFields[key] === '');

    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [input]: 'This field is required.',
        }));
      });

      addToast('error', 'Please fill in all required fields.');
      return;
    }

    if (Object.values(errors).some((x) => x !== '')) {
      addToast('error', 'Please fix all errors before submitting.');
      return;
    }

    try {
      showLoader();
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`profile-pictures/${uid}`);

      if (!image) {
        // Prevent user from changing photo
        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: name.split(' ')[0],
            lastName: name.split(' ')[1],
            displayName: name,
          });

        currentUser.updateProfile({
          firstName: name.split(' ')[0],
          lastName: name.split(' ')[1],
          displayName: name,
        });

        addToast('success', 'Credentials successfully saved!');
        toggleModal();
      } else {
        await fileRef.put(image);
        const imageUrl = await fileRef.getDownloadURL();

        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: name.split(' ')[0],
            lastName: name.split(' ')[1],
            displayName: name,
            photoURL: image ? imageUrl : DEFAULT_PHOTO_URL,
          });

        currentUser.updateProfile({
          firstName: name.split(' ')[0],
          lastName: name.split(' ')[1],
          displayName: name,
          photoURL: image ? imageUrl : DEFAULT_PHOTO_URL,
        });

        addToast('success', 'Credentials successfully saved!');
        toggleModal();
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
      <h1 className="modal_title">
        <AiFillEdit />
        Modify Profile
      </h1>
      <div className="modal_content">
        <form>
          <Input
            type="text"
            value={name}
            label="Full Name *"
            onChange={(value) => {
              setName(value);
            }}
            error={errors.name}
            success={name && !errors.name}
          />
          <Dropzone label="Upload a profile picture by dragging a file here or click to select" onDrop={onDrop} accept={'image/*'} multiple={false} maxFiles={1} maxSize={1048576} onDropRejected={onDropRejected} onFileDialogCancel={onFileDialogCancel} />
        </form>
      </div>
      <div className="modal_actions">
        <Button className="secondary" text="Cancel" onClick={toggleModal}>
          <TbCircleOff />
        </Button>
        <Button className="primary" text="Save" onClick={handleModifyUser}>
          <MdOutlineSaveAlt />
        </Button>
      </div>
    </>
  );
};

const Profile = () => {
  const navigate = useNavigate();

  const {uid} = useParams();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        // setInputName(snapshot.data().displayName);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      default:
        break;
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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      {isOwnProfile && (
        <Modal isOpen={isModalOpen} close={toggleModal}>
          <ModifyProfileForm currentUser={currentUser} userData={userData} toggleModal={toggleModal} />
        </Modal>
      )}
      {userData && (
        <div className="user-header">
          <div className="header-pre">
            <div className="user-background"></div>
          </div>
          <div className="user-profile-details">
            <div className="user-profile-image">
              <img src={userData.photoURL} alt="" />
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
                <button className="user-profile-edit" onClick={toggleModal}>
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
