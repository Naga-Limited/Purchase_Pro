import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'

import { Paperclip } from "react-feather";
import { apiBaseUrl, previewUrl, vaUrl } from '../../urlConstants'
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

const WarehouseApproval = ({form,onSubmit,isViewOnly,isViewAll})  => {
  
    const history = useHistory();
    let { id } = useParams();
    let refid='';
    let fdata='';
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
    console.log("Request Url :: "+apiBaseUrl + "Warehouse/Master/getMaster_new_warehouseDetailsById", fdata);
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
           bankaccounttype:data.results[0].bankaccounttype,
           wb_count:data.results[0].wb_count,
           wb_1_name:data.results[0].wb_1_name,
           wb_2_name:data.results[0].wb_2_name,
           wb1_capacity_in_mts:data.results[0].wb1_capacity_in_mts,
           wb2_capacity_in_mts:data.results[0].wb2_capacity_in_mts,
           wb1_stamping_certificate_attachment:data.results[0].wb1_stamping_certificate_attachment,
           wb2_stamping_certificate_attachment:data.results[0].wb2_stamping_certificate_attachment,
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
      history.push(`/master/warehouseApprovalEntry`);
    };
    const handleViewHistory = (data) => {
 
    } 
 
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
  else if(e.target.value && e.target.value=="REJECTQC")
  {
    //Reject and request will redirect to QC team for Edit
    form.setValues({...form.values, reject:"-2",approve:"0" });
    reject=-2;
    approve=0;
  }
  else 
  {
    form.setValues({...form.values, reject:"-1",approve:"0" });
    reject=-1;
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
    formtype:"BHAPPROVAL",
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

          history.push("/warehouse/wclbh");
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

const openAttach1 = (url) => {
  //   window.open(previewUrl + url, "_blank");
 //To NAS Server
 window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
     
   };

   const openAttach = (selectedFileName) => {
    
    window.open(previewUrl +"" + selectedFileName, "_blank");
    //window.open(previewUrl +"pdfview.php?fn="+ selectedFileName, "_blank");
  };
    return (
        <Fragment style={{minWidth:"1000px"}}>  
            <h4 text-dark style={{width:"190px",textAlign:"center",borderBottom:"2px solid black"}}>Basic Information</h4>
            <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px"}}> 
            <h6 className='text-primary' text-primary>Warehouse Info</h6>  
            <Row style={{padding:"10px"}}>  
               
                <Col md="3" sm="12">
                <CustomTextInput label={"Name :"} form={form} id="wh_name" disabled type="text"  />
                <span id="WH_Name_Error" style={{color: "red"}} ></span>
                  </Col>
                 </Row>   
                 </div> 

            <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                 <h6 className='text-primary' text-primary>Address :</h6>
                <Row style={{padding:"15px"}}>
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Door No & Area"} form={form} disabled id="whaddress" type="text"  />
                    <span id="no_of_exits_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Street"} form={form} id="street" disabled type="text"  /> 
                    <span id="Street_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Location"} form={form} id="whcity" disabled type="text"  />
                    </Col>
                    <Col md="2" sm="12"> 
                    
                    <CustomTextInput label={"District"} form={form} id="district" disabled type="text"  /> 
           </Col> 
           <Col md="2" sm="12"> 
                    
                    <CustomTextInput label={"State"} form={form} id="state" disabled type="text"  /> 
                      </Col>
                </Row> 
                <Row style={{paddingLeft:"10px"}}>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Pincode"} form={form} id="whpincode" disabled type="text"  /> 
                    <span id="whpincode_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Warehouse Latitude"} form={form} id="whlat" disabled type="text"  /> 
                    <span id="whlat_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Longitude"} form={form} id="whlong" disabled type="text"  />  
                    <span id="whlong_Error" style={{color: "red"}} ></span>

                    </Col> 
                    <Col md="2" sm="12"> 
                         <CustomTextInput label={"Godown Type"} form={form} id="godown_type" disabled type="text"  /> 
                      </Col>
                </Row>
            </div>   
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Owner Info</h6>
                <Row className="p-1">
                    <Col md="4" sm="12">
                    <CustomTextInput label={"Owner Type"} form={form} id="ownertype" disabled type="text"  /> 
                    <span id="ownertype_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="4" sm="12">
                    <CustomTextInput label={"Owner Name"} form={form} id="ownername" disabled type="text"  /> 
                    <span id="ownername_Error" style={{color: "red"}} ></span>
                    </Col>  
                </Row> 
                </div> 
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Owner Address :</h6>
                <Row className="p-1">
                <Col md="2" sm="12"> 
                    <CustomTextInput label={"Door No & Area"} form={form} id="owneraddress" disabled type="text"  /> 
                    <span id="owneraddress_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Street"} form={form} id="ownerstreet" disabled type="text"  /> 
                    <span id="ownerstreet_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"City"} form={form} id="ownercity" disabled type="text"  />
                    <span id="ownercity_Error" style={{color: "red"}} ></span>
                    </Col>
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Owner District"} form={form} id="ownerdistrict" disabled type="text"  /> 
           </Col> 
           <Col md="2" sm="12"> 
                    
                    <CustomTextInput label={"State"} form={form} id="ownerstate" disabled type="text"  /> 
                      </Col>
                   
                </Row>  
                <Row style={{paddingLeft:"10px"}}>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Pincode"} form={form} id="ownerpincode" disabled type="text"  /> 
                    <span id="ownerpincode_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Landline Number"} form={form} id="ownerlandlineno" disabled type="text"  /> 
                    <span id="ownerlandlineno_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Moblie Number"} form={form} id="ownermobileno" disabled type="text"  /> 
                    <span id="ownermobileno_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Fax Number"} form={form} id="ownerfaxnumber" disabled type="text"  /> 
                    <span id="ownerfaxnumber_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Mail id "} form={form} id="ownermailid" disabled type="text"  /> 
                    <span id="ownermailid_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row>  
                
                </div>   
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Capacity info :</h6>
                <Row className="p-1">
                <Col md="3" sm="12"> 
                    <CustomTextInput label={"Total Capacity in MTS"} form={form} id="totalcapacityinmts" disabled type="text"  /> 
                    <span id="totalcapacityinmts_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Total Capacity in Sqft"} form={form} id="totalcapacityinsqft" disabled type="text"  /> 
                    <span id="totalcapacityinsqft_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Pillar Info"} form={form} id="pillarinfo" disabled type="text"  />  
                    <span id="pillarinfo_Error" style={{color: "red"}} ></span>
                    
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Outside Area Capacity in Sqft"} form={form} id="outsideareacapacityinsqft" disabled type="text"  /> 
                    <span id="outsideareacapacityinsqft_Error" style={{color: "red"}} ></span>
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Outside Area Capacity in MTS"} form={form} id="outsideareacapacitymts" disabled type="text"  /> 
                    <span id="outsideareacapacitymts_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row>  
               
                
                </div>   
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Rent & Contract Info:</h6>
                <Row className="p-1">
                <Col md="3" sm="12"> 
                    <CustomTextInput label={"Contract Start Date"} form={form} id="contractstartdate" disabled type="text"  /> 
                    <span id="contractstartdate_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Contract End Date"} form={form} id="contractenddate" disabled type="text"  />
                    <span id="contractenddate_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Advance Value after TDS"} form={form} id="advancevalueaftertds" disabled type="text"  /> 
                    <span id="advancevalueaftertds_Error" style={{color: "red"}} ></span>
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Rent Per Sqft"} form={form} id="rentpersqft" disabled type="text"  />
                    <span id="rentpersqft_Error" style={{color: "red"}} ></span>
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Rent Per Month"} form={form} id="rentpermonth" disabled type="text"  /> 
                    <span id="rentpermonth_Error" style={{color: "red"}} ></span>
                    </Col>
                </Row>  
                <Row className="p-1">
                <Col md="3" sm="12"> 
                    <CustomTextInput label={"Rent Due Date"} form={form} id="rentduedate" disabled type="text"  /> 
                    <span id="rentduedate_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Locking Period in Months"} form={form} id="lockingperiodinmonths" disabled type="text"  /> 
                    <span id="lockingperiodinmonths_Error" style={{color: "red"}} ></span>
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Notice Period in Months"} form={form} id="noticeperiodinmonths" disabled type="text"  />  
                    <span id="noticeperiodinmonths_Error" style={{color: "red"}} ></span>
                    
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Contract Type"} form={form} id="contracttype" disabled type="text"  /> 
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Service Charge (if PWH)"} form={form} id="servicechargespwh" disabled type="text"  />  
                    <span id="servicechargespwh_Error" style={{color: "red"}} ></span> 
                    
                    </Col>
                </Row>  
                </div>   

                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Bank Info :</h6>
                <Row className="p-1">
                <Col md="2" sm="12"> 
                    <CustomTextInput label={"Bank Name"} form={form} id="bankname" disabled type="text"  />  
                    <span id="bankname_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Branch"} form={form} id="bankbranch" disabled type="text"  /> 
                    <span id="bankbranch_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"City"} form={form} id="bankcity" disabled type="text"  /> 
                    <span id="bankcity_Error" style={{color: "red"}} ></span>
                    </Col>
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"District"} form={form} id="bankdistrict" disabled type="text"  /> 
           </Col> 
           <Col md="2" sm="12"> 
                    <CustomTextInput label={"State"} form={form} id="bankstate" disabled type="text"  /> 
                    </Col>
                   
                </Row>  
                <Row style={{paddingLeft:"10px"}}>
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Pincode"} form={form} id="bankpincode" disabled type="text"  /> 
                    <span id="bankpincode_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"Account Number"} form={form} id="bankaccountno" disabled type="text"  /> 
                    <span id="bankaccountno_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12">
                    <CustomTextInput label={"IFSC Code"} form={form} id="bankifsc" disabled type="text"  /> 
                    <span id="bankifsc_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Account Type"} form={form} id="bankaccounttype" disabled type="text"  /> 
                    </Col> 
                </Row>  
                
                </div>     


                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Weigh Bridge Info :</h6>
                <Row className="p-1">
                <Col md="3" sm="12"> 
                
                <CustomTextInput label={"Count of weigh Bridge"} form={form} id="wb_count" disabled type="text"  /> 
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Weigh Bridge 1"} form={form} id="wb_1_name" disabled type="text"  /> 
                    <span id="wb_1_name_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Capacity In MTS"} form={form} id="wb1_capacity_in_mts" disabled type="text"  /> 
                    <span id="wb1_capacity_in_mts_Error" style={{color: "red"}} ></span> 
                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Stamping1 Start Date"} form={form} id="wb1_stamping_start_date" disabled type="text"  /> 
                    <span id="wb1_stamping_start_date_Error" style={{color: "red"}} ></span> 
           </Col> 
           <Col md="3" sm="12"> 
           <CustomTextInput label={"Stamping1 Expiry Date"} form={form} id="wb1_stamping_expiry_date" disabled type="text"  /> 
           <span id="wb1_stamping_expiry_date_Error" style={{color: "red"}} ></span> 
                      </Col> 
                      <Col md="3" sm="12">  
                      <p>Stamping Certificate 1</p>
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.wb1_stamping_certificate_attachment)}>
                          <Paperclip size={14} />&nbsp;
                          <span className="align-middle ml-20">View</span>
                         </Button.Ripple> 
                      </Col>
                   
                </Row>  
                <Row style={{paddingLeft:"15px"}}>
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Weight Bridge 2"} form={form} id="wb_2_name" disabled type="text"  />  
                    <span id="wb_2_name_Error" style={{color: "red"}} ></span> 
                    
                    </Col> 
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Capacity In MTS"} form={form} id="wb2_capacity_in_mts" disabled type="text"  /> 
                    <span id="wb2_capacity_in_mts_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Stamping2 Start Date"} form={form} id="wb2_stamping_start_date" disabled type="text"  />  
                    <span id="wb2_stamping_start_date_Error" style={{color: "red"}} ></span> 
                    </Col>  
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Stamping2 Expiry Date"} form={form} id="wb2_stamping_expiry_date" disabled type="text"  />  
                    <span id="wb2_stamping_expiry_date_Error" style={{color: "red"}} ></span>  
                    </Col>


                   
                    <Col md="3" sm="12">  
                      <p>Stamping Certificate 2</p>
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.wb1_stamping_certificate_attachment)}>
                          <Paperclip size={14} />&nbsp;
                          <span className="align-middle ml-20">View</span>
                         </Button.Ripple> 
                      </Col>
                   



                    {/* </Col> 
                    <Col md="3" sm="12">
                    <p>Stamping Certificate 2</p>
                      <Button.Ripple color="primary" onClick={(e) => openAttach(form.values.wb2_stamping_certificate_attachment)} type="Button" >View</Button.Ripple> 
                    </Col> */}
                </Row>  
                </div>      
                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Electricity Info :</h6>
                <Row className="p-1">
                <Col md="3" sm="12"> 
                <CustomTextInput label={"Separate Electric Meters"} form={form} id="separate_electric_meters" disabled type="text"  /> 
                <span id="separate_electric_meters_Error" style={{color: "red"}} ></span>  

                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Light Points Inside"} form={form} id="electric_plug_points_inside" disabled type="text"  /> 
                    <span id="electric_plug_points_inside_Error" style={{color: "red"}} ></span> 
                    </Col> 
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Light Points Outside"} form={form} id="electric_plug_points_outside" disabled type="text"  /> 
                    <span id="electric_plug_points_outside_Error" style={{color: "red"}} ></span> 
                    </Col>
                    <Col md="2" sm="12"> 
                    <CustomTextInput label={"Plug Points inside"} form={form} id="electric_light_points_inside" disabled type="text"  /> 
                    <span id="electric_light_points_inside_Error" style={{color: "red"}} ></span> 
                     </Col>  
                      <Col md="2" sm="12"> 
                    <CustomTextInput label={"Plug Points outstide"} form={form} id="electric_light_points_outside" disabled type="text"  /> 
                    <span id="electric_light_points_outside_Error" style={{color: "red"}} ></span> 
                     </Col> 
          
                </Row>  
               </div> 

               <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>General :</h6>
                <Row className="p-1">
                <Col md="3" sm="12"> 
                  <CustomTextInput label={"Drinking water Facility"} form={form} id="drinking_water_facility" disabled type="text"  /> 
                </Col>  
                    <Col md="3" sm="12"> 
                
                <CustomTextInput label={"Borewell Facility"} form={form} id="borewell_facility" disabled type="text"  /> 
                    </Col> 
                    <Col md="3" sm="12"> 
                    
                    <CustomTextInput label={"Water Connection"} form={form} id="water_connection" disabled type="text"  /> 
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"No of fire Extinguish"} form={form} id="no_of_fire_extinguisher" disabled type="text"  /> 
                    <span id="no_of_fire_extinguisher_Error" style={{color: "red"}} ></span> 

                    </Col>
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Toliet Facility"} form={form} id="toilet_facility" disabled type="text"  /> 
                      </Col>  
                      <Col md="3" sm="12">
                      <CustomTextInput label={"Year of Construction"} form={form} id="year_of_construction" disabled type="text"  />  
                      <span id="year_of_construction_Error" style={{color: "red"}} ></span> 
                      
                      </Col>
                </Row>  
               </div>
                
               {!isViewOnly && <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
            <h6 className='text-primary' text-primary>Inside Road Condition:</h6>  
            <Row style={{padding:"10px"}}>  
               
                <Col md="4" sm="12"> 
                <CustomTextInput label={"Road Type"} form={form} id="inside_road_type" disabled type="text"  />   
                <span id="inside_road_type_Error" style={{color: "red"}} ></span>   
                 </Col>
        
                <Col md="4" sm="12"> 
                
                <CustomTextInput label={"Heavy Vehicle Movement"} form={form} id="inside_heavy_vehicle_mvmt" disabled type="text"  /> 
                 </Col> 
                 <Col md="4" sm="12">
                 <CustomTextInput label={"No. Of Truck In Capacity"} form={form} id="inside_no_of_truck_in_capacity" disabled type="text"  />  
                 <span id="inside_no_of_truck_in_capacity_Error" style={{color: "red"}} ></span> 
                 </Col>
                </Row>
                 </div>  }
               <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Security Info :</h6>
                <Row className="p-1">
                <Col md="4" sm="12"> 
                <CustomTextInput label={"Warehouse Security"} form={form} id="warehouse_security" disabled type="text"  /> 

                    </Col>  
                    <Col md="4" sm="12"> 
                
                    <CustomTextInput label={"Naga Security"} form={form} id="naga_security" disabled type="text"  /> 
      
                    </Col> 
                    <Col md="4" sm="12"> 
                    
                    <CustomTextInput label={"Boundary Wall"} form={form} id="boundary_wall" disabled type="text"  /> 

                    </Col> 
            
                   
                </Row>  
               </div>
                 


               <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Distance From (in KMs) :</h6>
                <Row className="p-1">
                <Col md="3" sm="12"> 
                <CustomTextInput label={"Railway Goods Shed"} form={form} id="distance_railway_goods_shed" disabled type="text"  /> 
                <span id="distance_railway_goods_shed_Error" style={{color: "red"}} ></span> 
      
                    </Col>  
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Nearest National Highways"} form={form} id="distance_national_highways" disabled type="text"  /> 
                    <span id="distance_national_highways_Error" style={{color: "red"}} ></span> 
      
                    </Col> 
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Nearest state Highways"} form={form} id="distance_state_highways" disabled type="text"  />  
                    <span id="distance_state_highways_Error" style={{color: "red"}} ></span> 
                    
                    </Col>    
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"Mandi"} form={form} id="distance_mandi" disabled type="text"  /> 
                    <span id="distance_mandi_Error" style={{color: "red"}} ></span> 
                    </Col>  
                    <Col md="3" sm="12"> 
                    <CustomTextInput label={"FCI Procurement point"} form={form} id="distance_fci_procurement_point" disabled type="text"  />  
                    <span id="distance_fci_procurement_point_Error" style={{color: "red"}} ></span> 
                    
                    </Col>  
                   
                </Row>   
                <Row style={{paddingLeft:"10px"}}>
                        <Col md="3" sm="12">
                        <CustomTextInput label={"Pucca"} form={form} id="distance_pucca" disabled type="text"  /> 
                        <span id="distance_pucca_Error" style={{color: "red"}} ></span> 
                        </Col>
                    </Row>
               </div> 

               <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>Statutory Info:</h6>
                <Row >
                <Col md="4" sm="12"> 
                <CustomTextInput label={"Municipal Survey / Property Title No"} form={form} id="statutory_survey_type" disabled type="text"  />   
                <span id="statutory_survey_type_Error" style={{color: "red"}} ></span> 
                  
                
                    </Col>   

 
                    <Col md="2" sm="12" className="mt-2">  
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.wb1_stamping_certificate_attachment)}>
                          <Paperclip size={14} />&nbsp;
                          <span className="align-middle ml-20">View</span>
                         </Button.Ripple> 
                      </Col>

                    {/* <Col md="2" sm="12" className="mt-2">
                    <Button.Ripple color="primary"  type="Button" onClick={(e) => openAttach(form.values.statutory_type_attachment)} >View</Button.Ripple> 
                    </Col> */}

                    
                </Row>
                </div> 

                <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
                <h6 className='text-primary' text-primary>License Info (Optional):</h6>
                <Row style={{display:"flex",justifyContent:"space-between"}}>
                <Col md="3" sm="12">  
                <CustomTextInput label={"License 1"} form={form} id="license_no_1" disabled type="text"  />    
                <span id="license_no_1_Error" style={{color: "red"}} ></span> 

                    </Col>  
                    <Col md="3" sm="12"> 
                <CustomTextInput label={"License 2"} form={form} id="license_no_2" disabled type="text"  />   
                <span id="license_no_2_Error" style={{color: "red"}} ></span> 
                
                    </Col>      
                    <Col md="3" sm="12"> 
                <CustomTextInput label={"License 3"} form={form} id="license_no_3" disabled type="text"  />   
                <span id="license_no_3_Error" style={{color: "red"}} ></span>
                    </Col>      

                    {/* Dijo commmented on 30-04-2022 */}
                    {/* <Col md="2" sm="12" className="mt-2">
                    <Button.Ripple color="primary"  type="Button">View</Button.Ripple>   
                    </Col> */}

                </Row> 
                <Row  >

                <Col md="4" sm="12">  
                <Label>License Copy 1</Label>
                <div>
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.license_copy_attachment1)}>
                          <Paperclip size={14} />&nbsp;
                          <span className="align-middle ml-20">View</span>
                          <span id="license_copy_attachment1_Error" style={{color: "red"}} ></span>
                         </Button.Ripple> 
                         </div>
                      </Col>

                      <Col md="4" sm="12">  
                      <Label>License Copy 2</Label>
                      <div>
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.license_copy_attachment2)}>
                          <Paperclip size={14} />&nbsp;
                          <span className="align-middle ml-20">View</span>
                          <span id="license_copy_attachment2_Error" style={{color: "red"}} ></span>
                         </Button.Ripple> 
                         </div>
                      </Col>


                      <Col md="4" sm="12">  
                      <Label>License Copy 3</Label>
                      <div>
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.license_copy_attachment3)}>
                          <Paperclip size={14}/>&nbsp;
                          <span className="align-middle ml-20">View</span>
                          <span id="license_copy_attachment3_Error" style={{color: "red"}} ></span>
                         </Button.Ripple> 
                         </div>
                      </Col>

                {/* <Col md="4" sm="12"> 
                   <Label>License Copy 1</Label> 
                   <div>   <Button.Ripple color="primary"  type="Button" id="license_copy_attachment1" onClick={(e) => openAttach(form.values.license_copy_attachment1)}>View</Button.Ripple> </div>   
                   <span id="license_copy_attachment1_Error" style={{color: "red"}} ></span>
                
                    </Col>   */}

