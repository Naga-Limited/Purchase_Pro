import { Link, useHistory } from "react-router-dom";
import InputPasswordToggle from "@components/input-password-toggle";
import { Row, Col, CardTitle, CardText, FormGroup, Label, Input, CustomInput, Button } from "reactstrap";
import "@styles/base/pages/page-auth.scss";
import { apiPostMethod } from "@helpers/axiosHelper";
import { useDispatch } from "react-redux";
import { handleLogin } from "@store/actions/auth";
import React, { useEffect, useState } from "react";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl, loginUrl } from "../urlConstants";
import logopp from "../assets/images/naga/logopp.png";
import hon from "../assets/images/naga/hon.png";
import ylogo from "../assets/images/naga/40ylogo.png";
import { useLoader } from "../utility/hooks/useLoader";
import { ShowToast } from "../helper/appHelper";
import confirmDialog from "../@core/components/confirm/confirmDialog";

const Login = () => {
  // const [skin] = useSkin();
  const history = useHistory();
  const dispatch = useDispatch();
  let { showLoader, hideLoader } = useLoader();
  const [forgetPassword, setForgetPassword] = useState(false)
  const [VerifyOTP, setVerifyOTP] = useState(false)
  const [ChangePassword, setChangePassword] = useState(false)

  // const illustration = skin === "dark" ? "login-v2-dark.svg" : "login-v2.svg",
  //   source = require(`@src/assets/images/pages/${illustration}`).default;

  useEffect(() => {
    const udata = JSON.parse(localStorage.getItem("userData"));
    if (udata) {
      document.getElementById("login-user").value = udata.username;
      document.getElementById("login-password").value = udata.password;
    }
  }, []);
  const checkUsernPassword = (username, password) => {
    if (username.length === 0 || password.length === 0) {
      if (username.length === 0 && password.length === 0) {
        errorToast("Please Enter Username and Password");
        let element0 = document.getElementById("login-user");
        element0.classList.add("is-invalid");
        let element1 = document.getElementById("login-password");
        element1.classList.add("is-invalid");
      } else if (username.length === 0) {
        errorToast("Please Enter Username");
        let element = document.getElementById("login-user");
        element.classList.add("is-invalid");
      } else {
        errorToast("Please Enter Password");
        let element = document.getElementById("login-password");
        element.classList.add("is-invalid");
      }
    }
  };
  const onCheckLogin = () => {
    const username = document.getElementById("login-user").value;
    const password = document.getElementById("login-password").value;
    if (username && password) {
      const isRem = document.getElementById("remember-me").checked;
      showLoader();
      apiPostMethod(loginUrl, { user_name: username, password: password })
        .then((response) => {
          const { data } = response;
          if (data.success) {
            const { results: user } = data;
            dispatch(handleLogin(user));
            if (isRem) {
              localStorage.setItem("userData", JSON.stringify({ username: username, password: password }));
            }
            if (user.screenids && user.screenids.length) {
              history.push(user.screenids[0].SCREEN_NAME);
            } else {
              history.push("/misc/not-authorized");
            }
          } else {
            errorToast(data.error);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    } else {
      checkUsernPassword(username, password);
    }
  };
  const onChangeText = (e, id) => {
    if (e.target.value && e.target.value.length > 0) {
      let element0 = document.getElementById(id);
      element0.classList.remove("is-invalid");
    }
  };

  const Forgot_Password = () => {

    const username = document.getElementById("enter_user_name").value;

       const postdata = {
        user_name: username
      }
       let msg="Password Reset"
       confirmDialog({
        title: "Are you sure want to send OTP?",
        description: msg,
      }).then((res) => {
        if (res) {
          showLoader();
          apiPostMethod(apiBaseUrl + "User/ForgotPassword", postdata)
         .then((response) => {
           const { data } = response;
           console.log(JSON.stringify(response))
           if(data.success == "0"){
            errorToast("Invalid User Name...");
           }else{
           setVerifyOTP(true)
           ShowToast("OTP Send Successfully...");
           setLOGIN_ID(data.results.LOGIN_ID)
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
      }); 
     }
  const Verify_OTP = () => {

  const otp = document.getElementById("enter_otp").value;

      const postdata = {
      user_name:LOGIN_ID,
      OTP:otp
      }
        showLoader();
        apiPostMethod(apiBaseUrl + "User/Verify_OTP", postdata)
        .then((response) => {
          const { data } = response;
          console.log(JSON.stringify(response))
          if(data.success == "0"){
            errorToast("Invalid OTP Number...");
           }else{
          setChangePassword(true)
          ShowToast("OTP Verified Successfully...");
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
  const Password_Change = () => {

  const new_pwd = document.getElementById("new_password").value;
  const verify_pwd = document.getElementById("verify_password").value;

    if(new_pwd != verify_pwd){
      errorToast('Password Should Not Matched ...')
      return false
    }else if(new_pwd == undefined || !/[a-zA-Z0-9@$.#%&*!()]{8}$/.test(new_pwd)){
      errorToast('Password Should be Greater than 8 Characters ...')
      return false
    }

    const postdata = {
      user_name:LOGIN_ID,
      verify_pwd:verify_pwd
      }
      showLoader();
apiPostMethod(apiBaseUrl + "User/Password_Change", postdata)
  .then((response) => {
    const { data } = response;
    console.log("Password Change Response:", JSON.stringify(data));

    const msg = data?.results?.message || "Invalid Request...";

    // 🔹 Show confirm dialog ONLY when failed
    if (data?.results?.success === false || data?.results?.success === "0") {
      confirmDialog({
        title: "Password Change Failed ❌",
        description: msg,
      });
    } else {
      // 🔹 Success case — no confirm dialog
      setChangePassword(false);
      setVerifyOTP(false);
      setForgetPassword(false);
      ShowToast(msg || "Password changed successfully!");
    }
  })
  .catch((error) => {
    console.error("API Error:", JSON.stringify(error));
    errorToast("Something went wrong, please try again after sometime");
  })
  .finally(() => {
    hideLoader();
  });
    }

     
     const [LOGIN_ID, setLOGIN_ID] = useState('');

      console.log(LOGIN_ID);

  return (
    <div className="auth-wrapper auth-v2 naga-login-page">
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/"></Link>
        <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
            {/* <img className='img-fluid' src={loginbg} alt='Login V2' /> */}
          </div>
        </Col>
        <Col className="d-flex flex-column align-items-start auth-bg px-2 p-lg-5" lg="4" sm="12">
          <img src={logopp} height="200px" width="400px" className="mb-3"></img>
          <Col className="px-xl-2 mx-auto p-lg-5" sm="8" md="6" lg="12" style={{ marginTop:'-120px '}}>
            <CardTitle tag="h4" className="font-weight-bold mb-1">
              Welcome to Purchase , Warehouse & Gate Pro ! 👋
            </CardTitle>
            <CardText className="mb-2">Please sign-in to your account and start the adventure</CardText>
            {!forgetPassword && !VerifyOTP && !ChangePassword &&
            <div className="auth-login-form mt-2">
              <FormGroup>
                <Label className="form-label" for="login-user">
                  Username
                </Label>
                <Input type="text" id="login-user" placeholder="testuser" autoFocus onChange={(e) => onChangeText(e, "login-user")} />
              </FormGroup>
              <FormGroup>
                <div className="d-flex justify-content-between">
                  <Label className="form-label" for="login-password">
                    Password
                  </Label>
                </div>
                <InputPasswordToggle
                  className="input-group-merge"
                  id="login-password"
                  onChange={(e) => onChangeText(e, "login-password")}
                />
              </FormGroup>
              <FormGroup>
                <CustomInput type="checkbox" className="custom-control-Primary" id="remember-me" label="Remember Me" />
              </FormGroup>
              <Row>
              <Col md="6" sm="12" >
              <Button.Ripple color="primary" block type="button" onClick={()=>setForgetPassword(true)}>
                Forgot Password
              </Button.Ripple>
              </Col>
              <Col md="4" sm="12" >
              <Button.Ripple color="primary" block type="button" onClick={(e) => onCheckLogin()}>
                Sign in
              </Button.Ripple>
              </Col>
              </Row>
            </div>}
            {forgetPassword && !VerifyOTP && !ChangePassword &&
            <div className="auth-login-form mt-2">
              <FormGroup>
                <Label className="form-label" align="center" for="login-user">
                User Name
                </Label>
                <Input type="text" id="enter_user_name" placeholder="enter_user_name" autoFocus onChange={(e) => onChangeText(e, "enter_user_name")} />
              </FormGroup>
              <Row>
              <Col md="4" sm="12" >
              <Button.Ripple color="primary" block type="button" onClick={()=>setForgetPassword(false)}>
                Back
              </Button.Ripple>
              </Col>
              <Col md="6" sm="12" >
              <Button.Ripple color="primary" block type="button" onClick={(e) =>Forgot_Password()}>
                Request OTP
              </Button.Ripple>
              </Col>
              </Row>
            </div>}
            {forgetPassword && VerifyOTP && !ChangePassword &&
            <div className="auth-login-form mt-2">
              <FormGroup>
                <Label className="form-label" align="center" for="login-user">
                Enter OTP
                </Label>
                <Input type="text" id="enter_otp" placeholder="enter_otp" autoFocus onChange={(e) => onChangeText(e, "enter_otp")} />
              </FormGroup>
              <Button.Ripple color="primary" block type="button"  onClick={()=>Verify_OTP()}>
                Verify OTP
              </Button.Ripple>
            </div>}
            {ChangePassword &&
            <div className="auth-login-form mt-2">
              <FormGroup>
                <Label className="form-label" align="center" for="login-user">
                Enter New Password
                </Label>
                <InputPasswordToggle
                  className="input-group-merge"
                  id="new_password"
                  onChange={(e) => onChangeText(e, "new_password")}
                  maxLength = "20"
                /><br/>
                <InputPasswordToggle
                  className="input-group-merge"
                  id="verify_password"
                  onChange={(e) => onChangeText(e, "verify_password")}
                  maxLength = "20"
                />
              </FormGroup>
              <Button.Ripple color="primary" block type="button"  onClick={()=>Password_Change(false)}>
                Change Password
              </Button.Ripple>
            </div>}
            <div className="d-flex w-100 align-items-center justify-content-center pt-3">
              <img src={hon} height="100px" className="mr-2"></img>
              <img src={ylogo} height="100px"></img>
            </div>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
