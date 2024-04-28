import {Link} from 'react-router-dom';
import {useRef} from 'react';

import {usePlayer} from '../../hooks/usePlayer';

import {FaEllipsisVertical} from 'react-icons/fa6';
import {MdExplicit} from 'react-icons/md';
import {FaRegPlayCircle, FaRegPauseCircle} from 'react-icons/fa';
import {MdOutlineQueue} from 'react-icons/md';
import {AiOutlinePlusCircle} from 'react-icons/ai';

const QueueItem = ({track}) => {
  const actionListRef = useRef(null);

  const player = usePlayer();

  return (
    <div className="queue_item">
      <div className="queue_item-info">
        <img src={track.image} alt={track.name} />
        <div>
          <Link to={`/album/${track.albumId}`}>{track.name}</Link>
          <Link to={`/artist/${track.artistId}`}>
            {track.explicit ? <MdExplicit /> : ''}
            {track.artist}
          </Link>
        </div>
      </div>
      <span>
        <FaEllipsisVertical />
        <ul className="track-actions-list" ref={actionListRef}>
          <li className="track-actions-item">
            <button className="btn-track-action">
              {track === player.currentSong && player.playing ? <FaRegPauseCircle /> : <FaRegPlayCircle />}
              <span>{track === player.currentSong && player.playing ? 'Pause Song' : 'Play Song'}</span>
            </button>
          </li>
          <li className="track-actions-item">
            <button className="btn-track-action">
              <MdOutlineQueue />
              <span>Add To Queue</span>
            </button>
          </li>
          <li className="track-actions-item">
            <button className="btn-track-action">
              <AiOutlinePlusCircle />
              <span>Add To Playlist</span>
            </button>
          </li>
        </ul>
      </span>
    </div>
  );
};

export default QueueItem;
