import '../assets/css/error-page.css';

import {useNavigate, Link} from 'react-router-dom';
import {useTitle} from '../hooks/useTitle';

import Button from '../modules/form/Button';

import {IoMdArrowBack} from 'react-icons/io';
import Reveal from './Reveal';

const ErrorPage = () => {
  useTitle(`Error`);
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate('/');
  };

  return (
    <section className="error_wrapper" data-error-code={404}>
      <Link to="/">Groovin</Link>
      <article>
        <Reveal>
          <h1>Wrong URL address</h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p>The page you are looking for does not exist. It may have been moved, or removed altogether. Maybe you can return back to the site's homepage and see if you can find what you are looking for.</p>
        </Reveal>
        <Button className="primary" text="Back to home" onClick={handleOnClick}>
          <IoMdArrowBack />
        </Button>
      </article>
    </section>
  );
};

export default ErrorPage;
