<?php

namespace App\Models\MarketData;

use App\Helpers\SessionHelper;
use App\Models\BaseCgModel;
use App\Models\MarketData\Views\ViewWheatPriceEntryModel;

class WheatPriceEntryModel extends BaseCgModel
{
  protected $table = 'market_rate_details';
  protected $primaryKey = 'marketrate_id';
  protected $allowedFields = [
    "SupplierId", "WheatVarietyId", "LoadingLocation", "ModeOfTransportId", "DeliveryAtId", "RatePerTon", "Is_Deleted", "DateAdded", "created_by", "created_at", "updated_by", "updated_at"
  ];

  public function getLastUpdatedData($filter)
  {
    $view = new ViewWheatPriceEntryModel();
    return  $view->getLastUpdatedData($filter);
  }
  public function search($filter)
  {
    $view = new ViewWheatPriceEntryModel();
    return  $view->search($filter);
  }

  public function add($record)
  {
    $res = $this->doTransaction(function () use ($record) {
      $userName = SessionHelper::getUserName();
      foreach ($record as $row) {
        $id = $this->getIdIfExist($row);
        if ($id) {
          $row->updated_by = $userName;
          $row->updated_at = date("Y-m-d H:i:s");
          $this->update($id, $row);
        } else {
          $row->created_by = $userName;
          $row->created_at = date("Y-m-d H:i:s");
          $this->insert($row);
        }
      }
    });
    return $res;
  }

  public function getIdIfExist($record)
  {
    $rs = $this->db->table($this->table)->where('DATE(DateAdded) =', date("Y-m-d"))
      ->where([
        "SupplierId" => $record->SupplierId,
        "WheatVarietyId" => $record->WheatVarietyId,
        "ModeOfTransportId" => $record->ModeOfTransportId,
        "DeliveryAtId" => $record->DeliveryAtId
      ])
      ->select("marketrate_id as id")
      ->limit(1)
      ->get()
      ->getFirstRow();
    if ($rs) {
      return $rs->id;
    }
    return null;
  }
}
