import { Spinner } from "reactstrap";
import { useSelector } from "react-redux";

const BusyLoader = () => {
  const isShowLoader = useSelector((state) => (state && state.busyloader ? state.busyloader.loaderStatus : false));

  return (
    <>
      {isShowLoader ? (
        <div className={"parentDisable"} width="100%">
          <div className="d-flex justify-content-center my-1 loading">
            <Spinner />
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
export default BusyLoader;
