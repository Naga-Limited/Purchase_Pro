<?php
namespace App\Models;
use CodeIgniter\Model;

class BaseCgModel  extends Model
{
  public function doTransaction($execute){
    $this->db->transStart();
    $execute();
    $this->db->transComplete();
    if ($this->db->transStatus() === FALSE)
    { 
        return false;
    }
    return true;
  }

  public function getKeys($obj){
    $fst =$obj;
    $keys = array_keys($fst);
    $keyMap = [];
    foreach($keys as $key){
      $keyMap[$key]= $this->toCamelCase($key);
    }
    return $keyMap;
  }

  function getCamelCaseRow($keyMap ,$rowData){
    $row = [];
    foreach($rowData as $key=>$val){
      $row[$keyMap[$key]] = $val;
    }
    return $row;
  }
  public function toCameCaseObjectResult($builder){
    $obj = $builder->get()->getFirstRow();
    if($obj){
      $keyMap = $this->getKeys($obj);
      return $this->getCamelCaseRow($keyMap,$obj);
    }
    return $obj;
  }
  public function toCameCaseArrayResult($builder, $isResult=false){
    $arr = $isResult? $builder: $builder->get()->getResultArray();
    if($arr && count($arr)>0){
      $keyMap = $this->getKeys($arr[0]);
      $result = [];
      foreach($arr as $val){
        $row = $this->getCamelCaseRow($keyMap,$val);
        array_push($result,$row);
      }
      return $result;
    }
    return $arr;
  }
  function toCamelCase($str) {
    $i = array("-","_");
    $str = preg_replace('/([a-z])([A-Z])/', "\\1 \\2", $str);
    $str = preg_replace('@[^a-zA-Z0-9\-_ ]+@', '', $str);
    $str = str_replace($i, ' ', $str);
    $str = str_replace(' ', '', ucwords(strtolower($str)));
    $str = strtolower(substr($str,0,1)).substr($str,1);
    return $str ;
  }
}