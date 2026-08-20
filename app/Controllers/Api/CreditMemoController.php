<?php

namespace App\Controllers\Api;
use App\Helpers\VANumberHelper;
use App\Models\CreditMemoModel;

class CreditMemoController extends BaseApiController
{
    public function SearchFIRequests()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();
        $res = $master->SearchFIRequests($postData->query ?? '');
        return $this->sendSuccessResult($res);
    }

    public function GetFIRequestWithLines()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();

        $id = is_object($postData) ? ($postData->id ?? null) : ($postData['id'] ?? null);
        $res = $master->GetFIRequestWithLines($id);

        return $this->sendSuccessResult($res);
    }

    public function InsertCreditMemo()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();

        $data = $master->getLastCreditMemoTicNo();
        $lastUniqueNo = $data[0]['unique_credit_memo_no'] ?? '';
        $memoNo = VANumberHelper::VANumberHelper('CM', 'CRMO', $lastUniqueNo);

        $res = $master->InsertCreditMemo($postData, $memoNo);

        return $this->response->setJSON($res);
    }

    public function UpdateCreditMemo()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();

        $id = is_object($postData) ? ($postData->credit_memo_id ?? null) : ($postData['credit_memo_id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'credit_memo_id is required']);
        }

        $res = $master->UpdateCreditMemo($id, $postData);

        return $this->response->setJSON($res);
    }

    public function UpdateGFADetails()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();

        $id = is_object($postData) ? ($postData->credit_memo_id ?? null) : ($postData['credit_memo_id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'credit_memo_id is required']);
        }

        // Accounts Verification reuses this same save-line-items endpoint but
        // tags the audit log with its own action name instead of 'gfa_update'.
        $actionLabel = (is_object($postData) ? ($postData->action ?? null) : ($postData['action'] ?? null)) ?: 'gfa_update';
        $res = $master->UpdateGFADetails($id, $postData, $actionLabel);

        return $this->response->setJSON($res);
    }

    public function GetCreditMemoList()
    {
        $postData = $this->request->getJSON();

        $start = 0;
        $pageSize = 25;
        $search = '';
        $approvalStatus = 1;
        $userId = null;
        $reportingManagerId = null;
        $storeReportingId = null;
        $reportingAccountsId = null;
        if (is_object($postData)) {
            $start = $postData->startCount ?? 0;
            $pageSize = $postData->pageSize ?? 25;
            $search = $postData->searchTxt ?? '';
            $approvalStatus = $postData->approvalStatus ?? 1;
            $userId = $postData->userid ?? null;
            $reportingManagerId = $postData->reporting_manager_id ?? null;
            $storeReportingId = $postData->store_reporting_id ?? null;
            $reportingAccountsId = $postData->reporting_accounts_id ?? null;
        } elseif (is_array($postData)) {
            $start = $postData['startCount'] ?? 0;
            $pageSize = $postData['pageSize'] ?? 25;
            $search = $postData['searchTxt'] ?? '';
            $approvalStatus = $postData['approvalStatus'] ?? 1;
            $userId = $postData['userid'] ?? null;
            $reportingManagerId = $postData['reporting_manager_id'] ?? null;
            $storeReportingId = $postData['store_reporting_id'] ?? null;
            $reportingAccountsId = $postData['reporting_accounts_id'] ?? null;
        }

        $master = new CreditMemoModel();
        $data = $master->GetCreditMemoList($start, $pageSize, $search, $approvalStatus, $userId, $reportingManagerId, $storeReportingId, $reportingAccountsId);

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

        $master = new CreditMemoModel();
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

        $master = new CreditMemoModel();
        $res = $master->VerifyAndPostToSap($id, $userId, $tdsCode, $tdsDescription, $postingDate);

        return $this->response->setJSON($res);
    }

    public function SimulatePosting()
    {
        $postData = $this->request->getJSON();

        $id = null;
        $tdsCode = null;
        $tdsDescription = null;
        $postingDate = null;
        if (is_object($postData)) {
            $id = $postData->id ?? null;
            $tdsCode = $postData->tds_code ?? null;
            $tdsDescription = $postData->tds_description ?? null;
            $postingDate = $postData->posting_date ?? null;
        } elseif (is_array($postData)) {
            $id = $postData['id'] ?? null;
            $tdsCode = $postData['tds_code'] ?? null;
            $tdsDescription = $postData['tds_description'] ?? null;
            $postingDate = $postData['posting_date'] ?? null;
        }

        if (!$id || !$postingDate) {
            return $this->response->setJSON(['success' => false, 'message' => 'id and posting_date are required']);
        }

        $master = new CreditMemoModel();
        $res = $master->SimulatePosting($id, $tdsCode, $tdsDescription, $postingDate);

        return $this->response->setJSON($res);
    }

    public function GetCreditMemoById()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();

        $id = null;
        if (is_object($postData)) {
            $id = $postData->id ?? null;
        } elseif (is_array($postData)) {
            $id = $postData['id'] ?? null;
        }

        $res = $master->GetCreditMemoById($id);

        return $this->sendSuccessResult($res);
    }

    public function GetUtrNumber()
    {
        $postData = $this->request->getJSON();
        $master = new CreditMemoModel();

        $id = is_object($postData) ? ($postData->id ?? null) : ($postData['id'] ?? null);
        if (!$id) {
            return $this->response->setJSON(['success' => false, 'message' => 'id is required']);
        }

        $res = $master->GetUtrNumberFromSap($id);

        return $this->response->setJSON($res);
    }

    public function GetCreditMemoReport()
    {
        $postData = $this->request->getJSON();

        $fromDate = null;
        $toDate = null;
        $search = '';
        $userId = null;
        if (is_object($postData)) {
            $fromDate = $postData->fromDate ?? null;
            $toDate = $postData->toDate ?? null;
            $search = $postData->searchTxt ?? '';
            $userId = $postData->userid ?? null;
        } elseif (is_array($postData)) {
            $fromDate = $postData['fromDate'] ?? null;
            $toDate = $postData['toDate'] ?? null;
            $search = $postData['searchTxt'] ?? '';
            $userId = $postData['userid'] ?? null;
        }

        if (!$fromDate || !$toDate) {
            return $this->response->setJSON(['success' => false, 'message' => 'fromDate and toDate are required']);
        }

        $master = new CreditMemoModel();
        $results = $master->GetCreditMemoReport($fromDate, $toDate, $search, $userId);

        return $this->response->setJSON([
            'success' => true,
            'results' => $results,
            'count'   => count($results),
        ]);
    }
}
