import React from 'react';
import {useParams} from 'react-router-dom';

const ChatRoom = () => {
  const {partnerId} = useParams();

  return (
    <div className="chat-room">
      <h2>Chat room with {partnerId}</h2>
    </div>
  );
};

export default ChatRoom;
