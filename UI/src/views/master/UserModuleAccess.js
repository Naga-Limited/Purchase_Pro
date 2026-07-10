import React, { Fragment, useEffect } from "react";
import { Row, Col, Button, FormGroup, Label, Card, CardHeader, CardBody } from "reactstrap";
import { CustomDropdownInput, CustomTextInput, Yup, validation } from "../forms/custom-form";
import { useState } from "react";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import Select from 'react-select'
import { useFormik } from "formik";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { ArrowRight } from "react-feather";
import UserModuleAccessList from "../List/UserModuleAccessList";
import { useSelector } from "react-redux";


const UserModuleAccess = () => {   

    let { showLoader, hideLoader } = useLoader();

    const [data, setData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [moduleTypeId, setModuleTypeId] = useState([]);
    const [user, setUser] = useState("");

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getModuleType = () => {

        console.log(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results)
                    console.log(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const getuserinfo = () => {
        apiGetMethod(apiBaseUrl + `MarketData/Master/getuserinfo`)
            .then((response) => {
                const { data } = response;
                if (data.success >= 1) {
                    setUserData(data.results)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getModuleType()
        getuserinfo()
    }, [])

    const [show, setShow] = useState(false)
    const [isDisabled, setIsDisabled] = useState(true)

    const showshowGeneralData = () => {
        setShow(true)
    }

    const selectUser = (e) => {
        setUser([e]);
        setIsDisabled(false)
    }

    const selectModuleType = (moduleType) => {
        const moduleTypeId = moduleType.map((type) => type.value);
        setModuleTypeId(moduleTypeId)
    }

    const addUserModuleAccess = () => {

        const postData = {
            userInfoId: user[0].value,
            moduleTypeId: moduleTypeId
        }
        showLoader()
        console.log(apiBaseUrl + `GatePro/Master/addUserModuleAccess`, postData)
        apiPostMethod(apiBaseUrl + `GatePro/Master/addUserModuleAccess`, postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message)
                    setModuleTypeId('')
                    getUserModuleAccess()
                    setUser("")
                    setShow(false)
                    setIsDisabled(true)
                } else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(
                hideLoader()
            )
    }

    const [userModuleAccessData, setUserModuleAccessData] = useState([]);

    const getUserModuleAccess = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserModuleAccess/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getUserModuleAccess/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setUserModuleAccessData(data.results)
                    console.log(data.results);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getUserModuleAccess()
    }, [])

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>User Module Access</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>User</Label>
                                <Select
                                    options={userData}
                                    onChange={(e) => selectUser(e)}
                                    value={user}
                                />
                            </FormGroup>
                        </Col>
                        {!show ?
                            <Col md="2" sm="12">
                                <div>
                                    <label>&nbsp;</label>
                                    <FormGroup>
                                        <Button.Ripple color="primary" type="button" onClick={showshowGeneralData} disabled={isDisabled}>
                                            Next <ArrowRight size={16} />
                                        </Button.Ripple>
                                    </FormGroup>
                                </div>
                            </Col> : null
                        }
                        {show ?
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <Label>Module Type</Label>
                                    <Select
                                        options={data}
                                        onChange={(e) => selectModuleType(e)}
                                        isMulti
                                    />
                                </FormGroup>
                            </Col> : null
                        }
                        {show ?
                            <Row>
                                <Col md="2" sm="12">
                                    <div>
                                        <label>&nbsp;</label>
                                        <Button.Ripple color="primary" type="button" onClick={addUserModuleAccess}>
                                            Submit
                                        </Button.Ripple>
                                    </div>
                                </Col>
                            </Row> : null
                        }
                    </Row>
                </CardBody>
            </Card>

            <UserModuleAccessList userModuleAccessData={userModuleAccessData} />

            <div style={{ marginBottom: "260px" }}></div>
        </Fragment>
    );
}

export default UserModuleAccess;
