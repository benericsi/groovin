import Input from '../../common/Input';
import Button from '../../common/Button';

import {useEffect, useState} from 'react';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate} from 'react-router-dom';
import {Link} from 'react-router-dom';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const {showLoader, hideLoader} = useLoader();
  const {login} = useAuth();
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
      .then(() => {
        // Login was successful
        setEmail('');
        setPassword('');

        hideLoader();
        addToast('success', 'You have successfully logged in!');
        history('/');
      })
      .catch((error) => {
        hideLoader();
        addToast('error', error.message);
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
      </form>
      <Link to="/reset-pass">Forgot Password?</Link>
    </>
  );
};

export default LoginForm;
