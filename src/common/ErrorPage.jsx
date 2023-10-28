import '../assets/css/error-page.css';

import {NavLink, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import Button from '../ui/Button';

import {FiCornerDownLeft} from 'react-icons/fi';

const ErrorPage = () => {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(secondsLeft - 1);
      } else {
        clearInterval(interval);
        navigate('/');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  return (
    <div className="not-found-wrapper">
      <h1>
        <span className="error-code">404 ...</span> <br /> Page not found!
      </h1>
      <h2>Wrong URL address.</h2>
      <p>Redirecting in {secondsLeft} seconds.</p>
      <NavLink to="/" id="navLinkButton">
        <Button className="dark" text="Back to home">
          <FiCornerDownLeft />
        </Button>
      </NavLink>
    </div>
  );
};

export default ErrorPage;
