import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
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
import Input from 'reactstrap/lib/Input';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import { ToggleLeft } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler'; 
const physicalstock = {
    warehouseid: "", 
    slocation: "",
    wh_code: "",
    warehousename: "",                        
    locationid: "",    
    lotid: "",
    lotno: "", 
    plantid: "",
    Physical_Stock_date: "", 
    wheatvarietyid: "",
    WheatVariety: "",
    BagType: "",
    NoOfBag: "",  
  }

const  RelottingApproval = ({form,onSubmit}) => {
    const[stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
    const[warehouseoption, setWarehouseoption] = useState([]);                                                                       
    const[locationoption,setLocationoption] = useState([]);                                                                       
    const[lotoption,setLotoption] = useState([]);                                                                       
    const[makeroption,setMakeroption] = useState([]);                                                                       
    const[checkeroption,setcheckeroption] = useState([]);                                                                         
    const[wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
    const[bagtype,setBagtypeoption] = useState([]);                                                                         
    const[showlot,setshowlot] = useState([]);                                                                        
    const[showwheat, setwheat] = useState([]);                                                                      
 
 
    const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();
    let { Physical_Stock_Id } = useParams();
    let refid='';
    let fdata='';
    if( Physical_Stock_Id) {
       refid = Physical_Stock_Id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
      if(Physical_Stock_Id){
        onFetchStockentryById();
 
      }
    }, [Physical_Stock_Id]);
    const onFetchStockentryById = () => {
      let fdata = {
        id:refid,
      };
    showLoader();
    console.log("Request Url :: "+apiBaseUrl + "Master/getstockEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "Master/getstockEntrydatabyid", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           warehouseid:data.results[0].warehouseid,
           locationid:data.results[0].locationid,
           lotid:data.results[0].lotid,
           Physical_Stock_date:data.results[0].Physical_Stock_date,
           Maker:data.results[0].Maker,
           Checker:data.results[0].Checker,
           Wheat_Variety_Id:data.results[0].Wheat_Variety_Id,
           BagType:data.results[0].BagType,
           NoOfBag:data.results[0].NoOfBag,
           Qty_in_MTS:data.results[0].Qty_in_MTS,
           WheatVarietyid:data.results[0].WheatVarietyid
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
    }; 
    console.log("Request url :: "+apiBaseUrl + "Master/")
   
    const RefreshPage = () => {
      history.push(`/master/PhysicalstockEntry`);
    };
    const handleViewHistory = (data) => {
 
    } 
 
    const onWarehouseChange = (e) => {
      const {value, label} = e; 
      setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
      FillPlantList(value);
 }
 
 const FillPlantList  = (warehouseid) => {
   let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
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
 
 const onPlantchange = (e) => {
   const {value,label} = e; 
   setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
   FillLotList(value)
 
 }
 const FillLotList = (lotid) => {
   let fdata ={lotid:lotid, screentype: "PhysicalstockEntry"} 
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
 const OnLotChange = (e) => {
   const {value, label} = e; 
   setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 

  
 } 
 const onWheatvarietyChange = (e) => {
    const{value, label} = e; 
    setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 
 
 }
 
 const ShowStock = (e) => {
   let fdata = {warehouseid:warehouseid,locationid:locationid,lotid:lotid, screentype: "PhysicalstocEntry"} 
   apiPostMethod(apiBaseUrl+'warehouse/physicalstocktaking/getphysicalstocklist',fdata)
   .then((response) => {    
     const {data} = response;
     const  value = value;
     if(data.success){ 
       console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
 
 
         //setshowlot({ ...stockEntryformData, lotno:value}); 
         //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
            
     }
   })
   .catch((error) => {
     errorToast("Something went wrong, please try again after sometime")
   }); 
 
 }
    return (
        <Fragment> 
        <Row>
            <Col md="1" sm="12"> 
            <div  style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"12px"}} > 
                <table className='table-sm'>
                    <thead className='bg-primary text-white' style={{fontSize:"14px",height:"40px",textAlign:"center"}}>
                        <tr>
                            <th style={{minWidth:"130px"}}>Unique No</th> 
                            <th style={{minWidth:"130px"}}>Warehouse</th>
                            <th style={{minWidth:"110px"}}>Plant</th> 
                            <th style={{minWidth:"160px"}}>Storage Location</th>
                            <th style={{minWidth:"130px"}}>From Lot</th>
                            <th style={{minWidth:"110px"}}>To Lot</th> 
                            <th style={{minWidth:"160px"}}>wheat Variety</th> 
                            <th style={{minWidth:"190px"}}>Overall Duration Time</th> 
                            <th style={{minWidth:"180px"}}>Screen Duration Time</th> 
                            <th style={{minWidth:"120px"}}>Status</th>
                            <th style={{minWidth:"100px"}}>Action</th>
                         </tr>
                    </thead> 
                    <tbody style={{textAlign:"center"}}>
                        <tr>
                          
                                <td>1</td> 
                                <td>Database</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>From Database</td>
                                <td></td> 
                                <td></td>
                                <td><Button.Ripple color="primary"  type="Button">Entry</Button.Ripple></td>

                            
                        </tr>
                    </tbody>
                </table> 
                </div>
            </Col>
        </Row>

        </Fragment>
    )
}

const   RelottingApprovalData = () => {
    const history = useHistory();
    const {showLoader , hideLoader} = useLoader(); 
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);
    const isToday = (data) => {
      return moment(data).format(dateFormat) == today;
    };
    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({
        warehousid:validation.required({ message:"Warehouse Name should not be empty", isObject:false }),
        locationid: validation.required({  message:"Storage Location should not be empty",isObject: true }),
        lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
        Physical_Stock_date: validation.required({  message:"Date should not be empty",isObject: true }),
        Maker: validation.required({  message:"Maker should not be empty",isObject: true }),
        Checker: validation.required({  message:"Checker should not be empty",isObject: true }),
        Wheat_Variety_Id: validation.required({ message:"wheat vareity should not be empty", isObject: true }),
        BagType: validation.required({ message:"BagType should not be empty", isObject: true }),
        NoOfBag: validation.required({ message:"No of bag should not be empty", isObject: true }),
       }),
      onSubmit(values) {},
    }); 
    const Values = form.values;
    const onSubmit = () => { 
      if(!form.isValid)
      {
        form.setSubmitting(true);
        form.validateForm();
        return;
      }
      let stockEntryformData = form.values;
      const FrmData = { 
        warehousid:stockEntryformData.warehousename.value,
        locationid:stockEntryformData.locationid,
        lotid:stockEntryformData.lotno.value,
        Maker:stockEntryformData.Maker, 
        Checker:stockEntryformData.Checker,
        Wheat_Variety:stockEntryformData.Wheat_Variety,
        BagType:stockEntryformData.bagtype,
  
      };
      console.log(" Physical stock Entry :: "+JSON.stringify(FrmData));
      const postdata = {
        id:stockEntryformData.F_ID,
        Data:FrmData
      }
      console.log("  Physical stock Entry  :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  Physical stock Entry  :: "+apiBaseUrl + "Master", postdata);
      apiPostMethod(apiBaseUrl + "Master", postdata)
        .then((response) => {
          const { data } = response;
          console.log(" Response Data ::: "+JSON.stringify(response));
          
          let RespId=data.success;
          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
   
            if(document.getElementById("F_ID").value=="")
            {
              history.push("/warehouse");
            }
            else
            {
              history.push("/warehouse");
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
          console.log(" Error Data ::: "+JSON.stringify(error));
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
  
  
    }
    return (
        <Fragment>
        <CardComponent  header="Relotting Approval">
         <RelottingApproval  form={form}  onSubmit={onSubmit}  />
         </CardComponent>
        </Fragment>
    )
}

export default    RelottingApprovalData 
