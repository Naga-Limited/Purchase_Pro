<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
use App\Models\CourierModel;

class courierpaymentAPIController extends BaseApiController
{

  public function courierpaymentapiforSAP()
  {
    $json = $this->request->getJSON();
    $model = new CourierModel();
    $latestDetail = $model->getpaymentdetailsforsap($json->id);
    $rep_id = $model->getresid($latestDetail[0]['accounts_approval_by']);
    $rep_plant_code =$rep_id[0]['plant_code'];
    
    $clubbedRowIdsString = $latestDetail[0]['clubbed_row_ids'];
    $clubbedRowIdsArray = json_decode($clubbedRowIdsString, true);
    $clubbedRowIdsCommaSeparated = implode(",", $clubbedRowIdsArray);
    $paymentdetails = $model->getSenderpaymentDetailsforsap($clubbedRowIdsCommaSeparated);
    $currentDate = date('d.m.Y');
    $entryDate = date('d.m.Y', strtotime($latestDetail[0]['invoice_date']));
    

    $line_num = 0;
    foreach ($paymentdetails as $detail) {
      $line_num++;
      $sap_data2[] = array(
        "ZZLINE" => $line_num,
        "ZZPLANT" => $detail['plantcode'],
        "ZZDPT" => strtoupper($detail['emp_department']), 
        "ZZDPTAMT" => $detail['total_dep_amount'],
      );
    }
    
    $sap_data = array(

      "ZZUNIQUE_NO" => $latestDetail[0]['courier_payment_no'],
      "ZZVENDOR_CODE" => $latestDetail[0]['vendor_code'],
      "ZZPLANT" =>  $rep_plant_code,
      "ZZINV_NO" => $latestDetail[0]['invoice_number'],
      "ZZINV_DATE" => $entryDate,
      "ZZPOST_DATE" => $currentDate,
      "ZZAMT" => $latestDetail[0]['total_value'],
      "ZZTEXT" =>$json->remarks,
      "LINE" =>  $sap_data2,
    );
    
    $urlPath ="ZCOURIER/Courier_Service?SAP-client=900";

    $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
    

    $message = $res[0]->MESSAGE;
    $doc_num=$res[0]->DOCUMENT_NO;
    
    if ($res[0]->STATUS == 0) {
      return $this->sendErrorResult("Please Contant SAP team,$message");
    } else if (($res[0]->STATUS) ==2) {
      $Detail = $model->approveCourierItem3($json,$res);
      return  $this->respond(["success" => 2, "results" => "Plese Check the entry:$message,Document Number:$doc_num"]);
    }else if (($res[0]->STATUS) ==1) {
      $Detail = $model->approveCourierItem3($json,$res);
      return  $this->respond(["success" => 1, "results" => "$message,Document Number:$doc_num"]);
   }
  }
}
