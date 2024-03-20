import '../../assets/css/albums.css';

import React, {useMemo} from 'react';
import {Link} from 'react-router-dom';

import {MdExplicit} from 'react-icons/md';
import {HiHeart} from 'react-icons/hi';
import {HiOutlineHeart} from 'react-icons/hi';

const AlbumTrack = ({album, track, index, userFavs, updateUserFavourites}) => {
  const isFavourite = userFavs.some((favTrack) => favTrack.id === track.id);

  const readableDuration = useMemo(() => {
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(track.duration_ms / 60000);
    const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [track.duration_ms]);

  const handleUserFavourites = () => {
    if (isFavourite) {
      // Remove track from user favourites
      const newFavs = userFavs.filter((favTrack) => favTrack.id !== track.id);
      updateUserFavourites(newFavs);
    } else {
      // Add track to user favourites
      updateUserFavourites(userFavs, track);
    }
  };

  return (
    <div className="track">
      <div className="track-field">
        <span>{index + 1}</span>
      </div>
      <div className="track-field">
        <img src={album.images[0].url} alt={track.name} />
        <div>
          <h3>{track.name}</h3>
          <Link to={`/artist/${album.artists[0].id}`}>
            {track.explicit ? <MdExplicit /> : ''}
            {album.artists[0].name}
          </Link>
        </div>
      </div>
      <div className="track-field" onClick={handleUserFavourites}>
        <span>{isFavourite ? <HiHeart /> : <HiOutlineHeart />}</span>
      </div>
      <div className="track-field">
        <span>{readableDuration}</span>
      </div>
    </div>
  );
};

export default AlbumTrack;
