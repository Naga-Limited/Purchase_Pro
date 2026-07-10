import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
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
import TableComponent from '../common/TableComponent';
//import warehousebagcuttingentrylist from './bagcuttingapprovalscreen';

export const taColumns = [
  {
    name: "ID",
    selector: "sub_lot_id",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Plant",
    selector: "PLANT_NAME",
    minWidth: "200px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Storage Location",
    selector: "StorageLocationName",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Lot No",
    selector: "lotno",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
     name: "Wheat Variety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Stock in MTS",
    selector: "wheatqty",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Last Fumigation Type",
    selector: "Fumigation_Type",
    sortable: true,
    cell: (row) => {
      return(
        <>
      {row.Fumigation_Status == '1'?
      'ALP':row.Fumigation_Status == '2'?'Quick Gas':''
       }
       </>
      );
    },
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Last Fumigation On",
    selector: "LastFumigatnDt",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Last Degassed On",
    selector: "LastDegasDt",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },

  {
    name: "Next Due Date",
    selector: "NextFumigatnDt",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Lead Days",
    selector: "FumigationLapsed",
    sortable: true,
    minWidth: "100px",
    wrap: true,
  },
  {
    name: "Fumigation Status",
    selector: "FumigationStatusName",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
];  



const FumigationStatusView = ({form})  => { 
    const[bagcuttingEntryformData , setbagcuttingentryfromData] = useState([]);  
const[formDBData , setformDBData] = useState([]);
  const[lotoption,setLotoption] = useState([]);  
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);   
    const[lotidoption, setlotidoption] = useState([]);                                                                       
	  const[Wheat_Variety_Idoption,setwheatvarietyidoption] = useState([]);
    const[locationoption,setLocationoption] = useState([]);  
    const[storageLocationOption,setstorageLocationOption] = useState([]);   
    const[warehouseoption, setWarehouseoption] = useState([]);  
    const [WhLotOptions, setWhLotOptions] = useState([]); 

    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 

    useEffect(() => {
        getSublotlist();
    }, [id]);

    const getSublotlist = () => {
      let Data= form.values;
      let fdata = {
      Screen:"FUMIGATIONENTRYLIST",
      Data
      };
    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/fumigation/getSublotlist", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           
          ...form.values,
        CheckList:data.results,
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
      history.push(`/warehouse/bagcuttingApproval`);
    };
    
    const onWheatvarietyChange = (e) => {
      const{value, label} = e; 
      form.setFieldValue('KeyWheatVariety', {  label: label,value: value });
      //getKeyloanDet(value, label);
      
    }
    const FillLotList = (Value) => {
    //let fdata ={plantid:paramPlantid, screentype: "PhysicalstockEntry"} 
    let fdata ={storagelocationId:Value, screentype: "Warehousewisestocks"} 
      apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotListFromStorageLocation',fdata) 
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
 
    const onTextChange = (e,PKey, CheckList,Val) => {

      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].sub_lot_id==PKey){
            if(Val=="NextFumigatnDt"){
              CheckList[i].NextFumigatnDt=e.target.value;
            }
            
            
            
        }
      }
      console.log(JSON.stringify(CheckList));
      form.setValues({...form.values,CheckList});
    }
  
 
   //(Delivery Qty / Cutting Bag Size) Vs Entered No of Bags = 10% Tollerance
 const CalcBagQty = (e)=>{
   let Tmpdelivery_Qty=e.target.value;
   let TmpA_Qty=(form.values.Tmpdelivery_Qty / form.values.ngw_bag.WEIGHT)
   let TmpB_Qty=(form.values.no_of_bags-TmpA_Qty)/100;
  /* IF TmpB_Qty between <=+0.10) and  >=-0.10 then allow
else error Not able to submit
    return;*/
  form.setValues(
    {...form.values, 
     delivery_qty: Tmpdelivery_Qty,

    });
 }

 
 
