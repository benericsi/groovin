import '../assets/css/toast.css';

import successIcon from '../assets/icons/circle-check-regular.svg';
import warningIcon from '../assets/icons/circle-exclamation-solid.svg';
import errorIcon from '../assets/icons/circle-xmark-regular.svg';
import questionIcon from '../assets/icons/circle-question-regular.svg';

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

  var icon = null;

  switch (type) {
    case 'success':
      icon = successIcon;
      break;
    case 'warning':
      icon = warningIcon;
      break;
    case 'error':
      icon = errorIcon;
      break;
    case 'info':
      icon = questionIcon;
      break;
    default:
      icon = null;
  }

  return (
    <div className={`toast ${type}`}>
      <img src={icon} alt={type} />
      <p>{message}</p>
      <button className="toast-close" onClick={() => onClose(id)}>
        &#x2716;
      </button>
    </div>
  );
};

export default Toast;
