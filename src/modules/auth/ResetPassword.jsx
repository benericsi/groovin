import '../../assets/css/authentication.css';

import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';

import Input from '../../common/Input';
import Button from '../../common/Button';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const {showLoader, hideLoader} = useLoader();
  const {resetPassword} = useAuth();
  const {addToast} = useToast();

  const history = useNavigate();

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    showLoader();

    if (!email.trim()) {
      hideLoader();
      addToast('error', 'Please fill out all the fields!');
      return;
    }

    if (Object.values(errors).some((error) => error !== '')) {
      hideLoader();
      addToast('error', 'There is an error with at least one field!');
      return;
    }

    resetPassword(email)
      .then(() => {
        // Reset password was successful
        hideLoader();
        addToast('success', 'Password reset e-mail sent!');
        history('/auth#login');
      })
      .catch((error) => {
        // Reset password was unsuccessful
        hideLoader();
        addToast('error', error.message);
      });
  };

  return (
    <>
      <div className="auth-page">
        <div className="reset-form">
          <h1>Reset Your Password.</h1>
          <form onSubmit={handleFormSubmit}>
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
            <Button type="submit" text="Reset" className="btn-light" />
          </form>
          <Link to="/auth#login">Cancel</Link>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
