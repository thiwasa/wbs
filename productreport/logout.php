<?php
// ログアウト処理を行う
session_start();
$_SESSION = array();// ユーザのCookieに保存されているセッションIDを削除
session_destroy();
require_once './index.php';
