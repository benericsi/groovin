import React from 'react';
import Input from '../form/Input';
import Button from '../form/Button';

import {BiLogIn} from 'react-icons/bi';
import {useState} from 'react';
import {useDebounce} from '../../hooks/useDebounce';
import {useNavigate} from 'react-router-dom';
import {useLoader} from '../../hooks/useLoader';
import {useToast} from '../../hooks/useToast';
import {useAuth} from '../../hooks/useAuth';
import {db, storage} from '../../setup/Firebase';

import {FcGoogle} from 'react-icons/fc';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const DEFAULT_PHOTO_URL = 'https://firebasestorage.googleapis.com/v0/b/groovin-redesign.appspot.com/o/profile-pictures%2F549507b290b7b3ee0626e5710a354f39.jpg?alt=media&token=e3b32a47-adec-4775-92ba-326f8f619823';

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

    const inputFields = {
      email,
      password,
    };

    const emptyInputs = Object.keys(inputFields).filter((key) => inputFields[key] === '');

    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [input]: 'This field is required.',
        }));
      });

      addToast('error', 'Please fill out all required fields!');
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
        addToast('success', 'Welcome to Groovin, ' + cred.user.displayName.split(' ')[0] + '!');
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
          const storageRef = storage.ref();
          const pictureRef = storageRef.child(`profile-pictures/${cred.user.uid}`);
          var imageUrl = DEFAULT_PHOTO_URL;

          if (cred.user.photoURL) {
            await fetch(cred.user.photoURL).then(async (response) => {
              const blob = await response.blob();
              await pictureRef.put(blob);
              imageUrl = await pictureRef.getDownloadURL();
            });
          }

          await db.collection('users').doc(cred.user.uid).set({
            firstName: cred.additionalUserInfo.profile.given_name,
            lastName: cred.additionalUserInfo.profile.family_name,
            displayName: cred.user.displayName,
            email: cred.user.email,
            photoURL: imageUrl,
            friends: [],
          });
        }

        // Signup was successful
        addToast('success', 'Welcome to Groovin, ' + cred.user.displayName.split(' ')[0] + '!');
        navigate('/');
      })
      .catch((error) => {
        addToast('error', error.message);
        return;
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
        <Button text="Google" className="secondary" onClick={handleLoginWithGoogle}>
          <FcGoogle />
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
          autoFocus={true}
          error={errors.email}
          success={email && !errors.email}
        />
        <Input
          type="password"
          value={password}
          label="Password * "
          onChange={(value) => {
            setPassword(value);
          }}
          error={errors.password}
        />
        <p className="link" onClick={handlePasswordReset}>
          Forgot password?
        </p>
        <Button type="submit" text="Log In" className="primary">
          <BiLogIn />
        </Button>
      </form>
    </>
  );
};

export default Login;
