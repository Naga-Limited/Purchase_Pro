import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
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
import { ArrowDown } from "react-feather";
import { RefreshBlock1 } from "../../common/RefreshBlock1";
import Select from 'react-select'
import OverAllDetails from "../OverAllDetails";
import { Modal } from "react-bootstrap";
import { X } from "react-feather";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PURPOSE",
        selector: "name",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "190px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-start mb-0">
                    <p className="fs-6">{row.plantName} - {row.werks} </p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "INVOICE NO",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO DATE",
        selector: "documentDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO TYPE",
        selector: "name",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "VENDOR CODE",
        selector: "vendorCode",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "VENDOR NAME",
        selector: "vendorName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TO PLANT",
        selector: "toPlantName",
        sortable: true,
        minWidth: "190px",
        cell: (row) => {
            return <Col sm="12" md="12">
                <br></br>
                <FormGroup className="d-flex justify-content-start mb-0">
                    <p className="fs-6">{row.toPlantName} - {row.toPlantWerks} </p>
                </FormGroup>
            </Col>
        },
    },
    {
        name: "GATE IN DATE",
        selector: "gateInDateStamp",
        sortable: true,
        minWidth: "160px",
    },
    {
        name: "GATE OUT DATE",
        selector: "gateOutDateStamp",
        sortable: true,
        minWidth: "170px",
    },
];

const PurchaseRejectMG = ({actionRendorer}) => {

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
                    <Button.Ripple color="danger" size="sm" type="button" onClick={() => onActionClick(row)}>Reject</Button.Ripple>
                </Row>
            )
        },
    };
    const onActionClick = (row) => {
        setShow(true)
        setData(row);
    };
    const closeRemarksModal = () => setShow(false);
    const approveOrRejectVehicle = (status) => {
        const formData = form.values;

        const postdata = {
            purchaserOrderId: data.purchaserOrderId,
            vaNumber: data.vaNumber,
            vehicleNo: data.vehicleNo,
            poNumber: data.poNumber,
            invoiceNo:data.invoiceNo,
            purchaserOrderId: data.purchaserOrderId,
            Remarks: formData.remarks ? formData.remarks.label : null,
            userInfoId: UserDetails.USERID,
            status:status,
            gateID:data.gateID,
            loadingUnloadingInfoId:data.loadingUnloadingInfoId	
        }
        if (postdata.Remarks == "" || postdata.Remarks == undefined) {
            confirmDialog({
              title: `<h5><strong class="text-white">Please Select Reason</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            return false
          }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Report/RejectManager", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Report/RejectManager", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    setShow(false)
                    getPurchaseOrderReport()
                    form.resetForm()
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
        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getPurchaseOrderReject/${0}/${0}/${UserDetails.USERID}/1`)
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
        getPurchaseOrderReport()
    }, [])

    const columns = [...taColumns,actionsCol];

    return (
        <>
                <Card>
                    <CardHeader><h5>Purchase Order List</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card>
            

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Reject <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                       <Col sm="12" md="12">
                            <FormGroup>
                                <CustomTextInput label={"Rejected By"} type="text" form={form} value = {data?.FIRST_NAME} id="inchargeRemark" disabled/>
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomTextInput label={"Incharge Remark"} type="text" form={form} value = {data?.inchargeRemark} id="inchargeRemark" disabled/>
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <FormGroup>
                                {/* <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" /> */}
                                <CustomDropdownInput  
                                       url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/29`} 
                                        label={"Reason"}  
                                        form={form} 
                                        id={"remarks"}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4"></Col>
                        <Col md="3" sm="3" >
                            <FormGroup>
                                <Button.Ripple color="danger" type="button" onClick={(e) => {approveOrRejectVehicle(0)}}>
                                <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Button.Ripple color="primary" type="button" onClick={(e) => {approveOrRejectVehicle(1)}}>
                                     Approve
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal >

            <div style={{ marginBottom: "270px" }}></div>
        </>
    );
};

export default PurchaseRejectMG;
