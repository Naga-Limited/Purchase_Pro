<?php 
namespace App\Models;

use App\Helpers\SessionHelper;
use App\Helpers\AppHelperFn;
use App\Helpers\StatusConstant;
use App\Models\BaseCgModel;

class EmptyVehicleArrivalModel  extends BaseCgModel
{
  protected $table = 'empty_vehicle_arrival';
  protected $primaryKey = 'Id';
   //protected $allowedFields = ["AddedBy","ModifiedBy","GATE_OUT_TM","ZVA_NUMBER","DRIVER_NO","GATE_OUT_TIME", "SCREEN_TYPE", "VEHICLE_STATUS", "PLANT_ID", "PLANT_NAME", "TRAILER_NO","CONTAINER_NO",   "CONTAINER_TYPE","WB_NAME","WB_SERIAL_NO","WB_EMPTY_WT","TRUCK_NO","WB_TICKET_NO",   "WB_NAME","WB_CHARGES",   "WB_EMPTY_WT"];
   protected $allowedFields = ["SecondWeightEntryDt","SecondWeightEntryBy","SecondWeightEntryByName","FirstWeightEntryDt","FirstWeightEntryBy","FirstWeightEntryByName","AddedBy","ModifiedBy","GATE_OUT_TM","ZVA_NUMBER","DRIVER_NO","GATE_OUT_TIME", "SCREEN_TYPE", "VEHICLE_STATUS", "PLANT_ID", "PLANT_NAME", "TRAILER_NO","CONTAINER_NO",   "CONTAINER_TYPE","WB_NAME","WB_SERIAL_NO","WB_EMPTY_WT","TRUCK_NO","WB_TICKET_NO",   "WB_NAME","WB_CHARGES",   "WB_EMPTY_WT","GateInDt","GateInBy","WaitOutsideDt","WaitOutsideBy","PortDispatchDt","PortDispatchBy","PortReceiptDt","PortReceiptBy", "tripsheet_no", "driver_name"];

  public function getDestPortTruckList($status){
    $builder =  $this->db->query("select distinct TRUCK_NO as label, TRUCK_NO as value from empty_vehicle_arrival where VEHICLE_STATUS=$status and SCREEN_TYPE='EVADP' and truck_no is not null");
    return  $builder->getResultArray();
  }
  public function getById($id){
    //Calculate WBWeight
    

    $WBWeight=200000;
    $WBBufferPercent=10;
     //Calculate WBWeight
    $builder =  $this->db->query("select  
      a.id,    dateAdded,    dateModified,    addedBy,    modifiedBy,    TRAILER_NO as trailerNo,    CONTAINER_NO as containerNo,
      CONTAINER_TYPE as containerType,    DRIVER_NO as driverNo,    WB_NAME as wbName,    WB_SERIAL_NO as wbSerialNo,
      WB_EMPTY_WT as wbEmptyWt,    TRUCK_NO as truckNo,    WB_TICKET_NO as wbTicketNo,    WB_CHARGES as wbCharges,
      SCREEN_TYPE as screenType, VEHICLE_STATUS as vehicleStatus,    PLANT_ID as plantId , ZVA_NUMBER zvaNumber,
      (SELECT Netweight FROM `pp_silotomillweights` where VANumber=a.ZVA_NUMBER ) as WBWeight,
      (SELECT WB_BufferPercentage FROM `pp_setting`) as WBBufferPercent,b.PLANT_NAME
    from  empty_vehicle_arrival a 
    LEFT JOIN master_plant b ON a.PLANT_ID=b.WERKS
    where a.id=$id");
    return  $builder->getFirstRow();
  }

  public function UpdateWeight($id,$WeightEntry, $ScreenType){
   
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    
    $upda =array();    
    
    // echo "X ", $id, " Y ",$WeightEntry," Z ", $ScreenType; exit();
      
        if($WeightEntry==1){
          $upda['FirstWeightEntryDt']=$CurrentDateTime;
          if(isset($ScreenType) && $ScreenType == "EVADP"){
            $upda['VEHICLE_STATUS']=24; // $upda['VEHICLE_STATUS']=13; flow changes according to IAS Flow Excel
          }else{
            $upda['VEHICLE_STATUS']=13;
          }
          $upda['FirstWeightEntryBy']=$SessionUser;
          $upda['FirstWeightEntryByName']=$SessionUserName;
        
        }
        
        if($WeightEntry==2){
          $upda['SecondWeightEntryDt']=$CurrentDateTime;
          if(isset($ScreenType) && $ScreenType == "EVADP"){
            $upda['VEHICLE_STATUS']=13; //$upda['VEHICLE_STATUS']=5; flow changes according to IAS Flow Excel
          }else{
            $upda['VEHICLE_STATUS']=5;
          }
          $upda['SecondWeightEntryBy']=$SessionUser;
          $upda['SecondWeightEntryByName']=$SessionUserName;
          
        }
    return $this->update($id,$upda);   
   }

  public function updateStatus($id, $status)
  {
    $WaitOutSideDt = "";
    $WaitOutSideBy = "";
    $GateInBy = "";
    $GateInDt = "";
    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];
    $CurrentDateTime = date("Y-m-d H:i:s");

    $upda = array("VEHICLE_STATUS" => $status);
    if ($status == 1) {
      $upda['WaitOutsideDt'] = $CurrentDateTime;
      $upda['WaitOutsideBy'] = $SessionUser;
      $upda['WaitOutsideByName'] = $SessionUserName;
    }
    if ($status == 4) {
      $upda['GateInDt'] = $CurrentDateTime;
      $upda['GateInBy'] = $SessionUser;
      $upda['GateInByName'] = $SessionUserName;
    }
    return $this->update($id, $upda);
  }

