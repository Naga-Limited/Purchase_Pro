import React, { Fragment, useState } from "react";
import { apiBaseUrl, evaUrl, vaUrl } from "../../urlConstants";
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
import BarcodeScanner from "../common/BarcodeScanner";
import QRCodeScanner from "../common/QRCodeScanner";
import { useHistory } from "react-router-dom";
import { ShowToast, statusCode } from "../../helper/appHelper";
import { parseInt } from "lodash";
import FGSalesGatein from "./FGSalesGatein";

const GateIn = () => {

    let { showLoader, hideLoader } = useLoader();

    const [isDisable, setIsDisable] = useState(false);
    const [data, setData] = useState([]);
    const [moduleTypeId, setModuleTypeId] = useState("");
    const [userGate, setUserGate] = useState("");
    const [QRControl, SetQRControl] = useState(false);
    const [QRControl1, SetQRControl1] = useState(false);
    const [QRControl2, SetQRControl2] = useState(false);

    const [show, setShow] = useState(false);
    const [checkVehicleNo, setCheckVehicleNo] = useState(true);

    const [shipmentOrderNo, setShipmentOrderNo] = useState('');
    const [truckValue, setTruckValue] = useState('');
    const [scannedData, setScannedData] = useState('');

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results[0])
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
    const QRCodeControl = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == 1) {
                    SetQRControl(data.results)
                    SetQRControl1(data.gatein)
                    SetQRControl2(data.gateout)
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
        QRCodeControl()
    }, [])

    const checkUserGate = (barcode) => {
        if (userGate.userGateId == 0) {
            confirmDialog({
                title: `<h5><strong class="text-white">Gate not Assigned for User, Please Contact Admin</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        } else {
            getGateInInfo(barcode)
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

    const getGateInInfo = (barcode) => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue||barcode}/0/0/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/${truckValue||barcode}/0/0/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGateInOutInfoData(data.results[0])
                    setModuleTypeId(data.results[0].moduleTypeId)
                    setIsDisable(true)
                }
                else if (data.success == false) {
                    getTripsheetDetailsForFG(barcode)
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
            const postData = { Vehicle_Number: truckValue||type, userInfoId: UserDetails.USERID, isMovement: userGate.isMovement }
            console.log(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData);
            apiPostMethod(apiBaseUrl + `GatePro/Master/getTripsheetDetailsForFG`, postData)
                .then((response) => {
                    const { data } = response;
                    let plantValidation = data.results[0]?.SAP_LINE?.map(line => line.PLANT) || [];
                    const userPlantIds = Array.isArray(UserDetails.plantids) ? UserDetails.plantids : [];
                    const plantValidation1 = plantValidation.every(plant => userPlantIds.includes(plant));
                    console.log(plantValidation1)
                    if (data.success == true) {
                        if (data.results[0].loadingAndUnloadingInfoId > 0) {
                            if (data.results[0].movementTypeId == 1) {
                                if (data.results[0].moduleTypeId == 24 && data.results[0].isApproved == 0) {
                                    confirmDialog({
                                        title: `<h5><strong class="text-white">` + 'Please Get Approve From Manager' + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                                    })
                                }else {
                                    setIsDisable(true)
                                    setData(data.results[0])
                                    setModuleTypeId(data.results[0].moduleTypeId)
                                    setShipmentOrderNo(data.results[0].SAP_LINE);
                                }
                            } else {
                                errorToast("Please Enter Correct Vehicle No")
                            }
                        }else if(plantValidation1 == false && data.results[0]?.SAP_LINE[0]?.PLANT){
                            confirmDialog({
                                title: `<h5><strong class="text-white">` + 'This Vehicle is Planned to Load ' + data.results[0]?.SAP_LINE[0]?.PLANT + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                            })
                        }
                        else if (userGate.isMovement == 0 || UserDetails.USERID == 1 || userGate.userGateId == 6 || userGate.userGateId == 3 || userGate.userGateId == 4 || userGate.userGateId == 5 || userGate.userGateId == 24) {
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
                        } else if (userGate.userGateId == 19 || userGate.userGateId == 22 || userGate.userGateId == 23 || userGate.userGateId == 24) {
                            setIsDisable(true)
                            setData(data.results[0])
                            setModuleTypeId(data.results[0].moduleTypeId)
                           
                        }else {
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
                    if (UserDetails.USERID == 1 || userGate.userGateId == 6 ||userGate.userGateId == 3 || userGate.userGateId == 4 || userGate.userGateId == 5 || userGate.userGateId == 24) {
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

    const handleScan = (barcode) => {
        fetchData(barcode)
    };
    const fetchData = (barcode) => {
        console.log(`Fetching data for barcode: ${barcode}`);
        setTruckValue(barcode)
    const values = loadingData;
    const otherKey = values.filter(
      opt => opt.TRUCK_NO === barcode
    );

        if(otherKey.length == 0){
            checkUserGate(barcode)
        }else if(otherKey.length > 0){
            entryShow(otherKey[0])
        }else{
            errorToast('Please Check Vehicle No...')
        }
    };
    const entryShow = (row) => {
        let status = Number(row.VECHICAL_STATUS)
        console.log(row.VEHICLE_STATUS)

                if(row.StatusName == "Gate In" && row.VEHICLE_STATUS == 6){
                    WaitingGateIn(row.ID)
                }else if(row.StatusName == "Gate Out" && row.VEHICLE_STATUS == 4 ){
                     onActionClick(row)
                }else if(row.SCREEN_TYPE == "SILOTOMILL" && row.VEHICLE_STATUS == 5){ 
                     onUpdateGateOut(row.ID)
                }else if(row.SCREEN_TYPE != "SILOTOMILL" && row.RejectionStatus != "R" && row.VEHICLE_STATUS == 5 ){
                     onUpdateStatus(statusCode.GATEOUT, row.ID)
                }else if(row.SCREEN_TYPE != "SILOTOMILL" && row.RejectionStatus == "R" ){
                 
                            let msg = "This Vehicle got rejected. Are you sure you want to proceed for gateout?";
                            confirmDialog({
                                title: "Are you sure?",
                                description: msg,
                            }).then((res) => {
                                if (res) {
                                    onUpdateStatus(statusCode.REJECTED_GATE_OUT, row.ID);
                                }
                            });          
                }else if(status == 5 && (row.SCREEN_TYPE == "SILOTOMILL" || row.SCREEN_TYPE == "IAS")){
                    const { PI_REFID: arrivalId, EMPTY_VEHICLE_ARRIVAL_ID: emtArrivalId, VEHICLE_TYPE: type } = row;
                    if (row.SCREEN_TYPE == "SILOTOMILL") {
                        history.push(`/silotomill/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
                    } else {
                        history.push(`/ias/gateout/receiving/${type.toLowerCase()}/${emtArrivalId}/VA/${arrivalId}`);
                    }
                }else if(status == 1 && (row.SCREEN_TYPE == "SDI" || row.SCREEN_TYPE == "SDO")){
                    onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.UNLOAD)
                }else if(row.VEHICLE_STATUS == 1 && (row.SCREEN_TYPE == "EVADP" || row.SCREEN_TYPE == "SILOTOMILL") && status != 1){
                    onUpdateStatusLoadWaitin(row.VEHICLE_STATUS, row.ID)      
                }else if(status == 1 && (row.SCREEN_TYPE == "IAS" || row.SCREEN_TYPE == "SILOTOMILL")){
                    onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK)   
                }else if(status == 5 && (row.SCREEN_TYPE == "SDI" || row.SCREEN_TYPE == "SDO")){
                                if (row.QA_STATUS == "R" && status == statusCode.GATEOUT) {
                                    let msg = "This Vehicle got rejected by QC. Are you sure you want to proceed for gateout?";
                                    if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy > 0) {
                                        msg = `This ${row.VEHICLE_TYPE} got redirected to another plant. Are you sure you want to proceed for gateout?`;
                                    }
                                    confirmDialog({
                                        title: "Are you sure?",
                                        description: msg,
                                    }).then((res) => {
                                        if (res) {
                                            if (row.PICK_SLIP_NO || row.UnloadingRedirectGateoutBy > 0) {
                                                onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.REDIRECT_GATEOUT_AFTER_GATE_IN, row.REDIRECT_LGORT, row.REDIRECT_WERKS, row.REDIRECT_PO_LINE_ITEM);
                                            } else {
                                                onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.REJECTED_GATE_OUT);
                                            }
                                        }
                                    });
                                } else {
                                    onUpdateStatusUnLoad(status, row.PI_REFID, row.INCO1, statusCode.QC_CHECK);
                                }
                            }
    };
    const WaitingGateIn = (id) => {

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
    const history = useHistory();
    const onActionClick = (row) => {
    console.log(row)
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

            } else if ((row.movementType == 1) && (row.moduleTypeId == 6 || row.moduleTypeId == 20)) {
                history.push(`/SSANDPM/GateOut/${row.ID}`);
            } else if ((row.movementType == 2) && (row.moduleTypeId == 6 || row.moduleTypeId == 20)) {
                history.push(`/SSANDPM/Unloading/GateOut/${row.ID}`);
            } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
                history.push(`/SSANDPM/loading/return/GateOut/${row.ID}`);
            } else if (row.moduleTypeId == 8) {
                history.push(`/RMSales/GateOut/${row.ID}`);
            } else if (row.moduleTypeId == 14) {
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
    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Loading - Gate In / Out</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                    {QRControl1 == false && 
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
                        </Col> }
                        {(QRControl1 == true || QRControl2 == true) && 
                        <Col md="4" sm="4">
                            <BarcodeScanner onScan={handleScan} Label={'Vehicle'} QRControl = {QRControl1}/>
                            {/* <QRCodeScanner /> */}
                            { truckValue &&
                            <Input type="text" disabled value={truckValue} hidden = {QRControl1 == false}/>}
                        </Col>}
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
                        {/* {UserDetails.USERID != 1 ? <>
                            {(data?.TRIPSHEET_NO != undefined || (gateInOutInfoData != '' && moduleTypeId != 38)) && userGate?.isMovement == 1 && userGate.userGateId != 6 ?
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Movement Type</Label>
                                        <Input type="text" disabled={true} value={"FG"} />
                                    </FormGroup>
                                </Col> : null
                            } </> : null
                        } */}
                        {UserDetails.USERID != 1 ? <>
                            {(data?.TRIPSHEET_NO != undefined || (gateInOutInfoData != '' && moduleTypeId != 38)) && userGate?.isMovement == 1 && (userGate.userGateId != 6 && userGate.userGateId != 3  && userGate.userGateId != 4) ?
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Movement Type</Label>
                                        <Input type="text" disabled={true} value={gateInOutInfoData.moduleType  ? gateInOutInfoData.moduleType	: "FG"} />
                                    </FormGroup>
                                </Col> : null
                            } </> : null
                        }
                        {type == 17 && data.TRIPSHEET_NO != undefined && shipmentOrderNo == '' ? <IasEmptyVehicleArrivalForm data={data} /> : null}
                        {type == 18 && data.TRIPSHEET_NO != undefined && shipmentOrderNo == '' ? <IasEmptyVehicleArrivalForm_STM data={data} /> : null}

                        {/* {((shipmentOrderNo != '' || UserDetails.USERID == 1 || userGate.userGateId == 6) && (data.TRIPSHEET_NO != undefined && type != 17 && type != 18 && type != 2)) || (gateInOutInfoData != '' && gateInOutInfoData?.moduleTypeId != 38) ? <FGSales data={gateInOutInfoData != '' ? gateInOutInfoData : data} setData={gateInOutInfoData != '' ? setGateInOutInfoData : setData} setTruckValue={setTruckValue} setShipmentOrderNo={setShipmentOrderNo} getLoadingData={getLoadingData} setIsDisable={setIsDisable} setShow={setShow} /> : null} */}

                        {((shipmentOrderNo != '' || UserDetails.USERID == 1 || userGate.userGateId == 6) && (data.TRIPSHEET_NO != undefined && type != 17 && type != 18 && type != 2)) || (gateInOutInfoData != '' && gateInOutInfoData?.moduleTypeId != 38) ? <FGSales data={gateInOutInfoData != '' ? gateInOutInfoData : data} setData={gateInOutInfoData != '' ? setGateInOutInfoData : setData} setTruckValue={setTruckValue} setShipmentOrderNo={setShipmentOrderNo} getLoadingData={getLoadingData} setIsDisable={setIsDisable} setShow={setShow} /> : null}

                        {shipmentOrderNo == '' && data.TRIPSHEET_NO != undefined && type != 17 && type != 18 && type != 1 ? <STOLoadingGateIn data={data} setData={setData} setTruckValue={setTruckValue} setShipmentOrderNo={setShipmentOrderNo} getLoadingData={getLoadingData} setIsDisable={setIsDisable} setShow={setShow} /> : null}

                        {moduleTypeId == 6 || moduleTypeId == 20 || ( moduleTypeId == 44 && gateInOutInfoData == '') ? <SSAndPmLoadingGateIn data={data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} /> : null}
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
                        {moduleTypeId == 39 || moduleTypeId == 43 ? <FGSalesGatein data={gateInOutInfoData != '' ? gateInOutInfoData : data} setData={setData} setModuleTypeId={setModuleTypeId} setTruckValue={setTruckValue} setIsDisable={setIsDisable} getLoadingData={getLoadingData} setShow={setShow} setGateInOutInfoData={setGateInOutInfoData}/> : null}
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
