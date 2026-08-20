<?php

namespace App\Controllers\Api\MarketData;

use App\Controllers\Api\BaseApiController;
use App\Models\MarketData\MasterModel;

class Master extends BaseApiController
{
  public function getDeliveryAt()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getDeliveryAt());
  }

  public function getLoadingLocation()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getLoadingLocation());
  }
  public function getFromLocation()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getFromLocation());
  }
  public function getToLocation()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getToLocation());
  }

  public function getModeOfTransport()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getModeOfTransport());
  }

  public function getSuppliers()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getSuppliers());
  }

  public function getSupplierCategory()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getSupplierCategory());
  }

  public function getWheatVariety()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVariety());
  }
  public function getPlants()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getPlants());
  }

  public function getWheatVarietyState()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVarietyState());
  }

  public function getWheatVarietyZone()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVarietyZone());
  }

  public function getWheatVarietyCity()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVarietyCity());
  }

  public function getWheatVarietySeed()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getWheatVarietySeed());
  }

  public function getwarehouses()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getwarehouses());
  }

  public function getmasterplant()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getmasterplant());
  }

  public function getmasterplantvalueId()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getmasterplantvalueId());
  }

  public function getuserinfo()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getuserinfo());
  }

  public function getprivilege()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getprivilege());
  }

  public function getscreenname()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getscreenname());
  }
  public function getscreenname_desc()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getscreenname_DESC());
  }
  

  public function getrolename()
  {
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getrolename());
  }
  public function getCommonActiveStatusG1(){
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getCommonActiveStatusG1());    

  }
  public function getCommonActiveStatusG2(){
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getCommonActiveStatusG2());    

  }
  public function getCommonActiveStatusG3(){
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getCommonActiveStatusG3());    

  }
  /**
   * Get warehouses for the logged-in user (session).
   * Filtered by user's plants via master_user_plant → master_plant.WH_CODE.
   * No request body needed; uses login session USERID.
   */
  public function getWarehousesByUserId()
  {
    $userId = (int) (session()->get('USERID') ?? 0);
   // echo "userId Venkat".$userId;
    //log_message('info', 'getWarehousesByUserId: USERID = ' . $userId);
    if ($userId <= 0) {
      return $this->sendErrorResult('Login required');
    }
    $master = new MasterModel();
    return $this->sendSuccessResult($master->getWarehousesByUserId($userId));
  }

  /**
   * Get material/stock list from SAP (zzgp_api/zzwh_ss/wh_stock).
   * POST body: wh_code (or warehouseid), plant, stro_loc (or storagelocationid), bin, material (optional).
   * Returns same format as Relot SAP_Lotwise_StockDetails: { success: 1, results: [...] }.
   */
  public function getMaterialList()
  {
    $postData = $this->request->getJSON();
    if (!$postData) {
      return $this->response->setStatusCode(400)->setJSON(['success' => 0, 'message' => 'Invalid or missing JSON body']);
    }

    $whCode = $this->scalarFromPost($postData->wh_code ?? $postData->warehouseid ?? '');
    $plant = $this->scalarFromPost($postData->plant ?? $postData->plantId ?? '');
    $stroLoc = $this->scalarFromPost($postData->stro_loc ?? $postData->storagelocationid ?? '');
    $bin = $this->scalarFromPost($postData->bin ?? '');
    $material = $this->scalarFromPost($postData->material ?? '');

    $master = new MasterModel();
    $results = $master->getMaterialListFromSap($whCode, $plant, $stroLoc, $bin, $material);
    return $this->response->setJSON(['success' => 1, 'results' => $results]);
  }

  /**
   * QC lot rows from receipt_material_info (non-empty qcLot and lotNo), ascending by id.
   * Optional GET filters: start_date, end_date (Y-m-d).
   */
  public function getQCLotList()
  {
    $startDate = trim((string) ($this->request->getGet('start_date') ?? $this->request->getGet('startDate') ?? ''));
    $endDate = trim((string) ($this->request->getGet('end_date') ?? $this->request->getGet('endDate') ?? ''));
    $userId = trim((string) ($this->request->getGet('userId') ?? ''));
    $master = new MasterModel();
    $results = $master->getQCLotListFromReceiptMaterial($startDate, $endDate,$userId);
    return $this->response->setJSON(['success' => 1, 'results' => $results]);
  }

  /**
   * Submit one Lot Updation row to SAP LT06/LT12 stock-move API.
   * POST body: row (object) or direct row fields.
   */
  public function submitQCLotRow()
  {
    $postData = $this->request->getJSON(true);
    if (!is_array($postData)) {
      $postData = [];
    }
    $row = (isset($postData['row']) && is_array($postData['row'])) ? $postData['row'] : $postData;

    $master = new MasterModel();
    $result = $master->submitQCLotRowToSap($row);
    return $this->response->setJSON($result);
  }

  /**
   * Submit one S&S Relot (bin/lot move) row to SAP wh_qc API.
   * POST body: row (object) or direct row fields.
   */
  public function submitRelot()
  {
    $postData = $this->request->getJSON(true);
    if (!is_array($postData)) {
      $postData = [];
    }
    $row = (isset($postData['row']) && is_array($postData['row'])) ? $postData['row'] : $postData;

    $userId = (int) (session()->get('USERID') ?? 0);
    $master = new MasterModel();
    $result = $master->submitRelotToSap($row, $userId > 0 ? $userId : null);
    return $this->response->setJSON($result);
  }

  /**
   * Delete one ss_relot_history record.
   * POST body: { id }
   */
  public function deleteRelot()
  {
    $postData = $this->request->getJSON(true);
    if (!is_array($postData)) {
      $postData = [];
    }
    $id = (int) ($postData['id'] ?? 0);

    $master = new MasterModel();
    $result = $master->deleteRelotHistory($id);
    return $this->response->setJSON($result);
  }

  /**
   * Get scalar value from POST field (object with value/label or scalar).
   */
  private function scalarFromPost($v)
  {
    if (is_object($v)) {
      return (string) ($v->value ?? $v->label ?? '');
    }
    return (string) ($v ?? '');
  }
  public function getPlantsSAP(){
    $postData = $this->request->getJSON();
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getPlantsSAP($postData->WH_CODE));    

  }
  public function getStorageLocationsSAP(){
    $postData = $this->request->getJSON();
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getStorageLocationsSAP($postData->plantId,$postData->warehouseid));    

  }
  public function getLotsSAP(){
    $postData = $this->request->getJSON();
    $master = new MasterModel();
    return  $this->sendSuccessResult($master->getLotsSAP($postData->storagelocationid,$postData->plantId,$postData->warehouseid));    

  }
  public function getMaterialListSAP()
  {
    $postData = $this->request->getJSON();
    if (!$postData) {
      return $this->response->setStatusCode(400)->setJSON(['success' => 0, 'message' => 'Invalid or missing JSON body']);
    }

    $whCode = $this->scalarFromPost($postData->wh_code ?? $postData->warehouseid ?? '');
    $plant = $this->scalarFromPost($postData->plant ?? $postData->plantId ?? '');
    $stroLoc = $this->scalarFromPost($postData->storagelocationid ?? $postData->storagelocationid ?? '');
    $bin = $this->scalarFromPost($postData->lotId ?? '');

    $master = new MasterModel();
    $results = $master->getMaterialListSAP($whCode, $plant, $stroLoc, $bin);
    return $this->response->setJSON(['success' => 1, 'results' => $results]);
  }
}
