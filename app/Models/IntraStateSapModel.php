<?php 
namespace App\Models;
use CodeIgniter\Model;

class IntraStateSapModel  extends Model
{
  public function getById($id, $emptyArrivalId, $isTruck){

    // echo "isTruck :", $isTruck;

   /*$builder =  $this->db->table("intrastate_sap_to_pp");
    $builder->select('pickSlipNo,pickSlipQty,sendingPlant,sendingStorageLocation,materialNo,segment,wheatVariety,receivingPlant,receivingStorageLoc as receivingStorageLocation,stoPoNo,deliveryNo,deliveryDate,wbEmptyWt,wbLoadWt,wbNetWt,gunnyWt,gunnyLessNetWt,bagType,no_bags,no_bags2,no_bags3');
    //$builder->join('master_plant', 'intrastate_sap_to_pp.SendingPlant = master_plant.WERKS')
    $builder->where("id",$id);
    $query = $builder->get();
    //echo $builder->error_get_last();
    return   $query->getFirstRow(); *///old Commented by brindha
  

    // Commented BY Arularasu 02-08-2022 by POnumber & Empty Vehicle Arrival Id insted of ID
    // $query = $this->db->query("select a.pickSlipNo,a.pickSlipQty,concat(a.sendingPlant,'-',b.PLANT_NAME) as sendingPlant,
    // a.sendingStorageLocation,a.materialNo,a.segment,
    // a.wheatVariety,concat(a.receivingPlant,'-',c.PLANT_NAME) as receivingPlant,a.receivingStorageLoc as receivingStorageLocation,a.stoPoNo,a.deliveryNo,a.deliveryDate,a.wbEmptyWt,
    // a.wbLoadWt,a.wbNetWt,a.gunnyWt,a.gunnyLessNetWt,a.bagType,a.bagType2,a.bagType3,a.no_bags,a.no_bags2,a.no_bags3,
    // (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType LIMIT 1) as bagTypeName,
    // (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType2 LIMIT 1) as bagType2Name,
    // (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType3 LIMIT 1) as bagType3Name
    //  from intrastate_sap_to_pp a
    //  LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
    //  LEFT JOIN master_plant c ON a.ReceivingPlant=c.WERKS
    //  where a.id='$id'"); 

    if (strtolower($isTruck) == "true"){
      $sql = "select a.pickSlipNo,a.pickSlipQty, a.GunnyLessNetWt, concat(a.sendingPlant,'-',b.PLANT_NAME) as sendingPlant,
      a.sendingStorageLocation,a.materialNo,a.segment,
      a.wheatVariety,concat(a.receivingPlant,'-',c.PLANT_NAME) as receivingPlant,a.receivingStorageLoc as receivingStorageLocation,
      a.stoPoNo,
      d.deliveryNo,d.deliveryDate,d.wbEmptyWt,
      d.wbLoadWt,d.wbNetWt,d.gunnyWt,d.gunnyLessNetWt,d.bagType,d.L1_BagType2 bagType2,d.L1_BagType3 bagType3,
      d.L1_NoofBags no_bags,d.L1_NoofBags2 no_bags2,d.L1_NoofBags3 no_bags3,
        (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=d.bagType LIMIT 1) as bagTypeName,
      (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=d.L1_BagType2 LIMIT 1) as bagType2Name,
      (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=d.L1_BagType3 LIMIT 1) as bagType3Name
      from intrastate_sap_to_pp a
      LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
      LEFT JOIN master_plant c ON a.ReceivingPlant=c.WERKS
      JOIN intrastate_warhouse_dispatch_info d ON a.PoNumber = d.PO_Number
      where a.PoNumber='$id' and d.VehicleArrivalId = '$emptyArrivalId'";
      // $query = $this->db->query($sql);
    }else{
      $sql = "select a.pickSlipNo,a.pickSlipQty,concat(a.sendingPlant,'-',b.PLANT_NAME) as sendingPlant,
      a.sendingStorageLocation,a.materialNo,a.segment,
      a.wheatVariety,concat(a.receivingPlant,'-',c.PLANT_NAME) as receivingPlant,a.receivingStorageLoc as receivingStorageLocation,a.stoPoNo,a.deliveryNo,a.deliveryDate,a.wbEmptyWt,
      a.wbLoadWt,a.wbNetWt,a.gunnyWt,a.gunnyLessNetWt,a.bagType,a.bagType2,a.bagType3,a.no_bags,a.no_bags2,a.no_bags3,
      (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType LIMIT 1) as bagTypeName,
      (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType2 LIMIT 1) as bagType2Name,
      (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType3 LIMIT 1) as bagType3Name
      from intrastate_sap_to_pp a
      LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
      LEFT JOIN master_plant c ON a.ReceivingPlant=c.WERKS
      where a.id='$id'"; 
    }

    // echo $sql;exit();
    $query = $this->db->query($sql);
    return   $query->getFirstRow();
  }

