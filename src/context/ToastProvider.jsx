import React, {createContext, useReducer, useState} from 'react';

export const ToastContext = createContext();

const initialState = {
  toasts: [],
};

const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

const toastReducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return {toasts: [...state.toasts, action.payload]};
    case REMOVE_TOAST:
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
    default:
      return state;
  }
};

const ToastProvider = ({children}) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const [timers, setTimers] = useState({}); // Store timers in state

  const addToast = (type, message) => {
    if (state.toasts.length < 5) {
      const id = Date.now();
      dispatch({type: ADD_TOAST, payload: {id, type, message}});

      // Set a timer for this toast and store it in timers state
      const timer = setTimeout(() => {
        removeToast(id);
      }, 5000);
      setTimers((prevTimers) => ({...prevTimers, [id]: timer}));
    } else {
      return;
    }
  };

  const removeToast = (id) => {
    dispatch({type: REMOVE_TOAST, payload: id});

    // Clear the timer associated with this toast
    if (timers[id]) {
      clearTimeout(timers[id]);
      setTimers((prevTimers) => {
        const updatedTimers = {...prevTimers};
        delete updatedTimers[id];
        return updatedTimers;
      });
    }
  };

  return <ToastContext.Provider value={{toasts: state.toasts, addToast, removeToast}}>{children}</ToastContext.Provider>;
};

export default ToastProvider;
