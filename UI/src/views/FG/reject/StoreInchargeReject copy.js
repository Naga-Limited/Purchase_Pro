import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../../utility/hooks/useLoader";
import { ElapsedTimer } from "../../common/ElapsedTimer";
import { apiPostMethod } from "../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../helper/appHelper";
import { apiBaseUrl } from "../../../urlConstants";
import { useState } from "react";
import { useSelector } from "react-redux";
import { CustomDropdownInput, CustomTextInput, Yup } from "../../forms/custom-form";
import { Check, StopCircle, X } from "react-feather";
import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import OverAllDetails from "../OverAllDetails";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "150px",
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
        selector: "waitingStatus",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.StatusName == 'Gate In' ? 'Waiting for In' : row.waitingStatus}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const StoreInchargeReject = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();


    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        gateIn() { },
    });

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "250px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => onActionClick(row, 'Approve')}>Approve</Button.Ripple>
                    <Button.Ripple color="danger" size="sm" type="button" className='ml-1' onClick={() => onActionClick(row, 'Reject')}>Reject</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                </Row>
            );
        },
    };

    const [type, setType] = useState('')

    const onActionClick = (row, type) => {
        setShow(true)
        setData(row)
        setType(type)
    };

    const [showOverAllDetails, setShowOverAllDetails] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShowOverAllDetails(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getLoadingData = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/12/${UserDetails.USERID}`)
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/12/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLandingData(data.results);
                }
                else if (data.success == false) {
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
    }

    const [data, setData] = useState([])

    const approveOrRejectVehicle = (moduleStatusId) => {
        const formData = form.values;
        console.log(formData)
        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            storeInchargeRejectRemarks: formData.remarks ? formData.remarks.label : null,
            userInfoId: UserDetails.USERID
        }
        if (!postdata.storeInchargeRejectRemarks) {
            errorToast("Please Select Reject Reason");
            return false;
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/approveOrRejectVehicle", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/approveOrRejectVehicle", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message)
                    getLoadingData()
                    setLandingData([])
                    setShow(false)
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

    useEffect(() => {
        getLoadingData()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>Store Incharge - Reject</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>

            {showOverAllDetails ? <OverAllDetails setShow={setShowOverAllDetails} show={showOverAllDetails} gateInOutInfoId={gateInOutInfoId} /> : null}

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>{type == 'Approve' ? 'Approve' : 'Reject'} <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                       <Col sm="12" md="12">
                            <FormGroup>
                                <CustomTextInput label={"Reject Person"} type="text" maxLength={100} form={form} id="security_remarks"  value = {data?.FIRST_NAME} disabled/>
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomTextInput label={"Incharge Reject Remarks"} type="text" maxLength={100} form={form} id="security_remarks"  value = {data.securityRejectRemarks} disabled/>
                            </FormGroup>
                        </Col>
                        {type == 'Approve' ?
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
                            </Col> :
                            <Col sm="12" md="12">
                                <FormGroup>
                                <CustomDropdownInput  
                                       url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/29`} 
                                        label={"Reason"}  
                                        form={form} 
                                        id={"remarks"}
                                    />
                                </FormGroup>
                            </Col>
                        }
                        <Col sm="12" md="12">
                            <label></label>
                            <FormGroup className="d-flex justify-content-center mb-0">
                                {type == 'Approve' ?
                                    <div className="mr-1">
                                        <Button.Ripple color="primary" type="button" onClick={() => approveOrRejectVehicle(7)}>
                                            <Check size={16} /> Approve
                                        </Button.Ripple>
                                    </div> :
                                    <Button.Ripple color="danger" type="button" onClick={() => approveOrRejectVehicle(0)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple>
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal >
        </div >
    );
};

export default StoreInchargeReject;

