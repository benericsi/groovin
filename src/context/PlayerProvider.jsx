import {createContext, useEffect, useReducer, useState} from 'react';
import {useToast} from '../hooks/useToast';
import {useSpotifyAuth} from '../hooks/useSpotifyAuth';

export const PlayerContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUEUE':
      return {...state, queue: action.payload};
    case 'ADD_TO_QUEUE':
      return {...state, queue: [...state.queue, action.payload]};
    case 'REMOVE_FROM_QUEUE':
      return {...state, queue: state.queue.filter((track) => track.id !== action.payload.id)};
    case 'SET_CURRENT_SONG':
      return {...state, currentSong: action.payload};
    case 'SET_PLAYLIST':
      return {...state, playlist: action.payload};
    case 'SET_PLAYING':
      return {...state, playing: action.payload};
    default:
      return state;
  }
};

const PlayerProvider = ({children}) => {
  const {addToast} = useToast();

  const initialState = {
    queue: [],
    currentSong: null,
    playlist: null,
    playing: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const setQueue = (tracks) => {
    dispatch({type: 'SET_QUEUE', payload: tracks});
  };

  const addToQueue = (track) => {
    // Check if the track is already in the queue
    if (!state.queue.some((existingTrack) => existingTrack.id === track.id)) {
      dispatch({type: 'ADD_TO_QUEUE', payload: track});
    } else {
      addToast('info', 'Track is already in the queue.');
    }
  };

  const removeFromQueue = (track) => {
    dispatch({type: 'REMOVE_FROM_QUEUE', payload: track});
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

  const setPlaylist = (playlist) => {
    dispatch({type: 'SET_PLAYLIST', payload: playlist});
  };

  const nextSong = () => {
    const currentIndex = state.queue.findIndex((track) => track.id === state.currentSong.id);
    const nextIndex = (currentIndex + 1) % state.queue.length;

    if (nextIndex === 0) {
      dispatch({type: 'SET_PLAYING', payload: false});
      dispatch({type: 'SET_CURRENT_SONG', payload: null});
      dispatch({type: 'SET_QUEUE', payload: []});
      dispatch({type: 'SET_PLAYLIST', payload: null});
    } else {
      const nextTrack = state.queue[nextIndex];
      dispatch({type: 'SET_CURRENT_SONG', payload: nextTrack});
    }
  };

  const prevSong = () => {
    const currentIndex = state.queue.findIndex((track) => track.id === state.currentSong.id);
    const prevIndex = (currentIndex - 1 + state.queue.length) % state.queue.length;

    if (prevIndex === state.queue.length - 1) {
      dispatch({type: 'SET_PLAYING', payload: false});
      dispatch({type: 'SET_CURRENT_SONG', payload: null});
      dispatch({type: 'SET_QUEUE', payload: []});
      dispatch({type: 'SET_PLAYLIST', payload: null});
    } else {
      const prevTrack = state.queue[prevIndex];
      dispatch({type: 'SET_CURRENT_SONG', payload: prevTrack});
    }
  };

  const handleEnd = () => {
    const currentIndex = state.queue.findIndex((track) => track.id === state.currentSong.id);
    nextSong();
    dispatch({type: 'REMOVE_FROM_QUEUE', payload: state.queue[currentIndex]});
  };

  return (
    <PlayerContext.Provider
      value={{
        queue: state.queue,
        currentSong: state.currentSong,
        playing: state.playing,
        playlist: state.playlist,
        setQueue,
        addToQueue,
        removeFromQueue,
        setCurrentSong,
        setPlaying,
        playTrack,
        updateQueue,
        setPlaylist,
        nextSong,
        prevSong,
        handleEnd,
      }}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
