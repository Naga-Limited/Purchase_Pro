<?php
// echo "<br>TEST";
// Initialize the session
session_start();
$_SESSION["loggedin"]=true;
// Check if the user is logged in, if not then redirect him to login page
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: index.php");
    exit;
    // Store data in session variables
    $_SESSION["loggedin"] = true;
    $_SESSION["id"] = $id;
    $_SESSION["username"] = $username;
}

?>
<?php
//$file = $_GET["po"] . ".pdf";
if(isset($_fn))
{
    $_file=$_fn;    
}
else if(isset($_GET["fn"])){
    $_file = $_GET["fn"];
}
if($_file)
{
    $file=$_file;
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if($extension=="pdf"||$extension=="PDF")
    {
        $extension="pdf";
    }
    else{
        $extension="image";
    }
}
else
{
    $file="Address.png";
    $extension="image";
}
$server = '192.168.1.104' ;//Address of ftp server
$user_name = 'Digi'; // Username
$password = 'Digi@2021'; // Password
$location = "upload/". $file; 
// $location = $file; 
//$local=''. $file;
$local=basename($file);

// set up basic connection  
// $conn_id = ftp_connect($server);  
// login with username and password  
// $login_result = ftp_login($conn_id,$user_name,$password); 



//if (ftp_get($conn_id,"/digigate/", $location, FTP_BINARY))
//if (ftp_get($conn_id, $filepath =$location, FTP_BINARY))
//{
 //   echo "<Br>AA".$file."<Br>s".$local."<Br>s3".$location;exit();
//     if (ftp_get($conn_id, $local,$location, FTP_BINARY)) 
// {
    //$filepath =ftp_get($conn_id, $location.$file, FTP_BINARY);
   //echo "<br>IN";
//$filepath = "./". $file;
$filepath = "./". basename($file);
// echo $filepath ;
if($extension=="pdf")
{
    header('Content-type: application/'.$extension);
}
else{
    header('Content-type: '.$extension);
}
//header('Content-Disposition: inline; filename="' . $file . '"');
// header('Content-Transfer-Encoding: binary');
// header('Accept-Ranges: bytes');
 header('Content-Length: '.filesize($filepath));
// Read the file 
//$data = file_get_contents($filepath);
// echo $data; 
readfile($filepath); 
// }
else{
    //echo "<Br>READ ERROR";
}
// ftp_close($conn_id);  
   
//$status=unlink("uploads/". $file);    
/*if($status){  
echo "File deleted successfully";    
}else{  
echo "Sorry!";    
} */ 

?>