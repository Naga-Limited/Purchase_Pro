<?php

namespace App\Models;

use CodeIgniter\Model;
use App\Helpers\SapUrlHelper;

$db = \Config\Database::connect();

class FIPaymentModel extends Model
{

    // Allowed-days-back window for the GFA Verification Posting Date fields
    // (Vendor Invoice + Credit Memo), configured via the /PPCONTROLCHANGE
    // admin screen — same pp_setting single-row pattern as sap_posting_date
    // and courier_sending_date.
    public function GetPostingDateControl()
    {
        $builder = $this->db->table("pp_setting");
        $builder = $builder->select("pp_setting.fi_payment_posting_date");
        $builder = $builder->where("pp_setting.Id", 1);
        return $builder->distinct()->get()->getResultArray();
    }

 public function GetVendorfromsap($vendorID)
    {

        $urlPath = "ZRECC_BANK/Bankinfoupdate?sap-client=900&VENDOR_NO=$vendorID";

        $res = SapUrlHelper::getWhDatas($urlPath);
        // print_r($res);exit;
        return json_decode($res);
    }

    public function GetVendorInfoFromSap()
    {
        $urlPath = "ZZGP_API/ZZFI_VEN_INFO/veninfo?SAP-client=900";

        $res = SapUrlHelper::getWhDatas($urlPath);
        return json_decode($res);
    }
    // Resolves a MIGO number to its SAP VA number, then pulls the related
    // supporting documents recorded against that MIGO/VA in the Gate module.
    public function GetMigoDetails($migoNo)
    {
        $sapData = [[
            'migo' => $migoNo,
        ]];

        $urlPath = "ZZGP_API/ZZFI_MIGO_VA/fimigo?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode($sapData));

        $data = json_decode(json_encode($res), true);
        $vaNumber = $data[0]['VA_NO'] ?? null;

        return array_merge(['va_number' => $vaNumber], $this->GetMigoDocsOnly($migoNo, $vaNumber));
    }

    // Doc-only half of GetMigoDetails, reused by GetFIPaymentById where the
    // VA number is already known/stored and SAP doesn't need to be called again.
    private function GetMigoDocsOnly($migoNo, $vaNumber)
    {
        $po = $this->db->table('purchase_order')
            ->select('invoiceCopy, coaCopy')
            ->where('migoNumber', $migoNo)
            ->get()->getRowArray();

        $gate = $vaNumber ? $this->db->table('gate_in_out_info')
            ->select('shipmentCopy, coaCopy, pickSlipCopy, sendingWBSlip')
            ->where('vaNumber', $vaNumber)
            ->get()->getRowArray() : null;

        return [
            'po_invoice_copy'      => $po['invoiceCopy'] ?? null,
            'po_coa_copy'          => $po['coaCopy'] ?? null,
            'gate_shipment_copy'   => $gate['shipmentCopy'] ?? null,
            'gate_coa_copy'        => $gate['coaCopy'] ?? null,
            'gate_pick_slip_copy'  => $gate['pickSlipCopy'] ?? null,
            'gate_sending_wb_slip' => $gate['sendingWBSlip'] ?? null,
        ];
    }

    // Vendor/employee-specific TDS codes for the GFA Verification screens
    // (replaces the flat GetTdsCodesFromSap list there). Same SAP endpoint as
    // GetTdsCodesFromSap, but POSTed with the vendor/emp code (LIFNR) to filter.
    public function GetTdsFromVendor($vendorCode)
    {
        // SAP's LIFNR is a zero-padded 10-char vendor number; an unpadded
        // code (e.g. "210042") won't match the stored "0000210042".
        $sapData = [[
            'LIFNR' => str_pad($vendorCode ?? '', 10, '0', STR_PAD_LEFT),
        ]];

        $urlPath = "ZZGP_API/ZZFI_TDS_DET/fitds?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode($sapData));

        $data = json_decode(json_encode($res), true);
        if (!is_array($data)) {
            return [];
        }

        // TDS_CODE alone isn't unique (e.g. 'Z1' repeats across TDS_TYPEs with
        // different descriptions), so the option value must combine both to
        // stay distinguishable in a native <select> — same as GetTdsCodesFromSap.
        return array_map(function ($item) {
            $code = $item['TDS_CODE'] ?? '';
            $type = $item['TDS_TYPE'] ?? '';
            $desc = $item['TDS_DESC'] ?? '';
            return [
                'value'       => $type . '::' . $code,
                'tds_code'    => $code,
                'tds_type'    => $type,
                'description' => $desc,
                'label'       => trim($code . ' - ' . $desc),
            ];
        }, $data);
    }

    public function GetGLfromsap($glcode)
    {
        $urlPath = "ZRECC_GLINFO/GLinfoupdate?sap-client=900&GL_Account=$glcode";
        $res = SapUrlHelper::getWhDatas($urlPath);

        // decode as associative array
        $data = json_decode($res, true);
        // print_r($data);exit
        // map + filter: include only STATUS == '1' and non-empty COST_CENTER
        $formatted = array_map(function ($item) {
            return [
                'value' => $item['PROFIT_CENTER'],
                'label' => $item['COST_CENTER'],
            ];
        }, $data);
        // print_r($formatted);exit;
        return $formatted;
    }

    public function GetGLCodeFromSap()
    {
        $urlPath = "ZZGP_API/ZZFI_GL_DET/gldet?sap-client=900";
        $res = SapUrlHelper::getWhDatas($urlPath);

        $data = json_decode($res, true);
        if (!is_array($data)) {
            return [];
        }
        return array_map(function ($item) {
            return [
                'value' => $item['GL'] ?? '',
                'label' => $item['GL'] ?? '',
                'description' => trim($item['GL_NAME'] ?? ''),
            ];
        }, $data);
    }

    public function GetTdsCodesFromSap()
    {
        $urlPath = "ZZGP_API/ZZFI_TDS_DET/fitds?sap-client=900";
        $res = SapUrlHelper::getWhDatas($urlPath);

        $data = json_decode($res, true);
        if (!is_array($data)) {
            return [];
        }
        // TDS_CODE alone isn't unique (e.g. 'Z1' repeats across TDS_TYPEs with
        // different descriptions), so the option value must combine both to
        // stay distinguishable in a native <select>.
        return array_map(function ($item) {
            $code = $item['TDS_CODE'] ?? '';
            $type = $item['TDS_TYPE'] ?? '';
            $desc = $item['TDS_DESC'] ?? '';
            return [
                'value'       => $type . '::' . $code,
                'tds_code'    => $code,
                'tds_type'    => $type,
                'description' => $desc,
                'label'       => trim($code . ' - ' . $desc),
            ];
        }, $data);
    }

    public function GetTaxCodesFromSap()
    {
        $urlPath = "ZZGP_API/ZZFI_TAX_TYPE/taxcode?sap-client=900";
        $res = SapUrlHelper::getWhDatas($urlPath);

        $data = json_decode($res, true);
        if (!is_array($data)) {
            return [];
        }
        return array_map(function ($item) {
            $code = $item['TAX_CODE'] ?? '';
            $desc = $item['TAX_DESC'] ?? '';
            return [
                'value'       => $code,
                'tax_code'    => $code,
                'description' => $desc,
                'label'       => trim($code . ' - ' . $desc),
            ];
        }, $data);
    }

    public function GetCostCentreFromSap()
    {
        $urlPath = "ZZGP_API/ZZFI_COST_PROF/costdet?sap-client=900";
        $res = SapUrlHelper::getWhDatas($urlPath);
        // print_r($res);exit;
        $data = json_decode($res, true);
        if (!is_array($data)) {
            return [];
        }
        return array_map(function ($item) {
            return [
                'value' => $item['COST_CTR'] ?? '',
                'label' => $item['COST_CTR'] ?? '',
                'description' => $item['COST_DESC'] ?? '',
                'profit_centre' => $item['PROFIT_CTR'] ?? '',
                'profit_centre_desc' => $item['PROFIT_DESC'] ?? '',
                'house_bank_id' => $item['HOUSE_BANK'] ?? '',
                'house_bank_ac_no' => $item['ACCT_ID'] ?? '',
                'business_area' => $item['BUS_PLACE'] ?? '',
            ];
        }, $data);
    }

    // Looks up the available budget for a GL Code + Cost Centre combination
    // (line-item level, called whenever both are known for a row).
    public function GetBudgetFromSap($glCode, $costCentre)
    {
        if (empty($glCode) || empty($costCentre)) {
            return null;
        }

        $currentYear  = (int) date('Y');
        $currentMonth = (int) date('n');
        // Financial year runs April-March: Apr-Dec belong to $currentYear, Jan-Mar belong to $currentYear - 1.
        $gjahr  = $currentMonth >= 4 ? $currentYear : $currentYear - 1;
        $period = $currentMonth >= 4 ? $currentMonth - 3 : $currentMonth + 9;

        $sapData = [[
            'gl_code'  => $glCode,
            'cost_ctr' => $costCentre,
            'gjahr'    => (string) $gjahr,
            'period'   => sprintf('%02d', $period),
        ]];
        // print_r($sapData);exit;

        $urlPath = "ZZGP_API/ZZFI_BUDGET/fibud?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode($sapData));
        $data = json_decode(json_encode($res), true);
        if (!is_array($data)) {
            return null;
        }
        $row = isset($data[0]) && is_array($data[0]) ? $data[0] : $data;

        $sapBudget = $row['BUDGET'] ?? null;
        $status    = $row['STATUS'] ?? null;
        $reserved  = 0;
        $budget    = $sapBudget;

        if ($sapBudget !== null) {
            // Amounts already committed by other in-flight FI Payments against
            // this same GL Code + Cost Centre (not yet posted/rejected) —
            // surfaced to the FE so the Budget info button can show it
            // alongside the net-available figure.
            $reserved = $this->db->table('fi_payment_line_items')
                ->select('SUM(fi_payment_line_items.amount) as reserved')
                ->join('fi_payment_header', 'fi_payment_header.payment_id = fi_payment_line_items.payment_id', 'inner')
                ->where('fi_payment_line_items.gl_code', $glCode)
                ->where('fi_payment_line_items.cost_center', $costCentre)
                ->whereIn('fi_payment_header.approval_status', [1,2, 3, 4])
                ->get()
                ->getRowArray()['reserved'] ?? 0;

            $budget = $sapBudget - $reserved;
        }

        return ['budget' => $budget, 'reserved' => $reserved, 'sap_budget' => $sapBudget, 'status' => $status];
    }

