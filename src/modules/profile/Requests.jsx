import '../../assets/css/requests.css';

import React, {useEffect, useState} from 'react';
import {useAccessControl} from '../../hooks/useAccessControl';
import {useTitle} from '../../hooks/useTitle';
import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';
import {Link, useOutletContext} from 'react-router-dom';

const Requests = () => {
  useAccessControl();
  useTitle('Friend Requests');

  const {currentUser} = useAuth();
  const {acceptRequest, declineRequest} = useOutletContext();

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection('requests')
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
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  return (
    <section className="requests-section">
      {requests.length === 0 && <h2>There are no requests yet.</h2>}
      <div className="requests-container">
        {requests &&
          requests.map((request, index) => (
            <Link to={`/profile/${request.sender}`} className="request-card" key={index}>
              <div className="sender-card-photo">{request.senderPhoto !== 'default' ? <img src={request.senderPhoto} alt="" /> : ''}</div>
              <div className="sender-card-name">{request.senderName}</div>
              <div className="sender-card-action">
                <span onClick={(e) => acceptRequest(e, request)}>Accept</span>
                <span onClick={(e) => declineRequest(e, request)}>Decline</span>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
};
export default Requests;
