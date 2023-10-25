import Input from '../../ui/Input';
import Button from '../../ui/Button';

import React, {useState} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';

import {HiPencilSquare} from 'react-icons/hi2';
import {FaGoogle} from 'react-icons/fa';

const NAME_REGEX = /^[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+([ -][A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+)*$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const Signup = () => {
  const [errors, setErrors] = useState({}); // Store input errors
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useDebounce(
    () => {
      // Validate first name and last name
      if (firstName && !NAME_REGEX.test(firstName)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: 'Wrong first name format.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: '',
        }));
      }

      if (lastName && !NAME_REGEX.test(lastName)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: 'Wrong last name format.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: '',
        }));
      }
    },
    0,
    [firstName, lastName]
  );

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

  useDebounce(
    () => {
      // Validate password
      if (password && password.length < 8) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must be at least 8 characters long.',
        }));
      } else if (password && password.length > 20) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must be at most 20 characters long.',
        }));
      } else if (password && !/\d/.test(password)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must contain at least one digit',
        }));
      } else if (password && !/[a-z]/.test(password)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must contain at least one lowercase letter.',
        }));
      } else if (password && !/[A-Z]/.test(password)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must contain at least one uppercase letter',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: '',
        }));
      }
    },
    0,
    [password]
  );

  useDebounce(
    () => {
      // Validate password confirmation
      if (passwordConfirmation && password !== passwordConfirmation) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          passwordConfirmation: 'Passwords do not match.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          passwordConfirmation: '',
        }));
      }
    },
    0,
    [password, passwordConfirmation]
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <>
      <h1>First Time Here?</h1>
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
        <div className="field-wrapper">
          <Input
            type="text"
            value={firstName}
            label="Last Name * "
            onChange={(value) => {
              setFirstName(value);
            }}
            className="input-field light"
            name="reg-firstname"
            error={errors.firstName}
          />
          <Input
            type="text"
            value={lastName}
            label="First Name * "
            onChange={(value) => {
              setLastName(value);
            }}
            className="input-field light"
            name="reg-lastname"
            error={errors.lastName}
            autoFocus
          />
        </div>
        <Input
          type="email"
          value={email}
          label="E-Mail * "
          onChange={(value) => {
            setEmail(value);
          }}
          className="input-field light"
          name="reg-email"
          error={errors.email}
        />
        <div className="field-wrapper">
          <Input
            type="password"
            value={password}
            label="Password * "
            onChange={(value) => {
              setPassword(value);
            }}
            className="input-field light"
            name="reg-password"
            error={errors.password}
          />
          <Input
            type="password"
            value={passwordConfirmation}
            label="Password again * "
            onChange={(value) => {
              setPasswordConfirmation(value);
            }}
            className="input-field light"
            name="reg-password-again"
            error={errors.passwordConfirmation}
          />
        </div>
        <Button type="submit" text="Sign Up" className="dark">
          <HiPencilSquare />
        </Button>
      </form>
    </>
  );
};

export default Signup;
