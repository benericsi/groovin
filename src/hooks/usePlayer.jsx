import {useContext} from 'react';
import {PlayerContext} from '../context/PlayerProvider';

export const usePlayer = () => {
  return useContext(PlayerContext);
};
