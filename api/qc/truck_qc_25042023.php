<?php

use function PHPUnit\Framework\isEmpty;

include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
include_once APIPATH."/helper/appHelper.php";
$entityQCContent = json_decode(file_get_contents("php://input"));
date_default_timezone_set("Asia/Calcutta");
if ($entityQCContent->formType === "PO") {
  echo fetchPODetailsById($connect, $entityQCContent);
} 
elseif ($entityQCContent->formType === "PO_IAS") {
  echo fetchPODetailsById_ias($connect, $entityQCContent);

} elseif ($entityQCContent->formType === "A") {
  echo addQCTestdetails($connect, $entityQCContent);

}
elseif ($entityQCContent->formType === "QCAFTERUNLOAD") {
  echo addQCAfterUnloadTestdetails($connect, $entityQCContent);
}
elseif ($entityQCContent->formType === "IASQC") {
  echo addIASQCTestdetails($connect, $entityQCContent);
}
else if($entityQCContent->formType ==="QCDEDUCTION"){
  echo QCDeduction($connect, $entityQCContent);
}
else if($entityQCContent->formType ==="QCDEDUCTION_APPROVAL"){
  echo QCDeduction_Approval($connect, $entityQCContent);
}

elseif ($entityQCContent->formType === "STM") {
  echo addSTMQCTestdetails($connect, $entityQCContent);
}
elseif ($entityQCContent->formType === "STMGATEOUT") {
  echo addSTMGateOutTestdetails($connect, $entityQCContent);
}

$connect->close();

