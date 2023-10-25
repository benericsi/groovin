import React from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

import {Link} from 'react-router-dom';

import {BiLogIn} from 'react-icons/bi';
import {useState} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import {useNavigate} from 'react-router-dom';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';

import {FaGoogle} from 'react-icons/fa';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const {showLoader, hideLoader} = useLoader();
  const {addToast} = useToast();

  useDebounce(
    () => {
      // Validate email
      if (email && !EMAIL_REGEX.test(email)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: 'Wrong e-mail format.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: '',
        }));
      }
    },
    0,
    [email]
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('error', 'Please fill out all the fields!');
      return;
    }

    if (Object.values(errors).some((error) => error !== '')) {
      addToast('error', 'There is an error with at least one field!');
      return;
    }
  };

  return (
    <>
      <h1>Welcome Back!</h1>
      <div className="social-signup">
        <h4>Connect with</h4>
        <Button text="Google" className="dark">
          <FaGoogle />
        </Button>
      </div>
      <div className="bg-line">
        <h4>or</h4>
      </div>
      <form onSubmit={handleFormSubmit}>
        <Input
          type="email"
          value={email}
          label="E-Mail * "
          onChange={(value) => {
            setEmail(value);
          }}
          className="input-field light"
          name="lgn-email"
          error={errors.email}
        />
        <Input
          type="password"
          value={password}
          label="Password * "
          onChange={(value) => {
            setPassword(value);
          }}
          className="input-field light"
          name="lgn-pass"
          error={errors.password}
        />
        <span className="forgot-pass">
          Forgot password? Reset <Link to="">here</Link>.
        </span>
        <Button type="submit" text="Log In" className="dark">
          <BiLogIn />
        </Button>
      </form>
    </>
  );
};

export default Login;
