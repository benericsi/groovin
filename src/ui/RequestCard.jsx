import {useEffect, useState} from 'react';
import {useLoader} from '../hooks/useLoader';
import {useToast} from '../hooks/useToast';
import firebase from 'firebase/compat/app';
import {db} from '../setup/Firebase';
import {Link, useOutletContext} from 'react-router-dom';

const RequestCard = ({request}) => {
  const [uid] = useOutletContext();
  const [senderData, setSenderData] = useState({});
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    const getSenderData = () => {
      showLoader();
      try {
        db.collection('users')
          .doc(request.sender)
          .get()
          .then((doc) => {
            setSenderData(doc.data());
          });
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getSenderData();
  }, [request.sender]);

  const acceptFriendRequest = (e) => {
    e.preventDefault();
    showLoader();

    try {
      db.collection('requests').doc(request.id).update({
        status: 'accepted',
      });

      db.collection('users')
        .doc(request.sender)
        .update({
          friends: firebase.firestore.FieldValue.arrayUnion(request.receiver),
        });

      db.collection('users')
        .doc(request.receiver)
        .update({
          friends: firebase.firestore.FieldValue.arrayUnion(request.sender),
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
    showLoader();

    try {
      await db.collection('requests').doc(request.id).delete();
      addToast('success', 'Friend request declined.');
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    senderData && (
      <Link to={`/profile/${request.sender}`} className="request-card">
        <div className="sender-card-photo">{senderData.photoURL !== 'default' ? <img src={senderData.photoURL} alt="" /> : ''}</div>
        <div className="sender-card-name">{senderData.displayName}</div>
        <div className="sender-card-action">
          <span onClick={acceptFriendRequest}>Accept</span>
          <span onClick={declineFriendRequest}>Decline</span>
        </div>
      </Link>
    )
  );
};

export default RequestCard;
