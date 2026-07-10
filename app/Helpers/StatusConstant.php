<?php 
namespace App\Helpers;

class StatusConstant
{
    public static $PROCESS_REJECT =34;
    public static $MIGO_REVERSE_REJECT =31;
    public static $MIGO_REVERSE_APPROVAL =30;
    public static $MIGO_REJECT =29;
    public static $PO_APPROVAL =28;
    public static $WB_APPROVAL =27;
    public static $PO_CHANGE =26;
    public static $WB_CHANGE =25;
    public static $RECEIVER_GATE_IN =16;
    public static $INTRANSIT =15;
    public static $PICKSLIP =14;
    public static $COMPLETED =12;
    public static $LOADING =13;
    public static $GATEOUT =5;
    public static $MIGOAPPROVAL =6;
    public static $MIGOCOMPLETED =7;
    public static $PORT_DISPATCH =9;
    public static $PORT_RECEIPT =10;
    public static $REJECT_GATEOUT =11;
    public static $REDIRECT =18;
    public static $IN =1;
    public static $QUALITYCHECK =2;

}
