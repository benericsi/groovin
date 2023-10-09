import '../../assets/css/account.css';

import plus from '../../assets/icons/plus-solid.svg';
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
  const [friendCount, setFriendCount] = useState(0);
  const [isPopUpActive, setIsPopUpActive] = useState(false);

  const [inputPhoto, setInputPhoto] = useState(null);
  const [inputName, setInputName] = useState();

  const [isUserActionsActive, setIsUserActionsActive] = useState(false);
  const [friendStatus, setFriendStatus] = useState();
  const [accepotOrDecline, setAccepotOrDecline] = useState(false);
  const isOwnProfile = currentUser.uid === uid;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        showLoader();
        const querySnapshot = await db.collection('users').doc(uid).get();
        setUserData(querySnapshot.data());
        setInputName(querySnapshot.data().firstName + ' ' + querySnapshot.data().lastName);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    const getFriendCount = async () => {
      try {
        showLoader();
        const querySnapshot = await db.collection('friends').doc(uid).get();
        if (!querySnapshot.exists) {
          return;
        }
        setFriendCount(querySnapshot.data().friendList.length);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    const getFriendStatus = async () => {
      try {
        showLoader();
        const querySnapshot = await db.collection('friendRequests').doc(uid).collection('friendRequests').doc(currentUser.uid).get();
        const querySnapshot2 = await db.collection('friendRequests').doc(currentUser.uid).collection('friendRequests').doc(uid).get();

        if (querySnapshot2.exists && querySnapshot2.data().status === 'pending') {
          setAccepotOrDecline(true);
          setFriendStatus('');
          return;
        }

        if (!querySnapshot.exists) {
          setFriendStatus('Add friend');
          return;
        }

        if (querySnapshot.data().status === 'pending') {
          setFriendStatus('Cancel friend request');
          return;
        }

        if (querySnapshot.data().status === 'accepted') {
          setFriendStatus('Remove friend');
          return;
        }
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    fetchUserData();
    getFriendCount();
    getFriendStatus();
  }, [uid, friendCount, friendStatus, accepotOrDecline]);

  const togglePopUp = () => {
    setIsPopUpActive(!isPopUpActive);
  };

  const handleModifyUser = async () => {
    try {
      showLoader();
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`profile-images/${uid}`);
      // Prevent user from changing their name to an empty string
      if (inputName === '') {
        addToast('error', 'Name cannot be empty!');
        return;
      }

      if (!inputPhoto) {
        // Prevent user from changing photo
        await db
          .collection('users')
          .doc(uid)
          .update({
            firstName: inputName.split(' ')[0],
            lastName: inputName.split(' ')[1],
          });

        addToast('success', 'Credentials successfully saved!');
        togglePopUp();
        window.location.reload();
        return;
      }

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

      addToast('success', 'Credentials successfully saved!');
      togglePopUp();
      window.location.reload();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const toggleUserActions = () => {
    setIsUserActionsActive(!isUserActionsActive);
  };

  const handleFriendAction = async () => {
    showLoader();

    switch (friendStatus) {
      case 'Add friend':
        await sendFriendRequest();
        break;
      case 'Cancel friend request':
        await cancelFriendRequest();
        break;
      case 'Remove friend':
        await removeFriend();
        break;
      default:
        break;
    }

    hideLoader();
  };

  const sendFriendRequest = async () => {
    try {
      await db.collection('friendRequests').doc(uid).collection('friendRequests').doc(currentUser.uid).set({
        sender: currentUser.uid,
        receiver: uid,
        status: 'pending',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setFriendStatus('Cancel friend request');

      //notify the receiver
      await db.collection('notifications').doc(uid).collection('notifications').add({
        sender: currentUser.uid,
        receiver: uid,
        type: 'New Friend Request',
        message: 'sent you a friend request!',
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      addToast('success', 'Friend request sent!');
    } catch (error) {
      addToast('error', error.message);
    }
  };

  const cancelFriendRequest = async () => {
    try {
      await db.collection('friendRequests').doc(uid).collection('friendRequests').doc(currentUser.uid).delete();
      setFriendStatus('Add friend');
      addToast('success', 'Friend request cancelled!');

      //remove notification
      const querySnapshot = await db.collection('notifications').doc(uid).collection('notifications').where('sender', '==', currentUser.uid).where('receiver', '==', uid).where('type', '==', 'New Friend Request').get();
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    } catch (error) {
      addToast('error', error.message);
    }
  };

  const removeFriend = async () => {
    try {
      // Remove the friend request from both users
      await db
        .collection('friends')
        .doc(currentUser.uid)
        .update({
          friendList: firebase.firestore.FieldValue.arrayRemove(uid),
        });

      await db
        .collection('friends')
        .doc(uid)
        .update({
          friendList: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        });

      // Remove friend request from both users
      await db.collection('friendRequests').doc(uid).collection('friendRequests').doc(currentUser.uid).delete();
      await db.collection('friendRequests').doc(currentUser.uid).collection('friendRequests').doc(uid).delete();

      // Notify the deleted friend
      await db.collection('notifications').doc(uid).collection('notifications').add({
        sender: currentUser.uid,
        receiver: uid,
        type: 'Friend Removed',
        message: 'removed you from their friend list.',
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setFriendStatus('Add friend');
      addToast('success', 'Friend removed!');
    } catch (error) {
      addToast('error', error.message);
    }
  };

  const acceptFriendRequest = async (e) => {
    e.preventDefault();

    try {
      showLoader();
      // Set the friend request status to accepted
      await db.collection('friendRequests').doc(currentUser.uid).collection('friendRequests').doc(uid).update({
        status: 'accepted',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('friendRequests').doc(uid).collection('friendRequests').doc(currentUser.uid).set({
        sender: uid,
        receiver: currentUser.uid,
        status: 'accepted',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Set the friends collection for both users with arrayUnion
      await db
        .collection('friends')
        .doc(currentUser.uid)
        .update({
          friendList: firebase.firestore.FieldValue.arrayUnion(uid),
        });

      await db
        .collection('friends')
        .doc(uid)
        .update({
          friendList: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
        });

      // Remove the notification from the current user's notifications collection
      await db
        .collection('notifications')
        .doc(currentUser.uid)
        .collection('notifications')
        .where('sender', '==', uid)
        .where('receiver', '==', currentUser.uid)
        .where('type', '==', 'New Friend Request')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      await db.collection('notifications').doc(uid).collection('notifications').add({
        sender: currentUser.uid,
        receiver: uid,
        type: 'Friend Request Accepted',
        message: 'accepted your friend request.',
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setFriendStatus('Remove friend');
      setAccepotOrDecline(false);

      addToast('success', 'Friend request accepted.');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const declineFriendRequest = async (e) => {
    e.preventDefault();

    try {
      showLoader();
      await db.collection('friendRequests').doc(currentUser.uid).collection('friendRequests').doc(uid).delete();

      // Remove the notification from the receiver's notifications collection
      await db
        .collection('notifications')
        .doc(currentUser.uid)
        .collection('notifications')
        .where('sender', '==', uid)
        .where('receiver', '==', currentUser.uid)
        .where('type', '==', 'New Friend Request')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      // Send a notification to the sender
      await db.collection('notifications').doc(uid).collection('notifications').add({
        sender: currentUser.uid,
        receiver: uid,
        type: 'Friend Request Declined',
        message: 'declined your friend request.',
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setFriendStatus('Add friend');
      setAccepotOrDecline(false);

      addToast('success', 'Friend request declined.');
    } catch (error) {
      addToast('error', error.message);
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
            <div className="story">
              <img src={plus} alt="" />
              <span>Add to story</span>
            </div>
          )}
        </div>
        <div className="profile-info">
          <span className="role">
            {userData.role} {isOwnProfile && <img src={editPen} alt="" onClick={togglePopUp} />}
          </span>
          <h1 className="name">{userData.firstName + ' ' + userData.lastName}</h1>
          <span className="email">
            28 public playlist -{' '}
            <Link to={`/account/${uid}/friends`}>
              {friendCount} {friendCount > 1 ? 'friends' : 'friend'}
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
                {friendStatus !== '' ? (
                  <li className="user-actions-item">
                    <button className="btn-user-action" onClick={handleFriendAction}>
                      <span>{friendStatus}</span>
                    </button>
                  </li>
                ) : (
                  <>
                    <li className="user-actions-item">
                      <button className="btn-user-action" onClick={acceptFriendRequest}>
                        <span>Accept friend request</span>
                      </button>
                    </li>
                    <li className="user-actions-item">
                      <button className="btn-user-action" onClick={declineFriendRequest}>
                        <span>Decline friend request</span>
                      </button>
                    </li>
                  </>
                )}
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
