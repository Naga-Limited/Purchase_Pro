import React, { Fragment, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
////import Module_masterentryform from "./Module_masterentryform";
import { Row, Col,Button, Label, Input, FormGroup } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Module_masterlist from "../List/Module_masterlist";
import { Master_Url } from "../../urlConstants";
import Select from "react-select";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import { useSelector } from "react-redux";
import DeliveryControlList from "../List/DeliveryControlList";

const Module_masterentryform = ({ form }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id && id!=":0"){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id && id!=":0") {
      onFetchSDIdetailsById();
    }
  }, [id]);
  const onFetchSDIdetailsById = () => {
    let fdata = {
      MODULE_REFID: refid,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Master/getModule_masterDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            MODULE_REFID:data.results[0].MODULE_REFID,
            MODULE_ID:data.results[0].MODULE_ID,
            SCREEN_NAME:data.results[0].SCREEN_NAME,
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
    // history.push(`/master/Module_master`); 
    window.location.reload();
  };
  const [ statusOption, SetStatusOption ] = useState();

  // const statusOptions = [
  //   {
  //     options: [
  //       { value: "1", label: "SDT / SDO" },
  //       { value: "2", label: "IAS" },
  //       { value: "3", label: "STM" },
  //       { value: "4", label: "IRS" },
  //       { value: "5", label: "Relloting" },
  //       { value: "6", label: "Fumigation" },
  //       { value: "7", label: "Gate Pro" },
  //     ],
  //   },
  // ];
  const modifiedOptions = () => {

    if (UserDetails.USERID == 1) {
      const statusOptions = [
        {
          options: [
            { value: "1", label: "SDT / SDO" },
            { value: "2", label: "IAS" },
            { value: "3", label: "STM" },
            { value: "4", label: "IRS" },
            { value: "5", label: "Relloting" },
            { value: "6", label: "Fumigation" },
            { value: "7", label: "Gate Pro" },
            { value: "8", label: "Godwon to Godwon Backdate" },
          ],
        },
      ];
      SetStatusOption(statusOptions);
    } else if (UserDetails.GATE_ID == 3 || UserDetails.GATE_ID == 4 || UserDetails.GATE_ID == 5 || UserDetails.GATE_ID == 6) {
      const statusOptions = [
        {
          options: [
            { value: "1", label: "SDT / SDO" },
            { value: "2", label: "IAS" },
            { value: "3", label: "STM" },
            { value: "4", label: "IRS" },
            { value: "5", label: "Relloting" },
            { value: "6", label: "Fumigation" },
            { value: "7", label: "Gate Pro" },
            { value: "8", label: "Godwon to Godwon Backdate" },
          ],
        },
      ];
      SetStatusOption(statusOptions);

    } else  {
      const statusOptions = [
        {
          options: [
            { value: "7", label: "Gate Pro" },
            { value: "8", label: "Godwon to Godwon Backdate" },
          ],
        },
    ];
  SetStatusOption(statusOptions);
    }
  }
  const [formData, setFormaData] = useState({});
  const [otpGenerated,setOtpGenerated] = useState(false)
  const [OtpVerify,setOtpVerify] = useState(false)

  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));


   // We need ref in this, because we are dealing
    // with JS setInterval to keep track of it and
    // stop it when needed
    const Ref = useRef(null);

    // The state for our timer
    const [timer, setTimer] = useState('00:00:00');


    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 * 60 * 60) % 24);
        return {
            total, hours, minutes, seconds
        };
    }

  //   useEffect(() => {
  //     clearTimer(getDeadTime());
  // }, []);

    const startTimer = (e) => {
        let { total, hours, minutes, seconds }
                    = getTimeRemaining(e);
        if (total >= 0) {

            // update the timer
            // check if less than 10 then we need to
            // add '0' at the begining of the variable
            setTimer(
                (hours > 9 ? hours : '0' + hours) + ':' +
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }

  const clearTimer = (e) => {

    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next
    setTimer('00:01:60');

    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    console.log(Ref.current);
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
        startTimer(e);
    }, 1000)
    Ref.current = id;
}

