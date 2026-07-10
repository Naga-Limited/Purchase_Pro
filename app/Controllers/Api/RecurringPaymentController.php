<?php

namespace App\Controllers\Api;
use App\Helpers\VANumberHelper;
use App\Models\RecurringPaymentModel;

class RecurringPaymentController extends BaseApiController
{

    public function Insertpaymenttotype()
    {
        $postData = $this->request->getJSON();

        if (!$postData || empty($postData->paymentToType)) {
            return $this->sendErrorResult("Invalid Request");
        }

        $master = new RecurringPaymentModel();

        // Check whether count exists for this payment_to_type
        $lastdata = $master->checkdata($postData->paymentToType);

        // If count > 0 → duplicate → block insert
        if ($lastdata > 0) {
            return $this->sendErrorResult("Please Check, it's a duplicate entry");
        }

        // If count == 0 → allow insert
        $res = $master->Insertpaymenttotype($postData);

        return $this->sendSuccessResult($res);
    }

    public function Getpaymenttotype()
    {

        $master = new RecurringPaymentModel();
        $res = $master->Getpaymenttotype();
        return $this->sendSuccessResult($res);
        ;
    }
    public function Getdivision($plant_code=null)
    {
        $master = new RecurringPaymentModel();
        $res = $master->Getdivision($plant_code);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Getdepartment($division=null)
    {
        // print_r($division);
        $master = new RecurringPaymentModel();
        $res = $master->Getdepartment($division);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Updatepaymenttotype()
    {
        $postData = $this->request->getJSON();
        $master = new RecurringPaymentModel();
        $res = $master->Updatepaymenttotype($postData);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Deactivatepaymenttotype()
    {
        $postData = $this->request->getJSON();
        $master = new RecurringPaymentModel();
        $res = $master->Deactivatepaymenttotype($postData);

        return $this->sendSuccessResult($res);
        ;
    }

    public function Getpaymenttotypeinfo()
    {

        $master = new RecurringPaymentModel();
        $res = $master->Getpaymenttotypeinfo();
        return $this->sendSuccessResult($res);
        ;
    }
    public function Getpaymentfrequencytypes()
    {

        $master = new RecurringPaymentModel();
        $res = $master->Getpaymentfrequencytypes();
        // print_r($res);exit;
        return $this->sendSuccessResult($res);
        ;
    }
    public function Getamounttopaidtypes()
    {
        $master = new RecurringPaymentModel();
        $res = $master->Getamounttopaidtypes();
        return $this->sendSuccessResult($res);
        ;
    }

    public function Getpaymenttosubtypeinfo()
    {
        $postData = $this->request->getJSON();
        $master = new RecurringPaymentModel();
        $res = $master->Getpaymenttosubtypeinfo($postData->paymentToTypeId);
        return $this->sendSuccessResult($res);
        ;
    }
    public function GetVendorfromsap()
    {
        $postData = $this->request->getJSON();
        $master = new RecurringPaymentModel();
        $res = $master->GetVendorfromsap($postData->query);
        return $this->sendSuccessResult($res);
        ;
    }
    public function GetGLfromsap()
    {
        $postData = $this->request->getJSON();
        $master = new RecurringPaymentModel();
        $res = $master->GetGLfromsap($postData->query);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Gethousebankdetailsfromsap()
    {
        $postData = $this->request->getJSON();
        $master = new RecurringPaymentModel();
        $res = $master->Gethousebankdetailsfromsap($postData->query);
        return $this->sendSuccessResult($res);
        ;
    }
    public function GetPlantfromsap()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->GetPlantfromsap($postData->costcentre);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Insertrecpaymentinfo()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $gateid = $postData->plant_werks;
        $data = $master->getLastCourierTicNo($gateid);

        $transcation_unique_no = $data[0]['rp_unique_trans_id'];
        $result = VANumberHelper::VANumberHelper('RI', $gateid, $transcation_unique_no);
        $res = $master->Insertrecpaymentinfo($postData, $result);
        // print_r($res);exit;

        if ($res != 0) {
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
        ;
    }
    public function recpaymentinfoapproval()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentinfoapproval($postData->user_plantid);
        return $this->sendSuccessResult($res);
        ;
    }
    public function recpaymentinfo()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentinfo($postData->user_plantid);
        return $this->sendSuccessResult($res);
        ;
    }
    public function recpaymentinforejectdata()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentinforejectdata($postData->user_plantid);
        return $this->sendSuccessResult($res);
        ;
    }
    public function recpaymentinfoapprovalforaccountsapprove()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentinfoapprovalforaccountsapprove($postData->user_plantid);
        return $this->sendSuccessResult($res);
        ;
    }
    public function recpaymentinfoapprovaldepartmentMG()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentinfoapprovaldepartmentMG($postData);
        return $this->sendSuccessResult($res);
        ;
    }
    public function recpaymentinfoapprovalAccountMG()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentinfoapprovalAccountMG($postData);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Rejectrecpaymentinfo()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->Rejectrecpaymentinfo($postData);
        if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to updated data',
            ];
        }

        return $this->response->setJSON($response);
    }

    public function getrecpaymentrenewaldata()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->getrecpaymentrenewaldata($postData->user_plantid);
        return $this->sendSuccessResult($res);
        ;
    }
    public function Insertrecpaymentrenewaldata()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $master = new RecurringPaymentModel();
        // Check for duplicate invoice number
        $data1 = $master->checkinvoice($postData);

        if ($data1 > 0) {
            return $this->sendErrorResult("Duplicate Invoice Number! Please check, this invoice already exists.");
        }

        // Continue normal process
        $gateid = $postData->plant;
        $data = $master->getLastdetailsTicNo($gateid);

        $transcation_unique_no = $data[0]['rpd_unique_trans_id'];
        $result = VANumberHelper::VANumberHelper('RP', $gateid, $transcation_unique_no);

        $res = $master->Insertrecpaymentrenewaldata($postData, $result);

        if ($res != 0) {
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

    public function TDSFetch($vendorcode = null)
    {
        //  print_r($vendorcode);exit;
        $master = new RecurringPaymentModel();
        $res = $master->TDSFetch($vendorcode);
        return $this->sendSuccessResult($res);
        ;
    }
    public function TAXFetch()
    {
        //  print_r($vendorcode);exit;
        $master = new RecurringPaymentModel();
        $res = $master->TAXFetch();
        return $this->sendSuccessResult($res);
        ;
    }
    public function recpaymentdetailsforapproval()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentdetailsforapproval($postData->user_plantid);
        return $this->sendSuccessResult($res);
    }
    public function recpaymentdetailsforapprovalACCmg()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentdetailsforapprovalACCmg($postData->user_plantid);
        return $this->sendSuccessResult($res);
    }
    public function recpaymentrenewalapprovaldepartmentMG()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentrenewalapprovaldepartmentMG($postData);
        return $this->sendSuccessResult($res);
    }
    public function recpaymentrenewalapprovalACCMG()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->recpaymentrenewalapprovalACCMG($postData);
        //  print_r($res);exit;
        return $this->sendSuccessResult($res);
    }

    public function Rejectrecpaymentdetails()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->Rejectrecpaymentdetails($postData);

        if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated  successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to update data',
            ];
        }
         return $this->response->setJSON($response);
    }
         public function Rejectrecpaymentrenawaldetails()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->Rejectrecpaymentrenawaldetails($postData->user_plantid);

        return $this->sendSuccessResult($res);
    }
    public function getreportdetialsforrecpayment()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $fromDate = $postData->fromDate;
        $toDate = $postData->toDate;
        $plant_code = $postData->user_plantid;
        $payment_to_type = $postData->payment_to_type;
        $payment_to_subtype = $postData->payment_to_subtype;
        $master = new RecurringPaymentModel();
        $res = $master->getreportdetialsforrecpayment($fromDate, $toDate, $plant_code, $payment_to_type, $payment_to_subtype);

        return $this->respond($res);
    }
    public function Updaterecpaymentinfo()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->Updaterecpaymentinfo($postData);
         if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated  successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to update data',
            ];
        }
        // print_r($response);exit;

        return $this->response->setJSON($response);
    }
    public function updaterenwaldata()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->updaterenwaldata($postData);
         if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated  successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to update data',
            ];
        }
        // print_r($response);exit;

        return $this->response->setJSON($response);
    } 
    public function shortCloseRecPayment()
    {
        $postData = $this->request->getJSON();
        //  print_r($postData);exit;
        $master = new RecurringPaymentModel();
        $res = $master->shortCloseRecPayment($postData);
         if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated  successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to update data',
            ];
        }
        // print_r($response);exit;

        return $this->response->setJSON($response);
    }
}