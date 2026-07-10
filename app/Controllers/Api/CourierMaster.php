<?php
namespace App\Controllers\Api;
//use App\Controllers\BaseController;

use App\Helpers\VANumberHelper;
use App\Models\CourierModel;


date_default_timezone_set("Asia/Calcutta");
class CourierMaster extends BaseApiController
{
    public function getCourierCompanyid($userRole = null)
    {
        $master = new CourierModel();
        // print_r($userRole);exit;

        return $this->sendSuccessResult($master->getCourierCompanyid($userRole));
    }

    public function getplantcode($plant_code = null)
    {
        $master = new CourierModel();
        // print_r($userRole);exit;

        return $this->sendSuccessResult($master->getplantcode($plant_code));
    }
    public function getVENDOR($plant_code = null)
    {
        $master = new CourierModel();
        // print_r($userRole);exit;

        return $this->sendSuccessResult($master->getVENDOR($plant_code = null));
    }
    public function getsendingdate($plant_code = null)
    {
        $master = new CourierModel();
        // print_r($master);exit;
        return $this->sendSuccessResult($master->getsendingdate());
    }


    public function GetEmployeeName($plant_code = null)
    {
      $master=new CourierModel();
      return $this->sendSuccessResult($master->GetEmployeeName($plant_code));
    } 
    public function getdelivery_Employee()
    {
      $master=new CourierModel();
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
        $res=$model->getReceiverDetailsById($postData->id);     
        return $this->sendSuccessResult($res);
    }

