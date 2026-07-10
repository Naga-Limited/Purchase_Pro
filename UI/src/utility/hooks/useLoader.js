import { useCallback } from "react";
import { useDispatch } from "react-redux";
import SHOW_LOADER from "@store/actions/busyloader";

export const useLoader = () => {
  const dispatch = useDispatch();
  const showLoader = useCallback(() => {
    dispatch(SHOW_LOADER(true));
  });
  const hideLoader = useCallback(() => {
    dispatch(SHOW_LOADER(false));
  });
  return {
    showLoader,
    hideLoader,
  };
};
