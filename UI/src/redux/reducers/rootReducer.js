// ** Redux Imports
import { combineReducers } from "redux";

// ** Reducers Imports
import auth from "./auth";
import navbar from "./navbar";
import layout from "./layout";
import busyloader from "./busyloader";

const rootReducer = combineReducers({
  auth,
  navbar,
  layout,
  busyloader,
});

export default rootReducer;
