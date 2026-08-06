<?php 
namespace App\Models;
use CodeIgniter\Model;
date_default_timezone_set("Asia/Calcutta");
class SDIModel extends Model
{
  public function getSDIVehicleList(){
    $builder =  $this->db->query("SELECT SUP_VE_REFID, VEHICAL_NO, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT,EDA, PLANT_NAME FROM supplier_vehical_info LEFT JOIN master_plant mp ON PLANT_ID = mp.WERKS, supplier_dispatch_info,purchase_info_id where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID AND VEHICLE_TYPE IN ('TRUCK','Container','Cm Truck','Cm Container')");
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
   
  $builder =  $this->db->query("SELECT SUP_VE_REFID, VEHICAL_NO, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT,EDA, PLANT_NAME,ZPO_NUMBER,ZSUPPLIER_NAME,VEHICLE_TYPE,purchase_info_id  FROM supplier_vehical_info LEFT JOIN master_plant mp ON PLANT_ID = mp.WERKS, supplier_dispatch_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID ".$SearchCondition." AND VEHICLE_TYPE IN ('TRUCK','Container','Cm Truck','Cm Container')");
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
    $builder =  $this->db->query("SELECT COUNT(*) as count FROM supplier_dispatch_info , supplier_vehical_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID ".$SearchCondition." AND VEHICLE_TYPE IN ('TRUCK','Container','Cm Truck','Cm Container')");
    return  $builder->getFirstRow()->count;
  }
  public function getSDIVehicleListCount(){
    $builder =  $this->db->query("SELECT COUNT(*) as count FROM supplier_dispatch_info , supplier_vehical_info where VEHICLE_ARRIVED = 0 AND SUPPLIER_ID = SD_REFID AND VEHICLE_TYPE IN ('TRUCK','Container','Cm Truck','Cm Container')");
    return  $builder->getFirstRow()->count;
  }
  public function getSDIDetailById($id){
    $builder =  $this->db->query("SELECT 
    SUP_VE_REFID, SUPPLIER_ID, VEHICAL_NO, WB_QTY, WB_DT, SEAL_NO, NO_OF_WAGON, INV_COPY, WB_COPY, ZSUPPLIER_INV_RATE, ZSUPPLIER_INV_NO, ZSUPPLIER_INV_DT, ZSUPPLIER_INV_QTY, LINE_ITEM, ZPO_NUMBER, ZSUPPLIER_NAME, ZSUPPLIER_CODE, VEHICLE_TYPE, ZSUPPLIER_LOAD_POINT, ZSUPPLIER_LOAD_DT, EDA, PLANT_NAME, mves.VESSEL_NAME, FUMIGATION, LINER_NAME, VESSEL_NO,purchase_info_id FROM supplier_dispatch_info sdi LEFT JOIN master_plant mp ON sdi.WERKS = mp.WERKS LEFT JOIN master_vessel mves ON VESSEL_REFID = sdi. VESSEL_NAME, supplier_vehical_info where SUPPLIER_ID = SD_REFID AND SUP_VE_REFID = ".$id);
    return  $builder->getResultArray();
  }
  public function getSDIPOLineItem($poNumber, $supplierCode){
    $builder =  $this->db->query("SELECT DISTINCT EBELP as label, EBELP as value from sap_to_pp where EBELN = '" . $poNumber . "' AND SUPPLIER_CODE = '$supplierCode' AND LOEKZ != 'D'");
    return  $builder->getResultArray();
  }
  public function deleteSDILineById($id){
    
  return $this->db->table('supplier_vehical_info')->where('SUP_VE_REFID',$id)->delete();
  }
  public function updatePoLineById($id,$lineItem,$plantId,$SupplierId,$vehicle_no,$storage_location){
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
$po_details =[
  "PO_LINE_ITEM"=>$lineItem,
  "WERKS"=>$plantId,
  "LGORT"=>$storage_location
];
$this->db->table('purchase_info')->where("CONTAINER_NO = '$vehicle_no' OR TRUCK_NO = '$vehicle_no'")->where('VECHICAL_STATUS',1)->update($po_details); 
$poline =[
      "LINE_ITEM"=>$lineItem,
      "PLANT_ID"=>$plantId,
      "SupplierDispatchRedirectBy"=>$SessionUser,
      "SupplierDispatchRedirectByName"=>$SessionUserName,
      "SupplierDispatchRedirectDt"=>$SupplierDispatchRedirectDt,
      "VEHICAL_NO"=>$vehicle_no
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
    $response = $this->db->table('purchase_info')->select(['PO_LINE_ITEM','WERKS','LGORT'])->where('PI_REFID',$id)->get()->getResultArray();
    if($isGateOut){
      $pinfo =[
        "QA_STATUS"=>'R',
        "VECHICAL_STATUS"=>5,
        "PO_LINE_ITEM"=>$response[0]['PO_LINE_ITEM'], 
        "WERKS"=>$response[0]['WERKS'],
        "LGORT"=>$response[0]['LGORT'],
        "REDIRECT_PO_LINE_ITEM"=>$lineItem, 
        "REDIRECT_WERKS"=>$plant_Id,
        "REDIRECT_LGORT"=>$storageId,
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
         "REDIRECT_PO_LINE_ITEM"=>$response[0]['PO_LINE_ITEM'], 
         "REDIRECT_WERKS"=>$response[0]['WERKS'],
         "REDIRECT_LGORT"=>$response[0]['LGORT'],
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
  public function getSDIPOLineItemRedirect($poNumber, $supplierCode,$VEHICLE_TYPE,$FNR_NO){
    if($VEHICLE_TYPE == 'RAKE'){
      $builder = $this->db->query("
          SELECT DISTINCT 
              supplier_dispatch_info.ZPO_LINE_ITEM as label, 
              supplier_dispatch_info.ZPO_LINE_ITEM as value
          FROM supplier_dispatch_info
          JOIN sap_to_pp 
              ON supplier_dispatch_info.ZPO_NUMBER = sap_to_pp.EBELN 
              AND supplier_dispatch_info.ZSUPPLIER_CODE = sap_to_pp.SUPPLIER_CODE 
              AND supplier_dispatch_info.ZPO_LINE_ITEM = sap_to_pp.EBELP
          WHERE 
              supplier_dispatch_info.ZPO_NUMBER = '" . $poNumber . "' 
              AND supplier_dispatch_info.ZSUPPLIER_CODE = '" . $supplierCode . "' 
              AND sap_to_pp.LOEKZ != 'D'
      ");

      return $builder->getResultArray();
    }else {
      $builder =  $this->db->query("SELECT DISTINCT EBELP as label, EBELP as value from sap_to_pp where EBELN = '" . $poNumber . "' AND SUPPLIER_CODE = '$supplierCode' AND LOEKZ != 'D'");
      return  $builder->getResultArray();
    }
  }
    public function Portreceivedate($postData)
    {
      // print_r($postData);exit;
      
      $status_info = array(
        "CONTAINER_PORT_RECEIVE" => $postData->postdate,
      );
      //print_r($status_info);exit;
      $this->db->table('supplier_vehical_info')->set($status_info)->where('SUP_VE_REFID', $postData->chckid)->update();
      $res = 1;
      return $res;
    }
    public function insertSupplierEntryBatch($data)
    {
        try {
            $db = \Config\Database::connect();

            // 🚨 DUPLICATE VEHICLE CHECK (status = 1 = Created/Active)
            $po = $data['purchaseOrderDetails'][0] ?? [];
            
            $existingVehicles = $db->table('supplier_entry')
                ->select('truckNo')
                ->where('status', 1)
                ->whereIn('purchaseMode', ['Truck', 'CM Truck', 'Container', 'CM Container'])
                ->get()
                ->getResultArray();

            $existingTruckNos = array_column($existingVehicles, 'truckNo');

            $existingVehicles1 = $db->table('supplier_entry')
                ->select('truckNo')
                ->where('status', 1)
                ->where('poNumber', $po['PO_NUMBER'])
                ->where('supplierCode', $po['SUPPLIER_CODE'])
                ->whereIn('purchaseMode', ['Rake', 'CM Rake'])
                ->get()
                ->getResultArray();

            $existingTruckNos1 = array_column($existingVehicles1, 'truckNo');
            $existingTruckNo = array_merge($existingTruckNos, $existingTruckNos1);    
            foreach ($data['vehicles'] as $vehicle) {
                $truckNo = trim($vehicle['vehicleNo'] ?? '');
                if (!empty($truckNo) && in_array($truckNo, $existingTruckNo)) {
                    return [
                        'success' => false,
                        'message' => "The truck details '{$truckNo}' already exists"
                    ];
                }
            }

            $db->transStart();
            
            $batchData = [];
            
            // print_r($data);exit;
            // Safe defaults for NOT NULL fields
            $headerData = [
                'poNumber'      => $po['PO_NUMBER'] ?? 'N/A',  
                'brokerCode'    => $po['VENDOR_CODE'] ?? 'N/A',
                'brokerName'    => $po['VENDOR_NAME'] ?? 'N/A',
                'supplierCode'  => $po['SUPPLIER_CODE'] ?? 'N/A',
                'supplierName'  => $po['SUPPLIER_NAME'] ?? 'N/A',
                'purchaseMode'  => !empty($po['PURCHASE_GROUP_DESCRIPTION']) 
                                  ? ucwords(strtolower($po['PURCHASE_GROUP_DESCRIPTION']))
                                  : $data['mode'] ?? 'TRUCK',
                'contractNo'    => $po['CONTRACT_NO'] ?? 'N/A',
                'poQty'         => (float)($data['poQty'] ?? 0),
                'loadingDueDate'=> !empty($po['PO_LOADING_DATE']) 
                                  ? date('Y-m-d', strtotime($po['PO_LOADING_DATE']))
                                  : date('Y-m-d'),
                'noOfTrucks'    => $po['NUMBER_OF_VEHICLES'] ?? '0',
                'createdBy'     => $data['user_id'] ?? 1,
            ];

            foreach ($data['vehicles'] as $vehicle) {
                $batchData[] = array_merge($headerData, [
                    // Vehicle fields - safe defaults
                    'truckNo'          => $vehicle['vehicleNo'] ?? '',
                    'noOfWagan'        => (int)($vehicle['wagons'] ?? 0),
                    'driverNo'         => (int)($vehicle['driver'] ?? 0),
                    'invoiceNo'        => $vehicle['invoiceNo'] ?? 'INV-' . time(),
                    'invoiceDate'      => !empty($vehicle['invoiceDate']) 
                                        ? date('Y-m-d', strtotime($vehicle['invoiceDate']))
                                        : date('Y-m-d'),
                    'invoiceQty'       => (float)($vehicle['invoiceQty'] ?? 0),
                    'invoiceRate'      => (float)($data['poRate'] ?? 0),
                    'loadingDate'      => !empty($vehicle['loadingDate']) 
                                        ? date('Y-m-d', strtotime($vehicle['loadingDate']))
                                        : date('Y-m-d'),
                    'expectedArrivalDt'=> !empty($vehicle['expArrivalDate']) 
                                        ? date('Y-m-d', strtotime($vehicle['expArrivalDate']))
                                        : date('Y-m-d', strtotime('+7 days')),
                    'loadingPoint'        => $vehicle['loadPoint'] ?? $data['loadingPoint'] ?? 'N/A',
                    'linerName'        => $vehicle['linerName'] ?? '',
                    // Attachments - empty string for NOT NULL
                    'invoiceCopy'      => $vehicle['attachments']['invoiceCopy'] ?? '',
                    'wbCopy'           => $vehicle['attachments']['wbCopy'] ?? '',
                    'rrCopy'           => $vehicle['attachments']['rrCopy'] ?? '',
                    'ewayBillCopy'     => $vehicle['attachments']['ewayCopy'] ?? '',
                    'status'           => 1,  // Created status
                    'city'             => $data['city'] ?? 'Unknown',
                ]);
            }
            // print_r($batchData);exit;
            // 🔥 DIRECT DB INSERT (matches your table exactly)
            $rowCount = $db->table('supplier_entry')->insertBatch($batchData);

            if ($rowCount === false || $rowCount <= 0) {
                $error = $db->error();
                $db->transRollback();
                throw new \Exception('DB Error #' . $error['code'] . ': ' . $error['message']);
            }

            $db->transComplete();
            return [
                'success'   => true,
                'message'   => "Saved {$rowCount} vehicle(s)",
                'row_count' => $rowCount
            ];

        } catch (\Exception $e) {
            if (isset($db) && $db->transStatus() === false) {
                $db->transRollback();
            }
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    public function getCustomMillingMiroDetailsByIdWheat($poNumbers)
    {

        // ------------------------
        // 1. Extract PO Numbers
        // ------------------------
        $poNumbersArray = [];
        if (!empty($poNumbers->poNumbers) && is_array($poNumbers->poNumbers)) {
            $poNumbersArray = array_column($poNumbers->poNumbers, 'value');
        }

        // ------------------------
        // 2. Extract Vendor Codes
        // ------------------------
        $vendorArray = [];
        if (!empty($poNumbers->vendorCode) && is_array($poNumbers->vendorCode)) {
            $vendorArray = array_column($poNumbers->vendorCode, 'value');
        }

        // ------------------------
        // 3. Extract Conditions
        // ------------------------
        $conditionArray = [];
        if (!empty($poNumbers->condtion) && is_array($poNumbers->condtion)) {
            $conditionArray = array_column($poNumbers->condtion, 'value');
        }

        // ------------------------
        // 4. Date Handling
        // ------------------------
        $fromDate = $poNumbers->fromDate;
        $toDate   = $poNumbers->toDate;

        if ($fromDate > 1000000000000) $fromDate /= 1000;
        if ($toDate > 1000000000000) $toDate /= 1000;

        // ------------------------
        // 5. Base Query
        // ------------------------
        $builder = $this->db->table('purchase_info');

        $builder->select("
            purchase_info.ZPO_NUMBER,
            purchase_info.ZVENDOR_NAME,
            purchase_info.WERKS,
            purchase_info.VEHICLE_TYPE,
            purchase_info.ZVA_NUMBER AS vaNumber,
            purchase_info.TRUCK_NO,
            purchase_info.PI_REFID,

            custom_milling_po_condtion.condition_type_code,
            CONCAT(
                custom_milling_po_condtion.condition_type_code,' - ',
                custom_milling_po_condtion.condition_description
            ) AS condition_description,

            ROUND(
                SUM(gateout_info.gunny_less_wt)/1000
                - COALESCE((
                    SELECT SUM(cmfe.overall_tonnage) FROM custom_milling_fi_entry cmfe
                    WHERE cmfe.condition_id = custom_milling_po_condtion.id
                    AND cmfe.status != 0
                    AND cmfe.puchase_info_id NOT LIKE '%,%'
                    AND cmfe.puchase_info_id LIKE CONCAT('%', purchase_info.PI_REFID, '%')
                ), 0)
            ,3) AS gunny_less_wt,

            custom_milling_po_condtion.*,
            custom_milling_po_condtion.id as rmd_id, 

            ROUND(
                (
                    SUM(gateout_info.gunny_less_wt)/1000
                    - COALESCE((
                        SELECT SUM(cmfe.overall_tonnage) FROM custom_milling_fi_entry cmfe
                        WHERE cmfe.condition_id = custom_milling_po_condtion.id
                        AND cmfe.status != 0
                        AND cmfe.puchase_info_id NOT LIKE '%,%'
                        AND cmfe.puchase_info_id LIKE CONCAT('%', purchase_info.PI_REFID, '%')
                    ), 0)
                ) * custom_milling_po_condtion.rate,
                2
            ) AS condition_amount,

            ROUND(
                (
                    SUM(gateout_info.gunny_less_wt)/1000
                    - COALESCE((
                        SELECT SUM(cmfe.overall_tonnage) FROM custom_milling_fi_entry cmfe
                        WHERE cmfe.condition_id = custom_milling_po_condtion.id
                        AND cmfe.status != 0
                        AND cmfe.puchase_info_id NOT LIKE '%,%'
                        AND cmfe.puchase_info_id LIKE CONCAT('%', purchase_info.PI_REFID, '%')
                    ), 0)
                ) * custom_milling_po_condtion.rate,
                2
            ) AS actual_amount,

            gateout_info.invoice_no,
            gateout_info.invoice_date,
            pp_setting.customMillingGl,
            pp_setting.customMillingCostCenter,
            pp_setting.customMillingProfitCenter
        ");
        $builder->join(
            'gateout_info',
            'gateout_info.purchase_info_id = purchase_info.PI_REFID',
            'inner'
        );
        $builder->join(
            'sap_to_pp',
            'sap_to_pp.EBELN = purchase_info.ZPO_NUMBER AND sap_to_pp.EBELP = purchase_info.PO_LINE_ITEM AND sap_to_pp.SUPPLIER_CODE AND purchase_info.ZSUPPLIER_CODE',
            'inner'
        );
        // ------------------------
        // 6. Joins
        // ------------------------
        // $builder->join(
        //     'rate_master_custom_milling',
        //     'rate_master_custom_milling.material_description = purchase_info.IDNLF',
        //     'inner'
        // );
        // $builder->join(
        //     'definitions_list',
        //     "definitions_list.id = rate_master_custom_milling.purchase_org_id AND definitions_list.definitionsName = purchase_info.VEHICLE_TYPE",
        //     'inner'
        // );
        $builder->join(
            'custom_milling_po_condtion',
            'custom_milling_po_condtion.pp_line_id = sap_to_pp.refid',
            'inner'
        );
        $builder->join(
            'pp_setting',
            'pp_setting.Id = 1',
            'inner'
        );
       

        // ------------------------
        // 7. Base Conditions
        // ------------------------
        $builder->where('purchase_info.VECHICAL_STATUS', 7);
        $builder->where('purchase_info.MIGO_NUM IS NOT NULL');
        $builder->where("purchase_info.MIGO_NUM != ''");
        // $builder->where('purchase_info.MIGO501 IS NOT NULL');

        // $builder->where('rate_master_custom_milling.vaild_to >= NOW()');
        $builder->where('custom_milling_po_condtion.status', 1);

        $builder->whereIn('purchase_info.VEHICLE_TYPE', ['Cm Truck','Cm Container']);
        $builder->whereNotIn('custom_milling_po_condtion.condition_type_code', ['MATE']);
        $builder->where('custom_milling_po_condtion.rate > 0');
        // ------------------------
        // 8. Date Filter
        // ------------------------
        if ($fromDate == 0) {

            $builder->limit(50);

        } else {

            $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
            $toDate1   = date("Y-m-d 23:59:59", $toDate);

            $builder->where("purchase_info.DateAdded >=", $fromDate1);
            $builder->where("purchase_info.DateAdded <=", $toDate1);
        }

        // ------------------------
        // 9. Optional Filters
        // ------------------------
        if (!empty($poNumbersArray)) {
            $builder->whereIn('purchase_info.ZPO_NUMBER', $poNumbersArray);
        }

        if (!empty($conditionArray)) {
            $builder->whereIn(
                'custom_milling_po_condtion.condition_type_code',
                $conditionArray
            );
        }

        if (!empty($vendorArray)) {
            $builder->whereIn('purchase_info.ZVENDOR_CODE', $vendorArray);
        }

        // ------------------------
        // 10. GROUP BY (Vehicle + Condition)
        // ------------------------
        $builder->groupBy([
            'custom_milling_po_condtion.condition_type_code',
            'purchase_info.PI_REFID',
        ]);

        // ------------------------
        // 10b. Exclude PI_REFID + Condition combinations already paid as part of a
        //      multi-truck entry (can't be reduced to a remaining tonnage since the
        //      per-truck paid share isn't stored) - recorded in
        //      custom_milling_fi_entry.puchase_info_id
        // ------------------------
        $builder->where("NOT EXISTS (
            SELECT 1 FROM custom_milling_fi_entry cmfe
            WHERE cmfe.puchase_info_id LIKE CONCAT('%', purchase_info.PI_REFID, '%')
            AND cmfe.puchase_info_id LIKE '%,%'
            AND cmfe.condition_id = custom_milling_po_condtion.id
            AND cmfe.status != 0
        )", null, false);

        // ------------------------
        // 10c. For single-truck entries, hide the row once the remaining tonnage
        //      (current tonnage minus already-paid tonnage) is used up
        // ------------------------
        $builder->having("gunny_less_wt > 0");
        // print_r($builder->getCompiledSelect());exit;
        // ------------------------
        // 11. Execute
        // ------------------------
        return $builder->get()->getResultArray();
    }
    public function getCustomMillingMiroDetailsByIdWheatRake($poNumbers)
    {
        // -------------------------
        // 1. Extract PO Numbers
        // -------------------------
        $poNumbersArray = [];
        if (!empty($poNumbers->poNumbers) && is_array($poNumbers->poNumbers)) {
            $poNumbersArray = array_column($poNumbers->poNumbers, 'value');
        }

        // -------------------------
        // 2. Extract Vendors
        // -------------------------
        $vendorArray = [];
        if (!empty($poNumbers->vendorCode) && is_array($poNumbers->vendorCode)) {
            $vendorArray = array_column($poNumbers->vendorCode, 'value');
        }

        // -------------------------
        // 3. Extract Conditions
        // -------------------------
        $conditionArray = [];
        if (!empty($poNumbers->condtion) && is_array($poNumbers->condtion)) {
            $conditionArray = array_column($poNumbers->condtion, 'value');
        }

        // -------------------------
        // 4. Date Handling
        // -------------------------
        $fromDate = $poNumbers->fromDate;
        $toDate   = $poNumbers->toDate;

        if ($fromDate > 1000000000000) $fromDate /= 1000;
        if ($toDate > 1000000000000) $toDate /= 1000;

        // -------------------------
        // 5. Base Table
        // -------------------------
        $builder = $this->db->table('purchase_info');

        // -------------------------
        // 6. SELECT
        // -------------------------
        $builder->select("
            purchase_info.ZPO_NUMBER,
            purchase_info.ZVENDOR_NAME,
            purchase_info.WERKS,
            purchase_info.VEHICLE_TYPE,
            purchase_info.ZVA_NUMBER AS vaNumber,
            GROUP_CONCAT(purchase_info.PI_REFID) AS PI_REFID,
            custom_milling_po_condtion.condition_type_code,
            CONCAT(custom_milling_po_condtion.condition_type_code,' - ',
            custom_milling_po_condtion.condition_description) AS condition_description,
            ROUND(
                SUM(gateout_info.gunny_less_wt/1000)
                - COALESCE((
                    SELECT SUM(cmfe.overall_tonnage) FROM custom_milling_fi_entry cmfe
                    WHERE cmfe.po_numbers LIKE CONCAT('%', purchase_info.ZPO_NUMBER, '%')
                    AND cmfe.status != 0
                    AND FIND_IN_SET(cmfe.condition_id, GROUP_CONCAT(custom_milling_po_condtion.id))
                ), 0)
            ,3) AS gunny_less_wt,
            custom_milling_po_condtion.*,
            custom_milling_po_condtion.id as rmd_id,
            gateout_info.invoice_no,
            gateout_info.invoice_date,
            ROUND(
                (
                    SUM(gateout_info.gunny_less_wt/1000)
                    - COALESCE((
                        SELECT SUM(cmfe.overall_tonnage) FROM custom_milling_fi_entry cmfe
                        WHERE cmfe.po_numbers LIKE CONCAT('%', purchase_info.ZPO_NUMBER, '%')
                        AND cmfe.status != 0
                        AND FIND_IN_SET(cmfe.condition_id, GROUP_CONCAT(custom_milling_po_condtion.id))
                    ), 0)
                ) * custom_milling_po_condtion.rate,
                2
            ) AS condition_amount,
            ROUND(
                (
                    SUM(gateout_info.gunny_less_wt/1000)
                    - COALESCE((
                        SELECT SUM(cmfe.overall_tonnage) FROM custom_milling_fi_entry cmfe
                        WHERE cmfe.po_numbers LIKE CONCAT('%', purchase_info.ZPO_NUMBER, '%')
                        AND cmfe.status != 0
                        AND FIND_IN_SET(cmfe.condition_id, GROUP_CONCAT(custom_milling_po_condtion.id))
                    ), 0)
                ) * custom_milling_po_condtion.rate,
                2
            ) AS actual_amount,
            GROUP_CONCAT(custom_milling_po_condtion.id) AS rmd_ids,
            pp_setting.customMillingGl,
            pp_setting.customMillingCostCenter,
            pp_setting.customMillingProfitCenter
        ");
        $builder->join(
            'sap_to_pp',
            'sap_to_pp.EBELN = purchase_info.ZPO_NUMBER AND sap_to_pp.EBELP = purchase_info.PO_LINE_ITEM AND sap_to_pp.SUPPLIER_CODE AND purchase_info.ZSUPPLIER_CODE',
            'inner'
        );
        // -------------------------
        // 7. JOINS
        // -------------------------
        // $builder->join(
        //     'rate_master_custom_milling',
        //     'rate_master_custom_milling.material_description = purchase_info.IDNLF',
        //     'inner'
        // );
        // $builder->join(
        //     'definitions_list',
        //     "definitions_list.id = rate_master_custom_milling.purchase_org_id AND definitions_list.definitionsName = purchase_info.VEHICLE_TYPE",
        //     'inner'
        // );
        // $builder->join(
        //     'rate_master_details_custom_milling',
        //     'rate_master_details_custom_milling.rm_id = rate_master_custom_milling.rm_id',
        //     'inner'
        // );
        $builder->join(
            'custom_milling_po_condtion',
            'custom_milling_po_condtion.pp_line_id = sap_to_pp.refid',
            'inner'
        );
        $builder->join(
            'gateout_info',
            'gateout_info.purchase_info_id = purchase_info.PI_REFID',
            'inner'
        );
        $builder->join(
            'pp_setting',
            'pp_setting.Id = 1',
            'inner'
        );
        // -------------------------
        // 8. CONDITIONS
        // -------------------------
        $builder->where('purchase_info.VECHICAL_STATUS', 7);
        $builder->where('purchase_info.MIGO_NUM IS NOT NULL');
        $builder->where("purchase_info.MIGO_NUM != ''");

        // $builder->where('rate_master_custom_milling.vaild_to >= NOW()');
        $builder->where('custom_milling_po_condtion.status', 1);

        $builder->whereIn('purchase_info.VEHICLE_TYPE', ['Cm Rake']);
        $builder->whereNotIn('custom_milling_po_condtion.condition_type_code', ['MATE']);
        $builder->where('custom_milling_po_condtion.rate > 0');
        // -------------------------
        // 9. DATE FILTER
        // -------------------------
        if ($fromDate == 0) {

            $builder->limit(50);

        } else {

            $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
            $toDate1   = date("Y-m-d 23:59:59", $toDate);

            $builder->where("purchase_info.DateAdded >=", $fromDate1);
            $builder->where("purchase_info.DateAdded <=", $toDate1);
        }

        // -------------------------
        // 10. OPTIONAL FILTERS
        // -------------------------
        if (!empty($poNumbersArray)) {
            $builder->whereIn('purchase_info.ZPO_NUMBER', $poNumbersArray);
        }

        if (!empty($conditionArray)) {
            $builder->whereIn(
                'custom_milling_po_condtion.condition_type_code',
                $conditionArray
            );
        }

        if (!empty($vendorArray)) {
            $builder->whereIn('purchase_info.ZVENDOR_CODE', $vendorArray);
        }

        // -------------------------
        // 11. GROUP BY
        // -------------------------
        $builder->groupBy([
            'purchase_info.ZPO_NUMBER',
            'purchase_info.WERKS',
            'custom_milling_po_condtion.condition_type_code'   
        ]);

        // -------------------------
        // 11b. Hide PO + Condition combinations already fully paid
        // -------------------------
        $builder->having("gunny_less_wt > 0");
        // print_r($builder->getCompiledSelect());exit;
        // -------------------------
        // 12. EXECUTE
        // -------------------------
        // print_r($builder->getCompiledSelect());exit;
        $parentData = $builder->get()->getResultArray();

        $allIds = [];
        $conditionCodes = [];
        foreach ($parentData as $row) {
            if (!empty($row['PI_REFID'])) {
                $allIds = array_merge($allIds, explode(',', $row['PI_REFID']));
            }
            if (!empty($row['condition_type_code'])) {
                $conditionCodes[] = $row['condition_type_code'];
            }
        }
        $allIds = array_values(array_unique($allIds));
        $conditionCodes = array_values(array_unique($conditionCodes));

        $childData = [];

        if (!empty($allIds)) {
            $childData = $this->db->table('purchase_info pi')
                ->select("
                    pi.PI_REFID,
                    pi.ZVA_NUMBER,
                    pi.ZPO_NUMBER,
                    pi.ZVENDOR_NAME,
                    pi.ZSUPPLIER_CODE,
                    pi.WERKS,
                    pi.TRUCK_NO,
                    rmdcm.condition_type_code,
                    ROUND(SUM(gi.gunny_less_wt/1000),3) AS total_gunny_less_wt,
                    rmdcm.rate,
                    ROUND(SUM(gi.gunny_less_wt/1000 * rmdcm.rate),2) AS condition_amount,
                    gi.invoice_no
                ")
                ->join(
                    'gateout_info gi',
                    'gi.purchase_info_id = pi.PI_REFID',
                    'inner'
                )
                // ->join(
                //     'rate_master_custom_milling rmcm',
                //     'rmcm.material_description = pi.IDNLF',
                //     'inner'
                // )
                // ->join(
                //     'definitions_list dl',
                //     "dl.id = rmcm.purchase_org_id AND dl.definitionsName = pi.VEHICLE_TYPE",
                //     'inner'
                // )+
                ->join(
                    'sap_to_pp',
                    'sap_to_pp.EBELN = pi.ZPO_NUMBER AND sap_to_pp.EBELP = pi.PO_LINE_ITEM AND sap_to_pp.SUPPLIER_CODE AND pi.ZSUPPLIER_CODE',
                    'inner'
                )
                ->join(
                    'custom_milling_po_condtion rmdcm',
                    'rmdcm.pp_line_id = sap_to_pp.refid',
                    'inner'
                )
                // ->join(
                //     'rate_master_details_custom_milling rmdcm',
                //     'rmdcm.rm_id = rmcm.rm_id',
                //     'inner'
                // )
                ->whereIn('pi.PI_REFID', $allIds)
                ->whereIn('rmdcm.condition_type_code', $conditionCodes)
                ->orderBy('pi.PI_REFID', 'ASC')
                ->groupBy(['pi.PI_REFID', 'rmdcm.condition_type_code'])
                ->get()
                ->getResultArray();
        }

        // Group child rows by PI_REFID + condition_type_code so each parent
        // row only picks up the lines that actually match its own condition.
        $groupedChild = [];
        foreach ($childData as $child) {
            $groupedChild[$child['PI_REFID']][$child['condition_type_code']][] = $child;
        }

        foreach ($parentData as &$row) {
            $rowIds = !empty($row['PI_REFID']) ? explode(',', $row['PI_REFID']) : [];
            $lines = [];
            foreach ($rowIds as $rowId) {
                $matches = $groupedChild[$rowId][$row['condition_type_code']] ?? [];
                foreach ($matches as $match) {
                    $lines[] = $match;
                }
            }
            $row['lines'] = $lines;
        }
        unset($row);

        return $parentData;

    }
    public function getCustomMillingPoNumbersWheat($userInfoId,$fromDate,$toDate,$plantCode,$type) {
    // Default condition, applying status condition universally
	
    if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
        $fromDate /= 1000;
    }
    if ($toDate > 1000000000000) {
        $toDate /= 1000;
    }

    if ($fromDate == 0) {
        // Get today's timestamp
        $toDate = time();
        // Get timestamp for 30 days ago
        $fromDate = strtotime("-30 days");
    
        // Format dates for SQL
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1 = date("Y-m-d 23:59:59", $toDate);
    
        // Apply last 30 days condition + status = 2
        $cnd = "purchase_info.DateAdded BETWEEN '$fromDate1' AND '$toDate1' AND purchase_info.VECHICAL_STATUS = 7";
    } else {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1 = date("Y-m-d 23:59:59", $toDate);
        $cnd = "purchase_info.DateAdded BETWEEN '$fromDate1' AND '$toDate1' AND purchase_info.VECHICAL_STATUS = 7";
    }
    if($type == 0){
        $cnd .= " AND purchase_info.VEHICLE_TYPE IN ('Cm Truck','Cm Container')";
    }else{
        $cnd .= " AND purchase_info.VEHICLE_TYPE IN ('Cm Rake')";
    }
 

    // Build query
    $builder = $this->db->table('purchase_info')
        ->select("purchase_info.ZPO_NUMBER AS value, purchase_info.ZPO_NUMBER AS label") // Selecting PO number with alias 'value' and 'label'
        // ->join('purchase_info', 'purchase_info.PI_REFID = purchase_info.purchaseInfoId', 'inner') // Corrected join
        ->where($cnd) // Apply the condition based on the user info
        ->groupBy('purchase_info.ZPO_NUMBER'); // Group by PO number to avoid duplicates
    // Execute and return the result
    // print_r($builder->getCompiledSelect());exit;
    $result = $builder->get()->getResultArray();
    return $result;
  }
}
