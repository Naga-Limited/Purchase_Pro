import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, CardTitle, CardText } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { ShowToast, errorToast, statusCode } from "../../helper/appHelper";
import { apiBaseUrl, BASE_URL, evaUrl, vaUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { useState } from "react";
import OverAllDetails from "./OverAllDetails";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "TRUCK_NO",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "PURPOSE",
        selector: "SCREEN_TYPE",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.SCREEN_TYPE == 'EVADP' ? 'IAS' : row.SCREEN_TYPE}</span>
            </>
        },
    },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OVERALL DURATION",
        selector: "DateAdded",
        sortable: false,
        minWidth: "170px",
        cell: (row) => {
            return <ElapsedTimer date={row.DateAdded} />
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
                            {row.StatusName == 'Gate In' ? 'Waiting for In' : row.isRedirect == 1 && row.redirectMasterPlantId != null && row.secondWeight == null ? 'Redirect Gate Out' : row.StatusName}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const TruckDetails = ({ url, actionRendorer, loadingData, getLoadingData }) => {

    const [QRControl, SetQRControl] = useState(false);
    const [QRControl1, SetQRControl1] = useState(false);

    const QRCodeControl = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == 1) {
                    SetQRControl(data.results)
                    SetQRControl1(data.gateout)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    useEffect(() => {
        // if(){
        QRCodeControl()
        // }
    }, [])    
    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "240px",
        cell: (row) => {
            let status = Number(row.VECHICAL_STATUS)
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    {row.StatusName == "Gate In" && row.VEHICLE_STATUS == 6 && QRControl1 === false ? <Button.Ripple color="primary" className='ml-1' type="button" onClick={() => GateIn(row.ID)}>Gate In</Button.Ripple> : null}
                    {(row.StatusName == "Gate Out" && row.VEHICLE_STATUS == 4 && QRControl1 === false) ? <Button.Ripple color="primary" type="button" onClick={() => onActionClick(row)} className='ml-1'>Gate Out</Button.Ripple> : null}
                    {row.SCREEN_TYPE == "SILOTOMILL" && row.VEHICLE_STATUS == 5 && QRControl1 === false ? <Button.Ripple color="primary" onClick={(e) => onUpdateGateOut(row.ID)} className='ml-1'>
                        Gate Out
                    </Button.Ripple>
                        : null}

                    {row.SCREEN_TYPE != "SILOTOMILL" && row.RejectionStatus != "R" && row.VEHICLE_STATUS == 5 && QRControl1 === false ? <Button.Ripple color="primary" onClick={(e) => onUpdateStatus(statusCode.GATEOUT, row.ID)} className='ml-1'>
                        Gate Out
                    </Button.Ripple>
                        : null}
                    {row.SCREEN_TYPE != "SILOTOMILL" && row.RejectionStatus == "R" && QRControl1 === false ? <Button.Ripple color="primary"
                        onClick={(e) => {
                            let msg = "This Vehicle got rejected . Are you sure you want to proceed for gateout?";

                            confirmDialog({
                                title: "Are you sure?",
                                description: msg,
                            }).then((res) => {
                                if (res) {
                                    onUpdateStatus(statusCode.REJECTED_GATE_OUT, row.ID)
                                }
                            });
                        }} className='ml-1'>
                        Gate Out
                    </Button.Ripple> : null
                    }
                    {row.VEHICLE_STATUS == 4 || row.VEHICLE_STATUS == 6 && row.SCREEN_TYPE != "" ?
                        <Button.Ripple color="primary" size="sm" type="button" onClick={() => overAllDetails(row.ID)} className='ml-1'>View</Button.Ripple > : null
                    }
                    {row.VEHICLE_STATUS == 4 && row.returnRefNo == null ?
                        <Button.Ripple color="primary" size="sm" type="button" onClick={() => print(row)} className='ml-1'>Print</Button.Ripple> : null
                    }
                    {row.VEHICLE_STATUS == 15 ?
                        <Button.Ripple color="primary" size="sm" type="button" onClick={() => PrintPDF(row)} className='ml-1'>Print</Button.Ripple> : null
                    }
                    {status == 5 && (row.SCREEN_TYPE == 'SILOTOMILL' || row.SCREEN_TYPE == 'IAS') && QRControl1 === false ?
                        <Button.Ripple
                            color="primary"
                            className='ml-1'
                            onClick={(e) => {
                                let { PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;

                                if (row.SCREEN_TYPE == "SILOTOMILL") {
                                    history.push(`/silotomill/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
                                } else {
                                    history.push(`/ias/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
                                }
                            }}
                        >
                            Gate Out
                        </Button.Ripple> : null}
                    {status == 5 && (row.SCREEN_TYPE == 'SILOTOMILL' || row.SCREEN_TYPE == 'IAS') ?
                        <Button.Ripple
                            color="primary"
                            className='ml-1'
                            onClick={(e) => {
                                window.open(BASE_URL + "/#/Slip:" + row.EMPTY_VEHICLE_ARRIVAL_ID, "", "width=900,height=650")
                            }}
                        >
                            Print
                        </Button.Ripple> : null}
                {status == 1 && (row.SCREEN_TYPE == 'SDI' || row.SCREEN_TYPE == 'SDO') && QRControl1 === false ? 
                    <Button.Ripple
                    color="primary"
                    className='ml-1'
                    onClick={(e) => 
                        confirmDialog({
                            title: "Are you sure want to Gate In?",
                          }).then((res) => {
                            if (res) {
                        onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.UNLOAD)}
                        })}
                    >
                    Gate In
                    </Button.Ripple>: null}
                {row.VEHICLE_STATUS == 1 && (row.SCREEN_TYPE == 'EVADP' || row.SCREEN_TYPE == 'SILOTOMILL') && status != 1 && QRControl1 === false ? 
                    <Button.Ripple
                    color="primary"
                    className='ml-1'
                    onClick={(e) => onUpdateStatusLoadWaitin(row.VEHICLE_STATUS, row.ID)}
                    >
                    Gate In
                    </Button.Ripple>: null}
                {status == 1 && (row.SCREEN_TYPE == 'IAS' || row.SCREEN_TYPE == 'SILOTOMILL') && QRControl1 === false ? 
                    <Button.Ripple
                    color="primary"
                    className='ml-1'
                    onClick={(e) => onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK)}
                    >
                    Gate In
                    </Button.Ripple>: null}
                {status == 5 && (row.SCREEN_TYPE == 'SDI' || row.SCREEN_TYPE == 'SDO') ?
                    <>
                    <Button.Ripple
                        color="primary"
                        className='ml-1'
                        onClick={(e) => {
                        if (row.QA_STATUS === "R" && status== statusCode.GATEOUT) {
                            let msg = "This Vehicle got rejected by QC. Are you sure you want to proceed for gateout?";
                            if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy>0) {
                            msg = `This ${row.VEHICLE_TYPE} got redirected to another plant. Are you sure you want to proceed for gateout`;
                            }
                            confirmDialog({
                            title: "Are you sure?",
                            description: msg,
                            }).then((res) => {
                            if (res) {
                                if(row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy>0){
                                    onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN,row.REDIRECT_LGORT,row.REDIRECT_WERKS,row.REDIRECT_PO_LINE_ITEM);
                                } else {
                                    onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.REJECTED_GATE_OUT);
                                }
                                //

                                            }
                                        });
                                    } else {
                                        onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK);
                                    }
                                }}
                            >{`${status == statusCode.IN ? "Gate In" : status == statusCode.GATEOUT ? "Gate Out" : ""}`}</Button.Ripple>
                            <Button.Ripple
                                color="primary"
                                className='ml-1'
                                onClick={(e) => {
                                    history.push(`/QAView:${row.PI_REFID}/VA`);
                                }}
                            >
                                {"View QC"}
                            </Button.Ripple>
                        </>
                        : null}
                </Row>
            );
        },
    };

    const print = (row) => {
        if (row.moduleTypeId == 1 || row.moduleTypeId == 39 || row.moduleTypeId == 43) {
            window.open(`/public/#/SmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 2) {
            window.open(`/public/#/StoSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
            window.open(`/public/#/FgReturnSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            window.open(`/public/#/SsAndPmReturnSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 5 || row.moduleTypeId == 22) {
            window.open(`/public/#/GatePassSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20) {
            window.open(`/public/#/SsAndPmSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 7) {
            window.open(`/public/#/SDGSalesSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 8) {
            window.open(`/public/#/RMSalesSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 25 || row.moduleTypeId == 33 || row.moduleTypeId == 34) {
            window.open(`/public/#/Purchase/SmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 13) {
            window.open(`/public/#/SDGStoSmartForm/${row.ID}`)
        }else if (row.moduleTypeId == 14 || row.moduleTypeId == 45) {
            window.open(`/public/#/RmWaterSmartForm/${row.ID}`)
        } else if (row.moduleTypeId == 24 || row.moduleTypeId == 26 || row.moduleTypeId == 27 || row.moduleTypeId == 28 || row.moduleTypeId == 29 || row.moduleTypeId == 30 || row.moduleTypeId == 31 || row.moduleTypeId == 37|| row.moduleTypeId == 38 || row.moduleTypeId == 40 || row.moduleTypeId == 41 || row.moduleTypeId == 42 || row.moduleTypeId == 44) {
            window.open(`/public/#/OverAllSmartForm/${row.ID}`)
        }
    }
   
    const PrintPDF = (row) => {
        if (row.SCREEN_TYPE == "SILOTOMILL") {
            window.open(BASE_URL + "/#/STMSlip:" + row.ID, "", "width=900,height=650")
        } else {
            window.open(BASE_URL + "/#/Slip:" + row.ID, "", "width=900,height=650")
        }
    }

    const onActionClick = (row) => {
        if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
            history.push(`/FGReturn/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 2 && row.movementType == 1) {
            history.push(`/STO/Loading/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 2 && row.movementType == 2) {
            history.push(`/STO/Unloading/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 1 || row.moduleTypeId == 29 || row.moduleTypeId == 43) {

            apiPostMethod(apiBaseUrl + `GatePro/Gate/getDeliveryDetails/${row.ID}`)
                .then((response) => {
                    const { data } = response;
                    if (data.success == true) {
                        let stoData = data.stoDeliveryInfo;
                        if (stoData.length > 0) {
                            history.push(`/STO/Loading/GateOut/${row.ID}`);
                        } else {
                            history.push(`/FG/GateOut/${row.ID}`);
                        }
                    }
                    else if (data.success == false) {
                        history.push(`/FG/GateOut/${row.ID}`);
                    }
                }).catch((error) => {
                    console.log(JSON.stringify(error))
                    errorToast("Something went wrong, please try again after sometime");
                })

        } else if ((row.movementType == 1) && (row.moduleTypeId == 6 || row.moduleTypeId == 20 || row.moduleTypeId == 44)) {
            history.push(`/SSANDPM/GateOut/${row.ID}`);
        } else if ((row.movementType == 2) && (row.moduleTypeId == 6 || row.moduleTypeId == 20)) {
            history.push(`/SSANDPM/Unloading/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            history.push(`/SSANDPM/loading/return/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 8) {
            history.push(`/RMSales/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 14 || row.moduleTypeId == 45) {
            history.push(`/RMWater/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 7) {
            history.push(`/SDGSales/GateOut/${row.ID}`);
        } else if (row.movementType == 1 && row.moduleTypeId == 13) {
            history.push(`/SDG/sto/GateOut/${row.ID}`);
        } else if (row.movementType == 2 && row.moduleTypeId == 13) {
            history.push(`/SDG/sto/unloading/GateOut/${row.ID}`);
        } else if (row.movementType == 1 && row.moduleTypeId == 5) {
            history.push(`/GatePass/Loading/Gateout/${row.ID}`);
        } else if (row.movementType == 2 && row.moduleTypeId == 5) {
            history.push(`/GatePass/Unloading/Gateout/${row.ID}`);
        } else if (row.moduleTypeId == 22) {
            history.push(`/GatePass/Unloading/GatePassReceiptGateOut/${row.ID}`);
        } else if (row.moduleTypeId == 10) {
            history.push(`/GatePass/Unloading/GatePassGateOut/${row.ID}`);
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 25 || row.moduleTypeId == 33 || row.moduleTypeId == 34) {
            history.push(`/purchase/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 24 || row.moduleTypeId == 31) {
            history.push(`/CustomMilling/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 26) {
            history.push(`/GoodsMovement/GoodsMovementGateOut/${row.ID}`);
        } else if (row.moduleTypeId == 27) {
            history.push(`/SewageAndCivil/GateOut/${row.ID}`);
        } else if (row.moduleTypeId == 28) {
            history.push(`/CivilTruck/GateOut/${row.ID}`);
        } 
        else if (row.moduleTypeId == 37 || row.moduleTypeId == 39 || row.moduleTypeId == 40 || row.moduleTypeId == 41 || row.moduleTypeId == 42) {
            history.push(`/D2RSales/GateOut/${row.ID}`);
        } 
        else if (row.moduleTypeId == 30) {
            history.push(`/R&DSample/GateOut/${row.ID}`);
        }else if (row.moduleTypeId == 38) {
            history.push(`/Diesel/GateOut/${row.ID}`);
        }
    };

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const onUpdateStatus = (status, id) => {
        console.log("onUpdateStatus", status, id);
        if (statusCode.GATEOUT == status) {
            history.push(`/warehouse/IAS/GateOut:` + id);
        }
        else {
            let fdata = { ID: id, VEHICLE_STATUS: statusCode.INTRANSIT, formType: "U" };
            showLoader();
            apiPostMethod(evaUrl, fdata)
                .then((response) => {
                    const { data } = response;
                    if (data.success) {

                    }
                })
                .catch(() => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(() => hideLoader());
        }
    };
    const onUpdateStatusUnLoad = (val, id, INCO1, status, REDIRECT_LGORT, REDIRECT_WERKS, REDIRECT_PO_LINE_ITEM) => {
        //if (val === statusCode.IN || status === statusCode.REJECTED_GATE_OUT)
        if (val === statusCode.IN || status === statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN || status === statusCode.REJECTED_GATE_OUT) {
            let fdata = { id: id, status: status, formType: "U", pod: INCO1, REDIRECT_LGORT, REDIRECT_WERKS, REDIRECT_PO_LINE_ITEM };
            showLoader();
            apiPostMethod(vaUrl, fdata)
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        // setFilter((p) => ({ ...p }));
                        window.location.reload();
                    }
                })
                .catch((error) => {
                    console.log(error);
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        } else if (val === statusCode.GATEOUT) {
            history.push(`/UP:${id}`);
        }
    };
    const onUpdateGateOut = (id) => {
        history.push(`/STM_Gateout:${id}/EVADPTruck`);
    };
    const onUpdateStatusLoadWaitin = (status, id) => {
       
        let fdata = { ID: id, VEHICLE_STATUS: status, formType: "U" };
        showLoader();
        apiPostMethod(evaUrl, fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
                window.location.reload();
            }
          })
          .catch(() => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally(() => hideLoader());
        }
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const GateIn = (id) => {

        const postdata = {
            gateInOutInfoId: id,
            moduleStatusId: 1,
            userInfoId: UserDetails.USERID
        }

        confirmDialog({
            title: `<h4>Are you sure want to Gate In?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
                apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
                    .then((response) => {
                        const res = response.data;
                        if (res.success == true) {
                            ShowToast(res.message);
                            getLoadingData()
                        }
                        else if (res.success == false) {
                            errorToast(res.message)
                        }
                        console.log(res);
                    })
                    .catch((error) => {
                        console.log(error)
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            }
        })
            .catch((error) => {
                errorToast("Something went wrong please try again after sometime");

            });
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                {/* <CardHeader><h5>Truck Details</h5></CardHeader> */}<br />
                <CardBody>
                    <TableComponent columns={columns} data={loadingData} />
                </CardBody>
            </Card>

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}
        </div>
    );
};

export default TruckDetails;
