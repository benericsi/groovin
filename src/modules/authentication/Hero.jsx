import {useEffect, useState} from 'react';

import Gallery from './Gallery';

const Hero = () => {
  const [shuffledBackgroundImages, setShuffledBackgroundImages] = useState([]);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    var backgroundImagesContext = require.context('../../assets/images/background/small', false, /.*\.jpg$/);
    const backgroundImages = backgroundImagesContext.keys().map((key) => backgroundImagesContext(key));
    const shuffledImages = shuffleArray(backgroundImages);

    setShuffledBackgroundImages(shuffledImages);
  }, []);

  return (
    <div className="hero">
      <Gallery images={shuffledBackgroundImages} columns={9} />
      <div className="hero_content">
        <h1>
          Made for Groovers,
          <br />
          by Groovers.
        </h1>
      </div>
    </div>
  );
};

export default Hero;
