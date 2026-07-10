<?php 
namespace App\Models;
use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use CodeIgniter\Model;
date_default_timezone_set("Asia/Calcutta");
class FCIModel extends Model
{
  public function getFCIPONumber($record){
    try {
      $filter = [];
      $plantFilter = [];
      if (isset($record->plantIds)) {
        $plantIds = $record->plantIds;
        foreach ($plantIds as $plantid) {
          array_push($plantFilter, "WERKS = '" . $plantid . "'");
        }
        if(count($plantFilter)>0){
          array_push($filter, "(" . join(" OR ", $plantFilter) . ")");
        }
      }
      $cond = [];
      array_push($cond, "INCO1 = 'SDG' OR INCO1 = 'SAK' OR INCO1 = 'RDG'");
      array_push($filter, "(" . join(" OR ", $cond) . ")");
  
      $fetchsql =
      $this->db->query("select DISTINCT EBELN as value, EBELN as label, 'SDI' as mkey, PURCHASE_ORG_DESC as vehicleType from sap_to_pp where ".join(" AND ", $filter) ." AND PURCHASE_ORG = 15  order by EBELN desc ");
      $poRecords = $fetchsql->getResultArray();
      $poRecords = array($poRecords);
      return  $poRecords;
    } catch (Throwable $th) {
      return json_encode(["success" => 0]);
    }
  }

  public function FCILoadInsert($Data,$Data1,$COST_TYPE,$LOAD,$FREIGHT,$WB_PATH,$INVOICE_PATH){	
    $CurrentDateTime=date("Y-m-d H:i:s");
		$this->db->table('supplier_dispatch_info')->set($Data)->insert();
    $InsId=$this->insertID();
    $Data1 = json_decode($Data1[0]);
    foreach($Data1 as $POST) {
      $builder = $this->db->table("supplier_vehical_info");
      $builder=$builder->select("SUP_VE_REFID,TRIP_ID");
      $builder=$builder->orderBy('SUP_VE_REFID', 'DESC')
                  ->limit(1)
                  ->get()
                  ->getResultArray();
      $transcation_unique_no = $builder[0]['TRIP_ID'];
      $res = VANumberHelper::VANumberHelper('FC',$Data['WERKS'],$transcation_unique_no);
      $OFFICE_PER_TON = round($POST->ZSUPPLIER_INV_QTY/1000);
      $OFFICE_EXPENSE_KG = round($OFFICE_PER_TON*$POST->OFFICE_EXPENSE);
      $FREIGHT_COST_KG = round($OFFICE_PER_TON*$POST->FREIGHT_CHARGE);
      $supplier_vehicle_info = array (
      "DateAdded"=>$CurrentDateTime,
      "SUPPLIER_ID"=> $InsId,
      "VEHICAL_NO"=>$POST->vehical_no,
      "WB_QTY"=>$POST->supplier_wb_qty,
      "WB_DT"=>$POST->supplier_wb_date,
      "SEAL_NO"=>'',
      "NO_OF_WAGON"=>'',
      "ZSUPPLIER_INV_RATE"=>$POST->ZSUPPLIER_INV_RATE,
      "ZSUPPLIER_INV_NO"=>$POST->ZSUPPLIER_INV_NO,
      "ZSUPPLIER_INV_DT"=>$POST->ZSUPPLIER_INV_DT,
      "ZSUPPLIER_INV_QTY"=>$POST->ZSUPPLIER_INV_QTY,
      "PLANT_ID"=>$Data['WERKS'],
      "TRIPSHEET_NO"=>$POST->tripsheetno,            
      "ATTI_COOLI"=>$POST->ATTI_COOLI,            
      "EXTRA_CHARGE"=>$POST->EXTRA_CHARGE,            
      "OFFICE_EXPENSE"=>$POST->OFFICE_EXPENSE,            
      "WEIGHTMENT_CHARGE"=>$POST->WEIGHTMENT_CHARGE,            
      "GATE_EXPENSE"=>$POST->GATE_EXPENSE,
      "OFFICE_EXPENSE_KG"=>$OFFICE_EXPENSE_KG,
      "OVERALL_EXPENSE"=>$POST->ATTI_COOLI+$POST->EXTRA_CHARGE+$POST->WEIGHTMENT_CHARGE+$POST->GATE_EXPENSE+ $OFFICE_EXPENSE_KG,       
      "COMPANYNAME"=>$POST->COMPANYNAME,            
      "STREETNO"=>$POST->STREETNO,            
      "STREETNAME"=>$POST->STREETNAME,            
      "CITY"=>$POST->CITY,            
      "STATE"=>$POST->STATE,
      "POSTCODE"=>$POST->POSTCODE,
      "REGION"=>$POST->REGION, 
      "GSTNUMBER"=>$POST->GSTNUMBER,                 
      "FREIGHT_COST"=>$POST->FREIGHT_CHARGE,
      "FREIGHT_COST_KG"=>$FREIGHT_COST_KG,
      "PO_LOAD_COST"=>$LOAD*$OFFICE_PER_TON,
      "PO_FREIGHT_COST"=>$FREIGHT*$OFFICE_PER_TON,
      "COST_TYPE"=>$COST_TYPE,        
      //"LINE_ITEM"=>$POST->LINE_ITEM,
      "TRIP_ID"=>$res,
      "TRIPSHEET_NO1"=>$POST->tripsheetno1 == 'null' ? '' : $POST->tripsheetno1,
      "VEHICLE_ARRIVED"=>0,
      "LINE_ITEM"=>$Data['ZPO_LINE_ITEM'],
      "INV_COPY"=>$INVOICE_PATH,
      "WB_COPY"=>$WB_PATH,                
    );
    $this->db->table('supplier_vehical_info')->set($supplier_vehicle_info)->insert();
    $InsId1=$this->insertID();
  }
		return $InsId1;
  }