{/* 
                    <Col md="4" sm="12"> 
                    <Label>License Copy 2</Label>  
                    <div>    <Button.Ripple color="primary"  type="Button"  id="license_copy_attachment2" onClick={(e) => openAttach(form.values.license_copy_attachment2)}>View</Button.Ripple> </div> 
                    <span id="license_copy_attachment2_Error" style={{color: "red"}} ></span>
               
                    </Col>      
                    <Col md="4" sm="12"> 
                    <Label>License Copy 3</Label>  
                    <div> <Button.Ripple color="primary"  type="Button"  id="license_copy_attachment3" onClick={(e) => openAttach(form.values.license_copy_attachment3)}>View</Button.Ripple> </div> 
                    <span id="license_copy_attachment3_Error" style={{color: "red"}} ></span>
                  
                    </Col>       */}
                  
                </Row>
                </div> 

                

            {!isViewOnly && <h4 text-dark style={{width:"190px",textAlign:"center",borderBottom:"2px solid black",marginTop:"27px"}}>Quality Information</h4>}
            {!isViewOnly && <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"10px"}}> 
            <h6 className='text-primary' text-primary>Godown Condition Info</h6>  
            <Row style={{padding:"10px"}}>  
               
                <Col md="3" sm="12">
                
                <CustomTextInput label={"Independent Gate"} form={form} id="independent_gate" disabled type="text"  /> 
                  </Col> 
                  <Col md="3" sm="12"> 
                <CustomTextInput label={"No of Exits"} form={form} id="no_of_exits" disabled type="text"  />  
                <span id="no_of_exits_Error" style={{color: "red"}} ></span>
                   
                    </Col> 
                    <Col md="3" sm="12"> 
                <CustomTextInput label={"Wall Type"} form={form} id="wall_type" disabled type="text"  /> 
                <span id="wall_type_Error" style={{color: "red"}} ></span>  
                
                    </Col> 
                    <Col md="3" sm="12"> 
                <CustomTextInput label={"Roof Type"} form={form} id="roof_type" disabled type="text"  />  
                <span id="roof_type_Error" style={{color: "red"}} ></span>  
                    </Col> 
                    <Col md="3" sm="12"> 
                <CustomTextInput label={"Floor Type"} form={form} id="floor_height" disabled type="text"  /> 
                <span id="floor_height_Error" style={{color: "red"}} ></span>    
                    </Col>
                 </Row>    
                 <Row style={{padding:"10px"}}>  
               
               <Col md="3" sm="12">
               <CustomTextInput label={"Shutter Count"} form={form} id="shutter_count" disabled type="text"  />   
               <span id="shutter_count_Error" style={{color: "red"}} ></span>    
                 </Col> 
                 <Col md="3" sm="12"> 
               <CustomTextInput label={"Door Count"} form={form} id="door_count" disabled type="text"  />   
               <span id="door_count_Error" style={{color: "red"}} ></span>    
                   </Col> 
                   <Col md="3" sm="12"> 
               <CustomTextInput label={"Window Count"} form={form} id="window_count" disabled type="text"  />  
               <span id="window_count_Error" style={{color: "red"}} ></span>    
                   </Col> 
                   <Col md="3" sm="12"> 
               <CustomTextInput label={"Plinth"} form={form} id="plinth" disabled type="text"  />   
               <span id="plinth_Error" style={{color: "red"}} ></span>  
                   </Col> 
                   <Col md="3" sm="12"> 
               <CustomTextInput label={"Floor Height"} form={form} id="floor_height" disabled type="text"  />   
               <span id="floor_height_Error" style={{color: "red"}} ></span>  
                   </Col>
                </Row >   
                <Row style={{paddingLeft:"10px"}}>
                    <Col md="3" sm="12">
                    <CustomTextInput label={"Height From Adjacent Land"} form={form} id="height_from_adj_land" disabled type="text"  />   
                    <span id="height_from_adj_land_Error" style={{color: "red"}} ></span>  
                    </Col>

                    <Col md="3" sm="12">  
                      <Button.Ripple
                      outline
                       color="primary" 
                       onClick={(e) => openAttach(form.values.wh_photograph_attachment)}>
                          <Paperclip size={14} />&nbsp;
                          <span>View</span>
                          <span id="wh_photograph_attachment_Error" style={{color: "red"}} ></span>  
                         </Button.Ripple> 
  
                      </Col>
  
                    
                    {/* <Col md="3" sm="12">
                    <Button.Ripple color="primary"  type="Button" onClick={(e) => openAttach(form.values.wh_photograph_attachment)}>View</Button.Ripple> 
                    <span id="wh_photograph_attachment_Error" style={{color: "red"}} ></span>   
                    </Col> */}

                </Row>
                 </div> }  




                 {!isViewOnly && <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
            <h6 className='text-primary' text-primary>Repair Work Info:</h6>  
            <Row style={{padding:"10px"}}>  
               
                <Col md="4" sm="12"> 
                <CustomTextInput label={"Road Type"} form={form} id="repair_work_remarks" disabled type="text"  />   
                <span id="repair_work_remarks_Error" style={{color: "red"}} ></span> 
                 </Col>
                </Row>
                 </div>  }
                 
                 {!isViewOnly &&  <div style={{border:"2px solid #7367f0 ",padding:"20px",borderRadius:"6px",marginTop:"20px"}}> 
            <h6 className='text-primary' text-primary>Audit Info:</h6>  
            <Row style={{padding:"10px"}}>  
               
                <Col md="4" sm="12"> 
                <CustomTextInput label={"Latest Audit Date"} form={form} id="latest_audit_date" disabled type="data"  />   
                <span id="latest_audit_date_Error" style={{color: "red"}} ></span> 
                 </Col> 
                 <Col md="4" sm="12"> 
                 <CustomTextInput  form={form} label={"Audit Type"} id="audit_type" disabled/>
                <CustomTextInput form={form} id="next_audit_due_date" disabled type="hidden"  style={{display:"none",}}  />   
                <span id="next_audit_due_date_Error" style={{color: "red"}} ></span> 
                 </Col> 
                 <Col md="2" sm="12" className="mt-2"> 
                 <Button.Ripple color="primary"  type="Button" >Audit Info</Button.Ripple> 
                 </Col>
                </Row>
                 </div>  }
                
                
                 {!isViewOnly && !isViewAll &&  <div class="d-flex justify-content-center mt-2">
             <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="APPROVE" type="Button">Approve</Button.Ripple>
         <CustomTextInput  form={form} id="approve" type="hidden"  /> 
         <CustomTextInput  form={form} id="reject"  type="hidden"  /> 
          </div> 
          <div class="p-1 ">
          <CustomTextInput  form={form} id="RejectReason" placeholder="Remarks"  type="text"  /> 
          </div>
          <div class="p-1 ">
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="REJECTWM" type="Button">Reject to Wheat Movement Team</Button.Ripple>
         &nbsp;&nbsp;&nbsp;
         <Button.Ripple color="primary" onClick={(e) => onApproveReject(e)} value="REJECTQC" type="Button">Reject to QC Team</Button.Ripple>
          </div> 

         </div>}

        </Fragment>
    )
} 
const WarehouseApprovalData = ({isViewOnly,isViewAll})  => { 
  console.log("isViewAll:"+JSON.stringify(isViewAll));
  console.log("isViewOnly:"+JSON.stringify(isViewOnly));
    
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
      Data:formData,
      approve:formData.approve,
      reject:formData.reject,
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

            history.push("/warehouse/wclbh");
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
         <CardComponent  header="Warehouse Approval Screen">
         <WarehouseApproval  form={form}  onSubmit={onSubmit} isViewAll={isViewAll} isViewOnly={isViewOnly} />
        </CardComponent>
        </Fragment>
    )
} 

export default WarehouseApprovalData
