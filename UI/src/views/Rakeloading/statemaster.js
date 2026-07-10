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
        name: "Country Name",
        selector: "country",
        sortable: true,
        minWidth: "100px",
    }, {
        name: "State Name",
        selector: "state_name",
        sortable: true,
        minWidth: "100px",
    },
];


function Consignmentnumber() {
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
                    courier_company_id: Yup.string().required("Courier Company Name is required"),
                    entry_date: Yup.string().required("Receiving Date is required"),
                    from_person: Yup.string().required("From Person is required"),
                })
            ),
        }),
        onSubmit(values) { },
    });

    const handlesubmitButtonClick = () => {

        const formData = form.values;

        const postData = {
            country_name: formData.country_name,
            state_name: formData.state_name,
            created_by: UserDetails.USERID,

        }
        if (refid == "") {
            if (postData.country_name == "" || postData.country_name == undefined) {
                errorToast('Please Enter country name')
                return false
            } else if (postData.state_name == "" || postData.state_name == undefined) {
                errorToast('Please Select state name')
                return false
            }
            console.log(postData)
            // console.log(postData);return  false;
            showLoader();
            apiPostMethod(apiBaseUrl + "RekeloadingentryController/Insertstatedetails", postData)
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
            let ID=row.id
            const postdata = {
                Id: ID,
                created_by: UserDetails.USERID,
            };
            showLoader();
            apiPostMethod(apiBaseUrl + "RekeloadingentryController/updatestautsforloadingsate", postdata)
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
            Reject
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
                    <CardComponent header="Loading State Entry">
                        <h5>Segment Details</h5>
                        <Row>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"Country"} id="country_name" name="country_name" form={form} type="text"
                                />
                            </Col>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"State Name"} id="state_name" name="state_name" form={form} type="text"
                                />
                            </Col>
                        </Row>
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
                    <CardTitle>Loading State details</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} url={apiBaseUrl + `RekeloadingentryController/getloadingstatedetails`} formType="getSender" data={data} />
                </CardBody>
            </Card>
        </div>
    );

}


export default Consignmentnumber;

