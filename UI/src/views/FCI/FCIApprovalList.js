import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";

import React from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl } from "../../urlConstants";
import { RefreshBlock } from "../common/RefreshBlock";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";

export const taColumns = [
  {
    name: "Vehicle No",
    selector: "VEHICAL_NO",
    sortable: true,
    minWidth: "150px",
  
  },
  {
    name: "PO Number",
    selector: "ZPO_NUMBER",
    sortable: true,
    minWidth: "100px",
  },
  // {
  //   name: "Supplier Name",
  //   selector: "ZSUPPLIER_NAME",
  //   sortable: true,
  //   minWidth: "300px",
  // },
  {
    name: "Loading point",
    selector: "ZSUPPLIER_LOAD_POINT",
    sortable: true,
    minWidth: "150px",
  },
  {
    name: "Loading date",
    selector: "ZSUPPLIER_LOAD_DT",
    sortable: true,
    minWidth: "100px",
  },
  {
    name: "Plant Name",
    selector: "PLANT_NAME",
    sortable: true,
    minWidth: "230px",
  },
  {
    name: "EDA",
    selector: "EDA",
    sortable: true,
    minWidth: "150px",
  },
];

const FCIApprovalList = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "150px",
    cell: (row) => {
      return (
        <>
        {row.FCI_STATUS == 0 && (UserDetails.plantids.length == 0 || UserDetails.DEPARTMENT == 'PU') &&
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/FCIENTRYAPPROVAL:${row.SUP_VE_REFID}`);
            }}
           >
            {"Approve"}
          </Button.Ripple>}{row.FCI_STATUS == 1 && (UserDetails.plantids.length == 0 || UserDetails.DEPARTMENT == 'PU') &&
          <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/FCIENTRYAPPROVAL:${row.SUP_VE_REFID}`);
            }}
           >
            {"Edit"}
          </Button.Ripple>}&nbsp;
          {row.purchase_info_id == 0 && (UserDetails.plantids.length == 0 || UserDetails.DEPARTMENT == 'PU') &&
          <Button.Ripple
            color="danger"
            // onClick={(e) => {
            //   history.push(`/FCIENTRYAPPROVAL:Delete-${row.SUP_VE_REFID}`);
            // }}
            onClick={(e) => SDIDeleteById(row.SUP_VE_REFID)}
           >
            {"Delete"}
            
          </Button.Ripple>
          }&nbsp;
          {row.FCI_STATUS == 1 && row.purchase_info_id == 0 &&
          <Button.Ripple
            color="primary"
            onClick={() => print(row)}
           >
            {"Print"}
          </Button.Ripple>}
          
        </>     
      );
    },
    
  };
  let { showLoader, hideLoader } = useLoader();
  const print = (row) => {
        window.open(`/public/#/FCISMARTFORM/${row.SUP_VE_REFID}`)
  }
  const SDIDeleteById = (id)=>{
   
    let fdata = {
      id: id,
    };
    confirmDialog({
      title: 'Are you sure to Reject?',
      description: 'FCI Loading Entry',
    }).then((res) => {
      if (res) {
    showLoader();
    apiPostMethod(apiBaseUrl + "sdi/Deletesdi", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
      }})
  }
  const columns = [...taColumns, actionsCol];
  return (
    <div>
      <RefreshBlock />
      <Card>
        <CardHeader>
          <CardTitle>{"FCI Loading Approval"}</CardTitle>
        </CardHeader>
        <CardBody>
           <TableComponent columns={columns} url={apiBaseUrl + `FCITruckController/getsdiVehicleList/${UserDetails.USERID}`} />
        </CardBody>
      </Card>
    </div>
  );
};

export default FCIApprovalList;
