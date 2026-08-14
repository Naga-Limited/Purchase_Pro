<?php

namespace App\Controllers\Api\Cron;

use App\Controllers\BaseController;
use App\Models\FIPaymentModel;
use App\Models\CreditMemoModel;

// Reminds the Reporting Manager / Store Reporting / Reporting GFA contacts
// (user_cost_centre_mapping) of FI Payment and Credit Memo requests still
// awaiting their action. Same per-recipient grouping + HTML table pattern as
// CourierremainderController.
class ApprovalReminderController extends BaseController
{
    private const STATUS_LABELS = [
        1  => 'Pending Manager Approval',
        2  => 'Pending Store Acknowledge',
        4  => 'Pending GFA Verification',
        5  => 'GFA Verified',
        10 => 'Rejected',
    ];

    // Always-CC'd addresses on the GFA reminder, plus extra addresses per
    // division (fi_payment_header.division / fi_credit_memo_header.division)
    // — a GFA email can bundle items from several divisions at once, so all
    // divisions present get their addresses merged in.
    private const GFA_CC_ALWAYS = ['sf3@nagamills.com', 'sf16@nagamills.com', 'sf13@nagamills.com'];
    private const GFA_CC_BY_DIVISION = [
        'NLFD'   => ['ff2@nagamills.com', 'ff1@nagamills.com'],
        'NLCD'   => ['cf1@nagamills.com'],
        'NLCD 1' => ['cf1@nagamills.com'],
        'NLCD 2' => ['cf1@nagamills.com'],
        'NLIF'   => ['if1@nagamills.com', 'if4@nagamills.com'],
        'NLMT'   => ['mf2@nagamills.com', 'mf1@nagamills.com'],
        'NLDV'   => ['df2@nagamills.com'],
    ];

    public function fipaymentreminder()
    {
        $model = new FIPaymentModel();
        $this->sendRemindersForRole($model->GetPendingForReportingManager(), 'FI Payment', 'Manager Approval');
        $this->sendRemindersForRole($model->GetPendingForStoreReporting(), 'FI Payment', 'Store Acknowledge');
        $this->sendRemindersForRole($model->GetPendingForReportingGfa(), 'FI Payment', 'GFA Verification', false);
    }

    public function creditmemoreminder()
    {
        $model = new CreditMemoModel();
        $this->sendRemindersForRole($model->GetPendingForReportingManager(), 'Credit Memo', 'Manager Approval');
        $this->sendRemindersForRole($model->GetPendingForStoreReporting(), 'Credit Memo', 'Store Acknowledge');
        $this->sendRemindersForRole($model->GetPendingForReportingGfa(), 'Credit Memo', 'GFA Verification', false);
    }

    // Pulls the SAP bank-clearing/UTR details (ZZFI_PAY_UTR) for every FI
    // Payment that's already GFA Verified (approval_status = 5) — earlier
    // stages don't have a sap_document_no/sap_posting_date yet, which
    // GetUtrNumberFromSap requires. Reuses GetFIPaymentList rather than a new
    // query, same as the reminder functions reuse GetPendingFor*. Rows that
    // already have both payment_voucher_no and utr_number are skipped —
    // nothing left for SAP to tell us there.
    public function fipaymentutrfetch()
    {
        $model = new FIPaymentModel();
        $data = $model->GetFIPaymentList(0, 100000, '', 5);
        foreach ($data['results'] as $row) {
            if (!empty($row['payment_voucher_no']) && !empty($row['utr_number'])) {
                continue;
            }
            $model->GetUtrNumberFromSap($row['payment_id']);
        }
    }

    // Credit Memo equivalent of fipaymentutrfetch() above.
    public function creditmemoutrfetch()
    {
        $model = new CreditMemoModel();
        $data = $model->GetCreditMemoList(0, 100000, '', 5);
        foreach ($data['results'] as $row) {
            if (!empty($row['payment_voucher_no']) && !empty($row['utr_number'])) {
                continue;
            }
            $model->GetUtrNumberFromSap($row['credit_memo_id']);
        }
    }

    // Checks SAP for documents reversed as of today and rolls each affected
    // request back from GFA Verified (5) to Store Acknowledged (4), across
    // both FI Payment and Credit Memo, so it re-enters the GFA queue.
    public function reversalcheck($date = null)
    {
        $date = $date ? date('Ymd', strtotime($date)) : null;
        $today = date('Ymd');
        $fiModel = new FIPaymentModel();
        $reversals = $fiModel->GetReversedDocumentsFromSap($date ?: $today);
        if (empty($reversals)) {
            return;
        }

        $fiModel->RevertReversedDocuments($reversals);

        $cmModel = new CreditMemoModel();
        $cmModel->RevertReversedDocuments($reversals);
    }

