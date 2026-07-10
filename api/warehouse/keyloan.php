<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
//var_dump($entityQCContent);exit();

if ($entityVAContent->formType == "keyloanUpdate") {
  echo keyLoanLedgerEntryUpdate($connect, $entityVAContent);
}else if ($entityVAContent->formType == "keyloanDORelease") {
  echo keyLoanLedgerDORelease($connect, $entityVAContent);
}else if ($entityVAContent->formType == "getKeyLoanReportDet") {
  echo keyLoanLedgerDORelease($connect, $entityVAContent);
}else{
  
echo keyLoanLedgerEntry($connect, $entityVAContent);
}
$connect->close();
/*================Connection END====================*/


function keyLoanLedgerDORelease($connect, $record){
  
  $CurrentTime=date("d-m-Y H:i:s")."\n";
  $keytoexclude = ["formType"];
  
  $fields = [];
  $values = [];
  $UpdateArray=[];
  foreach ($record as $key => $value) {
    if (!in_array($key, $keytoexclude)) {
      array_push($fields, $key);
      array_push($values, mysqli_real_escape_string($connect, trim($value)));
      array_push($UpdateArray,$key."='".mysqli_real_escape_string($connect, trim($value))."'");
    }
  }

  $sql = "INSERT INTO ngw_keyloan_do_release (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
  //echo $sql;exit();
  mysqli_query($connect, $sql);
  $last_id = $connect->insert_id;

  $sql = "UPDATE `ngw_keyloan_pledge` 
          SET `release_qty` = `release_qty` + '".$record->release_qty."',
              `balance_qty` = `balance_qty` - '".$record->balance_qty."',
              `LastKeyloan_Pledge_Release_Id`='$last_id' 
          WHERE `warehouseid`=(SELECT wh_refid FROM warehouse_master WHERE wh_code='".$record->warehouseid."') and `plantid`='".$record->plantid."' 
              and `Wheat_Variety_Id`='".$record->wheat_variety_id."' and `lotid`='".$record->lotid."'";
  //echo $sql;exit();
  mysqli_query($connect, $sql);
  
  if ($record->balance_qty == 0){
    $sql = "UPDATE `ngw_sublot` SET Keyloan_Pledge_Status = 'NO', Keyloan_Release_Qty = '0'
          WHERE lotid ='".$record->lotid."' and warehouseid =(SELECT wh_refid FROM warehouse_master WHERE wh_code='".$record->warehouseid."')  
          and plantid ='".$record->plantid."' and wheatvarietyid ='".$record->wheat_variety_id."'";
  }else{
    $sql = "UPDATE `ngw_sublot` 
          SET Keyloan_Release_Qty = Keyloan_Release_Qty +'".$record->release_qty."'
          WHERE lotid ='".$record->lotid."' and warehouseid =(SELECT wh_refid FROM warehouse_master WHERE wh_code='".$record->warehouseid."')  
          and plantid ='".$record->plantid."' and wheatvarietyid ='".$record->wheat_variety_id."'";
  }
  //echo $sql;exit();
  $Select=mysqli_query($connect, $sql);

  return json_encode(["success" => 1]);
}


function keyLoanLedgerEntryUpdate($connect, $record){
  for($i=0;$i<sizeof($record->KeyloanDatas);$i++){
  $sql = "UPDATE ngw_keyloan_pledge 
          SET Loan_No='".$record->KeyloanDatas[$i]->LoanNo."',
              Loan_Amount='".$record->KeyloanDatas[$i]->LoanAmount."',
              Loan_Rate_MT='".$record->KeyloanDatas[$i]->LoanRate."'
          WHERE SR_No ='".$record->KeyloanDatas[$i]->SRNo->value."'";

          /* Data Truncate Issue in 49 & 11
          Pledge_Value='".$record->KeyloanDatas[$i]->SR_90_Percent_Value."'
          */
  //echo $sql;exit();
  mysqli_query($connect, $sql);
  }
  return json_encode(["success" => 1]);
}

