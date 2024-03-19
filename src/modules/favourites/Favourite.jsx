import React, {useMemo} from 'react';
import {Link} from 'react-router-dom';

import {MdExplicit} from 'react-icons/md';
import {HiHeart} from 'react-icons/hi';

const Favourite = ({track, index, removeTrack}) => {
  const readableDuration = useMemo(() => {
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(track.duration / 60000);
    const seconds = ((track.duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [track.duration]);

  const readableTimeStamp = useMemo(() => {
    return new Date(track.createdAt.seconds * 1000).toISOString().split('T')[0];
  }, [track.createdAt]);

  return (
    <div className="favourite">
      <div className="favourite-field">
        <span>{index + 1}</span>
      </div>
      <div className="favourite-field">
        <img src={track.image} alt={track.name} />
        <div>
          <h3>{track.name}</h3>
          <Link to={`/artist/${track.artistId}`}>
            {track.explicit ? <MdExplicit /> : ''}
            {track.artist}
          </Link>
        </div>
      </div>
      <div className="favourite-field">
        <Link to={`/album/${track.albumId}`}>{track.album}</Link>
      </div>
      <div className="favourite-field">
        <span>{readableTimeStamp}</span>
      </div>
      <div className="favourite-field" onClick={() => removeTrack(track.id)}>
        <span>
          <HiHeart />
        </span>
      </div>
      <div className="favourite-field">
        <span>{readableDuration}</span>
      </div>
    </div>
  );
};

export default Favourite;
