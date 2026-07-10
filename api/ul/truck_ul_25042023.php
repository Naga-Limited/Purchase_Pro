<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/queryHelper.php";
include_once APIPATH."/helper/appHelper.php";
date_default_timezone_set("Asia/Calcutta");
$entityULContent = json_decode(file_get_contents("php://input"));

if ($entityULContent->formType === "PO") {
  echo fetchPODetailsById($connect, $entityULContent);
} else {
  echo addUnloadingdetails($connect, $entityULContent);
}

$connect->close();
function fetchPODetailsById($connect, $record)
{
  $fields =
    "PI_REFID,InvoiceQty as invoice_qty,InvoiceRate as invoice_rate,InvoiceCopy as INV_COPY,WBCopy as WB_COPY, ZPO_NUMBER,ZVA_NUMBER, PO_LINE_ITEM, TRUCK_NO, CONTAINER_NO, DRIVER_NO, ZVENDOR_NAME, IDNLF, SCREEN_TYPE, VEHICLE_TYPE, NETPR, PLANT_NAME, STORAGE_LOCATION, MATNR, INCO_DESC, ZSUPPLIER_NAME, ZSUPPLIER_CODE, BAG_NAME,pi.WERKS as FromWERKS, mpi.id as toplantid, msi.STORAGE_REFID as tolocationid";
  $fetchsql =
    "select " .
    $fields .
    " from purchase_info pi LEFT Join master_plant mpi ON pi.WERKS = mpi.WERKS 
    LEFT Join master_storage msi ON msi.LGORT = pi.LGORT and msi.plantid = mpi.id
    LEFT Join master_inco ON INCO1 = INCO_TERMS LEFT Join master_bag ON PO_BAG_TYPE = BAG_CODE where PI_REFID ='" .
    $record->id .
    "'LIMIT 1 ";
  
  //  echo $fetchsql; exit();
  $poData = getResultAsObjectArray($connect, $fetchsql);

  if(count($poData)>0){

    $poData[0]["invoice_rate"] = $poData[0]['invoice_rate'];
    $poData[0]["invoice_qty"] = $poData[0]['invoice_qty'];

    $FromPlant=$poData[0]['FromWERKS'];
     $Qry="SELECT ToPlant FROM `pp_plantchildmapping` where FromPlant='$FromPlant'  and RecStatus='1'";
    $ToPlant = getResultAsObjectArray($connect, $Qry);
     $poData[0]["MappedPlant"] = $ToPlant[0]['ToPlant'];  

    $sql = "select recommended_lot from quality_info where purchase_info_id='". $record->id."'";
    $poData[0]["RECOMMENDED_LOT"] = getFieldValue($connect,$sql,"");
    $poNumber = $poData[0]["ZPO_NUMBER"];
    $vheNumber = ($poData[0]["CONTAINER_NO"])?$poData[0]["CONTAINER_NO"]:$poData[0]["TRUCK_NO"];
    $lineItem = $poData[0]["PO_LINE_ITEM"];
    $supplierCode = $poData[0]["ZSUPPLIER_CODE"];
   $sql2 = "SELECT WB_QTY, WB_DT, ZSUPPLIER_INV_RATE, ZSUPPLIER_INV_NO, ZSUPPLIER_INV_DT, ZSUPPLIER_INV_QTY, INV_COPY, WB_COPY FROM supplier_vehical_info JOIN supplier_dispatch_info ON SUPPLIER_ID = SD_REFID WHERE (VEHICAL_NO = '".$vheNumber."' AND ZPO_NUMBER = '".$poNumber."' AND 	ZSUPPLIER_CODE = '".$supplierCode."' AND LINE_ITEM = '".$lineItem."') LIMIT 1";
    $formData = getResultAsObjectArray($connect, $sql2);
    //echo var_dump($formData);
    if(count($formData)>0){
      $poData[0]["supplier_wb_qty"] = $formData[0]['WB_QTY'];
     // $poData[0]["invoice_rate"] = $formData[0]['ZSUPPLIER_INV_RATE'];
      $poData[0]["invoice_date"] = $formData[0]['ZSUPPLIER_INV_DT'];
      $poData[0]["invoice_no"] = $formData[0]['ZSUPPLIER_INV_NO'];
     // $poData[0]["invoice_qty"] = $formData[0]['ZSUPPLIER_INV_QTY'];
      $poData[0]["supplier_wb_dt"] = $formData[0]['ZSUPPLIER_INV_DT'];
      $poData[0]["INV_COPY"] = $formData[0]['INV_COPY'];
      $poData[0]["WB_COPY"] = $formData[0]['WB_COPY'];      
    }

    //Receiving Plant Detail Fetch
    $toplantid = $poData[0]['toplantid'];
    $tolocationid = $poData[0]['tolocationid'];
    

    // $Qry ="SELECT lotno as value, lotno as label FROM `ngw_lot` where plantid='$toplantid' and RecStatus='1'";
    $Qry ="SELECT lotno as value, lotno as label FROM `ngw_lot` where plantid='$toplantid' and locationid='$tolocationid' and  RecStatus='1'";
    
    $lotdet = getResultAsObjectArray($connect, $Qry);
    $poData[0]['lotdet']=$lotdet;
  } 
 
   return json_encode(["success" => 1, "results" => $poData]);
}


