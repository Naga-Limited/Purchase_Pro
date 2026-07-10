import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import { apiBaseUrl, previewUrl, vaUrl } from '../../urlConstants'
import Select, { NonceProvider } from "react-select";
import { Paperclip } from "react-feather";
import Row from 'reactstrap/lib/Row'
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
import Uploader from "../Uploader";


const warehouseQCTeam = {
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
  
const WarehouseCreationqualityTeam = ({form,onSubmit, setTitleName,isViewOnly})  => {
  if(!isViewOnly)
  {
    isViewOnly=false;
  }

    const[stockEntryformData , setStockEntryfromData] = useState({ ...warehouseQCTeam });  
    const[warehouseoption, setWarehouseoption] = useState([]);                                                                       
    const[locationoption,setLocationoption] = useState([]);                                                                       
    const[lotoption,setLotoption] = useState([]);                                                                       
    const[makeroption,setMakeroption] = useState([]);                                                                       
    const[checkeroption,setcheckeroption] = useState([]);                                                                         
    const[wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
    const[bagtype,setBagtypeoption] = useState([]);                                                                         
    const[showlot,setshowlot] = useState([]);                                                                        
    const[showwheat, setwheat] = useState([]);  
     const[independent_gate,setindependent_gate] = useState([]);
 
     //setTitleName("TEST");
    const { warehouseid, warehousename,plantid,slocation ,wh_code,locationid, lotid, lotno,  Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='', sumitdisabled=false;
    if( id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
      if(id){
        onFetchWarehouseApprovalDet();
 
      }
    }, [id]);
    const onFetchWarehouseApprovalDet = () => {
      let fdata = {
        id:refid,
      };
    showLoader();
    //console.log("Request Url :: "+apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseDetailsById", fdata);
     apiPostMethod(apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseDetailsById", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           wh_refid:data.results[0].wh_refid,
           wh_code:data.results[0].wh_code,
           wh_name:data.results[0].wh_name,
           whaddress:data.results[0].whaddress,
           street:data.results[0].street,
           district:data.results[0].district,
           whpincode:data.results[0].whpincode,
           state:data.results[0].state,
           whlat:data.results[0].whlat,
           whlong:data.results[0].whlong,
           godown_type:data.results[0].godown_type,
           
           ownertype:data.results[0].ownertype,
           ownername:data.results[0].ownername,
           
           owneraddress:data.results[0].owneraddress,
           ownerstreet:data.results[0].ownerstreet,
           ownerdistrict:data.results[0].ownerdistrict,
           ownerstate:data.results[0].ownerstate,
           ownerlandlineno:data.results[0].ownerlandlineno,
           ownermobileno:data.results[0].ownermobileno,
           ownermailid:data.results[0].ownermailid,
           totalcapacityinmts:data.results[0].totalcapacityinmts,
           totalcapacityinsqft:data.results[0].totalcapacityinsqft,
           outsideareacapacitymts:data.results[0].outsideareacapacitymts,
           outsideareacapacityinsqft:data.results[0].outsideareacapacityinsqft,
           contractstartdate:data.results[0].contractstartdate,
           contractenddate:data.results[0].contractenddate,
           whcity:data.results[0].whcity,
           whpincode:data.results[0].whpincode,
           ownername:data.results[0].ownername,
           ownerpincode:data.results[0].ownerpincode,
           ownercity:data.results[0].ownercity,
           ownerfaxnumber:data.results[0].ownerfaxnumber,
           pillarinfo:data.results[0].pillarinfo,
           advancevalueaftertds:data.results[0].advancevalueaftertds,
           rentduedate:data.results[0].rentduedate,
           name_of_collateral:data.results[0].name_of_collateral,
           name_of_bank:data.results[0].name_of_bank,
           /*naga_pwh_insurance_no:data.results[0].naga_pwh_insurance_no,
           /naga_pwh_insurance_attachment:data.results[0].naga_pwh_insurance_attachment,
           insurance_covered_amt:data.results[0].insurance_covered_amt,
           insurance_premium_amt:data.results[0].insurance_premium_amt,
           insurance_period:data.results[0].insurance_period,
           insurance_company:data.results[0].insurance_company,
           gst_registration:data.results[0].gst_registration,*/
           company_name:data.results[0].company_name,
           godown_type:data.results[0].godown_type,
           contract_agreement_attachment:data.results[0].contract_agreement_attachment,
           gst_type:data.results[0].gst_type,
           effective_from:data.results[0].effective_from,
           effective_to:data.results[0].effective_to,
           cost_centre:data.results[0].cost_centre,
           gl_account:data.results[0].gl_account,
           rentpersqft:data.results[0].rentpersqft,
           rentpermonth:data.results[0].rentpermonth,
           lockingperiodinmonths:data.results[0].lockingperiodinmonths,
           noticeperiodinmonths:data.results[0].noticeperiodinmonths,
           contracttype:data.results[0].contracttype,
           servicechargespwh:data.results[0].servicechargespwh,
           bankname:data.results[0].bankname,
           bankbranch:data.results[0].bankbranch,
           bankcity:data.results[0].bankcity,
           bankdistrict:data.results[0].bankdistrict,
           bankstate:data.results[0].bankstate,
           bankpincode:data.results[0].bankpincode,
           bankaccountno:data.results[0].bankaccountno,
           bankifsc:data.results[0].bankifsc,
           wb_count:data.results[0].wb_count,
           wb_1_name:data.results[0].wb_1_name,
           wb_2_name:data.results[0].wb_2_name,
           wb1_capacity_in_mts:data.results[0].wb1_capacity_in_mts,
           wb2_capacity_in_mts:data.results[0].wb2_capacity_in_mts,
           wb1_stamping_certificate_attachment:data.results[0].wb1_stamping_certificate_attachment,
           wb2_stamping_certificate_attachment:data.results[0].wb2_stamping_certificate_attachment,

          //  Dijo 03
          wh_photograph_attachment:data.results[0].wh_photograph_attachment,
          wh_photograph_attachment1:data.results[0].wh_photograph_attachment1,
          wh_photograph_attachment2:data.results[0].wh_photograph_attachment2,
          wh_photograph_attachment3:data.results[0].wh_photograph_attachment3,


           wb1_stamping_start_date:data.results[0].wb1_stamping_start_date,
           wb1_stamping_expiry_date:data.results[0].wb1_stamping_expiry_date,
           wb2_stamping_start_date:data.results[0].wb2_stamping_start_date,
           wb2_stamping_expiry_date:data.results[0].wb2_stamping_expiry_date,
           /*insurance_start_date:data.results[0].insurance_start_date,
           insurance_end_date:data.results[0].insurance_end_date,*/
           separate_electric_meters:data.results[0].separate_electric_meters,
           electric_plug_points_inside:data.results[0].electric_plug_points_inside,
           electric_light_points_inside:data.results[0].electric_light_points_inside,
           electric_light_points_outside:data.results[0].electric_light_points_outside,
           electric_plug_points_outside:data.results[0].electric_plug_points_outside,
           drinking_water_facility:data.results[0].drinking_water_facility,
           no_of_fire_extinguisher:data.results[0].no_of_fire_extinguisher,
           borewell_facility:data.results[0].borewell_facility,
           toilet_facility:data.results[0].toilet_facility,
           water_connection:data.results[0].water_connection,
           year_of_construction:data.results[0].year_of_construction,
           warehouse_security:data.results[0].warehouse_security,
           naga_security:data.results[0].naga_security,
           boundary_wall:data.results[0].boundary_wall,
           distance_railway_goods_shed:data.results[0].distance_railway_goods_shed,
           distance_mandi:data.results[0].distance_mandi,
           distance_national_highways:data.results[0].distance_national_highways,
           distance_fci_procurement_point:data.results[0].distance_fci_procurement_point,
           distance_state_highways:data.results[0].distance_state_highways,
           distance_pucca:data.results[0].distance_pucca,
           statutory_survey_type:data.results[0].statutory_survey_type,
           statutory_type_attachment:data.results[0].statutory_type_attachment,
           license_no_1:data.results[0].license_no_1,
           license_copy_attachment1:data.results[0].license_copy_attachment1,
           license_no_2:data.results[0].license_no_2,
           license_copy_attachment2:data.results[0].license_copy_attachment2,
           license_no_3:data.results[0].license_no_3,
           license_copy_attachment3:data.results[0].license_copy_attachment3,
           independent_gate:data.results[0].independent_gate,
           wall_type:data.results[0].wall_type,
           shutter_count:data.results[0].shutter_count,
           plinth:data.results[0].plinth,
           no_of_exits:data.results[0].no_of_exits,
           roof_type:data.results[0].roof_type,
           door_count:data.results[0].door_count,
           floor_height:data.results[0].floor_height,
           //wh_photograph_attachment:data.results[0].wh_photograph_attachment,
           floor_type:data.results[0].floor_type,
           window_count:data.results[0].window_count,
           height_from_adj_land:data.results[0].height_from_adj_land,
           inside_road_type:data.results[0].inside_road_type,
           inside_heavy_vehicle_mvmt:data.results[0].inside_heavy_vehicle_mvmt,
           inside_no_of_truck_in_capacity:data.results[0].inside_no_of_truck_in_capacity,
           repair_work_remarks:data.results[0].repair_work_remarks,
           latest_audit_date:data.results[0].latest_audit_date,
           next_audit_due_date:data.results[0].next_audit_due_date,
           audit_type:data.results[0].audit_type,

         });
         form.setFieldValue('independent_gate', {  label: data.results[0].independent_gate==1?'Yes':'No',value: data.results[0].independent_gate });
         form.setFieldValue('inside_heavy_vehicle_mvmt', {  label: data.results[0].inside_heavy_vehicle_mvmt?'Yes':'No',value: data.results[0].inside_heavy_vehicle_mvmt });
         
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

    // console.log("Request url :: "+apiBaseUrl + "Master/")
   
    const RefreshPage = () => {
      history.push(`/warehouse/wclqcmgr`);
    };
    const handleViewHistory = (data) => {
 
    } 
 
    const onWarehouseChange = (e) => {
      const {value, label} = e; 
      setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
      FillPlantList(value);
 }
 
 const FillPlantList  = (warehouseid) => {
   let fdata = {WH_CODE:warehouseid, screentype:"warehouseQCTeamEntry"}
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
   let fdata ={lotid:lotid, screentype: "warehouseQCTeamEntry"} 
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
 
//  const ShowStock = (e) => {
//    let fdata = {warehouseid:warehouseid,locationid:locationid,lotid:lotid, screentype: "PhysicalstocEntry"} 
//    apiPostMethod(apiBaseUrl+'warehouse/warehouseQCTeamtaking/getwarehouseQCTeamlist',fdata)
//    .then((response) => {    
//      const {data} = response;
//      const  value = value;
//      if(data.success){ 
//        console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  
 
 
//          //setshowlot({ ...stockEntryformData, lotno:value}); 
//          //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
            
//      }
//    })
//    .catch((error) => {
//      errorToast("Something went wrong, please try again after sometime")
//    }); 
 
//  }

const onApproveReject = (e) => { 
  console.log(" Approve");
  console.log(e.target.value);
  e.preventDefault();
  let reject=0, approve=0;
  if(e.target.value && e.target.value=="APPROVE")
  {
    form.setValues({...form.values, reject:"0",approve:"1" });
    reject=0;
    approve=1;
  }
  else
  {
    form.setValues({...form.values, reject:"1",approve:"0" });
    reject=1;
    approve=0;
  }

  onSubmitApproveReject(approve, reject);

}


const onSubmitApproveReject = (approve, reject) => { 
  console.log("Before Submit " + form.values.approve + " " + form.values.reject+"X");
  
  /*if(!form.isValid)
  {
    form.setSubmitting(true);
    form.validateForm();
    return;
  }*/
  form.setSubmitting(true);
  const formData = form.values;

  const FrmData = { 
    RejectReason:formData.RejectReason,
  };
  const postdata = {
    id:formData.wh_refid,
    Data:FrmData,
    approve:approve,
    formtype:"QCMGRAPPROVAL",
    reject:reject,
  }
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseApprove", postdata)
    .then((response) => {
      const { data } = response;
      console.log(" Response Data ::: "+JSON.stringify(response));
      
      let RespId=data.success;
      if(RespId && RespId>=1)
      {
        ShowToast("Saved Successfully...");

          history.push("/warehouse/wclqcmgr");
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

// Dijo 02
const openAttach = (url) => {
  //   window.open(previewUrl + url, "_blank");
 //To NAS Server
 window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
     
   };
 
    return (
        <Fragment> 
            <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px"}}> 
           
            <Row> 
                <Col md="2" sm="12">

           <CustomDropdownInput 
           url={`${apiBaseUrl}warehouse/master/getCommonDetails`} form={form} 
           label={"Independent Gate"} isDisabled id="independent_gate"/>
           <span id="independent_gate_Error" style={{color: "red"}} ></span>
           <CustomTextInput form={form} id="wh_name" type="hidden"  />
                 <CustomTextInput form={form} id="wh_refid" type="hidden"  />
           </Col>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"No of Exits"} form={form} id="no_of_exits" disabled type="Number"  />
                    <span id="no_of_exits_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Wall Type"} form={form} id="wall_type" disabled type="text"  />
                    <span id="wall_Type_Error" style={{color: "red"}} ></span>
                    </Col>

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Roof Type"} form={form} id="roof_type" disabled type="text"  />
                    <span id="roof_type_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Floor Type"} form={form} id="floor_type" disabled type="text"  />
                    <span id="floor_type_Error" style={{color: "red"}} ></span>

                    </Col>
                </Row>  
        
                <Row>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Shutter Count"} form={form} id="shutter_count" disabled type="Number"  /> 
                    <span id="shutter_count_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Door Count"} form={form} id="door_count" disabled type="Number"  />  
                    <span id="door_count_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Window Count"} form={form} id="window_count" disabled type="Number"  /> 
                    <span id="window_count_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Plinth"} form={form} id="plinth" disabled type="text"  />
                    <span id="plinth_Error" style={{color: "red"}} ></span>
                    
                    </Col> 

                    <Col md="2" sm="12">
                    <CustomTextInput label={"Floor Height"} form={form} id="floor_height" disabled type="text"  /> 
                    <span id="floor_height_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row> 
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"100px",width:"80rem",marginTop:"20px"}} >
                 <Row>  
                     <Col md="3" sm="12">
                     <CustomTextInput label={"Height From Adjacent Land"} form={form} id="height_from_adj_land" disabled type="text"  />
                     <span id="height_from_adj_land_Error" style={{color: "red"}} ></span>
                     </Col>

                   {/* Dijo 01 */}
                  <Col md="2" sm="12" className="d-flex flex-column justify-content-start">
                    <Uploader isReadOnly={true} selectedFileName={form.values.wh_photograph_attachment}/>
                    <span id="wh_photograph_attachment_Error" style={{color: "red"}} ></span>
                   
                   {/* <Button.Ripple color="primary"  type="Button" onClick={(e) => openAttach(form.values.wh_photograph_attachment)}>View</Button.Ripple> */} 
                  </Col>

                  <Col md="2" sm="12" className="d-flex flex-column justify-content-start">
                    {/* <Button.Ripple color="primary"  type="Button" onClick={(e) => openAttach(form.values.wh_photograph_attachment1)}>View</Button.Ripple> */}
                    <Uploader isReadOnly={true} selectedFileName={form.values.wh_photograph_attachment1}/>
                  </Col>

                  <Col md="2" sm="12" className="d-flex flex-column justify-content-start">
                    {/* <Button.Ripple color="primary"  type="Button" onClick={(e) => openAttach(form.values.wh_photograph_attachment2)}>View</Button.Ripple>  */}
                    <Uploader isReadOnly={true} selectedFileName={form.values.wh_photograph_attachment2}/>
                  </Col>
                  <Col md="2" sm="12" className="d-flex flex-column justify-content-start">
                    {/* <Button.Ripple color="primary"  type="Button" onClick={(e) => openAttach(form.values.wh_photograph_attachment3)}>View</Button.Ripple>  */}
                    <Uploader isReadOnly={true} selectedFileName={form.values.wh_photograph_attachment3}/>
                  </Col>
                  
                  
                 </Row>   
                 </div> 
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Repair Work Info</h6> 

                <Row className="p-1">
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Remarks"} form={form} id="repair_work_remarks" disabled type="text"  /> 
                    <span id="repair_work_remarks_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row> 
                </div> 
                <div style={{border:"2px solid #7367f0",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Audit Info</h6>
                <Row className="p-1">
                    <Col md="4" sm="12">
                    <CustomTextInput label={"Latest Audit Date"} form={form} id="latest_audit_date" disabled type="data"  /> 
                    <span id="latest_audit_date_Error" style={{color: "red"}} ></span>
                    </Col> 

                    <Col md="4" sm="12">
                    <CustomTextInput  form={form} label={"Audit Type"} id="audit_type" disabled/>
                    <CustomTextInput form={form} id="next_audit_due_date" disabled type="hidden" style={{display:"none",}}  /> 
                    <span id="next_audit_due_date_Error" style={{color: "red"}} ></span>

                    </Col> 

                    <div className="p-2"> <Button.Ripple color="primary"  type="Button" >Audit Info</Button.Ripple></div>
                   
                </Row> 
                </div>  
            {console.log("isViewOnly Value : "+ JSON.stringify(isViewOnly))}    
         {/*isViewOnly=="false" && <div class="d-flex justify-content-center mt-2">
             <div class="p-1 ">
         <Button.Ripple color="primary" isDisabled={sumitdisabled} type="Button" onClick={(e) => onSubmit()} >
          Submit
          </Button.Ripple>
          
          </div>
         </div>*/}


         {isViewOnly=="false" &&  <div class="d-flex justify-content-center mt-2">
             <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="APPROVE" type="Button">Approve</Button.Ripple>
         <CustomTextInput  form={form} id="approve" type="hidden"  /> 
         <CustomTextInput  form={form} id="reject"  type="hidden"  /> 
          </div> 
          <div class="p-1 ">
          <CustomTextInput  form={form} id="RejectReason" placeholder="Remarks" type="text"  /> 
          </div>
          <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="REJECT" type="Button">Reject</Button.Ripple>
          </div> 

         </div>}
</div>
        </Fragment>
    )
} 
const WarehouseCreationqualityTeamData = (isViewOnly)  => { 
    if(!isViewOnly)
    {
      isViewOnly=false;
    }
  const history = useHistory();
  const {showLoader , hideLoader} = useLoader(); 
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  
  const {titleName, setTitleName} =useState("");
  const isToday = (data) => {
    return moment(data).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({

      independent_gate:validation.required({ message:"Independent gate should not be empty", isObject:true }),
      no_of_exits: validation.required({  message:"No Of Exits should not be empty",isObject: false }),
      wall_Type: validation.required({ message:"Wall Type should not be empty", isObject: false }),
      roof_type: validation.required({  message:"Roof Type should not be empty",isObject: false }),
      floor_type: validation.required({  message:"Floor Type should not be empty",isObject: false }),
      shutter_count: validation.required({  message:"Shutter Count should not be empty",isObject: false }),
      door_count: validation.required({ message:"Door Count should not be empty", isObject: false }),
      window_count: validation.required({ message:"Window Count should not be empty", isObject: false }),
      plinth: validation.required({ message:"Plinth should not be empty", isObject: false }), 

      floor_height: validation.required({ message:"Floor Height should not be empty", isObject: false }), 
      height_from_adj_land: validation.required({ message:"height from adj land should not be empty", isObject: false }), 
    //  wh_photograph_attachment: validation.required({ message:"WH Photograph Attachment should not be empty", isObject: true }), 
    //  wh_photograph_attachment1: validation.required({ message:"WH Photograph Attachment1 should not be empty", isObject: true }), 
    //  wh_photograph_attachment2: validation.required({ message:"WH Photograph Attachment2 should not be empty", isObject: true }), 
    //  wh_photograph_attachment3: validation.required({ message:"WH Photograph Attachment3 should not be empty", isObject: true }), 
      inside_road_type: validation.required({ message:"Inside Road Type should not be empty", isObject: false }), 
      inside_heavy_vehicle_mvmt: validation.required({ message:"Inside Heavy Vehicle mvmt should not be empty", isObject: true }), 
      inside_no_of_truck_in_capacity: validation.required({ message:"Inside No Of Truck In Capacity should not be empty", isObject: false }), 
      repair_work_remarks: validation.required({ message:"Repair Work Remarks should not be empty", isObject: false }), 
      latest_audit_date: validation.required({ message:"Latest Audit Date should not be empty", isObject: false }), 
      next_audit_due_date: validation.required({ message:"Next Audit Due Date should not be empty", isObject: false }), 
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

      independent_gate:formData.independent_gate.value,
      no_of_exits:formData.no_of_exits,
      wall_type:formData.wall_Type,
      roof_type:formData.roof_type,
      floor_type:formData.floor_type,
      shutter_count:formData.shutter_count,
      door_count:formData.door_count,
      window_count:formData.window_count,
      plinth:formData.plinth,
      floor_height:formData.floor_height,
      height_from_adj_land:formData.height_from_adj_land,
      // Dijo 04
      // wh_photograph_attachment:formData.wh_photograph_attachment,
      // wh_photograph_attachment1:formData.wh_photograph_attachment1,
      // wh_photograph_attachment2:formData.wh_photograph_attachment2,
      // wh_photograph_attachment3:formData.wh_photograph_attachment3,
      inside_road_type:formData.inside_road_type,
      inside_heavy_vehicle_mvmt:formData.inside_heavy_vehicle_mvmt.value,
      inside_no_of_truck_in_capacity:formData.inside_no_of_truck_in_capacity,
      repair_work_remarks:formData.repair_work_remarks,
      latest_audit_date:formData.latest_audit_date,
      next_audit_due_date:formData.next_audit_due_date,
      audit_type:formData.audit_type,

    };
    console.log(" Warehouse Creation Quality Item :: "+JSON.stringify(FrmData));
    const postdata = {
      id:formData.wh_refid,
      screentype:"WHQCMGR",
      Data:FrmData
    }
    console.log("  Warehouse Creation Quality Item  :: "+JSON.stringify(postdata));
    showLoader();
    console.log("  Warehouse Creation Quality Item  :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "warehouse/master/SaveWarehouseUpdate", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
 
          history.push("/warehouse/wclqcmgr");
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
         <CardComponent header={"Warehouse Creation - QC Manager "}>
         <WarehouseCreationqualityTeam  form={form} onSubmit={onSubmit} isViewOnly="false" titleName={setTitleName} />
        </CardComponent>
        </Fragment>
    )
} 

export default WarehouseCreationqualityTeamData
