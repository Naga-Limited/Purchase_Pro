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
        $data = [
            'payment_voucher_no' => $postData->payment_voucher_no ?? null,
            'utr_number'         => $postData->utr_number ?? null,
        ];

        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($data);

        return ['success' => true, 'message' => 'Payment voucher details updated.', 'payment_id' => $id];
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
            'BELNR'     => $header['sap_document_no'],
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

    public function InsertFIPayment($postData, $paymentNo)
    {
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
        $this->db->transStart();

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

        // Update existing line items in place (matched by line_id) and insert
        // any newly-added rows — never delete, even for rows the user removed
        // in the UI, so no line item is ever dropped from the DB on resubmit.
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
            if (!empty($item->line_id)) {
                $this->db->table('fi_payment_line_items')
                    ->where('line_id', $item->line_id)->where('payment_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_payment_line_items')->insert($data + ['payment_id' => $id]);
            }
        }

        // Same update-in-place / insert-new rule for MIGO rows.
        foreach ($postData->migo_items ?? [] as $m) {
            $data = [
                'migo_no'   => $m->migo_no ?? null,
                'va_number' => $m->va_number ?? null,
            ];
            if (!empty($m->migo_detail_id)) {
                $this->db->table('fi_payment_migo_details')
                    ->where('migo_detail_id', $m->migo_detail_id)->where('payment_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_payment_migo_details')->insert($data + ['payment_id' => $id]);
            }
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
    public function UpdateGFADetails($id, $postData)
    {
        $this->db->transStart();

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
            if (!empty($item->line_id)) {
                $this->db->table('fi_payment_line_items')
                    ->where('line_id', $item->line_id)->where('payment_id', $id)
                    ->update($data);
            } else {
                $this->db->table('fi_payment_line_items')->insert($data + ['payment_id' => $id]);
            }
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
    public function GetFIPaymentReport($fromDate, $toDate, $search = '')
    {
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
                WHEN 10 THEN 'Rejected'
                ELSE 'Unknown'
            END as approval_status_label,
            fi_payment_header.mg_approved_at,
            fi_payment_header.stores_approved_at,
            fi_payment_header.gfa_posted_at,
            fi_payment_header.rejected_at,
            fi_payment_header.rejection_remarks,
            fi_payment_header.invoice_copy,
            fi_payment_header.back_paper
        ");
        $builder->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left');
        $builder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_payment_header.invoice_type', 'left');
        $builder->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left');
        $builder->join('definitions_list as service_category_def', 'service_category_def.id = fi_payment_header.service_category', 'left');
        $builder->where('DATE(fi_payment_header.created_at) >=', $fromDate);
        $builder->where('DATE(fi_payment_header.created_at) <=', $toDate);

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

    // approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager, 3 = Rejected
    public function GetFIPaymentList($start = 0, $pageSize = 25, $search = '', $approvalStatus = 1, $userId = null, $reportingManagerId = null, $storeReportingId = null)
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
            $builder->whereIn('payment_id', function ($sub) use ($reportingManagerId) {
                return $sub->select('fi_payment_line_items.payment_id')->from('fi_payment_line_items')
                    ->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc')
                    ->where('user_cost_centre_mapping.reporting_manager_id', $reportingManagerId)
                    ->where('user_cost_centre_mapping.RecStatus', 1)
                    ->where('user_cost_centre_mapping.deleted_at', null);
            });
        }
        if (!empty($storeReportingId)) {
            $builder->whereIn('created_by', function ($sub) use ($storeReportingId) {
                return $sub->select('user_id')->from('user_cost_centre_mapping')
                    ->where('store_reporting_id', $storeReportingId)
                    ->where('RecStatus', 1)
                    ->where('deleted_at', null);
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
            created_at,
            DATEDIFF(NOW(), created_at) AS duration_days
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
    private function GetPendingApprovalsForRole($mappingField, array $statuses, $excludeStatuses = false)
    {
        $builder = $this->db->table('fi_payment_header');
        $builder->select("
            fi_payment_header.payment_id,
            fi_payment_header.unique_payment_no as request_no,
            fi_payment_header.vendor_name,
            fi_payment_header.department,
            fi_payment_header.payment_to,
            fi_payment_header.emp_name,
            fi_payment_header.gst_registered,
            fi_payment_header.gst_vendor_name,
            fi_payment_header.invoice_number as doc_no,
            fi_payment_header.total_amount,
            fi_payment_header.approval_status,
            user_cost_centre_mapping.{$mappingField} as recipient_id,
            recipient_info.MAIL_ID as recipient_mail,
            recipient_info.FIRST_NAME as recipient_name
        ");
        $builder->join('fi_payment_line_items', 'fi_payment_line_items.payment_id = fi_payment_header.payment_id', 'inner');
        $builder->join('user_cost_centre_mapping', 'user_cost_centre_mapping.id = fi_payment_line_items.cost_center_desc', 'inner');
        $builder->join('user_info as recipient_info', "recipient_info.UI_ID = user_cost_centre_mapping.{$mappingField}", 'left');
        $builder->where('user_cost_centre_mapping.RecStatus', 1);
        $builder->where('user_cost_centre_mapping.deleted_at', null);
        if ($excludeStatuses) {
            $builder->whereNotIn('fi_payment_header.approval_status', $statuses);
        } else {
            $builder->whereIn('fi_payment_header.approval_status', $statuses);
        }
        $builder->groupBy("fi_payment_header.payment_id, user_cost_centre_mapping.{$mappingField}");

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

    // approval_status: 1 = Pending Manager Approval, 2 = Approved by Manager
    // (waiting on Store Acknowledge), 4 = Store Acknowledged (waiting on GFA
    // Verification), 5 = GFA Verified (Completed), 10 = Rejected
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

        $this->db->table('fi_payment_header')->where('payment_id', $id)->update($data);

        if ((int) $status === 10) {
            $this->SendRejectionEmail($id, $remarks);
        }

        return ['success' => true, 'message' => (int) $status === 10 ? 'Payment rejected.' : 'Payment approved.'];
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
        $email->setSubject($subject);
        $email->setMessage($message);

        if (!$email->send()) {
            log_message('error', print_r($email->printDebugger(['headers', 'subject', 'body']), true));
        }
    }

    // GFA Verification approve step: posts the invoice to SAP (ZZFI_EXP_POST)
    // and, only on a successful SAP response, marks the request GFA Verified.
    public function VerifyAndPostToSap($id, $userId, $tdsCode, $tdsDescription, $postingDate)
    {
        $header = $this->db->table('fi_payment_header')
            ->select('fi_payment_header.*, payment_term_def.definitionsName as pay_term_code')
            ->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left')
            ->where('fi_payment_header.payment_id', $id)
            ->get()->getRowArray();
        if (!$header) {
            return ['success' => false, 'message' => 'Payment request not found.'];
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

        // print_r($invoiceFile);
        // print_r($backPaperFile);exit;

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

        // print_r($SAP_DATA);exit; // Debugging: print the SAP data being sent

        // print_r($SAP_DATA);exit;

        $urlPath = "ZZGP_API/ZZFI_EXP_POST/fiexp?SAP-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$SAP_DATA]));

        // print_r($res); exit;// Debugging: print the SAP response

        $resRow    = is_array($res) && isset($res[0]) ? $res[0] : null;
        $status    = $resRow->STATUS ?? 0;
        $empStatus = $resRow->EMP_STATUS ?? 0;
        // print_r($status);exit;

        // Only requests that actually sent emp_code (Employee + gst_vendor_code
        // set) get a second, Employee-side SAP document, so only those need
        // EMP_STATUS == 1 too. Plain Vendor requests, and Employee requests
        // without a gst_vendor_code, only ever post the GL document.
        $docNo    = $resRow->DOCUMENT_NO ?? '';
            $empDocNo = $requiresEmpDoc ? ($resRow->EMP_DOCUMENT_NO ?? '') : '';
        $success =  ($empStatus < 2 &&  $requiresEmpDoc && $empDocNo ) ||  ($status < 2 && $docNo);

        if ($success) {
            $this->db->table('fi_payment_header')->where('payment_id', $id)->update([
                'approval_status'     => 5,
                'gfa_posted_by'       => $userId,
                'gfa_posted_at'       => date('Y-m-d H:i:s'),
                'tds_code'            => $tdsCode,
                'tds_description'     => $tdsDescription,
                'sap_posting_date'    => date('Y-m-d', strtotime($postingDateFmt)),
                'sap_document_no'     => $resRow->DOCUMENT_NO ?? null,
                'emp_sap_document_no' => $requiresEmpDoc ? ($resRow->EMP_DOCUMENT_NO ?? null) : null,
            ]);

            

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
            CONCAT(cost_center_def.cost_centre_code, ' - ', cost_center_def.cost_centre_desc) as cost_center_name
        ");
        $builder->where('fi_payment_header.payment_id', $id);
        $builder->join('fi_payment_line_items', 'fi_payment_line_items.payment_id = fi_payment_header.payment_id', 'left');
        $builder->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left');
        $builder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_payment_header.invoice_type', 'left');
        $builder->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left');
        $builder->join('definitions_list as service_category_def', 'service_category_def.id = fi_payment_header.service_category', 'left');
        $builder->join('definitions_list as expense_type_def', 'expense_type_def.id = fi_payment_line_items.expenses_type', 'left');
        $builder->join('user_cost_centre_mapping as cost_center_def', 'cost_center_def.id = fi_payment_line_items.cost_center_desc', 'left');

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
            service_category_def.definitionsName as service_category_name
        ");
        $headerBuilder->join('user_info', 'user_info.UI_ID = fi_payment_header.created_by', 'left');
        $headerBuilder->join('definitions_list as invoice_type_def', 'invoice_type_def.id = fi_payment_header.invoice_type', 'left');
        $headerBuilder->join('definitions_list as payment_term_def', 'payment_term_def.id = fi_payment_header.payment_term', 'left');
        $headerBuilder->join('definitions_list as service_category_def', 'service_category_def.id = fi_payment_header.service_category', 'left');
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

    public function SaveCostCentreMapping($postData)
    {
        // print_r($postData);exit;
        $data = [
            'user_id' => $postData->user_id,
            'reporting_manager_id' => $postData->reporting_manager_id ?? null,
            'store_reporting_id' => $postData->store_reporting_id ?? null,
            'reporting_gfa_id' => $postData->reporting_gfa_id ?? null,
            'cost_centre_code' => $postData->cost_centre_code,
            'cost_centre_desc' => $postData->cost_centre_desc,
            'profit_centre' => $postData->profit_centre,
            'profit_centre_desc' => $postData->profit_centre_desc,
            'business_area' => $postData->business_area ?? null,
            'house_bank_id' => $postData->house_bank_id,
            'house_bank_ac_no' => $postData->house_bank_ac_no,
        ];

        if (!empty($postData->id)) {
            $this->db->table('user_cost_centre_mapping')->where('id', $postData->id)->update($data);
            return $postData->id;
        }

        $data['RecStatus'] = 1;
        $data['created_at'] = date('Y-m-d H:i:s');
        $this->db->table('user_cost_centre_mapping')->insert($data);
        return $this->db->insertID();
    }

    public function GetCostCentreMappingList()
    {
        $builder = $this->db->table('user_cost_centre_mapping');
        $builder->select("
            user_cost_centre_mapping.id,
            user_cost_centre_mapping.user_id,
            user_cost_centre_mapping.reporting_manager_id,
            user_cost_centre_mapping.store_reporting_id,
            user_cost_centre_mapping.reporting_gfa_id,
            user_cost_centre_mapping.cost_centre_code,
            user_cost_centre_mapping.cost_centre_desc,
            user_cost_centre_mapping.profit_centre,
            user_cost_centre_mapping.profit_centre_desc,
            user_cost_centre_mapping.business_area,
            user_cost_centre_mapping.house_bank_id,
            user_cost_centre_mapping.house_bank_ac_no,
            user_cost_centre_mapping.RecStatus,
            user_info.LOGIN_ID AS USER_NAME,
            rm_info.LOGIN_ID AS REPORTING_MANAGER_NAME,
            store_info.LOGIN_ID AS STORE_REPORTING_NAME,
            gfa_info.LOGIN_ID AS REPORTING_GFA_NAME
        ");
        $builder->join('user_info', 'user_info.UI_ID = user_cost_centre_mapping.user_id', 'left');
        $builder->join('user_info AS rm_info', 'rm_info.UI_ID = user_cost_centre_mapping.reporting_manager_id', 'left');
        $builder->join('user_info AS store_info', 'store_info.UI_ID = user_cost_centre_mapping.store_reporting_id', 'left');
        $builder->join('user_info AS gfa_info', 'gfa_info.UI_ID = user_cost_centre_mapping.reporting_gfa_id', 'left');
        $builder->where('user_cost_centre_mapping.deleted_at', null);
        $builder->orderBy('user_cost_centre_mapping.id', 'DESC');

        return $builder->get()->getResultArray();
    }

    public function GetCostCentresByUser($userId)
    {
        $builder = $this->db->table('user_cost_centre_mapping');
        $builder->select("
            id AS value,
            CONCAT(cost_centre_code, ' - ', cost_centre_desc) AS label,
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

        return $builder->get()->getResultArray();
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