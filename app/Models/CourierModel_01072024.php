<?php 
namespace App\Models;
use CodeIgniter\Model;
$db      = \Config\Database::connect();
class CourierModel extends Model
{
    public function getCourierCompanyid(){
        $builder = $this->db->query(" SELECT id as value,courier_name as label FROM cuorier_master" );
        return  $builder->getResultArray();
    }

    public function GetEmployeeName($plant_code){
     
      if ($plant_code != '') {
        
        $splitnumber = $plant_code;     
        $splittedNumbers = explode(",", $splitnumber);      
        $numbers = "'" . implode("', '", $splittedNumbers) ."'";  
        $plants = "($numbers)";
        $builder=$this->db->query(" SELECT emp_id as value,concat(emp_name,'-',emp_mobile_number) as label FROM employee_master where plant_code in $plants");
        }
        else if($plant_code == ''){
      $builder=$this->db->query(" SELECT   emp_id as value,concat(emp_name,'-',emp_mobile_number) as label  FROM employee_master ");
        }
      return $builder->getResultArray();
    }
    public function getdelivery_Employee(){
      $builder = $this->db->table("courier_table");
      $builder=$builder->select("courier_table.id as value,employee_master.emp_name as label");
      $builder = $builder->join('employee_master', 'courier_table.employee_id = employee_master.emp_id', 'inner');
      $builder=$builder->where("courier_table.status",1);
      return  $builder->distinct()->get()->getResultArray();

    }
    public function getGateid($id){
      $builder=  $this->db->table("user_info");
      $builder=$builder->select("master_gate.gateCode");
      $builder = $builder->join('master_gate','user_info.masterGateId = master_gate.id','inner');
      $builder=$builder->where("user_info.UI_ID",$id);
      return  $builder->distinct()->get()->getResultArray();
    }

    public function getCourierDetailsById($id) {
      $fetchsql = "SELECT `id`, `courier_name`, `status`, `created_by`, `created_at`, `updated_by`, `updated_at` FROM `cuorier_master` WHERE  `Status`='1' AND Id='$id' ";
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
     }

     public function getEmployeeDetails($employeename){
      $builder=$this->db->query("SELECT  `emp_designation`, `emp_department`,`emp_division`,  `emp_mobile_number`,  `emp_mail_id`, `emp_code`,`emp_id`   FROM `employee_master` WHERE emp_id ='$employeename'");

      return $builder->getResultArray();
    }  public function getdeliveryEmployeeDetails($employeename){
      $builder = $this->db->table("courier_table");
      $builder=$builder->select("courier_table.id,courier_table.empolyee_code,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id");
      $builder = $builder->join('employee_master', 'courier_table.empolyee_code = employee_master.emp_code', 'left');
      $builder=$builder->where("courier_table.id",$employeename);
      return  $builder->distinct()->get()->getResultArray();
    }  

