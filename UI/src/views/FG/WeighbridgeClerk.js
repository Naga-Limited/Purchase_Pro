import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import FGGateOut from "./FGGateOut";
import { useSelector } from "react-redux";
import { useState } from "react";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useFormik } from "formik";
import { Yup, validation } from "../forms/custom-form";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "SCREEN DURATION",
        selector: "moduleType",
        sortable: false,
        minWidth: "200px",
        cell: (row) => {
            return <ElapsedTimer date={row.DateAdded} />
        },

    },   
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "WAITING AT",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "180px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.waitingStatus}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const WeighbridgeClerk = ({ url, actionRendorer, getLoadingData }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "210px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row.gateInOutInfoId)}>Action</Button.Ripple>&nbsp;
                </Row>
            );
        },
    };

    const onActionClick = (gateInOutInfoId) => {
        console.log(gateInOutInfoId);
        history.push(`/Weightment/${gateInOutInfoId}`);
    };    

    const [loadingData, setLoadingData] = useState("")

    const getGateInInfo = (moduleStatusId, moduleTypeId) => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/${moduleStatusId}/${moduleTypeId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/${moduleStatusId}/${moduleTypeId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    console.log(data.results[0]);
                    setLoadingData(data.results)
                }                
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    useEffect(() => {
        getGateInInfo(2, 1)
    }, [])


    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>Weighbridge Clerk</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={loadingData} />
                </CardBody>
            </Card>
        </div>
    );
};

export default WeighbridgeClerk;