function keyLoanLedgerEntry($connect, $KeyLoanList){
  //28072022 Parameter $record changed to $KeyLoanList only for the function keyLoanLedgerEntry When Keyloan add
  $KeyLoanList1=(array)$KeyLoanList;

  //  //UPdate WAREHOUSE ID
  //  $wh_id_Sql = "SELECT wh_refid FROM warehouse_master WHERE wh_code='".$KeyLoanList1['warehouseid']."'";
  //  $Select=mysqli_query($connect, $wh_id_Sql);
  //  $Count=mysqli_num_rows($Select);
  //  if($Count>0){
  //    $Fetch_WH_ID=mysqli_fetch_assoc($Select);
  //    $KeyLoanList1['warehouseid']=$Fetch_WH_ID['wh_refid'];
  //    $Wh_Id = $Fetch_WH_ID['wh_refid'];
  //  }
 




  //Check Duplicate
  $sql = "SELECT * FROM `ngw_keyloan_pledge` where lotid='".$KeyLoanList1['lotid']."' 
  and warehouseid=(SELECT wh_refid FROM warehouse_master WHERE wh_code='".$KeyLoanList1['warehouseid']."') and plantid='".$KeyLoanList1['plantid']."' 
  and Wheat_Variety_Id='".$KeyLoanList1['Wheat_Variety_Id']."' and balance_qty > 0";
  $Select=mysqli_query($connect, $sql);
  $Count=mysqli_num_rows($Select);
  if($Count>0){
    return json_encode(["success" => 0]);
    exit();
  }
// var_dump($KeyLoanList);
  //Mohan Added 28072022 for SR_NO sequence save 
  $TmpSR_No = $KeyLoanList1['SR_No'];
  $sql = "SELECT SR_No FROM `ngw_keyloan_pledge` where SR_No like '".$TmpSR_No."%' order by Keyloan_Pledge_Id desc limit 1";
  //var_dump($sql);exit();
  $SelectTmp=mysqli_query($connect, $sql);
  $Count1=mysqli_num_rows($SelectTmp);
  
  if($Count1>0){
    $FetchKeyLoan=mysqli_fetch_assoc($SelectTmp);
    $TmpSR_No=$FetchKeyLoan['SR_No'];
    $TmpSR_No++;
    $KeyLoanList1['SR_No']=$TmpSR_No;
    //echo $TmpSR_No. " " .$KeyLoanList->SR_No;
  }
  else{
      
    $TmpSR_No = $KeyLoanList1['SR_No'];
    $KeyLoanList1['SR_No']=$TmpSR_No.'_1';
    //var_dump($KeyLoanList);
    //echo $TmpSR_No;
    //exit();
  }
  
  //var_dump($KeyLoanList1);exit();
  //echo  $KeyLoanList->SR_No;exit();
  //End Mohan Added 28072022 for SR_NO sequence save 

  $CurrentTime=date("Y-m-d");
  $fields = [];
  $values = [];
  $UpdateArray=[];
  
  foreach ($KeyLoanList1 as $key => $value) {
    
    array_push($fields, $key);
    array_push($values, mysqli_real_escape_string($connect, trim($value)));
    array_push($UpdateArray,$key."='".mysqli_real_escape_string($connect, trim($value))."'"); 
  }
  //echo "END";
//exit();
  $sql = "INSERT INTO ngw_keyloan_pledge (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
  // echo $sql;
  mysqli_query($connect, $sql);
  $last_id = $connect->insert_id;

  $sql = "UPDATE `ngw_sublot` 
          SET Keyloan_Release_Qty = 0, 
              Keyloan_Pledge_Date ='".$CurrentTime."',
              Last_Keyloan_Pledge_Id ='".$last_id."', 
              Keyloan_Pledge_Status = 'YES' 
          WHERE  lotid ='".$KeyLoanList->lotid."' 
              AND warehouseid =(SELECT wh_refid FROM warehouse_master WHERE wh_code='".$KeyLoanList->warehouseid."') 
              And plantid ='".$KeyLoanList->plantid."' 
              AND wheatvarietyid ='".$KeyLoanList->Wheat_Variety_Id."' ";
  //echo $sql;exit();
  $Select=mysqli_query($connect, $sql);

  return json_encode(["success" => 1]);
}

?>
