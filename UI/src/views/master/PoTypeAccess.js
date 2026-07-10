import React, { Fragment, useEffect } from "react";
import { Row, Col, Button, FormGroup, Label, Card, CardHeader, CardBody } from "reactstrap";
import { useState } from "react";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import Select from 'react-select'
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { ArrowRight } from "react-feather";
import { useSelector } from "react-redux";
import PoTypeAccessList from "../List/PoTypeAccessList";

const PoTypeAccess = () => {

    useEffect(() => {
        getPoType()
        getPoTypeAccess()
        getuserinfo()
    }, [])

    let { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [poTypeData, setPoTypeData] = useState([]);
    const [show, setShow] = useState(false)
    const [isDisabled, setIsDisabled] = useState(true)
    const [poTypeId, setPoTypeId] = useState([])

    const showshowGeneralData = () => {
        setShow(true)
    }

    const selectPoType = (e) => {
        setIsDisabled(false)
        const masterPlantId = e?.map((item) => item.value);
        setPoTypeId(masterPlantId)
    }
   
    const getPoType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoType`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results)
                } else {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const addPoTypeAccess = () => {

        const postData = {
            poTypeId: poTypeId,
            userId: user[0].value,
            userInfoId: UserDetails.USERID
        }
        showLoader()
        console.log(apiBaseUrl + `GatePro/Master/addPoTypeAccess`, postData)
        apiPostMethod(apiBaseUrl + `GatePro/Master/addPoTypeAccess`, postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message)
                    setPoTypeId([])
                    setUser('')
                    setShow(false)
                    setIsDisabled(true)
                    getPoTypeAccess()
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

    const [poTypeAccessData, setPoTypeAccessData] = useState([])

    const getPoTypeAccess = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeAccessData(data.results);
                } else {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [userData, setUserData] = useState([]);
    const [user, setUser] = useState("");

    const selectUser = (e) => {
        setUser([e]);
        setIsDisabled(false)
        setShow(true)
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

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>PO Type Access</h5><RefreshBlock1 /></CardHeader>
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

                        {show ?
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <Label>Po Type</Label>
                                    <Select
                                        options={poTypeData}
                                        onChange={(e) => selectPoType(e)}                                        
                                        isMulti
                                    />
                                </FormGroup>
                            </Col> : null
                        }

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

                        {/* {show ?
                            <Col sm="4" md="4">
                                <FormGroup>
                                    <Label>Plant</Label>
                                    <Select
                                        options={masterPlantData}
                                        onChange={(e) => selectMasterPlant(e)}
                                        isMulti
                                    />
                                </FormGroup>
                            </Col> : null
                        } */}
                        {show ?
                            <Row>
                                <Col md="2" sm="12">
                                    <div>
                                        <label>&nbsp;</label>
                                        <Button.Ripple color="primary" type="button" onClick={addPoTypeAccess}>
                                            Submit
                                        </Button.Ripple>
                                    </div>
                                </Col>
                            </Row> : null
                        }
                    </Row>
                </CardBody>
            </Card>

            <PoTypeAccessList data={poTypeAccessData} setData={setPoTypeAccessData} />

            <div style={{ marginBottom: "260px" }}></div>
        </Fragment>
    );
}

export default PoTypeAccess;
