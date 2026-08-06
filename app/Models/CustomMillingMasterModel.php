<?php
namespace App\Models;

use CodeIgniter\Model;

class CustomMillingMasterModel extends Model
{
    protected $table = 'custom_milling_condition_master';
    protected $primaryKey = 'id';

    // Get list of condition types. If $limit > 0 apply limit.
    public function getConditionTypeList($limit = 0)
    {
        $db = db_connect();
        $builder = $db->table($this->table . ' rmd');
        $builder->select('rmd.id, rmd.condition_type_code, rmd.condition_description, rmd.status, dl.definitionsName as definitionsName, dl.id as purchase_org_id');
        // $builder->join('rate_master_custom_milling rmc', 'rmc.rm_id = rmd.rm_id', 'left');
        $builder->join('definitions_list dl', 'dl.id = rmd.definition_list_id', 'inner');
        // $builder->where('rmd.status IS NULL OR rmd.status = 1');
        $builder->orderBy('rmd.id', 'ASC');
        // print_r($builder->getCompiledSelect());exit;
        if ($limit > 0) $builder->limit($limit);
        return $builder->get()->getResultArray();
    }

    public function getPurchaseOrgList()
    {
        $db = db_connect();
        $builder = $db->table('definitions_list');
        $builder->select('id as value, definitionsName as label, id as definitionsvalues');
        // definitionsId for purchase org may vary; return active ones
        $builder->where('isActive', 1);
        $builder->where('definitionsId', 30);
        return $builder->get()->getResultArray();
    }

    // Insert or update a condition type. Returns inserted id or existing id on update.
    public function insertUpdateConditionType($id, $data)
    {
        $db = db_connect();
        $now = date('Y-m-d H:i:s');
        // print_r($data);exit;
        // Duplicate validation: condition_type_code + definition_list_id should be unique among active records
        $code = isset($data['condition_type_code']) ? trim($data['condition_type_code']) : null;
        $defId = $data['purchase_org_id'] ?? null;

        if ($code !== null && $defId !== null) {
            try {
                if ($id > 0) {
                    $sql = "SELECT COUNT(*) AS cnt FROM {$this->table} WHERE condition_type_code = ? AND definition_list_id = ? AND id != ? AND status = 1";
                    $params = [$code, $defId, $id];
                } else {
                    $sql = "SELECT COUNT(*) AS cnt FROM {$this->table} WHERE condition_type_code = ? AND definition_list_id = ? AND status = 1";
                    $params = [$code, $defId];
                }
                $row = $db->query($sql, $params)->getRowArray();
                if (!empty($row) && intval($row['cnt']) > 0) {
                    return ['success' => false, 'error' => 'Condition Type code already exists for this Purchase Org'];
                }
            } catch (\Exception $e) {
                // ignore errors from validation query and proceed with insert/update attempt
            }
        }

        if ($id > 0) {
            $update = [];
            // if (isset($data['purchase_org_id'])) $update['purchase_org_id'] = $data['purchase_org_id'];
            if (isset($data['condition_type_code'])) $update['condition_type_code'] = $data['condition_type_code'];
            if (isset($data['condition_description'])) $update['condition_description'] = $data['condition_description'];
            if (isset($data['purchase_org_id'])) $update['definition_list_id'] = $data['purchase_org_id'];
            $update['updated_at'] = $now;
            $db->table($this->table)->where($this->primaryKey, $id)->update($update);
            return $id;
        }
         // Debugging line to check input data
        // Insert
        $insert = [
            // 'rm_id' => $data['rm_id'] ?? null,
            'condition_type_code' => $data['condition_type_code'] ?? null,
            'condition_description' => $data['condition_description'] ?? null,
            'definition_list_id' => $data['purchase_org_id'] ?? null,
            'created_by' => $data['created_by'] ?? 0,
            'created_at' => $now,
            'status' => 1
        ];

        $res = $db->table($this->table)->insert($insert);
        // print_r($db->error()); // Debugging line to check for errors
        if ($res) return $db->insertID();
        return 0;
    }

    public function deleteConditionType($id, $deleted_by = 0)
    {
        $db = db_connect();
        if ($id <= 0) return false;
        // Soft delete using active_status if column exists, otherwise hard delete
        try {
            $builder = $db->table($this->table);
            $fields = $db->getFieldNames($this->table);
        } catch (\Exception $e) {
            $fields = [];
        }

        $builder = $db->table($this->table);
        if (in_array('status', $fields)) {
            $update = ['status' => 0, 'updated_by' => 1, 'updated_at' => date('Y-m-d H:i:s')];
            return $builder->where($this->primaryKey, $id)->update($update) !== false;
        } else {
            return $builder->where($this->primaryKey, $id)->delete() !== false;
        }
    }

    public function revertConditionType($id)
    {
        $db = db_connect();
        if ($id <= 0) return false;
        try {
            $builder = $db->table($this->table);
            $fields = $db->getFieldNames($this->table);
        } catch (\Exception $e) {
            $fields = [];
        }

        $builder = $db->table($this->table);
        if (in_array('status', $fields)) {
            $update = ['status' => 1, 'updated_by' => null, 'updated_at' => null];
            return $builder->where($this->primaryKey, $id)->update($update) !== false;
        }
        // nothing to revert
        return false;
    }   

    /* ================= MATERIAL MASTER (custom_milling_material_master) ================= */

    // Get full material master list
    public function getMaterialMasterList()
    {
        $db = db_connect();
        $builder = $db->table('custom_milling_material_master cm');
        $builder->select('cm.id, cm.material_code, cm.material_description, cm.segment, cm.definition_list_id, cm.status, dl.definitionsName');
        $builder->join('definitions_list dl', 'dl.id = cm.definition_list_id', 'left');
        $builder->orderBy('cm.material_code', 'ASC');
        return $builder->get()->getResultArray();
    }

    // Insert new material
    public function insertMaterialMaster($data)
    {
        $db = db_connect();
        $now = date('Y-m-d H:i:s');
        // Duplicate validation: do not insert if same segment + definition_list_id (purchase org) exists and is active
        $segment = isset($data['segment']) ? trim($data['segment']) : null;
        $defId = $data['purchase_org_id'] ?? null;

        if ($segment !== null && $defId !== null) {
            try {
                $sql = "SELECT COUNT(*) AS cnt FROM custom_milling_material_master WHERE segment = ? AND definition_list_id = ? AND status = 1";
                $row = $db->query($sql, [$segment, $defId])->getRowArray();
                if (!empty($row) && intval($row['cnt']) > 0) {
                    return ['success' => false, 'error' => 'Material with same segment already exists for this Purchase Org'];
                }
            } catch (\Exception $e) {
                // ignore and continue to attempt insert; the DB may not have 'status' column or query could fail
            }
        }

        $insert = [
            'material_code' => $data['material_code'] ?? null,
            'material_description' => $data['material_description'] ?? null,
            'segment' => $segment,
            'definition_list_id' => $defId,
            'created_by' => $data['created_by'] ?? 0,
            'created_at' => $now,
            'status' => 1
        ];

        $res = $db->table('custom_milling_material_master')->insert($insert);
        if ($res) return $db->insertID();
        return 0;
    }

    // Update material
    public function updateMaterialMaster($id, $data)
    {
        $db = db_connect();
        if ($id <= 0) return false;
        $update = [];
        if (isset($data['material_code'])) $update['material_code'] = $data['material_code'];
        if (isset($data['material_description'])) $update['material_description'] = $data['material_description'];
        if (isset($data['segment'])) $update['segment'] = $data['segment'];
        if (isset($data['purchase_org_id'])) $update['definition_list_id'] = $data['purchase_org_id'];
        $update['updated_by'] = $data['updated_by'] ?? null;
        $update['updated_at'] = date('Y-m-d H:i:s');

        return $db->table('custom_milling_material_master')->where('id', $id)->update($update) !== false;
    }

    public function deleteMaterialMaster($id, $deleted_by = 0)
    {
        $db = db_connect();
        if ($id <= 0) return false;
        try {
            $fields = $db->getFieldNames('custom_milling_material_master');
        } catch (\Exception $e) {
            $fields = [];
        }
        $builder = $db->table('custom_milling_material_master');
        if (in_array('status', $fields)) {
            $update = ['status' => 0, 'updated_by' => $deleted_by, 'updated_at' => date('Y-m-d H:i:s')];
            return $builder->where('id', $id)->update($update) !== false;
        } else {
            return $builder->where('id', $id)->delete() !== false;
        }
    }

    public function revertMaterialMaster($id)
    {
        $db = db_connect();
        if ($id <= 0) return false;
        try {
            $fields = $db->getFieldNames('custom_milling_material_master');
        } catch (\Exception $e) {
            $fields = [];
        }
        $builder = $db->table('custom_milling_material_master');
        if (in_array('status', $fields)) {
            $update = ['status' => 1, 'updated_by' => null, 'updated_at' => null];
            return $builder->where('id', $id)->update($update) !== false;
        }
        return false;
    }

    /* ================= RATE MASTER / VALID DETAILS ================= */

