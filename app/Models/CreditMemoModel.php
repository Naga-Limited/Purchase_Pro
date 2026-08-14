<?php

namespace App\Models;

use CodeIgniter\Model;
use App\Helpers\SapUrlHelper;

class CreditMemoModel extends Model
{
    // ─── Existing Vendor Invoice requests, searched for the "Related to FI"
    // Request No lookup on the Credit Memo Parking screen. ─────────────────
    public function SearchFIRequests($query)
    {
        $builder = $this->db->table('fi_payment_header');
        $builder->select("
            payment_id, unique_payment_no, vendor_code, vendor_name,
            invoice_number, invoice_date, division, invoice_type,
            total_amount, sap_document_no, sap_posting_date
        ");
        $builder->where('approval_status', 5);
        $builder->groupStart();
        $builder->like('unique_payment_no', $query);
        $builder->orLike('vendor_name', $query);
        $builder->orLike('vendor_code', $query);
        $builder->orLike('invoice_number', $query);
        $builder->groupEnd();
        $builder->orderBy('payment_id', 'DESC');
        $builder->limit(25);

        return $builder->get()->getResultArray();
    }

    // Pulls an existing Vendor Invoice request's header + line items, to
    // hydrate the Credit Memo Parking form when a Request is picked.
    public function GetFIRequestWithLines($paymentId)
    {
        $fiPaymentModel = new FIPaymentModel();
        return $fiPaymentModel->GetFIPaymentById($paymentId);
    }

    public function getLastCreditMemoTicNo()
    {
        $builder = $this->db->table("fi_credit_memo_header");
        $builder = $builder->select("credit_memo_id, unique_credit_memo_no");
        $builder = $builder->orderBy('credit_memo_id', 'DESC')
            ->limit(1)
            ->get()
            ->getResultArray();

        return $builder;
    }

    // Financial year runs April-March: Apr-Dec belong to the current calendar
    // year, Jan-Mar belong to the previous one — same rule
    // FIPaymentModel::GetBudgetFromSap already uses for SAP's gjahr/period.
    private function GetCurrentFinancialYearRange()
    {
        $currentYear  = (int) date('Y');
        $currentMonth = (int) date('n');
        $gjahr = $currentMonth >= 4 ? $currentYear : $currentYear - 1;
        return [$gjahr . '-04-01', ($gjahr + 1) . '-03-31'];
    }

    // Same Memo No + Vendor Code already submitted this financial year —
    // blocks a fresh NonPoCreditMemoParking.js submission, regardless of
    // that earlier request's approval_status.
    public function CheckDuplicateMemo($vendorCode, $memoNo)
    {
        if (empty($vendorCode) || empty($memoNo)) {
            return false;
        }
        [$fyStart, $fyEnd] = $this->GetCurrentFinancialYearRange();

        return $this->db->table('fi_credit_memo_header')
            ->where('vendor_code', $vendorCode)
            ->where('memo_no', $memoNo)
            ->where('DATE(created_at) >=', $fyStart)
            ->where('DATE(created_at) <=', $fyEnd)
            ->countAllResults() > 0;
    }

    public function InsertCreditMemo($postData, $memoNo)
    {
        if ($this->CheckDuplicateMemo($postData->vendor_code ?? null, $postData->memo_no ?? null)) {
            return [
                'success' => false,
                'message' => 'A credit memo with this Memo No and Vendor Code has already been submitted for the current financial year.',
            ];
        }

        $this->db->transStart();

        $headerData = [
            'unique_credit_memo_no' => $memoNo,
            'record_type'           => $postData->record_type ?? 'non_related_fi',
            'request_payment_id'    => $postData->request_payment_id ?? null,
            'fi_doc_no'             => $postData->fi_doc_no ?? null,
            'fi_doc_date'           => $postData->fi_doc_date ?? null,
            'invoice_type'          => $postData->invoice_type ?? null,
            'vendor_code'           => $postData->vendor_code ?? null,
            'vendor_name'           => $postData->vendor_name ?? null,
            'division'              => $postData->division ?? null,
            'reason'                => $postData->reason ?? null,
            'memo_no'               => $postData->memo_no ?? null,
            'memo_date'             => $postData->memo_date ?? null,
            'amount'                => $postData->amount ?? 0,
            'bank_account_no'       => $postData->bank_ac_no ?? null,
            'bank_ifsc_code'        => $postData->bank_ifsc_code ?? null,
            'house_bank_id'         => $postData->house_bank_id ?? null,
            'house_bank_ac_no'      => $postData->house_bank_ac_no ?? null,
            'posting_date'          => $postData->posting_date ?? null,
            'account_no'            => $postData->account_no ?? null,
            'business_area'         => $postData->business_area ?? null,
            'tds_code'              => $postData->tds_code ?? null,
            'tds_description'       => $postData->tds_description ?? null,
            'invoice_copy'          => $postData->Invoicecopy ?? null,
            'back_paper'            => $postData->Attachment ?? null,
            'total_amount'          => $postData->amount ?? 0,
            'created_by'            => $postData->created_by ?? null,
            'approval_status'       => 1,
        ];

        $this->db->table('fi_credit_memo_header')->insert($headerData);
        $creditMemoId = $this->db->insertID();

        foreach ($postData->line_items ?? [] as $item) {
            $this->db->table('fi_credit_memo_line_items')->insert([
                'credit_memo_id'             => $creditMemoId,
                'expenses_type'             => $item->expenses_type ?? null,
                'gl_code'                   => $item->gl_code ?? null,
                'gl_description'            => $item->gl_description ?? null,
                'budget'                    => ($item->budget ?? '') !== '' ? $item->budget : null,
                'amount'                    => $item->amount ?? 0,
                'deduction_amount'          => ($item->deduction_amount ?? '') !== '' ? $item->deduction_amount : 0,
                'cost_center'               => $item->cost_center ?? null,
                'cost_center_desc'          => $item->cost_center_desc ?? null,
                'tax_type'                  => $item->tax_type ?? null,
                'tax_code'                  => $item->tax_code ?? null,
                'tax_description'           => $item->tax_description ?? null,
                'base_amount'               => $item->base_amount ?? null,
                'cgst_amount'               => $item->cgst_amount ?? null,
                'sgst_amount'               => $item->sgst_amount ?? null,
                'igst_amount'               => $item->igst_amount ?? null,
                'item_text'                 => $item->text ?? null,
                'profit_center'             => $item->profit_center ?? null,
                'profit_center_description' => $item->profit_center_desc ?? null,
                'hsn_sac'                   => $item->hsn_sac ?? null,
            ]);
        }

        $this->db->transComplete();

        if ($this->db->transStatus() === false) {
            return ['success' => false, 'message' => 'Failed to save Credit Memo.'];
        }

        return [
            'success'        => true,
            'message'        => 'Credit Memo saved successfully.',
            'credit_memo_id' => $creditMemoId,
            'memo_no'        => $memoNo,
        ];
    }

    // Edits a rejected Credit Memo and resubmits it for Manager Approval
    // (approval_status back to 1, clearing the prior rejection markers).
    public function UpdateCreditMemo($id, $postData)
    {
        $this->db->transStart();

        $headerData = [
            'record_type'           => $postData->record_type ?? 'non_related_fi',
            'request_payment_id'    => $postData->request_payment_id ?? null,
            'fi_doc_no'             => $postData->fi_doc_no ?? null,
            'fi_doc_date'           => $postData->fi_doc_date ?? null,
            'invoice_type'          => $postData->invoice_type ?? null,
            'vendor_code'           => $postData->vendor_code ?? null,
            'vendor_name'           => $postData->vendor_name ?? null,
            'division'              => $postData->division ?? null,
            'reason'                => $postData->reason ?? null,
            'memo_no'               => $postData->memo_no ?? null,
            'memo_date'             => $postData->memo_date ?? null,
            'amount'                => $postData->amount ?? 0,
            'bank_account_no'       => $postData->bank_ac_no ?? null,
            'bank_ifsc_code'        => $postData->bank_ifsc_code ?? null,
            'house_bank_id'         => $postData->house_bank_id ?? null,
            'house_bank_ac_no'      => $postData->house_bank_ac_no ?? null,
            'posting_date'          => $postData->posting_date ?? null,
            'account_no'            => $postData->account_no ?? null,
            'business_area'         => $postData->business_area ?? null,
            'invoice_copy'          => $postData->Invoicecopy ?? null,
            'back_paper'            => $postData->Attachment ?? null,
            'total_amount'          => $postData->amount ?? 0,
            'approval_status'       => 1,
            'rejected_by'           => null,
            'rejected_at'           => null,
            'rejection_remarks'     => null,
        ];

        $this->db->table('fi_credit_memo_header')->where('credit_memo_id', $id)->update($headerData);

        $this->db->table('fi_credit_memo_line_items')->where('credit_memo_id', $id)->delete();
        foreach ($postData->line_items ?? [] as $item) {
            $this->db->table('fi_credit_memo_line_items')->insert([
                'credit_memo_id'            => $id,
                'expenses_type'             => $item->expenses_type ?? null,
                'gl_code'                   => $item->gl_code ?? null,
                'gl_description'            => $item->gl_description ?? null,
                'budget'                    => ($item->budget ?? '') !== '' ? $item->budget : null,
                'amount'                    => $item->amount ?? 0,
                'deduction_amount'          => ($item->deduction_amount ?? '') !== '' ? $item->deduction_amount : 0,
                'cost_center'               => $item->cost_center ?? null,
                'cost_center_desc'          => $item->cost_center_desc ?? null,
                'tax_type'                  => $item->tax_type ?? null,
                'tax_code'                  => $item->tax_code ?? null,
                'tax_description'           => $item->tax_description ?? null,
                'base_amount'               => $item->base_amount ?? null,
                'cgst_amount'               => $item->cgst_amount ?? null,
                'sgst_amount'               => $item->sgst_amount ?? null,
                'igst_amount'               => $item->igst_amount ?? null,
                'item_text'                 => $item->text ?? null,
                'profit_center'             => $item->profit_center ?? null,
                'profit_center_description' => $item->profit_center_desc ?? null,
                'hsn_sac'                   => $item->hsn_sac ?? null,
            ]);
        }

        $this->db->transComplete();

        if ($this->db->transStatus() === false) {
            return ['success' => false, 'message' => 'Failed to update Credit Memo.'];
        }

        return [
            'success'        => true,
            'message'        => 'Credit Memo resubmitted for approval.',
            'credit_memo_id' => $id,
        ];
    }

    // Full-data report across every approval_status (unlike GetCreditMemoList,
    // which is scoped to one stage's queue), filtered by the header's
    // created_at (the one date field always populated regardless of stage).
    // fi_credit_memo_header is the primary (FROM) table — one row per
    // request, request-level totals rather than per-line-item granularity.
    public function GetCreditMemoReport($fromDate, $toDate, $search = '', $userId = null)
    {
        $builder = $this->db->table('fi_credit_memo_header');
        $builder->select("
            fi_credit_memo_header.credit_memo_id,
            fi_credit_memo_header.unique_credit_memo_no,
            fi_credit_memo_header.created_at,
            user_info.FIRST_NAME as requested_by,
            fi_credit_memo_header.record_type,
            fi_credit_memo_header.fi_doc_no,
            fi_credit_memo_header.fi_doc_date,
            invoice_type_def.definitionsName as invoice_type_name,
            fi_credit_memo_header.vendor_code,
            fi_credit_memo_header.vendor_name,
            fi_credit_memo_header.division,
            (SELECT GROUP_CONCAT(DISTINCT li.cost_center SEPARATOR ', ')
                FROM fi_credit_memo_line_items li
                WHERE li.credit_memo_id = fi_credit_memo_header.credit_memo_id) as cost_center,
            fi_credit_memo_header.reason,
            fi_credit_memo_header.memo_no,
            fi_credit_memo_header.memo_date,
            fi_credit_memo_header.posting_date,
            fi_credit_memo_header.amount,
            fi_credit_memo_header.total_amount,
            fi_payment_header.total_amount as original_invoice_total_amount,
            fi_credit_memo_header.account_no,
            fi_credit_memo_header.business_area,
            fi_credit_memo_header.bank_account_no,
            fi_credit_memo_header.bank_ifsc_code,
            fi_credit_memo_header.house_bank_id,
            fi_credit_memo_header.house_bank_ac_no,
            fi_credit_memo_header.tds_code,
            fi_credit_memo_header.tds_description,
            fi_credit_memo_header.sap_posting_date,
            fi_credit_memo_header.sap_document_no,
            fi_credit_memo_header.payment_voucher_no,
            fi_credit_memo_header.utr_number,
            fi_credit_memo_header.approval_status,
            CASE fi_credit_memo_header.approval_status
                WHEN 1 THEN 'Pending Manager Approval'
                WHEN 2 THEN 'Approved by Manager'
                WHEN 4 THEN 'Store Acknowledged'
                WHEN 5 THEN 'GFA Verified (Completed)'
                WHEN 10 THEN 'Rejected'
                ELSE 'Unknown'
            END as approval_status_label,
            fi_credit_memo_header.mg_approved_at,
            mg_approved_by_info.FIRST_NAME as mg_approved_by_name,
            fi_credit_memo_header.stores_approved_at,
            stores_approved_by_info.FIRST_NAME as stores_approved_by_name,
            fi_credit_memo_header.gfa_posted_at,
            gfa_posted_by_info.FIRST_NAME as gfa_posted_by_name,
            fi_credit_memo_header.rejected_at,
            rejected_by_info.FIRST_NAME as rejected_by_name,
            fi_credit_memo_header.rejection_remarks,
            fi_credit_memo_header.invoice_copy,
            fi_credit_memo_header.back_paper
        ");
        $builder->join('user_info', 'user_info.UI_ID = fi_credit_memo_header.created_by', 'left');
        $builder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_credit_memo_header.invoice_type', 'left');
        $builder->join('fi_payment_header', 'fi_payment_header.payment_id = fi_credit_memo_header.request_payment_id', 'left');
        $builder->join('user_info as mg_approved_by_info', 'mg_approved_by_info.UI_ID = fi_credit_memo_header.mg_approved_by', 'left');
        $builder->join('user_info as stores_approved_by_info', 'stores_approved_by_info.UI_ID = fi_credit_memo_header.stores_approved_by', 'left');
        $builder->join('user_info as gfa_posted_by_info', 'gfa_posted_by_info.UI_ID = fi_credit_memo_header.gfa_posted_by', 'left');
        $builder->join('user_info as rejected_by_info', 'rejected_by_info.UI_ID = fi_credit_memo_header.rejected_by', 'left');
        $builder->where('DATE(fi_credit_memo_header.created_at) >=', $fromDate);
        $builder->where('DATE(fi_credit_memo_header.created_at) <=', $toDate);

        // Scope the report to whatever this user is tied to via
        // user_cost_centre_mapping — either as the mapping's own user (the
        // requester the cost centre belongs to) or as one of its Reporting
        // Manager/Store Reporting/Reporting GFA approvers (all three can now
        // name several people, comma-separated — FIND_IN_SET matches any of
        // them). UserID 1 is exempt and always sees every request.
        if (!empty($userId) && (int) $userId !== 1) {
            $userIdEscaped = $this->db->escape($userId);
            $builder->whereIn('credit_memo_id', function ($sub) use ($userId, $userIdEscaped) {
                return $sub->select('fi_credit_memo_line_items.credit_memo_id')->from('fi_credit_memo_line_items')
                    ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_credit_memo_line_items.cost_center_desc')
                    ->groupStart()
                        ->where('user_cost_centre_mapping.user_id', $userId)
                        ->orWhere("FIND_IN_SET({$userIdEscaped}, user_cost_centre_mapping.reporting_manager_id) >", 0, false)
                        ->orWhere("FIND_IN_SET({$userIdEscaped}, user_cost_centre_mapping.store_reporting_id) >", 0, false)
                        ->orWhere("FIND_IN_SET({$userIdEscaped}, user_cost_centre_mapping.reporting_gfa_id) >", 0, false)
                    ->groupEnd()
                    ->where('user_cost_centre_mapping.RecStatus', 1)
                    ->where('user_cost_centre_mapping.deleted_at', null);
            });
        }

        if (!empty($search)) {
            $builder->groupStart();
            $builder->like('fi_credit_memo_header.vendor_name', $search);
            $builder->orLike('fi_credit_memo_header.memo_no', $search);
            $builder->orLike('fi_credit_memo_header.reason', $search);
            $builder->orLike('fi_credit_memo_header.division', $search);
            $builder->groupEnd();
        }

        $builder->orderBy('fi_credit_memo_header.created_at', 'DESC');

        return $builder->get()->getResultArray();
    }

    // approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager
    // (waiting on Store Acknowledge), 4 = Store Acknowledged (waiting on GFA
    // Verification), 5 = GFA Verified (Completed), 10 = Rejected
    public function GetCreditMemoList($start = 0, $pageSize = 25, $search = '', $approvalStatus = 1, $userId = null, $reportingManagerId = null, $storeReportingId = null)
    {
        $builder = $this->db->table('fi_credit_memo_header');
        $builder->where('approval_status', $approvalStatus);

        if (!empty($userId)) {
            $builder->where('created_by', $userId);
        }

        // Restrict to requests whose line-item Cost Centre (cost_center_desc
        // -> user_cost_centre_mapping) names the caller as its Reporting
        // Manager, so the Manager Approval list only shows each approver
        // their own queue. The cost_centre_code/profit_centre live on that
        // same mapping row and on the line item, not on the header or on the
        // requester's own account, so the check has to go through the line
        // items rather than fi_credit_memo_header.created_by.
        if (!empty($reportingManagerId)) {
            // reporting_manager_id can now name several people (comma-separated,
            // same convention as loading_unloading_payment.unload_id) — match
            // if the caller's id appears anywhere in that list, not just an
            // exact single-value equals.
            $reportingManagerIdEscaped = $this->db->escape($reportingManagerId);
            $builder->whereIn('credit_memo_id', function ($sub) use ($reportingManagerIdEscaped) {
                return $sub->select('fi_credit_memo_line_items.credit_memo_id')->from('fi_credit_memo_line_items')
                    ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_credit_memo_line_items.cost_center_desc')
                    ->where("FIND_IN_SET({$reportingManagerIdEscaped}, user_cost_centre_mapping.reporting_manager_id) >", 0, false)
                    ->where('user_cost_centre_mapping.RecStatus', 1)
                    ->where('user_cost_centre_mapping.deleted_at', null);
            });
        }
        if (!empty($storeReportingId)) {
            $storeReportingIdEscaped = $this->db->escape($storeReportingId);
            $builder->whereIn('created_by', function ($sub) use ($storeReportingIdEscaped) {
                return $sub->select('user_id')->from('user_cost_centre_mapping')
                    ->where("FIND_IN_SET({$storeReportingIdEscaped}, store_reporting_id) >", 0, false)
                    ->where('RecStatus', 1)
                    ->where('deleted_at', null);
            });
        }

        if (!empty($search)) {
            $builder->groupStart();
            $builder->like('vendor_name', $search);
            $builder->orLike('memo_no', $search);
            $builder->orLike('reason', $search);
            $builder->orLike('division', $search);
            $builder->groupEnd();
        }

        $total = $builder->countAllResults(false);

        $builder->select("
            credit_memo_id,
            unique_credit_memo_no,
            vendor_name,
            reason,
            division,
            amount,
            memo_date,
            record_type,
            approval_status,
            invoice_copy,
            back_paper,
            payment_voucher_no,
            utr_number,
            created_at,
            updated_at,
            (SELECT GROUP_CONCAT(DISTINCT li.cost_center SEPARATOR ', ')
                FROM fi_credit_memo_line_items li
                WHERE li.credit_memo_id = fi_credit_memo_header.credit_memo_id) as cost_center
        ");
        $builder->orderBy('created_at', 'DESC');
        $builder->limit((int) $pageSize, (int) $start);

        $results = $builder->get()->getResultArray();

        return ['results' => $results, 'count' => $total];
    }

    // Pending-approval rows for the reminder cron, one row per (request,
    // recipient) pair. Joins through the line items' Cost Centre Mapping
    // (not created_by) — same reasoning as FIPaymentModel's equivalent: the
    // approver for a request is whoever the request's own cost centre names,
    // not a role tied to the requester's account. $excludeStatuses flips
    // $statuses from an allow-list (manager / store, one exact status) to a
    // block-list (GFA, everything still in flight except Completed/Rejected).
    private function GetPendingApprovalsForRole($mappingField, array $statuses, $excludeStatuses = false)
    {
        $builder = $this->db->table('fi_credit_memo_header');
        $builder->select("
            fi_credit_memo_header.credit_memo_id,
            fi_credit_memo_header.unique_credit_memo_no as request_no,
            fi_credit_memo_header.vendor_name,
            fi_credit_memo_header.division,
            fi_credit_memo_header.memo_no as doc_no,
            fi_credit_memo_header.total_amount,
            fi_credit_memo_header.approval_status,
            TIMESTAMPDIFF(SECOND, fi_credit_memo_header.created_at, NOW()) as pending_seconds,
            recipient_info.UI_ID as recipient_id,
            recipient_info.MAIL_ID as recipient_mail,
            recipient_info.FIRST_NAME as recipient_name
        ");
        $builder->join('fi_credit_memo_line_items', 'fi_credit_memo_line_items.credit_memo_id = fi_credit_memo_header.credit_memo_id', 'inner');
        $builder->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_credit_memo_line_items.cost_center_desc', 'inner');
        // {$mappingField} can now name several people (comma-separated) —
        // FIND_IN_SET joins one row per person still named in that list,
        // instead of an exact match assuming a single id.
        $builder->join('user_info as recipient_info', "FIND_IN_SET(recipient_info.UI_ID, user_cost_centre_mapping.{$mappingField})", 'left');
        $builder->where('user_cost_centre_mapping.RecStatus', 1);
        $builder->where('user_cost_centre_mapping.deleted_at', null);
        if ($excludeStatuses) {
            $builder->whereNotIn('fi_credit_memo_header.approval_status', $statuses);
        } else {
            $builder->whereIn('fi_credit_memo_header.approval_status', $statuses);
        }
        // Group by the resolved recipient, not the raw (possibly multi-value)
        // mapping field — otherwise several distinct recipients sharing the
        // same mapping row would collapse into one output row.
        $builder->groupBy("fi_credit_memo_header.credit_memo_id, recipient_info.UI_ID");

        return $builder->get()->getResultArray();
    }

    public function GetPendingForReportingManager()
    {
        return $this->GetPendingApprovalsForRole('reporting_manager_id', [1]);
    }

    public function GetPendingForStoreReporting()
    {
        return $this->GetPendingApprovalsForRole('store_reporting_id', [2]);
    }

    // GFA contact gets notified for anything still in flight (1, 2, 4) —
    // not just the GFA-specific stage (4) — per business rule: everything
    // except Completed (5) and Rejected (10).
    public function GetPendingForReportingGfa()
    {
        return $this->GetPendingApprovalsForRole('reporting_gfa_id', [5, 10], true);
    }

    public function UpdateApprovalStatus($id, $status, $userId, $remarks = null, $tdsCode = null, $tdsDescription = null)
    {
        $data = ['approval_status' => $status];

        if ((int) $status === 2) {
            $data['mg_approved_by'] = $userId;
            $data['mg_approved_at'] = date('Y-m-d H:i:s');
        } elseif ((int) $status === 4) {
            $data['stores_approved_by'] = $userId;
            $data['stores_approved_at'] = date('Y-m-d H:i:s');
        } elseif ((int) $status === 5) {
            $data['gfa_posted_by'] = $userId;
            $data['gfa_posted_at'] = date('Y-m-d H:i:s');
            if ($tdsCode !== null) {
                $data['tds_code'] = $tdsCode;
            }
            if ($tdsDescription !== null) {
                $data['tds_description'] = $tdsDescription;
            }
        } elseif ((int) $status === 10) {
            $data['rejected_by'] = $userId;
            $data['rejected_at'] = date('Y-m-d H:i:s');
            $data['rejection_remarks'] = $remarks;
        }

        $this->db->table('fi_credit_memo_header')->where('credit_memo_id', $id)->update($data);

        if ((int) $status === 10) {
            $this->SendRejectionEmail($id, $remarks);
        }

        return ['success' => true, 'message' => (int) $status === 10 ? 'Credit Memo rejected.' : 'Credit Memo approved.'];
    }

    // Notifies the original requester (user_info.MAIL_ID, via created_by) that
    // their Credit Memo request was rejected, and what to fix per the
    // rejection remarks, so they can correct and resubmit it.
    private function SendRejectionEmail($id, $remarks)
    {
        $header = $this->db->table('fi_credit_memo_header')
            ->select('fi_credit_memo_header.unique_credit_memo_no, fi_credit_memo_header.vendor_name, fi_credit_memo_header.memo_no, fi_credit_memo_header.total_amount, user_info.MAIL_ID, user_info.FIRST_NAME')
            ->join('user_info', 'user_info.UI_ID = fi_credit_memo_header.created_by', 'left')
            ->where('fi_credit_memo_header.credit_memo_id', $id)
            ->get()->getRowArray();

        if (empty($header['MAIL_ID'])) {
            return;
        }

        $subject = 'Credit Memo Request Rejected - ' . esc($header['unique_credit_memo_no']);

        $message = '<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Mobile Styles */
                @media only screen and (max-width: 600px) {
                    table {
                        width: 100% !important;
                    }
                }
            </style>
            </head>
            <body style="font-family: Helvetica, Arial, sans-serif;">

            <div style="max-width: 600px; margin: 0 auto;">
            <a href="" style="font-size: 1.4em; color: #1656f7; text-decoration: none; font-weight: 600;">Welcome to Naga Limited</a>
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
                </div>

                <p style="font-size: 1.1em;">Dear ' . esc($header['FIRST_NAME']) . ',</p>
                <p>Your Credit Memo request has been <strong style="color:#d9534f">rejected</strong>. Please review the remarks below, make the necessary changes and resubmit the request.</p>

                <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">

                <thead>
                <tr>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Request No</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Vendor Name</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Memo No</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Amount</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Rejection Remarks</th>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['unique_credit_memo_no']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['vendor_name']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['memo_no']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['total_amount']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($remarks) . '</td>
            </tr>
            </tbody></table>
                <br/>
                <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p></div>
                </body>
                </html>';

        $email = \Config\Services::email();
        $email->setFrom('noreply@nagamills.com', 'Credit Memo');
        $email->setTo($header['MAIL_ID']);
        $email->setSubject($subject);
        $email->setMessage($message);

        if (!$email->send()) {
            log_message('error', print_r($email->printDebugger(['headers', 'subject', 'body']), true));
        }
    }

    // GFA re-verification: persists any line item edits made on the
    // reconciliation table (Amount, Tax Code, Cost Centre, and the
    // Base/CGST/SGST/IGST split recalculated from them) before
    // VerifyAndPostToSap reads the line items back out for the SAP post.
    public function UpdateGFADetails($id, $postData)
    {
        $this->db->transStart();

        foreach ($postData->line_items ?? [] as $item) {
            $data = [
                'expenses_type'             => $item->expenses_type ?? null,
                'gl_code'                   => $item->gl_code ?? null,
                'gl_description'            => $item->gl_description ?? null,
                'budget'                    => ($item->budget ?? '') !== '' ? $item->budget : null,
                'amount'                    => $item->amount ?? 0,
                'deduction_amount'          => ($item->deduction_amount ?? '') !== '' ? $item->deduction_amount : 0,
                'cost_center'               => $item->cost_center ?? null,
                'cost_center_desc'          => $item->cost_center_desc ?? null,
                'tax_type'                  => $item->tax_type ?? null,
                'tax_code'                  => $item->tax_code ?? null,
                'tax_description'           => $item->tax_description ?? null,
                'base_amount'               => $item->base_amount ?? null,
                'cgst_amount'               => $item->cgst_amount ?? null,
                'sgst_amount'               => $item->sgst_amount ?? null,
                'igst_amount'               => $item->igst_amount ?? null,
                'item_text'                 => $item->text ?? null,
                'profit_center'             => $item->profit_center ?? null,
                'profit_center_description' => $item->profit_center_desc ?? null,
                'hsn_sac'                   => $item->hsn_sac ?? null,
            ];
            if (!empty($item->line_id)) {
                $this->db->table('fi_credit_memo_line_items')
                    ->where('line_id', $item->line_id)->where('credit_memo_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_credit_memo_line_items')->insert($data + ['credit_memo_id' => $id]);
            }
        }

        $this->db->transComplete();

        if ($this->db->transStatus() === false) {
            return ['success' => false, 'message' => 'Failed to update line items.'];
        }

        return ['success' => true, 'message' => 'Line items updated.', 'credit_memo_id' => $id];
    }

    // Rolls a GFA-Verified (approval_status = 5) Credit Memo back to Store
    // Acknowledged (4) when SAP reports its sap_document_no as reversed, and
    // records SAP's reversal document number (REV_NO) alongside it — Credit
    // Memo counterpart of FIPaymentModel::RevertReversedDocuments, sharing
    // the same [DOC_NO => REV_NO] map from
    // FIPaymentModel::GetReversedDocumentsFromSap (one SAP call covers both
    // header tables). Only rows still at 5 are touched.
    public function RevertReversedDocuments(array $reversals)
    {
        if (empty($reversals)) {
            return 0;
        }

        $affected = 0;
        foreach ($reversals as $docNo => $revNo) {
            $this->db->table('fi_credit_memo_header')
                ->where('sap_document_no', $docNo)
                ->where('approval_status', 5)
                ->update([
                    'approval_status' => 4,
                    'reversal_doc_no' => $revNo,
                ]);
            $affected += $this->db->affectedRows();
        }

        return $affected;
    }

    // GFA Verification approve step: posts the credit memo to SAP via the
    // documented ZZFI_DEDUCT contract and, only on a successful SAP response,
    // marks the request GFA Verified.
    public function VerifyAndPostToSap($id, $userId, $tdsCode, $tdsDescription, $postingDate)
    {
        $header = $this->db->table('fi_credit_memo_header')->where('credit_memo_id', $id)->get()->getRowArray();
        if (!$header) {
            return ['success' => false, 'message' => 'Credit Memo not found.'];
        }

        $lineItems = $this->db->table('fi_credit_memo_line_items')->where('credit_memo_id', $id)->get()->getResultArray();

        $sapLines = [];
        $lineNum  = 1;
        foreach ($lineItems as $item) {
            // Related-to-FI lines carry their own deduction_amount (the portion
            // of this line actually being deducted against the original
            // invoice); Non Related to FI lines never populate it, so fall
            // back to the line's full amount — unchanged behaviour for them.
            $deductionAmt = !empty($item['deduction_amount']) ? $item['deduction_amount'] : $item['amount'];
            $sapLines[] = [
                "ZZLINE"     => (string) $lineNum,
                "Gl_account" => $item['gl_code'],
                "amount"     => $deductionAmt,
                "costcenter" => $item['cost_center'],
                "text"       => $header['reason'],
                "hsn"        => $item['hsn_sac'],
                "tax_type"   => $item['tax_code'],
            ];
            $lineNum++;
        }

        $postingDateFmt = date('Y-m-d', strtotime($postingDate));
        $sapPostingDate = date('Ymd', strtotime($postingDate));
        $invoiceDateFmt = !empty($header['memo_date']) ? date('Ymd', strtotime($header['memo_date'])) : '';

        $SAP_DATA = [
            "vendor_code"  => $header['vendor_code'],
            "invoice_date" => $invoiceDateFmt,
            "posting_date" => $sapPostingDate,
            "totalamount"  => $header['total_amount'],
            "tds_status"   => !empty($tdsCode) ? "YES" : "NO",
            "tds_value"    => $tdsCode,
            "ref_doc"      => $header['unique_credit_memo_no'],
            "headertext"   => $header['memo_no'],
            "BUS_PLACE"    => $header['business_area'],
            "house_bank"   => $header['house_bank_id'],
            "acct_id"      => $header['house_bank_ac_no'],
            "rev_doc"      => $header['reversal_doc_no'],
            "LINE"         => $sapLines,
        ];
        

        $urlPath = "ZZGP_API/ZZFI_DEDUCT/fideduct?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$SAP_DATA]));

        $status = is_array($res) && isset($res[0]) ? ($res[0]->STATUS ?? null) : null;

        if ($status == 1) {
            // SAP names the field DEDUCT_DOCUMENT_NO on a fresh post, but
            // DOCUMENT_NO on the "already posted" response (STATUS still 1) —
            // fall back so that case's message includes the document number too.
            $docNo = $res[0]->DEDUCT_DOCUMENT_NO ?? $res[0]->DOCUMENT_NO ?? '';

            $this->db->table('fi_credit_memo_header')->where('credit_memo_id', $id)->update([
                'approval_status'  => 5,
                'gfa_posted_by'    => $userId,
                'gfa_posted_at'    => date('Y-m-d H:i:s'),
                'tds_code'         => $tdsCode,
                'tds_description'  => $tdsDescription,
                'sap_posting_date' => $postingDateFmt,
                'sap_document_no'  => $docNo ?: null,
            ]);

            $messages = array_filter([
                trim($res[0]->MESSAGE ?? ''),
                !empty($docNo) ? 'Document No: ' . $docNo : '',
            ]);

            return [
                'success'      => true,
                'message'      => !empty($messages) ? implode(' | ', $messages) : 'Verified and posted to SAP successfully.',
                'sap_response' => $res,
            ];
        }

        $errorMessage = is_array($res) && isset($res[0]) && isset($res[0]->MESSAGE) ? $res[0]->MESSAGE : 'SAP posting failed.';
        return ['success' => false, 'message' => $errorMessage, 'sap_response' => $res];
    }

    public function GetCreditMemoById($id)
    {
        $builder = $this->db->table('fi_credit_memo_header');
        $builder->select("
            fi_credit_memo_header.*,
            fi_credit_memo_line_items.line_id,
            fi_credit_memo_line_items.expenses_type,
            fi_credit_memo_line_items.gl_code,
            fi_credit_memo_line_items.gl_description,
            fi_credit_memo_line_items.budget,
            fi_credit_memo_line_items.amount as line_amount,
            fi_credit_memo_line_items.deduction_amount,
            fi_credit_memo_line_items.cost_center,
            fi_credit_memo_line_items.cost_center_desc,
            fi_credit_memo_line_items.tax_type,
            fi_credit_memo_line_items.tax_code,
            fi_credit_memo_line_items.tax_description,
            fi_credit_memo_line_items.base_amount,
            fi_credit_memo_line_items.cgst_amount,
            fi_credit_memo_line_items.sgst_amount,
            fi_credit_memo_line_items.igst_amount,
            fi_credit_memo_line_items.item_text,
            fi_credit_memo_line_items.profit_center,
            fi_credit_memo_line_items.profit_center_description,
            fi_credit_memo_line_items.hsn_sac,
            user_info.FIRST_NAME as requested_by,
            invoice_type_def.definitionsName as invoice_type_name,
            expense_type_def.definitionsName as expense_type_name,
            CONCAT(cost_center_def.cost_centre_code, ' - ', cost_center_def.cost_centre_desc) as cost_center_name,
            fi_payment_header.total_amount as original_invoice_total_amount,
            mg_approved_by_info.FIRST_NAME as mg_approved_by_name,
            stores_approved_by_info.FIRST_NAME as stores_approved_by_name,
            gfa_posted_by_info.FIRST_NAME as gfa_posted_by_name,
            rejected_by_info.FIRST_NAME as rejected_by_name
        ");
        $builder->where('fi_credit_memo_header.credit_memo_id', $id);
        $builder->join('fi_credit_memo_line_items', 'fi_credit_memo_line_items.credit_memo_id = fi_credit_memo_header.credit_memo_id', 'left');
        $builder->join('user_info', 'user_info.UI_ID = fi_credit_memo_header.created_by', 'left');
        $builder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_credit_memo_header.invoice_type', 'left');
        $builder->join('definitions_list as expense_type_def', 'expense_type_def.id = fi_credit_memo_line_items.expenses_type', 'left');
        $builder->join('user_cost_centre_mapping as cost_center_def', 'cost_center_def.id = fi_credit_memo_line_items.cost_center_desc', 'left');
        $builder->join('fi_payment_header', 'fi_payment_header.payment_id = fi_credit_memo_header.request_payment_id', 'left');
        $builder->join('user_info as mg_approved_by_info', 'mg_approved_by_info.UI_ID = fi_credit_memo_header.mg_approved_by', 'left');
        $builder->join('user_info as stores_approved_by_info', 'stores_approved_by_info.UI_ID = fi_credit_memo_header.stores_approved_by', 'left');
        $builder->join('user_info as gfa_posted_by_info', 'gfa_posted_by_info.UI_ID = fi_credit_memo_header.gfa_posted_by', 'left');
        $builder->join('user_info as rejected_by_info', 'rejected_by_info.UI_ID = fi_credit_memo_header.rejected_by', 'left');

        $query = $builder->get();
        $result = $query->getResultArray();

        if (!empty($result)) {
            // normalize line_amount back to `amount` alongside the header's own
            // `amount` (memo amount) — mirrors FIPaymentModel::GetFIPaymentById's
            // flat-row shape so the same transform helpers work on the frontend.
            foreach ($result as &$row) {
                if (isset($row['line_amount'])) {
                    $row['line_item_amount'] = $row['line_amount'];
                    unset($row['line_amount']);
                }
            }
            return $result;
        }

        $headerBuilder = $this->db->table('fi_credit_memo_header');
        $headerBuilder->select("
            fi_credit_memo_header.*,
            user_info.FIRST_NAME as requested_by,
            invoice_type_def.definitionsName as invoice_type_name,
            mg_approved_by_info.FIRST_NAME as mg_approved_by_name,
            stores_approved_by_info.FIRST_NAME as stores_approved_by_name,
            gfa_posted_by_info.FIRST_NAME as gfa_posted_by_name,
            rejected_by_info.FIRST_NAME as rejected_by_name
        ");
        $headerBuilder->join('user_info', 'user_info.UI_ID = fi_credit_memo_header.created_by', 'left');
        $headerBuilder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_credit_memo_header.invoice_type', 'left');
        $headerBuilder->join('user_info as mg_approved_by_info', 'mg_approved_by_info.UI_ID = fi_credit_memo_header.mg_approved_by', 'left');
        $headerBuilder->join('user_info as stores_approved_by_info', 'stores_approved_by_info.UI_ID = fi_credit_memo_header.stores_approved_by', 'left');
        $headerBuilder->join('user_info as gfa_posted_by_info', 'gfa_posted_by_info.UI_ID = fi_credit_memo_header.gfa_posted_by', 'left');
        $headerBuilder->join('user_info as rejected_by_info', 'rejected_by_info.UI_ID = fi_credit_memo_header.rejected_by', 'left');
        $headerBuilder->where('fi_credit_memo_header.credit_memo_id', $id);
        $headerQuery = $headerBuilder->get();
        $headerData = $headerQuery->getRowArray();

        return $headerData ? [$headerData] : [];
    }

    // Fetches the bank clearing/UTR details for an already-posted credit memo
    // (ZZFI_PAY_UTR) and saves whichever of CLEAR_NO/UTR_NO comes back
    // non-empty. Only overwrites a field when SAP returns a real value —
    // never blanks out an already-saved payment_voucher_no/utr_number on a
    // retry that comes back empty (STATUS 2 = not yet cleared).
    public function GetUtrNumberFromSap($id)
    {
        $header = $this->db->table('fi_credit_memo_header')->where('credit_memo_id', $id)->get()->getRowArray();
        if (!$header) {
            return ['success' => false, 'message' => 'Credit memo not found.'];
        }

        if (empty($header['vendor_code']) || empty($header['sap_document_no']) || empty($header['sap_posting_date'])) {
            return ['success' => false, 'message' => 'Vendor Code / SAP Document No / SAP Posting Date not available yet.'];
        }

        $sapData = [[
            'LIFNR'     => str_pad($header['vendor_code'], 10, '0', STR_PAD_LEFT),
            'BELNR'     => $header['payment_voucher_no'] ?? $header['sap_document_no'],
            'POST_DATE' => $header['sap_posting_date'],
        ]];

        $urlPath = "ZZGP_API/ZZFI_PAY_UTR/payutr?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode($sapData));

        $row = is_array($res) && isset($res[0]) ? $res[0] : null;
        $clearNo = trim($row->CLEAR_NO ?? '');
        $utrNo   = trim($row->UTR_NO ?? '');

        if ($clearNo === '' && $utrNo === '') {
            return ['success' => false, 'message' => 'UTR Number not yet available from SAP.'];
        }

        $data = [];
        if ($clearNo !== '') {
            $data['payment_voucher_no'] = $clearNo;
        }
        if ($utrNo !== '') {
            $data['utr_number'] = $utrNo;
        }
        $this->db->table('fi_credit_memo_header')->where('credit_memo_id', $id)->update($data);

        return [
            'success'            => true,
            'message'            => 'UTR details fetched successfully.',
            'payment_voucher_no' => $clearNo !== '' ? $clearNo : ($header['payment_voucher_no'] ?? null),
            'utr_number'         => $utrNo !== '' ? $utrNo : ($header['utr_number'] ?? null),
        ];
    }
}
