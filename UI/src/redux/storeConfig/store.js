// ** Redux, Thunk & Root Reducer Imports
import thunk from "redux-thunk";
import createDebounce from "redux-debounced";
import rootReducer from "../reducers/rootReducer";
import { createStore, applyMiddleware, compose } from "redux";
import {loadState} from './localStorage';
// ** init middleware
const middleware = [thunk, createDebounce()];

// ** Dev Tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// persistedState
const persistedState = loadState();
// ** Create store
const store = createStore(rootReducer, persistedState, composeEnhancers(applyMiddleware(...middleware)));

export { store };
