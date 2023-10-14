const ChatMessage = ({message, className}) => {
  return (
    <div className={className}>
      <img src={message.photoURL} alt="" />
      <p>{message.text}</p>
    </div>
  );
};

export default ChatMessage;
