<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\InventoryAdjustmentModel;
use App\Models\Warehouse\ReportsModel;

class Reports extends BaseApiController
{

  public function getBagCuttingReport()
  {
    $postData = $this->request->getJSON();

    $model = new ReportsModel();
    $res = $model->getBagCuttingReport($postData->lotid, $postData->WheatVarietyId, $postData->whId, $postData->plantid);
    return  $this->sendSuccessResult($res);
  }

  public function getfumigationlist()
  {
    $postData = $this->request->getJSON();

    $model = new ReportsModel();
    $res = $model->getfumigationlist($postData);
    return  $this->respond([
      "results" => $res,


      "success" => 1
    ]);
  }

  public function getSublotlist()
  {
    $postData = $this->request->getJSON();
    $model = new ReportsModel();
    //Update Next Fumigation Date
    $res = $model->getSublotlist($postData);
    return  $this->respond([
      "results" => $res,
      "success" => 1
    ]);
  }


  public function getPictorialView(){
    $postData = $this->request->getJSON();
    $model = new ReportsModel();
    //Update Next Fumigation Date
    $res = $model->getPictorialViewLot($postData);

    $Array = array();
    $total = count($res);
    $TotRow = ceil($total / 5);
    $Start = 0;
    $Len = 5;

    $MaxRow = $model->getTotalRows($postData);
    $TotRow = $MaxRow[0]['TotalRow'];
    $MaximunCol = 0;

    for ($i = 0; $i < $TotRow; $i++) {
      $R = $i + 1;
      $Row = $model->getPictorialViewLot_Limit($postData, $R);

      $WarehouseDet = $model->getWarehouseDet($postData);
      $WalkwayAfterColumn = $WarehouseDet[0]['WalkwayAfterColumn'];
      //exit();

      $RowMaxColumnArray = $model->getMaxColumn($postData, $R);
      $RowMaxColumn = $RowMaxColumnArray[0]['MaxColumn'];
      if ($MaximunCol < $RowMaxColumn) {
        $MaximunCol = $RowMaxColumn;
      }
      $Array[$i] = $Row;
      $Start = $Start + 5;
    }
    //exit();
    $res1 = $model->getPictorialViewSubLot($postData);
    //  var_dump($postData->Data->warehouseid->value); exit();
    if ($postData->Data->warehouseid->value != null) {
      return  $this->respond([
        "results" => $Array,
        "Sublot" => $res1,
        "MaximumColumn" => $MaximunCol,
        "WalkwayAfterColumn" => $WalkwayAfterColumn,
        "TotRow" => $TotRow,
        "success" => 1
      ]);
    }
    // echo "Test";exit();
  }
  public function wmTargetVsActual()
  {
    $postData = $this->request->getJSON();

    $model = new ReportsModel();

    $res = $model->getPlanVsTarget($postData);

    $Dates = $model->getPlanVsTargetDates($postData);

    $ActualData = $model->getPlanVsTargetDetails($postData, $Dates);

    return  $this->respond([
      "results" => $res,
      "ActualData" => $ActualData,
      "Dates" => $Dates,
      "success" => 1
    ]);
  }
}
