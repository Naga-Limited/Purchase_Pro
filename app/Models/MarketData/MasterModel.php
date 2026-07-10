<?php

namespace App\Models\MarketData;

use App\Helpers\SapUrlHelper;
use CodeIgniter\Model;

class MasterModel extends Model
{
  public function getDeliveryAt()
  {
    $builder = $this->db->query("select id as value, Name as label from master_mrc_delivery_at order by name");
    return  $builder->getResultArray();
  }

  public function getLoadingLocation()
  {
    $builder = $this->db->query("select id as value, Description as label, state, city from master_mrc_loading_location order by Description");
    return  $builder->getResultArray();
  }

  public function getFromLocation()
  {
    $builder = $this->db->query("SELECT id as value,city, state, description as label,description, InsBy, InsDt, ModBy, ModDt, RecStatus FROM master_from_location WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getToLocation()
  {
    $builder = $this->db->query("SELECT id as value, location,concat(location,' - ',plantId) as label,location, plantId, InsBy, InsDt, ModBy, ModDt, RecStatus FROM master_to_location WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }


  public function getModeOfTransport()
  {
    $builder = $this->db->query("select id as value, Name as label from master_mrc_mode_of_transport  order by name");
    return  $builder->getResultArray();
  }

  public function getSuppliers()
  {
    $builder = $this->db->query("select id as value, Name as label, category from master_mrc_supplier order by name");
    return  $builder->getResultArray();
  }

  public function getSupplierCategory()
  {
    $builder = $this->db->query("select distinct category as value, category as label from master_mrc_supplier order by category");
    return  $builder->getResultArray();
  }

  public function getWheatVariety()
  {
    //$builder = $this->db->query("select distinct id as value, WheatVariety as label from master_mrc_wheat_variety order by WheatVariety");
    $builder = $this->db->query("select wheat_variety_Id as value, WheatVariety as label from wheat_variety_master order by WheatVariety");
    return  $builder->getResultArray();
  }
  public function getPlants()
  {
    $builder = $this->db->query("SELECT `ID`, WERKS as value,PLANT_NAME as label,`WERKS`, `PLANT_NAME`, `WH_CODE`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `master_plant` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }

  public function getWheatVarietyState()
  {
    $builder = $this->db->query("select distinct State as value, State as label from master_mrc_wheat_variety order by State");
    return  $builder->getResultArray();
  }

  public function getWheatVarietyZone()
  {
    $builder = $this->db->query("select distinct Zone as value, Zone as label from master_mrc_wheat_variety order by zone");
    return  $builder->getResultArray();
  }
  public function getWheatVarietyCity()
  {
    $builder = $this->db->query("select distinct City as value, City as label from master_mrc_wheat_variety order by city");
    return  $builder->getResultArray();
  }
  public function getWheatVarietySeed()
  {
    $builder = $this->db->query("select distinct SeedVariety as value, SeedVariety as label from master_mrc_wheat_variety order by SeedVariety");
    return  $builder->getResultArray();
  }
  public function getwarehouses()
  {
    $builder = $this->db->query("select WH_CODE as value, concat(WH_CODE,'-', WH_NAME) as label from warehouse_master order by WH_NAME");
    return  $builder->getResultArray();
  }
  public function getmasterplant()
  {
    $builder = $this->db->query("select ID as PLANT_ID, WERKS as value, concat(WERKS,'-',PLANT_NAME) as label from master_plant order by WERKS, PLANT_NAME");
    return  $builder->getResultArray();
  }

  public function getmasterplantvalueId()
  {
    $builder = $this->db->query("select ID as value, concat(WERKS,'-',PLANT_NAME) as label, WERKS, PLANT_NAME from master_plant order by WERKS, PLANT_NAME");
    return  $builder->getResultArray();
  }

  public function getuserinfo()
  {
    $builder = $this->db->query("select UI_ID as value, LOGIN_ID as label from user_info order by LOGIN_ID");
    return  $builder->getResultArray();
  }

  public function getprivilege()
  {
    $builder = $this->db->query("select ID as value, PRIVILEGE_NAME as label from master_privilege order by PRIVILEGE_NAME");
    return  $builder->getResultArray();
  }

  public function getscreenname()
  {
    $builder = $this->db->query("select ID as value, SCREEN_NAME as label from master_screen order by SCREEN_NAME");
    return  $builder->getResultArray();
  }
  public function getscreenname_DESC()
  {
    $builder = $this->db->query("select ID as value, SCREEN_DESC as label from master_screen order by SCREEN_NAME");
    return  $builder->getResultArray();
  }

  public function getrolename()
  {
    $builder = $this->db->query("select RM_REFID as value, ROLE_NAME as label from master_role order by ROLE_NAME");
    return  $builder->getResultArray();
  }
  public function getCommonActiveStatusG1()
  {
    $builder = $this->db->query("select id as value, label from activestatus where ListGroup = 'G1' order by label");
    return  $builder->getResultArray();
  }
  public function getCommonActiveStatusG2()
  {
    $builder = $this->db->query("select id as value, label from activestatus where ListGroup = 'G2' order by label");
    return  $builder->getResultArray();
  }
  public function getCommonActiveStatusG3()
  {
    $builder = $this->db->query("select id as value, label from activestatus where ListGroup = 'G3' order by label");
    return  $builder->getResultArray();
  }
    /**
   * Get warehouses allowed for the given login user.
   * Uses master_user_plant (user's plant IDs) → master_plant (WH_CODE) → warehouse_master (same WH_CODE).
   * Returns only warehouses whose WH_CODE matches plants assigned to the user.
   *
   * @param int $userId Login user ID (e.g. from session or request)
   * @return array Same format as getwarehouses: [ ['value' => WH_CODE, 'label' => 'WH_CODE-WH_NAME'], ... ]
   */
  public function getWarehousesByUserId($userId)
  {
    $userId = (int) $userId;
    // User ID 1: list all warehouses
    if ($userId === 1) {
      return $this->db->query(
        "SELECT WH_CODE AS value, CONCAT(WH_CODE, '-', WH_NAME) AS label FROM warehouse_master ORDER BY WH_NAME"
      )->getResultArray();
    }
    $sql = "SELECT w.WH_CODE AS value, CONCAT(w.WH_CODE, '-', w.WH_NAME) AS label
            FROM warehouse_master w
            INNER JOIN master_plant p ON p.WH_CODE = w.WH_CODE AND p.RecStatus = '1'
            WHERE p.ID IN (SELECT PLANT_ID FROM master_user_plant WHERE USER_ID = ? AND RecStatus = 1)
            ORDER BY w.WH_NAME";
    $builder = $this->db->query($sql, [$userId]);
    return $builder->getResultArray();
  }

  /**
   * Get material/stock list from SAP (zzgp_api/zzwh_ss/wh_stock).
   *
   * @param string $whCode Warehouse code
   * @param string $plant Plant code
   * @param string $stroLoc Storage location
   * @param string $bin Bin
   * @param string $material Material (optional)
   * @return array List of rows from SAP
   */
  public function getMaterialListFromSap($whCode, $plant, $stroLoc, $bin, $material = '')
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_stock?sap-client=900&wh_code=" . urlencode((string) $whCode)
      . "&plant=" . urlencode((string) $plant)
      . "&stro_loc=" . urlencode((string) $stroLoc)
      . "&bin=" . urlencode((string) $bin)
      . "&material=" . urlencode((string) $material);
    $sapResult = SapUrlHelper::getWhDatas($urlPath);
    return $this->extractSapResultsArray($sapResult);
  }

  /**
   * Get QC lot update list from SAP (zzgp_api/zzwh_ss/wh_qc) via GET query.
   *
   * @param string $qaLot QA Lot number
   * @return array List of rows from SAP
   */
  public function getQCLotListFromSap($qaLot)
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_qc?sap-client=900&qa_lot=" . urlencode((string) $qaLot);
    $sapResult = SapUrlHelper::getWhDatas($urlPath);
    return $this->extractSapResultsArray($sapResult);
  }
  public function getQCLotListSap($material,$plant,$whCode)
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_stock?sap-client=900&wh_code=" . urlencode((string) $whCode) . "&plant=" . urlencode((string) $plant) . "&material=" . urlencode((string) $material);
    // print_r($urlPath);exit; // Debug log for SAP lot list URL
    $sapResult = SapUrlHelper::getWhDatas($urlPath);
    // print_r($sapResult);exit; // Debug log for SAP lot list result
    return $this->extractSapResultsArray($sapResult);
  }
  /**
   * Get QC lot update list from receipt_material_info, enriched from SAP wh_qc (qa_lot) per row.
   * Rows must have non-empty qcLot and a non-empty lot (lotNo or batchCode).
   * Optional date filters apply on rmi.createdAt (Y-m-d).
   *
   * @return array Rows include SAP_STATUS and SAP_QC_CODE when SAP returns data.
   */
  public function getQCLotListFromReceiptMaterial($startDate = '', $endDate = '',$userId = '')
  {
    $sql = "SELECT
              rmi.poNumber AS PO_NO,
              rmi.migoNumber AS GRN_NO,
              rmi.material AS MATERIAL,
              rmi.materialDescription AS MATERIAL_DESC,
              rmi.plantCode AS PLANT,
              rmi.whCode AS WH_CODE,
              rmi.storageLocation AS STO_LOC,
              rmi.toNo AS TO_NO,
              rmi.toLine AS TO_LINE,
              rmi.batchCode AS BATCH,
              CASE rmi.status
                WHEN 1 THEN 'Need to QA'
                WHEN 2 THEN 'Waiting for QA'
                WHEN 3 THEN 'Released'
                ELSE 'Need to QA'
              END AS INSPECTION_STATUS,
              rmi.qcLot AS QA_LOT,
              COALESCE(rmi.lotNo, rmi.batchCode) AS LOT_NO,
              rmi.receivedQty AS RECEIVING_QTY,
              rmi.uom AS UOM,
              rmi.grnQty AS COMPLETED_QTY,
              rmi.openQty AS OPENING_QTY,
              rmi.poRate AS GROSS_PRICE,
              rmi.poQty AS PO_QTY,
              rmi.vendorName AS VENDOR_NAME,
              rmi.id AS ID,
              DATE_FORMAT(rmi.createdAt, '%d-%m-%Y') AS CREATED_AT  
            FROM receipt_material_info AS rmi

            WHERE rmi.status <> 0
              AND TRIM(COALESCE(rmi.qcLot, '')) <> ''
              AND TRIM(COALESCE(rmi.lotNo, rmi.batchCode, '')) <> ''
              AND lotUpdationStatus = 0";

    $params = [];
    $startDate = trim((string) $startDate);
    $endDate = trim((string) $endDate);
     // User Plant Filter
    if (!empty($userId) ) {

    $plantCodes = array_column(
        $this->db->table('master_user_plant mup')
            ->select('mp.WERKS AS PlantCode')
            ->join('master_plant mp', 'mp.ID = mup.PLANT_ID')
            ->where('mup.USER_ID', $userId)
            ->get()
            ->getResultArray(),
        'PlantCode'
    );

    if ($plantCodes) {
        $sql .= " AND rmi.plantCode IN (" . implode(',', array_fill(0, count($plantCodes), '?')) . ")";
        $params = array_merge($params, $plantCodes);
    }
   }

    if ($startDate !== '' && $endDate !== '') {
      $sql .= " AND DATE(rmi.createdAt) BETWEEN ? AND ?";
      $params[] = $startDate;
      $params[] = $endDate;
    } elseif ($startDate !== '') {
      $sql .= " AND DATE(rmi.createdAt) >= ?";
      $params[] = $startDate;
    } elseif ($endDate !== '') {
      $sql .= " AND DATE(rmi.createdAt) <= ?";
      $params[] = $endDate;
    }

    $sql .= " ORDER BY rmi.id ASC";
    if($startDate == ''){
      $sql .= " LIMIT 50"; // Limit to 100 rows for performance; adjust as needed
    }
    // print_r($sql);exit; // Debug log for SQL query
    $rows = $this->db->query($sql, $params)->getResultArray();
    return $this->mergeWhQcSapIntoReceiptRows($rows);
  }

  /**
   * Push one Lot Updation row to SAP LT06/LT12 movement API (wh_stock).
   *
   * @param array<string, mixed> $row
   * @return array<string, mixed>
   */
  public function submitQCLotRowToSap(array $row): array
  {
    $pick = static function (array $src, array $keys, $default = '') {
      foreach ($keys as $k) {
        if (array_key_exists($k, $src) && $src[$k] !== null && $src[$k] !== '') {
          return (string) $src[$k];
        }
      }
      return (string) $default;
    };

    $quantity = $pick($row, ['quantity', 'QUANTITY', 'RECEIVING_QTY', 'receivedQty'], '1');
    $payloadRow = [
      'wh_code'  => $pick($row, ['wh_code', 'WH_CODE', 'whCode'], 'SS1'),
      'plant'    => $pick($row, ['plant', 'PLANT', 'plantCode'], ''),
      'sto_loc'  => $pick($row, ['sto_loc', 'STO_LOC', 'storageLocation'], 'CP04'),
      'material' => $pick($row, ['material', 'MATERIAL'], ''),
      'quantity' => $quantity === '' ? '1' : $quantity,
      'uom'      => $pick($row, ['uom', 'UOM'], ''),
      'po_no'    => $pick($row, ['po_no', 'PO_NO', 'poNumber'], ''),
      'to_lot'   => $pick($row, ['to_lot', 'TO_LOT', 'LOT_NO', 'lotNo'], ''),
      'to_no'    => $pick($row, ['to_no', 'TO_NO', 'toNo'], ''),
      'to_line'  => $pick($row, ['to_line', 'TO_LINE', 'toLine'], ''),
      'batch'    => $pick($row, ['batch', 'BATCH', 'batchCode'], ''),
      'qc_lot'   => $pick($row, ['qc_lot', 'QC_LOT', 'QA_LOT', 'qcLot'], ''),
    ];

    $missing = [];
    foreach (['plant', 'material', 'uom', 'po_no', 'to_lot', 'to_no', 'to_line', 'qc_lot'] as $req) {
      if (trim((string) $payloadRow[$req]) === '') {
        $missing[] = $req;
      }
    }
    if ($missing !== []) {
      return [
        'success' => 0,
        'message' => 'Missing required fields for SAP push: ' . implode(', ', $missing),
        'payload' => $payloadRow,
      ];
    }

    $urlPath = '/zzgp_api/zzwh_ss/wh_stock?sap-client=900';
    $body = json_encode([$payloadRow], JSON_UNESCAPED_UNICODE);
    $payloadJson = $body === false ? '[]' : $body;
    // wh_stock requires CSRF token + cookie handshake; PushToSap handles that.
    $sapRaw = SapUrlHelper::PushToSap($urlPath, $payloadJson);
        // print_r($sapRaw);exit; // Debug log before SAP push
    $sapDecoded = is_string($sapRaw) ? json_decode($sapRaw, true) : $sapRaw;
    $sapText = is_string($sapRaw) ? $sapRaw : json_encode($sapRaw);
    $sapTextUpper = strtoupper((string) $sapText);
    // $message = $sapDecoded['message'] ?? '';
    $message = $sapDecoded[0]->MESSAGE ?? '';
    $STATUS = $sapDecoded[0]->STATUS ?? '';
    $isSapFailure =
      $sapRaw === false ||
      $sapRaw === null ||
      strpos($sapTextUpper, 'CSRF TOKEN VALIDATION FAILED') !== false ||
      strpos($sapTextUpper, 'FORBIDDEN') !== false ||
      strpos($sapTextUpper, 'UNAUTHORIZED') !== false ||
      strpos($sapTextUpper, 'HTTP/1.1 4') !== false ||
      strpos($sapTextUpper, 'HTTP/1.1 5') !== false;

    if ($isSapFailure || $STATUS == 0) {
      return [
        'success' => 0,
        'message' => 'SAP submission failed - ' . ($message !== '' ? $message : 'Unknown error'),
        'payload' => $payloadRow,
        'sap_response' => $sapDecoded ?? $sapRaw,
      ];
    }else{
       $CurrentDateTime=date("Y-m-d H:i:s");
       $update = $this->db->table("receipt_material_info")
        ->set(['lotUpdationStatus'=> 1,
        'lotUpdationAt'=>$CurrentDateTime,
        'qcCheckAt'=>$row['QC_DATE'] ?? $CurrentDateTime])
        ->where('id', $row['ID'])
        ->update();
      if(!$update){
        return [
          'success' => 0,
          'message' => 'Failed to update lotUpdationStatus in database after SAP submission',
          'payload' => $payloadRow,
          'sap_response' => $sapDecoded ?? $sapRaw,
        ];
      }
      return [
        'success' => 1,
        'message' => 'Submitted to SAP successfully',
        'payload' => $payloadRow,
        'sap_response' => $sapDecoded ?? $sapRaw,
      ];
    }
  }

  /**
   * For each receipt row, call zzgp_api/zzwh_ss/wh_qc?qa_lot=… (cached per qa_lot) and attach SAP STATUS / QC_CODE.
   *
   * @param array<int, array<string, mixed>> $rows
   * @return array<int, array<string, mixed>>
   */
  private function mergeWhQcSapIntoReceiptRows(array $rows): array
  {
    $sapByQaLot = [];
    $sapByStockLot = [];

    foreach ($rows as &$row) {
     
      $qaLot = trim((string) ($row['QA_LOT'] ?? ''));
      $material = trim((string) ($row['MATERIAL'] ?? ''));
      $plant = trim((string) ($row['PLANT'] ?? ''));
      if ($qaLot === '') {
        $row['SAP_STATUS'] = '';
        $row['SAP_QC_CODE'] = '';
        continue;
      }

      if (!array_key_exists($qaLot, $sapByQaLot)) {
        $sapByQaLot[$qaLot] = $this->getQCLotListFromSap($qaLot);
      }
       if (!empty($material)) {
        $sapByStockLot[$material] = $this->getQCLotListSap($material,$plant,$row['WH_CODE'] ?? '');
      }
      $sapRow = $this->pickSapQcRow($sapByQaLot[$qaLot], (string) ($row['LOT_NO'] ?? ''));
      // $sapRow1 = $this->pickSapLotRow($sapByStockLot[$material],$material);
      // print_r($sapRow);exit; // Debug log for picked SAP QC row
      if ($sapRow !== null) {
        $row['SAP_STATUS'] = (string) ($sapRow['STATUS'] ?? $sapRow['status'] ?? '');
        $row['SAP_QC_CODE'] = (string) ($sapRow['QC_CODE'] ?? $sapRow['qc_code'] ?? '');
        $row['QC_DATE'] = (string)(
            isset($sapRow['QC_DATE'])
                ? trim($sapRow['QC_DATE'] . ' ' . ($sapRow['QC_TIME'] ?? ''))
                : ($sapRow['qc_date'] ?? '')
        );
      } else {
        $row['SAP_STATUS'] = '';
        $row['SAP_QC_CODE'] = '';
        $row['QC_DATE'] = '';
      }
    }
    unset($row);

    return $rows;
  }

  /**
   * Choose SAP wh_qc line: match LOT_NO to receipt lot when multiple rows returned.
   *
   * @param array<int, mixed> $sapRows
   */
  private function pickSapQcRow(array $sapRows, string $receiptLotNo): ?array
  {
    $sapRows = array_values(array_filter($sapRows, static function ($r) {
      return is_array($r);
    }));

    if ($sapRows === []) {
      return null;
    }

    $want = trim($receiptLotNo);
    if ($want !== '') {
      foreach ($sapRows as $sr) {
        $lot = isset($sr['LOT_NO']) ? trim((string) $sr['LOT_NO']) : '';
        if ($lot === '') {
          $lot = isset($sr['lot_no']) ? trim((string) $sr['lot_no']) : '';
        }
        if ($lot !== '' && $want !== '' && (string) $lot === (string) $want) {
          return $sr;
        }
      }
    }

    /** @var array<string, mixed> */
    return $sapRows[0];
  }
 private function pickSapLotRow(array $sapRows, string $material): ?array
  {
      $sapRows = array_values(array_filter($sapRows, static function ($r) {
          return is_array($r);
      }));

      if ($sapRows === []) {
          return null;
      }

      // Get unique BIN values
      $bins = [];
      foreach ($sapRows as $row) {
          $bin = trim((string)($row['BIN'] ?? ''));
          if ($bin !== '') {
              $bins[] = $bin;
          }
      }

      $uniqueBins = implode(', ', array_unique($bins));

      $want = trim($material);

      if ($want !== '') {
          foreach ($sapRows as $sr) {
              $lot = trim((string)($sr['BIN'] ?? ''));

              if ($lot !== '' && $lot === $want) {
                  $sr['BIN_LIST'] = $uniqueBins; // Add concatenated BIN list
                  return $sr;
              }
          }
      }

      $sapRows[0]['BIN_LIST'] = $uniqueBins;
      return $sapRows[0];
  }
  /**
   * Normalize SAP/OData response to a plain array of rows.
   *
   * @param mixed $sapResult Raw response from SapUrlHelper::getWhDatas
   * @return array
   */
  private function extractSapResultsArray($sapResult)
  {
    if ($sapResult === null || $sapResult === false) {
      return [];
    }
    $decoded = is_string($sapResult) ? json_decode($sapResult, true) : $sapResult;
    if (is_array($decoded) && isset($decoded[0]) && is_array($decoded[0])) {
      return $decoded;
    }
    if (is_array($decoded) && isset($decoded['results']) && is_array($decoded['results'])) {
      return $decoded['results'];
    }
    if (is_array($decoded) && isset($decoded['d']['results']) && is_array($decoded['d']['results'])) {
      return $decoded['d']['results'];
    }
    if (is_array($decoded) && isset($decoded['d']) && is_array($decoded['d'])) {
      $d = $decoded['d'];
      if (isset($d['results']) && is_array($d['results'])) {
        return $d['results'];
      }
      if (isset($d[0])) {
        return $d;
      }
    }
    return [];
  }
  public function getPlantsSAP($WH_CODE)
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_stock?sap-client=900&wh_code=" . urlencode((string) $WH_CODE);
    $sapResult = SapUrlHelper::getWhDatas($urlPath);

    // Normalize various SAP/OData result shapes to a plain array of rows
    $rows = $this->extractSapResultsArray($sapResult);

    // Collect unique plant values preserving insertion order
    $plants = [];
    foreach ($rows as $item) {
      if (!is_array($item)) continue;
      $plant = '';
      if (isset($item['PLANT']) && $item['PLANT'] !== null) $plant = trim((string) $item['PLANT']);
      elseif (isset($item['plant']) && $item['plant'] !== null) $plant = trim((string) $item['plant']);
      if ($plant === '') continue;
      if (!isset($plants[$plant])) {
        $plants[$plant] = ['value' => $plant, 'label' => $plant];
      }
    }

    return array_values($plants);
  }
  public function getStorageLocationsSAP($plantId,$whCode)
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_stock?sap-client=900&wh_code=" . urlencode((string) $whCode) . "&plant=" . urlencode((string) $plantId);
    $sapResult = SapUrlHelper::getWhDatas($urlPath);
    // Normalize various SAP/OData result shapes to a plain array of rows
    $rows = $this->extractSapResultsArray($sapResult);

    // Collect unique storage location values preserving insertion order
    $storageLocations = [];
    foreach ($rows as $item) {
      if (!is_array($item)) continue;
      $stroLoc = '';
      if (isset($item['STRO_LOC']) && $item['STRO_LOC'] !== null) $stroLoc = trim((string) $item['STRO_LOC']);
      elseif (isset($item['sto_loc']) && $item['sto_loc'] !== null) $stroLoc = trim((string) $item['sto_loc']);
      if ($stroLoc === '') continue;
      if (!isset($storageLocations[$stroLoc])) {
        $storageLocations[$stroLoc] = ['value' => $stroLoc, 'label' => $stroLoc];
      }
    }
    // print_r($storageLocations);exit;
    return array_values($storageLocations);
  }
  public function getLotsSAP($stroLoc,$plantId,$whCode)
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_stock?sap-client=900&wh_code=" . urlencode((string) $whCode) . "&plant=" . urlencode((string) $plantId) . "&stro_loc=" . urlencode((string) $stroLoc);
    $sapResult = SapUrlHelper::getWhDatas($urlPath);

    // Normalize various SAP/OData result shapes to a plain array of rows
    $rows = $this->extractSapResultsArray($sapResult);
    // print_r($rows);exit;
    // Collect unique plant values preserving insertion order
    $plants = [];
    foreach ($rows as $item) {
      if (!is_array($item)) continue;
      $plant = '';
      if (isset($item['BIN']) && $item['BIN'] !== null && $item['QUANTITY'] != '0') $plant = trim((string) $item['BIN']);
      elseif (isset($item['plant']) && $item['plant'] !== null) $plant = trim((string) $item['plant']);
      if ($plant === '') continue;
      if (!isset($plants[$plant])) {
        $plants[$plant] = ['value' => $plant, 'label' => $plant];
      }
    }

    return array_values($plants);
  }
  public function getMaterialListSAP($whCode, $plant, $stroLoc, $bin)
  {
    $urlPath = "zzgp_api/zzwh_ss/wh_stock?sap-client=900&wh_code=" . urlencode((string) $whCode)
      . "&plant=" . urlencode((string) $plant)
      . "&stro_loc=" . urlencode((string) $stroLoc)
      . "&bin=" . urlencode((string) $bin);
    $sapResult = SapUrlHelper::getWhDatas($urlPath);
    // Normalize various SAP/OData result shapes to a plain array of rows
    $rows = $this->extractSapResultsArray($sapResult);

    // Collect unique plant values preserving insertion order
    $plants = [];
    foreach ($rows as $item) {
      if (!is_array($item)) continue;
      $plant = '';
      $label = '';
      if (isset($item['MATERIAL_CODE']) && $item['MATERIAL_CODE'] !== null) $plant = trim((string) $item['MATERIAL_CODE']);
      if (isset($item['MATERIAL_NAME']) && $item['MATERIAL_NAME'] !== null) $label = trim((string) $item['MATERIAL_NAME']);
      elseif (isset($item['plant']) && $item['plant'] !== null) $plant = trim((string) $item['plant']);
      if ($plant === '') continue;
      if (!isset($plants[$plant])) {
        $plants[$plant] = ['value' => $plant, 'label' => $label !== '' ? $label : $plant];
      }
    }

    return array_values($plants);
  }
}