function addUnloadingdetails($connect, $record)
{
  // var_dump($record);exit();

  $gFields = ["bag_type","bag_type2","bag_type3", "no_bags","no_bags2","no_bags3", "gunny_wt", "unload_lot","invoice_date","invoice_no","invoice_qty","invoice_bag_count","invoice_rate","supp_inv_copy","supp_wb_copy","supplier_wb_dt","supplier_wb_qty"];

  $id = mysqli_real_escape_string($connect, trim($record->id));

  // $no_bags1 = mysqli_real_escape_string($connect, trim($record->no_bags));
  // $no_bags2 = mysqli_real_escape_string($connect, trim($record->no_bags2));
  // $no_bags3 = mysqli_real_escape_string($connect, trim($record->no_bags3));

  // $bag_type1 = mysqli_real_escape_string($connect, trim($record->bag_type));
  // $bag_type2 = mysqli_real_escape_string($connect, trim($record->bag_type2));
  // $bag_type3 = mysqli_real_escape_string($connect, trim($record->bag_type3));


  $wheatweightSql1="SELECT WheatWeight FROM master_bag WHERE BAG_CODE ='".mysqli_real_escape_string($connect, trim($record->bag_type))."'";
  // echo  $wheatweightSql1;
  $bres = getResultAsObjectArray($connect, $wheatweightSql1);
  // var_dump($bres);
  $WheatWeight1 = $bres[0]["WheatWeight"];
  $BagWeight1 = ($WheatWeight1) * (trim($record->no_bags));

  // echo "    BAGS NO: ", $bres[0]["WheatWeight"], " X ", $record->no_bags ;

  $BagWeight2 = 0;
  if (isset($record->bag_type2)){
    $wheatweightSql2="SELECT WheatWeight FROM master_bag WHERE BAG_CODE ='".mysqli_real_escape_string($connect, trim($record->bag_type2))."'";
    $bres = getResultAsObjectArray($connect, $wheatweightSql2);
    $WheatWeight2 = $bres[0]["WheatWeight"];
    $BagWeight2 = ($WheatWeight2) * (mysqli_real_escape_string($connect, trim($record->no_bags2)));
  }

  $BagWeight3 = 0;
  if (isset($record->bag_type3)) {
    $wheatweightSql3 = "SELECT WheatWeight FROM master_bag WHERE BAG_CODE ='" . mysqli_real_escape_string($connect, trim($record->bag_type3)) . "'";
    $bres = getResultAsObjectArray($connect, $wheatweightSql3);
    $WheatWeight2 = $bres[0]["WheatWeight"];
    $BagWeight3 = ($WheatWeight2) * (mysqli_real_escape_string($connect, trim($record->no_bags3)));
  }

  $TotalBagWeight = $BagWeight1 +$BagWeight2 + $BagWeight3;
  $LotNo = mysqli_real_escape_string($connect, trim($record->lstunload_lot->label));

  $plantSql = "SELECT mp.ID as Plant_Id, 
                      ww.id as Wheat_Id, 
                      ms.STORAGE_REFID as location_Id
              FROM purchase_info pi, master_plant mp, master_mrc_wheat_variety ww, master_storage ms
              WHERE pi.IDNLF = ww.WheatVariety 
                AND pi.WERKS = mp.WERKS 
                AND pi.LGORT = ms.LGORT 
                AND PI_REFID = ".$id;

  // echo $plantSql;                
  $plant_res = getResultAsObjectArray($connect, $plantSql);
  
  // var_dump($plant_res); exit();

  $plant_ID = $plant_res[0]["Plant_Id"];
  $wheat_ID = $plant_res[0]["Wheat_Id"];
  $location_ID = $plant_res[0]["location_Id"];

  $lotSql = "UPDATE ngw_sublot SET wheatqty = wheatqty + ".$TotalBagWeight." WHERE wheatvarietyid =" .$wheat_ID. 
            " AND plantid =" .$plant_ID. 
            " AND StorageLocationId =" .$location_ID. 
            " AND lotno ='" .$LotNo. "'";

  // echo $lotSql;
  $subLotUpdate = mysqli_query($connect, $lotSql);    
  
  // var_dump($subLotUpdate); exit();


  
            /*
  $subLotValidateLotSql = "SELECT count(1) FROM ngw_sublot WHERE wheatvarietyid = ".$wheat_ID." AND plantid =" .$plant_ID. " AND lotno ='" .$LotNo. "'";
  $validateRes = mysqli_query($connect, $subLotValidateLotSql);

  if($validateRes){
    // Lot Details exesting in Sublot Table -> Update Query
  }else{
    // Lot Details not exesting in Sublot Table -> insert Query
    /*
      sub_lot_id;"lotid";	"lotno";"warehouseid";"plantid"; "StorageLocationId";"wheatvarietyid";"wheatqty";
      "SAP_Qty";"CompletionStatus";"RecStatus";"InsDt";"InsBy";"ModDt";
    * /

    $lotSql = "INSERT INTO ngw_sublot (`lotid`,`lotno`,
              `warehouseid`,`plantid`,`StorageLocationId`,`wheatvarietyid`,
              `wheatqty`,`SAP_Qty`,
              `CompletionStatus`,`RecStatus`,
              `InsDt`,`InsBy`,`ModDt`
              ) VALUES (
                '".$LotNo."','".$LotNo."','"warehouseid"','".$location_ID."',
                '".$wheat_ID."','"Wheat QTY'",'"SAP QTY'",'"Comp Status'",
                '"RecStatus'",'"Ins Dt'",'"InsBy'",'"Mod Dt'",
              );
  }
*/
  
  // echo "subLotUpdate :",$subLotUpdate;exit();

  if (!$subLotUpdate){
    return json_encode(["success" => 0]);
  }


  $fields = [];
  $values = [];
  $sqlFields = [];
  
  foreach ($gFields as $gfield) {
    if (isset($record->{$gfield})) {
      array_push($fields, $gfield);
      array_push($values, mysqli_real_escape_string($connect, trim($record->{$gfield})));
      array_push($sqlFields, $gfield . "= '" . mysqli_real_escape_string($connect, trim($record->{$gfield})) . "'");
    }
  }
  $fetchG = "SELECT purchase_info_id FROM gateout_info WHERE purchase_info_id =".$id;
  $resG = getResultAsObjectArray($connect, $fetchG);
  $last_id = "";
  $gupdate = false;
  if(count($resG)>0){
    
    $updateBag = "UPDATE gateout_info SET bag_type=NULL,bag_type2=NULL,bag_type3=NULL,no_bags=0,no_bags2=0,no_bags3=0 WHERE purchase_info_id = " . $id;
    $bagUpdated = mysqli_query($connect, $updateBag);
    
    $usql = "UPDATE gateout_info SET " . join(",", $sqlFields) . " WHERE purchase_info_id = " . $id;
    $gupdate = mysqli_query($connect, $usql);
  
  }
  else{
    $sql = "INSERT INTO gateout_info (purchase_info_id, " . join(", ", $fields) . ")  VALUES('" . $id . "','" . join("', '", $values) . "')";
   // echo $sql;
   
    mysqli_query($connect, $sql);
    $last_id = $connect->insert_id;
  }
 
  if ($last_id || $gupdate ) {
  
    $ufields = [];
    $pFields = ["TRUCK_NO", "ZSUPPLIER_CODE", "ZSUPPLIER_NAME", "PO_LINE_ITEM"];
    foreach ($pFields as $pfield) {
      if (isset($record->{$pfield})) {
        array_push($ufields, $pfield . "='" . mysqli_real_escape_string($connect, trim($record->{$pfield})) . "'");
      }
    }

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    
    $VehicleStatus=5; 
    //
    $ScreenType=getScreenTypeOfPO($connect,$id);
    $isOwnWb=CheckisOwnWBFromPOID($connect,$id);
    if($isOwnWb==1 && $ScreenType!="SDO"){
      $VehicleStatus=24; 
    }
   // echo "VehicleStatus:".$VehicleStatus;// exit();
        //Calculation

        //Upate Sublot With Wheat qty
    
    $upsql = "UPDATE purchase_info SET VECHICAL_STATUS = '$VehicleStatus',UnloadWHSubmitDt='$CurrentDateTime',UnloadWHSubmitByName='$SessionUserName',UnloadWHSubmitBy='$SessionUser'," . join(",", $ufields) . " WHERE PI_REFID = " . $record->id;

    if (mysqli_query($connect, $upsql) == true) {
      return json_encode(["success" => 1, "result" => "both"]);
    }
    return json_encode(["success" => 0]);
  }
  return json_encode(["success" => 0]);
}
?>
