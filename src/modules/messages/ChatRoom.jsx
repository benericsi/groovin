import React, {useState, useEffect} from 'react';
import {db} from '../../setup/Firebase';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';
import {useToast} from '../../hooks/useToast';
import {Link} from 'react-router-dom';
import ellipsis from '../../assets/icons/ellipsis-solid.svg';

const ChatRoom = ({uid}) => {
  const {currentUser} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const [partner, setPartner] = useState(null);
  const [isMessageActionsActive, setIsMessageActionsActive] = useState(false);

  useEffect(() => {
    const getPartner = async () => {
      showLoader();
      try {
        const doc = await db.collection('users').doc(uid).get();
        const data = doc.data();
        setPartner(data);
      } catch (error) {
        console.log(error);
        addToast('error', 'Error getting partner details.');
      } finally {
        hideLoader();
      }
    };

    if (uid) {
      getPartner();
    }
  }, [uid]);

  const toggleMessageActions = () => {
    setIsMessageActionsActive(!isMessageActionsActive);
  };

  return (
    partner !== null && (
      <div className="chatroom">
        <div className="chatroom-header">
          <Link to={`/account/${uid}`} className="chat-partner">
            <img src={partner.photoURL} alt={partner.firstName} />
            <h4>{partner.lastName + ' ' + partner.firstName}</h4>
          </Link>
          <div className="chatroom-actions">
            <img src={ellipsis} alt="" onClick={toggleMessageActions} />
            {isMessageActionsActive ? (
              <ul className="message-action-list">
                <li className="message-actions-item">
                  <Link to={`/account/${uid}`} className="btn-message-action">
                    <span>Visit Profile</span>
                  </Link>
                </li>
                <li className="message-actions-item">
                  <button className="btn-message-action">
                    <span>Add Nickname</span>
                  </button>
                </li>
                <li className="message-actions-item">
                  <button className="btn-message-action">
                    <span>Delete Chat</span>
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    )
  );
};

export default ChatRoom;
