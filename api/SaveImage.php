<?php
$LocalTest=1;
date_default_timezone_set('Asia/Calcutta');
include_once(APIPATH.'/helper/fileHelper.php');
//echo "TEST";
    $server = '192.168.1.104';//'182.71.62.210' ;//Address of ftp server
    $user_name = 'Digi'; // Username
     $password = 'Digi@2021'; // Password

       

        $file_from = $_POST['form_name'];
$SubFolder="";
if(isset($_POST['SubFolder'])){
    if($_POST['SubFolder']!=""){
        $SubFolder=$_POST['SubFolder'];
    }
}
$VANumber="";
if(isset($_POST['VA_Number']) && $_POST['VA_Number']!="undefined"){
    $VANumber=$_POST['VA_Number'];
}

    $folderPath = "/Digigate/Digi/";    
    $localfolder = dirname(__FILE__)."./upload/"; 
    //$folderPath2 = "uploads/"; 
    $location="/Digigate/Purchasepro";

    if($LocalTest==0){
    $connection = ftp_connect($server); 
    ftp_login($connection, $user_name, $password);
    
    $folderPath2 = upload_folder_NAS($file_from,$SubFolder,$location,$connection);
    }
   
    $file_save_arr = array();
    for($i=0;$i<sizeof($_POST['image']);$i++){
    $img = $_POST['image'][$i]; 
    $image_parts = explode(";base64,", $img);
    $image_type_aux = explode("image/", $image_parts[0]);
    $image_type = $image_type_aux[1];
  
    $image_base64 = base64_decode($image_parts[1]);
    $fileName = uniqid() . '.jpg';
    $NAS_PATH = $folderPath2 . $fileName;   
    $LOCALPATH = $localfolder . $fileName;   
    //echo "<br>NAS PATH".$NAS_PATH;
    //echo "<br>LOCAL PATH".$LOCALPATH;
    file_put_contents($LOCALPATH, $image_base64);
  //   print_r($fileName);

     //echo "<br>TEST2".$folderPath2;
     //echo  "<Br>".$folderPath.$fileName;
     if($LocalTest==0){
  ftp_put($connection,$NAS_PATH,$LOCALPATH,FTP_BINARY);
  //echo "DONE";
    //echo  $connection,$folderPath.$fileName;
    ftp_close($connection); 
     }
    // file_put_contents($location.$fileName, $image_base64);
    //   print_r($fileName);
    if($LocalTest==0){
        $file_save_arr[$i]['updname']= $NAS_PATH; //NAS SERVER PATH
    }else{
        $file_save_arr[$i]['updname']= $LOCALPATH; //NAS SERVER PATH
    }
    

    }
    echo json_encode(["success"=>1, "files"=>$file_save_arr]);
  
?>