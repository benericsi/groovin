import '../assets/css/input.css';
import {useState} from 'react';
import {FaEye, FaEyeSlash} from 'react-icons/fa';

const Input = ({type, label, error, success, value, name, onChange, className}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible((prevVisible) => !prevVisible);
  };

  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  const inputType = isPasswordVisible ? 'text' : type;
  const inputClassName = className + (error ? ' input-error' : ' ') + (success ? ' input-success' : ' ');

  return (
    <>
      <div className="input-wrapper">
        <div className="input-group">
          <input type={inputType} value={value} onChange={handleOnChange} name={name} className={inputClassName} placeholder=" " />
          <label>{label}</label>
          {type === 'password' && (isPasswordVisible ? <FaEye onClick={handleTogglePasswordVisibility} className="eye" /> : <FaEyeSlash onClick={handleTogglePasswordVisibility} className="eye" />)}
        </div>
        {error && <span className="error-msg">{error}</span>}
      </div>
    </>
  );
};

export default Input;
