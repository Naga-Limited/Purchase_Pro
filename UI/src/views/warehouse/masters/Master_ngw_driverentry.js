import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment";
import { Row, Col, Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Master_ngw_driverlist from "./List/Master_ngw_driverlist";
import { WHMaster_ListUrl } from "../../../urlConstants";


const Master_ngw_driverentryForm = ({ form, onSubmit }) => {
    const history = useHistory();
    let { id } = useParams();
    let refid = '';
    if (id) {
        refid = id.replace(":", "");
    }
    console.log("test");
    let { showLoader, hideLoader } = useLoader();
    
    useEffect(() => {
        if (id && id != ":0") {
            onFetch_Driver_Details_Byid();
        }
    }, [id]);

    const onFetch_Driver_Details_Byid = () => {
        let fdata = {
            id: refid,
        };
        showLoader();
        apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_driverDetailsById", fdata)
            .then((response) => {
                const { data } = response;
                console.log(JSON.stringify(response));
                if (data.success) {
                    form.setValues({
                        driverid: data.results[0].driverid,
                        drivername: data.results[0].drivername,
                        driverno: data.results[0].driverno,
                    })
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    const RefreshPage = () => {
        history.push(`/warehouse/masters/driver`);
    };

    return (
        <Fragment>
            <Row>
                <Col md="4" sm="12">
                    <CustomTextInput label={"DRIVER NAME"} form={form} id="drivername" type="text" />
                    <CustomTextInput form={form} id="driverid" type="hidden" />
                </Col>
                <Col md="4" sm="12">
                    <CustomTextInput label={"DRIVER PH"} form={form} id="driverno" type="text" maxLength={10} isNumberOnly />
                </Col>
            </Row>
            <Row>
                <Col md="2" sm="12">
                    <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                        Submit
                    </Button.Ripple>
                </Col>
                <Col md="2" sm="12">
                    <Button.Ripple color="primary" block type="button" onClick={(e) => RefreshPage()}>
                        Refresh
                    </Button.Ripple>
                </Col>
            </Row>

            <Master_ngw_driverlist
                url={WHMaster_ListUrl}
                title={"Driver Master List"}
                actionRendorer={(row) => {
                    let tx = row.isApproved ? `View` : "Edit";
                    return (
                        <Button.Ripple
                            color="primary"
                            onClick={() => {
                                history.push(`/warehouse/masters/driver:` + row.driverid);
                            }}
                        >{tx}</Button.Ripple>
                    );
                }}
            />
        </Fragment>

    );
};
const Master_ngw_driverentry = () => {
    const { showLoader, hideLoader } = useLoader();
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);
    const isToday = (date) => {
        return moment(date).format(dateFormat) == today;
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            drivername: validation.required({ message: "Driver Name should not be empty", isObject: false }),
            driverno: validation.required({ message: "Driver Ph should not be empty", isObject: false }),
        }),
        onSubmit(values) { },
    });
    const values = form.values;

    const onSubmit = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const FrmData = {
            driverid    : formData.driverid,
            drivername  : formData.drivername,
            driverno    : formData.driverno,
        };

        const postdata = {
            id: formData.driverid,
            Data: FrmData
        }

        console.log(JSON.stringify(postdata))
        showLoader();
        apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_driver", postdata)
            .then((response) => {
                const { data } = response;
                console.log(JSON.stringify(response))
                let UsrId = data.success;
                if (UsrId == -5) {
                    errorToast("Duplicate Entry");
                } else {
                    let RespId = data.success;
                    if (RespId && RespId >= 1) {
                        ShowToast("Saved Successfully...");
                        if (document.getElementById("driverid").value == "") {
                            history.push("/warehouse/masters/driver:0");
                        }
                        else {
                            history.push("/warehouse/masters/driver");
                        }
                    }
                    else {
                        if (data.ErrorMsg) {
                            errorToast(data.ErrorMsg);
                        }
                        else {
                            errorToast("Unable to update record");
                        }
                    }
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
    const history = useHistory();
    const resetForm = () => {
        history.push(`warehouse/masters/driver`);
    };
    return (
        <Fragment>
            <CardComponent header="Driver Master">
                <Master_ngw_driverentryForm form={form} onSubmit={onSubmit} />
            </CardComponent>
        </Fragment>
    );
};

export default Master_ngw_driverentry;
