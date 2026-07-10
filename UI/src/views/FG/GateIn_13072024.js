import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, InputGroup, Card, CardBody, CardHeader } from "reactstrap";
import { Search } from "react-feather";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { useLoader } from "../../utility/hooks/useLoader";
import FGSales from "./FGSales";
import STOLoadingGateIn from "./STO/Loading/GateIn";
import IasEmptyVehicleArrivalForm from "../IAS/sending/empty-vehicle-arrival/ias-empty-vehicle-arrival-form";
import IasEmptyVehicleArrivalForm_STM from "../IAS/sending/empty-vehicle-arrival/ias-empty-vehicle-arrival-form_stm";
import TruckDetails from "../FG/TruckDetails";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import SSAndPmLoadingGateIn from "../SSAndPM/Loading/GateIn";
import SSAndPmReturnGateIn from "../SSAndPM/Loading/Return/GateIn";
import RMSalesGateIn from "../RM/Loading/RMSalesGateIn";
import { apiGetMethod } from "../../helper/axiosHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import Select from "react-select";
import SDGSGateIn from "../SDG/sales/Loading/SDGSGateIn";
import SDGStoGateIn from "../SDG/sto/Loading/SDGStoGateIn";
import GatePassGateIn from "../GatePass/Loading/GatePassGateIn";
import HandCarryDetails from "./HandCarryDetails";
import CustomMillingGateIn from "../CustomMilling/CustomMillingGateIn";
import GoodsMovementGateIn from "../GoodsMovement/GoodsMovementGateIn";
import SewageAndCivilGateIn from "../SewageAndCivilTruck/Loading/SewageAndCivilGateIn";
import D2RSalesGateIn from "../D2RSales/D2RSalesGateIn"
import DieselGateIn from "../Diesel/DieselGateIn"