    public function GetReceiver($plant_code){
     
      if ($plant_code != '') {
        $splitnumber = $plant_code; 
        $splittedNumbers = explode(",", $splitnumber);     
        $numbers = "'" . implode("', '", $splittedNumbers) ."'";  
        $plants = "and employee_master.plant_code in ($numbers)";
      }
      else if($plant_code == ''){$plants='';}
      $builder = $this->db->table("courier_table");
      $builder = $builder->select("courier_table.id,courier_table.department,courier_table.return_count,courier_table.division,courier_table.no_of_courier,courier_table.empolyee_code,courier_table.transcation_unique_no,,courier_table.total_no_of_couriers,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id,employee_master.emp_id");
      $builder = $builder->join('employee_master', 'courier_table.empolyee_code = employee_master.emp_code', 'left');
      $builder =  $builder->where("courier_table.status = 1 $plants");
      
      return  $builder->distinct()->orderBy("courier_table.empolyee_code")->get()->getResultArray();
    } 
 public function getReceiverdetails($fromDate,$toDate,$plant_code){
  if ($plant_code != '') {    
    $splitnumber = $plant_code;   
    $splittedNumbers = explode(",", $splitnumber);      
    $numbers = "'" . implode("', '", $splittedNumbers) ."'";  
    $plants = "and employee_master.plant_code in ($numbers)";
    }
  $fDate = date("Y-m-d", strtotime($fromDate) );
  $tDate = date("Y-m-d", strtotime($toDate) );
      $builder = $this->db->table("courier_table");
      $builder = $builder->select("courier_table.id,courier_table.department,courier_table.return_count,courier_table.division,courier_table.no_of_courier,courier_table.empolyee_code,courier_table.status,courier_table.transcation_unique_no,employee_master.emp_name,employee_master.emp_mobile_number,IF(courier_table.status=1,'Yet To Deliver',IF(courier_table.status=2,'Delivered',IF(courier_table.status=3,'Deleted',''))) as status");
      $builder = $builder->join('employee_master', 'courier_table.employee_id = employee_master.emp_id', 'left');
      $builder =  $builder->where("courier_table.status = 1 $plants");

      $builder->where("DATE_FORMAT(courier_table.created_at,'%Y-%m-%d') >=", $fDate);
      $builder->where("DATE_FORMAT(courier_table.created_at,'%Y-%m-%d') <=", $tDate);
      return  $builder->distinct()->orderBy("courier_table.empolyee_code")->get()->getResultArray();
    } 
    // public function getReceiverdetail($fromDate,$toDate,$plant_code){
    //   //print_r($plant_code);exit;
    //   if ($plant_code != '') {    
    //     $splitnumber = $plant_code;   
    //     $splittedNumbers = explode(",", $splitnumber);      
    //     $numbers = "'" . implode("', '", $splittedNumbers) ."'";  
    //     $plants = " and employee_master.plant_code in ($numbers)";
    //     }
        
