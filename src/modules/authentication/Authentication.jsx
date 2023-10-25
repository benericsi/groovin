import '../../assets/css/authentication.css';
import AuthTabs from './AuthTabs';

const Authentication = () => {
  return (
    <section className="auth-page">
      <div className="hero"></div>
      <div className="auth-container">
        <AuthTabs />
      </div>
    </section>
  );
};

export default Authentication;
