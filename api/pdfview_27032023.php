<?php
// echo "<br>TEST";
// Initialize the session

//session_start();
//$_SESSION["loggedin"]=true;
// Check if the user is logged in, if not then redirect him to login page
/*
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: index.php");
    exit;
    // Store data in session variables
    $_SESSION["loggedin"] = true;
    $_SESSION["id"] = $id;
    $_SESSION["username"] = $username;
}
*/
?>
<?php

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

$location = $file; 
//$local=''. $file;
$local=basename($file);

$filepath = "./". basename($file);
//echo $filepath ;exit;
if($extension=="pdf")
{
    header('Content-type: application/'.$extension);
}
else{
    header('Content-type: '.$extension);
}
 header('Content-Length: '.filesize($filepath));
// Read the file 
//$data = file_get_contents($filepath);
// echo $data; 
$filepath = "/var/www/purchaseprouat/sapfileshare/2023/March/23/supdis/2800000925_Logo2-202303232029561.png";
readfile($filepath); 

if($status){  
echo "File deleted successfully";    
}else{  
echo "Sorry!";    
}

?>