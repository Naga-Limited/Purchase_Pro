<?php

namespace App\Models;

use CodeIgniter\Model;

class RegisterModel extends Model{
    public function getDataTypes()
{
    return $this->db->table("definitions_list")
        ->select("id AS value, definitionsName AS label")
        ->where("isActive", 1)
        ->where("definitionsId", 42)
        ->distinct()
        ->get()
        ->getResultArray();
}   
 public function getDesignation()
{
    return $this->db->table("definitions_list")
        ->select("id AS value, definitionsName AS label")
        ->where("isActive", 1)
        ->where("definitionsId", 8)
        ->distinct()
        ->get()
        ->getResultArray();
} 
   public function getDepartment()
{
    return $this->db->table("definitions_list")
        ->select("id AS value, definitionsName AS label")
        ->where("isActive", 1)
        ->where("definitionsId", 9)
        ->distinct()
        ->get()
        ->getResultArray();
}

public function checkRegister($registername,$plantcode)
{
    return $this->db->table("register_master")
        ->where("register_name", $registername)
        ->where("plant_code", $plantcode)
        ->where("active_status", 1)
        ->countAllResults();
}

public function getRegisterListentry($plantcode)
{
    $builder = $this->db->table("register_master")
        ->select("register_id AS value, register_name AS label, plant_code as plantCode")
        ->where("active_status", 1)
        ->distinct();

    if (!empty($plantcode)) {
        $codes = is_array($plantcode)
            ? $plantcode
            : array_filter(array_map('trim', explode(',', $plantcode)), fn($value) => $value !== '');

        if (!empty($codes)) {
            $builder->whereIn('plant_code', $codes);
        }
    }

    return $builder->get()->getResultArray();
}

public function insertRegister($postData)
{
    $db = \Config\Database::connect();

    $db->transStart();

    /* ================= INSERT MASTER ================= */
    // print_r($postData);exit;
    $masterData = [
        "register_name" => $postData->register_name,
        "plant_code"    => $postData->plant_ids,
        "designation"    => $postData->department, // change if separate field exists
        "department"   => $postData->designation,
        "active_status" => 1,
        "created_by"    => $postData->created_by,
        "created_at"    => date('Y-m-d H:i:s')
    ];

    $db->table('register_master')->insert($masterData);

    $registerId = $db->insertID();

    /* ================= INSERT DETAILS ================= */

    if (!empty($postData->subtypes)) {

        foreach ($postData->subtypes as $subtype) {
            $dataTypeLabel = $subtype->data_type->label ?? null;

            $selectArray = null;

            // ✅ Check using LABEL (SELECT)
            if ($dataTypeLabel === "SELECT" && !empty($subtype->dropdown_options)) {

                $selectArray = explode(",", $subtype->dropdown_options);
                $selectArray = json_encode($selectArray);
            }

            $detailData = [
                "register_id"      => $registerId,
                "register_subtype" => $subtype->subtype,
                "datatype"         => $dataTypeLabel, // store ID (649 etc)
                "select_array"     => $selectArray,
                "status"           => 1,
                "created_by"       => $postData->created_by,
                "created_at"       => date('Y-m-d H:i:s')
            ];

            $db->table('register_master_details')->insert($detailData);
        }
    }

    $db->transComplete();

    return $registerId;
}

public function getRegisterList()
{
    $builder = $this->db->table("register_master rm");

    $builder->select("
        rm.register_id,
        rm.register_name,
        rm.plant_code,
        rm.department,
        rm.designation,
        rm.active_status,
        rm.created_by,
        rm.created_at,

        rmd.reg_det_id,
        rmd.register_subtype,
        rmd.datatype,
        rmd.select_array
    ");

    $builder->join(
        'register_master_details rmd',
        'rm.register_id = rmd.register_id',
        'inner'
    );

    $builder->where("rm.active_status", 1);
    $builder->where("rmd.status", 1);

    $builder->orderBy("rm.register_id", "DESC");

    $results = $builder->get()->getResultArray();

    $grouped = [];

    foreach ($results as $row) {

        $registerId = $row['register_id'];

        if (!isset($grouped[$registerId])) {
            $grouped[$registerId] = [
                "register_id"   => $row['register_id'],
                "register_name" => $row['register_name'],
                "plant_code"    => $row['plant_code'],
                "department"    => $row['department'],
                "designation"   => $row['designation'],
                "active_status" => $row['active_status'],
                "created_by"    => $row['created_by'],
                "created_at"    => $row['created_at'],
                "details"       => []
            ];
        }

        $grouped[$registerId]['details'][] = [
            "reg_det_id"       => $row['reg_det_id'],
            "register_subtype" => $row['register_subtype'],
            "datatype"         => $row['datatype'],
            "select_array" => $row['select_array']
                ? json_decode($row['select_array'], true)
                : []
        ];
    }

    return array_values($grouped);
}


public function updateRegister($postData)
{
    $db = \Config\Database::connect();

    if (empty($postData->reg_id)) {
        return [
            "status" => false,
            "message" => "Register ID missing"
        ];
    }

    try {
        $db->transStart();

    // Update master
    $masterData = [
        "register_name" => $postData->register_name,
        "plant_code"    => $postData->plant_ids,
        "department"    => $postData->department ?? null,
        "designation"   => $postData->designation ?? null,
        "updated_by"    => $postData->updated_by,
        "updated_at"    => date("Y-m-d H:i:s")
    ];

    $db->table('register_master')
        ->where('register_id', $postData->reg_id)
        ->update($masterData);

    if ($db->affectedRows() == 0) {
        $db->transRollback();
        return [
            "status" => false,
            "message" => "No register found with the given ID"
        ];
    }

    // Delete subtypes
    if (!empty($postData->deleted_subtypes)) {
        $db->table('register_master_details')
            ->whereIn('reg_det_id', $postData->deleted_subtypes)
            ->update([
                "status"     => 0,
                "deleted_by" => $postData->updated_by,
                "deleted_at" => date("Y-m-d H:i:s"),
                "updated_by" => $postData->updated_by,
                "updated_at" => date("Y-m-d H:i:s")
            ]);
    }

    // Update existing subtypes
    if (!empty($postData->subtypes)) {
        foreach ($postData->subtypes as $subtype) {
            $selectArray = null;
            if (strtoupper($subtype->datatype) == "SELECT" && !empty($subtype->select_array)) {
                $selectArray = json_encode($subtype->select_array);
            }

            $updateData = [
                "register_subtype" => $subtype->register_subtype,
                "datatype"         => $subtype->datatype,
                "select_array"     => $selectArray,
                "updated_by"       => $postData->updated_by,
                "updated_at"       => date("Y-m-d H:i:s")
            ];

            $db->table('register_master_details')
                ->where('reg_det_id', $subtype->id)
                ->update($updateData);
        }
    }

    // Insert new subtypes
    if (!empty($postData->newsubtypes)) {
        foreach ($postData->newsubtypes as $subtype) {
            $selectArray = null;
            if (strtoupper($subtype->datatype) == "SELECT" && !empty($subtype->select_array)) {
                $selectArray = json_encode($subtype->select_array);
            }

            $insertData = [
                "register_id"      => $postData->reg_id,
                "register_subtype" => $subtype->register_subtype,
                "datatype"         => $subtype->datatype,
                "select_array"     => $selectArray,
                "status"           => 1,
                "created_by"       => $postData->updated_by,
                "created_at"       => date("Y-m-d H:i:s")
            ];

            $db->table('register_master_details')->insert($insertData);
        }
    }

    $db->transComplete();

    if ($db->transStatus() === false) {
        $error = $db->error();
        $lastQuery = $db->getLastQuery();
        return [
            "status" => false,
            "message" => "Transaction failed",
            "error_code" => $error['code'] ?? 'Unknown',
            "error_message" => $error['message'] ?? 'No error details',
            "last_query" => $lastQuery ? $lastQuery->getQuery() : 'No query executed'
        ];
    }
    return [
        "status"  => true,
        "message" => "Register updated successfully"
    ];

    } catch (\Exception $e) {
        if (method_exists($db, 'transRollback')) {
            $db->transRollback();
        }
        return [
            "status" => false,
            "message" => "Error: " . $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine()
        ];
    }
}

public function getRegisterDetails($reg_ID=null) 
{
    $builder = $this->db->table("register_master_details");

    $builder->select("reg_det_id , register_subtype, datatype, select_array")
            ->where("status", 1);
        $builder->where("register_id", $reg_ID);
    

    return $builder->get()->getResultArray();
}


public function checkRegisterentry($registername,$plantcode)
{
    return $this->db->table("register_entry_details")
        ->where("register_id", $registername)
        ->where("plant_code", $plantcode)
        ->where("DATE(created_at)", date("Y-m-d"))
        ->countAllResults();
}
public function saveRegisterEntry($postData)
{
    $db = \Config\Database::connect();
    $builder = $db->table('register_entry_details');

    $insertData = [];

    foreach ($postData->entries as $row) {


        // Get label from subtype table
        
        $insertData[] = [
            "register_id" => $postData->register_id,
            "plant_code"  => $postData->plant_code,
            "label"       => $row->subtype_id,
            "value"       => $row->value,
            "created_by"  => $postData->Created_by,
            "created_at"  => date('Y-m-d H:i:s')
        ];
    }
    // print_r($insertData); exit; // For Debugging

    $builder->insertBatch($insertData);

    return true;
}

public function getRegisterEntryList($plantcode, $date)
{
    $builder = $this->db->table("register_entry_details red")
        ->select("
            red.*,
            rm.register_name,
            rmd.register_subtype,
            rmd.select_array,
            rmd.datatype
        ")
        ->join(
            "register_master rm",
            "rm.register_id = red.register_id"
        )
        ->join(
            "register_master_details rmd",
            "rmd.reg_det_id = red.label"
        );

    // ✅ Plant Code Filter
    if (!empty($plantcode)) {

        $codes = is_array($plantcode)
            ? $plantcode
            : array_filter(
                array_map('trim', explode(',', $plantcode)),
                fn($value) => $value !== ''
            );

        if (!empty($codes)) {
            $builder->whereIn('red.plant_code', $codes);
        }
    }

    // ✅ Date Filter using register_entry_details.created_at
    if (!empty($date)) {

        // If single date passed (Ex: 2026-05-14)
        $builder->where('DATE(red.created_at)', $date);

        // OR use below if datetime range required
        // $builder->where('red.created_at >=', $date . ' 00:00:00');
        // $builder->where('red.created_at <=', $date . ' 23:59:59');
    }

    // ✅ Debug Query
    // print_r($builder->getCompiledSelect()); // Remove in production

    $results = $builder
        ->orderBy('red.id', 'DESC')
        ->get()
        ->getResultArray();

    $grouped = [];

    foreach ($results as $row) {

        $registerId = $row['register_id'];

        if (!isset($grouped[$registerId])) {

            $grouped[$registerId] = [
                'register_id'   => $row['register_id'],
                'register_name' => $row['register_name'],
                'plant_code'    => $row['plant_code'],
                'details'       => []
            ];
        }

        $grouped[$registerId]['details'][] = [

            'id'               => $row['id'],
            'plant_code'       => $row['plant_code'],
            'label'            => $row['label'],
            'value'            => $row['value'],
            'created_by'       => $row['created_by'],
            'created_at'       => $row['created_at'],
            'updated_by'       => $row['updated_by'],
            'updated_at'       => $row['updated_at'],
            'register_subtype' => $row['register_subtype'],
            'datatype'         => $row['datatype'],
            'select_array'     => $row['select_array']
                ? json_decode($row['select_array'], true)
                : []

        ];
    }

    return array_values($grouped);
}

public function updateRegisterEntry($postData)
{
    $db = \Config\Database::connect();

    if (empty($postData->entries) || !is_array($postData->entries)) {
        return false;
    }

    $updateData = [];
    foreach ($postData->entries as $entry) {
        if (isset($entry->id) && isset($entry->value)) {
            $updateData[] = [
                'id' => $entry->id,
                'value' => $entry->value,
                'updated_by' => $postData->updated_by,
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }
    }

    if (!empty($updateData)) {
        $db->table('register_entry_details')->updateBatch($updateData, 'id');
    }

    return true;
}

public function getRegisterReport($postData)
{
    $builder = $this->db->table('register_entry_details red')
        ->select(
            '
            red.id,
            red.register_id,
            red.plant_code,
            red.label,

            CASE 
                WHEN rmd.datatype = \'RADIO\' 
                     AND red.value = \'1\' 
                THEN \'YES\'

                WHEN rmd.datatype = \'RADIO\' 
                     AND red.value = \'0\' 
                THEN \'NO\'

                ELSE red.value
            END AS value,

            red.created_by,
            red.updated_by,
            red.updated_at,

            rm.register_name,
            rmd.register_subtype,
            rmd.datatype,

            user_info.FIRST_NAME as created_by_name,

            DATE_FORMAT(
                red.created_at,
                "%d-%m-%Y %H:%i:%s"
            ) as created_at
            '
        )
        ->join(
            'register_master rm',
            'rm.register_id = red.register_id'
        )
        ->join(
            'register_master_details rmd',
            'rmd.reg_det_id = red.label'
        )
        ->join(
            'user_info',
            'user_info.UI_ID = red.created_by',
            'left'
        );

    if (!empty($postData->plant_code)) {

        $builder->where(
            'red.plant_code',
            $postData->plant_code
        );

    }

    if (!empty($postData->register_id)) {

        $builder->where(
            'red.register_id',
            $postData->register_id
        );

    }

    if (!empty($postData->fromDate)) {

        $builder->where(
            'red.created_at >=',
            $postData->fromDate . ' 00:00:00'
        );

    }

    if (!empty($postData->toDate)) {

        $builder->where(
            'red.created_at <=',
            $postData->toDate . ' 23:59:59'
        );

    }

    return $builder
        ->get()
        ->getResultArray();
}

}