  public function getSDIVehicleList($searchTxt){

    $Qry = "SELECT SUP_VE_REFID,ZVA_NUMBER FROM supplier_vehical_info 
    JOIN purchase_info pp ON purchase_info_id = pp.PI_REFID
    WHERE FCI_STATUS = 1 and purchase_info_id > 0 and VEHICLE_ARRIVED = 1";
    $vehicle_assignment = $this->db->query($Qry)->getResultArray();
    foreach ($vehicle_assignment as $resultRow) {
      $va_number = $resultRow['ZVA_NUMBER'];
      $SUP_VE_REFID = $resultRow['SUP_VE_REFID'];
      $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900&va_number=$va_number";
      $result = SapUrlHelper::getWhDatas($urlPath);
      $res = json_decode($result, true);
      // print_r($res);exit;
      if(strlen($res[0]['VA_NUMBER']) > 0 && $va_number == $res[0]['VA_NUMBER'] && $res[0]['LP_POSTING_FLAG'] == 'X' && $res[0]['LOAD_POST_FLAG'] == 'X'){
        $this->db->table('supplier_vehical_info')->set('FCI_STATUS',2)->where('SUP_VE_REFID',$SUP_VE_REFID)->update(); 
      }
      $urlPath1 ="ZFCI_TS_TRIP_RE/FCIrakerejecttripsheet?SAP-client=900";
      $result1 = SapUrlHelper::getWhDatas($urlPath1);
      $res1 = json_decode($result1, true);
      if(strlen($res1[0]['VA_NUMBER'])>0){
        foreach ($res1 as $resultRows1) {
        $ZVA_NUMBER = trim($resultRows1['VA_NUMBER']);  
        // $this->db->table('supplier_vehical_info')->set('FCI_STATUS',1)->where('SUP_VE_REFID',$SUP_VE_REFID_REJECT)->update(); 
        $sql = "UPDATE supplier_vehical_info AS a JOIN purchase_info AS b ON a.PI_REFID = b.purchase_info_id SET FCI_STATUS = 1 WHERE b.ZVA_NUMBER = $ZVA_NUMBER  ASC LIMIT";
        $this->db->query($sql);

        }
      }
    }
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
   
  $builder =  $this->db->query("SELECT SUP_VE_REFID, VEHICAL_NO, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT,EDA,PLANT_NAME,ZPO_NUMBER,ZSUPPLIER_NAME,purchase_info_id,FCI_STATUS  FROM supplier_vehical_info 
  LEFT JOIN master_plant mp ON PLANT_ID = mp.WERKS,supplier_dispatch_info
  where SUPPLIER_ID = SD_REFID ".$SearchCondition." AND VEHICLE_TYPE IN ('FCI Truck') AND FCI_STATUS IN (0,1) GROUP BY SUP_VE_REFID");
  
  return  $builder->getResultArray();
  }
  public function getSDIVehicleListCount($searchTxt){
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
    $builder =  $this->db->query("SELECT COUNT(*) as count FROM supplier_vehical_info 
    JOIN master_plant mp ON PLANT_ID = mp.WERKS,supplier_dispatch_info
    where VEHICLE_ARRIVED = 0 AND VEHICLE_TYPE IN ('FCI Truck') AND FCI_STATUS IN (0,1) GROUP BY SUP_VE_REFID");
    return  $builder->getFirstRow()->count;
  }
  public function getSDIDetailById($id){
    $builder =  $this->db->query("SELECT 
    SUP_VE_REFID, SUPPLIER_ID, VEHICAL_NO, WB_QTY, WB_DT, SEAL_NO, NO_OF_WAGON, INV_COPY, WB_COPY, ZSUPPLIER_INV_RATE, ZSUPPLIER_INV_NO, ZSUPPLIER_INV_DT, ZSUPPLIER_INV_QTY, LINE_ITEM, ZPO_NUMBER, ZSUPPLIER_NAME, ZSUPPLIER_CODE, VEHICLE_TYPE, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT, EDA, PLANT_NAME, mves.VESSEL_NAME, FUMIGATION, LINER_NAME, VESSEL_NO ,TRIPSHEET_NO,ATTI_COOLI,EXTRA_CHARGE,OFFICE_EXPENSE,WEIGHTMENT_CHARGE,GATE_EXPENSE,COST_TYPE,FREIGHT_COST,purchase_info_id,FCI_STATUS,VEHICLE_ARRIVED
    -- ATTI_COOLI_LOAD,EXTRA_CHARGE_LOAD,OFFICE_EXPENSE_LOAD,WEIGHTMENT_CHARGE_LOAD,GATE_EXPENSE_LOAD 
    FROM supplier_dispatch_info sdi 
    LEFT JOIN master_plant mp ON sdi.WERKS = mp.WERKS 
    LEFT JOIN master_vessel mves ON VESSEL_REFID = sdi.VESSEL_NAME, supplier_vehical_info where SUPPLIER_ID = SD_REFID AND SUP_VE_REFID =$id");
    return  $builder->getResultArray();
  }

  public function updatePoLineById($POST,$SupplierId,$eway_no){
  
    $session = session();
    $SessionUser=$POST->USERID;
    $SessionUserName=$POST->USER_NAME;
    $SupplierDispatchRedirectDt=date("Y-m-d H:i:s");

    $poline1 =[
      "ZPO_LINE_ITEM"=>$POST->lineItem,
    ];  
    $this->db->table('supplier_dispatch_info')->where('SD_REFID',$SupplierId)->update($poline1); 
    $po_details =[
      "PO_LINE_ITEM"=>$POST->lineItem,
      "WERKS"=>$POST->plantId,
      "LGORT"=>$POST->storage_location
    ];
    $this->db->table('purchase_info')->where("TRUCK_NO = '$POST->vehicle_id'")->where('VECHICAL_STATUS',1)->update($po_details); 
    $EWAYBILLNO = '';
    $eway_no1 = '';
    if($eway_no != 0) {
      $eway_no1 = $eway_no;
      $EWAYBILLNO = 'EWAYBILLNO';
    }
    
    $poline =[
          "LINE_ITEM"=>$POST->lineItem,
          "PLANT_ID"=>$POST->plantId,
          "SupplierDispatchRedirectBy"=>$SessionUser,
          "SupplierDispatchRedirectByName"=>$SessionUserName,
          "SupplierDispatchRedirectDt"=>$SupplierDispatchRedirectDt,
          // "VEHICAL_NO"=>$POST->vehicle_id,
          // "TRIPSHEET_NO"=>$POST->tripsheetno,          
          "ATTI_COOLI"=>$POST->ATTI_COOLI,            
          "EXTRA_CHARGE"=>$POST->EXTRA_CHARGE,            
          "OFFICE_EXPENSE"=>$POST->OFFICE_EXPENSE,            
          "WEIGHTMENT_CHARGE"=>$POST->WEIGHTMENT_CHARGE,            
          "GATE_EXPENSE"=>$POST->GATE_EXPENSE,
          "OFFICE_EXPENSE_KG"=>$POST->OFFICE_EXPENSE_KG,
          "OVERALL_EXPENSE"=>$POST->ATTI_COOLI+$POST->EXTRA_CHARGE+$POST->WEIGHTMENT_CHARGE+$POST->GATE_EXPENSE+ $POST->OFFICE_EXPENSE_KG,                
          "COST_TYPE"=>$POST->COST_TYPE,
          // "ATTI_COOLI_LOAD"=>$POST->ATTI_COOLI_LOAD,            
          // "EXTRA_CHARGE_LOAD"=>$POST->EXTRA_CHARGE_LOAD,            
          // "OFFICE_EXPENSE_LOAD"=>$POST->OFFICE_EXPENSE_LOAD,            
          // "WEIGHTMENT_CHARGE_LOAD"=>$POST->WEIGHTMENT_CHARGE_LOAD,            
          // "GATE_EXPENSE_LOAD"=>$POST->GATE_EXPENSE_LOAD,
          // "OFFICE_EXPENSE_KG_LOAD"=>$POST->OFFICE_EXPENSE_KG_LOAD,
          // "OVERALL_EXPENSE_LOAD"=>$POST->ATTI_COOLI_LOAD+$POST->EXTRA_CHARGE_LOAD+$POST->WEIGHTMENT_CHARGE_LOAD+$POST->GATE_EXPENSE_LOAD+ $POST->OFFICE_EXPENSE_KG_LOAD,    
          "FREIGHT_COST"=>$POST->FREIGHT_COST,
          "PO_LOAD_COST"=>$POST->PO_LOAD_COST,
          "FREIGHT_COST_KG"=>$POST->FREIGHT_COST_KG,
          "PO_FREIGHT_COST"=>$POST->PO_FREIGHT_COST,
          "FCI_STATUS"=>1,
        ];
        if ($EWAYBILLNO) {
          $poline[$EWAYBILLNO] = $eway_no1;
         }
    return $this->db->table('supplier_vehical_info')->where('SUP_VE_REFID',$POST->id)->update($poline);
  }

  public function FCI_Cost_Details(){
    $builder =  $this->db->query("SELECT * FROM pp_setting where Id = 1");
    return  $builder->getResultArray();
  }

  public function PP_Setting_Update($Data){
	
		$InsId=$this->db->table('pp_setting')->set($Data)->where('id',1)->update();
		return  $InsId;
  } 

  public function FCI_Location_Details(){
    $builder = $this->db->table("master_from_location");
    $builder = $builder->select("description as value, description as label");
    $builder =  $builder->where("state", 'TN');

    
    return  $builder->orderBy('id', 'DESC')->get()->getResultArray();
  }
  public function DeliveryChallanPrintForm($SupplierId){
    $builder = $this->db->table("supplier_vehical_info");
    $builder = $builder->select("supplier_vehical_info.*,DATE_FORMAT(supplier_vehical_info.ZSUPPLIER_INV_DT, '%d-%m-%Y') AS delivery_date");
    $builder =  $builder->where("SUP_VE_REFID", $SupplierId);
    return  $builder->get()->getResultArray();
  }

  public function CompanyAddressDetails($PlantCode){
    $builder = $this->db->table("master_plant_address");
    $builder = $builder->select("*");
    $builder =  $builder->where("masterPlantId", $PlantCode);
    return  $builder->limit(1)->get()->getResultArray();
  }
}