    // Groups pending rows by recipient email and, when $splitByStatus is true,
    // also by approval_status — sending one email per (recipient, status)
    // pair rather than lumping every status a recipient is pending on into a
    // single email. GFA is called with $splitByStatus = false instead: its
    // queue spans statuses 1/2/4 at once and all of them should be visible
    // together in one consolidated email, so it groups by recipient only and
    // each row shows its own real status in the Status column.
    private function sendRemindersForRole(array $rows, string $moduleLabel, string $stageLabel, bool $splitByStatus = true)
    {
        $grouped = [];
        foreach ($rows as $row) {
            if (empty($row['recipient_mail'])) {
                continue;
            }
            $bucket = $splitByStatus ? (int) $row['approval_status'] : 'all';
            $grouped[$row['recipient_mail']][$bucket][] = $row;
        }

        $docLabel = $moduleLabel === 'Credit Memo' ? 'Memo No' : 'Invoice Number';

        foreach ($grouped as $recipientMail => $byBucket) {
            foreach ($byBucket as $bucket => $items) {
                $recipientName = $items[0]['recipient_name'] ?? '';
                // GFA recipients are addressed as a team (the GFA queue can be
                // shared across more than one person), not by individual name.
                $greetingName  = $stageLabel === 'GFA Verification' ? 'team' : $recipientName;
                $statusLabel   = $splitByStatus ? (self::STATUS_LABELS[$bucket] ?? $stageLabel) : $stageLabel;

                $rowsHtml = '';
                foreach ($items as $item) {
                    $itemStatusLabel = self::STATUS_LABELS[(int) $item['approval_status']] ?? $stageLabel;
                    $pendingSince    = $this->formatPendingDuration((int) ($item['pending_seconds'] ?? 0));
                    $rowsHtml .= '<tr>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($item['request_no']) . '</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($this->resolveVendorDisplayName($item)) . '</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($item['department'] ?? '') . '</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($item['doc_no']) . '</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($item['total_amount']) . '</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($itemStatusLabel) . '</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . esc($pendingSince) . '</td>
                    </tr>';
                }

                $subject = "Pending {$moduleLabel} Requests - {$statusLabel}";

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

                    <p style="font-size: 1.1em;">Dear ' . esc($greetingName) . ',</p>
                    <p>The following ' . esc($moduleLabel) . ' requests are awaiting ' . esc($statusLabel) . '.</p>

                    <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">

                    <thead>
                    <tr>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Request No</th>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Vendor Name</th>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Department</th>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">' . $docLabel . '</th>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Amount</th>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Status</th>
                    <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Pending Since</th>
                    </tr>
                </thead>
                <tbody>' . $rowsHtml . '</tbody></table>
                    <br/>
                    <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p></div>
                    </body>
                    </html>';


                $email = \Config\Services::email();
                $email->setFrom('noreply@nagamills.com', $moduleLabel . ' Reminder');
                $email->setTo($recipientMail);
                $email->setBcc('st17@nagamills.com');
                $email->setSubject($subject);
                $email->setMessage($message);

                if ($stageLabel === 'GFA Verification') {
                    $email->setCc($this->buildGfaCcList($items));
                }
                
                if (!$email->send()) {
                    log_message('error', print_r($email->printDebugger(['headers', 'subject', 'body']), true));
                }
            }
        }
    }

    // Static GFA_CC_ALWAYS addresses plus every GFA_CC_BY_DIVISION address for
    // each distinct division present among $items — a consolidated GFA email
    // can bundle requests from several divisions in one go.
    private function buildGfaCcList(array $items)
    {
        $cc = self::GFA_CC_ALWAYS;
        $divisions = array_unique(array_filter(array_map(function ($item) {
            return strtoupper(trim($item['division'] ?? ''));
        }, $items)));

        foreach ($divisions as $division) {
            if (!empty(self::GFA_CC_BY_DIVISION[$division])) {
                $cc = array_merge($cc, self::GFA_CC_BY_DIVISION[$division]);
            }
        }

        return array_values(array_unique($cc));
    }

    // FI Payment rows carry payment_to/emp_name/gst_registered/gst_vendor_name;
    // Credit Memo rows don't (no payment_to column there), so this always
    // falls back to plain vendor_name for those.
    private function resolveVendorDisplayName(array $item)
    {
        if (!array_key_exists('payment_to', $item)) {
            return $item['vendor_name'] ?? '';
        }

        $isEmployee = strtolower(trim($item['payment_to'] ?? '')) === 'employee';
        if (!$isEmployee) {
            return $item['vendor_name'] ?? '';
        }

        $isGstRegistered = (int) ($item['gst_registered'] ?? 0) === 1;
        if ($isGstRegistered && !empty($item['gst_vendor_name'])) {
            return trim(($item['emp_name'] ?? '') . ' / ' . $item['gst_vendor_name']);
        }

        return $item['emp_name'] ?? '';
    }

    // Formats a duration (seconds since created_at, from the model's
    // TIMESTAMPDIFF) as "Xd Yh Zm" for the Pending Since column.
    private function formatPendingDuration(int $seconds)
    {
        if ($seconds < 0) {
            $seconds = 0;
        }

        $days    = intdiv($seconds, 86400);
        $hours   = intdiv($seconds % 86400, 3600);
        $minutes = intdiv($seconds % 3600, 60);

        return "{$days}d {$hours}h {$minutes}m";
    }
}
