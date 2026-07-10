<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class InventoryAdjustmentModel extends Model{

  public function getInventoryAdjustment($lotid,$wheatvarietyid,$WHId,$PantId){

    $fetchsql = "SELECT * FROM `ngw_physicalinventory` 
    where warehouseid='$WHId' and  plantid='$PantId' and lotid='$lotid' 
    and Wheat_Variety_Id='$wheatvarietyid' limit 1";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function SaveInventoryAdjustment($Data){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    $retval = 0;

    //var_dump($Data->formDBData); exit();
    foreach ($Data->formDBData as $row){ 
        $fetchsql = "SELECT Physical_Inventory_Id 
                      FROM `ngw_physicalinventory` 
                      where warehouseid=".$row->warehouseid." 
                      AND plantid='".$row->plantid."' 
                      AND lotid='".$row->lotid."' 
                      AND Wheat_Variety_Id='".$row->Wheat_Variety_Id."' 
                      AND locationid='".$row->locationid."' 
                      AND Status = 1 
                      AND Screentype='".$row->Screentype."' limit 1";
        $builder =  $this->db->query($fetchsql);
        $Tmprow = $builder->getResultArray();

        //var_dump($Tmprow); exit();
        // echo "X".sizeof($Tmprow)."X";
        
        if($Tmprow[0] !==null and isset($Tmprow[0])){
          $row->ModBy=$SessionUser;
          $row->ModDt=$CurrentDateTime;

          if($Data->formType="InventoryAdjustEntry"){
            $row->Status = 1;
            $row->apiaentryby=$SessionUser;
            $row->apiaentrydate=$CurrentDateTime;
          }

          if($Data->formType="WMInventoryAdjustEntry"){
            $row->Status = 1;
            $row->wmentryby=$SessionUser;
            $row->wmpiaentrydate=$CurrentDateTime;
          }

          /*Approve/Reject options available in api/inventoryadjust.php
          if($Data->formType="InventoryAdjustmentApproval")
          {
            $row->Status = 2;
            $row->apiaapprvby=$SessionUser;
            $row->apiaapprvdate=$CurrentDateTime;
          }
          if($Data->formType="WMInventoryAdjustmentApproval")
          {
            $row->Status = 2;
            $row->wmpiaapprvby=$SessionUser;
            $row->wmpiaapprvdate=$CurrentDateTime;
          }
          if($Data->formType="WMACInventoryAdjustmentApproval")
          {
            $row->Status = 3;
            $row->acwmpiaapprvby=$SessionUser;
            $row->acwmpiaapprvdate=$CurrentDateTime;
          }
          */
          $retval = $this->updateInventoryAdjustment($Tmprow[0]['Physical_Inventory_Id'], $row);
          $retval = 1;
        }else{
          $row->Status = 1;
          $row->InsBy = $SessionUser;;
          $row->InsDt = $CurrentDateTime;
          $row->ModBy=$SessionUser;
          $row->ModDt=$CurrentDateTime;
          if($Data->formType="InventoryAdjustEntry"){
            $row->apiaentryby=$SessionUser;
            $row->apiaentrydate=$CurrentDateTime;
          }
          if($Data->formType="WMInventoryAdjustEntry"){
            $row->wmentryby=$SessionUser;
            $row->wmpiaentrydate=$CurrentDateTime;
          }
          $retval = $this->insertInventoryAdjustment($row);
          $retval = 1;
        }
      }
    return $retval;
  }

  public function insertInventoryAdjustment($Data){
    unset($Data->init_lot_qty);
    // var_dump($Data); exit();
    $this->db->table('ngw_physicalinventory')->set($Data)->insert();
    //  echo "S3";
    $InsId=$this->insertID();
    return $InsId;
  }

  public function updateInventoryAdjustment($Physical_Inventory_Id, $Data){
    $this->db->table('ngw_physicalinventory')->set($Data)->where('Physical_Inventory_Id',$Physical_Inventory_Id)->update();
    $InsId=$Physical_Inventory_Id;
    return $InsId;
  }
}
