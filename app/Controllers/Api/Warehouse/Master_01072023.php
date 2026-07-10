<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\MasterModel;

class Master extends BaseApiController
{
  public function getDistrict()
  {
    //echo "TEST";
    //return "aa";
    $master = new MasterModel();
    
    return  $this->sendSuccessResult($master->getDistrict());
  }

  public function getState()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getState());
  }

  public function getWarehouse()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWarehouse());
  }

  public function getWeekNo()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWeekNo());
  }
  public function getLotNumber()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getLotNumber());
  }
  public function getRestrictMode()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getRestrictMode());
  }
  
  public function getDistWeekNo()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getDistWeekNo());
  }
  public function getWheatVariety()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVariety());
  }

  public function getMovementGroupNumber()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getMovementGroupNumber());
  }

  public function getwarehousewithID()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getwarehousewithID());
  }
  public function getwarehousewithID_ID($Id){
   // echo "text";
   // exit();
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getwarehousewithID_ID($Id));
  }

  //Common Duplicate Check Function 
  public function CheckDuplicate($Data,$idcolumnname,$id,$table, $dupcheckcolumn, $dupcheckvalue){
    include_once APIPATH. "/db_connection.php";   
    if($table=="ngw_state_district"){
      $Qry="SELECT Id FROM `ngw_state_district` where upper(districtname)=upper('".$Data->districtname."')";
      if($id<>""){
        $Qry.=" AND id<>'$id'";
      }   
    }

    else if($table=="warehouse_master"){
      $Qry="SELECT wh_refid FROM `warehouse_master` where upper(warehousename)=upper('".$Data->warehousename."')";
      if($wh_refid<>""){
        $Qry.=" AND wh_refid<>'$id'";
      }   
    }
    else {
      $Qry="SELECT ".$idcolumnname." FROM `".$table."` where upper(".$dupcheckcolumn.")=upper('".$dupcheckvalue."')";
      if($id<>""){
        $Qry.=" AND ".$idcolumnname."<>'$id'";
      }   
      //echo "<Br>".$Qry;
    }

    $Select=mysqli_query($connect,$Qry);
    $count=mysqli_num_rows($Select);
    return $count;
  }
  //INSERT & UPDATE & Select
  
  
  public function getMaster_ngw_RelotreasonlistById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->getRelotReason($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function getMaster_ngw_state_districtDetailsById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->getStateDistrict($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function updateMaster_ngw_state_district(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    if($this->CheckDuplicate($postData->Data, 'id',$postData->id, 'ngw_state_district','concat(statename,districtname)',($postData->statename).($postData->districtname))=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_state_district($postData->id,$postData->Data);
    
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_ngw_state_district($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   return  $this->respond(["success" => $res]);
   }
   //Bank
  public function getMaster_ngw_bankDetailsById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    // echo "TEST";
     //var_dump($postData);
    //exit();
    if($postData!==null && isset($postData->id))
    {
      // echo "T";
      $res = $model->getbankmaster($postData->id);
    }
    else{
      //  echo "F";
      $res = $model->getbankmasterDropDown();//FILL DROPDOWN
    }
    return  $this->sendSuccessResult($res);
  }

  public function getMaster_ngw_driverDetailsById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();

    if($postData!==null && isset($postData->id)){
      $res = $model->getdrivermaster($postData->id);
    }else{
      $res = $model->getdrivermasterDropDown();//FILL DROPDOWN
    }
    return  $this->sendSuccessResult($res);
  }
  
  public function updateMaster_ngw_bank(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
   // var_dump($postData);exit();
    if($this->CheckDuplicate($postData->Data, 'bankid',$postData->id,'ngw_bankmaster','bankname', $postData->Data->bankname)=="0")
  {
  if($postData->id!=""){ 
   // $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_bank($postData->id,$postData->Data);
  }else{
    //$postData->Data->InsBy=$SessionUser;
    //var_dump($postData);exit();
    $res = $model->insertMaster_ngw_bank($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   return  $this->respond(["success" => $res]);
   }
   
  //Driver Master
  public function updateMaster_ngw_driver(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
   // var_dump($postData);exit();
    // if($this->CheckDuplicate($postData->Data, 'driverid',$postData->id,'ngw_drivermaster','drivername', $postData->Data->drivername)=="0"){
      if($postData->id!=""){ 
        // $postData->Data->ModBy=$SessionUser;
        $res = $model->updateMaster_ngw_driver($postData->id,$postData->Data);
      }else{
        //$postData->Data->InsBy=$SessionUser;
        //var_dump($postData);exit();
        $res = $model->insertMaster_ngw_driver($postData->Data);
      }
    // }else{
    //   $res=-5; 
    // }
    return  $this->respond(["success" => $res]);
  }

   //Ware house
   public function getMaster_new_warehouseDetailsById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    //echo "TEST";
    //exit();
    $res = $model->getMaster_new_warehouse($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function getMaster_new_warehouseLotDetById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    //echo "TEST";
    //exit();
    $res = $model->getMaster_new_warehouseLotDetById($postData->id);
    return  $this->sendSuccessResult($res);
  }
 public function updategetMaster_new_warehouse(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    if($this->CheckDuplicate($postData->Data, 'wh_refid', $postData->wh_refid,'warehouse_master','wh_code', $postData->wh_code)=="0")
  {
  if($postData->wh_refid!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_new_warehouse($postData->wh_refid,$postData->Data);
    
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_new_warehouse($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   return  $this->respond(["success" => $res]);
   }

   public function updateMaster_rndlotconversion1(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    if($this->CheckDuplicate($postData->Data, 'rnd_lot_parametermasterid', $postData->rnd_lot_conversion_id,
    'ngw_rnd_lot_parametermaster','parametername', $postData->Data->Parameter_Name)=="0")
  {
  if($postData->rnd_lot_conversion_id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->UpdateParameter($postData->rnd_lot_conversion_id,$postData->Data);
    
  }else{
    $postData->Data->InsBy=$SessionUser;
    //echo "test";exit();
    $res = $model->InsertParameter($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   return  $this->respond(["success" => $res]);
   }

// R & D parameters Master

public function getMaster_rndlotconversionById(){
  $postData = $this->request->getJSON();
  $model = new MasterModel();
  //var_dump($postData);exit();
  $res = $model->getMaster_rndlotconversion($postData->rnd_lot_parametermasterid);
  return  $this->sendSuccessResult($res);
}
public function updateMaster_rndlotconversion(){
  $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
  $postData = $this->request->getJSON();
  $model = new MasterModel();
  if($this->CheckDuplicate($postData->Data, 'rnd_lot_parametermasterid', $postData->rnd_lot_parametermasterid,'Master_rndlotconversion','concat(wheatvariety,parametername)',$postData->wheatvariety.$postData->parametername)=="0")
{
if($postData->id!=""){ 
  $postData->Data->ModBy=$SessionUser;
  $res = $model->updateMaster_rndlotconversion($postData->rnd_lot_parametermasterid,$postData->Data);
}else{
  $postData->Data->InsBy=$SessionUser;
  $res = $model->insertMaster_rndlotconversion($postData->Data);
}
  }
 else{
   $res=-5; 
 }
 return  $this->respond(["success" => $res]);
 }

 /*** R&D End ***/

 /*** fumigation controller ***/

 public function getFumigationEntryById(){
  $postData = $this->request->getJSON();
  $model = new MasterModel();
  $res = $model->getFumigationEntry($postData->id);
  return  $this->sendSuccessResult($res);
}
public function updateFumigationEntry(){
  $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
  $postData = $this->request->getJSON();
  $model = new MasterModel();
  //if($this->CheckDuplicate($postData, $id,'FumigationEntry')=="0")
// {
if($postData->id!=""){ 
  $postData->Data->ModBy=$SessionUser;
  $res = $model->updateFumigationEntry($postData->id,$postData->Data);
}else{
  $postData->Data->InsBy=$SessionUser;
  $res = $model->insertFumigationEntry($postData->Data);
}
  // }
 /*else{
   $res=-5; 
 }*/
 return  $this->respond(["success" => $res]);
 }
/*** End Fumigation Controller ***/

/*** Relotting Controller ***/
public function getRelottingEntryById(){
  $postData = $this->request->getJSON();
  $model = new MasterModel();
  $res = $model->getRelottingEntry($postData->id);
  return  $this->sendSuccessResult($res);
}
public function updateRelottingEntry(){
  $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
  $postData = $this->request->getJSON();
  $model = new MasterModel();
  //if($this->CheckDuplicate($postData, $id,'RelottingEntry')=="0")
// {
if($postData->id!=""){ 
  $postData->Data->ModBy=$SessionUser;
  $res = $model->updateRelottingEntry($postData->id,$postData->Data);
}else{
  $postData->Data->InsBy=$SessionUser;
  $res = $model->insertRelottingEntry($postData->Data);
}
  // }
 /*else{
   $res=-5; 
 }*/
 return  $this->respond(["success" => $res]);
 }

 /*** End Relotting Model ***/
  /*** Get Ware House Created By prakash on 30-11-2021 ***/

  public function getwarehouseslist()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getEntryWarehouses());
  }
  public function getMasterBagDetailsByRefId(){
    $postData = $this->request->getJSON();
   /* $model = new SDIModel();
    $res = $model->getSDIDetailById($postData->id);
    return  $this->respond(["success" => 1, "results" => $res]);
*/
    $model = new MasterModel();
    $res = $model->getMasterBag($postData->BAG_REFID);
    return  $this->sendSuccessResult($res);
  }
    public function updatemaster_bag1(){
      
     
      $postData = $this->request->getJSON();
      $session = session();
     
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $model = new MasterModel();
      
      if($postData->id!=""){
        $postData->Data->ModBy=$SessionUser;
      $res = $model->updateMasterBag1($postData->id,$postData->Data);
      }else{
        $postData->Data->InsBy=$SessionUser;
        // print_r($postData);
        $res = $model->insertMasterBag1($postData->Data);
      }
       if($res=="-5")
       {
        return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
       }
       else{
        return $this->respond(["success" => $res]);
       }
         
      
    }
  
  /* Fetch All the Plants */
  public function getWHplantListAll(){
    // $postData = $this->request->getJSON();
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWHplantListAll());
  }

  /* Fetch Plants under Warehouse */
  public function getWHplantList()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getWHplantList($postData->WH_CODE));
    // return array("RESP"=>"TEST");
  }

   /* Fetch Plants under Warehouse */
   public function getWHstoragelocationList()
   {
     $master = new MasterModel();
     $postData = $this->request->getJSON();
     //echo "Y".$postData->WH_CODE."X";
     return  $this->sendSuccessResult($master->getWHstoragelocationList($postData->WH_CODE));
     // return array("RESP"=>"TEST");
   }

     /* Fetch Plants under Warehouse */
     public function getWHstoragelocationBasedPlant()
     {
       $master = new MasterModel();
       $postData = $this->request->getJSON();
       return  $this->sendSuccessResult($master->getWHstoragelocationBasedPlant($postData->plantId));
       // return array("RESP"=>"TEST");
     }

  public function getStateName()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getStateName($postData->DistId));
    // return array("RESP"=>"TEST");
  }
    /* Fetch Plants under Warehouse */
    public function getKeyloadplantList()
    {
      $master = new MasterModel();
      $postData = $this->request->getJSON();
      //echo "Y".$postData->WH_CODE."X";
      return  $this->sendSuccessResult($master->getKeyloadplantList($postData->WH_CODE));
      // return array("RESP"=>"TEST");
    }

    
  /* Fetch Plants under Warehouse */
  public function getKeyloanSRNo()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getKeyloanSRNo());
    // return array("RESP"=>"TEST");
  }

  public function getKeyLoanwarehouses()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getKeyLoanwarehouses());
    // return array("RESP"=>"TEST");
  }
  public function getParameterType(){
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getParameterType());
  }
  public function get_parament_req(){
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->get_parament_req());
  }

  public function getKeyLoanDet()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getKeyLoanDet($postData->SRNo));
    // return array("RESP"=>"TEST");
  }
 
  
  public function getUsers(){
    $master = new MasterModel();
    
    
    return  $this->sendSuccessResult($master->getUsers());
  }
  public function getInfestation(){
    $master = new MasterModel();
    
    
    return  $this->sendSuccessResult($master->getInfestation());
  }
  
  /* Fetch Lots under Plant */
  public function getWHLotList()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getWHLotList($postData->plantid,$postData->storagelocationId));
    // return array("RESP"=>"TEST");
  }

  public function getWHLotList_With_Plantid()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    return  $this->sendSuccessResult($master->getWHLotList_With_Plantid($postData->plantid,$postData->storagelocationId));
  }

  public function getWHLotListFromStorageLocation_st()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getWHLotListFromStorageLocation_st($postData->storagelocationId));
    // return array("RESP"=>"TEST");
  }
  public function getWHLotListFromStorageLocation()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    //echo "Y".$postData->WH_CODE."X";
    return  $this->sendSuccessResult($master->getWHLotListFromStorageLocation_st($postData->storagelocationId));
    // return array("RESP"=>"TEST");
  }
  public function getWHLotBasedSL()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    return  $this->sendSuccessResult($master->getWHLotBasedSL($postData->LocationId));
  }
   /* Fetch Lots under Plant */
   public function getKeyLoanLotList()
   {
     $master = new MasterModel();
     $postData = $this->request->getJSON();
     //echo "Y".$postData->WH_CODE."X";
     return  $this->sendSuccessResult($master->getKeyLoanLotList($postData->plantid,$postData->WHId));
     // return array("RESP"=>"TEST");
   }
  

  /*** get wheatvariety Of Lot***/
  public function getWHWheatvarityList()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    if(isset($postData->lotid) || isset($postData->StorageLocation))
    {
      //Fetch only selected wheat variety to dropdown 
      return  $this->sendSuccessResult($master->getWHWheatvarietyList($postData->lotid, $postData->StorageLocation));
    }
    else
    {
      //Fetch all wheat variety to dropdown used in Weeklyplan page
      //echo "ELSE";exit();
      return  $this->sendSuccessResult($master->getWHWheatvarietyList());
    }
  } 
  
  public function getWH_Plant_SL_Lot_WheatvarietyId(){
    $postData = $this->request->getJSON();
   
     $model = new MasterModel();
     $res = $model->getWH_Plant_SL_Lot_WheatvarietyId($postData->WheatVarietyId);
     return  $this->sendSuccessResult($res);
  }

  public function getStorageLocationListFromPlant(){
    $postData = $this->request->getJSON();
   
     $model = new MasterModel();
     $res = $model->getStorageLocationListFromPlant($postData->PlantId);
     return  $this->sendSuccessResult($res);
  }
  public function getReceivingBinwithValue(){
    $model = new MasterModel();
    $res = $model->getReceivingBinwithValue();
    return  $this->sendSuccessResult($res);
  }
  public function getSublotWHeatvarietyList(){
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    return  $this->sendSuccessResult($master->getSublotWHeatvarietyList($postData->PlantId,
    $postData->WareHouseId,$postData->StorageLocationId));
  }
   /*** get wheatvariety Of Lot***/
  public function getKeyloanHWheatvarityList()
  {
    $master = new MasterModel();
    $postData = $this->request->getJSON();
    return  $this->sendSuccessResult($master->getKeyloanHWheatvarityList($postData->lotid,$postData->whId,$postData->plantid,$postData->storagelocationid));
  }  

  /*** get wheatvariety ***/
  public function getwheatvarietylist()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVariety());
  }


  /*** get Storage Location ***/
  public function getstoragelocationlist()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getStorageLocation());
  }

  /*** get Fumigation Type ***/
  public function getFumigationType()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getFumigationTypeData());
  }

  /*** Reason For Delay ***/
  public function getResonForDelay()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getResonForDelayData());
  }

  /*** Get new Lot No ***/
  public function getNewLotNo()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getNewLotNoList());
  }

  public function lotCreationBulkUpload2(){
   echo getcwd();

   $uploadDIR = getcwd();
   $uploadDIR = str_replace("public","",$uploadDIR);
   echo $uploadDIR;

   return  $this->respond(["success" =>"0"]);
   
   exit();
  }

  public function lotCreationBulkUpload(){
    //echo "test - 123";exit();
    //echo "s2";exit();
    $ErrorMsg="";
    $postData = $this->request->getJSON();
    //echo "TEST";
    //return $this->respond(["success" =>"0"]);


    $uploadDIR = getcwd();
    $uploadDIR = str_replace("public","",$uploadDIR);
    //echo $uploadDIR, "###############";
    //print_r($postData);
    //print_r($postData->LotCreationFilePath);
    //return  $this->respond(["success123" =>"0"]);
    $FilePath= str_replace("//","/", $postData->LotCreationFilePath);
    echo $postData->LotCreationFilePath;

    $target_file =$uploadDIR.$FilePath;
    
  ////  $target_file="E:/wamp64/www/reacttest//api/upload/2022/March/30//_LotCreation-20220330123353.csv";
  echo "<br>  Uplode Path => ", $uploadDIR;
  echo "<br>  File Path => ", $FilePath;
  echo "<br>  Target Path => ", $target_file;
     
    // return  $this->respond(["success123" =>"0"]);

    $fileexists = 0;
    $f1="0";
    if (file_exists($target_file)) {
      $fileexists = 1;
      $f1="1";
    }
    //return  $this->respond(["success" =>"0","ERRMSG"=>$fileexists."CC". $FilePath]);   
    
    
    // echo "s1=>".$fileexists;
  //return  $this->respond(["success" =>"0","ERRMSG"=>$fileexists."CC".$postData->LotCreationFilePath]);   
   $session = session();
  //  echo $fileexists;exit();
   $SessionUser=$_SESSION["USERID"];
   $SessionUserName=$_SESSION["FIRSTNAME"];
   $SessionUser="1";
   
    if ($fileexists == 1) {
     echo "hi -1";
     $file = fopen($target_file, "r");
     $importData_arr =array();
     include_once APIPATH. "/db_connection.php"; 
     $i=0;
     //echo "hi -2";
     
     while (($data = fgetcsv($file, 1000, ",")) !== false) {
   
       $num = count($data);
       
    //  echo "hi -3";
       
        if($i>0 && $data[0]!=""){
       
        $warehouse=$data[0];
        $plantname=$data[1];
        $storagelocation=$data[2];
        $LotNumber=$data[3];
        $TotalCapacity=$data[4];
        $AllowedTolerance=$data[5];
        $MaxCapacity=$data[6];
        $Length=$data[7];
        $Breadth=$data[8];
        $Height=$data[9];
        $Row=$data[10];
        $Column=$data[11];

       // echo "hi -4";
        $Sql="SELECT wh_refid FROM `warehouse_master` where wh_code='".$warehouse."'";
        //echo $Sql;
        $Select=mysqli_query($connect, $Sql);
        $FetchWH=mysqli_fetch_assoc($Select);
        $WhId=$FetchWH['wh_refid'];
        if($WhId==""){
          return  $this->respond(["success" => 0]);
        }

        $Sql="SELECT * FROM `master_plant` where upper(PLANT_NAME)=upper('$plantname')";
        $Select=mysqli_query($connect, $Sql);
        $Count=mysqli_num_rows($Select);
        if($Count==1){
          $FetchPlant=mysqli_fetch_assoc($Select);
          $PlantId=$FetchPlant['ID'];
        }else{
 
          $Qry="INSERT INTO `master_plant`( `PLANT_NAME`, `WH_CODE`, `OwnWB`,WERKS)
          VALUES (
            '".$plantname."','".$warehouse."','0','".$plantname."')";
              mysqli_query($connect, $Qry);
              $PlantId= $connect->insert_id;
              $Qry="Update `master_plant` set WERKS='".$plantname."' where Id = '$PlantId'";
              mysqli_query($connect, $Qry);
        }
          //echo "hi -5", $Qry; exit();

          //Storage Location
          $Sql="SELECT STORAGE_REFID FROM `master_storage` where upper(STORAGE_LOCATION)=upper('$storagelocation') and plantid = '$PlantId'";
          $Select=mysqli_query($connect, $Sql);
          $Count=mysqli_num_rows($Select);
          if($Count==1){
            $FetchPlant=mysqli_fetch_assoc($Select);
            $Storage_LocationId=$FetchPlant['STORAGE_REFID'];
          }else{

          $Qry="INSERT INTO `master_storage`( `STORAGE_LOCATION`, `plantid`, InsBy, InsDt, LGORT)
          VALUES ('".$storagelocation."','".$PlantId."','$SessionUser',Current_Timestamp,'$storagelocation')";
          //echo $Qry;
              mysqli_query($connect, $Qry);
              // $Storage_LocationId=$connect->insert_id;
              $Storage_LocationId = mysqli_insert_id($connect);
              $Qry="Update `master_storage` set LGORT='$storagelocation' where STORAGE_REFID = '$Storage_LocationId'";
              //echo $Qry;
              //exit();
              mysqli_query($connect, $Qry);
          }

$Sql="SELECT * FROM `ngw_lot`  where warehouseid='$WhId' and plantid='$PlantId' and lotno='$LotNumber' and RecStatus='1'";

$Select=mysqli_query($connect, $Sql);
$Count=mysqli_num_rows($Select);
$LotId="";
if($Count>0){
  $FetchLotDet=mysqli_fetch_assoc($Select);
  $LotId=$FetchLotDet['lotid'];
}

$fetchsql="SELECT *  FROM `ngw_lot` where lotno='$LotNumber' and warehouseid='$WhId' and plantid='$PlantId' and RecStatus='1'";
$Select=mysqli_query($connect, $fetchsql);
$Count=mysqli_num_rows($Select);

        $TotalSqft=$Length*$Breadth*$Height;
      if($Count==0){ 
        $postData=array(
         "warehouseid"=>$WhId,
         "plantid"=>$PlantId,
         "locationid"=>$Storage_LocationId,
         "lotno"=>$LotNumber,
         "maxcapacity"=>$MaxCapacity,
         "totalcapacity"=>$TotalCapacity,
         "allowedtolerance"=>$AllowedTolerance,
         "length"=>$Length,
         "breadth"=>$Breadth,
         "height"=>$Height,
         "totalsqft"=>$TotalSqft,
         "sRow"=>$Row,
         "sColumn"=>$Column
        
       );

       //echo "hi -6";

       
      
       $model =  new MasterModel();
      if($LotId==""){
        $postData['InsBy']=$SessionUser;
        $res = $model->insertLot($postData);
      }else{
        $postData['ModBy']=$SessionUser;
        $res = $model->updateLot($LotId,$postData);
      }
      $Sql="Update `warehouse_master` set approval_status=6 where wh_code='".$warehouse."'";
      $Select=mysqli_query($connect, $Sql);
    }else{
      $ErrorMsg.=$LotNumber. " Lot Number Already Exist.";
    }
       

        }
      
       $i++;
       
     }
     fclose($file);
    }
   // exit();
   
    return  $this->respond(["success" => $res,"ErrorMsg"=>$ErrorMsg]);

  }

  /*** Get new Fumigation Status ***/
  public function getFumigationStatus()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getFumigationStatusList());
  }
  public function getFumigationTypeAgency()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getFumigationTypeAgency());
  }
  public function getDegassStatusList(){
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getDegassStatusList());
  }

  public function getMaster_ngw_contract_typeById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    if($postData!==null && isset($postData->id))
    {
    $res = $model->getngw_contract_type($postData->id);
    }
    else{
      // echo "TEST1";
      $res = $model->getcontract_typeDropDown();//FILL DROPDOWN
    }
    
    return  $this->sendSuccessResult($res);
  }

  public function updateMaster_ngw_contract_type(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      
    $postData = $this->request->getJSON();
    //var_dump($postData );
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'contracttypeid',$postData->id, 'ngw_contract_type', 'contracttype', $postData->Data->contracttype)=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updatengw_contract_type($postData->id,$postData->Data);
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertngw_contract_type($postData->Data);
  }
    }
   else{
     $res=-5; 
   }

   if($res=="-5")
   {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
   }

   return  $this->respond(["success" => $res]);
   }
  
   public function getMaster_ngw_reasondeviationById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->GetMaster_ngw_reasondeviation($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function updateMaster_ngw_reasondeviation(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      
    $postData = $this->request->getJSON();
    //var_dump($postData );
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'ReasonDeviationId',$postData->id, 'ngw_reason_for_deviation', 'ReasonDeviation', $postData->Data->ReasonDeviation)=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_reasondeviation($postData->id,$postData->Data);
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_ngw_reasondeviation($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   if($res=="-5")
   {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
   }   
   return  $this->respond(["success" => $res]);
   }



public function GetMaster_ngw_reasondelayById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->GetMaster_ngw_reasondelay($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function updateMaster_ngw_reasondelay(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      
    $postData = $this->request->getJSON();
    //var_dump($postData );
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'ReasonDelayId',$postData->id, 'ngw_reason_for_delay', 'ReasonDelayStatus', $postData->Data->ReasonDelayStatus)=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_reasondelay($postData->id,$postData->Data);
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_ngw_reasondelay($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   if($res=="-5")
   {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
   }
   return  $this->respond(["success" => $res]);
   }

public function GetMaster_ngw_fumigation_statusById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->GetMaster_ngw_fumigation_status($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function updateMaster_ngw_fumigation_status(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      
    $postData = $this->request->getJSON();
    //var_dump($postData );
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'Fumigation_StatusId',$postData->id, 'ngw_fumigation_status', 'Fumigation_Status', $postData->Data->Fumigation_Status)=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_fumigation_status($postData->id,$postData->Data);
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_ngw_fumigation_status($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   if($res=="-5")
   {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
   }
   return  $this->respond(["success" => $res]);
   }

public function getMaster_ngw_divisionById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->getMaster_ngw_divisionById($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function updateMaster_ngw_division(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      
    $postData = $this->request->getJSON();
    //var_dump($postData );
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'divisionid',$postData->id, 'ngw_division', 'divisionname', $postData->Data->divisionname)=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_division($postData->id,$postData->Data);
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_ngw_division($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   if($res=="-5")
   {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
   }
   return  $this->respond(["success" => $res]);
   }

  public function getMaster_ngw_fumigation_typeById(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $res = $model->getMaster_ngw_fumigation_typeById($postData->id);
    return  $this->sendSuccessResult($res);
  }
  public function updateMaster_ngw_fumigation_type(){
    $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      
    $postData = $this->request->getJSON();
    //var_dump($postData );
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'Fumigation_TypeId',$postData->id, 'ngw_fumigation_type', 'Fumigation_Type', $postData->Data->Fumigation_Type)=="0")
  {
  if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updateMaster_ngw_fumigation_type($postData->id,$postData->Data);
  }else{
    $postData->Data->InsBy=$SessionUser;
    $res = $model->insertMaster_ngw_fumigation_type($postData->Data);
  }
    }
   else{
     $res=-5; 
   }
   if($res=="-5")
   {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
   }
   return  $this->respond(["success" => $res]);
  }

   /**** Get Fumigation Entry list Screen 05-01-2022 ****/
   public function getFumigationEntryList(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
  //  $res = $model->getFumigationEntry($postData->id);
    $res = $model->getFumigationEntryData($postData->id);
    return  $this->sendSuccessResult($res);
  }

  /**** Get Warehouse Rental Screen 06-01-2022 ****/

  public function updateRentalVerification(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $postData->Data->verifieduserid=$SessionUser;
    $res = $model->udpateaRentalStatus($postData->id, $postData->Data);
    return  $this->respond(["success" => $res]);
  }

  /**** Bank Master on 07-01-2022 ****/
  public function getbankDetails(){
    $model = new MasterModel();
    $res = $model->getbankmasterlist();
    return  $this->sendSuccessResult($res);
  }

  public function getCompanyDetails(){
    $model = new MasterModel();
    $res = $model->getCompanyDetlist();
    return  $this->sendSuccessResult($res);
  }
  public function bagtype(){
    $model = new MasterModel();
    $res = $model->bagtype();
    return  $this->sendSuccessResult($res);
  }
  public function bagtype_new(){
    $model = new MasterModel();
    $res = $model->bagtype_new();
    return  $this->sendSuccessResult($res);
  }
  public function bagtype_noloosewheat(){
    $model = new MasterModel();
    $res = $model->bagtype_noloosewheat();
    return  $this->sendSuccessResult($res);
  }
  public function bagtype_noloosewheat_wheatweight(){
    $model = new MasterModel();
    $res = $model->bagtype_noloosewheat_wheatweight();
    return  $this->sendSuccessResult($res);
  }

  public function relottingvendor(){
    $model = new MasterModel();
    $res = $model->relottingvendor();
    return  $this->sendSuccessResult($res);
  }
  public function getVendor(){
    $model = new MasterModel();
    $res = $model->getVendor();
    return  $this->sendSuccessResult($res);
  }
  public function relottingreason(){
    $model = new MasterModel();
    $res = $model->relottingreason();
    return  $this->sendSuccessResult($res);
  }
  public function getLotInformation(){
    $model = new MasterModel();
    $postData = $this->request->getJSON();
    // echo $postData->lotid.",". $postData->WheatVarietyId."X"; 
    $res1 = $model->getLotInformation($postData->lotid, $postData->WheatVarietyId);

    $MatCode = $model->getMaterialCode($postData->WheatVarietyId);

    //return  $this->sendSuccessResult($res);
    return  $this->respond(["success" => 1,"Det"=>$res1,"MatCode"=>$MatCode]);
  }


  public function getWheatvarietyDet(){
    $model = new MasterModel();
    $postData = $this->request->getJSON();
    
    $res1 = $model->getWheatvarietyDet($postData->WarehouseId, $postData->storagelocationid,$postData->PlantId, $postData->LotId, $postData->WheatVarietyId);
    //return  $this->sendSuccessResult($res);
    return  $this->respond(["success" => 1,"Det"=>$res1]);
  }
  
  public function getMaterialCode(){
    $model = new MasterModel();
    $postData = $this->request->getJSON();
    // echo $postData->lotid.",". $postData->WheatVarietyId."X"; 
    

    $MatCode = $model->getMaterialCode($postData->WheatVarietyId);

    //return  $this->sendSuccessResult($res);
    return  $this->respond(["success" => 1,"MatCode"=>$MatCode]);
  }
  
  public function getLotDetails(){
    $model = new MasterModel();
    $postData = $this->request->getJSON();
    $res = $model->getLotDetails();
    return  $this->respond(["success" => 1,"Det"=>$res]);
  } 

  
  /*** YES Or No Values***/
  public function getCommonDetails(){
    $model = new MasterModel();
    $res = $model->getYESNODET();
    return  $this->sendSuccessResult($res);
  }

  /*** Save Quality Team ***/ 
  public function SaveWarehouseUpdate(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $CurrentDateTime=date("Y-m-d H:i:s");

    $WareHouseDet = $model->getMaster_new_warehouse($postData->id);
    $Current_approval_status=$WareHouseDet[0]['approval_status'];

    if($postData->screentype=="WHCOMMERCIAL")
    {
    $postData->Data->com_userid=$SessionUser;
    $postData->Data->com_dt=$CurrentDateTime;
    
    $postData->Data->approval_status='9';  //8 changed to 9 Because Commercial manager not required for commercial team, so it will directly move to approved  status
    }
    if($postData->screentype=="WHQC")
    {
    $postData->Data->qc_userid=$SessionUser;
    $postData->Data->qc_dt=$CurrentDateTime;
    if($Current_approval_status>=100){
      $postData->Data->approval_status='103';
    }else{
      $postData->Data->approval_status='3';
    }
    
    }
    if($postData->screentype=="WHQCMGR")
    {
    $postData->Data->qc_userid=$SessionUser;
    $postData->Data->qc_dt=$CurrentDateTime;
    if($Current_approval_status>=100){
      $postData->Data->approval_status='104';
    }else{
    $postData->Data->approval_status='4';
    }
    }
    

    $res = $model->updateMaster_new_warehouse($postData->id, $postData->Data);
    return  $this->respond(["success" => $res]);
  }

  public function SaveWarehouseApprove(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    $CurrentDateTime=date("Y-m-d H:i:s");
    $postData->Data->approveuserid=$SessionUser;

    
    $WareHouseDet = $model->getMaster_new_warehouse($postData->id);
    $Current_approval_status=$WareHouseDet[0]['approval_status'];
    //var_dump($Current_approval_status);
//exit();
    $postData->Data->approvedate=$CurrentDateTime;
    if($postData->approve==1 && $postData->formtype =="WMAPPROVAL")
    {  
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='102';
      }
      else{
      $postData->Data->approval_status='2';
      }
    }
    if($postData->approve==1 && $postData->formtype =="QCMGRAPPROVAL")
    { 
      if($Current_approval_status>=100){
        $postData->Data->approval_status='104';
      } 
      else{
        $postData->Data->approval_status='4';
      }
    }
    if($postData->approve==1 && $postData->formtype =="COMMMGRAPPROVAL")
    {  
     
        $postData->Data->approval_status='9';
     
      
    }
    if($postData->approve==1 && $postData->formtype =="LOTINFOGRAPPROVAL")
    {  
      if($Current_approval_status>=100){
      $postData->Data->approval_status='107';
      }else{
        $postData->Data->approval_status='7';
      }
    }
    


    else if($postData->approve==1 && $postData->formtype =="BHAPPROVAL")
    {  
      if($Current_approval_status>=100){
        $postData->Data->approval_status='105';
      }else{
        $postData->Data->approval_status='5';
      }
      
    }

    if(($postData->reject==1 || $postData->reject==-2) && $postData->formtype =="QCMGRAPPROVAL")//QC MANAGER REJECT
    {  
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='102';
      }
      else
      {
      $postData->Data->approval_status='-2';
      }
      $postData->Data->remarksqcmgr=$postData->Data->RejectReason;
    }
    else if($postData->reject==1 && $postData->formtype =="WMAPPROVAL")//REJECT
    {
      if($Current_approval_status>=100)
      {
      $postData->Data->approval_status='101';
      }else{
        $postData->Data->approval_status='-1';
      }
      $postData->Data->remarkswmmgr=$postData->Data->RejectReason;
    }
    else if($postData->reject==-1 && $postData->formtype =="BHAPPROVAL")//REJECT QC
    {
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='101';
      }else{
        $postData->Data->approval_status='-1';
      }
      $postData->Data->remarksbh=$postData->Data->RejectReason;
    }
    else if($postData->reject==-2 && $postData->formtype =="BHAPPROVAL")//REJECT QC
    {
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='102';
      }else{
        $postData->Data->approval_status='-2';
      }
      
      $postData->Data->remarksbh=$postData->Data->RejectReason;
    }

    else if($postData->reject==1 && $postData->formtype =="COMMMGRAPPROVAL")//REJECT
    {
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='101';
      }else{
      $postData->Data->approval_status='-1';

      }
    }
    else if($postData->reject==1 )
    {
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='101';
      }else{
      $postData->Data->approval_status='-1';
      }
    }

    if($postData->reject==1 && $postData->formtype =="LOTINFOGRAPPROVAL")//Reject
    {  
      if($Current_approval_status>=100)
      {
        $postData->Data->approval_status='105';
      }else{
      $postData->Data->approval_status='5';
      }
      $postData->Data->remarkswmmgrlot=$postData->Data->RejectReason;
    }
    
    $res = $model->updateWarehouseCreation($postData->id, $postData->Data);
    return  $this->respond(["success" => $res]);
  }
  public function updatewarehouse(){
    $postData = $this->request->getJSON();
    $model = new MasterModel();
    // print_r($postData);
    $res = $model->updateWarehouseCreation($postData->id, $postData->Data);
    return  $this->respond(["success" => $res]);
  }

  /*** get Dahsboard Details ***/
  
  public function getPlants() {
    
    $model = new MasterModel();
    $res = $model->getPlants();
    return  $this->sendSuccessResult($res);
  }
  public function getDashboardDetById(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $postData = $this->request->getJSON();
    $model = new MasterModel();
  //  $postData->Data->verifieduserid=$SessionUser;
    $res = $model->getDashboardDet($postData->id);
    return  $this->respond(["success" => $res]);
  }

  //Lijesh update 
  /*public function updateMaster_ngw_Relotreason(){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    
    $postData = $this->request->getJSON();
    
    $model = new MasterModel();
    if($this->CheckDuplicate($postData, 'Relotreasonid',$postData->id, 'ngw_relotreason', 'Relotreason', $postData->Data->Relotreason)=="0")
    {
    if($postData->id!=""){ 
    $postData->Data->ModBy=$SessionUser;
    $res = $model->updatengw_Relotreason($postData->id,$postData->Data);
    }else{
      
    $postData->Data->InsBy=$SessionUser;
    var_dump($model);exit();
    $res = $model->insertngw_Relotreason($postData->Data);
    }
    }
    else{
    $res=-5; 
    }
    
    if($res=="-5")
    {
    return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
    }
    return $this->respond(["success" => $res]);
    }*/

    public function updateMaster_ngw_Relotreason(){
      $session = session();
        $SessionUser=$_SESSION["USERID"];
        $SessionUserName=$_SESSION["FIRSTNAME"];
        
      $postData = $this->request->getJSON();
      //var_dump($postData );
      $model = new MasterModel();
      if($this->CheckDuplicate($postData, 'Relotreasonid',$postData->id, 'ngw_relotreason', 'Relotreason', $postData->Data->Relotreason)=="0")
   {
    if($postData->id!=""){ 
      $postData->Data->ModBy=$SessionUser;
      $res = $model->updatengw_Relotreason($postData->id,$postData->Data);

    }else{
      $postData->Data->InsBy=$SessionUser;
      $res = $model->insertngw_Relotreason($postData->Data);
    }
      }
     else{
       $res=-5; 
     }
     if($res=="-5")
     {
      return $this->respond(["success" => $res,"ErrorMsg"=>"Duplicate record.."]);
     }
     return  $this->respond(["success" => $res]);
     }
    
     
    public function getPlanMonth(){
      $month = strtotime(date('Y').'-'.date('m').'-'.date('j').' 0 months');
      $end = strtotime(date('Y').'-'.date('m').'-'.date('j').' + 4 months');
      $res=array();
      while($month < $end){
          $selected = (date('F', $month)==date('F'))? ' selected' :'';
          $res[] =  array("value"=>date('F-Y', $month),"label"=>date('F-Y', $month));
          $month = strtotime("+1 month", $month);
      }
      return  $this->sendSuccessResult($res);
    }

    /* ********************************************* */
    public function getLastMileTransportVendor(){
      $model = new MasterModel();
      $res = $model->getLastMileTransportVendor();
      return  $this->sendSuccessResult($res);
    }

    public function getLoadingVendor(){
      $model = new MasterModel();
      $res = $model->getLoadingVendor();
      return  $this->sendSuccessResult($res);
    }

    public function getReceivingBin(){
      $model = new MasterModel();
      $res = $model->getReceivingBin();
      return  $this->sendSuccessResult($res);
    }

    public function getBagCuttingCharges(){
      $postData = $this->request->getJSON();
      $model = new MasterModel();
      $res = $model->getBagCuttingCharges($postData->vendor_id);
      return  $this->sendSuccessResult($res);
    }

    public function getVendorwithCharges(){
      $model = new MasterModel();
      $res = $model->getVendorwithCharges();
      return  $this->sendSuccessResult($res);
    }

    public function getDeliveryBypass(){
      $model = new MasterModel();
      $postData = $this->request->getJSON();
      $res = $model->getDeliveryBypass($postData);
      return  $this->sendSuccessResult($res);
    }

    public function getVANumber(){
      $model = new MasterModel();
      $res = $model->getVANumber();
      return  $this->sendSuccessResult($res);
    }

    public function getSendingPlant(){
      $model = new MasterModel();
      $res = $model->getSendingPlant();
      return  $this->sendSuccessResult($res);
    }

    public function getReceivingPlant(){
      $model = new MasterModel();
      $res = $model->getReceivingPlant();
      return  $this->sendSuccessResult($res);
    }

    public function getVehicleNO(){
      $model = new MasterModel();
      $res = $model->getVehicleNO();
      return  $this->sendSuccessResult($res);
    }

    public function getUnloadingVendor(){
      $model = new MasterModel();
      $res = $model->getUnloadingVendor();
      return  $this->sendSuccessResult($res);
    }

    public function getSegmentId(){
      $postData = $this->request->getJSON();

      //var_dump($postData);exit();

      $model = new MasterModel();
      $res = $model->getSegmentId($postData->S1,$postData->S2,$postData->S3);
      return  $this->sendSuccessResult($res);
    }

    public function getPlanDetails(){
      $postData = $this->request->getJSON();
      
      //var_dump($postData); exit();

      $model = new MasterModel();
      $res = $model->getPlanDetails($postData->lot1->Lotid, $postData->lot1->Wheatid);
      return  $this->sendSuccessResult($res);
    }
    
  }