    // Fetch purchase org details (returns list of condition types for a purchase org id)
    public function fetchPurchaseOrgDetails($purchaseorg)
    {
        $db = db_connect();
        // Expecting 'purchaseorg' to be definitionsvalues or id depending on UI; try both
        $builder = $db->table('custom_milling_condition_master rmc');
        $builder->select('rmc.id, rmc.condition_type_code, rmc.condition_description');
        // $builder->join('rate_master_details_custom_milling rmd', 'rmd.rm_id = rmc.rm_id', 'inner');
        $builder->join('definitions_list dl', 'dl.id = rmc.definition_list_id', 'inner');
        $builder->where('rmc.status', 1);
        // $builder->where('rmc.vaild_to >= NOW()');
        $builder->where('rmc.definition_list_id', $purchaseorg);
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }

    public function getMaterialCodes($purchase_org)
    {
        $db = db_connect();
        $builder = $db->table('custom_milling_material_master rmc');
        $builder->select('rmc.material_code, rmc.material_description, rmc.segment');
        $builder->where('rmc.definition_list_id', $purchase_org);
        $builder->where('rmc.status', 1);
        $builder->groupBy('rmc.id');
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }

    // Insert valid details (save a new rate_master_custom_milling + details)
    public function insertValidDetails($data)
    {
        $db = db_connect();
        try {
            // Duplicate validation: same segment + vaild_to for same purchase_org and material_code should not exist
            $segment = isset($data['segment']) ? trim($data['segment']) : '';
            $validToRaw = $data['valid_to'] ?? $data['vaild_to'] ?? null;
            $purchaseOrg = $data['purchase_org'] ?? null;
            $materialCode = $data['material_code'] ?? null;
            // print_r($data);exit; // Debugging line to check input data
            if ($segment && $validToRaw) {
                // normalize date
                $validToDate = date('Y-m-d', strtotime($validToRaw));
                $sql = "SELECT COUNT(*) AS cnt FROM rate_master_custom_milling WHERE segment = ? AND DATE(vaild_to) = ? AND purchase_org_id = ? AND material_code = ? AND status IN (1,2)";
                $row = $db->query($sql, [$segment, $validToDate, $purchaseOrg, $materialCode])->getRowArray();
                // print_r($row); exit;// Debugging line to check the result of the duplicate check
                if (!empty($row) && intval($row['cnt']) > 0) {
                    return ['success' => false, 'error' => 'A rate master already exists for this segment and Valid To date.'];
                }
            }
            $db->transStart();
            $now = date('Y-m-d H:i:s');

            $header = [
                'vaild_from' => $data['valid_from'] ?? null,
                'vaild_to' => $data['valid_to'] ?? null,
                'purchase_org_id' => $data['purchase_org'] ?? null,
                'material_code' => $data['material_code'] ?? null,
                'material_description' => $data['material_description'] ?? null,
                'segment' => $data['segment'] ?? null,
                'status' => 1, // created/pending
                'created_by' => $data['created_by'] ?? 0,
                'created_at' => $now
            ];

            $db->table('rate_master_custom_milling')->insert($header);
            $rm_id = $db->insertID();

            // insert details
            if (!empty($data['conditions']) && is_array($data['conditions'])) {
                foreach ($data['conditions'] as $cond) {
                    $detail = [
                        'rm_id' => $rm_id,
                        'condition_type_code' => $cond['condition_type_code'] ?? null,
                        'condition_description' => $cond['condition_description'] ?? null,
                        'rate' => $cond['rate'] ?? 0,
                        'created_by' => $data['created_by'] ?? 0,
                        'created_at' => $now
                    ];
                    $db->table('rate_master_details_custom_milling')->insert($detail);
                }
            }

            $db->transComplete();
            if ($db->transStatus() === false) return ['success' => false, 'error' => 'DB transaction failed'];
            return ['success' => true, 'rm_id' => $rm_id];
        } catch (\Exception $e) {
            if ($db->transStatus() === false) $db->transRollback();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // Get rate master details list for approval screen
    public function getRateMasterDetailsList()
    {
        $db = db_connect();
        $builder = $db->table('rate_master_custom_milling rmc');
        $builder->select('rmc.rm_id, rmc.vaild_from, rmc.vaild_to, rmc.material_code, rmc.material_description, rmc.segment, rmc.status, dl.definitionsName');
        $builder->join('definitions_list dl', 'dl.id = rmc.purchase_org_id', 'left');
        $builder->orderBy('rmc.created_at', 'DESC');
        $rows = $builder->get()->getResultArray();
        // attach details
        foreach ($rows as &$row) {
            $details = $db->table('rate_master_details_custom_milling')->select('condition_type_code, condition_description, rate')->where('rm_id', $row['rm_id'])->get()->getResultArray();
            $row['details'] = $details;
            $row['statusName'] = $row['status'] == 2 ? 'Approved' : ($row['status'] == 1 ? 'Pending' : 'Rejected');
        }
        return $rows;
    }

    // Approve rate master
    public function approveRateMaster($id, $valid_to, $details, $approved_by)
    {
        $db = db_connect();
        try {
            $db->transStart();
            // update header
            $db->table('rate_master_custom_milling')->where('rm_id', $id)->update(['status' => 2, 'vaild_to' => $valid_to, 'approved_by' => $approved_by, 'approved_at' => date('Y-m-d H:i:s')]);
            // update details rates
            if (!empty($details) && is_array($details)) {
                foreach ($details as $d) {
                    $db->table('rate_master_details_custom_milling')->where('rm_id', $id)->where('condition_type_code', $d['condition_type_code'])->update(['rate' => $d['rate'], 'updated_at' => date('Y-m-d H:i:s')]);
                }
            }
            $db->transComplete();
            return $db->transStatus() !== false;
        } catch (\Exception $e) {
            if ($db->transStatus() === false) $db->transRollback();
            return false;
        }
    }

    public function rejectRateMaster($id, $rejected_by)
    {
        $db = db_connect();
        return $db->table('rate_master_custom_milling')->where('rm_id', $id)->update(['status' => 0, 'rejected_by' => $rejected_by, 'rejected_at' => date('Y-m-d H:i:s')]) !== false;
    }
    public function getSegmentDetails($definitionId)
    {
        $currentDate = date('Y-m-d');
        $db = db_connect();

        $builder = $db->table('rate_master_custom_milling rm');

        $builder->select("
            rm.rm_id AS value,
            rm.segment AS label,
            rm.segment,
            rm.material_code,
            rm.material_description,
            rmd.rate,
            rmd.uom
        ");

        $builder->join(
            'rate_master_details_custom_milling rmd',
            "rmd.rm_id = rm.rm_id AND rmd.condition_type_code = 'MATE'",
            'inner'
        );

        $builder->where('rm.status', 2);
        $builder->where('rm.purchase_org_id', $definitionId);

        // Current date should be within validity period
        $builder->where('rm.vaild_from <=', $currentDate);
        $builder->where('rm.vaild_to >=', $currentDate);

        $builder->groupBy('rm.rm_id');

        // echo $builder->getCompiledSelect(); exit;

        return $builder->get()->getResultArray();
    }
    public function getConditionChanges($definitionId,$rm_id)
    {
        $currentDate = date('Y-m-d');
        $db = db_connect();
        $builder = $db->table('rate_master_details_custom_milling rmd');
        $builder->select('rm.material_description,rmd.uom,rmd.rate,rmd.condition_type_code,rmd.condition_description,rm.vaild_from,rm.vaild_to');
        $builder->join('rate_master_custom_milling rm', "rmd.rm_id = rm.rm_id", 'inner');
        // definitionsId for purchase org may vary; return active ones
        // $builder->where('rm.status', 2);
        $builder->where('rm.segment', $definitionId);
        $builder->where('rm.vaild_from <=', $currentDate);
        $builder->where('rm.vaild_to >=', $currentDate);
        $builder->where('rmd.rate > 0', null, false);
        $builder->where('rmd.rm_id', $rm_id);
        // $builder->where('rmd.status',1);
        $builder->where("rmd.condition_type_code != 'MATE'", null, false);

        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }
    public function getPlantName($userId)
    {
        $currentDate = date('Y-m-d');
        $db = db_connect();
        $builder = $db->table('master_plant mp');
        $builder->select('mp.ID as value, mp.WERKS as label');
        $builder->join('master_user_plant upa', "upa.PLANT_ID = mp.ID", 'inner');
        // definitionsId for purchase org may vary; return active ones
        // $builder->where('rm.status', 2);
        if ($userId > 1) {  
        $builder->where('upa.USER_ID', $userId);
        }
        $builder->whereIn('mp.plant_subdivision',[0,1]);
        $builder->groupBy('mp.WERKS');
        // $builder->where('rmd.status',1);
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }
    public function getStorageLocation($plantId)
    {
        $currentDate = date('Y-m-d');
        $db = db_connect();
        $builder = $db->table('master_storage mp');
        $builder->select('mp.STORAGE_REFID as value, mp.LGORT as label');
        $builder->where('mp.plantid', $plantId);
        // $builder->where('rmd.status',1);
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }

    /**
     * Save purchase order header + lines and per-line condition rows.
     * Payload shape expected (from UI):
     * {
     *   purchaseOrderId, UserId, purchase_org, broker_code, broker_name, LineDetails: [ { Line, SegmentCode, MaterialCode, MaterialDes, VendorCode, VendorName, Qty, Uom, Rate, ConditionChanges: [ { condition_type_code, condition_description, rate } ] } ], OverAllAmount
     * }
     */
    public function addPurchaseOrderDetails($data)
    {
        $db = db_connect();
        try {
            $db->transStart();
            $now = date('Y-m-d H:i:s');
            // print_r($data); exit; // Debugging line to check input data structure
            // ---------- EBELN: CM + YY + 000001, shared across every line in this PO ----------
            $yearSuffix = date('y'); // e.g. "25" for 2025, "26" for 2026
            $ebelnPrefix = 'CM' . $yearSuffix;
    
            $lastEbelnRow = $db->table('sap_to_pp')
                ->select('EBELN')
                ->like('EBELN', $ebelnPrefix, 'after') // EBELN LIKE 'CM25%'
                ->orderBy('EBELN', 'DESC')
                ->limit(1)
                ->get()
                ->getRow();
    
            $nextSeq = 1;
            if ($lastEbelnRow && !empty($lastEbelnRow->EBELN)) {
                $lastSeq = (int) substr($lastEbelnRow->EBELN, strlen($ebelnPrefix));
                $nextSeq = $lastSeq + 1;
            }
            $ebeln = $ebelnPrefix . str_pad($nextSeq, 6, '0', STR_PAD_LEFT); // e.g. CM25000001
    
            $line_db_id = null;
    
            foreach (($data['LineDetails'] ?? []) as $line) {
    
                // ---------- derive Loading / Unloading / Freight cost from this line's ConditionChanges ----------
                // PLACEHOLDER condition_type_code lists - confirm/replace against your real master data.
                $loadingCostCodes   = ['YUL3', 'YUL3'];
                $unloadingCostCodes = ['YLD3', 'YULW','YULG'];
                $freightCostCodes   = ['YFR3', 'YFR3'];
    
                $loadingCost = 0;
                $unloadingCost = 0;
                $freightCost = 0;
    
                if (!empty($line['ConditionChanges']) && is_array($line['ConditionChanges'])) {
                    foreach ($line['ConditionChanges'] as $cond) {
                        $condCode = $cond['condition_type_code'] ?? ($cond['ConditionType'] ?? '');
                        $condRate = (float) ($cond['rate'] ?? ($cond['Rate'] ?? 0));
                        $condTotal = isset($cond['TotalAmount'])
                            ? (float) $cond['TotalAmount']
                            : ($condRate ?? 0);
    
                        if (in_array($condCode, $loadingCostCodes, true)) {
                            $loadingCost += $condTotal;
                        } elseif (in_array($condCode, $unloadingCostCodes, true)) {
                            $unloadingCost += $condTotal;
                        } elseif (in_array($condCode, $freightCostCodes, true)) {
                            $freightCost += $condTotal;
                        }
                    }
                }
    
                $lineInsert = [
                    'EBELP' => $line['Line'] ?? null,
                    'EBELN' => $ebeln,
                    'BROCKER_CODE' => $data['broker_code'] ?? null,
                    'BROCKER_NAME' => $data['broker_name'] ?? null,
                    'SGT_SCAT' => $line['SegmentCode'] ?? null,
                    'MATNR' => $line['MaterialCode'] ?? null,
                    'IDNLF' => $line['MaterialDes'] ?? null,
                    'SUPPLIER_CODE' => $line['VendorCode'] ?? null,
                    'SUPPLIER_NAME' => $line['VendorName'] ?? null,
                    'MENGE' => $line['Qty'] ?? 0,
                    'MEINS' => $line['Uom'] ? $line['Uom'] : 'TON',
                    'NETPR' => $line['Rate'] ?? 0,
                    'totalAmount' => $data['OverAllAmount'] ?? 0,
                    'WERKS' => $line['PlantName'] ?? null,
                    'LGORT' => $line['StorageLocation'] ?? null,
                    'Loading_cost' => $loadingCost,
                    'Unloading_cost' => $unloadingCost,
                    'Freight_cost' => $freightCost,
                    'LOEKZ' => '' ?? null,
                    'ZUPDATE' => '' ?? null,
                    'BSART' => 'LP' ?? null,
                    'INCO1' => 'SDG' ?? null,
                    'PURCHASE_ORG_DESC' => ucwords(strtolower($data['purchase_org'] ?? '')),
                    'PURCHASE_ORG' => ($data['purchase_org'] == 'CM RAKE')
                                        ? '1'
                                        : (($data['purchase_org'] == 'CM TRUCK')
                                        ? '2'
                                        : '3'),
                    'status' => 1, // pending
                    'PO_LOADING_DATE' => $line['PoLoadingDate'] ?? null,
                    'NUMBER_OF_VEHICLES' => $line['NoOfVehicles'] ?? null,
                    'PO_BAG_TYPE' => $line['BagType'] ?? null,
                    'createdAt' => $now,
                    'createdBy' => $data['UserId'] ?? 0,
                    'customerCode' => $data['customer_code'],
                    'customerName' => $data['customer_name'],
                ];
                // print_r($lineInsert);exit; // Debugging line to check the data being inserted for each line
                // Insert the line into sap_to_pp (all line items stored in sap_to_pp)
                $db->table('sap_to_pp')->insert($lineInsert);
                // print_r($db->error());exit; // Debugging line to check for errors after insert
                $line_db_id = $db->insertID();
    
                // insert per-line condition rows into custom_milling_po_condtion table
                if (!empty($line['ConditionChanges']) && is_array($line['ConditionChanges'])) {
                    foreach ($line['ConditionChanges'] as $cond) {
                        $condInsert = [
                            'pp_line_id' => $line_db_id ?? null,
                            'line_no' => $line['Line'] ?? null,
                            'condition_type_code' => $cond['condition_type_code'] ?? ($cond['ConditionType'] ?? null),
                            'condition_description' => $cond['condition_description'] ?? ($cond['ConditionDesc'] ?? null),
                            'rate' => $cond['rate'] ?? ($cond['Rate'] ?? 0),
                            'total_amount' => isset($cond['TotalAmount']) ? $cond['TotalAmount'] : ((float)($cond['rate'] ?? ($cond['Rate'] ?? 0)) * (float)($line['Qty'] ?? 0)),
                            'created_at' => $now,
                        ];
                        $db->table('custom_milling_po_condtion')->insert($condInsert);
                    }
                }
            }
    
            $db->transComplete();
            if ($db->transStatus() === false) return ['success' => false, 'error' => 'DB transaction failed'];
            return ['success' => true, 'pp_id' => $line_db_id, 'EBELN' => $ebeln];
        } catch (\Exception $e) {
            if ($db->transStatus() === false) $db->transRollback();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    public function getBagType()
    {
        $db = db_connect();
        $builder = $db->table('master_bag mp');
        $builder->select('mp.BAG_CODE as value,CONCAT( mp.BAG_CODE, " - ", mp.BAG_NAME ) as label');
        $builder->where('mp.RecStatus',1);
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }
    // fromDate/toDate (YYYY-MM-DD) filter on createdAt. When neither is given,
    // only the latest 50 POs (by createdAt) are returned.
    public function getPurchaseOrderList($fromDate = null, $toDate = null)
    {
        $db = db_connect();
        $builder = $db->table('sap_to_pp sp');
        $builder->select('sp.*');
        $builder->whereIn('sp.status',[0,1,2,3]);
        $builder->whereIn('sp.PURCHASE_ORG_DESC', ['Cm Truck','Cm Container','Cm Rake']);
        $builder->groupBy('sp.EBELN');
        if ($fromDate) {
            $builder->where('DATE(sp.createdAt) >=', $fromDate);
        }
        if ($toDate) {
            $builder->where('DATE(sp.createdAt) <=', $toDate);
        }
        $builder->orderBy('sp.createdAt', 'DESC');
        if (!$fromDate && !$toDate) {
            $builder->limit(50);
        }
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL
        return $builder->get()->getResultArray();
    }

    // Line-item based report: every active PO line, flattened, with its condition changes.
    // fromDate/toDate (YYYY-MM-DD) are mandatory in the UI and filter on PO_LOADING_DATE.
    // Customer filter options for the report: distinct customers already used on existing custom-milling POs
    public function getPurchaseOrderCustomerList()
    {
        $builder = $this->db->table('sap_to_pp')
            ->select('customerCode as value, CONCAT(customerCode, " - ", customerName) as label')
            ->whereIn('PURCHASE_ORG_DESC', ['CM Truck','CM Container','CM Rake'])
            ->where('customerCode IS NOT NULL', null, false)
            ->groupBy('customerCode')
            ->orderBy('customerName', 'ASC');
        return $builder->get()->getResultArray();
    }

    // Single source of truth for PO status label/color, shared by the status filter
    // dropdown and the line report (so the UI never hardcodes status text/color).
    private static $poStatusMeta = [
        '0' => ['label' => 'Rejected',    'color' => 'danger'],
        '1' => ['label' => 'MG Approve',  'color' => 'primary'],
        '2' => ['label' => 'CMG Approve', 'color' => 'warning'],
        '3' => ['label' => 'Completed',   'color' => 'success'],
    ];

    // Status filter options for the report: distinct statuses present on existing custom-milling POs
    public function getPurchaseOrderStatusList()
    {
        $builder = $this->db->table('sap_to_pp')
            ->select('status as value')
            ->whereIn('PURCHASE_ORG_DESC', ['CM Truck','CM Container','CM Rake'])
            ->groupBy('status')
            ->orderBy('status', 'ASC');
        $rows = $builder->get()->getResultArray();
        return array_map(function ($r) {
            $meta = self::$poStatusMeta[(string) $r['value']] ?? null;
            return ['value' => $r['value'], 'label' => $meta['label'] ?? (string) $r['value']];
        }, $rows);
    }

    public function getPurchaseOrderLineReport($fromDate = null, $toDate = null, $customerCode = null, $status = null)
    {
        $builder = $this->db->table('sap_to_pp')
            ->whereIn('PURCHASE_ORG_DESC', ['CM Truck','CM Container','CM Rake'])
            ->orderBy('EBELN', 'ASC')
            ->orderBy('refid', 'ASC');
        if ($fromDate) {
            $builder->where('DATE(createdAt) >=', $fromDate);
        }
        if ($toDate) {
            $builder->where('DATE(createdAt) <=', $toDate);
        }
        if ($customerCode) {
            $builder->where('customerCode', $customerCode);
        }
        if ($status !== null && $status !== '') {
            $builder->where('status', $status);
        }
        $lines = $builder->get()->getResultArray();

        $report = [];
        foreach ($lines as $l) {
            $conditions = $this->db->table('custom_milling_po_condtion')
                ->where('pp_line_id', $l['refid'])
                ->where('status', 1)
                ->get()
                ->getResultArray();

            $report[] = [
                'refid'            => $l['refid'],
                'poNumber'         => $l['EBELN'],
                'purchaseOrg'      => $l['PURCHASE_ORG_DESC'],
                'brokerName'       => $l['BROCKER_NAME'],
                'brokerCode'       => $l['BROCKER_CODE'],
                'customerCode'     => $l['customerCode'],
                'customerName'     => $l['customerName'],
                'segmentCode'      => $l['SGT_SCAT'],
                'Line'             => $l['EBELP'],
                'PoLoadingDate'    => $l['PO_LOADING_DATE'] ? date('Y-m-d', strtotime($l['PO_LOADING_DATE'])) : null,
                'VendorCode'       => $l['SUPPLIER_CODE'],
                'VendorName'       => $l['SUPPLIER_NAME'],
                'BagType'          => $l['PO_BAG_TYPE'],
                'Qty'              => $l['MENGE'],
                'NoOfVehicles'     => $l['NUMBER_OF_VEHICLES'],
                'Uom'              => $l['MEINS'],
                'Rate'             => $l['NETPR'],
                'TotalAmount'      => $l['NETPR'] * $l['MENGE'],
                'PlantName'        => $l['WERKS'],
                'StorageLocation'  => $l['LGORT'],
                'status'           => $l['status'],
                'statusLabel'      => self::$poStatusMeta[(string) $l['status']]['label'] ?? (string) $l['status'],
                'statusColor'      => self::$poStatusMeta[(string) $l['status']]['color'] ?? 'secondary',
                'conditionCount'   => count($conditions),
                'ConditionChanges' => $conditions,
            ];
        }
        return $report;
    }

    // Purchase Orders pending at a given approval status (1 = pending Level 1,
    // 2 = pending Level 2), used by the read-only approval list screens.
    public function getPurchaseOrderListByStatus($status)
    {
        $db = db_connect();
        $builder = $db->table('sap_to_pp sp');
        $builder->select('sp.*');
        $builder->where('sp.status', $status);
        $builder->whereIn('sp.PURCHASE_ORG_DESC', ['Cm Truck','Cm Container','Cm Rake']);
        $builder->groupBy('sp.EBELN');
        return $builder->get()->getResultArray();
    }

    // Flip sap_to_pp rows for a PO (all lines share EBELN) to the given status:
    // Approve Level 1 -> 2, Approve Level 2 -> 3, Reject -> 0. Lines already
    // soft-deleted (status = 0) are left untouched so a rejected/removed line
    // doesn't get reactivated by a later approval step. $extra carries the
    // audit columns for the action (approvalBy1/approvalAt1, approvalBy2/
    // approvalAt2, or rejectedBy/rejectedAt) so every action is stamped.
    public function updatePurchaseOrderStatus($ebeln, $status, $extra = [])
    {
        $db = db_connect();
        $builder = $db->table('sap_to_pp')->where('EBELN', $ebeln);
        if ((int) $status !== 0) {
            $builder->where('status !=', 0);
        }
        return $builder->update(array_merge(['status' => $status], $extra)) !== false;
    }

    // ── 2. Full detail for one PO: header + line items + condition changes ──
    public function getPurchaseOrderInfo($purchaseOrderId, $userId)
    {
        $header = $this->db->table('sap_to_pp poh')
            ->select("
                poh.refid as purchaseOrderId,
                poh.EBELN as poNumber,
                poh.PURCHASE_ORG_DESC as purchaseOrgName,
                poh.BROCKER_CODE as brokerCode,
                poh.BROCKER_NAME as brokerName,
                poh.customerCode as customerCode,
                poh.customerName as customerName,
                poh.SGT_SCAT as segmentCode,
                poh.MATNR as materialCode,
                poh.IDNLF as materialDes,
                poh.MEINS as uom,
                poh.NETPR as rate,
                poh.totalAmount as overAllAmount,
                rm.rm_id
            ")
           ->join('definitions_list dl', 'dl.definitionsName = poh.PURCHASE_ORG_DESC', 'inner')
           ->join(
                    'rate_master_custom_milling rm',
                    'rm.segment = poh.SGT_SCAT
                    AND rm.purchase_org_id = dl.id
                    AND rm.vaild_to >= CURDATE()',
                    'inner'
            )
            ->where('poh.EBELN', $purchaseOrderId)
            // ->where('poh.status > 0')
            ->groupBy('poh.EBELN')
            // print_r($header->getCompiledSelect());exit;
            ->get()
            ->getRowArray();
        // print_r($header);exit;
        if (!$header) {
            return null;
        }
    
        $lines = $this->db->table('sap_to_pp')
            ->where('EBELN', $purchaseOrderId)
            // ->where('status > 0')
            ->orderBy('refid', 'ASC')
            ->get()
            ->getResultArray();
    
        $lineDetails = [];
        foreach ($lines as $l) {
            $conditions = $this->db->table('custom_milling_po_condtion')
               // ->where('purchase_order_id', $purchaseOrderId)
                ->where('pp_line_id', $l['refid'])
                ->where('status', 1)
                ->get()
                ->getResultArray();
    
            $lineDetails[] = [
                'refid'            => $l['refid'],
                'Line'             => $l['EBELP'],
                'PoLoadingDate'    =>  date('Y-m-d', strtotime($l['PO_LOADING_DATE'])),
                'VendorCode'       => $l['SUPPLIER_CODE'],
                'VendorName'       => $l['SUPPLIER_NAME'],
                'BagType'          => $l['PO_BAG_TYPE'],
                'Qty'              => $l['MENGE'],
                'NoOfVehicles'     => $l['NUMBER_OF_VEHICLES'],
                'Uom'              => $l['MEINS'],
                'Rate'             => $l['NETPR'],
                'TotalAmount'      => $l['NETPR'] * $l['MENGE'],
                'PlantName'        => $l['WERKS'],
                'StorageLocation'  => $l['LGORT'],
                'poNumber'         => $l['EBELN'],
                'purchaseOrg'      => $l['PURCHASE_ORG_DESC'],
                'status'           => $l['status'],
                'ConditionChanges' => $conditions,
            ];
        }
    
        $header['LineDetails'] = $lineDetails;
        return $header;
    }
    
    // ── 3. Update header, replace line items + condition changes ──
    public function updatePurchaseOrderDetails($post)
    {
        $db = db_connect();
        try {
            $db->transStart();
            $now = date('Y-m-d H:i:s');

            // Same placeholder condition_type_code lists used in addPurchaseOrderDetails —
            // keep these two in sync if you change one.
            $loadingCostCodes   = ['YUL3', 'YUL3'];
            $unloadingCostCodes = ['YLD3', 'YULW','YULG'];
            $freightCostCodes   = ['YFR3', 'YFR3'];

            $lineDetails = $post['LineDetails'] ?? [];
            $keepIds = [];
            // print_r($post);exit;
            foreach ($lineDetails as $line) {

                // ---- derive Loading / Unloading / Freight cost from this line's ConditionChanges ----
                $loadingCost = 0;
                $unloadingCost = 0;
                $freightCost = 0;

                if (!empty($line['ConditionChanges']) && is_array($line['ConditionChanges'])) {
                    foreach ($line['ConditionChanges'] as $cond) {
                        $condCode  = $cond['condition_type_code'] ?? ($cond['ConditionType'] ?? '');
                        $condRate  = (float) ($cond['rate'] ?? ($cond['Rate'] ?? 0));
                        $condTotal = isset($cond['TotalAmount']) ? (float) $cond['TotalAmount'] : $condRate;

                        if (in_array($condCode, $loadingCostCodes, true)) {
                            $loadingCost += $condTotal;
                        } elseif (in_array($condCode, $unloadingCostCodes, true)) {
                            $unloadingCost += $condTotal;
                        } elseif (in_array($condCode, $freightCostCodes, true)) {
                            $freightCost += $condTotal;
                        }
                    }
                }

                $lineData = [
                    'EBELP'              => $line['Line'] ?? null,
                    'EBELN'               => $post['purchaseOrderId'] ?? null,
                    'BROCKER_CODE'        => $post['broker_code'] ?? null,
                    'BROCKER_NAME'        => $post['broker_name'] ?? null,
                    'SUPPLIER_CODE'       => $line['VendorCode'] ?? null,
                    'SUPPLIER_NAME'       => $line['VendorName'] ?? null,
                    'MENGE'               => $line['Qty'] ?? 0,
                    'MEINS'               => $line['Uom'] ?? null,
                    'NETPR'               => $line['Rate'] ?? 0,
                    'totalAmount'         => $post['OverAllAmount'] ?? 0,
                    'WERKS'               => $line['PlantName'] ?? null,
                    'LGORT'               => $line['StorageLocation'] ?? null,
                    'Loading_cost'        => $loadingCost,
                    'Unloading_cost'      => $unloadingCost,
                    'Freight_cost'        => $freightCost,
                    'PO_LOADING_DATE'     => $line['PoLoadingDate'] ?? null,
                    'NUMBER_OF_VEHICLES'  => $line['NoOfVehicles'] ?? null,
                    'PO_BAG_TYPE'         => $line['BagType'] ?? null,
                    'customerCode'        => $post['customer_code'] ?? null,
                    'customerName'        => $post['customer_name'] ?? null,
                    'updatedAt'           => $now,
                    'status'              => $line['status'] == 0 ? 0 : 1
                ];

                if (!empty($line['refid'])) {
                    // ── existing line: update in place ──
                    $db->table('sap_to_pp')->where('refid', $line['refid'])->update($lineData);
                    $lineDbId = $line['refid'];
                } else {
                    // ── new line added in the popup: insert fresh, same as addPurchaseOrderDetails ──
                    $lineData['SGT_SCAT']           = $line['SegmentCode'] ?? null;
                    $lineData['MATNR']              = $line['MaterialCode'] ?? null;
                    $lineData['IDNLF']              = $line['MaterialDes'] ?? null;
                    $lineData['PURCHASE_ORG_DESC']  = ucwords(strtolower($post['purchase_org'] ?? '')) ?: null;
                    $lineData['PURCHASE_ORG']       = ($post['purchase_org'] == 'CM RAKE')
                                        ? '1'
                                        : (($post['purchase_org'] == 'CM TRUCK')
                                        ? '2'
                                        : '3') ?? null;
                    $lineData['BSART']              = 'LP';
                    $lineData['INCO1']              = 'SDG';
                    $lineData['status']             = 1;
                    $lineData['createdAt']          = $now;
                    $lineData['createdBy']          = $post['UserId'] ?? 0;
                    $db->table('sap_to_pp')->insert($lineData);
                    $lineDbId = $db->insertID();
                }

                $keepIds[] = $lineDbId;

                // ── soft-delete this line's existing condition rows, then insert the current set fresh ──
                $db->table('custom_milling_po_condtion')->where('pp_line_id', $lineDbId)->update(['status' => 0, 'updated_at' => $now]);
                if (!empty($line['ConditionChanges']) && is_array($line['ConditionChanges'])) {
                    foreach ($line['ConditionChanges'] as $cond) {
                        if($cond['status'] == 1){
                            $db->table('custom_milling_po_condtion')->insert([
                                'pp_line_id'             => $lineDbId,
                                'line_no'                => $line['Line'] ?? null,
                                'condition_type_code'    => $cond['condition_type_code'] ?? ($cond['ConditionType'] ?? null),
                                'condition_description'  => $cond['condition_description'] ?? ($cond['ConditionDesc'] ?? null),
                                'rate'                   => $cond['rate'] ?? ($cond['Rate'] ?? 0),
                                'total_amount'           => isset($cond['TotalAmount'])
                                    ? $cond['TotalAmount']
                                    : ((float) ($cond['rate'] ?? ($cond['Rate'] ?? 0)) * (float) ($line['Qty'] ?? 0)),
                                'status'                 => 1,
                                'created_at'             => $now,
                            ]);
                        }
                    }
                }
            }

            // ── lines that existed for this EBELN before but were removed in the UI:
            //     soft-delete by flipping status to 0 instead of hard-deleting the row ──
            $existingIds = array_column(
                $db->table('sap_to_pp')
                    ->select('refid')
                    ->where('EBELN', $post['purchaseOrderId'])
                    ->where('status !=', 0)
                    ->get()
                    ->getResultArray(),
                'refid'
            );
            $idsToRemove = array_diff($existingIds, $keepIds);
            if (!empty($idsToRemove)) {
                $db->table('sap_to_pp')
                    ->whereIn('refid', $idsToRemove)
                    ->update(['status' => 0, 'updatedAt' => $now]);
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                return ['success' => false, 'error' => 'DB transaction failed'];
            }
            return ['success' => true, 'EBELN' => $post['purchaseOrderId']];
        } catch (\Exception $e) {
            if ($db->transStatus() === false) $db->transRollback();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // Insert FI Payment (Custom Milling FI Payment confirmation - TRUCK/RAKE tabs).
    // Supports both single-row submit (no child_info) and clubbed submit
    // (child_info = array of selected PO/truck rows) - one DB row per item,
    // sharing the common invoice header fields (vendor, invoice no, date,
    // remarks, attachment, gl/cost/profit center), following the same
    // shared-header/insertBatch shape as SDIModel::insertSupplierEntryBatch.
    public function insertFIPayment($data)
    {
        // print_r($data);exit;
        $db = db_connect();
        try {
            // ---------- financial year window (Apr 1 - Mar 31), based on invoice_date ----------
            $invoiceDate = !empty($data['invoice_date']) ? strtotime($data['invoice_date']) : time();
            $invoiceYear = (int) date('Y', $invoiceDate);
            $invoiceMonth = (int) date('n', $invoiceDate);
            $fyStartYear = $invoiceMonth >= 4 ? $invoiceYear : $invoiceYear - 1;
            $fyStart = $fyStartYear . '-04-01 00:00:00';
            $fyEnd = ($fyStartYear + 1) . '-03-31 23:59:59';

            $invoiceCount = $db->table('custom_milling_fi_entry')
                ->where("vendor_invoice_no", $data['vendor_invoice_no'] ?? '')
                ->where("status in ('1','2','3','4','6')")
                ->where('created_at >=', $fyStart)
                ->where('created_at <=', $fyEnd)
                ->countAllResults();
            if ($invoiceCount > 0) {
                return ['success' => false, 'error' => 'Please Check Invoice Number'];
            }

            $db->transStart();
            $now = date('Y-m-d H:i:s');

            $yearSuffix = date('y');
            $noPrefix = 'CMFI' . $yearSuffix;

            $createdBy = [[
                'user_id'   => $data['created_by'] ?? 0,
                'date_time' => $now,
            ]];

            // Each item shares the invoice header fields from $data, but keeps its
            // own PO/tonnage/rate/value. A plain single submit has no child_info,
            // so it becomes a single-item loop using $data directly.
            $items = (!empty($data['child_info']) && is_array($data['child_info']))
                ? $data['child_info']
                : [null];

            $pick = function ($item, $key, $default = null) use ($data) {
                if (is_array($item) && array_key_exists($key, $item) && $item[$key] !== null && $item[$key] !== '') {
                    return $item[$key];
                }
                return $data[$key] ?? $default;
            };

            // ---------- fi_entry_no: CMFI + YY + 000001 ----------
            // One fi_entry_no per SUBMIT CALL, shared by every row inserted
            // for this club (a clubbed submit is one FI entry made up of
            // several PO/truck rows, not several separate FI entries) -
            // rows still carry their own PO/tonnage/rate/value. FOR UPDATE
            // locks the matching rows for the rest of this transaction so a
            // second concurrent submit (another tab/user) blocks until this
            // one commits, instead of both reading the same "last" number
            // and generating the same one for two different submissions.
            $lastRow = $db->query(
                "SELECT fi_entry_no FROM custom_milling_fi_entry
                 WHERE fi_entry_no LIKE ?
                 ORDER BY fi_entry_no DESC LIMIT 1 FOR UPDATE",
                [$noPrefix . '%']
            )->getRow();

            $nextSeq = 1;
            if ($lastRow && !empty($lastRow->fi_entry_no)) {
                $lastSeq = (int) substr($lastRow->fi_entry_no, strlen($noPrefix));
                $nextSeq = $lastSeq + 1;
            }
            $fiEntryNo = $noPrefix . str_pad($nextSeq, 6, '0', STR_PAD_LEFT);

            $insertedIds = [];
            $fiEntryNos = [];
            $allPiRefIds = [];

            foreach ($items as $item) {
                $header = [
                    'fi_entry_no'       => $fiEntryNo,
                    'process_type'      => $data['process_type'] ?? null,
                    'overall_tonnage'   => $pick($item, 'overall_tonnage', 0),
                    'rate'              => $pick($item, 'rate', 0),
                    'total_value'       => $pick($item, 'total_value', 0),
                    'invoice_value'     => $pick($item, 'invoice_value', 0),
                    'difference'        => $pick($item, 'difference', 0),
                    'confirm_vendor_id' => $data['confirm_vendor'] ?? null,
                    'tds_name'          => $data['tds_code'] ?? null,
                    'gl'                => $data['gl'] ?? null,
                    'cost_center'       => $data['cost_center'] ?? null,
                    'profit_center'     => $data['profit_center'] ?? null,
                    'vendor_invoice_no' => $data['vendor_invoice_no'] ?? null,
                    'invoice_date'      => $data['invoice_date'] ?? null,
                    'remarks'           => $data['remarks'] ?? null,
                    'invoice_attachment' => $data['invoice_attachment'] ?? null,
                    'po_numbers'        => $pick($item, 'poNumbers'),
                    'condition_id'      => $pick($item, 'condtion_id', 0),
                    'puchase_info_id'   => json_encode($pick($item, 'purchaseInfoId')),
                    'status'            => 1,
                    'created_at'        => $now,
                    'created_by'        => $data['created_by'],
                ];

                $db->table('custom_milling_fi_entry')->insert($header);
                $insertedIds[] = $db->insertID();
                $fiEntryNos[] = $fiEntryNo;

                if (is_array($item) && !empty($item['PI_REFID'])) {
                    $allPiRefIds = array_merge($allPiRefIds, (array) $item['PI_REFID']);
                }
            }

            // ---------- mark source purchase_info rows as used so they can't be resubmitted ----------
            $piRefIds = array_filter(array_unique($allPiRefIds), function ($v) { return !empty($v); });
            if (!empty($piRefIds)) {
                $db->table('purchase_info')
                    ->whereIn('PI_REFID', array_values($piRefIds))
                    ->update(['miro_status' => 1]);
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                return ['success' => false, 'error' => 'DB transaction failed'];
            }
            return [
                'success' => true,
                'id' => count($insertedIds) === 1 ? $insertedIds[0] : $insertedIds,
                'fi_entry_no' => count($fiEntryNos) === 1 ? $fiEntryNos[0] : $fiEntryNos,
                'row_count' => count($insertedIds),
            ];
        } catch (\Exception $e) {
            if ($db->transStatus() === false) $db->transRollback();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // Single source of truth for FI Payment status label/color, shared by the
    // status filter dropdown and the report (so the UI never hardcodes status text/color).
    private static $fiStatusMeta = [
        '0' => ['label' => 'Rejected',      'color' => 'danger'],
        '1' => ['label' => 'Level 1 Pending', 'color' => 'primary'],
        '2' => ['label' => 'Level 2 Pending', 'color' => 'warning'],
        '3' => ['label' => 'Level 3 Pending', 'color' => 'info'],
        '4' => ['label' => 'Completed',     'color' => 'success'],
    ];

    // FI Payments pending at a given approval status (1 = pending Level 1,
    // 2 = pending Level 2, 3 = pending Level 3), used by the read-only approval list screens.
    public function getCustomMillingFiListByStatus($status)
    {
        $db = db_connect();
        $rows = $db->table('custom_milling_fi_entry cmfe')
            ->select("
                cmfe.*,
                mv.Name AS vendor_name,
                rmd.condition_type_code,
                rmd.condition_description
            ")
            ->join('master_vendor mv', 'mv.Id = cmfe.confirm_vendor_id', 'left')
            ->join('custom_milling_po_condtion rmd', 'rmd.id = cmfe.condition_id', 'left')
            ->where('cmfe.status', $status)
            ->orderBy('cmfe.id', 'ASC')
            ->get()
            ->getResultArray();
        $grouped = $this->groupFiRowsByEntryNo($rows);
        $this->attachVehicleDetails($grouped);
        return $grouped;
    }

    // Collapses the one-DB-row-per-selected-item shape written by a clubbed
    // insertFIPayment() submit (several rows sharing the same fi_entry_no,
    // see insertFIPayment above) into a single summary row per fi_entry_no -
    // Approve/Reject already act on the whole fi_entry_no at once, so the
    // list must show one line per entry too, with the numeric fields summed
    // and PO/condition/purchase_info ids merged across the group. A plain
    // (non-clubbed) submit is a group of one and passes through unchanged.
    private function groupFiRowsByEntryNo(array $rows)
    {
        $grouped = [];
        foreach ($rows as $row) {
            $key = $row['fi_entry_no'];
            $piIds = json_decode($row['puchase_info_id'] ?? 'null', true);
            $piIds = is_array($piIds) ? array_values(array_filter($piIds)) : [];
            // One (pi_ids, condition_id) pair per source DB row, kept intact
            // rather than merged into one flat pool - vehicle details must be
            // looked up per row's own condition, not the group's mixed bag,
            // otherwise the wrong condition's rate/amount gets attached.
            $sourceRef = ['pi_ids' => $piIds, 'condition_id' => $row['condition_id'] ?? null];

            if (!isset($grouped[$key])) {
                $grouped[$key] = $row;
                $grouped[$key]['ids'] = [$row['id']];
                $grouped[$key]['po_numbers'] = !empty($row['po_numbers']) ? [$row['po_numbers']] : [];
                $grouped[$key]['condition_type_code'] = !empty($row['condition_type_code']) ? [$row['condition_type_code']] : [];
                $grouped[$key]['condition_description'] = !empty($row['condition_description']) ? [$row['condition_description']] : [];
                $grouped[$key]['puchase_info_id'] = $piIds;
                $grouped[$key]['_sources'] = [$sourceRef];
                continue;
            }

            $g = &$grouped[$key];
            $g['overall_tonnage'] = round((float) $g['overall_tonnage'] + (float) $row['overall_tonnage'], 3);
            $g['total_value']     = round((float) $g['total_value'] + (float) $row['total_value'], 2);
            $g['invoice_value']   = round((float) $g['invoice_value'] + (float) $row['invoice_value'], 2);
            $g['difference']      = round((float) $g['difference'] + (float) $row['difference'], 2);
            $g['ids'][] = $row['id'];
            if (!empty($row['po_numbers']) && !in_array($row['po_numbers'], $g['po_numbers'])) {
                $g['po_numbers'][] = $row['po_numbers'];
            }
            if (!empty($row['condition_type_code']) && !in_array($row['condition_type_code'], $g['condition_type_code'])) {
                $g['condition_type_code'][] = $row['condition_type_code'];
            }
            if (!empty($row['condition_description']) && !in_array($row['condition_description'], $g['condition_description'])) {
                $g['condition_description'][] = $row['condition_description'];
            }
            $g['puchase_info_id'] = array_merge($g['puchase_info_id'], $piIds);
            $g['_sources'][] = $sourceRef;
            unset($g);
        }

        foreach ($grouped as &$g) {
            $g['po_numbers'] = implode(', ', $g['po_numbers']);
            $g['condition_type_code'] = implode(', ', $g['condition_type_code']);
            $g['condition_description'] = implode(', ', $g['condition_description']);
            $g['puchase_info_id'] = json_encode(array_values(array_unique($g['puchase_info_id'])));
        }
        unset($g);

        return array_values($grouped);
    }

    // Vehicle/truck rows for a set of purchase_info PI_REFIDs, sourced live from
    // purchase_info + gateout_info + rate master tables (the same data shown to
    // the submitter when they picked the row), used to render Vehicle Details
    // on the FI Payment approval/report screens without duplicating the data
    // into custom_milling_fi_entry.
    // $conditionId pins the exact custom_milling_po_condtion row this FI
    // entry (or, for a clubbed entry, this one source row within it) was
    // actually raised against. A PO line commonly has several condition
    // rows sharing the same pp_line_id (freight, brokerage, loading, ...),
    // so without this filter the join is ambiguous and GROUP BY silently
    // picks an arbitrary one's rate/amount - showing the wrong condition's
    // figures against the truck. Kept optional (null = old unfiltered
    // behaviour) only for safety; every current caller now passes it.
    public function getPurchaseInfoByRefIds(array $piRefIds, $conditionId = null)
    {
        if (empty($piRefIds)) {
            return [];
        }
        $db = db_connect();
        $builder = $db->table('purchase_info pi')
            ->select("
                pi.PI_REFID,
                pi.TRUCK_NO,
                pi.ZVA_NUMBER AS VA_NUMBER,
                pi.ZPO_NUMBER AS PO_NUMBER,
                pi.WERKS AS PLANT,
                gi.invoice_no AS INVOICE_NO,
                ROUND(SUM(gi.gunny_less_wt) / 1000, 3) AS QTY,
                rmdcm.rate AS RATE,
                ROUND(SUM(gi.gunny_less_wt) / 1000 * rmdcm.rate, 2) AS AMOUNT
            ")
            ->join('gateout_info gi', 'gi.purchase_info_id = pi.PI_REFID', 'inner')
            ->join(
                'sap_to_pp stp',
                'stp.EBELN = pi.ZPO_NUMBER AND stp.EBELP = pi.PO_LINE_ITEM AND stp.SUPPLIER_CODE = pi.ZSUPPLIER_CODE',
                'inner'
                )
            ->join('custom_milling_po_condtion rmdcm', 'rmdcm.pp_line_id = stp.refid AND rmdcm.status = 1', 'inner')
            ->whereIn('pi.PI_REFID', $piRefIds);
        if (!empty($conditionId)) {
            $builder->where('rmdcm.id', $conditionId);
        }
        return $builder
            ->groupBy('pi.PI_REFID')
            ->get()
            ->getResultArray();
    }

    // Fetch vehicle/truck details per (pi_ids, condition_id) source pairing
    // from groupFiRowsByEntryNo and merge them onto $row['vehicle_details'] -
    // a clubbed entry can combine rows raised against different conditions,
    // so each pairing must be queried (and rate/amount resolved) separately
    // rather than looking up the group's merged PI_REFID pool in one go.
    private function attachVehicleDetails(&$rows)
    {
        foreach ($rows as &$row) {
            $sources = $row['_sources'] ?? [[
                'pi_ids' => is_array(json_decode($row['puchase_info_id'] ?? 'null', true))
                    ? array_values(array_filter(json_decode($row['puchase_info_id'], true)))
                    : [],
                'condition_id' => $row['condition_id'] ?? null,
            ]];

            $vehicleDetails = [];
            foreach ($sources as $source) {
                if (empty($source['pi_ids'])) {
                    continue;
                }
                $vehicleDetails = array_merge(
                    $vehicleDetails,
                    $this->getPurchaseInfoByRefIds($source['pi_ids'], $source['condition_id'])
                );
            }
            $row['vehicle_details'] = $vehicleDetails;
            unset($row['_sources']);
        }
        unset($row);
    }

    // Single FI entry row, joined with the vendor's SAP code, used for the
    // Level 3 SAP FI expense posting push.
    public function getCustomMillingFiByNo($fiEntryNo)
    {
        $db = db_connect();
        return $db->table('custom_milling_fi_entry cmfe')
            ->select("cmfe.*, mv.Code AS vendor_code")
            ->join('master_vendor mv', 'mv.Id = cmfe.confirm_vendor_id', 'left')
            ->where('cmfe.fi_entry_no', $fiEntryNo)
            ->get()
            ->getRowArray();
    }

    // ALL DB rows sharing this fi_entry_no, for the Level 3 SAP FI expense
    // posting push. A clubbed submit (see insertFIPayment) writes one row
    // per selected PO/truck item under one shared fi_entry_no, so the SAP
    // posting must send one LINE per row with its own amount, and the
    // top-level totalamount must be the sum across every row - not just
    // the single row getCustomMillingFiByNo() would have returned.
    public function getCustomMillingFiRowsByNo($fiEntryNo)
    {
        $db = db_connect();
        return $db->table('custom_milling_fi_entry cmfe')
            ->select("cmfe.*, mv.Code AS vendor_code")
            ->join('master_vendor mv', 'mv.Id = cmfe.confirm_vendor_id', 'left')
            ->where('cmfe.fi_entry_no', $fiEntryNo)
            ->orderBy('cmfe.id', 'ASC')
            ->get()
            ->getResultArray();
    }

    // Upserts SAP sales / sales_ret rows into fi_entry_stock_report, keyed by
    // purchase_info_id + sales_order_no. "sales" moves stock out (negative),
    // "sales_ret" moves it back in (positive).
    public function upsertFiEntryStockReport($rows, $type)
    {
        $db = db_connect();
        $count = 0;
        // print_r($rows);exit;
        foreach ($rows as $row) {
            // $purchaseInfoId = $row['PI_REFID'] ?? $row['purchase_info_id'] ?? 0;
            $salesOrderNo = $row['INVOICE_NO'] ?? null;
            $stock = (float) ($row['WHEAT'] ?? $row['stock'] ?? 0);
            $stock = $type === 'sales' ? -abs($stock) : abs($stock);

            $data = [
                // 'purchase_info_id' => null,
                'sales_plant_code' => $type === 'sales' ? $row['PLANT'] : null,
                'reciving_plant_code' => $type === 'sales_ret' ? $row['PLANT'] : null,
                'customer_code' => $row['SOLD_TO_PARTY'] ??  null,
                'customer_name' => $row['CUSTOMER_NAME'] ?? null,
                'sales_order_no' => $type === 'sales' ? $salesOrderNo : null,
                'sales_return_order_no' => $type === 'sales_ret' ? $salesOrderNo : null,
                'stock' => $stock,
                'created_by' => 0,
                'status' => 1,
            ];

            $existing = $db->table('fi_entry_stock_report')
                // ->where('purchase_info_id', $purchaseInfoId)
                ->where('sales_order_no', $salesOrderNo)
                ->orWhere('sales_return_order_no', $salesOrderNo)
                ->get()
                ->getRowArray();

            if ($existing) {
                $db->table('fi_entry_stock_report')->where('id', $existing['id'])->update($data);
            } else {
                $db->table('fi_entry_stock_report')->insert($data);
            }
            $count++;
        }
        return $count;
    }

    // Flip a custom_milling_fi_entry row to the given status:
    // Approve Level 1 -> 2, Approve Level 2 -> 3, Approve Level 3 -> 4 (Completed),
    // Reject -> 0. $extra carries the audit columns for the action (approvalBy1/
    // approvalAt1, approvalBy2/approvalAt2, approvalBy3/approvalAt3, or rejectedBy/rejectedAt).
    public function updateCustomMillingFiStatus($fiEntryNo, $status, $extra = [])
    {
        $db = db_connect();
        $builder = $db->table('custom_milling_fi_entry')->where('fi_entry_no', $fiEntryNo);
        if ((int) $status !== 0) {
            $builder->where('status !=', 0);
        }
        return $builder->update(array_merge(['status' => $status], $extra)) !== false;
    }

    // FI Payment report: all entries with approval status, filterable by date range/process type/status
    public function getCustomMillingFiReport($fromDate = null, $toDate = null, $processType = null, $status = null)
    {
        $db = db_connect();
        $builder = $db->table('custom_milling_fi_entry cmfe')
            ->select("
                cmfe.*,
                mv.Name AS vendor_name,
                rmd.condition_type_code,
                rmd.condition_description
            ")
            ->join('master_vendor mv', 'mv.Id = cmfe.confirm_vendor_id', 'left')
            ->join('rate_master_details_custom_milling rmd', 'rmd.rmd_id = cmfe.condition_id', 'left')
            ->orderBy('cmfe.id', 'DESC');
        if ($fromDate) {
            $builder->where('DATE(cmfe.created_at) >=', $fromDate);
        }
        if ($toDate) {
            $builder->where('DATE(cmfe.created_at) <=', $toDate);
        }
        if ($processType) {
            $builder->where('cmfe.process_type', $processType);
        }
        if ($status !== null && $status !== '') {
            $builder->where('cmfe.status', $status);
        }
        // print_r($builder->getCompiledSelect());exit; // Debugging line to check generated SQL   
        $rows = $builder->get()->getResultArray();

        $grouped = $this->groupFiRowsByEntryNo($rows);

        foreach ($grouped as &$r) {
            $r['statusLabel'] = self::$fiStatusMeta[(string) $r['status']]['label'] ?? (string) $r['status'];
            $r['statusColor'] = self::$fiStatusMeta[(string) $r['status']]['color'] ?? 'secondary';
        }
        unset($r);
        $this->attachVehicleDetails($grouped);
        return $grouped;
    }

    // Status filter options for the FI Payment report
    public function getCustomMillingFiStatusList()
    {
        return array_map(function ($value, $meta) {
            return ['value' => $value, 'label' => $meta['label']];
        }, array_keys(self::$fiStatusMeta), self::$fiStatusMeta);
    }

    // FI Entry Stock Report: dashboard summary - inward/outward/net totals, incomplete
    // entry count, per-plant totals, and the most recent entries.
    //
    // Outward totals are completion-based: a sales-only entry (reciving_plant_code NULL)
    // and the completion rows created against it (both plant codes set) describe the SAME
    // dispatch, so they must not both be summed - otherwise outward stock is double-counted.
    // Instead we sum: completed rows (the allocated portion) + each open entry's true
    // remaining_qty (the un-allocated portion), which together equal the original demand
    // exactly once, regardless of whether `status` has been flipped to 2 yet.
    public function getFiEntryStockDashboard($customerCode = null)
    {
        $db = db_connect();

        $inwardRow = $db->table('fi_entry_stock_report')
            ->selectSum('stock', 'total_inward')
            ->where('status', 1)
            ->where('reciving_plant_code IS NOT NULL', null, false)
            ->where('sales_plant_code IS NULL', null, false);
        if ($customerCode) {
            $inwardRow->where('customer_code', $customerCode);
        }
        $inwardRow = $inwardRow->get()->getRowArray();
        $totalInward = (float) ($inwardRow['total_inward'] ?? 0);

        $completedRows = $db->table('fi_entry_stock_report')
            ->select('sales_order_no, sales_plant_code, ABS(stock) AS stock_abs', false)
            ->where('status', 1)
            ->where('reciving_plant_code IS NOT NULL', null, false)
            ->where('sales_plant_code IS NOT NULL', null, false);
        if ($customerCode) {
            $completedRows->where('customer_code', $customerCode);
        }
        $completedRows = $completedRows->get()->getResultArray();

        $allocatedBySalesOrder = [];
        $salesPlantTotalsMap = [];
        $totalOutward = 0.0;
        foreach ($completedRows as $row) {
            $qty = (float) $row['stock_abs'];
            $totalOutward += $qty;
            $allocatedBySalesOrder[$row['sales_order_no']] = ($allocatedBySalesOrder[$row['sales_order_no']] ?? 0) + $qty;
            $salesPlantTotalsMap[$row['sales_plant_code']] = ($salesPlantTotalsMap[$row['sales_plant_code']] ?? 0) + $qty;
        }

        $openSourceRows = $db->table('fi_entry_stock_report')
            ->select('sales_order_no, sales_plant_code, stock')
            ->where('sales_plant_code IS NOT NULL', null, false)
            ->where('reciving_plant_code IS NULL', null, false);
        if ($customerCode) {
            $openSourceRows->where('customer_code', $customerCode);
        }
        $openSourceRows = $openSourceRows->get()->getResultArray();

        $incompleteCount = 0;
        foreach ($openSourceRows as $row) {
            $allocated = $allocatedBySalesOrder[$row['sales_order_no']] ?? 0;
            $remainingQty = abs((float) $row['stock']) - $allocated;
            if ($remainingQty > 0) {
                $totalOutward += $remainingQty;
                $incompleteCount++;
                $salesPlantTotalsMap[$row['sales_plant_code']] = ($salesPlantTotalsMap[$row['sales_plant_code']] ?? 0) + $remainingQty;
            }
        }

        $receivingPlantTotals = $db->table('fi_entry_stock_report')
            ->select('reciving_plant_code AS plant_code, SUM(stock) AS total_stock')
            ->where('status', 1)
            ->where('reciving_plant_code IS NOT NULL', null, false);
        if ($customerCode) {
            $receivingPlantTotals->where('customer_code', $customerCode);
        }
        $receivingPlantTotals = $receivingPlantTotals->groupBy('reciving_plant_code')->get()->getResultArray();

        $salesPlantTotals = [];
        foreach ($salesPlantTotalsMap as $plantCode => $totalStock) {
            $salesPlantTotals[] = ['plant_code' => $plantCode, 'total_stock' => -$totalStock];
        }

        $recentEntries = $db->table('fi_entry_stock_report')
            ->orderBy('id', 'DESC');
        if ($customerCode) {
            $recentEntries->where('customer_code', $customerCode);
        }
        $recentEntries = $recentEntries->limit(10)->get()->getResultArray();

        return [
            'total_inward' => $totalInward,
            'total_outward' => $totalOutward,
            'net_stock' => $totalInward - $totalOutward,
            'incomplete_count' => $incompleteCount,
            'receiving_plant_totals' => $receivingPlantTotals,
            'sales_plant_totals' => $salesPlantTotals,
            'recent_entries' => $recentEntries,
        ];
    }

    // FI Entry Stock Report: all entries, filterable by date range/customer/plant/status
    public function getFiEntryStockReport($fromDate = null, $toDate = null, $customerCode = null, $plantCode = null, $status = null)
    {
        $db = db_connect();
        $builder = $db->table('fi_entry_stock_report')
            ->orderBy('id', 'DESC');
        if ($fromDate) {
            $builder->where('DATE(created_at) >=', $fromDate);
        }
        if ($toDate) {
            $builder->where('DATE(created_at) <=', $toDate);
        }
        if ($customerCode) {
            $builder->where('customer_code', $customerCode);
        }
        if ($plantCode) {
            $builder->groupStart()
                ->where('reciving_plant_code', $plantCode)
                ->orWhere('sales_plant_code', $plantCode)
                ->groupEnd();
        }
        if ($status !== null && $status !== '') {
            $builder->where('status', $status);
        }
        return $builder->get()->getResultArray();
    }

    // Customer dropdown options for the FI Entry Stock Report filter, derived from
    // distinct customer_code/customer_name pairs already denormalized on the table
    public function getFiEntryStockCustomerList()
    {
        $db = db_connect();
        return $db->table('fi_entry_stock_report')
            ->select('customer_code AS value, CONCAT(customer_code, " - ", customer_name) AS label', false)
            ->where('customer_code IS NOT NULL', null, false)
            ->groupBy('customer_code')
            ->orderBy('customer_name', 'ASC')
            ->get()->getResultArray();
    }

    // FI Entry Stock Report: sales-only entries awaiting completion against a receiving
    // plant, with remaining_qty = ABS(stock) minus what's already been allocated to
    // completion rows sharing the same sales_order_no
    public function getFiEntryStockIncompleteList()
    {
        $db = db_connect();
        $sourceRows = $db->table('fi_entry_stock_report')
            ->where('status', 1)
            ->where('sales_plant_code IS NOT NULL', null, false)
            ->where('reciving_plant_code IS NULL', null, false)
            ->orderBy('id', 'DESC')
            ->get()->getResultArray();
        // print_r($sourceRows);exit;
        $result = [];
        foreach ($sourceRows as $row) {
            $allocated = $db->table('fi_entry_stock_report')
                ->select('SUM(ABS(stock)) AS allocated', false)
                ->where('sales_order_no', $row['sales_order_no'])
                ->where('reciving_plant_code IS NOT NULL', null, false)
                ->where('sales_plant_code IS NOT NULL', null, false)
                ->get()->getRowArray();
            $remainingQty = abs((float) $row['stock']) - (float) ($allocated['allocated'] ?? 0);
            // print_r($remainingQty);exit;
            if ($remainingQty <= 0) {
                // Already fully allocated (e.g. completion rows added outside this flow) -
                // self-heal so it stops showing up as incomplete.
                $db->table('fi_entry_stock_report')->where('id', $row['id'])->update(['status' => 2]);
                continue;
            }

            $row['remaining_qty'] = $remainingQty;
            $result[] = $row;
        }

        return $result;
    }

    // FI Entry Stock Report: complete a sales-only entry by allocating its stock
    // across one or more receiving plants. $data = ['sourceId' => int, 'allocations' =>
    // [['reciving_plant_code' => string, 'stock' => float], ...]]
    public function insertFiEntryStockCompletion($data)
    {
        $db = db_connect();
        $sourceId = $data['sourceId'] ?? null;
        $allocations = $data['allocations'] ?? [];

        if (!$sourceId || empty($allocations)) {
            return ['success' => false, 'error' => 'sourceId and allocations are required'];
        }

        $source = $db->table('fi_entry_stock_report')->where('id', $sourceId)->get()->getRowArray();
        if (!$source) {
            return ['success' => false, 'error' => 'Source entry not found'];
        }

        $sign = $source['stock'] < 0 ? -1 : 1;
        $userId = $data['UserId'] ?? $data['userId'] ?? 0;

        $db->transStart();
        foreach ($allocations as $allocation) {
            $db->table('fi_entry_stock_report')->insert([
                'purchase_info_id' => $source['purchase_info_id'],
                'reciving_plant_code' => $allocation['reciving_plant_code'],
                'sales_plant_code' => $source['sales_plant_code'],
                'customer_code' => $source['customer_code'],
                'customer_name' => $source['customer_name'],
                'sales_order_no' => $source['sales_order_no'],
                'stock' => $sign * abs((float) $allocation['stock']),
                'created_by' => $userId,
                'status' => 1,
            ]);
        }

        $allocatedTotal = $db->table('fi_entry_stock_report')
            ->selectSum('ABS(stock)', 'allocated')
            ->where('sales_order_no', $source['sales_order_no'])
            ->where('reciving_plant_code IS NOT NULL', null, false)
            ->where('sales_plant_code IS NOT NULL', null, false)
            ->get()->getRowArray();

        if ((float) ($allocatedTotal['allocated'] ?? 0) >= abs((float) $source['stock'])) {
            $db->table('fi_entry_stock_report')
                ->where('id', $sourceId)
                ->update(['status' => 2, 'updated_by' => $userId]);
        }
        $db->transComplete();

        if ($db->transStatus() === false) {
            return ['success' => false, 'error' => 'Transaction failed'];
        }
        return ['success' => true];
    }
    public function Migo501ReversalList()
    {
        $builder = db_connect()->table('purchase_info');

        $builder->select('*')
                ->where('MIGOApprovalDt >=', date('Y-m-d') . ' 00:00:00')
                // ->where('MIGOApprovalDt <', date('Y-m-d', strtotime('+1 day')) . ' 00:00:00')
                ->where('VECHICAL_STATUS', 7)
                ->whereIn('VEHICLE_TYPE', ['Cm Truck', 'Cm Rake', 'Cm Container']);

        return $builder->get()->getResultArray();
    }

    public function Migo501ReversalUpdate($id)
    {
        $db = db_connect();
        $db->table('purchase_info')
            ->where('PI_REFID', $id)
            ->update(['VECHICAL_STATUS' => 6]);
        return ['success' => true];
    }
    public function getLogisticsFreightDetails($tripsheetNo)
    {
        $builder = db_connect()->table('purchase_info');

        $builder->select('purchase_info.ZPO_NUMBER AS PO_NUMBER,purchase_info.TRUCK_NO AS TRUCK_NUMBER,purchase_info.WERKS AS PLANT,purchase_info.VEHICLE_TYPE AS VEHICLE_TYPE,purchase_info.ZQTY AS QTY,rake_loading.tripsheet_no AS TRIPSHEET_NO,purchase_info.MIGO_NUM AS MIGO_NUMBER,sap_to_pp.Freight_cost AS FREIGHT_COST')
                // ->where('MIGOApprovalDt >=', date('Y-m-d') . ' 00:00:00')
                // ->where('MIGOApprovalDt <', date('Y-m-d', strtotime('+1 day')) . ' 00:00:00')
                ->join('rake_loading', 'rake_loading.purchase_info_id = purchase_info.PI_REFID', 'inner')
                ->join('sap_to_pp', 'sap_to_pp.EBELN = purchase_info.ZPO_NUMBER AND sap_to_pp.EBELP = purchase_info.PO_LINE_ITEM AND sap_to_pp.BROCKER_CODE = purchase_info.ZVENDOR_CODE AND sap_to_pp.SUPPLIER_CODE = purchase_info.ZSUPPLIER_CODE', 'inner')
                ->whereIn('purchase_info.VECHICAL_STATUS', [6,7])
                ->whereIn('purchase_info.VEHICLE_TYPE', ['Cm Rake'])
                ->where('rake_loading.tripsheet_no', $tripsheetNo);
        return $builder->get()->getResultArray();
    }
}
