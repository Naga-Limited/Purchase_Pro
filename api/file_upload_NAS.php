<?php

date_default_timezone_set('Asia/Calcutta');
include_once(APIPATH.'/helper/fileHelper.php');
$file = $_FILES['file'];
$ponumber = $_POST['ponumber'];
$file_from = $_POST['form_name'];

//echo "TEST2";
//print_r($file);
echo "S2";


$date2 = date("YmdHis");
$filepath = upload_folder($file_from,"../api/upload");
$filepath_NAS = "upload/";
//$filepath = upload_folder($file_from,"Z:/api/upload");
//print_r($filepath);
$name_array = $file['name'];
$tmp_name_array = $file['tmp_name'];
$static_ponumber = preg_replace("/[^A-Za-z0-9. ]/", '', $ponumber);
echo "S3";

$count_tmp_name_array = count($tmp_name_array);
$file_save_arr = array();
$file_err_arr = array();
//Added 24092021 for upload the file into NAS Server
echo "S4";

$server = '192.168.1.104' ;//Address of ftp server
$user_name = 'Digi'; // Username
 $password = 'Digi@2021'; // Password
 $location = "/Digigate/Digi/NLFD/";
$extension = pathinfo($name_array[$i], PATHINFO_EXTENSION);
$connection = ftp_connect($server,21); 
echo "S5";

ftp_login($connection, $user_name, $password);

echo "S6";
//ftp_close($conn_id); 

/*$this->load->library("ftp");
$this->ftp->connect($config);
$this->ftp->close();*/
//exit();

for ($i = 0; $i < $count_tmp_name_array; $i++) {
    $extension = pathinfo($name_array[$i], PATHINFO_EXTENSION);
    $org_file_name = pathinfo($name_array[$i], PATHINFO_FILENAME);
    if (!in_array(strtolower($extension), ['csv','pdf','jpeg','png','jpg'])) {
        $file_err_arr[$i]['orgname']=$name_array[$i];
    } 
    else {
        $org_file_name = preg_replace("/[^A-Za-z0-9. ]/", '', $org_file_name);
        $org_file_name = str_replace(' ', '_',$org_file_name);        
        $storepath = $filepath . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
        $storepath_NAS = $location.$filepath_NAS . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
       // print_r($tmp_name_array[$i]);
       //echo "<Br>Y ".$storepath_NAS." X<Br>";
        
        //echo "Src=>".$tmp_name_array[$i];
        if(ftp_put($connection,$storepath_NAS,$tmp_name_array[$i],FTP_BINARY)){
            ////$file_save_arr[$i]['updname']= substr($storepath,7);
            ////$file_save_arr[$i]['orgname']=$name_array[$i];    
            //echo "NASDONE";
        }
        move_uploaded_file($tmp_name_array[$i], $storepath);
        $file_save_arr[$i]['updname']= substr($storepath,7);
        $file_save_arr[$i]['orgname']=$name_array[$i];
        //echo "TEST";
    }
}
ftp_close($conn_id); 

if(count($file_save_arr)>0){
    echo json_encode(["success"=>1, "files"=>$file_save_arr]);
}
else{
    echo json_encode(["success"=>0,"files"=>$file_err_arr]);
}

function FileUpload()
{

}
?>