    //   $fDate = date("Y-m-d", strtotime($fromDate) );
    //   $tDate = date("Y-m-d", strtotime($toDate) );
    //   $builder = $this->db->table("courier_table");
    //   $builder = $builder->select("courier_table.id,courier_table.department,courier_table.return_count,courier_table.division,courier_table.no_of_courier,courier_table.empolyee_code,courier_table.status,courier_table.transcation_unique_no,courier_details.courier_company_id,courier_details.courier_from,courier_details.entry_date,courier_details.bulk_count,employee_master.emp_name,employee_master.emp_mobile_number,cuorier_master.courier_name,IF(courier_details.redirect_status=2,'Redirected',IF(courier_details.redirect_status=4,'REMOVED',IF(courier_details.status=1,'Yet To Deliver',IF(courier_details.status=2,'Delivered',IF(courier_details.status=3,'Deleted',''))))) as status");
    //   $builder = $builder->join('employee_master', 'courier_table.employee_id = employee_master.emp_id', 'left');
    //   $builder = $builder->join('courier_details', 'courier_details.courier_transcation_id =  courier_table.id', 'inner');
    //   $builder = $builder->join('cuorier_master', 'cuorier_master.id = courier_details.courier_company_id', 'inner');
    //   $builder =  $builder->where("courier_table.status < 4 $plants");
    //   $builder->where("DATE_FORMAT(courier_details.created_at,'%Y-%m-%d') >=", $fDate);
    //   $builder->where("DATE_FORMAT(courier_details.created_at,'%Y-%m-%d') <=", $tDate);
    //   return  $builder->distinct()->orderBy("courier_table.empolyee_code")->get()->getResultArray();
    // } 
    public function getReceiverdetail($fromDate, $toDate, $plant_code) {
      if ($plant_code != '') {
          $splitnumber = $plant_code;
          $splittedNumbers = explode(",", $splitnumber);
          $numbers = "'" . implode("', '", $splittedNumbers) . "'";
          $plants = " AND c.plant_code IN ($numbers)";
      }
      $fDate = date("Y-m-d", strtotime($fromDate));
      $tDate = date("Y-m-d", strtotime($toDate));
  
      $fetchsql = "SELECT a.id, a.department, a.return_count, a.division, 
                          a.no_of_courier, a.empolyee_code, a.status, 
                          a.transcation_unique_no, b.courier_company_id, b.courier_from, 
                          b.entry_date,a.received_by, b.bulk_count, c.emp_name, 
                          c.emp_mobile_number, d.courier_name, 
                          IF(b.bulk_count IS NULL,1,IF(b.bulk_count IS NOT NULL,b.bulk_count,''))AS row_bulk_count,
                          IF(a.check_box_value=0,'-',
                            IF(a.check_box_value=1,c.emp_name,IF(a.check_box_value=2,e.emp_name,''))) AS received_person_name,
                          IF(b.redirect_status = 2, 'Redirected', 
                              IF(b.redirect_status = 4, 'REMOVED', 
                                  IF(b.status = 1, 'Yet To Deliver', 
                                      IF(b.status = 2, 'Delivered', 
                                          IF(b.status = 3, 'Deleted','')
                                      )
                                  )
                              )
                          ) 
                         
                          AS status
                  FROM `courier_table` a 
                  LEFT JOIN employee_master c ON a.employee_id = c.emp_id
                  LEFT JOIN employee_master e ON a.received_by = e.emp_id
                  INNER JOIN courier_details b ON b.courier_transcation_id = a.id
                  INNER JOIN cuorier_master d ON d.id = b.courier_company_id
                  WHERE a.status < 4 $plants
                  AND DATE_FORMAT(b.created_at, '%Y-%m-%d') >= '$fDate'
                  AND DATE_FORMAT(b.created_at, '%Y-%m-%d') <= '$tDate'
                  ORDER BY a.id";
$builder = $this->db->query($fetchsql);
      
      return $builder->getResultArray();
  }
   public function getReceiverDetailsById($id) {
       $builder = $this->db->table("courier_details");
      $builder = $builder->select("courier_details.*,courier_table.department,courier_table.designation,courier_details.bulk_count,courier_table.division,courier_table.no_of_courier,courier_table.total_no_of_couriers,courier_table.empolyee_code,courier_table.created_by,courier_table.transcation_unique_no,
      courier_table.otp,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id,employee_master.emp_status,employee_master.emp_id,cuorier_master.courier_name");
      $builder = $builder->join('courier_table', 'courier_table.id = courier_details.courier_transcation_id', 'inner');
      $builder = $builder->join('employee_master', 'courier_table.employee_id = employee_master.emp_id', 'left');
      $builder = $builder->join('cuorier_master', 'cuorier_master.id = courier_details.courier_company_id', 'inner');
      $builder =  $builder->where("courier_details.courier_transcation_id", $id);
      $builder=$builder->where("courier_details.status",'1');
      return  $builder->distinct()->groupBy("courier_details.id")->get()->getResultArray();
      }
      
     public function getReceiverDetailsById2($id) {
       $builder = $this->db->table("courier_details");
       $builder = $builder->select("courier_details.*,courier_table.department,courier_table.division,courier_table.no_of_courier,courier_table.empolyee_code,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id,employee_master.emp_id,cuorier_master.courier_name");
       $builder = $builder->join('courier_table', 'courier_table.id = courier_details.courier_transcation_id', 'inner');
       $builder = $builder->join('employee_master', 'employee_master.emp_code = courier_table.empolyee_code', 'left');
       $builder = $builder->join('cuorier_master', 'cuorier_master.id = courier_details.courier_company_id', 'inner');
      $builder =  $builder->where("courier_details.courier_transcation_id", $id);
      $builder = $builder->whereIn("courier_details.redirect_status", [0, 1]);
      $builder=$builder->where("courier_details.status",'1');
      return  $builder->distinct()->groupBy("courier_details.id")->get()->getResultArray();
     }  
     public function InsertCourierCompanyName($data){
      $this->db->table('cuorier_master')->set($data)->insert();
      $InsID=$this->insertID();
      return $InsID;
     }
     public function  InsertReceiveDetails($data,$unique_no){
      if(strlen($data->rows[0]->entry_date)>0){
      foreach($data->rows as $key=>$sap){
        $bulk_count[$key]=$sap->bulk_count;
      }
      }
      $bulk_count=count($data->rows) > 0 ? array_sum($bulk_count)+$data->bulk_count : $data->bulk_count;
       $count1 = count($data->rows);
       $count2=1;
       $test_count =$count1+$count2;
        $value = array (
          "employee_id"=>$data->employeename->value,
          "empolyee_code"=>$data->empcode,
          "department"=>$data->empdep,
          "division"=>$data->empdiv,
          "designation"=>$data->emp_deg,
          "status"=>1,
          "no_of_courier"=>$test_count,
          "total_no_of_couriers"=>$bulk_count,
          "transcation_unique_no"=>$unique_no,
          "created_by"=>$data->created_by,
        );
        $this->db->table('courier_table')->set($value)->insert();
        $InsID=$this->insertID(); 
        $value1 = array (
          "entry_date"=>$data->entry_date,
          "courier_from"=>$data->from_person,
          "courier_company_id"=>$data->courier_company_id,
          "bulk_count"=>($data->bulk_count) > 0 ? $data->bulk_count : NULL,
          "status"=>1,
          "created_by"=>$data->created_by,
          "courier_transcation_id"=>$InsID
        );
        $this->db->table('courier_details')->set($value1)->insert();
        if(strlen($data->rows[0]->entry_date)>0){
        foreach ($data->rows as $value2) {
          $value3 = array (
            "entry_date"=>$value2->entry_date,
            "courier_from"=>$value2->from_person,
            "courier_company_id"=>$value2->courier_company_id->value,
            "bulk_count"=>($value2->bulk_count) > 0 ? $value2->bulk_count : NULL,
            "status"=>1,
            "created_by"=>$data->created_by,
            "courier_transcation_id"=>$InsID
          );
          $this->db->table('courier_details')->set($value3)->insert();
        }
      }
        return $InsID;
       }              
      public function updateCourierCompany($updateId,$Data){ 
        $checkDup = $this->getCourierCompanyDuplicateChk($Data->courier_name,$updateId);
        if($checkDup =="0"){
          $this->db->table('cuorier_master')->set($Data)->where('id',$updateId)->update();
          $InsId=$updateId;  
        }
          return $InsId;
      }
       public function Courier_Details_Update($Data){	
        foreach($Data->rows as $key=>$sap) {
         $bulk_count[$key] = $sap-> bulk_count;
      }
      $bulk_count = array_sum($bulk_count);
        if(strlen($Data->row[0]->courier_company_id->value>0)){
        foreach ($Data->row as $key => $value2) {
            $value3 = array (
              "entry_date"=>$value2->entry_date,
              "courier_from"=>$value2->from_person,
              "courier_company_id"=>$value2->courier_company_id->value,
              "bulk_count"=>($value2->bulk_count) > 0 ? $value2->bulk_count : NULL,
              "status"=>1,
              "courier_transcation_id"=>$Data->refid,
              "updated_by"=>$Data->updated_by
            );
            $this->db->table('courier_details')->set($value3)->insert();
            $count[$key] = $value2->bulk_count == '' ? 0 : $value2->bulk_count;
            $count = array_sum($count);
          }
          $bulk_count =$bulk_count + $count;
        }
        $bulk_count = $bulk_count;
        $count1 = count($Data->rows);
        $count2=count($Data->row);
        $test_count=$count1+$count2;
        $courier_table = array (
          "employee_id"=>$Data->empname,
          "empolyee_code"=>$Data->empcode,
          "department"=>$Data->dep,
          "division"=>$Data->division,
          "designation"=>$Data->emp_deg,
          "status"=>1,
          "updated_by"=>$Data->updated_by,
          "no_of_courier"=>$test_count,
          "total_no_of_couriers"=>$bulk_count
        );
        $this->db->table('courier_table')->set($courier_table)->where('id',$Data->refid)->update();
      foreach ($Data->rows as $rowsvalue) {
        $courier_details_value = array (
          "entry_date"=>$rowsvalue->entry_date,
          "courier_from"=>$rowsvalue->courier_from,
          "courier_company_id"=>$rowsvalue->courier_company_id,
          "bulk_count"=> strlen($rowsvalue->bulk_count) > 0 ? $rowsvalue->bulk_count : NULL,
          "status"=>1,
          "updated_by"=>$Data->updated_by
        );
      $this->db->table('courier_details')->set($courier_details_value)->where('id',$rowsvalue->id)->update();
    }
    foreach ($Data->removedRows as $removedRow) {
      $courier_details_value = array (
          "redirect_status" => 4,
      );

      $this->db->table('courier_details')->set($courier_details_value)->where('id', $removedRow->id)->update();
    }   
     $this->db->table('courier_details')->set($courier_details_value)->where('id', $Data->id)->update();
   
     return $Data->refid;
    }
    
    public function generateOTP($id, $otp)
     {
      
        $data = $otp;

        $otp_info = array (
          "otp"=>$otp, 
                  
        ); 
        $this->db->table('courier_table')->set($otp_info)->where('id', $id)->update();        
        return $this->affectedRows(); 
}
public function getOTPByMobileNumber($chckid,$getData,$enteredOTP)
    {
        $query = $this->db->table('courier_table')->select('otp') ->where('id', $chckid)->get();

        if ($query->resultID->num_rows > 0) {
          
          if($getData->deliveryMethod == "OTHERS"){
          $otp_info = array (
            "received_by"=>$getData->received_by, 
              "check_box_value"=>2,
              "remarks"=>$getData->remarks,      
          ); 
          $this->db->table('courier_table')->set($otp_info)->where('id', $chckid)->update();
        }else{
          $otp_info = array (
            "check_box_value"=>1,
            "received_by"=>$getData->emp_id 
                    
          ); 
          $this->db->table('courier_table')->set($otp_info)->where('id', $chckid)->update();  
        }
        $storedOTP=$query->getRow()->otp;
        //print_r($storedOTP);exit;
        if ($storedOTP === $enteredOTP) {

          $this->db->table('courier_table')->where('id', $chckid) ->update(['status' => 2]); 
          $this->db->table('courier_details')->where('courier_transcation_id', $chckid) ->update(['status' => 2]);  

            return $storedOTP;
        } else {
            return null;
        }
      }
    }
    public function getCourierCompanyDuplicateChk($code,$id="") {
      $cnd="";
      if($id!="")
      {
        $cnd.=" and Id <> '".$id."'";
      }
      $fetchsql = "SELECT `id` FROM cuorier_master WHERE courier_name='$code' ".$cnd;
      $builder =  $this->db->query($fetchsql);
      return count($builder->getResultArray());
     }
     public function CourierSurrender($postdata)
    {
      foreach ($postdata->remarks as $remarks) {
        if($remarks->redirectstatus=="YES"){
        $courier_details_value = array (
            "redirect_status" => 1,
            //"status" => 2,
        );}
        else{
          $courier_details_value = array (
            "redirect_status" => 2,
            "status" => 2,
        );}
        $count = count($postdata->remarks);
        $count2=($postdata->noRemarksCount);

        $scount=$count-$count2;
        $count_info = array (
          "return_count"=>$count2,  
          // "status"=>2       
        );
        $this->db->table('courier_table')->set($count_info)->where('id',$postdata->refid)->update();
        $this->db->table('courier_details')->set($courier_details_value)->where('id', $remarks->id)->update();
        }   
        return $postdata->refid;
      }
      public function getLastCourierTicNo()
      {
        $builder = $this->db->table("courier_table");
        $builder=$builder->select("courier_table.id,courier_table.transcation_unique_no");
        $builder=$builder->orderBy('courier_table.id', 'DESC')
                    ->limit(1)
                    ->get()
                    ->getResultArray();
        
        return $builder;
      }
      public function changeStatus($id)
      {
        $status=3;
        $status_info = array (
          "status"=>$status,         
        );
        $status_info2 = array (
          "status"=>$status,         
        ); 
        $this->db->table('courier_table')->set($status_info)->where('id', $id)->update();
        $this->db->table('courier_details')->set($status_info2)->where('courier_transcation_id', $id)->update();
        $res='Status changed successfully';
          return $res ;
      }
      
      public function changeStatusforsend($id)
      {
        $status=3;
        $status_info = array (
          "status"=>$status,         
        );
        $this->db->table('courier_dispatch')->set($status_info)->where('cr_dispatch_id', $id)->update();
        $this->db->table('courier_dispatch_details')->set($status_info)->where('dispatch_id', $id)->update();
        $res='Status changed successfully';
          return $res ;
      }
      public function  InsertSendDetail($data,$unique_no){
      
         $count1 = count($data->rows);
          $value = array (
            "employee_id"=>$data->employeename,
            "employee_code"=>$data->empcode,
            "status"=>1,
            "entry_date"=>$data->entry_date,
            "total_no_of_couriers"=>$count1,
            "cr_unique_no"=>$unique_no,
            "created_by"=>$data->created_by,
          );         
         
          $this->db->table('courier_dispatch')->set($value)->insert();
          $InsID=$this->insertID(); 
          foreach ($data->rows as $value2) {
            $value3 = array (
              "sending_date"=>$value2->sending_date,
              "to_person_name"=>$value2->To_person,
              "to_person_address"=>$value2->To_Person_Address,
              "destination"=>$value2->destination,
              "dispatch_id"=>$InsID,
              // "status"=>0,
              "created_by"=>$data->created_by,
            );
            $this->db->table('courier_dispatch_details')->set($value3)->insert();
          }
        
          return $InsID;
         }    
         public function getLastCourierTicNoFORSEND()
         {
           $builder = $this->db->table("courier_dispatch");
           $builder=$builder->select("courier_dispatch.cr_dispatch_id,courier_dispatch.cr_unique_no");
           $builder=$builder->orderBy('courier_dispatch.cr_dispatch_id', 'DESC')
                       ->limit(1)
                       ->get()
                       ->getResultArray();
           
           return $builder;
         }          
         public function getSender($plant_code){
     
     
          if ($plant_code != '') {
            $splitnumber = $plant_code; 
            $splittedNumbers = explode(",", $splitnumber);     
            $numbers = "'" . implode("', '", $splittedNumbers) ."'";  
            $plants = "and employee_master.plant_code in ($numbers)";
            // print_r($numbers);exit;
          }
         
          else if($plant_code == ''){$plants='';}

         
          //print_r($builder);exit;
          $builder = $this->db->table("courier_dispatch_details");
         $builder = $builder->select("courier_dispatch_details.*,courier_dispatch.cr_dispatch_id,courier_dispatch.employee_code,courier_dispatch.total_no_of_couriers,courier_dispatch.cr_unique_no,,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id,employee_master.emp_id,employee_master.emp_designation,employee_master.emp_department,employee_master.emp_division");
        //  print_r($builder);exit;
         $builder = $builder->join('courier_dispatch', 'courier_dispatch.cr_dispatch_id = courier_dispatch_details.dispatch_id', 'inner');
         $builder = $builder->join('employee_master', 'courier_dispatch.employee_id = employee_master.emp_id', 'left');
         $builder =  $builder->where("courier_dispatch_details.status = 0");
         $builder =  $builder->where("courier_dispatch.status = 1 $plants");
          return  $builder->distinct()->orderBy("courier_dispatch.cr_unique_no")->get()->getResultArray();
        } 
        public function Insertconsignmentnumber($json) {
              $value3 = array(
                  "courier_company_id" => $json->courier_company_id,
                  "consignment_number" =>  $json->consignmentnumber,
                  "courier_weight" => $json->courierweight,
                  "courier_amount" => $json->courieramount,
                  'status'=>1,
              );
              // print_r($json->chckid);exit;
            $this->db->table('courier_dispatch_details')->set($value3)->where('dispatch_det_id', $json->chckid)->update();
          
          
        }
        public function getSenderDetailsById($id) {
          // print_r($id);exit;
          $builder = $this->db->table("courier_dispatch_details");
         $builder = $builder->select("courier_dispatch_details.*,courier_dispatch.cr_dispatch_id,courier_dispatch.employee_code,courier_dispatch.cr_unique_no,courier_dispatch.entry_date,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id,employee_master.emp_id,employee_master.emp_designation,employee_master.emp_department,employee_master.emp_division,cuorier_master.courier_name");
         $builder = $builder->join('courier_dispatch', 'courier_dispatch.cr_dispatch_id = courier_dispatch_details.dispatch_id', 'inner');
         $builder = $builder->join('employee_master', 'courier_dispatch.employee_id = employee_master.emp_id', 'left');
         $builder = $builder->join('cuorier_master', 'cuorier_master.id = courier_dispatch_details.courier_company_id', 'inner');
         $builder =  $builder->where("courier_dispatch_details.dispatch_det_id", $id);
         return  $builder->distinct()->groupBy("courier_dispatch_details.dispatch_det_id")->get()->getResultArray();
         }   
         public function getresid($resid){
          $builder=  $this->db->table("user_info");
          $builder=$builder->select("user_info.FIRST_NAME,user_info.MOBILE_NUMBER,user_info.MAIL_ID,employee_master.emp_division");
          $builder=$builder->join('employee_master','employee_master.emp_code=user_info.EMP_CODE');
          $builder=$builder->where("user_info.UI_ID",$resid);
          return  $builder->distinct()->get()->getResultArray();


         }
         public function sendmailremainder(){
          $builder = $this->db->table("courier_details");
          $builder = $builder->select("courier_details.*,courier_table.department,courier_table.designation,courier_details.bulk_count,courier_table.division,courier_table.no_of_courier,courier_table.empolyee_code,courier_table.created_by,courier_table.transcation_unique_no,
          courier_table.otp,employee_master.emp_name,employee_master.emp_mobile_number,employee_master.emp_mail_id,employee_master.emp_status,employee_master.emp_id,cuorier_master.courier_name,courier_details.remainder_count");
          $builder = $builder->join('courier_table', 'courier_table.id = courier_details.courier_transcation_id', 'inner');
          $builder = $builder->join('employee_master', 'courier_table.employee_id = employee_master.emp_id', 'left');
          $builder = $builder->join('cuorier_master', 'cuorier_master.id = courier_details.courier_company_id', 'inner');
          $builder=$builder->where("courier_table.id = courier_details.courier_transcation_id");
          $builder=$builder->where("courier_details.status",'1');
          return  $builder->distinct()->groupBy("courier_details.id")->get()->getResultArray();
          }
          public function updatesenderdetails($postdata){
            foreach ($postdata->row as $value1) {
            $value = array (
              "employee_id"=>$postdata->empname,
              "employee_code"=>$postdata->empcode,
              "entry_date"=>$postdata->entry_date,
              "updated_by"=>$value1->updated_by,
            );   
            $this->db->table('courier_dispatch')->set($value)->where('cr_dispatch_id', $value1->cr_dispatch_id)->update();
          }
            foreach ($postdata->row as $value2) {     
            $value3 = array(
              "courier_company_id" => $value2->courier_company_id,
              "consignment_number" =>  $value2->consignment_number,
              "courier_weight" => $value2->courier_weight,
              "courier_amount" => $value2->courier_amount,
              "sending_date"=>$value2->sending_date,
              "to_person_name"=>$value2->to_person_name,
              "to_person_address"=>$value2->to_person_address,
              "destination"=>$value2->destination,
              "updated_by"=>$value2->created_by,
          );
          // print_r($postdata->refid);exit;
        $this->db->table('courier_dispatch_details')->set($value3)->where('dispatch_det_id', $postdata->refid)->update();
            }
        return $postdata->refid;
          }
          public function getLastinsertedempid()
      {
        $builder = $this->db->table("courier_table");
        $builder=$builder->select("courier_table.id,courier_table.employee_id,courier_table.created_at");
        $builder=$builder->orderBy('courier_table.id', 'DESC')
                    ->limit(1)
                    ->get()
                    ->getResultArray();
        
        return $builder;
      }    
        public function updateRemainderCount($id, $remainderCount)
        {
            
            $data = ['remainder_count' => $remainderCount];
            $this->db->table('courier_details')->where('id', $id)->set($data)->update();
        }
          
      

}
