<?php

namespace App\Controllers\Api\Cron;

use App\Controllers\BaseController;
use App\Models\CourierModel;

class CourierremainderController extends BaseController
{
    public function courierremainder()
    {
        $model = new CourierModel();
        $latestDetail = $model->sendmailremainder();


        $groupedDetails = [];
        foreach ($latestDetail as $detail) {
            $emp_id = $detail['emp_id'];

            $groupedDetails[$emp_id][] = $detail;
        }
        foreach ($groupedDetails as $emp_id => $details) {
            $totalBulkCount = 0;
            $recipientDetail = $details[0];
            $res_mailid = $recipientDetail['emp_mail_id'];
            $userName3 = $recipientDetail['emp_name'];
            $res_empid = $recipientDetail['emp_id'];
            $res_status = $recipientDetail['emp_status'];
            $res_otp = $recipientDetail['otp'];
            $max_remainder_count = '';
            foreach ($details as $row) {
                $totalBulkCount += isset($row['bulk_count']) ? $row['bulk_count'] : 1;
                $remainder_count = $row['remainder_count'];
                if ($remainder_count > $max_remainder_count) {
                    $max_remainder_count = $remainder_count;
                }
            }
            $rep_id = $model->getresid($recipientDetail['created_by']);
            $rep_name = $rep_id[0]['FIRST_NAME'];
            $rep_mobile = $rep_id[0]['MOBILE_NUMBER'];
            $rep_mailid = $rep_id[0]['MAIL_ID'];
            $res_division = $rep_id[0]['emp_division'];
            $couriercount = $totalBulkCount;
            $otp1 = "$res_otp  is for your $couriercount courier(s)";
            if ($res_mailid != '') {
                $ccmail = ['nlsdappexe2@nagamills.com'];
                $subject = $max_remainder_count > 0 ? 'Reminder for Couriers - Reminder: ' . $max_remainder_count : 'Reminder for Couriers';
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
                
                <p style="font-size: 1.1em;">Dear ' . $userName3 . ',</p>
                <p>Please collect your  couriers from Reception at your earliest convenience.</p>
            
                <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
                   
                <thead>
                <tr>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Unique number</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">OTP</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Name</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">From Person</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Entry Date</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Bulk Count</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Remainder Count</th>
                
                </tr>
            </thead>
            <tbody>';
                foreach ($details as $row) {
                    $entryDate = date('d/m/Y', strtotime($row['entry_date']));
                    $row_bulk_count = isset($row['bulk_count']) ? $row['bulk_count'] : 1;
                    $remainder_count = $row['remainder_count'] > 0 ? $row['remainder_count'] : '-';

                    $message .= '<tr>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['transcation_unique_no'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['otp'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_name'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_from'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $entryDate . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row_bulk_count . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $remainder_count . '</td>
                </tr>';
                }
                $message .= '</tbody></table>
            <p style="font-size: 0.9em;">For Contact,<br />' . $rep_name . '-' . $rep_mobile . '</p>
                <br/>
                <p style="font-size: 0.9em;">Regards,<br /> ' . $res_division . '</p></div>
                </body>
                </html>';

                foreach ($details as $row) {
                    $updatedRemainderCount = $row['remainder_count'] + 1;
                    $model->updateRemainderCount($row['id'], $updatedRemainderCount);
                }
                $email = \Config\Services::email();
                $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION ');
                $email->setTo($res_mailid);
                $email->setBcc($ccmail);
                $email->setCc($res_status == 1 ? $rep_mailid : "");
                $email->setSubject($subject);
                $email->setMessage($message);
                 $email->send();
                
            }
        }
    }
}
