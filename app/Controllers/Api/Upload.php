<?php namespace App\Controllers\Api;

class Upload extends BaseApiController
{
    public function index(){
        $path =  join("/",$this->request->uri->getSegments());
        // $this->response->download("../$path", null,TRUE);
        $fileExt = pathinfo($path,PATHINFO_EXTENSION);
        $ctype = 'application/pdf';
        switch($fileExt) {
            case "gif": $ctype="image/gif"; break;
            case "png": $ctype="image/png"; break;
            case "jpeg":
            case "jpg": $ctype="image/jpeg"; break;
            case "svg": $ctype="image/svg+xml"; break;
            case "zip": $ctype="application/zip"; break; 
            default:
        }
         $this->response->setHeader('Content-Type', $ctype);
        @readfile("../$path");
    }

    public function uploadToFtp (){
        $qr = $this->request->getGet("file");
        $server = '182.71.62.210'; //Address of ftp server
        $user_name = 'Digi'; // Username
        $password = 'Digi@2021'; // Password
        $server_path = '/Digigate/Purchasepro/'; //Server path
        $connection = ftp_connect($server, 21);
        ftp_login($connection, $user_name, $password);
        // $connection->ftp_put()
        echo WRITEPATH. "uploads/test.txt";
        // ftp_put($connection, "test-ppp",FCPATH. $qr, FTP_BINARY);

        ftp_close($connection);
    }
    
    public function uploadToNAS($PostArray){
        date_default_timezone_set('Asia/Calcutta');
        include_once(APIPATH.'/helper/fileHelper.php');
        echo "NAS1";
        var_dump($PostArray);
        echo "NAS2";
        $file = $PostArray['file'];
        $ponumber = $PostArray['ponumber'];
        $file_from = $PostArray['form_name'];
        $SubFolder="";
        if(isset($PostArray['SubFolder'])){
            if($PostArray['SubFolder']!=""){
                $SubFolder=$PostArray['SubFolder'];
            }
        }
        $VANumber="";
        if(isset($PostArray['VA_Number']) && $PostArray['VA_Number']!="undefined"){
            $VANumber=$PostArray['VA_Number'];
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
        
        
        $connection = ftp_connect($server,21); 
        
        ftp_login($connection, $user_name, $password); //uncomment
        $filepath_NAS = upload_folder_NAS($file_from,$SubFolder,$location,$connection);//uncomment
        
        $FileIndex=0;
        for($i=0;$i<sizeof($PostArray['image']);$i++){
           // $NAS_PATH="";
            if($PostArray['image'][$i]=="undefined" || $PostArray['image'][$i]==null){
            
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
              
                if(ftp_put($connection,$storepath_NAS,$tmp_name_array[$FileIndex],FTP_BINARY)){
                    ////$file_save_arr[$i]['updname']= substr($storepath,7);
                    ////$file_save_arr[$i]['orgname']=$name_array[$i];    
                    //echo "NASDONE";
                }//uncomment
             
               // print_r($tmp_name_array[$i]);
               // print_r($storepath);
                move_uploaded_file($tmp_name_array[$FileIndex], $storepath);
        
               
               // $file_save_arr[$i]['updname']= substr($storepath,7); //OLD SERVER
               $file_save_arr[$i]['updname_OLDSERVER']= substr($storepath,7); //OLD SERVER
               $file_save_arr[$i]['updname']= $storepath_NAS; //NAS SERVER PATH
               $file_save_arr[$i]['orgname']=$name_array[$i];
              // exit();
              $FileIndex++;
        
            }
        
            }else{
                //exit();
                if(isset($PostArray['image'][$i]) && $PostArray['image'][$i]!="undefined"){
                $img = $PostArray['image'][$i]; 
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
        
        
        ftp_close($connection); //uncomment
        
        //var_dump(count($file_save_arr));exit();
        
        /*if(count($file_save_arr)>0){
            echo json_encode(["success"=>1, "files"=>$file_save_arr]);
        }
        else{
            echo json_encode(["success"=>0,"files"=>$file_err_arr]);
        }*/
        return json_encode(["success"=>1, "files"=>$file_save_arr]);
    }
    
    function upload_folder($file_from, $base_dir)
    {
  $date = date("Y-m-d");
  $month_f = date("F", strtotime($date));
  $year_f = date("Y", strtotime($date));
  $date_f = date("d", strtotime($date));

  if (!is_dir($base_dir . "/" . $year_f)) {
    mkdir("$base_dir/$year_f", 007, true);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!is_dir($base_dir . "/" . $year_f . "/" . $month_f)) {
    mkdir($base_dir . "/" . $year_f . "/" . $month_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!is_dir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f)) {
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!is_dir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from)) {
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  }
  $filepath = $base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from . "/";
  return $filepath;
}
function ftp_isdir($connection,$Dir){
  if(@ftp_chdir($connection,$dir)){
    return true;
  }else{
    return false;
  }
}
function upload_folder_NAS($file_from,$SubFolder, $base_dir,$connection)
{
  $date = date("Y-m-d");
  $month_f = date("F", strtotime($date));
  $year_f = date("Y", strtotime($date));
  $date_f = date("d", strtotime($date));
  //var_dump($connection);
 // echo "Y".ftp_pwd($connection)."Y";
  //var_dump(@ftp_chdir($connection,$base_dir . "/" . $year_f."/"));
  //echo $base_dir . "/" . $year_f;
  //ftp_mkdir($connection,"Digigate/Purchasepro/2021");
//  exit();

  if (!@ftp_chdir($connection,$base_dir . "/" . $year_f)) {
    ftp_mkdir($connection,"$base_dir/$year_f");//, 007, true);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f)) {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f)) {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from)) {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  }
  elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from."/".$SubFolder) && $SubFolder!="") {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from."/".$SubFolder);
  }
  $filepath = $base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from . "/";
  if($SubFolder!=""){
    $filepath.=$SubFolder."/";
  }
  return $filepath;
    }
}