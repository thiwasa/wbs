<?php
session_start();
// ログイン済みでなければ処理を禁止
if ($_SESSION['auth'] == null || $_SESSION['auth'] == '') {
  // if (!isset($_SESSION['auth'])) {
  die();
}
if ($_SESSION['auth'] !== TRUE) {
  die();
}
$uinfo = $_SESSION['perminfo'];
$usrid = $_SESSION['userid'];
$usrcd = $_SESSION['usercd'];
$companycd = $_SESSION['companycd'];
session_write_close();
// データベース通信用クラスを読込
include __DIR__ . '/scandb.php';
// ログイン中のユーザ権限を確認(変数uinfo使用)
function hasPermission($reqperm) {
  global $uinfo;
  if ($uinfo[$reqperm] != '0') {
    return TRUE;
  }
  return FALSE;
}
try {
  // クライアントからの要求に対応した関数を呼び出す
  $candisprow = ($uinfo['PERMISSION_CONTROL_TABLE'] != '0');
  $postInput = $_POST['postdata'];
  switch ($postInput) {
      case 'readMOD':
        Scandb::readMOD($_POST['orderno']);
        break;
      case 'readItems':
        Scandb::readItems($_POST['qrid']);
      break;
      case 'updateMOD':
        Scandb::updateMOD(json_decode($_POST['items'], true));
      break;
      case 'updateMODAccept':
        Scandb::updateMODAccept(json_decode($_POST['items'], true));
      break;
  }
} catch (Exception $e) {
die();
}
exit();










