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
import {useAuth} from '../../hooks/useAuth';
import {db} from '../../setup/Firebase';

import {FaGoogle} from 'react-icons/fa';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const Login = () => {
  const navigate = useNavigate();
  const {login, loginWithGoogle, resetPassword} = useAuth();

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

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('error', 'Please fill out all the fields!');
      return;
    }

    if (Object.values(errors).some((error) => error !== '')) {
      addToast('error', 'There is an error with at least one field!');
      return;
    }

    showLoader();
    login(email, password)
      .then(async (cred) => {
        setEmail('');
        setPassword('');

        hideLoader();
        addToast('success', 'You have successfully logged in!');
        navigate('/');
      })
      .catch((error) => {
        hideLoader();
        if (error.code === 'auth/user-not-found') {
          addToast('error', 'There is no user with this e-mail.');
        } else if (error.code === 'auth/wrong-password') {
          addToast('error', 'Wrong password.');
        } else if (error.code === 'auth/invalid-login-credentials') {
          addToast('error', 'Invalid login credentials.');
        } else {
          addToast('error', error.message);
        }
      });
  };

  const handleLoginWithGoogle = (e) => {
    e.preventDefault();
    showLoader();

    loginWithGoogle()
      .then(async (cred) => {
        if (cred.additionalUserInfo.isNewUser) {
          await db.collection('users').doc(cred.user.uid).set({
            firstName: cred.additionalUserInfo.profile.given_name,
            lastName: cred.additionalUserInfo.profile.family_name,
            displayName: cred.user.displayName,
            email: cred.user.email,
            photoURL: cred.user.photoURL,
            friends: [],
          });
        }

        // Signup was successful
        addToast('success', 'You have successfully signed in!');
        navigate('/');
      })
      .catch((error) => {
        addToast('error', error.message);
      })
      .finally(() => {
        hideLoader();
      });
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('error', 'Please enter your e-mail address!');
      return;
    }

    showLoader();
    resetPassword(email)
      .then(() => {
        // Reset password was successful
        hideLoader();
        addToast('success', 'Password reset e-mail sent!');
      })
      .catch((error) => {
        // Reset password was unsuccessful
        hideLoader();
        addToast('error', error.message);
      });
  };

  return (
    <>
      <h1>Welcome Back!</h1>
      <div className="social-signup">
        <h4>Connect with</h4>
        <Button text="Google" className="dark" onClick={handleLoginWithGoogle}>
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
          Forgot password? Reset{' '}
          <Link to="" onClick={handlePasswordReset}>
            here
          </Link>
          .
        </span>
        <Button type="submit" text="Log In" className="dark">
          <BiLogIn />
        </Button>
      </form>
    </>
  );
};

export default Login;