  public function add($postData){
    $vaNumber = $this->getNextIasVaNumber($postData->plantId);
    $postData->plantId = 
    $this->insert($postData);
  }

  function isIrs ($screenType){
    return $screenType==="EVAWH" || $screenType==="EVAOY";
  }
  function isIas ($screenType){
    return $screenType==="EVADP";
  }

  function isVehicleAlreadyIn ($record){
    //var_dump($record);
    $builder = $this->db->table($this->table);
    $builder->selectCount('Id',"totalCount");
    $screenType = $record->SCREEN_TYPE;
    $stts = [StatusConstant::$COMPLETED, StatusConstant::$PORT_DISPATCH, StatusConstant::$PORT_RECEIPT,StatusConstant::$MIGOAPPROVAL,StatusConstant::$MIGOCOMPLETED,StatusConstant::$REJECT_GATEOUT,StatusConstant::$REDIRECT,StatusConstant::$MIGO_REJECT,StatusConstant::$PROCESS_REJECT];
    $builder->where("VEHICLE_STATUS not in (".join(",",$stts).")");
    //if($this->isIrs($screenType)){
   //   $builder->where("(CONTAINER_NO='$record->CONTAINER_NO')");
   // }
  //  else if($this->isIas($screenType)){
  //    if(isset($record->isTruck) && $record->isTruck){
   //     $builder->where("TRUCK_NO='$record->TRUCK_NO'");
    //  }
    //  else{
      //  $builder->where("TRAILER_NO='$record->TRAILER_NO'");
     // }
   // }
    //if($screenType=="SILOTOMILL"){
    $builder->where("TRUCK_NO='$record->TRUCK_NO'");
   // }
    $total = $builder->get()->getFirstRow()->totalCount;
   
    return $total>0;
  }

  function isVehicleClearOldEntries ($record){
    //var_dump($record);
    $builder = $this->db->table($this->table);
    $builder->selectCount('Id',"totalCount");
    $screenType = $record->SCREEN_TYPE;
    $PLANT_ID = $record->PLANT_ID;

    
    $varCuurentDate = date('Y-m-d H:i:s'); 
    $EndDate = date('Y-m-d 23:59:59', strtotime($varCuurentDate));
    // $StartDate  = date('Y-m-d', strtotime('-7 day', strtotime($EndDate)));    

    // print_r($StartDate);exit();
    $stts = [StatusConstant::$COMPLETED, StatusConstant::$MIGOCOMPLETED,StatusConstant::$REJECT_GATEOUT,StatusConstant::$REDIRECT,StatusConstant::$PROCESS_REJECT,StatusConstant::$MIGO_REJECT,StatusConstant::$PORT_DISPATCH];
    $builder->where("SCREEN_TYPE='$screenType' and VEHICLE_STATUS not in (".join(",",$stts).")");

    if($screenType=="SILOTOMILL") {
    $stm = $this->db->query("select id,temp_extended_days FROM delivery_control_panel where status = 2 and delivery_control_id = 3 order by id");
    $res = $stm->getResultArray();
    $temp_extended_days = $res[0]["temp_extended_days"];
    $days_stm = -7 - $temp_extended_days ;
    $date_stm = date('Y-m-d', strtotime("$days_stm day", strtotime($EndDate)));
    }else if($this->isIrs($screenType)){
    $irs = $this->db->query("select id,temp_extended_days FROM delivery_control_panel where status = 2 and delivery_control_id = 4 order by id");
    $res = $irs->getResultArray();
    $temp_extended_days = $res[0]["temp_extended_days"];
    $days_stm = -7 - $temp_extended_days ;
    $date_irs = date('Y-m-d', strtotime("$days_stm day", strtotime($EndDate)));
    }else if($this->isIas($screenType)){
      $ias = $this->db->query("select id,temp_extended_days FROM delivery_control_panel where status = 2 and delivery_control_id = 2 order by id");
      $res = $ias->getResultArray();
      $temp_extended_days = $res[0]["temp_extended_days"];
      $days_stm = -7 - $temp_extended_days ;
      $date_ias = date('Y-m-d', strtotime("$days_stm day", strtotime($EndDate)));
    }

    // $temp_extended_days = $res[0]["temp_extended_days"];
    // print_r($temp_extended_days);exit;

    // $days_stm = -7 - $temp_extended_days ;
    // // print_r($days_stm);
    // $date_stm  = date('Y-m-d', strtotime("$days_stm day", strtotime($EndDate)));
    if($screenType=="SILOTOMILL"){
      $result = $builder->where("PLANT_ID='$PLANT_ID' and DateAdded <= '".$date_stm."'");
    }else if($this->isIrs($screenType)){
      $result = $builder->where("PLANT_ID='$PLANT_ID' and DateAdded <= '".$date_irs."'");
    }
    else if($this->isIas($screenType)){
      if(isset($record->isTruck) && $record->isTruck){
        $result = $builder->where("PLANT_ID='$PLANT_ID' and DateAdded <= '".$date_ias."'");
      }
      else{
        $result = $builder->where("PLANT_ID='$PLANT_ID' and DateAdded <= '".$date_ias."'");
      }
    }
    // print_r($result);exit;
    $total = $result->get()->getFirstRow()->totalCount;
  //  print_r($total);exit();
    return $total>0;
  }

