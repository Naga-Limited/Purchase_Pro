import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import FGGateOut from "./FGGateOut";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useState } from "react";
import { useSelector } from "react-redux";
import OverAllDetails from "./OverAllDetails";

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
        minWidth: "150px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.moduleType == 'EVADP' ? 'IAS' : row.subModuleTypeId == 3 ? row.moduleType+' - Hand Carry' : row.moduleType}</span>
            </>
        },
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OVERALL DURATION",
        selector: "createdOn",
        sortable: false,
        minWidth: "170px",
        cell: (row) => {
            return <ElapsedTimer date={row.createdOn} />
        },

    },
    {
        name: "WAITING AT",
        selector: "StatusName",
        sortable: true,
        minWidth: "150px",
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


const SAPDocumentDetails = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "220px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    {row.moduleTypeId != 24 && row.moduleTypeId != 27 ?
                        <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Action</Button.Ripple> : null
                    }
                    <Button.Ripple color="primary" size="sm" type="button" className={row.moduleTypeId != 24 && row.moduleTypeId != 27 ? 'ml-1' : ''} onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => print(row)}>Print</Button.Ripple>
                </Row>
            );
        },
    };

    const print = (row) => {
        if (row.moduleTypeId == 1 || row.moduleTypeId == 39) {
            window.open(`/public/#/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 2) {
            window.open(`/public/#/StoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20) {
            window.open(`/public/#/SsAndPmSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 8) {
            window.open(`/public/#/RMSalesSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            window.open(`/public/#/SsAndPmReturnSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 7) {
            window.open(`/public/#/SDGSalesSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 5) {
            window.open(`/public/#/GatePassSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 13) {
            window.open(`/public/#/SDGStoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 26 || row.moduleTypeId == 27 || row.moduleTypeId == 29 || row.moduleTypeId == 24 || row.moduleTypeId == 38 || row.moduleTypeId == 44 || row.moduleTypeId == 43) {
            window.open(`/public/#/OverAllSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const onActionClick = (row) => {
        if (row.moduleTypeId == 1 || row.moduleTypeId == 2 || row.moduleTypeId == 29 || row.moduleTypeId == 43) {
            if (row.moduleTypeId == 29) {
                apiGetMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${row.gateInOutInfoId}/${UserDetails.USERID}`)
                    .then((response) => {
                        const { data } = response;
                        if (data.success == true) {
                            let filterData = data.data.filter((item) => item.documentNumber == 'GT SALES')
                            if (filterData != '' || row.moduleStatusId == 3 || row.moduleStatusId == 4) {
                                history.push(`/FG/SAPDocument/${row.gateInOutInfoId}`);
                            }else{
                                history.push(`/D2RSales/SapDocument/${row.gateInOutInfoId}`);
                            }
                        }
                        else if (data.success == false) {
                            // errorToast(data.message);
                        }
                    }).catch((error) => {
                        console.log(JSON.stringify(error))
                        errorToast("Something went wrong, please try again after sometime");
                    })
            } else {
                history.push(`/FG/SAPDocument/${row.gateInOutInfoId}`);
            }
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            history.push(`/SSANDPM/loading/return/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20 || row.moduleTypeId == 44) {
            history.push(`/SSANDPM/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 8) {
            history.push(`/RMSales/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 7) {
            history.push(`/SDGSales/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21) {
            history.push(`/Purchase/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 13) {
            history.push(`/SDG/sto/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 5 || (row.moduleTypeId == 38 && row.secondWeight == null)) {
            history.push(`/GatePass/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 26) {
            history.push(`/GoodsMovement/SapDocument/${row.gateInOutInfoId}`);
        } else if ((row.moduleTypeId == 29 && row.documentNumber != 'GT SALES') || row.moduleTypeId == 39) {
            history.push(`/D2RSales/SapDocument/${row.gateInOutInfoId}`);
        }else if (row.moduleTypeId == 38 && row.secondWeight != null) {
            history.push(`/GatePass/Unloading/GatePassReceiptSapDocument/${row.gateInOutInfoId}`);
        }
    };

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
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
                    const stoData = data.results.filter((item) => (item.movementTypeId == 1 || item.moduleTypeId == 1 || (item.isRedirect == 1 && item.moduleTypeId == 2)));
                    setLandingData(stoData);
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

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}
        </div>
    );
};

export default SAPDocumentDetails;
