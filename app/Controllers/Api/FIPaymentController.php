<?php

namespace App\Controllers\Api;
use App\Helpers\VANumberHelper;
use App\Models\FIPaymentModel;

class FIPaymentController extends BaseApiController
{

    public function GetPostingDateControl()
    {
        $master = new FIPaymentModel();
        $res = $master->GetPostingDateControl();
        return $this->sendSuccessResult($res);
    }

 public function GetVendorfromsap()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->GetVendorfromsap($postData->query);
        return $this->sendSuccessResult($res);
        ;
    }
    public function GetVendorInfoFromSap()
    {
        $master = new FIPaymentModel();
        $res = $master->GetVendorInfoFromSap();
        return $this->sendSuccessResult($res);
    }
    public function GetMigoFromSap()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->GetMigoFromSap($postData->query);
        return $this->sendSuccessResult($res);
    }

    public function GetMigoDetails()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->GetMigoDetails($postData->migo_no ?? '');
        return $this->sendSuccessResult($res);
    }

    public function GetTdsFromVendor()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $vendorCode = null;
        if (is_object($postData)) {
            $vendorCode = $postData->vendor_code ?? null;
        } elseif (is_array($postData)) {
            $vendorCode = $postData['vendor_code'] ?? null;
        }

        $res = $master->GetTdsFromVendor($vendorCode);
        return $this->sendSuccessResult($res);
    }
    public function GetGLfromsap()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->GetGLfromsap($postData->query);
        return $this->sendSuccessResult($res);
        ;
    }
    public function GetGLCodeFromSap()
    {
        $master = new FIPaymentModel();
        $res = $master->GetGLCodeFromSap();
        return $this->sendSuccessResult($res);
    }
    public function GetTdsCodesFromSap()
    {
        $master = new FIPaymentModel();
        $res = $master->GetTdsCodesFromSap();
        return $this->sendSuccessResult($res);
    }
    public function GetTaxCodesFromSap()
    {
        $master = new FIPaymentModel();
        $res = $master->GetTaxCodesFromSap();
        return $this->sendSuccessResult($res);
    }
    public function GetCostCentreFromSap()
    {
        $master = new FIPaymentModel();
        $res = $master->GetCostCentreFromSap();
        return $this->sendSuccessResult($res);
    }

    public function GetBudgetFromSap()
    {
        $postData = $this->request->getJSON();

        $glCode = null;
        $costCentre = null;
        if (is_object($postData)) {
            $glCode = $postData->gl_code ?? null;
            $costCentre = $postData->cost_ctr ?? null;
        } elseif (is_array($postData)) {
            $glCode = $postData['gl_code'] ?? null;
            $costCentre = $postData['cost_ctr'] ?? null;
        }

        $master = new FIPaymentModel();
        $res = $master->GetBudgetFromSap($glCode, $costCentre);
        return $this->sendSuccessResult($res);
    }

    public function GetFIPaymentList()
    {
        $postData = $this->request->getJSON();

        $start = 0;
        $pageSize = 25;
        $search = '';
        $approvalStatus = 1;
        $userId = null;
        $reportingManagerId = null;
        $storeReportingId = null;
        if (is_object($postData)) {
            $start = $postData->startCount ?? 0;
            $pageSize = $postData->pageSize ?? 25;
            $search = $postData->searchTxt ?? '';
            $approvalStatus = $postData->approvalStatus ?? 1;
            $userId = $postData->userid ?? null;
            $reportingManagerId = $postData->reporting_manager_id ?? null;
            $storeReportingId = $postData->store_reporting_id ?? null;
        } elseif (is_array($postData)) {
            $start = $postData['startCount'] ?? 0;
            $pageSize = $postData['pageSize'] ?? 25;
            $search = $postData['searchTxt'] ?? '';
            $approvalStatus = $postData['approvalStatus'] ?? 1;
            $userId = $postData['userid'] ?? null;
            $reportingManagerId = $postData['reporting_manager_id'] ?? null;
            $storeReportingId = $postData['store_reporting_id'] ?? null;
        }

        $master = new FIPaymentModel();
        $data = $master->GetFIPaymentList($start, $pageSize, $search, $approvalStatus, $userId, $reportingManagerId, $storeReportingId);

        return $this->response->setJSON([
            'success' => true,
            'results' => $data['results'],
            'count'   => $data['count'],
        ]);
    }

    public function UpdateApprovalStatus()
    {
        $postData = $this->request->getJSON();

        $id = null;
        $status = null;
        $remarks = null;
        $userId = null;
        $tdsCode = null;
        $tdsDescription = null;
        if (is_object($postData)) {
            $id = $postData->id ?? null;
            $status = $postData->status ?? null;
            $remarks = $postData->remarks ?? null;
            $userId = $postData->userid ?? null;
            $tdsCode = $postData->tds_code ?? null;
            $tdsDescription = $postData->tds_description ?? null;
        } elseif (is_array($postData)) {
            $id = $postData['id'] ?? null;
            $status = $postData['status'] ?? null;
            $remarks = $postData['remarks'] ?? null;
            $userId = $postData['userid'] ?? null;
            $tdsCode = $postData['tds_code'] ?? null;
            $tdsDescription = $postData['tds_description'] ?? null;
        }

        if (!$id || !$status) {
            return $this->response->setJSON(['success' => false, 'message' => 'id and status are required']);
        }

        if ((int) $status === 10 && empty($remarks)) {
            return $this->response->setJSON(['success' => false, 'message' => 'Rejection remarks are required']);
        }

        $master = new FIPaymentModel();
        $res = $master->UpdateApprovalStatus($id, $status, $userId, $remarks, $tdsCode, $tdsDescription);

        return $this->response->setJSON($res);
    }

    public function VerifyAndPostToSap()
    {
        $postData = $this->request->getJSON();

        $id = null;
        $userId = null;
        $tdsCode = null;
        $tdsDescription = null;
        $postingDate = null;
        if (is_object($postData)) {
            $id = $postData->id ?? null;
            $userId = $postData->userid ?? null;
            $tdsCode = $postData->tds_code ?? null;
            $tdsDescription = $postData->tds_description ?? null;
            $postingDate = $postData->posting_date ?? null;
        } elseif (is_array($postData)) {
            $id = $postData['id'] ?? null;
            $userId = $postData['userid'] ?? null;
            $tdsCode = $postData['tds_code'] ?? null;
            $tdsDescription = $postData['tds_description'] ?? null;
            $postingDate = $postData['posting_date'] ?? null;
        }

        if (!$id || !$postingDate) {
            return $this->response->setJSON(['success' => false, 'message' => 'id and posting_date are required']);
        }

        $master = new FIPaymentModel();
        $res = $master->VerifyAndPostToSap($id, $userId, $tdsCode, $tdsDescription, $postingDate);

        return $this->response->setJSON($res);
    }

    public function GetFIPaymentById()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $id = null;
        if (is_object($postData)) {
            $id = $postData->id ?? $postData->{'$id'} ?? null;
        } elseif (is_array($postData)) {
            $id = $postData['id'] ?? $postData['$id'] ?? null;
        }

        $res = $master->GetFIPaymentById($id);

        return $this->sendSuccessResult($res);
    }

     public function GetDivisions($loginid=null)
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        if (is_null($loginid) && is_object($postData)) {
            $loginid = $postData->loginid ?? null;
        } elseif (is_null($loginid) && is_array($postData)) {
            $loginid = $postData['loginid'] ?? null;
        }

        $res = $master->GetDivisions($loginid);
        return $this->sendSuccessResult($res);
    }

    public function GetDepartment()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $master = new FIPaymentModel();

        $loginid = null;
        if (is_object($postData)) {
            $loginid = $postData->loginid ?? null;
        } elseif (is_array($postData)) {
            $loginid = $postData['loginid'] ?? null;
        }

        $res = $master->GetDepartment($loginid);
        return $this->sendSuccessResult($res);
    }

    public function GetInvoiceTypes()
    {
        $master = new FIPaymentModel();
        $res = $master->GetInvoiceTypes();
        return $this->sendSuccessResult($res);
    } 
     public function GetServiceCategories()
    {
        $master = new FIPaymentModel();
        $res = $master->GetServiceCategories();
        return $this->sendSuccessResult($res);
    } 
    public function GetPaymentTerms()
    {
        $master = new FIPaymentModel();
        $res = $master->GetPaymentTerms();
        return $this->sendSuccessResult($res);
    }

    public function GetExpenseTypes()
    {
        $master = new FIPaymentModel();
        $res = $master->GetExpenseTypes();
        return $this->sendSuccessResult($res);
    }

    public function GetExpenseTypesByUser()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $userId = null;
        if (is_object($postData)) {
            $userId = $postData->userid ?? null;
        } elseif (is_array($postData)) {
            $userId = $postData['userid'] ?? null;
        }

        $res = $master->GetExpenseTypesByUser($userId);
        return $this->sendSuccessResult($res);
    }

    public function SaveExpenseTypeMapping()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->SaveExpenseTypeMapping($postData);
        return $this->sendSuccessResult($res);
    }

    public function GetExpenseTypeMappingList()
    {
        $master = new FIPaymentModel();
        $res = $master->GetExpenseTypeMappingList();
        return $this->sendSuccessResult($res);
    }

    public function ToggleExpenseTypeMappingStatus()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->ToggleExpenseTypeMappingStatus($postData->id, $postData->status);
        return $this->sendSuccessResult($res);
    }

    public function DeleteExpenseTypeMapping()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->DeleteExpenseTypeMapping($postData->id, $postData->deleted_by);
        return $this->sendSuccessResult($res);
    }

    public function SaveCostCentreMapping()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $master = new FIPaymentModel();
        $res = $master->SaveCostCentreMapping($postData);
        return $this->response->setJSON($res);
    }

    public function GetCostCentreMappingList()
    {
        $master = new FIPaymentModel();
        $res = $master->GetCostCentreMappingList();
        return $this->sendSuccessResult($res);
    }

    public function GetCostCentresByUser()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $userId = null;
        if (is_object($postData)) {
            $userId = $postData->userid ?? null;
        } elseif (is_array($postData)) {
            $userId = $postData['userid'] ?? null;
        }

        $res = $master->GetCostCentresByUser($userId);
        return $this->sendSuccessResult($res);
    }

    public function ToggleCostCentreMappingStatus()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->ToggleCostCentreMappingStatus($postData->id, $postData->status);
        return $this->sendSuccessResult($res);
    }

    public function DeleteCostCentreMapping()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->DeleteCostCentreMapping($postData->id, $postData->deleted_by);
        return $this->sendSuccessResult($res);
    }

    public function GetDepartmentsByUser()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $userId = null;
        if (is_object($postData)) {
            $userId = $postData->userid ?? null;
        } elseif (is_array($postData)) {
            $userId = $postData['userid'] ?? null;
        }

        $res = $master->GetDepartmentsByUser($userId);
        return $this->sendSuccessResult($res);
    }

    public function GetEmpDepartments()
    {
        $master = new FIPaymentModel();
        $res = $master->GetEmpDepartments();
        return $this->sendSuccessResult($res);
    }

    public function SaveDepartmentMapping()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->SaveDepartmentMapping($postData);
        return $this->sendSuccessResult($res);
    }

    public function GetDepartmentMappingList()
    {
        $master = new FIPaymentModel();
        $res = $master->GetDepartmentMappingList();
        return $this->sendSuccessResult($res);
    }

    public function ToggleDepartmentMappingStatus()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->ToggleDepartmentMappingStatus($postData->id, $postData->status);
        return $this->sendSuccessResult($res);
    }

    public function DeleteDepartmentMapping()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();
        $res = $master->DeleteDepartmentMapping($postData->id, $postData->deleted_by);
        return $this->sendSuccessResult($res);
    }
    
    public function InsertFIPayment()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $data = $master->getLastFIPaymentTicNo();
        $lastUniqueNo = $data[0]['unique_payment_no'] ?? '';
        $paymentNo = VANumberHelper::VANumberHelper('FI', 'VINV', $lastUniqueNo);
        $res = $master->InsertFIPayment($postData, $paymentNo);

        return $this->response->setJSON($res);
    }

    public function UpdateFIPayment()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $id = is_object($postData) ? ($postData->payment_id ?? null) : ($postData['payment_id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'payment_id is required']);
        }

        $res = $master->UpdateFIPayment($id, $postData);

        return $this->response->setJSON($res);
    }

    public function UpdateGFADetails()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $id = is_object($postData) ? ($postData->payment_id ?? null) : ($postData['payment_id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'payment_id is required']);
        }

        $res = $master->UpdateGFADetails($id, $postData);

        return $this->response->setJSON($res);
    }

    public function UpdatePaymentVoucherDetails()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $id = is_object($postData) ? ($postData->payment_id ?? null) : ($postData['payment_id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'payment_id is required']);
        }

        $res = $master->UpdatePaymentVoucherDetails($id, $postData);

        return $this->response->setJSON($res);
    }

    public function GetUtrNumber()
    {
        $postData = $this->request->getJSON();
        $master = new FIPaymentModel();

        $id = is_object($postData) ? ($postData->id ?? null) : ($postData['id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'id is required']);
        }

        $res = $master->GetUtrNumberFromSap($id);

        return $this->response->setJSON($res);
    }

    public function GetFIPaymentReport()
    {
        $postData = $this->request->getJSON();

        $fromDate = null;
        $toDate = null;
        $search = '';
        if (is_object($postData)) {
            $fromDate = $postData->fromDate ?? null;
            $toDate = $postData->toDate ?? null;
            $search = $postData->searchTxt ?? '';
        } elseif (is_array($postData)) {
            $fromDate = $postData['fromDate'] ?? null;
            $toDate = $postData['toDate'] ?? null;
            $search = $postData['searchTxt'] ?? '';
        }

        if (!$fromDate || !$toDate) {
            return $this->response->setJSON(['success' => false, 'message' => 'fromDate and toDate are required']);
        }

        $master = new FIPaymentModel();
        $results = $master->GetFIPaymentReport($fromDate, $toDate, $search);

        return $this->response->setJSON([
            'success' => true,
            'results' => $results,
            'count'   => count($results),
        ]);
    }

}