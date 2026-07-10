<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
//var_dump($entityQCContent);exit();
$session = session();
$SessionUser=$_SESSION["USERID"];

if ($entityVAContent->formType == "SaveLotInformation") {
 
  echo SaveLotInformation($connect, $entityVAContent);
}else {
 
//echo keyLoanLedgerEntry($connect, $entityVAContent);
}

$connect->close();
function SaveLotInformation($connect, $record){
 //var_dump($record);exit();
global $SessionUser;
$CurrentTime=date("d-m-Y H:i:s")."\n";
$keytoexclude = ["formType"];
 
$fields = [];
 $values = [];
 $UpdateArray=[];

 for($i=0;$i<sizeof($record->ListData);$i++){
$Plant=$record->ListData[$i]->plantname;
$Storage_Location=$record->ListData[$i]->Storage_Location;

$Sql="SELECT wh_code FROM `warehouse_master` where wh_refid='".$record->ListData[$i]->WareHouse->value."'";
$Select=mysqli_query($connect, $Sql);
$FetchWH=mysqli_fetch_assoc($Select);
$WHCode=$FetchWH['wh_code'];
//$Plant.="-".$WHCode;
//$Storage_Location.="-".$WHCode;

$Sql="SELECT * FROM `master_plant` where upper(PLANT_NAME)=upper('$Plant') and WH_CODE = '$WHCode'";
$Select=mysqli_query($connect, $Sql);
$Count=mysqli_num_rows($Select);
if($Count==1){
  $FetchPlant=mysqli_fetch_assoc($Select);
  $PlantId=$FetchPlant['ID'];
}else{
$Qry="INSERT INTO `master_plant`( `PLANT_NAME`, `WH_CODE`, `OwnWB`, InsBy, InsDt)
 VALUES (
   '".$Plant."','".$WHCode."','0', '$SessionUser',Current_Timestamp)";
    mysqli_query($connect, $Qry);
    //$PlantId= $connect->insert_id;
    $PlantId = mysqli_insert_id($connect);
    $Qry="Update `master_plant` set WERKS='".$PlantId."' where Id = '$PlantId'";
    mysqli_query($connect, $Qry);
   
}

//Storage Location
$Sql="SELECT STORAGE_REFID FROM `master_storage` where upper(STORAGE_LOCATION)=upper('$Storage_Location') and plantid = '$PlantId'";
$Select=mysqli_query($connect, $Sql);
$Count=mysqli_num_rows($Select);
if($Count==1){
  $FetchPlant=mysqli_fetch_assoc($Select);
  $Storage_LocationId=$FetchPlant['STORAGE_REFID'];
}else{

$Qry="INSERT INTO `master_storage`( `STORAGE_LOCATION`, `plantid`, InsBy, InsDt)
 VALUES ('".$Storage_Location."','".$PlantId."','$SessionUser',Current_Timestamp)";
    mysqli_query($connect, $Qry);
    // $Storage_LocationId=$connect->insert_id;
    $Storage_LocationId = mysqli_insert_id($connect);
    $Qry="Update `master_storage` set LGORT='$Storage_LocationId' where STORAGE_REFID = '$Storage_LocationId'";
    // echo $Qry;
    mysqli_query($connect, $Qry);
   
}


  $sql = "INSERT INTO `ngw_lot`(`warehouseid`, `plantid`,`locationid`, `lotno`, `maxcapacity`, AllowedTolerance,
  `totalcapacity`,`length`,`breadth`,`height`,`totalsqft`,`sRow`,`sColumn`, InsBy, InsDt ) VALUES (
'".$record->ListData[$i]->WareHouse->value."',

'".$PlantId."',
'".$Storage_LocationId."',

'".$record->ListData[$i]->Lot_Number."',
'".$record->ListData[$i]->Max_Capacity."',
'".$record->ListData[$i]->AllowedTolerance."',
'".$record->ListData[$i]->Total_Capacity."',
'".$record->ListData[$i]->Length."',
'".$record->ListData[$i]->Breadth."',
'".$record->ListData[$i]->Height."',
'".$record->ListData[$i]->Total_sqft."',
'".$record->ListData[$i]->sRow."',
'".$record->ListData[$i]->sColumn."',
 '$SessionUser',Current_Timestamp
  )";
  //echo $sql;exit();
  mysqli_query($connect, $sql);

  $sql = "UPDATE warehouse_master SET  warehouselayout='".$record->warehouselayout."'  
  WHERE wh_refid='".$record->ListData[$i]->WareHouse->value."'";
 // echo $sql;exit();
 mysqli_query($connect, $sql);

 $sql = "UPDATE warehouse_master SET approval_status='6'  
 WHERE wh_refid='".$record->ListData[$i]->WareHouse->value."' and approval_status='5'";
// echo $sql;exit();
mysqli_query($connect, $sql);

$sql = "UPDATE warehouse_master SET approval_status='106'  
WHERE wh_refid='".$record->ListData[$i]->WareHouse->value."' and approval_status='105'";
// echo $sql;exit();
mysqli_query($connect, $sql);
}

 
 
//$last_id = $connect->insert_id;

  return json_encode(["success" => 1]);
}
function keyLoanLedgerEntryUpdate($connect, $record){
 
  for($i=0;$i<sizeof($record->KeyloanDatas);$i++){
 $sql = "UPDATE ngw_keyloan_pledge SET  Loan_No='".$record->KeyloanDatas[$i]->LoanNo."',
  Loan_Amount='".$record->KeyloanDatas[$i]->LoanAmount."',
  Loan_Rate_MT='".$record->KeyloanDatas[$i]->LoanRate."'
   WHERE SR_No='".$record->KeyloanDatas[$i]->SRNo->value."'";
  // echo $sql;exit();
  mysqli_query($connect, $sql);
  }
  return json_encode(["success" => 1]);
}
function keyLoanLedgerEntry($connect, $record)
{
  //Check Duplicate
  $sql = "SELECT * FROM `ngw_keyloan_pledge` where lotid='".$record->lotid."' 
  and warehouseid='".$record->warehouseid."' and plantid='".$record->plantid."' 
  and Wheat_Variety_Id='".$record->Wheat_Variety_Id."' and balance_qty>0";
$Select=mysqli_query($connect, $sql);
$Count=mysqli_num_rows($Select);
if($Count>0){
  return json_encode(["success" => 0]);
  exit();
}

$CurrentTime=date("d-m-Y H:i:s")."\n";
$fields = [];
 $values = [];
 $UpdateArray=[];
foreach ($record as $key => $value) {
 
    array_push($fields, $key);
    array_push($values, mysqli_real_escape_string($connect, trim($value)));
    array_push($UpdateArray,$key."='".mysqli_real_escape_string($connect, trim($value))."'");

 
}
$sql = "INSERT INTO ngw_keyloan_pledge (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
mysqli_query($connect, $sql);
$last_id = $connect->insert_id;

  return json_encode(["success" => 1]);

}

?>
