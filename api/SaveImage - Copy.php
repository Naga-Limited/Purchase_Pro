<?php
    
    $server = '182.71.62.210' ;//Address of ftp server
    $user_name = 'Digi'; // Username
     $password = 'Digi@2021'; // Password

        $img = $_POST['image'];
    $folderPath = "/Digigate/Digi";    
    $folderPath1 = "upload/"; 
    $folderPath2 = "/upload"; 
   
   
    $image_parts = explode(";base64,", $img);
    $image_type_aux = explode("image/", $image_parts[0]);
    $image_type = $image_type_aux[1];
  
    $image_base64 = base64_decode($image_parts[1]);
    $fileName = uniqid() . '.jpg';
    $file = $folderPath1 . $fileName;   
   
     file_put_contents($file, $image_base64);
     print_r($fileName);
     $connection = ftp_connect($server); 
     ftp_login($connection, $user_name, $password);
  ftp_put($connection,$folderPath2,$folderPath,FTP_BINARY);
    //echo  $connection,$folderPath.$fileName;
    ftp_close($connection); 
   
    // file_put_contents($location.$fileName, $image_base64);
    //   print_r($fileName);
  
?>