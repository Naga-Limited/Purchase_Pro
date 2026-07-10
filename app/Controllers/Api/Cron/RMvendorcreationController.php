<?php

namespace App\Controllers\Api\Cron;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;

class RMvendorcreationController extends BaseController
{
    public function CreateRMvendoruserid()
    {
        $db = db_connect();

        try {

            $sapHelper = new SapUrlHelper();
            $debug = false;

            // ✅ Fetch phone number and mail ID from definitions_list table
            $mobileNumberDef = $db->table('definitions_list')
                ->where('definitionsName', 'MOBILE NUMBER')
                ->where('definitionsId', 43)
                ->get()
                ->getRowArray();

            $mailIdDef = $db->table('definitions_list')
                ->where('definitionsName', 'MAIL ID')
                ->where('definitionsId', 43)
                ->get()
                ->getRowArray();

            $dateCountDef = $db->table('definitions_list')
                ->where('definitionsName', 'NUMBER OF DAYS')
                ->where('definitionsId', 43)
                ->get()
                ->getRowArray();

            $defaultPhoneNumber = $mobileNumberDef['definitionsvalues'] ?? '';
            $defaultMailId = $mailIdDef['definitionsvalues'] ?? '';
            $numberOfDays = max(1, (int) ($dateCountDef['definitionsvalues'] ?? 2));

            for ($offset = 0; $offset <= $numberOfDays; $offset++) {
                $date = date('Ymd', strtotime("-{$offset} day"));
                // ✅ SAP API URL
                $urlPath = "zrake/ZRake_migoappov/migoappove?sap-client=900&date=$date";

                // ✅ SAP API Call
                $rawResponse = $sapHelper->getWhDatas($urlPath);
                $res = json_decode($rawResponse, true);

                // ✅ Loop API response
                foreach ($res as $row) {

                    $vendorCode = trim($row['VENDOR_CODE'] ?? '');

                    $fullVendorName = trim($row['VENDOR_NAME'] ?? '');

                    // ✅ Remove GST/PAN after "-"
                    $vendorNameParts = explode('-', $fullVendorName);

                    $vendorName = trim($vendorNameParts[0]);

                    $phoneNumber = trim($row['PHONE_NUMBER'] ?? '');

                    // ✅ Use default phone number if SAP returns empty
                    if (empty($phoneNumber)) {
                        $phoneNumber = $defaultPhoneNumber;
                    }

                    // ✅ Skip empty vendor code
                    if ($vendorCode == '') {
                        continue;
                    }

                    // ✅ Check already exists
                    $existingUser = $db->table('user_info')
                        ->where('LOGIN_ID', $vendorCode)
                        ->where('RecStatus', 1)
                        ->get()
                        ->getRowArray();

                    // ✅ Skip if already exists
                    if ($existingUser) {
                        continue;
                    }

                    // ✅ Get Last SI_NO
                    $lastSino = $db->table('user_info')
                        ->select('SI_NO')
                        ->where('DESIGNATION', 'DE')
                        ->where('DEPARTMENT', 'VE')
                        ->orderBy('UI_ID', 'DESC')
                        ->get(1)
                        ->getRowArray();

                    // ✅ Generate Next SI_NO
                    if ($lastSino && !empty($lastSino['SI_NO'])) {

                        $siNo = (int) $lastSino['SI_NO'] + 1;

                    } else {

                        $siNo = 1;
                    }

                    // ✅ Insert Data
                    $insertData = [
                        'masterGateId' => 3,
                        'FIRST_NAME' => $vendorName,
                        'LOGIN_ID' => $vendorCode,
                        'PASSWORD' => md5('Welcomenaga'), // Consider using a more secure hashing method in production
                        'SI_NO' => $siNo,
                        'DESIGNATION' => 'DE',
                        'DEPARTMENT' => 'VE',
                        'CITY' => 'DG',
                        'STATE' => 'TN',
                        'USER_ROLE_ID' => 15,
                        'MOBILE_NUMBER' => $phoneNumber,
                        'OTP' => '',
                        'MAIL_ID' => $defaultMailId,
                        'EMP_CODE' => $vendorCode,
                        'USER_STATUS' => 1,
                        'InsBy' => 1,
                        'InsDt' => date('Y-m-d H:i:s'),
                        'ModBy' => '',
                        'ModDt' => null,
                        'LoginTime' => null,
                        'LogoutTime' => null,
                        'LoginStatus' => 0,
                        'expiry_date' => date('Y-m-d', strtotime('+3 months')),
                        'RecStatus' => 1
                    ];
                    // ✅ Insert into user_info DB
                    $db->table('user_info')->insert($insertData);
                    
                    // ✅ Get the inserted UI_ID
                    $insertedId = $db->insertID();

                    // ✅ Insert into master_user_screen table
                    $screenData = [
                        'USER_ID'  => $insertedId,
                        'SCREEN_ID' => 334,
                        'InsBy'    => 1,
                        'InsDt'    => date('Y-m-d H:i:s'),
                        'ModBy'    => '',
                        'ModDt'    => null,
                        'RecStatus' => 1
                    ];
                    $db->table('master_user_screen')->insert($screenData);
                }
            }

            return $this->response->setJSON([
                'status' => true,
                'message' => 'RM Vendor users created successfully'
            ]);

        } catch (\Throwable $e) {

            return $this->response->setJSON([
                'status' => false,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
        }
    }
}
