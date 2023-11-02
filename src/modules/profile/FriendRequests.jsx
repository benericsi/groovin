import '../../assets/css/requests.css';

import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';
import {useAuth} from '../../hooks/useAuth';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';
import {useEffect, useState} from 'react';

import RequestCard from '../../ui/RequestCard';

const FriendRequests = () => {
  useAccessControl();
  useTitle('Friend Requests');

  //const [uid] = useOutletContext();
  const {currentUser} = useAuth();
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const getFriendRequests = async () => {
      showLoader();
      try {
        // get documents from requests collection where reciever is current user uid and status is pending with onSnapshot
        // use onSnapshot to get realtime updates
        db.collection('requests')
          .where('receiver', '==', currentUser.uid)
          .where('status', '==', 'pending')
          .orderBy('createdAt', 'desc')
          .onSnapshot((snapshot) => {
            const requests = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRequests(requests);
          });
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    getFriendRequests();
  }, [currentUser]);

  return (
    <section className="requests-section">
      {requests.length === 0 && <h2>There are no requests yet.</h2>}
      <div className="requests-container">{requests && requests.map((request) => <RequestCard key={request.id} request={request} />)}</div>
    </section>
  );
};

export default FriendRequests;