  function addOrUpdateVehicleArrival($record) {
     //var_dump($record); exit();
    
    $res  = $this->doTransaction(function() use ($record) {

      if(isset($record->ID)){

        $record->ModifiedBy = SessionHelper::getUserName();
        $this->update($record->ID,$record);

      }else if(!empty($record)){        
        
        $screenType = $record->SCREEN_TYPE; 
        $vaNumber = "";
        if($this->isIrs($screenType)){
          $vaNumber = $this->getNextIrsVaNumber($record->PLANT_ID); //EVAWH" || "EVAOY";
        }else if($this->isIas($screenType) ){
          $vaNumber = $this->getNextIasVaNumber($record->PLANT_ID); //EVADP
        }else if($screenType=="SILOTOMILL"){
          $vaNumber = $this->getNextSTMVaNumber($record->PLANT_ID); //SILOTOMILL
          // echo "vaNumber: ", $vaNumber;
        }

        $record->ZVA_NUMBER = $vaNumber;
        $record->AddedBy = SessionHelper::getUserName();
        $isOwn = AppHelperFn::isOwnWb($record->PLANT_ID);
        $CurrentDateTime = date("Y-m-d H:i:s");
        $record->GateInDt = $record->GateInDt == '' ? $CurrentDateTime:$record->GateInDt;
       //echo "WB TYPE : ", $isOwn, " record->VEHICLE_STATUS:",$record->VEHICLE_STATUS; 

        if ($isOwn == 1 && $record->VEHICLE_STATUS != 1) {
          if ($record->isTruck){                            
            $record->VEHICLE_STATUS = 23;       
          }
        }else{
          if ($record->isTruck && $record->VEHICLE_STATUS != 1){  //Mohan 22-09-2022 Added && $record->VEHICLE_STATUS != 1 condition for waiting out side gatein
          $record->VEHICLE_STATUS = 13;         
          }
        }
        //var_dump($record);exit();

        $this->insert($record); 
        // echo $this->db->getLastQuery();
      }
    });

   return $res;
  
  }

  private function getNextIrsVaNumber($plantId){
    return (new VehicleArrivalModel())->getNextZvaNumber("RMIRS",$plantId,$this->table,"Id");
  }
  private function getNextIasVaNumber($plantId){
    return (new VehicleArrivalModel())->getNextZvaNumber("RMIAS",$plantId,$this->table,"Id");
  }
  private function getNextSTMVaNumber($plantId){
    return (new VehicleArrivalModel())->getNextZvaNumber("RMSTM",$plantId,$this->table,"Id");
  }

  public function getTripsheetVehicleDD()
  {
    $builder = $this->db->query("select tripsheetid as value, vehicle_no as label, tripsheet_no, driver_name, driver_mobile_no as driver_no FROM ngw_tripsheet_vehicles where process_type='START' order by tripsheetid");
    return  $builder->getResultArray();
  }
  
  public function getDriverNameDD()
  {
    $builder = $this->db->query("select driverno as value, drivername as label FROM ngw_drivermaster where recstatus = 1 order by drivername");
    return  $builder->getResultArray();
  }
}
