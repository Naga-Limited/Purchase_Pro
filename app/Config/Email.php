<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Email extends BaseConfig
{
    /**
     * From email address (MUST match SMTPUser)
     */
    public $fromEmail = 'itsupport@nagamills.com';

    /**
     * From name
     */
    public $fromName = 'Naga Mills';

    /**
     * User Agent
     */
    public $userAgent = 'CodeIgniter';

    /**
     * Protocol
     */
    public $protocol = 'smtp';

    /**
     * Gmail SMTP Host
     */
    public $SMTPHost = 'smtp.gmail.com';

    /**
     * Gmail username
     */
    public $SMTPUser = 'itsupport@nagamills.com';

    /**
     * Gmail APP password (16 chars)
     */
    public $SMTPPass = 'bksslyosnlfxmuzj';

    /**
     * SMTP Port
     */
    public $SMTPPort = 587;

    /**
     * Encryption
     */
    public $SMTPCrypto = 'tls';

    /**
     * Timeout
     */
    public $SMTPTimeout = 60;

    /**
     * Keep Alive
     */
    public $SMTPKeepAlive = false;

    /**
     * Mail type
     */
    public $mailType = 'html';

    /**
     * Charset
     */
    public $charset = 'UTF-8';

    /**
     * Word wrap
     */
    public $wordWrap = true;

    /**
     * Priority
     */
    public $priority = 3;

    /**
     * New lines
     */
    public $CRLF = "\r\n";
    public $newline = "\r\n";

    public $BCCBatchMode = false;
    public $BCCBatchSize = 200;

    public $DSN = false;
}
