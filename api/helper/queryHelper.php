<?php
function getResultAsObjectArray($connect, $fetchsql)
{
  $queryData = mysqli_query($connect, $fetchsql);

  if(!$queryData){
    throw new Exception(mysqli_error($connect));
  }

  $records = [];
  $xy = 0;
  $numerictypes = array(1,2,3,4,5,8,9,246);

  if (isset($queryData) && mysqli_num_rows($queryData) > 0) {
    //echo "Test 1"; exit();
    while ($row = mysqli_fetch_assoc($queryData)) {
      //$records[$xy] = $row;
      $colidx=0;
      foreach ($row as $key => $value) {
        if(in_array($queryData->fetch_field_direct($colidx)->type,$numerictypes))
          $records[$xy][$key] = floatval($value);
        else
          $records[$xy][$key] = $value;//." " .gettype($value);
        
        $colidx++;
      }
      $xy++;
    }
  }

  //var_dump($records); exit();

  return $records;
}
function getResultAsObjectArray1($connect, $fetchsql)
{
  $queryData = mysqli_query($connect, $fetchsql);
  if(!$queryData){
    throw new Exception(mysqli_error($connect));
  }
  $records = [];
  $xy = 0;
  $numerictypes=array(1,2,3,4,5,8,9,246);
  if (isset($queryData) && mysqli_num_rows($queryData) > 0) {
    while ($row = mysqli_fetch_assoc($queryData)) {
      //$records[$xy] = $row;
      $colidx=0;
      foreach ($row as $key => $value) {
        if(in_array($queryData->fetch_field_direct($colidx)->type,$numerictypes))
        $records[$xy][$key] = floatval($value);
        else
        $records[$xy][$key] = $value;//." " .gettype($value);
        $colidx++;
      }
      $xy++;
    }
  }
  return $records;
}
function getSingleAsObject($connect, $fetchsql)
{
  $records = getResultAsObjectArray($connect, $fetchsql);
  return count($records) > 0 ? $records[0] : null;
}
function isExist($connect, $fetchsql)
{
  $records = getResultAsObjectArray($connect, $fetchsql);
  return count($records) > 0;
}
function getResultAsArray($connect, $fetchsql)
{
  $queryData = mysqli_query($connect, $fetchsql);// or trigger_error(mysqli_error($connect));
  if(!$queryData){
    throw new Exception(mysqli_error($connect));
  }
  $records = [];
  if (mysqli_num_rows($queryData) > 0) {
    while ($row = mysqli_fetch_assoc($queryData)) {
      foreach ($row as $key => $value) {
        // $records[$xy][$key] = $value;
        array_push($records, $value);
      }
      
    }
  }
  return $records;
}
function getResultAsObject($connect, $fetchsql, $field)
{
  $queryData = mysqli_query($connect, $fetchsql);
  if(!$queryData){
    throw new Exception(mysqli_error($connect));
  }
  $records = [];
  if (mysqli_num_rows($queryData) > 0) {
    while ($row = mysqli_fetch_assoc($queryData)) {
      $records[$row[$field]] = true;
    }
  }
  return $records;
}

function insertData($connect, $sql)
{
  $res =mysqli_query($connect,$sql);
  if(!$res){
    throw new Exception(mysqli_error($connect));
  }
  return $connect->insert_id;
}

function updateData($connect, $sql)
{
  $res =mysqli_query($connect,$sql);
  if(!$res){
    throw new Exception(mysqli_error($connect));
  }
  return $res;
}

function getFieldValue($connect, $sql, $defaultValue)
{
  $countData = mysqli_query($connect, $sql);
  if(!$countData){
    throw new Exception(mysqli_error($connect));
  }

  if (isset($countData) && mysqli_num_rows($countData) > 0) {
    while ($row = mysqli_fetch_assoc($countData)) {
      foreach ($row as $key => $value) {
        return $value;
      }
    }
  }
  return $defaultValue;
}

?>
