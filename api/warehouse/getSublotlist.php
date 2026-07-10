<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
if(false){
  echo fetchAllTruckArrivalPrint($connect, $entityVAContent);
}else{
echo fetchLotList($connect, $entityVAContent);
}
$connect->close();

function fetchLotList($connect, $record)
{
$CurrentTime=date("d-m-Y H:i:s")."\n";
$Debug=0;
if($Debug==1){echo $CurrentTime;}
  $ScreenName="";
  if(isset($record->ScreenName)){
  $ScreenName=$record->ScreenName;
  }
  if($Debug==1){echo $CurrentTime;}
  
  $filters = [1];

  
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.lotno like '%" . $record->searchTxt . "%' 
    or a.wheatqty like '%" . $record->searchTxt . "%'  
    OR  b.maxcapacity like '%" . $record->searchTxt . "%' 
    OR  b.totalcapacity like '%" . $record->searchTxt . "%' 
    OR  c.WH_NAME like '%" . $record->searchTxt . "%' 
    OR  c.WH_CODE like '%" . $record->searchTxt . "%'
    OR  d.Segment like '%" . $record->searchTxt . "%'
    OR  d.WheatVariety like '%" . $record->searchTxt . "%'
    OR  e.BAG_CODE like '%" . $record->searchTxt . "%'
    OR  e.BAG_NAME like '%" . $record->searchTxt . "%'
    or f.Fumigation_Type like '%" . $record->searchTxt . "%' )");
    // $includeStatus =true;
  }
  if($Debug==1){echo $CurrentTime;}
  $plantFilter = [];


 if($record->otherfilter){
   $FromDt=$record->otherfilter->from;
   $ToDt=$record->otherfilter->to;
   $PlantId=$record->otherfilter->otherfilter->PlantId;
 
  //echo $FromDt;
 
  if($FromDt!="" && $ToDt!=""){
  array_push($filters,"DATE(DateAdded) >= '".$FromDt."'");
  array_push($filters,"DATE(DateAdded) <= '".$ToDt."'");
  }
   if($PlantId!="" ){
   array_push($filters,"a.WERKS = '".$PlantId."'");
  // array_push($filters,"a.plantid = '".$PlantId."'");
   }

   
   if($record->otherfilter->PlantIdArr!=null && sizeof($record->otherfilter->PlantIdArr)>0){
    $PlantIdArray=$record->otherfilter->PlantIdArr;
   $PlantIdArrFilter=" (";
   for($i=0;$i<sizeof($PlantIdArray);$i++){
      //$PlantIdArrFilter.="a.warehouseid = '".$PlantIdArray[$i]->value."' OR ";
      $PlantIdArrFilter.="a.plantid = '".$PlantIdArray[$i]->value."' OR ";
   }
   $PlantIdArrFilter=rtrim($PlantIdArrFilter,"OR ");
   $PlantIdArrFilter.=")";
   array_push($filters,$PlantIdArrFilter);
  }
   //var_dump($filter);
 }

  $countsql =  "select count(a.sub_lot_id) as total 
  FROM `ngw_sublot` a 
    LEFT JOIN ngw_lot b ON a.lotid=b.lotid
    LEFT JOIN warehouse_master c ON a.warehouseid=c.WH_REFID
    LEFT JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
    LEFT JOIN 	master_bag e ON a.bagtypeid=e.BAG_REFID
    LEFT JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId

  where  " . join(" AND ", $filters);
 
//  echo $countsql;exit();
 
  $countData = mysqli_query($connect, $countsql);
  if($Debug==1){echo $CurrentTime;}
  $total = 0;
  //echo mysqli_error($connect);
  //exit();
  while ($crow = mysqli_fetch_assoc($countData)) {
    
    $total = $crow["total"];
  }
  if($Debug==1){echo $CurrentTime;}
  $pageSize =50;
  if(isset($record->pageSize)){
    $pageSize =$record->pageSize;
  }
  
  $fetchsql =
    "SELECT a.*,b.lotno as lotnomaster,b.maxcapacity,b.totalcapacity,c.WH_NAME,c.WH_CODE,d.Segment,d.WheatVariety,e.BAG_CODE,e.BAG_NAME,f.Fumigation_Type
    FROM `ngw_sublot` a 
    LEFT JOIN ngw_lot b ON a.lotid=b.lotid
    LEFT JOIN warehouse_master c ON a.warehouseid=c.WH_REFID
    LEFT JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
    LEFT JOIN 	master_bag e ON a.bagtypeid=e.BAG_REFID
    LEFT JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId
    where " 
    . join(" AND ", $filters)." order by InsDt limit " .
    $record->startCount .
    ",$pageSize";
    
   /*" .
    $record->startCount .
    ",$pageSize";*/
   //echo $fetchsql;exit();
  // exit();
  if($Debug==1){echo $CurrentTime;}
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  if($Debug==1){echo $CurrentTime;}
 //var_dump($tableRecords);
 // echo "hello";
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);

}

?>
