import '../assets/css/toast.css';

import {FaCircleCheck, FaCircleInfo, FaTriangleExclamation} from 'react-icons/fa6';
import {BiSolidErrorAlt} from 'react-icons/bi';

import React, {useEffect, useState} from 'react';

const Toast = ({id, type, message, onClose}) => {
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    setTimerId(timer);

    return () => {
      clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' && <FaCircleCheck className="toast-icon" />}
      {type === 'error' && <BiSolidErrorAlt className="toast-icon" />}
      {type === 'info' && <FaCircleInfo className="toast-icon" />}
      {type === 'warning' && <FaTriangleExclamation className="toast-icon" />}
      <p>{message}</p>
      <button className="toast-close" onClick={() => onClose(id)}>
        &#x2716;
      </button>
    </div>
  );
};

export default Toast;
