import '../../assets/css/authentication.css';
import AuthTabs from './AuthTabs';

import background from '../../assets/images/background/large/kobu-agency-3hWg9QKl5k8-unsplash.jpg';

const Authentication = () => {
  return (
    <section className="auth-page">
      <div className="hero">
        <img src={background} alt="Background Image" />
      </div>
      <div className="auth-container">
        <h1 className="brand-title">Groovin</h1>
        <AuthTabs />
      </div>
    </section>
  );
};

export default Authentication;
