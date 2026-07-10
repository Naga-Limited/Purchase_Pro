<?php namespace App\Controllers\Api;

use App\Helpers\SapUrlHelper;
use App\Models\SDIModel;

class SupplierDispatch extends BaseApiController
{
    public function getsdiVehicleList(){
      $filter = $this->request->getJSON(true);
      //print_r($filter);
      $searchTxt=$filter['searchTxt'];
      
      $model = new SDIModel();
     // $res = $model->getSDIVehicleList();
     // $count = $model->getSDIVehicleListCount();
      $res = $model->getSDIVehicleList_new($searchTxt);
      $count = $model->getSDIVehicleListCount_new($searchTxt);
      return  $this->respond(["success" => 1, "results" => $res,"count" => $count]);
    }
    public function getsdiDetailsById(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getSDIDetailById($postData->id);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function getsdiPOLines(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getSDIPOLineItem($postData->PO_NUMBER, $postData->ZSUPPLIER_CODE);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function updatesdiPOLine(){
      $postData = $this->request->getJSON();

      include_once APIPATH. "/db_connection.php";  
      $Qry="SELECT SUPPLIER_ID FROM `supplier_vehical_info` where SUP_VE_REFID='".$postData->id."'";
      $SelectDispDet=mysqli_query($connect,$Qry);
      $FetchDispDet=mysqli_fetch_assoc($SelectDispDet);
      $SupplierId=$FetchDispDet['SUPPLIER_ID'];


      $model = new SDIModel();
      $res = $model->updatePoLineById($postData->id,$postData->lineItem,$postData->plantId,$SupplierId,$postData->vehicle_id,$postData->storage_location);
      return  $this->respond(["success" => $res]);
    }
    public function Deletesdi(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->deleteSDILineById($postData->id);
      return  $this->respond(["success" => $res]);
    }
    
    public function getPlantbysdi(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getPlantBySdi($postData->poNumber,$postData->lineItem,$postData->supplierCode);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function gateoutRedirect(){ 
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->updateRedirect($postData);
      return  $this->respond(["success" => 1, "results" => $res]);      
    }
    public function getSDIPOLineItemRedirect(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getSDIPOLineItemRedirect($postData->PO_NUMBER, $postData->ZSUPPLIER_CODE,$postData->VEHICLE_TYPE,$postData->FNR_NO);
      return  $this->respond(["success" => 1, "results" => $res]);
    }
    public function Portreceivedate(){ 
      $postData = $this->request->getJSON();
      //print_r($postData);exit;
      $model = new SDIModel();
      $res = $model->Portreceivedate($postData);
      return  $this->respond(["success" => 1, "results" => $res]);      
    }
    // get Po Details
    public function getSDIPoDetails(){
        $postData = $this->request->getJSON();
        $PO_NO = $postData->poNumber ?? '';
        $userId = $postData->userId ?? 0;
        $role = $postData->role ?? 0;
        
        $db = db_connect();
        
        $supplierCodes = [];
        if ($userId != 1) {
            $LOGIN_ID = $db->table('user_info')
                ->select('LOGIN_ID')
                ->where('UI_ID', $userId)
                ->where('USER_STATUS', 1)
                ->get()
                ->getRowArray();
            
            if (!$LOGIN_ID) {
                return $this->respond([
                    'success' => false, 
                    'message' => 'User not authorized'
                ]);
            }
            
            $supplierCode = str_pad($LOGIN_ID['LOGIN_ID'], 10, '0', STR_PAD_LEFT);
            $supplierCodes = [$supplierCode];
        }
        
        // SAP API call
        $urlPath = "zrake/zrake_sdtpo/sdtpodetails?sap-client=900&PO={$PO_NO}";
        $data = SapUrlHelper::getWhDatas($urlPath);
        $sapData = json_decode($data, true);
        // print_r($sapData); exit;    
        // 🚨 FILTER SAP DATA FIRST
        $poData = [];
        if ($role == 'VENDOR' && !empty($supplierCodes)) {
            foreach ($sapData as $row) {
                if (in_array($row['SUPPLIER_CODE'] ?? '', $supplierCodes)) {
                    // $poData[] = $row;
                    $poData = array_values(array_filter($sapData, function ($row) use ($supplierCodes) {
                        return isset($row['SUPPLIER_CODE']) && in_array($row['SUPPLIER_CODE'], $supplierCodes);
                    }));
                }
                if (in_array($row['VENDOR_CODE'] ?? '', $supplierCodes) && empty($poData)) {
                    // $poData[] = $row;
                    $poData = array_values(array_filter($sapData, function ($row) use ($supplierCodes) {
                        return isset($row['VENDOR_CODE']) && in_array($row['VENDOR_CODE'], $supplierCodes);
                    }));
                }
            }
        } else {
            $poData = $sapData;  // User 1: all data
        }
        
        // 🚨 VENDOR_INFO PER SUPPLIER_CODE (separate query per unique supplier)
        $vendorInfo = [];
        if (!empty($poData)) {
            $uniqueSuppliers = array_unique(array_column($poData, 'SUPPLIER_CODE'));
            
            foreach ($uniqueSuppliers as $supplierCode) {
                $vendorInfo = $db->table('supplier_entry')
                    ->select('invoiceNo, invoiceDate, invoiceQty, truckNo')
                    ->where('supplierCode', $supplierCode)
                    ->where('poNumber', $PO_NO)
                    ->whereIn('status', [1,2])
                    ->get()
                    ->getResultArray();
                
                // $vendorInfo[$supplierCode] = $vendorData;
            }
        }
        
        $dataStatus = !empty($poData);
        $message = $dataStatus ? 'Data found' : 'No data found';
        
        return $this->respond([
            'success'    => $dataStatus,
            'message'    => $message,
            'data'     => $poData,
            'vendorInfo' => $vendorInfo  // 🚨 { "0000210422": [vendor records], ... }
        ]);
    }

    public function addSupplierDetailsInsert()
    {
        $post = $this->request->getJSON(true);
        if (empty($post)) {
            $post = $this->request->getPost();
        }

        if (empty($post['poNumber']) || empty($post['mode']) || empty($post['vehicles'])) {
            return $this->fail('Missing: poNumber, mode, vehicles', 400);
        }

        $model = new SDIModel();
        $result = $model->insertSupplierEntryBatch($post);
        return $result['success'] 
            ? $this->respond(['success' => true, 'message' => $result['message'], 'row_count' => $result['row_count']])
            : $this->respond(['success' => false, 'message' => $result['message']]);
    }
    public function getSupplierDetailsInfo($status)
    {
        $db = db_connect();

        // Date 3 days ago
        $threeDaysAgo = date('Y-m-d H:i:s', strtotime('-15 days'));

        $builder = $db->table('supplier_entry');

        $builder->select("*,CASE
            WHEN changedAt IS NOT NULL THEN 'Changed/Confirmation'
            WHEN status = 1 THEN 'Confirmation'
            WHEN status = 2 THEN 'Completed'
            ELSE 'Unknown'
            END AS statusName,DATE_FORMAT(invoiceDate, '%d-%m-%Y') AS invoiceDateFormatted",);

        // First condition
        $builder->whereIn('status', [$status]);

        // OR condition with grouped logic
        $builder->orGroupStart()
                ->where('status', 2)
                ->whereIn('purchaseMode', ['Rake', 'Cm Rake'])
                ->where('confirmedAt >=', $threeDaysAgo)
                ->groupEnd();

        $vendorInfo = $builder->get()->getResultArray();

        $dataStatus = !empty($vendorInfo);

        return $this->respond([
            'success' => $dataStatus,
            'message' => $dataStatus ? 'Data found' : 'No data found',
            'results' => $vendorInfo
        ]);
    }

    public function updateSupplierDetails(){
        $postData = $this->request->getJSON();
       
        $db = db_connect();
        $vendorInfo = $db->table('supplier_entry')
              ->select('supplier_entry.*')
              ->where('id', $postData->id)
              ->get()
              ->getResultArray();
        if (!$vendorInfo) {
            return $this->respond([
                'success' => false,
                'message' => 'Record not found'
            ]);
        }
        $updateData = [
            'poNumber' => $postData->poNumber ?? $vendorInfo[0]['poNumber'],
            // 'brokerName' => $postData->brokerName ?? $vendorInfo[0]['brokerName'],
            // 'brokerCode' => $postData->brokerCode ?? $vendorInfo[0]['brokerCode'],
            // 'supplierCode' => $postData->supplierCode ?? $vendorInfo[0]['supplierCode'],
            // 'supplierName' => $postData->supplierName ?? $vendorInfo[0]['supplierName'],
            'poQty' => $postData->poQty ?? $vendorInfo[0]['poQty'],
            'loadingDueDate' => $postData->loadingDueDate ?? $vendorInfo[0]['loadingDueDate'],
            'contractNo' => $postData->contractNo ?? $vendorInfo[0]['contractNo'],
            'truckNo' => $postData->truckNo ?? $vendorInfo[0]['truckNo'],
            'invoiceNo' => $postData->invoiceNo ?? $vendorInfo[0]['invoiceNo'],
            'invoiceDate' => $postData->invoiceDate ?? $vendorInfo[0]['invoiceDate'],
            'invoiceQty' => $postData->invoiceQty ?? $vendorInfo[0]['invoiceQty'],
            'invoiceRate' => $postData->invoiceRate ?? $vendorInfo[0]['invoiceRate'],
            'loadingDate' => $postData->loadingDate ?? $vendorInfo[0]['loadingDate'],
            'expectedArrivalDt' => $postData->expectedArrivalDt ?? $vendorInfo[0]['expectedArrivalDt'],
            'noOfWagan' => $postData->noOfWagan ?? $vendorInfo[0]['noOfWagan'],
            'invoiceCopy' => $postData->invoiceCopy ?? $vendorInfo[0]['invoiceCopy'],
            'wbCopy' => $postData->wbCopy ?? $vendorInfo[0]['wbCopy'],
            'rrCopy' => $postData->rrCopy ?? $vendorInfo[0]['rrCopy'],
            'ewayBillCopy' => $postData->ewayBillCopy ?? $vendorInfo[0]['ewayBillCopy'],
            'updatedBy' => $postData->userId,
            'changedAt' => date("Y-m-d H:i:s")
        ];
        $builder = $db->table('supplier_entry');
        $builder->where('id', $postData->id);
        $builder->where('status', 1);
        $rowsAffected = $builder->update($updateData);
        if ($rowsAffected > 0) {
            
            return $this->respond([
                'success' => true,
                'message' => 'Record updated successfully',
                'rowsAffected' => $rowsAffected,
                'updatedFields' => array_keys($updateData),
                'recordId' => $postData->id
                ]);
        } else {
            return $this->respond([
                'success' => false,
                'message' => 'No changes made or record not found',
            ]);
        }
        
    }
    public function updateSupplierRejectDetails(){
        $postData = $this->request->getJSON();
        $db = db_connect();
        $updateData = [
            'status' => $postData->status,
            'updatedBy' => $postData->userId,
            'updatedAt' => date("Y-m-d H:i:s"),
            'remarks' => $postData->remarks ?? ''
        ];
         $builder = $db->table('supplier_entry');
         $builder->where('id', $postData->id);
         $builder->where('status', 1);
         $rowsAffected = $builder->update($updateData);
                
        if($rowsAffected > 0){
            return $this->respond([
                'success' => true,
                'message' => 'Rejected successfully',
                'rowsAffected' => $rowsAffected,
                'recordId' => $postData->id
                ]);
        } else {
            return $this->respond([
                'success' => false,
                'message' => 'No changes made or record not found',
                ]);
        }   
    }
    public function insertSDIPoDetails()
    {
        $postData    = $this->request->getJSON();
        $PO_NO       = $postData->poNumber ?? '';
        $userId      = $postData->userId ?? 0;
        $brokerCode  = $postData->brokerCode ?? 0;
        $supplierCode  = $postData->supplierCode ?? 0;
        $role        = $postData->role ?? 0;

        $db = db_connect();

        // SAP API call
        $urlPath = "zrake/zrake_sdtpo/sdtpodetails?sap-client=900&PO={$PO_NO}";
        $data    = SapUrlHelper::getWhDatas($urlPath);
        $sapData = json_decode($data); // decode as objects
        // print_r($sapData);exit;
        if (empty($sapData)) {
            return $this->respond([
                'success'    => false,
                'message'    => 'No SAP data found',
                'vendorInfo' => [],
            ]);
        }
        $now_date = date("Y-m-d");
       

        foreach ($sapData as $po_create) {
            $rate_value = 0;
            // print_r($po_create);exit; // Debug: Check the value of PURCHASE_GROUP_DESCRIPTION
            $allowedGroups = ['CM Truck','CM Container','CM Rake'];
            if (in_array((string)$po_create->PURCHASE_GROUP, $allowedGroups, true)) {
                // print_r($po_create->PURCHASE_GROUP);exit;
             $rate = $db->table('rate_master_custom_milling rmc')
                ->select('rmd.rate')
                ->join('definitions_list dl', 'dl.id = rmc.purchase_org_id')
                ->join(
                    'rate_master_details_custom_milling rmd',
                    "rmd.rm_id = rmc.rm_id 
                    AND rmd.condition_type_code = 'MACT'"
                )
                ->where('rmc.status', 2)
                ->where('rmc.vaild_to >=', $now_date)
                ->where('rmc.segment', trim($po_create->STOCK_SEGMENT))
                ->where('dl.definitionsName', trim($po_create->PURCHASE_GROUP_DESCRIPTION))
                // ->whereIn('dl.definitionsName',['CM Trucking','CM Container','CM Rake'])
                ->get()
                ->getResultArray();
                $rate_value = !empty($rate) ? $rate[0]['rate'] : 0;
            }
            
            $po_rate = trim($po_create->PO_RATE);
            $final_rate = $po_rate > 0 ? $po_rate : $rate_value;
            if($final_rate == 0){
                return $this->respond([
                'success'    => false,
                'message'    => 'Rate Master Not Maintained',
                'vendorInfo' => [],
                ]);
            }else{   
            $row = [
                'EBELN'              => trim($po_create->PO_NUMBER),
                'EBELP'              => trim($po_create->PO_LINE_ITEM),
                'BROCKER_CODE'       => trim($po_create->VENDOR_CODE),
                'BROCKER_NAME'       => trim($po_create->VENDOR_NAME),
                'SUPPLIER_CODE'      => trim($po_create->SUPPLIER_CODE),
                'SUPPLIER_NAME'      => trim($po_create->SUPPLIER_NAME),
                'MENGE'              => trim($po_create->SUPPLIER_QUANTITY),
                'MEINS'              => trim($po_create->UNIT_OF_MEASUREMENT),
                'IDNLF'              => trim($po_create->WHEAT_VARIETY),
                'MATNR'              => trim($po_create->MATERIAL_CODE),
                'SGT_SCAT'           => trim($po_create->STOCK_SEGMENT),
                'NETPR'              => $final_rate,
                'WERKS'              => trim($po_create->PLANT),
                'LGORT'              => trim($po_create->STORAGE_LOCATION),
                'LOEKZ'              => trim($po_create->STATUS),
                'ZUPDATE'            => trim($po_create->STATUS),
                'INCO1'              => trim($po_create->INCO_TERMS),
                'BSART'              => trim($po_create->PO_TYPE),
                'PO_LOADING_DATE'    => trim($po_create->PO_LOADING_DATE),
                'NUMBER_OF_VEHICLES' => trim($po_create->NUMBER_OF_VEHICLES),
                'PURCHASE_ORG'       => trim($po_create->PURCHASE_GROUP),
                'PURCHASE_ORG_DESC'  => trim($po_create->PURCHASE_GROUP_DESCRIPTION),
                'PO_BAG_TYPE'        => trim($po_create->PO_BAG_TYPE),
                'Loading_cost'       => trim($po_create->LOADING_COST),
                'Unloading_cost'     => trim($po_create->UNLOADING_COST),
                'Freight_cost'       => trim($po_create->FREIGHT_COST),
            ];

            $builder = $db->table('sap_to_pp');

            $exists = $builder
                ->where('EBELN', $row['EBELN'])
                ->where('EBELP', $row['EBELP'])
                ->where('WERKS', $row['WERKS'])
                ->where('SUPPLIER_CODE', $row['SUPPLIER_CODE'])
                ->countAllResults() > 0;

            if ($exists) {
                $db->table('sap_to_pp')
                    ->where('EBELN', $row['EBELN'])
                    ->where('EBELP', $row['EBELP'])
                    ->where('WERKS', $row['WERKS'])
                    ->where('SUPPLIER_CODE', $row['SUPPLIER_CODE'])
                    ->update($row);
            } else {
                $db->table('sap_to_pp')->insert($row);
            }
           }
        }

        $vendorInfo = $db->table('sap_to_pp')
            ->select('WERKS as value, EBELP as label,MATNR, IDNLF, LGORT,INCO1,SGT_SCAT,NETPR,Loading_cost,Unloading_cost,Freight_cost')
            ->where('SUPPLIER_CODE', $supplierCode)
            ->where('EBELN', $PO_NO)
            ->where('LOEKZ !=', 'D')   // ✅ fixed
            ->get()
            ->getResultArray();

        $dataStatus = !empty($vendorInfo);

        $message = $dataStatus ? 'Data found' : 'No data found';

        return $this->respond([
            'success'    => $dataStatus,
            'message'    => $message,
            'vendorInfo' => $vendorInfo,
        ]);
    }
    public function submitSupplierDispatch()
    {
        date_default_timezone_set('Asia/Calcutta');

        $db = db_connect();
        $db->transBegin();

        try {

            $request = $this->request->getJSON();

            /* ===============================
            * REQUEST DATA
            * =============================== */
            $ZPO_NUMBER             = $request->poNumber;
            $ZPO_LINE_ITEM          = $request->poLineItem;
            $ZSUPPLIER_CODE         = $request->supplierCode;
            $ZSUPPLIER_NAME         = $request->supplierName;
            $ZSUPPLIER_LOAD_DT      = $request->loadingDueDate;
            $ZSUPPLIER_LOAD_POINT   = $request->loadingPoint;
            $LINER_NAME             = $request->linerName ?? '';
            $VESSEL_NO              = $request->vessalNo ?? '';
            $VEHICLE_TYPE           = $request->purchaseMode;
            $FNR_NO                 = $request->truckNo ?? '';
            $WERKS                  = $request->plantCode;
            $IDNLF                  = $request->IDNLF;
            $INCO1                  = $request->INCO1 ?? '';
            $VESSEL_NAME            = $request->vessalId ?? '';
            $FUMIGATION             = $request->FUMIGATION ?? '';
            $EDA                    = $request->expectedArrivalDt ?? null;

            $qaStatus = ($VEHICLE_TYPE === 'Rake') ? '' : 'A';

            /* ===============================
            * DUPLICATE VEHICLE CHECK
            * =============================== */
            if (!empty($request->truckNo) && $VEHICLE_TYPE !== 'Rake' && $VEHICLE_TYPE !== 'Cm Rake') {

                $existingVehicles = $db->table('supplier_vehical_info')
                    ->where('VEHICLE_ARRIVED', 0)
                    ->where('VEHICAL_NO', $request->truckNo)
                    ->countAllResults();

                if ($existingVehicles > 0) {
                    throw new \Exception(
                        "The truck details '{$request->truckNo}' already exists"
                    );
                }
            }
            $now_date = date("Y-m-d");
            $segment = $request->SGT_SCAT ?? '';
            if(in_array($VEHICLE_TYPE, ['Cm Rake', 'Cm Truck', 'Cm Container'])){
                $existingRakes = $db->table('rate_master_custom_milling')
                    ->join(' definitions_list', ' definitions_list.id = rate_master_custom_milling.purchase_org_id')
                    ->join('rate_master_details_custom_milling', "rate_master_details_custom_milling.rm_id = rate_master_custom_milling.rm_id AND rate_master_details_custom_milling.condition_type_code = 'MACT'")
                    ->where('rate_master_custom_milling.status', 2)
                    ->where('rate_master_custom_milling.vaild_to >=', $now_date)
                    ->where('rate_master_custom_milling.segment', $segment)
                    ->where('definitions_list.definitionsName', $VEHICLE_TYPE)
                    ->countAllResults();
               
                if ($existingRakes == 0) {
                    throw new \Exception(
                        "Please update the rate master for '{$VEHICLE_TYPE}' as it has expired rates for segment '{$segment}'"
                    );
                }
            }
            $existing = $db->table('master_mrc_wheat_variety')
            //        ->where('MaterialCode', $request->MATNR)
                    ->where('Segment', $segment)
                    ->countAllResults();
            if($existing == 0){
                 throw new \Exception(
                    "The material code '{$request->MATNR}' does not exist in master data for segment '{$segment}'"
                );
            }
            // print_r($request);exit;
            $SessionUser     = $request->userId ?? 0;
            $SessionUserName = $request->userName ?? '';
            $now             = date("Y-m-d H:i:s");
            $invoiceQtyKg    = !empty($request->invoiceQty ) ? ($request->invoiceQty * 1000) : 0;
            $invoiceRateTon    = !empty($request->invoiceRate) ? ($request->invoiceRate / 1000) : 0;
            /* ===============================
            * INSERT SUPPLIER DISPATCH INFO
            * =============================== */
            $db->table('supplier_dispatch_info')->insert([
                'LINER_NAME' => $LINER_NAME,
                'VESSEL_NO' => $VESSEL_NO,
                'ZPO_NUMBER' => $ZPO_NUMBER,
                'ZSUPPLIER_CODE' => $ZSUPPLIER_CODE,
                'ZSUPPLIER_NAME' => $ZSUPPLIER_NAME,
                'ZPO_LINE_ITEM' => $ZPO_LINE_ITEM,
                'ZSUPPLIER_LOAD_DT' => $ZSUPPLIER_LOAD_DT,
                'ZSUPPLIER_LOAD_POINT' => $ZSUPPLIER_LOAD_POINT,
                'VEHICLE_TYPE' => $VEHICLE_TYPE,
                'WERKS' => $WERKS,
                'VESSEL_NAME' => $VESSEL_NAME,
                'FUMIGATION' => $FUMIGATION,
                'QA_APPROVER_STATUS' => $qaStatus,
                'EDA' => $EDA,
                'SupplierDispatchInfoSubmitDt' => $now,
                'SupplierDispatchInfoSubmitInsBy' => $SessionUser,
                'SupplierDispatchInfoSubmitInsByName' => $SessionUserName,
                'DRIVER_NO' => $request->driverNo ?? ''
            ]);

            $sdi_id = $db->insertID();
            if (!$sdi_id) {
                throw new \Exception('Supplier dispatch insert failed');
            }

            /* ===============================
            * INSERT VEHICLE INFO
            * =============================== */
            $db->table('supplier_vehical_info')->insert([
                'LINE_ITEM' => $ZPO_LINE_ITEM,
                'PLANT_ID' => $WERKS,
                'SUPPLIER_ID' => $sdi_id,
                'VEHICAL_NO' => ($VEHICLE_TYPE === 'Rake') ? $FNR_NO : ($request->truckNo ?? ''),
                'WB_QTY' => $invoiceQtyKg,
                'WB_DT' => $request->invoiceDate ?? null,
                'SEAL_NO' => $request->seal_no ?? '',
                'NO_OF_WAGON' => $request->noOfWagan ?? 0,
                'INV_COPY' => $request->invoiceCopy ?? '',
                'WB_COPY' => $request->wbCopy ?? '',
                'ZSUPPLIER_INV_RATE' => $invoiceRateTon ?? '',
                'ZSUPPLIER_INV_NO' => $request->invoiceNo ?? '',
                'ZSUPPLIER_INV_DT' => $request->invoiceDate ?? null,
                'ZSUPPLIER_INV_QTY' => $invoiceQtyKg,
                'RR_COPY' => $request->rrCopy ?? '',
                'EWAY_BILL_COPY' => $request->ewayBillCopy ?? '',
                'SupplierDispatchRedirectBy' => 0,
                'SUPPLIER_ENTRY_ID' => $request->id
            ]);

            /* ===============================
            * WAGON / PURCHASE INFO
            * =============================== */
            if (!empty($request->noOfWagan) && $request->status == 1) {

                for ($i = 0; $i < $request->noOfWagan; $i++) {

                    $rrno = $request->truckNo . '-WA-' . ($i + 1);

                    $db->table('purchase_info')->insert([
                        'ZVA_NUMBER' => $ZPO_NUMBER . '-' . $rrno,
                        'ZPO_NUMBER' => $ZPO_NUMBER,
                        'ZSUPPLIER_CODE' => $ZSUPPLIER_CODE,
                        'ZSUPPLIER_NAME' => $ZSUPPLIER_NAME,
                        'TRUCK_NO' => in_array($VEHICLE_TYPE, ['Rake', 'Cm Rake']) ? $FNR_NO : '',
                        'VECHICAL_STATUS' => 2,
                        'WERKS' => $WERKS,
                        'IDNLF' => $IDNLF,
                        'INCO1' => $INCO1,
                        'VEHICLE_TYPE' => $VEHICLE_TYPE,
                        'PO_LINE_ITEM' => $ZPO_LINE_ITEM,
                        'FNR_NO' => in_array($VEHICLE_TYPE, ['Rake', 'Cm Rake']) ? $FNR_NO : '',
                        'SCREEN_TYPE' => 'SDI',
                        'IsFromSDT' => 1
                    ]);
                }
            }

            /* ===============================
            * UPDATE SUPPLIER ENTRY
            * =============================== */
            $db->table('supplier_entry')
                ->where('id', $request->id)
                ->update([
                    'status' => 2,
                    'confirmedBy' => $SessionUser,
                    'confirmedAt' => $now,
                    'remarks' => $request->remarks ?? ''
                ]);

            $db->transCommit();

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Supplier dispatch submitted successfully'
            ]);

        } catch (\Throwable $e) {

            $db->transRollback();

            return $this->response->setJSON([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function getCustomMillingMiroDetailsByIdWheat() {
		$gateService = new SDIModel();
		$json = $this->request->getJSON();
		$result = $gateService->getCustomMillingMiroDetailsByIdWheat($json);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}     
    public function getCustomMillingMiroDetailsByIdWheatRake() {
		$gateService = new SDIModel();
		$json = $this->request->getJSON();
		$result = $gateService->getCustomMillingMiroDetailsByIdWheatRake($json);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	} 

}
