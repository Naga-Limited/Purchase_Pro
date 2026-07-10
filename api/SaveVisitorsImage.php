<?php
$LocalTest = 1;
date_default_timezone_set('Asia/Calcutta');

include_once APIPATH . "/db_connection.php";
include_once(APIPATH . '/helper/fileHelper.php');

$server     = '192.168.1.104';
$user_name  = 'Digi';
$password   = 'Digi@2021';

$file_from  = $_POST['form_name'];
$SubFolder  = "";
$userInfoId = $_POST['userInfoId'];

// Fetch Gate Code
$fetchsql = "SELECT mg.gateCode 
             FROM user_info ui 
             LEFT JOIN master_gate mg ON ui.masterGateId = mg.id 
             WHERE ui.UI_ID = '$userInfoId'";
$result   = mysqli_query($connect, $fetchsql);
$getData  = mysqli_fetch_assoc($result);
$gateCode = $getData['gateCode'];

// Folder setup
$filepath = upload_folder($file_from, SAP_FILE_PATH);
// $filepath = upload_folder($file_from, "../api/upload");
$location = "/Digigate/Purchasepro";

if ($LocalTest == 0) {
    $connection = ftp_connect($server);
    ftp_login($connection, $user_name, $password);
    $folderPath2 = upload_folder_NAS($file_from, $SubFolder, $location, $connection);
}

$file_save_arr = [];
$file_err_arr  = [];

// ---------- File Upload Handling ----------
if (isset($_FILES['image']['name']) && is_array($_FILES['image']['name'])) {
    $name_array     = $_FILES['image']['name'];
    $tmp_name_array = $_FILES['image']['tmp_name'];
    $date2          = date("YmdHis");
    $static_ponumber = "PO"; // Adjust if needed
    $filepath_NAS   = $folderPath2 ?? '';

    for ($i = 0; $i < count($name_array); $i++) {
        $extension     = pathinfo($name_array[$i], PATHINFO_EXTENSION);
        $org_file_name = pathinfo($name_array[$i], PATHINFO_FILENAME);

        if (!in_array(strtolower($extension), ['csv', 'pdf', 'jpeg', 'png', 'jpg'])) {
            $file_err_arr[$i]['orgname'] = $name_array[$i];
            continue;
        }

        // Clean filename
        $org_file_name = preg_replace("/[^A-Za-z0-9. ]/", '', $org_file_name);
        $org_file_name = str_replace(' ', '_', $org_file_name);

        $storepath     = $filepath . $static_ponumber . "_" . $org_file_name . "-" . $date2 . "." . $extension;
        $storepath_NAS = $filepath_NAS . $static_ponumber . "_" . $org_file_name . "-" . $date2 . "." . $extension;

        // Save locally
        move_uploaded_file($tmp_name_array[$i], $storepath);

        // Save to NAS if enabled
        if ($LocalTest == 0) {
            ftp_put($connection, $storepath_NAS, $tmp_name_array[$i], FTP_BINARY);
        }

        // Return public + local path
        $public_url = str_replace('/var/www/purchasepro/sapfileshare', 'https://purchasepro.nagamills.com/sapfileshare', $storepath);

        $file_save_arr[] = [
            'updname'    => ($LocalTest == 0 ? $storepath_NAS : $public_url),
            'local_path' => $storepath,
            'orgname'    => $name_array[$i]
        ];
    }
}

// ---------- Base64 Upload Handling ----------
if (isset($_POST['image']) && is_array($_POST['image'])) {
    $date2 = date("YmdHis");
    for ($i = 0; $i < count($_POST['image']); $i++) {
        $img = $_POST['image'][$i];
        $image_parts = explode(";base64,", $img);
        $image_type_aux = explode("image/", $image_parts[0]);
        $image_type = $image_type_aux[1];
        $image_base64 = base64_decode($image_parts[1]);

        $fileName  = $gateCode . '_' . $date2 . '_' . $i . '.' . $image_type;
        $LOCALPATH = $filepath . $fileName;
        $NAS_PATH  = ($folderPath2 ?? '') . $fileName;

        // Save locally
        file_put_contents($LOCALPATH, $image_base64);

        // Save to NAS if enabled
        if ($LocalTest == 0) {
            ftp_put($connection, $NAS_PATH, $LOCALPATH, FTP_BINARY);
        }

        // Public URL
        $public_url = str_replace('/var/www/purchasepro/sapfileshare', 'https://purchasepro.nagamills.com/sapfileshare', $LOCALPATH);

        $file_save_arr[] = [
            'updname'    => ($LocalTest == 0 ? $NAS_PATH : $public_url),
            'local_path' => $LOCALPATH,
            'orgname'    => $fileName
        ];
    }
}

if ($LocalTest == 0) {
    ftp_close($connection);
}

// Output
if (count($file_save_arr) > 0) {
    echo json_encode(["success" => 1, "files" => $file_save_arr]);
} else {
    echo json_encode(["success" => 0, "files" => $file_err_arr]);
}
?>
