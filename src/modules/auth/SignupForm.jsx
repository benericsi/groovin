import Input from '../../common/Input';
import Button from '../../common/Button';

import React, {useState, useEffect} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useNavigate} from 'react-router-dom';

const NAME_REGEX = /^[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+([ -][A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+)*$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const PHONE_REGEX = /((?:\+?3|0)6)(?:-|\()?(\d{1,2})(?:-|\))?(\d{3})-?(\d{3,4})/;

const SignupForm = () => {
  const [errors, setErrors] = useState({}); // Store input errors
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const {signup} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const history = useNavigate();

  useEffect(() => {
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
  }, [firstName, lastName]);

  useEffect(() => {
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
  }, [email]);

  useEffect(() => {
    // Validate password
    if (password && password.length < 8) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password must be at least 8 characters long.',
      }));
    } else if (password && password.length > 14) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password must be at most 14 characters long.',
      }));
    } else if (password && !/\d/.test(password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password must contain at least one digit',
      }));
    } else if (password && !/[a-z]/.test(password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password must contain at least one lowercase letter',
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
  }, [password]);

  useEffect(() => {
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
  }, [password, passwordConfirmation]);

  useEffect(() => {
    // Validate phone number
    if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: 'Wrong phone number format.',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: '',
      }));
    }
  }, [phoneNumber]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    showLoader();
    //Validation
    if (!lastName.trim() || !firstName.trim() || !email.trim() || !password.trim() || !passwordConfirmation.trim() || !phoneNumber.trim()) {
      hideLoader();
      addToast('error', 'Please fill out all the fields!');
      return;
    }

    if (Object.values(errors).some((error) => error !== '')) {
      hideLoader();
      addToast('error', 'There is an error with at least one field!');
      return;
    }

    if (password !== passwordConfirmation) {
      hideLoader();
      addToast('error', 'Passwords do not match!');
      return;
    }

    signup(email, password)
      .then((cred) => {
        // Signup was successful
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setFirstName('');
        setLastName('');
        setPhoneNumber('');

        hideLoader();
        addToast('success', 'You have successfully signed up!');
        history('/');
      })
      .catch((error) => {
        hideLoader(); // Ensure loader is hidden even in case of an error
        if (error.code === 'auth/email-already-in-use') {
          addToast('error', 'The email address is already in use.');
        } else if (error.code === 'auth/invalid-email') {
          addToast('error', 'The email address is not valid.');
        } else if (error.code === 'auth/operation-not-allowed') {
          addToast('error', 'Email/password accounts are not enabled.');
        } else if (error.code === 'auth/weak-password') {
          addToast('error', 'The password is not strong enough.');
        } else {
          addToast('error', error.message);
        }
      });
  };

  return (
    <>
      <h1>First Time Here?</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="field-wrapper">
          <Input
            type="text"
            value={lastName}
            label="Last Name * "
            onChange={(value) => {
              setLastName(value);
            }}
            className="input-field"
            name="reg-lastname"
            error={errors.lastName}
            autoFocus
          />
          <Input
            type="text"
            value={firstName}
            label="First Name * "
            onChange={(value) => {
              setFirstName(value);
            }}
            className="input-field"
            name="reg-firstname"
            error={errors.firstName}
          />
        </div>
        <Input
          type="email"
          value={email}
          label="E-Mail * "
          onChange={(value) => {
            setEmail(value);
          }}
          className="input-field"
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
            className="input-field"
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
            className="input-field"
            name="reg-password-again"
            error={errors.passwordConfirmation}
          />
        </div>
        <Input
          type="tel"
          value={phoneNumber}
          label="Phone * "
          onChange={(value) => {
            setPhoneNumber(value);
          }}
          className="input-field"
          name="reg-phone"
          error={errors.phoneNumber}
        />
        <Button type="submit" text="Sign up" className="btn-light" />
      </form>
    </>
  );
};

export default SignupForm;
