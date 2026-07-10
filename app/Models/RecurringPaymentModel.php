<?php

namespace App\Models;

use CodeIgniter\Model;
use App\Helpers\SapUrlHelper;

$db = \Config\Database::connect();

class RecurringPaymentModel extends Model
{
    public function InsertPaymentToType($postData)
    {
        foreach ($postData->subtypes as $subtype) {
            $value = array(
                "payment_to_type" => $postData->paymentToType,
                "payment_to_subtype" => $subtype,
                "created_by" => $postData->created_by,
                "active_status" => 1
            );
            // print_r($value);exit;

            $this->db->table('payment_to_type_subtype')->insert($value);
            $InsID = $this->insertID();   // last inserted ID
        }

        return $InsID;  // returns last row ID
    }
    public function checkdata($paymentToType)
    {
        $builder = $this->db->table("payment_to_type_subtype");
        $builder->where("payment_to_type", $paymentToType);
        $builder->where("payment_to_type_subtype.active_status", 1);
        return $builder->countAllResults();
    }

    public function Getpaymenttotype()
    {
        $builder = $this->db->table("payment_to_type_subtype");

        // Select aggregated subtype names + aggregated ids
        $builder->select("
        payment_to_type_subtype.payment_to_type,
        GROUP_CONCAT(DISTINCT payment_to_type_subtype.payment_to_subtype SEPARATOR '||') AS payment_to_subtypes,
        GROUP_CONCAT(DISTINCT payment_to_type_subtype.id SEPARATOR '||') AS subtype_ids
    ", false);

        $builder->where("payment_to_type_subtype.active_status", 1);
        $builder->groupBy("payment_to_type_subtype.payment_to_type");

        $rows = $builder->get()->getResultArray();

        // Convert group_concat strings to arrays
        foreach ($rows as &$r) {
            $r['payment_to_subtypes'] = $r['payment_to_subtypes'] !== null
                ? explode('||', $r['payment_to_subtypes'])
                : [];

            $r['subtype_ids'] = $r['subtype_ids'] !== null
                ? explode('||', $r['subtype_ids'])
                : [];
        }
        unset($r);

        return $rows;
    }


    public function Updatepaymenttotype($postData)
    {
        $payment_to_type = $postData->payment_to_type ?? null;
        $subtypes = $postData->subtypes ?? [];
        $deletedIds = $postData->deleted_subtype_ids ?? [];
        $modified_by = $postData->modified_by ?? null;

        // Basic validation
        if (empty($payment_to_type) || empty($modified_by)) {
            return 0;
        }

        $builder = $this->db->table('payment_to_type_subtype');

        try {
            $this->db->transStart();

            // Insert/update subtypes
            if (!empty($subtypes) && is_array($subtypes)) {
                foreach ($subtypes as $s) {
                    $sArr = is_object($s) ? (array) $s : $s;

                    $sid = $sArr['id'] ?? null;
                    $sname = $sArr['name'] ?? '';

                    if ($sid) {
                        // Update existing subtype
                        $builder->where('id', $sid)->update([
                            'payment_to_type' => $payment_to_type,
                            'payment_to_subtype' => $sname,
                            'updated_by' => $modified_by,
                            'active_status' => 1
                        ]);

                    } else {
                        // Insert new subtype
                        $builder->insert([
                            'payment_to_type' => $payment_to_type,
                            'payment_to_subtype' => $sname,
                            'active_status' => 1,
                            'created_by' => $modified_by
                        ]);
                    }
                }
            }

            // Soft delete subtypes
            if (!empty($deletedIds) && is_array($deletedIds)) {
                $cleanIds = array_values(array_filter($deletedIds));
                if (!empty($cleanIds)) {
                    $builder->whereIn('id', $cleanIds)->update([
                        'active_status' => 0,
                        'updated_by' => $modified_by
                    ]);
                }
            }

            $this->db->transComplete();

            // If transaction failed
            if ($this->db->transStatus() === false) {
                return 0;
            }

            return 1; // SUCCESS

        } catch (\Exception $e) {
            return 0; // FAILURE
        }

    }


    public function Deactivatepaymenttotype($postData)
    {
        $payment_to_type = $postData->payment_to_type ?? null;
        $subtype_ids = $postData->subtype_ids ?? [];
        $modified_by = $postData->modified_by ?? null;

        if (empty($payment_to_type) || empty($subtype_ids) || empty($modified_by)) {
            return 0;
        }

        $builder = $this->db->table('payment_to_type_subtype');

        try {
            $this->db->transStart();

            // Update active_status = 2
            $builder->where('payment_to_type', $payment_to_type)
                ->whereIn('id', $subtype_ids)
                ->update([
                    'active_status' => 2,
                    'updated_by' => $modified_by
                ]);

            $this->db->transComplete();

            if ($this->db->transStatus() === false) {
                return 0;
            }

            return 1;
        } catch (\Exception $e) {
            return 0;
        }
    }
    public function Getpaymenttotypeinfo()
    {
        $builder = $this->db->table("payment_to_type_subtype");
        $builder = $builder->select("id as value, payment_to_type as label");
        $builder = $builder->where("active_status", 1);
        $builder->groupBy("payment_to_type");
        // print_r($builder);exit;

        return $builder->distinct()->get()->getResultArray();
    }
    public function Getdivision($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            // trim values and remove empties to avoid SQL syntax errors
            $splittedNumbers = array_values(array_filter(array_map('trim', $splittedNumbers), function ($v) {
                return $v !== ''; }));
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and employee_master.plant_code in ($numbers)";
        } else {
            $plants = '';
        }

        $builder = $this->db->table("employee_master");
        $builder = $builder->select("emp_division as value, emp_division as label");
        // use the same string-style where as your other function
        $builder = $builder->where("emp_status IN (1,2) $plants");
        $builder = $builder->groupBy("emp_division");

        return $builder->distinct()->get()->getResultArray();
    }
    public function Getdepartment($division)
    {
        $builder = $this->db->table("employee_master");
        $builder = $builder->select("emp_department as value, emp_department as label");
        $builder = $builder->where("emp_status IN (1,2) ");
        $builder = $builder->where("emp_division", $division);
        $builder = $builder->groupBy("emp_department");
        return $builder->distinct()->get()->getResultArray();
    }
    public function Getpaymenttosubtypeinfo($paymentToTypeId)
    {
        $builder = $this->db->table("payment_to_type_subtype");
        $builder = $builder->select("id as value, payment_to_subtype as label");
        $builder = $builder->where("active_status", 1);
        $builder = $builder->where("payment_to_type", $paymentToTypeId);
        // print_r($builder);exit;

        return $builder->distinct()->get()->getResultArray();
    }
    public function Getpaymentfrequencytypes()
    {
        $builder = $this->db->table("definitions_list");

        $builder->select("
        id AS value,
        definitionsName AS label,
        definitionsvalues
    ");

        $builder->where("isActive", 1);
        $builder->where("definitionsId", 34);

        return $builder->distinct()->get()->getResultArray();
    }

    public function Getamounttopaidtypes()
    {
        $builder = $this->db->table("definitions_list");
        $builder = $builder->select("id as value, definitionsName as label");
        $builder = $builder->where("isActive", 1);
        $builder = $builder->where("definitionsId", 35);
        // print_r($builder);exit;

        return $builder->distinct()->get()->getResultArray();
    }
    public function GetVendorfromsap($vendorID)
    {

        $urlPath = "ZRECC_BANK/Bankinfoupdate?sap-client=900&VENDOR_NO=$vendorID";

        $res = SapUrlHelper::getWhDatas($urlPath);
        // print_r($res);exit;
        return json_decode($res);
    }
    public function GetGLfromsap($glcode)
    {
        $urlPath = "ZRECC_GLINFO/GLinfoupdate?sap-client=900&GL_Account=$glcode";
        $res = SapUrlHelper::getWhDatas($urlPath);

        // decode as associative array
        $data = json_decode($res, true);
        // print_r($data);exit
        // map + filter: include only STATUS == '1' and non-empty COST_CENTER
        $formatted = array_map(function ($item) {
            return [
                'value' => $item['PROFIT_CENTER'],
                'label' => $item['COST_CENTER'],
            ];
        }, $data);
        // print_r($formatted);exit;
        return $formatted;
    }

    public function Gethousebankdetailsfromsap($housebank)
    {

        $urlPath = "ZRECC_HOUSE/HouseBankinfoupdate?sap-client=900&House_Bank=$housebank";

        $res = SapUrlHelper::getWhDatas($urlPath);
        // print_r($res);exit;
        return json_decode($res);
    }
    public function GetPlantfromsap($costcentre)
    {

        $urlPath = "ZRECC_PLANT/RecurringPlantinfo?sap-client=900&COSTCENTER=$costcentre";

        $res = SapUrlHelper::getWhDatas($urlPath);
        // print_r($res);exit;
        return json_decode($res);
    }

    public function Insertrecpaymentinfo($postData, $result)
    {
        $value = array(
            "rp_unique_trans_id " => $result,
            "division " => $postData->division_name,
            "department " => $postData->department_name,
            "payment_to_type_id" => $postData->payment_to_type,
            "payment_to_type_name" => $postData->payment_to_type_name,
            "payment_to_subtype_id" => $postData->payment_to_sub_type,
            "payment_to_subtype_name " => $postData->payment_to_sub_type_name,
            "payment_frequency" => $postData->payment_frequency,
            "payment_frequency_name" => $postData->payment_frequency_name,
            "amount_paid_method" => $postData->amount_paid_method,
            "amount_paid_method_id " => $postData->amount_paid_method_id,
            "plant_code" => $postData->plant_werks,
            "amount_budget" => $postData->amount_budget,
            "description" => $postData->description,
            "agreement_start_date" => $postData->agreement_start_date,
            "agreement_end_date" => $postData->agreement_end_date,
            "payment_date" => $postData->payment_date,
            "vendor" => $postData->vendor,
            "vendorname" => $postData->vendorname,
            "account_number" => $postData->account_number,
            "account_ifsc_code" => $postData->account_ifsc,
            "status" => 1,
            "created_by" => $postData->created_by,
            "payment_times" => $postData->payment_times,
            "paybale_amount" => $postData->amount_per_payment,
            "agreement_copy" => $postData->Attachment,
            "mail_copy" => $postData->vendorEmailCopy,
        );
        $this->db->table('rec_payment_info')->insert($value);
        $InsID = $this->insertID();   // last inserted ID
        return $InsID;
    }

    public function getLastCourierTicNo($gateid)
    {
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.rp_id ,rec_payment_info.rp_unique_trans_id");
        $builder = $builder->join('user_info', 'user_info.UI_ID = rec_payment_info.created_by', 'inner');
        $builder = $builder->where('rec_payment_info.plant_code', $gateid);
        $builder = $builder->orderBy('rec_payment_info.rp_id', 'DESC')
            ->limit(1)
            ->get()
            ->getResultArray();

        return $builder;
    }
    public function recpaymentinfoapproval($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }
        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME");
        $builder = $builder->join('user_info', 'rec_payment_info.created_by = user_info.UI_ID', 'left');
        $builder = $builder->where("rec_payment_info.status = 1 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function recpaymentinfo($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }
        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME");
        $builder = $builder->join('user_info', 'rec_payment_info.created_by = user_info.UI_ID', 'left');
        $builder = $builder->where("rec_payment_info.status != 8 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function recpaymentinfoapprovalforaccountsapprove($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }
        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME");
        $builder = $builder->join('user_info', 'rec_payment_info.created_by = user_info.UI_ID', 'left');
        $builder = $builder->where("rec_payment_info.status = 2 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function recpaymentinfoapprovaldepartmentMG($postData)
    {
        $value = array(
            "remarks" => $postData->remarks,
            "dep_mg_approved_by" => $postData->approved_by,
            "status" => 2,
            "dep_mg_approved_at" => date('Y-m-d H:i:s')
        );
        // print_r($value3);exit;
        $this->db->table('rec_payment_info')->set($value)->where('rp_id ', $postData->id)->update();
        return $postData->id;
    }
    public function recpaymentinfoapprovalAccountMG($postData)
    {
        $value = array(
            "remarks" => $postData->remarks,
            "gl_code" => $postData->gl_code,
            "cost_centre" => $postData->cost_centre,
            "profit_centre" => $postData->profit_centre,
            "house_bank" => $postData->house_bank,
            "house_bank_id" => $postData->house_bank_id,
            "acc_mg_approved_by" => $postData->approved_by,
            "status" => 3,
            "acc_mg_approved_at" => date('Y-m-d H:i:s'),
        );
        // print_r($value3);exit;
        $this->db->table('rec_payment_info')->set($value)->where('rp_id ', $postData->id)->update();
        return $postData->id;
    }
    public function Rejectrecpaymentinfo($postData)
    {
        $value = array(
            "remarks" => $postData->remarks,
            "rejected_by" => $postData->approved_by,
            "status" => 5,
            "rejected_at" => date('Y-m-d H:i:s'),
        );
        // print_r($value3);exit;
        $this->db->table('rec_payment_info')->set($value)->where('rp_id ', $postData->id)->update();
        return $postData->id;
    }
   public function getrecpaymentrenewaldata($plant_code)
{
    // Plant filter
    if ($plant_code != '') {
               $splittedNumbers = explode(",", $plant_code);
        $numbers = "'" . implode("', '", $splittedNumbers) . "'";
        $plants = "AND rec_payment_info.plant_code IN ($numbers)";
    } else {
        $plants = '';
    }

    $builder = $this->db->table("rec_payment_info");

    $builder->select("
        rec_payment_info.*,
        user_info.FIRST_NAME,
        recd.last_payment_date
    ");

    // Join user_info
    $builder->join(
        'user_info',
        'rec_payment_info.created_by = user_info.UI_ID',
        'left'
    );

    // Last payment date (exclude status = 5)
    $builder->join(
        "(SELECT rp_id, MAX(created_at) AS last_payment_date
          FROM rec_payment_details
          WHERE status != 5
          GROUP BY rp_id
        ) AS recd",
        "recd.rp_id = rec_payment_info.rp_id",
        'left',
        false
    );

    // ===================== WHERE CONDITIONS =====================
    $where = "
        rec_payment_info.status IN (3, 4)
        $plants
        AND CURDATE() BETWEEN rec_payment_info.agreement_start_date
                        AND rec_payment_info.agreement_end_date
        AND
        (
            /* ===================== 7 DAYS ONCE ===================== */
            (
                rec_payment_info.payment_frequency_name = '7 DAYS ONCE'
                AND
                (
                    DATE_SUB(
                        CURDATE(),
                        INTERVAL (DAYOFWEEK(CURDATE()) + 5) % 7 DAY
                    )
                ) > IFNULL(recd.last_payment_date, '1900-01-01')
            )

            /* ===================== FORTNIGHT (15 & 30 ONLY) ===================== */
            OR
            (
                rec_payment_info.payment_frequency_name = 'FORTNIGHT'
                AND DAY(CURDATE()) >= 15
                AND
                (
                    CASE
                        -- 30th OR Feb last day
                        WHEN (
                            DAY(CURDATE()) >= 30
                            OR DAY(CURDATE()) = DAY(LAST_DAY(CURDATE()))
                        )
                        THEN LAST_DAY(
                            DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        )

                        -- 15th
                        ELSE DATE_FORMAT(CURDATE(), '%Y-%m-15')
                    END
                ) > IFNULL(recd.last_payment_date, '1900-01-01')
            )

            /* ===================== MONTH BASED FREQUENCIES ===================== */
            OR
            (
                rec_payment_info.payment_frequency_name IN (
                    'MONTHLY',
                    'BIMONTHLY',
                    'QUARTERLY',
                    'YEARLY'
                )
                AND
                DATE_ADD(
                    IFNULL(recd.last_payment_date, rec_payment_info.agreement_start_date),
                    INTERVAL
                    CASE
                        WHEN rec_payment_info.payment_frequency_name = 'MONTHLY' THEN 1
                        WHEN rec_payment_info.payment_frequency_name = 'BIMONTHLY' THEN 2
                        WHEN rec_payment_info.payment_frequency_name = 'QUARTERLY' THEN 3
                        WHEN rec_payment_info.payment_frequency_name = 'YEARLY' THEN 12
                    END MONTH
                ) <= CURDATE()
            )
        )
    ";

    $builder->where($where, null, false);
    $builder->orderBy('recd.last_payment_date', 'DESC');

    return $builder->get()->getResultArray();
}


    public function TDSFetch($vendorcode)
    {
        $urlPath = "zzgp_api/zzgp_migo/GP_TDS?sap-client=900&vendor=$vendorcode";
        $data = SapUrlHelper::getWhDatas($urlPath);
        $result = json_decode($data, true);

        $formattedLocations = array_map(function ($item) {
            return [
                'value' => $item['TAX_TYPE'],
                'label' => $item['TAX_CODE'],
                'TAX_RATE' => $item['TAX_RATE']
            ];
        }, $result); // $result is your original array
        // print_r($result);exit;
        return $formattedLocations;
    }
    public function TAXFetch()
    {
        $urlPath = "ZRECC_TAX/TAXinfoupdate?sap-client=900";
        $data = SapUrlHelper::getWhDatas($urlPath);
        $result = json_decode($data, true);
        // print_r($result);
        // exit;

        $formattedLocations = array_map(function ($item) {
            return [
                'value' => $item['TAX_CODE'],
                'label' => $item['DESCRIPTION'],
            ];
        }, $result); // $result is your original array
        return $formattedLocations;
    }
    public function getLastdetailsTicNo($gateid)
    {
        $builder = $this->db->table("rec_payment_details");
        $builder = $builder->select("rec_payment_details.rpd_id  ,rec_payment_details.rpd_unique_trans_id");
        $builder = $builder->join('user_info', 'user_info.UI_ID = rec_payment_details.created_by', 'inner');
        $builder = $builder->where('rec_payment_details.plant_code', $gateid);
        $builder = $builder->orderBy('rec_payment_details.rp_id', 'DESC')
            ->limit(1)
            ->get()
            ->getResultArray();

        return $builder;
    }

    public function Insertrecpaymentrenewaldata($postData, $result)
    {
        $paymentcount = $postData->payment_rem_count + 1;

        $value = array(
            "rpd_unique_trans_id" => $result,
            "rp_id" => $postData->rp_id,
            "amount" => $postData->amount,
            "invoice_no" => $postData->invoice_number,
            "invoice_date" => $postData->invoice_date,
            "difference_amount" => $postData->difference_amount,
            "plant_code" => $postData->plant,
            "invoice_attachment" => $postData->Invoice_Copy,
            "status" => 1,
            "created_by" => $postData->created_by,
        );

        // Insert into rec_payment_details
        $this->db->table('rec_payment_details')->insert($value);

        // Correct insert ID usage
        $InsID = $this->db->insertID();

        // Update parent table
        $updateData = array(
            'status' => 4,
            'payment_rem_count' => $paymentcount
        );

        $this->db->table('rec_payment_info')
            ->where('rp_id', $postData->rp_id)
            ->update($updateData);

        return $InsID;
    }

    public function recpaymentdetailsforapproval($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }


        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME,rec_payment_details.rpd_id ,rec_payment_details.rpd_unique_trans_id,rec_payment_details.amount,rec_payment_details.difference_amount,rec_payment_details.invoice_no,rec_payment_details.invoice_date,rec_payment_details.tax,rec_payment_details.tds,rec_payment_details.tds_status,rec_payment_details.invoice_attachment");
        $builder = $builder->join('user_info', 'rec_payment_info.created_by = user_info.UI_ID', 'left');
        $builder = $builder->join('rec_payment_details', 'rec_payment_info.rp_id = rec_payment_details.rp_id', 'inner');
        $builder = $builder->where("rec_payment_details.status = 1 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function recpaymentdetailsforapprovalACCmg($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }


        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME,rec_payment_details.rpd_id ,rec_payment_details.rpd_unique_trans_id,rec_payment_details.amount,rec_payment_details.difference_amount,rec_payment_details.invoice_no,rec_payment_details.invoice_date,rec_payment_details.tax,rec_payment_details.tds,rec_payment_details.tds_status,rec_payment_details.invoice_attachment");
        $builder = $builder->join('user_info', 'rec_payment_info.created_by = user_info.UI_ID', 'left');
        $builder = $builder->join('rec_payment_details', 'rec_payment_info.rp_id = rec_payment_details.rp_id', 'inner');
        $builder = $builder->where("rec_payment_details.status = 2 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function recpaymentrenewalapprovaldepartmentMG($postData)
    {
        $value = array(
            "remarks" => $postData->remarks,
            "dep_mg_approved_by" => $postData->approved_by,
            "status" => 2,
            "dep_mg_approved_at" => date('Y-m-d H:i:s')
        );
        // print_r($value3);exit;
        $this->db->table('rec_payment_details')->set($value)->where('rpd_id', $postData->id)->update();
        return $postData->id;
    }

    public function recpaymentrenewalapprovalACCMG($postData)
    {
        // small helper to fetch a remote file, return filename, base64 contents and extension (if detected)
        $mimeToExt = [
            'application/pdf' => '.pdf',
            'image/png' => '.png',
            'image/jpeg' => '.jpg',
            'image/jpg' => '.jpg'
        ];

        $fetchFile = function ($url) use ($mimeToExt) {
            $result = ['name' => null, 'base64' => null, 'ext' => null, 'mime' => null];

            if (empty($url))
                return $result;

            $fileUrl = str_replace(' ', '%20', trim($url));
            $fileContents = @file_get_contents($fileUrl);
            if ($fileContents === false)
                return $result;

            $filename = basename(parse_url($fileUrl, PHP_URL_PATH) ?: $fileUrl);
            $result['name'] = $filename;
            $result['base64'] = base64_encode($fileContents);

            // try to detect mime type
            if (function_exists('finfo_open')) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $fileContents);
                finfo_close($finfo);
                $result['mime'] = $mimeType;
                $result['ext'] = $mimeToExt[$mimeType] ?? '';
            }

            return $result;
        };

        // Fetch files (invoice / agreement / mail)
        $invoiceFile = $fetchFile($postData->rowdata->invoice_attachment ?? null);
        $agreementFile = $fetchFile($postData->rowdata->agreement_copy ?? null);
        $mailFile = $fetchFile($postData->rowdata->mail_copy ?? null);

        // Line Structure (for SAP)
        $lineNUM = 1;
        $sapLine[] = array(
            "ZZLINE" => $lineNUM,
            "Gl_account" => $postData->rowdata->gl_code ?? null,
            "amount" => $postData->rowdata->amount ?? null,
            "costcenter" => $postData->rowdata->cost_centre ?? null,
            "profitcetnter" => $postData->rowdata->profit_centre ?? null,
            "plant" => $postData->rowdata->plant_code ?? null,
            "text" => $postData->remarks ?? null,
            "hsn" => $postData->tax_hsn ?? null,
        );

        // Convert dates to YYYYMMDD for SAP
        $invoice_date = !empty($postData->rowdata->invoice_date)
            ? date("Ymd", strtotime($postData->rowdata->invoice_date))
            : null;

        $posting_date = !empty($postData->posting_date)
            ? date("Ymd", strtotime($postData->posting_date))
            : null;

        // SAP Payload
        $SAP_DATA = [
            "vendor_code" => $postData->rowdata->vendor ?? null,
            "invoice_date" => $invoice_date,
            "posting_date" => $posting_date,
            "totalamount" => $postData->rowdata->amount ?? null,
            "taxcode" => $postData->tax ?? null,
            "tds_status" => $postData->tds_status ?? null,
            "tds_value" => $postData->tds ?? null,
            "ref_doc" => $postData->rowdata->invoice_no ?? null,
            "headertext" => $postData->rowdata->rpd_unique_trans_id ?? null,

            // invoice file (existing)
            "pdf_file" => $invoiceFile['name'],        // filename if fetched
            "attach" => $invoiceFile['base64'],      // base64 content (can be null)

            // new: agreement file
            "agreement_attch" => $agreementFile['base64'],
            "agreement_pdf" => $agreementFile['name'],      // filename
            // base64 string

            // new: mail file
            "mail_attch" => $mailFile['base64'],
            "mail_pdf" => $mailFile['name'],           // filename
            // base64 string

            "LINE" => $sapLine,
        ];
        // print_r($SAP_DATA);exit;
        // Call SAP API
        $urlPath = "ZRECC_PAYMENT/RecurringFIPayment?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath, json_encode([$SAP_DATA]));
        // $res is expected as array of stdClass like: [ (object) ['STATUS'=>'1', ...] ]
        // print_r($res);exit;
        $success = 0;

        if (is_array($res) && isset($res[0]) && isset($res[0]->STATUS)) {
            // ✅ SUCCESS should be STATUS == 1 (per your sample)
            if ($res[0]->STATUS == 1 || $res[0]->STATUS == 2) {
                $updateData = [
                    "sap_doc_number" => $res[0]->DOCUMENT_NO ?? null,
                    "tax" => $postData->tax ?? null,
                    "tds" => $postData->tds ?? null,
                    "tds_status" => $postData->tds_status ?? null,
                    "hsn_code" => $postData->tax_hsn ?? null,
                    "status" => 4,
                    "remarks" => $postData->remarks ?? null,
                    "acc_mg_approved_by" => $postData->approved_by ?? null,
                    "acc_mg_approved_at" => date("Y-m-d H:i:s"),
                ];

                $this->db->table('rec_payment_details')
                    ->where('rpd_id', $postData->rowdata->rpd_id)
                    ->update($updateData);

                $success = 1;
            }
        }

        // Return SAP response (frontend expects this)
        return $res;
    }


    public function Rejectrecpaymentdetails($postData)
    {
        $value = array(
            "remarks" => $postData->remarks,
            "rejected_by" => $postData->approved_by,
            "status" => 5,
            "rejected_at" => date('Y-m-d H:i:s'),
        );
        // print_r($value);exit;
        $this->db->table('rec_payment_details')->set($value)->where('rpd_id ', $postData->id)->update();
        return $postData->id;
    }

    public function getreportdetialsforrecpayment($fromDate, $toDate, $plant_code, $payment_to_type, $payment_to_subtype)
    {
        // --------- PLANT CONDITION ----------
        $plants = '';
        if (!empty($plant_code)) {
            $splittedNumbers = explode(",", $plant_code);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = " AND rpi.plant_code IN ($numbers)";
        }

        // --------- DATE RANGE ----------
        $fDate = date("Y-m-d", strtotime($fromDate));
        $tDate = date("Y-m-d", strtotime($toDate));

        // --------- PAYMENT TYPE & SUBTYPE ----------
        $paymentTypeCondition = $payment_to_type
            ? " AND rpi.payment_to_type_id = $payment_to_type"
            : '';

        $paymentSubTypeCondition = $payment_to_subtype
            ? " AND rpi.payment_to_subtype_id = $payment_to_subtype"
            : '';

        // --------- MAIN QUERY ----------
        $fetchsql = "
        SELECT 
            rpd.*,   

            rpi.rp_unique_trans_id,
            rpi.payment_to_type_id,
            rpi.payment_to_type_name,
            rpi.payment_to_subtype_id,
            rpi.payment_to_subtype_name,
            rpi.payment_frequency,
            rpi.payment_frequency_name,
            rpi.amount_paid_method,
            rpi.amount_paid_method_id,
            rpi.plant_code,
            rpi.amount_budget,
            rpi.description,

            DATE_FORMAT(rpi.agreement_start_date, '%d-%m-%Y') AS agreement_start_date_formatted,
            DATE_FORMAT(rpi.agreement_end_date, '%d-%m-%Y') AS agreement_end_date_formatted,

            rpi.vendor,
            rpi.account_number,
            rpi.account_ifsc_code,
            rpi.gl_code,
            rpi.house_bank,
            rpi.house_bank_id,
            rpi.cost_centre,
            rpi.profit_centre,


            dep_user.FIRST_NAME AS dep_mg_approved_name,
            acc_user.FIRST_NAME AS acc_mg_approved_name,
            rej_user.FIRST_NAME AS rejected_by_name,

            CASE 
                WHEN rpd.status = 2 THEN 'At Dep-MG Approval'
                WHEN rpd.status = 3 THEN 'At Acc-MG Approval'
                WHEN rpd.status = 4 THEN 'Parked in SAP'
                WHEN rpd.status = 5 THEN 'Rejected'
                ELSE ''
            END AS status_text

        FROM rec_payment_details rpd
        LEFT JOIN rec_payment_info rpi ON rpi.rp_id = rpd.rp_id
        LEFT JOIN user_info dep_user ON dep_user.UI_ID = rpd.dep_mg_approved_by
        LEFT JOIN user_info acc_user ON acc_user.UI_ID = rpd.acc_mg_approved_by
        LEFT JOIN user_info rej_user ON rej_user.UI_ID = rpd.rejected_by

        WHERE 1=1
            $plants
            $paymentTypeCondition
            $paymentSubTypeCondition
            AND DATE(rpd.created_at) >= '$fDate'
            AND DATE(rpd.created_at) <= '$tDate'

        ORDER BY rpd.rpd_id
    ";

        $builder = $this->db->query($fetchsql);
        $data=$builder->getResultArray();
        // print_r($builder);exit;
        return $builder->getResultArray();
    }

    public function checkinvoice($postData)
    {
        $builder = $this->db->table("rec_payment_details d");
        $builder->select("d.invoice_no, i.vendor");
        $builder->join("rec_payment_info i", "i.rp_id = d.rp_id", "inner");

        // Status not equal to 5
        $builder->where("d.status !=", '5');

        // Invoice number condition
        $builder->where("d.invoice_no", $postData->invoice_number);
        $builder->where("i.vendor", $postData->vendor);

        // ----------------------------------------
        // Calculate current financial year range
        // ----------------------------------------
        $currentMonth = date('n'); // 1–12
        $currentYear = date('Y');

        if ($currentMonth <= 3) {
            // Before April → FY starts previous year
            $fyStart = ($currentYear - 1) . "-04-01";
            $fyEnd = $currentYear . "-03-31";
        } else {
            // From April onwards
            $fyStart = $currentYear . "-04-01";
            $fyEnd = ($currentYear + 1) . "-03-31";
        }

        // Financial-year filter on created_at
        $builder->where("d.created_at >=", $fyStart);
        $builder->where("d.created_at <=", $fyEnd);

        // Return count
        return $builder->countAllResults();
    }

    public function recpaymentinforejectdata($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }
        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME");
        $builder = $builder->join('user_info', 'rec_payment_info.rejected_by = user_info.UI_ID', 'left');
        $builder = $builder->where("rec_payment_info.status = 5 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function Rejectrecpaymentrenawaldetails($plant_code)
    {
        if ($plant_code != '') {
            $splitnumber = $plant_code;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) . "'";
            $plants = "and rec_payment_info.plant_code in ($numbers)";
            //getReceiverdetailprint_r($numbers);exit;
        } else if ($plant_code == '') {
            $plants = '';
        }
        //print_r($builder);exit;
        $builder = $this->db->table("rec_payment_info");
        $builder = $builder->select("rec_payment_info.*,user_info.FIRST_NAME,rec_payment_details.rpd_id ,rec_payment_details.rpd_unique_trans_id,rec_payment_details.amount,rec_payment_details.difference_amount,rec_payment_details.invoice_no,rec_payment_details.invoice_date,rec_payment_details.tax,rec_payment_details.tds,rec_payment_details.tds_status,rec_payment_details.invoice_attachment");
        $builder = $builder->join('user_info', 'rec_payment_info.created_by = user_info.UI_ID', 'left');
        $builder = $builder->join('rec_payment_details', 'rec_payment_info.rp_id = rec_payment_details.rp_id', 'inner');
        $builder = $builder->where("rec_payment_details.status =5 $plants");
        return $builder->distinct()->get()->getResultArray();
    }
    public function Updaterecpaymentinfo($postData)
    {
        $value = array(
            "division " => $postData->division,
            "department " => $postData->department,
            "payment_to_type_id" => $postData->payment_to_type,
            "payment_to_type_name" => $postData->payment_to_type_name,
            "payment_to_subtype_id" => $postData->payment_to_sub_type,
            "payment_to_subtype_name " => $postData->payment_to_subtype_name,
            "payment_frequency" => $postData->payment_frequency,
            "payment_frequency_name" => $postData->payment_frequency_name,
            "amount_paid_method" => $postData->amount_paid_method_name,
            "amount_paid_method_id " => $postData->amount_paid_method,
            "plant_code" => $postData->masterPlantId,
            "amount_budget" => $postData->amount_budget,
            "description" => $postData->description,
            "agreement_start_date" => $postData->agreement_start_date,
            "agreement_end_date" => $postData->agreement_end_date,
            "payment_date" => $postData->payment_date,
            "vendor" => $postData->vendor,
            "vendorname" => $postData->vendor_name,
            "account_number" => $postData->account_number,
            "account_ifsc_code" => $postData->account_ifsc,
            "status" => 1,
            "updated_by" => $postData->updated_by,
            "payment_times" => $postData->payment_times,
            "paybale_amount" => $postData->amount_per_payment,
            "agreement_copy" => $postData->Attachment,
            "mail_copy" => $postData->vendorEmailCopy,
        );
        // print_r($value);exit;
        $this->db->table('rec_payment_info')->where('rp_id', $postData->rp_id)->update($value);
        return $postData->rp_id;
    }
    public function updaterenwaldata($postData)
    {
        $value = array(
            "invoice_no " => $postData->invoice_no,
            "invoice_date " => $postData->invoice_date,
            "status " => 1,
            "amount" => $postData->amount,
            "difference_amount" => $postData->difference_amount,
            "invoice_attachment" => $postData->Invoice_Copy,
            "plant_code" => $postData->plant_code,
        );
        // print_r($value);exit;
        $this->db->table('rec_payment_details')->where('rpd_id', $postData->id)->update($value);
        return $postData->id;
    }
    public function shortCloseRecPayment($postData)
    {
        $value = array(
            "short_close_by" => $postData->short_close_by,
            "status" => 8,
            "short_close_at" => date('Y-m-d H:i:s'),
        );
        // print_r($value);exit;
        $this->db->table('rec_payment_info')->set($value)->where('rp_id ', $postData->rp_id)->update();
        return $postData->rp_id;
    }
}