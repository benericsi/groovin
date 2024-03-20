import React, {useMemo} from 'react';
import {Link} from 'react-router-dom';

import {MdExplicit} from 'react-icons/md';
import {HiHeart} from 'react-icons/hi';
import {HiOutlineHeart} from 'react-icons/hi';

const PlaylistTrack = ({index, track, userFavs, updateUserFavourites}) => {
  const isFavourite = userFavs.some((favTrack) => favTrack.id === track.id);

  const readableDuration = useMemo(() => {
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(track.duration / 60000);
    const seconds = ((track.duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [track.duration]);

  const readableTimeStamp = useMemo(() => {
    return new Date(track.createdAt.seconds * 1000).toISOString().split('T')[0];
  }, [track.createdAt]);

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
        <img src={track.image} alt={track.name} />
        <div>
          <h3>{track.name}</h3>
          <Link to={`/artist/${track.artistId}`}>
            {track.explicit ? <MdExplicit /> : ''}
            {track.artist}
          </Link>
        </div>
      </div>
      <div className="track-field">
        <Link to={`/album/${track.albumId}`}>{track.album}</Link>
      </div>
      <div className="track-field">
        <span>{readableTimeStamp}</span>
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

export default PlaylistTrack;
