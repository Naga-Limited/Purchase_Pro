import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
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
import WarehouseDashboardlist from './WarehouseDashboardlist';
import { WHMaster_ListUrl  } from "../../urlConstants";

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
  Maker: "", 
  Checker: "", 
  wheatvarietyid: "",
  WheatVariety: "",
  BagType: "",
  NoOfBag: "",  
  Qty_in_MTS: "",
  Image1 : "",
  Image2: "",
  Images3: "",
  Images4: "",
  Audit_Remarks: "",
  OutBox_Indicator: "",
}

  const WarehouseDashBoard = ({form,onSubmit}) => {
    const [stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
    const [warehouseoption, setWarehouseoption] = useState([]);                                                                       
    const [locationoption,setLocationoption] = useState([]);                                                                       
    const [lotoption,setLotoption] = useState([]);                                                                       
    const [makeroption,setMakeroption] = useState([]);                                                                       
    const [checkeroption,setcheckeroption] = useState([]);                                                                         
    const [wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
    const [bagtype,setBagtypeoption] = useState([]);                                                                         
    const [showlot,setshowlot] = useState([]);                                                                        
    const [showwheat, setwheat] = useState([]);                                                                       
    const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;

    const history = useHistory();
    let { Physical_Stock_Id } = useParams();
    const onTextChange = (e, key) => {
      console.log("Test");
      let Value=e.target ? e.target.value : e.value;
      console.log(Value);
      let regEx = /[^a-zA-Z0-9]/gi; 
         
      Value = Value.replace(regEx, "");
      console.log(Value);
      form.setValues({
        ...form.values,
        [key]:Value,
      });
    };

    const statusOptions = [
      {
        options: [
          { value: "-1", label: "A-Accepted" },
          { value: "2", label: "QC Entry" },
          { value: "3", label: "QC Manager Approve" },
          { value: "4", label: "BH Approve" },
          { value: "5", label: "Lot Creation" },
          { value: "6", label: "LotCreation Approve" },
          { value: "7", label: "Commercial Entry" },
          { value: "8", label: "Commercial Entry Approval" },

          { value: "102", label: "QC Entry" },
          { value: "103", label: "QC Manager Approve" },
          { value: "104", label: "BH Approve" },
          { value: "105", label: "Lot Creation" },
          { value: "106", label: "LotCreation Approve" },
          { value: "107", label: "Commercial Entry" },
          { value: "108", label: "Commercial Entry Approval" },

          { value: "9", label: "Completed" },
      
        ],
      },
    ];
    let refid='';
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
     /* const {value, label} = e; 
      setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
      FillPlantList(value);*/
      const { value, label } = e;
      form.setFieldValue('warehouseid', {  label: label,value: value });
    }
 
 const FillPlantList  = (warehouseid) => {
   let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
   apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
   .then((response) => {
     const { data } = response; 
     if(data.success) {
     //  setLocationoption([{options:data.results}]);
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
  // Fillwheatvarity(value)
  
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
        <Row >
          <Col md="3" sm="12" >
            <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
              label={"Warehouse Name"}  form={form} id="warehouseid" 
              onChange = {onWarehouseChange}   
              options ={warehouseoption}   
           />
          </Col>  
          <Col md="3" sm="12"> 
            <Label>Warehouse Status</Label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={statusOptions}
                onChange={(e) => onTextChange(e, "warehouse_status")}/>
          </Col> 
          <Col md="3" sm="12"> 
            <Label>QC Status</Label>
              <Select  
                form={form} id="QC_Status"
                onChange={onPlantchange} 
                options={locationoption}
                value={{label:slocation, value:locationid }} /> 
          </Col> 
          <Col sm="12"> 
          <FormGroup className="d-flex justify-content-end mb-0">
            <Button.Ripple color="primary" type="Button" >Search</Button.Ripple> 
          </FormGroup>
          </Col>
          </Row> 
          <WarehouseDashboardlist
              url={WHMaster_ListUrl}
              title={""}
              id="warehouseDashboardlist"
              showDownload={true}
              postData={form.values}
              actionRendorer={(row) => {
                let tx = row.isApproved ? `View` : "view";
              
                return (
                  <Button.Ripple
                    color="primary"
                    onClick={() => {
                      history.push(`/warehouse/WarehouseDashBoardData:` + row.divisionid );
                    }}>
                    {tx}
                  </Button.Ripple>
                );
              }}
            />   
          </Fragment>
        )
}

const WarehouseDashBoardData = () => {
    const history = useHistory();
    const {showLoader , hideLoader} = useLoader(); 
    const dateFormat = "dd-mm-yyyy";
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
        <CardComponent  header="Warehouse DashBoard">
          <WarehouseDashBoard form={form}  onSubmit={onSubmit}  />
        </CardComponent>
      </Fragment>
    )
}

export default WarehouseDashBoardData
