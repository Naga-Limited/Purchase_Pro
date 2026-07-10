<?php

include_once APIPATH . "/helper/sessionHelper.php";
//include DB File
include_once APIPATH . "/db_connection.php";
include_once APIPATH . "/helper/appHelper.php";
$raw_text = file_get_contents("php://input");
$raw_text = trim($raw_text);
$raw_text=stripslashes(html_entity_decode($raw_text));
//$raw_text=rtrim($raw_text, "\0");
$raw_text=preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $raw_text);
//$raw_text=str_replace("\t", " ", str_replace("\n", " ", $raw_text));
//$raw_text = trim($raw_text,"[]");
$Client_IP = getIpAddress();
$RequestIP1 = '192.168.1.168'; 
$RequestIP2 = '20.198.120.60'; 
$RequestIP3 = '172.16.63.100'; 
$RequestIP4 = '192.168.1.225'; 
//echo $raw_text ;
$postContent = json_decode($raw_text);

// var_dump($postContent);
$failure_response = array("pp_status" => "2", "pp_desc" => "FAILURE", "pp_error_msg" => "Invalid requested IP");
$success_response = array("pp_status" => "1", "pp_tripsheet" => "", "pp_desc" => "SUCCESS", "pp_error_msg" => "");

if (isset($postContent) && $postContent != null && !empty($postContent) ) {
    //echo "IP=>".$_SERVER['REMOTE_ADDR']."> x".$_SERVER['HTTP_CLIENT_IP'] ." 2 ".$_SERVER['HTTP_X_FORWARDED_FOR']  ;
    // if ($Client_IP != $RequestIP1 && $Client_IP != $RequestIP2 && $Client_IP != $RequestIP3 && $Client_IP != $RequestIP4 ) {
    //     $failure_response["pp_error_msg"] = "Invalid requested IP ".$Client_IP;
    //     echo json_encode($failure_response);
    //     return;
    // }

    echo json_encode(updateTripSheet($connect, $postContent));

} else {
    $failure_response["pp_error_msg"] = "No Inputs received Or Invalid Format";
    echo json_encode($failure_response);
    return;
}
$connect->close();

function updateTripSheet($connect, $record)
{
    global $failure_response, $success_response;
    $CurrentTime = date("d-m-Y H:i:s") . "\n";
    $Debug = 0;
    if ($Debug == 1) {
        echo $CurrentTime;
    }
    $i = 0;
    if ($i < sizeof($record)) {
        $sql = "select vehicle_no, tripsheet_no  from ngw_tripsheet_vehicles where vehicle_no = '" . $record[$i]->VEHICLE_NO . "' and process_type='START'";
        $result = mysqli_query($connect, $sql);
        
        if ($record[$i]->PROCESS_TYPE == "START") {
            //NEW RECORD
            if (mysqli_num_rows($result) > 0 && $row = mysqli_fetch_array($result)) {
                $failure_response["pp_error_msg"] = "Vehicle already in Start Status for " . $row["tripsheet_no"];
                return $failure_response;
            }

            $sql = "INSERT INTO `ngw_tripsheet_vehicles`(`tripsheet_no`, `vehicle_no`, `vehicle_type`, `driver_name`, `driver_mobile_no`, 
            `process_type`, `start_date`, `request_ip`) 
            VALUES ('" . $record[$i]->TRIPSHEET_NO . "','" . $record[$i]->VEHICLE_NO . "','" . $record[$i]->VEHICLE_TYPE . "', 
            '" . $record[$i]->DRIVER_NAME . "','" . $record[$i]->DRIVER_MOBILE_NO . "','" . $record[$i]->PROCESS_TYPE . "',current_timestamp,
            '" . $_SERVER['REMOTE_ADDR'] . "')";
//echo $sql;// exit();

            if ($result = mysqli_query($connect, $sql)) {
                $success_response["pp_tripsheet"] = $record[$i]->TRIPSHEET_NO;
                return $success_response;
            } else {
                $failure_response["pp_error_msg"] = "Unable to insert into DB for " . $record[$i]->TRIPSHEET_NO . " " . $record[$i]->VEHICLE_NO;
                return $failure_response;
            }
        } else if ($record[$i]->PROCESS_TYPE == "STOP") {
            
            $sql = "Update `ngw_tripsheet_vehicles` set process_type = '" . $record[$i]->PROCESS_TYPE . "', stop_date=current_timestamp 
            where vehicle_no = '" . $record[$i]->VEHICLE_NO . "'";

            if ($result = mysqli_query($connect, $sql)) {
                $success_response["pp_tripsheet"] = $record[$i]->TRIPSHEET_NO;
                return $success_response;
            } else {
                $failure_response["pp_error_msg"] = "Unable to insert into DB for " . $record[$i]->TRIPSHEET_NO . " " . $record[$i]->VEHICLE_NO;
                return $failure_response;
            }

        }
        $failure_response["pp_error_msg"] = "Invalid Process Type for " . $record[$i]->TRIPSHEET_NO . " " . $record[$i]->VEHICLE_NO;
        return $failure_response;
    } else {
        $failure_response["pp_error_msg"] = "Empty Request content";
        return $failure_response;
    }
}

function getIpAddress()
{
    $ipAddress = '';
    if (! empty($_SERVER['HTTP_CLIENT_IP'])) {
        // to get shared ISP IP address
        $ipAddress = $_SERVER['HTTP_CLIENT_IP'];
    } else if (! empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // check for IPs passing through proxy servers
        // check if multiple IP addresses are set and take the first one
        $ipAddressList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        foreach ($ipAddressList as $ip) {
            if (! empty($ip)) {
                // if you prefer, you can check for valid IP address here
                $ipAddress = $ip;
                break;
            }
        }
    } else if (! empty($_SERVER['HTTP_X_FORWARDED'])) {
        $ipAddress = $_SERVER['HTTP_X_FORWARDED'];
    } else if (! empty($_SERVER['HTTP_X_CLUSTER_CLIENT_IP'])) {
        $ipAddress = $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
    } else if (! empty($_SERVER['HTTP_FORWARDED_FOR'])) {
        $ipAddress = $_SERVER['HTTP_FORWARDED_FOR'];
    } else if (! empty($_SERVER['HTTP_FORWARDED'])) {
        $ipAddress = $_SERVER['HTTP_FORWARDED'];
    } else if (! empty($_SERVER['REMOTE_ADDR'])) {
        $ipAddress = $_SERVER['REMOTE_ADDR'];
    }
    return $ipAddress;
}

?>
