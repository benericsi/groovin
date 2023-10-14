import {Link} from 'react-router-dom';
import profile from '../../assets/icons/user-solid.svg';
import {db} from '../../setup/Firebase';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const Notification = ({notification}) => {
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  // Convert Firestore Timestamp to JavaScript Date
  const createdAtDate = notification.timestamp.toDate();

  // Format the date components
  const year = createdAtDate.getFullYear();
  const month = String(createdAtDate.getMonth() + 1).padStart(2, '0');
  const day = String(createdAtDate.getDate()).padStart(2, '0');
  const hours = String(createdAtDate.getHours()).padStart(2, '0');
  const minutes = String(createdAtDate.getMinutes()).padStart(2, '0');
  const seconds = String(createdAtDate.getSeconds()).padStart(2, '0');

  // Create the formatted date string
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  switch (notification.type) {
    case 'New Message':
      var linkTo = '/messages/' + notification.sender;
      break;
    default:
      var linkTo = '/account/' + notification.sender;
  }

  const acceptFriendRequest = async (e) => {
    e.preventDefault();

    try {
      showLoader();

      // Set the friend request status to accepted
      await db.collection('friendRequests').doc(notification.receiver).collection('friendRequests').doc(notification.sender).update({
        status: 'accepted',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('friendRequests').doc(notification.sender).collection('friendRequests').doc(notification.receiver).set({
        sender: notification.sender,
        receiver: notification.receiver,
        status: 'accepted',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Set the friends collection for both users with arrayUnion
      await db
        .collection('friends')
        .doc(notification.sender)
        .update({
          friendList: firebase.firestore.FieldValue.arrayUnion(notification.receiver),
        });

      await db
        .collection('friends')
        .doc(notification.receiver)
        .update({
          friendList: firebase.firestore.FieldValue.arrayUnion(notification.sender),
        });

      // Remove the notification from the receiver's notifications collection
      await db
        .collection('notifications')
        .doc(notification.receiver)
        .collection('notifications')
        .where('sender', '==', notification.sender)
        .where('receiver', '==', notification.receiver)
        .where('type', '==', 'New Friend Request')
        .where('timestamp', '==', notification.timestamp)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      // Get the reciever's data and send a notifaction to the sender
      const receiverData = await db.collection('users').doc(notification.receiver).get();
      const receiverName = receiverData.data().firstName + ' ' + receiverData.data().lastName;
      const receiverPhoto = receiverData.data().photoURL;

      await db.collection('notifications').doc(notification.sender).collection('notifications').add({
        sender: notification.receiver,
        receiver: notification.sender,
        type: 'Friend Request Accepted',
        message: 'accepted your friend request.',
        senderName: receiverName,
        senderPhoto: receiverPhoto,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

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

      // Remove the friend request from the user's friend requests
      await db.collection('friendRequests').doc(notification.receiver).collection('friendRequests').doc(notification.sender).delete();

      // Remove the notification from the receiver's notifications collection
      await db
        .collection('notifications')
        .doc(notification.receiver)
        .collection('notifications')
        .where('sender', '==', notification.sender)
        .where('receiver', '==', notification.receiver)
        .where('type', '==', 'New Friend Request')
        .where('timestamp', '==', notification.timestamp)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      // Get the reciever's data and send a notifaction to the sender
      const receiverData = await db.collection('users').doc(notification.receiver).get();
      const receiverName = receiverData.data().firstName + ' ' + receiverData.data().lastName;
      const receiverPhoto = receiverData.data().photoURL;

      await db.collection('notifications').doc(notification.sender).collection('notifications').add({
        sender: notification.receiver,
        receiver: notification.sender,
        type: 'Friend Request Declined',
        message: 'declined your friend request.',
        senderName: receiverName,
        senderPhoto: receiverPhoto,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      addToast('success', 'Friend request declined.');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  const clearNotification = async (e) => {
    e.preventDefault();

    try {
      showLoader();
      // Remove the notification from the receiver's notifications collection
      await db
        .collection('notifications')
        .doc(notification.receiver)
        .collection('notifications')
        .where('sender', '==', notification.sender)
        .where('receiver', '==', notification.receiver)
        .where('type', '==', notification.type)
        .where('timestamp', '==', notification.timestamp)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      addToast('success', 'Notification removed.');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <Link to={linkTo} className="notification-item">
        {notification.type !== 'New Friend Request' ? (
          <div className="notification-remove" onClick={clearNotification}>
            &times;
          </div>
        ) : (
          <div className="accept-or-decline">
            <span onClick={acceptFriendRequest}>Accept</span>
            <span onClick={declineFriendRequest}>Decline</span>
          </div>
        )}
        <img className="notification-img" src={notification.senderPhoto === 'default' ? profile : notification.senderPhoto} alt=""></img>
        <div className="notification-text">
          <h3>{notification.type}</h3>
          <p>{notification.senderName + ' ' + notification.message}</p>
          <p>{formattedDate}</p>
        </div>
      </Link>
    </>
  );
};

export default Notification;
