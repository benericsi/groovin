import React from 'react';
//import Image from '../../component/Image';

const Gallery = ({images, columns}) => {
  const imagePerColumn = Math.floor(images.length / columns);

  const createColumn = (startIndex) => {
    const column = [];
    for (let j = 0; j < imagePerColumn; j++) {
      //column.push(<Image key={startIndex + j} src={images[startIndex + j]} hash={'L8C5$0[70cyG?K9tEn}s00Fj%7R?'} alt="background" />);

      column.push(
        <div key={startIndex + j} className="image">
          <img src={images[startIndex + j]} alt="background" />
        </div>
      );
    }
    return column;
  };

  const createGallery = () => {
    const gallery = [];
    for (let i = 0; i < columns; i++) {
      gallery.push(
        <div key={i} className={i % 2 === 0 ? 'image_column sliding-down' : 'image_column sliding-up'}>
          {createColumn(i * imagePerColumn)}
        </div>
      );
    }
    return gallery;
  };

  return <>{createGallery()}</>;
};

export default Gallery;