const ActionEntry = (sub_lot_id,Status) => {
  if(Status==1){
    history.push("/warehouse/FumigationTeam:"+sub_lot_id);
    //history.push(`/warehouse/masters/state_district:` + row.id );
  }

  if(Status==3){
    history.push("/warehouse/ForceFumigationTeam:"+sub_lot_id);
    //history.push(`/warehouse/masters/state_district:` + row.id );
  }

  if(Status==2){
    history.push("/warehouse/FumigationQCTeam:"+sub_lot_id);
    //history.push(`/warehouse/masters/state_district:` + row.id );
  }
     

  /*let Data={nextfumigationdate:DueDate}
  const postdata = {
    id:sub_lot_id,
    Status,
    ScreenType:'FUMIGATIONLIST',
    Data
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/fumigation/updateSublot", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/FumigationStatusView");
    window.location.reload();
     
      }
      getSublotlist();
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });*/

}
const onWarehouseChange = (e) => {
  const {value, label} = e; 
 // setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
 form.setFieldValue('warehouseid', {  label: label,value: value });
 FillPlantList(value);
 //FillStorageLocationFromWarehouse(value);
 ClearDropdown("WH");
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

const FillStorageLocationFromWarehouse = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"Warehousewisestocks"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHstoragelocationList',fdata)
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
const OnLotChange = (e) => {
  const {value, label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
  
  form.setFieldValue('lotid', {  label: label,value: value });
  FillWheatVarityList(value)
  ClearDropdown("LOT");
 
} 
const FillWheatVarityList = (paramLotId) => {
  let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
  setWhWheetVarietyOptions([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
  };

const onPlantchange = (e) => {
  const {value,label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
  
  form.setFieldValue('plantid', {  label: label,value: value });
  //FillLotList(value)
  FillStorageLocationList(value)
  ClearDropdown("PLANT");
}

const FillStorageLocationList=(PlantId)=>{
  let fdata = { PlantId, screenType: "RND" };
  apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
  .then((response) => {
  const { data } = response;
  if (data.success) {
 
    setstorageLocationOption([{ options: data.results }]);
 
  //getLotInfo(paramLotId,type);
  
  }
  })
  .catch((error) => {
  errorToast("Something went wrong, please try again after sometime");
  });
 };

const onStorageLocationchange =(e) =>{
  const {value,label} = e; 
  form.setFieldValue('locationid', {  label: label,value: value });
  FillLotList(value)
  ClearDropdown("SL");
}
const gotoFumigationTeam= () =>{
  history.push("/warehouse/FumigationTeam");
}
const gotoDegasQC= () =>{
  history.push("/warehouse/FumigationQCTeam");
}

    const ClearDropdown = (Item) => {
      if (Item === "WH"){
        form.setFieldValue('plantid', '');
        form.setFieldValue('locationid','');
        form.setFieldValue('lotid', '');
        form.setFieldValue('KeyWheatVariety', '');
      }else if (Item === "PLANT"){
        form.setFieldValue('locationid','');
        form.setFieldValue('lotid', '');
        form.setFieldValue('KeyWheatVariety', '');
      }else if (Item === "SL"){
        form.setFieldValue('lotid', '');
        form.setFieldValue('KeyWheatVariety', '');
      }else if (Item === "LOT"){
        form.setFieldValue('KeyWheatVariety', '');
      }
    }

    return ( 
      <Fragment>
        <Row>  
          <Col md="3" sm="12" > 
            <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
              label={"Warehouse Name"}  form={form} id="warehouseid" 
              onChange = {onWarehouseChange}   
              options ={warehouseoption}   
              />
            <span id='warehouseid_Error' style={{color: 'red'}} ></span>
            </Col>

            <Col md="3" sm="12"> 
              <CustomDropdownInput  
                label = {"Plant"}
                form={form} id="plantid"
                onChange={onPlantchange} 
                options={locationoption}
                />
              <span id='plantid_Error' style={{color: 'red'}} ></span>
            </Col>


            <Col md="3" sm="12"> 
              <CustomDropdownInput  
                label = {"Storage Location"}
                form={form} id="locationid"
                onChange={onStorageLocationchange} 
                options={storageLocationOption}
                />
              <span id='locationid_Error' style={{color: 'red'}} ></span>
            </Col>

            
            <Col md="3" sm="12"> 
              <CustomDropdownInput  
                label = {"Lot No"}
                form={form} id="lotid"   
                options= {lotoption}
                onChange={OnLotChange} 
                />
              <span id='lotid_Error' style={{color: 'red'}} ></span>
            </Col>

            <Col md="3" sm="12"> 
              <CustomDropdownInput
                label ={"Wheat Variety"} 
                options={WhWheatvarietyOptions} 
                form={form} 
                id="KeyWheatVariety" 
                className="react-select"
                classNamePrefix="select"
                onChange={(e) => onWheatvarietyChange(e)}
                />
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <FormGroup className="d-flex justify-content-end mb-0">
                <Button.Ripple color="primary"  type="Button" onClick={getSublotlist} >
                  Search
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
          <br/><br/>
          <Row>
            <Col>
              <TableComponent hideSearch columns={taColumns} data={form.values.CheckList} showDownload/>  
            </Col>
          </Row>

          {/*
<div style={{Width:"970px",minHeight:"40vh",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm'> 
            <thead className='bg-primary text-white ' style={{height:"50px",textAlign:"center",fontSize:"12px"}}> 
                <tr> 
                   <th style={{minWidth:"150px",fontWeight:"500"}}>Warehouse Name...</th>
                   <th style={{minWidth:"150px",fontWeight:"500"}}>Plant</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Storage Location</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Lot No</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Wheat Variety</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Stock in MTS</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Last Fumigation Type</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Last Fumigation On</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Last Degassed On</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Next Due Date</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Lead Days</th>
                    <th style={{minWidth:"150px",fontWeight:"500"}}>Fumigation Status</th>
                  
                    
                </tr>
            </thead> 
            <tbody  style={{textAlign:"center"}}>
             
            {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
                        <tr>
                            <td>{row.WH_NAME}</td>
                          <td>{row.PLANT_NAME}</td>
                          <td>{row.StorageLocationName}</td>
                          <td>{row.lotno}</td>
                          <td>{row.WheatVariety}</td>
                          <td>{row.wheatqty}</td>
                         
                          <td>{row.Fumigation_Type}</td>
                          <td>{row.LastFumigatnDt}</td>
                          <td>{row.LastDegasDt}</td>
                         
                          <td> {row.NextFumigatnDt}</td>
                      <td>{row.FumigationLapsed}</td>
                      <td>{row.FumigationStatusName}</td>
                         
                     


                             </tr>
                        ))}  

            </tbody>
        </table>  
        </div>
            */}
        </Fragment>
    )
} 
const FumigationStatusViewData = () => { 
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
Posting_Date: validation.required({  message:"Posting Date should not be empty",isObject: false }),
va_no:validation.required({ message:"VA Number should not be empty", isObject:false }),
delivery_no:validation.required({ message:"Delivery Number should not be empty", isObject:false }),
delivery_date:validation.required({ message:"Delivery Date should not be empty", isObject:false }),
delivery_qty:validation.required({ message:"Delivery Qty should not be empty", isObject:false }),
bag_type:validation.required({ message:"Bag Type should not be empty", isObject:false }),
no_of_bags:validation.required({ message:"No Of Bags should not be empty", isObject:false }),
sending_plant:validation.required({ message:"Sending Plant should not be empty", isObject:false }),
sending_stroage_location:validation.required({ message:"Sending Stroage Location should not be empty", isObject:false }),
receiving_plant:validation.required({ message:"Receiving Plant should not be empty", isObject:false }),
receiving_stroage_location:validation.required({ message:"Receiving Stroage Location should not be empty", isObject:false }),
wheat_variety:validation.required({ message:"Wheat Variety should not be empty", isObject:false }),
bag_cuttiing_vendor:validation.required({ message:"Bag Cuttiing Vendor should not be empty", isObject:false }),
bag_cutting_charges:validation.required({ message:"Bag Cutting Charges should not be empty", isObject:false }),
tollerancepercent:validation.required({ message:"Tollerancepercent should not be empty", isObject:false }),
wm_remarks:validation.required({ message:"WM Remarks should not be empty", isObject:false }),
approvestatus:validation.required({ message:"Approval Status should not be empty", isObject:false }),

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
    let formData = form.values;
    const FrmData = { 

bagcuttingid:formData.bagcuttingid.value,
va_no:formData.va_no.value,
delivery_no:formData.delivery_no.value,
delivery_date:formData.delivery_date.value,
delivery_qty:formData.delivery_qty.value,
bag_type:formData.bag_type.value,
no_of_bags:formData.no_of_bags.value,
sending_plant:formData.sending_plant.value,
sending_stroage_location:formData.sending_stroage_location.value,
receiving_plant:formData.receiving_plant.value,
receiving_stroage_location:formData.receiving_stroage_location.value,
wheat_variety:formData.wheat_variety.value,
bag_cuttiing_vendor:formData.bag_cuttiing_vendor.value,
bag_cutting_charges:formData.bag_cutting_charges.value,
tollerancepercent:formData.tollerancepercent.value,
wm_remarks:formData.wm_remarks.value,
approvestatus:formData.approvestatus.value,
    };
    console.log(" Bag Cutting Approval :: "+JSON.stringify(FrmData));
    const postdata = {
      id:formData.bagcuttingid,
      Data:FrmData
    }
    console.log("  Bag Cutting Approval :: "+JSON.stringify(postdata));
    showLoader();
    console.log("  Bag Cutting Approval :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "Master", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
            history.push("/warehouse/bagcuttingadjustmentapprove");

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
    return(
        <Fragment>
        <CardComponent  header="Fumigation Status View">
       <FumigationStatusView form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )

}

export default FumigationStatusViewData 
