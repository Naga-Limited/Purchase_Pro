<?php
include_once APIPATH. "/helper/sessionHelper.php";
//include DB File
include_once APIPATH. "/db_connection.php";
include_once APIPATH."/helper/appHelper.php";
$entityVAContent = json_decode(file_get_contents("php://input"));
if(false){
  echo fetchAllTruckArrivalPrint($connect, $entityVAContent);
}else if($entityVAContent->formType=="Creation" || $entityVAContent->formType=="Approval"){
echo fetchWPList($connect, $entityVAContent);
}
$connect->close();

function fetchWPList($connect, $record)
{
$CurrentTime=date("d-m-Y H:i:s")."\n";
$Debug=0;
if($Debug==1){echo $CurrentTime;}
  $ScreenName="";
  if(isset($record->ScreenName)){
  $ScreenName=$record->ScreenName;
  }
  if($Debug==1){echo $CurrentTime;}
  
  //$filters = [1];
    
  $filters = [1];
 
  array_push($filters,"a.RecStatus='1'");
if( $record->formType=="Approval"){
  array_push($filters,"a.Status='1'");
}
  if (isset($record->searchTxt)) {
    array_push($filters, "(a.weekno like '%" . $record->searchTxt . "%' 
    or a.movementgroupno like '%" . $record->searchTxt . "%'  
    or a.planqty like '%" . $record->searchTxt . "%'  
    or a.fromlotno like '%" . $record->searchTxt . "%'  
    or a.tolotno like '%" . $record->searchTxt . "%'  
    
    or a.rndconfirmqty like '%" . $record->searchTxt . "%'  
    or a.fumigationclearedqty like '%" . $record->searchTxt . "%'  
    or a.keyloandoqty like '%" . $record->searchTxt . "%'  
    or a.mixing_ratio like '%" . $record->searchTxt . "%'  
    or a.actualmvtqty like '%" . $record->searchTxt . "%'  
    or b.Segment like '%" . $record->searchTxt . "%'  
    or b.WheatVariety like '%" . $record->searchTxt . "%'  
    or c.WH_NAME  like '%" . $record->searchTxt . "%'  
    or d.PLANT_NAME  like '%" . $record->searchTxt . "%'  
    or e.description  like '%" . $record->searchTxt . "%'  
    or f.lotno  like '%" . $record->searchTxt . "%'  
    or f.totalcapacity  like '%" . $record->searchTxt . "%'  

    or g.WH_NAME  like '%" . $record->searchTxt . "%'  
    or h.PLANT_NAME  like '%" . $record->searchTxt . "%'  
    or i.description  like '%" . $record->searchTxt . "%'  
    or j.lotno  like '%" . $record->searchTxt . "%' 
     
    )");
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
   }

   
   if($record->otherfilter->WeekNo!=null && sizeof($record->otherfilter->WeekNo)>0){
    $PlantIdArray=$record->otherfilter->WeekNo;
   $PlantIdArrFilter=" (";
   for($i=0;$i<sizeof($PlantIdArray);$i++){
      $PlantIdArrFilter.="a.weekno = '".$PlantIdArray[$i]->value."' OR ";
   }
   $PlantIdArrFilter=rtrim($PlantIdArrFilter,"OR ");
   $PlantIdArrFilter.=")";
   array_push($filters,$PlantIdArrFilter);
  }

  if($record->otherfilter->WheatVarietyId!=null && sizeof($record->otherfilter->WheatVarietyId)>0){
    $PlantIdArray=$record->otherfilter->WheatVarietyId;
   $PlantIdArrFilter=" (";
   for($i=0;$i<sizeof($PlantIdArray);$i++){
      $PlantIdArrFilter.="a.wheatvarityid = '".$PlantIdArray[$i]->value."' OR ";
   }
   $PlantIdArrFilter=rtrim($PlantIdArrFilter,"OR ");
   $PlantIdArrFilter.=")";
   array_push($filters,$PlantIdArrFilter);
  }
   //var_dump($filter);
 }
 
 if($record->formType=="Creation"){
  array_push($filters," a.MovementType='MILL'");
}

  $countsql =  "select count(a.planid) as total 
  FROM `ngw_weeklyplan` a
    LEFT JOIN master_mrc_wheat_variety b ON a.wheatvarityid=b.Id
    LEFT JOIN warehouse_master c ON a.fromwarehouseid=c.WH_REFID
    LEFT JOIN master_plant d ON a.fromplantid=d.ID
    LEFT JOIN master_from_location e ON a.fromlocationid=e.id
    LEFT JOIN ngw_lot f ON a.fromlotid=f.lotid
    
    LEFT JOIN warehouse_master g ON a.towarehouseid=g.WH_REFID
    LEFT JOIN master_plant h ON a.toplantid=h.ID
    LEFT JOIN master_from_location i ON a.tolocationid=i.id
    LEFT JOIN ngw_lot j ON a.tolotid=j.lotid

  where  " . join(" AND ", $filters);
//echo $countsql;
// exit();
 
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
    "SELECT a.*,b.Segment,b.WheatVariety,c.WH_NAME as FromWH,d.PLANT_NAME as FromPlant,e.description as FromLocation,
    f.lotno as FromLotNo,f.totalcapacity as TotalCapacity,g.WH_NAME as ToWH,h.PLANT_NAME as ToPlant,
    i.description as ToLocation,j.lotno as ToLot,date_format(a.validfrom,'%d-%m-%Y') as validfrom,
    date_format(a.validto,'%d-%m-%Y') as validto,STORAGE_LOCATION
    FROM `ngw_weeklyplan` a
    LEFT JOIN master_mrc_wheat_variety b ON a.wheatvarityid=b.Id
    LEFT JOIN warehouse_master c ON a.fromwarehouseid=c.wh_code and a.fromwarehouseid<>''
    LEFT JOIN master_plant d ON a.fromplantid=d.ID
    LEFT JOIN master_from_location e ON a.fromlocationid=e.id
    LEFT JOIN master_storage k ON a.fromlocationid=k.STORAGE_REFID
    LEFT JOIN ngw_lot f ON a.fromlotid=f.lotid
    
    LEFT JOIN warehouse_master g ON a.towarehouseid=g.wh_code and a.towarehouseid<>''
    LEFT JOIN master_plant h ON a.toplantid=h.ID
    LEFT JOIN master_from_location i ON a.tolocationid=i.id
    LEFT JOIN ngw_lot j ON a.tolotid=j.lotid WHERE " 
    . join(" AND ", $filters)." order by planid limit " .
    $record->startCount .
    ",$pageSize";
    
   /*" .
    $record->startCount .
    ",$pageSize";*/
  // echo $fetchsql;exit();
  // exit();
  if($Debug==1){echo $CurrentTime;}
  $tableRecords = getResultAsObjectArray($connect, $fetchsql);
  if($Debug==1){echo $CurrentTime;}
 //var_dump($tableRecords);
 // echo "hello";
  return json_encode(["success" => 1, "results" => $tableRecords, "count" => $total]);

}

?>
