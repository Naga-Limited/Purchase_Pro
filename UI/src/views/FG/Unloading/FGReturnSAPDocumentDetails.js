import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../common/TableComponent";
import { apiBaseUrl } from "../../../urlConstants";
import { apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { ElapsedTimer } from "../../common/ElapsedTimer";
import { useSelector } from "react-redux";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "130px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "170px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.moduleTypeId == 3 ? 'FG-RETURN' : row.moduleType}</span>
            </>
        },
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "SCREEN DURATION",
        selector: "modifiedOn",
        sortable: false,
        minWidth: "160px",
        cell: (row) => {
            return <ElapsedTimer date={row.modifiedOn} />
        },

    },
    {
        name: "WAITING AT",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "250px",
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


const FGReturnSAPDocumentDetails = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "50px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    {/* <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row.gateInOutInfoId, row.moduleTypeId)}>Action</Button.Ripple>&nbsp; */}
                    <Button.Ripple color="primary" size="sm" className="ml-1" type="button" onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                </Row>
            );
        },
    };

    const onActionClick = (gateInOutInfoId) => {
        console.log(gateInOutInfoId);
        history.push(`/FGReturnSapDocument/${gateInOutInfoId}`);
    };

    const screenId = 4;//FG-Return SAP Document Details

    const overAllDetails = (gateInOutInfoId) => {
        history.push(`/OverAllDetails/${gateInOutInfoId}/${screenId}`);
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getLoadingData = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/2/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/2/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    const fgReturnData = data.results.filter((item) => item.moduleTypeId == 3);
                    console.log(fgReturnData);
                    setLandingData(fgReturnData);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    useEffect(() => {
        getLoadingData()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>SAP Document Details</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>
        </div>
    );
};

export default FGReturnSAPDocumentDetails;