  public function getByPOLineItem($PoNumber, $PoLineItem, $VehicleArrivalId){

    /*$builder =  $this->db->table("intrastate_sap_to_pp");
     $builder->select('pickSlipNo,pickSlipQty,sendingPlant,sendingStorageLocation,materialNo,segment,wheatVariety,receivingPlant,receivingStorageLoc as receivingStorageLocation,stoPoNo,deliveryNo,deliveryDate,wbEmptyWt,wbLoadWt,wbNetWt,gunnyWt,gunnyLessNetWt,bagType,no_bags,no_bags2,no_bags3');
     //$builder->join('master_plant', 'intrastate_sap_to_pp.SendingPlant = master_plant.WERKS')
     $builder->where("id",$id);
     $query = $builder->get();
     //echo $builder->error_get_last();
     return   $query->getFirstRow(); *///old Commented by brindha
   
     /*Mohan changed query to intrastate_warehouse_dispatch for weight showing correction
     $query = $this->db->query("select a.PoNumber as pickSlipNo, a.PO_Quantity as pickSlipQty, concat(a.sendingPlant,'-',b.PLANT_NAME) as sendingPlant,
     a.sendingStorageLocation,a.materialNo,a.segment,
     a.wheatVariety,concat(a.receivingPlant,'-',c.PLANT_NAME) as receivingPlant,a.receivingStorageLoc as receivingStorageLocation,a.stoPoNo,a.deliveryNo,a.deliveryDate,a.wbEmptyWt,
     a.wbLoadWt,a.wbNetWt,a.gunnyWt,a.gunnyLessNetWt,a.bagType,a.bagType2,a.bagType3,a.no_bags,a.no_bags2,a.no_bags3,
     (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType LIMIT 1) as bagTypeName,
     (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType2 LIMIT 1) as bagType2Name,
     (SELECT BAG_NAME FROM `master_bag` where BAG_CODE=a.bagType3 LIMIT 1) as bagType3Name
      from intrastate_sap_to_pp a
      LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
      LEFT JOIN master_plant c ON a.ReceivingPlant=c.WERKS
      where a.PoNumber ='".$PoNumber."' AND a.PoLineItem ='".$PoLineItem."'");
    */
    $sql ="select a.PoNumber as pickSlipNo, 
    a.PO_Quantity as pickSlipQty, concat(a.sendingPlant,'-',b.PLANT_NAME) as sendingPlant,
    a.sendingStorageLocation,a.materialNo,a.segment,
    a.wheatVariety,concat(a.receivingPlant,'-',c.PLANT_NAME) as receivingPlant,a.receivingStorageLoc as receivingStorageLocation,a.stoPoNo,
    d.deliveryNo,d.deliveryDate,d.wbEmptyWt,
    d.wbLoadWt,d.wbNetWt,d.gunnyWt,d.gunnyLessNetWt,d.bagType,d.L1_BagType2 bagType2,d.L1_BagType3 bagType3,
    d.L1_NoofBags no_bags,d.L1_NoofBags2 no_bags2,d.L1_NoofBags3 no_bags3,
    (SELECT BAG_NAME FROM `master_bag` where BAG_REFID=d.BagType1Lot1id LIMIT 1) as bagTypeName,
    (SELECT BAG_NAME FROM `master_bag` where BAG_REFID=d.BagType2Lot1id LIMIT 1) as bagType2Name,
    (SELECT BAG_NAME FROM `master_bag` where BAG_REFID=d.BagType3Lot1id LIMIT 1) as bagType3Name,
    (SELECT BAG_CODE FROM `master_bag` where BAG_REFID=d.BagType1Lot1id LIMIT 1) as bagTypeCode,
    (SELECT BAG_CODE FROM `master_bag` where BAG_REFID=d.BagType2Lot1id LIMIT 1) as bagType2Code,
    (SELECT BAG_CODE FROM `master_bag` where BAG_REFID=d.BagType3Lot1id LIMIT 1) as bagType3Code,

    (SELECT BAG_NAME FROM `master_bag` where BAG_REFID=d.BagCuttingType1Lot1id LIMIT 1) as bagCuttingTypeName,
    (SELECT BAG_NAME FROM `master_bag` where BAG_REFID=d.BagCuttingType2Lot1id LIMIT 1) as bagCuttingType2Name,
    (SELECT BAG_NAME FROM `master_bag` where BAG_REFID=d.BagCuttingType3Lot1id LIMIT 1) as bagCuttingType3Name,
    (SELECT Name FROM master_vendor where Id=d.BagCuttingVendor1Lot1id LIMIT 1) as bagCuttingVendorName,
    (SELECT Name FROM master_vendor where Id=d.BagCuttingVendor2Lot1id LIMIT 1) as bagCuttingVendor2Name,
    (SELECT Name FROM master_vendor where Id=d.BagCuttingVendor3Lot1id LIMIT 1) as bagCuttingVendor3Name,
    d.L1_CuttingCharges, d.L1_CuttingCharges2, d.L1_CuttingCharges3,
    d.L2_CuttingCharges, d.L2_CuttingCharges2, d.L2_CuttingCharges3,
    d.L3_CuttingCharges, d.L3_CuttingCharges2, d.L3_CuttingCharges3,
    a.Freight_Charges, a.Loading_Charges, a.Unloading_Charges,a.unloading_vendor
     from intrastate_sap_to_pp a
     LEFT JOIN master_plant b ON a.SendingPlant=b.WERKS
     LEFT JOIN master_plant c ON a.ReceivingPlant=c.WERKS
     LEFT JOIN intrastate_warhouse_dispatch_info d ON d.VehicleArrivalId='$VehicleArrivalId' and a.PoNumber = d.PO_Number
     where a.PoNumber ='".$PoNumber."' AND a.PoLineItem ='".$PoLineItem."'";
    //  echo $sql;exit();
    $query = $this->db->query($sql);
    $query = $query->getFirstRow();
    $vendor_code = $query->unloading_vendor;
    if($vendor_code != 0){
      $builder = $this->db->query("SELECT Id,Name,Code FROM `master_vendor` WHERE Category ='Unloading Vendor' AND Code LIKE '%$vendor_code%' AND RecStatus='1'");
      $builder = $builder->getFirstRow();
      $query->unloading_vendor = $builder->Code;
      $query->unloading_name = $builder->Name;
      $query->unloading_id = $builder->Id;
    }
    return $query;
   }

