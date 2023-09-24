import '../assets/css/button.css';

import React from 'react';

const Button = (props) => {
  const className = props.className ? `btn-main ${props.className}` : 'btn-main';
  return (
    <button className={className} onClick={props.onClick} type={props.type}>
      {props.text}
    </button>
  );
};

export default Button;
