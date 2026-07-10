<?php

namespace App\Models;

use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use CodeIgniter\Model;
use DateTime;


class MigoAutomationModel extends Model
{
	
	public function ReceiptDetailsGet($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber){
         // Ensure timestamps are in seconds, not milliseconds
    if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
        $fromDate /= 1000;
    }
    if ($toDate > 1000000000000) {
        $toDate /= 1000;
    }
        if($fromDate == 0){ 
            $toDate2 = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");

            if ($userInfoId == 1) {
                $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '2025-05-01' AND '$toDate2' AND purchase_order.status = 0 AND purchase_order.migoNumber IS NULL AND purchase_order.isDelete = 0 AND gate_in_out_info.waitingAt = 10 AND gate_in_out_info.moduleType IN (12,15,21,33,34,38,25,35,41)";
            } else {
                $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '2025-05-01' AND '$toDate2' 
                        AND purchase_order.poType IN (SELECT poTypeId FROM po_type_access WHERE userInfoId = $userInfoId)
                        AND gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId) AND purchase_order.status = 0 AND purchase_order.migoNumber IS NULL AND purchase_order.isDelete = 0 AND gate_in_out_info.waitingAt = 10 AND gate_in_out_info.moduleType IN (12,15,21,33,34,38,25,35,41)";
            }   
        }else{   
    // Convert to proper date format
        $fromDate1 = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
        $toDate1 = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");
         // Common condition for waitingAt / moduleType
        $moduleWaitingCnd = "(
            (gate_in_out_info.moduleType IN (12,15,21,33,34,38,25,35,41) AND gate_in_out_info.waitingAt = 10)
            OR
            (gate_in_out_info.moduleType IN (1,2) AND gate_in_out_info.waitingAt = 3)
        )";
        // Fix condition syntax
        if ($userInfoId == 1) {
            $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '$fromDate1' AND '$toDate1' AND purchase_order.status = 0 AND purchase_order.migoNumber IS NULL AND purchase_order.isDelete = 0 AND $moduleWaitingCnd";
        } else {
            $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '$fromDate1' AND '$toDate1' 
                    AND purchase_order.poType IN (SELECT poTypeId FROM po_type_access WHERE userInfoId = $userInfoId)
                    AND gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId) AND purchase_order.status = 0 AND purchase_order.migoNumber IS NULL AND purchase_order.isDelete = 0 AND $moduleWaitingCnd";
        }
       }
        
        if (!empty($moduleTypeId)) {
            $cnd .= " AND purchase_order.poType = $moduleTypeId"; 
        }
        if (!empty($vaNumber)) {
            $cnd .= " AND gate_in_out_info.id = $vaNumber"; 
        }

        // Query Builder
        $builder = $this->db->table("purchase_order")
                ->select("
                purchase_order.*,
                gate_in_out_info.vehicleNo,
                gate_in_out_info.vaNumber,
                master_plant.PLANT_NAME,
                master_module.moduleType,
                GROUP_CONCAT(DISTINCT purchase_order.poNumber ORDER BY purchase_order.poNumber ASC) AS poNumbers,
                GROUP_CONCAT(DISTINCT purchase_order.id ORDER BY purchase_order.id ASC) AS purchaseIds,
                CONCAT(
                    TIMESTAMPDIFF(DAY, purchase_order.dateStamp, NOW()), ' Days ',
                    TIMESTAMPDIFF(HOUR, purchase_order.dateStamp, NOW()) % 24, ' Hrs ',
                    TIMESTAMPDIFF(MINUTE, purchase_order.dateStamp, NOW()) % 60, ' Mins'
                ) AS dateStamp,
                CONCAT(
                    TIMESTAMPDIFF(DAY, gate_in_out_info.gateOutDateStamp, NOW()), ' Days ',
                    TIMESTAMPDIFF(HOUR, gate_in_out_info.gateOutDateStamp, NOW()) % 24, ' Hrs ',
                    TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateOutDateStamp, NOW()) % 60, ' Mins'
                ) AS gateOutDateStamp
            ")
            ->join('gate_in_out_info', 
                '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId 
                    OR gate_in_out_info.id = purchase_order.gateInOutInfoId)', 'inner')
            ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
            ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner')
            ->where($cnd)
            ->groupBy('purchase_order.invoiceNo,gate_in_out_info.vaNumber,purchase_order.poType') // Grouping by Invoice Number
            ->orderBy('gate_in_out_info.id');
            if($fromDate == 0){
              $builder = $builder->limit(50);    
            }
    
        // Fetch Results
        $result = $builder->get()->getResultArray();
        return $result;
    }   
    public function GetVaNumbers($fromDate, $toDate, $moduleTypeId, $userInfoId){
        // Ensure timestamps are in seconds, not milliseconds
        if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
            $fromDate /= 1000;
        }
        if ($toDate > 1000000000000) {
            $toDate /= 1000;
        }

        // Convert to proper date format
        $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
        $toDate = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");
        
            // Fix condition syntax
            if ($userInfoId == 1) {
                $cnd = "createdOn BETWEEN '$fromDate' AND '$toDate' AND waitingAt = 10";
            }
            else{
                $cnd = "gate_in_out_info.createdOn BETWEEN '$fromDate' AND '$toDate' AND gate_in_out_info.waitingAt = 10 AND gate_in_out_info.moduleType IN (SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userInfoId)
                AND gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId)";
            } 
            
            if (!empty($moduleTypeId)) {
                $cnd .= " AND purchase_order.poType = $moduleTypeId"; 
            }
            
            //    print_r($cnd);exit;
            // Query Builder
            $builder = $this->db->table("gate_in_out_info")
            ->select("gate_in_out_info.id AS value, gate_in_out_info.vaNumber AS label")
            ->join(
                'purchase_order',
                '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId 
                OR gate_in_out_info.id = purchase_order.gateInOutInfoId)',
                'inner'
            )
            ->where($cnd);

        // Fetch Results
        $result = $builder->get()->getResultArray();
            return $result;
    }
    public function getPurchaseInfo($purchaseId, $userInfoId, $poNumbers=null)
    {

        $builder = $this->db->table("purchase_order")
            ->select("
                purchase_order.*,
                gate_in_out_info.vehicleNo,
                gate_in_out_info.id as gateId,
                gate_in_out_info.vaNumber,
                master_plant.PLANT_NAME,
                master_module.moduleType,
                gate_in_out_info.id as gateInOutInfoId,
                gate_in_out_info.moduleType as moduleTypeId,
                gate_in_out_info.invoiceCopy as invoiceCopys,
                DATE_FORMAT(purchase_order.invoiceDate, '%d-%m-%Y') as invoiceDate,
                CONCAT(po_type.type, ' - ', po_type.name) AS poType,
                CONCAT(purchase_order.vendorCode, ' - ', purchase_order.vendorName) AS vendorName,
                po_type.isReceipt,
                po_type.po_type,
                po_type.invoiceQty,
                po_type.batchCode,
                gate_in_out_info.gateInDateStamp
            ")
            ->join('gate_in_out_info', 
                '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId 
                    OR gate_in_out_info.id = purchase_order.gateInOutInfoId)', 'inner')
            ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
            ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner')
            ->join('po_type', 'po_type.id = purchase_order.poType', 'inner');

        if (!is_array($purchaseId)) {
            $purchaseId = explode(',', $purchaseId);
        }

        // if (!is_array($poNumbers)) {
        //     $poNumbers = explode(',', $poNumbers);
        // }

        if (!empty($purchaseId)) {
            $builder->whereIn('purchase_order.id', $purchaseId);
        }

        if (!empty($poNumbers)) {
            $poNumbers = explode(',', $poNumbers);
            $builder->whereIn('purchase_order.poNumber', $poNumbers); // Adjust column name if needed
        }

        return $builder->get()->getResultArray();
    }
    
	public function getMaterialDetail($purchaseId, $poNumbers){

        // $builder = $this->db->table("purchase_order_details")
        //         ->select("purchase_order_details.id,purchase_order_details.purchaseOrderId,purchase_order.poNumber,purchase_order.invoiceNo")
        //         ->join('purchase_order', 'purchase_order.id = purchase_order_details.purchaseOrderId', 'inner');
                if (!is_array($poNumbers)) {
                    $poNumbers = explode(',', $poNumbers);
                }
                // $builder->whereIn('purchase_order_details.purchaseOrderId', $purchaseId)
                // ->groupBy('purchase_order.poNumber', 'purchase_order.invoiceNo');
                // $builder=$builder->get()->getResultArray();
                $mergedResults = []; 
                foreach ($poNumbers as $resultRow) {
                    $urlPath ="ZZGP_API/ZZGP_PO/GP_PUR_NONRM?sap-client=900&PO_NO=$resultRow";
                    $data = SapUrlHelper::getWhDatas($urlPath);
                    $result = json_decode($data, true);

                    if (!empty($result)) { 
                        $mergedResults []= array_merge($mergedResults, $result); // Merge results
                    }
                }
                return $mergedResults; 
    }

    public function ReceiptDetailsPost($data){       
        $sap_data_array = []; // Initialize an empty array
        $sap_data_array1 = [];
        $table_data = []; // Initialize an empty array
        $CurrentDateTime=date("Y-m-d H:i:s");
        foreach ($data->MaterialDetails as $detail) {
            foreach ($detail->materials as $resultRow) {
                // Safe date conversion
                $invoiceDate = DateTime::createFromFormat('d-m-Y', $resultRow->invoiceDate);
                $formattedInvoiceDate = $invoiceDate ? $invoiceDate->format('Ymd') : null;
                $postingDate = DateTime::createFromFormat('Y-m-d', $resultRow->postingDate);
                $postingDate = $postingDate ? $postingDate->format('Ymd') : null;
                $ManufacturingDate = DateTime::createFromFormat('Y-m-d', $resultRow->ManufacturingDate);
                $ManufacturingDate = $ManufacturingDate ? $ManufacturingDate->format('Ymd') : null;
                $expiryDate = DateTime::createFromFormat('Y-m-d', $resultRow->expiryDate);
                $expiryDate = $expiryDate ? $expiryDate->format('Ymd') : null;
                // SAP Data Array
                $CurrentDate=date("Y-m-d");
                $fileContents = '';
                $filename = '';
                $fileformat = '';
                if($resultRow->extraAttachments){
                    $fileUrl = str_replace(' ', '%20', $resultRow->extraAttachments); // Fix spaces in URL
            
                    $fileContents = @file_get_contents($fileUrl);
                    $fileContents = base64_encode($fileContents);
                    $filename = basename($fileUrl);
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
					$mimeType = finfo_buffer($finfo, $fileContents);
					finfo_close($finfo);
		
					// Map MIME type to file extension
					$mimeToExt = [
						'application/pdf' => '.pdf',
						'image/png' => '.png',
						'image/jpeg' => '.jpg',
						'image/jpg' => '.jpg'
					];
		
					$fileformat = $mimeToExt[$mimeType] ?? '';
                }
                $sap_data_array[] = array(
                    "po_no" => $resultRow->poNumber ?? '',
                    "po_line_item" => $resultRow->lineItem ?? '',
                    "va_no" => $data->vaNumber ?? '',
                    "truck_no" => $data->vehicleNo ?? '',
                    "material" => $resultRow->material ?? '',
                    "plant" => $resultRow->plantCode ?? '',
                    "storage_location" => $resultRow->storageLocation ?? '',
                    "quantity" => $resultRow->receivedQty ?? 0,
                    "uom" => $resultRow->uom ?? '',
                    "supplier_cod" => $resultRow->vendorCode ?? '',
                    "bill_no" => $resultRow->invoiceNo ?? '',
                    "bill_date" => $formattedInvoiceDate,
                    "doc_date"=>$formattedInvoiceDate,
                    "psting_date"=>$postingDate,
                    "gatein"=>$data->gateInDateStamp,
                    "mgf_date"=>$ManufacturingDate ?? '',
                    "Del_note_qty"=>$resultRow->InvoiceQty ?? 0,
                    "filename"=>$filename ?? '',
                    "fileformat"=>$fileformat ?? '',
                    "other_attch"=>$fileContents ?? '',
                    "LLR"=>$resultRow->llrNo,
                    "weigh_no"=>$resultRow->weighmentNo,
                    "rec_record"=>$resultRow->manualRecord,
                    "batch_code"=>$resultRow->batchCode,
                    "expiry_date"=>$expiryDate,
                );
                $sap_data_array1[] = array(
                    "packno" => $resultRow->packNo ?? '',
                    // "int_row" => $resultRow->intRow ?? '',
                    "S_TEXT" => $data->vaNumber ?? '',
                    "PO_NUM" => $resultRow->poNumber ?? '',
                    "EBELP" => $resultRow->lineItem ?? '',
                    "DOC_DATE" => $formattedInvoiceDate ?? '',
                    "POST_DATE" => $postingDate,
                    "REFERENCE" => $resultRow->invoiceNo ?? '',
                    "SUBPACKNO" => $resultRow->subPackNo ?? '',
                    "EXTROW" => $resultRow->extRow ?? '',
                    "QUANTITY" =>$resultRow->receivedQty ?? '', 
                    "filename"=>$filename ?? '',
                    "fileformat"=>$fileformat ?? '',
                    "other_attch"=>$fileContents ?? '',     
                );
                // Table Data Array
                $table_data[] = array(
                    "poNumber" => $resultRow->poNumber ?? '',
                    "lineItem" => $resultRow->lineItem ?? '',
                    "gateInOutInfoId" => $resultRow->gateInOutInfoId ?? '',
                    "purchaseIds" => $resultRow->purchaseIds ?? '',
                    "vendorCode" => $resultRow->vendorCode ?? '',
                    "vendorName" => $resultRow->vendorName ?? '',
                    "poType" => $resultRow->poType ?? '',
                    "purchaseGroup" => $resultRow->purchaseGroup ?? '',
                    "purchaseOrg" => $resultRow->purchaseOrg ?? '',
                    "companyCode" => $resultRow->companyCode ?? '',
                    "invoiceDate" => $formattedInvoiceDate,
                    "invoiceNo" => $resultRow->invoiceNo ?? '',
                    "material" => $resultRow->material ?? '',
                    "materialDescription" => $resultRow->materialDescription ?? '',
                    "poQty" => $resultRow->poQty ?? 0,
                    "grnQty" => $resultRow->grnQty ?? 0,
                    "receivedQty" => $resultRow->receivedQty ?? 0,
                    "openQty" => $resultRow->openQty ?? 0,
                    "remainQty" => $resultRow->remainQty ?? 0,
                    "poRate" => $resultRow->poRate ?? 0,
                    "uom" => $resultRow->uom ?? '',
                    "storageLocation" => $resultRow->storageLocation ?? '',
                    "plantCode" => $resultRow->plantCode ?? '',
                    "prNumber" => $resultRow->prNumber ?? '',
                    "prType" => $resultRow->prType ?? '',
                    "freightCharge" => $resultRow->freightCharge ?? 0,
                    "packingCharge" => $resultRow->packingCharge ?? 0,
                    "loadingCharge" => $resultRow->loadingCharge ?? 0,
                    "unloadingCharge" => $resultRow->unloadingCharge ?? 0,
                    "otherCharge" => $resultRow->otherCharge ?? 0,
                    "ineligibleCharge" => $resultRow->ineligibleCharge ?? 0,
                    "tolerance" => $resultRow->tolerance ?? 0,
                    "rcm" => $resultRow->rcm ?? 0,
                    "migoNumber" => '',
                    "status" => 1,
                    "createdBy" => $resultRow->userId ?? '',
                    "hsn" => $resultRow->hsn ?? '',
                    "packNo"=>  $resultRow->packNo ?? '',
                    "subPackNo"=>  $resultRow->subPackNo ?? '',
                    "intRow" =>  $resultRow->intRow ?? '',
                    "extRow" =>  $resultRow->extRow ?? '',
                    "postingDate"=>$resultRow->postingDate ?? '',
                    "extraAttachments"=>$resultRow->extraAttachments ?? '',
                    "manufacturingDate"=>$resultRow->ManufacturingDate ?? '',
                    "invoiceQty"=>$resultRow->InvoiceQty ?? 0,
                    "llrNo"=>$resultRow->llrNo,
                    "weighmentNo"=>$resultRow->weighmentNo,
                    "manualRecord"=>$resultRow->manualRecord,
                    "materialRate"=>$resultRow->materialRate,
                    "materialTax"=>$resultRow->materialTax,
                    "materialAmount"=>$resultRow->materialAmount,
                    "materialFreight"=>$resultRow->materialFreight,
                    "materialPacking"=>$resultRow->materialPacking,
                    "materialLoading"=>$resultRow->materialLoading,
                    "materialUnloading"=>$resultRow->materialUnloading,
                    "materialOther"=>$resultRow->materialOther,
                    "invoiceFreightAmount"=>$resultRow->invoiceFreightAmount,
                    "invoiceMaterialAmount"=>$resultRow->invoiceMaterialAmount,
                    "invoicePackingAmount"=>$resultRow->invoicePackingAmount,
                    "bargainNote"=>$resultRow->bargainNote,
                    "deliveryChallanCopy"=>$resultRow->deliveryChallanCopy,
                    "ewayBillCopy"=>$resultRow->ewayBillCopy,
                    "eInvoiceCopy"=>$resultRow->eInvoiceCopy,
                    "qcCertificateInternalCopy"=>$resultRow->qcCertificateInternalCopy,
                    "qcCertificateExternalCopy"=>$resultRow->qcCertificateExternalCopy,
                    "externalWbCopy"=>$resultRow->externalWbCopy,
                    "vendorEmailCopy"=>$resultRow->vendorEmailCopy,
                    "projectTeamAcknowledgement"=>$resultRow->projectTeamAcknowledgement,
                    "creditNoteCopy"=>$resultRow->creditNoteCopy,
                    "discountAmount"=>$resultRow->discount,
                    "discountPercentage"=>$resultRow->discount,
                    "materialIneligible"=>$resultRow->materialIneligible,
                    "invoiceLoadingAmount"=>$resultRow->invoiceLoadingAmount,
                    "invoiceUnloadingAmount"=>$resultRow->invoiceUnloadingAmount,
                    "invoiceOtherAmount"=>$resultRow->invoiceOtherAmount,
                    "invoiceIneligibleAmount"=>$resultRow->invoiceIneligibleAmount,
                    "taxPercentage"=>$resultRow->taxPercentage,
                    "batchCode"=>$resultRow->batchCode,
                    "expiryDate"=>$resultRow->expiryDate,
                    "freightCost"=>$resultRow->freightCost,
                    "materialCost"=>$resultRow->materialCost,
                    "packingCost"=>$resultRow->packingCost,
                    "loadingCost"=>$resultRow->loadingCost,
                    "unloadingCost"=>$resultRow->unloadingCost,
                    "otherCost"=>$resultRow->otherCost,
                    "ineligibleCost"=>$resultRow->ineligibleCost,
                    "discountCost"=>$resultRow->discountCost,
                    "rcmValue"=>$resultRow->rcmValue,
                    "jitc"=>$resultRow->jitcValue,
                    "cess"=>$resultRow->cessValue,
                );
            }
        }
         $STATUS = '';
         $message = '';
         $sapdata = '';
         $document_no = '';
         $MIRO_LINE = '';
        //  print_r($sap_data_array);exit;
        if($data->isReceipt == 0){
           if($data->po_type == 0){
            $urlPath ="zzgp_api/zzgp_migo/GP_MIGO?sap-client=900";
            $sapdata = $sap_data_array;
            // print_r($sapdata);exit;
            $res = SapUrlHelper::PushToSap($urlPath,json_encode($sapdata));
            // print_r($res);exit;
            $STATUS = $res[0]->STATUS;
            $message = $res[0]->MESSAGE;
            $document_no = $res[0]->MIGO_NO;
            $MIRO_LINE = $res[0]->MIRO_LINE;
           }else{
            $urlPath ="ZZGP_API/ZZGP_PO/GP_PUR_NONRM?sap-client=900";
            $sapdata = $sap_data_array1;
            $res = SapUrlHelper::PushToSap($urlPath,json_encode($sapdata));
            $STATUS = $res[0]->OVERALL_STATUS;
            $message = $res[0]->MESSAGE;
            $document_no = $res[0]->MIGO_NO;
            $finalMiroLines  = [];
            foreach ($res as $entry) {
               
                $miroLines = $entry->MIRO_LINE ?? [];
            
                foreach ($miroLines as $line) {
                    $finalMiroLines[] = $line;
                }
            }
            $MIRO_LINE =  $finalMiroLines;
           
           }   
         }
        if($STATUS == 0 && $data->isReceipt == 0){
            return array(0,"$message Please Contact SAP Team");
        }else if((($STATUS > 0 && $data->isReceipt == 0 && $MIRO_LINE) || ($data->isReceipt == 1))){

            // Update migoNumber in $table_data
            foreach ($table_data as &$row) {
                $row["migoNumber"] = $document_no ?? ''; // Assign MIGO number
                $row["status"] = $data->isReceipt == 0 ? 2 : 1; // Assign MIGO number
            }
            $resultData = '';
            if($data->isReceipt == 0){
               
                $data1 = []; 
                $lineItemCounter = 1;
                foreach ($MIRO_LINE as $item) {
                   
                    $invoiceDate = $data->MaterialDetails[0]->materials[0]->invoiceDate ?? date('Y-m-d');

                    // Check if the invoiceDate is in 'DD-MM-YYYY' format and convert to 'YYYY-MM-DD'
                    if ($invoiceDate) {
                        $dateObj = DateTime::createFromFormat('d-m-Y', $invoiceDate);
                        if ($dateObj) {
                            $invoiceDate = $dateObj->format('Y-m-d'); // Convert to 'YYYY-MM-DD'
                        }
                    }
                    $invoiceNo = $data->MaterialDetails[0]->materials[0]->invoiceNo ?? '';
                    $invoiceCopy = $data->invoiceCopy ?? '';
                    $gateInOutInfoId = $data->MaterialDetails[0]->materials[0]->gateInOutInfoId ?? '';
                    $extraCopy = $data->MaterialDetails[0]->materials[0]->extraAttachments ?? null;
                    $ewayBillCopy = $data->MaterialDetails[0]->materials[0]->ewayBillCopy ?? null;
                    $eInvoiceCopy = $data->MaterialDetails[0]->materials[0]->eInvoiceCopy ?? null;
                    $externalWbCopy = $data->MaterialDetails[0]->materials[0]->externalWbCopy ?? null;
                    $qcCertificateInternalCopy = $data->MaterialDetails[0]->materials[0]->qcCertificateInternalCopy ?? null;
                    $qcCertificateExternalCopy = $data->MaterialDetails[0]->materials[0]->qcCertificateExternalCopy ?? null;
                    $bargainNote = $data->MaterialDetails[0]->materials[0]->bargainNote ?? null;
                    $deliveryChallanCopy = $data->MaterialDetails[0]->materials[0]->deliveryChallanCopy ?? null;
                    $creditNoteCopy = $data->MaterialDetails[0]->materials[0]->creditNoteCopy ?? null;
                    $projectTeamAcknowledgement = $data->MaterialDetails[0]->materials[0]->projectTeamAcknowledgement ?? null;
                    $vendorEmailCopy = $data->MaterialDetails[0]->materials[0]->vendorEmailCopy ?? null;
                    $userId = $data->MaterialDetails[0]->materials[0]->userId ?? null;
                    $attach = $item->ATTACHMENT == 'attach' ? 1 : 0 ;
                    // print_r($item);exit;
                    $data1 []= [
                    "lineItem" => $item->BUZEI, // Increment line item counter
                    "poNumber" => $item->PO_NUMBER,
                    "poItem" => $item->PO_ITEM,
                    "refNo" => $item->REF_NO,
                    "refLine" => $item->REF_LINE,
                    "migoNumber"=>$item->MIGO_NUMBER,
                    "migoLine"=>$item->MIGO_LINE,
                    "year" => $item->YEAR,
                    "condition" => $item->CONDITION,
                    "vendor" => $item->VENDOR,
                    "taxCode" => $item->TAX_CODE,
                    "amount" => $item->ITEM_AMOUNT, // Ensure this is the correct field
                    "quantity" => $item->QUANTITY,
                    "poUnit" => $item->PO_UNIT,
                    "itemText" => $item->DESCRIPTION,
                    "gl"=>$item->GL,
                    "valuationType" => $item->VALUATION_TYPE,
                    "docDate" => $attach == 1 ? $invoiceDate : null,
                    "postingDate" => $CurrentDate,
                    "refDocNo" => $attach == 1 ? $invoiceNo : null, // SAP
                    "compCode" => $item->COMP_CODE,
                    "currency" => $item->CURRENCY, // SAP
                    "head_text" => '',
                    "gross_amount" => $data->ITEM_AMOUNT, // SAP
                    "gateInOutInfoId" => $gateInOutInfoId,
                    "invoiceCopy" =>  $attach == 1 ? $invoiceCopy : null,
                    "extraCopy" => $extraCopy,
                    "plantCode" => $item->PLANT,
                    "paymentMethod" => $item->PAYMENT_METHOD,
                    "profitCenter" => $item->PROFIT_CENTER,
                    "costCenter"=>$item->COSTCENTER,
                    "fiDocument"=>$item->FI_DOC,
                    "status"=>1,
                    "createdBy"=>$userId,
                    "vendorName"=>$item->VENDOR_NAME1,
                    "attach"=>$attach,
                    "totalTax"=>$item->TOTAL_TAX,
                    "conditionDetails"=>$item->CONDITION_INT,
                    'orderQty'=>$item->ORDER_QTY,
                    'orderUnit'=>$item->ORDER_UNIT,
                    'serviceLine'=>$item->SER_LINE,
                    "bargainNote"=>$bargainNote,
                    "deliveryChallanCopy"=>$deliveryChallanCopy,
                    "ewayBillCopy"=>$ewayBillCopy,
                    "eInvoiceCopy"=>$eInvoiceCopy,
                    "qcCertificateInternalCopy"=>$qcCertificateInternalCopy,
                    "qcCertificateExternalCopy"=>$qcCertificateExternalCopy,
                    "externalWbCopy"=>$externalWbCopy,
                    "vendorEmailCopy"=>$vendorEmailCopy,
                    "projectTeamAcknowledgement"=>$projectTeamAcknowledgement,
                    "creditNoteCopy"=>$creditNoteCopy,
                    // "miroId"=>$res
                ];
                }
            $existingEntries1 = $this->db->table("miro_entry")
            ->whereIn('fiDocument', array_column($data1, 'fiDocument'))
            ->whereIn('year', array_column($data1, 'year'))
            ->whereIn('compCode', array_column($data1, 'compCode'))
            ->whereIn('lineItem', array_column($data1, 'lineItem'))
            ->where('status != 0')
            ->countAllResults();
            $resultData = 0;
            if ($existingEntries1 == 0) {
                $resultData = $this->MiroPosting($data1);
            }
            }
            if ($data->isReceipt == 0 && $resultData == 0 && $existingEntries1 == 0) {
                return [0, "The Entry is Not saved please resubmit the Entries"];
            }
            // Check for duplicate entries
            if(($resultData > 0  || $data->isReceipt == 1 || $existingEntries1 > 0)){
                $existingEntries = $this->db->table("receipt_material_info")
                ->whereIn('vendorCode', array_column($table_data, 'vendorCode'))
                ->whereIn('poNumber', array_column($table_data, 'poNumber'))
                ->whereIn('invoiceNo', array_column($table_data, 'invoiceNo'))
                ->whereIn('lineItem', array_column($table_data, 'lineItem'))
                ->where('migoNumber',$document_no)
                ->where('status != 0')
                ->countAllResults();

            if ($existingEntries > 0) {
                return array(0, "Duplicate entry detected: MIGO Number " . $document_no . " already exists.");
            }
            $purchaseIds = explode(',', $data->purchaseId);
            
            $builder = $this->db->table("receipt_material_info");
            $builder = $builder->insertBatch($table_data);
            $lastInsertId = $this->db->insertID(); 
            if ($lastInsertId > 0) {
                // ✅ Ensure $purchaseIds is an array
                if (!is_array($purchaseIds)) {
                    $purchaseIds = explode(',', $purchaseIds);
                }
            
                // ✅ Update purchase_order table
                $this->db->table('purchase_order')
                    ->set(['migoNumber' => $document_no, 'migoDate' => $CurrentDateTime,'status'=>$data->isReceipt == 0 ? 2 : 1,'msme'=>$data->msme])
                    ->whereIn('id', $purchaseIds)
                    ->update();
                if($data->isReceipt == 0){
                // ✅ Check if any entries exist with migoNumber
                if ($this->db->affectedRows() > 0) {
                    $existing = $this->db->table("purchase_order")
                        ->select('loadingUnloadingInfoId')
                        ->whereIn('id', $purchaseIds)
                        ->get()
                        ->getResultArray();
                    $loadingUnloadingInfoId = $existing[0]['loadingUnloadingInfoId'];
                    $existingEntries1 = $this->db->table('purchase_order')
                                        ->where('loadingUnloadingInfoId', $loadingUnloadingInfoId)
                                        ->where('isDelete', 0)
                                        ->groupStart()
                                            ->where('migoNumber', null)
                                            ->orWhere('migoNumber', '')
                                        ->groupEnd()
                                        ->countAllResults();
                    // print_r($data->gateInOutInfoId);exit;
                    // ✅ If no existing entries, update `gate_in_out_info`
                    // print_r($data->gateInOutInfoIds);exit;
                    if($data->gateInOutInfoIds){
                        $this->db->table('gate_in_out_info')
                        ->set(['waitingAt' => 8])
                        ->whereIn('id', $data->gateInOutInfoIds)
                        ->update();
                    }else{
                    if ($existingEntries1 == 0) {
                        $this->db->table('gate_in_out_info')
                            ->set(['waitingAt' => 8, 'moduleStatusId' => 10])
                            ->where('id', $table_data[0]['gateInOutInfoId'])
                            ->update();
                    }}
                }
            }
            }
            if($data->isReceipt == 0 && $data->po_type == 0){
                return array($lastInsertId ,"Submitted Successfully , The MIGO Number is ".$document_no); 
            }else if($data->isReceipt == 0 && $data->po_type == 1){
                return array($lastInsertId ,"Submitted Successfully , The Entry Sheet Number is ".$document_no); 
            }else{
                return array($lastInsertId ,"Submitted Successfully"); 
            }
        }
        }else{
            return array(0,'Please Contact Admin'); 
        }
    }
    public function ReceiptDetailsGetByUsers($status, $userId,$fromDate,$toDate) {
        if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
            $fromDate /= 1000;
        }
        if ($toDate > 1000000000000) {
            $toDate /= 1000;
        }
        $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
        $toDate = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");
        if($status == 1){
            $cnd = "";
        }else{
            $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '$fromDate' AND '$toDate'";
        }
        // print_r($cnd);exit;
        $builder = $this->db->table("purchase_order")
            ->select("
                purchase_order.*,
                gate_in_out_info.id as gateId,
                gate_in_out_info.vehicleNo,
                gate_in_out_info.vaNumber,
                master_plant.PLANT_NAME,
                master_module.moduleType,
                GROUP_CONCAT(DISTINCT purchase_order.poNumber ORDER BY purchase_order.poNumber ASC) AS poNumbers,
                GROUP_CONCAT(DISTINCT purchase_order.id ORDER BY purchase_order.id ASC) AS purchaseIds,
                CONCAT(
                    TIMESTAMPDIFF(DAY, purchase_order.dateStamp, NOW()), ' Days ',
                    TIMESTAMPDIFF(HOUR, purchase_order.dateStamp, NOW()) % 24, ' Hrs ',
                    TIMESTAMPDIFF(MINUTE, purchase_order.dateStamp, NOW()) % 60, ' Mins'
                ) AS dateStamp,
                CONCAT(
                    TIMESTAMPDIFF(DAY, receipt_material_info.createdAt, NOW()), ' Days ',
                    TIMESTAMPDIFF(HOUR, receipt_material_info.createdAt, NOW()) % 24, ' Hrs ',
                    TIMESTAMPDIFF(MINUTE, receipt_material_info.createdAt, NOW()) % 60, ' Mins'
                ) AS gateOutDateStamp
            ")
            ->join('gate_in_out_info', 
                '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId 
                    OR gate_in_out_info.id = purchase_order.gateInOutInfoId)', 'inner')
            ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
            ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner') // Fixed duplicate join
            ->join('receipt_material_info', 'receipt_material_info.gateInOutInfoId = gate_in_out_info.id', 'inner')
            ->where('purchase_order.status', $status);
            // ->where($cnd);
            if($status > 1){
                $builder->where($cnd);
            }
	    if($status == 1){
                $builder->where('receipt_material_info.status',1);
            }        
           if ($userId != 1) {        
            $builder->where("
                gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userId)
                AND gate_in_out_info.moduleType IN (SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userId)
            ");
        }
    
        $builder->groupBy('purchase_order.invoiceNo'); // Grouping by Invoice Number
    
        return $builder->get()->getResultArray();
    }

    public function getMaterialDetailList($purchaseId,$status){
        $builder = $this->db->table("receipt_material_info")
        ->select("receipt_material_info.*")
        ->where('receipt_material_info.status', $status);
        if (!is_array($purchaseId)) {
            $purchaseId = explode(',', $purchaseId);
        }
        // Use safe whereIn()
        $builder->whereIn('receipt_material_info.purchaseIds', $purchaseId);
        return $builder->get()->getResultArray(); 
    }

    public function ReceiptDetailsUpdate($data) {
        $urlPath = "zzgp_api/zzgp_migo/GP_MIGO?sap-client=900";
        $urlPath1 = "zzgp_api/zzgp_plant/plant?sap-client=900";
        $urlPath2 = "ZZGP_API/ZZGP_PO/GP_PUR_NONRM?sap-client=900";
        $sap_data_array = []; 
        $sap_data_array1 = []; 
        $sap_data_array2 = []; 
        $CurrentDateTime = date("Y-m-d H:i:s");
        $CurrentDate= date("Ymd");
        $CurrentDate1= date("Y-m-d");
        $purchaseIds = explode(',', $data->purchaseId);
        switch ($data->status) {
            case 0:
                $this->updateTables($purchaseIds, 
                    ['status' => $data->status,'migoNumber'=>null], 
                    ['storeMGRejectBy' => $data->userId, 'storeMGRejectAt' => $CurrentDateTime, 'status' => $data->status],$data->gateId,$MIRO_LINE = '',$data
                );
                return [1, "Rejected Successfully"];
                break;
            case 2:
                foreach ($data->MaterialDetails as $resultRow) {
                        // Convert invoice date safely
                        // $invoiceDate = DateTime::createFromFormat('d-m-Y', $resultRow->invoiceDate);
                        // $formattedInvoiceDate = $invoiceDate ? $invoiceDate->format('Y-m-d') : null;
                        // print_r($resultRow->invoiceDate);exit;
                        // Build SAP data array
                        $invoiceDate = DateTime::createFromFormat('Y-m-d', $resultRow->invoiceDate);
                        $invoiceDate = $invoiceDate ? $invoiceDate->format('Ymd') : null;
                        $postingDate = DateTime::createFromFormat('Y-m-d', $resultRow->postingDate);
                        $postingDate = $postingDate ? $postingDate->format('Ymd') : null;
                        $sap_data_array[] = [
                            "po_no"            => $resultRow->poNumber ?? '',
                            "po_line_item"     => $resultRow->lineItem ?? '',
                            "va_no"            => $data->vaNumber ?? '',
                            "truck_no"         => $data->vehicleNo ?? '',
                            "material"         => $resultRow->material ?? '',
                            "plant"            => $resultRow->plantCode ?? '',
                            "storage_location" => $resultRow->storageLocation ?? '',
                            "quantity"         => $resultRow->receivedQty ?? 0,
                            "uom"              => $resultRow->uom ?? '',
                            "supplier_cod"     => $resultRow->vendorCode ?? '',
                            "bill_no"          => $resultRow->invoiceNo ?? '',
                            "bill_date"        => $invoiceDate,
                            "doc_date"         => $invoiceDate,
                            "psting_date"      => $CurrentDate,
                            "gatein"=>$data->gateInDateStamp,
                            "mgf_date"=>$ManufacturingDate ?? '',
                            "Del_note_qty"=>$resultRow->InvoiceQty ?? 0,
                            // "filename"=>$filename ?? '',
                            // "fileformat"=>$fileformat ?? '',
                            // "other_attch"=>$fileContents ?? '',
                            "LLR"=>$resultRow->llrNo,
                            "weigh_no"=>$resultRow->weighmentNo,
                            "rec_record"=>$resultRow->manualRecord,
                            "batch_code"=>$resultRow->batchCode,
                            "expiry_date"=>$resultRow->expiryDate,
                        ];
                        $sap_data_array2[] = array(
                            "packno" => $resultRow->packNo ?? '',
                            // "int_row" => $resultRow->intRow ?? '',
                            "S_TEXT" => $data->vaNumber ?? '',
                            "PO_NUM" => $resultRow->poNumber ?? '',
                            "EBELP" => $resultRow->lineItem ?? '',
                            "DOC_DATE" => $invoiceDate ?? '',
                            "POST_DATE" => $CurrentDate,
                            "REFERENCE" => $resultRow->invoiceNo ?? '',
                            "SUBPACKNO" => $resultRow->subPackNo ?? '',
                            "EXTROW" => $resultRow->extRow ?? '',
                            "QUANTITY" => $resultRow->receivedQty ?? '',      
                        );
                }
                // print_r($sap_data_array);exit;

                // Send to SAP
                $message = '';
                $STATUS = '';
                $document_no = '';
                $MIRO_LINE = '';
                if($data->po_type == 0 && $data->type == 'APPROVE'){
                    $res = SapUrlHelper::PushToSap($urlPath, json_encode($sap_data_array));
                    $message = $res[0]->MESSAGE;
                    $STATUS = $res[0]->STATUS;
                    $document_no = $res[0]->MIGO_NO;
                    $MIRO_LINE = $res[0]->MIRO_LINE;
                }else if($data->po_type == 1 && $data->type == 'APPROVE'){
                    $res1 = SapUrlHelper::PushToSap($urlPath2, json_encode($sap_data_array2));
                    $message = $res1[0]->MESSAGE;
                    $STATUS = $res1[0]->STATUS;
                    $document_no = $res1[0]->MIGO_NO;
                    $finalMiroLines  = [];
                    foreach ($res1 as $entry) {  
                        $miroLines = $entry->MIRO_LINE ?? [];
                        foreach ($miroLines as $line) {
                            $finalMiroLines[] = $line;
                        }
                    }
                    $MIRO_LINE =  $finalMiroLines;   
                }
                // Check for a valid SAP response
                if (!isset($STATUS) && $data->type == 'APPROVE') {
                    return [0, "$message, Please contact the SAP Team."];
                }
    
                if ($STATUS == 0 && $data->type == 'APPROVE') {
                    return [0, "$message. Please contact the SAP Team."];
                } elseif ($STATUS > 0 || $data->type == 'REJECT') {
                    // Update receipt_material_info and purchase_order
                    $this->updateTables($purchaseIds, [
                        'migoNumber' => $document_no,
                        'migoDate' => $CurrentDateTime,
                        'status' => $data->status,
                    ], [
                        'migoNumber' => $document_no,
                        $data->type == 'REJECT' ? 'accountsRejectBy': 'mgApprovedBy' => $data->userId,
                        $data->type == 'REJECT' ? 'accountsRejectAt': 'mgApprovedAt' => $CurrentDateTime,
                        'status' => $data->status,
                        'postingDate' => $CurrentDate1
                    ],$data->gateId,$MIRO_LINE,$data);
                    
                    return [1, $data->type == 'REJECT'? 'Rejected Successfully':"Updated Successfully. The MIGO Number is " . $document_no];
                } else {
                    return [0, "Please contact Admin"];
                }
                break;
    
            case 3:
                $this->updateTables($purchaseIds, 
                    ['status' => $data->status], 
                    ['InvoiceSubmittedBy' => $data->userId, 'InvoiceSubmittedAt' => $CurrentDateTime, 'status' => $data->status],$data->gateId,$MIRO_LINE = '',$data
                );
                return [1, "Invoice Submitted Successfully"];
                break;
    
            case 4:
                    $this->updateTables($purchaseIds, 
                        ['status' => $data->status], 
                        ['InvoiceApprovedBy' => $data->userId, 'InvoiceApprovedAt' => $CurrentDateTime, 'status' => $data->status],$data->gateId,$MIRO_LINE = '',$data
                    );
                    return [1, "Invoice Acknowledged Successfully"];
            case 5:
                    // No SAP call for status 5 — just update DB
                    $this->updateTables($purchaseIds, 
                        ['status' => $data->status], 
                        [$data->type == 'REJECT'? 'storeRejectBy' : 'InvoiceApprovedBy' => $data->userId, $data->type == 'REJECT'? 'storeRejectAt':'InvoiceApprovedAt' => $CurrentDateTime, 'status' => $data->status],$data->gateId,$MIRO_LINE = '',$data
                    );
                    return [1, "Rejected Successfully"];
                    break;
        }
    }
    
    /**
     * Helper function to update receipt_material_info and purchase_order tables
     */
    private function updateTables($purchaseIds, $receiptUpdateData, $orderUpdateData,$gateId,$MIRO_LINE,$data) {
        if($MIRO_LINE){
        foreach ($MIRO_LINE as $item) {   
            $invoiceDate = $data->MaterialDetails[0]->invoiceDate ?? date('Y-m-d');

            // Check if the invoiceDate is in 'DD-MM-YYYY' format and convert to 'YYYY-MM-DD'
            if ($invoiceDate) {
                $dateObj = DateTime::createFromFormat('d-m-Y', $invoiceDate);
                if ($dateObj) {
                    $invoiceDate = $dateObj->format('Y-m-d'); // Convert to 'YYYY-MM-DD'
                }
            }
            $invoiceNo = $data->MaterialDetails[0]->invoiceNo ?? '';
            $invoiceCopy = $data->invoiceCopy ?? '';
            $gateInOutInfoId = $gateId ?? '';
            $extraCopy = $data->MaterialDetails[0]->extraAttachments ?? null;
            $userId = $data->userId ?? null;
            $attach = $item->ATTACHMENT == 'attach' ? 1 : 0 ;
            $CurrentDate = date("Y-m-d");
            $ewayBillCopy = $data->MaterialDetails[0]->ewayBillCopy ?? null;
            $eInvoiceCopy = $data->MaterialDetails[0]->eInvoiceCopy ?? null;
            $externalWbCopy = $data->MaterialDetails[0]->externalWbCopy ?? null;
            $qcCertificateInternalCopy = $data->MaterialDetails[0]->qcCertificateInternalCopy ?? null;
            $qcCertificateExternalCopy = $data->MaterialDetails[0]->qcCertificateExternalCopy ?? null;
            $bargainNote = $data->MaterialDetails[0]->bargainNote ?? null;
            $deliveryChallanCopy = $data->MaterialDetails[0]->deliveryChallanCopy ?? null;
            $creditNoteCopy = $data->MaterialDetails[0]->creditNoteCopy ?? null;
            $projectTeamAcknowledgement = $data->MaterialDetails[0]->projectTeamAcknowledgement ?? null;
            $vendorEmailCopy = $data->MaterialDetails[0]->vendorEmailCopy ?? null;
            // print_r($item);exit;
            $data1 []= [
            "lineItem" => $item->BUZEI, // Increment line item counter
            "poNumber" => $item->PO_NUMBER,
            "poItem" => $item->PO_ITEM,
            "refNo" => $item->REF_NO,
            "refLine" => $item->REF_LINE,
            "migoNumber"=>$item->MIGO_NUMBER,
            "migoLine"=>$item->MIGO_LINE,
            "year" => $item->YEAR,
            "condition" => $item->CONDITION,
            "vendor" => $item->VENDOR,
            "taxCode" => $item->TAX_CODE,
            "amount" => $item->ITEM_AMOUNT, // Ensure this is the correct field
            "quantity" => $item->QUANTITY,
            "poUnit" => $item->PO_UNIT,
            "itemText" => $item->DESCRIPTION,
            "gl"=>$item->GL,
            "valuationType" => $item->VALUATION_TYPE,
            "docDate" => $attach == 1 ? $invoiceDate : null,
            "postingDate" => $CurrentDate,
            "refDocNo" => $attach == 1 ? $invoiceNo : null, // SAP
            "compCode" => $item->COMP_CODE,
            "currency" => $item->CURRENCY, // SAP
            "head_text" => '',
            "gross_amount" => $item->ITEM_AMOUNT, // SAP
            "gateInOutInfoId" => $gateInOutInfoId,
            "invoiceCopy" =>  $attach == 1 ? $invoiceCopy : null,
            "extraCopy" => $extraCopy,
            "plantCode" => $item->PLANT,
            "paymentMethod" => $item->PAYMENT_METHOD,
            "profitCenter" => $item->PROFIT_CENTER,
            "costCenter"=>$item->COSTCENTER,
            "fiDocument"=>$item->FI_DOC,
            "status"=>1,
            "createdBy"=>$userId,
            "vendorName"=>$item->VENDOR_NAME1,
            "attach"=>$attach,
            "totalTax"=>$item->TOTAL_TAX,
            "conditionDetails"=>$item->CONDITION_INT,
            'orderQty'=>$item->ORDER_QTY,
            'orderUnit'=>$item->ORDER_UNIT,
            'serviceLine'=>$item->SER_LINE,
            "bargainNote"=>$bargainNote,
            "deliveryChallanCopy"=>$deliveryChallanCopy,
            "ewayBillCopy"=>$ewayBillCopy,
            "eInvoiceCopy"=>$eInvoiceCopy,
            "qcCertificateInternalCopy"=>$qcCertificateInternalCopy,
            "qcCertificateExternalCopy"=>$qcCertificateExternalCopy,
            "externalWbCopy"=>$externalWbCopy,
            "vendorEmailCopy"=>$vendorEmailCopy,
            "projectTeamAcknowledgement"=>$projectTeamAcknowledgement,
            "creditNoteCopy"=>$creditNoteCopy,
            // "miroId"=>$res
        ];
        }
    // print_r($data1);exit;
    $existingEntries1 = $this->db->table("miro_entry")
    ->whereIn('fiDocument', array_column($data1, 'fiDocument'))
    ->whereIn('year', array_column($data1, 'year'))
    ->whereIn('compCode', array_column($data1, 'compCode'))
    ->whereIn('lineItem', array_column($data1, 'lineItem'))
    ->where('status != 0')
    ->countAllResults();
    $resultData = 0;
    // print_r($data1);exit;
    if ($existingEntries1 == 0) {
        $resultData = $this->MiroPosting($data1);
    }}
    
    // if ($resultData == 0 && $existingEntries1 == 0) {
    //     return [0, "The Entry is Not saved please resubmit the Entries"];
    // }}
    if($resultData > 0 || $existingEntries1 == 0 || $data->status == 5 || $data->status == 0){
    $this->db->table("receipt_material_info")
        ->set($orderUpdateData)
        ->whereIn('purchaseIds', $purchaseIds)
        ->update();

    $this->db->table("purchase_order")
        ->set($receiptUpdateData)
        ->whereIn('id', $purchaseIds)
        ->whereIn('status', [1,2,3,4,5])
        ->update();
    if ($this->db->affectedRows() > 0 && $receiptUpdateData['status'] != 0) {
        $existing = $this->db->table("purchase_order")
        ->select('loadingUnloadingInfoId')
        ->whereIn('id', $purchaseIds)
        ->get()
        ->getResultArray();
        $loadingUnloadingInfoId = $existing[0]['loadingUnloadingInfoId'];
        $existingEntries2 = $this->db->table("purchase_order")
        ->where('loadingUnloadingInfoId', $loadingUnloadingInfoId)
        ->where('isDelete', 0)
        ->where('migoNumber IS NULL', null, false) // raw SQL
        ->countAllResults();
        // print_r($data->gateInOutInfoId);exit;
        // ✅ If no existing entries, update `gate_in_out_info`
        if ($existingEntries2 == 0) {
            $this->db->table('gate_in_out_info')
                ->set(['waitingAt' => 8, 'moduleStatusId' => 10])
                ->where('id', $gateId)
                ->update();
        }
    }
    }
    }
    public function StorageLocationFetch($plant){
            $urlPath ="zzgp_api/zzgp_plant/plant?sap-client=900&plant=$plant";
            $data = SapUrlHelper::getWhDatas($urlPath);
            $result = json_decode($data, true);
           
            $formattedLocations = array_map(function ($item) {
                return [
                    'value' => $item['STO_LOC'],
                    'label' => $item['STO_LOC']
                ];
            }, $result); // $result is your original array
            return $formattedLocations;
    }

public function ReceiptDetailsChange($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber){
        // Ensure timestamps are in seconds, not milliseconds
   if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
       $fromDate /= 1000;
   }
   if ($toDate > 1000000000000) {
       $toDate /= 1000;
   }

   // Convert to proper date format
   $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
   $toDate = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");
   
       // Fix condition syntax
       if ($userInfoId == 1) {
           $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '$fromDate' AND '$toDate' AND purchase_order.status IN (0,1,2,5)";
       } else {
           $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '$fromDate' AND '$toDate' 
           AND (
               purchase_order.status IN (0,1,2,5) 
               OR (gate_in_out_info.moduleType = 15 AND gate_in_out_info.moduleStatusId = 5 AND gate_in_out_info.waitingAt = 8)
           )
           AND purchase_order.poType IN (SELECT poTypeId FROM po_type_access WHERE userInfoId = $userInfoId)
           AND gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId)";
       }
       
       if (!empty($moduleTypeId)) {
        $cnd .= " AND purchase_order.poType = $moduleTypeId"; 
       }
       if (!empty($vaNumber)) {
           $cnd .= " AND gate_in_out_info.id = $vaNumber"; 
       }
       // Query Builder
       $builder = $this->db->table("purchase_order")
               ->select("
               purchase_order.*,
               gate_in_out_info.id as gate_in_out_info_id,
               gate_in_out_info.vehicleNo,
               gate_in_out_info.vaNumber,
               master_plant.PLANT_NAME,
               master_module.moduleType,
               GROUP_CONCAT(DISTINCT purchase_order.poNumber ORDER BY purchase_order.poNumber ASC) AS poNumbers,
               GROUP_CONCAT(DISTINCT purchase_order.id ORDER BY purchase_order.id ASC) AS purchaseIds,
               CONCAT(
                   TIMESTAMPDIFF(DAY, purchase_order.dateStamp, NOW()), ' Days ',
                   TIMESTAMPDIFF(HOUR, purchase_order.dateStamp, NOW()) % 24, ' Hrs ',
                   TIMESTAMPDIFF(MINUTE, purchase_order.dateStamp, NOW()) % 60, ' Mins'
               ) AS dateStamp,
               CONCAT(
                   TIMESTAMPDIFF(DAY, gate_in_out_info.gateOutDateStamp, NOW()), ' Days ',
                   TIMESTAMPDIFF(HOUR, gate_in_out_info.gateOutDateStamp, NOW()) % 24, ' Hrs ',
                   TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateOutDateStamp, NOW()) % 60, ' Mins'
               ) AS gateOutDateStamp
           ")
           ->join('gate_in_out_info', 
               '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId 
                   OR gate_in_out_info.id = purchase_order.gateInOutInfoId)', 'inner')
           ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
           ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner')
           ->where($cnd)
           ->groupBy('gate_in_out_info.vaNumber'); // Grouping by Invoice Number
   
       // Fetch Results
       $result = $builder->get()->getResultArray();
       return $result;
   } 

   public function getPurchaseInfoByUsersId($purchaseId, $userInfoId){


    $builder = $this->db->table("purchase_order")
        ->select("
            purchase_order.*,
            gate_in_out_info.vehicleNo,
            gate_in_out_info.vaNumber,
            master_plant.PLANT_NAME,
            master_module.moduleType,
            gate_in_out_info.id as gateInOutInfoId,
            gate_in_out_info.moduleType as moduleTypeId,
            gate_in_out_info.invoiceCopy as invoiceCopys,
            CONCAT(po_type.type, ' - ', po_type.name) AS poType,
            CONCAT(purchase_order.vendorCode, ' - ', purchase_order.vendorName) AS vendorName,
            gate_in_out_info.gateInDateStamp,
            gate_in_out_info.gateOutDateStamp,
            master_plant.werks,
            weighment_info.firstWeight,
            weighment_info.secondWeight,
            weighment_info.netWeight,
            gate_in_out_info.loadingUnloadingInfoId
        ")
        ->join('gate_in_out_info', 
            '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId 
                OR gate_in_out_info.id = purchase_order.gateInOutInfoId)', 'inner')
        ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
        ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner')
        ->join('weighment_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'left')
        ->join('po_type', 'po_type.id = purchase_order.poType', 'inner');
    // Ensure purchaseId is an array
    if (!is_array($purchaseId)) {
        $purchaseId = explode(',', $purchaseId);
    }
    // Use safe whereIn()
    $builder->whereIn('purchase_order.loadingUnloadingInfoId', $purchaseId);
    if ($userInfoId != 1) {
        $builder->where("gate_in_out_info.moduleType IN (
                            SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userInfoId)", null, false);
        // $builder->where("gate_in_out_info.masterPlantId IN (
        //                     SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId)", null, false);
        // $builder->where("purchase_order.status", 0);
        // $builder->where("purchase_order.migoNumber IS NULL", null, false);
        // $builder->where("purchase_order.isDelete", 0);
    }
    $builder=$builder->groupBy('purchase_order.id');
    return $builder->get()->getResultArray();
   }

   public function PoChangeUpdate($data) {
        $urlPath = "zgatepro/zgp_pochange/po_changes?sap-client=900";
        $CurrentDateTime = date("Y-m-d H:i:s");
        $purchaseIds = explode(',', $data->purchaseId);

        // Case 1: Just update PO table (no SAP call)

        // 🔎 Step 1: Check duplicates for all entries in poData
        foreach ($data->poData as $row) {
            $dupCheck = $this->db->table("purchase_order po")
                ->select("po.id")
                ->join("gate_in_out_info gio", "gio.loadingUnloadingInfoId = po.loadingUnloadingInfoId", "inner") // inner join ensures gate record exists
                ->where("po.poNumber", $row->poNumber)
                ->where("po.invoiceNo", $row->invoiceNo)
                ->where("po.vendorCode", $row->vendorCode)
                ->where("po.isDelete", 0)
                ->where("po.id !=", $row->id) // exclude self
                ->where("gio.waitingAt !=", 7) // only consider waitingAt != 7
                ->get()
                ->getRow();
        
            if ($dupCheck) {
                return [0, "Duplicate Invoice found for PO: {$row->poNumber}, Invoice: {$row->invoiceNo}, Vendor: {$row->vendorCode}"];
            }
        }
        if ($data->status == 1) {
            foreach ($data->poData as $row) {
                $this->updateTablesPurchase($row->id, [
                    'invoiceDate' => $row->invoiceDate,
                    'invoiceNo'   => $row->invoiceNo,
                    'status'      => $row->status,
                ]);
            }
            return [1, "Updated Successfully"];
        }

        // Case 2: Push data to SAP, then update local DB
        if ($data->status == 2) {
            $sapPayload = [
                "ZZVA_NO"            => $data->poData[0]->vaNumber,
                "ZZTRUCK_NO"         => $data->poData[0]->vehicleNo,
                "ZZPLANT"            => $data->poData[0]->werks,
                "ZZTRANSACTION_TYPE" => $data->poData[0]->moduleType,
                "ZZLOADING_WGT"      => $data->poData[0]->firstWeight,
                "ZZEMPTY_WGT"        => $data->poData[0]->secondWeight,
                "ZZNET_WEIGHT"       => $data->poData[0]->netWeight,
                "ZZGATEIN_TIME"      => $data->poData[0]->gateInDateStamp,
                "ZZGATEOUT_TIME"     => $data->poData[0]->gateOutDateStamp,
                "ZZLINE"             => $data->purchaseOrderData
            ];

            $sapResponse = SapUrlHelper::PushToSap($urlPath, json_encode([$sapPayload]));
            $message = $sapResponse[0]->MESSAGE;
            // print_r($sapResponse);exit;
            // Handle response
            if (!isset($sapResponse[0]) || !isset($sapResponse[0]->STATUS)) {
                return [0, "$message. Please contact the SAP Team."];
            }

            $status = $sapResponse[0]->STATUS;
            $message = $sapResponse[0]->MESSAGE;

            if ($status == 0) {
                return [0, "$message. Please contact the SAP Team."];
            }

            if ($status > 0) {
                foreach ($data->poData as $row) {
                    $this->updateTablesPurchase($row->id, [
                        'invoiceCopy' => $row->invoiceCopy,
                        'invoiceDate' => $row->invoiceDate,
                        'invoiceNo'   => $row->invoiceNo,
                        'status'      => $row->status,
                    ]);
                }
                return [1, "Updated Successfully"];
            }

            return [0, "Unknown SAP response. Please contact Admin."];
        }

        // Fallback (in case of unknown status)
        return [0, "Invalid status passed"];
  }

  private function updateTablesPurchase($id, $receiptUpdateData) {
    // print_r($receiptUpdateData);exit;

    $this->db->table("purchase_order")
        ->set($receiptUpdateData)
        ->where('id', $id)
        ->where('migoNumber IS NULL')
        ->update();
    $this->db->table("receipt_material_info")
        ->set('status',2)
        ->where('purchaseIds', $id)
        ->where('status', 5)
        ->update();
  }

  public function miroDatailsCheck($poNumber,$poLine,$migoNumber,$userId){

     // First get the list of allowed WERKS for the user
    $werksQuery = $this->db->table('master_user_plant')
        ->select('master_plant.WERKS')
        ->join('master_plant', 'master_plant.ID = master_user_plant.PLANT_ID', 'inner')
        ->where('master_user_plant.USER_ID', $userId)
        ->get();

    $allowedWerks = array_column($werksQuery->getResultArray(), 'WERKS');
    // print_r($migoNumber);exit;
    if (empty($allowedWerks) && $userId != 1) {
        return []; // Non-admin users with no plant access
    }
        // Now build the main query
        $builder = $this->db->table("receipt_material_info")
            ->select("receipt_material_info.poNumber, receipt_material_info.lineItem, receipt_material_info.migoNumber,receipt_material_info.invoiceDate,receipt_material_info.invoiceNo,purchase_order.invoiceCopy,receipt_material_info.id,receipt_material_info.plantCode,receipt_material_info.extraAttachments")
            ->join('purchase_order', 'purchase_order.id = receipt_material_info.purchaseIds', 'inner')
            ->where('receipt_material_info.poNumber', $poNumber)
            // ->where('receipt_material_info.lineItem', $poLine)
            ->where('receipt_material_info.lineItem', ltrim($poLine, '0'))
            ->where('receipt_material_info.migoNumber', $migoNumber)
            ->where('receipt_material_info.status', 4);
            if($userId != 1){
                $builder->whereIn('receipt_material_info.plantCode', $allowedWerks);
            }    
        return $builder->get()->getResultArray(); 
    }

  public function MiroPosting($data) {
    $builder = $this->db->table("miro_entry");
    $success = $builder->insertBatch($data);
    // print_r($success);exit;

    if ($success) {
        return $this->db->insertID();
    } else {
        return 0;
    }
}
public function ReceiptDetailReport($fromDate, $toDate, $moduleTypeId, $userInfoId) {
    // Convert milliseconds to seconds if necessary
    if ($fromDate > 1000000000000) $fromDate /= 1000;
    if ($toDate > 1000000000000) $toDate /= 1000;

    // Format timestamps into date ranges
    $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
    $toDate = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");

    // Build condition string
    $cnd = "receipt_material_info.createdAt BETWEEN '$fromDate' AND '$toDate'";
    if ($userInfoId != 1) {
        $cnd .= " AND gate_in_out_info.moduleType IN (
                    SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userInfoId
                 )
                 AND gate_in_out_info.masterPlantId IN (
                    SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId
                 )";
    }
    if (!empty($moduleTypeId)) {
        $cnd .= " AND purchase_order.poType = $moduleTypeId";
    }

    // Query setup
    $builder = $this->db->table("receipt_material_info")
        ->select("
            receipt_material_info.*,
            gate_in_out_info.vehicleNo,
            gate_in_out_info.vaNumber,
            master_plant.PLANT_NAME,
            master_module.moduleType,
            purchase_order.invoiceCopy,
            gate_in_out_info.invoiceCopy as invoiceCopys,
            CONCAT(po_type.type, ' - ', po_type.name) AS poType,
            DATE_FORMAT(receipt_material_info.createdAt, '%d-%m-%Y') as createdAt,
            DATE_FORMAT(receipt_material_info.invoiceDate, '%d-%m-%Y') as invoiceDate,
            DATE_FORMAT(receipt_material_info.postingDate, '%d-%m-%Y') as postingDate,
            DATE_FORMAT(receipt_material_info.InvoiceSubmittedAt, '%d-%m-%Y') as InvoiceSubmittedAt,
            DATE_FORMAT(receipt_material_info.mgApprovedAt, '%d-%m-%Y') as mgApprovedAt,
            DATE_FORMAT(receipt_material_info.InvoiceApprovedAt, '%d-%m-%Y') as InvoiceApprovedAt,
            CASE receipt_material_info.status
                WHEN 1 THEN 'MIGO Confirm'
                WHEN 2 THEN 'Invoice Submit'
                WHEN 3 THEN 'Invoice Acknowledge'
                WHEN 4 THEN 'Completed'
                ELSE 'Reject'
            END AS statusName,
            ROW_NUMBER() OVER (ORDER BY receipt_material_info.id) AS serialNo,
            CONCAT(
                TIMESTAMPDIFF(DAY, receipt_material_info.createdAt, IFNULL(receipt_material_info.InvoiceApprovedAt, NOW())), ' Days ',
                TIMESTAMPDIFF(HOUR, receipt_material_info.createdAt, IFNULL(receipt_material_info.InvoiceApprovedAt, NOW())) % 24, ' Hrs ',
                TIMESTAMPDIFF(MINUTE, receipt_material_info.createdAt, IFNULL(receipt_material_info.InvoiceApprovedAt, NOW())) % 60, ' Mins'
            ) AS duration,IF(receipt_material_info.invoiceQty > 0, receipt_material_info.invoiceQty, receipt_material_info.receivedQty) AS invoiceQty
        ")
        ->join('purchase_order', 'receipt_material_info.purchaseIds = purchase_order.id', 'inner')
        ->join('gate_in_out_info', 'receipt_material_info.gateInOutInfoId = gate_in_out_info.id', 'inner')
        ->join('master_plant', 'master_plant.WERKS = receipt_material_info.plantCode', 'inner')
        ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner')
        ->join('po_type', 'po_type.id = purchase_order.poType', 'inner')
        ->where($cnd)
        ->groupBy('receipt_material_info.id');

    return $builder->get()->getResultArray();
} 

public function MiroLastID($plantCode) {
    $builder = $this->db->table('miro_entry');
    
    $builder->select('miroId');
    $builder->where('plantCode', $plantCode);
    $builder->where('miroId IS NOT NULL', null, false);
    $builder->where('miroId !=', '');
    
    // Order by last 5 digits numerically
    $builder->orderBy("SUBSTRING(miroId, 7, 2)", "DESC", false); // Year (25)
    $builder->orderBy("SUBSTRING(miroId, 9, 1)", "DESC", false); // Month letter (G)
    $builder->orderBy("CAST(SUBSTRING(miroId, 10, 2) AS UNSIGNED)", "DESC", false); // Day (26)
    $builder->orderBy("CAST(SUBSTRING(miroId, 12, 3) AS UNSIGNED)", "DESC", false); // Serial (003)
    
    $builder->limit(1);

    $result = $builder->get()->getResultArray();
    return $result;
}
public function MigoReverse(){
    $CurrentDate = date("Ymd");
    $urlPath ="/zzgp_api/zzgp_migo/GP_MIGO?sap-client=900&date=$CurrentDate";
    // $urlPath ="/zzgp_api/zzgp_migo/GP_MIGO?sap-client=900&date=20250426";

    $data = SapUrlHelper::getWhDatas($urlPath);
    $result = json_decode($data, true);
    foreach ($result as $resultRow) {
        $MIGO_NO = $resultRow['MIGO_NO'];
        $loadingUnloadingInfoId=$this->db->table("purchase_order")
            ->select('purchase_order.loadingUnloadingInfoId')
            ->where('migoNumber', $MIGO_NO)
            ->get()->getResultArray();
        $loadingUnloadingInfoId = $loadingUnloadingInfoId[0]['loadingUnloadingInfoId'];
        if($loadingUnloadingInfoId && $MIGO_NO){
            $this->db->table("purchase_order")
                ->set(['status'=>0,'migoNumber'=>null])
                ->where('migoNumber', $MIGO_NO)
                ->update();
            $this->db->table("receipt_material_info")
                ->set('status',0)
                ->where('migoNumber', $MIGO_NO)
                ->update();
            $this->db->table("gate_in_out_info")
                ->set(['moduleStatusId'=>5,'waitingAt'=>10])
                ->where('loadingUnloadingInfoId', $loadingUnloadingInfoId)
                ->update();
            $this->db->table("miro_entry")
                ->set('status',0)
                ->where('refNo', $MIGO_NO)
                ->update();
        }
    }
    return $result;
}
public function getPoNumbers($userInfoId,$fromDate,$toDate,$plantCode) {
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
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    } else {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1 = date("Y-m-d 23:59:59", $toDate);
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    }

    if ($userInfoId != 1) {
        // For non-admin users, applying specific user access conditions
        $cnd .= " AND purchase_order.poType IN (SELECT poTypeId FROM po_type_access WHERE userInfoId = $userInfoId)";
        if (!empty($plantCode)) {
            // Convert comma-separated plant codes to SQL-safe list
            $plants = explode(",", $plantCode);
            $quotedPlants = array_map(fn($p) => $this->db->escape($p), $plants);
            $plantFilter = implode(",", $quotedPlants);
            $cnd .= " AND miro_entry.plantCode IN ($plantFilter)";
        }
    }

    // Build query
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.poNumber AS value, miro_entry.poNumber AS label") // Selecting PO number with alias 'value' and 'label'
        ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'inner') // Corrected join
        ->join('purchase_order', 'gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId AND miro_entry.poNumber =  purchase_order.poNumber', 'inner') // Corrected 
        ->where($cnd) // Apply the condition based on the user info
        ->groupBy('miro_entry.poNumber'); // Group by PO number to avoid duplicates
       
    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
}
public function getMiroDetailsById($poNumbers) {
    // Debugging: Print the structure of the PO numbers to check the incoming data

     // Status condition is always applied
    $poNumbersArray = [];

    // Check if $poNumbers is an object and contains 'poNumbers' property
    if (is_object($poNumbers) && isset($poNumbers->poNumbers) && is_array($poNumbers->poNumbers)) {
        // Extract the poNumber values from the passed array of objects
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers->poNumbers);

        // Debugging: Check the extracted PO numbers
    } elseif (is_array($poNumbers)) {
        // In case it's already an array, directly use it
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);
        
        // Debugging: Check the extracted PO numbers
    } else {
        // Handle the case where PO numbers are not in the expected format
        return [];
    }
    $fromDate = $poNumbers->fromDate;
    $toDate = $poNumbers->toDate;

    if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
        $fromDate /= 1000;
    }
    if ($toDate > 1000000000000) {
        $toDate /= 1000;
    }

    if ($fromDate == 0) {
        $cnd = "miro_entry.status = 1";
    }else{
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1 = date("Y-m-d 23:59:59", $toDate);
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    }
    // If poNumbers is an array of values, use whereIn
    if (count($poNumbersArray) > 0) {
        $builder1 = $this->db->table('miro_entry')
            ->select("miro_entry.migoNumber") // Selecting all fields of the miro_entry table
            ->where($cnd)
            ->whereIn('miro_entry.poNumber', $poNumbersArray) // Using whereIn with extracted PO numbers
            ->where('miro_entry.vendor', $poNumbers->vendorCode) // Using whereIn with extracted PO numbers
            ->groupBy('miro_entry.migoNumber');
        $result1 = $builder1->get()->getResultArray();
        foreach ($result1 as $row) {
            $migoNumber = $row['migoNumber'];
            $urlPath = "zzgp_api/zzgp_migo/GP_MIGO_GET?sap-client=900&migo=$migoNumber";
            $data = SapUrlHelper::getWhDatas($urlPath);
            $result2 = json_decode($data);
    
            if (!empty($result2)) {
                foreach ($result2 as $resultRow) {
                    $REF_NO = $resultRow->REF_NO ?? null;
                    $PO_NUMBER = $resultRow->PO_NUMBER ?? null;
                    $PO_ITEM = $resultRow->PO_ITEM ?? null;
                    $TOTAL_TAX = $resultRow->TOTAL_TAX ?? 0;
                    $GL = $resultRow->GL ?? null;
    
                    if ($REF_NO && $PO_NUMBER && $PO_ITEM && $GL) {
                        $this->db->table("miro_entry")
                            ->set(['totalTax' => round($TOTAL_TAX, 2)])
                            ->where('refNo', $REF_NO)
                            ->where('poNumber', $PO_NUMBER)
                            ->where('poItem', $PO_ITEM)
                            ->where('gl', $GL)
                            ->where('status', 0)
                            ->update();
                    }
                }
            }
        }
        $builder = $this->db->table('miro_entry')
            ->select("miro_entry.*,receipt_material_info.receivedQty,receipt_material_info.materialLoading,receipt_material_info.invoiceQty,receipt_material_info.materialAmount,receipt_material_info.invoiceMaterialAmount,receipt_material_info.materialFreight,receipt_material_info.invoiceFreightAmount,receipt_material_info.materialPacking,receipt_material_info.invoicePackingAmount,receipt_material_info.loadingCharge,receipt_material_info.materialUnloading,receipt_material_info.materialOther,receipt_material_info.materialIneligible,receipt_material_info.invoiceLoadingAmount,receipt_material_info.invoiceUnloadingAmount,receipt_material_info.invoiceOtherAmount,receipt_material_info.invoiceIneligibleAmount
            ,CASE
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'MATERIAL' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoiceMaterialAmount
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'FREIGHT' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoiceFreightAmount
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'PACKING' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoicePackingAmount
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'LOADING' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoiceLoadingAmount
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'UNLOADING' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoiceUnloadingAmount
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'OTHER' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoiceOtherAmount
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'INELI' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN receipt_material_info.invoiceIneligibleAmount
            ELSE ROUND(miro_entry.amount+miro_entry.totalTax, 3)
            END AS actualAmount,
            CASE
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'MATERIAL' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceMaterialAmount-receipt_material_info.materialAmount,3)
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'FREIGHT' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceFreightAmount-receipt_material_info.materialFreight,3)
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'PACKING' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoicePackingAmount-receipt_material_info.materialPacking,3)
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'LOADING' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceLoadingAmount - receipt_material_info.materialLoading,3)
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'UNLOADING' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceUnloadingAmount -receipt_material_info.materialUnloading,3)
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'OTHER' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceOtherAmount -receipt_material_info.materialOther,3)
            WHEN miro_entry.attach = 1 AND miro_entry.conditionDetails = 'INELI' AND receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceIneligibleAmount -receipt_material_info.materialIneligible,3)
            ELSE 0
            END AS deductionValue, 
            CASE
            WHEN receipt_material_info.receivedQty < receipt_material_info.invoiceQty THEN ROUND(receipt_material_info.invoiceQty-receipt_material_info.receivedQty,3)
            ELSE 0 END AS deductionQty,receipt_material_info.taxPercentage,gate_in_out_info.vaNumber,gate_in_out_info.moduleType,receipt_material_info.bargainNote,receipt_material_info.deliveryChallanCopy,receipt_material_info.ewayBillCopy,receipt_material_info.eInvoiceCopy,receipt_material_info.qcCertificateInternalCopy,receipt_material_info.qcCertificateExternalCopy,receipt_material_info.externalWbCopy,receipt_material_info.vendorEmailCopy,receipt_material_info.projectTeamAcknowledgement,receipt_material_info.creditNoteCopy,
            miro_entry.bargainNote as bargainNotes,miro_entry.deliveryChallanCopy as deliveryChallanCopys,miro_entry.ewayBillCopy as ewayBillCopys,miro_entry.eInvoiceCopy as eInvoiceCopys,miro_entry.qcCertificateInternalCopy as qcCertificateInternalCopys,miro_entry.qcCertificateExternalCopy as qcCertificateExternalCopys,miro_entry.externalWbCopy as externalWbCopys,miro_entry.vendorEmailCopy as vendorEmailCopys,miro_entry.projectTeamAcknowledgement as projectTeamAcknowledgements,miro_entry.creditNoteCopy as creditNoteCopys") // Selecting all fields of the miro_entry table
            ->join('receipt_material_info', 'miro_entry.gateInOutInfoId = receipt_material_info.gateInOutInfoId AND miro_entry.poNumber = receipt_material_info.poNumber AND miro_entry.poItem =  receipt_material_info.lineItem AND miro_entry.refNo = receipt_material_info.migoNumber', 'left') // Corrected
            ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'inner') // Corrected
            ->where($cnd)
            ->whereIn('miro_entry.poNumber', $poNumbersArray) // Using whereIn with extracted PO numbers
            ->where('miro_entry.vendor', $poNumbers->vendorCode) // Using whereIn with extracted PO numbers
            ->groupBy('miro_entry.id');
    } else {
        // Handle the case where no PO numbers are provided
        return [];
    }

    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
}
public function getVendorList($poNumbers) {
    // Default condition, applying status condition universally
    $cnd = "miro_entry.status = 1"; // Status condition is always applied
    $poNumbersArray = [];

    // Check if $poNumbers is an object and contains 'poNumbers' property
    if (is_object($poNumbers) && isset($poNumbers) && is_array($poNumbers)) {
        // Extract the poNumber values from the passed array of objects
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);

        // Debugging: Check the extracted PO numbers
    } elseif (is_array($poNumbers)) {
        // In case it's already an array, directly use it
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);
        
        // Debugging: Check the extracted PO numbers
    } else {
        // Handle the case where PO numbers are not in the expected format
        return [];
    }

    // Build query
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.vendor AS value, CONCAT(miro_entry.vendor, ' - ', miro_entry.vendorName) AS label") // Selecting PO number with alias 'value' and 'label'
        ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'inner') // Corrected join
        ->where($cnd) // Apply the condition based on the user info
        ->whereIn('miro_entry.poNumber', $poNumbersArray)
        ->groupBy('miro_entry.vendor'); // Group by PO number to avoid duplicates

    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
}
public function MiroUpdate($data) {
// print_r($data);exit;
    $lastMiroData = $this->MiroLastID($data->poData[0]->plantCode);
    $transcation_unique_no = $lastMiroData[0]['miroId'];
    $res = VANumberHelper::VANumberHelper('MR', $data->poData[0]->plantCode, $transcation_unique_no);

    $allSuccess = true; // Assume success initially

       
    $fileUrl_eway = str_replace(' ', '%20', $data->ewayBillCopy); // Fix spaces in URL
    $fileContents_eway = @file_get_contents($fileUrl_eway);
    $fileContents_eway = base64_encode($fileContents_eway);
    $filename_eway = basename($fileUrl_eway);

    $fileUrl_eInv = str_replace(' ', '%20', $data->eInvoiceCopy); // Fix spaces in URL
    
    $fileContents_eInv = @file_get_contents($fileUrl_eInv);
    $fileContents_eInv = base64_encode($fileContents_eInv);
    $filename_eInv = basename($fileUrl_eInv);

    $fileUrl_bar = str_replace(' ', '%20', $data->bargainNote); // Fix spaces in URL
    
    $fileContents_bar = @file_get_contents($fileUrl_bar);
    $fileContents_bar = base64_encode($fileContents_bar);
    $filename_bar = basename($fileUrl_bar);

    $fileUrl_dc = str_replace(' ', '%20', $data->deliveryChallanCopy); // Fix spaces in URL
    
    $fileContents_dc = @file_get_contents($fileUrl_dc);
    $fileContents_dc = base64_encode($fileContents_dc);
    $filename_dc = basename($fileUrl_dc);

    $fileUrl_qcInt = str_replace(' ', '%20', $data->qcCertificateInternalCopy); // Fix spaces in URL
    
    $fileContents_qcInt = @file_get_contents($fileUrl_qcInt);
    $fileContents_qcInt = base64_encode($fileContents_qcInt);
    $filename_qcInt = basename($fileUrl_qcInt);

    $fileUrl_qcExt = str_replace(' ', '%20', $data->qcCertificateExternalCopy); // Fix spaces in URL
    
    $fileContents_qcExt = @file_get_contents($fileUrl_qcExt);
    $fileContents_qcExt = base64_encode($fileContents_qcExt);
    $filename_qcExt = basename($fileUrl_qcExt);

    $fileUrl_wb = str_replace(' ', '%20', $data->externalWbCopy); // Fix spaces in URL
    
    $fileContents_wb = @file_get_contents($fileUrl_wb);
    $fileContents_wb = base64_encode($fileContents_wb);
    $filename_wb = basename($fileUrl_wb);

    $fileUrl_mail = str_replace(' ', '%20', $data->vendorEmailCopy); // Fix spaces in URL
    
    $fileContents_mail = @file_get_contents($fileUrl_mail);
    $fileContents_mail = base64_encode($fileContents_mail);
    $filename_mail = basename($fileUrl_mail);

    $fileUrl_ack = str_replace(' ', '%20', $data->projectTeamAcknowledgement); // Fix spaces in URL
    
    $fileContents_ack = @file_get_contents($fileUrl_ack);
    $fileContents_ack = base64_encode($fileContents_ack);
    $filename_ack = basename($fileUrl_ack);

    $fileUrl_credit = str_replace(' ', '%20', $data->creditNoteCopy); // Fix spaces in URL
    
    $fileContents_credit = @file_get_contents($fileUrl_credit);
    $fileContents_credit = base64_encode($fileContents_credit);
    $filename_credit = basename($fileUrl_credit);
    
     $fileUrl_invoiceCopy = str_replace(' ', '%20', $data->shipmentCopy); // Fix spaces in URL
    
    $fileContents_invoiceCopy = @file_get_contents($fileUrl_invoiceCopy);
    $fileContents_invoiceCopy = base64_encode($fileContents_invoiceCopy);
    $filename_invoiceCopy = basename($fileUrl_invoiceCopy);
    if($data->poData[0]->attach == 1 && isset($data->poData[0]->refDocNo)){
        $invoiceNo = $data->poData[0]->refDocNo;
    }else if($data->refDocNo){
        $invoiceNo = $data->refDocNo;
    }else{
        $invoiceNo = $data->poData[0]->refDocNo;
    }   
    $sap_data_array = [
        "va_no"=>$data->poData[0]->vaNumber,
        "vendor_code"=> $data->selectedVendorValue ? $data->selectedVendorValue : $data->poData[0]->vendor,
        "invoice_number" => $invoiceNo,
        "grn_no"=>$data->poData[0]->refNo,
        "ewb" => $fileContents_eway,
        "ewb_fn" =>  $filename_eway,
        "einv" => $fileContents_eInv, // SAP
        "einv_fn" => $filename_eInv,
        "dc" => $fileContents_dc, // SAP
        "dc_fn" => $filename_dc,
        "bn" => $fileContents_bar, // SAP
        "bn_fn"=>$filename_bar,
        "ext_wb"=>$fileContents_wb,
        "ext_wb_fn"=>$filename_wb,
        "int_qc"=>$fileContents_qcInt,
        "int_qc_fn"=>$filename_qcInt,
        "ext_qc"=>$fileContents_qcExt,
        "ext_qc_fn"=>$filename_qcExt,
        "cn"=>$fileContents_credit,
        "cn_fn"=>$filename_credit,
        "email_vendor"=>$fileContents_mail,
        "email_vendor_fn"=>$filename_mail,
        "pt_ack"=>$fileContents_ack,
        "pt_ack_fn"=>$filename_ack,
        "inv_copy"=>$fileContents_invoiceCopy,
        "inv_copy_fn"=>$filename_invoiceCopy,
        "PO_no"=>$data->poData[0]->poNumber,
        "line_item"=>$data->poData[0]->poItem,
        "truck_no"=>$data->poData[0]->TRUCK_NO,
        "plant"=>$data->poData[0]->plantCode,
        "trancation_type"=>'RM-PURCHASE',
        "METHOD"=>'PUT',
    ];
    if($data->poData[0]->attach == 1){
        $urlPath ="zzgp_api/zzgp_migo/GP_MIGO?sap-client=900";
        $res1 = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data_array]));

        $message = $res1[0]->MESSAGE ?? 'No message from SAP';
        $status = $res1[0]->STATUS ?? 0;
        if($status == 0){
            return [
                'success' => false,
                'message' => "$message , Please Contact SAP Team"
            ];
        }
    }
    if($data->poData[0]->attach == 0 || $status > 0){
     foreach ($data->poData as $resultRow) {
        if($resultRow->attach == 1 && $resultRow->refDocNo){
            $invoiceNo1 = $resultRow->refDocNo;
        }else if($data->refDocNo){
            $invoiceNo1 = $data->refDocNo;
        }else{
            $invoiceNo1 = $resultRow->refDocNo;
        }
        if($resultRow->attach == 1 && $resultRow->docDate){
            $invoiceDate1 = $resultRow->docDate;
        }else if($data->docDate){
            $invoiceDate1 = $data->docDate;
        }else{
            $invoiceDate1 = $resultRow->docDate;
        }
            $tableData = [
                'refDocNo' =>  $invoiceNo1,
                'docDate' => $invoiceDate1,
                'vendor' => $data->selectedVendorValue ? $data->selectedVendorValue : $resultRow->vendor,
                'vendorName' => $data->selectedVendorLabel ? $data->selectedVendorLabel : $resultRow->vendorName,
                'status'      => $data->status ?? 2,
                'miroId'      => $res,
                'gross_amount'=> $data->totalAmount,
                'deductionQty' => $resultRow->deductionQty,
                'deductionValue' => $resultRow->deductionValue,
                'deductionCost' => ROUND($resultRow->deductionValue / (1 + ($resultRow->taxPercentage / 100)), 3),
                'extraDeduction' => $resultRow->extraDeduction,
                'extraDeductionCost' => ROUND($resultRow->extraDeduction / (1 + ($resultRow->taxPercentage / 100)), 3),
                "bargainNote"=>$data->bargainNote,
                "deliveryChallanCopy"=>$data->deliveryChallanCopy,
                "ewayBillCopy"=>$data->ewayBillCopy,
                "eInvoiceCopy"=>$data->eInvoiceCopy,
                "qcCertificateInternalCopy"=>$data->qcCertificateInternalCopy,
                "qcCertificateExternalCopy"=>$data->qcCertificateExternalCopy,
                "externalWbCopy"=>$data->externalWbCopy,
                "vendorEmailCopy"=>$data->vendorEmailCopy,
                "projectTeamAcknowledgement"=>$data->projectTeamAcknowledgement,
                "creditNoteCopy"=>$data->creditNoteCopy,
                "invoiceCopy"=>$data->shipmentCopy ?? $resultRow->invoiceCopy,
                ];
            $update = $this->db->table("miro_entry")
                ->set($tableData)
                ->where('id', $resultRow->id)
                ->where('status',1)
                ->update();

            if (!$update) {
                $allSuccess = false; // If any one fails, mark failure
            }
        }

        if ($allSuccess) {
            return [
                'success' => true,
                'message' => "All entries updated successfully."
            ];
        } else {
            return [
                'success' => false,
                'message' => "Some entries failed to update."
            ];
        }
    }
}

