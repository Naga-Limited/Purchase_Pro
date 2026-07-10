import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import Uploader from "../Uploader";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { errorToast } from '../../helper/appHelper';
import { isObject, set } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { object } from 'prop-types';
import { event } from 'jquery';
import { check } from 'prettier';
import 'react-responsive-modal/styles.css';
const stockdetails = {
  warehouseid: "",
  locationid: "", 
  lotno: "",
  lotid: "",
  wheatvarietyid: "",
  Wheat_Variety_Id: "",
  Company: "",
  QtyinMTS: "",
  wh_name: "", 
  wh_code: "",
  plantid: "", 
  totalcapacity: "", 
  Fumigationreleaseqty: "", 
  Fumigationlockqty: "", 
  Degassingreleaseqty: "", 
  Degassinglockqty: "", 
  Pledgeqty: "", 
  Unpledgeqty: "", 
  Rndlockqty: "", 
  Rndreleasedqty: "", 
}

const WarehousePictorialviewData = ({form, onSubmit}) => { 
  const[stockdetailsdata, Setstockdetails] = useState({ ...stockdetails});
  const[warehouseoption, setWarehouseoption] = useState([]);
  let { showLoader, hideLoader } = useLoader();
  const[lotoption,setLotoption] = useState([]);
  const[locationoption,setLocationoption] = useState([]);  
  const[stockstatus,setstockstatus] = useState([]);
  const[wheatvarietyidoption,setwheatvarietyidoption] = useState([]); 
  const {warehousename,locationid,wh_code,plantid,lotid,lotno,wheatvarietyid,Wheat_Variety_Id,Company,QtyinMTS,totalcapacity,Fumigationreleaseqty,Fumigationlockqty,Degassingreleaseqty,Degassinglockqty,Pledgeqty,Unpledgeqty,Rndlockqty,Rndreleasedqty} = stockdetailsdata

  const onWarehouseChange = (e) => {
    const {value, label} = e; 

   form.setFieldValue('warehouseid', {  label: label,value: value });
    FillPlantList(value);
}
const onPlantchange = (e) => {
  const {value,label} = e; 

  form.setFieldValue('locationid', {  label: label,value: value });
  FillLotList(value)
}
const FillLotList = (plant) => {
  let fdata ={plantid:plant, screentype: "WarehousePictorialview"} 
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList',fdata) 
  .then((response) => {
    const { data } =response; 
    if(data.success) {
      setLotoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong please try again after sometime");
  });
};
    const onWheatvarietyChange = (e) => {
      const{value, label} = e; 
      form.setFieldValue('KeyWheatVariety', {  label: label,value: value });
}


const OnLotChange = (e) => {
  const {value, label} = e; 

  
  form.setFieldValue('lotid', {  label: label,value: value });

  FillWheatVarityList(value)
}
const FillWheatVarityList = (paramLotId) => {
  let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
    setwheatvarietyidoption([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
  };
const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"WarehousePictorialview"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
  .then((response) => {
    const { data } = response; 
    if(data.success) {

      setLocationoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  });
};

const onTextChange = (e,PKey, CheckList,Val) => {
  console.log(JSON.stringify(CheckList));
  form.setValues({...form.values,CheckList});
}
const onActionClick = () => {

  let Data=form.values.CheckList;
  let Select=0;
  for(let i=0;i<Data.length;i++){
    if(Data[i].Selected==1){
      Select=1;
    }
  }
  if(Select==0){
    errorToast("Select Atleast one Entry");
    return false;
  }
   const postdata = {
    Data,
     ScreenType:'Stockdetails',
    
   }

    console.log(JSON.stringify(postdata))
   showLoader();
   apiPostMethod(apiBaseUrl + "warehouse/stock/sublot", postdata)
     .then((response) => {
     const { data } = response;
     console.log(JSON.stringify(response))
     let UsrId=data.success;
     if(UsrId==-5){
       errorToast("Duplicate Entry");
     }else{
       let RespId=data.success;
       ShowToast("Saved Successfully...");
       form.setValues({});
       //history.push("/warehouse/WarehousePictorialview");
      // window.location.reload();

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
   useEffect(() => {
    //showWarehousewisestocks();
    }, []);

const showWarehousewisestocks = (e) => {
  let Data=form.values;
  let fdata = {
    Screen:"PICTORIALVIEW",
    Data
  };
  showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/reports/getPictorialView", fdata)
    .then((response) => {
      const { data } = response;
      console.log("Response Data :: "+JSON.stringify(response));
      if (data.success) {
        form.setValues({
          
          ...form.values,
        CheckList:data.results,
        MaximumColumn:data.MaximumColumn,
        WalkwayAfterColumn:data.WalkwayAfterColumn,
        TotRow:data.TotRow,
        SubLots:data.Sublot,
        checkLength:parseFloat(data.results.length*data.results.length)+1
        })
      }
      console.log("Result Data :: "+JSON.stringify(form));
    })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  })
  .finally((a) => {
    hideLoader();
  });
}

  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;

  return (
    <Fragment>   
      <Row>
        <Col md="3" sm="12" >
          <CustomTextInput   label={"System Date"} form={form} id="Wh_name" type="text"  placeholder={date} disabled/>
        </Col>

        <Col md="3" sm="12" >
          <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
            label={"Warehouse Name"}  form={form} id="warehouseid" 
            onChange = {onWarehouseChange}   
            options ={warehouseoption}   
          />
          <span id='warehouseid_Error' style={{color: 'red'}} ></span>
        </Col>

        <Col md="3" sm="12"> 
          <Button.Ripple onClick={showWarehousewisestocks} color="primary" type="Button">
            Show
          </Button.Ripple>
        </Col>
      </Row>

      
      <Row style={{width:"100%", overflow:"auto"}}>
        <Col md="12" sm="12" style={{width:"100px",fontSize:"12px"}}>
      <div>
      <table class="table-sm" style={{width:"100%"}} border={1} rules="groups">
        <tbody>
          {form.values.CheckList && form.values.CheckList.length>0 && 
            <tr>
              <td rowSpan={form.values.checkLength} style={{textAlign:"center",writingMode:"vertical-lr",textOrientation:"upright",fontWeight:"bold"}}>Walk Way</td>
              <td colSpan={parseFloat(form.values.MaximumColumn)+1} style={{textAlign:"center",fontWeight:"bold"}}>Walk Way</td>
              <td rowSpan={form.values.checkLength} style={{textAlign:"left",writingMode:"vertical-lr",textOrientation:"upright",fontWeight:"bold"}}>Walk Way</td>
            </tr>
          }
  
          {form.values.CheckList && form.values.CheckList.map((row2, index2) => (
          <>
            <tr> 
              {form.values.CheckList[index2] && form.values.CheckList[index2].map((row, index) => (
              <>
                {parseFloat(index)==form.values.WalkwayAfterColumn && index2==0 && 
                  <td rowSpan={parseFloat(form.values.checkLength)-1} >&nbsp;</td>}
                  <td valign='top' class="tooltip_new" style={{width:"20%",backgroundColor:"#FFBC79",border: "1px solid #808080"}}>
              
                  <table style={{borderSpacing:"8px",width:"100%"}}>
                    <tr>
                      <th style={{textAlign:"center"}}>{row.lotno}</th>
                    </tr>
                    {form.values.SubLots && form.values.SubLots.map((row1, index1) => (
                      <>
                      {row.lotid==row1.lotid  && 
                      <tr>
                        <td style={{fontSize:"11px",backgroundColor:"#e0964d",color:"#fff"}}>{row1.WheatVariety} - {row1.wheatqty}</td>
                      </tr>}
                      </> 
                    ))}  
                  </table>

                  <div class="tooltiptext">
                    <table style={{textAlign:"left"}}>
                      <tr><td>{row.lotno}</td></tr>
                      <tr><td>{row.SubLotSummary}</td></tr>
                    </table>   
                  </div>
                </td>
              </>
              ))} 
            </tr>
            <tr><td colSpan={5} style={{textAlign:"center",fontWeight:"bold"}}>Walk Way</td></tr>
          </>
          ))}  
        </tbody>
      </table> 
      </div>
      </Col>
      </Row>
    </Fragment>
  )
}


const WarehousePictorialview = () => {
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({


     }),
    onSubmit(values) {},
  });
  const onSubmit =() => {

  }
  return (
    <Fragment>
      <CardComponent  header="Pictorial View">
        <WarehousePictorialviewData form={form} onSubmit={onSubmit}/>
      </CardComponent>
    </Fragment>
  )
}

export default WarehousePictorialview