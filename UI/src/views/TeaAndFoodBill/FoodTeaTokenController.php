<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use App\Models\FoodTeaTokenModel;
use CURLFile;
use DateTime;

class FoodTeaTokenController extends BaseApiController

{
	public function getVendor($vendorType,$plant_code = null){
		$master = new FoodTeaTokenModel();
		return  $this->sendSuccessResult($master->getVendor($vendorType,$plant_code));
	}
	public function gettypeforfood(){
		$master = new FoodTeaTokenModel();
		return  $this->sendSuccessResult($master->gettypeforfood());
	}
	public function gettowhomlist(){
		$master = new FoodTeaTokenModel();
		return  $this->sendSuccessResult($master->gettowhomlist());
	}
	public function getShift($plantcode=null,$type=null){
		$master = new FoodTeaTokenModel();
		return  $this->sendSuccessResult($master->getShift($plantcode,$type));
	}
	public function foodBillPosting() {
		$json = $this->request->getJSON();
		$gateService = new FoodTeaTokenModel();    
		$result = $gateService->foodBillPosting($json);
		$dataStatus = $result['status'] > 0 ? true : false;
		$message = $result['message'];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message]);
	}

	public function foodBillGet($plantCode=null,$status,$fromDate=null,$toDate=null)
	{
		$gateService = new FoodTeaTokenModel();
		$results = $gateService->foodBillGet($plantCode,$status,$fromDate,$toDate);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function updateFoodBill() {
		$gateService = new FoodTeaTokenModel(); 
		$json = $this->request->getJSON(); 
		// print_r($json);exit;   
		$result = $gateService->updateFoodBill($json);
		$dataStatus = $result[0] > 0 ? true : false;
		$message = $result[1];
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function foodBillById($id)
	{
		$gateService = new FoodTeaTokenModel();
		$results = $gateService->foodBillById($id);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}

	// POST: Insert Tea Bill
	public function insertTeaBill() {
		$post = json_decode(file_get_contents("php://input"), true);
	
		if (
			!$post || 
			empty($post['vendorId']) || 
			empty($post['shiftId']) || 
			empty($post['date']) || 
			!is_array($post['quantities']) || 
			empty($post['gate_id'])
		) {
			echo json_encode(['success' => false, 'message' => 'Missing required fields']);
			return;
		}
	
		try {
			// Load model
			$gateService = new FoodTeaTokenModel();
	
			// Check for duplicates before generating ID
			$db = \Config\Database::connect();
			$duplicate = $db->table('tea_bills')
				->where('bill_date', $post['date'])
				->where('vendor_id', $post['vendorId'])
				->where('shift_id', $post['shiftId'])
				// ->where('department', $post['department'])
				->where('gate_id', $post['gate_id'])
				->where('status>',0)
				->get()
				->getRow();

			if ($duplicate) {
				echo json_encode(['success' => false, 'message' => 'Tea Bill already added for this shift.']);
				return;
			}

			$threeDaysAgo = date('Y-m-d', strtotime('-3 days'));

			$pendingOld = $db->table('tea_bills')
				->whereIn('status', [1]) // 0 = Rejected, 1 = Pending
				->where('created_at <', $threeDaysAgo)
				->get()
				->getRow();

			if ($pendingOld) {
				echo json_encode(['success' => false, 'message' => 'There is a pending tea bill older than 3 days.']);
				return;
			}

			// Generate Unique ID
			$uniqueId = $gateService->generateTeaBillUniqueId($post['gate_id']);
			// Prepare main bill data
			$billData = [
				'unique_id'   => $uniqueId,
				'vendor_id'   => $post['vendorId'],
				'vendor_name' => $post['vendorName'] ?? '',
				'shift_id'    => $post['shiftId'],
				'shift_name'  => $post['shiftName'] ?? '',
				'bill_date'   => $post['date'],
				'in_time'     => $post['inTime'] ?? null,
				'out_time'    => $post['outTime'] ?? null,
				'total_qty'   => $post['total'] ?? 0,
				'status'      => 1,
				'created_by'  => $post['userId'],
				'gate_id'     => $post['gate_id'],
				// 'department'  => $post['department'],
				'tea_cost' 	  => $post['tea_cost']
			];
	
			$quantities = $post['quantities'];  // array of quantities matching definition list
			
			// Insert
			$insertId = $gateService->insertTeaBill($billData, $quantities);
			echo json_encode(['success' => true, 'message' => 'Tea Bill Saved', 'id' => $insertId]);
	
		} catch (Exception $e) {
			echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $e->getMessage()]);
		}
	}
	

	// GET: Fetch bill by ID
	public function teaBillGet($plantCode=null,$status,$fromDate=null,$toDate=null) {
		$gateService = new FoodTeaTokenModel();
		$results = $gateService->teaBillGet($plantCode,$status,$fromDate,$toDate);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}

	// GET: Fetch all bills
	public function getTeaBillById($id) {
		$gateService = new FoodTeaTokenModel();
		$data = $gateService->getTeaBillById($id);
		echo json_encode(['success' => true, 'data' => $data]);
	}
	public function updateTeaBill() {
		$gateService = new FoodTeaTokenModel(); 
		$json = $this->request->getJSON();    
		$result = $gateService->updateTeaBill($json);
		$dataStatus = $result[0] > 0 ? true : false;
		$message = $result[1];
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function GetEmployeeName($plant_code = null)
    {
      $master=new FoodTeaTokenModel();
      return $this->sendSuccessResult($master->GetEmployeeName($plant_code));
    } 

	public function addEmployeeDetails() {
		$input = json_decode(file_get_contents("php://input"), true);
		$Employee_model=new FoodTeaTokenModel();
		if (!empty($input['employees'])) {
			foreach ($input['employees'] as $emp) {
				$empCode = $emp['employeeCode'];
				$data = [
					'emp_name'           => ucfirst(strtolower(trim($emp['employeeName']))),
					'emp_mail_id'        => strtolower(trim($emp['employeeMailId'])),
					'emp_mobile_number'  => $emp['employeeMobileNumber'],
					'emp_department'     => ucfirst(strtolower(trim($emp['employeeDepartment']))),
					'emp_designation'    => $emp['employeeDesignation'],
					'emp_division'       => $emp['employeeDivision'],
					'plant_code'         => $emp['plantCode'],
					'emp_status'         => $emp['emp_status'] == 'ACTIVE' ? 0 : 2
				];
				if ($Employee_model->is_duplicate_employee_code($empCode)) {
					$data['updated_by'] = $emp['userInfoId'];
					$result = $Employee_model->update_employee_by_code($empCode, $data);
				} else {
					$data['emp_code'] = $empCode;
					$data['created_by'] = $emp['userInfoId'];
					$result = $Employee_model->add_employee($data);
				}
			}
	
			echo json_encode(['success' => true, 'message' => 'Employee(s) processed successfully.']);
		} else {
			echo json_encode(['success' => false, 'message' => 'No employees data provided.']);
		}
	}
	
	public function syncEmployeeFromZingHR()
	{
		$client = \Config\Services::curlrequest();

		$response = $client->post(ZINGHRURL, [
			'headers' => [
				'Content-Type' => 'application/json',
				// Replace with actual current cookies if needed
				'Cookie' => ZINGHRCOOKIE
			],
			'json' => [
				'SubscriptionName' => 'NAGA',
				'Token' => ZINGHRTOKEN,
				'EmployeeCode' => '',
				'EmploymentStatus' => 'Active'
			]
		]);

		$data = json_decode($response->getBody(), true);
		// print_r($data);exit;
		$Employee_model=new FoodTeaTokenModel();
		if (empty($data['Employees']) || !is_array($data['Employees'])) {
			return $this->response->setJSON(['success' => false, 'message' => 'No employee data found']);
		}
		// print_r($data);exit;
		// Division to Plant Code mapping
		$divisionToPlantCode = [
			'NLFD'  => 'FM01',
			'NLDV'  => 'DV00',
			'NLMD'  => 'MD00',
			'NLSD'  => 'SD00',
			'NLRE'  => 'CP02',
			'NLIF'  => '9300',
			'NLED'  => 'SD00',
			'NLFA'  => 'FM02',
			'NLPP'  => 'SD00',
			'NLLD'  => 'LD00',
			'NLCD1' => 'CP00',
			'NLCD2' => 'CP00',
			'NLCD 1' => 'CP00',
			'NLCD 2' => 'CP00',
		];

		$added = 0;
		$updated = 0;

		foreach ($data['Employees'] as $emp) {
			$employeeCode = $emp['EmployeeCode'];

			// default empties
			$department = '';
			$designation = '';
			$division = '';
			$cost_centre = '';
			$profit_centre = '';
			foreach ($emp['Attributes'] ?? [] as $attr) {
				if (isset($attr['AttributeTypeDesc'])) {
					switch ($attr['AttributeTypeDesc']) {
						case 'Department':
							$department = $attr['AttributeTypeUnitDesc'] ?? '';
							break;
						case 'Designation':
							$designation = $attr['AttributeTypeUnitDesc'] ?? '';
							break;
						case 'Division':
							$division = $attr['AttributeTypeUnitDesc'] ?? '';
							break;
						case 'Cost Center':
							$cost_centre = $attr['AttributeTypeUnitDesc'] ?? '';
							break;
						case 'Profit Center':
							$profit_centre = $attr['AttributeTypeUnitDesc'] ?? '';
							break;
						
					}
				}
			}

			// Map division to plant code; fallback to a default if missing
			$plantCode = isset($divisionToPlantCode[$division]) ? $divisionToPlantCode[$division] : null;
			if (!$plantCode) {
				// optional: skip if no mapping
				$plantCode = ''; // or continue;
			}

			$employeeData = [
				'emp_name'           => $emp['EmployeeName'] ?? '',
				'emp_mail_id'        => $emp['Email'] ?? '',
				'emp_mobile_number'  => $emp['Mobile'] ?? '',
				'emp_department'     => $department,
				'emp_designation'    => $designation,
				'emp_division'       => $division,
				
				'emp_costcentre'     => $cost_centre,
				'emp_profitcentre'   => $profit_centre,
				//'created_by'         => 1, // adjust if you have current user context
				// 'created_at'         => date('Y-m-d H:i:s')
				
			];
			if ($Employee_model->is_duplicate_employee_code($employeeCode)) {
				$Employee_model->update_employee_by_code($employeeCode, $employeeData);
				$updated++;
			} else {
				$employeeData['emp_code'] = $employeeCode;
				$employeeData['created_by'] = 1;
				$employeeData['plant_code'] = $plantCode;
				$Employee_model->add_employee($employeeData);
				$added++;
			}
		}

		return $this->response->setJSON([
			'success' => true,
			'message' => 'Sync complete',
			'added'   => $added,
			'updated' => $updated
		]);
	}
	public function syncEmployeeDeactiveFromZingHR()
	{
		$client = \Config\Services::curlrequest();

		$response = $client->post(ZINGHRURL, [
			'headers' => [
				'Content-Type' => 'application/json',
				// Replace with actual current cookies if needed
				'Cookie' => ZINGHRCOOKIE
			],
			'json' => [
				'SubscriptionName' => 'NAGA',
				'Token' => ZINGHRTOKEN,
				'EmployeeCode' => '',
				'EmploymentStatus' => 'Inactive'
			]
		]);

		$data = json_decode($response->getBody(), true);
		$Employee_model=new FoodTeaTokenModel();
		if (empty($data['Employees']) || !is_array($data['Employees'])) {
			return $this->response->setJSON(['success' => false, 'message' => 'No employee data found']);
		}
		

		$added = 0;
		$updated = 0;

		foreach ($data['Employees'] as $emp) {
			$employeeCode = $emp['EmployeeCode'];
			$employeeData = [
				'emp_status'  => 2,	
			];
			if ($Employee_model->is_duplicate_employee_code($employeeCode)) {
				$Employee_model->update_employee_by_code($employeeCode, $employeeData);
				$updated++;
			}
		}

		return $this->response->setJSON([
			'success' => true,
			'message' => 'Sync complete',
			'updated' => $updated
		]);
	}

	public function bulkApproveFoodBill() {
		$gateService = new FoodTeaTokenModel(); 
		$json = $this->request->getJSON(); 
		// print_r($json);exit;   
		$result = $gateService->bulkApproveFoodBill($json);
		$dataStatus = $result[0] > 0 ? true : false;
		$message = $result[1];
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	
}
