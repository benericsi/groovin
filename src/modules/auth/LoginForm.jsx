import Input from '../../common/Input';
import Button from '../../common/Button';

import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {db} from '../../setup/Firebase';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const {showLoader, hideLoader} = useLoader();
  const {login, loginWithGoogle} = useAuth();
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

    // Validate password
    if (!email.trim() || !password.trim()) {
      hideLoader();
      addToast('error', 'Please fill out all the fields!');
      return;
    }

    if (Object.values(errors).some((error) => error !== '')) {
      hideLoader();
      addToast('error', 'There is an error with at least one field!');
      return;
    }

    login(email, password)
      .then(async (cred) => {
        setEmail('');
        setPassword('');

        hideLoader();
        addToast('success', 'You have successfully logged in!');
        history('/home');
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
            email: cred.user.email,
            photoURL: cred.user.photoURL,
            role: 'profile',
          });

          await db.collection('friends').doc(cred.user.uid).set({
            friends: [],
          });
        }

        // Signup was successful
        addToast('success', 'You have successfully signed in!');
        history('/home');
      })
      .catch((error) => {
        addToast('error', error.message);
      })
      .finally(() => {
        hideLoader();
      });
  };

  return (
    <>
      <h1>Welcome Back!</h1>
      <form onSubmit={handleFormSubmit}>
        <Input
          type="email"
          value={email}
          label="E-Mail * "
          onChange={(value) => {
            setEmail(value);
          }}
          className="input-field"
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
          className="input-field"
          name="lgn-pass"
          error={errors.password}
        />
        <Button type="submit" text="Log in" className="btn-light" />
        <Button type="button" text="Log in with Google" className="btn-light" onClick={handleLoginWithGoogle} />
      </form>
      <Link to="/reset-pass">Forgot Password?</Link>
    </>
  );
};

export default LoginForm;
