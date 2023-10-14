import React, {useState, useEffect, useRef} from 'react';
import {db} from '../../setup/Firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';
import {useToast} from '../../hooks/useToast';
import {Link} from 'react-router-dom';
import Input from '../../common/Input';
import Button from '../../common/Button';
import ChatMessage from './ChatMessage';

import ellipsis from '../../assets/icons/ellipsis-solid.svg';

const ChatRoom = ({uid}) => {
  const {currentUser} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const [partner, setPartner] = useState(null);
  const [isMessageActionsActive, setIsMessageActionsActive] = useState(false);

  const [formValue, setFormValue] = useState('');
  const [messages, setMessages] = useState([]);

  const dummy = useRef();

  useEffect(() => {
    const getPartner = async () => {
      showLoader();
      try {
        const doc = await db.collection('users').doc(uid).get();
        const data = doc.data();
        setPartner(data);

        // Get messages order by timestamp desc
        const messagesRef = db.collection('messages');
        const query = messagesRef.where('uid', 'in', [currentUser.uid, uid]).where('partnerId', 'in', [currentUser.uid, uid]).orderBy('createdAt', 'asc');
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

  const sendMessage = async (e) => {
    e.preventDefault();

    if (formValue.trim() === '') {
      return;
    }

    try {
      showLoader();

      await db.collection('messages').add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: currentUser.uid,
        photoURL: currentUser.photoURL,
        partnerId: uid,
      });

      // Send notification to partner
      await db.collection('notifications').doc(uid).collection('notifications').add({
        type: 'New Message',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        sender: currentUser.uid,
        senderPhoto: currentUser.photoURL,
        senderName: currentUser.displayName,
        receiver: uid,
        message: 'sent you a message.',
      });

      addToast('success', 'Message sent!');
    } catch (error) {
      addToast('error', 'Error sending message.');
    } finally {
      hideLoader();
    }

    setFormValue('');
    if (dummy.current) {
      dummy.current.scrollIntoView({behavior: 'smooth'});
    }
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
              className="input-field"
            />
            <Button type="submit" text="Send" className="btn-light" />
          </form>
        </section>
      </div>
    )
  );
};

export default ChatRoom;