function fetchPODetailsById_ias($connect, $record){
  $fields = " 'nir_foss' as qcdeviceType,WERKS,PI_REFID, ZPO_NUMBER,ZVA_NUMBER,PICK_SLIP_NO, TRUCK_NO, DRIVER_NO, IDNLF, SCREEN_TYPE, VEHICLE_TYPE,VECHICAL_STATUS";
  $fetchsql = "select " . $fields . " from purchase_info where PI_REFID ='" . $record->id . "' LIMIT 1";
  $poData = getResultAsObjectArray($connect, $fetchsql);
  $PICK_SLIP_NO=$poData[0]['PICK_SLIP_NO'];

  //Added on 25-9-2021 to fetch QC Automatically
  $VaNumber=$poData[0]['ZVA_NUMBER'];

  
  $wvcode = mysqli_real_escape_string($connect, trim($poData[0]['IDNLF']));

  //echo "wvcode : ", $wvcode , " : wvcode";

 //get Wheat Variety
 if($wvcode==""){
  //$Qry="SELECT WheatVariety, Segment FROM `intrastate_sap_to_pp`  where PickSlipNo='$PICK_SLIP_NO'";
  
  $Qry="SELECT a.WheatVariety, a.Segment 
        FROM `intrastate_sap_to_pp` a  
        JOIN `empty_vehicle_arrival` b ON b.PONumber = a.PONumber
        where a.PONumber = '$PICK_SLIP_NO' AND b.ZVA_NUMBER = '$VaNumber'";

  $FetchWheatVarity = getResultAsObjectArray($connect, $Qry);
 $wvcode=$FetchWheatVarity[0]['WheatVariety'];
 $poData[0]['IDNLF']=$wvcode;
 $poData[0]['WheatSegment']=$FetchWheatVarity[0]['Segment'];
 }

 

 
 $qt =  "NIR_YES = 'Yes'";
 $fields = "QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax";
 $fetchsql1 =
   "select " .
   $fields .
   ", '' as qvalue,'' as qlabel from master_quality_check_ias qc
   left join master_quality_preferred qp on qc.field_map = qp.fieldMap
   where IDNLF = '" .
   $wvcode .
   "' and " .
   $qt .
   " ORDER BY qp.FieldOrder";
  
 $qmResults = getResultAsObjectArray($connect, $fetchsql1);
 //echo $fetchsql1;
 //exit();
 

$Qry="SELECT * FROM `ias_qcdetails` where VANumber='$VaNumber'";
$QCDet = getResultAsObjectArray($connect, $Qry);

 $Qry="SELECT * FROM `quality_info`  where purchase_info_id='".$record->id."'";
$QCDet_QInfo= getResultAsObjectArray($connect, $Qry);
 //var_dump($qmResults);
 //exit();
if(sizeof($QCDet_QInfo)>0){
 
  for($i=0;$i<sizeof($qmResults);$i++){
  //  echo sizeof($QCDet_QInfo);exit();
    if($qmResults[$i]['FIELD_MAP']=="infestation_quality"){  
      $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['infestation_quality']; 
      $qmResults[$i]['qlabel']=$QCDet_QInfo[0]['infestation_quality'];
    }
    if($qmResults[$i]['FIELD_MAP']=="protein_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['protein_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="moisture_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['moisture_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="ash_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['ash_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="wet_gluten_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['wet_gluten_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="dry_gluten_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['dry_gluten_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="sv_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['sv_quality'];  }
    
    if($qmResults[$i]['FIELD_MAP']=="hl_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['hl_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="foreign_matter_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['foreign_matter_quality'];  }
  
    if($qmResults[$i]['FIELD_MAP']=="fungus_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['fungus_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="rain_damage_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['rain_damage_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="mixed_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['mixed_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="protein_type_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['protein_type_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="kernel_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['kernel_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="fn_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['fn_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="mm_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['mm_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="mudballs_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['mudballs_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="broken_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['broken_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="black_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['black_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="soft_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['soft_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="shriveled_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['shriveled_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="immature_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['immature_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="insect_damage_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['insect_damage_wheat_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="kernel_bunt_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['kernel_bunt_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="red_grain_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['red_grain_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="ofg_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['ofg_quality'];  }

   // if($qmResults[$i]['FIELD_MAP']=="Bad_smell"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['Bad_smell'];  }
    if($qmResults[$i]['FIELD_MAP']=="Bad_smell"){  
      $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['Bad_smell']; 
      $qmResults[$i]['qlabel']=$QCDet_QInfo[0]['Bad_smell'];
    }
    if($qmResults[$i]['FIELD_MAP']=="dust_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['dust_quality'];  }
    if($qmResults[$i]['FIELD_MAP']=="seive_size_quality"){  $qmResults[$i]['qvalue']=$QCDet_QInfo[0]['seive_size_quality'];  }
   
  
  
  }
}else{
  for($i=0;$i<sizeof($qmResults);$i++){
  
    if($qmResults[$i]['FIELD_MAP']=="infestation_quality"){  
      $qmResults[$i]['qvalue']=$QCDet[0]['Infestation']; 
      $qmResults[$i]['qlabel']=$QCDet[0]['Infestation'];
    }
    if($qmResults[$i]['FIELD_MAP']=="protein_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Protein'];  }
    if($qmResults[$i]['FIELD_MAP']=="moisture_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Moisture'];  }
    if($qmResults[$i]['FIELD_MAP']=="ash_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Ash'];  }
    if($qmResults[$i]['FIELD_MAP']=="wet_gluten_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Wetgludten'];  }
    if($qmResults[$i]['FIELD_MAP']=="dry_gluten_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Drygluten'];  }
    if($qmResults[$i]['FIELD_MAP']=="sv_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['SV'];  }
    
    if($qmResults[$i]['FIELD_MAP']=="hl_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['HL'];  }
    if($qmResults[$i]['FIELD_MAP']=="foreign_matter_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ForeignMatter'];  }
  
    if($qmResults[$i]['FIELD_MAP']=="fungus_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['fungus'];  }
    if($qmResults[$i]['FIELD_MAP']=="rain_damage_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['RainDamage'];  }
    if($qmResults[$i]['FIELD_MAP']=="mixed_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['MixedWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="protein_type_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ProteinType'];  }
    if($qmResults[$i]['FIELD_MAP']=="kernel_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['1000Kernel'];  }
    if($qmResults[$i]['FIELD_MAP']=="fn_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['FN'];  }
    if($qmResults[$i]['FIELD_MAP']=="mm_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['2_3_MM'];  }
    if($qmResults[$i]['FIELD_MAP']=="mudballs_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['MudBalls'];  }
    if($qmResults[$i]['FIELD_MAP']=="broken_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['BrokenWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="black_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['BlackWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="soft_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['SoftWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="shriveled_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ShriveledWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="immature_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ImmatureWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="insect_damage_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['InsertDamageWheat'];  }
    if($qmResults[$i]['FIELD_MAP']=="kernel_bunt_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['KernalBunt'];  }
    if($qmResults[$i]['FIELD_MAP']=="red_grain_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['RainGrain'];  }
    if($qmResults[$i]['FIELD_MAP']=="ofg_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['OFG'];  }
   
  
  
  }
}



//var_dump($QCDet);

//var_dump($qmResults);
$Qry="SELECT * FROM `ias_qcdetails` where VANumber='$VaNumber'";
$IASQCDetails = getResultAsObjectArray($connect, $Qry);

$Qry="SELECT ias_Moisture,ias_HL,ias_InsertDamageWheat,ias_Remarks FROM `quality_info` where purchase_info_id='".$record->id."'";

$IASQCUpdatedDetails = getResultAsObjectArray($connect, $Qry);


 return json_encode(["success" => 1,"IASQCUpdatedDetails"=>$IASQCUpdatedDetails, "results" => $poData,"qmResults"=>$qmResults,"IASQCDetails"=>$IASQCDetails]);
}
function fetchPODetailsById($connect, $record)
{
  $fields = " 'nir_foss' as qcdeviceType,WERKS,CONTAINER_NO,PI_REFID,PO_LINE_ITEM, ZPO_NUMBER,ZVA_NUMBER, TRUCK_NO, DRIVER_NO, IDNLF, SCREEN_TYPE, VEHICLE_TYPE,VECHICAL_STATUS,InvoiceQty,InvoiceRate,InvoiceCopy,WBCopy";
  $fetchsql = "select " . $fields . " from purchase_info where PI_REFID ='" . $record->id . "' LIMIT 1";
  $poData = getResultAsObjectArray($connect, $fetchsql);
  
  $ZPO_NUMBER=$poData[0]['ZPO_NUMBER'];
  $PO_LINE_ITEM=$poData[0]['PO_LINE_ITEM'];
  $TRUCK_NO=$poData[0]['TRUCK_NO'];
  $CONTAINER_NO=$poData[0]['CONTAINER_NO'];
  $WheatVariety=$poData[0]['IDNLF'];

 


  


     $Qry="SELECT ZSUPPLIER_INV_QTY,(ZSUPPLIER_INV_RATE*1000) as ZSUPPLIER_INV_RATE,INV_COPY,WB_COPY 
    FROM `supplier_vehical_info` where SUPPLIER_ID IN(SELECT  SD_REFID FROM `supplier_dispatch_info` 
  where ZPO_NUMBER='$ZPO_NUMBER' and ZPO_LINE_ITEM='$PO_LINE_ITEM') and 
  (VEHICAL_NO='$TRUCK_NO' OR VEHICAL_NO='$CONTAINER_NO')";
  $SupplierDispDetails = getResultAsObjectArray($connect, $Qry);

  $Qry="SELECT NETPR,PURCHASE_ORG_DESC,SGT_SCAT FROM `sap_to_pp` where EBELN='$ZPO_NUMBER' and EBELP='$PO_LINE_ITEM'";
  $SupplierSapDet = getResultAsObjectArray($connect, $Qry);

  $poData[0]['WheatSegment']=$SupplierSapDet[0]['SGT_SCAT'];

  
 
  //Added on 25-9-2021 to fetch QC Automatically
  $VaNumber=$poData[0]['ZVA_NUMBER'];
 $wvcode = mysqli_real_escape_string($connect, trim($poData[0]['IDNLF']));
 $qt =  "nir_foss = 'Yes'";
 $fields = "QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax";
 $fetchsql1 =
   "select " .
   $fields .
   ", '' as qvalue,'' as qlabel from master_quality_check qc
   left join master_quality_preferred qp on qc.field_map = qp.fieldMap
   where IDNLF = '" .
   $wvcode .
   "' and " .
   $qt .
   " ORDER BY qp.FieldOrder";
  
 $qmResults = getResultAsObjectArray($connect, $fetchsql1);
 

$Qry="SELECT * FROM `stm_silotomillqcdet` where VANumber='$VaNumber'";
//echo $Qry;
//exit();
 $QCDet = getResultAsObjectArray($connect, $Qry);

//var_dump($QCDet);
for($i=0;$i<sizeof($qmResults);$i++){
  
  if($qmResults[$i]['FIELD_MAP']=="infestation_quality"){  
    $qmResults[$i]['qvalue']=$QCDet[0]['Infestation']; 
    $qmResults[$i]['qlabel']=$QCDet[0]['Infestation'];
  }
  if($qmResults[$i]['FIELD_MAP']=="fungus_quality"){  
    $qmResults[$i]['qvalue']=$QCDet[0]['fungus']; 
    $qmResults[$i]['qlabel']=$QCDet[0]['fungus'];
  }

  if($qmResults[$i]['FIELD_MAP']=="rain_damage_quality"){  
    $qmResults[$i]['qvalue']=$QCDet[0]['RainDamage']; 
    $qmResults[$i]['qlabel']=$QCDet[0]['RainDamage'];
  }

  if($qmResults[$i]['FIELD_MAP']=="mixed_wheat_quality"){  
    $qmResults[$i]['qvalue']=$QCDet[0]['MixedWheat']; 
    $qmResults[$i]['qlabel']=$QCDet[0]['MixedWheat'];
  }

  if($qmResults[$i]['FIELD_MAP']=="protein_type_quality"){  
    $qmResults[$i]['qvalue']=$QCDet[0]['ProteinType']; 
    $qmResults[$i]['qlabel']=$QCDet[0]['ProteinType'];
  }
  if($qmResults[$i]['FIELD_MAP']=="fn_quality"){  
    $qmResults[$i]['qvalue']=$QCDet[0]['FN']; 
    $qmResults[$i]['qlabel']=$QCDet[0]['FN'];
  }


  if($qmResults[$i]['FIELD_MAP']=="protein_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Protein'];  }
  if($qmResults[$i]['FIELD_MAP']=="moisture_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Moisture'];  }
  if($qmResults[$i]['FIELD_MAP']=="ash_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Ash'];  }
  if($qmResults[$i]['FIELD_MAP']=="wet_gluten_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Wetgluten'];  }
  if($qmResults[$i]['FIELD_MAP']=="dry_gluten_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['Drygluten'];  }
  if($qmResults[$i]['FIELD_MAP']=="sv_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['SV'];  }
  
  if($qmResults[$i]['FIELD_MAP']=="hl_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['HLWeight'];  }
  if($qmResults[$i]['FIELD_MAP']=="foreign_matter_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ForeignMatter'];  }

  if($qmResults[$i]['FIELD_MAP']=="fungus_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['fungus'];  }
  if($qmResults[$i]['FIELD_MAP']=="rain_damage_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['RainDamage'];  }
  if($qmResults[$i]['FIELD_MAP']=="mixed_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['MixedWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="protein_type_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ProteinType'];  }
  if($qmResults[$i]['FIELD_MAP']=="kernel_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['1000Kernel'];  }
  if($qmResults[$i]['FIELD_MAP']=="fn_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['FN'];  }
  if($qmResults[$i]['FIELD_MAP']=="mm_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['2_3_MM'];  }
  if($qmResults[$i]['FIELD_MAP']=="mudballs_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['MudBalls'];  }
  if($qmResults[$i]['FIELD_MAP']=="broken_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['BrokenWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="black_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['BlackWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="soft_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['SoftWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="shriveled_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ShriveledWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="immature_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['ImmatureWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="insect_damage_wheat_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['InsectDamageWheat'];  }
  if($qmResults[$i]['FIELD_MAP']=="kernel_bunt_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['KernalBunt'];  }
  if($qmResults[$i]['FIELD_MAP']=="red_grain_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['RainGrain'];  }
  if($qmResults[$i]['FIELD_MAP']=="ofg_quality"){  $qmResults[$i]['qvalue']=$QCDet[0]['OFG'];  }
 


}
//var_dump($qmResults);
  return json_encode(["success" => 1,"SupplierSapDet"=>$SupplierSapDet, "SupplierDispDetails"=>$SupplierDispDetails,"results" => $poData,"qmResults"=>$qmResults]);
}

function addSTMGateOutTestdetails($connect, $record)
{
  //var_dump($record);exit();
  $statusN = trim($record->status);
   

  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");
  $usql =
    "UPDATE silotomill_dispatch_info SET 
    `FirstWeight`='".$record->FirstWeight."',Ewaybillcopy='".$record->Ewaybillcopy."',`SecondWeight`='".$record->SecondWeight."',
    `NetWeight`='".$record->NetWeight."'
     WHERE VehicleArrivalId  = " .$record->ID;
    mysqli_query($connect, $usql);

   $usql =
    "UPDATE empty_vehicle_arrival SET VEHICLE_STATUS =" .
    $statusN .
    ",GateOutDt='$CurrentDateTime',GateOutByName='$SessionUserName',GateOutBy='$SessionUser' WHERE ID  = " .$record->ID;
  
  //echo $usql;
  if (mysqli_query($connect, $usql) == true) {
    
    return json_encode(["success" => 1]);
  }
  return json_encode(["success" => 1]);
}
function addSTMQCTestdetails($connect, $record)
{

  // var_dump($record);
 $keytoexclude = ["ID","status","formType", "VEHICLE_TYPE","VECHICAL_STATUS"];
 $fields = [];
 $values = [];
 $UpdateArray=[];
 foreach ($record as $key => $value) {
   if (!in_array($key, $keytoexclude)) {
     array_push($fields, $key);
     array_push($values, mysqli_real_escape_string($connect, trim($value)));
     array_push($UpdateArray,$key."='".mysqli_real_escape_string($connect, trim($value))."'");
   }
   if($key=="ID"){

    array_push($fields, "STM_VehicleArrivalId");
    array_push($values, mysqli_real_escape_string($connect, trim($value)));
   }
 }

 $Qry="SELECT QI_REFID FROM `quality_info` WHERE STM_VehicleArrivalId='$record->ID'";
 $selectQI=mysqli_query($connect,$Qry);
 $FetcchQI=mysqli_fetch_assoc($selectQI);
 if($FetcchQI['QI_REFID']!=""){
   $sql = "UPDATE quality_info SET  " . join(", ", $UpdateArray) . " WHERE QI_REFID='".$FetcchQI['QI_REFID']."'";
   mysqli_query($connect, $sql);
   $last_id = mysqli_affected_rows($connect);
 }else{
 
   $sql = "INSERT INTO quality_info (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
   mysqli_query($connect, $sql);
   $last_id = $connect->insert_id;
 }
/*
 $sql = "INSERT INTO quality_info (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";

 mysqli_query($connect, $sql);*/

  $statusN = trim($record->status);
   

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
  
    if($statusN==13){
    //  $CurrentDateTime=NULL;
     // $SessionUser=0;
     $usql =
      "UPDATE empty_vehicle_arrival SET stm_QCRemarks='".$record->Remarks."',VEHICLE_STATUS =" .
      $statusN .
      " WHERE ID  = " .$record->ID;
    }else{

      $isOwnWB=CheckisOwnWBFromEMPTYVA($connect,$record->ID);
//echo "isOwnWB:".$isOwnWB."<br>";
//echo "status:".$statusN."<br>";
  if($isOwnWB==1 && $statusN==5){
      $statusN=24;
  }

      $usql =
      "UPDATE empty_vehicle_arrival SET stm_QCRemarks='".$record->Remarks."',VEHICLE_STATUS =" .
      $statusN .
      ",stm_QCDt='$CurrentDateTime',stm_QCByName='$SessionUserName',stm_QCBy='$SessionUser' WHERE ID  = " .$record->ID;
    }


   //echo $usql;
    //exit();
    if (mysqli_query($connect, $usql) == true) {
      
      return json_encode(["success" => 1]);
    }
    return json_encode(["success" => 1]);
  
}
function addIASQCTestdetails($connect, $record){
 
 $keytoexclude = ["formType", "VEHICLE_TYPE","VECHICAL_STATUS"];
 $fields = [];
 $values = [];
 foreach ($record as $key => $value) {
   if (!in_array($key, $keytoexclude)) {
     array_push($fields, $key);
     array_push($values, mysqli_real_escape_string($connect, trim($value)));
   }
 }
 $sql = "INSERT INTO quality_info (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
 //echo $sql;
 //exit();
 mysqli_query($connect, $sql);
 $last_id = $connect->insert_id;
 if ($last_id) {
   $deviceType = mysqli_real_escape_string($connect, trim($record->deviceType));
   $overallResult = trim($record->overall_result);
   $zQty = "";
   $statusN = "3";
   $VEHICLE_TYPE = trim($record->VEHICLE_TYPE);
   if ($overallResult !== "AD") {
     $statusN = $VEHICLE_TYPE === "Rake" ? "0" : "4";
     if ($overallResult === "R") {
       $zQty = ",ZQTY = 0";
       $statusN = "5";
     }
   }
$QCDateField="QualityCheckSubmitDt";
$QCByField="QualityCheckSubmitBy";
$QCByName="QualityCheckSubmitByName";
  

   $session = session();
   $SessionUser=$_SESSION["USERID"];
   $SessionUserName=$_SESSION["FIRSTNAME"];
   $CurrentDateTime=date("Y-m-d H:i:s");

   $usql =
     "UPDATE purchase_info SET VECHICAL_STATUS =" .
     $statusN .
     ",".$QCDateField."='$CurrentDateTime',$QCByName='$SessionUserName',".$QCByField."='$SessionUser' WHERE PI_REFID = " .
     $record->purchase_info_id;
 //  echo $usql;
  // exit();
   if (mysqli_query($connect, $usql) == true) {
     if ($VEHICLE_TYPE === "Rake") {
       updateRackQC($connect, $record->purchase_info_id);
     }
     return json_encode(["success" => 1]);
   }
   return json_encode(["success" => 1]);
 } else {
   return json_encode(["success" => 0]);
 } 
}
function QCDeduction_Approval($connect, $record){
 
  $QCTotalDeductionApprovalAmount=$record->TotalDeduction;
  $purchase_info_id=$record->purchase_info_id;
  $statusN=$record->VECHICAL_STATUS;
  $QCDeductionRemark=$record->QCDeductionRemark;
 
/*  $sql = "Update quality_info_afterunload set QCTotalDeductionApprovalAmount='$QCTotalDeductionApprovalAmount' 
  where purchase_info_id='$purchase_info_id'";
  mysqli_query($connect, $sql);
*/
  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");
  $Qry="UPDATE `quality_info_afterunload` SET `QCDeductionRemark`='$QCDeductionRemark' WHERE `purchase_info_id`='$purchase_info_id'";
  $Res= mysqli_query($connect, $Qry);
  //exit();
if($statusN==4){

  
  $usql =
  "UPDATE purchase_info SET VECHICAL_STATUS ='".$statusN."',QA_STATUS='A',QualityDeductionApproveDt='$CurrentDateTime',QualityDeductionApproveByName='$SessionUserName',
  QualityDeductionApproveBy='$SessionUser' WHERE PI_REFID = " . $purchase_info_id;
 $Res= mysqli_query($connect, $usql);
}else{


  $usql =
  "UPDATE purchase_info SET VECHICAL_STATUS ='".$statusN."',QA_STATUS='R',QualityDeductionRejectDt='$CurrentDateTime',QualityDeductionRejectByName='$SessionUserName',
  QualityDeductionRejectBy='$SessionUser' WHERE PI_REFID = " . $purchase_info_id;
 $Res= mysqli_query($connect, $usql);
}
  
if($Res){
  return json_encode(["success" => 1]);
}else{
  return json_encode(["success" => 0]);
}
   

}
function QCDeduction($connect, $record){
 //var_dump($record);
 //exit();
  $QCTotalDeductionApprovalAmount=$record->TotalDeduction;
  $purchase_info_id=$record->purchase_info_id;
  $statusN=$record->VECHICAL_STATUS;
  $QCDeductionDocument=$record->qc_deduction_doc;

  $InvoiceRate=$record->InvoiceRate;
  $InvoiceQty=$record->InvoiceQty;
  $RateDifference=$record->RateDifference;
  $RateDifferenceDeduction=$record->RateDifferenceDeduction;

  $sql = "Update quality_info_afterunload set RateDifference='$RateDifference',RateDifferenceDeduction='$RateDifferenceDeduction',
  InvoiceQty='$InvoiceQty',InvoiceRate='$InvoiceRate',QCDeductionDocument='$QCDeductionDocument',
  QCTotalDeductionApprovalAmount='$QCTotalDeductionApprovalAmount' 
  where purchase_info_id='$purchase_info_id'";
  mysqli_query($connect, $sql);

  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");

  $usql =
    "UPDATE purchase_info SET InvoiceQty='$InvoiceQty',InvoiceRate='$InvoiceRate',VECHICAL_STATUS ='".$statusN."',QualityDeductionSubmitDt='$CurrentDateTime',QualityDeductionSubmitByName='$SessionUserName',
    QualityDeductionSubmitBy='$SessionUser' WHERE PI_REFID = " . $purchase_info_id;
   $Res= mysqli_query($connect, $usql);
if($Res){
  return json_encode(["success" => 1]);
}else{
  return json_encode(["success" => 0]);
}
   

}
function addQCAfterUnloadTestdetails($connect, $record){
 
//var_dump($record);exit();
$keytoexclude = ["formType", "deviceType", "VEHICLE_TYPE","PO_NUMBER","VECHICAL_STATUS"];
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


$Qry="SELECT QI_REFID FROM `quality_info_afterunload` WHERE purchase_info_id='$record->purchase_info_id'";
$selectQI=mysqli_query($connect,$Qry);
$FetcchQI=mysqli_fetch_assoc($selectQI);
if($FetcchQI['QI_REFID']!=""){
  $sql = "UPDATE quality_info_afterunload SET  " . join(", ", $UpdateArray) . " WHERE QI_REFID='".$FetcchQI['QI_REFID']."'";
  $Update=mysqli_query($connect, $sql);
   
  
}else{
  $sql = "INSERT INTO quality_info_afterunload (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
  mysqli_query($connect, $sql);
  $last_id = $connect->insert_id;
}
//echo $sql;exit();

//echo "Update:".$Update;
if ($last_id || $Update) {
  
  $deviceType = mysqli_real_escape_string($connect, trim($record->deviceType));
  $overallResult = trim($record->overall_result);
  $zQty = "";
  
 if($record->TotalDeduction>0){
  $statusN = "3";
  $overallResult="AD";
 }else{
  $statusN = "4";
  $overallResult="A";
 }
  $VEHICLE_TYPE = trim($record->VEHICLE_TYPE);
 

  $QCDateField="AfterUnloadQCDt";
  $QCByField="AfterUnloadQCBy";
  $QCByNameField="AfterUnloadQCByName";

  $session = session();
  $SessionUser=$_SESSION["USERID"];
  $SessionUserName=$_SESSION["FIRSTNAME"];
  $CurrentDateTime=date("Y-m-d H:i:s");

  $usql =
    "UPDATE purchase_info SET InvoiceQty='".$record->InvoiceQty."',InvoiceRate='".$record->InvoiceRate."',VECHICAL_STATUS =" .
    $statusN .
    ",".$QCDateField."='$CurrentDateTime',$QCByNameField='$SessionUserName',".$QCByField."='$SessionUser', QA_STATUS= '" .
    $overallResult .
    "' WHERE PI_REFID = " .
    $record->purchase_info_id;
 // echo $usql;exit();
  if (mysqli_query($connect, $usql) == true) {
    if ($VEHICLE_TYPE === "Rake") {
      updateRackQC($connect, $record->purchase_info_id);
    }
    return json_encode(["success" => 1]);
  }
  return json_encode(["success" => 1]);
} else {
  return json_encode(["success" => 0]);
}
}

function addQCTestdetails($connect, $record)
{

  // var_dump($record);exit();

  $keytoexclude = ["formType","SCREEN_TYPE", "deviceType", "VEHICLE_TYPE","PO_NUMBER","VECHICAL_STATUS","ZSUPPLIER_INV_QTY","ZSUPPLIER_INV_RATE","InvoiceCpy","WBCpy"];
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
  
  // var_dump($UpdateArray);

$Qry="SELECT QI_REFID FROM `quality_info` WHERE purchase_info_id='$record->purchase_info_id'";
$selectQI=mysqli_query($connect,$Qry);
$FetcchQI=mysqli_fetch_assoc($selectQI);
if($FetcchQI['QI_REFID']!=""){
  
  $sql = "UPDATE quality_info SET  " . join(", ", $UpdateArray) . ", DateModified = current_timestamp WHERE QI_REFID='".$FetcchQI['QI_REFID']."'";
  mysqli_query($connect, $sql);
  $last_id = mysqli_affected_rows($connect);
  // echo $sql;
}else{
  
  $sql = "INSERT INTO quality_info (" . join(", ", $fields) . ") VALUES ( '" . join("','", $values) . "')";
  mysqli_query($connect, $sql);
  $last_id = $connect->insert_id;
}

//echo mysqli_error($connect)."-OK";

// echo mysqli_affected_rows($connect);exit();
// echo "last_id :",$last_id; //exit();
 
  if ($last_id>0) {
    $deviceType = mysqli_real_escape_string($connect, trim($record->deviceType));
    $overallResult = trim($record->overall_result);
    $zQty = "";
    $statusN = "21";
    $VEHICLE_TYPE = trim($record->VEHICLE_TYPE);

    //echo "overallResult :" , $overallResult;

    if ($overallResult !== "AD") {
      $statusN = $VEHICLE_TYPE === "RAKE" ? "0" : "4"; 
      if($record->SCREEN_TYPE=="SDI" || $record->SCREEN_TYPE=="SDO"){
          $statusN="21";
      }
      if ($overallResult === "R") {
        $zQty = ",ZQTY = 0";
        $statusN = "5";
      }
      // 26-08-2022 Arul # After the RAKE QC The Vehicle Status Should be Update to => "0"
      if($VEHICLE_TYPE ==="RAKE" && $record->VECHICAL_STATUS==2){$statusN = "0";} 
    }

    $QCDateField="QualityCheckSubmitDt";
    $QCByField="QualityCheckSubmitBy";
    $QCByFieldName="QualityCheckSubmitByName";
    if($record->VECHICAL_STATUS==21){
      if ($overallResult !== "AD") {
        $statusN = $VEHICLE_TYPE === "Rake" ? "0" : "5";
        if ($overallResult === "R") {
          $zQty = ",ZQTY = 0";
          $statusN = "5";
        }
      }
      $QCDateField="AfterUnloadQCDt";
      $QCByField="AfterUnloadQCBy";
      $QCByFieldName="AfterUnloadQCByName";
    }

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $InvRate=$record->ZSUPPLIER_INV_RATE;
    if($record->SCREEN_TYPE=="SDO"){
      $InvRate=$InvRate*1000;
    }


    if (empty($record->ZSUPPLIER_INV_QTY)){ // if Invoice Qty is EMPTY then Invoice Qty Set to ZERO (0)
      $Invoice_Qty = 0;
    }else{
      $Invoice_Qty = $record->ZSUPPLIER_INV_QTY;
    }

    if(empty($InvRate)){ // if Invoice Rate is EMPTY then Invoice RATE Set to ZERO (0)
      $InvRate = 0;
    }

    $usql ="UPDATE purchase_info SET 
            InvoiceQty='".$Invoice_Qty."',
            InvoiceRate='".$InvRate."',
            InvoiceCopy='".$record->InvoiceCpy."',
            WBCopy='".$record->WBCpy."',
            VECHICAL_STATUS =".$statusN .",".
            $QCDateField."='$CurrentDateTime',
            $QCByFieldName='$SessionUserName',".
            $QCByField."='$SessionUser',
            DEVICE_TYPE ='".$deviceType ."'".$zQty .", QA_STATUS= '".$overallResult."' WHERE PI_REFID = ".$record->purchase_info_id;
   
      // echo $usql; exit();
   
      if (mysqli_query($connect, $usql) == true) {
      if ($VEHICLE_TYPE === "Rake") {
        updateRackQC($connect, $record->purchase_info_id);
      }
      return json_encode(["success" => 1]);
    }
    return json_encode(["success" => 1]);
  } else {
    return json_encode(["success" => 0]);
  }
}

function updateRackQC($connect, $id)
{
  $fetchsql4 = "SELECT ZPO_NUMBER, ZSUPPLIER_CODE, PO_LINE_ITEM from purchase_info WHERE PI_REFID = '".$id."'";
  $PIResult = mysqli_query($connect, $fetchsql4);

  $PIRecord = $PIResult->fetch_assoc();
  $supsql = "UPDATE supplier_dispatch_info SET QA_APPROVER_STATUS = 'A' where ZPO_NUMBER = '".$PIRecord['ZPO_NUMBER']."' AND ZSUPPLIER_CODE = '".$PIRecord['ZSUPPLIER_CODE']."' AND ZPO_LINE_ITEM = '".$PIRecord['PO_LINE_ITEM']."'";  
  mysqli_query($connect, $supsql);
}