public function getMiroDetailsList($userInfoId, $fromDate, $toDate, $status,$plantCode)
{
    if ($fromDate > 1000000000000) $fromDate /= 1000;
    if ($toDate > 1000000000000)   $toDate  /= 1000;

    // ---- DATE FILTER ----
    if ($fromDate == 0 && $status == 2) {
        $dateFilter = "miro_entry.status IN (2,4)";
    }else if($status == 2) {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1   = date("Y-m-d 23:59:59", $toDate);

        $dateFilter = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' 
                       AND miro_entry.status IN (2,4)";
    }else {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1   = date("Y-m-d 23:59:59", $toDate);

        $dateFilter = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' 
                       AND miro_entry.status IN (2,4)";
    }

    // Start builder
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.miroId, miro_entry.vendor,
            CONCAT(miro_entry.vendor, ' - ', miro_entry.vendorName) AS vendorName,
            miro_entry.id, miro_entry.amount, miro_entry.gross_amount,
            DATE_FORMAT(miro_entry.docDate,'%d-%m-%Y') as docDate,
            miro_entry.refDocNo, miro_entry.plantCode, miro_entry.invoiceCopy,
            GROUP_CONCAT(DISTINCT miro_entry.poNumber ORDER BY miro_entry.id ASC) AS poNumber,
            GROUP_CONCAT(DISTINCT miro_entry.migoNumber ORDER BY miro_entry.id ASC) AS migoNumber,
            GROUP_CONCAT(DISTINCT miro_entry.id ORDER BY miro_entry.id ASC) AS ids,
            miro_entry.gateInOutInfoId, weighment_info.firstWeight,
            gate_in_out_info.loadingUnloadingInfoId, purchase_info.PI_REFID")
        ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'left')
        ->join('purchase_info', 'miro_entry.purchaseInfoId = purchase_info.PI_REFID', 'left')
        ->join('weighment_info', 'gate_in_out_info.id = weighment_info.gateInOutInfoId', 'left')
        ->join('receipt_material_info', 'miro_entry.gateInOutInfoId = receipt_material_info.gateInOutInfoId 
                AND miro_entry.poNumber = receipt_material_info.poNumber
                AND miro_entry.poItem = receipt_material_info.lineItem
                AND miro_entry.refNo = receipt_material_info.migoNumber', 'left')
        ->join('purchase_order', 'purchase_order.id = receipt_material_info.purchaseIds', 'left')
        ->where($dateFilter);

    // ---- USER ACCESS FILTER ----
    if ($userInfoId != 1) {

         $escapedUser = $this->db->escape($userInfoId);

        $builder->where("
        (
            (
                gate_in_out_info.moduleType IN (
                    SELECT moduleTypeId
                    FROM user_module_access
                    WHERE userInfoId = {$escapedUser}
                )
                AND miro_entry.gateInOutInfoId > 0
            )
            OR
            (
                miro_entry.gateInOutInfoId = 0
                AND purchase_info.SCREEN_TYPE IN (
                    SELECT mp.PRIVILEGE_NAME
                    FROM master_user_privilege mup
                    JOIN master_privilege mp
                        ON mp.ID = mup.PRIVILEGE_ID
                    WHERE mup.USER_ID = {$escapedUser}
                )
            )
        )
        ");

        // ---- PLANT FILTER ----
        if (!empty($plantCode)) {
            $plants = explode(",", $plantCode);
            $quoted = array_map(fn($p) => $this->db->escape(trim($p)), $plants);
            $builder->where("miro_entry.plantCode IN (" . implode(",", $quoted) . ")");
        }
    }

    $builder->groupBy("miro_entry.miroId")
            ->orderBy("miro_entry.miroId", "ASC");

    if ($fromDate == 0) {
        $builder->limit(50);
    }

    $result = $builder->get()->getResultArray();

    // ----------- FETCH CHILD LINES -------------
    $all = [];

    foreach ($result as $row) {
        $idsArray = explode(",", $row['ids']);

        $builder1 = $this->db->table('miro_entry')
            ->select("miro_entry.*, 
                receipt_material_info.creditNoteCopy as creditNoteCopys,
                receipt_material_info.projectTeamAcknowledgement as projectTeamAcknowledgements,
                receipt_material_info.vendorEmailCopy as vendorEmailCopys,
                receipt_material_info.externalWbCopy as externalWbCopys,
                receipt_material_info.qcCertificateExternalCopy as qcCertificateExternalCopys,
                receipt_material_info.qcCertificateInternalCopy as qcCertificateInternalCopys,
                receipt_material_info.eInvoiceCopy as eInvoiceCopys,
                receipt_material_info.ewayBillCopy as ewayBillCopys,
                receipt_material_info.deliveryChallanCopy as deliveryChallanCopys,
                receipt_material_info.bargainNote as bargainNotes,
                gate_in_out_info.loadingUnloadingInfoId,
                purchase_info.PI_REFID,
                purchase_info.VEHICLE_TYPE,u1.FIRST_NAME AS approve1Name,
                u2.FIRST_NAME AS approve2Name")
            ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'left')
            ->join('purchase_info', 'miro_entry.purchaseInfoId = purchase_info.PI_REFID', 'left')
            ->join('receipt_material_info', 'miro_entry.gateInOutInfoId = receipt_material_info.gateInOutInfoId 
                AND miro_entry.poNumber = receipt_material_info.poNumber
                AND miro_entry.poItem = receipt_material_info.lineItem
                AND miro_entry.refNo = receipt_material_info.migoNumber', 'left')
            ->join('user_info u1', 'u1.UI_ID = miro_entry.approve1By', 'left')
            ->join('user_info u2', 'u2.UI_ID = miro_entry.approve2By', 'left')
            ->whereIn("miro_entry.id", $idsArray)
            ->groupBy("miro_entry.id")
            ->orderBy("miro_entry.id", "ASC");

        $row['lines'] = $builder1->get()->getResultArray();
        $all[] = $row;
    }

    return $all;
}
public function MiroUpdateSAP($data) {
    $ids = $data->miroIds;  // Getting the 'ids' of the lines
    $idsArray = explode(',', $ids);
    $CurrentDateTime = date("Y-m-d H:i:s");

    if($data->status == 3){
    $sapData = [];
    $lineItemCounter = 1;
    foreach ($data->poData as $item) {
      
        $sapData []= [
            "line_item" => $lineItemCounter++, // Increment line item counter
            "po_number" => $item->poNumber,
            "po_item" => $item->poItem,
            "ref_no" => $item->refNo,
            "ref_line" => $item->refLine,
            "year" => $item->year,
            "condition" => $item->condition,
            "vendor" => $item->vendor,
            "tax_code" => $item->taxCode,
            "item_amount" => round($item->amount + $item->deductionCost, 3),
            "quantity"    => round($item->quantity + $item->deductionQty, 3),
            "po_unit" => $item->poUnit,
            "item_text" => $data->remarks,
            "valuation_type" => $item->valuationType,
            'order_qty'=>$item->orderQty,
            'order_unit'=>$item->orderUnit,
            'service_line'=>$item->serviceLine
        ];
        
        }
        $fileUrl = str_replace(' ', '%20', $data->poData[0]->invoiceCopy); // Fix spaces in URL
        $fileContents = @file_get_contents($fileUrl);
        $fileContents = base64_encode($fileContents);
        $filename = basename($fileUrl);
        $docDate = date('Ymd', strtotime($data->poData[0]->docDate,));
        $postingDate = date('Ymd', strtotime($data->postingDate));
        $sap_data_array2 = [
			"doc_date" => $docDate,
			"psting_date" =>  $postingDate,
			"ref_doc_no" => $data->poData[0]->refDocNo, // SAP
			"comp_code" => $data->poData[0]->compCode,
			"currency" => $data->poData[0]->currency, // SAP
			"head_text" => $data->remarks,
			"gross_amount" => $data->poData[0]->gross_amount, // SAP
            "plant"=>$data->poData[0]->plantCode,
            "mir7_clip_no"=>$data->poData[0]->miroId,
            "vendor_no"=>$data->poData[0]->vendor,
            "filename"=>$data->poData[0]->attach == 0 ? $filename : '',
            "tax_type"=>$data->taxType,
            "tax_code"=>$data->taxCode,
            "tax_rate"=>$data->taxRate,
            "invoice_at"=>$data->poData[0]->attach == 0 ? $fileContents : '',
			"sap_Line" => $sapData
		];
       
        $urlPath1 = "zzgp_api/zzgp_plant/plant?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath1, json_encode([$sap_data_array2]));
		$message = $res[0]->MESSAGE ?? 'No message from SAP';
		$DOCUMENT_NO = $res[0]->MIRO_NO ?? '';
		$status = $res[0]->STATUS ?? 0;
        if ($status == 0) {
			return  ["success" => false, "message" => "$message , Please Contact SAP Team", "results" => ''];
		}else if ($status > 0) {
            $deductionValueTotal = 0;
            $extraDeductionCostTotal = 0;

            foreach ($data->poData as $item) {
                $deductionValueTotal += $item->deductionValue ?? 0;
                $extraDeductionCostTotal += $item->extraDeductionCost ?? 0;
            }
            $actualStatus = '';
            if ($deductionValueTotal > 0 || $extraDeductionCostTotal > 0) {
                $actualStatus = 4;
            } else {
                $actualStatus = 3;
            }
            if ($idsArray) {
                $this->db->table("miro_entry")
                ->set(['status'=>$actualStatus,'miroNo'=>$DOCUMENT_NO,'head_text'=>$data->remarks,'postingDate'=>$data->postingDate,'updatedBy'=>$data->USERID,'tdsRate'=>$data->taxRate,'tdsType'=>$data->taxType,'tdsCode'=>$data->taxCode])
                ->whereIn('id', $idsArray)
                ->where('status',2)
                ->update();

                return [
                    'success' => true,
                    'message' => "The MIRO No Parked Successfully . $DOCUMENT_NO",
                    'results' => $actualStatus
                ];
            } else {
                return [
                    'success' => false,
                    'message' => "Some entries failed to update.",
                    'results' => ''
                ];
            }
        }
    }else if($data->status == 4){
        $sapData = [];
        $lineItemCounter = 1;
        foreach ($data->poData as $item) {
            if (($item->deductionCost + $item->extraDeductionCost) > 0) {
            $sapData []= [
                "line_item" => $lineItemCounter++, // Increment line item counter
                "po_number" => $item->poNumber,
                "po_item" => $item->poItem,
                "ref_no" => $item->refNo,
                "ref_line" => $item->refLine,
                "year" => $item->year,
                "condition" => $item->condition,
                "vendor" => $item->vendor,
                "tax_code" => $item->taxCode,
                "item_amount" => round($item->deductionCost+$item->extraDeductionCost,3), // Ensure this is the correct field
                "quantity" => $item->deductionQty,
                "po_unit" => "$item->poUnit",
                "item_text" => $data->remarks,
                "valuation_type" => $item->valuationType,
            ];
            }
            }
            $fileUrl = str_replace(' ', '%20', $data->poData[0]->invoiceCopy); // Fix spaces in URL
            $fileContents = @file_get_contents($fileUrl);
            $fileContents = base64_encode($fileContents);
            $filename = basename($fileUrl);
            $docDate = date('Ymd', strtotime($data->poData[0]->docDate,));
            $postingDate = date('Ymd', strtotime($data->postingDate));
            $sap_data_array2 = [
                "doc_date" => $docDate,
                "psting_date" =>  $postingDate,
                "ref_doc_no" => $data->poData[0]->refDocNo. '/D', // SAP
                "comp_code" => $data->poData[0]->compCode,
                "currency" => $data->poData[0]->currency, // SAP
                "head_text" => $data->remarks,
                "gross_amount" => $data->totalAmount, // SAP
                "plant"=>$data->poData[0]->plantCode,
                "mir7_clip_no"=>$data->poData[0]->miroId,
                "vendor_no"=>$data->poData[0]->vendor,
                // "filename"=>$data->poData[0]->attach == 0 ? $filename : '',
                "tax_type"=>$data->taxType,
                "tax_code"=>$data->taxCode,
                "tax_rate"=>$data->taxRate,
                "invoice_at"=>$data->poData[0]->attach == 0 ? $fileContents : '',
                "mir7_no"=>$data->poData[0]->miroNo,
                "METHOD" =>'PUT',
                "sap_Line" => $sapData
            ];
            $urlPath1 = "zzgp_api/zzgp_plant/plant?sap-client=900";
            $res = SapUrlHelper::PushToSap($urlPath1, json_encode([$sap_data_array2]));
            $message = $res[0]->MESSAGE ?? 'No message from SAP';
            $DOCUMENT_NO = $res[0]->MIRO_NO ?? '';
            $status = $res[0]->STATUS ?? 0;
            if ($status == 0) {
                return  ["success" => false, "message" => "$message , Please Contact SAP Team", "results" => ''];
            }else if ($status > 0) {
                
                if ($idsArray) {
                    $this->db->table("miro_entry")
                    ->set(['status'=>3,'deductionDocumentNo'=>$DOCUMENT_NO,'head_text'=>$data->remarks,'deductionPostingDate'=>$data->postingDate,'updatedBy'=>$data->USERID,'deductionTdsRate'=>$data->taxRate,'deductionTdsType'=>$data->taxType,'deductionTdsCode'=>$data->taxCode])
                    ->whereIn('id', $idsArray)
                    ->where('status',4)
                    ->update();
    
                    return [
                        'success' => true,
                        'message' => "The Debit Note Parked Successfully . $DOCUMENT_NO",
                        'results' => 3
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => "Some entries failed to update.",
                        'results' => ''
                    ];
                }
            }
    }else if($data->status == 6 ){
        $this->db->table("miro_entry")
        ->set(['status'=>$data->status,'approve1remarks'=>$data->remarks,'approve1By'=>$data->USERID,'approve1At'=>$CurrentDateTime])
        ->whereIn('id', $idsArray)
        ->where('status',5)
        ->update();
        return [
            'success' => true,
            'message' => "Submitted successfully",
            'results' => 3
        ];
    }else if($data->status == 2 ){
        $this->db->table("miro_entry")
        ->set(['status'=>$data->status,'approve2remarks'=>$data->remarks,'approve2By'=>$data->USERID,'approve2At'=>$CurrentDateTime])
        ->whereIn('id', $idsArray)
        ->where('status',6)
        ->update();

        return [
            'success' => true,
            'message' => "Submitted successfully",
            'results' => 3
        ];
    }else{
        $this->db->table("miro_entry")
        ->set(['status'=>1,'remarks'=>$data->remarks,'rejectBy'=>$data->USERID,'rejectAt'=>$CurrentDateTime])
        ->whereIn('id', $idsArray)
        ->whereIn('status',[2,5,6])
        ->update();

        return [
            'success' => true,
            'message' => "Rejected successfully",
            'results' => 3
        ];
    }
        
}
public function MiroReverse(){
    $CurrentDate = date("Ymd");
    $urlPath ="/zzgp_api/zzgp_migo/GP_MIR7?sap-client=900&date=$CurrentDate";
    $data = SapUrlHelper::getWhDatas($urlPath);
    $result = json_decode($data, true);
    foreach ($result as $resultRow) {
        $MIGO_NO = $resultRow['MIRO_NO'];           
            $this->db->table("miro_entry")
                ->set('status',2)
                ->whereIn('status',[3,4])
                ->where('miroNo', $MIGO_NO)
                ->update();
    }
    return $result;
}
public function MiroDetailReport($fromDate, $toDate, $moduleTypeId, $userInfoId, $status, $plantCode, $Userplant){
    // 🔹 Convert milliseconds to seconds if necessary
    $fromDate = $fromDate > 1000000000000 ? intval($fromDate / 1000) : intval($fromDate);
    $toDate   = $toDate > 1000000000000 ? intval($toDate / 1000) : intval($toDate);

    // 🔹 Format timestamps into date ranges
    $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
    $toDate   = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");

    // 🔹 Start building query
    $builder = $this->db->table("miro_entry")
        ->select([
            "miro_entry.*",
            "gate_in_out_info.vehicleNo",
            "gate_in_out_info.vaNumber",
            "master_plant.PLANT_NAME",
            "master_module.moduleType",
            "CONCAT(po_type.type, ' - ', po_type.name) AS poType",
            "DATE_FORMAT(miro_entry.createdAt, '%d-%m-%Y') as createdAtFormatted",
            "DATE_FORMAT(miro_entry.docDate, '%d-%m-%Y') as invoiceDate",
            "DATE_FORMAT(miro_entry.postingDate, '%d-%m-%Y') as postingDateFormatted",
            "CASE miro_entry.status
                WHEN 1 THEN 'Process'
                WHEN 2 THEN 'Accounts Submitted'
                WHEN 3 THEN 'Completed'
                WHEN 4 THEN 'Deduction'
                ELSE 'Reject'
            END AS statusName",
            "CASE miro_entry.attach
                WHEN 1 THEN 'attached'
                ELSE 'Not attached'
            END AS attachText",
            "ROW_NUMBER() OVER (ORDER BY miro_entry.id) AS serialNo"
        ])
        ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'inner')
        ->join('purchase_order', 'gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId', 'left')
        ->join('master_plant', 'master_plant.WERKS = miro_entry.plantCode', 'left')
        ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'left')
        ->join('po_type', 'po_type.id = purchase_order.poType', 'left')
        ->where('miro_entry.createdAt >=', $fromDate)
        ->where('miro_entry.createdAt <=', $toDate);

    // 🔹 Restrict by user module access (if not admin)
    if ($userInfoId != 1) {
        $accessibleModules = $this->db->table('user_module_access')
            ->where('userInfoId', $userInfoId)
            ->select('moduleTypeId')
            ->get()->getResultArray();
        $builder->whereIn('gate_in_out_info.moduleType', array_column($accessibleModules, 'moduleTypeId'));
    }

    // 🔹 Combine plant codes from frontend and user access
    $allPlants = array_filter(array_unique(array_merge(
        explode(',', $plantCode ?? ''),
        explode(',', $Userplant ?? '')
    )));
    if (count($allPlants)) {
        $builder->whereIn('miro_entry.plantCode', $allPlants);
    }

    // 🔹 Handle multiple module type IDs
    $modules = array_filter(array_unique(explode(',', $moduleTypeId ?? '')));
    if (count($modules) && $moduleTypeId !== '0') {
        $builder->whereIn('purchase_order.poType', $modules);
    }

    // 🔹 Handle status
    if ($status !== '' && $status != '5') {
        $builder->where('miro_entry.status', $status);
    }

    // 🔹 Group and order (depends on SQL flavor, can remove or adapt groupBy as needed)
    $builder->groupBy('miro_entry.id');

    // 🔹 Execute and return results
    return $builder->get()->getResultArray();
}

