<?php

/*
 | --------------------------------------------------------------------
 | App Namespace
 | --------------------------------------------------------------------
 |
 | This defines the default Namespace that is used throughout
 | CodeIgniter to refer to the Application directory. Change
 | this constant to change the namespace that all application
 | classes should use.
 |
 | NOTE: changing this will require manually modifying the
 | existing namespaces of App\* namespaced-classes.
 */
defined('APP_NAMESPACE') || define('APP_NAMESPACE', 'App');

/*
 | --------------------------------------------------------------------------
 | Composer Path
 | --------------------------------------------------------------------------
 |
 | The path that Composer's autoload file is expected to live. By default,
 | the vendor folder is in the Root directory, but you can customize that here.
 */
defined('COMPOSER_PATH') || define('COMPOSER_PATH', ROOTPATH . 'vendor/autoload.php');

/*
 |--------------------------------------------------------------------------
 | Timing Constants
 |--------------------------------------------------------------------------
 |
 | Provide simple ways to work with the myriad of PHP functions that
 | require information to be in seconds.
 */
defined('SECOND') || define('SECOND', 1);
defined('MINUTE') || define('MINUTE', 60);
defined('HOUR')   || define('HOUR', 3600);
defined('DAY')    || define('DAY', 86400);
defined('WEEK')   || define('WEEK', 604800);
defined('MONTH')  || define('MONTH', 2592000);
defined('YEAR')   || define('YEAR', 31536000);
defined('DECADE') || define('DECADE', 315360000);

/*
 | --------------------------------------------------------------------------
 | Exit Status Codes
 | --------------------------------------------------------------------------
 |
 | Used to indicate the conditions under which the script is exit()ing.
 | While there is no universal standard for error codes, there are some
 | broad conventions.  Three such conventions are mentioned below, for
 | those who wish to make use of them.  The CodeIgniter defaults were
 | chosen for the least overlap with these conventions, while still
 | leaving room for others to be defined in future versions and user
 | applications.
 |
 | The three main conventions used for determining exit status codes
 | are as follows:
 |
 |    Standard C/C++ Library (stdlibc):
 |       http://www.gnu.org/software/libc/manual/html_node/Exit-Status.html
 |       (This link also contains other GNU-specific conventions)
 |    BSD sysexits.h:
 |       http://www.gsp.com/cgi-bin/man.cgi?section=3&topic=sysexits
 |    Bash scripting:
 |       http://tldp.org/LDP/abs/html/exitcodes.html
 |
 */
defined('EXIT_SUCCESS')        || define('EXIT_SUCCESS', 0); // no errors
defined('EXIT_ERROR')          || define('EXIT_ERROR', 1); // generic error
defined('EXIT_CONFIG')         || define('EXIT_CONFIG', 3); // configuration error
defined('EXIT_UNKNOWN_FILE')   || define('EXIT_UNKNOWN_FILE', 4); // file not found
defined('EXIT_UNKNOWN_CLASS')  || define('EXIT_UNKNOWN_CLASS', 5); // unknown class
defined('EXIT_UNKNOWN_METHOD') || define('EXIT_UNKNOWN_METHOD', 6); // unknown class member
defined('EXIT_USER_INPUT')     || define('EXIT_USER_INPUT', 7); // invalid user input
defined('EXIT_DATABASE')       || define('EXIT_DATABASE', 8); // database error
defined('EXIT__AUTO_MIN')      || define('EXIT__AUTO_MIN', 9); // lowest automatically-assigned error code
defined('EXIT__AUTO_MAX')      || define('EXIT__AUTO_MAX', 125); // highest automatically-assigned error code

define('CCTV_IMG_SRG_PATH', '/var/www/testpurchasepro/sapfileshare');
define('SAP_FILE_PATH', '/var/www/testpurchasepro/sapfileshare');

//SAP API Details
// define('IP_ADDRESS', 'http://103.249.96.242:50000/');
#define('IP_ADDRESS', 'http://172.16.63.4:50000/'); // DR IP
// define('USER_NAME', 'srdgitm1');
// define('PASS_WORD', 'ERP@Sap2kh6');
define('USER_NAME', 'NAGAABAP'); //QA
define('PASS_WORD', 'Naga@123456'); // QA
// define('BASIC_AUTH', 'c3JkZ2l0bTE6RVJQQFNhcDJraDY=');
define('BASIC_AUTH', 'U1JER0lUTTM6TmFnYUA1NDMyMQ=='); //QA
//OCR
//define('OCR_URL', 'http://bi.nagamills.com/Invoice_Parser1/process-invoice');
define('OCR_URL', 'http://aipro.nagamills.com/invoice/extract');
define('OCR_URL_KEY', 'sk_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e');


//RakeCM Share API
define('RAKECM_TRIPSHEET_URL', 'http://127.0.0.1:8000/api/v1/RakeCM/Share/TripsheetInfo');
define('RAKECM_API_KEY', '1a8cf3597b5f9c39d28bb503f250e6400fc86885ad3b2c7fab42ea778e0de87');

//ZING HR API 
define('ZINGHRURL','https://portal.zinghr.com/2015/route/EmployeeDetails/GetEmployeeMasterDetails'); 
define('ZINGHRCOOKIE','ASP.NET_SessionId=z11l3b5gtd0m2gsb5utkzt2m; BNI_persistence=t3S_ZqsyV_T2UPQov9UE8BF89d6cr8Qk3R3dUPIIA9XWr4MgASJunodSvJo6wBaMWYFxTRPyi3d9pe7tcz7Q1Q=='); 
define('ZINGHRTOKEN','a2a92b65595b431b9a55993f239e3046'); 
