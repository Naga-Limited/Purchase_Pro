import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../common/TableComponent";
import { apiBaseUrl } from "../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { DatePicker } from "../../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, Yup, validation } from "../../forms/custom-form";
import moment from "moment";
import { ArrowDown, X } from "react-feather";
import { RefreshBlock1 } from "../../common/RefreshBlock1";
import { Modal, ModalBody } from "react-bootstrap";

export const taColumns = [
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "NATURE OF WORK",
        selector: "workNature",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "WORK ORDER NO",
        selector: "servicePoNo",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "PREFFERED SHIFT",
        selector: "shift",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.plantName + ' - ' + row.werks}</span>
            </>
        }
    },
    {
        name: "CONTRACTOR NAME",
        selector: "contractorName",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "SUPERVISOR NAME",
        selector: "supervisorName",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "SUPERVISOR PHONE NO",
        selector: "supervisorPhoneNo",
        sortable: true,
        minWidth: "210px",
    },
    {
        name: "HIGH GRADE PERSON",
        selector: "highGradePerson",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "MEDIUM GRADE PERSON",
        selector: "mediumGradePrerson",
        sortable: true,
        minWidth: "220px",
    },
    {
        name: "LOW GRADE PERSON",
        selector: "lowGradePerson",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "NO OF PERSONS",
        selector: "noOfPersons",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PERSON NAME",
        selector: "personName",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "GATE IN DATE",
        selector: "gateInDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "GATE OUT DATE",
        selector: "gateOutDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "WAITING AT",
        selector: "isWorkCompleted",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return <>
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.isWorkCompleted == 1 ? 'Complete' : 'Gate Out'}
                        </Badge>
                    </FormGroup>
                </Col>
            </>
        },
    },
];


const ContractorReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "150px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => contractPersonDetails(row)}>View</Button.Ripple>
                </Row>
            );
        },
    };

    const [show, setShow] = useState(false)
    const [contractPersons, setContractPersons] = useState([])
    const [contractMaterialDetails, setContractMaterialDetails] = useState([])

    const contractPersonDetails = (row) => {
        getContractorDetails(row.workPermitId, row.contractorDetailsId)
        ContractPersonsActivity(row.contractorDetailsId);
        setShow(true)
    };

    const getContractorDetails = (workPermitId, contractorDetailsId) => {
        console.log(apiBaseUrl + `GatePro/Gate/getContractorDetails/${workPermitId}/${contractorDetailsId}/${UserDetails.USERID}/1`);
        apiGetMethod(apiBaseUrl + `GatePro/Gate/getContractorDetails/${workPermitId}/${contractorDetailsId}/${UserDetails.USERID}/1`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    for (let i = 0; i < data.materialInfo.length; i++) {
                        data.materialInfo[i].sno = i + 1;
                    }
                    for (let i = 0; i < data.results[0].contractPersons.length; i++) {
                        data.results[0].contractPersons[i].sno = i + 1;
                    }
                    setContractPersons(data.results[0].contractPersons)
                    setContractMaterialDetails(data.materialInfo)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getContractPersonsActivity = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let userPlant = form.values.masterPlantId

        let selectedPlant = userPlant != null ? userPlant.map((item) => item.value) : null
        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getContractorReport/${fromDateMilliSecond}/${toDateMilliSecond}/${plantId}/${UserDetails.USERID}`)
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


    const [contractPersonsActivity, setContractPersonsActivity] = useState([])

    const ContractPersonsActivity = (contractorDetailsId) => {
        console.log(apiBaseUrl + `GatePro/Report/getContractPersonsActivity/${contractorDetailsId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Report/getContractPersonsActivity/${contractorDetailsId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setContractPersonsActivity(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
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

    useEffect(() => {
        getUserPlant()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader><h5>Contractor - Report</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="12">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    isMulti
                                    options={userPlant}
                                    label={"Plant"}
                                    form={form}
                                    id="masterPlantId"
                                />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button.Ripple color="primary" type="submit" onClick={getContractPersonsActivity}>
                                    View <ArrowDown size={16} />
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != "" ?
                <Card>
                    <CardHeader><h5>Report List</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }

            <Modal show={show} centered size="xl">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Contract Persons / Material Details</h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={() => setShow(false)} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <ModalBody>
                    <Row>
                        {contractPersonsActivity != "" ? <>
                            <Col md="6" sm="6">
                                <h4 className="text-primary"><u>Contract Persons</u></h4><br />
                            </Col>

                            <Col md="12" sm="12">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <td className="bg-primary text-white text-center">Person Name</td>
                                            <td className="bg-primary text-white text-center">Grade</td>
                                            <td className="bg-primary text-white text-center">Work Update</td>
                                            <td className="bg-primary text-white text-center">Day Type</td>
                                            <td className="bg-primary text-white text-center">Reason</td>
                                            <td className="bg-primary text-white text-center">Gate In Date Time</td>
                                            <td className="bg-primary text-white text-center">Gate Out Date Time</td>
                                        </tr>
                                    </thead>
                                    {contractPersonsActivity?.map((data) => (
                                        <tbody key={data.contractPersonsActivityId}>
                                            <tr>
                                                <td className='text-center'>{data.personName}</td>
                                                <td className='text-center'>{data.grade == null ? '-' : data.grade}</td>
                                                <td className='text-center'>{data.workUpdate == null ? '-' : data.workUpdate}</td>
                                                <td className='text-center'>{data.dayType == null ? '-' : data.dayType}</td>
                                                <td className='text-center'>{data.reason == null || data.reason == '' ? '-' : data.reason}</td>
                                                <td className='text-center'>{data.gateInDateStamp == '0000-00-00 00:00:00' ? '-' : data.gateInDateStamp}</td>
                                                <td className='text-center'>{data.gateOutDateStamp == null || data.gateOutDateStamp == '0000-00-00 00:00:00' ? '-' : data.gateOutDateStamp}</td>
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                                <br />
                            </Col>
                        </> : null}

                        {contractMaterialDetails != "" ? <>
                            <Col md="6" sm="6">
                                <h4 className="text-primary"><u>Tools Info</u></h4><br />
                            </Col>

                            <Col md="12" sm="12">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <td className="bg-primary text-white text-center" width='10%'>S.No</td>
                                            <td className="bg-primary text-white text-center">Material Name</td>
                                            <td className="bg-primary text-white text-center" width='30%'>Material Count</td>
                                        </tr>
                                    </thead>
                                    {contractMaterialDetails?.map((data) => (
                                        <tbody key={data.contractMaterialDetailsId}>
                                            <tr>
                                                <td className='text-center'>{data.sno}</td>
                                                <td className='text-center'>{data.material}</td>
                                                <td className='text-center'>{data.noOfMaterial}</td>
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                                <br />
                            </Col>
                        </> : null}
                    </Row>
                </ModalBody>
            </Modal>
            {landingData == "" ? <div style={{ marginBottom: "280px" }}></div> : null}

        </>
    );
};

export default ContractorReport;