const getDeadTime = () => {
    let deadline = new Date();

    // This is where you need to adjust if
    // you entend to add more time
    deadline.setSeconds(deadline.getSeconds() + 120);
    return deadline;
}

  const onTextChange = (e, key) => {
    const newData = {
      ...formData,
      [key]: e.target ? e.target.value : e.value,
    };
    updateData(newData);
  };
  const updateData = (data) => {
    setFormaData(data);
  };
  const { control_list,OTP,defaultdays='7',defaultday='2',TEMP_EXTEND,Remarks,Mobile } = formData;

  const OTPSend = (id) => {
   
    if(TEMP_EXTEND == '' || TEMP_EXTEND == undefined){
      errorToast('Please Enter Temp Extended Days...')
      return false
    }else if(Remarks == '' || Remarks == undefined){
      errorToast('Please Enter Remarks...')
      return false
    }else if(MobileNumber == '' || MobileNumber == undefined || !/^((\d{10})(,\d{10})*)$/.test(MobileNumber) ){
      errorToast('Please Enter Correct Mobile Number...')
      return false
    }

 const postdata = {
  control_list,
  TEMP_EXTEND,
  Remarks,
  Mobile:(control_list == 7 || control_list == 8) ? UserDetails.MOBILE_NUMBER : MobileNumber,
  MAIL_ID:UserDetails.MAIL_ID,
  GATE_ID:UserDetails.GATE_ID,
  USER_NAME:UserDetails.username,
  created_by:UserDetails.USERID,
  id:id,
 }
//  alert(JSON.stringify(postdata)) ;
// alert("3");
// console.log(JSON.stringify(postdata))

 showLoader();
 apiPostMethod(apiBaseUrl + "Processcancel/Control_panel_insert", postdata)
   .then((response) => {
   //  alert("4");
     const { data } = response;
     console.log(JSON.stringify(response))
    //  let RespId=data.success;
    // console.log(data)
    if(data.success == 0){
      errorToast(data.error);
      return false
    }else if(data.success == 1)
       setOtpGenerated(true)
       clearTimer(getDeadTime())
       ShowToast("OTP Send Successfully...");
   })
   .catch((error) => {
     console.log(JSON.stringify(error))
     errorToast("Something went wrong, please try again after sometime");
   })
   .finally((a) => {
     hideLoader();
   });
}
// console.log(OTP);
const OTPVerify = (e) => {
  // if (e.target.value.length >= 4){
  const postdata = {
   control_list,
   Mobile:(control_list == 7 || control_list == 8) ? UserDetails.MOBILE_NUMBER : MobileNumber,
   Remarks, 
   updated_by:UserDetails.USERID,
   OTP:OTP
  }
 //  alert(JSON.stringify(postdata)) ;
 // alert("3");
 // console.log(JSON.stringify(postdata))
 
  showLoader();
  apiPostMethod(apiBaseUrl + "Processcancel/OTP_Verify", postdata)
    .then((response) => {
    //  alert("4");
      const { data } = response;
      // console.log(JSON.stringify(response))
      // console.log(data.results)
      if(data.results === true){
        setOtpVerify(true)
        ShowToast("OTP Verify Successfully...");
        // RefreshPage()
        history.push(`/DCP:0`);
        // RefreshPage()
      }else{
        errorToast("Please Check OTP Number...");
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
  // }
 }

 const [MobileNumber,setMobileNumber] = useState("")

 useEffect(() => {
  GetData();
  modifiedOptions()
}, []);
const GetData = () => {
  apiPostMethod(apiBaseUrl + "Stmiascontrolpanel/Control_data_get")
    .then((response) => {
      const { data } = response;
      console.log(data)
      setMobileNumber(data.setting[0].mobile_numbers)
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
 }
  return (
    <Fragment>
      <Row>
        <Col sm="12" md="12">
          <FormGroup>
            <Label for="nameMulti">Delivery Control Panel List</Label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={statusOption}
              onChange={(e) => onTextChange(e, "control_list")}
              isDisabled={otpGenerated}
            />
          </FormGroup>
        </Col>
        {control_list < 5 &&
        <Col md="4" sm="12">
          <CustomTextInput label={"Default Days"} value={defaultdays} form={form} id="defaultdays" type="text" disabled onChange={(e) => onTextChange(e, "defaultdays")}/>
        </Col>}
        {control_list == 5 &&
        <Col md="4" sm="12">
          <CustomTextInput label={"Default Days"}  form={form} value={defaultday} id="defaultday" type="text" onChange={(e) => onTextChange(e, "defaultday")} disabled/>
        </Col>}
        {control_list == 6 &&
        <Col md="4" sm="12">
          <CustomTextInput label={"Default Days"}  form={form} value={"0"} id="defaultday" type="text" onChange={(e) => onTextChange(e, "defaultday")} disabled/>
        </Col>}
        {control_list &&
        <Col md="4" sm="12">
          <Label for="cityMulti">Temp Extended Days</Label>
          <NumberOnlyInput
            decimalFormat={"2"}
            placeholder="Temp Extended Days"
            value={TEMP_EXTEND}
            disabled={otpGenerated}
            onChange={(e) => onTextChange(e, "TEMP_EXTEND")}
         />
        </Col>}
        {control_list &&
        <Col md="4" sm="12">
          <CustomTextInput label={"Remarks"} value={Remarks} disabled={otpGenerated} onChange={(e) => onTextChange(e, "Remarks")} form={form} id="Remarks" type="text" maxlength="50" />
        </Col>}
      {/* </Row>
      <Row> */}
      {control_list &&
      <Col md="4" sm="12">
      <FormGroup>
      {control_list != 7 && control_list != 8 && 
          <CustomTextInput label={"Mobile Number"} form={form} disabled value={MobileNumber} onChange={(e) => onTextChange(e, "Mobile")} id="Mobile" type="text"  maxlength="100"/>}
      {control_list == 7 || control_list == 8 &&
          <CustomTextInput label={"Mobile Number"} form={form} disabled value={UserDetails.MOBILE_NUMBER} onChange={(e) => onTextChange(e, "Mobile")} id="Mobile" type="text"  maxlength="100"/>}
          <Button.Ripple color="secondary" hidden={otpGenerated} type="button" onClick={(e) => OTPSend(1)}>
                Generate OTP
        </Button.Ripple>
        {otpGenerated && (
                <span style={{color:"blue",fontWeight:"bold"}}>  {timer}</span>
            )}
        {otpGenerated &&
                  <Button.Ripple size="sm" class="text-white bg-dark" 
                  fontWeight={500}
                  disabled={(timer === '00:00:00' ? false : true) || OtpVerify}
                  // readOnly={acceptBtn2}
                  onClick={()=>{clearTimer(getDeadTime())
                    OTPSend(2)}
                  } align="center"> Resend
                  {/* <span style={{color:"white",fontWeight:"bold"}}> 00:{counter}</span> */}
            </Button.Ripple>}
      </FormGroup>
      </Col>}
      {otpGenerated &&
      <Col md="2" sm="12">
        <Label for="cityMulti">OTP</Label>
          <NumberOnlyInput
            decimalFormat={"4"}
            disabled={(timer === '00:00:00' ? true : false || OtpVerify)}
            placeholder="OTP"
            value={OTP}
            onChange={(e) => {onTextChange(e, "OTP")
            }}
         />
      </Col>}
      {OTP &&
      <Col md="2" sm="12">
         <Button.Ripple color="secondary" style={{ marginTop:'25%' }} 
         disabled={(timer === '00:00:00' ? true : false) || OtpVerify}
          type="button" onClick={(e) => OTPVerify()}>
                Verify OTP
        </Button.Ripple>
      </Col>}
      </Row>
      <Row>
      {/* {OtpVerify &&
      <Col className="offset-md-6 d-md-flex justify-content-end">
        <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit()}>
                Submit
        </Button.Ripple>
      </Col>} */}
     </Row>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <br hidden={control_list}/>
     <DeliveryControlList
        url={Master_Url}
        title={"Module List"}
        // actionRendorer={(row) => {
        //   let tx = row.isApproved ? `View` : "Edit";
        //   return (
        //     <Button.Ripple
        //       color="primary"
        //       onClick={() => {
        //         history.push(`/master/Module_master:` + row.MODULE_REFID );
        //       }}
        //     >
        //       {tx}
        //     </Button.Ripple>
        //   );
        // }}
      />
    </Fragment>
  );
};


const DeliveryControlPanel = () => {
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
     
      //MODULE_REFID: validation.required({ message:"Module Reference should not be empty", isObject: false }),
      MODULE_ID: validation.required({ message:"Module Name should not be empty", isObject: false }),
      SCREEN_NAME: validation.required({ message:"Screen Name should not be empty", isObject: false }),

    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
       //alert("2");
   
    let formData = form.values;
  
    const postdata = {
      formData,
    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updatemodule_master", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
          if(document.getElementById("MODULE_REFID").value=="")
          {
            history.push("/master/Module_master:0");
          }
          else
          {
            history.push("/master/Module_master");
          }
        }
        else
        {
          if(data.ErrorMsg)
          {
            errorToast(data.ErrorMsg);
          }
          else
          {
            errorToast("Unable to update record");
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
    history.push(`/master/Module_master`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Delivery Control Panel">
        <Module_masterentryform form={form}  onSubmit={onSubmit} />
      </CardComponent>
      
    </Fragment>
  );
};

export default DeliveryControlPanel;
