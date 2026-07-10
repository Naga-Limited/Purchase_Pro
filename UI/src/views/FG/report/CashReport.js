import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
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
import { ArrowDown } from "react-feather";
import { RefreshBlock1 } from "../../common/RefreshBlock1";
import OverAllDetails from "../OverAllDetails";

export const taColumns = [
    {
        name: "CASH NUMBER",
        selector: "cashNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE NO",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "INVOICE AMOUNT",
        selector: "invoiceAmount",
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
        selector: "moduleType",
        sortable: true,
        minWidth: "180px",
    },
   
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RES PERSON",
        selector: "personName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MOBILE NO",
        selector: "phoneNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "GATE IN DATE",
        selector: "createdOn",
        sortable: true,
        minWidth: "180px",
    }
];


const CashReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "150px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <a target="_blank" href={row.invoiceCopy}>
                        <Button.Ripple color="primary" size="sm" type="button" className='ml-1'>Invoice Copy</Button.Ripple>
                    </a>
                </Row>
            );
        },
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            fromDate: validation.required({ message: "Please Select /Color Token", isObject: false })
        }),
        onSubmit() { },
    });

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getCashReportDetails = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let userPlant = form.values.masterPlantId

        let selectedPlant = userPlant != null ? userPlant.map((item) => item.value) : null
        let plantId = selectedPlant != null ? selectedPlant.join(',') : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Report/getCashReportDetails/${fromDateMilliSecond}/${toDateMilliSecond}/${plantId}/${UserDetails.USERID}`)
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

    useEffect(() => {
        getUserPlant()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader><h5>Cash - Report</h5><RefreshBlock1 /></CardHeader>
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
                                <Button.Ripple color="primary" type="submit" onClick={getCashReportDetails}>
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

            {landingData == "" ? <div style={{ marginBottom: "280px" }}></div> : null}

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}
        </>
    );
};

export default CashReport;
