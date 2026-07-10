<?php namespace App\Controllers\Api;
use App\Models\VehicleArrivalModel;
use App\Models\EmptyVehicleArrivalModel;
use App\Helpers\StatusConstant;
use App\Helpers\AppHelperFn;
use App\Models\GatePro\MasterService;

date_default_timezone_set("Asia/Calcutta");
class VehicleArrival extends BaseApiController
{    
  public function addIasVehicle(){
    $json = $this->request->getJSON();

    //var_dump($json); exit();

    $model = new VehicleArrivalModel();
    $masterService = new MasterService();	
    /*Commented By Arul 03082022 or changing logic to pick Truck no waiting at outside in Receiving gate
    
    $res = $model->isPickSlipExist($json->PICK_SLIP_NO);
    if($res){
      return  $this->respond(["success" => 0, "error" =>"Already vehicle in"]);
    }else{

      */
      $res = $model->isVehicleNoExistAllCloseStatus($json->VEHICLE_NO);
      //var_dump($res); 
      
      if (!empty($json->VEHICLE_NO)) {

        $already_in_Check = $masterService->VehicleAlreadyInCheck($json->VEHICLE_NO);

        if (!empty($already_in_Check[0]['WERKS'])) {

            $message = 'VehicleAlready in - ' . 
                       $already_in_Check[0]['PLANT_NAME'] . 
                       ' (' . $already_in_Check[0]['WERKS'] . ')';

            return  $this->respond(["success" => 0, "error" => $message]);
        }
      }
      if($res==false){
        return  $this->respond(["success" => 0, "error" =>"Already vehicle in"]);
      }else{
        $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $CurrentDateTime=date("Y-m-d H:i:s");

      if($json->VECHICAL_STATUS==1){
        $json->WaitOutsideDt=$CurrentDateTime;
        $json->WaitOutsideBy=$SessionUser;
        $json->WaitOutsideByName=$SessionUserName;
      }else{
        $json->GateInDt=$CurrentDateTime;
        $json->GateInBy=$SessionUser;
        $json->GateInByName=$SessionUserName;
      }
     
     
      $ExpWerks=explode("-",$json->WERKS);
      $isOwn =AppHelperFn::isOwnWb($ExpWerks[0]);
      if($isOwn==1 && $json->VECHICAL_STATUS!=1){
        $json->VECHICAL_STATUS=23;
      }
      //Added by mohan 05012022 for removing plant name in WERKS
        $json->WERKS=explode("-",$json->WERKS)[0];
      //END mohan 05012022 for removing plant name in WERKS
     
     $result = $model->isClearOldEntries($json->WERKS);
     if($result==false){
      return  $this->respond(["success" => 0, "error" =>"Clear Old Entries"]);
    }
    // var_dump($json->WERKS);
    //  exit();
      $res = $model->add($json);
      $vaModel= new EmptyVehicleArrivalModel();
      if($res > 0){
        $vaModel->updateStatus($json->EMPTY_VEHICLE_ARRIVAL_ID,StatusConstant::$RECEIVER_GATE_IN);
      }
      return  $this->respond(["success" => 1, "results" => $res]);
    }
    //}
  }

  // function fetchAllTruckArrival($connect, $record) {
  //   $vehicleStatus = $record->vehicleStatus;
  //   $isRake = (isset($record->rake))?"(ZVA_NUMBER IS NOT NULL OR VEHICLE_TYPE = 'Rake')": "ZVA_NUMBER IS NOT NULL";
  //   $vstatus = "VECHICAL_STATUS IN (" . $vehicleStatus . ")";
  //   $filters = [$isRake,$vstatus];
  //   // $includeStatus = false;
  //   if (isset($record->searchTxt)) {
  //     array_push($filters, "(ZPO_NUMBER like '%" . $record->searchTxt . "%'  or TRUCK_NO like '%" . $record->searchTxt . "%')");
  //     // $includeStatus =true;
  //   }

  //   $plantFilter = [];
  //   if (isset($record->plantIds)) {
  //     $plantIds = $record->plantIds;
  //     foreach ($plantIds as $plantid) {
  //       array_push($plantFilter, "WERKS = '" . $plantid . "'");
  //     }
  //   }

    
  //   if (count($plantFilter) > 0) {
  //     array_push($filters, "(" . join(" OR ", $plantFilter) . ")"); 
  //     // $includeStatus =true;
  //   }

  //   // if ($includeStatus) {
  //   //   array_push($filters, $vstatus);
  //   // }
  //   if(isset($record->SCREEN_TYPE) && $record->SCREEN_TYPE==="IAS"){
  //     array_push($filters,"SCREEN_TYPE ='IAS'");
  //   }
  //   else{
  //     $privieges = getPrivilegeByUser($connect, $_SESSION["USERID"]);
  //     $priviegesKey = array_keys($privieges);
  //     if(isset($record->includeIas) ){
  //       array_push($priviegesKey,"IAS");
  //     }
  //     array_push($filters,"SCREEN_TYPE IN ( '" . join("','",$priviegesKey) . "')");
  //   }
  //   $countsql =  "select count(PI_REFID) as total from purchase_info where " . join(" AND ", $filters);
  //   //echo $countsql;
  //   $countData = mysqli_query($connect, $countsql);
  //   $total = 0;
  //   while ($crow = mysqli_fetch_assoc($countData)) {
  //     $total = $crow["total"];
  //   }
  //   $pageSize =50;
  //   if(isset($record->pageSize)){
  //     $pageSize =$record->pageSize;
  //   }

  //   $fields = "PI_REFID,ZVA_NUMBER,PICK_SLIP_NO, EMPTY_VEHICLE_ARRIVAL_ID, ZPO_NUMBER,QA_STATUS, DateAdded,DateModified, TRUCK_NO,SCREEN_TYPE, DRIVER_NO,VECHICAL_STATUS,ZSUPPLIER_NAME,VEHICLE_TYPE, WERKS,IDNLF, INCO1";
  //   $fetchsql =
  //     "select " .
  //     $fields .
  //     " from purchase_info where " 
  //     . join(" AND ", $filters)." order by DateAdded,VECHICAL_STATUS limit " .
  //     $record->startCount .
  //     ",$pageSize";
  //     // echo $fetchsql;
  //   $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  //   return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);
  // }
  public function WeighmentCorrection($userId) {
    $reportService = new VehicleArrivalModel();
    $postData = $this->request->getJSON();
    $results = $reportService->WeighmentCorrection($userId); 
    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
  public function WeighmentCorrectionUpdate() {
		$gateService = new VehicleArrivalModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->WeighmentCorrectionUpdate($json);
		$dataStatus = $result[0];
		$message = $result[1];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }
}