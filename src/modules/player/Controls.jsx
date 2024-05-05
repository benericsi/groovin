import React, {useEffect, useRef} from 'react';
import {usePlayer} from '../../hooks/usePlayer';
import {useToast} from '../../hooks/useToast';

const Controls = () => {
  const player = usePlayer();
  const {addToast} = useToast();

  const audioRef = useRef();

  useEffect(() => {
    const audio = audioRef.current;

    const handlePlay = () => {
      player.setPlaying(true);
    };

    const handlePause = () => {
      player.setPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    if (player.playing) {
      audioRef.current.play().catch((error) => {
        console.error(error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [player.playing]);

  useEffect(() => {
    const audio = audioRef.current;

    if (player.currentSong) {
      audio.src = player.currentSong.preview_url;
      audio.play().catch((error) => {
        console.error(error);
        addToast('info', `Preview is not available for '${player.currentSong.name}'.`);
        player.handleEnd();
      });
    }
  }, [player.currentSong]);

  const handleEnd = () => {
    player.handleEnd();
  };

  return (
    <div className="player_controls">
      <audio controls ref={audioRef} onEnded={handleEnd}>
        <source src={player.currentSong?.preview_url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default Controls;