    public function getReceiverDetailsById2()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res=$model->getReceiverDetailsById2($postData->id);       
        return $this->sendSuccessResult($res);
    }

    public function InsertCourierCompany()
    {

        $json = $this->request->getJSON();
           $model=new CourierModel();
        $data=array(
            'courier_name' =>$json->courier_name,
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
        if($updateId !=""){
        
            $res = $model->updateCourierCompany($updateId,$postdata->Data);
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
                    $userName3 = strtoupper($detail['emp_name']);
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
                    
                    <p style="font-size: 1.1em;">Dear MR/MRS ' . $userName3 . ',</p>
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
                    // print_r($message1);
                    // exit;

                    if ($res_status == 1) {
                        $email = \Config\Services::email();
                        $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
                        $email->setTo($res_mailid);
                        $email->setBcc($ccmail);
                        $email->setCc($rep_mailid);
                        $email->setSubject($subject);
                        $email->setMessage($message1);
                        $email->send();
                    } else {
                        $email = \Config\Services::email();
                        $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
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
           $getdate=$this->request->getJSON();
            $fromDate =$getdate->fromDate;
            $toDate = $getdate->toDate;
            $plant_code=$getdate->user_plantid;
            $model = new CourierModel();
            $data = $model->getReceiverdetails( $fromDate,$toDate,$plant_code);
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
                $message = "Dear Sir/Mam, OTP " . $otp1 . " Please do not share it with anyone. Naga Limited ";
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

            if($mail_id) {
                $otp1="$otp is for your $couriercount shipment and its handover to $userName3";
                $subject = "OTP For Your Couriers ";
                $message1 =  '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #1656f7;text-decoration:none;font-weight:600">Welcome to Naga Limited</a>
                </div>
                    <p style="font-size:1.1em">Dear '.$userName1.',</p>
                    <p>'.' OTP ' .$otp1.'.Please do not share it with anyone. Naga Limited. </p>
                <h2 style="background: #1656f7;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">'.$otp.'</h2>
                <p style="font-size:0.9em;">Regards,<br />Naga Limited - Foods Division</p>
       
       
                </div>
               </div>';
               
            
                $email = \Config\Services::email();
                $email->setFrom("noreply@nagamills.com",'COURIER INTIMATION');
                $email->setTo($mail_id);
                $email->setCc($receviedmail_id);
                // $email->setBcc($ccmail);
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
            $ccmail = ['nlsdappexe2@nagamills.com'];
            $mail_id = $getData->email_id;
            $userName = $getData->user_name;
            $status_list = '';
            $model = new CourierModel();
            $affectedRows = $model->generateOTP($rowId, $otp);

            if ($usermobile) {
            $otp1="$otp is for your $couriercount shipment";
            // $message="Dear ".$userName.", ".$otp." is your OTP to reset Logistics Pro login password. Please do not share it with anyone Naga Limited";
            $message="Dear Sir/Mam, OTP " .$otp1."Please do not share it with anyone. Naga Limited ";
            $msg=urlencode($message);

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
                <p style="font-size:1.1em">Dear '.$userName.',</p>
                <p>'.' OTP ' .$otp1.'.Please do not share it with anyone. Naga Limited. </p>
            <h2 style="background: #1656f7;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">'.$otp.'</h2>
            <p style="font-size:0.9em;">Regards,<br />Naga Limited - Foods Division</p>
   
   
            </div>
           </div>';
           
        
            $email = \Config\Services::email();
            $email->setFrom("noreply@nagamills.com",'COURIER INTIMATION');
            $email->setTo($mail_id);
            $email->setBcc($ccmail);
            $email->setSubject($subject);
            $email->setMessage($message1);
            $email->send();
      
        
            }else{
               $result = false;
             }
         }
         
	
		return  $this->respond(["success" => 1, "results" => $affectedRows , "OTP" => $curlresponse]);
        }
    
    public function verifyOTP()
    {
        $getdata=$this->request->getJSON();
        $chckid=$getdata->refid;
        $mobileNumber = $getdata->mobileNumber;
        $enteredOTP =  $getdata->enteredOTP;
        $Model = new CourierModel();
        $storedOTP = $Model->getOTPByMobileNumber($chckid,$getdata,$enteredOTP);
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
        $res = '' ;
        if($updateId != ''){
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
        $postData=$this->request->getJSON();   
        // print_r($postData);exit();  
        $model = new CourierModel();
        $res=$model->changeStatus($postData->id);     
         return $this->sendSuccessResult($res);
    }
    public function changeStatusforsend()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->changeStatusforsend($postData->id);
        // print_r( $this->sendSuccessResult($res));exit;
        return $this->sendSuccessResult($res);
    }

    public function InsertReceiveDetail()
    {
        $json = $this->request->getJSON();
        $model = new CourierModel();
        $emp_id = $json->employeename->value;
        $emp_mail_id = $json->emp_emailid;

        // print_r($emp_mail_id);exit;
        $Data = $model->getLastinsertedempid();
        $lastemp_id = $Data[0]['employee_id'];
        // if ($emp_id == $lastemp_id) {
        //     $last_entry_timestamp = strtotime($Data[0]['created_at']);
        //     if ($last_entry_timestamp && time() - $last_entry_timestamp < 1 * 60) {
        //         return $this->sendErrorResult("Please Check its a duplicate entry");
        //     }
        // }
        $gateid = $model->getGateid($json->created_by);
        $data = $model->getLastCourierTicNo($gateid);
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
        $userName3 = strtoupper($userName2[0]);
        $couriercount = $totalBulkCount;
        $res_name = $rep_id[0]['FIRST_NAME'];
        $res_mobile = $rep_id[0]['MOBILE_NUMBER'];
        $res_mailid = $rep_id[0]['MAIL_ID'];
        $res_division = $rep_id[0]['emp_division'];
        $otp = rand(1000, 9999);
        $affectedRows = $model->generateOTP($id, $otp);
        if ($res_mobilenumber) {
            $otp1 = "$otp is for your $couriercount received courier(s)";
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
                        
                        <p style="font-size: 1.1em;">Dear MR/MRS' . $userName3 . ',</p>
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
                //print_r($message1);exit;
                if ($res_status == 1) {
                    $email = \Config\Services::email();
                    $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
                    $email->setTo($receviedmail_id);
                    $email->setBcc($ccmail);
                    $email->setCc($res_mailid);
                    $email->setSubject($subject);
                    $email->setMessage($message1);
                    $email->send();
                } else {
                    $email = \Config\Services::email();
                    $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
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
        $emp_div = substr($json->empdiv, 0, 4);
        $emp_id = $json->employeename;
        $emp_mail_id = $json->emp_emailid;
        $Data = $model->getLastinsertedempidforsend();
        $lastemp_id = $Data[0]['employee_id'];
        if ($emp_id == $lastemp_id) {
            $last_entry_timestamp = strtotime($Data[0]['created_at']);
            if ($last_entry_timestamp && time() - $last_entry_timestamp < 5 * 60) {
                return $this->sendErrorResult("Please Check its a duplicate entry");
            }
        }
        $couriercount = count($json->rows);
        // print_r($couriercount);exit;

        $gateid = $model->getGateid($json->created_by);
        $data = $model->getLastCourierTicNoFORSEND($gateid);
        $transcation_unique_no = $data[0]['cr_unique_no'];
        $res = VANumberHelper::VANumberHelper('CD', $gateid[0]['gateCode'], $transcation_unique_no);

        $otp = rand(1000, 9999);
        $random_num_array = [];
        $res2_array = [];
        $rowCount = $json->rowCount;
        for ($i = 0; $i < $rowCount; $i++) {
            $random_num_array[] = rand(10000, 99999);
            $disnumber = $model->getLastdispatchTicNoFORSEND();
            $dr_unique = $disnumber[0]['dr_unique_no'];
            $res2_array[] = VANumberHelper::VANumberHelper('CD', $gateid[0]['gateCode'], $dr_unique);
        }

        $arraylen = count($res2_array);
        $prevValue = $res2_array[0];

        for ($i = 1; $i < $arraylen; $i++) {
            $res2_array[$i] = ++$prevValue;
        }
        unset($value);
        if ($emp_mail_id != '') {
            $id = $model->InsertSendDetail($json, $res, $otp, $random_num_array, $res2_array);
        } else {
            return $this->sendErrorResult("Please Check Employee Mailid");
        }

        $latestDetail = $model->getSenderDetailsByIdforotp($id);
        // print_r($latestDetail);exit;

        if (!empty($latestDetail)) {
            foreach ($latestDetail as $detail) {
                $resid = $detail['created_by'];
                $res_uniquenum = $detail['cr_unique_no'];
                $res_status = $detail['emp_status'];
                $res_mobilenumber = $detail['emp_mobile_number'];
                $res_username = strtoupper($detail['emp_name']);
            }
        }


        $rep_id = $model->getresid($resid);
        $receviedmail_id = $json->emp_emailid;
        $ccmail = ['nlsdappexe2@nagamills.com'];
        $res_name = $rep_id[0]['FIRST_NAME'];
        $res_mobile = $rep_id[0]['MOBILE_NUMBER'];
        $res_mailid = $rep_id[0]['MAIL_ID'];
        $res_division = $rep_id[0]['emp_division'];
        // print_r($receviedmail_id);exit;
        if ($res_mobilenumber) {
            $otp1 = "$otp is for your $couriercount sending courier(s)";
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

        if ($receviedmail_id != '') {
            $otp1 = "$otp is for your sending courier(s)";
            $subject = "OTP For Your Couriers For send ";
            // $message1 = '';
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
                
                <p style="font-size: 1.1em;">Dear MR/MRS ' . $res_username . ',</p>
                <p>' . ' OTP ' . $otp1 . '.Please do not share it with anyone. </p>
            
                <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
                   
                <thead>
                <tr>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Unique number</th> 
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Reference number</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">TO Person </th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Sending Date</th>
                </tr>
            </thead>
            <tbody>';
            foreach ($latestDetail as $row) {
                $sendingDate = date('d/m/Y', strtotime($row['sending_date']));


                $message1 .= '<tr>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['cr_unique_no'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['reference_number'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['to_person_name'] . '</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $sendingDate . '</td>
                  
                </tr>';
            }
            $message1 .= '</tbody></table>
            <p style="font-size: 0.9em;">For Contact,<br />' . $res_name . '-' . $res_mobile . '</p>
                <br/>
                <p style="font-size: 0.9em;">Regards,<br /> ' . $res_division . '</p></div>
                </body>
                </html>';
                //print_r($message1);exit;
                if ($res_status == 1) {
                    $email = \Config\Services::email();
                    $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
                    $email->setTo($receviedmail_id);
                    $email->setBcc($ccmail);
                    $email->setCc($res_mailid);
                    $email->setSubject($subject);
                    $email->setMessage($message1);
                    $email->send();
                }else{
                    $email = \Config\Services::email();
                    $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
                    $email->setTo($receviedmail_id);
                    $email->setBcc($ccmail);
                    $email->setCc('');
                    $email->setSubject($subject);
                    $email->setMessage($message1);
                    $email->send();

                }
            }

            if ($id != '') {
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
            // print_r($response);exit;
        

        return $this->response->setJSON($response);
    }
    public function Insertconsignmentnumber()
    {
        $json = $this->request->getJSON();
        // print_r($json);exit;
        $model = new CourierModel();
        $id = $model->Insertconsignmentnumber($json);


        $details = $model->getSenderDetailsById($id);
        $ccmail = ['nlsdappexe2@nagamills.com'];
        $resid = $details[0]['created_by'];
        $rep_id = $model->getresid($resid);
        $res_name = $rep_id[0]['FIRST_NAME'];
        $res_mobile = $rep_id[0]['MOBILE_NUMBER'];
        $res_division = $rep_id[0]['emp_division'];


        if ($details && isset($details[0]['courier_amount']) && $details[0]['courier_amount'] > 300) {
            $receviedmail_id = $details[0]['emp_mail_id'];
            $subject = 'Acknowledgement Required';
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
        <p style="font-size: 1.1em;">Dear MR/MRS ' . $details[0]['emp_name'] . ',</p>
        <p>' .  'Your courier amount.. </p>
        
        <div style="max-width: 600px; margin: 0 auto;">
        <a href="" style="font-size: 1.4em; color: #1656f7; text-decoration: none; font-weight: 600;">Welcome to Naga Limited</a>
            <div style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
            </div>
            
            <p style="font-size: 1.1em;">Dear MR/MRS ' .  strtoupper($details[0]['emp_name']) . ',</p>
    
        
            <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
               
            <thead>
            <tr>
            <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Consignment Number</th>
            <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Sending Date </th>
            <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Name</th> 
            <th style="border: 1px solid #ddd; padding: 6px; background-color: #1656f7; color: white;">Courier Amount</th>
            </tr>
        </thead>
        <tbody>';

            foreach ($details as $row) {
                $sendingDate = date('d/m/Y', strtotime($row['sending_date']));

                $message1 .= '<tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['consignment_number'] . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $sendingDate . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_name'] . '</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">' . $row['courier_amount'] . '</td>
              
            </tr>';
            }

            $message1 .= '</tbody></table>
        <p style="font-size: 0.9em;">For Contact,<br />' . $res_name . '-' . $res_mobile . '</p>
            <br/>
            <p style="font-size: 0.9em;">Regards,<br /> ' . $res_division . '</p></div>
            </body>
            </html>';
            //print_r($message1);
           // exit;
            $email = \Config\Services::email();
            $email->setFrom("noreply@nagamills.com", 'COURIER INTIMATION');
            $email->setTo($receviedmail_id);
            $email->setBcc($ccmail);
            $email->setSubject($subject);
            $email->setMessage($message1);
            $email->send();
        }



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
    public function getSenderdetailsforreport($plant_code = null)
    {
        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $model = new CourierModel();
        $data = $model->getSenderdetailsforreport($fromDate, $toDate, $plant_code);
        return $this->respond($data);
    }
    public function getSenderotp($plant_code = null)
    {
        $Model = new CourierModel();
        $data = $Model->getSenderotp($plant_code);
        return $this->sendSuccessResult($data);
    }
    public function getSenderDetailsById()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->getSenderDetailsById($postData->id);
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
    public function getSenderdetail()
    {
        $getdate = $this->request->getJSON();
        $model = new CourierModel();
        $gstdata=$model->getgstpercntage();
        //print_r($gstdata);exit;
        $cgst =$gstdata[0]["definitionsName"];
        $sgst =$gstdata[1]["definitionsName"];
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $courier_id = $getdate->courier_company_id;
        $userplantid = $getdate->user_plant;
        
        $data = $model->getSenderdetail($fromDate, $toDate, $plant_code, $courier_id, $userplantid, $cgst, $sgst);
        return $this->respond($data);
    }
    public function getSenderdetailforreport()
    {
        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $courier_id = $getdate->courier_company_id;
        $model = new CourierModel();
        $data = $model->getSenderdetailforreport($fromDate, $toDate, $plant_code, $courier_id);
        return $this->respond($data);
    }
    public function verifyOTPforsend()
    {
        $getdata = $this->request->getJSON();
        $chckid = $getdata->refid;
        $mobileNumber = $getdata->mobileNumber;
        $enteredOTP =  $getdata->enteredOTP;
        $Model = new CourierModel();
        $storedOTP = $Model->getOTPByMobileNumberforsend($chckid, $getdata, $enteredOTP);
        if ($storedOTP === $enteredOTP) {

            return $this->respond(['success' => true, 'message' => 'OTP verified successfully']);
        } else {
            return $this->respond(['success' => false, 'message' => 'Invalid OTP']);
        }
    }
    public function InsertDispatchpaymentinfo()
    {
        $json = $this->request->getJSON();
    //    print_r($json);exit;
        $model = new CourierModel();
        if ($json->user_plant != '') {
            $userplantcode = $json->user_plant;
        } else {
            $rep_id = $model->getresid($json->created_by);
            $userplantcode = $rep_id[0]['plant_code'];
        }
        // print_r($userplantcode);exit;
        $gateid = $model->getGateid($json->created_by);
        $data = $model->getLastCourierTicNoFORpayment();
        $unique_no = $data[0]['courier_payment_no'];
        $res = VANumberHelper::VANumberHelper('DP', $gateid[0]['gateCode'], $unique_no);

        $id = $model->InsertDispatchpaymentinfo($json, $res, $userplantcode);
        if ($id != '') {
            $response = [
                'success' => true,
                'message' => 'Data inserted successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Data not inserted ',
            ];
        }
        return $this->response->setJSON($response);
    }
    public function getpaymentdetails($plant_code = null)
    {

        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $Model = new CourierModel();
        $data = $Model->getpaymentdetails($plant_code, $fromDate, $toDate);
        return $this->sendSuccessResult($data);
    }
    public function getpaymentdetails2($plant_code = null)
    {
        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $courier_id = $getdate->courier_company_id;
        $Model = new CourierModel();
        $data = $Model->getpaymentdetails2($plant_code, $fromDate, $courier_id, $toDate);
        return $this->sendSuccessResult($data);
    }
    public function getpaymentdetails3($plant_code = null)
    {
        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $courier_id = $getdate->courier_company_id;
        $Model = new CourierModel();
        $data = $Model->getpaymentdetails3($plant_code, $fromDate, $courier_id, $toDate);
        return $this->sendSuccessResult($data);
    }
    public function getpaymentdetailsforreport($plant_code = null)
    {
        $getdate = $this->request->getJSON();
        // print_r($getdate);exit;
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $plant_code = $getdate->user_plantid;
        $courier_id = $getdate->courier_vendor_id;
        $Model = new CourierModel();
        // print_r($courier_id);exit;
        $data = $Model->getpaymentdetailsforreport($plant_code, $fromDate, $courier_id, $toDate);
        return $this->sendSuccessResult($data);
    }
    public function getSenderpaymentDetailsById()
    {
        $postData = $this->request->getJSON();
        
        $model = new CourierModel();
        $res = $model->getSenderpaymentDetailsById($postData->id);
    
        return $this->sendSuccessResult($res);
    }
    public function approveCourierItem()
    {
        $postData = $this->request->getJSON();
       
        $model = new CourierModel();
        $res = $model->approveCourierItem($postData, $postData->id);
        return $this->sendSuccessResult($res);
    }
    public function approveCourierItem2()
    {
        $postData = $this->request->getJSON();
        
        $model = new CourierModel();
        $res = $model->approveCourierItem2($postData, $postData->id);
        return $this->sendSuccessResult($res);
    }
    public function approveCourierItem3()
    {
        $postData = $this->request->getJSON();
       
        $model = new CourierModel();
        $res = $model->approveCourierItem3($postData, $postData->id);
        return $this->sendSuccessResult($res);
    }
    public function rejectCourierItem()
    {
        $postData = $this->request->getJSON();
        
        $model = new CourierModel();
        $res = $model->rejectCourierItem($postData, $postData->id);
        return $this->sendSuccessResult($res);
    }
    public function rejectCourierItem2()
    {
        $postData = $this->request->getJSON();
        
        $model = new CourierModel();
        $res = $model->rejectCourierItem2($postData, $postData->id);
        return $this->sendSuccessResult($res);
    }
    public function rejectCourierItem3()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->rejectCourierItem3($postData, $postData->id);
        return $this->sendSuccessResult($res);
    }
     public function InsertSegmentdetails()
    {
        $postData = $this->request->getJSON();
        $model = new CourierModel();
        $res = $model->InsertSegmentdetails($postData);
        if ($res != '') {
            $response = [
                'success' => true,
                'message' => 'Data inserted successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Data not inserted ',
            ];
        }
        return $this->response->setJSON($response);
    }
    public function getsegmentdetails()
    {
        $postData = $this->request->getJSON();

        $model = new CourierModel();
        $res = $model->getsegmentdetails($postData->id);

        return $this->sendSuccessResult($res);
    }
     public function getsegmentdetailsBYID()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $model = new CourierModel();
        $res = $model->getsegmentdetailsBYID($postData->id);

        return $this->sendSuccessResult($res);
    }
     public function updatesegmentdetails()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $model = new CourierModel();
        $res = $model->updatesegmentdetails($postData);

        return $this->sendSuccessResult($res);
    }

   
    }

