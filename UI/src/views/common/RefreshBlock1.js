import React from "react";
import { RotateCw } from "react-feather";
import { Button } from "reactstrap";

const RefreshPage = () => {
  window.location.reload();
};
export const RefreshBlock1 = () => {

  return (
    <>
      <Button color="primary" type="button" onClick={RefreshPage}>
        <b><RotateCw size={15} /></b>
      </Button>
    </>
  );
};