const GateIn = () => {

    let { showLoader, hideLoader } = useLoader();

    const [isDisable, setIsDisable] = useState(false);
    const [data, setData] = useState([]);
    const [moduleTypeId, setModuleTypeId] = useState("");
    const [userGate, setUserGate] = useState("");
    const [show, setShow] = useState(false);
    const [checkVehicleNo, setCheckVehicleNo] = useState(true);

    const [shipmentOrderNo, setShipmentOrderNo] = useState('');
    const [truckValue, setTruckValue] = useState('');

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results[0])
                    console.log(data.results[0])
                }
                else if (data.success == false) {
                    // errorToast(res.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getUserPlant()
        getAllGateInOutInfo()
        getLoadingData()
    }, [])

    const checkUserGate = () => {
        if (userGate.userGateId == 0) {
            confirmDialog({
                title: `<h5><strong class="text-white">Gate not Assigned for User, Please Contact Admin</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        } else {
            getGateInInfo()
        }
    }

    const validateTruckNo = (truckNo) => {        

        setTruckValue(truckNo.replace(/[^\w\s]/gi, ""))

        // if (truckNo != "") {
        //     let ObjVal = truckNo;
        //     var panPat = /^[A-Z]{2}[\d]{2}[A-Z]{1,2}[\d]{4}$/;
        //     if (ObjVal.search(panPat) == -1) {
        //         setCheckVehicleNo(false);
        //     } else {
        //         setCheckVehicleNo(true);
        //     }
        // }
    }

    const [gateInOutInfoData, setGateInOutInfoData] = useState([]);

    const getGateInInfo = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue}/0/0/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue}/0/0/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGateInOutInfoData(data.results[0])
                    setModuleTypeId(data.results[0].moduleTypeId)
                    setIsDisable(true)
                }
                else if (data.success == false) {
                    getTripsheetDetailsForFG()
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const getTripsheetDetailsForFG = (type) => {
        // if (checkVehicleNo) {
            showLoader();
            const postData = { Vehicle_Number: truckValue, userInfoId: UserDetails.USERID, isMovement: userGate.isMovement }
            console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData);
            apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData)
                .then((response) => {
                    const { data } = response;
                    if (data.success == true) {
                        if (data.results[0].loadingAndUnloadingInfoId > 0) {
                            if (data.results[0].movementTypeId == 1) {
                                if (data.results[0].moduleTypeId == 24 && data.results[0].isApproved == 2) {
                                    confirmDialog({
                                        title: `<h5><strong class="text-white">` + 'Please Get Approve From Manager' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                                    })
                                } else {
                                    setIsDisable(true)
                                    setData(data.results[0])
                                    setModuleTypeId(data.results[0].moduleTypeId)
                                    setShipmentOrderNo(data.results[0].SAP_LINE);
                                }
                            } else {
                                errorToast("Please Enter Correct Vehicle No")
                            }
                        }
                        else if (userGate.isMovement == 0 || UserDetails.USERID == 1 || userGate.userGateId == 6) {
                            setShow(true)
                            getUserModuleAccess()
                            setIsDisable(true)
                            if (show) {
                                if (type == 1) {
                                    setData(data.results[0])
                                    setModuleTypeId(data.results[0].moduleTypeId)
                                    setShipmentOrderNo(data.results[0].SAP_LINE);

                                } else if (type == 2 || type == 17 || type == 18) {
                                    if (data.results[0].SAP_LINE == '') {
                                        setData(data.results[0])
                                        setModuleTypeId(data.results[0].moduleTypeId)
                                        setShipmentOrderNo(data.results[0].SAP_LINE);
                                    } else {
                                        errorToast("Please Check Movement Type")
                                    }
                                }
                                else {
                                    setData(data.results[0])
                                    setModuleTypeId(data.results[0].moduleTypeId)
                                    setShipmentOrderNo(data.results[0].SAP_LINE);
                                }
                            }
                        } else {
                            setData(data.results[0])
                            setIsDisable(true)
                            setModuleTypeId(data.results[0].moduleTypeId)
                            setShipmentOrderNo(data.results[0].SAP_LINE);
                        }
                    } else {
                        errorToast(data.message)
                    }
                })
                .catch((error) => {
                    console.log(JSON.stringify(error))
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        // }
    }

    const [loadingData, setLoadingData] = useState([])
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const werks = UserDetails.plantids.join(",");

    const checkPlant = ['FR02'];
    const userPlant = UserDetails.plantids.filter((plant) => plant == checkPlant);

    const getLoadingData = () => {

        showLoader();
        const postData = { werks: werks, userGateId: UserDetails.USERID }

        console.log(apiBaseUrl + `LandingDataController/Loading_Data`, postData);
        apiPostMethod(apiBaseUrl + `LandingDataController/Loading_Data`, postData)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    let truck_data = [...data.gate_pro, ...data.ias_stm];
                    setLoadingData(truck_data);
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

    const [moduleTypeData, setModuleTypeData] = useState([])
    const [type, setType] = useState('')

    const selectType = (e) => {
        setType(e.value)
        console.log(e.value);
        getTripsheetDetailsForFG(e.value)
    }

    const getUserModuleAccess = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserModuleAccess/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (UserDetails.USERID == 1 || userGate.userGateId == 6) {
                        const moduleType = data.results.filter((item) => item.movementTypeId == 1 && item.isMovement == 1)
                        if (moduleType != '') {
                            setModuleTypeData(moduleType)
                        } else {
                            errorToast("Module access not found, please contact admin")
                        }
                    } else {
                        const moduleType = data.results.filter((item) => item.movementTypeId == 1 && item.isMovement == 1 && item.moduleTypeId > 2)
                        if (moduleType != '') {
                            setModuleTypeData(moduleType)
                        } else {
                            errorToast("Module access not found, please contact admin")
                        }
                    }
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [handCarryData, setHandCarryData] = useState([])

    const getAllGateInOutInfo = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/0/${UserDetails.USERID}/1`);
        apiGetMethod(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/0/${UserDetails.USERID}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setHandCarryData(data.results.filter((item) => item.movementTypeId == 1))
                }
                else if (data.success == false) {
                    console.log(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Loading - Gate In / Out</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <InputGroup>
                                    <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Truck No" onChange={(e) => validateTruckNo(e.target.value.trim())} value={truckValue} disabled={isDisable} maxLength={10} />
                                    <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={checkUserGate}>
                                        <Search size={20} />
                                    </Button>
                                </InputGroup>
                                {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
                            </FormGroup>
                        </Col>
                        {show ?
                            <Col md="4" sm="12">
                                <FormGroup>
                                    <Label>Movement Type</Label>
                                    <Select
                                        options={moduleTypeData}
                                        onChange={selectType}
                                    />
                                </FormGroup>
                            </Col> : null
                        }
                        {UserDetails.USERID != 1 ? <>
                            {(data?.TRIPSHEET_NO != undefined || (gateInOutInfoData != '' && moduleTypeId != 38)) && userGate?.isMovement == 1 && userGate.userGateId != 6 ?
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Movement Type</Label>
                                        <Input type="text" disabled={true} value={"FG"} />
                                    </FormGroup>
                                </Col> : null
                            } </> : null
                        }
                        {type == 17 && data.TRIPSHEET_NO != undefined && shipmentOrderNo == '' ? <IasEmptyVehicleArrivalForm data={data} /> : null}
                        {type == 18 && data.TRIPSHEET_NO != undefined && shipmentOrderNo == '' ? <IasEmptyVehicleArrivalForm_STM data={data} /> : null}

                        {/* {((shipmentOrderNo != '' || UserDetails.USERID == 1 || userGate.userGateId == 6) && (data.TRIPSHEET_NO != undefined && type != 17 && type != 18 && type != 2)) || (gateInOutInfoData != '' && gateInOutInfoData?.moduleTypeId != 38) ? <FGSales data={gateInOutInfoData != '' ? gateInOutInfoData : data} setData={gateInOutInfoData != '' ? setGateInOutInfoData : setData} setTruckValue={setTruckValue} setShipmentOrderNo={setShipmentOrderNo} getLoadingData={getLoadingData} setIsDisable={setIsDisable} setShow={setShow} /> : null} */}

                        {((shipmentOrderNo != '' || UserDetails.USERID == 1 || userGate.userGateId == 6) && (data.TRIPSHEET_NO != undefined && type != 17 && type != 18 && type != 2)) || (gateInOutInfoData != '' && gateInOutInfoData?.moduleTypeId != 38) ? <FGSales data={gateInOutInfoData != '' ? gateInOutInfoData : data} setData={gateInOutInfoData != '' ? setGateInOutInfoData : setData} setTruckValue={setTruckValue} setShipmentOrderNo={setShipmentOrderNo} getLoadingData={getLoadingData} setIsDisable={setIsDisable} setShow={setShow} /> : null}

                        {shipmentOrderNo == '' && data.TRIPSHEET_NO != undefined && type != 17 && type != 18 && type != 1 ? <STOLoadingGateIn data={data} setData={setData} setTruckValue={setTruckValue} setShipmentOrderNo={setShipmentOrderNo} getLoadingData={getLoadingData} setIsDisable={setIsDisable} setShow={setShow} /> : null}

                        {moduleTypeId == 6 || moduleTypeId == 20 ? <SSAndPmLoadingGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 4 || moduleTypeId == 19 ? <SSAndPmReturnGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 8 ? <RMSalesGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 7 ? <SDGSGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 13 ? <SDGStoGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 5 ? <GatePassGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 24 ? <CustomMillingGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} Unloading_Gate_in_Vehicle={getLoadingData} setSelectedValue={setTruckValue} /> : null}
                        {moduleTypeId == 26 ? <GoodsMovementGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 27 ? <SewageAndCivilGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 29 || (moduleTypeId == 1 && data?.loadingAndUnloadingInfoId > 0) ? <D2RSalesGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
                        {moduleTypeId == 38 ? <DieselGateIn data={gateInOutInfoData != '' ? gateInOutInfoData : data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} setGateInOutInfoData={setGateInOutInfoData}/> : null}
                    </Row>
                </CardBody>
            </Card>

            {loadingData != '' ? <TruckDetails loadingData={loadingData} getLoadingData={getLoadingData} /> : null}

            <HandCarryDetails data={handCarryData} setData={setHandCarryData} getAllGateInOutInfo={getAllGateInOutInfo} />

            {loadingData == '' && handCarryData == '' ? <div style={{ marginBottom: "250px" }}></div> : null}
        </Fragment >
    );
};

export default GateIn;