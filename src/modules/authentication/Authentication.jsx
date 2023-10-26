import '../../assets/css/authentication.css';
import AuthTabs from './AuthTabs';

const Authentication = () => {
  var backgroundImagesContext = null;

  if (window.innerWidth <= 1200) {
    backgroundImagesContext = require.context('../../assets/images/background/small', false, /.*\.jpg$/);
  } else {
    backgroundImagesContext = require.context('../../assets/images/background/medium', false, /.*\.jpg$/);
  }

  const backgroundImages = backgroundImagesContext.keys().map((key) => backgroundImagesContext(key));

  const createGallery = (columnNumber = 9) => {
    const imagePerColumn = Math.floor(backgroundImages.length / columnNumber);
    const gallery = [];

    backgroundImages.sort(() => Math.random() - 0.5);

    for (let i = 0; i < columnNumber; i++) {
      const column = [];
      for (let j = 0; j < imagePerColumn; j++) {
        column.push(
          <div key={j} className="image">
            <img src={backgroundImages[i * imagePerColumn + j]} alt="background" />
          </div>
        );
      }
      gallery.push(
        <div key={i} className={i % 2 === 0 ? 'image-column sliding-down' : 'image-column sliding-up'}>
          {column}
        </div>
      );
    }

    return gallery;
  };

  return (
    <section className="auth-page">
      <div className="hero">
        {createGallery(9)}
        <div className="hero-content">
          <h1>
            Made for Groovers,
            <br />
            by Groovers.
          </h1>
        </div>
      </div>
      <div className="auth-container">
        <h1 className="brand-title">Groovin</h1>
        <AuthTabs />
      </div>
    </section>
  );
};

export default Authentication;
