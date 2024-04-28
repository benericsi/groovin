import '../../assets/css/queue.css';
import {Reorder} from 'framer-motion';
import {useState, useEffect} from 'react';

import {usePlayer} from '../../hooks/usePlayer';

import QueueItem from './QueueItem';

import {CgClose} from 'react-icons/cg';

const Queue = ({setIsQueueOpen}) => {
  const player = usePlayer();

  const [activeTrack, setActiveTrack] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [actionListIndex, setActionListIndex] = useState(null);

  useEffect(() => {
    if (isDragging) {
      setActionListIndex(null);
    }
  }, [isDragging]);

  const handleTrackPlayButtonClick = (track) => {
    if (player.playing && player.currentSong.id === track.id) {
      player.setPlaying(false);
    } else {
      player.playTrack(track, player.queue.slice(player.queue.indexOf(track)));
    }
  };

  const handleRemoveFromQueue = (track) => {
    player.removeFromQueue(track);
    if (player.currentSong.id === track.id) {
      player.setPlaying(false);
    }
  };

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
        <QueueItem track={player.currentSong} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} handleTrackPlayButtonClick={handleTrackPlayButtonClick} />
        {player.queue.length > 1 ? (
          <div className="queue_list">
            <h2>Next Up</h2>
            <Reorder.Group values={player.queue.filter((track) => track.id !== player.currentSong.id)} onReorder={(newQueue) => player.updateQueue([player.currentSong, ...newQueue])}>
              {player.queue
                .filter((track) => track.id !== player.currentSong.id)
                .map((track) => {
                  return (
                    <Reorder.Item
                      key={track.id}
                      value={track}
                      onDragStart={() => {
                        setIsDragging(true);
                      }}
                      onDragEnd={() => {
                        setIsDragging(false);
                      }}>
                      <QueueItem track={track} activeTrack={activeTrack} setActiveTrack={setActiveTrack} actionListIndex={actionListIndex} setActionListIndex={setActionListIndex} handleTrackPlayButtonClick={handleTrackPlayButtonClick} handleRemoveFromQueue={handleRemoveFromQueue} />
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
