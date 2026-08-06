<?php namespace App\Controllers\Api;

use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
use App\Models\CustomMillingMasterModel;
use App\Models\PlantModel;

class CustomMillingMasterController extends BaseApiController
{
    protected $model;

    public function __construct()
    {
        $this->model = new CustomMillingMasterModel();
    }

    // GET list for condition types. Optional param is limit or plant id - UI passes "30" in examples
    public function getConditionTypeList($limit = 0)
    {
        try {
            $limit = intval($limit);
            $res = $this->model->getConditionTypeList($limit);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch condition types', $e->getMessage());
        }
    }

    // Insert or update condition type. Expects JSON payload with id (0 for insert), purchase_org, condition_type_code, condition_description, created_by
    public function InsertUpdateConditionType()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();

        try {
            $id = isset($post['id']) ? intval($post['id']) : 0;
            $data = [
                'purchase_org_id' => $post['purchase_org'] ?? null,
                'condition_type_code' => $post['condition_type_code'] ?? null,
                'condition_description' => $post['condition_description'] ?? null,
                'created_by' => $post['created_by'] ?? 0,
            ];

            $res = $this->model->insertUpdateConditionType($id, $data);
            return $res ? $this->sendSuccessResult(['id' => $res]) : $this->sendErrorResult('Save failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error saving condition type', $e->getMessage());
        }
    }

    public function DeleteConditionType()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $deleted_by = $post['deleted_by'] ?? 0;
            $res = $this->model->deleteConditionType($id, $deleted_by);
            return $res ? $this->sendSuccessResult(['deleted' => 1]) : $this->sendErrorResult('Delete failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error deleting', $e->getMessage());
        }
    }

    public function RevertConditionType()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $res = $this->model->revertConditionType($id);
            return $res ? $this->sendSuccessResult(['reverted' => 1]) : $this->sendErrorResult('Revert failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error reverting', $e->getMessage());
        }
    }

    // Return purchase org list used in dropdowns
    public function getpurchaseorg()
    {
        try {
            $res = $this->model->getPurchaseOrgList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch purchase orgs', $e->getMessage());
        }
    }

    /* ================= MATERIAL MASTER ACTIONS ================= */

    public function getMaterialMasterList()
    {
        try {
            $res = $this->model->getMaterialMasterList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch material master list', $e->getMessage());
        }
    }

    public function InsertMaterialMaster()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = $this->model->insertMaterialMaster($post);
            return $id ? $this->sendSuccessResult(['id' => $id]) : $this->sendErrorResult('Insert failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error inserting material', $e->getMessage());
        }
    }

    public function UpdateMaterialMaster()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $res = $this->model->updateMaterialMaster($id, $post);
            return $res ? $this->sendSuccessResult(['updated' => 1]) : $this->sendErrorResult('Update failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error updating material', $e->getMessage());
        }
    }

    public function DeleteMaterialMaster()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $deleted_by = $post['deleted_by'] ?? 0;
            $res = $this->model->deleteMaterialMaster($id, $deleted_by);
            return $res ? $this->sendSuccessResult(['deleted' => 1]) : $this->sendErrorResult('Delete failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error deleting material', $e->getMessage());
        }
    }

    public function RevertMaterialMaster()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $res = $this->model->revertMaterialMaster($id);
            return $res ? $this->sendSuccessResult(['reverted' => 1]) : $this->sendErrorResult('Revert failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error reverting material', $e->getMessage());
        }
    }

    // ================= RATE MASTER ACTIONS =================

    public function fetchPurchaseOrgDetails()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        $purchaseorg = $post['purchaseorg'] ?? null;
        try {
            $res = $this->model->fetchPurchaseOrgDetails($purchaseorg);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch purchase org details', $e->getMessage());
        }
    }

    public function getMaterialCodes()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        $purchase_org = $post['purchase_org'] ?? null;
        try {
            $res = $this->model->getMaterialCodes($purchase_org);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch material codes', $e->getMessage());
        }
    }

    public function InsertValidDetails()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $res = $this->model->insertValidDetails($post);
            if (is_array($res) && isset($res['success']) && $res['success']) {
                return $this->sendSuccessResult($res);
            }
            return $this->sendErrorResult($res['error'] ?? 'Insert failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error inserting valid details', $e->getMessage());
        }
    }

    public function getratemasterdetailsList()
    {
        try {
            $res = $this->model->getRateMasterDetailsList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch rate master list', $e->getMessage());
        }
    }

    public function ApproveRateMaster()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $valid_to = $post['valid_to'] ?? null;
            $details = $post['details'] ?? [];
            $approved_by = $post['approved_by'] ?? 0;
            $res = $this->model->approveRateMaster($id, $valid_to, $details, $approved_by);
            return $res ? $this->sendSuccessResult(['approved' => 1]) : $this->sendErrorResult('Approve failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error approving', $e->getMessage());
        }
    }

    public function RejectRateMaster()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $id = intval($post['id'] ?? 0);
            $rejected_by = $post['rejected_by'] ?? 0;
            $res = $this->model->rejectRateMaster($id, $rejected_by);
            return $res ? $this->sendSuccessResult(['rejected' => 1]) : $this->sendErrorResult('Reject failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error rejecting', $e->getMessage());
        }
    }
    // Return purchase org list used in dropdowns
    public function getSegmentDetails($definitionId)
    {
        try {
            $res = $this->model->getSegmentDetails($definitionId);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch segment details', $e->getMessage());
        }
    }
    // Return purchase org list used in dropdowns
    public function getConditionChanges($definitionId,$rm_id)
    {
        try {
            $res = $this->model->getConditionChanges($definitionId,$rm_id);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch condition changes', $e->getMessage());
        }
    }
    public function getVendor($vendorID)
    {
        $urlPath = "ZRECC_BANK/Bankinfoupdate?sap-client=900&VENDOR_NO=$vendorID";
        $res = SapUrlHelper::getWhDatas($urlPath);
        return $this->sendSuccessResult(json_decode($res));
    }
    public function getCustomerCode($customerCode)
    {
        $urlPath = "ZSFA_CUS_CD/SALESPRO?sap-client=900&CUSTOMER_NO=$customerCode";
        $res = SapUrlHelper::getWhDatas($urlPath);
        return $this->sendSuccessResult(json_decode($res));
    }

    // Search segments from SAP as the user types in the Segment search box
    public function getSegment($segmentText)
    {
        try {
            $urlPath = "zrake/zcustom_mill/segment?sap-client=900&segment=" . urlencode($segmentText);
            $res = SapUrlHelper::getWhDatas($urlPath);
            $decoded = json_decode($res, true);

            // SAP may return a single object match or a list of matches - normalize to a list
            $results = [];
            if (is_array($decoded)) {
                $results = array_key_exists('SEGMENT', $decoded) ? [$decoded] : $decoded;
            }

            return $this->sendSuccessResult($results);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to search segment', $e->getMessage());
        }
    }
    public function getPlantName($userId)
    {
        try {
            $res = $this->model->getPlantName($userId);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch plant name', $e->getMessage());
        }
    }
    public function getStorageLocation($plantId)
    {
        try {
            $res = $this->model->getStorageLocation($plantId);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch storage location', $e->getMessage());
        }
    }

    // Add Purchase Order Details (header + lines + condition changes)
    public function AddPurchaseOrderDetails()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $res = $this->model->addPurchaseOrderDetails($post);
            if (is_array($res) && isset($res['success']) && $res['success']) {
                return $this->sendSuccessResult($res);
            }
            return $this->sendErrorResult($res['error'] ?? 'Save failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error saving purchase order details', $e->getMessage());
        }
    }
    public function getBagType()
    {
        try {
            $res = $this->model->getBagType();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch bag type', $e->getMessage());
        }
    }
    public function getPurchaseOrderList()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fromDate = $post['fromDate'] ?? null;
            $toDate = $post['toDate'] ?? null;
            $res = $this->model->getPurchaseOrderList($fromDate, $toDate);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch segment details', $e->getMessage());
        }
    }
    // Customer filter options for the report: distinct customers already used on existing POs
    public function getPurchaseOrderCustomerList()
    {
        try {
            $res = $this->model->getPurchaseOrderCustomerList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch customer list', $e->getMessage());
        }
    }
    // Status filter options for the report: distinct statuses present on existing POs
    public function getPurchaseOrderStatusList()
    {
        try {
            $res = $this->model->getPurchaseOrderStatusList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch status list', $e->getMessage());
        }
    }
    // Line-item based report: every active PO line, flattened, with condition changes.
    // fromDate/toDate (YYYY-MM-DD) filter on PO_LOADING_DATE and are required by the UI.
    public function getPurchaseOrderLineReport()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fromDate = $post['fromDate'] ?? null;
            $toDate = $post['toDate'] ?? null;
            $customerCode = $post['customerCode'] ?? null;
            $status = $post['status'] ?? null;
            $res = $this->model->getPurchaseOrderLineReport($fromDate, $toDate, $customerCode, $status);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch purchase order line report', $e->getMessage());
        }
    }
    // Purchase Orders awaiting Level 1 approval (status = 1)
    public function getPurchaseOrderListLevel1()
    {
        try {
            $res = $this->model->getPurchaseOrderListByStatus(1);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch purchase order list', $e->getMessage());
        }
    }
    // Purchase Orders awaiting Level 2 approval (status = 2)
    public function getPurchaseOrderListLevel2()
    {
        try {
            $res = $this->model->getPurchaseOrderListByStatus(2);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch purchase order list', $e->getMessage());
        }
    }
    // Level 1 approve: status -> 2, stamps approvalBy1/approvalAt1
    public function ApprovePurchaseOrderLevel1()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $ebeln = $post['EBELN'] ?? $post['ebeln'] ?? '';
            if (empty($ebeln)) {
                return $this->sendErrorResult('PO Number is required');
            }
            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $res = $this->model->updatePurchaseOrderStatus($ebeln, 2, [
                'approvalBy1' => $userId,
                'approvalAt1' => date('Y-m-d H:i:s'),
            ]);
            return $res ? $this->sendSuccessResult(['approved' => 1]) : $this->sendErrorResult('Approve failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error approving', $e->getMessage());
        }
    }
    // Level 2 approve: status -> 3, stamps approvalBy2/approvalAt2
    public function ApprovePurchaseOrderLevel2()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $ebeln = $post['EBELN'] ?? $post['ebeln'] ?? '';
            if (empty($ebeln)) {
                return $this->sendErrorResult('PO Number is required');
            }
            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $res = $this->model->updatePurchaseOrderStatus($ebeln, 3, [
                'approvalBy2' => $userId,
                'approvalAt2' => date('Y-m-d H:i:s'),
            ]);
            return $res ? $this->sendSuccessResult(['approved' => 1]) : $this->sendErrorResult('Approve failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error approving', $e->getMessage());
        }
    }
    // Reject at either level: status -> 0, stamps rejectedBy/rejectedAt
    public function RejectPurchaseOrder()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $ebeln = $post['EBELN'] ?? $post['ebeln'] ?? '';
            if (empty($ebeln)) {
                return $this->sendErrorResult('PO Number is required');
            }
            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $res = $this->model->updatePurchaseOrderStatus($ebeln, 0, [
                'rejectedBy' => $userId,
                'rejectedAt' => date('Y-m-d H:i:s'),
            ]);
            return $res ? $this->sendSuccessResult(['rejected' => 1]) : $this->sendErrorResult('Reject failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error rejecting', $e->getMessage());
        }
    }
    // Full header + line + condition detail for a single PO, used by the View/Edit modal
    public function getPurchaseOrderInfo($purchaseOrderId, $userId = 0)
    {
        try {
            $res = $this->model->getPurchaseOrderInfo($purchaseOrderId, $userId);
            if (!$res) {
                return $this->sendErrorResult('Purchase Order not found');
            }
            // Frontend expects data.results[0] and checks data.success === true
            return $this->sendSuccessResult([$res]);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch purchase order info', $e->getMessage());
        }
    }
    
    // Persist edits made in the popup: header fields, line items, condition changes
    public function UpdatePurchaseOrderDetails()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            // if (empty($post['purchaseOrderId'])) {
            //     return $this->sendErrorResult('purchaseOrderId is required');
            // }
            $res = $this->model->updatePurchaseOrderDetails($post);
            if (is_array($res) && isset($res['success']) && $res['success']) {
                return $this->sendSuccessResult($res);
            }
            return $this->sendErrorResult($res['error'] ?? 'Update failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error updating purchase order', $e->getMessage());
        }
    }

    // Insert FI Payment confirmation (Custom Milling FI Payment - TRUCK/RAKE tabs Submit button)
    public function InsertFIPayment()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $res = $this->model->insertFIPayment($post);
            if (is_array($res) && isset($res['success']) && $res['success']) {
                return $this->sendSuccessResult($res);
            }
            return $this->sendErrorResult($res['error'] ?? 'Insert failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error inserting FI payment', $e->getMessage());
        }
    }

    // FI Payments awaiting Level 1 approval (status = 1)
    public function getCustomMillingFiListLevel1()
    {
        try {
            $res = $this->model->getCustomMillingFiListByStatus(1);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI payment list', $e->getMessage());
        }
    }

    // FI Payments awaiting Level 2 approval (status = 2)
    public function getCustomMillingFiListLevel2()
    {
        try {
            $res = $this->model->getCustomMillingFiListByStatus(2);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI payment list', $e->getMessage());
        }
    }

    // FI Payments awaiting Level 3 approval (status = 3)
    public function getCustomMillingFiListLevel3()
    {
        try {
            $res = $this->model->getCustomMillingFiListByStatus(3);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI payment list', $e->getMessage());
        }
    }

    // Level 1 approve: status -> 2, stamps approvalBy1/approvalAt1
    public function ApproveCustomMillingFiLevel1()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fiEntryNo = $post['fi_entry_no'] ?? '';
            if (empty($fiEntryNo)) {
                return $this->sendErrorResult('FI Entry Number is required');
            }
            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $res = $this->model->updateCustomMillingFiStatus($fiEntryNo, 2, [
                'approvalBy1' => $userId,
                'approvalAt1' => date('Y-m-d H:i:s'),
            ]);
            return $res ? $this->sendSuccessResult(['approved' => 1]) : $this->sendErrorResult('Approve failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error approving', $e->getMessage());
        }
    }

    // Level 2 approve: status -> 3, stamps approvalBy2/approvalAt2
    // Level 2 approve also allows correcting Invoice No / Invoice Date before moving to Level 3
    public function ApproveCustomMillingFiLevel2()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fiEntryNo = $post['fi_entry_no'] ?? '';
            if (empty($fiEntryNo)) {
                return $this->sendErrorResult('FI Entry Number is required');
            }
            if (empty(trim($post['remarks'] ?? ''))) {
                return $this->sendErrorResult('Remarks is mandatory');
            }
            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $extra = [
                'approvalBy2' => $userId,
                'approvalAt2' => date('Y-m-d H:i:s'),
                'remarks' => trim($post['remarks']),
            ];
            if (!empty($post['vendor_invoice_no'])) {
                $extra['vendor_invoice_no'] = $post['vendor_invoice_no'];
            }
            if (!empty($post['invoice_date'])) {
                if (strtotime($post['invoice_date']) > strtotime(date('Y-m-d'))) {
                    return $this->sendErrorResult('Invoice Date cannot be a future date');
                }
                $extra['invoice_date'] = $post['invoice_date'];
            }
            if (!empty($post['posting_date'])) {
                if (strtotime($post['posting_date']) > strtotime(date('Y-m-d'))) {
                    return $this->sendErrorResult('Posting Date cannot be a future date');
                }
                $extra['posting_date'] = $post['posting_date'];
            }
            $res = $this->model->updateCustomMillingFiStatus($fiEntryNo, 3, $extra);
            return $res ? $this->sendSuccessResult(['approved' => 1]) : $this->sendErrorResult('Approve failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error approving', $e->getMessage());
        }
    }

    // Level 3 approve: pushes the FI expense posting to SAP, then on success
    // moves status -> 4 (Completed) and stamps approvalBy3/approvalAt3.
    public function ApproveCustomMillingFiLevel3()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fiEntryNo = $post['fi_entry_no'] ?? '';
            if (empty($fiEntryNo)) {
                return $this->sendErrorResult('FI Entry Number is required');
            }
            // A clubbed submit shares one fi_entry_no across several rows (one
            // per selected PO/truck item, see insertFIPayment) - fetch all of
            // them so each becomes its own SAP LINE and totalamount reflects
            // the whole club, not just whichever single row happened to match.
            $rows = $this->model->getCustomMillingFiRowsByNo($fiEntryNo);
            if (empty($rows)) {
                return $this->sendErrorResult('FI Entry not found');
            }
            $row = $rows[0]; // shared header fields (vendor, invoice no/date, remarks, attachment, ...) are identical across the group

            $invoiceAttach = '';
            $invoiceExt = '';
            $invoiceName = '';
            if (!empty($row['invoice_attachment'])) {
                $fileUrl = str_replace(' ', '%20', $row['invoice_attachment']);
                $fileContents = @file_get_contents($fileUrl);
                $invoiceAttach = $fileContents !== false ? base64_encode($fileContents) : '';
                $invoiceName = pathinfo(basename($fileUrl), PATHINFO_FILENAME);
                $invoiceExt = strtoupper(pathinfo(basename($fileUrl), PATHINFO_EXTENSION));
            }

            $totalAmount = 0;
            $lines = [];
            foreach ($rows as $i => $r) {
                $lineAmount = $r['invoice_value'] ?? $r['total_value'] ?? 0;
                $totalAmount += (float) $lineAmount;
                $lines[] = [
                    "ZZLINE" => (string) ($i + 1),
                    "Gl_account" => $r['gl'] ?? '',
                    "amount" => $lineAmount,
                    "costcenter" => $r['cost_center'] ?? '',
                    "text" => $r['remarks'] ?? '',
                    "hsn" => "",
                    "tax_type" => "",
                ];
            }

            $sap_data = array(
                "vendor_code" => $row['vendor_code'] ?? '',
                "invoice_date" => $row['invoice_date'] ? date('Ymd', strtotime($row['invoice_date'])) : '',
                "posting_date" => $row['posting_date'] ? date('Ymd', strtotime($row['posting_date'])) : date('Ymd'),
                "totalamount" => $totalAmount,
                "tds_status" => !empty($row['tds_name']) ? 'YES' : 'NO',
                "tds_value" => $row['tds_name'] ?? '',
                "ref_doc" => $row['fi_entry_no'],
                "headertext" => $row['remarks'] ?? '',
                "Invoice_attach" => $invoiceAttach,
                "invoice_name" => $invoiceName,
                "invoice_ext" => $invoiceExt,
                "LINE" => $lines,
            );
            // print_r($sap_data);exit; // Debugging line to check the data being sent to SAP
            $urlPath = "ZZGP_API/ZZFI_EXP_POST/fiexp?sap-client=900";
            $sapRes = SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data]));
            // print_r($sapRes);exit; // Debugging line to check the response from SAP
            $message = $sapRes[0]->MESSAGE ?? '';
            $status = $sapRes[0]->STATUS ?? 0;
            $docNo = $sapRes[0]->DOCUMENT_NO ?? null;
            if ($docNo && (empty($sapRes[0]->STATUS) || $status == 0 || $status == 2)) {
                return $this->sendErrorResult("$message Please Contact SAP Team");
            }

            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $extra = [
                'approvalBy3' => $userId,
                'approvalAt3' => date('Y-m-d H:i:s'),
            ];
           
            if (!empty($docNo)) {
                $extra['sap_posting_document_no'] = $docNo;
            }
            $res = $this->model->updateCustomMillingFiStatus($fiEntryNo, 4, $extra);
            return $res ? $this->sendSuccessResult(['approved' => 1,'document_no' => $docNo]) : $this->sendErrorResult('Approve failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error approving', $e->getMessage());
        }
    }

    // Pulls today's custom milling sales movements from SAP and upserts them
    // into fi_entry_stock_report as negative stock (goods sold out).
    public function SyncCustomMillSales()
    {
        return $this->syncCustomMillStockByType('sales');
    }

    // Pulls today's custom milling sales-return movements from SAP and
    // upserts them into fi_entry_stock_report as positive stock (goods returned).
    public function SyncCustomMillSalesReturn()
    {
        return $this->syncCustomMillStockByType('sales_ret');
    }

    private function syncCustomMillStockByType($type)
    {
        try {
            // $today = 20250924;
            $today = date('Ymd');
            $urlPath = "zrake/zcustom_mill/sales?sap-client=900&date=$today&type=$type";
            // print_r($urlPath);exit; // Debugging line to check the URL being called
            $raw = SapUrlHelper::getWhDatas($urlPath);
            // print_r($raw);exit; 
            $rows = json_decode($raw, true);
            // Debugging line to check the data received from SAP
            if (!is_array($rows)) {
                return $this->sendErrorResult('No data received from SAP');
            }
            $synced = $this->model->upsertFiEntryStockReport($rows, $type);
            return $this->sendSuccessResult(['synced' => $synced]);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error syncing custom milling stock', $e->getMessage());
        }
    }

    // Pulls MIGO reversals from SAP for a given date (defaults to today) and
    // flips purchase_info.VECHICAL_STATUS -> 6 for every returned MIGO_NUM.
    public function SyncMigoReversal()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $date = $post['date'] ?? date('Ymd');
            // $date = 20260221;
            $urlPath = "zrake/zcustom_mill/reversal?sap-client=900&date=$date";
            $raw = SapUrlHelper::getWhDatas($urlPath);
            $rows = json_decode($raw, true);
            // print_r(!is_array($rows));exit; // Debugging line to check the data received from SAP  
            if (!$rows) {
                return $this->sendErrorResult('No data received from SAP');
            }
            $db = db_connect();
            $updated = 0;
            foreach ($rows as $row) {
                $migoNum = $row['MIGO_NUM'] ?? $row['MIGONO'] ?? $row['MIGO_NO'] ?? null;
                if (empty($migoNum)) {
                    continue;
                }
                $db->table('purchase_info')->where('MIGO_NUM', $migoNum)->whereIn('VEHICLE_TYPE', ['Cm Truck', 'Cm Rake', 'Cm Container'])->update(['VECHICAL_STATUS' => 6]);
                $updated++;
            }
            return $this->sendSuccessResult(['updated' => $updated]);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error syncing MIGO reversal', $e->getMessage());
        }
    }

    // Reject at any level: status -> 0, stamps rejectedBy/rejectedAt
    // Reject at Level 1 or Level 2 sends the entry all the way back (status -> 0).
    // Reject at Level 3 only sends it back to Level 2 for correction (status -> 2).
    // A reject reason is mandatory in all cases and is stamped alongside rejectedBy/rejectedAt.
    public function RejectCustomMillingFi()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fiEntryNo = $post['fi_entry_no'] ?? '';
            if (empty($fiEntryNo)) {
                return $this->sendErrorResult('FI Entry Number is required');
            }
            $reason = trim($post['reject_reason'] ?? '');
            if ($reason === '') {
                return $this->sendErrorResult('Reject reason is required');
            }
            $level = (int) ($post['level'] ?? 0);
            $targetStatus = $level === 3 ? 2 : 0;
            $userId = $post['UserId'] ?? $post['userId'] ?? 0;
            $res = $this->model->updateCustomMillingFiStatus($fiEntryNo, $targetStatus, [
                'rejectedBy' => $userId,
                'rejectedAt' => date('Y-m-d H:i:s'),
                'reject_reason' => $reason,
            ]);
            return $res ? $this->sendSuccessResult(['rejected' => 1]) : $this->sendErrorResult('Reject failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error rejecting', $e->getMessage());
        }
    }

    // FI Payment report - all entries with approval status, filterable by date range/process type/status
    public function getCustomMillingFiReport()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fromDate = $post['fromDate'] ?? null;
            $toDate = $post['toDate'] ?? null;
            $processType = $post['processType'] ?? null;
            $status = $post['status'] ?? null;
            $res = $this->model->getCustomMillingFiReport($fromDate, $toDate, $processType, $status);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI payment report', $e->getMessage());
        }
    }

    // Status filter options for the FI Payment report
    public function getCustomMillingFiStatusList()
    {
        try {
            $res = $this->model->getCustomMillingFiStatusList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch status list', $e->getMessage());
        }
    }

    // FI Entry Stock Report dashboard summary
    public function getFiEntryStockDashboard()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $customerCode = $post['customerCode'] ?? null;
            $res = $this->model->getFiEntryStockDashboard($customerCode);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI entry stock dashboard', $e->getMessage());
        }
    }

    // FI Entry Stock Report - filterable list
    public function getFiEntryStockReport()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $fromDate = $post['fromDate'] ?? null;
            $toDate = $post['toDate'] ?? null;
            $customerCode = $post['customerCode'] ?? null;
            $plantCode = $post['plantCode'] ?? null;
            $status = $post['status'] ?? null;
            $res = $this->model->getFiEntryStockReport($fromDate, $toDate, $customerCode, $plantCode, $status);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI entry stock report', $e->getMessage());
        }
    }

    // FI Entry Stock Report - sales-only entries awaiting completion against a receiving plant
    public function getFiEntryStockIncompleteList()
    {
        try {
            $res = $this->model->getFiEntryStockIncompleteList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch incomplete FI entry stock list', $e->getMessage());
        }
    }

    // Customer dropdown options for the FI Entry Stock Report filter
    public function getFiEntryStockCustomerList()
    {
        try {
            $res = $this->model->getFiEntryStockCustomerList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch FI entry stock customer list', $e->getMessage());
        }
    }

    // Receiving plant options for the FI Entry Stock completion dropdown - restricted to the
    // logged-in user's assigned plants (view_user_plant); users with no plant restriction
    // (i.e. admins) get every plant.
    public function getFiEntryStockPlantList()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $userId = $post['UserId'] ?? $post['userId'] ?? null;
            $plantModel = new PlantModel();
            $plants = $userId ? $plantModel->getAllPlants($userId) : [];
            if (empty($plants)) {
                $plants = $plantModel->getAllPlants();
            }
            return $this->sendSuccessResult($plants);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch plant list', $e->getMessage());
        }
    }

    // Complete a sales-only FI entry stock row by allocating it across receiving plants
    public function insertFiEntryStockCompletion()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            $res = $this->model->insertFiEntryStockCompletion($post);
            if (is_array($res) && isset($res['success']) && $res['success']) {
                return $this->sendSuccessResult($res);
            }
            return $this->sendErrorResult($res['error'] ?? 'Completion insert failed');
        } catch (\Exception $e) {
            return $this->sendErrorResult('Error completing FI entry stock', $e->getMessage());
        }
    }
    // Customer dropdown options for the FI Entry Stock Report filter
    public function Migo501ReversalList()
    {
        try {
            $res = $this->model->Migo501ReversalList();
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch Migo 501 reversal list', $e->getMessage());
        }
    }

    public function Migo501ReversalUpdate()
    {
        $post = $this->request->getJSON(true) ?: $this->request->getPost();
        try {
            if (empty($post['id'])) {
                return $this->sendErrorResult('PI_REFID is required');
            }
            $res = $this->model->Migo501ReversalUpdate($post['id']);
            return $this->sendSuccessResult($res);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to update Migo 501 reversal', $e->getMessage());
        }
    }
    // Customer dropdown options for the FI Entry Stock Report filter
    public function getLogisticsFreightDetails($tripsheetNo)
    {
        try {
            $res = $this->model->getLogisticsFreightDetails($tripsheetNo);
            return $this->respond(["success" => $res ? true : false, "results" => $res]);
        } catch (\Exception $e) {
            return $this->sendErrorResult('Failed to fetch logistics freight details', $e->getMessage());
        }
    }
}
