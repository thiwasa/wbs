<?php
// class Qrscandb {
// session_start();
// // ログイン済みでなければ処理を禁止
// if ($_SESSION['auth'] == null || $_SESSION['auth'] == '') {
//   die();
// }
// if ($_SESSION['auth'] !== TRUE) {
//   die();
// }
// $uinfo = $_SESSION['perminfo'];
// $usrid = $_SESSION['userid'];
// $usrcd = $_SESSION['usercd'];
// $companycd = $_SESSION['companycd'];
// session_write_close();
// // ログイン中のユーザ権限を確認(変数uinfo使用)
// function hasPermission($reqperm) {
//   global $uinfo;
//   if ($uinfo[$reqperm] != '0') {
//     return TRUE;
//   }
//   return FALSE;
// }
// try {
//   // クライアントからの要求に対応した関数を呼び出す
//   $candisprow = ($uinfo['PERMISSION_CONTROL_TABLE'] != '0');
//   $postInput = $_POST['postdata'];
//   switch ($postInput) {
//     case 'readItems':
//       self::readItems($_POST['qrid']);
//       break;
//   }
// } catch (Exception $e) {
//   die();
// }
// // exit();
class QrScandb {
  // データベースに接続するためのPDOクラスを返す

  /***
   * 
   */
  private static function dbPDO() {
    $dsn = 'mysql:dbname=wsdb;host=localhost;charset=utf8';
    // $dsn = 'mysql:dbname=wsdb;host=192.168.1.201;charset=utf8';
    $user = 'user1';
    $password = getenv('WSDBPass');
    $dbh = new PDO($dsn, $user, $password, array(
      PDO::ATTR_EMULATE_PREPARES => false,
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ));
    return $dbh;
  }

  public static function readItems($qrid) {
    $dbh = self::dbPDO();
    try {
      $sth = $dbh->prepare('
      SELECT * FROM QR
      WHERE qr_id = :QRID
      ');
      $sth->bindValue(':QRID', $qrid, PDO::PARAM_STR);
      $sth->execute();
      $result = $sth->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($result);
    } catch (Exception $e) {
      echo $e;
    }
  }

}