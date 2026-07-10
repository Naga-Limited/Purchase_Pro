import React, { Fragment, useEffect, useState } from "react";
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
////import User_infoentryform from "./User_infoentryform";
import { Row, Col,Button, Input, InputGroupText, InputGroup } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { Master_Url } from "../../urlConstants";
import User_status_list from "../List/User_status_list";
const User_infoentryform = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id && id!=":0"){
  refid = id.replace(":", "");
  }
  const { showLoader, hideLoader } = useLoader();
  const [opencount, setOpencount] = useState(false)

  useEffect(() => {
    user_count();
  }, []);

  const user_count = () => {
    const post = {
      form : 'User_count',
    }
    showLoader();
    apiPostMethod(apiBaseUrl + "User/UserCount",post)
      .then((response) => {
        const { data } = response;
        setOpencount(data.results)
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };

        
  return (
    <Fragment>
      <Row>
          <Col sm={6} lg={4} style={{ backgroundColor:"green",marginLeft:'25px' }}>
                <div style={{ marginTop:'1rem',marginBottom:'1rem',backgroundColor: 'green' }}>
                <Input value={"Session Users Count - " + opencount.Total_Session_Users} label="Total Count" style={{
                        backgroundColor: 'green',
                        color: 'white',
                       }}>
                </Input>
                <InputGroup>
                <InputGroupText style={{
                        backgroundColor: 'green',
                        color: 'white',
                        width: '75%',
                      }}>Active Session
                      </InputGroupText><Input 
                      value={opencount.Session_Active_User}
                      style={{color:'white',backgroundColor:'green'}}/>
                </InputGroup>
                <InputGroup>
                <InputGroupText style={{
                        backgroundColor: 'green',
                        color: 'white',
                        width: '75%',
                      }}>Inactive Session
                      </InputGroupText><Input 
                      value={opencount.Session_Inactive_User}
                      style={{color:'white',backgroundColor:'green'}}/>
                </InputGroup>
                </div>
             
          </Col>
          <Col sm={6} lg={4} style={{ backgroundColor:"dodgerblue",marginLeft:'25px' }}>
                <div style={{ marginTop:'1rem',marginBottom:'1rem',backgroundColor: 'dodgerblue' }}>
                <Input value={"User Master Count - " + opencount.Total_Master_Users} label="Total Count" style={{
                        backgroundColor: 'dodgerblue',
                        color: 'white',
                       }}>
                </Input>
                <InputGroup>
                <InputGroupText style={{
                        backgroundColor: 'dodgerblue',
                        color: 'white',
                        width: '75%',
                      }}>Active Users
                      </InputGroupText>
                      <Input 
                      value={opencount.Active_User}
                      style={{color:'white',backgroundColor:'dodgerblue'}}/>
                </InputGroup>
                <InputGroup>
                <InputGroupText style={{
                        backgroundColor: 'dodgerblue',
                        color: 'white',
                        width: '75%',
                      }}>Inactive Users
                      </InputGroupText><Input 
                      value={opencount.Inactive_User}
                      style={{color:'white',backgroundColor:'dodgerblue'}}/>
                </InputGroup>
                </div>
             
          </Col>
      </Row>
      <hr/>

     <User_status_list
        url={Master_Url}
        title={"User Login Status"}
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/User_info:` + row.UI_ID );
              }}
            >
              {tx}
            </Button.Ripple>
          );
        }}
      />
    </Fragment>
  );
};


const User_status = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format();
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };


  
  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/User_info`);
  };
 
  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent>
        <User_infoentryform />
      </CardComponent>
      
    </Fragment>
  );
};

export default User_status;
