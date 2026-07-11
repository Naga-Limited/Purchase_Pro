<?php

namespace App\Models\GatePro;

use App\Helpers\SapUrlHelper;
use CodeIgniter\Model;

class ReportService extends Model
{ 
    // Get Gate In Out Report
	public function getGateInOutReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) { 
            $fromDateMilliSecond = $fromDate / 1000;
            $toDateMilliSecond = $toDate / 1000;
            $fromDate = date("Y-m-d", $fromDateMilliSecond);
            $toDate = date("Y-m-d", $toDateMilliSecond);
            $sql = "CALL spSelGateInOutReport(?, ?, ?, ?, ?, ?)";
            $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId]);	
            $result = $builder->getResultArray();
            return $result;
  	}

    // Get Rm Water Report
	public function getRmWaterReport($fromDate, $toDate, $plant,$userInfoId) { 
            $fromDateMilliSecond = $fromDate / 1000;
            $toDateMilliSecond = $toDate / 1000;
            $fromDate = date("Y-m-d", $fromDateMilliSecond);
            $toDate = date("Y-m-d", $toDateMilliSecond);
            $sql = "CALL spSelRmWaterReport(?, ?, ?, ?)";
            $builder = $this->db->query($sql, [$fromDate, $toDate,$plant ,$userInfoId]);	
            $result = $builder->getResultArray();
            return $result;
  	}

     // Get Cash Report
	public function getCashReportDetails($fromDate, $toDate,$plant_code,$userInfoId) { 
            $fromDateMilliSecond = $fromDate / 1000;
            $toDateMilliSecond = $toDate / 1000;
            $fromDate = date("Y-m-d", $fromDateMilliSecond);
            $toDate = date("Y-m-d", $toDateMilliSecond);
            $sql = "CALL spSelCashReport(?, ?, ?, ?)";
            $builder = $this->db->query($sql, [$fromDate, $toDate,$plant_code, $userInfoId]);
            $result = $builder->getResultArray();
            return $result;
  	}
	public function GateProUpdate($Data,$id){
         $InsId = $this->db->table('gate_in_out_info')->set($Data)->where('id', $id)->update();
		return  $InsId;
        }
        public function EmptyVehicleStatusChange($id,$Data){
         $InsId = $this->db->table('empty_vehicle_arrival')->set($Data)->where('ID', $id)->update();
		return  $InsId;
        }

   	public function SDIVehicleStatusChange($Data,$id){
         $InsId = $this->db->table('purchase_info')->set($Data)->where('PI_REFID', $id)->update();
		return  $InsId;
    	}
    	public function LoadUnloadInfo($Data,$id){
        $InsId = $this->db->table('loading_unloading_info')->set($Data)->where('id', $id)->update();
		return  $InsId;
        }
        public function siloToMillPOSortClose($PONumber){
          $usql = "UPDATE pp_silotomillpoline SET flag='X' WHERE PONumber = '$PONumber' and flag='0'";
          $builder = $this->db->query($usql);
          $builder = $builder->connID->affected_rows == 1 ? true : false ;
          return $builder;
        }
        public function PONumberCostAdd($PONumber,$LineItem,$SupplierCode,$plant,$cost){
            $usql = "UPDATE rake_loading SET loading_charge='$cost' WHERE po_number = '$PONumber' and po_line_item = '$LineItem' and supplier_code = '$SupplierCode' and plant_id = '$plant' and loading_charge = 0";
            $builder = $this->db->query($usql);
            $builder = $builder->connID->affected_rows > 0 ? true : false ;
            return $builder;
        }

        public function PONumberUnloadCostAdd($PONumber,$LineItem,$SupplierCode,$cost){
            $usql = "UPDATE gateout_info INNER JOIN purchase_info ON gateout_info.purchase_info_id=purchase_info.PI_REFID SET gateout_info.UnloadVendorCharge='$cost' WHERE purchase_info.ZPO_NUMBER = '$PONumber' and purchase_info.PO_LINE_ITEM = '$LineItem' and purchase_info.ZSUPPLIER_CODE = '$SupplierCode' and gateout_info.UnloadVendorCharge = 0";
            $builder = $this->db->query($usql);
            $builder = $builder->connID->affected_rows > 0 ? true : false ;
            return $builder;
        }
        
        
    // Get Delivery Report
	public function getDeliveryReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelStoLoadingInfoDetails(?, ?, ?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }

    // Get Purchase Order Report
	public function getPurchaseOrderReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelPurchaseOrderReport(?, ?, ?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }   

     // Get Gate Pass Report
	public function getGatePassReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelGatePassReport(?, ?, ?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }   

    // Sales Report
    public function getSalesReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId,$bulker_id,$bulkerCustomerId) { 
        // print_r($bulkerCustomerId);exit;
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelSalesReport(?, ?, ?, ?, ?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId, $bulker_id,$bulkerCustomerId]);
        $result = $builder->getResultArray();
        return $result;
    }
        
    public function GatePROMigoAdd($PONumber,$MigoNumber,$va_number){
            $usql = "UPDATE purchase_order INNER JOIN gate_in_out_info ON gate_in_out_info.loadingUnloadingInfoId=purchase_order.loadingUnloadingInfoId SET purchase_order.migoNumber='$MigoNumber' WHERE purchase_order.poNumber = '$PONumber' and purchase_order.migoNumber IS NULL and gate_in_out_info.vaNumber='$va_number'";
            //print_r($usql);exit;
            $builder = $this->db->query($usql);
            $builder = $builder->connID->affected_rows > 0 ? true : false ;
            $usql1 = "SELECT loadingUnloadingInfoId FROM purchase_order WHERE poNumber = '$PONumber'";
            $builder1 = $this->db->query($usql1);
            $result = $builder1->getResultArray();

                                    //print_r($result);exit;
            $loadingUnloadingInfoId = $result[0]['loadingUnloadingInfoId'];
            $usql2 = "UPDATE gate_in_out_info SET moduleStatusId=10,waitingAt=8 WHERE loadingUnloadingInfoId = '$loadingUnloadingInfoId' and waitingAt=10 and vaNumber='$va_number'";

            $this->db->query($usql2);
            $usql3 = "UPDATE loading_unloading_info SET statusId=8 WHERE id = '$loadingUnloadingInfoId'";
            $this->db->query($usql3);
            return $builder;
    }
    public function GateReject($gate_id){
        $usql = "UPDATE weighment_info INNER JOIN gate_in_out_info ON gate_in_out_info.id=weighment_info.gateInOutInfoId SET weighment_info.secondWeight=NULL,weighment_info.netWeight=NULL WHERE weighment_info.gateInOutInfoId = '$gate_id' and gate_in_out_info.waitingAt in (3)";
        $builder = $this->db->query($usql);
        $builder = $builder->connID->affected_rows > 0 ? true : false ;
        return $builder;
    }
    // Get General Visitor Report
    public function getGeneralVisitorReport($fromDate, $toDate, $masterPlantId, $userInfoId) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelGeneralVisitorReport(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $masterPlantId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }

    // Get Key Collection Report
    public function getKeyCollectionReport($fromDate, $toDate, $masterPlantId, $userInfoId) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelKeyCollectionReport(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $masterPlantId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }

    // Get Contractor Report
    public function getContractorReport($fromDate, $toDate, $masterPlantId, $userInfoId) {
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelContractorReport(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $masterPlantId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }

    // Get Contract Persons Activity
    public function getContractPersonsActivity($contractorDetailsId) {  
        $builder = $this->db->query("CALL spSelContractPersonsActivity('$contractorDetailsId')");	
        $result = $builder->getResultArray();	
        return  $result;
    }
    
    public function getTestWeighbridgeReport($fromDate, $toDate, $masterPlantId, $userInfoId) {
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $sql = "CALL spSelTestWeighbridgeReport(?, ?, ?, ?)";
        $builder = $this->db->query($sql, [$fromDate, $toDate, $masterPlantId, $userInfoId]);
        $result = $builder->getResultArray();
        return $result;
    }
    
     public function WrongWorkOrder($Data,$type,$id){
        $InsId = $this->db->table('work_permit')->set($Data)->where('id', $id)->update();
		return  $InsId;
    }   
    public function RakeLoading($id,$Data){
        $InsId = $this->db->table('rake_loading')->set($Data)->where('id', $id)->update();
		return  $InsId;
    }   
    public function getPurchaseOrderReject($fromDate, $toDate, $userInfoId,$status) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $cnd="";
        if($userInfoId !=1 && $status == 0)
        {
          $cnd .= "gioi.createdOn >= '$fromDate' and gioi.createdOn <= date_add('$toDate', INTERVAL 1 DAY) and gioi.waitingAt = 10 and po.migoNumber is null AND gioi.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND po.poType IN (SELECT pta.poTypeId FROM po_type_access pta WHERE pta.userInfoId = $userInfoId) AND po.isDelete = 0 AND po.inchargeRemark IS NULL AND po.managerRemark IS NULL";
        }else if($userInfoId ==1 && $status == 0){
          $cnd .= "gioi.createdOn >= '$fromDate' and gioi.createdOn <= date_add('$toDate', INTERVAL 1 DAY) and po.migoNumber is null AND po.isDelete = 0 AND gioi.waitingAt = 10 AND po.inchargeRemark IS NULL AND po.managerRemark IS NULL";
        }else if($userInfoId !=1 && $status == 1){
            $cnd .= "gioi.waitingAt = 10 and po.migoNumber is null AND gioi.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND po.isDelete = 0 AND po.inchargeRemark IS NOT NULL AND po.managerRemark IS NULL";
        }else if($userInfoId ==1 && $status == 1){
            $cnd .= "po.migoNumber is null AND po.isDelete = 0 AND po.inchargeRemark IS NOT NULL AND gioi.waitingAt = 10 AND po.managerRemark IS NULL";
        }
        $fetchsql = "SELECT
            po.id AS purchaserOrderId, po.loadingUnloadingInfoId, gioi.movementType AS movementTypeId, mt.movementType, 
            gioi.moduleType AS moduleTypeId, mm.moduleType, gioi.subModuleTypeId, mms.moduleType AS subModuleType, gioi.vehicleNo, 
            gioi.vaNumber,	po.poType AS poTypeId, pt.`type`, pt.name, po.invoiceNo, po.poNumber, po.vendorCode, po.vendorName, po.documentDate, 
            pod.masterPlantId, mpt.PLANT_NAME AS toPlantName, mpt.WERKS AS toPlantWerks, pod.line, pod.material, pod.quantity, pod.storageLocation, 
            po.migoNumber, po.migoDate, gioi.gateInDateStamp, gioi.gateOutDateStamp, gioi.waitingAt, ms.statusName AS waitingStatus,
            mp.PLANT_NAME AS plantName, mp.WERKS AS werks,po.inchargeRemark,ui.FIRST_NAME,gioi.id as gateID
            
            FROM purchase_order po		
            LEFT JOIN gate_in_out_info gioi ON gioi.loadingUnloadingInfoId = po.loadingUnloadingInfoId
            LEFT JOIN master_module mm ON mm.id = gioi.moduleType
            LEFT JOIN master_module mms ON mms.id = gioi.moduleType
            LEFT JOIN movement_type mt ON mt.id = gioi.movementType
            LEFT JOIN purchase_order_details pod ON pod.purchaseOrderId = po.id
            LEFT JOIN po_type pt ON pt.id = po.poType
            LEFT JOIN master_plant mp ON mp.ID = gioi.masterPlantId
            LEFT JOIN master_plant mpt ON mpt.ID = pod.masterPlantId
            LEFT JOIN module_status ms ON ms.id = gioi.waitingAt
            LEFT JOIN user_info ui ON ui.UI_ID = po.rejectInchargeID
            WHERE $cnd GROUP BY po.id";
        $builder =  $this->db->query($fetchsql);

        return  $builder->getResultArray();
    }
    public function RejectIncharge($postData){
        $Data = array (
            'inchargeRemark' => $postData->Remarks,
            'rejectRemark' => NULL,
            'rejectInchargeID' => $postData->userInfoId,
        );
        $InsId = $this->db->table('purchase_order')->set($Data)->where('id', $postData->purchaserOrderId)->update();
        $InsId = $InsId ? 1 : 0;
		return  $InsId;
    }

    public function RejectManager($postData){
        
        if($postData->status == 0){
            $Data1 = array (
                'rejectRemark' => $postData->Remarks,
                'inchargeRemark'=>NULL,
                'rejectManagerID' => $postData->userInfoId,
            );
            $InsId = $this->db->table('purchase_order')->set($Data1)->where('id', $postData->purchaserOrderId)->update();
            $InsId = $InsId ? 1 : 0;
            $message=$InsId == 1 ? 'PO Rejected' : 'Contact Admin';
            return array($InsId,$message);
        }else{
        
        $Data = array (
            'managerRemark' => $postData->Remarks,
            'rejectManagerID' => $postData->userInfoId,
            'isDelete' => 1,
        );
        $sap_data = array (
            'zzva_no' => $postData->vaNumber,
            'zztruck_no' => $postData->vehicleNo,
            'zzpo_no' => $postData->poNumber,
            'zzreject_reason' => $postData->Remarks,
            'zzinvoice_no'=>$postData->invoiceNo
        );
        $gate_data = array (
            'moduleStatusId' => 7,
            'waitingAt' => 7,
            'securityRejectRemarks'=> $postData->Remarks
        );
        $urlPath ="zgatepro/zss_po_detail/Gatepro?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
            if(($res[0]->STATUS) > 0){
                $InsId = $this->db->table('purchase_order')->set($Data)->where('id', $postData->purchaserOrderId)->update();
                $usqls = "SELECT COUNT(*) AS getExistCount FROM purchase_order WHERE loadingUnloadingInfoId=$postData->loadingUnloadingInfoId and isDelete = 1";
                $usqls1 = "SELECT COUNT(*) AS getExistCount1 FROM purchase_order WHERE loadingUnloadingInfoId=$postData->loadingUnloadingInfoId";

                $getExistCount =  $this->db->query($usqls);
                $getExistCount = $getExistCount->getResultArray();
                $getExistCount = $getExistCount[0]['getExistCount'];
                $getExistCount1 =  $this->db->query($usqls1);
                $getExistCount1 = $getExistCount1->getResultArray();
                $getExistCount1 = $getExistCount1[0]['getExistCount1'];

                if($getExistCount == $getExistCount1){
                    $this->db->table('gate_in_out_info')->set($gate_data)->where('id', $postData->gateID)->update(); 
                }
                $InsId = $InsId ? 1 : 0;
                $message=$InsId == 1 ? 'Rejection Approved' : 'Contact Admin';
                return array($InsId,$message);
            }else{
                $InsId = 0;
                $message = $res[0]->MESSAGE;
                return array($InsId,$message.'Please Contact SAP Team');
            }
     }
    }
   public function getRakeseheduledetailsforreport($fromDate, $toDate, $vehicletype, $plant)
{
    $builder = $this->db->table("supplier_dispatch_info");

    /* ================= SELECT ================= */
    $builder->select("
        ROW_NUMBER() OVER (ORDER BY supplier_dispatch_info.DateAdded ASC) as sl_no,
        supplier_dispatch_info.*, 
        rake_loading.fnr_no, 
        sap_to_pp.IDNLF,       
        supplier_vehical_info.VEHICAL_NO,
        supplier_vehical_info.CONTAINER_PORT_RECEIVE, 
        master_plant.PLANT_NAME,

        i.ZVA_NUMBER, 
        i.GateInBy,
        user_info.FIRST_NAME as GateInByName,
        i.GateOutByName,
        i.PI_REFID,
        i.UnloadWHSubmitByName,
        i.MIGOApprovalByName,
        i.FirstWeightEntryByName,
        i.SecondWeightEntryByName,
        i.WERKS,
        i.VECHICAL_STATUS,
        pp_status.StatusName as VechicalStatusName,

        DATE_FORMAT(i.GateInDt, '%d-%m-%Y %H:%i:%s') as FormattedGateInDt,
        DATE_FORMAT(i.UnloadWHSubmitDt, '%d-%m-%Y %H:%i:%s') as FormattedUnloadWHSubmitDt, 
        DATE_FORMAT(i.MIGOApprovalDt, '%d-%m-%Y %H:%i:%s') as FormattedMIGOApprovalDt,
        DATE_FORMAT(i.FirstWeightEntryDt, '%d-%m-%Y %H:%i:%s') as FormattedFirstWeightEntryDt,
        DATE_FORMAT(i.SecondWeightEntryDt, '%d-%m-%Y %H:%i:%s') as FormattedSecondWeightEntryDt,
        DATE_FORMAT(i.GateOutDt, '%d-%m-%Y %H:%i:%s') as FormattedGateOutDt,

        go.bag_type, go.bag_type2, go.bag_type3,
        go.no_bags, go.no_bags2, go.no_bags3,
        go.wb_empty_wt, go.wb_net_wt,
        go.gunny_wt, go.gunny_less_wt,go.wb_load_wt,
        go.UnloadVendorName,go.UnloadVendorCharge,go.LoadingCharge,

        master_vendor.Name as loadingvendor
    ");

    /* ================= JOINS ================= */

    $builder->join(
        'rake_loading',
        'rake_loading.po_number = supplier_dispatch_info.ZPO_NUMBER 
        AND rake_loading.po_line_item = supplier_dispatch_info.ZPO_LINE_ITEM 
        AND rake_loading.supplier_code = supplier_dispatch_info.ZSUPPLIER_CODE',
        'left'
    );

    $builder->join(
        'sap_to_pp',
        'sap_to_pp.EBELN = supplier_dispatch_info.ZPO_NUMBER 
        AND sap_to_pp.EBELP = supplier_dispatch_info.ZPO_LINE_ITEM 
        AND sap_to_pp.SUPPLIER_CODE = supplier_dispatch_info.ZSUPPLIER_CODE',
        'left'
    );

    $builder->join(
        'supplier_vehical_info',
        'supplier_vehical_info.SUPPLIER_ID = supplier_dispatch_info.SD_REFID',
        'left'
    );

    $builder->join(
        'purchase_info i',
        'supplier_vehical_info.purchase_info_id = i.PI_REFID',
        'left'
    );

    /* ================= DYNAMIC PLANT JOIN ================= */

    $plantColumn = (!empty($vehicletype) && strtolower($vehicletype) === 'rake')
        ? 'supplier_dispatch_info.WERKS'
        : 'i.WERKS';

    $builder->join(
        'master_plant',
        "master_plant.WERKS = $plantColumn",
        'left'
    );

    /* ================= REMAINING JOINS ================= */

    $builder->join(
        'gateout_info go',
        'go.purchase_info_id = i.PI_REFID',
        'left'
    );

    $builder->join(
        'pp_status',
        'pp_status.ID = i.VECHICAL_STATUS',
        'left'
    );

    $builder->join(
        'master_vendor',
        'master_vendor.Id = go.LoadingVendorID',
        'left'
    );

    $builder->join(
        'user_info',
        'user_info.UI_ID = i.GateInBy',
        'left'
    );

    /* ================= FILTERS ================= */  
        $builder->where('supplier_dispatch_info.VEHICLE_TYPE', $vehicletype);
    

    // Dynamic plant filter
    if (!empty($plant)) {
        $builder->where($plantColumn, $plant);
    }

    // Date filter (fixed)
    if (!empty($fromDate) && !empty($toDate)) {
        $builder->where('supplier_dispatch_info.DateAdded >=', $fromDate . ' 00:00:00');
        $builder->where('supplier_dispatch_info.DateAdded <=', $toDate . ' 23:59:59');
    }

    /* ================= GROUP & ORDER ================= */

    $builder->groupBy("supplier_dispatch_info.SD_REFID");
    $builder->orderBy("supplier_dispatch_info.DateAdded", "ASC");

    /* ================= DEBUG ================= */

    // Uncomment if needed
    // echo $builder->getCompiledSelect();
    // exit;

    /* ================= EXECUTE ================= */

    $result = $builder->get()->getResultArray();

    return [
        "count" => count($result),
        "data"  => $result
    ];
}
    public function getFgmaterialdetailsforreport($fromDate, $toDate)
    {
        $fDate = date("Y-m-d 00:00:00", strtotime($fromDate));
        $tDate = date("Y-m-d 23:59:59", strtotime($toDate));
    
        // Initialize the query builder
        $builder = $this->db->table("sales_material_info");
    
        // Select necessary columns with formatting
        $builder->select("
        sales_material_info.*, 
        gate_in_out_info.id as gi_id, 
        gate_in_out_info.vaNumber, 
        gate_in_out_info.vehicleNo,
        DATE_FORMAT(gate_in_out_info.gateInDateStamp, '%d-%m-%Y %H:%i:%s') as formatted_gateInDateStamp,
        DATE_FORMAT(gate_in_out_info.gateOutDateStamp, '%d-%m-%Y %H:%i:%s') as formatted_gateOutDateStamp,
        gate_in_out_info.moduleStatusId, 
        gate_in_out_info.waitingAt,
        module_status.id,
        module_status.statusName as modulestatusname,
        DATE_FORMAT(sales_material_info.created_at, '%d-%m-%Y') as formatted_created_at,
        CASE 
            WHEN sales_material_info.status = 1 THEN 'Completed' 
            WHEN sales_material_info.status = 0 THEN 'Rejected' 
        END as statusname,
        CASE 
            WHEN TIMESTAMPDIFF(DAY, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW())) > 0 
                THEN CONCAT(FLOOR(TIMESTAMPDIFF(DAY, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), ' days ',
                            MOD(FLOOR(TIMESTAMPDIFF(HOUR, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), 24), ' hrs')
            WHEN TIMESTAMPDIFF(HOUR, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW())) > 0 
                THEN CONCAT(FLOOR(TIMESTAMPDIFF(HOUR, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), ' hrs ',
                            MOD(FLOOR(TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), 60), ' mins')
            ELSE 
                CONCAT(FLOOR(TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), ' mins ',
                        MOD(TIMESTAMPDIFF(SECOND, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW())), 60), ' secs')
        END as duration_time
    ");

        // Join with related tables
        $builder->join('gate_in_out_info', 'gate_in_out_info.id = sales_material_info.gateInOutInfoId', 'inner');
        $builder->join('module_status', 'module_status.id = gate_in_out_info.waitingAt', 'inner');
        $builder->join('gate_in_out_info_details', 'gate_in_out_info_details.deliveryNumber = sales_material_info.deliveryNo', 'inner');

        // Apply date filter only if valid
        if ($fDate && $tDate) {
            $builder->where("sales_material_info.created_at BETWEEN '$fDate' AND '$tDate'");
        }

        // Apply additional filters
        $builder->where("gate_in_out_info_details.isManual", 0);

        // Group and fetch results
        $builder->distinct()->groupBy("sales_material_info.id");

        return $builder->get()->getResultArray();
    }
     public function getRMSTOReport($fromDate, $toDate, $userInfoId,$status) { 
        $fromDateMilliSecond = $fromDate / 1000;
        $toDateMilliSecond = $toDate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        $cnd="";
        if($userInfoId !=1)
        {
          $cnd .= "lui.createdOn >= '$fromDate' and lui.createdOn <= date_add('$toDate', INTERVAL 1 DAY) AND gioi.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND po.poType IN (SELECT pta.poTypeId FROM po_type_access pta WHERE pta.userInfoId = $userInfoId) AND lui.moduleTypeId = 44";
        }else if($userInfoId ==1){
          $cnd .= "gioi.createdOn >= '$fromDate' and gioi.createdOn <= date_add('$toDate', INTERVAL 1 DAY) AND lui.moduleTypeId = 44";
        }
        if($status){
            $cnd .= " AND gioi.waitingAt IN ($status)";
        }
        $fetchsql = "SELECT
            po.id AS purchaserOrderId, po.loadingUnloadingInfoId, gioi.movementType AS movementTypeId, mt.movementType, 
            gioi.moduleType AS moduleTypeId, mm.moduleType, gioi.subModuleTypeId, mms.moduleType AS subModuleType, gioi.vehicleNo, 
            gioi.vaNumber,	po.poType AS poTypeId, pt.`type`, pt.name, po.invoiceNo, po.poNumber, po.vendorCode, po.vendorName, po.documentDate, 
            pod.masterPlantId, mpt.PLANT_NAME AS toPlantName, mpt.WERKS AS toPlantWerks, pod.line, pod.description, pod.quantity, pod.storageLocation, 
            po.migoNumber, po.migoDate, gioi.gateInDateStamp, gioi.gateOutDateStamp, gioi.waitingAt, ms.statusName AS waitingStatus,
            mp.PLANT_NAME AS plantName, mp.WERKS AS werks,po.inchargeRemark,ui.FIRST_NAME,gioi.id as gateID,po.deliverNo,wi.firstWeight,wi.secondWeight,wi.netWeight,DATE_FORMAT(wi.createdOn, '%d-%m-%Y %H:%i:%s') AS firstWeightDate,
            DATE_FORMAT(wi.modifiedOn, '%d-%m-%Y %H:%i:%s') AS secondWeightDate,
            DATE_FORMAT(gioi.createdOn, '%d-%m-%Y %H:%i:%s') AS sendingGateIn,
            DATE_FORMAT(gioi.recGateOutDateStamp, '%d-%m-%Y %H:%i:%s') AS recGateOutDateStamp,
            DATE_FORMAT(gioi.gateInDateStamp, '%d-%m-%Y %H:%i:%s') AS receivingGateIn,
            DATE_FORMAT(gioi.gateOutDateStamp, '%d-%m-%Y %H:%i:%s') AS sendingGateOut,
            CONCAT(
                FLOOR(TIMESTAMPDIFF(SECOND, gioi.gateInDateStamp, gioi.recGateOutDateStamp) / 86400), ' Days ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, gioi.gateInDateStamp, gioi.recGateOutDateStamp), 86400) / 3600), ' Hr ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, gioi.gateInDateStamp, gioi.recGateOutDateStamp), 3600) / 60), ' Mins'
                ) AS receivingGateDuration,

                # 2. Receiving Gate-In to Gate-Out Duration
                CONCAT(
                FLOOR(TIMESTAMPDIFF(SECOND, gioi.createdOn, gioi.gateOutDateStamp) / 86400), ' Days ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, gioi.createdOn, gioi.gateOutDateStamp), 86400) / 3600), ' Hr ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, gioi.createdOn, gioi.gateOutDateStamp), 3600) / 60), ' Mins'
                ) AS sendingGateDuration,

                # 3. Weighment Duration (First to Second Weight)
                CONCAT(
                FLOOR(TIMESTAMPDIFF(SECOND, wi.createdOn, wi.modifiedOn) / 86400), ' Days ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, wi.createdOn, wi.modifiedOn), 86400) / 3600), ' Hr ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, wi.createdOn, wi.modifiedOn), 3600) / 60), ' Mins'
                ) AS weightDuration,
                # 4. Over All Duration
                CONCAT(
                FLOOR(TIMESTAMPDIFF(SECOND, gioi.createdOn, gioi.recGateOutDateStamp) / 86400), ' Days ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, gioi.createdOn, gioi.recGateOutDateStamp), 86400) / 3600), ' Hr ',
                FLOOR(MOD(TIMESTAMPDIFF(SECOND, gioi.createdOn, gioi.recGateOutDateStamp), 3600) / 60), ' Mins'
                ) AS overAllDuration
            
            FROM purchase_order po
            JOIN loading_unloading_info lui ON lui.id = po.loadingUnloadingInfoId	
            LEFT JOIN gate_in_out_info gioi ON gioi.loadingUnloadingInfoId = po.loadingUnloadingInfoId
            LEFT JOIN weighment_info wi ON wi.gateInOutInfoId = gioi.id
            LEFT JOIN master_module mm ON mm.id = gioi.moduleType
            LEFT JOIN master_module mms ON mms.id = gioi.moduleType
            LEFT JOIN movement_type mt ON mt.id = gioi.movementType
            LEFT JOIN purchase_order_details pod ON pod.purchaseOrderId = po.id
            LEFT JOIN po_type pt ON pt.id = po.poType
            LEFT JOIN master_plant mp ON mp.ID = lui.masterPlantId
            LEFT JOIN master_plant mpt ON mpt.ID = pod.masterPlantId
            LEFT JOIN module_status ms ON ms.id = gioi.waitingAt
            LEFT JOIN user_info ui ON ui.UI_ID = po.rejectInchargeID
            WHERE $cnd GROUP BY po.id";
        $builder =  $this->db->query($fetchsql);

        return  $builder->getResultArray();
    }
    public function getSilotomilldetailsforreport($fromDate, $toDate)
    {
        // Convert ISO format to Y-m-d
        $fromDate = date('Y-m-d', strtotime($fromDate));
        $toDate = date('Y-m-d', strtotime($toDate));

        $builder = $this->db->table("silotomill_dispatch_info d");

        $builder->select("
        d.*, 

         u.FirstWeight  as unloadFirstWeight,
         u.SecondWeight as unloadSecondWeight,
         u.NetWeight    as unloadNetWeight, 
       
        -- purchase_info (i)
        i.PI_REFID,
        i.ZVA_NUMBER,
        i.GateInByName as RECGateInByName,
        i.GateOutByName as RECGateOutByName,
        i.FirstWeightEntryByName as RECFirstWeightEntryByName,
        i.SecondWeightEntryByName as RECSecondWeightEntryByName,

        DATE_FORMAT(i.GateInDt, '%d-%m-%Y %H:%i:%s') as RECGateInDt,
        DATE_FORMAT(i.FirstWeightEntryDt, '%d-%m-%Y %H:%i:%s') as RECFirstWeightEntryDt,
        DATE_FORMAT(i.SecondWeightEntryDt, '%d-%m-%Y %H:%i:%s') as RECSecondWeightEntryDt,
        DATE_FORMAT(i.GateOutDt, '%d-%m-%Y %H:%i:%s') as RECGateOutDt,

        -- empty_vehicle_arrival (eva)
        eva.ID as evaid,
        eva.AddedBy as SECGateInBy,
        eva.GateOutByName as SECGateOutByName,
        eva.stm_LoadByName as SECstm_LoadByName,
        eva.stm_QCByName as SECstm_QCByName,
        eva.FirstWeightEntryByName as SECFirstWeightEntryByName,
        eva.SecondWeightEntryByName as SECSecondWeightEntryByName,

        DATE_FORMAT(eva.GateInDt, '%d-%m-%Y %H:%i:%s') as SECGateInDt,
        DATE_FORMAT(eva.GateOutDt, '%d-%m-%Y %H:%i:%s') as SECGateOutDt,
        DATE_FORMAT(eva.stm_LoadDt, '%d-%m-%Y %H:%i:%s') as SECstm_LoadDt,
        DATE_FORMAT(eva.stm_QCDt, '%d-%m-%Y %H:%i:%s') as SECstm_QCDt,
        DATE_FORMAT(eva.FirstWeightEntryDt, '%d-%m-%Y %H:%i:%s') as SECFirstWeightEntryDt,
        DATE_FORMAT(eva.SecondWeightEntryDt, '%d-%m-%Y %H:%i:%s') as SECSecondWeightEntryDt
    ");

        // 1️⃣ empty vehicle arrival
        $builder->join("empty_vehicle_arrival eva", "eva.ID = d.VehicleArrivalId", "left");

        // 2️⃣ purchase info (must come BEFORE using alias i)
        $builder->join("purchase_info i", "eva.ID = i.EMPTY_VEHICLE_ARRIVAL_ID", "left");

        // 3️⃣ unload weights (NOW i.ZVA_NUMBER is valid)
        $builder->join(
            "pp_silotomillweights_unload u",
            "u.VANumber= i.ZVA_NUMBER",
            "left"
        );

        // 4️⃣ user info
        $builder->join("user_info UI", "eva.GateInBy = UI.UI_ID", "left");

        // Date filter
        $builder->where("DATE(d.DateAdded) >=", $fromDate);
        $builder->where("DATE(d.DateAdded) <=", $toDate);

        return $builder->get()->getResultArray();
    }


    public function getpolistforclosure()
    {
       $builder = $this->db->table("pp_silotomillpoline");
        $builder->select("
            pp_silotomillpoline.Id,
            pp_silotomillpoline.PONumber,
            pp_silotomillpoline.flag,
            CASE 
                WHEN pp_silotomillpoline.flag = '0' THEN 0
                WHEN pp_silotomillpoline.flag = 'X' THEN 1
                ELSE 0
            END AS flagStatus
        ");
        $builder->where("flag", '0');
        // print_r($bulder);exit;

        return $builder->distinct()->get()->getResultArray();

    }
   public function getpolistforrevert($fromDate, $toDate)
{
    // Convert to Y-m-d format
    $fromDate = date('Y-m-d', strtotime($fromDate));
    $toDate   = date('Y-m-d', strtotime($toDate));

    $builder = $this->db->table("pp_silotomillpoline");

    $builder->select("
        pp_silotomillpoline.Id,
        pp_silotomillpoline.PONumber,
        pp_silotomillpoline.flag,
        CASE 
            WHEN pp_silotomillpoline.flag = '0' THEN 0   -- flag is '0'
            WHEN pp_silotomillpoline.flag = 'X' THEN 1   -- flag is 'X'
            ELSE 0                                       -- default fallback
        END AS flagStatus
    ");
     $builder->where("flag", 'X');

    // Date filter on short_close_at
    $builder->where('DATE(pp_silotomillpoline.short_close_at) >=', $fromDate);
    $builder->where('DATE(pp_silotomillpoline.short_close_at) <=', $toDate);

    return $builder->distinct()->get()->getResultArray();
}

 public function shortclosepo($getdate)
    {
        // print_r($getdate);exit;
        $value = array(
            "flag"=>'X',
            "short_close_by" => $getdate->closed_by,
            "short_close_at" => date('Y-m-d H:i:s')
        );
        // print_r($value3);exit;
        $this->db->table('pp_silotomillpoline')->set($value)->where('Id ', $getdate->Id)->update();
        return $getdate->Id;
    }
    public function revertpo($getdate)
    {
        $value = array(
            "flag"=>0,
            "reverted_by" => $getdate->reveted_by,
            "reverted_at" => date('Y-m-d H:i:s')
        );
        // print_r($value3);exit;
       $this->db->table('pp_silotomillpoline')->set($value)->where('Id ', $getdate->Id)->update();
        return $getdate->Id;
    }
     public function WeighmentReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) { 
            $fromDateMilliSecond = $fromDate / 1000;
            $toDateMilliSecond = $toDate / 1000;
            $fromDate = date("Y-m-d", $fromDateMilliSecond);
            $toDate = date("Y-m-d", $toDateMilliSecond);
            $sql = "CALL spSelWeighmentReport(?, ?, ?, ?, ?, ?)";
            $builder = $this->db->query($sql, [$fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId]);	
            $result = $builder->getResultArray();
            return $result;
  	}
    public function SaleReturnReport($fromDate, $toDate, $userInfoId)
    {
        
        $fromDate = $fromDate / 1000;
        $fromDate = date("Y-m-d", $fromDate);
        $toDate = $toDate / 1000;
        $toDate = date("Y-m-d", $toDate);
        // $fromDate = date('Y-m-d', strtotime($fromDate));
        // $toDate   = date('Y-m-d', strtotime($toDate));
        // print_r($toDate);exit;
        try {

            $builder = $this->db->table('fg_return_quantity_details');

            /* ===============================
            * SELECT
            * =============================== */
            $builder->select("
                fg_return_quantity_details.invoiceNo,
                fg_return_quantity_details.billingDate,
                fg_sales_return_info.returnRefNo,
                fg_sales_return_info.vehicleNo,
                fg_sales_return_info.remarks,

                gate_in_out_info.id AS gi_id,
                gate_in_out_info.vaNumber,
                gate_in_out_info.masterPlantId,

                DATE_FORMAT(gate_in_out_info.gateInDateStamp, '%d-%m-%Y %H:%i:%s') AS formatted_gateInDateStamp,
                DATE_FORMAT(gate_in_out_info.gateOutDateStamp, '%d-%m-%Y %H:%i:%s') AS formatted_gateOutDateStamp,

                gate_in_out_info.moduleStatusId,
                gate_in_out_info.waitingAt,
                module_status.statusName AS modulestatusname,

                DATE_FORMAT(fg_sales_return_info.createdOn, '%d-%m-%Y %H:%i:%s') AS formatted_created_at,

                CASE 
                    WHEN fg_sales_return_info.isDelete = 1 THEN 'Rejected'
                    WHEN fg_sales_return_info.moduleStatusId = 0 THEN 'Wait For Gate In'
                    WHEN gate_in_out_info.moduleStatusId = 0 THEN 'Wait Outside'
                    WHEN gate_in_out_info.moduleStatusId = 1 THEN 'First Weightment'
                    WHEN gate_in_out_info.moduleStatusId = 2 THEN 'Second Weightment'
                    WHEN gate_in_out_info.moduleStatusId = 3 THEN 'Gate Out Confirmation'
                    WHEN gate_in_out_info.moduleStatusId = 4 THEN 'Gate Out'
                    WHEN gate_in_out_info.waitingAt = 8 THEN 'Completed'
                    WHEN gate_in_out_info.waitingAt = 7 THEN 'Rejected'
                    WHEN gate_in_out_info.waitingAt = 11 THEN 'Sale Return Confirmation'
                    ELSE 'In Process'
                END AS statusname,
                CASE 
                    WHEN TIMESTAMPDIFF(DAY, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW())) > 0 
                        THEN CONCAT(FLOOR(TIMESTAMPDIFF(DAY, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), ' days ',
                                    MOD(FLOOR(TIMESTAMPDIFF(HOUR, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), 24), ' hrs')
                    WHEN TIMESTAMPDIFF(HOUR, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW())) > 0 
                        THEN CONCAT(FLOOR(TIMESTAMPDIFF(HOUR, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), ' hrs ',
                                    MOD(FLOOR(TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), 60), ' mins')
                    ELSE 
                        CONCAT(FLOOR(TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW()))), ' mins ',
                                MOD(TIMESTAMPDIFF(SECOND, gate_in_out_info.gateInDateStamp, IFNULL(gate_in_out_info.gateOutDateStamp, NOW())), 60), ' secs')
                END as duration_time,
                weighment_info.firstWeight,
                weighment_info.secondWeight,
                weighment_info.netWeight,
                DATE_FORMAT(weighment_info.createdOn, '%d-%m-%Y %H:%i:%s') AS firstWeightDate,
                DATE_FORMAT(weighment_info.modifiedOn, '%d-%m-%Y %H:%i:%s') AS secondWeightDate,
                master_plant.PLANT_NAME AS plantName,
                master_plant.WERKS AS werks,
                master_module.moduleType AS moduleTypeName,
                gate_in_out_info.returnDocument
            ");

            /* ===============================
            * JOINS
            * =============================== */
            $builder->join(
                'fg_sales_return_info',
                'fg_sales_return_info.id = fg_return_quantity_details.fgSalesReturnInfoId',
                'inner'
            );
            $builder->join(
                'master_plant',
                'master_plant.ID = fg_sales_return_info.masterPlantId',
                'inner'
            );
            $builder->join(
                'master_module',
                'master_module.id = fg_sales_return_info.moduleTypeId',
                'inner'
            );
            $builder->join(
                'gate_in_out_info',
                'gate_in_out_info.fgSalesReturnInfoId = fg_sales_return_info.id',
                'left'
            );

            $builder->join(
                'module_status',
                'module_status.id = gate_in_out_info.waitingAt',
                'left'
            );
             $builder->join(
                'weighment_info',
                'weighment_info.gateInOutInfoId = gate_in_out_info.id',
                'left'
            );
            /* ===============================
            * DATE FILTER (FIXED)
            * =============================== */
            if (!empty($fromDate) && !empty($toDate)) {
                $builder->where('DATE(fg_sales_return_info.createdOn) >=', $fromDate);
                $builder->where('DATE(fg_sales_return_info.createdOn) <=', $toDate);
            }

            /* ===============================
            * PLANT ACCESS
            * =============================== */
            if ((int)$userInfoId !== 1) {

                $plantIds = $this->db->table('master_user_plant')
                    ->select('PLANT_ID')
                    ->where('USER_ID', $userInfoId)
                    ->get()
                    ->getResultArray();

                $plantIds = array_column($plantIds, 'PLANT_ID');

                if (empty($plantIds)) {
                    return [
                        'success' => false,
                        'message' => 'No plant access assigned',
                        'data' => []
                    ];
                }

                $builder->whereIn('fg_sales_return_info.masterPlantId', $plantIds);
            }

            /* ===============================
            * GROUP
            * =============================== */
            $builder->groupBy('fg_return_quantity_details.invoiceNo,fg_return_quantity_details.fgSalesReturnInfoId');
             $result = $builder->get()->getResultArray();
             return $result;

        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error',
                'error' => $e->getMessage()
            ];
        }
    }
    public function getpolistforclosureIAS($plantId)
    {
    //    $plantId  = $plantId == [] ? 0 : $plantId;
       $builder = $this->db->table("intrastate_sap_to_pp");
        $builder->select("
            intrastate_sap_to_pp.Id,
            intrastate_sap_to_pp.poNumber,
            intrastate_sap_to_pp.SendingPlant,
            intrastate_sap_to_pp.flag,
            CASE 
                WHEN intrastate_sap_to_pp.flag = '0' THEN 0
                WHEN intrastate_sap_to_pp.flag = '1' THEN 1
                ELSE 0
            END AS flagStatus
        ");
        $builder->join(
                'master_plant',
                "master_plant.WERKS = intrastate_sap_to_pp.SendingPlant AND master_plant.plant_subdivision != 2",
                'inner'
        );
        $builder->where("flag", '0');
        $builder->where("intrastate_sap_to_pp.PoNumber != 0");
        // ---------- PLANT FILTER ----------
        if (!empty($plantId)) {

            // Convert "FM01,FM02,CP00" → ['FM01','FM02','CP00']
            if (is_string($plantId)) {
                $plantId = array_map('trim', explode(',', $plantId));
            }

            // Ensure array is not empty
            if (!empty($plantId)) {
                $builder->whereIn('intrastate_sap_to_pp.SendingPlant', $plantId);
            }
        }
        // print_r($bulder);exit;

        return $builder->distinct()->get()->getResultArray();

    }
   public function getpolistforrevertIAS($fromDate, $toDate, $plantId)
    {
        // Convert to Y-m-d format
        $fromDate = date('Y-m-d', strtotime($fromDate));
        $toDate   = date('Y-m-d', strtotime($toDate));
        // $plantId  = $plantId == [] ? 0 : $plantId;
        $builder = $this->db->table("intrastate_sap_to_pp");

        $builder->select("
            intrastate_sap_to_pp.Id,
            intrastate_sap_to_pp.poNumber,
            intrastate_sap_to_pp.SendingPlant,
            intrastate_sap_to_pp.flag,
            CASE 
                WHEN intrastate_sap_to_pp.flag = '0' THEN 0   -- flag is '0'
                WHEN intrastate_sap_to_pp.flag = '1' THEN 1   -- flag is '1'
                ELSE 0                                       -- default fallback
            END AS flagStatus
        ");
        // $builder->join("master_plant", '1');
        // $builder->join(
        //         'master_plant',
        //         "master_plant.WERKS = intrastate_sap_to_pp.SendingPlant AND master_plant.plant_subdivision != 2",
        //         'inner'
        // );
        $builder->where("flag", '1');
        // Date filter on short_close_at
        $builder->where('DATE(intrastate_sap_to_pp.short_close_at) >=', $fromDate);
        $builder->where('DATE(intrastate_sap_to_pp.short_close_at) <=', $toDate);
        // $builder->where("intrastate_sap_to_pp.PoNumber != 0");
        // ---------- PLANT FILTER ----------
        if (!empty($plantId)) {

            // Convert "FM01,FM02,CP00" → ['FM01','FM02','CP00']
            if (is_string($plantId)) {
                $plantId = array_map('trim', explode(',', $plantId));
            }

            // Ensure array is not empty
            if (!empty($plantId)) {
                $builder->whereIn('intrastate_sap_to_pp.SendingPlant', $plantId);
            }
        }
        return $builder->distinct()->get()->getResultArray();
    }

    public function shortclosepoIAS($getdate)
    {
            // print_r($getdate);exit;
            $value = array(
                "flag"=>'1',
                "short_close_by" => $getdate->closed_by,
                "short_close_at" => date('Y-m-d H:i:s')
            );
            // print_r($value3);exit;
            $this->db->table('intrastate_sap_to_pp')->set($value)->where('Id ', $getdate->Id)->update();
            return $getdate->Id;
    }
    public function revertpoIAS($getdate)
    {
            $value = array(
                "flag"=>0,
                "reverted_by" => $getdate->reveted_by,
                "reverted_at" => date('Y-m-d H:i:s')
            );
            // print_r($value3);exit;
        $this->db->table('intrastate_sap_to_pp')->set($value)->where('Id ', $getdate->Id)->update();
            return $getdate->Id;
    }
    public function AutoPoSortClosureIAS()
    {
        $builder = $this->db->table("intrastate_sap_to_pp");

        $builder->select("
            intrastate_sap_to_pp.Id,
            intrastate_sap_to_pp.poNumber
        ");

        $builder->join(
            'master_plant',
            "master_plant.WERKS = intrastate_sap_to_pp.SendingPlant 
            AND master_plant.plant_subdivision != 2",
            'inner'
        );

        $builder->where("intrastate_sap_to_pp.flag", '0');
        $builder->where("intrastate_sap_to_pp.PoNumber !=", 0);
        $builder->orderBy('intrastate_sap_to_pp.Id', 'ASC');
        $builder->limit(100);
        $result = $builder->distinct()->get()->getResultArray();
        // print_r($result);exit; // Debug: Check fetched PO list
        foreach ($result as $po) {
            $poNumber = $po['poNumber'];
            $urlPath = "zwh_iaspo/iaspo?sap-client=900&PO=".$poNumber;
            $res = SapUrlHelper::getWhDatas($urlPath);
            $res = json_decode($res);
            if ($res->DEL_FLAG == 'X') {
                $value = [
                    "flag" => '1',
                    "short_close_by" => 0,
                    "short_close_at" => date('Y-m-d H:i:s')
                ];

                $this->db->table('intrastate_sap_to_pp')
                        ->where('poNumber', $po['poNumber'])
                        ->update($value);
            }
        }

        return $result;
    }
	
    public function AutoPoSortClosureSilotoMill()
    {
        $builder = $this->db->table("pp_silotomillpoline");

        $builder->select("
            pp_silotomillpoline.Id,
            pp_silotomillpoline.PONumber
        ");

        $builder->join(
            'master_plant',
            "master_plant.WERKS = pp_silotomillpoline.SendingPlant 
            AND master_plant.plant_subdivision != 2",
            'inner'
        );

        $builder->where("pp_silotomillpoline.flag", '0');
        $builder->where("pp_silotomillpoline.PONumber !=", 'X');
        $builder->orderBy('pp_silotomillpoline.Id', 'ASC');
        $builder->limit(100);
        $result = $builder->distinct()->get()->getResultArray();
        // print_r($result);exit; // Debug: Check fetched PO list
        foreach ($result as $po) {
            $poNumber = $po['PONumber'];
            // $poNumber = '1700046613';
            // print_r($poNumber);exit;
            $urlPath = "zwh_iaspo/iaspo?sap-client=900&PO=".$poNumber;
            $res = SapUrlHelper::getWhDatas($urlPath);
            // print_r($res);exit; // Debug: Check SAP response for each PO
            $res = json_decode($res);
            if ($res->DEL_FLAG == 'X') {
                $value = [
                    "flag" => 'X',
                    "short_close_by" => 0,
                    "short_close_at" => date('Y-m-d H:i:s')
                ];
                $this->db->table('pp_silotomillpoline')
                        ->where('PONumber', $po['PONumber'])
                        ->update($value);
            }
        }

        return $result;
    }

    public function getcustomerdetailsforbulker() { 
        $builder = $this->db->table('gate_in_out_info gi');
        $builder->select(" 
            gi.id AS gateInOutInfoId,
            gid.customerCode as value,
            gid.customerName,
            CONCAT(gid.customerCode, '-', gid.customerName) AS label
        ");
        $builder->join('gate_in_out_info_details gid', 'gi.id = gid.gateInOutInfoId', 'inner');
        $builder->where('gi.vehicleType', 'BULKER');
        $builder->groupBy('gid.customerCode');
        $builder->distinct();

        return $builder->get()->getResultArray();
    }
}
