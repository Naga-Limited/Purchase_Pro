<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\WarehouseEntryModel;
use App\Controllers\Api\Upload;

class WarehouseEntry extends BaseApiController
{
  public function index()
  {
    echo "Warehouse Entry";
  }
  public function checkLotExist(){
    $postJson = $this->request->getJSON();
    $model = new WarehouseEntryModel();
    $Count = $model->checkLotExist($postJson->LotNumber);
    return  $this->respond(["success" => 1,"Result"=>$Count]);
  }
  public function getwarehousedata(){
/*
    $postData = $this->request->getJSON();
    if(!isset($postData->id))
    {
      $postData->id=1;
    }*/
    $model = new WarehouseEntryModel();
    $res = $model->getwarehousedata(2);
    // $res = $model->getwarehousedata($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function update_new_warehouse_entry(){
    $postjson = $this->request->getJSON();
//var_dump($postData);exit();
   $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    $postdata=$postjson->Data;
    $Id=$postjson->id;

    $screentype=@$postjson->screentype;
    if(isset($screentype) and $screentype=="WMENTRY")
    {
      $postdata->approval_status="1";
      unset($postdata->id);
    }
    if(isset($postdata)){
      $InsertSeq=1;
    
     
     $ngw_warehouse=array(
      'wh_code'=>$postdata->wh_code,
      'warehousename'=>$postdata->warehousename,
      'whaddress'=>$postdata->whaddress,
      'whcity'=>$postdata->whcity,
      'street'=>$postdata->street,
      'whpincode'=>$postdata->whpincode,
      'district'=>$postdata->district,
      'state'=>$postdata->state,
      'whlat'=>$postdata->whlat,
      'whlong'=>$postdata->whlong,
      'ownertype'=>$postdata->ownertype,
      'ownername'=>$postdata->ownername,
      'owneraddress'=>$postdata->owneraddress,
      'ownerstreet'=>$postdata->ownerstreet,
      'ownerpincode'=>$postdata->ownerpincode,
      'ownercity'=>$postdata->ownercity,
      'ownerdistrict'=>$postdata->ownerdistrict,
      'ownerstate'=>$postdata->ownerstate,
      'ownerfaxnumber'=>$postdata->ownerfaxnumber,
      'ownerlandlineno'=>$postdata->ownerlandlineno,
      'ownermobileno'=>$postdata->ownermobileno,
      'ownermailid'=>$postdata->ownermailid,
      'totalcapacityinmts'=>$postdata->totalcapacityinmts,
      'totalcapacityinsqft'=>$postdata->totalcapacityinsqft,
      'pillarinfo'=>$postdata->pillarinfo,
      'outsideareacapacitymts'=>$postdata->outsideareacapacitymts,
      'outsideareacapacityinsqft'=>$postdata->outsideareacapacityinsqft,
      'contractstartdate'=>$postdata->contractstartdate,
      'contractenddate'=>$postdata->contractenddate,
      'advancevalueaftertds'=>$postdata->advancevalueaftertds,
      'rentpersqft'=>$postdata->rentpersqft,
      'rentpermonth'=>$postdata->rentpermonth,
      'rentduedate'=>$postdata->rentduedate,
      'lockingperiodinmonths'=>$postdata->lockingperiodinmonths,
      'noticeperiodinmonths'=>$postdata->noticeperiodinmonths,
      'contracttype'=>$postdata->contracttype,
      'servicechargespwh'=>$postdata->servicechargespwh,
      'bankname'=>$postdata->bankname,
      'bankbranch'=>$postdata->bankbranch,
      'bankcity'=>$postdata->bankcity,
      'bankdistrict'=>$postdata->bankdistrict,
      'bankstate'=>$postdata->bankstate,
      'bankpincode'=>$postdata->bankpincode,
      'bankaccountno'=>$postdata->bankaccountno,
      'bankifsc'=>$postdata->bankifsc,
      'insby'=>$SessionUser,
      'insdt'=>$CurrentDateTime,
      'modby'=>$SessionUser,
      'moddt'=>$CurrentDateTime,
      'RecStatus'=>$postdata->RecStatus,
      'wb_count'=>$postdata->wb_count,
      'wb_1_name'=>$postdata->wb_1_name,
      'wb_2_name'=>$postdata->wb_2_name,
      'wb1_capacity_in_mts'=>$postdata->wb1_capacity_in_mts,
      'wb2_capacity_in_mts'=>$postdata->wb2_capacity_in_mts,
      'wb1_stamping_start_date'=>$postdata->wb1_stamping_start_date,
      'wb2_stamping_start_date'=>$postdata->wb2_stamping_start_date,
      'wb1_stamping_expiry_date'=>$postdata->wb1_stamping_expiry_date,
      'wb2_stamping_expiry_date'=>$postdata->wb2_stamping_expiry_date,
      'wb1_stamping_certificate_attachment'=>$postdata->wb1_stamping_certificate_attachment,
      'wb2_stamping_certificate_attachment'=>$postdata->wb2_stamping_certificate_attachment,
      'separate_electric_meters'=>$postdata->separate_electric_meters,
      'electric_plug_points_inside'=>$postdata->electric_plug_points_inside,
      'electric_plug_points_outside'=>$postdata->electric_plug_points_outside,
      'electric_light_points_inside'=>$postdata->electric_light_points_inside,
      'electric_light_points_outside'=>$postdata->electric_light_points_outside,
      'drinking_water_facility'=>$postdata->drinking_water_facility,
      'no_of_fire_extinguisher'=>$postdata->no_of_fire_extinguisher,
      'borewell_facility'=>$postdata->borewell_facility,
      'toilet_facility'=>$postdata->toilet_facility,
      'water_connection'=>$postdata->water_connection,
      'year_of_construction'=>$postdata->year_of_construction,
      'warehouse_security'=>$postdata->warehouse_security,
      'naga_security'=>$postdata->naga_security,
      'boundary_wall'=>$postdata->boundary_wall,
      'distance_railway_goods_shed'=>$postdata->distance_railway_goods_shed,
      'distance_mandi'=>$postdata->distance_mandi,
      'distance_national_highways'=>$postdata->distance_national_highways,
      'distance_fci_procurement_point'=>$postdata->distance_fci_procurement_point,
      'distance_state_highways'=>$postdata->distance_state_highways,
      'distance_pucca'=>$postdata->distance_pucca,
      'statutory_survey_type'=>$postdata->statutory_survey_type,
      'statutory_type_attachment'=>$postdata->statutory_type_attachment,
      'license_no_1'=>$postdata->license_no_1,
      'license_copy_attachment1'=>$postdata->license_copy_attachment1,
      'license_no_2'=>$postdata->license_no_2,
      'license_copy_attachment2'=>$postdata->license_copy_attachment2,
      'license_no_3'=>$postdata->license_no_3,
      'license_copy_attachment3'=>$postdata->license_copy_attachment3,

      /* add code for CM fees and Security Salary */
      'CM_fees'=> $postdata->cm_fees,
      'Security_salary'=> $postdata->security_salary,

      'approval_status'=> "1",
      /*'independent_gate'=>$postdata->independent_gate,
      'wall_type'=>$postdata->wall_type,
      'shutter_count'=>$postdata->shutter_count,
      'plinth'=>$postdata->plinth,
      'no_of_exits'=>$postdata->no_of_exits,
      'roof_type'=>$postdata->roof_type,
      'door_count'=>$postdata->door_count,
      'floor_height'=>$postdata->floor_height,
      'wh_photograph_attachment'=>$postdata->wh_photograph_attachment,
      'floor_type'=>$postdata->floor_type,
      'window_count'=>$postdata->window_count,
      'height_from_adj_land'=>$postdata->height_from_adj_land,
      'inside_road_type'=>$postdata->inside_road_type,
      'inside_heavy_vehicle_mvmt'=>$postdata->inside_heavy_vehicle_mvmt,
      'inside_no_of_truck_in_capacity'=>$postdata->inside_no_of_truck_in_capacity,
      'repair_work_remarks'=>$postdata->repair_work_remarks,
      'latest_audit_date'=>$postdata->latest_audit_date,
      'next_audit_due_date'=>$postdata->next_audit_due_date,
      'name_of_collateral'=>$postdata->name_of_collateral,
      'name_of_bank'=>$postdata->name_of_bank,
      'naga_pwh_insurance_no'=>$postdata->naga_pwh_insurance_no,
      'naga_pwh_insurance_attachment'=>$postdata->naga_pwh_insurance_attachment,
      'insurance_covered_amt'=>$postdata->insurance_covered_amt,
      'insurance_premium_amt'=>$postdata->insurance_premium_amt,
      'insurance_period'=>$postdata->insurance_period,
      'insurance_start_date'=>$postdata->insurance_start_date,
      'insurance_end_date'=>$postdata->insurance_end_date,
      'insurance_company'=>$postdata->insurance_company,
      'gst_registration'=>$postdata->gst_registration,
      'company_name'=>$postdata->company_name,
      'godown_type'=>$postdata->godown_type,
      'contract_agreement_attachment'=>$postdata->contract_agreement_attachment,
      'gst_type'=>$postdata->gst_type,
      'effective_from'=>$postdata->effective_from,
      'effective_to'=>$postdata->effective_to,
      'cost_centre'=>$postdata->cost_centre,
      'gl_account'=>$postdata->gl_account,
      */
           );
           $model = new WarehouseEntryModel();
      if(isset($Id) && $Id!=""){
        
          $InsertSeq=0;

          $postdata->modby=$SessionUser;
          $postdata->moddt=$CurrentDateTime;
          $postdata->contractstartdate=date("Y-m-d",strtotime($postdata->contractstartdate));
          $postdata->contractenddate=date("Y-m-d",strtotime($postdata->contractenddate));
          $InsId = $model->updateMaster_new_warehouse($Id,$postdata);
     }else{     
     //var_dump($ngw_weeklyplan);
      $postdata->approval_status="1";
      $postdata->insby=$SessionUser;
      $postdata->insdt=$CurrentDateTime;
      $postdata->modby=$SessionUser;
      $postdata->moddt=$CurrentDateTime;
      

      $InsId = $model->insertMaster_new_warehouse($postdata);
      $ngw_warehouseupd=array('wh_code'=>$InsId);
      $model->updateMaster_new_warehouse($InsId,$ngw_warehouseupd);
    } 
//echo "B4 Upload";
    //$fileuploadctrl = new Upload();
   // $fileuploadctrl->uploadToNAS($postdata);
  
   // echo "AFTER Upload";
  //exit();
    return  $this->respond(["success" => 1]);
    
  }else{
    return  $this->respond(["success" => 0]);
  }
}


public function getWarehouseRentaldet(){
  
      $postData = $this->request->getJSON();

      // if(!isset($postData->Month))
      // {
      //   $postData->Month=1;
      // }
      
      $model = new WarehouseEntryModel();
      $res = $model->getWarehouseRentaldet($postData->Month);
      return  $this->sendSuccessResult($res);
    }  

public function UpdateApproveRental(){
  
    $postjson = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    
    $postdata=$postjson;
if(empty($SessionUser))
{
  return $this->sendErrorResult("Your Session Timeout");
}
    $RentDate=$postdata->Month."-01";
    if(isset($postdata)){
      $InsertSeq=1;
     
     $warehouse_rental=array(
      'wh_refid'=>$postdata->wh_refid,
      'rentdate'=>$RentDate,
      'rentmonth'=>$postdata->Month,
      'approveby'=>$SessionUser,
      'approvedate'=>$RentDate,
     );
     $model = new WarehouseEntryModel();
     
     $Tmprow = $model->getWarehouseRentaldetByIdDate($postdata->wh_refid,$postdata->Month);
        if($Tmprow[0] !==null and isset($Tmprow[0])){
         $warehouse_rental['modby']=$SessionUser;
         $warehouse_rental['moddt']=$CurrentDateTime;
         $res = $model->UpdateApproveRental($Tmprow[0]['id'],$$warehouse_rental);
    }else{     
    
     $warehouse_rental['approval_status']="1";
     $warehouse_rental['insby']=$SessionUser;
     $warehouse_rental['insdt']=$CurrentDateTime;
     $warehouse_rental['modby']=$SessionUser;
     $warehouse_rental['moddt']=$CurrentDateTime;
     //var_dump($warehouse_rental);
     $res = $model->InsertApproveRental($warehouse_rental);
   } 
//echo "B4 Upload";
   //$fileuploadctrl = new Upload();
  // $fileuploadctrl->uploadToNAS($postdata);
 
  // echo "AFTER Upload";
 //exit();
   return $this->sendSuccessResult($res);
   
 
  }else{
    return  $this->respond(["success" => 0]);
  }
} 

public function UpdateApproveRentalPostDet()
{
    
    $postData = $this->request->getJSON();
    //print_r($postData);

    $model = new WarehouseEntryModel();
    $res = $model->UpdateApproveRentalPostDet($postData);
    
    return  $this->sendSuccessResult($res);
  
}

public function WarhouseSummaryReport()
{
    
    $model = new WarehouseEntryModel();
    $res = $model->WarhouseSummaryReport();
    return  $this->sendSuccessResult($res);
  
}
}