    // Records the bank payment reference for a completed (approval_status =
    // 5) FI Payment — only known once the payment is actually processed,
    // after SAP posting, so it's saved separately rather than as part of
    // VerifyAndPostToSap.
    public function UpdatePaymentVoucherDetails($id, $postData)
    {
        $audit  = new AuditLogModel();
        $before = $this->db->table('fi_payment_header')
            ->select('payment_voucher_no, utr_number')->where('payment_id', $id)->get()->getRowArray();

        $data = [
            'payment_voucher_no' => $postData->payment_voucher_no ?? null,
            'utr_number'         => $postData->utr_number ?? null,
        ];

        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($data);

        $diff = $audit->DiffFields($before, $data, ['payment_voucher_no', 'utr_number']);
        $audit->Log('fi_payment', $id, 'payment_voucher_update', null, null, null, $diff ?: null);

        return ['success' => true, 'message' => 'Payment voucher details updated.', 'payment_id' => $id];
    }

    // Asks SAP (ZZFI_REVERSAL/Firev) which documents were reversed as of
    // $date (Ymd) — a GET-style call, DATE goes in the query string, not a
    // POST body. Shared by both FI Payment and Credit Memo, since a reversed
    // sap_document_no could belong to either header table. Returns
    // [DOC_NO => REV_NO, ...] so callers know both which row to roll back
    // (match on sap_document_no = DOC_NO) and what reversal_doc_no to record.
    public function GetReversedDocumentsFromSap($date)
    {
        // print_r($date);exit;
        $urlPath = "ZZGP_API/ZZFI_REVERSAL/Firev?SAP-client=900&DATE={$date}";
        $res = SapUrlHelper::getWhDatas($urlPath);
        // print_r($res);exit;

        $data = json_decode($res, true);
        if (!is_array($data)) {
            return [];
        }

        $reversals = [];
        foreach ($data as $item) {
            $docNo = $item['DOC_NO'] ?? null;
            if (empty($docNo)) {
                continue;
            }
            $reversals[$docNo] = $item['REV_NO'] ?? null;
        }

        return $reversals;
    }

    // Rolls a GFA-Verified (approval_status = 5) request back to Store
    // Acknowledged (4) when SAP reports its sap_document_no as reversed, so
    // it re-enters the GFA queue for re-verification/re-posting, and records
    // SAP's reversal document number (REV_NO) alongside it. Only rows still
    // at 5 are touched, so an already-rejected/reprocessed row isn't
    // clobbered by a stale reversal notice. $reversals is [DOC_NO => REV_NO],
    // as returned by GetReversedDocumentsFromSap.
    public function RevertReversedDocuments(array $reversals)
    {
        if (empty($reversals)) {
            return 0;
        }

        $audit    = new AuditLogModel();
        $affected = 0;
        foreach ($reversals as $docNo => $revNo) {
            $row = $this->db->table('fi_payment_header')
                ->select('payment_id')
                ->where('sap_document_no', $docNo)
                ->where('approval_status', 5)
                ->get()->getRowArray();
            if (!$row) {
                continue;
            }

            $this->db->table('fi_payment_header')
                ->where('payment_id', $row['payment_id'])
                ->update([
                    'approval_status' => 4,
                    'reversal_doc_no' => $revNo,
                ]);
            $affected += $this->db->affectedRows();

            $audit->Log('fi_payment', $row['payment_id'], 'reversal_revert', null, 5, 4, null, 'SAP reversal doc: ' . $revNo);
        }

        return $affected;
    }

    // Fetches the bank clearing/UTR details for an already-posted FI Payment
    // (ZZFI_PAY_UTR) and saves whichever of CLEAR_NO/UTR_NO comes back
    // non-empty. Only overwrites a field when SAP returns a real value —
    // never blanks out an already-saved payment_voucher_no/utr_number on a
    // retry that comes back empty (STATUS 2 = not yet cleared).
    public function GetUtrNumberFromSap($id)
    {
        $header = $this->db->table('fi_payment_header')->where('payment_id', $id)->get()->getRowArray();
        if (!$header) {
            return ['success' => false, 'message' => 'Payment request not found.'];
        }

        // Same vendor-code resolution as VerifyAndPostToSap — the LIFNR SAP
        // actually posted the document under, not necessarily vendor_code.
        $isEmployee     = strtolower(trim($header['payment_to'] ?? '')) === 'employee';
        $requiresEmpDoc = $isEmployee && !empty($header['gst_vendor_code']);
        $vendorCode     = $requiresEmpDoc ? $header['gst_vendor_code'] : ($header['vendor_code'] ?: $header['emp_code']);

        if (empty($vendorCode) || empty($header['sap_document_no']) || empty($header['sap_posting_date'])) {
            return ['success' => false, 'message' => 'Vendor Code / SAP Document No / SAP Posting Date not available yet.'];
        }

        $sapData = [[
            'LIFNR'     => $vendorCode,
            'BELNR'     => $header['payment_voucher_no']?? $header['sap_document_no'],
            'POST_DATE' => $header['sap_posting_date'],
        ]];
        // print_r($sapData);exit;

        $urlPath = "ZZGP_API/ZZFI_PAY_UTR/payutr?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode($sapData));

        // print_r($res);exit;

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
        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($data);

        return [
            'success'            => true,
            'message'            => 'UTR details fetched successfully.',
            'payment_voucher_no' => $clearNo !== '' ? $clearNo : ($header['payment_voucher_no'] ?? null),
            'utr_number'         => $utrNo !== '' ? $utrNo : ($header['utr_number'] ?? null),
        ];
    }

    public function getGateid($id)
    {
        $builder = $this->db->table("user_info");
        $builder = $builder->select("master_gate.gateCode");
        $builder = $builder->join('master_gate', 'user_info.masterGateId = master_gate.id', 'inner');
        $builder = $builder->where("user_info.UI_ID", $id);
        return $builder->distinct()->get()->getResultArray();
    }

    public function getLastFIPaymentTicNo()
    {
        $builder = $this->db->table("fi_payment_header");
        $builder = $builder->select("fi_payment_header.payment_id, fi_payment_header.unique_payment_no");
        $builder = $builder->orderBy('fi_payment_header.payment_id', 'DESC')
            ->limit(1)
            ->get()
            ->getResultArray();

        return $builder;
    }

    // Financial year runs April-March: Apr-Dec belong to the current calendar
    // year, Jan-Mar belong to the previous one — same rule GetBudgetFromSap
    // already uses for SAP's gjahr/period.
    private function GetCurrentFinancialYearRange()
    {
        $currentYear  = (int) date('Y');
        $currentMonth = (int) date('n');
        $gjahr = $currentMonth >= 4 ? $currentYear : $currentYear - 1;
        return [$gjahr . '-04-01', ($gjahr + 1) . '-03-31'];
    }

    // Same Invoice Number + Vendor Code already submitted this financial
    // year — blocks a fresh VendorInvoiceSubmit.js submission, regardless of
    // that earlier request's approval_status. Employee-mode requests (no
    // vendor_code) aren't covered — this is a Vendor-code-specific check.
    // The whole check only runs when pp_setting.fi_financial_year_check = 1
    // (same pp_setting single-row pattern as GetPostingDateControl above) —
    // when it's 0, submission is always allowed, duplicates included.
    public function CheckDuplicateInvoice($vendorCode, $invoiceNumber)
    {
        if (empty($vendorCode) || empty($invoiceNumber)) {
            return false;
        }

        $setting = $this->db->table('pp_setting')->select('fi_financial_year_check')->where('Id', 1)->get()->getRowArray();
        if ((int) ($setting['fi_financial_year_check'] ?? 0) !== 1) {
            return false;
        }

        [$fyStart, $fyEnd] = $this->GetCurrentFinancialYearRange();

        return $this->db->table('fi_payment_header')
            ->where('vendor_code', $vendorCode)
            ->where('invoice_number', $invoiceNumber)
            ->where('DATE(created_at) >=', $fyStart)
            ->where('DATE(created_at) <=', $fyEnd)
            ->countAllResults() > 0;
    }

