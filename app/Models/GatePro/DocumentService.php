<?php 
namespace App\Models;

namespace App\Models\GatePro;
use CodeIgniter\Model;
use CodeIgniter\Email\Email;

class DocumentService extends Model
{  
	public function addSAPDocument($postData) {  
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spInsSapDocumentDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->truckNo, $postData->vaNo, $postData->driverPhoneNo, $postData->route, $postData->plant, $postData->colorToken, $postData->reason, $postData->remarks, $postData->tripSheetNo, $postData->truckType, $postData->shipmentOrderNo, $postData->deliveryWeight, $postData->firstWeight, $postData->secondWeight, $postData->netWeight, $postData->diff, $postData->uerInfoId]);
		
		$queryResult = $builder->getResultArray();
		$data = (int)$queryResult[0]['lastInsertId'];
		$getExistCount = (int)$queryResult[0]['getExistCount'];

		if($data > 0 && $getExistCount == 0){
			$dataStatus = true;
			$message = "SAP Document Details Added";
		}
		elseif($data == 0 && $getExistCount == 1){
			$message = "SAP Document Details Already Added.";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message, $data);;
	}

	public function getSapDocumentDetails() {     
		$builder = $this->db->query("CALL spSelSapDocumentDetails()");
		return  $builder->getResultArray();
	}  

    public function sendEmail($postData){
		// ================= EMPLOYEE DETAILS =================
		$query = $this->db->query(
			"SELECT emp_id AS employeeMasterId,
					emp_name AS employeeName,
					emp_mail_id AS employeeMailId,
					emp_mobile_number AS employeeMobileNo,
					emp_division
			FROM employee_master
			WHERE emp_id = ?",
			[$postData->employeeMasterId]
		);

		$res = $query->getFirstRow();

		if (!$res) {
			return [
				'status'  => false,
				'message' => 'Employee not found'
			];
		}

		// ================= VISITOR PASS DETAILS =================
		$res1 = $this->db->table('general_visitor')
			->select('general_visitor.vaNumber, definitions_list.definitionsName')
			->join('definitions_list', 'definitions_list.id = general_visitor.meetingTypeId', 'inner')
			->where('general_visitor.employeeMasterId', $postData->employeeMasterId)
			->where('general_visitor.gateOutDateStamp IS NULL', null, false)
			->orderBy('general_visitor.id', 'DESC')
			->get(1)
			->getFirstRow();

		// ================= SAFE ASSIGNMENTS =================
		$employeeName      = $res->employeeName ?? '';
		$employeeMailId    = $res->employeeMailId ?? '';
		$employeeMobileNo  = $res->employeeMobileNo ?? '';
		$emp_division      = $res->emp_division ?? '';

		$visitorPassNo     = $res1->vaNumber ?? 'N/A';
		$purpose           = $res1->definitionsName ?? 'N/A';

		$visitDate  = date("d-M-Y", strtotime($postData->visitDate ?? date('Y-m-d')));
		$gateInTime = date("h:i A", strtotime($postData->gateInTime ?? date('H:i:s')));

		$visitors   = $postData->generalVisitorDetails ?? [];
		$visitorDisplayName = $visitors[0]->visitorName ?? 'Visitor';

		// ================= DIVISION MAPPING =================
		$divisionMap = [
			'NLFD' => 'Foods',
			'NLFA' => 'Foods',
			'NLSD' => 'Service',
			'NLIF' => 'IFoods',
			'NLCD' => 'Consumer',
			'NLCD 1' => 'Consumer',
			'NLCD 2' => 'Consumer',
			'NLRE' => 'Research And Development',
			'NLED' => 'Energy',
			'NLMD' => 'Minerals',
			'NLDV' => 'Detergent',
			'NLPP' => 'Property',
			'NLLD' => 'Logistics',
		];

		$emp_division = $divisionMap[$emp_division] ?? $emp_division;

		// ================= EMAIL CONTENT =================
		$subject = "Visitor Notification";
		$message = "Visitors are here for a meeting with you.";

		$header = '
		<div style="font-family:Arial; line-height:1.8">
			<h2 style="color:#1656f7">Welcome to Naga Limited</h2>
			<p>Dear ' . $employeeName . ',</p>
			<p>' . $message . '</p>
			<p><strong>Visitor Pass No:</strong> ' . $visitorPassNo . '</p>
			<p><strong>Purpose:</strong> ' . $purpose . '</p>
			<p><strong>Visit Date:</strong> ' . $visitDate . '</p>
			<p><strong>Gate In Time:</strong> ' . $gateInTime . '</p>
			<table border="1" cellpadding="6" cellspacing="0">
				<tr style="background:#1656f7;color:#fff">
					<th>S.No</th>
					<th>Visitor Name</th>
				</tr>';

		$rows = '';
		foreach ($visitors as $k => $v) {
			$rows .= '
			<tr>
				<td align="center">' . ($k + 1) . '</td>
				<td>' . ($v->visitorName ?? '') . '</td>
			</tr>';
		}

		$footer = '
			</table>
			<p>Regards,<br>Naga Limited</p>
		</div>';

		// ================= SEND EMAIL =================
		$email = \Config\Services::email();
		$email->setFrom('noreply@nagamills.com', 'Visitor Pass');
		$email->setTo($employeeMailId);
		$email->setSubject($subject);
		$email->setMessage($header . $rows . $footer);

		if (!$email->send()) {
			log_message('error', print_r($email->printDebugger(['headers', 'subject', 'body']), true));
		}

		// ================= SMS TO VISITOR =================
		$msgVisitor = "Dear {$visitorDisplayName}, your visitor pass {$visitorPassNo} is for {$visitDate}. To meet {$employeeName}. Naga Limited";
		// $msg1 = "Dear {$visitorDisplayName}, your visitor pass {$visitorPassNo} is for {$visitDate}. To meet Mr/Ms. {$employeeName}. Naga Limited";
		
		$visitorUrl = "http://mobicomm.dove-sms.com/submitsms.jsp?user=NAGACO&key=eee5461574XX&senderid=NAGACO&accusage=1&entityid=1201159186592875505&tempid=1207175396128683933&unicode=1&mobile={$postData->visitorPhoneNo}&message=" . urlencode($msgVisitor);

		$this->sendSms($visitorUrl);

		// ================= SMS TO EMPLOYEE =================
		$msgEmployee = "Dear {$employeeName}, A visitor {$visitorDisplayName} is here to meet you. Naga Limited";
		// $msg2 = "Dear {$visitorDisplayName}, A visitor, {$employeeName}, is here to meet you. Naga Limited";
		$employeeUrl = "http://mobicomm.dove-sms.com/submitsms.jsp?user=NAGACO&key=eee5461574XX&senderid=NAGACO&accusage=1&entityid=1201159186592875505&tempid=1207175592136020320&unicode=1&mobile={$employeeMobileNo}&message=" . urlencode($msgEmployee);

		$smsResponse = $this->sendSms($employeeUrl);

		return [
			'status'   => true,
			'message'  => 'Email and SMS sent successfully',
			'response' => $smsResponse
		];
	}

	/* ================= COMMON SMS FUNCTION ================= */
	private function sendSms($url)
	{
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

		$response = curl_exec($ch);

		if (curl_errno($ch)) {
			log_message('error', curl_error($ch));
		}

		curl_close($ch);
		return $response;
	}

	


	public function getfgdelaytimeinfo($postData)
	{
		$builder = $this->db->table("delay_reason_master_fg");
		$builder = $builder->select("delay_reason_master_fg.*");
		$builder = $builder->where("delay_reason_master_fg.vehicle_type",$postData);
		$builder = $builder->where("delay_reason_master_fg.is_active",1);
		return  $builder->distinct()->get()->getResultArray();
	}

	public function migoapprovaldata($postData)
	{
		//print_r($postData);exit;
	    $builder = $this->db->table('purchase_info a');

    $builder->select("
        PI_REFID, ZVA_NUMBER, UnloadingRedirectGateoutBy, PICK_SLIP_NO, EMPTY_VEHICLE_ARRIVAL_ID,
        ZPO_NUMBER, QA_STATUS, DateAdded, DateModified, TRUCK_NO, SCREEN_TYPE, DRIVER_NO,
        VECHICAL_STATUS, remarks,
        REPLACE(ZSUPPLIER_NAME, ' - ', '') as ZSUPPLIER_NAME, VEHICLE_TYPE, a.WERKS,
        CONCAT(a.WERKS, '-', b.PLANT_NAME) as PlantName,
        CONCAT(a.LGORT, '-', c.STORAGE_LOCATION) as StorageLocation,
        IDNLF, INCO1, WaitOutsideDt, GateInDt, QualityCheckSubmitDt, UnloadWHSubmitDt, 
        GateOutDt, MIGOApprovalDt, MigoRejectedDt, QualityDeductionSubmitDt,
        FirstWeightEntryDt, FirstWeightEntryBy, FirstWeightEntryByName,
        SecondWeightEntryDt, SecondWeightEntryBy, SecondWeightEntryByName,
        REDIRECT_PO_LINE_ITEM, REDIRECT_WERKS, REDIRECT_LGORT,
        (SELECT qc_work_doc FROM quality_info WHERE purchase_info_id = a.PI_REFID LIMIT 1) as quality_info,
        (SELECT supp_inv_copy FROM gateout_info WHERE purchase_info_id = a.PI_REFID) as supp_inv_copy,
        (SELECT supp_wb_copy FROM gateout_info WHERE purchase_info_id = a.PI_REFID) as supp_wb_copy,
        (SELECT naga_os_wb_copy FROM gateout_info WHERE purchase_info_id = a.PI_REFID) as naga_os_wb_copy
    ");

	    $builder->join('master_plant b', 'a.WERKS = b.WERKS', 'left');
	    $builder->join('master_storage c', 'a.LGORT = c.LGORT AND b.id = c.plantid', 'left');

    // Extract filters
    $fromDate = !empty($postData->fromDate) ? date('Y-m-d', strtotime($postData->fromDate)) : null;
    $toDate = !empty($postData->toDate) ? date('Y-m-d', strtotime($postData->toDate)) : null;
    $plantIds = [];

    if (!empty($postData->plantid) && is_array($postData->plantid)) {
        foreach ($postData->plantid as $plant) {
            if (isset($plant->value)) {
                $plantIds[] = $plant->value;
            }
        }
    }

    // Apply filters
    if ($fromDate && $toDate) {
        $builder->where('DateAdded >=', $fromDate . ' 00:00:00');
        $builder->where('DateAdded <=', $toDate . ' 23:59:59');
    }

    if (!empty($plantIds)) {
        $builder->whereIn('a.WERKS', $plantIds);
    }

	    // Always apply VECHICAL_STATUS filter
	    $builder->whereIn('VECHICAL_STATUS', [6, 27, 28, 31]);

    // Handling default or filtered
    if (empty($postData->fromDate) && empty($postData->toDate) && empty($plantIds)) {
        $builder->orderBy('DateAdded', 'DESC');
        $builder->limit(50);
    } else {
        $builder->orderBy('DateAdded', 'DESC');
        $builder->orderBy('VECHICAL_STATUS', 'ASC');
    }

    return $builder->get()->getResultArray();
    }

   public function getSupplierLoadingDateList() {
   
    $builder = $this->db->table('supplier_vehical_info')
        ->select("supplier_vehical_info.*,supplier_dispatch_info.*,DATE_FORMAT(sap_to_pp.PO_LOADING_DATE, '%d-%m-%Y') AS PO_LOADING_DATE,DATE_FORMAT(supplier_dispatch_info.ZSUPPLIER_LOAD_DT, '%d-%m-%Y') AS ZSUPPLIER_LOAD_DT")
        ->join('supplier_dispatch_info', 'supplier_dispatch_info.SD_REFID = supplier_vehical_info.SUPPLIER_ID', 'inner')
		->join('sap_to_pp', 'supplier_dispatch_info.ZPO_NUMBER = sap_to_pp.EBELN AND supplier_dispatch_info.ZPO_LINE_ITEM = sap_to_pp.EBELP AND supplier_dispatch_info.ZSUPPLIER_CODE = sap_to_pp.SUPPLIER_CODE', 'inner')
        ->where('supplier_vehical_info.LOADING_STATUS',0)
		->where('supplier_vehical_info.LOADING_REASON IS NULL')
        ->groupBy('supplier_vehical_info.SUP_VE_REFID')
        ->orderBy('supplier_vehical_info.SUP_VE_REFID', 'ASC');

    $result = $builder->get()->getResultArray();
    return $result;  
   }

   public function updateSupplierLoadingDelay($data) {
		$currentDateTime = date("Y-m-d H:i:s");

		$updateData = [
			'LOADING_REASON'   => $data->LOADING_REASON ?? null,
			'DEDUCTION'   	   => $data->DEDUCTION ?? null,
			'NON_DEDUCTION'    => $data->NON_DEDUCTION ?? null,
			'DEDUCTION_COST'   => $data->DEDUCTION_COST ?? null,
			'DELAY_REASON_AT'    => $currentDateTime,
			'DELAY_REASON_BY'    => $data->userInfoId ?? null,
			'LOADING_STATUS'   => 1
		];

		$this->db->table("supplier_vehical_info")
			->set($updateData)
			->where('SUP_VE_REFID', $data->SUP_VE_REFID)
			->update();

		return $this->db->affectedRows(); // returns 0, 1, or more depending on the update result
	}

}
