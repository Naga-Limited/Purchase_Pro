import React from "react";

import { irsUrl } from "../../urlConstants";
import PortDispatchList from "./PortDispatchList";
import { RefreshBlock } from "../common/RefreshBlock";
const TruckArrival = () => {
  return <>
  <RefreshBlock />
  <PortDispatchList url={irsUrl} title={"Port Receipt"} /></>;

};

export default TruckArrival;
