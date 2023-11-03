import React from 'react';
import {BiUserPlus, BiUserMinus} from 'react-icons/bi';
import {MdOutlineCancel} from 'react-icons/md';

const FriendButton = ({friendStatus, onFriendButtonClick}) => {
  return (
    <button className="friend-action" onClick={onFriendButtonClick}>
      {friendStatus === 'none' && (
        <>
          <BiUserPlus />
          Add Friend
        </>
      )}
      {friendStatus === 'pending' && (
        <>
          <MdOutlineCancel />
          Cancel Request
        </>
      )}
      {friendStatus === 'friends' && (
        <>
          <BiUserMinus />
          Remove Friend
        </>
      )}
    </button>
  );
};

export default FriendButton;
