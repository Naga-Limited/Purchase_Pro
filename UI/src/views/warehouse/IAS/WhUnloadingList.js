import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useLoader } from "../../../utility/hooks/useLoader";

import { Card, CardBody, CardHeader, CardTitle } from "reactstrap";
import { Button, Row, Col } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import TableComponent from "../../common/TableComponent";
import { useFormik } from "formik";
import { RefreshBlock } from "../../common/RefreshBlock";
import { BASE_URL, apiBaseUrl } from "../../../urlConstants";
import { errorToast, ShowToast } from "../common/appHelper";
import { apiPostMethod } from "../../../helper/axiosHelper";

import { Badge } from "reactstrap";
import { ElapsedTimer } from "../../common/ElapsedTimer";
import { status } from "../../../helper/appHelper";

const WhUnloadingList = () => {
    let { showLoader, hideLoader } = useLoader();
    
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        // validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
    });
    const history = useHistory();
    const taColumns = [
        {
            name: "VA No",
            selector: "ZVA_NUMBER",
            sortable: true,
            minWidth: "250px",
        },
        {
            name: "Vehicle No",
            selector: "TRUCK_NO",
            sortable: true,
            minWidth: "120px",
        },
        {
            name: "Driver No",
            selector: "DRIVER_NO",
            sortable: true,
            minWidth: "120px",
        },
        {
            name: "Overall Duration",
            sortable: false,
            minWidth: "200px",
            cell: (row) => {
                return <ElapsedTimer date={row.DateAdded} />;
            },
        },
        {
            name: "Screen Duration",
            sortable: true,
            minWidth: "150px",
            sortable: false,
            minWidth: "200px",
            cell: (row) => {
                return <ElapsedTimer date={row.DateModified} />;
            },
        },
        {
            name: "Waiting At",
            selector: "VECHICAL_STATUS",
            sortable: true,
            minWidth: "150px",
            cell: (row) => {
              const s = status[row.VEHICLE_STATUS] ? status[row.VEHICLE_STATUS] : {};
              return (
                <Badge color={s.color} pill>
                  {s.title}
                </Badge>
              );
            },
          },
        {
            name: "Plant",
            selector: "PLANT",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Action",
            selector: "",
            minWidth: "100px",
            cell: (row) => {
                return  (
                  <Button.Ripple color="primary" type="Button" onClick={() => onActionClick(row.PONumber, row.ZVA_NUMBER)}>
                    {row.isApproved ? `View2` : "Edit"}
                    {/* {"Edit"} */}
                  </Button.Ripple>
                );
            }
        },
    ];

    const onActionClick = (ponum, vanum) => {
        history.push(`/IASEdit:${ponum}/${vanum}`);
    };

    let id=0;
    useEffect(() => { 
        getReportList();
      }, []);
 

    const getReportList = (FilterData)=>{
        let fdata = {FilterData};
        showLoader();
        // apiPostMethod(apiBaseUrl+'warehouse/Master/getReportList', fdata)
        apiPostMethod(apiBaseUrl+'warehouse/IASSending/getReportList', fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
                form.setValues({
                    ...form.values, CheckList: data.results
                });
            }else{
                errorToast("Data Not Found !!!");      
            }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }

    return (
        <div>
            <RefreshBlock />
            <Card>
                <CardHeader>
                    <CardTitle>{"Reversal List"}</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={taColumns} data ={form.values.CheckList} formType="Report" />
                </CardBody>
            </Card>
        </div>
    )
};
export default WhUnloadingList;