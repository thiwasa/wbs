<?php
// ログアウト処理を行う
session_start();
$_SESSION = array();
session_destroy();
require_once './index.php';
