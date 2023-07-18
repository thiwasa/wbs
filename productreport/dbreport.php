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
$ppNo = $_SESSION['ppNo'];

$companycd = $_SESSION['companycd'];
session_write_close();
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
//   $candisprow = ($uinfo['PERMISSION_CONTROL_TABLE'] != '0');
  $postInput = isset($_POST['postdata']) ? $_POST['postdata'] : $_GET['req'];
  switch ($postInput) {
    case 'getProdplans' :
      Reportquery::getProdplans($_POST['sdat']);
      break;
  };
} catch (Exception $e) {
  throw $e;
}
exit();


