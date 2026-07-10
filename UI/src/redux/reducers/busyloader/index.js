// **  Initial State
const initialState = {
  loaderStatus: false,
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SHOW_LOADER":
      return { ...state, loaderStatus: action.value };
    default:
      return state;
  }
};

export default loaderReducer;
