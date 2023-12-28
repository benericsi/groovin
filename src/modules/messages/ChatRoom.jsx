import React from 'react';
import {Link, useParams, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useEffect, useState, useRef} from 'react';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {db} from '../../setup/Firebase';
import {FaEllipsisVertical} from 'react-icons/fa6';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import ChatMessage from './ChatMessage';
import firebase from 'firebase/compat/app';

const ChatRoom = () => {
  const {currentUser} = useAuth();
  const {partnerId} = useParams();
  //const partner = useLocation().state.partner;

  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const [partner, setPartner] = useState(null);
  const [isMessageActionsActive, setIsMessageActionsActive] = useState(false);

  const [formValue, setFormValue] = useState('');
  const [messages, setMessages] = useState(null);

  const dummy = useRef();

  useEffect(() => {
    const getPartner = async () => {
      //showLoader();
      try {
        const partnerRef = db.collection('users').doc(partnerId);
        const partnerSnapshot = await partnerRef.get();
        setPartner({...partnerSnapshot.data(), uid: partnerSnapshot.id});

        //Get messages order by timestamp
        const messagesRef = db.collection('messages');
        const query = messagesRef.where('uid', 'in', [currentUser.uid, partnerId]).where('partnerId', 'in', [currentUser.uid, partnerId]).orderBy('createdAt', 'asc').limit(25);
        const unsubscribe = query.onSnapshot((querySnapshot) => {
          const messages = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return {id, ...data};
          });
          setMessages(messages);
        });

        return unsubscribe;
      } catch (error) {
        addToast('error', error.message);
      } finally {
        hideLoader();
      }
    };

    if (partnerId) {
      getPartner();
    } else {
      setPartner(null);
    }
  }, [partnerId]);

  const toggleMessageActions = () => {
    setIsMessageActionsActive(!isMessageActionsActive);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (formValue.trim() === '') {
      return;
    }
    showLoader();
    try {
      await db.collection('messages').add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: currentUser.uid,
        photoURL: currentUser.photoURL,
        partnerId: partnerId,
      });

      //Send notification if there is no notification for New Message
      const notificationRef = db.collection('notifications');
      const notificationSnapshot = await notificationRef.where('type', '==', 'New Message').where('sender', '==', currentUser.uid).where('receiver', '==', partnerId).get();
      if (notificationSnapshot.empty) {
        await notificationRef.add({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          message: `${currentUser.displayName} sent you a message.`,
          receiver: partnerId,
          sender: currentUser.uid,
          senderName: currentUser.displayName,
          senderPhoto: currentUser.photoURL,
          type: 'New Message',
        });
      }
    } catch (error) {
      addToast('error', error.message);
    } finally {
      setFormValue('');
      hideLoader();

      if (dummy.current) {
        dummy.current.scrollIntoView({behavior: 'smooth'});
      }
    }
  };

  const deletChat = async () => {
    showLoader();
    try {
      const messagesRef = db.collection('messages');
      const query = messagesRef.where('uid', 'in', [currentUser.uid, partnerId]).where('partnerId', 'in', [currentUser.uid, partnerId]);
      const querySnapshot = await query.get();
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
      toggleMessageActions();
    } catch (error) {
      addToast('error', error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="chatroom">
      {partner && (
        <>
          <div className="chatroom-header">
            <Link to={`/profile/${partnerId}`} className="chat-partner">
              <img src={partner.photoURL} alt={partner.firstName} />
              <h4>{partner.firstName + ' ' + partner.lastName}</h4>
            </Link>
            <div className="chat-actions">
              <FaEllipsisVertical className="ellipsis" onClick={toggleMessageActions} />
              {isMessageActionsActive ? (
                <ul className="message-action-list">
                  <li className="message-actions-item">
                    <Link to={`/profile/${partnerId}`} className="btn-message-action">
                      <span>Visit Profile</span>
                    </Link>
                  </li>
                  {/*
                <li className="message-actions-item">
                  <button className="btn-message-action">
                    <span>Add Nickname</span>
                  </button>
                </li>
                */}
                  <li className="message-actions-item">
                    <button className="btn-message-action" onClick={deletChat}>
                      <span>Delete Chat</span>
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>
          <section className="chatroom-body">
            <div className="message-container">
              {messages && messages.map((message) => <ChatMessage key={message.id} message={message} className={`message ${message.uid === currentUser.uid ? 'sent' : 'received'}`} />)}
              <div ref={dummy} className="dummy"></div>
            </div>
            <form onSubmit={sendMessage} className="message-form">
              <Input
                type="text"
                value={formValue}
                label="Say something nice... "
                onChange={(value) => {
                  setFormValue(value);
                }}
                className="input-field light"
              />
              <Button type="submit" text="Send" className="dark" />
            </form>
          </section>
        </>
      )}
    </div>
  );
};

export default ChatRoom;