public function DateFormat() {
    $builder = $this->db->table("date_format_ocr");
    $builder = $builder->select('dateFormat');
    $result = $builder->get()->getResultArray();
    return $result;
}
public function MiroStatus() {
    $builder = $this->db->table("miro_entry");
    $builder = $builder->select("
        miro_entry.status AS value,
        CASE 
            WHEN miro_entry.status = 0 THEN 'Rejected'
            WHEN miro_entry.status = 1 THEN 'Process'
            WHEN miro_entry.status = 2 THEN 'Store to Accounts'
            WHEN miro_entry.status = 3 THEN 'Completed'
            ELSE 'Unknown'
        END AS label
    ");
    $builder = $builder->groupBy('miro_entry.status');
    
    $result = $builder->get()->getResultArray();
    return $result;
}
public function TDSFetch($vendorcode){
    $urlPath ="zzgp_api/zzgp_migo/GP_TDS?sap-client=900&vendor=$vendorcode";
    $data = SapUrlHelper::getWhDatas($urlPath);
    $result = json_decode($data, true);
   
    $formattedLocations = array_map(function ($item) {
        return [
            'value' => $item['TAX_TYPE'],
            'label' => $item['TAX_CODE'],
            'TAX_RATE'=>$item['TAX_RATE']
        ];
    }, $result); // $result is your original array
    return $formattedLocations;
}
public function getRejectDetailsList($userInfoId,$fromDate,$toDate) {

    if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
        $fromDate /= 1000;
    }
    if ($toDate > 1000000000000) {
        $toDate /= 1000;
    }
    if($fromDate == 0){ 
        $cnd = "miro_entry.status in (1,5,2,4)"; 
    }else{
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1   = date("Y-m-d 23:59:59", $toDate);
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status  in (1,5,2,4)";
    }

    if ($userInfoId != 1) {
        $cnd .= " AND gate_in_out_info.moduleType IN (SELECT moduleTypeId FROM user_module_access WHERE userInfoId = $userInfoId)
                  AND gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = $userInfoId)";
    }
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.miroId, miro_entry.vendor, CONCAT(miro_entry.vendor, ' - ', miro_entry.vendorName) AS vendorName, 
            miro_entry.id, miro_entry.amount,miro_entry.totalTax, miro_entry.gross_amount, DATE_FORMAT(miro_entry.docDate,'%d-%m-%Y') as docDate, miro_entry.refDocNo, miro_entry.plantCode,miro_entry.invoiceCopy,
            GROUP_CONCAT(DISTINCT miro_entry.poNumber ORDER BY miro_entry.id ASC) AS poNumber,
            GROUP_CONCAT(DISTINCT miro_entry.migoNumber ORDER BY miro_entry.id ASC) AS migoNumber,
            GROUP_CONCAT(DISTINCT miro_entry.id ORDER BY miro_entry.id ASC) AS ids,miro_entry.gateInOutInfoId,weighment_info.firstWeight,CONCAT(miro_entry.GL, ' - ', miro_entry.itemText) AS glName,miro_entry.fiDocument,ROUND(miro_entry.amount + miro_entry.totalTax, 3 ) AS totalAmount,miro_entry.status"
            )
        ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'inner')
        ->join('weighment_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'left')
        ->where($cnd)
        ->groupBy('miro_entry.id')
        ->orderBy('miro_entry.id', 'ASC');
    if($fromDate == 0){
        $result = $builder->limit(50);
    }
    $result = $builder->get()->getResultArray();
    return $result;  
}
public function RejectMiroEntry($data) {
    $CurrentDateTime = date("Y-m-d H:i:s");

    $builder = $this->db->table("miro_entry")
        ->set([
            'status' => $data->status,
            'rejectReason' => $data->rejectReason,
            'rejectedBy' => $data->userInfoId,
            'rejectedAt' => $CurrentDateTime
        ])
        ->whereIn('status', [1, 5])
        ->where('id', $data->id);

    $success = $builder->update();

    if ($success && $this->db->affectedRows() > 0) {
        return [
            'success' => true,
            'message' => "Rejected successfully"
        ];
    } else {
        return [
            'success' => false,
            'message' => "Reject failed: No record updated (already rejected or invalid status/id)"
        ];
    }
}
public function addGateInPODetails($postData) {
    $db = \Config\Database::connect();
    $currentDateTime = date("Y-m-d H:i:s");

    // --- Constants ---
    $MOVEMENT_TYPE_ID = 2;
    $STATUS_ACTIVE = 1;
    try {
        $db->transStart();

        // 1. Generate VA Number
        $sql = "CALL spGenerateVaNumber(?, ?)";
        $builder = $db->query($sql, [$postData->userInfoId, $postData->movementType]);
        $getVaNumber = $builder->getResultArray()[0]['vaNumber'] ?? null;
        if (!$getVaNumber) {
            throw new \Exception("Failed to generate VA Number");
        }

        // 2. Generate HandCarry Number
        $sql1 = "CALL spGenerateCashNumber(?, ?, ?)";
        $builder1 = $db->query($sql1, [$postData->userInfoId, '', 'handCarry']);
        $getHandCarryNumber = $builder1->getResultArray()[0]['cashNumber'] ?? null;

        // 3. Master Plant Id
        $purchaseMasterPlantId = $db->table("master_plant")
            ->select("ID")->where("WERKS", $postData->masterPlantId)
            ->get()->getRow('ID');

        // 4. Own WB
        $OwnWB = $db->table("master_gate")
            ->select("OwnWB")->where("id", $postData->gate_id)
            ->get()->getRow('OwnWB');

        // 5. Module type mapping
        switch ($postData->moduleType) {
            case 'S&S Purchase': $moduleType = 'S&S-Purchase'; break;
            case 'Sooji Purchase': $moduleType = 'Sooji-Purchase'; break;
            case 'RM Purchase': $moduleType = 'RM-Purchase'; break;
            case 'Late Purchase': $moduleType = 'Late-Purchase'; break;
            case 'Capex': $moduleType = 'Capex'; break;
            default: $moduleType = 'PM-Purchase';
        }

        // 6. SAP Payload build
        $groupedData = [];
        $groupedData1 = [];
        $lineNo = 1;
        $existsPending = $db->table("gate_in_out_info")
            ->where("vehicleNo", $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo)                       // same vehicle
            ->whereIn("moduleStatusId", [0,1,2,3,4,6,12])             // statuses considered as pending inward
            ->countAllResults();

        if ($existsPending > 0) {
            throw new \Exception("Duplicate entry: Vehicle already gate-inward and not yet gate-out");
        }
       // --- Duplicate check for loading_unloading_info (1 min window) ---
        $timeWindowMinutes = 1; // prevent duplicate within 1 minute

        $existsLoad = $db->table("loading_unloading_info")
            ->where("truckNo", $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo)
            ->where("createdOn >=", date("Y-m-d H:i:s", strtotime("-$timeWindowMinutes minutes")))
            ->where("createdOn <=", date("Y-m-d H:i:s"))
            ->countAllResults();

        if ($existsLoad > 0) {
            throw new \Exception("Duplicate entry: Vehicle already gate-in within last $timeWindowMinutes minute");
        }
        
        if (!empty($postData->purchaseOrderDetailsList)) {
            foreach ($postData->purchaseOrderDetailsList as $item) {
                $key = $item->poNumber . '_' . $item->invoiceNo . '_' . $item->vendorCode;
                if (!isset($groupedData[$key])) {
                    // --- Check duplicate PO+Invoice ---
                    $existsPO = $db->table("purchase_order")
                        ->where("poNumber", $item->poNumber)
                        ->where("invoiceNo", $item->invoiceNo)
                        ->where("vendorCode", $item->vendorCode)
                        ->where("isDelete", 0)
                        ->countAllResults();

                    if ($existsPO > 0) {
                        throw new \Exception("Duplicate PO+Invoice already exists: {$item->poNumber}/{$item->invoiceNo}");
                    }
                    // File handling
                    $filename = null; $fileformat = null; $lv_xstring = null;
                    if($item->shipmentCopy){
                        $shipmentCopy = $item->shipmentCopy;
                    }else if($item->invoiceCopy){
                        $shipmentCopy = $item->invoiceCopy;
                    }else{
                        $shipmentCopy = null;
                    }
                    if (!empty($shipmentCopy)) {
                        $fileUrl = str_replace(' ', '%20', $shipmentCopy);
                        $fileContents = @file_get_contents($fileUrl);
                        if ($fileContents !== false) {
                            $filename = basename($fileUrl);
                            $lv_xstring = base64_encode($fileContents);
                            $finfo = finfo_open(FILEINFO_MIME_TYPE);
                            $mimeType = finfo_buffer($finfo, $fileContents);
                            finfo_close($finfo);
                            $mimeToExt = [
                                'application/pdf' => '.pdf',
                                'image/png'       => '.png',
                                'image/jpeg'      => '.jpg',
                                'image/jpg'       => '.jpg'
                            ];
                            $fileformat = $mimeToExt[$mimeType] ?? '';
                        }
                    }

                    $poTypeRow = $db->table("po_type")->select("id")
                        ->where("type", $item->poType)->get()->getRow();
                    $poType = $poTypeRow ? $poTypeRow->id : null;

                    $groupedData[$key] = [
                        "poNumber"    => $item->poNumber,
                        "invoiceNo"   => $item->invoiceNo,
                        "invoiceDate" => $item->invoiceDate,
                        "vendorCode"  => $item->vendorCode,
                        "vendorName"  => $item->vendorName,
                        "poType"      => $poType,
                        "invoiceCopy" => $shipmentCopy ?? null,
                        "serviceStatus"      => $postData->screen == 'SERVICE' ? 1 : 0,
                        "dateStamp"   => $currentDateTime,
                        "documentDate"=> $item->documentDate
                    ];
                    $groupedData1[] = [
                        'ZZLINE'     => $lineNo++,
                        'ZZPO_NO'    => $item->poNumber,
                        'ZZVENDOR'   => $item->vendorCode,
                        'ZZINV_NO'   => $item->invoiceNo,
                        "filename"   => $filename,
                        "fileformat" => $fileformat,
                        "lv_xstring" => $lv_xstring
                    ];
                }
            }
        }
        $sap_data = [
            "ZZVA_NO"           => $getVaNumber,
            "ZZTRUCK_NO"        => $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo,
            "ZZPLANT"           => $postData->masterPlantId ?? '',
            "ZZTRANSACTION_TYPE"=> $moduleType,
            "ZZGATEIN_TIME"     => $currentDateTime,
            "ZZGATEOUT_TIME"    => ($postData->screen == 'SERVICE' ? $currentDateTime : ''),
            "METHOD"            => "POST",
            "ZZLINE"            => $groupedData1
        ];

        // 7. SAP Call

        $urlPath = "zgatepro/ZREPT_SHR_GP/GatePro_Receipt_Detail_Sharing?sap-client=900";
        $res = ($postData->moduleStatusId == 1 || $postData->subModuleTypeId == 5) ? SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data])) : [];

            if (!is_array($res) || count($res) == 0 || !isset($res[0]->STATUS)) {
                throw new \Exception("Invalid/Empty SAP response");
            }
            if ($res[0]->STATUS == 0) {
                throw new \Exception($res[0]->MESSAGE . " (SAP Rejected)");
            }
        
    
        

        // 8. Insert into loading_unloading_info
        $loadingData = [
            'movementTypeId'   => $MOVEMENT_TYPE_ID,
            'moduleTypeId'     => $postData->moduleTypeId,
            'subModuleTypeId'  => $postData->subModuleTypeId,
            'truckNo'          => $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo,
            'masterPlantId'    => $purchaseMasterPlantId,
            'remarks'          => $postData->remarks,
            'phoneNo'          => $postData->driverMobileNumber,
            'tripSheetNo'      => $postData->tripSheetNumber,
            'statusId'         => $STATUS_ACTIVE,
            'isGateIn'         => 1,
            'isWeight'         => $postData->isWeight,
            'createdBy'        => $postData->userInfoId,
            'createdOn'        => $currentDateTime
        ];
        $db->table('loading_unloading_info')->insert($loadingData);
        $loadingUnloadingId = $db->insertID();

        // --- Duplicate check for gate_in_out_info ---
        $existsGate = $db->table("gate_in_out_info")
            ->where("vaNumber", $getVaNumber)
            ->countAllResults();
        if ($existsGate > 0) {
            throw new \Exception("Duplicate entry: VA Number already exists in gate_in_out_info");
        }

        // 9. Decide waitingAt & moduleStatusId
        if ($postData->screen == 'SERVICE') {
            $waitingAt = 10; $moduleStatusId = 5;
            $gateOutTime = $currentDateTime;
        } elseif ($postData->subModuleTypeId == 5) {
            $waitingAt = 5; $moduleStatusId = 4;
             $gateOutTime = null;
        } elseif ($postData->moduleStatusId == 1) {
            if ($OwnWB == 0 || $postData->isWeight == 0) {
                $waitingAt = 5; $moduleStatusId = 4;
                $gateOutTime = null;
            } else {
                $waitingAt = 2; $moduleStatusId = 1;
                $gateOutTime = null;
            }
        } else {
            $waitingAt = 1; $moduleStatusId = 6;
            $gateOutTime = null;
        }

        // 10. Insert into gate_in_out_info
        $insertData = [
            'createdBy'             => $postData->userInfoId,
            'movementType'          => $MOVEMENT_TYPE_ID,
            'userGateId'            => $postData->gate_id,
            'moduleType'            => $postData->moduleTypeId,
            'subModuleTypeId'       => $postData->subModuleTypeId,
            'vehicleNo'             => $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo,
            'vaNumber'              => $getVaNumber,
            'driverMobileNumber'    => $postData->driverMobileNumber,
            'masterPlantId'         => $purchaseMasterPlantId,
            'tripSheetNumber'       => $postData->tripSheetNumber,
            'deliveryOrderNumber'   => $postData->deliveryOrderNumber,
            'moduleStatusId'        => $moduleStatusId,
            'waitingAt'             => $waitingAt,
            'remarks'               => $postData->remarks,
            'loadingUnloadingInfoId'=> $loadingUnloadingId,
            'isWeight'              => $postData->isWeight,
            'createdOn'             => $currentDateTime,
            'gateInDateStamp'       => $currentDateTime,
            'gateOutDateStamp'      => $gateOutTime,
            'route'                 => $postData->route,
            'masterColorTokenId'    => $postData->masterColorTokenId,
            'truckType'             => $postData->truckType,
            'clean'                 => $postData->clean,
            'oder'                  => $postData->oder,
            'tarpaulin'             => $postData->tarpaulin,
            'noOfTarpaulin'         => $postData->noOfTarpaulin,
            'platformCondition'     => $postData->platformCondition,
            'isVehicleFit'          => $postData->isVehicleFit,
            'previousLoadData'      => $postData->previousLoadData,
            'truckCapacity'         => $postData->truckCapacity,
            'fgSalesReturnInfoId'   => $postData->fgSalesReturnInfoId,
        ];
        $db->table('gate_in_out_info')->insert($insertData);

        // 11. Insert grouped purchase orders
        foreach ($groupedData as &$gd) {
            $gd['loadingUnloadingInfoId'] = $loadingUnloadingId;
        }
        if (!empty($groupedData)) {
            $db->table('purchase_order')->insertBatch($groupedData);
        }

        $db->transComplete();
        return [true, "Gate In Success - VA NO : $getVaNumber"];

    } catch (\Throwable $e) {
        $db->transRollback();
        return [false, "Error during Gate In: " . $e->getMessage()];
    }
}

