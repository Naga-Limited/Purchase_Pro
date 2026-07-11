<?php

namespace App\Models\MarketRateCD;

use CodeIgniter\Model;

$db = \Config\Database::connect();

class MrtRateModel extends Model
{
    public function getGroceriesCategory($userid, $role)
{
    if ($role != 'Vendor') {
        $builder = $this->db->table('master_market mr');
        $builder->select('mr.mr_id as value, mr.groceries_type as label');
        $builder->where('mr.active_status', 1);
        return $builder->get()->getResultArray();

    } else {
        // Vendor role — get only categories this vendor has access to
        $builder = $this->db->table('market_details_user_access mau');
        $builder->select('mr.mr_id as value, mr.groceries_type as label');
        $builder->join('master_market_details mmd', 'mmd.md_id = mau.sub_groceries_id', 'inner');
        $builder->join('master_market mr', 'mr.mr_id = mmd.groceries_id', 'inner');
        $builder->where('mau.user_id', $userid);
        $builder->where('mau.status', 1);
        $builder->groupBy('mr.mr_id');
        return $builder->get()->getResultArray();
    }}
    public function getStates()
    {
        $builder = $this->db->query(" SELECT  state_id as value, state_name as label  FROM master_state WHERE active_status =1");
        return $builder->getResultArray();
    }
    public function getDistricts($stateid)
    {
        $builder = $this->db->query(" SELECT  district_id as value,district_name as label  FROM master_district WHERE active_status =1 AND  $stateid = state_id ");
        return $builder->getResultArray();
    }
    public function getCitiesByDistrict($districtid)
    {
        $builder = $this->db->query(" SELECT  city_id as value,city_name as label  FROM master_city WHERE active_status =1 AND  $districtid = district_id");
        return $builder->getResultArray();
    }

