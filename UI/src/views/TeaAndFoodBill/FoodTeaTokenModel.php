<?php

namespace App\Models;

use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use CodeIgniter\Model;
use DateTime;
use PhpParser\Node\Expr\BinaryOp\Concat;

class FoodTeaTokenModel extends Model
{

    public function getVendor($vendorType, $plant_code)
    {
        $builder = $this->db->table("master_vendor");

        // Select for dropdown
        $builder->select("Id as value, CONCAT(Name, '-', Code) as label");

        // Vendor category filter
        if (!empty($vendorType)) {
            $builder->where("Category", $vendorType);
        }

        // Plant filter (supports single or multiple plant codes)
        if (!empty($plant_code)) {

            // Convert comma-separated string to array
            $plants = explode(",", $plant_code);

            // Trim values & remove empty entries
            $plants = array_values(
                array_filter(
                    array_map("trim", $plants),
                    fn($v) => $v !== ""
                )
            );

            // Apply whereIn only if valid plants exist
            if (!empty($plants)) {
                $builder->whereIn("plant_code", $plants);
            }
        }

        // Optional: return only active vendors
        // $builder->where("status", 1);

        // Execute query
        return $builder->get()->getResultArray();
    }

    public function gettypeforfood()
    {
        $builder = $this->db->table("definitions_list");

        $builder->select("
        id AS value,
        definitionsName AS label,
        definitionsvalues
    ");

        $builder->where("isActive", 1);
        $builder->where("definitionsId", 36);

        return $builder->distinct()->get()->getResultArray();
    }
    public function gettowhomlist()
    {
        $builder = $this->db->table("definitions_list");

        $builder->select("
        id AS value,
        definitionsName AS label,
        definitionsvalues
    ");

        $builder->where("isActive", 1);
        $builder->where("definitionsId", 37);

        return $builder->distinct()->get()->getResultArray();
    }

    public function getShift($plant_code, $type)
{
    /* ---------- PLANT FILTER ---------- */
    if (!empty($plant_code)) {
        $splittedNumbers = explode(",", $plant_code);
        $splittedNumbers = array_values(array_filter(array_map('trim', $splittedNumbers)));

        $numbers = "'" . implode("', '", $splittedNumbers) . "'";
        $plants = "AND shift.plant_code IN ($numbers)";
    } else {
        $plants = '';
    }

    /* ---------- TYPE FILTER ---------- */
    if (!empty($type)) {
        $typeCondition = "AND shift.food_type = " . $this->db->escape($type);
    } else {
        $typeCondition = '';
    }

    /* ---------- QUERY ---------- */
    $builder = $this->db->table("shift");
    $builder->select("Id AS value, shiftName AS label, shiftInTime, amount, tea_amount");
    $builder->where("status = 1 $plants $typeCondition");

    return $builder->get()->getResultArray();
}

    public function foodBillPosting($json) {

        // 1. Check for old pending entries
        $threeDaysAgo = date('Y-m-d', strtotime('-3 days'));
        $builder = $this->db->table('food_bill');
        $oldPending = $builder->select('*')
            ->where('employeeId', $json->employeeId)
            ->where('status', 1)
            ->where('DATE(createdAt) <', $threeDaysAgo)
            ->get()
            ->getResultArray();

        if (!empty($oldPending)) {
            return [
                'status' => 0,
                'message' => 'The previous food bill is pending approval for more than 3 days. Please clear it before submitting a new one.',
                'pendingEntries' => $oldPending,
            ];
        }


        $today = date('Y-m-d');
        $builder = $this->db->table('food_bill');
        $builder->where('employeeId', $json->employeeId);
        $builder->where('DATE(billDate)', $json->billDate ? $json->billDate : $today); // Make sure you have 'createdAt' timestamp in table
        $builder->whereIn('status>',0); // 0 = Rejected, 1 = Pending
        $exists = $builder->get()->getResultArray();

        if (!empty($exists)) {
            return [
                'status' => 0,
                'message' => 'Duplicate entry: already posted for today.',
            ];
        }

        $lastMiroData = $this->MiroLastID($json->plantCode);
        $transcation_unique_no = $lastMiroData[0]['uniqueId'];
        $res = VANumberHelper::VANumberHelper('FD', $json->plantCode, $transcation_unique_no);
        $data  = array(
            'vendorId' => $json->vendorId,
            'uniqueId'=> $res,
            'employeeId' => $json->employeeId,
            'shiftId' => $json->shiftId,
            'shiftTime' => $json->shiftTime,
            'outTime' => $json->outTime,
            'amount' => $json->amount,
            'remark' => $json->remark,
            'status' => 1,
            'createdBy' => $json->userInfoId,
            'plantCode' => $json->plantCode,
            'inTime'=> $json->inTime, 
            'foodType'=> $json->foodType,
            'foodTypename'=> $json->foodTypename,
            'toWhom'=> $json->toWhom,
            'toWhomName'=> $json->toWhomName,
            'noOfLoadman'=> $json->noOfLoadman,
            'billDate'=> $json->billDate ? $json->billDate : $today,
        );
        // print_r($data);exit;
        $builder = $this->db->table("food_bill");
        $success = $builder->insert($data);
        // print_r($success);exit;
    
        if ($success) {
            return [
                'status' => $this->db->insertID(),
                'message' => 'Food bill posted successfully.',
            ];
        } else {
            return [
                'status' => 0,
                'message' => 'Failed to post food bill. Please try again.',
            ];
        }
    }
    public function MiroLastID($plantCode) {
        $builder = $this->db->table("food_bill");
        $builder = $builder->select('uniqueId');
        $builder = $builder->where('plantCode', $plantCode);
        $builder = $builder->where('status !=',0);
        $builder = $builder->orderBy('uniqueId', 'DESC');
        $builder = $builder->limit(1);
        
        $result = $builder->get()->getResultArray();
        return $result;
    }

    public function foodBillGet($plantCode, $status, $fromDate, $toDate) {
        // Convert milliseconds to seconds if necessary
        if ($fromDate > 1000000000000) {
            $fromDate /= 1000;
        }
        if ($toDate > 1000000000000) {
            $toDate /= 1000;
        }
    
        // Format dates
        $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
        $toDate   = $toDate > 0   ? date("Y-m-d 23:59:59", $toDate)   : date("Y-m-d 23:59:59");
    
        // Start building query
        $builder = $this->db->table("food_bill")
            ->select("
                food_bill.*,
                employee_master.emp_name,
                employee_master.emp_code,
                employee_master.emp_department,
                employee_master.emp_costcentre,
                master_vendor.Name,
                shift.shiftName,
                user_info.FIRST_NAME,
                DATE_FORMAT(food_bill.billDate, '%d-%m-%Y') AS billDate,
                DATE_FORMAT(food_bill.createdAt, '%d-%m-%Y') AS createdDate,
                DATE_FORMAT(food_bill.createdAt, '%H:%i:%s') AS createdTime,
                CASE 
                    WHEN food_bill.status = 1 THEN 'Approve'
                    WHEN food_bill.status = 2 THEN 'Complete'
                    WHEN food_bill.status = 0 THEN 'Reject'
                    ELSE 'Unknown'
                END AS statusName
            ")
            ->join('master_vendor', 'master_vendor.Id = food_bill.vendorId', 'inner')
            ->join('employee_master', 'employee_master.emp_id = food_bill.employeeId', 'inner')
            ->join('user_info', 'user_info.UI_ID = food_bill.createdBy', 'inner')
            ->join('shift', 'shift.id = food_bill.shiftId', 'inner');
    
        // Filter by date only if status > 1
        if ($status > 1) {
            $builder->where('food_bill.createdAt >=', $fromDate);
            $builder->where('food_bill.createdAt <=', $toDate);
        }
    
        // Apply status filter
        if ($status == 1) {
            $builder->where('food_bill.status', $status);
        }
    
        // if ($status > 1) {
            // Filter by plant codes if provided
            if (!empty($plantCode)) {
                // Convert comma-separated string to clean string array (for VARCHAR comparison)
                $plants = array_map('trim', explode(',', $plantCode));  // ['9290', '9230', 'FF05', ...]
                $builder->whereIn('food_bill.plantCode', $plants);
                
            }
        // }
    
        // Optional: group by ID if needed for joins
        $builder->groupBy('food_bill.id');
    
        // Execute and return results
        return $builder->get()->getResultArray();
    }
    
    public function updateFoodBill($data) {
        if ($data->status == 0) {
            $this->updateTables($data->id, [
                'status' => 0,
            ]);
            return [1, "Rejected Successfully"];
    
        } else if ($data->status == 2) {
            $updateData = [
                'vendorId'   => $data->vendorId,
                'employeeId' => $data->employeeId, 
                'shiftId'    => $data->shiftId,
                'shiftTime'  => $data->shiftTime,
                'outTime'    => $data->outTime,
                'inTime'     => $data->inTime,
                'amount'     => $data->amount,
                'remark'     => $data->remark,
                'status'     => 2,
                'updatedAt'  => $data->userInfoId,
                'billDate'   => $data->billDate,
                'foodType'   => $data->foodType,
                'foodTypename'   => $data->foodTypename,
                'toWhom'   => $data->toWhom,
                'toWhomName'   => $data->toWhomname,
                'noOfLoadman'   => $data->noOfLoadman,
            ];
    
            $this->updateTables($data->id, $updateData);
    
            return [1, "Updated Successfully"];
        }
    }
    
    private function updateTables($id, $receiptUpdateData) {
        $this->db->table("food_bill") // ✅ use correct table name (not "foodBill")
            ->set($receiptUpdateData)
            ->where('id', $id)
            ->update(); 
    }
    public function foodBillById($id) {
       
        // Start building query
        $builder = $this->db->table("food_bill")
            ->select("food_bill.*,employee_master.emp_name,employee_master.emp_code,employee_master.emp_name,employee_master.emp_department,master_vendor.Name,shift.shiftName,user_info.FIRST_NAME,DATE_FORMAT(food_bill.createdAt, '%d-%m-%Y') AS createdDate,DATE_FORMAT(food_bill.createdAt, '%H:%i:%s') AS createdTime,user_info.FIRST_NAME,master_plant_address.*")
            ->join('master_vendor', 'master_vendor.Id = food_bill.vendorId', 'inner')
            ->join('employee_master', 'employee_master.emp_id = food_bill.employeeId', 'inner')
            ->join('user_info', 'user_info.UI_ID = food_bill.createdBy', 'inner')
            ->join('shift', 'shift.id = food_bill.shiftId', 'inner')
            ->join('master_plant_address', 'master_plant_address.masterPlantId = food_bill.plantCode', 'inner');
        $builder->where('food_bill.id', $id);
    
    
        // Group by food_bill.id (optional)
        $builder->groupBy('food_bill.id');
        // $builder=$builder->get()->getResultArray();
        // print_r($builder);exit;
    
        // Execute and return results
        return $builder->get()->getResultArray();
    }
    // Insert main tea bill and associated items
    public function insertTeaBill($billData, $quantities) {
        $db = \Config\Database::connect();

        $db->transStart();
        // Insert main tea bill
        $db->table('tea_bills')->insert($billData);
        $billId = $db->insertID();
    
        // Insert each item directly from posted quantities
        foreach ($quantities as $item) {
            $label = isset($item['detail']) ? trim($item['detail']) : null;
            $qty   = isset($item['qty']) ? (float) $item['qty'] : 0;
    
            if (!empty($label)) {
                $db->table('tea_bill_items')->insert([
                    'tea_bill_id' => $billId,
                    'item_name'   => $label,
                    'quantity'    => $qty
                ]);
            }
        }
    
        $db->transComplete();
    
        if ($db->transStatus() === false) {
            throw new \Exception('Transaction failed while inserting tea bill');
        }
    
        return $billId;
    }
    
    // Fetch a single tea bill by ID (with items)
    public function teaBillGet($plantCode, $status, $fromDate, $toDate) {
        // Convert milliseconds to seconds
        if ($fromDate > 1000000000000) $fromDate /= 1000;
        if ($toDate > 1000000000000) $toDate /= 1000;
    
        $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
        $toDate   = $toDate > 0   ? date("Y-m-d 23:59:59", $toDate)   : date("Y-m-d 23:59:59");
    
        $builder = $this->db->table("tea_bills")
            ->select("
                tea_bills.*,
                (tea_bills.tea_cost * tea_bills.total_qty) AS amount,
                DATE_FORMAT(tea_bills.created_at, '%d-%m-%Y %H:%i:%s') AS createdDate,
                DATE_FORMAT(tea_bills.gateout_at, '%d-%m-%Y %H:%i:%s') AS gateOutDate,
                DATE_FORMAT(tea_bills.approved_at, '%d-%m-%Y %H:%i:%s') AS approvedDate,
                DATE_FORMAT(tea_bills.bill_date, '%d-%m-%Y') AS bill_date,
                CASE 
                    WHEN tea_bills.status = 1 THEN 'Approve'
                    WHEN tea_bills.status = 2 THEN 'Complete'
                    WHEN tea_bills.status = 3 THEN 'Complete'
                    WHEN tea_bills.status = 0 THEN 'Reject'
                    ELSE 'Unknown'
                END AS statusName,user_info.FIRST_NAME as issuedBy
            ")
            ->join('user_info', 'user_info.UI_ID = tea_bills.created_by', 'inner');
        // Apply date range only for non-pending status
        if ($status > 1) {
            $builder->where('tea_bills.created_at >=', $fromDate);
            $builder->where('tea_bills.created_at <=', $toDate);
        }
    
        // Gate Out + HR Approve
        if ($status == 1) {
            $builder->whereIn('tea_bills.status', [1]);
        } 
        // elseif (in_array($status, [0, 2, 3])) {
        //     $builder->where('tea_bills.status', $status);
        // }
    
        if ($plantCode != 0) {
            $plants = explode(",", $plantCode);
            $builder->whereIn('tea_bills.gate_id', $plants);
        }
    
        $builder->orderBy('id', 'ASC')->groupBy('tea_bills.id');
        $bills = $builder->get()->getResultArray();
    
        // Get tea_bill_items
        $billIds = array_column($bills, 'id');
    
        if (!empty($billIds)) {
            $details = $this->db->table("tea_bill_items")
                ->select("tea_bill_id, item_name, quantity")
                ->whereIn("tea_bill_id", $billIds)
                ->orderBy('id', 'ASC')
                ->get()
                ->getResultArray();
    
            // Group by tea_bill_id
            $groupedDetails = [];
            foreach ($details as $row) {
                $groupedDetails[$row['tea_bill_id']][] = [
                    'item_name' => $row['item_name'],
                    'qty'       => $row['quantity']
                ];
            }
    
            // Attach to each bill
            foreach ($bills as &$bill) {
                $bill['quantities'] = $groupedDetails[$bill['id']] ?? [];
            }
        }
    
        return $bills;
    }
    
    

    // Fetch all tea bills (optional listing)
    public function getTeaBillById($id) {
        $builder = $this->db->table("tea_bill_items")
            ->select("tea_bill_items.*, tea_bills.*")
            ->join('tea_bills', 'tea_bill_items.tea_bill_id = tea_bills.id', 'inner')
            ->where('tea_bills.id', $id)
            ->groupBy('tea_bill_items.id'); // optional if you expect multiple items
    
        return $builder->get()->getResultArray();
    }
    

    public function generateTeaBillUniqueId($plantCode) {
        // Get gate code
        $row = $this->db
            ->table('master_gate')
            ->select('gateCode')
            ->where('id', $plantCode)
            ->orderBy('id', 'DESC')
            ->limit(1)
            ->get()
            ->getRowArray();
    
        if (!$row || empty($row['gateCode'])) {
            return null; // Or handle error accordingly
        }
    
        // Get last tea bill unique ID for this gate
        $query = $this->db->table('tea_bills')
            ->select('unique_id')
            ->where('gate_id', $plantCode)
            ->orderBy('id', 'DESC')
            ->limit(1)
            ->get();
    
        $lastRow = $query->getRowArray();
        $lastUniqueId = $lastRow ? $lastRow['unique_id'] : '';
    
        // Optional debug
        // print_r($lastRow); exit;
    
        // Generate new unique ID
        return VANumberHelper::VANumberHelper('TE', $row['gateCode'], $lastUniqueId);
    }
    
    
    public function updateTeaBill($data) {
        $CurrentDateTime = date("Y-m-d H:i:s");
    
        if ($data->status == 0) {
            // Rejected
            $this->updateTableTeaBill($data->id, [
                'status' => 0,
                'remark' => $data->remark ?? null
            ]);
            return [1, "Rejected Successfully"];
        } else if ($data->status == 2 || $data->status == 3) {
            // Gate Out or Approve
            $updateData = [
                'vendor_id'    => $data->vendorId,
                'shift_id'     => $data->shiftId,
                'vendor_name'  => $data->vendorName,
                'shift_name'   => $data->shiftName,
                'total_qty'    => $data->total_qty,
                'remark'       => $data->remark,
                'status'       => $data->status,
                'in_time'      => $data->in_time,
                'out_time'     => $data->out_time,
                'tea_cost'     => $data->tea_cost,
                'bill_date'    => $data->bill_date
            ];
    
            // Add timestamp and user
            if ($data->status == 2) {
                $updateData['gateout_at'] = $CurrentDateTime;
                $updateData['gateout_by'] = $data->userInfoId;
            } else if ($data->status == 3) {
                $updateData['approved_at'] = $CurrentDateTime;
                $updateData['approved_by'] = $data->userInfoId;
            }
    
            // Update main tea_bills table
            $this->updateTableTeaBill($data->id, $updateData);
    
            // Update detail quantities (if any)
            if (!empty($data->quantities) && is_array($data->quantities)) {
                $this->updateTeaBillDetails($data->id, $data->quantities);
            }
    
            return [1, "Updated Successfully"];
        }
    
        return [0, "Invalid status"];
    }
    
    private function updateTableTeaBill($id, $receiptUpdateData) {
        $this->db->table("tea_bills")
            ->set($receiptUpdateData)
            ->where('id', $id)
            ->update(); 
    }
    
    private function updateTeaBillDetails($billId, $quantities) {
        foreach ($quantities as $item) {

            $detail = isset($item->item_name) ? trim($item->item_name) : null;
            $qty    = isset($item->qty) ? (float)$item->qty : 0;
    
            // Check if item already exists for this bill
            $existing = $this->db->table('tea_bill_items')
                ->where('tea_bill_id', $billId)
                ->where('item_name', $detail)
                ->get()
                ->getRow();
            if ($existing) {
                // Update existing item
                $this->db->table('tea_bill_items')
                    ->where('id', $existing->id)
                    ->update(['quantity' => $qty]);
            } else {
                // Insert new item
                $this->db->table('tea_bill_items')->insert([
                    'tea_bill_id' => $billId,
                    'item_name'   => $detail,
                    'quantity'    => $qty
                ]);
            }
        }
    }
    public function GetEmployeeName($plant_code)
    {
            if (!empty($plant_code)) {
                $splittedNumbers = explode(",", $plant_code);
                $numbers = "'" . implode("', '", $splittedNumbers) . "'";
                $plants = "($numbers)";

                $builder = $this->db->query("
                    SELECT 
                        emp_id AS value, 
                        CONCAT(emp_name, '-', emp_code) AS label 
                    FROM 
                        employee_master 
                    WHERE 
                        plant_code IN $plants 
                        AND emp_status IN (0, 1)
                ");
            } else {
                // ✅ Fixed: Added WHERE clause
                $builder = $this->db->query("
                    SELECT 
                        emp_id AS value, 
                        CONCAT(emp_name, '-', emp_code) AS label  
                    FROM 
                        employee_master 
                    WHERE 
                        emp_status IN (0, 1)
                ");
            }

            return $builder->getResultArray();
    }

    public function add_employee($data) {
        // print_r($data);exit;
        $builder = $this->db->table('employee_master');
        $builder->insert($data);
        
        if ($this->db->affectedRows() > 0) {
            return $this->db->insertID(); // returns the inserted ID
        }
    
        return false; // insert failed
    }

    public function update_employee_by_code($employeeCode, $data) {
        // print_r($data);print_r($employeeCode);exit;
        $builder = $this->db->table('employee_master');
        $builder->where('emp_code', $employeeCode);
        $builder->update($data);
        return $this->db->affectedRows() > 0; // returns true if updated
    }

    public function is_duplicate_employee_code($employeeCode) {
        $count = $this->db->table('employee_master')
                        ->where('emp_code', $employeeCode)
                        ->countAllResults(); // returns the integer count
        return $count;
    }

   public function bulkApproveFoodBill($data){
    if (empty($data->ids) || !is_array($data->ids)) {
        return [0, "No records selected"];
    }

    $ids = $data->ids;
    $status = $data->status;
    $userId = $data->userInfoId;

    foreach ($ids as $id) {
        $updateData = [
            'status'    => $status,
            'updatedAt' => date('Y-m-d H:i:s'),
            'updatedBy' => $userId,
        ];

        $this->updateTables($id, $updateData);
    }

    return [1, "Approved Successfully"];
}

    
}

