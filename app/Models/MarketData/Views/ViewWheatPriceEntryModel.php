<?php

namespace App\Models\MarketData\Views;

use App\Models\BaseCgModel;

class ViewWheatPriceEntryModel extends BaseCgModel
{
  protected $table = 'view_mrc_wheat_price_entry';
  public function getLastUpdatedData($filter)
  {
    $builder = $this->db->table($this->table);
    if ($filter) {
      $lastUpdated = $this->getLastUpdatedDate($filter->supplierId);
      if ($lastUpdated) {
        $builder = $builder
          ->where('DATE(dateAdded) =', $lastUpdated)
          ->where('supplierId', $filter->supplierId)
          ->select("*");
        return $this->toCameCaseArrayResult($builder);
      }
    }
    return [];
  }

  public function getLastUpdatedDate($supplierId)
  {
    $builder = $this->db->table($this->table)
      ->where('supplierId', $supplierId)
      ->orderBy("dateAdded", "DESC")
      ->limit(1)
      ->select("DATE(dateAdded) as dateAdded");
    $first =  $builder->get()->getFirstRow();
    if ($first) {
      return $first->dateAdded;
    }
    return null;
  }
  public function search($request)
  {
    $pageSize = 50;
    $searchTxt =  $request["searchTxt"];
    $startCount =  $request["startCount"];
    if (isset($request["pageSize"])) {
      $pageSize = $request["pageSize"];
    }

    $filter = isset($request["filter"]) ? $request["filter"] : null;
$Search="";
    if (isset($searchTxt)) {
    $Search= "(WheatVariety like '%" . $searchTxt . "%'  
      or RatePerTon like '%" . $searchTxt . "%'
      or DateAdded like '%" . $searchTxt . "%'
      or SupplierName like '%" . $searchTxt . "%'
      or SupplierCategory like '%" . $searchTxt . "%'
      or LoadingDescription like '%" . $searchTxt . "%'
      or DeliveryAt like '%" . $searchTxt . "%'
      or ModeOfTransfer like '%" . $searchTxt . "%'
      or State like '%" . $searchTxt . "%'
      or Zone like '%" . $searchTxt . "%'
      or City like '%" . $searchTxt . "%'
      or SeedVariety like '%" . $searchTxt . "%'
      or Segment like '%" . $searchTxt . "%'
      or BagCode like '%" . $searchTxt . "%'
      or BagName like '%" . $searchTxt . "%'
      or date_format(DateAdded,'%Y-%m-%d') like '%" . $searchTxt . "%'
      
      )";
    }
    //echo $Search;

    $builder = $this->db->table($this->table);
    if ($filter) {
      if (isset($filter["from"]) && isset($filter["to"])) {
        $fromDate = $filter["from"];
        $toDate = $filter["to"];
        unset($filter["from"]);
        unset($filter["to"]);
        $filter['DATE(dateAdded) >='] = $fromDate;
        $filter['DATE(dateAdded) <='] = $toDate;
      }
      $builder = $builder->where($filter);
    }
    //var_dump($filter);
    $builder = $builder->where($Search);
    $total = $builder->selectCount("id")->get()->getFirstRow()->id;

    $builder = $this->db->table($this->table);
    if($Search!=""){
      $builder = $builder->where($Search);
    }
    
    if ($filter) {
      $builder = $builder->where($filter);
    }
    
    //var_dump($builder);
    $result = $this->toCameCaseArrayResult($builder->orderBy("dateAdded", "DESC")->select("*")->limit($pageSize, $startCount));
  
 // var_dump($result);
    return ["success" => 1, "results" => $result, "count" => $total];
  }
}