public function addGateIn($postData) {
    $db = \Config\Database::connect();
    $currentDateTime = date("Y-m-d H:i:s");

    $MOVEMENT_TYPE_ID = 2;
    $STATUS_ACTIVE = 1;

    try {
        $db->transBegin(); // cleaner than transStart()

        // --- 1. Generate VA Number ---
        $result = $db->query("CALL spGenerateVaNumber(?, ?)", [$postData->userInfoId, $postData->movementType])->getResultArray();
        $getVaNumber = $result[0]['vaNumber'] ?? null;
        if (!$getVaNumber) throw new \Exception("Failed to generate VA Number");

        // --- 2. Generate HandCarry Number ---
        $result1 = $db->query("CALL spGenerateCashNumber(?, ?, ?)", [$postData->userInfoId, '', 'handCarry'])->getResultArray();
        $getHandCarryNumber = $result1[0]['cashNumber'] ?? null;

        // --- 3. Resolve Master Plant ---
        $purchaseMasterPlantId = $db->table("master_plant")->select("ID")->where("WERKS", $postData->masterPlantId)->get()->getRow('ID');

        // --- 4. Own WB ---
        $OwnWB = $db->table("master_gate")->select("OwnWB")->where("id", $postData->gate_id)->get()->getRow('OwnWB');
        // print_r($OwnWB);exit;
        // --- 5. Duplicate Checks ---
        if ($db->table("user_module_access")->where("userInfoId", $postData->userInfoId)->where("moduleTypeId", 45)->countAllResults() == 0) {
            throw new \Exception("Please check the module type access");
        }

        if ($db->table("gate_in_out_info")->where("vehicleNo", $postData->vehicleNo)->whereIn("moduleStatusId", [0,1,2,3,4,6,12])->countAllResults() > 0) {
            throw new \Exception("Duplicate entry: Vehicle already gate-inward and not yet gate-out");
        }

        if ($db->table("loading_unloading_info")
                ->where("truckNo", $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo)
                ->where("createdOn >=", date("Y-m-d H:i:s", strtotime("-5 minutes")))
                ->where("createdOn <=", $currentDateTime)
                ->countAllResults() > 0) {
            throw new \Exception("Duplicate entry: Vehicle already gate-in within last 5 minute");
        }

        // --- 6. Insert loading_unloading_info ---
        $loadingData = [
            'movementTypeId'   => $MOVEMENT_TYPE_ID,
            'moduleTypeId'     => $postData->moduleTypeId,
            'subModuleTypeId'  => $postData->subModuleTypeId,
            'truckNo'          => $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo,
            'masterPlantId'    => $purchaseMasterPlantId,
            'remarks'          => $postData->remarks,
            'phoneNo'          => $postData->driverMobileNumber,
            'tripSheetNo'      => $postData->tripSheetNumber,
            'statusId'         => $STATUS_ACTIVE,
            'isGateIn'         => 1,
            'isWeight'         => $postData->isWeight,
            'createdBy'        => $postData->userInfoId,
            'createdOn'        => $currentDateTime
        ];
        $db->table('loading_unloading_info')->insert($loadingData);
        $loadingUnloadingId = $db->insertID();

        // --- 7. Decide waitingAt ---
        [$waitingAt, $moduleStatusId] = $postData->moduleStatusId == 1 ? [5, 4] : [1, 6];

        // --- 8. Insert gate_in_out_info ---
        $insertData = [
            'createdBy'             => $postData->userInfoId,
            'movementType'          => $MOVEMENT_TYPE_ID,
            'userGateId'            => $postData->gate_id,
            'moduleType'            => $postData->moduleTypeId,
            'subModuleTypeId'       => $postData->subModuleTypeId,
            'vehicleNo'             => $postData->subModuleTypeId == 5 ? $getHandCarryNumber : $postData->vehicleNo,
            'vaNumber'              => $getVaNumber,
            'driverMobileNumber'    => $postData->driverMobileNumber,
            'masterPlantId'         => $purchaseMasterPlantId,
            'tripSheetNumber'       => $postData->tripSheetNumber,
            'deliveryOrderNumber'   => $postData->deliveryOrderNumber,
            'moduleStatusId'        => $moduleStatusId,
            'waitingAt'             => $waitingAt,
            'remarks'               => $postData->remarks,
            'loadingUnloadingInfoId'=> $loadingUnloadingId,
            'isWeight'              => $postData->isWeight,
            'createdOn'             => $currentDateTime,
            'gateInDateStamp'       => $currentDateTime,
            'route'                 => $postData->route,
            'masterColorTokenId'    => $postData->masterColorTokenId,
            'truckType'             => $postData->truckType,
            'clean'                 => $postData->clean,
            'oder'                  => $postData->oder,
            'tarpaulin'             => $postData->tarpaulin,
            'noOfTarpaulin'         => $postData->noOfTarpaulin,
            'platformCondition'     => $postData->platformCondition,
            'isVehicleFit'          => $postData->isVehicleFit,
            'previousLoadData'      => $postData->previousLoadData,
            'truckCapacity'         => $postData->truckCapacity,
            'fgSalesReturnInfoId'   => $postData->fgSalesReturnInfoId,
        ];
        $db->table('gate_in_out_info')->insert($insertData);

        // --- 9. Insert Purchase Orders ---
        $groupedData = [];

        if (!empty($postData->purchaseOrderDetailsList)) {
            foreach ($postData->purchaseOrderDetailsList as $item) {
                $poTypeRow = $db->table("po_type")
                    ->select("id")->where("type", $item->poType)->get()->getRow();
                $poType = $poTypeRow ? $poTypeRow->id : null;
                

                // use poNumber as key (overwrite if duplicate)
                $groupedData[$item->poNumber] = [
                    "poNumber"    => $item->poNumber,
                    "invoiceNo"   => $item->invoiceNo,
                    "invoiceDate" => $item->invoiceDate,
                    "vendorCode"  => $item->vendorCode,
                    "vendorName"  => $item->vendorName,
                    "poType"      => $poType,
                    "invoiceCopy" => $item->shipmentCopy ?? null,
                    "status"      => 0,
                    "dateStamp"   => $currentDateTime,
                    "documentDate"=> $item->documentDate,
                    "loadingUnloadingInfoId" => $loadingUnloadingId
                ];
            }

            if (!empty($groupedData)) {
                $db->table('purchase_order')->insertBatch(array_values($groupedData));
            }
        }


        $db->transCommit();
        return [true, "Gate In Success - VA NO : $getVaNumber"];

    } catch (\Throwable $e) {
        $db->transRollback();
        return [false, "Error during Gate In: " . $e->getMessage()];
    }
}