  public function getPickSlipByReceivingPlantId($plantId){
     $query = $this->db->query("select pickSlipNo as label,id as value from intrastate_sap_to_pp sap  where
    NOT EXISTS (select pickSlipNo  from intrastate_warhouse_dispatch_info di WHERE di.pickSlipNo=sap.pickSlipNo ) 
    and ($plantId=0 or SendingPlant='$plantId')");
   /*echo "select pickSlipNo as label,id as value from intrastate_sap_to_pp sap  where
    NOT EXISTS (select pickSlipNo  from intrastate_warhouse_dispatch_info di WHERE di.pickSlipNo=sap.pickSlipNo ) 
    and ($plantId=0 or SendingPlant='$plantId')";*/
   /* $query = $this->db->query("select pickSlipNo as label,id as value from intrastate_sap_to_pp sap  where
    NOT EXISTS (select pickSlipNo  from intrastate_warhouse_dispatch_info di WHERE di.pickSlipNo=sap.pickSlipNo ) 
    and (SendingPlant=0 or SendingPlant='$plantId')");*/
    // $builder =  $this->db->table("intrastate_sap_to_pp");
    // $builder->select('pickSlipNo as label,id as value')->distinct();
    // $builder->where("receivingPlant",$plantId);
    // $query = $builder->get();
    return   $query->getResultArray();
  }
 
}
