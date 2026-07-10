<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class KeyloanModel extends Model
{
  public function getKeyloanData($lotid,$wheatvarietyid,$WHId,$PantId,$StorageLocationId){
//and  plantid='$PantId'
    $fetchsql = "SELECT a.Keyloan_Pledge_Id, a.lotid, a.warehouseid, a.plantid, 
    a.locationid, a.lotno, a.Wheat_Variety_Id, a.PledgeDate, a.SAP_Qty, a.SR_No, a.SR_Qty_in_MTS, 
    a.SR_Rate_Per_MT, a.SR_Value_in_Rs, a.Percent, a.SR_90_Percent_Value, a.Company, a.release_qty, a.balance_qty, 
    a.Bank_Name bankid,b.bankname as Bank_Name, a.Colleratoral_Manager, a.Loan_No, a.Loan_Amount, a.Loan_Rate_MT, a.Pledge_Value, 
    a.Pledge_Letter_Image, a.Transaction_Type, a.Loan_Status, a.LastKeyloan_Pledge_Release_Id, 
    a.KeyCompany, a.BankInterest, a.InsBy, a.InsDt, a.ModBy, a.ModDt, a.RecStatus,
    b.bankname pledge_bank_name FROM `ngw_keyloan_pledge` a left join ngw_bankmaster b on b.bankid = a.Bank_Name
    where a.warehouseid='$WHId' and a.lotid='$lotid'  and a.locationid='$StorageLocationId'
    and a.Wheat_Variety_Id='$wheatvarietyid' order by a.Keyloan_Pledge_Id desc limit 1";
    //echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getkeyloanReportlist($postData){
    // echo "test";exit();
    $Cnd=" and  a.approvestatus='1'";
    if(isset($postData->Screen)){
      if($postData->Screen=="CONFIRMATION"){
       $Cnd=" and  a.approvestatus='2'";
      }
      if($postData->Screen=="REPORT"){
       $Cnd=" and  a.approvestatus IN('1','2','3')";
      }
    }
 
    if(isset($postData->Data)){
      if(isset($postData->Data->FromDate)){
       $Cnd.=" and  date(a.InsDt)>='".$postData->Data->FromDate."'";
      }
      if(isset($postData->Data->ToDate)){
       $Cnd.=" and  date(a.InsDt)<='".$postData->Data->ToDate."'";
      }
      if(isset($postData->Data->warehouseid)){
       $Cnd.=" and  c.WH_CODE='".$postData->Data->warehouseid->value."'";
      }
      if(isset($postData->Data->locationid)){
       $Cnd.=" and  c.ID='".$postData->Data->locationid->value."'";
      }
    }
    
    /*
    $fetchsql = "SELECT date_format(a.PledgeDate,'%d-%m-%Y') as Date,a.Company ,
    b.wh_code,b.WH_NAME,c.WheatVariety,a.SR_Qty_in_MTS,a.SR_Rate_Per_MT,
    a.SR_Value_in_Rs,'Pledge' as type,a.SR_No, a.Percent, a.SR_90_Percent_Value, a.BankInterest,d.bankname as pledge_bank_name,
    IF(a.balance_qty=0,'Closed','Pending') as LoanStatus 
    FROM `ngw_keyloan_pledge` a 
    JOIN warehouse_master b ON a.warehouseid=b.wh_refid
    JOIN master_mrc_wheat_variety c ON a.Wheat_Variety_Id=c.Id
    LEFT JOIN ngw_bankmaster d on d.bankid = a.Bank_Name
    WHERE a.RecStatus='1' UNION ALL
    SELECT date_format(a.pledgereleasedate,'%d-%m-%Y') as Date,a.Company,
    b.wh_code,b.WH_NAME,c.WheatVariety,(a.release_qty*-1) as SR_Qty_in_MTS,d.SR_Rate_Per_MT,
    a.do_value as SR_Value_in_Rs,'Release' as Type,a.sr_no as SR_No ,
    a.do_90_percent_value as SR_90_Percent_Value,d.BankInterest,e.bankname as pledge_bank_name,
    IF(d.balance_qty = 0,'Closed','Pending') as LoanStatus
    FROM ngw_keyloan_do_release a 
    JOIN warehouse_master b ON a.warehouseid=b.wh_refid
    JOIN master_mrc_wheat_variety c ON a.wheat_variety_id=c.Id
    JOIN ngw_keyloan_pledge d ON a.sr_no=d.SR_No
    LEFT JOIN ngw_bankmaster e on e.bankid = d.Bank_Name
    WHERE a.RecStatus='1'"; 
    */

    $fetchsql = "SELECT
                    DATE_FORMAT(a.PledgeDate, '%d-%m-%Y') AS DATE,
                    a.Company,
                    b.wh_code,
                    b.WH_NAME,
                    a.plantid,
                    f.PLANT_NAME,
                    a.locationid,
                    e.STORAGE_LOCATION,
                    c.WheatVariety,
                    c.MaterialCode,
                    a.SR_Qty_in_MTS,
                    a.SR_Rate_Per_MT,
                    a.SR_Value_in_Rs,
                    'Pledge' AS TYPE,
                    a.SR_No as SR_No,
                    a.Loan_No,
                    a.Colleratoral_Manager,
                    a.Percent,
                    a.SR_90_Percent_Value,
                    a.BankInterest,
                    d.bankname AS pledge_bank_name,
                    IF(a.balance_qty = 0, 'Closed', 'Pending') AS LoanStatus
                FROM `ngw_keyloan_pledge` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_code
                JOIN master_mrc_wheat_variety c ON a.Wheat_Variety_Id = c.Id
                JOIN master_plant f ON a.plantid = f.ID
                JOIN master_storage e ON a.locationid = e.STORAGE_REFID
                LEFT JOIN ngw_bankmaster d ON d.bankid = a.Bank_Name
                WHERE a.RecStatus = '1'
                
                UNION ALL
                
                SELECT
                    DATE_FORMAT(a.pledgereleasedate, '%d-%m-%Y') AS DATE,
                    a.Company,
                    b.wh_code,
                    b.WH_NAME,
                    a.plantid,
                    f.PLANT_NAME,
                    a.locationid,
                    g.STORAGE_LOCATION,
                    c.WheatVariety,
                    c.MaterialCode,
                    (a.release_qty * -1) AS SR_Qty_in_MTS,
                    d.SR_Rate_Per_MT,
                    a.do_value AS SR_Value_in_Rs,
                    'Release' AS TYPE,
                    a.sr_no AS SR_No,
                    d.Loan_No AS Loan_No,
                    a.colleratoral_manager AS Colleratoral_Manager,
                    d.Percent AS Percent,
                    a.do_90_percent_value AS SR_90_Percent_Value,
                    d.BankInterest,
                    e.bankname AS pledge_bank_name,
                    IF(d.balance_qty = 0,'Closed','Pending') AS LoanStatus
                FROM
                    ngw_keyloan_do_release a
                JOIN warehouse_master b ON a.warehouseid = b.wh_code
                JOIN master_mrc_wheat_variety c ON a.wheat_variety_id = c.Id
                JOIN ngw_keyloan_pledge d ON a.sr_no = d.SR_No
                JOIN master_plant f ON a.plantid = f.ID
                JOIN master_storage g ON a.locationid = g.STORAGE_REFID
                LEFT JOIN ngw_bankmaster e ON e.bankid = d.Bank_Name
                WHERE a.RecStatus = '1' Order by SR_No, Loan_No, TYPE, DATE";

    // echo $fetchsql; exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }
  
}
