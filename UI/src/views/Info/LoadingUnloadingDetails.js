import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowDown, Edit } from "react-feather";
import moment from "moment";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { DatePicker } from "../forms/custom-datetime";
import ReactSelect from "react-select";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "truckNo",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "170px",
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
        name: "STATUS",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.waitingStatus ? row.waitingStatus : 'Loading & Unloading'}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];



const LoadingUnloadingInfoDetails = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const [landingData, setLandingData] = useState([])

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getLoadingData = () => {
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0
        showLoader();
        console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfoDetails/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfoDetails/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLandingData(data.results);
                    // setLandingData(data.results.createdOn);   
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
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            fromDate: validation.required({ message: "Please Select /Color Token", isObject: false })
        }),
        onSubmit() { },
    });

    useEffect(() => {
        getLoadingData()
    }, [])

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>
                    <Button.Ripple className='ml-1' color="primary" size="sm" type="button" onClick={() => edit(row)}><Edit size={16} /> Edit</Button.Ripple>
                </Row>
            );
        },
    };

    const edit = (row) => {
        history.push(`/LoadingUnloadingInfo/${row.loadingAndUnloadingInfoId}`)
    }

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
              <CardHeader><h5>Loading & Unloading Details</h5></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="12">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>
                        {/* <Col sm="3" md="3">
                            <FormGroup>
                                <Label>Plant Code</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col> */}
                        <Col md="2" sm="2">
                            <div>
                                <label>&nbsp;</label>
                                <FormGroup>
                                    <Button.Ripple color="primary" type="submit" onClick={getLoadingData}>
                                        View <ArrowDown size={16} />
                                    </Button.Ripple>
                                </FormGroup>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>
        </div>
    );
};

export default LoadingUnloadingInfoDetails;