public function updateGateInPODetails($postData) {
    $db = \Config\Database::connect();
    $currentDateTime = date("Y-m-d H:i:s");

    try {
        $lineNo = 1;
        $sapItems = []; // SAP payload

        if (!empty($postData->purchaseOrderDetailsList)) {
            foreach ($postData->purchaseOrderDetailsList as $item) {
                // --- File Handling ---
                $filename = null; $fileformat = null; $lv_xstring = null;
                if (!empty($postData->invoiceCopy)) {
                    $fileUrl = str_replace(' ', '%20', $postData->invoiceCopy);
                    $fileContents = @file_get_contents($fileUrl);
                    if ($fileContents !== false) {
                        $filename = basename($fileUrl);
                        $lv_xstring = base64_encode($fileContents);
                        $finfo = finfo_open(FILEINFO_MIME_TYPE);
                        $mimeType = finfo_buffer($finfo, $fileContents);
                        finfo_close($finfo);
                        $mimeToExt = [
                            'application/pdf' => '.pdf',
                            'image/png'       => '.png',
                            'image/jpeg'      => '.jpg',
                            'image/jpg'       => '.jpg'
                        ];
                        $fileformat = $mimeToExt[$mimeType] ?? '';
                    }
                }

                // --- Map PO Type ---
                $poTypeRow = $db->table("po_type")->select("id")
                    ->where("type", $item->poType)->get()->getRow();
                $poType = $poTypeRow ? $poTypeRow->id : null;

                // --- Prepare SAP Payload ---
                $sapItems[] = [
                    'ZZLINE'     => $lineNo++,
                    'ZZPO_NO'    => $item->poNumber,
                    'ZZVENDOR'   => $postData->vendorCode,
                    'ZZINV_NO'   => $postData->invoiceNo,
                    'filename'   => $filename,
                    'fileformat' => $fileformat,
                    'lv_xstring' => $lv_xstring
                ];

                // Store for DB update
                $item->poType      = $poType;
                $item->filename    = $filename;
                $item->fileformat  = $fileformat;
                $item->lv_xstring  = $lv_xstring;
            }
        }

        // --- SAP Payload ---
        $sap_data = [
            "ZZVA_NO"            => $postData->vaNumber,
            "ZZTRUCK_NO"         => $postData->vehicleNo,
            "ZZPLANT"            => $postData->masterPlantId,
            "ZZTRANSACTION_TYPE" => 'Other Purchase',
            "ZZGATEIN_TIME"      => $postData->gateInDateStamp,
            "METHOD"             => "POST",
            "ZZLINE"              => $sapItems
        ];
                // print_r($sap_data);exit;

        // --- SAP Call ---
        $urlPath = "zgatepro/ZREPT_SHR_GP/GatePro_Receipt_Detail_Sharing?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data]));

        if (!is_array($res) || count($res) == 0 || !isset($res[0]->STATUS)) {
            throw new \Exception("Invalid/Empty SAP response");
        }
        if ($res[0]->STATUS == 0) {
            throw new \Exception($res[0]->MESSAGE . " (SAP Rejected)");
        }

        // --- Only after SAP success: update DB ---
        $db->transStart();

       
            $purchaseId = $postData->purchaseId ?? null;
            $gateId     = $postData->gateInOutInfoIds ?? null;

            if ($purchaseId) {
                $db->table("purchase_order")->whereIn('id', $purchaseId)->update([
                    'invoiceCopy'  => $postData->invoiceCopy,
                    'invoiceNo'  => $postData->invoiceNo,
                    'invoiceDate'  => $postData->invoiceDate,
                    'msme'=> $postData->msme,   
                ]);
            }

            if ($gateId) {
                $db->table("gate_in_out_info")->whereIn('id', $gateId)->update([
                    'waitingAt'     => 10,
                ]);
            }
        

        $db->transComplete();
        return [true, "Invoice Details Updated Sucessfully"];

    } catch (\Throwable $e) {
        $db->transRollback();
        return [false, "Error during Gate In: " . $e->getMessage()];
    }
}
public function ReceiptDetailsGetMultiplePO($fromDate, $toDate, $moduleTypeId, $userInfoId, $vaNumber = null)
{
    // --- Convert milliseconds to seconds if needed ---
    if ($fromDate > 1000000000000) $fromDate /= 1000;
    if ($toDate > 1000000000000) $toDate /= 1000;

    $db = $this->db;

    // --- Set default dates ---
    if ($fromDate == 0) {
        $fromDateStr = '2025-05-01 00:00:00';
        $toDateStr   = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");
    } else {
        $fromDateStr = date("Y-m-d 00:00:00", $fromDate);
        $toDateStr   = date("Y-m-d 23:59:59", $toDate);
    }

    // --- Base Conditions ---
    $moduleWaitingCnd = "(gate_in_out_info.moduleType IN (45) AND gate_in_out_info.waitingAt = 10)";
    $cnd = "gate_in_out_info.gateInDateStamp BETWEEN '$fromDateStr' AND '$toDateStr'
            AND purchase_order.status = 0 
            AND purchase_order.migoNumber IS NULL 
            AND purchase_order.isDelete = 0
            AND $moduleWaitingCnd";

    // --- User Access ---
    if ($userInfoId != 1) {
        $cnd .= " AND purchase_order.poType IN (SELECT poTypeId FROM po_type_access WHERE userInfoId = " . intval($userInfoId) . ")";
        $cnd .= " AND gate_in_out_info.masterPlantId IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = " . intval($userInfoId) . ")";
    }

    // --- Module Type Filter ---
    if (!empty($moduleTypeId)) {
        $cnd .= " AND purchase_order.poType = " . intval($moduleTypeId);
    }

    // --- VA Number Filter ---
    // if (!empty($vaNumber)) {
    //     $cnd .= " AND gate_in_out_info.id = " . intval($vaNumber);
    // }

    // --- Query Builder ---
    $builder = $db->table("purchase_order")
        ->select("
            purchase_order.*,
            gate_in_out_info.vehicleNo,
            gate_in_out_info.vaNumber,
            master_plant.PLANT_NAME,
            master_module.moduleType,
            GROUP_CONCAT(DISTINCT purchase_order.poNumber ORDER BY purchase_order.poNumber ASC) AS poNumbers,
            GROUP_CONCAT(DISTINCT purchase_order.id ORDER BY purchase_order.id ASC) AS purchaseIds,
            GROUP_CONCAT(DISTINCT gate_in_out_info.id ORDER BY gate_in_out_info.id ASC) AS gateIds,
            CONCAT(
                TIMESTAMPDIFF(DAY, purchase_order.dateStamp, NOW()), ' Days ',
                TIMESTAMPDIFF(HOUR, purchase_order.dateStamp, NOW()) % 24, ' Hrs ',
                TIMESTAMPDIFF(MINUTE, purchase_order.dateStamp, NOW()) % 60, ' Mins'
            ) AS dateStamp,
            CONCAT(
                TIMESTAMPDIFF(DAY, gate_in_out_info.gateOutDateStamp, NOW()), ' Days ',
                TIMESTAMPDIFF(HOUR, gate_in_out_info.gateOutDateStamp, NOW()) % 24, ' Hrs ',
                TIMESTAMPDIFF(MINUTE, gate_in_out_info.gateOutDateStamp, NOW()) % 60, ' Mins'
            ) AS gateOutDateStamp
        ")
        ->join('gate_in_out_info', '(gate_in_out_info.loadingUnloadingInfoId = purchase_order.loadingUnloadingInfoId OR gate_in_out_info.id = purchase_order.gateInOutInfoId)', 'inner')
        ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
        ->join('master_module', 'master_module.id = gate_in_out_info.moduleType', 'inner')
        ->where($cnd)
        ->groupBy('purchase_order.invoiceNo, purchase_order.poType');

    // Limit default fetch when fromDate == 0
    if ($fromDate == 0) {
        $builder = $builder->limit(50);
    }

    $result = $builder->get()->getResultArray();
    return $result;
}
public function getPoNumbersWheat($userInfoId,$fromDate,$toDate,$plantCode) {
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
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    } else {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1 = date("Y-m-d 23:59:59", $toDate);
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    }

 

    // Build query
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.poNumber AS value, miro_entry.poNumber AS label") // Selecting PO number with alias 'value' and 'label'
        ->join('purchase_info', 'purchase_info.PI_REFID = miro_entry.purchaseInfoId', 'inner') // Corrected join
        ->where($cnd) // Apply the condition based on the user info
        ->groupBy('miro_entry.poNumber'); // Group by PO number to avoid duplicates
       
    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
} 
public function getVendorListWheat($poNumbers) {
    // Default condition, applying status condition universally
    $cnd = "miro_entry.status = 1"; // Status condition is always applied
    $poNumbersArray = [];

    // Check if $poNumbers is an object and contains 'poNumbers' property
    if (is_object($poNumbers) && isset($poNumbers) && is_array($poNumbers)) {
        // Extract the poNumber values from the passed array of objects
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);

        // Debugging: Check the extracted PO numbers
    } elseif (is_array($poNumbers)) {
        // In case it's already an array, directly use it
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);
        
        // Debugging: Check the extracted PO numbers
    } else {
        // Handle the case where PO numbers are not in the expected format
        return [];
    }

    // Build query
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.vendor AS value, CONCAT(miro_entry.vendor, ' - ', miro_entry.vendorName) AS label") // Selecting PO number with alias 'value' and 'label'
        ->join('purchase_info', 'purchase_info.PI_REFID = miro_entry.purchaseInfoId', 'inner') // Corrected join
        ->where($cnd) // Apply the condition based on the user info
        ->whereIn('miro_entry.poNumber', $poNumbersArray)
        ->groupBy('miro_entry.vendor'); // Group by PO number to avoid duplicates

    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
}
public function getCondtionWheat($poNumbers) {
    // Default condition, applying status condition universally
    $cnd = "miro_entry.status = 1"; // Status condition is always applied
    $poNumbersArray = [];

    // Check if $poNumbers is an object and contains 'poNumbers' property
    if (is_object($poNumbers) && isset($poNumbers) && is_array($poNumbers)) {
        // Extract the poNumber values from the passed array of objects
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);

        // Debugging: Check the extracted PO numbers
    } elseif (is_array($poNumbers)) {
        // In case it's already an array, directly use it
        $poNumbersArray = array_map(function($item) {
            return $item->value; // Extract the 'value' from each object (the PO number)
        }, $poNumbers);
        
        // Debugging: Check the extracted PO numbers
    } else {
        // Handle the case where PO numbers are not in the expected format
        return [];
    }

    // Build query
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.itemText AS value, itemText AS label") // Selecting PO number with alias 'value' and 'label'
        ->join('purchase_info', 'purchase_info.PI_REFID = miro_entry.purchaseInfoId', 'inner') // Corrected join
        ->where($cnd) // Apply the condition based on the user info
        ->whereIn('miro_entry.poNumber', $poNumbersArray)
        ->groupBy('miro_entry.itemText'); // Group by PO number to avoid duplicates

    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
}
public function getMiroDetailsByIdWheat($poNumbers) {

    // ------------------------
    // 1. Extract PO Numbers (optional)
    // ------------------------
    $poNumbersArray = [];
    if (!empty($poNumbers->poNumbers) && is_array($poNumbers->poNumbers)) {
        $poNumbersArray = array_map(fn($item) => $item->value, $poNumbers->poNumbers);
    }

    // ------------------------
    // 2. Extract Vendor Codes (optional)
    // ------------------------
    $vendorArray = [];
    if (!empty($poNumbers->vendorCode) && is_array($poNumbers->vendorCode)) {
        $vendorArray = array_map(fn($item) => $item->value, $poNumbers->vendorCode);
    }

    $condtionArray = [];
    if (!empty($poNumbers->condtion) && is_array($poNumbers->condtion)) {
        $condtionArray = array_map(fn($item) => $item->value, $poNumbers->condtion);
    }
    // ------------------------
    // 3. Date Handling
    // ------------------------
    $fromDate = $poNumbers->fromDate;
    $toDate   = $poNumbers->toDate;

    if ($fromDate > 1000000000000) $fromDate /= 1000;
    if ($toDate > 1000000000000)   $toDate   /= 1000;

    // ------------------------
    // 4. BASE QUERY
    // ------------------------
    $builder = $this->db->table('miro_entry')
        ->select("
            miro_entry.*,
            purchase_info.VEHICLE_TYPE,
            purchase_info.ZVA_NUMBER AS vaNumber,
            purchase_info.TRUCK_NO
        ")
        ->join('purchase_info', 'purchase_info.PI_REFID = miro_entry.purchaseInfoId', 'inner')
        ->groupBy('miro_entry.id');

    // ------------------------
    // 5. Apply Date Conditions
    // ------------------------
    if ($fromDate == 0) {
        // Default last 30 days
        $cnd = "miro_entry.status = 1";
        $builder->limit(50); // Limit 50 only for last 30 days
    } else {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1   = date("Y-m-d 23:59:59", $toDate);
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    }

    $builder->where($cnd);

    // ------------------------
    // 6. Apply Optional Filters
    // ------------------------
    if (!empty($poNumbersArray)) {
        $builder->whereIn('miro_entry.poNumber', $poNumbersArray);
    }
    if (!empty($vendorArray)) {
        $builder->whereIn('miro_entry.vendor', $vendorArray);
    }
    if (!empty($condtionArray)) {
        $builder->whereIn('miro_entry.itemText', $condtionArray);
    }
    if(empty($condtionArray)){
        $builder->whereNotIn('miro_entry.condition', ['YWBE','YWB3','YWBC']);
    }
    if ($poNumbers->type) {
        // $builder->whereIn('purchase_info.VEHICLE_TYPE', ['Rake']);
         $builder->whereIn('purchase_info.VEHICLE_TYPE', ['RAKE']);
    }else{
        $builder->whereIn('purchase_info.VEHICLE_TYPE', ['Truck','Container','FCI Truck']);
    }   
    // ------------------------
    // 7. Execute
    // ------------------------
    return $builder->get()->getResultArray();
}
public function MiroDetailReportWheat($fromDate, $toDate, $moduleTypeId, $userInfoId, $status, $plantCode, $Userplant){
    // 🔹 Convert milliseconds to seconds if necessary
    $fromDate = $fromDate > 1000000000000 ? intval($fromDate / 1000) : intval($fromDate);
    $toDate   = $toDate > 1000000000000 ? intval($toDate / 1000) : intval($toDate);

    // 🔹 Format timestamps into date ranges
    $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
    $toDate   = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");

    // 🔹 Start building query
    $builder = $this->db->table("miro_entry")
        ->select([
            "miro_entry.*",
            "purchase_info.TRUCK_NO as vehicleNo",
            "purchase_info.ZVA_NUMBER as vaNumber",
            "purchase_info.VEHICLE_TYPE as moduleType",
            "master_plant.PLANT_NAME",
            "DATE_FORMAT(miro_entry.createdAt, '%d-%m-%Y') as createdAtFormatted",
            "DATE_FORMAT(miro_entry.docDate, '%d-%m-%Y') as invoiceDate",
            "DATE_FORMAT(miro_entry.postingDate, '%d-%m-%Y') as postingDateFormatted",
            "CASE miro_entry.status
                WHEN 1 THEN 'Process'
                WHEN 2 THEN 'Accounts Submitted'
                WHEN 3 THEN 'Completed'
                WHEN 4 THEN 'Deduction'
                ELSE 'Reject'
            END AS statusName",
            "CASE miro_entry.attach
                WHEN 1 THEN 'attached'
                ELSE 'Not attached'
            END AS attachText",
            "ROW_NUMBER() OVER (ORDER BY miro_entry.id) AS serialNo"
        ])
        ->join('purchase_info', 'purchase_info.PI_REFID = miro_entry.purchaseInfoId', 'inner')
        ->join('master_plant', 'master_plant.WERKS = miro_entry.plantCode', 'left')
        ->where('miro_entry.createdAt >=', $fromDate)
        ->where('miro_entry.createdAt <=', $toDate);

    

    // 🔹 Combine plant codes from frontend and user access
    $allPlants = array_filter(array_unique(array_merge(
        explode(',', $plantCode ?? ''),
        explode(',', $Userplant ?? '')
    )));
    if (count($allPlants)) {
        $builder->whereIn('miro_entry.plantCode', $allPlants);
    }
    // 🔹 Handle status
    if ($status !== '' && $status != '5') {
        $builder->where('miro_entry.status', $status);
    }

    // 🔹 Group and order (depends on SQL flavor, can remove or adapt groupBy as needed)
    $builder->groupBy('miro_entry.id');

    // 🔹 Execute and return results
    return $builder->get()->getResultArray();
}
public function getMiroDetailsTruckPurchase($fromDate, $toDate, $userId) {
    // Debugging: Print the structure of the PO numbers to check the incoming data

     // Status condition is always applied
  
    $fromDate = $fromDate;
    $toDate = $toDate;

    if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
        $fromDate /= 1000;
    }
    if ($toDate > 1000000000000) {
        $toDate /= 1000;
    }

    if ($fromDate == 0) {
        $cnd = "miro_entry.status = 1";
    }else{
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1 = date("Y-m-d 23:59:59", $toDate);
        $cnd = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' AND miro_entry.status = 1";
    }
    // If poNumbers is an array of values, use whereIn
        $builder = $this->db->table('miro_entry')
            ->select("miro_entry.*,purchase_info.VEHICLE_TYPE,purchase_info.ZVA_NUMBER as vaNumber,purchase_info.TRUCK_NO") 
            ->join('purchase_info', 'purchase_info.PI_REFID = miro_entry.purchaseInfoId', 'inner') // Corrected join
            ->where($cnd)
            ->whereIn('purchase_info.VEHICLE_TYPE', ['Truck','Container','FCI Truck']) // Using whereIn with extracted PO numbers
            ->groupBy('miro_entry.vendor,miro_entry.poNumber,miro_entry.refDocNo,purchase_info.ZVA_NUMBER');
    // Execute and return the result
    $result = $builder->get()->getResultArray();
    return $result;
}
public function InvoiceDetailsChangeWheatPurchase($fromDate, $toDate){
        // Ensure timestamps are in seconds, not milliseconds
   if ($fromDate > 1000000000000) { // If it's in milliseconds, convert to seconds
       $fromDate /= 1000;
   }
   if ($toDate > 1000000000000) {
       $toDate /= 1000;
   }

   // Convert to proper date format
   $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
   $toDate = $toDate > 0 ? date("Y-m-d 23:59:59", $toDate) : date("Y-m-d 23:59:59");
   
    
       $cnd = "supplier_vehical_info.DateAdded BETWEEN '$fromDate' AND '$toDate'";
       
       // Query Builder
       $builder = $this->db->table("supplier_vehical_info")
                           ->select("supplier_vehical_info.*,supplier_dispatch_info.ZPO_NUMBER,supplier_dispatch_info.ZSUPPLIER_CODE,supplier_dispatch_info.ZPO_LINE_ITEM,supplier_dispatch_info.VEHICLE_TYPE")
                           ->join('supplier_dispatch_info', 'supplier_dispatch_info.SD_REFID = supplier_vehical_info.SUPPLIER_ID', 'inner')
                           ->join('purchase_info', 'supplier_dispatch_info.ZPO_NUMBER = purchase_info.ZPO_NUMBER AND supplier_dispatch_info.ZPO_LINE_ITEM = purchase_info.PO_LINE_ITEM AND supplier_dispatch_info.ZSUPPLIER_CODE = purchase_info.ZSUPPLIER_CODE AND purchase_info.MIGO_NUM IS NULL', 'left')
                           ->where($cnd)
                           ->groupBy('supplier_vehical_info.SUP_VE_REFID'); // Grouping by Invoice Number
       // Fetch Results
       $result = $builder->get()->getResultArray();
       return $result;
} 

