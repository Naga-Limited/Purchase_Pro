import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import React, { useState } from "react";
import { evaColumns } from "./columnSpec";
import { Row, Col,Button } from "reactstrap";
// ** Store
import { useSelector } from "react-redux";
import { evaUrl } from "../../urlConstants";

import TableComponent from "../common/TableComponent";

import IRSFilterForm from "./IRSFilterForm";
import { CardComponent } from "../common/CardComponent";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import { statusCode } from "../../helper/appHelper";
import { useHistory } from "react-router-dom";
import { RefreshBlock } from "../common/RefreshBlock";
const IrsCompleted = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const [screenType] = useState("EVAOY");
 
  
  /*const [filter] = useState({
    plantIds: UserDetails.plantids,
    formType: "F",
    SCREEN_TYPE: screenType,
    status: "12",
    otherfilter
  });*/
  let [ otherfilter,setFilter] = useState();
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),
   
  });
  let values = form.values;
  const filter = {
    plantIds: UserDetails.plantids,
    formType: "Completed",
    SCREEN_TYPE: screenType,
    status: "11,12,34",
    otherfilter: {
      from: getFromDate(values.date),
      to: getToDate(values.date),
      PlantIdArr: values.PlantId
    }
  };
  
  const history = useHistory();
  const actionColumn = (row) => {
   // let status = row.VEHICLE_STATUS;
   // console.log(JSON.stringify(row))
   
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: "250px",
      cell: (row) => {
        //return <></>;
        return (
         
            <>
              <Button.Ripple
                color="primary"
                onClick={(e) => {
                  let url = `/IRSView:`+row.ID;
                  history.push(url);
                }}
              >
                View
              </Button.Ripple>
            </>
          
        );
      },
    };
    return actionsCol;
  };

  const columns = [...evaColumns, actionColumn()];
  const onSubmit = () => {
    console.log(form.values);
   
   
    setFilter({
      otherfilter: {
        from: getFromDate(values.date),
        to: getToDate(values.date),
        PlantIdArr: values.PlantId,
        //PlantId: getDropdownValue(values.PlantId),
        /*supplierId: getDropdownValue(values.supplierName),
        supplierCategory: getDropdownValue(values.supplierCategory),
        loadingLocationId: getDropdownValue(values.loadingLocation),
        deliveryAtId: getDropdownValue(values.deliveryAt),
        modeOfTransportId: getDropdownValue(values.modeOfTransport),
        bagTypeId: getDropdownValue(values.bagType),
        state: getDropdownValue(values.state),
        zone: getDropdownValue(values.zone),
        city: getDropdownValue(values.city),
        seedVariety: getDropdownValue(values.seedVariety),*/
      },
    });
  };
  const RefreshPage = () => {
    window.location.reload();
  };
  return (
    <div>
       <RefreshBlock />
     
      <CardComponent header="Search Filter">
        <IRSFilterForm form={form} onSubmit={onSubmit}   />
      </CardComponent>
      <Card>
        <CardHeader>
          <CardTitle>{"Vehicle Details"}</CardTitle>
        </CardHeader>
        
        <CardBody>
          <TableComponent postData={filter} columns={columns} url={evaUrl} formType="Completed" />
        </CardBody>
      </Card>
    </div>
  );
};

export default IrsCompleted;
