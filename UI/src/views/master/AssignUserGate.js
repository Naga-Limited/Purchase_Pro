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
import { useSelector } from "react-redux";
import { ArrowRight } from "react-feather";
import AssignUserGateList from "../List/AssignUserGateList";


const AssignUserGate = () => {  

  useEffect(() => {
    getuserinfo()
    getMasterGate()
    getUserGateInfo()
  }, [])  

  const [userData, setUserData] = useState([]);
  const [masterGate, setMasterGate] = useState([]);  
  const [userGateInfo, setuserGateInfo] = useState([]);
  const [show, setShow] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [masterGateId, setMasterGateId] = useState('')

  const [user, setUser] = useState("");
  const [gate, setGate] = useState("");

  let { showLoader, hideLoader } = useLoader();

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
      .finally(
        hideLoader()
      )
  }
  
  const getMasterGate = () => {
    apiGetMethod(apiBaseUrl + "GatePro/Master/getMasterGate")
      .then((response) => {
        const { data } = response;
        if (data.success >= 1) {
          setMasterGate(data.results)
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

  const showshowGeneralData = () => {
    setShow(true)
  }
  const selectUser = (e) => {
    setUser([e]);
    setIsDisabled(false)
  }

  const selectGate = (e) => {
    setGate([e]);
    setMasterGateId(e.value)
  }
  
  const getUserGateInfo = () => {
    console.log(apiBaseUrl + `GatePro/Master/getUserGateInfo`);
    apiPostMethod(apiBaseUrl + `GatePro/Master/getUserGateInfo`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          setuserGateInfo(data.results)
          console.log(data.results);
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }

  const updateUserGate = () => {

    const postData = {
      userInfoId: user[0].value,
      masterGateId: masterGateId
    }

    apiPostMethod(apiBaseUrl + `GatePro/Master/updateUserGate`, postData)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
          ShowToast(data.message)
          getUserGateInfo()
          setGate('')
          setShow('')
          setUser('')
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

  return (
    <Fragment>
      <Card>
        <CardHeader><h5>Assign User Gate</h5><RefreshBlock1 /></CardHeader>
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
                  <Label>Master Gate</Label>
                  <Select
                    options={masterGate}
                    onChange={(e) => selectGate(e)}
                    value={gate}
                  />
                </FormGroup>
              </Col> : null
            }
            {show ?
              <Row>
                <Col md="2" sm="12">
                  <div>
                    <label>&nbsp;</label>
                    <Button.Ripple color="primary" type="button" onClick={updateUserGate}>
                      Submit
                    </Button.Ripple>
                  </div>
                </Col>
              </Row> : null
            }
          </Row>
        </CardBody>
      </Card>

      <AssignUserGateList userGateInfo={userGateInfo}/>
      
      <div style={{ marginBottom: "260px" }}></div>
    </Fragment>
  );
}

export default AssignUserGate;