  public function getGrocerieslist($movementtype,$userid,$role)
{
    // Step 1: Fetch master_market & master_market_details; include md_id so
    // vendor-specific access can return individual sub-groceries when multiple
    // market_details_user_access rows exist for the same user.
    $builder = $this->db->table("master_market");
    $builder->select(" 
        master_market.groceries_type,
        master_market.mr_id,
        master_market.uom,
        master_market_details.md_id,
        master_market_details.groceries_name AS groceriesitem
    ");
    $builder->join('master_market_details', 'master_market_details.groceries_id = master_market.mr_id', 'inner');
    $builder->where("master_market.mr_id", $movementtype);
    $builder->where("master_market_details.active_status", 1);

    // If role is VENDOR, restrict by market_details_user_access for this user
    // and group by the detail id so multiple mau rows produce multiple items.
    if ($userid !== null && $userid !== '' && strtoupper($role) === 'VENDOR') {
        $builder->join('market_details_user_access mau', 'mau.sub_groceries_id = master_market_details.md_id', 'inner');
        $builder->join('master_state', 'master_state.state_id = mau.state', 'left');
        $builder->join('master_district', 'master_district.district_id = mau.district', 'left');
        $builder->join('master_city', 'master_city.city_id = mau.city', 'left');
        $builder->select('mau.state as state_id, mau.district as district_id, mau.city as city_id, master_state.state_name, master_district.district_name, master_city.city_name', false);
        $builder->where('mau.user_id', $userid);
        $builder->where('mau.status', 1);
        $builder->groupBy('master_market_details.md_id');
    }

    $results = $builder->distinct()->get()->getResultArray();

    return $results;
}


    public function getcountGroceriesTypemaster($groceries_type)
    {
        //   print_r($date);exit;
        $builder = $this->db->table('master_market');
        $builder->where("master_market.groceries_type =", $groceries_type);

        // Get the count of matching records
        $count = $builder->countAllResults();

        return $count; // Return the count of records
    }
    public function getcountGroceriesnamemaster($groceries_type)
    {
        //   print_r($date);exit;
        $builder = $this->db->table('master_market_details');
        $builder->where("master_market_details.groceries_name =", $groceries_type);

        // Get the count of matching records
        $count = $builder->countAllResults();

        return $count; // Return the count of records
    }

   public function checkDuplicateVendorEntry($GroceriesType, $userid, $entryDate, $itemCity)
{
    $builder = $this->db->table('market_rate_details_cd');

    $lastEntry = $builder
        ->select('created_at')
        ->where('groceries_id', $GroceriesType)
        ->where('entry_date', $entryDate)
        ->where('created_by', $userid)
        ->where('status', 1)
        ->orderBy('created_at', 'DESC')
        ->limit(1)
        ->get()
        ->getRowArray();
        // print_r($lastEntry);exit;

    // No previous entry, allow
    if (!$lastEntry) {
        return 0;
    }

    $lastTime = strtotime($lastEntry['created_at']);
    // print_r($lastTime);exit; // Debugging: Print the last entry time

    // If the last entry is less than 1 hour old, do not allow
    if ((time() - $lastTime) < 3600) {
        return 1;
    }

    // More than 1 hour has passed, allow
    return 0;
}

    public function checkDuplicateOtherUserEntry($GroceriesType, $date, $itemCity)
    {
        $builder = $this->db->table('market_rate_details_cd');
        $builder->where('market_rate_details_cd.groceries_id', $GroceriesType);
        $builder->where('market_rate_details_cd.entry_date', $date);
        $builder->where('market_rate_details_cd.city_id', $itemCity);

        $count = $builder->countAllResults();

        return $count > 0 ? 1 : 0;
    }

    public function getcountGroceriesType($GroceriesType, $date, $itemCity, $userid, $userrole)
    {
        if (!empty($userid) && strtoupper($userrole) === 'VENDOR') {
            return $this->checkDuplicateVendorEntry($GroceriesType, $userid);
        }

        return $this->checkDuplicateOtherUserEntry($GroceriesType, $date, $itemCity);
    }

    public function InsertMrtRatedetails($postData)
{
    $InsID = null; // will hold the last inserted ID

    foreach ($postData->tableItems as $item) {

        // 🔴 Skip rows that don't have enough data
        // - no rate
        // - or no district / city
        // - or no item_name
        if (
            (!isset($item->item_rate) || $item->item_rate === '' ) || // allow 0 if ever needed
            !isset($item->item_name) || trim($item->item_name) === '' ||
            !isset($item->item_district) || $item->item_district === '' ||
            !isset($item->item_city) || $item->item_city === ''
        ) {
            continue; // skip this row
        }

        $value = array(
            "entry_date"        => $postData->entry_date,
            "groceries_id"      => $postData->groceries_type,
            "groceries_name"    => $item->item_name,
            "groceries_rate"    => $item->item_rate,
            "groceries_uom"     => $item->item_uom,
            "groceries_ref_link"=> $item->item_link,
            "state_id"          => $postData->state,
            "market_place"      => $item->item_market_place,
            "district_id"       => $item->item_district,
            "city_id"           => $item->item_city,
            "created_by"        => $postData->created_by,
            "status"            => 1
        );

        $this->db->table('market_rate_details_cd')->insert($value);
        $InsID = $this->insertID(); // or $this->db->insertID() in pure CI4
    }

    return $InsID; // will be null if nothing was inserted
}

    public function InsertMrtRateMasterdetails($postData)
    {

        $value = array(
            "groceries_type" => $postData->customGroceriesType,
            "uom" => $postData->customUom,
            "created_by" => $postData->created_by,
            "active_status" => 1
        );
        $this->db->table('master_market')->insert($value);
        $InsID = $this->insertID();


        return $InsID;
    }
    public function saveGrocerydetails($postData)
    {
        // print_r($postData);exit;
        $value = array(
            "groceries_name" => $postData->customGroceriesItem,
            "groceries_id" => $postData->mr_id,
            "created_by" => $postData->created_by,
            "active_status" => 1
        );
        $this->db->table('master_market_details')->insert($value);
        $InsID = $this->insertID();


        return $InsID;
    }

    public function getmarketratemasterdetails()
    {
        $builder = $this->db->table("master_market");
        $builder = $builder->select("master_market.*");
        return $builder->distinct()->get()->getResultArray();
    }
    public function getmarketratemasteritems($id)
    {
        $builder = $this->db->table("master_market_details");
        $builder = $builder->select("master_market_details.*"); 
        $builder = $builder->where("master_market_details.groceries_id = '$id'",);
        return $builder->distinct()->get()->getResultArray();
    }
    public function getmarketratedetailsbyid($id)
    {
        $builder = $this->db->table("master_market");
        $builder = $builder->select("master_market.*"); 
        $builder = $builder->where("master_market.mr_id = '$id'",);
        return $builder->distinct()->get()->getResultArray();
    }
    public function getmarketratedetails($date)
    {
        $builder = $this->db->table("market_rate_details_cd");
        $builder = $builder->select("market_rate_details_cd.entry_date,market_rate_details_cd.state_id, market_rate_details_cd.groceries_id,master_market.groceries_type,master_state.state_name");
        $builder->join('master_market', 'master_market.mr_id = market_rate_details_cd.groceries_id', 'inner');
        $builder->join('master_state', 'master_state.state_id = market_rate_details_cd.state_id', 'inner');
        $builder = $builder->where("market_rate_details_cd.status", 1);
        $builder = $builder->where("market_rate_details_cd.entry_date", $date);
        return $builder->distinct()->groupBy("market_rate_details_cd.groceries_id")->get()->getResultArray();
    }
    public function getmarketratedetailsforview($postData)
    {
        // print_r($postData);exit;
        $builder = $this->db->table("market_rate_details_cd");
        $builder = $builder->select("market_rate_details_cd.*,definitions_list.definitionsName,master_state.state_name,master_district.district_name,master_city.city_name");
        $builder->join('definitions_list', 'definitions_list.id = market_rate_details_cd.groceries_id', 'inner');
        $builder->join('master_state', 'master_state.state_id = market_rate_details_cd.state_id', 'inner');
        $builder->join('master_district', 'master_district.district_id = market_rate_details_cd.district_id', 'inner');
        $builder->join('master_city', 'master_city.city_id = market_rate_details_cd.city_id', 'inner');
        $builder = $builder->where("market_rate_details_cd.status", 1);
        $builder = $builder->where("market_rate_details_cd.groceries_id", $postData->groceries_type);
        $builder = $builder->where("market_rate_details_cd.entry_date", $postData->date);
        return $builder->distinct()->get()->getResultArray();
    }

    public function updateGroceryRates($postData)
    {
        // Decode postData if it's JSON (depending on how you're receiving it)
        // $postData = json_decode(file_get_contents("php://input"));

        $updatedItems = $postData->updatedItems ?? [];
        $updated_by = $postData->updated_by ?? null;

        if (empty($updatedItems) || !$updated_by) {
            return $this->response->setJSON([
                'success' => 0,
                'error' => 'Invalid input data'
            ]);
        }

        foreach ($updatedItems as $item) {
            if (isset($item->mr_id)) {
                $updateData = [
                    'groceries_rate' => $item->groceries_rate,
                    'groceries_ref_link' => $item->groceries_ref_link,
                    'state_id' => $item->state_id,
                    'district_id' => $item->district_id,
                    'market_place' => $item->market_place,
                    'updated_by' => $updated_by,
                ];

                $this->db->table('market_rate_details_cd')
                    ->where('mr_id', $item->mr_id)
                    ->update($updateData);
            }

        }
    }
    public function updateMrtRateMasterdetails($postData)
    {
        // Toggle the status: if 1 then 0, if 0 then 1
        $status = ($postData->active_status == 1) ? 0 : 1;

        $otp_info = array(
            "active_status" => $status,
        );

        $this->db->table('master_market')
            ->set($otp_info)
            ->where('mr_id', $postData->customid)
            ->update();

        return $this->affectedRows();
    } 
    public function updateMrtRateMasterdetailsbyid($postData)
    {

        $updateddata = array(
            "groceries_type" => $postData->groceries_type,
            "uom" => $postData->uom,
            "updated_by" => $postData->updatedby,
        );

        $this->db->table('master_market')
            ->set($updateddata)
            ->where('mr_id', $postData->customid)
            ->update();

        return $this->affectedRows();
    }
     public function updateMrtRateMasterGroceriesItem($postData)
    {
        // Toggle the status: if 1 then 0, if 0 then 1
        $status = ($postData->active_status == 1) ? 0 : 1;

        $otp_info = array(
            "active_status" => $status,
        );

        $this->db->table('master_market_details')
            ->set($otp_info)
            ->where('md_id', $postData->customid)
            ->update();

        return $this->affectedRows();
    }


    public function getlistoftGroceries()
    {
        $builder = $this->db->query("
    SELECT id AS value, definitions AS label 
    FROM definitions 
    WHERE id IN (34, 35, 36)
    ");
        return $builder->getResultArray();
    }
    public function getSubGroceriesById($Typeid, $userid = null, $role = null)
    {
        $builder = $this->db->table("master_market_details");
        $builder = $builder->select("md_id as value, groceries_name as label");
        $builder = $builder->where("groceries_id", $Typeid);
        $builder = $builder->where("active_status", 1);

        // If vendor, ensure user has access to the specific sub-groceries
        if ($userid !== null && $userid !== '' && strtoupper($role) === 'VENDOR') {
            $builder->join('market_details_user_access mau', 'mau.sub_groceries_id = master_market_details.md_id', 'inner');
            $builder->where('mau.user_id', $userid);
            $builder->where('mau.status', 1);
            $builder->groupBy('master_market_details.md_id');
        }

        return $builder->distinct()->get()->getResultArray();
    }

   public function getlistofsubcatogry($subTypeid, $todate, $fromdate, $state = null, $district = null, $userid , $role)
{
    // Convert dates to timestamps
    $from = strtotime($fromdate);
    $to = strtotime($todate);
    $dayDiff = ($to - $from) / (60 * 60 * 24); // Difference in days

    // Format dates
    $fromdateFormatted = date('Y-m-d', $from);
    $todateFormatted = date('Y-m-d', $to);

    $builder = $this->db->table("market_rate_details_cd");

    // Joins
    $builder->join('master_market', 'master_market.mr_id = market_rate_details_cd.groceries_id', 'inner');
    $builder->join('master_district', 'master_district.district_id = market_rate_details_cd.district_id', 'left');
    $builder->join('master_state', 'master_state.state_id = market_rate_details_cd.state_id', 'left');
    $builder->join('master_city', 'master_city.city_id = market_rate_details_cd.city_id', 'left');
    $builder->join('user_info', 'user_info.UI_ID = market_rate_details_cd.created_by', 'left');

    // Always filter by status and date range
    $builder->where("market_rate_details_cd.status", 1);
    $builder->where("DATE(market_rate_details_cd.created_at) >=", $fromdateFormatted);
    $builder->where("DATE(market_rate_details_cd.created_at) <=", $todateFormatted);

    // Apply optional filters if present
    if (!empty($subTypeid)) {
        $builder->where("market_rate_details_cd.groceries_name", $subTypeid);
    }

    if (!empty($state)) {
        $builder->where("market_rate_details_cd.state_id", $state);
    }

    if (!empty($district)) {
        $builder->where("market_rate_details_cd.district_id", $district);
    }

    // If role is Vendor, only include records created by this user
    if ($userid !== null && $userid !== '' && strtoupper($role) === 'VENDOR') {
        $builder->where('market_rate_details_cd.created_by', $userid);
    }

    // Yearly Average
    if ($dayDiff > 365) {
        $builder->select("
            market_rate_details_cd.status,
            market_rate_details_cd.groceries_name,
            DATE_FORMAT(market_rate_details_cd.created_at, '%Y') AS year,
            ROUND(AVG(market_rate_details_cd.groceries_rate), 2) AS avg_rate,
            master_state.state_name,
            master_district.district_name,
            master_city.city_name,
            user_info.FIRST_NAME AS created_by_name
        ");
        $builder->groupBy("year, market_rate_details_cd.groceries_name, master_state.state_name, master_district.district_name, master_city.city_name, user_info.FIRST_NAME");
        $builder->orderBy("year", "ASC");

    } elseif ($dayDiff > 30) {
        // Monthly Average
        $builder->select("
            market_rate_details_cd.status,
            market_rate_details_cd.groceries_name,
            DATE_FORMAT(market_rate_details_cd.created_at, '%M %Y') AS month,
            ROUND(AVG(market_rate_details_cd.groceries_rate), 2) AS avg_rate,
            master_state.state_name,
            master_district.district_name,
            master_city.city_name,
            user_info.FIRST_NAME AS created_by_name
        ");
        $builder->groupBy("month, market_rate_details_cd.groceries_name, master_state.state_name, master_district.district_name, master_city.city_name, user_info.FIRST_NAME");
        $builder->orderBy("market_rate_details_cd.created_at", "ASC");

    } else {
        // Daily Records
        $builder->select("
            market_rate_details_cd.*,
            market_rate_details_cd.status,
            DATE_FORMAT(market_rate_details_cd.created_at, '%d/%m/%Y') AS entry_date,   
            master_state.state_name,
            master_district.district_name,
            master_city.city_name,
            user_info.FIRST_NAME AS created_by_name
        ");
        $builder->orderBy("market_rate_details_cd.created_at", "ASC");
    }

    return $builder->get()->getResultArray();
}

public function getuserinfo()
{
    $builder = $this->db->query("
        SELECT UI_ID AS value, CONCAT(LOGIN_ID, '-', FIRST_NAME) AS label
        FROM user_info
        WHERE USER_ROLE_ID = 15
        ORDER BY LOGIN_ID
    ");
    return $builder->getResultArray();
}

public function getSubGroceriesAccessList()
{
    $builder = $this->db->query("
        SELECT md_id AS value, groceries_name AS label
        FROM master_market_details
        ORDER BY md_id
    ");
    return $builder->getResultArray();
}

public function getSubGroceriesAccessCount($groceries_type, $userid)
    {
        //   print_r($date);exit;
        $builder = $this->db->table('market_details_user_access');
        $builder->where("market_details_user_access.sub_groceries_id =", $groceries_type);
        $builder->where("market_details_user_access.user_id =", $userid);

        // Get the count of matching records
        $count = $builder->countAllResults();

        return $count; // Return the count of records
    }
public function saveSubGroceriesAccess($user_id, $sub_groceries_id, $created_by, $state, $district, $city)
    {
        $value = [
            'user_id' => $user_id,
            'sub_groceries_id' => $sub_groceries_id,
            'status' => 1,
            'created_by' => $created_by,
            'created_at' => date('Y-m-d H:i:s'),
            'state' => $state,
            'district' => $district,
            'city' => $city
        ];
        // print_r($value);exit;

        $this->db->table('market_details_user_access')->insert($value);
        $InsID = $this->insertID();

        return $InsID;
    }
    
    public function getSubGroceriesAccessdataList()
    {
        //   print_r($date);exit;
        $builder = $this->db->table('market_details_user_access');
            $builder->select('market_details_user_access.*, user_info.LOGIN_ID, master_market_details.groceries_name');
            $builder->join('user_info', 'user_info.UI_ID = market_details_user_access.user_id', 'inner');
            $builder->join('master_market_details', 'master_market_details.md_id = market_details_user_access.sub_groceries_id', 'inner');
            
       

        $builder->orderBy('market_details_user_access.id', 'DESC');
        return $builder->get()->getResultArray();
    }

    public function updateSubGroceriesAccess($postData)
    {
        $status = ($postData->status == 1) ? 0 : 1;

        $updateData = [
            'status' => $status,
            'updated_by' => $postData->updated_by,
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        $this->db->table('market_details_user_access')
            ->where('id', $postData->access_id)
            ->update($updateData);

        return $this->affectedRows();
    }

}