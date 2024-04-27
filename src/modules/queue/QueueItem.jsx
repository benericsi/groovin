import {Link} from 'react-router-dom';

import {FaEllipsisVertical} from 'react-icons/fa6';
import {MdExplicit} from 'react-icons/md';

const QueueItem = ({track}) => {
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
      </span>
    </div>
  );
};

export default QueueItem;
