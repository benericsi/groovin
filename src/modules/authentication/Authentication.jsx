import '../../assets/css/authentication.css';
import AuthTabs from './AuthTabs';
import Hero from './Hero';

const Authentication = () => {
  return (
    <section className="auth_page">
      <Hero />
      <div className="auth_container">
        <h1 className="brand_title">Groovin</h1>
        <AuthTabs />
      </div>
    </section>
  );
};

export default Authentication;
