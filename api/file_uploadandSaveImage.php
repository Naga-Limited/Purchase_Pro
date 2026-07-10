<?php
//var_dump($_POST);
//var_dump($_FILES);
//exit();
//echo "start";
$LocalTest=1;
date_default_timezone_set('Asia/Calcutta');
include_once(APIPATH.'/helper/fileHelper.php');
$file = $_FILES['file'];
$ponumber = $_POST['ponumber'];
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

$date2 = date("YmdHis");
$filepath = upload_folder($file_from,"../api/upload");
$filepath_NAS = "upload/";

$name_array = $file['name'];
$tmp_name_array = $file['tmp_name'];
$static_ponumber = preg_replace("/[^A-Za-z0-9. ]/", '', $ponumber);
if($VANumber!=""){
    $static_ponumber=$VANumber;
}


//var_dump($tmp_name_array);
//exit();

//$count_tmp_name_array = count($tmp_name_array);
//echo "test";exit();
$file_save_arr = array();
$file_err_arr = array();


//Added 25092021 for save the file in NAS SERVER
$server = '192.168.1.104' ;//Address of ftp server
$user_name = 'Digi'; // Username
$password = 'Digi@2021'; // Password
$location = "/Digigate/Digi/NLFD/";
$location="/Digigate/Purchasepro";


if($LocalTest==0){
$connection = ftp_connect($server,21); 

ftp_login($connection, $user_name, $password); //uncomment
$filepath_NAS = upload_folder_NAS($file_from,$SubFolder,$location,$connection);//uncomment
}
$FileIndex=0;
for($i=0;$i<sizeof($_POST['image']);$i++){
   // $NAS_PATH="";
    if($_POST['image'][$i]=="undefined" || $_POST['image'][$i]==null){
    
        $extension = pathinfo($name_array[$FileIndex], PATHINFO_EXTENSION);
    $org_file_name = pathinfo($name_array[$FileIndex], PATHINFO_FILENAME);
    if (!in_array(strtolower($extension), ['csv','pdf','jpeg','png','jpg'])) {
        $file_err_arr[$i]['orgname']=$name_array[$FileIndex];
    } 
    else {
        
        $org_file_name = preg_replace("/[^A-Za-z0-9. ]/", '', $org_file_name);
     
        $org_file_name = str_replace(' ', '_',$org_file_name);        
        $storepath = $filepath . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
        //NAS
       
        //$storepath_NAS = $location.$filepath_NAS . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
        $storepath_NAS = $filepath_NAS . $static_ponumber."_".$org_file_name . "-" . $date2 . "." . $extension;
        if($LocalTest==0){
        if(ftp_put($connection,$storepath_NAS,$tmp_name_array[$FileIndex],FTP_BINARY)){
            ////$file_save_arr[$i]['updname']= substr($storepath,7);
            ////$file_save_arr[$i]['orgname']=$name_array[$i];    
            //echo "NASDONE";
        }//uncomment
    }
     
       // print_r($tmp_name_array[$i]);
       // print_r($storepath);
        move_uploaded_file($tmp_name_array[$FileIndex], $storepath);

       
       // $file_save_arr[$i]['updname']= substr($storepath,7); //OLD SERVER
       $file_save_arr[$i]['updname_OLDSERVER']= substr($storepath,7); //OLD SERVER
       if($LocalTest==0){
       $file_save_arr[$i]['updname']= $storepath_NAS; //NAS SERVER PATH
       }else{
        $file_save_arr[$i]['updname']= substr($storepath,7); //OLD SERVER
       }
       $file_save_arr[$i]['orgname']=$name_array[$i];
      // exit();
      $FileIndex++;

    }

    }else{
        //exit();
        if(isset($_POST['image'][$i]) && $_POST['image'][$i]!="undefined"){
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
      ftp_put($connection,$NAS_PATH,$LOCALPATH,FTP_BINARY);
      //echo "DONE";
        //echo  $connection,$folderPath.$fileName;
        ftp_close($connection); 
       
        // file_put_contents($location.$fileName, $image_base64);
        //   print_r($fileName);
        
        $file_save_arr[$i]['updname']= $NAS_PATH; //NAS SERVER PATH
    }else{
        $file_save_arr[$i]['updname']= "";
    }
       
    }
   

}

if($LocalTest==0){
ftp_close($connection); //uncomment
}
//var_dump(count($file_save_arr));exit();

/*if(count($file_save_arr)>0){
    echo json_encode(["success"=>1, "files"=>$file_save_arr]);
}
else{
    echo json_encode(["success"=>0,"files"=>$file_err_arr]);
}*/
echo json_encode(["success"=>1, "files"=>$file_save_arr]);
?>