import '../../assets/css/player.css';

import {usePlayer} from '../../hooks/usePlayer';

const AudioPlayer = () => {
  const {queue, currentSong, playing, shuffle, repeat, setCurrentSong, setQueue, addToQueue, togglePlaying, toggleShuffle, prevSong, nextSong, handleEnd} = usePlayer();

  console.log(queue, currentSong);

  return <div className="player"></div>;
};

export default AudioPlayer;
