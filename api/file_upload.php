<?php
$LocalTest=1;
date_default_timezone_set('Asia/Calcutta');
include_once(APIPATH.'/helper/fileHelper.php');

//echo "tEST"; exit();
//var_dump($_FILES);  exit();

$file = $_FILES['file'];
$ponumber = $_POST['ponumber'];
$file_from = $_POST['form_name'];
$SubFolder="";

if(isset($_POST['SubFolder'])){
    if($_POST['SubFolder']!=""){
        $SubFolder=$_POST['SubFolder'];
    }
}

//if($SubFolder==""){$SubFolder="Sample";}
$VANumber="";
if(isset($_POST['VA_Number']) && $_POST['VA_Number']!="undefined"){
    $VANumber=$_POST['VA_Number'];
}

$date2 = date("YmdHis");
$filepath = upload_folder($file_from, SAP_FILE_PATH);
//$filepath = upload_folder($file_from,"../api/upload");
$filepath_NAS = "upload/";

//$filepath = upload_folder($file_from,"Z:/api/upload");
// print_r($filepath);exit;
$name_array = $file['name'];
$tmp_name_array = $file['tmp_name'];
$static_ponumber = preg_replace("/[^A-Za-z0-9. ]/", '', $ponumber);
if($VANumber!=""){
    $static_ponumber=$VANumber;
}
// var_dump($file);exit();

$count_tmp_name_array = count($tmp_name_array);
$file_save_arr = array();
$file_err_arr = array();
// var_dump($tmp_name_array);exit();

//Added 25092021 for save the file in NAS SERVER
$server = '192.168.1.104' ;//Address of ftp server
$user_name = 'Digi'; // Username
$password = 'Digi@2021'; // Password
$location = "/Digigate/Digi/NLFD/";
$location="/Digigate/Purchasepro";

$extension = pathinfo($name_array[$i], PATHINFO_EXTENSION);
if($LocalTest==0){
$connection = ftp_connect($server,21);  //Uncmt
ftp_login($connection, $user_name, $password);//Uncmt
$filepath_NAS = upload_folder_NAS($file_from,$SubFolder,$location,$connection);//Uncmt
}
// var_dump($tmp_name_array);exit();
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
        //NAS
        //$storepath_NAS = $location.$filepath_NAS . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
        $storepath_NAS = $filepath_NAS . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
        if($LocalTest==0){

            if(ftp_put($connection,$storepath_NAS,$tmp_name_array[$i],FTP_BINARY)){
                ////$file_save_arr[$i]['updname']= substr($storepath,7);
                ////$file_save_arr[$i]['orgname']=$name_array[$i];    
                //echo "NASDONE";
            }
        }
        
       // print_r($tmp_name_array[$i]);
    //    print_r($storepath);exit;

        move_uploaded_file($tmp_name_array[$i], $storepath);
        
        $file_save_arr[$i]['updname_OLDSERVER']= substr($storepath,7); //OLD SERVER //
        if($LocalTest==0){
            $file_save_arr[$i]['updname']= $storepath_NAS; //NAS SERVER PATH//Uncmt
        }else{
            $file_save_arr[$i]['updname']= substr($storepath,7); //OLD SERVER //Cmd
        }
        $file_save_arr[$i]['orgname']=$name_array[$i];
    }
}

if($LocalTest==0){
ftp_close($connection); //Uncmt
}
// var_dump($file_save_arr);exit();
if(count($file_save_arr)>0){
    // echo "Test"; exit();
    echo json_encode(["success"=>1, "files"=>$file_save_arr]);
}
else{
    // echo "Test 001"; exit();
    echo json_encode(["success"=>0,"files"=>$file_err_arr]);
}
?>