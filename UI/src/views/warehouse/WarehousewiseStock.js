import React, { Fragment, useEffect,useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { Paperclip, X, Plus } from "react-feather";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
////import WHForm from "./WHForm";
import { Row, Col,Button,Table,FormGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import EadList from "../List/EadList";
import { eadUrl } from "../../urlConstants";
import { split } from "lodash";
const WHForm = ({ form }) => {
  const history = useHistory();
  const [WHDatas, setWHData] = useState([]);

  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();

  
  const ShowWHDetails = () => {
    let fdata = {
      id: form.values.WareHouse.value,
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Warehouse/SubLot/getWarehouseDetails", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {

       console.log("tseting123");
    
        setWHData(data.RowArray);

         
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  }
  
  
 
 
 
  const RefreshPage = () => {
    history.push(`/master/ead`);
  };
  const LotNoClass={fontSize:"12px",fontWeight:"bold",padding:"2px",backgroundColor:"#E69A8DFF",color:"#fff",textAlign:"center"};
 
  let TotalStockClass="";
  return (
    <Fragment>
    
      <Row >
      <Col md="4" sm="12">
        <CustomDropdownInput url={`${apiBaseUrl}warehouse/master/getWareHouse`} label={"Warehouse Name"} form={form} id="WareHouse" />
        <span id='WareHouse_Error' style={{color: 'red'}} ></span>

        </Col>
        <Col md="4" sm="12">
         <br/>
        <Button.Ripple
            className="btn-icon"
            color="primary"
            onClick={(e) => {
              ShowWHDetails();
            }}
          >
           
            <span className="align-middle ml-25">Show</span>
          </Button.Ripple>
        </Col>
      
      </Row>

      <Row  style={{minHeight:"400px"}}>
      <Col md="12" sm="12">
        <div style={{width:"100%",overflowX:"auto"}}>
      <table border={0} style={{border:"1px solid #c1c1c1"}} >
                   
                      <tbody>
                      {WHDatas &&
          WHDatas.length>0 &&
          WHDatas.map((item, i) => {
            let Rlen=WHDatas.length-1;
            let Cspan=item.length+1;
            return(
              <>
              <tr><td style={{textAlign:"center"}}  colSpan={Cspan}>WALK WAY</td></tr>
             <tr>
             <td style={{padding:"15px"}}></td>
              {item.length>0 && item.map((item1,j)=>{
                 return(
                   <>
                 <td style={{border:"1px solid #c1c1c1",minWidth:"200px",padding:"0px",verticalAlign: 'top'}}>
                    {item1.length>0 && item1.map((item2,k)=>{
                      let Len=(item1.length)-1;
                     let OtherClass={fontWeight:"normal",padding:"2px"};
                      let splItem=item2.split("~");
                      if(k>0){
                        OtherClass={fontWeight:"normal",fontSize:"10px",color:"#fff",padding:"2px",backgroundColor:splItem[1]};
                      }
                      if(k==Len){
                        TotalStockClass={fontSize:"11px",fontWeight:"bold",padding:"2px",backgroundColor:"#E69A8DFF",color:"#fff"};
                      }

                 return(
                 
                    <div style={k==0?LotNoClass:k==Len ?  TotalStockClass :OtherClass}>{splItem[0]}</div>
                  
                 
                 );})}
                   </td>
                   
                   </>
                 );

              })}
<td style={{padding:"15px"}}></td>

               </tr>
               {i==Rlen && <tr><td style={{textAlign:"center"}}  colSpan={Cspan}>WALK WAY</td></tr>}
               </>
           
            );
          })}
       
                      </tbody>
                      </table>
                      </div>
        </Col>
      </Row>




     
    
    </Fragment>
  );
};


const WarehousewiseStock = () => {
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
      date: validation.required({ message:"Date should not be empty", isObject: false }),
      From_Location: validation.required({  message:"From Location should not be empty",isObject: true }),
      To_Location: validation.required({ message:"To Location should not be empty", isObject: false }),
      Mode_Of_Transport: validation.required({ message:"Mode of Transport should not be empty", isObject: false }),
      EAD: validation.required({  message:"Ead should not be empty",isObject: false  }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  
  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/ead`);
  };
 
  return (
    <Fragment>
      
      <CardComponent header="Warehouse wise Stock">
        <WHForm form={form}  />
      </CardComponent>
      
    </Fragment>
  );
};

export default WarehousewiseStock;
