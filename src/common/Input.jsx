import '../assets/css/input.css';

import React, {useState} from 'react';

import showEye from '../assets/icons/eye-regular.svg';
import hideEye from '../assets/icons/eye-slash-regular.svg';

const Input = (props) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible((prevVisible) => !prevVisible);
  };

  const handleOnChange = (event) => {
    props.onChange(event.target.value);
  };

  const inputType = isPasswordVisible ? 'text' : props.type;
  const inputClassName = props.className + (props.error ? ' input-error' : ' ') + (props.succes ? ' input-success' : ' ');

  return (
    <>
      <div className="input-wrapper">
        <div className="input-group">
          <input type={inputType} value={props.value} onChange={handleOnChange} name={props.name} className={inputClassName} placeholder=" " />
          <label>{props.label}</label>
          {props.type === 'password' && <img src={isPasswordVisible ? showEye : hideEye} alt=" " onClick={handleTogglePasswordVisibility} />}
        </div>
        {props.error && <span style={{color: '#FF1F32'}}>{props.error}</span>}
      </div>
    </>
  );
};

export default Input;
