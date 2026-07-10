<?php 
namespace App\Models;
use CodeIgniter\Model;
date_default_timezone_set("Asia/Calcutta");
class SDIModel extends Model
{
  public function getSDIVehicleList(){
    $builder =  $this->db->query("SELECT SUP_VE_REFID, VEHICAL_NO, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT,EDA, PLANT_NAME FROM supplier_vehical_info LEFT JOIN master_plant mp ON PLANT_ID = mp.WERKS, supplier_dispatch_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID AND VEHICLE_TYPE IN ('TRUCK','Container')");
    return  $builder->getResultArray();
  }
  public function getSDIVehicleList_new($searchTxt){
    $SearchCondition="";
    if($searchTxt!=""){
      $SearchCondition="AND (
        VEHICAL_NO like '%$searchTxt%'
        OR ZSUPPLIER_LOAD_POINT like '%$searchTxt%'
        OR ZSUPPLIER_LOAD_DT like '%$searchTxt%'
        OR PLANT_NAME like '%$searchTxt%'
        OR EDA like '%$searchTxt%'
        )";
    }
  //echo $SearchCondition;
   
  $builder =  $this->db->query("SELECT SUP_VE_REFID, VEHICAL_NO, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT,EDA, PLANT_NAME,ZPO_NUMBER,ZSUPPLIER_NAME  FROM supplier_vehical_info LEFT JOIN master_plant mp ON PLANT_ID = mp.WERKS, supplier_dispatch_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID ".$SearchCondition." AND VEHICLE_TYPE IN ('TRUCK','Container')");
  return  $builder->getResultArray();
  }
  public function getSDIVehicleListCount_new($searchTxt){
    $SearchCondition="";
    if($searchTxt!=""){
      $SearchCondition="AND (
        VEHICAL_NO like '%$searchTxt%'
        OR ZSUPPLIER_LOAD_POINT like '%$searchTxt%'
        OR ZSUPPLIER_LOAD_DT like '%$searchTxt%'
        OR PLANT_NAME like '%$searchTxt%'
        OR EDA like '%$searchTxt%'
        )";
    }
    $builder =  $this->db->query("SELECT COUNT(*) as count FROM supplier_dispatch_info , supplier_vehical_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID ".$SearchCondition." AND VEHICLE_TYPE IN ('TRUCK','Container')");
    return  $builder->getFirstRow()->count;
  }
  public function getSDIVehicleListCount(){
    $builder =  $this->db->query("SELECT COUNT(*) as count FROM supplier_dispatch_info , supplier_vehical_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID AND VEHICLE_TYPE IN ('TRUCK','Container')");
    return  $builder->getFirstRow()->count;
  }
  public function getSDIDetailById($id){
    $builder =  $this->db->query("SELECT 
    SUP_VE_REFID, SUPPLIER_ID, VEHICAL_NO, WB_QTY, WB_DT, SEAL_NO, NO_OF_WAGON, INV_COPY, WB_COPY, ZSUPPLIER_INV_RATE, ZSUPPLIER_INV_NO, ZSUPPLIER_INV_DT, ZSUPPLIER_INV_QTY, LINE_ITEM, ZPO_NUMBER, ZSUPPLIER_NAME, ZSUPPLIER_CODE, VEHICLE_TYPE, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT, EDA, PLANT_NAME, mves.VESSEL_NAME, FUMIGATION, LINER_NAME, VESSEL_NO FROM supplier_dispatch_info sdi LEFT JOIN master_plant mp ON sdi.WERKS = mp.WERKS LEFT JOIN master_vessel mves ON VESSEL_REFID = sdi. VESSEL_NAME, supplier_vehical_info where SUPPLIER_ID = SD_REFID AND SUP_VE_REFID = ".$id);
    return  $builder->getResultArray();
  }
  public function getSDIPOLineItem($poNumber, $supplierCode){
    $builder =  $this->db->query("SELECT DISTINCT EBELP as label, EBELP as value from sap_to_pp where EBELN = '" . $poNumber . "' AND SUPPLIER_CODE = '$supplierCode'");
    return  $builder->getResultArray();
  }
  public function deleteSDILineById($id){
    
  return $this->db->table('supplier_vehical_info')->where('SUP_VE_REFID',$id)->delete();
  }
  public function updatePoLineById($id,$lineItem,$plantId,$SupplierId){
    /*$poline =[
      "LINE_ITEM"=>$lineItem,
      "PLANT_ID"=>$plantId
    ];*/
    $session = session();
$SessionUser=$_SESSION["USERID"];
$SessionUserName=$_SESSION["FIRSTNAME"];
$SupplierDispatchRedirectDt=date("Y-m-d H:i:s");

$poline1 =[
  "ZPO_LINE_ITEM"=>$lineItem,

];  
$this->db->table('supplier_dispatch_info')->where('SD_REFID',$SupplierId)->update($poline1); 

$poline =[
      "LINE_ITEM"=>$lineItem,
      "PLANT_ID"=>$plantId,
      "SupplierDispatchRedirectBy"=>$SessionUser,
      "SupplierDispatchRedirectByName"=>$SessionUserName,
      "SupplierDispatchRedirectDt"=>$SupplierDispatchRedirectDt
    ];
    return $this->db->table('supplier_vehical_info')->where('SUP_VE_REFID',$id)->update($poline);
  }
  public function getPlantBySdi($poNumber,$lineItem,$supplierCode){
    $builder =  $this->db->query("SELECT mp.WERKS, PLANT_NAME, LGORT from sap_to_pp stp JOIN master_plant mp ON stp.WERKS = mp.WERKS where EBELN = '" . $poNumber . "' AND SUPPLIER_CODE = '$supplierCode' AND EBELP = '$lineItem'");
    return  $builder->getResultArray();
  }
  
  public function updateRedirect($postData){
    $id = $postData->id;
    $lineItem = $postData->lineItem;
    $plant_Id = $postData->plant_Id;
    $poNumber = $postData->poNumber;
    $supplierCode = $postData->supplierCode;
    $oldLineItem = $postData->oldLineItem;
    $isGateOut = $postData->isGateOut;
    $vehicleNo = $postData->vehicleNo;
    $screenType = $postData->screenType;
    $storageId = $postData->storageId;
    $this->db->transStart();

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    if($isGateOut){
      $pinfo =[
        "QA_STATUS"=>'R',
        "VECHICAL_STATUS"=>5,
        
        "UnloadingRedirectGateoutDt"=>$CurrentDateTime,
        "UnloadingRedirectGateoutBy"=>$SessionUser,
        "UnloadingRedirectGateoutByName"=>$SessionUserName

      ];      
    }
    else{
      $pinfo =[
        "PO_LINE_ITEM"=>$lineItem, 
         "WERKS"=>$plant_Id,
         "LGORT"=>$storageId,
         "UnloadingRedirectDt"=>$CurrentDateTime,
        "UnloadingRedirectBy"=>$SessionUser,
        "UnloadingRedirectByName"=>$SessionUserName
       ];
    }
    $res = $this->db->table('purchase_info')->where('PI_REFID',$id)->update($pinfo);
    if($res && $screenType === 'SDI'){
      $builder =  $this->db->query("SELECT SD_REFID from supplier_dispatch_info where ZPO_NUMBER = '" . $poNumber . "' AND ZSUPPLIER_CODE = '$supplierCode'");
      $result  = $builder->getResultArray();
      if($result && count($result)>0){
        $supplierIds = [];
        foreach ($result as $row){
          array_push($supplierIds,$row["SD_REFID"]);
        }
        $vhinfo =[
          "LINE_ITEM"=>$lineItem,
          "PLANT_ID"=>$plant_Id,
          "VEHICLE_ARRIVED"=>($isGateOut)?0:1
        ];
        $whereinfo = [
          // "SUPPLIER_ID"=>$result->SD_REFID,
          "LINE_ITEM"=>$oldLineItem,
          "VEHICAL_NO"=>$vehicleNo,
          "VEHICLE_ARRIVED"=>1
        ];
        $res1 = $this->db->table('supplier_vehical_info')->where($whereinfo)->whereIn("SUPPLIER_ID",$supplierIds)->update($vhinfo);
      }
    }
    $this->db->transComplete();
    if ($this->db->transStatus() === FALSE){
      $this->db->transRollback();
      return 0;
    }
    return 1;   
  }

}