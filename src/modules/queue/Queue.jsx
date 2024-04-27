import {Reorder} from 'framer-motion';
import '../../assets/css/queue.css';

import {usePlayer} from '../../hooks/usePlayer';

import QueueItem from './QueueItem';

import {CgClose} from 'react-icons/cg';

const Queue = ({setIsQueueOpen}) => {
  const player = usePlayer();

  return (
    <article className="queue_wrapper">
      <div className="queue_header">
        <h2>Queue</h2>
        <span onClick={() => setIsQueueOpen(false)}>
          <CgClose />
        </span>
      </div>
      <div className="queue_body">
        <h2>Now Playing</h2>
        <QueueItem track={player.currentSong} />
        {player.queue.length > 1 ? (
          <div className="queue_list">
            <h2>Next Up</h2>
            <Reorder.Group values={player.queue.slice(1)} onReorder={(newQueue) => player.updateQueue([player.currentSong, ...newQueue])}>
              {player.queue.slice(1).map((track) => {
                return (
                  <Reorder.Item key={track.id} value={track}>
                    <QueueItem track={track} />
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default Queue;
