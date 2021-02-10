import { createStore, combineReducers } from 'redux';
import { createAction, handleActions } from 'redux-actions';

const appInitialState = {
  unstoppable: false,
};

const SET_UNSTOPPABLE = 'SET_UNSTOPPABLE';
export const setUnstoppable = createAction(SET_UNSTOPPABLE);

const App = handleActions(
  {
    [SET_UNSTOPPABLE]: (state, { payload }) => ({
      ...state,
      unstoppable: payload,
    }),
  },
  appInitialState,
);

const rootReducer = combineReducers({
  App,
});

const configureStore = () => createStore(rootReducer);
export const store = configureStore();
