<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
$entityQAContent = json_decode(file_get_contents("php://input"));
date_default_timezone_set("Asia/Calcutta");
if ($entityQAContent->formType === "PO") {
  echo fetchPODetailsById($connect, $entityQAContent);
}
elseif ($entityQAContent->formType === "QADeduction") {
  echo fetchQADetailsById($connect, $entityQAContent);
}
elseif ($entityQAContent->formType === "A") {
  echo updateQCApproval($connect, $entityQAContent);
} 

$connect->close();
function fetchQADetailsById($connect, $record)
{
  try {
    //for Onchange Invoice Qty and Rate
    $InvoiceQty="";
    $InvoiceRate="";
    $OnchangeVal=0;
   // var_dump($record);
    if(isset($record->OnchangeVal)){
      if($record->OnchangeVal==1){
        $OnchangeVal=$record->OnchangeVal;
        $InvoiceQty=$record->InvoiceQty;
        $InvoiceRate=$record->InvoiceRate;

      }
    }
    //for Onchange Invoice Qty and Rate

    $fields = "PI_REFID,PO_LINE_ITEM, InvoiceQty,InvoiceRate, ZPO_NUMBER,ZVA_NUMBER, TRUCK_NO, DRIVER_NO, IDNLF, SCREEN_TYPE, VEHICLE_TYPE,VECHICAL_STATUS as VEHICLE_STATUS,QA_STATUS, DEVICE_TYPE";
    $fetchsql = "select $fields from purchase_info where PI_REFID ='" . $record->id . "' LIMIT 1";
    $poData = getResultAsObjectArray($connect, $fetchsql);
    if (count($poData) > 0) {
      $ZPO_NUMBER=$poData[0]["ZPO_NUMBER"];
      $PO_LINE_ITEM=$poData[0]["PO_LINE_ITEM"];

    
      

      $Qry="SELECT NETPR as PORate,PURCHASE_ORG_DESC as VehType FROM `sap_to_pp` where EBELN='$ZPO_NUMBER' and EBELP='$PO_LINE_ITEM'";
      $SelectPOData = mysqli_query($connect, $Qry);
      $FetchPOData=mysqli_fetch_assoc($SelectPOData);
      $PORate=$FetchPOData['PORate'];
      $VehType=$FetchPOData['VehType'];

      $qt = $poData[0]["DEVICE_TYPE"] . " = 'Yes'";
      $fetchsql1 =
        "select QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax,DeductionSpec
        from master_quality_check qc left join master_quality_preferred qp on qc.field_map = qp.fieldMap
        where IDNLF = '" . $poData[0]["IDNLF"] . "' and $qt ORDER BY qp.FieldOrder";
      //echo $fetchsql1;
      $qmparams = mysqli_query($connect, $fetchsql1);
      $qmResults = [];
      if (mysqli_num_rows($qmparams) > 0) {
        $j = 0;
        $qexfields = [
          "overall_result",
          "fungus_quality_noofbag",
          "fungus_quality_quarantine",
          "recommended_lot",
          "rain_damage_quality_noofbag",
          "rain_damage_quality_quarantine",
          "degrade",
          "others_comment",
          "surveyor_name",
          "reference_no",
          "deduction_amount",
          "wheat_variety",
          "qc_work_doc",
        ];
        $qmfields = ["QI_REFID"];
        while ($qrow = mysqli_fetch_assoc($qmparams)) {

          
          $qmResults[$j]["MIC"] = $qrow["MIC"];
          $qmResults[$j]["QCM_REFID"] = $qrow["QCM_REFID"];
          $qmResults[$j]["MIC_DESC"] = $qrow["MIC_DESC"];
          $qmResults[$j]["MIN_VALUE"] = $qrow["MIN_VALUE"];
          $qmResults[$j]["MAX_VALUE"] = $qrow["MAX_VALUE"];
          $qmResults[$j]["UOM"] = $qrow["UOM"];
          $qmResults[$j]["FIELD_MAP"] = $qrow["FIELD_MAP"];
          $qmResults[$j]["PreferredMin"] = $qrow["PreferredMin"];
          $qmResults[$j]["PreferredMax"] = $qrow["PreferredMax"];
          $qmResults[$j]["DeductionSpec"] = $qrow["DeductionSpec"];
         // $qmResults[$j]["SystemDeductionAmt"] = 0;
         // $qmResults[$j]["AcceptedDeductionAmount"] =0;
          $qmResults[$j]["InvoiceQty"] =$InvoiceQty;
          $qmResults[$j]["PORate"] =$PORate;
          $qmResults[$j]["InvoiceRate"] =$InvoiceRate;
          $qmResults[$j]["VehType"] =$VehType;
          array_push($qmfields, $qrow["FIELD_MAP"]);
          $j++;
        }
        $fetchsql2 =
          " select " .
          join(",", array_merge($qmfields, $qexfields)) .
          "  from quality_info where purchase_info_id = '" .
          $record->id .
          "' LIMIT 1";
        //echo $fetchsql2;
        $qmDatas = mysqli_query($connect, $fetchsql2);
        if (mysqli_num_rows($qmDatas) > 0) {
          while ($Rrow = mysqli_fetch_assoc($qmDatas)) {
            $TotalDeduction=0;
            for ($x = 0; $x < count($qmResults); $x++) {              
              $qmResults[$x]["qlabel"] =$qmResults[$x]["qvalue"] = $Rrow[$qmResults[$x]["FIELD_MAP"]];
             
           

      
      
            }
          }
        }

        //2nd QC
        $fetchsql2 =
          " select " .
          join(",", array_merge($qmfields, $qexfields)) .
          ",TotalDeduction,InvoiceRate,PORate,RateDifference,RateDifferenceDeduction 
          from quality_info_afterunload where purchase_info_id = '" .
          $record->id .
          "' LIMIT 0,1";
          $fetchsql2 =
          " select *
          from quality_info_afterunload where purchase_info_id = '" .
          $record->id .
          "' LIMIT 0,1";
       // echo $fetchsql2;exit();
        $qmDatas = mysqli_query($connect, $fetchsql2);
        if (mysqli_num_rows($qmDatas) > 0) {
          while ($Rrow = mysqli_fetch_assoc($qmDatas)) {
       
            $TotalDeduction=0;
            if($OnchangeVal==0){
              $InvoiceRate=$Rrow['InvoiceRate'];
              $InvoiceQty=$Rrow['InvoiceQty'];
            }
            
            $PORate=$Rrow['PORate'];
            $RateDifference=$Rrow['RateDifference'];
            
            $RateDifferenceDeduction=$Rrow['RateDifferenceDeduction'];
            $TotalDeduction=$Rrow['TotalDeduction'];
            $QCTotalDeductionApprovalAmount=$Rrow['QCTotalDeductionApprovalAmount'];
            $QCDeductionRemark=$Rrow['QCDeductionRemark'];
            if($OnchangeVal==1){
              $TotalDeduction=0;
            }
            for ($x = 0; $x < count($qmResults); $x++) {              
             
              
              $qmResults[$x]["qlabel2"] =$qmResults[$x]["qvalue2"] = $Rrow[$qmResults[$x]["FIELD_MAP"]]; //added for second QC
              $qmResults[$x]["qcDiff"] =0;//added for second QC
              $DeductionSpec=$qmResults[$x]["DeductionSpec"];
              $value= $Rrow[$qmResults[$x]["FIELD_MAP"]];
              $FIELD_MAP=$qmResults[$x]["FIELD_MAP"];
              $DeductionAmt=0;
              //Deduction Calculation
              if($FIELD_MAP=="kernel_bunt_quality"  || $FIELD_MAP=="soft_wheat_quality" || $FIELD_MAP=="foreign_matter_quality" || $FIELD_MAP=="black_wheat_quality" || $FIELD_MAP=="moisture_quality" || $FIELD_MAP=="foreign_matter_quality" || $FIELD_MAP=="mudballs_quality"){
                if(($value-$DeductionSpec)>0){
                  $val=1;
                  if($FIELD_MAP=="soft_wheat_quality" || $FIELD_MAP=="mudballs_quality" || $FIELD_MAP=="black_wheat_quality"){
                    $val=0.5;
                  }
                 
                
                  $DeductionAmt=(($InvoiceQty*($PORate/1000)*($value-$DeductionSpec))*$val)/100;
                }
              }
      
              if($FIELD_MAP=="insect_damage_wheat_quality"){
                if(($value-$DeductionSpec)>0){
                $val=1;
                $DeductionAmt=(($InvoiceQty*(($PORate/1000)-10)*($value-$DeductionSpec))*$val)/100;
                }
              }
      
             if($FIELD_MAP=="hl_quality"){
                if(($value-$DeductionSpec)<0){
                  $DeductionAmt=(($InvoiceQty*($PORate/1000)*($value-$DeductionSpec))*-1)/100;
                }
              }
               
              if($FIELD_MAP=="infestation_quality"){
               if(strtoupper($value)=="YES" && $VehType=="Container"){
                $DeductionAmt=1500;
               }else{
                if(strtoupper($value)=="YES" && $VehType=="Truck"){
                  $DeductionAmt=($InvoiceQty/1000)*25;
                 }
               }
              }
             if($FIELD_MAP=="immature_wheat_quality"){
              
                $GroupDeduction=GetGroupDeduction($qmResults,$FIELD_MAP,$value);
           //echo "<br>".$FIELD_MAP."-".$GroupDeduction;
                if($DeductionSpec>0){
                
                if(($GroupDeduction-$DeductionSpec)>0){
                  $DeductionAmt=(($InvoiceQty*($PORate/1000)*($GroupDeduction-$DeductionSpec))*0.5)/100;
                 
                }
              }
                
              }              
      
        $DeductionAmt=round($DeductionAmt,0); 
        //echo $qmResults[$x]["FIELD_MAP"]."_SystemDeduction<br>";
        if($OnchangeVal==0){
          $qmResults[$x]["SystemDeductionAmt"] = $Rrow[$qmResults[$x]["FIELD_MAP"]."_SystemDeduction"];
          $qmResults[$x]["AcceptedDeductionAmount"] =$Rrow[$qmResults[$x]["FIELD_MAP"]."_AcceptedDeduction"];
        }else{
          $qmResults[$x]["SystemDeductionAmt"] =$DeductionAmt;
          $qmResults[$x]["AcceptedDeductionAmount"] =$DeductionAmt;
        }
        
        
      if($OnchangeVal==1){
        $TotalDeduction=$TotalDeduction+$DeductionAmt;
      }
       }
            //PODATA
          foreach ($qexfields as $exfield) {
           // echo "<br>exfield:".$exfield;
            $poData[0][$exfield] = $Rrow[$exfield];
          }
          }
         
        }


        
        
          $poData[0]["InvoiceQty"] =$InvoiceQty;
          $poData[0]["PORate"] =$PORate;
          $poData[0]["InvoiceRate"] =$InvoiceRate;
          if($OnchangeVal==1){
            $RateDifference=$InvoiceRate-$PORate;
            $RateDifferenceDeduction=($RateDifference*$InvoiceQty)/1000;
          }
        
          $poData[0]["RateDifference"] =$RateDifference;
          $poData[0]["RateDifferenceDeduction"] =$RateDifferenceDeduction;
         // $poData[0]["TotalDeduction"] =$TotalDeduction;
         if((float)$QCTotalDeductionApprovalAmount>0){
          if($OnchangeVal==1){
            $QCTotalDeductionApprovalAmount=$TotalDeduction+$RateDifferenceDeduction;
          }
          $poData[0]["TotalDeduction"] =$QCTotalDeductionApprovalAmount;
          
         }else{
           if($OnchangeVal==1){
             $TotalDeduction=$TotalDeduction+$RateDifferenceDeduction;
           }
          $poData[0]["TotalDeduction"] =$TotalDeduction;
         }
        
          $poData[0]["QCTotalDeductionApprovalAmount"] =(float)$QCTotalDeductionApprovalAmount;
         $poData[0]["QCDeductionRemark"]=$QCDeductionRemark;
        
      }
    }
    return json_encode(["success" => 1, "results" => $poData, "params" => $qmResults]);
  } catch (Throwable $th) {
    var_dump($th);
    return json_encode(["success" => 0]);
  }
}
function fetchPODetailsById($connect, $record)
{
  try {
    //for Onchange Invoice Qty and Rate
    $InvoiceQty="";
    $InvoiceRate="";
    $OnchangeVal=0;
    $qcFormData="";
   // var_dump($record);
    if(isset($record->OnchangeVal)){
      if($record->OnchangeVal==1){
        $OnchangeVal=$record->OnchangeVal;
        $InvoiceQty=$record->InvoiceQty;
        $InvoiceRate=$record->InvoiceRate;
        $qcFormData=$record->qcFormData;

      }
    }
    //for Onchange Invoice Qty and Rate

    
    $fields = "PI_REFID,PO_LINE_ITEM,InvoiceQty,InvoiceRate, ZPO_NUMBER,CONTAINER_NO,ZVA_NUMBER, TRUCK_NO, DRIVER_NO, IDNLF, SCREEN_TYPE, VEHICLE_TYPE,VECHICAL_STATUS as VEHICLE_STATUS,QA_STATUS, DEVICE_TYPE";
    $fetchsql = "select $fields from purchase_info where PI_REFID ='" . $record->id . "' LIMIT 1";
    //echo $fetchsql;exit();
    $poData = getResultAsObjectArray($connect, $fetchsql);
    if (count($poData) > 0) {
      $ZPO_NUMBER=$poData[0]["ZPO_NUMBER"];
      $PO_LINE_ITEM=$poData[0]["PO_LINE_ITEM"];
      $CONTAINER_NO=$poData[0]["CONTAINER_NO"];
      $TRUCK_NO=$poData[0]["TRUCK_NO"];

      if($OnchangeVal==0){
        $InvoiceQty=$poData[0]["InvoiceQty"];
        $InvoiceRate=$poData[0]["InvoiceRate"];
      }
      
//Inv

 /*Mohan 15102021 commented as client request supploer rate alone correct for invoicerate 
 $Qry="SELECT sum(ZSUPPLIER_INV_RATE*ZSUPPLIER_INV_QTY) as InvoiceRate,sum(ZSUPPLIER_INV_QTY) as InvoiceQty FROM `supplier_vehical_info` 
 where SUPPLIER_ID IN(SELECT SD_REFID FROM `supplier_dispatch_info` WHERE ZPO_NUMBER='$ZPO_NUMBER' and ZPO_LINE_ITEM='$PO_LINE_ITEM')";
 */
 $Qry1="SELECT sum(ZSUPPLIER_INV_RATE) as InvoiceRate,sum(ZSUPPLIER_INV_QTY) as InvoiceQty 
 FROM `supplier_vehical_info` 
 where (VEHICAL_NO = '$CONTAINER_NO' OR VEHICAL_NO = '$TRUCK_NO') and SUPPLIER_ID IN(SELECT SD_REFID FROM `supplier_dispatch_info` 
 WHERE ZPO_NUMBER='$ZPO_NUMBER' and ZPO_LINE_ITEM='$PO_LINE_ITEM')";
 // echo $Qry1;
  $InData = getResultAsObjectArray($connect, $Qry1);
 
  // $InvoiceRate=$InData[0]["InvoiceRate"];
  //$InvoiceRate=$InvoiceRate*1000;
  ///$InvoiceQty=$InData[0]["InvoiceQty"];

      //echo "ZPO_NUMBER:".$ZPO_NUMBER;
     //echo "<br>PO_LINE_ITEM:".$PO_LINE_ITEM;
       $Qry="SELECT '$InvoiceQty' as InvoiceQty,'$InvoiceRate' as InvoiceRate,NETPR as PORate,PURCHASE_ORG_DESC as VehType FROM `sap_to_pp` where EBELN='$ZPO_NUMBER' and EBELP='$PO_LINE_ITEM'";
     //echo $Qry;
       $SelectPOData = mysqli_query($connect, $Qry);
      $FetchPOData=mysqli_fetch_assoc($SelectPOData);
      $InvoiceQty=$FetchPOData['InvoiceQty'];
      $PORate=$FetchPOData['PORate'];
    //  $PORate="21300";
      $InvoiceRate=$FetchPOData['InvoiceRate'];
      $VehType=$FetchPOData['VehType'];
      //$InvoiceQty=100;$InvoiceRate=15000;

      $qt = $poData[0]["DEVICE_TYPE"] . " = 'Yes'";
      $fetchsql1 =
        "select QCM_REFID, MIC, MIC_DESC, MIN_VALUE, MAX_VALUE, UOM, FIELD_MAP, PreferredMin, PreferredMax,DeductionSpec
        from master_quality_check qc left join master_quality_preferred qp on qc.field_map = qp.fieldMap
        where IDNLF = '" . $poData[0]["IDNLF"] . "' and $qt ORDER BY qp.FieldOrder";
     // echo $fetchsql1;
      $qmparams = mysqli_query($connect, $fetchsql1);
      $qmResults = [];
      if (mysqli_num_rows($qmparams) > 0) {
        $j = 0;
        $qexfields = [
          "overall_result",
          "fungus_quality_noofbag",
          "fungus_quality_quarantine",
          "recommended_lot",
          "rain_damage_quality_noofbag",
          "rain_damage_quality_quarantine",
          "degrade",
          "others_comment",
          "surveyor_name",
          "reference_no",
          "deduction_amount",
          "wheat_variety",
          "qc_work_doc",
        ];
        $qmfields = ["QI_REFID"];
        while ($qrow = mysqli_fetch_assoc($qmparams)) {

          
          $qmResults[$j]["MIC"] = $qrow["MIC"];
          $qmResults[$j]["QCM_REFID"] = $qrow["QCM_REFID"];
          $qmResults[$j]["MIC_DESC"] = $qrow["MIC_DESC"];
          $qmResults[$j]["MIN_VALUE"] = $qrow["MIN_VALUE"];
          $qmResults[$j]["MAX_VALUE"] = $qrow["MAX_VALUE"];
          $qmResults[$j]["UOM"] = $qrow["UOM"];
          $qmResults[$j]["FIELD_MAP"] = $qrow["FIELD_MAP"];
          $qmResults[$j]["PreferredMin"] = $qrow["PreferredMin"];
          $qmResults[$j]["PreferredMax"] = $qrow["PreferredMax"];
          $qmResults[$j]["DeductionSpec"] = $qrow["DeductionSpec"];
         // $qmResults[$j]["SystemDeductionAmt"] = 0;
         // $qmResults[$j]["AcceptedDeductionAmount"] =0;
          $qmResults[$j]["InvoiceQty"] =$InvoiceQty;
          $qmResults[$j]["PORate"] =$PORate;
          $qmResults[$j]["InvoiceRate"] =$InvoiceRate;
          $qmResults[$j]["VehType"] =$VehType;
          array_push($qmfields, $qrow["FIELD_MAP"]);
          $j++;
        }
        $fetchsql2 =
          " select " .
          join(",", array_merge($qmfields, $qexfields)) .
          "  from quality_info where purchase_info_id = '" .
          $record->id .
          "' LIMIT 1";
        //echo $fetchsql2;
        $qmDatas = mysqli_query($connect, $fetchsql2);
        if (mysqli_num_rows($qmDatas) > 0) {
          while ($Rrow = mysqli_fetch_assoc($qmDatas)) {
            $TotalDeduction=0;
            for ($x = 0; $x < count($qmResults); $x++) {              
              $qmResults[$x]["qlabel"] =$qmResults[$x]["qvalue"] = $Rrow[$qmResults[$x]["FIELD_MAP"]];
              
              $qmResults[$x]["qcDiff"] =0;//added for second QC
              //Deduction Calculation
              $DeductionAmt=0;
              $FIELD_MAP=$qmResults[$x]["FIELD_MAP"];
              $value=$Rrow[$qmResults[$x]["FIELD_MAP"]];
             // echo $qmResults[$x]["FIELD_MAP"]."<br>";
              if($OnchangeVal==1){
                for($j=0;$j<sizeof($qcFormData);$j++){
                  //var_dump($qcFormData[$j]);
                 
                  if(strtoupper($qcFormData[$j]->FIELD_MAP)==strtoupper($qmResults[$x]["FIELD_MAP"])){
                    $value=$qcFormData[$j]->qvalue2;
                  
                  }
                }
              }
              $qmResults[$x]["qlabel2"] =$qmResults[$x]["qvalue2"] = $value; //added for second QC
              $DeductionSpec=$qmResults[$x]["DeductionSpec"];

        if($FIELD_MAP=="kernel_bunt_quality"  || $FIELD_MAP=="soft_wheat_quality" || $FIELD_MAP=="foreign_matter_quality" || $FIELD_MAP=="black_wheat_quality" || $FIELD_MAP=="moisture_quality" || $FIELD_MAP=="foreign_matter_quality" || $FIELD_MAP=="mudballs_quality"){
          if(($value-$DeductionSpec)>0){
            $val=1;
            if($FIELD_MAP=="soft_wheat_quality" || $FIELD_MAP=="mudballs_quality" || $FIELD_MAP=="black_wheat_quality"){
              $val=0.5;
            }
            
          
            $DeductionAmt=(($InvoiceQty*($PORate/1000)*($value-$DeductionSpec))*$val)/100;
          }
        }

        if($FIELD_MAP=="insect_damage_wheat_quality"){
          if(($value-$DeductionSpec)>0){
          $val=1;
          $DeductionAmt=(($InvoiceQty*(($PORate/1000)-10)*($value-$DeductionSpec))*$val)/100;
          }
        }

       if($FIELD_MAP=="hl_quality"){
          if(($value-$DeductionSpec)<0){
            $DeductionAmt=(($InvoiceQty*($PORate/1000)*($value-$DeductionSpec))*-1)/100;
          }
        }
         
        if($FIELD_MAP=="infestation_quality"){
         if(strtoupper($value)=="YES" && $VehType=="Container"){
          $DeductionAmt=1500;
         }else{
          if(strtoupper($value)=="YES" && $VehType=="Truck"){
            $DeductionAmt=($InvoiceQty/1000)*25;
           }
         }
        }
       if($FIELD_MAP=="immature_wheat_quality"){
        
          $GroupDeduction=GetGroupDeduction($qmResults,$FIELD_MAP,$value);
     //echo "<br>".$FIELD_MAP."-".$GroupDeduction;
          if($DeductionSpec>0){
          
          if(($GroupDeduction-$DeductionSpec)>0){
            $DeductionAmt=(($InvoiceQty*($PORate/1000)*($GroupDeduction-$DeductionSpec))*0.5)/100;
           
          }
        }
          
        }
        $DeductionAmt=round($DeductionAmt,0); 
        $qmResults[$x]["SystemDeductionAmt"] = $DeductionAmt;
        $qmResults[$x]["AcceptedDeductionAmount"] =$DeductionAmt;
        $TotalDeduction=$TotalDeduction+$DeductionAmt;
            }
            foreach ($qexfields as $exfield) {
              $poData[0][$exfield] = $Rrow[$exfield];
            }
            $poData[0]["InvoiceQty"] =$InvoiceQty;
            $poData[0]["PORate"] =$PORate;
            $poData[0]["InvoiceRate"] =$InvoiceRate;
            $RateDifference=$InvoiceRate-$PORate;
            $poData[0]["RateDifference"] =$RateDifference;
            $RateDifferenceDeduction=($RateDifference*$InvoiceQty)/1000;
            $poData[0]["RateDifferenceDeduction"] =$RateDifferenceDeduction;
            $TotalDeduction=$TotalDeduction+$RateDifferenceDeduction;
            $poData[0]["TotalDeduction"] =$TotalDeduction;


          }
        }
      }
    }
    return json_encode(["success" => 1, "results" => $poData, "params" => $qmResults]);
  } catch (Throwable $th) {
    var_dump($th);
    return json_encode(["success" => 0]);
  }
}
function GetGroupDeduction($qcFormData,$Key,$Value){
  
  $Deduction=0;
  for($i=0;$i<sizeof($qcFormData);$i++){
 
    if($qcFormData[$i]['FIELD_MAP']=="immature_wheat_quality"){
     // var_dump($qcFormData[$i]['qvalue2']);
      $Addvalue=floatval($qcFormData[$i]['qvalue2']);
     if ($qcFormData[$i]['FIELD_MAP'] ===$Key) {
       $Addvalue=floatval($Value);
     }
   
   // var_dump($Addvalue);
     $Deduction=$Deduction + $Addvalue;
    
   }
  }
  //var_dump($Deduction);
  return $Deduction;
}
function updateQCApproval($connect, $record)
{
  try{
    mysqli_begin_transaction($connect);
    // $fields = ["deduction_amount"];
    $sqlf = [];

    $qcData = $record->qcData;
    
    foreach ($qcData as $key => $value) {
      // if (in_array($key, $fields)) {
        array_push($sqlf, $key . " = '" . mysqli_real_escape_string($connect, trim($value)) . "'");
      // }
    }
    $statusN = "3";
    $isRake =  $record->VEHICLE_TYPE=== "Rake" ;
    if ($record->qc_approver === "A") {
      $statusN = $isRake ? "0" : "4";
    }
    else  if ($record->qc_approver === "R") {
      //gate out if rejected;
      $statusN= "5";
    }
    $id = mysqli_real_escape_string($connect, trim($record->id));
    $usql = "UPDATE quality_info SET " . join(", ", $sqlf) . " WHERE purchase_info_id = " . $id;
    //echo $usql;
    $zQty = "";
    $dtField="QualityDeductionSubmitDt";
    $ByField="QualityDeductionSubmitBy";
    $ByName="QualityDeductionSubmitByName";
    if ($record->qc_approver === "R") {
      $zQty = ",ZQTY=0";
      $dtField="QualityDeductionRejectDt";
      $ByField="QualityDeductionRejectBy";
      $ByName="QualityDeductionRejectByName";
    }
    if (updateData($connect, $usql)) {
      $session = session();
      $SessionUser=$_SESSION["USERID"];
      $SessionUserName=$_SESSION["FIRSTNAME"];
      $CurrentDateTime=date("Y-m-d H:i:s");

      $usql1 =
        "UPDATE purchase_info SET QA_STATUS ='" .
        $record->qc_approver .
        "'" .
        $zQty .
        ",$dtField='$CurrentDateTime',$ByName='$SessionUserName',$ByField='$SessionUser', VECHICAL_STATUS = '" .
        $statusN .
        "' WHERE PI_REFID = " .
        $id;
      //echo $usql1;
      if (updateData($connect, $usql1)) {
        if ($isRake) {
          updateRackQC($connect, $id);
        }
        mysqli_commit($connect);
        return json_encode(["success" => 1]);
      }
    }
    mysqli_rollback($connect);
  }
  catch(Exception $ex){
    mysqli_rollback($connect);
    return json_encode(["success" => 0, "ex"=>$ex]);
  }
}
function updateRackQC($connect, $id)
{
  $fetchsql4 = "SELECT ZPO_NUMBER, ZSUPPLIER_CODE, PO_LINE_ITEM from purchase_info WHERE PI_REFID = '".$id."'";
  $PIResult = mysqli_query($connect, $fetchsql4);
  $PIRecord = $PIResult->fetch_assoc();
  $supsql = "UPDATE supplier_dispatch_info SET QA_APPROVER_STATUS = 'A' where ZPO_NUMBER = '".$PIRecord['ZPO_NUMBER']."' AND ZSUPPLIER_CODE = '".$PIRecord['ZSUPPLIER_CODE']."' AND ZPO_LINE_ITEM = '".$PIRecord['PO_LINE_ITEM']."'";  
  updateData($connect, $supsql);
}
?>
