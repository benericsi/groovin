import {createContext, useReducer} from 'react';

export const PlayerContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.data,
      };
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.data],
      };
    case 'SET_CURRENT_SONG':
      return {
        ...state,
        currentSong: action.data,
        playing: true,
      };
    case 'TOGGLE_PLAY':
      return {
        ...state,
        playing: action.data,
      };
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        shuffle: action.data,
      };
    case 'TOGGLE_REPEAT':
      return {
        ...state,
        repeat: action.data,
      };
    default:
      return state;
  }
};

const PlayerProvider = ({children}) => {
  const initialState = {
    queue: [],
    currentSong: null,
    playing: false,
    shuffle: false,
    repeat: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const setCurrentSong = (song) => dispatch({type: 'SET_CURRENT_SONG', data: song});
  const setQueue = (songs) => dispatch({type: 'SET_QUEUE', data: songs});
  const addToQueue = (song) => dispatch({type: 'ADD_TO_QUEUE', data: song});
  const togglePlaying = () => dispatch({type: 'TOGGLE_PLAY', data: !state.playing});
  const toggleShuffle = () => dispatch({type: 'TOGGLE_SHUFFLE', data: !state.shuffle});
  const toggleRepeat = () => dispatch({type: 'TOGGLE_REPEAT', data: !state.repeat});

  const prevSong = () => {
    const currentIndex = state.queue.findIndex((song) => song.id === state.currentSong.id);

    if (currentIndex === 0) {
      setCurrentSong(state.queue[state.queue.length - 1]);
    } else {
      setCurrentSong(state.queue[currentIndex - 1]);
    }
  };

  const nextSong = () => {
    const currentIndex = state.queue.findIndex((song) => song.id === state.currentSong.id);

    if (currentIndex === state.queue.length - 1) {
      setCurrentSong(state.queue[0]);
    } else {
      setCurrentSong(state.queue[currentIndex + 1]);
    }
  };

  const handleEnd = () => {
    if (state.shuffle) {
      const randomIndex = Math.floor(Math.random() * state.queue.length);
      return dispatch({type: 'SET_CURRENT_SONG', data: state.queue[randomIndex]});
    } else {
      if (state.repeat) {
        return dispatch({type: 'SET_CURRENT_SONG', data: state.currentSong});
      } else if (state.currentSong === state.queue[state.queue.length - 1]) {
        return;
      } else {
        nextSong();
      }
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        queue: state.queue,
        currentSong: state.currentSong,
        playing: state.playing,
        shuffle: state.shuffle,
        repeat: state.repeat,
        setCurrentSong,
        setQueue,
        addToQueue,
        togglePlaying,
        toggleShuffle,
        prevSong,
        nextSong,
        handleEnd,
      }}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
