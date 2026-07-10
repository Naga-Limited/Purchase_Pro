<?php

namespace App\Controllers\Api;
//use App\Controllers\BaseController;

use App\Helpers\VANumberHelper;
use App\Models\CourierModel;


date_default_timezone_set("Asia/Calcutta");
class CourierMaster extends BaseApiController
{
    public function getCourierCompanyid()
    {
        $master = new CourierModel();
        return $this->sendSuccessResult($master->getCourierCompanyid());
    }
    public function GetEmployeeName($plant_code = null)
    {
        $master = new CourierModel();
        return $this->sendSuccessResult($master->GetEmployeeName($plant_code));
    }
    public function getdelivery_Employee()
    {
        $master = new CourierModel();
        return $this->sendSuccessResult($master->getdelivery_Employee());
    }

    public function getCourierDetailsById()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->getCourierDetailsById($postData->id);
        return  $this->sendSuccessResult($res);
    }

    public function getReceiverDetailsById()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->getReceiverDetailsById($postData->id);
        return $this->sendSuccessResult($res);
    }

    public function getReceiverDetailsById2()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->getReceiverDetailsById2($postData->id);
        return $this->sendSuccessResult($res);
    }

    public function InsertCourierCompany()
    {

        $json = $this->request->getJSON();
        $model = new CourierModel();
        $data = array(
            'courier_name' => $json->courier_name,
        );
        $id = $model->InsertCourierCompanyName($data);
        $response = [
            'success' => true,
            'message' => 'Data inserted successfully',
        ];
        return $this->response->setJSON($response);
    }


    public function updateCourierCompany()
    {
        $postdata = $this->request->getJSON();
        $model = new CourierModel();
        $SessionUser = $_SESSION["USERID"];
        $updateId = $postdata->Id;
        if ($updateId != "") {

            $res = $model->updateCourierCompany($updateId, $postdata->Data);
        }
        if ($res == '') {
            return $this->respond(["success" => $res, "ErrorMsg" => "Duplicate record.."]);
        }

        return  $this->respond(["success" => $res]);
    }
    public function getEmployeeDetails()
    {
        $postdata = $this->request->getJSON();
        $model = new CourierModel();
        $employeeDetails = $model->getEmployeeDetails($postdata->employeename->value);
        if (!empty($employeeDetails)) {
            return $this->respond($employeeDetails, 200);
        } else {
            return $this->failNotFound('Employee details not found');
        }
    }
    public function getdeliveryEmployeeDetails()
    {

        $postdata = $this->request->getJSON();

        $model = new CourierModel();
        $employeeDetails = $model->getdeliveryEmployeeDetails($postdata->employeename->value);
        if (!empty($employeeDetails)) {
            return $this->respond($employeeDetails, 200);
        } else {
            return $this->failNotFound('Employee details not found');
        }
    }
    public function updateReceiveDetails()
    {
        $postdata = $this->request->getJSON();
        $model = new CourierModel();
        $SessionUser = $_SESSION["USERID"];
        $updateId = $postdata->refid;
        $res = '';
        if ($updateId != '') {
            $res = $model->Courier_Details_Update($postdata);
            $latestDetail = $model->getReceiverDetailsById($res);
            $totalBulkCount = 0;
            if (!empty($latestDetail)) {
                foreach ($latestDetail as $detail) {
                    $resid = $detail['created_by'];
                    $res_mailid = $detail['emp_mail_id'];
                    $res_otp = $detail['otp'];
                    $res_empid = $detail['emp_id'];
                    $userName3 = $detail['emp_name'];
                    $res_status = $detail['emp_status'];
                    $bulkCount = $detail['bulk_count'];
                    $bulkCount = isset($bulkCount) ? $bulkCount : 1;
                    $totalBulkCount += $bulkCount;
                }
            }

            $couriercount =  $totalBulkCount;
            $rep_id = $model->getresid($resid);
            $rep_name = $rep_id[0]['FIRST_NAME'];
            $rep_mobile = $rep_id[0]['MOBILE_NUMBER'];
            $rep_mailid = $rep_id[0]['MAIL_ID'];
            $res_division = $rep_id[0]['emp_division'];
            if ($res_mailid) {
                $ccmail = ['nlsdappexe2@nagamills.com'];
                $otp1 = "$res_otp is for your $couriercount courier(s)";
                $subject = "Updated  Couriers Details ";
                $message1 = '<!DOCTYPE html>
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
                
                
                <a href="" style="font-size: 1.4em; color: #1656f7; text-decoration: none; font-weight: 600;">Welcome to Naga Limited</a>
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
                    </div>
                    
                    <p style="font-size: 1.1em;">Dear ' . $userName3 . ',</p>
                    <p>Please collect your  couriers from Reception at your earliest convenience.</p>';
                if (!empty($latestDetail)) {
                    $message1 = '<!DOCTYPE html>
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
                        <p>' . ' OTP ' . $otp1 . '.Please do not share it with anyone.Please collect it from Reception.. </p>
                    
                        <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
                           
                        <thead>
                        <tr>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Unique number</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Name</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">From Person</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Entry Date</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Bulk Count</th>
                        </tr>
                    </thead>
                    <tbody>';
                    foreach ($latestDetail as $row) {
                        $entryDate = date('d/m/Y', strtotime($row['entry_date']));
                        if (isset($row['bulk_count'])) {
                            $row_bulk_count = $row['bulk_count'];
                        } else {
                            $row_bulk_count = 1;
                        }

                        $message1 .= '<tr>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['transcation_unique_no'] . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_name'] . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_from'] . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $entryDate . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row_bulk_count . '</td>
                        </tr>';
                    }
                    $message1 .= '</tbody></table>
                    <p style="font-size: 0.9em;">For Contact,<br />' . $rep_name . '-' . $rep_mobile . '</p>
                        <br/>
                        <p style="font-size: 0.9em;">Regards,<br /> ' . $res_division . '</p></div>
                        </body>
                        </html>';

                    if ($res_status == 1) {
                        $email = \Config\Services::email();
                        $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION ');
                        $email->setTo($res_mailid);
                        $email->setBcc($ccmail);
                        $email->setCc($rep_mailid);
                        $email->setSubject($subject);
                        $email->setMessage($message1);
                        $email->send();
                    } else {
                        $email = \Config\Services::email();
                        $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION ');
                        $email->setTo($res_mailid);
                        $email->setBcc($ccmail);
                        $email->setCc("");
                        $email->setSubject($subject);
                        $email->setMessage($message1);
                        $email->send();
                    }
                }
            }
            if ($res != '') {
                $response = [
                    'success' => true,
                    'message' => 'Data saved successfully',
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Failed to save data',
                ];
            }
            return $this->response->setJSON($response);
        }
    }
    public function getReceiverdetails()
    {
        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $model = new CourierModel();
        $data = $model->getReceiverdetails($fromDate, $toDate, $plant_code);
        return $this->respond($data);
    }
    public function getReceiverdetail()
    {

        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $model = new CourierModel();
        $data = $model->getReceiverdetail($fromDate, $toDate, $plant_code);
        return $this->respond($data);
    }
    public function getReceiver($plant_code = null)
    {
        $Model = new CourierModel();
        $data = $Model->getReceiver($plant_code);
        return $this->sendSuccessResult($data);
    }

    public function generateOTP()
    {
        $getData = $this->request->getJSON();
        $userName = $getData->received_by;
        $userName2 = explode("-", $userName);
        $formats = date('Y-m-d H:i:s');
        $otp = rand(1000, 9999);
        if ($getData->deliveryMethod == "OTHERS") {
            $rowId = $getData->chckid;
            $couriercount = $getData->couriercount;
            $usermobile = $getData->mobileNumber;
            $ccmail = ['nlsdappexe2@nagamills.com'];
            $mail_id = $getData->email_id;
            $receviedmail_id = $getData->emp_emailid;
            $userName1 = $getData->user_name;
            $userName3 = $userName2[0];
            $status_list = '';
            $model = new CourierModel();
            $affectedRows = $model->generateOTP($rowId, $otp);

            if ($usermobile) {
                $otp1 = "$otp is for your $couriercount shipment";
                // $message="Dear ".$userName.", ".$otp." is your OTP to reset Logistics Pro login password. Please do not share it with anyone Naga Limited";
                $message = "Dear Sir/Mam, OTP " . $otp1 . "Please do not share it with anyone. Naga Limited ";
                $msg = urlencode($message);
                $sender = 'NAGACO';
                $headers = array('Content-Type: application/json; charset=utf-8');
                $url = ("http://mobicomm.dove-sms.com//submitsms.jsp?user=NAGACO&key=eee5461574XX&message=" . $msg . "&senderid=" . $sender . "&accusage=1&entityid=1201159186592875505&tempid=1207170747195420934&unicode=1&mobile=" . $usermobile);
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $curlresponse = curl_exec($ch);
            }

            if ($mail_id) {
                $otp1 = "$otp is for your $couriercount shipment and its handover to $userName3";
                $subject = "OTP For Your Couriers ";
                $message1 =  '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #1656f7;text-decoration:none;font-weight:600">Welcome to Naga Limited</a>
                </div>
                    <p style="font-size:1.1em">Dear ' . $userName1 . ',</p>
                    <p>' . 'OTP ' . $otp1 . '.Please do not share it with anyone. Naga Limited. </p>
                <h2 style="background: #1656f7;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">' . $otp . '</h2>
                <p style="font-size:0.9em;">Regards,<br />Naga Limited - Foods Division</p>
       
       
                </div>
               </div>';


                $email = \Config\Services::email();
                $email->setFrom("noreply@nagamills.com", 'PURCHASE PRO');
                $email->setTo($mail_id);
                $email->setCc($receviedmail_id);
                $email->setBcc($ccmail);
                $email->setSubject($subject);
                $email->setMessage($message1);
                $email->send();
            } else {
                $result = false;
            }
        } else {
            $rowId = $getData->chckid;
            $couriercount = $getData->couriercount;
            $usermobile = $getData->mobileNumber;
            $ccmail = ['nlsdappexe2@nagamills.com', 'mariavanarajs@nagamills.com', 'nlsdapptl1@nagamills.com', 'nlfdreception@nagamills.com'];
            $mail_id = $getData->email_id;
            $userName = $getData->user_name;
            $status_list = '';
            $model = new CourierModel();
            $affectedRows = $model->generateOTP($rowId, $otp);

            if ($usermobile) {
                $otp1 = "$otp is for your $couriercount shipment";
                // $message="Dear ".$userName.", ".$otp." is your OTP to reset Logistics Pro login password. Please do not share it with anyone Naga Limited";
                $message = "Dear Sir/Mam, OTP " . $otp1 . "Please do not share it with anyone. Naga Limited ";
                $msg = urlencode($message);

                $sender = 'NAGACO';

                $headers = array('Content-Type: application/json; charset=utf-8');
                $url = ("http://mobicomm.dove-sms.com//submitsms.jsp?user=NAGACO&key=eee5461574XX&message=" . $msg . "&senderid=" . $sender . "&accusage=1&entityid=1201159186592875505&tempid=1207170747195420934&unicode=1&mobile=" . $usermobile);

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $curlresponse = curl_exec($ch);
            }
            if ($mail_id) {
                $subject = "OTP For Your Couriers ";
                $message1 =  '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #1656f7;text-decoration:none;font-weight:600">Welcome to Naga Limited</a>
            </div>
                <p style="font-size:1.1em">Dear ' . $userName . ',</p>
                <p>' . ' OTP ' . $otp1 . '.Please do not share it with anyone. Naga Limited. </p>
            <h2 style="background: #1656f7;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">' . $otp . '</h2>
            <p style="font-size:0.9em;">Regards,<br />Naga Limited - Foods Division</p>
   
   
            </div>
           </div>';


                $email = \Config\Services::email();
                $email->setFrom("noreply@nagamills.com", 'PURCHASE PRO');
                $email->setTo($mail_id);
                $email->setBcc($ccmail);
                $email->setSubject($subject);
                $email->setMessage($message1);
                $email->send();
            } else {
                $result = false;
            }
        }


        return  $this->respond(["success" => 1, "results" => $affectedRows, "OTP" => $curlresponse]);
    }

    public function verifyOTP()
    {
        $getdata = $this->request->getJSON();
        $chckid = $getdata->refid;
        $mobileNumber = $getdata->mobileNumber;
        $enteredOTP =  $getdata->enteredOTP;
        $Model = new CourierModel();
        $storedOTP = $Model->getOTPByMobileNumber($chckid, $getdata, $enteredOTP);
        if ($storedOTP === $enteredOTP) {

            return $this->respond(['success' => true, 'message' => 'OTP verified successfully']);
        } else {
            return $this->respond(['success' => false, 'message' => 'Invalid OTP']);
        }
    }
    public function courierSurrender()
    {
        $postdata = $this->request->getJSON();
        $model = new CourierModel();
        $SessionUser = $_SESSION["USERID"];
        $updateId = $postdata->refid;
        $res = '';
        if ($updateId != '') {
            $res = $model->courierSurrender($postdata);
        }
        if ($res != '') {
            $response = [
                'success' => true,
                'message' => 'Data saved successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to save data',
            ];
        }
        return $this->response->setJSON($response);
    }
    public function changeStatus()
    {
        //exit;
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->changeStatus($postData->id);
        // print_r($res);exit; 
        return $this->sendSuccessResult($res);
    }
    public function changeStatusforsend()
    {
        $postData = $this->request->getJSON();

        $model = new CourierModel();
        $res = $model->changeStatusforsend($postData->id);
        return $this->sendSuccessResult($res);
    }

    public function InsertReceiveDetail()
    {
        $json = $this->request->getJSON();

        $model = new CourierModel();
        $emp_id = $json->employeename->value;
        $emp_mail_id = $json->emp_emailid;

        $Data = $model->getLastinsertedempid();
        $lastemp_id = $Data[0]['employee_id'];
        if ($emp_id == $lastemp_id) {
            $last_entry_timestamp = strtotime($Data[0]['created_at']);
            if ($last_entry_timestamp && time() - $last_entry_timestamp < 1 * 60) {
                return $this->sendErrorResult("Please Check its a duplicate entry");
            }
        }
        $gateid = $model->getGateid($json->created_by);
        $data = $model->getLastCourierTicNo();
        $transcation_unique_no = $data[0]['transcation_unique_no'];
        $res = VANumberHelper::VANumberHelper('CU', $gateid[0]['gateCode'], $transcation_unique_no);
        if ($emp_mail_id != '') {
            $id = $model->InsertReceiveDetails($json, $res);
        } else {
            return $this->sendErrorResult("Please Check Employee Mailid");
        }
        $latestDetail = $model->getReceiverDetailsById($id);
        $totalBulkCount = 0;
        if (!empty($latestDetail)) {
            foreach ($latestDetail as $detail) {
                $resid = $detail['created_by'];
                $res_uniquenum = $detail['transcation_unique_no'];
                $res_status = $detail['emp_status'];
                $res_mobilenumber = $detail['emp_mobile_number'];
                $bulkCount = $detail['bulk_count'];
                $bulkCount = isset($bulkCount) ? $bulkCount : 1;
                $totalBulkCount += $bulkCount;
            }
        }
        $rep_id = $model->getresid($resid);
        $receviedmail_id = $json->emp_emailid;
        $ccmail = ['nlsdappexe2@nagamills.com'];
        $userName = $json->employeename->label;
        $userName2 = explode("-", $userName);
        $userName3 = $userName2[0];
        $couriercount = $totalBulkCount;
        $res_name = $rep_id[0]['FIRST_NAME'];
        $res_mobile = $rep_id[0]['MOBILE_NUMBER'];
        $res_mailid = $rep_id[0]['MAIL_ID'];
        $res_division = $rep_id[0]['emp_division'];
        $otp = rand(1000, 9999);
        $affectedRows = $model->generateOTP($id, $otp);
        if ($res_mobilenumber) {
            $otp1 = "$otp is for your $couriercount courier(s)";
            // $message="Dear ".$userName.", ".$otp." is your OTP to reset Logistics Pro login password. Please do not share it with anyone Naga Limited";
            $message = "Dear Sir/Mam, OTP " . $otp1 . "Please do not share it with anyone. Naga Limited ";
            $msg = urlencode($message);

            $sender = 'NAGACO';

            $headers = array('Content-Type: application/json; charset=utf-8');
            $url = ("http://mobicomm.dove-sms.com//submitsms.jsp?user=NAGACO&key=eee5461574XX&message=" . $msg . "&senderid=" . $sender . "&accusage=1&entityid=1201159186592875505&tempid=1207170747195420934&unicode=1&mobile=" . $res_mobilenumber);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $curlresponse = curl_exec($ch);
        }

        if ($receviedmail_id) {

            $otp1 = "$otp is for your $couriercount courier(s)";
            $subject = "OTP For Your Couriers ";
            $message1 = '';
            if (!empty($latestDetail)) {
                $message1 = '<!DOCTYPE html>
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
                        <p>' . ' OTP ' . $otp1 . '.Please do not share it with anyone. Please collect it from Reception. </p>
                    
                        <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
                           
                        <thead>
                        <tr>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Unique number</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Name</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">From Person</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Entry Date</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Bulk Count</th>
                        </tr>
                    </thead>
                    <tbody>';
                foreach ($latestDetail as $row) {
                    $entryDate = date('d/m/Y', strtotime($row['entry_date']));
                    if (isset($row['bulk_count'])) {
                        $row_bulk_count = $row['bulk_count'];
                    } else {
                        $row_bulk_count = 1;
                    }

                    $message1 .= '<tr>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['transcation_unique_no'] . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_name'] . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_from'] . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $entryDate . '</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row_bulk_count . '</td>
                        </tr>';
                }
                $message1 .= '</tbody></table>
                    <p style="font-size: 0.9em;">For Contact,<br />' . $res_name . '-' . $res_mobile . '</p>
                        <br/>
                        <p style="font-size: 0.9em;">Regards,<br /> ' . $res_division . '</p></div>
                        </body>
                        </html>';

                if ($res_status == 1) {
                    $email = \Config\Services::email();
                    $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION ');
                    $email->setTo($receviedmail_id);
                    $email->setBcc($ccmail);
                    $email->setCc($res_mailid);
                    $email->setSubject($subject);
                    $email->setMessage($message1);
                    $email->send();
                } else {
                    $email = \Config\Services::email();
                    $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION ');
                    $email->setTo($receviedmail_id);
                    $email->setBcc($ccmail);
                    $email->setCc("");
                    $email->setSubject($subject);
                    $email->setMessage($message1);
                    $email->send();
                }
            } else {
                $result = false;
            }


            if ($id) {
                $response = [
                    'success' => true,
                    'message' => 'Data inserted successfully',
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Failed to insert data',
                ];
            }

            return $this->response->setJSON($response);
        }
    }
    public function InsertSendDetail()
    {
        $json = $this->request->getJSON();
        $model = new CourierModel();
        $gateid = $model->getGateid($json->created_by);
        $data = $model->getLastCourierTicNoFORSEND();
        $transcation_unique_no = $data[0]['transcation_unique_no'];
        $res = VANumberHelper::VANumberHelper('CU', $gateid[0]['gateCode'], $transcation_unique_no);

        $id = $model->InsertSendDetail($json, $res);

        if ($id) {
            $response = [
                'success' => true,
                'message' => 'Data inserted successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to insert data',
            ];
        }

        return $this->response->setJSON($response);
    }
    public function Insertconsignmentnumber()
    {

        $json = $this->request->getJSON();
        // print_r($json);exit;
        $model = new CourierModel();
        $id = $model->Insertconsignmentnumber($json);
        $response = [
            'success' => true,
            'message' => 'Data inserted successfully',
        ];
        return $this->response->setJSON($response);
    }
    public function getSender($plant_code = null)
    {
        $Model = new CourierModel();
        $data = $Model->getSender($plant_code);
        return $this->sendSuccessResult($data);
    }
    public function getSenderDetailsById()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->getSenderDetailsById($postData->id);
        // print_r($res);exit; 
        return $this->sendSuccessResult($res);
    }
    public function updatesenderdetails()
    {
        $postdata = $this->request->getJSON();
        $model = new CourierModel();
        $SessionUser = $_SESSION["USERID"];
        $updateId = $postdata->refid;
        $res = '';
        if ($updateId != '') {
            $res = $model->updatesenderdetails($postdata);
            // print_r($res0);exit;
            if ($res != '') {
                $response = [
                    'success' => true,
                    'message' => 'Data saved successfully',
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Failed to save data',
                ];
            }
            return $this->response->setJSON($response);
        }
    }
}
