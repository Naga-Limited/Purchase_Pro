import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, ModalFooter } from "reactstrap";
import React, { useEffect } from "react";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../common/TableComponent";
import { apiBaseUrl } from "../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { DatePicker } from "../../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, Yup, validation, CustomTextInput } from "../../forms/custom-form";
import moment from "moment";
import { ArrowDown, Save, XCircle } from "react-feather";
import { RefreshBlock1 } from "../../common/RefreshBlock1";
import Select from 'react-select'
// import OverAllDetails from "../OverAllDetails";
import { Modal } from "react-bootstrap";
import { X } from "react-feather";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";
import { CircleMarker } from "leaflet";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "TRUCK_NO",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "VA NUMBER",
        selector: "ZVA_NUMBER",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PURPOSE",
        selector: "SCREEN_TYPE",
        sortable: true,
        minWidth: "180px",
    },
    
    {
        name: "PLANT",
        selector: "PLANT",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "WAITING AT",
        selector: "StatusName",
        sortable: true,
        minWidth: "170px",
        cell: (row) => {
                    return (
                            <FormGroup className="d-flex justify-content-center mb-0">
                                <Badge color="primary" pill>
                                   {row.StatusName}
                                </Badge>
                                
                            </FormGroup>
                    );
        },
    },
];

const WeightCorrection = ({actionRendorer}) => {

    let { showLoader, hideLoader } = useLoader();
    const [landingData, setLandingData] = useState([])
    const [data, setData] = useState([]);
    const [type, setType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState(0);
    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const selectType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setType([e])
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Weight Correction</Button.Ripple>
                </Row>
            )
        },
    };
    const onActionClick = (row) => {
        setShow(true)
        setData(row);
        form.resetForm({ values: { ...row, remarks: '' } });
    };
    const closeRemarksModal = () => setShow(false);
    const approveOrRejectVehicle = (process) => {
        const formData = form.values;

        const postdata = {
            Details: { ...data, ...formData },
            Remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            process:process
        }
        if (postdata.Remarks == "" || postdata.Remarks == undefined) {
            confirmDialog({
              title: `<h5><strong class="text-white">Please Enter Reason</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            return false
          }
        showLoader();
        console.log(apiBaseUrl + "VehicleArrival/WeighmentCorrectionUpdate", postdata);
        apiPostMethod(apiBaseUrl + "VehicleArrival/WeighmentCorrectionUpdate", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    setShow(false)
                    getPurchaseOrderReport()
                    // form.resetForm()
                    // setTimeout(() => {
                    //     window.location.reload();
                    // }, 2500);; // ✅ FIXED
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };
    const getPurchaseOrderReport = () => {

        const formData = form.values
        // const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        // const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        // const fromDateMilliSecond = fromDate.getTime()
        // const toDateMilliSecond = toDate.getTime()

        showLoader();
        apiPostMethod(apiBaseUrl + `VehicleArrival/WeighmentCorrection/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    let data1 = data.results
                    setLandingData(data1)
                }
                else if (data.success == false) {
                    setLandingData([])
                    errorToast(data.message);
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

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [poTypeData, setPoTypeData] = useState([])

    const getPoType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results)
                    console.log(data.results)
                } else {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }


    useEffect(() => {
        // getUserPlant()
        // getPoType()
        getPurchaseOrderReport()
    }, [])

    const columns = [...taColumns,actionsCol];

    return (
        <>

            {/* {landingData != "" ? */}
                <Card>
                    <CardHeader><h5>Weight Correction List</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> 
                {/* : null */}
            {/* } */}

            <Modal show={show} centered size="lg">
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 750 }}>
                                <Modal.Title>Weight Correction <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        {data?.recievingFirstWt &&
                         <Col md="6" sm="6">
                                    <CustomTextInput label={"Sending First Weight"} type="text" form={form} id="recievingFirstWt" />
                        </Col>}
                         {data?.recievingSecondWt &&
                         <Col md="6" sm="6">
                                    <CustomTextInput label={"Sending Second Weight"} type="text" form={form} id="recievingSecondWt" />
                        </Col>}
                        <Col md="6" sm="6">
                                    <CustomTextInput label={"First Weight"} type="text" form={form} id="FirstWeight" />
                        </Col>
                        <Col md="6" sm="6">
                                    <CustomTextInput label={"Second Weight"} type="text" form={form} id="SecondWeight" />
                        </Col>
                        
                        {/* <Col md="4" sm="4"></Col> */}

                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomTextInput label={"Reason"} type="text" form={form} id="remarks" />
                                
                            </FormGroup>
                        </Col>
                    </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        {((data?.SCREEN_TYPE == 'IAS' && (data?.VEHICLE_STATUS == 24 || data?.VEHICLE_STATUS == 4 || data?.VEHICLE_STATUS == 2)) || (data?.SCREEN_TYPE == 'RM PURCHASE' && (data?.VEHICLE_STATUS == 24 || data?.VEHICLE_STATUS == 4 || data?.VEHICLE_STATUS == 2 || data?.VEHICLE_STATUS == 21)) || (data?.SCREEN_TYPE == 'SILOTOMILL' && (data?.VEHICLE_STATUS == 24 || data?.VEHICLE_STATUS == 4 || data?.VEHICLE_STATUS == 2 || data?.VEHICLE_STATUS == 13))) &&
                        <Button.Ripple color="danger" type="button" onClick={() =>approveOrRejectVehicle(1)}>
                            <XCircle size={16} /> First Weight Change
                        </Button.Ripple>}
                        {((data?.SCREEN_TYPE == 'IAS' && data.SecondWeight && (data?.VEHICLE_STATUS == 5 || data?.VEHICLE_STATUS == 13)) || (data?.SCREEN_TYPE == 'RM PURCHASE' && data.SecondWeight && (data?.VEHICLE_STATUS == 5)) || (data?.SCREEN_TYPE == 'SILOTOMILL' && data.SecondWeight &&  (data?.VEHICLE_STATUS == 5))) &&
                        <Button.Ripple color="danger" type="button" onClick={() =>approveOrRejectVehicle(2)}>
                            <XCircle size={16} /> Second Weight Change
                        </Button.Ripple>}
                        {/* {(data?.recievingFirstWt &&  (data?.VEHICLE_STATUS == 4 || data?.VEHICLE_STATUS == 24)) && 
                        <Button.Ripple color="danger" type="button" onClick={() =>approveOrRejectVehicle(3)}>
                            <XCircle size={16} /> First Weight Change
                        </Button.Ripple>} */}
                </Modal.Footer>
            </Modal >

            <div style={{ marginBottom: "270px" }}></div>
        </>
    );
};

export default WeightCorrection;