    public function InsertFIPayment($postData, $paymentNo)
    {
        if ($this->CheckDuplicateInvoice($postData->vendor_code ?? null, $postData->invoice_number ?? null)) {
            return [
                'success' => false,
                'message' => 'An invoice with this Invoice Number and Vendor Code has already been submitted for the current financial year.',
            ];
        }

        $this->db->transStart();

        $headerData = [
            'unique_payment_no'  => $paymentNo,
            'payment_to'         => $postData->payment_to ?? null,
            'department'         => $postData->department ?? null,
            'payment_method'     => $postData->payment_method ?? 'direct',
            'invoice_number'     => $postData->invoice_number ?? null,
            'invoice_date'       => $postData->invoice_date ?? null,
            'invoice_amount'     => $postData->invoice_amount ?? 0,
            'migo_number'        => implode(', ', array_column($postData->migo_items ?? [], 'migo_no')),
            'service_category'   => $postData->service_category ?? null,
            'gst_registered'     => $postData->gst_registered ?? null,
            'vendor_code'        => $postData->vendor_code ?? null,
            'vendor_name'        => $postData->vendor_name ?? null,
            'emp_code'           => $postData->emp_code ?? null,
            'emp_name'           => $postData->emp_name ?? null,
            'gst_vendor_code'    => $postData->gst_vendor_code ?? null,
            'gst_vendor_name'    => $postData->gst_vendor_name ?? null,
            'division'           => $postData->division ?? null,
            'invoice_type'       => $postData->invoice_type ?? null,
            'payment_term'       => $postData->payment_term ?? null,
            'bank_account_no'    => $postData->bank_ac_no ?? null,
            'bank_ifsc_code'     => $postData->bank_ifsc_code ?? null,
            'house_bank_id'      => $postData->house_bank_id ?? null,
            'house_bank_ac_no'   => $postData->house_bank_ac_no ?? null,
            'business_area'      => $postData->business_area ?? null,
            'nature_of_expenses' => $postData->nature_of_expenses ?? null,
            'tds_code'           => $postData->tds_code ?? null,
            'tds_description'    => $postData->tds_description ?? null,
            'invoice_copy'       => $postData->Invoicecopy ?? null,
            'back_paper'         => $postData->Attachment ?? null,
            'total_amount'       => $postData->invoice_amount ?? 0,
            'created_by'         => $postData->created_by ?? null,
            'approval_status'    => 1,
        ];

        $this->db->table('fi_payment_header')->insert($headerData);
        $paymentId = $this->db->insertID();

        foreach ($postData->line_items ?? [] as $item) {
            $this->db->table('fi_payment_line_items')->insert([
                'payment_id'                => $paymentId,
                'expenses_type'             => $item->expenses_type ?? null,
                'gl_code'                   => $item->gl_code ?? null,
                'gl_description'            => $item->gl_description ?? null,
                'budget'                    => ($item->budget ?? '') !== '' ? $item->budget : null,
                'amount'                    => $item->amount ?? 0,
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

        foreach ($postData->migo_items ?? [] as $m) {
            $this->db->table('fi_payment_migo_details')->insert([
                'payment_id' => $paymentId,
                'migo_no'    => $m->migo_no ?? null,
                'va_number'  => $m->va_number ?? null,
            ]);
        }

        (new AuditLogModel())->Log('fi_payment', $paymentId, 'insert', $postData->created_by ?? null, null, 1);

        $this->db->transComplete();

        if ($this->db->transStatus() === false) {
            return ['success' => false, 'message' => 'Failed to save FI Payment.'];
        }

        return [
            'success'    => true,
            'message'    => 'FI Payment saved successfully.',
            'payment_id' => $paymentId,
            'payment_no' => $paymentNo,
        ];
    }

    // Edits a rejected FI Payment request and resubmits it for Manager Approval
    // (approval_status back to 1, clearing the prior rejection markers).
    public function UpdateFIPayment($id, $postData)
    {
        $userId = $postData->updated_by ?? null;
        $audit  = new AuditLogModel();
        $this->db->transStart();

        $beforeHeader = $this->db->table('fi_payment_header')->where('payment_id', $id)->get()->getRowArray();
        $beforeLines  = array_column(
            $this->db->table('fi_payment_line_items')->where('payment_id', $id)->get()->getResultArray(),
            null, 'line_id'
        );
        $beforeMigo = array_column(
            $this->db->table('fi_payment_migo_details')->where('payment_id', $id)->get()->getResultArray(),
            null, 'migo_detail_id'
        );

        $headerData = [
            'payment_to'         => $postData->payment_to ?? null,
            'department'         => $postData->department ?? null,
            'payment_method'     => $postData->payment_method ?? 'direct',
            'invoice_number'     => $postData->invoice_number ?? null,
            'invoice_date'       => $postData->invoice_date ?? null,
            'invoice_amount'     => $postData->invoice_amount ?? 0,
            'migo_number'        => implode(', ', array_column($postData->migo_items ?? [], 'migo_no')),
            'service_category'   => $postData->service_category ?? null,
            'gst_registered'     => $postData->gst_registered ?? null,
            'vendor_code'        => $postData->vendor_code ?? null,
            'vendor_name'        => $postData->vendor_name ?? null,
            'emp_code'           => $postData->emp_code ?? null,
            'emp_name'           => $postData->emp_name ?? null,
            'gst_vendor_code'    => $postData->gst_vendor_code ?? null,
            'gst_vendor_name'    => $postData->gst_vendor_name ?? null,
            'division'           => $postData->division ?? null,
            'invoice_type'       => $postData->invoice_type ?? null,
            'payment_term'       => $postData->payment_term ?? null,
            'bank_account_no'    => $postData->bank_ac_no ?? null,
            'bank_ifsc_code'     => $postData->bank_ifsc_code ?? null,
            'house_bank_id'      => $postData->house_bank_id ?? null,
            'house_bank_ac_no'   => $postData->house_bank_ac_no ?? null,
            'business_area'      => $postData->business_area ?? null,
            'nature_of_expenses' => $postData->nature_of_expenses ?? null,
            'invoice_copy'       => $postData->Invoicecopy ?? null,
            'back_paper'         => $postData->Attachment ?? null,
            'total_amount'       => $postData->invoice_amount ?? 0,
            'approval_status'    => 1,
            'rejected_by'        => null,
            'rejected_at'        => null,
            'rejection_remarks'  => null,
        ];

        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($headerData);
        $headerDiff = $audit->DiffFields($beforeHeader, $headerData, array_keys($headerData));

        // Update existing line items in place (matched by line_id) and insert
        // any newly-added rows — never delete, even for rows the user removed
        // in the UI, so no line item is ever dropped from the DB on resubmit.
        $lineLogs = [];
        foreach ($postData->line_items ?? [] as $item) {
            $data = [
                'expenses_type'             => $item->expenses_type ?? null,
                'gl_code'                   => $item->gl_code ?? null,
                'gl_description'            => $item->gl_description ?? null,
                'budget'                    => ($item->budget ?? '') !== '' ? $item->budget : null,
                'amount'                    => $item->amount ?? 0,
                'cost_center'               => $item->cost_center ?? null,
                'cost_center_desc'          => $item->cost_center_desc ?? null,
                'tax_type'                  => $item->tax_type ?? null,
                'tax_code'                  => $item->tax_code ?? null,
                'tax_description'           => $item->tax_description ?? null,
                'item_text'                 => $item->text ?? null,
                'profit_center'             => $item->profit_center ?? null,
                'profit_center_description' => $item->profit_center_desc ?? null,
                'hsn_sac'                   => $item->hsn_sac ?? null,
            ];
            if (!empty($item->line_id) && isset($beforeLines[$item->line_id])) {
                $diff = $audit->DiffFields($beforeLines[$item->line_id], $data, array_keys($data));
                if ($diff) {
                    $lineLogs[] = ['line_id' => $item->line_id, 'changes' => $diff];
                }
                $this->db->table('fi_payment_line_items')
                    ->where('line_id', $item->line_id)->where('payment_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_payment_line_items')->insert($data + ['payment_id' => $id]);
                $lineLogs[] = ['line_id' => null, 'changes' => ['__added__' => $data]];
            }
        }

        // Same update-in-place / insert-new rule for MIGO rows.
        $migoLogs = [];
        foreach ($postData->migo_items ?? [] as $m) {
            $data = [
                'migo_no'   => $m->migo_no ?? null,
                'va_number' => $m->va_number ?? null,
            ];
            if (!empty($m->migo_detail_id) && isset($beforeMigo[$m->migo_detail_id])) {
                $diff = $audit->DiffFields($beforeMigo[$m->migo_detail_id], $data, array_keys($data));
                if ($diff) {
                    $migoLogs[] = ['line_id' => $m->migo_detail_id, 'changes' => $diff];
                }
                $this->db->table('fi_payment_migo_details')
                    ->where('migo_detail_id', $m->migo_detail_id)->where('payment_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_payment_migo_details')->insert($data + ['payment_id' => $id]);
                $migoLogs[] = ['line_id' => null, 'changes' => ['__added__' => $data]];
            }
        }

        $audit->Log('fi_payment', $id, 'edit_resubmit', $userId, $beforeHeader['approval_status'] ?? null, 1, $headerDiff ?: null);
        foreach ($lineLogs as $l) {
            $audit->Log('fi_payment', $id, 'edit_resubmit', $userId, null, null, $l['changes'], null, $l['line_id'], 'line_item');
        }
        foreach ($migoLogs as $l) {
            $audit->Log('fi_payment', $id, 'edit_resubmit', $userId, null, null, $l['changes'], null, $l['line_id'], 'line_item');
        }

        $this->db->transComplete();

        if ($this->db->transStatus() === false) {
            return ['success' => false, 'message' => 'Failed to update FI Payment.'];
        }

        return [
            'success'    => true,
            'message'    => 'FI Payment resubmitted for approval.',
            'payment_id' => $id,
        ];
    }

    // GFA Verification screen: persists the handful of fields GFA is allowed
    // to correct (invoice no/date, payment term, supporting docs, line items)
    // before VerifyAndPostToSap re-reads the header/line items from the DB.
    // Vendor/employee identity fields are intentionally untouched here.
    public function UpdateGFADetails($id, $postData, $actionLabel = 'gfa_update')
    {
        $userId = $postData->userid ?? null;
        $audit  = new AuditLogModel();
        $this->db->transStart();

        $beforeHeader = $this->db->table('fi_payment_header')->where('payment_id', $id)->get()->getRowArray();
        $beforeLines  = array_column(
            $this->db->table('fi_payment_line_items')->where('payment_id', $id)->get()->getResultArray(),
            null, 'line_id'
        );

        $headerData = [
            'invoice_number' => $postData->invoice_number ?? null,
            'invoice_date'   => $postData->invoice_date ?? null,
            'payment_term'   => $postData->payment_term ?? null,
        ];
        if (!empty($postData->Invoicecopy)) {
            $headerData['invoice_copy'] = $postData->Invoicecopy;
        }
        if (!empty($postData->Attachment)) {
            $headerData['back_paper'] = $postData->Attachment;
        }

        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($headerData);
        $headerDiff = $audit->DiffFields($beforeHeader, $headerData, array_keys($headerData));

        $lineLogs = [];
        foreach ($postData->line_items ?? [] as $item) {
            $data = [
                'expenses_type'             => $item->expenses_type ?? null,
                'gl_code'                   => $item->gl_code ?? null,
                'gl_description'            => $item->gl_description ?? null,
                'budget'                    => ($item->budget ?? '') !== '' ? $item->budget : null,
                'amount'                    => $item->amount ?? 0,
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
            if (!empty($item->line_id) && isset($beforeLines[$item->line_id])) {
                $diff = $audit->DiffFields($beforeLines[$item->line_id], $data, array_keys($data));
                if ($diff) {
                    $lineLogs[] = ['line_id' => $item->line_id, 'changes' => $diff];
                }
                $this->db->table('fi_payment_line_items')
                    ->where('line_id', $item->line_id)->where('payment_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_payment_line_items')->insert($data + ['payment_id' => $id]);
                $lineLogs[] = ['line_id' => null, 'changes' => ['__added__' => $data]];
            }
        }

        $audit->Log('fi_payment', $id, $actionLabel, $userId, null, null, $headerDiff ?: null);
        foreach ($lineLogs as $l) {
            $audit->Log('fi_payment', $id, $actionLabel, $userId, null, null, $l['changes'], null, $l['line_id'], 'line_item');
        }

        $this->db->transComplete();

        if ($this->db->transStatus() === false) {
            return ['success' => false, 'message' => 'Failed to update payment details.'];
        }

        return ['success' => true, 'message' => 'Payment details updated.', 'payment_id' => $id];
    }

    // Full-data report across every approval_status (unlike GetFIPaymentList,
    // which is scoped to one stage's queue), filtered by the header's
    // created_at (the one date field always populated regardless of stage).
    // fi_payment_header is the primary (FROM) table — one row per request,
    // request-level totals rather than per-line-item granularity.
    public function GetFIPaymentReport($fromDate, $toDate, $search = '', $userId = null)
    {
        // What role(s) $userId holds against this request's own cost centre
        // mapping(s) — Requester (user_cost_centre_mapping.user_id) plus
        // whichever of Manager/Store/Accounts/GFA name them, aggregated
        // across every line item's mapping since a request can span more
        // than one cost centre. Same columns GetFIPaymentReport's own
        // visibility filter below checks, just surfaced instead of only
        // used to scope rows.
        $userIdEscaped = !empty($userId) ? $this->db->escape($userId) : null;
        $userAccessSelect = $userIdEscaped !== null
            ? "(SELECT TRIM(BOTH ', ' FROM CONCAT_WS(', ',
                    MAX(CASE WHEN ucm_access.user_id = {$userIdEscaped} THEN 'Requester' END),
                    MAX(CASE WHEN FIND_IN_SET({$userIdEscaped}, ucm_access.reporting_manager_id) > 0 THEN 'Manager' END),
                    MAX(CASE WHEN FIND_IN_SET({$userIdEscaped}, ucm_access.store_reporting_id) > 0 THEN 'Store' END),
                    MAX(CASE WHEN ucm_access.reporting_accounts_id = {$userIdEscaped} THEN 'Accounts' END),
                    MAX(CASE WHEN FIND_IN_SET({$userIdEscaped}, ucm_access.reporting_gfa_id) > 0 THEN 'GFA' END)
                ))
                FROM fi_payment_line_items li_access
                JOIN user_cost_centre_mapping ucm_access ON ucm_access.id = li_access.cost_center_desc
                WHERE li_access.payment_id = fi_payment_header.payment_id
                    AND ucm_access.RecStatus = 1 AND ucm_access.deleted_at IS NULL
            )"
            : 'NULL';

        $builder = $this->db->table('fi_payment_header');
        $builder->select("
            fi_payment_header.payment_id,
            fi_payment_header.unique_payment_no,
            fi_payment_header.created_at,
            user_info.FIRST_NAME as requested_by,
            fi_payment_header.payment_to,
            fi_payment_header.department,
            fi_payment_header.division,
            fi_payment_header.business_area,
            (SELECT GROUP_CONCAT(DISTINCT li.cost_center SEPARATOR ', ')
                FROM fi_payment_line_items li
                WHERE li.payment_id = fi_payment_header.payment_id) as cost_center,
            invoice_type_def.definitionsName as invoice_type_name,
            fi_payment_header.invoice_number,
            fi_payment_header.invoice_date,
            fi_payment_header.invoice_amount,
            fi_payment_header.total_amount,
            fi_payment_header.vendor_code,
            fi_payment_header.vendor_name,
            fi_payment_header.emp_code,
            fi_payment_header.emp_name,
            fi_payment_header.gst_registered,
            fi_payment_header.gst_vendor_code,
            fi_payment_header.gst_vendor_name,
            service_category_def.definitionsName as service_category_name,
            CONCAT(payment_term_def.definitionsName, ' - ', payment_term_def.definitionsvalues) as payment_term_name,
            fi_payment_header.nature_of_expenses,
            fi_payment_header.bank_account_no,
            fi_payment_header.bank_ifsc_code,
            fi_payment_header.house_bank_id,
            fi_payment_header.house_bank_ac_no,
            fi_payment_header.tds_code,
            fi_payment_header.tds_description,
            fi_payment_header.migo_number,
            fi_payment_header.sap_posting_date,
            fi_payment_header.sap_document_no,
            fi_payment_header.emp_sap_document_no,
            fi_payment_header.payment_voucher_no,
            fi_payment_header.utr_number,
            fi_payment_header.approval_status,
            CASE fi_payment_header.approval_status
                WHEN 1 THEN 'Pending Manager Approval'
                WHEN 2 THEN 'Approved by Manager'
                WHEN 4 THEN 'Store Acknowledged'
                WHEN 5 THEN 'GFA Verified / Completed'
                WHEN 6 THEN 'Pending Accounts Verification'
                WHEN 10 THEN 'Rejected'
                ELSE 'Unknown'
            END as approval_status_label,
            fi_payment_header.mg_approved_at,
            mg_approved_by_info.FIRST_NAME as mg_approved_by_name,
            fi_payment_header.stores_approved_at,
            stores_approved_by_info.FIRST_NAME as stores_approved_by_name,
            fi_payment_header.accounts_verified_at,
            accounts_verified_by_info.FIRST_NAME as accounts_verified_by_name,
            fi_payment_header.gfa_posted_at,
            gfa_posted_by_info.FIRST_NAME as gfa_posted_by_name,
            fi_payment_header.rejected_at,
            rejected_by_info.FIRST_NAME as rejected_by_name,
            fi_payment_header.rejection_remarks,
            fi_payment_header.invoice_copy,
            fi_payment_header.back_paper,
            {$userAccessSelect} as user_access_type
        ");
        $builder->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left');
        $builder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_payment_header.invoice_type', 'left');
        $builder->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left');
        $builder->join('definitions_list as service_category_def', 'service_category_def.id = fi_payment_header.service_category', 'left');
        $builder->join('user_info as mg_approved_by_info', 'mg_approved_by_info.UI_ID = fi_payment_header.mg_approved_by', 'left');
        $builder->join('user_info as stores_approved_by_info', 'stores_approved_by_info.UI_ID = fi_payment_header.stores_approved_by', 'left');
        $builder->join('user_info as accounts_verified_by_info', 'accounts_verified_by_info.UI_ID = fi_payment_header.accounts_verified_by', 'left');
        $builder->join('user_info as gfa_posted_by_info', 'gfa_posted_by_info.UI_ID = fi_payment_header.gfa_posted_by', 'left');
        $builder->join('user_info as rejected_by_info', 'rejected_by_info.UI_ID = fi_payment_header.rejected_by', 'left');
        $builder->where('DATE(fi_payment_header.created_at) >=', $fromDate);
        $builder->where('DATE(fi_payment_header.created_at) <=', $toDate);

        // Scope the report to whatever this user is tied to via
        // user_cost_centre_mapping — either as the mapping's own user (the
        // requester the cost centre belongs to) or as one of its Reporting
        // Manager/Store Reporting/Reporting GFA approvers (all three can now
        // name several people, comma-separated — FIND_IN_SET matches any of
        // them). UserID 1 is exempt and always sees every request.
        if (!empty($userId) && (int) $userId !== 1) {
            $builder->whereIn('payment_id', function ($sub) use ($userId, $userIdEscaped) {
                return $sub->select('fi_payment_line_items.payment_id')->from('fi_payment_line_items')
                    ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc')
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
            $builder->like('fi_payment_header.vendor_name', $search);
            $builder->orLike('fi_payment_header.emp_name', $search);
            $builder->orLike('fi_payment_header.invoice_number', $search);
            $builder->orLike('fi_payment_header.department', $search);
            $builder->orLike('fi_payment_header.division', $search);
            $builder->orLike('fi_payment_header.nature_of_expenses', $search);
            $builder->groupEnd();
        }

        $builder->orderBy('fi_payment_header.created_at', 'DESC');

        return $builder->get()->getResultArray();
    }

    // Shared audit_log table (fi_payment + credit_memo actions, written by
    // AuditLogModel::Log across both models) surfaced here rather than
    // through a separate Audit controller/model. audit_log.record_id means
    // payment_id or credit_memo_id depending on audit_log.module, so it's
    // resolved against whichever header table matches to show a
    // human-readable request number alongside each entry.
    public function GetAuditLog($fromDate = null, $toDate = null, $module = null, $recordId = null, $search = '', $start = 0, $pageSize = 50)
    {
        $builder = $this->db->table('audit_log');
        $builder->join('user_info', 'user_info.UI_ID = audit_log.actor_id', 'left');
        $builder->join('fi_payment_header', "audit_log.module = 'fi_payment' AND fi_payment_header.payment_id = audit_log.record_id", 'left');
        $builder->join('fi_credit_memo_header', "audit_log.module = 'credit_memo' AND fi_credit_memo_header.credit_memo_id = audit_log.record_id", 'left');

        if (!empty($module)) {
            $builder->where('audit_log.module', $module);
        }
        if (!empty($recordId)) {
            $builder->where('audit_log.record_id', $recordId);
        }
        if (!empty($fromDate)) {
            $builder->where('DATE(audit_log.created_at) >=', $fromDate);
        }
        if (!empty($toDate)) {
            $builder->where('DATE(audit_log.created_at) <=', $toDate);
        }
        if (!empty($search)) {
            $builder->groupStart();
            $builder->like('audit_log.action', $search);
            $builder->orLike('audit_log.remarks', $search);
            $builder->orLike('user_info.FIRST_NAME', $search);
            $builder->orLike('fi_payment_header.unique_payment_no', $search);
            $builder->orLike('fi_credit_memo_header.unique_credit_memo_no', $search);
            $builder->groupEnd();
        }

        $total = $builder->countAllResults(false);

        $builder->select("
            audit_log.audit_id,
            audit_log.module,
            audit_log.record_id,
            COALESCE(fi_payment_header.unique_payment_no, fi_credit_memo_header.unique_credit_memo_no) as request_no,
            audit_log.line_id,
            audit_log.scope,
            audit_log.action,
            audit_log.actor_id,
            user_info.FIRST_NAME as actor_name,
            audit_log.status_before,
            audit_log.status_after,
            audit_log.changes,
            audit_log.remarks,
            audit_log.created_at
        ");
        $builder->orderBy('audit_log.created_at', 'DESC');
        $builder->limit((int) $pageSize, (int) $start);

        $results = $builder->get()->getResultArray();
        foreach ($results as &$row) {
            $row['changes'] = $row['changes'] !== null ? json_decode($row['changes'], true) : null;
        }
        unset($row);

        return ['results' => $results, 'count' => $total];
    }

    // approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager, 3 = Rejected
    public function GetFIPaymentList($start = 0, $pageSize = 25, $search = '', $approvalStatus = 1, $userId = null, $reportingManagerId = null, $storeReportingId = null, $reportingAccountsId = null)
    {
        $builder = $this->db->table('fi_payment_header');
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
        // items rather than fi_payment_header.created_by.
        if (!empty($reportingManagerId)) {
            // reporting_manager_id can now name several people (comma-separated,
            // same convention as loading_unloading_payment.unload_id) — match
            // if the caller's id appears anywhere in that list, not just an
            // exact single-value equals.
            $reportingManagerIdEscaped = $this->db->escape($reportingManagerId);
            $builder->whereIn('payment_id', function ($sub) use ($reportingManagerIdEscaped) {
                return $sub->select('fi_payment_line_items.payment_id')->from('fi_payment_line_items')
                    ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc')
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
        // Same per-line-item Cost Centre routing as Reporting Manager above,
        // just keyed on reporting_accounts_id (single-select, plain equality —
        // no FIND_IN_SET needed) so the Accounts Verification list only shows
        // each verifier their own queue.
        if (!empty($reportingAccountsId)) {
            $builder->whereIn('payment_id', function ($sub) use ($reportingAccountsId) {
                return $sub->select('fi_payment_line_items.payment_id')->from('fi_payment_line_items')
                    ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc')
                    ->where('user_cost_centre_mapping.reporting_accounts_id', $reportingAccountsId)
                    ->where('user_cost_centre_mapping.RecStatus', 1)
                    ->where('user_cost_centre_mapping.deleted_at', null);
            });
        }

        if (!empty($search)) {
            $builder->groupStart();
            $builder->like('vendor_name', $search);
            $builder->orLike('invoice_number', $search);
            $builder->orLike('department', $search);
            $builder->orLike('division', $search);
            $builder->orLike('nature_of_expenses', $search);
            $builder->groupEnd();
        }

        $total = $builder->countAllResults(false);

        $builder->select("
            payment_id,
            unique_payment_no,
            vendor_name,
            emp_name,
            nature_of_expenses,
            department,
            invoice_amount,
            invoice_date,
            division,
            business_area,
            approval_status,
            invoice_copy,
            back_paper,
            payment_voucher_no,
            utr_number,
            created_at,
            updated_at,
            (SELECT GROUP_CONCAT(DISTINCT li.cost_center SEPARATOR ', ')
                FROM fi_payment_line_items li
                WHERE li.payment_id = fi_payment_header.payment_id) as cost_center
        ");
        $builder->orderBy('created_at', 'DESC');
        $builder->limit((int) $pageSize, (int) $start);

        $results = $builder->get()->getResultArray();

        return ['results' => $results, 'count' => $total];
    }

    // Pending-approval rows for the reminder cron, one row per (request,
    // recipient) pair. Joins through the line items' Cost Centre Mapping
    // (not created_by) — same reasoning as the reporting_manager_id filter in
    // GetFIPaymentList above: the approver for a request is whoever the
    // request's own cost centre names, not a role tied to the requester's
    // account. $excludeStatuses flips $statuses from an allow-list (manager /
    // store, which fire on one exact status) to a block-list (GFA, which
    // fires on everything still in flight except Completed/Rejected).
    // $dateColumn picks what "Pending Since" is measured from — Reporting
    // Manager wants it from created_at (original submission), while Store /
    // GFA keep the default updated_at (last status change).
    private function GetPendingApprovalsForRole($mappingField, array $statuses, $excludeStatuses = false, $dateColumn = 'updated_at')
    {
        $builder = $this->db->table('fi_payment_header');
        $builder->select("
            fi_payment_header.payment_id,
            fi_payment_header.unique_payment_no as request_no,
            fi_payment_header.vendor_name,
            fi_payment_header.department,
            fi_payment_header.division,
            fi_payment_header.payment_to,
            fi_payment_header.emp_name,
            fi_payment_header.gst_registered,
            fi_payment_header.gst_vendor_name,
            fi_payment_header.invoice_number as doc_no,
            fi_payment_header.total_amount,
            fi_payment_header.approval_status,
            TIMESTAMPDIFF(SECOND, fi_payment_header.{$dateColumn}, NOW()) as pending_seconds,
            recipient_info.UI_ID as recipient_id,
            recipient_info.MAIL_ID as recipient_mail,
            recipient_info.FIRST_NAME as recipient_name
        ");
        $builder->join('fi_payment_line_items', 'fi_payment_line_items.payment_id = fi_payment_header.payment_id', 'inner');
        $builder->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc', 'inner');
        // {$mappingField} can now name several people (comma-separated) —
        // FIND_IN_SET joins one row per person still named in that list,
        // instead of an exact match assuming a single id.
        $builder->join('user_info as recipient_info', "FIND_IN_SET(recipient_info.UI_ID, user_cost_centre_mapping.{$mappingField})", 'left');
        $builder->where('user_cost_centre_mapping.RecStatus', 1);
        $builder->where('user_cost_centre_mapping.deleted_at', null);
        if ($excludeStatuses) {
            $builder->whereNotIn('fi_payment_header.approval_status', $statuses);
        } else {
            $builder->whereIn('fi_payment_header.approval_status', $statuses);
        }
        // Group by the resolved recipient, not the raw (possibly multi-value)
        // mapping field — otherwise several distinct recipients sharing the
        // same mapping row would collapse into one output row.
        $builder->groupBy("fi_payment_header.payment_id, recipient_info.UI_ID");
        // print_r($builder->get()->getResultArray());exit;

        return $builder->get()->getResultArray();
    }

    public function GetPendingForReportingManager()
    {
        return $this->GetPendingApprovalsForRole('reporting_manager_id', [1], false, 'created_at');
    }

    public function GetPendingForStoreReporting()
    {
        return $this->GetPendingApprovalsForRole('store_reporting_id', [2]);
    }

    public function GetPendingForReportingAccounts()
    {
        return $this->GetPendingApprovalsForRole('reporting_accounts_id', [6]);
    }

    // GFA contact gets notified for anything still in flight (1, 2, 4) —
    // not just the GFA-specific stage (4) — per business rule: everything
    // except Completed (5) and Rejected (10).
    public function GetPendingForReportingGfa()
    {
        return $this->GetPendingApprovalsForRole('reporting_gfa_id', [5, 10], true);
    }

    // approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager
    // (waiting on Store Acknowledge), 4 = Store Acknowledged (waiting on GFA
    // Verification), 5 = GFA Verified (Completed), 6 = Pending Accounts
    // Verification (waiting on the Cost Centre's assigned Accounts Verifier —
    // only entered when that mapping flags accounts_verification = 'Yes';
    // otherwise Store Ack goes straight to 4 same as before), 10 = Rejected
    public function UpdateApprovalStatus($id, $status, $userId, $remarks = null, $tdsCode = null, $tdsDescription = null)
    {
        $this->db->transStart();

        $before = $this->db->table('fi_payment_header')->select('approval_status')->where('payment_id', $id)->get()->getRowArray();

        $data = ['approval_status' => $status];

        if ((int) $status === 2) {
            $data['mg_approved_by'] = $userId;
            $data['mg_approved_at'] = date('Y-m-d H:i:s');
        } elseif ((int) $status === 4) {
            if ((int) ($before['approval_status'] ?? 0) === 6) {
                // Accounts Verifier's approval — advances Pending Accounts
                // Verification straight into the existing GFA queue.
                $data['accounts_verified_by'] = $userId;
                $data['accounts_verified_at'] = date('Y-m-d H:i:s');
            } else {
                $data['stores_approved_by'] = $userId;
                $data['stores_approved_at'] = date('Y-m-d H:i:s');
                if ($this->RequiresAccountsVerification($id)) {
                    // Fork: this Cost Centre requires Accounts Verification
                    // before GFA, so land on 6 instead of 4.
                    $data['approval_status'] = 6;
                }
            }
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

        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($data);

        $finalStatus = (int) $data['approval_status'];
        if ($finalStatus === 10) {
            $action = 'reject';
        } elseif ($finalStatus === 2) {
            $action = 'mg_approve';
        } elseif ($finalStatus === 5) {
            $action = 'gfa_posted';
        } elseif ($finalStatus === 6) {
            $action = 'store_ack_pending_accounts';
        } elseif ($finalStatus === 4 && (int) ($before['approval_status'] ?? 0) === 6) {
            $action = 'accounts_verify_approve';
        } else {
            $action = 'store_ack';
        }
        (new AuditLogModel())->Log('fi_payment', $id, $action, $userId, $before['approval_status'] ?? null, $finalStatus, null, $remarks);

        $this->db->transComplete();

        if ((int) $status === 10) {
            $this->SendRejectionEmail($id, $remarks);
        }

        return ['success' => true, 'message' => (int) $status === 10 ? 'Payment rejected.' : 'Payment approved.'];
    }

    // True if any of this request's line items points (via cost_center_desc)
    // at a Cost Centre mapping flagged accounts_verification = 'Yes' — same
    // join shape GetFIPaymentList already uses to resolve a line item's
    // Reporting Manager. Drives the Store Ack fork in UpdateApprovalStatus.
    private function RequiresAccountsVerification($id)
    {
        $row = $this->db->table('fi_payment_line_items')
            ->select('user_cost_centre_mapping.id')
            ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc')
            ->where('fi_payment_line_items.payment_id', $id)
            ->where('user_cost_centre_mapping.accounts_verification', 'Yes')
            ->where('user_cost_centre_mapping.RecStatus', 1)
            ->where('user_cost_centre_mapping.deleted_at', null)
            ->get()->getRowArray();

        return !empty($row);
    }

    // Notifies the original requester (user_info.MAIL_ID, via created_by) that
    // their Vendor Invoice request was rejected, and what to fix per the
    // rejection remarks, so they can correct and resubmit it.
    private function SendRejectionEmail($id, $remarks)
    {
        $header = $this->db->table('fi_payment_header')
            ->select('fi_payment_header.unique_payment_no, fi_payment_header.vendor_name, fi_payment_header.invoice_number, fi_payment_header.total_amount, user_info.MAIL_ID, user_info.FIRST_NAME')
            ->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left')
            ->where('fi_payment_header.payment_id', $id)
            ->get()->getRowArray();

        if (empty($header['MAIL_ID'])) {
            return;
        }

        $subject = 'Vendor Invoice Request Rejected - ' . esc($header['unique_payment_no']);

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
                <p>Your Vendor Invoice request has been <strong style="color:#d9534f">rejected</strong>. Please review the remarks below, make the necessary changes and resubmit the request.</p>

                <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">

                <thead>
                <tr>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Request No</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Vendor Name</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Invoice Number</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Amount</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Rejection Remarks</th>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['unique_payment_no']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['vendor_name']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['invoice_number']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($header['total_amount']) . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($remarks) . '</td>
            </tr>
            </tbody></table>
                <br/>
                <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p></div>
                </body>
                </html>';

        $email = \Config\Services::email();
        $email->setFrom('noreply@nagamills.com', 'FI Payment');
        $email->setTo($header['MAIL_ID']);
        $email->setBcc('st17@nagamills.com');
        $email->setSubject($subject);
        $email->setMessage($message);

        if (!$email->send()) {
            log_message('error', print_r($email->printDebugger(['headers', 'subject', 'body']), true));
        }
    }

    // Builds the SAP ZZFI_EXP_POST payload shared by VerifyAndPostToSap (real
    // post) and SimulatePosting (preview) — same shape, only the SAP endpoint
    // and post-call side effects differ. Returns null when the payment
    // request itself can't be found.
    private function BuildFiExpSapData($id, $tdsCode, $tdsDescription, $postingDate)
    {
        $header = $this->db->table('fi_payment_header')
            ->select('fi_payment_header.*, payment_term_def.definitionsName as pay_term_code')
            ->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left')
            ->where('fi_payment_header.payment_id', $id)
            ->get()->getRowArray();
        if (!$header) {
            return null;
        }

        $lineItems = $this->db->table('fi_payment_line_items')->where('payment_id', $id)->get()->getResultArray();

        $mimeToExt = [
            'application/pdf' => '.pdf',
            'image/png' => '.png',
            'image/jpeg' => '.jpg',
            'image/jpg' => '.jpg'
        ];

        $fetchFile = function ($url) use ($mimeToExt) {
            $result = ['name' => null, 'base64' => null, 'ext' => null, 'mime' => null];
            if (empty($url)) {
                return $result;
            }
            $fileUrl = str_replace(' ', '%20', trim($url));
            $fileContents = @file_get_contents($fileUrl);
            if ($fileContents === false) {
                return $result;
            }
            $result['name'] = basename(parse_url($fileUrl, PHP_URL_PATH) ?: $fileUrl);
            $result['base64'] = base64_encode($fileContents);

            if (function_exists('finfo_open')) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $fileContents);
                finfo_close($finfo);
                $result['mime'] = $mimeType;
                $result['ext'] = $mimeToExt[$mimeType] ?? '';
            }

            return $result;
        };

        $invoiceFile   = $fetchFile($header['invoice_copy']);
        $backPaperFile = $fetchFile($header['back_paper']);

        $sapLines = [];
        $lineNum  = 1;
        foreach ($lineItems as $item) {
            $sapLines[] = [
                "ZZLINE"        => (string) $lineNum,
                "Gl_account"    => $item['gl_code'],
                "amount"        => $item['amount'],
                "costcenter"    => $item['cost_center'],
                "profitcetnter" => $item['profit_center'],
                "text"          => $item['item_text'],
                "hsn"           => $item['hsn_sac'],
                "tax_type"      => $item['tax_code'] ?? '',
            ];
            $lineNum++;
        }

        $invoiceDate   = !empty($header['invoice_date']) ? date('Ymd', strtotime($header['invoice_date'])) : null;
        $postingDateFmt = date('Ymd', strtotime($postingDate));

        // The header carries a flat Gl_account/amount/costcenter (mirroring
        // the request's first line item), but only for Employee requests —
        // Vendor requests post through vendor_code alone, so those fields
        // must go out blank rather than duplicating line data. emp_code only
        // goes out when the employee also has a GST vendor code on file
        // (gst_vendor_code), since that's what triggers SAP posting a second,
        // Employee-side document (EMP_DOCUMENT_NO) alongside the GL one.
        $isEmployee     = strtolower(trim($header['payment_to'] ?? '')) === 'employee';
        $requiresEmpDoc = $isEmployee && !empty($header['gst_vendor_code']);
        $firstLine      = $lineItems[0] ?? [];

        $SAP_DATA = [
            "vendor_code"     => $requiresEmpDoc ? $header['gst_vendor_code'] : ($header['vendor_code'] ?: $header['emp_code']),
            "emp_code"        => $requiresEmpDoc ? ($header['emp_code'] ?? '') : '',
            "invoice_date"    => $invoiceDate,
            "posting_date"    => $postingDateFmt,
            "totalamount"     => $header['total_amount'],
            "Pay_term"        => $header['pay_term_code'] ?? '',
            "tds_status"      => !empty($tdsCode) ? 'YES' : 'NO',
            "tds_value"       => $tdsCode ?? '',
            "ref_doc"         => $header['unique_payment_no'],
            "emp_doc"         => $header['unique_payment_no'],
            "headertext"      => $header['invoice_number'],
            "BUS_PLACE"        => $header['business_area'],
            "division"        => $header['division'],
            "rev_doc"         => $header['reversal_doc_no'],
            "house_bank"      => $header['house_bank_id'],
            "acct_id"         => $header['house_bank_ac_no'],
            "Gl_account"      => $isEmployee ? ($firstLine['gl_code'] ?? '') : '',
            "amount"          => $isEmployee ? ($firstLine['amount'] ?? '') : '',
            "costcenter"      => $isEmployee ? ($firstLine['cost_center'] ?? '') : '',
            "Invoice_attach"  => $invoiceFile['base64'] ?? '',
            "invoice_name"    => $invoiceFile['name'] ?? '',
            "invoice_ext"     => strtoupper(ltrim($invoiceFile['ext'] ?? '', '.')),
            "backpaper_attach" => $backPaperFile['base64'] ?? '',
            "backpaper_name"  => $backPaperFile['name'] ?? '',
            "backpaper_ext"   => strtoupper(ltrim($backPaperFile['ext'] ?? '', '.')),
            "LINE"            => $sapLines,
        ];

        return ['sap_data' => $SAP_DATA, 'requires_emp_doc' => $requiresEmpDoc];
    }

    // GFA Verification approve step: posts the invoice to SAP (ZZFI_EXP_POST)
    // and, only on a successful SAP response, marks the request GFA Verified.
    public function VerifyAndPostToSap($id, $userId, $tdsCode, $tdsDescription, $postingDate)
    {
        $built = $this->BuildFiExpSapData($id, $tdsCode, $tdsDescription, $postingDate);
        if ($built === null) {
            return ['success' => false, 'message' => 'Payment request not found.'];
        }
        $requiresEmpDoc = $built['requires_emp_doc'];
        $postingDateFmt = date('Ymd', strtotime($postingDate));

        $urlPath = "ZZGP_API/ZZFI_EXP_POST/fiexp?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$built['sap_data']]));

        $resRow    = is_array($res) && isset($res[0]) ? $res[0] : null;
        $status    = $resRow->STATUS ?? 0;
        $empStatus = $resRow->EMP_STATUS ?? 0;

        // Only requests that actually sent emp_code (Employee + gst_vendor_code
        // set) get a second, Employee-side SAP document, so only those need
        // EMP_STATUS == 1 too. Plain Vendor requests, and Employee requests
        // without a gst_vendor_code, only ever post the GL document.
        $docNo    = $resRow->DOCUMENT_NO ?? '';
            $empDocNo = $requiresEmpDoc ? ($resRow->EMP_DOCUMENT_NO ?? '') : '';
        $success =  ($empStatus < 2 &&  $requiresEmpDoc && $empDocNo ) ||  ($status < 2 && $docNo);

        if ($success) {
            // Financial year runs April-March: Apr-Dec belong to the current
            // calendar year, Jan-Mar belong to the previous one — same
            // convention as GetBudgetFromSap's $gjahr.
            $currentYear  = (int) date('Y');
            $currentMonth = (int) date('n');
            $fiscalYear   = $currentMonth >= 4 ? $currentYear : $currentYear - 1;

            $audit  = new AuditLogModel();
            $this->db->transStart();

            $before = $this->db->table('fi_payment_header')
                ->select('approval_status, tds_code, tds_description, sap_document_no, sap_posting_date')
                ->where('payment_id', $id)->get()->getRowArray();

            $updateData = [
                'approval_status'     => 5,
                'gfa_posted_by'       => $userId,
                'gfa_posted_at'       => date('Y-m-d H:i:s'),
                'tds_code'            => $tdsCode,
                'tds_description'     => $tdsDescription,
                'sap_posting_date'    => date('Y-m-d', strtotime($postingDateFmt)),
                'sap_document_no'     => $resRow->DOCUMENT_NO ?? null,
                'emp_sap_document_no' => $requiresEmpDoc ? ($resRow->EMP_DOCUMENT_NO ?? null) : null,
                'sap_fiscal_year'     => $fiscalYear,
            ];
            $this->db->table('fi_payment_header')->where('payment_id', $id)->update($updateData);

            $diff = $audit->DiffFields($before, $updateData, ['tds_code', 'tds_description', 'sap_document_no', 'sap_posting_date']);
            $audit->Log('fi_payment', $id, 'post_to_sap', $userId, $before['approval_status'] ?? null, 5, $diff ?: null);

            $this->db->transComplete();

            $messages = array_filter([
                trim($resRow->MESSAGE ?? ''),
                !empty($docNo) ? 'Document No: ' . $docNo : '',
                $requiresEmpDoc ? trim($resRow->EMP_MESSAGE ?? '') : '',
                !empty($empDocNo) ? 'Employee Document No: ' . $empDocNo : '',
            ]);

            return [
                'success'      => true,
                'message'      => !empty($messages) ? implode(' | ', $messages) : 'Verified and posted to SAP successfully.',
                'sap_response' => $res,
            ];
        }

        $errorMessages = array_filter([
            $resRow->MESSAGE ?? '',
            $requiresEmpDoc ? ($resRow->EMP_MESSAGE ?? '') : '',
        ]);
        $errorMessage = !empty($errorMessages) ? implode(' | ', $errorMessages) : 'SAP posting failed.';
        return ['success' => false, 'message' => $errorMessage, 'sap_response' => $res];
    }

    // GFA Verification "Simulate" step: previews the SAP GL breakdown
    // (ZZFI_SIMULATE) for the currently-saved line items without posting or
    // touching approval_status — lets the verifier review before committing.
    public function SimulatePosting($id, $tdsCode, $tdsDescription, $postingDate)
    {
        $built = $this->BuildFiExpSapData($id, $tdsCode, $tdsDescription, $postingDate);
        if ($built === null) {
            return ['success' => false, 'message' => 'Payment request not found.'];
        }

        $urlPath = "ZZGP_API/ZZFI_SIMULATE/expsim?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$built['sap_data']]));

        if (!is_array($res)) {
            return ['success' => false, 'message' => 'SAP simulation failed.'];
        }

        return ['success' => true, 'results' => $res];
    }

    public function GetFIPaymentById($id)
    {
        $builder = $this->db->table('fi_payment_header');
        $builder->select("
            fi_payment_header.*,
            fi_payment_line_items.*,
            user_info.FIRST_NAME as requested_by,
            invoice_type_def.definitionsName as invoice_type_name,
            CONCAT(payment_term_def.definitionsName, ' - ', payment_term_def.definitionsvalues) as payment_term_name,
            service_category_def.definitionsName as service_category_name,
            expense_type_def.definitionsName as expense_type_name,
            CONCAT(cost_center_def.cost_centre_code, ' - ', cost_center_def.cost_centre_desc) as cost_center_name,
            accounts_approver_info.FIRST_NAME as accounts_approver_name,
            mg_approved_by_info.FIRST_NAME as mg_approved_by_name,
            stores_approved_by_info.FIRST_NAME as stores_approved_by_name,
            accounts_verified_by_info.FIRST_NAME as accounts_verified_by_name,
            gfa_posted_by_info.FIRST_NAME as gfa_posted_by_name,
            rejected_by_info.FIRST_NAME as rejected_by_name
        ");
        $builder->where('fi_payment_header.payment_id', $id);
        $builder->join('fi_payment_line_items', 'fi_payment_line_items.payment_id = fi_payment_header.payment_id', 'left');
        $builder->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left');
        $builder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_payment_header.invoice_type', 'left');
        $builder->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left');
        $builder->join('definitions_list as service_category_def', 'service_category_def.id = fi_payment_header.service_category', 'left');
        $builder->join('definitions_list as expense_type_def', 'expense_type_def.id = fi_payment_line_items.expenses_type', 'left');
        $builder->join('user_cost_centre_mapping as cost_center_def', 'cost_center_def.id = fi_payment_line_items.cost_center_desc', 'left');
        // The assigned Accounts Approver for this line item's Cost Centre
        // mapping — distinct from accounts_verified_by_info, which only
        // resolves once verification has actually happened. This resolves
        // regardless, same as cost_center_name itself, so GFA can see who
        // was (or would be) responsible even when accounts_verification is
        // 'No' and the stage was skipped entirely.
        $builder->join('user_info as accounts_approver_info', 'accounts_approver_info.UI_ID = cost_center_def.reporting_accounts_id', 'left');
        $builder->join('user_info as mg_approved_by_info', 'mg_approved_by_info.UI_ID = fi_payment_header.mg_approved_by', 'left');
        $builder->join('user_info as stores_approved_by_info', 'stores_approved_by_info.UI_ID = fi_payment_header.stores_approved_by', 'left');
        $builder->join('user_info as accounts_verified_by_info', 'accounts_verified_by_info.UI_ID = fi_payment_header.accounts_verified_by', 'left');
        $builder->join('user_info as gfa_posted_by_info', 'gfa_posted_by_info.UI_ID = fi_payment_header.gfa_posted_by', 'left');
        $builder->join('user_info as rejected_by_info', 'rejected_by_info.UI_ID = fi_payment_header.rejected_by', 'left');

        $query = $builder->get();
        $result = $query->getResultArray();

        if (!empty($result)) {
            $migoDetails = $this->GetMigoDetailsForPayment($id);
            foreach ($result as &$row) {
                $row['migo_details'] = $migoDetails;
            }
            unset($row);
            return $result;
        }

        $headerBuilder = $this->db->table('fi_payment_header');
        $headerBuilder->select("
            fi_payment_header.*,
            user_info.FIRST_NAME as requested_by,
            invoice_type_def.definitionsName as invoice_type_name,
            CONCAT(payment_term_def.definitionsName, ' - ', payment_term_def.definitionsvalues) as payment_term_name,
            service_category_def.definitionsName as service_category_name,
            mg_approved_by_info.FIRST_NAME as mg_approved_by_name,
            stores_approved_by_info.FIRST_NAME as stores_approved_by_name,
            accounts_verified_by_info.FIRST_NAME as accounts_verified_by_name,
            gfa_posted_by_info.FIRST_NAME as gfa_posted_by_name,
            rejected_by_info.FIRST_NAME as rejected_by_name
        ");
        $headerBuilder->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left');
        $headerBuilder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_payment_header.invoice_type', 'left');
        $headerBuilder->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left');
        $headerBuilder->join('definitions_list as service_category_def', 'service_category_def.id = fi_payment_header.service_category', 'left');
        $headerBuilder->join('user_info as mg_approved_by_info', 'mg_approved_by_info.UI_ID = fi_payment_header.mg_approved_by', 'left');
        $headerBuilder->join('user_info as stores_approved_by_info', 'stores_approved_by_info.UI_ID = fi_payment_header.stores_approved_by', 'left');
        $headerBuilder->join('user_info as accounts_verified_by_info', 'accounts_verified_by_info.UI_ID = fi_payment_header.accounts_verified_by', 'left');
        $headerBuilder->join('user_info as gfa_posted_by_info', 'gfa_posted_by_info.UI_ID = fi_payment_header.gfa_posted_by', 'left');
        $headerBuilder->join('user_info as rejected_by_info', 'rejected_by_info.UI_ID = fi_payment_header.rejected_by', 'left');
        $headerBuilder->where('fi_payment_header.payment_id', $id);
        $headerQuery = $headerBuilder->get();
        $headerData = $headerQuery->getRowArray();

        if (!$headerData) {
            return [];
        }

        $headerData['migo_details'] = $this->GetMigoDetailsForPayment($id);
        return [$headerData];
    }

    // Fetches this payment's stored MIGO/VA rows and resolves their related
    // documents live (docs are never snapshotted into fi_payment_migo_details).
    private function GetMigoDetailsForPayment($paymentId)
    {
        $rows = $this->db->table('fi_payment_migo_details')->where('payment_id', $paymentId)->get()->getResultArray();
        foreach ($rows as &$row) {
            $row = array_merge($row, $this->GetMigoDocsOnly($row['migo_no'], $row['va_number']));
        }
        unset($row);
        return $rows;
    }

    public function GetDepartment($loginid)
    {
        $builder = $this->db->table('user_info');
        $builder->select('employee_master.emp_department as DEPARTMENT');
        $builder->join('employee_master', 'employee_master.emp_code = user_info.LOGIN_ID', 'left');
        $builder->where('user_info.UI_ID', $loginid);
        $builder->where('user_info.RecStatus', 1);

        return $builder->get()->getResultArray();
    }

    public function GetDivisions($loginid)
    {
        $builder = $this->db->table('user_info');
        $builder->select('employee_master.emp_division as value, employee_master.emp_division as label');
        $builder->join('employee_master', 'employee_master.emp_code = user_info.LOGIN_ID', 'left');
        $builder->where('user_info.UI_ID', $loginid);
        $builder->where('user_info.RecStatus', 1);

        return $builder->get()->getResultArray();
    }

    public function GetInvoiceTypes()
    {
        $builder = $this->db->query("SELECT id as value, definitionsName as label FROM definitions_list WHERE definitionsId = 45");
        return $builder->getResultArray();
    }
    public function GetServiceCategories()
    {
        $builder = $this->db->query("SELECT id as value, definitionsName as label FROM definitions_list WHERE definitionsId = 44");
        return $builder->getResultArray();
    }

    public function GetPaymentTerms()
    {
        $builder = $this->db->table("definitions_list");

        $builder->select("
        id AS value,
        CONCAT(definitionsName, ' - ', definitionsvalues) AS label
    ");

        $builder->where("isActive", 1);
        $builder->where("definitionsId", 46);

        return $builder->distinct()->get()->getResultArray();
    }

    public function GetExpenseTypes()
    {
        $builder = $this->db->table("definitions_list");
        $builder->select("id AS value, definitionsName AS label");
        $builder->where("isActive", 1);
        $builder->where("definitionsId", 47);

        return $builder->distinct()->get()->getResultArray();
    }

    public function GetExpenseTypesByUser($userId)
    {
        $builder = $this->db->table('expense_type_gl_mapping');
        $builder->select("
            expense_type_gl_mapping.expense_type_id AS value,
            definitions_list.definitionsName AS label,
            expense_type_gl_mapping.gl_code,
            expense_type_gl_mapping.gl_description
        ");
        $builder->join('definitions_list', 'definitions_list.id = expense_type_gl_mapping.expense_type_id', 'left');
        $builder->where('expense_type_gl_mapping.user_id', $userId);
        $builder->where('expense_type_gl_mapping.RecStatus', 1);
        $builder->where('expense_type_gl_mapping.deleted_at', null);

        return $builder->get()->getResultArray();
    }

    public function SaveExpenseTypeMapping($postData)
    {
        $data = [
            'user_id' => $postData->user_id,
            'expense_type_id' => $postData->expense_type_id,
            'gl_code' => $postData->gl_code,
            'gl_description' => $postData->gl_description,
            'RecStatus' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $this->db->table('expense_type_gl_mapping')->insert($data);
        return $this->db->insertID();
    }

    public function GetExpenseTypeMappingList()
    {
        $builder = $this->db->table('expense_type_gl_mapping');
        $builder->select("
            expense_type_gl_mapping.id,
            expense_type_gl_mapping.gl_code,
            expense_type_gl_mapping.gl_description,
            expense_type_gl_mapping.RecStatus,
            user_info.LOGIN_ID AS USER_NAME,
            definitions_list.definitionsName AS EXPENSE_TYPE_NAME
        ");
        $builder->join('user_info', 'user_info.UI_ID = expense_type_gl_mapping.user_id', 'left');
        $builder->join('definitions_list', 'definitions_list.id = expense_type_gl_mapping.expense_type_id', 'left');
        $builder->where('expense_type_gl_mapping.deleted_at', null);
        $builder->orderBy('expense_type_gl_mapping.id', 'DESC');

        return $builder->get()->getResultArray();
    }

    public function ToggleExpenseTypeMappingStatus($id, $status)
    {
        $this->db->table('expense_type_gl_mapping')->where('id', $id)->update(['RecStatus' => $status]);
        return true;
    }

    public function DeleteExpenseTypeMapping($id, $deletedBy)
    {
        $data = [
            'RecStatus' => 0,
            'deleted_by' => $deletedBy,
            'deleted_at' => date('Y-m-d H:i:s'),
        ];
        $this->db->table('expense_type_gl_mapping')->where('id', $id)->update($data);
        return true;
    }

    // One User + one Reporting Manager/Store Reporting/Reporting GFA combo can
    // now span several Cost Centres, submitted together as postData->cost_centres
    // (one entry per Cost Centre — code/desc/profit centre/business area/bank,
    // same shape as a GetCostCentreFromSap option). Kept denormalized: every
    // row still carries its own copy of the role fields (mapping_group_id just
    // marks which rows are siblings), so every other query that reads
    // reporting_manager_id/store_reporting_id/reporting_gfa_id/user_id straight
    // off this table needs no changes.
    //
    // Cost Centres sharing the same Profit Centre collapse onto a single row —
    // cost_centre_code/cost_centre_desc become comma lists of every Cost
    // Centre in that Profit Centre's group (Profit Centre/Business
    // Area/House Bank, shared across the group, stay single values); a
    // different Profit Centre always gets its own row. This is a deliberate
    // tradeoff: a line item referencing this row's id can no longer tell
    // which specific Cost Centre within that Profit Centre it picked.
    //
    // Editing (postData->id set) updates that one row with the first
    // Profit-Centre group and keeps every sibling row's role fields in sync,
    // then inserts new sibling rows for any additional groups — it never
    // removes a sibling no longer selected (that's the list's own per-row
    // Deactivate/Delete actions, unchanged).
    public function SaveCostCentreMapping($postData)
    {
        $roleData = [
            'user_id' => $postData->user_id,
            'reporting_manager_id' => $postData->reporting_manager_id ?? null,
            'store_reporting_id' => $postData->store_reporting_id ?? null,
            'reporting_gfa_id' => $postData->reporting_gfa_id ?? null,
            'accounts_verification' => $postData->accounts_verification ?? 'No',
            'reporting_accounts_id' => $postData->reporting_accounts_id ?? null,
        ];
        $costCentres = $postData->cost_centres ?? [];
        if (empty($costCentres)) {
            return ['success' => false, 'message' => 'At least one Cost Centre is required.'];
        }

        $groupId = !empty($postData->id) ? ($postData->mapping_group_id ?? $postData->id) : null;

        // Duplicate check: this exact User + Reporting Manager + Cost Centre
        // combination must not already exist on another active mapping —
        // Store Reporting/Reporting GFA aren't part of this check. Matches
        // via FIND_IN_SET (not equality) since either side's column can hold
        // a comma list (multiple Cost Centres sharing a Profit Centre, or a
        // legacy multi-value reporting_manager_id).
        $codes = array_unique(array_filter(array_map(
            fn ($cc) => $cc->cost_centre_code ?? $cc->value ?? null,
            $costCentres
        )));
        $duplicates = [];
        foreach ($codes as $code) {
            $dupBuilder = $this->db->table('user_cost_centre_mapping');
            $dupBuilder->where('user_id', $roleData['user_id']);
            $dupBuilder->where("FIND_IN_SET(" . $this->db->escape($code) . ", cost_centre_code) >", 0, false);
            $dupBuilder->where("FIND_IN_SET(" . $this->db->escape($roleData['reporting_manager_id']) . ", reporting_manager_id) >", 0, false);
            $dupBuilder->where('RecStatus', 1);
            $dupBuilder->where('deleted_at', null);
            if ($groupId) {
                $dupBuilder->where('mapping_group_id !=', $groupId);
            }
            if ($dupBuilder->get()->getRowArray()) {
                $duplicates[] = $code;
            }
        }
        if (!empty($duplicates)) {
            return [
                'success' => false,
                'message' => 'This User + Reporting Manager + Cost Centre combination already exists for: ' . implode(', ', $duplicates),
            ];
        }

        $this->db->transStart();

        // Group by Profit Centre, preserving first-occurrence order so the
        // group containing whatever was first in postData->cost_centres
        // stays first — the FE relies on that to keep the row being edited
        // at group index 0.
        $groups = [];
        foreach ($costCentres as $cc) {
            $key = $cc->profit_centre ?? '';
            $groups[$key][] = $cc;
        }
        $groups = array_values($groups);

        $groupRowData = function ($members) {
            $first = $members[0];
            return [
                'cost_centre_code' => implode(',', array_map(fn ($m) => $m->cost_centre_code ?? $m->value ?? '', $members)),
                'cost_centre_desc' => implode(',', array_map(fn ($m) => $m->cost_centre_desc ?? $m->description ?? '', $members)),
                'profit_centre' => $first->profit_centre ?? null,
                'profit_centre_desc' => $first->profit_centre_desc ?? null,
                'business_area' => $first->business_area ?? null,
                'house_bank_id' => $first->house_bank_id ?? null,
                'house_bank_ac_no' => $first->house_bank_ac_no ?? null,
            ];
        };

        if (!empty($postData->id)) {
            $this->db->table('user_cost_centre_mapping')->where('mapping_group_id', $groupId)->update($roleData);
            $this->db->table('user_cost_centre_mapping')->where('id', $postData->id)
                ->update(array_merge($roleData, $groupRowData($groups[0])));

            for ($i = 1; $i < count($groups); $i++) {
                $this->db->table('user_cost_centre_mapping')->insert(array_merge($roleData, $groupRowData($groups[$i]), [
                    'mapping_group_id' => $groupId,
                    'RecStatus' => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                ]));
            }

            $this->db->transComplete();
            return ['success' => true, 'message' => 'Cost Centre Mapping updated successfully.', 'id' => $postData->id];
        }

        $firstId = null;
        foreach ($groups as $i => $members) {
            $row = array_merge($roleData, $groupRowData($members), [
                'RecStatus' => 1,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            if ($i === 0) {
                $this->db->table('user_cost_centre_mapping')->insert($row);
                $firstId = $this->db->insertID();
                $this->db->table('user_cost_centre_mapping')->where('id', $firstId)->update(['mapping_group_id' => $firstId]);
            } else {
                $row['mapping_group_id'] = $firstId;
                $this->db->table('user_cost_centre_mapping')->insert($row);
            }
        }

        $this->db->transComplete();
        return ['success' => true, 'message' => 'Cost Centre Mapping saved successfully.', 'id' => $firstId];
    }

    public function GetCostCentreMappingList()
    {
        $builder = $this->db->table('user_cost_centre_mapping');
        $builder->select("
            user_cost_centre_mapping.id,
            user_cost_centre_mapping.mapping_group_id,
            user_cost_centre_mapping.user_id,
            user_cost_centre_mapping.reporting_manager_id,
            user_cost_centre_mapping.store_reporting_id,
            user_cost_centre_mapping.reporting_gfa_id,
            user_cost_centre_mapping.accounts_verification,
            user_cost_centre_mapping.reporting_accounts_id,
            user_cost_centre_mapping.cost_centre_code,
            user_cost_centre_mapping.cost_centre_desc,
            user_cost_centre_mapping.profit_centre,
            user_cost_centre_mapping.profit_centre_desc,
            user_cost_centre_mapping.business_area,
            user_cost_centre_mapping.house_bank_id,
            user_cost_centre_mapping.house_bank_ac_no,
            user_cost_centre_mapping.RecStatus,
            user_info.LOGIN_ID AS USER_NAME,
            accounts_verifier_info.LOGIN_ID AS ACCOUNTS_VERIFIER_NAME,
            (SELECT GROUP_CONCAT(ui.LOGIN_ID ORDER BY FIND_IN_SET(ui.UI_ID, user_cost_centre_mapping.reporting_manager_id) SEPARATOR ', ')
                FROM user_info ui WHERE FIND_IN_SET(ui.UI_ID, user_cost_centre_mapping.reporting_manager_id)) AS REPORTING_MANAGER_NAME,
            (SELECT GROUP_CONCAT(ui.LOGIN_ID ORDER BY FIND_IN_SET(ui.UI_ID, user_cost_centre_mapping.store_reporting_id) SEPARATOR ', ')
                FROM user_info ui WHERE FIND_IN_SET(ui.UI_ID, user_cost_centre_mapping.store_reporting_id)) AS STORE_REPORTING_NAME,
            (SELECT GROUP_CONCAT(ui.LOGIN_ID ORDER BY FIND_IN_SET(ui.UI_ID, user_cost_centre_mapping.reporting_gfa_id) SEPARATOR ', ')
                FROM user_info ui WHERE FIND_IN_SET(ui.UI_ID, user_cost_centre_mapping.reporting_gfa_id)) AS REPORTING_GFA_NAME
        ");
        $builder->join('user_info', 'user_info.UI_ID = user_cost_centre_mapping.user_id', 'left');
        $builder->join('user_info AS accounts_verifier_info', 'accounts_verifier_info.UI_ID = user_cost_centre_mapping.reporting_accounts_id', 'left');
        $builder->where('user_cost_centre_mapping.deleted_at', null);
        $builder->orderBy('user_cost_centre_mapping.id', 'DESC');

        return $builder->get()->getResultArray();
    }

    // A mapping row can bundle several Cost Centres at once when they share
    // one Profit Centre — cost_centre_code/cost_centre_desc become comma
    // lists in that case (same convention as reporting_manager_id etc., and
    // the same shape the Cost Centre Mapping screen's expandRow() reconstructs
    // client-side for its own list). Split each row into one option per Cost
    // Centre here too, so a dropdown built from this never shows a
    // "FM01-ADMIN,FM01-ACCTS,FM01-MILLI" glued-together label — every split
    // option keeps the same mapping id/profit centre/business area/bank info,
    // since those are genuinely shared across the bundled cost centres.
    public function GetCostCentresByUser($userId)
    {
        $builder = $this->db->table('user_cost_centre_mapping');
        $builder->select("
            id AS value,
            cost_centre_code,
            cost_centre_desc,
            profit_centre,
            profit_centre_desc,
            house_bank_id,
            house_bank_ac_no,
            business_area
        ");
        $builder->where('user_id', $userId);
        $builder->where('RecStatus', 1);
        $builder->where('deleted_at', null);

        $rows = $builder->get()->getResultArray();

        $options = [];
        foreach ($rows as $row) {
            $codes = array_values(array_filter(array_map('trim', explode(',', $row['cost_centre_code'] ?? ''))));
            $descs = array_map('trim', explode(',', $row['cost_centre_desc'] ?? ''));

            foreach ($codes as $i => $code) {
                $desc = $descs[$i] ?? '';
                $options[] = [
                    'value'              => $row['value'],
                    'label'              => trim($code . ' - ' . $desc),
                    'cost_centre_code'   => $code,
                    'cost_centre_desc'   => $desc,
                    'profit_centre'      => $row['profit_centre'],
                    'profit_centre_desc' => $row['profit_centre_desc'],
                    'house_bank_id'      => $row['house_bank_id'],
                    'house_bank_ac_no'   => $row['house_bank_ac_no'],
                    'business_area'      => $row['business_area'],
                ];
            }
        }

        return $options;
    }

    public function ToggleCostCentreMappingStatus($id, $status)
    {
        $this->db->table('user_cost_centre_mapping')->where('id', $id)->update(['RecStatus' => $status]);
        return true;
    }

    public function DeleteCostCentreMapping($id, $deletedBy)
    {
        $data = [
            'RecStatus' => 0,
            'deleted_by' => $deletedBy,
            'deleted_at' => date('Y-m-d H:i:s'),
        ];
        $this->db->table('user_cost_centre_mapping')->where('id', $id)->update($data);
        return true;
    }

    public function GetDepartmentsByUser($userId)
    {
        $builder = $this->db->table('user_department_mapping');
        $builder->select("
            id AS value,
            emp_department AS label
        ");
        $builder->where('user_id', $userId);
        $builder->where('RecStatus', 1);
        $builder->where('deleted_at', null);

        return $builder->get()->getResultArray();
    }

    public function GetEmpDepartments()
    {
        $builder = $this->db->table('employee_master');
        $builder->select("emp_department AS value, emp_department AS label");
        $builder->where('emp_department IS NOT NULL', null, false);
        $builder->where('emp_department !=', '');
        $builder->groupBy('emp_department');
        $builder->orderBy('emp_department', 'ASC');

        return $builder->get()->getResultArray();
    }

    public function SaveDepartmentMapping($postData)
    {
        $data = [
            'user_id' => $postData->user_id,
            'emp_department' => $postData->emp_department,
            'RecStatus' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $this->db->table('user_department_mapping')->insert($data);
        return $this->db->insertID();
    }

    public function GetDepartmentMappingList()
    {
        $builder = $this->db->table('user_department_mapping');
        $builder->select("
            user_department_mapping.id,
            user_department_mapping.emp_department,
            user_department_mapping.RecStatus,
            user_info.LOGIN_ID AS USER_NAME
        ");
        $builder->join('user_info', 'user_info.UI_ID = user_department_mapping.user_id', 'left');
        $builder->where('user_department_mapping.deleted_at', null);
        $builder->orderBy('user_department_mapping.id', 'DESC');

        return $builder->get()->getResultArray();
    }

    public function ToggleDepartmentMappingStatus($id, $status)
    {
        $this->db->table('user_department_mapping')->where('id', $id)->update(['RecStatus' => $status]);
        return true;
    }

    public function DeleteDepartmentMapping($id, $deletedBy)
    {
        $data = [
            'RecStatus' => 0,
            'deleted_by' => $deletedBy,
            'deleted_at' => date('Y-m-d H:i:s'),
        ];
        $this->db->table('user_department_mapping')->where('id', $id)->update($data);
        return true;
    }
}