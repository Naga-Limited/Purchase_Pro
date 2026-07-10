import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, Button, FormGroup, InputGroupText, Input, InputGroup, Label, Card, CardHeader, CardTitle, CardBody } from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup, CustomDropdownInput, validation } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
//import Receivelist from './receivelist';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { extendWith } from 'lodash';
import TableComponent from '../common/TableComponent';

export const taColumns = [
    {
        name: "Vehicle Type",
        selector: "vehicle_type",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Gate Out Hours",
        selector: "gate_out_hour",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "Delay Timing(mins)",
        selector: "delay_reason_time",
        sortable: true,
        minWidth: "100px",
    },{
        name: "Plant Code",
        selector: "WERKS",
        sortable: true,
        minWidth: "100px",
    },
];


function Ctimemaster() {
    const history = useHistory();
    let { Id } = useParams();
    let refid = '';
    if (Id) {
        refid = Id.replace(":", "");
    }
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    let { showLoader, hideLoader } = useLoader();

    const [data, setData] = useState([]);
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);

    const isToday = (date) => {
        return moment(date).format(dateFormat) == today;
    };


    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rows: Yup.array().of(
                Yup.object().shape({
                })
            ),
        }),
        onSubmit(values) { },
    });

    const handlesubmitButtonClick = () => {

        const formData = form.values;

        const postData = {
            VehicleType: formData.vehicleType,
            gateout_time: formData.gateout_time,
            delay_reason_time: formData.delay_reason_time,
            created_by: UserDetails.USERID,
            plantcode: formData.plantcode.value,

        }
        if (refid == "") {
            if (postData.VehicleType == "" || postData.VehicleType == undefined) {
                errorToast('Please Select Vehicle Type')
                return false
            } else if (postData.gateout_time == "" || postData.gateout_time == undefined) {
                errorToast('Please Enter Gate Out hour')
                return false
            } else if (postData.delay_reason_time == "" || postData.delay_reason_time == undefined) {
                errorToast('Please Enter Delay Reason Time')
                return false
            } else if (postData.plantcode == "" || postData.plantcode == undefined) {
                errorToast('Please Select Plant Code')
                return false
            }
            console.log(postData)
            // console.log(postData);return  false;
            showLoader();
            apiPostMethod(apiBaseUrl + "RekeloadingentryController/Insertdelayreasontimedetails", postData)
                .then((response) => {
                    const { data } = response;
                    console.log(response)
                    if (data.success == true) {
                        ShowToast("Save Successfully...");
                        window.setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    } else if (data.success == 0) {
                        errorToast(data.error);
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        }
    }
    const handleReject = (row) => {
        let ID = row.id
        const postdata = {
            Id: ID,
            created_by: UserDetails.USERID,
        };
        showLoader();
        apiPostMethod(apiBaseUrl + "RekeloadingentryController/updatestautsfordelayreasontime", postdata)
            .then((response) => {
                const { data } = response;
                console.log(JSON.stringify(response))
                let RespId = data.success;
                if (RespId && RespId >= 1) {
                    ShowToast("Saved Successfully...");
                    window.setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                }
                else {
                    if (data.ErrorMsg) {
                        errorToast(data.ErrorMsg);
                    }
                    else {
                        errorToast("Unable to update record");
                    }
                }
            })
            .finally((a) => {
                hideLoader();
            });
    };


    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "120px",
        cell: (row) => {
            return (
                <>
                    <Button.Ripple
                        color="danger"
                        onClick={() => handleReject(row)}
                    >
                        Deactivate
                    </Button.Ripple>
                    &nbsp;
                </>
            );
        },
    };
    const columns = [...taColumns,
        actionsCol
    ];

    return (
        <div>
            <div>
                <Fragment>
                    <CardComponent header="Delay Reason Timing For FG ">
                        <Row>
                            <Col md="4">
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RekeloadingentryController/getvehicletypelist
                                    `}
                                    label="VehicleType"
                                    id="vehicleType"
                                    name="vehicleType"
                                    form={form}
                                />
                            </Col>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"Hours before Gateout"} id="gateout_time" name="gateout_time" form={form} type="text"
                                />
                            </Col>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"Time For Delay Reason"} id="delay_reason_time" name="delay_reason_time" form={form} type="text"
                                />
                            </Col>
                        </Row>
                        <Row> <Col md="4" sm="12">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}RekeloadingentryController/getplantcode`}
                                    label={"Select Plant"}
                                    form={form}
                                    id="plantcode"
                                    name="plantcode"
                                />
                            </FormGroup>
                        </Col></Row>
                        <Col sm="12">
                            <FormGroup className="d-flex mb-0 justify-content-end">
                                <Button.Ripple color="primary" type="submit" onClick={handlesubmitButtonClick} >
                                    Submit
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                        <HrLine />
                    </CardComponent>
                </Fragment>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Delay Reason Time details</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} url={apiBaseUrl + `RekeloadingentryController/getdelayreasontimedetails`} formType="getSender" data={data} />
                </CardBody>
            </Card>
        </div>
    );

}


export default Ctimemaster;

