import {createContext, useReducer} from 'react';

export const PlayerContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUEUE':
      return {...state, queue: action.payload};
    case 'SET_CURRENT_SONG':
      return {...state, currentSong: action.payload};
    case 'SET_PLAYING':
      return {...state, playing: action.payload};
    default:
      return state;
  }
};

const PlayerProvider = ({children}) => {
  const initialState = {
    queue: [],
    currentSong: null,
    playing: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const setQueue = (tracks) => {
    dispatch({type: 'SET_QUEUE', payload: tracks});
  };

  const setCurrentSong = (track) => {
    dispatch({type: 'SET_CURRENT_SONG', payload: track});
  };

  const setPlaying = (bool) => {
    dispatch({type: 'SET_PLAYING', payload: bool});
  };

  const playTrack = (track, newQueue) => {
    dispatch({type: 'SET_CURRENT_SONG', payload: track});
    dispatch({type: 'SET_QUEUE', payload: newQueue || []});
    dispatch({type: 'SET_PLAYING', payload: true});
  };

  const updateQueue = (newTracks) => {
    if (newTracks.includes(state.currentSong)) {
      dispatch({type: 'SET_QUEUE', payload: newTracks.slice(newTracks.indexOf(state.currentSong))});
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        queue: state.queue,
        currentSong: state.currentSong,
        playing: state.playing,
        setQueue,
        setCurrentSong,
        setPlaying,
        playTrack,
        updateQueue,
      }}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
