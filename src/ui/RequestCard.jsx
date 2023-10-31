import {useEffect, useState} from 'react';
import {useLoader} from '../hooks/useLoader';
import {useToast} from '../hooks/useToast';
import {db} from '../setup/Firebase';
import {Link} from 'react-router-dom';

const RequestCard = ({request}) => {
  const [senderData, setSenderData] = useState({});
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useEffect(() => {
    const fetchSenderData = async () => {
      showLoader();

      try {
        const doc = await db.collection('users').doc(request.sender).get();
        const senderData = doc.data();
        setSenderData(senderData);
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    fetchSenderData();
  }, [request]);

  const acceptFriendRequest = async (e) => {
    e.preventDefault();
    showLoader();

    try {
      await db.collection('requests').doc(request.id).update({
        status: 'accepted',
      });

      await db
        .collection('users')
        .doc(request.sender)
        .update({
          friends: [...senderData.friends, request.receiver],
        });

      await db
        .collection('users')
        .doc(request.receiver)
        .update({
          friends: [...senderData.friends, request.sender],
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
