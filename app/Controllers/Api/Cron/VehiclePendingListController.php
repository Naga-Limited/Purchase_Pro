<?php

namespace App\Controllers\Api\Cron;

use App\Controllers\BaseController;
use App\Models\CourierModel;
use CodeIgniter\I18n\Time;
use DateTime;

class VehiclePendingListController extends BaseController
{
    public function VehiclePendingList()
    {
        include_once APIPATH . "/db_connection.php";
        
        $usqls = "SELECT *
        FROM gate_entry_pending_automail
        WHERE status = 1 AND type = 1
        GROUP BY id";
        $result = mysqli_query($connect, $usqls);

        $results2 = [];  
        while ($row = mysqli_fetch_assoc($result)) {
            $results2[] = $row;
        }  
        foreach ($results2 as $details) {
            
            $to_mail = [];
            $cc_mail = [];
            $bcc_mail = [];
            $plant_id = [];

         
            $to_mail = array_merge($to_mail, explode(',', $details['to_mail']));
            $cc_mail = array_merge($cc_mail, explode(',', $details['cc_mail']));
            $bcc_mail = array_merge($bcc_mail, explode(',', $details['bcc_mail']));
            $plant_id[] = $details['plant_id'];

            $to_mail = array_unique($to_mail);
            $cc_mail = array_unique($cc_mail);
            $bcc_mail = array_unique($bcc_mail);
            


                $usqls3 = "SELECT 
                gi.id,gi.userGateId,gi.vehicleNo,gi.vaNumber,gi.masterPlantId,gi.createdBy,CONCAT(mp.WERKS, '-', mp.PLANT_NAME) AS PlantDetails,gi.createdOn, CONCAT(
                TIMESTAMPDIFF(MONTH, gi.createdOn, NOW()), ' Months ', 
                MOD(TIMESTAMPDIFF(DAY, gi.createdOn, NOW()), 30), ' Days ',  -- Days (using MOD to get the remaining days after months)
                MOD(TIMESTAMPDIFF(HOUR, gi.createdOn, NOW()), 24), ' Hr ',  -- Hours (using MOD to get the remaining hours after days)
                MOD(TIMESTAMPDIFF(MINUTE, gi.createdOn, NOW()), 60), ' Mins'  -- Minutes (using MOD to get the remaining minutes after hours)
                ) AS Duration,
                mm.moduleType,
                mt.movementType,
                ui.FIRST_NAME,
                lui.FIRST_NAME as Person,
                wui.FIRST_NAME as Weighment,
                gi.moduleStatusId,
                ms.statusName,
                DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS createdOn
                FROM gate_in_out_info gi
                JOIN master_plant mp ON gi.masterPlantId=mp.ID 
                JOIN master_module mm ON gi.moduleType=mm.id
                JOIN movement_type mt ON gi.movementType=mt.id
                JOIN user_info ui ON gi.createdBy=ui.UI_ID
                JOIN module_status ms ON gi.waitingAt=ms.id
                LEFT JOIN loading_unloading_info li ON gi.loadingUnloadingInfoId=li.id
                LEFT JOIN user_info lui ON li.createdBy=lui.UI_ID
                LEFT JOIN weighment_info wi ON gi.id=wi.gateInOutInfoId
                LEFT JOIN user_info wui ON wi.createdBy=wui.UI_ID
                WHERE gi.moduleStatusId NOT IN(5,7,10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY gi.id";
                $result1 = mysqli_query($connect, $usqls3);
                $results = [];
                while ($row = mysqli_fetch_assoc($result1)) {
                    if($row['moduleStatusId'] == 0){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 1){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 2){
                        $row['contact_person']=$row['Weighment'];
                    }else if($row['moduleStatusId'] == 3 && isset($row['Person'])){
                        $row['contact_person']=$row['Person'];
                    }else if($row['moduleStatusId'] == 3){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 4){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 12){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }
                    $results[] = $row;
                }

                $counts_sql = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.masterPlantId IN ($plant_id[0])
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY)
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                ";

                $counts_result = mysqli_query($connect, $counts_sql);

                $count_data = [
                    'general' => [],
                    'status_5_10' => [],
                    'status_7' => [],
                    'pending' => []
                ];

                while ($row = mysqli_fetch_assoc($counts_result)) {
                    $count_data['general'][$row['period']][] = $row;
                }

                $counts_status_5_10_sql = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE (YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0]))
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12 AND gi.masterPlantId IN ($plant_id[0]))
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) 
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month        
                ";

                $counts_status_5_10_result = mysqli_query($connect, $counts_status_5_10_sql);

                while ($row = mysqli_fetch_assoc($counts_status_5_10_result)) {
                    $count_data['status_5_10'][$row['period']] = $row; // Store counts by period
                }

                $counts_status_7_sql = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE (YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0]))
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12 AND gi.masterPlantId IN ($plant_id[0]))
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) 
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month        
                ";

                $counts_status_7_result = mysqli_query($connect, $counts_status_7_sql);

                // Process counts for status 7
                while ($row = mysqli_fetch_assoc($counts_status_7_result)) {
                    $count_data['status_7'][$row['period']] = $row; // Store counts by period
                }
                $pending_count = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE (YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0]))
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12 AND gi.masterPlantId IN ($plant_id[0]))
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) 
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month        
                ";

                $pending_count = mysqli_query($connect, $pending_count);

                // Process counts for status 7
                while ($row = mysqli_fetch_assoc($pending_count)) {
                    $count_data['pending'][$row['period']] = $row; // Store counts by period
                }
                $merged_data = [];

                $general = $count_data['general'];
                $status_5_10[] = $count_data['status_5_10'];
                $status_7[] = $count_data['status_7'];
                $pending[]= $count_data['pending'];      
                $merged_data = [];
                $periods = ['day', 'current_week','last_week', 'current_month','last_month', 'year', 'last_year'];

                    foreach ($periods as $period) {
                        // Initialize an array to store the merged data for the current period
                        $merged_row = [
                            'period' => ucfirst($period), // Capitalize the period name
                            'date_or_month' => '',
                            'general_count' => 0,
                            'status_5_10_count' => 0,
                            'status_7_count' => 0,
                            'pending_count' => 0
                        ];
                        
                        if (isset($count_data['general'][$period])) {
                            $merged_row['general_count'] = $count_data['general'][$period][0]['count'];
                            $merged_row['date_or_month'] = $count_data['general'][$period][0]['date_or_month'];
                        }
                        if (isset($count_data['status_5_10'][$period])) {
                            $merged_row['status_5_10_count'] = $count_data['status_5_10'][$period]['count'];
                        }
                        if (isset($count_data['status_7'][$period])) {
                            $merged_row['status_7_count'] = $count_data['status_7'][$period]['count'];
                        }
                        if (isset($count_data['pending'][$period])) {
                            $merged_row['pending_count'] = $count_data['pending'][$period]['count'];
                        }

                        // Add the merged row to the merged_data array
                        $merged_data[] = $merged_row;
                    }
                ksort($merged_data);

                $results1 = [];
                
               
                    // $ccmail = ['mariavanarajs@nagamills.com'];
                    $subject = 'Gate Entry Details - ' . $details['division'];
                    $message = '<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            /* Mobile Styles */
                            @media only screen and (max-width: 600px) {
                                table {
                                    width: 100% !important;
                                }
                                .container {
                                    width: 100% !important;
                                    padding: 0 10px;
                                }
                            }
                            .container {
                                width: 100%;
                                margin: 0 auto;
                                font-family: Arial, sans-serif;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 20px 0;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: center;
                            }
                            th {
                                background-color: #1656f7;
                                color: white;
                            }
                            
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1 style="text-align:center; color:#1656f7;">Dashboard Report</h1>
                            <p>Dear Team,</p>
                            <p>Please find below the summary of vehicle inward and outward:</p>';
                
                    // General Counts Section
                    $message .= '<h2>Over All Count Details</h2>
                        <table>
                        <tr><th>Period</th><th>Date or Month</th><th>Completed Count</th><th>Reject</th><th>Pending Count</th><th>Total Count</th></tr>';
                    foreach ($merged_data as $row) {
                    

                        $message .= '<tr>
                                        <td style="background-color: #a6bfed">' . $row['period'].'</td>
                                        <td style="background-color: #a6bfed">' . $row['date_or_month'] . '</td>
                                        <td style="background-color: #3bdb3b">' . $row['status_5_10_count'] . '</td>
                                        <td style="background-color: #e6e225">' . $row['status_7_count'] . '</td>
                                        <td style="background-color: #f54764">' . $row['pending_count'] . '</td>
                                        <td style="background-color: #a6bfed">' . $row['general_count'] . '</td>
                                    </tr>';
                    }
                    $message .= '</table>';
                
                    
                    // Vehicle Details Section
                    $message .= '<h2>Gate Inward Outward Pending Details</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>VA No</th>
                                    <th>Created</th>
                                    <th>Vehicle No</th>
                                    <th>Plant Name</th>
                                    <th>Module</th>
                                    <th>Duration</th>
                                    <th>Waiting At</th>
                                    <th>Entry Res. Person</th>
                                </tr>
                            </thead>
                            <tbody>';
                    foreach ($results as $row) {
                        $message .= '<tr>
                                        <td>' . htmlspecialchars($row['vaNumber']) . '</td>
                                        <td>' . htmlspecialchars($row['createdOn']) . '</td>
                                        <td>' . htmlspecialchars($row['vehicleNo']) . '</td>
                                        <td>' . htmlspecialchars($row['PlantDetails']) . '</td>
                                        <td>' . htmlspecialchars($row['moduleType']) . '</td>
                                        <td>' . htmlspecialchars($row['Duration']) . '</td>
                                        <td>' . htmlspecialchars($row['statusName']) . '</td>
                                        <td>' . htmlspecialchars($row['contact_person']) . '</td>
                                    </tr>';
                    }
                    $message .= '</tbody></table>';
                
                    // Closing message
                    $message .= '<p style="font-size: 0.9em;">For contact, please reach out to the respective person.</p>
                        <br/>
                        <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p>
                        </div>
                    </body>
                    </html>';
                        
                 

                        $email = \Config\Services::email();
                        $email->setFrom("noreply@nagamills.com", 'GATE PENDING LIST');
                        $email->setTo($to_mail);
                        $email->setBcc($bcc_mail);
                        $email->setCc($cc_mail);
                        $email->setSubject($subject);
                        $email->setMessage($message);
                        $email->send();
         
        }
  }

  public function MigoPendingList()
    {
        include_once APIPATH . '/db_connection.php';

        $query = "SELECT * FROM gate_entry_pending_automail WHERE status = 1 AND type = 2 AND po_type IS NOT NULL GROUP BY id";
        $res = mysqli_query($connect, $query);
        if (!$res) return;

        while ($details = mysqli_fetch_assoc($res)) {
            $to_mail = array_values(array_filter(array_unique(array_map('trim', explode(',', $details['to_mail'])))));
            $cc_mail = array_values(array_filter(array_unique(array_map('trim', explode(',', $details['cc_mail'])))));
            $bcc_mail = array_values(array_filter(array_unique(array_map('trim', explode(',', $details['bcc_mail'])))));

            $plant = $details['plant_id'];
            $poType = $details['po_type'];
	    $division = $details['division'];
	    	
            // Fetch bounded set of recent POs (limit to reduce load and email size)
            $detailSql = "SELECT 
                po.id, gi.vehicleNo, gi.vaNumber, gi.masterPlantId, CONCAT(mp.WERKS, '-', mp.PLANT_NAME) AS PlantDetails,
                mm.moduleType, po.poNumber, po.invoiceNo, po.vendorCode, po.vendorName, po.migoNumber,
                gi.waitingAt, ms.statusName, CONCAT(pt.type, '-', pt.name) AS po_type,
                DATE_FORMAT(po.dateStamp, '%d-%m-%Y') AS createdOn,
                DATE_FORMAT(gi.gateInDateStamp, '%d-%m-%Y %H:%i:%s') AS gateInDateStamp,
                DATE_FORMAT(gi.gateOutDateStamp, '%d-%m-%Y %H:%i:%s') AS gateOutDateStamp,
                DATE_FORMAT(po.documentDate, '%d-%m-%Y') AS poDate, DATE_FORMAT(po.migoDate, '%d-%m-%Y') AS migoDate
                FROM purchase_order po
                JOIN gate_in_out_info gi ON po.loadingUnloadingInfoId = gi.loadingUnloadingInfoId
                JOIN master_plant mp ON gi.masterPlantId = mp.ID
                JOIN master_module mm ON gi.moduleType = mm.id
                JOIN po_type pt ON po.poType = pt.id
                JOIN module_status ms ON gi.waitingAt = ms.id
                WHERE gi.waitingAt NOT IN (7,8,13)
                AND gi.masterPlantId IN ($plant)
                AND po.poType IN ($poType)
                AND po.dateStamp > '2024-07-01'
                GROUP BY po.id
                ORDER BY po.dateStamp DESC
                LIMIT 500";

            $detailRes = mysqli_query($connect, $detailSql);
            $rows = [];
            while ($r = mysqli_fetch_assoc($detailRes)) $rows[] = $r;

            // Single aggregated query to fetch per-period and per-status counts in one DB roundtrip
            $countsSql = "SELECT
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND gi.dateStamp < CURDATE() AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_day,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND gi.dateStamp < CURDATE() AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_day,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND gi.dateStamp < CURDATE() AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_day,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND gi.dateStamp < CURDATE() AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_day,

                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_current_month,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_current_month,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_current_month,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_current_month,

                SUM(CASE WHEN ((YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1) OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)) AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_last_month,
                SUM(CASE WHEN ((YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1) OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)) AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_last_month,
                SUM(CASE WHEN ((YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1) OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)) AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_last_month,
                SUM(CASE WHEN ((YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1) OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)) AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_last_month,

                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_current_week,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_current_week,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_current_week,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_current_week,

                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_last_week,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_last_week,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_last_week,
                SUM(CASE WHEN gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_last_week,

                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_year,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_year,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_year,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_year,

                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND go.waitingAt IN (1,2,3,4,5,7,8,10) THEN 1 ELSE 0 END) AS general_last_year,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND go.waitingAt IN (8) THEN 1 ELSE 0 END) AS status10_last_year,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND go.waitingAt IN (7) THEN 1 ELSE 0 END) AS status7_last_year,
                SUM(CASE WHEN YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND go.waitingAt IN (1,2,3,4,5,10) THEN 1 ELSE 0 END) AS pending_last_year
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE go.masterPlantId IN ($plant)
                AND gi.poType IN ($poType)
                AND gi.dateStamp > '2024-07-01'";

            $countsRes = mysqli_query($connect, $countsSql);
            $countsRow = $countsRes ? mysqli_fetch_assoc($countsRes) : [];

            $counts = [
                'day'           => (int) ($countsRow['general_day'] ?? 0),
                'current_month' => (int) ($countsRow['general_current_month'] ?? 0),
                'last_month'    => (int) ($countsRow['general_last_month'] ?? 0),
                'current_week'  => (int) ($countsRow['general_current_week'] ?? 0),
                'last_week'     => (int) ($countsRow['general_last_week'] ?? 0),
                'year'          => (int) ($countsRow['general_year'] ?? 0),
                'last_year'     => (int) ($countsRow['general_last_year'] ?? 0),
                'pending'       => (int) ($countsRow['pending_day'] ?? 0),
                'status_10'     => (int) ($countsRow['status10_day'] ?? 0),
                'status_7'      => (int) ($countsRow['status7_day'] ?? 0),
            ];

            // Build email subject and body
            $subject = 'MIGO Entry Details - ' . $division;
            $message = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;text-align:left;}th{background:#1656f7;color:#fff;}</style></head><body>';
            $message .= '<h1 style="text-align:center; color:#1656f7;">Dashboard Report</h1>
                            <p>Dear Team,</p>
                            <p>Please find below the summary of vehicle inward and outward:</p>';

            $periods = [
                'day'           => 'Day',
                'current_month' => 'Current Month',
                'last_month'    => 'Last Month',
                'current_week'  => 'Current Week',
                'last_week'     => 'Last Week',
                'year'          => 'Year',
                'last_year'     => 'Last Year'
            ];

            $date_or_month = [];
            $date_or_month['day']           = date('d-m-Y', strtotime('-1 day'));
            $date_or_month['current_month'] = date('m-Y');
            $date_or_month['last_month']    = date('m-Y', strtotime('first day of -1 month'));
            $date_or_month['current_week']  = date('o') . '-W' . date('W');
            $date_or_month['last_week']     = date('o', strtotime('-7 days')) . '-W' . date('W', strtotime('-7 days'));
            $date_or_month['year']          = date('Y');
            $date_or_month['last_year']     = date('Y', strtotime('-1 year'));

            $message .= '<h2>Over All Count Details</h2>';
            $message .= '<table>';
            $message .= '<tr><th>Period</th><th>Date or Month</th><th>Completed Count</th><th>Reject</th><th>Pending Count</th><th>Total Count</th></tr>';

            foreach (array_keys($periods) as $key) {
                $general_val  = isset($countsRow['general_' . $key])  ? (int) $countsRow['general_' . $key]  : 0;
                $status10_val = isset($countsRow['status10_' . $key]) ? (int) $countsRow['status10_' . $key] : 0;
                $status7_val  = isset($countsRow['status7_' . $key])  ? (int) $countsRow['status7_' . $key]  : 0;
                $pending_val  = isset($countsRow['pending_' . $key])  ? (int) $countsRow['pending_' . $key]  : 0;

                $message .= '<tr>';
                $message .= '<td style="background-color: #a6bfed">' . htmlspecialchars(ucfirst(str_replace('_', ' ', $key))) . '</td>';
                $message .= '<td style="background-color: #a6bfed">' . ($date_or_month[$key] ?? '') . '</td>';
                $message .= '<td style="background-color: #3bdb3b">' . $status10_val . '</td>';
                $message .= '<td style="background-color: #e6e225">' . $status7_val . '</td>';
                $message .= '<td style="background-color: #f54764">' . $pending_val . '</td>';
                $message .= '<td style="background-color: #a6bfed">' . $general_val . '</td>';
                $message .= '</tr>';
            }

            $message .= '</table>';

            $message .= '<h3>Recent Pending Entries</h3>';
            $message .= '<table><thead><tr><th>VA No</th><th>Gate In</th><th>Gate Out</th><th>PO No</th><th>Vehicle</th><th>Invoice</th><th>Vendor</th><th>Status</th></tr></thead><tbody>';
            foreach ($rows as $r) {
                $message .= '<tr>';
                $message .= '<td>' . htmlspecialchars($r['vaNumber'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['gateInDateStamp'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['gateOutDateStamp'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['poNumber'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['vehicleNo'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['invoiceNo'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['vendorName'] ?? '') . '</td>';
                $message .= '<td>' . htmlspecialchars($r['statusName'] ?? '') . '</td>';
                $message .= '</tr>';
            }
            $message .= '</tbody></table>';
            $message .= '<p style="font-size:0.9em;">Regards,<br/>Naga Limited</p>';
            $message .= '</body></html>';
            // print_r($message);exit; // Debug: Check the email content before sending
            $email = \Config\Services::email();
            $email->setFrom('noreply@nagamills.com', 'MIGO Entry Details');
            if (!empty($to_mail)) $email->setTo($to_mail);
            if (!empty($cc_mail)) $email->setCc($cc_mail);
            if (!empty($bcc_mail)) $email->setBcc($bcc_mail);
            $email->setSubject($subject);
            $email->setMessage($message);
            $email->send();
        }
    }
    
    public function TruckContainerPosition()
    {
        $model = new CourierModel();
        $latestDetail = $model->TruckContainerPosition();
        $mailData = $model->getsilotruckandcontainermail();
       
        // Step 1: Extract relevant data 
        $to_mail = [];
        $cc_mail = [];
        $bcc_mail = [];

        $to_mail = array_merge($to_mail, explode(',', $mailData[0]['to_mail']));
        $cc_mail = array_merge($cc_mail, explode(',', $mailData[0]['cc_mail']));
        $bcc_mail = array_merge($bcc_mail, explode(',', $mailData[0]['bcc_mail']));

        $to_mail = array_unique($to_mail);
        $cc_mail = array_unique($cc_mail);
        $bcc_mail = array_unique($bcc_mail);

        $lastFourDaysData = $latestDetail['last_4_days'];
        $oldDataSummary = $latestDetail['more_than_4_days'];
        $specialCountsLast4 = $latestDetail['arrived_countl4'];
        $specialCountsMore4 = $latestDetail['arrived_countm4'];

        // Step 2: Sort data by DateAdded in descending order 
        usort($lastFourDaysData, function ($a, $b) {
            return strtotime($b['DateAdded']) - strtotime($a['DateAdded']);
        });

        // Step 3: Initialize data structure 
        $groupedData = [];
        $containerData = [];
        $specialContainerCount = [];
        $dates = [];

        $today = new DateTime();
        for ($i = 0; $i < 4; $i++) {
            $dateKey = 'day' . ($i + 1);
            $dates[$dateKey] = $today->format('Y-m-d');
            $groupedData[$dateKey] = ['waiting_in' => 0, 'gate_out' => 0, 'migo_approval' => 0];
            $containerData[$dateKey] = ['waiting_in' => 0, 'gate_out' => 0, 'migo_approval' => 0];
            $specialContainerCount[$dateKey] = 0; // Initialize special count
            $today->modify('-1 day');
        }

        // Step 4: Process each record and map it to the correct day 
        foreach ($lastFourDaysData as $detail) {
            $recordDate = date('Y-m-d', strtotime($detail['DateAdded']));
            foreach ($dates as $dayKey => $date) {
                if ($recordDate === $date) {
                    $groupedData[$dayKey]['waiting_in'] += $detail['truck_gate_in_waiting'];
                    $groupedData[$dayKey]['gate_out'] += $detail['truck_gate_out'];
                    $groupedData[$dayKey]['migo_approval'] += $detail['truck_migo_approval'];

                    $containerData[$dayKey]['waiting_in'] += $detail['container_gate_in_waiting'];
                    $containerData[$dayKey]['gate_out'] += $detail['container_gate_out'];
                    $containerData[$dayKey]['migo_approval'] += $detail['container_migo_approval'];
                }
            }
        }

        // Process Special Container Count for last 4 days
        foreach ($specialCountsLast4 as $countData) {
            $recordDate = $countData['date_modified'];
            foreach ($dates as $dayKey => $date) {
                if ($recordDate === $date) {
                    $specialContainerCount[$dayKey] = $countData['container_special_count_last4'];
                }
            }
        }
        $specialContainerCountMore4 = $specialCountsMore4['container_special_count_more4']?? 0;
        $subject = 'Vehicle Details - ' . $mailData[0]['division'];
        // Step 5: Generate HTML Email Template 
        $message = '<!DOCTYPE html> 
    <html lang="en"> 
    <head> 
        <meta charset="UTF-8"> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <style> 
            table { width: 100%; border-collapse: collapse; border: 1px solid #ccc; } 
            th, td { border: 1px solid #ddd; padding: 6px; text-align: center; } 
            th { background-color: #1656f7; color: white; } 
        </style> 
    </head> 
    <body> 
        <p style="font-size: 1.1em;">Dear Team,</p> 
        <p>Please find below the Truck & Container Position details for the last 4 days.</p> 
     
        <h3>Truck Positions</h3> 
        <table> 
            <thead> 
                <tr> 
                    <th>Position</th> 
                    <th>Day 1 (' . $dates['day1'] . ')</th> 
                    <th>Day 2 (' . $dates['day2'] . ')</th> 
                    <th>Day 3 (' . $dates['day3'] . ')</th> 
                    <th>Day 4 (' . $dates['day4'] . ')</th> 
                    <th>More than 4 Days</th> 
                </tr> 
            </thead> 
            <tbody> 
                <tr> 
                    <td><strong>Waiting In</strong></td> 
                    <td>' . $groupedData['day1']['waiting_in'] . '</td> 
                    <td>' . $groupedData['day2']['waiting_in'] . '</td> 
                    <td>' . $groupedData['day3']['waiting_in'] . '</td> 
                    <td>' . $groupedData['day4']['waiting_in'] . '</td> 
                    <td>' . $oldDataSummary['truck_gate_in_waiting_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Gate Out Completed</strong></td> 
                    <td>' . $groupedData['day1']['gate_out'] . '</td> 
                    <td>' . $groupedData['day2']['gate_out'] . '</td> 
                    <td>' . $groupedData['day3']['gate_out'] . '</td> 
                    <td>' . $groupedData['day4']['gate_out'] . '</td> 
                    <td>' . $oldDataSummary['truck_gate_out_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Migo Approval Completed</strong></td> 
                    <td>' . $groupedData['day1']['migo_approval'] . '</td> 
                    <td>' . $groupedData['day2']['migo_approval'] . '</td> 
                    <td>' . $groupedData['day3']['migo_approval'] . '</td> 
                    <td>' . $groupedData['day4']['migo_approval'] . '</td> 
                    <td>' . $oldDataSummary['truck_migo_approval_more4'] . '</td> 
                </tr> 
            </tbody> 
        </table> 
     
        <h3>Container Positions</h3> 
        <table> 
            <thead> 
                <tr> 
                    <th>Position</th> 
                    <th>Day 1 (' . $dates['day1'] . ')</th> 
                    <th>Day 2 (' . $dates['day2'] . ')</th> 
                    <th>Day 3 (' . $dates['day3'] . ')</th> 
                    <th>Day 4 (' . $dates['day4'] . ')</th> 
                    <th>More than 4 Days</th> 
                </tr> 
            </thead> 
            <tbody> 
                <tr> 
                    <td><strong>Arrived at Tutiorin	</strong></td> 
                    <td>' . $specialContainerCount['day1'] . '</td>
                <td>' . $specialContainerCount['day2'] . '</td>
                <td>' . $specialContainerCount['day3'] . '</td>
                <td>' . $specialContainerCount['day4'] . '</td>
                <td>' . $specialContainerCountMore4 . '</td>
                </tr> 
                 <tr> 
                    <td><strong>Waiting In</strong></td> 
                    <td>' . $containerData['day1']['waiting_in'] . '</td> 
                    <td>' . $containerData['day2']['waiting_in'] . '</td> 
                    <td>' . $containerData['day3']['waiting_in'] . '</td> 
                    <td>' . $containerData['day4']['waiting_in'] . '</td> 
                    <td>' . $oldDataSummary['container_gate_in_waiting_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Gate Out Completed</strong></td> 
                    <td>' . $containerData['day1']['gate_out'] . '</td> 
                    <td>' . $containerData['day2']['gate_out'] . '</td> 
                    <td>' . $containerData['day3']['gate_out'] . '</td> 
                    <td>' . $containerData['day4']['gate_out'] . '</td> 
                    <td>' . $oldDataSummary['container_gate_out_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Migo Approval Completed</strong></td> 
                    <td>' . $containerData['day1']['migo_approval'] . '</td> 
                    <td>' . $containerData['day2']['migo_approval'] . '</td> 
                    <td>' . $containerData['day3']['migo_approval'] . '</td> 
                    <td>' . $containerData['day4']['migo_approval'] . '</td> 
                    <td>' . $oldDataSummary['container_migo_approval_more4'] . '</td> 
                </tr> 
            </tbody> 
        </table> 
    </body> 
    </html>';
        // print_r($message);
        // exit;

        // Step 6: Send email 
        $email = \Config\Services::email();
        $email->setFrom("noreply@nagamills.com", 'Vehicle Info');
        $email->setTo($to_mail);
        $email->setBcc($bcc_mail);
        $email->setCc($cc_mail);
        $email->setSubject($subject);
        $email->setMessage($message);
        $email->send();
      
    }
}