public function getMiroDetailsApprovalList($userInfoId, $fromDate, $toDate, $status,$plantCode)
{
    if ($fromDate > 1000000000000) $fromDate /= 1000;
    if ($toDate > 1000000000000)   $toDate  /= 1000;
    // ---- DATE FILTER ----
    if ($fromDate == 0 && $status > 4) {
        $dateFilter = "miro_entry.status IN ($status)";
    }else if ($status > 4) {
         $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
         $toDate1   = date("Y-m-d 23:59:59", $toDate);

        $dateFilter = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' 
                       AND miro_entry.status IN ($status)";
    }else {
        $fromDate1 = date("Y-m-d 00:00:00", $fromDate);
        $toDate1   = date("Y-m-d 23:59:59", $toDate);

        $dateFilter = "miro_entry.createdAt BETWEEN '$fromDate1' AND '$toDate1' 
                       AND miro_entry.status IN (5,6)";
    }
    // Start builder
    $builder = $this->db->table('miro_entry')
        ->select("miro_entry.miroId, miro_entry.vendor,
            CONCAT(miro_entry.vendor, ' - ', miro_entry.vendorName) AS vendorName,
            miro_entry.id, miro_entry.amount, miro_entry.gross_amount,
            DATE_FORMAT(miro_entry.docDate,'%d-%m-%Y') as docDate,
            miro_entry.refDocNo, miro_entry.plantCode, miro_entry.invoiceCopy,
            GROUP_CONCAT(DISTINCT miro_entry.poNumber ORDER BY miro_entry.id ASC) AS poNumber,
            GROUP_CONCAT(DISTINCT miro_entry.migoNumber ORDER BY miro_entry.id ASC) AS migoNumber,
            GROUP_CONCAT(DISTINCT miro_entry.id ORDER BY miro_entry.id ASC) AS ids,
            miro_entry.gateInOutInfoId, weighment_info.firstWeight,
            gate_in_out_info.loadingUnloadingInfoId, purchase_info.PI_REFID")
        ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'left')
        ->join('purchase_info', 'miro_entry.purchaseInfoId = purchase_info.PI_REFID', 'left')
        ->join('weighment_info', 'gate_in_out_info.id = weighment_info.gateInOutInfoId', 'left')
        ->join('receipt_material_info', 'miro_entry.gateInOutInfoId = receipt_material_info.gateInOutInfoId 
                AND miro_entry.poNumber = receipt_material_info.poNumber
                AND miro_entry.poItem = receipt_material_info.lineItem
                AND miro_entry.refNo = receipt_material_info.migoNumber', 'left')
        ->join('purchase_order', 'purchase_order.id = receipt_material_info.purchaseIds', 'left')
        ->where($dateFilter);

    // ---- USER ACCESS FILTER ----
    if ($userInfoId != 1) {
        // ---- PLANT FILTER ----
        if (!empty($plantCode)) {
            $plants = explode(",", $plantCode);
            $quoted = array_map(fn($p) => $this->db->escape(trim($p)), $plants);
            $builder->where("miro_entry.plantCode IN (" . implode(",", $quoted) . ")");
        }
    }

    $builder->groupBy("miro_entry.miroId")
            ->orderBy("miro_entry.miroId", "ASC");

    if ($fromDate == 0) {
        $builder->limit(50);
    }

    $result = $builder->get()->getResultArray();

    // ----------- FETCH CHILD LINES -------------
    $all = [];

    foreach ($result as $row) {
        $idsArray = explode(",", $row['ids']);

        $builder1 = $this->db->table('miro_entry')
            ->select("miro_entry.*, 
                receipt_material_info.creditNoteCopy,
                receipt_material_info.projectTeamAcknowledgement,
                receipt_material_info.vendorEmailCopy,
                receipt_material_info.externalWbCopy,
                receipt_material_info.qcCertificateExternalCopy,
                receipt_material_info.qcCertificateInternalCopy,
                receipt_material_info.eInvoiceCopy,
                receipt_material_info.ewayBillCopy,
                receipt_material_info.deliveryChallanCopy,
                receipt_material_info.bargainNote,
                gate_in_out_info.loadingUnloadingInfoId,
                purchase_info.PI_REFID,
                purchase_info.VEHICLE_TYPE,u1.FIRST_NAME AS approve1Name,
                u2.FIRST_NAME AS approve2Name")
            ->join('gate_in_out_info', 'miro_entry.gateInOutInfoId = gate_in_out_info.id', 'left')
            ->join('purchase_info', 'miro_entry.purchaseInfoId = purchase_info.PI_REFID', 'left')
            ->join('receipt_material_info', 'miro_entry.gateInOutInfoId = receipt_material_info.gateInOutInfoId 
                AND miro_entry.poNumber = receipt_material_info.poNumber
                AND miro_entry.poItem = receipt_material_info.lineItem
                AND miro_entry.refNo = receipt_material_info.migoNumber', 'left')
            ->join('user_info u1', 'u1.UI_ID = miro_entry.approve1By', 'left')
            ->join('user_info u2', 'u2.UI_ID = miro_entry.approve2By', 'left')
            ->whereIn("miro_entry.id", $idsArray)
            ->groupBy("miro_entry.id")
            ->orderBy("miro_entry.id", "ASC");

        $row['lines'] = $builder1->get()->getResultArray();
        $all[] = $row;
    }

    return $all;
}
   
}

