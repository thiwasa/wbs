<?php
// ログイン処理
// データベース通信設定
// $dbdsn = 'mysql:dbname=wsdb;host=localhost;charset=utf8';
$dbdsn = 'mysql:dbname=wsdb;host=192.168.1.201;charset=utf8';
$dbuser = 'user1';
$dbpassword = getenv('WSDBPass');
// ユーザのログイン用情報を読込して返す
function readUsersLoginInfo($loginname, $loginpass) {
  $result = array();
  try {
    // 接続
    global $dbdsn, $dbuser, $dbpassword;
    $dbh = new PDO($dbdsn, $dbuser, $dbpassword);
    // 静的プレースホルダを指定
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $sth = $dbh->prepare('
    SELECT USER_ID, USER_CD, USER_NAME, USER_PERMISSION_ID, USER_PASSWORD AS decpass
    FROM USER WHERE USER_ID = ? AND USER_CD = ?
    ;');
    $deckeyword = $loginpass ;
    $sth->bindValue(1, $loginname, PDO::PARAM_STR);
    $sth->bindValue(2, $loginname, PDO::PARAM_STR);
    // 実行して権限情報を取得
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
    // // 接続
    // global $dbdsn, $dbuser, $dbpassword;
    // $dbh = new PDO($dbdsn, $dbuser, $dbpassword);
    // // 静的プレースホルダを指定
    // $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    // $sth = $dbh->prepare('SELECT `USER_ID`,`USER_CD`,`USER_NAME`,'
    // . '`USER_PERMISSION_ID`,cast(aes_decrypt(`user_password`, ?) as CHAR) as \'decpass\' '
    // . 'FROM user WHERE `user_cd` = ?;');
    // $deckeyword = $loginpass . getenv('WSAesPP') . $loginpass;
    // $sth->bindValue(1, $deckeyword, PDO::PARAM_STR);
    // $sth->bindValue(2, $loginname, PDO::PARAM_STR);
    // // 実行して権限情報を取得
    // $sth->execute();
    // $result = $sth->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    print('Error:'. $e->getMessage() . 'Line:' . $e->getLine());
    die();
  }
  return $result;
}
// 自社コード取得
function readHouseCompany() {
  $result = array();
  try {
    // 接続
    global $dbdsn, $dbuser, $dbpassword;
    $dbh = new PDO($dbdsn, $dbuser, $dbpassword);
    // 静的プレースホルダを指定
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $sth = $dbh->prepare('SELECT * FROM housecompany ORDER BY H_COMPANY_ID ASC;');
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    print('Error:'. $e->getMessage() . 'Line:' . $e->getLine());
    die();
  }
  return $result[0]['H_COMPANY_CD'];
}
// 対象ユーザの操作権限を取得する
function readPermissionsByID($userspermid) {
  $result = array();
  try {
    // 接続
    global $dbdsn, $dbuser, $dbpassword;
    $dbh = new PDO($dbdsn, $dbuser, $dbpassword);
    // 静的プレースホルダを指定
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $sth = $dbh->prepare('SELECT `PERMISSION_NAME`,`PERMISSION_LEAF_PLACEMENT`,`PERMISSION_WORK_RESULT`,'
    . '`PERMISSION_LEAF_DIVIDE`,`PERMISSION_OUTSIDE_PROGRESS`,`PERMISSION_MO_PROGRESS`,'
    . '`PERMISSION_CALENDAR_INDIVIDUAL`,`PERMISSION_CALENDAR_COMPANY`,'
    . '`PERMISSION_DISPLAY_PROCESS`,`PERMISSION_CHANGE_PROCESS`,`PERMISSION_PROCESS_DIALOG`,'
    . '`PERMISSION_LEAF_SEARCH`,`PERMISSION_CONTROL_TABLE` FROM permissions WHERE `PERMISSION_ID`=?;');
    $sth->bindValue(1, $userspermid, PDO::PARAM_STR);
    // 実行
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    print('Error:'. $e->getMessage() . 'Line:' . $e->getLine());
    die();
  }
  return $result;
}
/**
 * 製造指示書情報を取得
 */
function readProductPlan($ppNo) {
  $result = array();
  try {
    // 接続
    global $dbdsn, $dbuser, $dbpassword;
    $dbh = new PDO($dbdsn, $dbuser, $dbpassword);
    // 静的プレースホルダを指定
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $sth = $dbh->prepare('SELECT * FROM prodplans WHERE pd_prod_plan_no=?;');
    $sth->bindValue(1, $ppNo, PDO::PARAM_STR);
    // 実行
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    print('Error:'. $e->getMessage() . 'Line:' . $e->getLine());
    die();
  }
  return $result;
}
/***
 * 製品情報取得
 */
function readProductInfo($pNo) {
  $result = array();
  try {
    // 接続
    global $dbdsn, $dbuser, $dbpassword;
    $dbh = new PDO($dbdsn, $dbuser, $dbpassword);
    // 静的プレースホルダを指定
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $sth = $dbh->prepare('SELECT * FROM product WHERE p_cd=?;');
    $sth->bindValue(1, $pNo, PDO::PARAM_STR);
    // 実行
    $sth->execute();
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    print('Error:'. $e->getMessage() . 'Line:' . $e->getLine());
    die();
  }
  return $result;
}
// HTML表示時のエスケープ処理を行う
function h($var) {
  if (is_array($var)) {
    return array_map('h', $var);
  } else {
    return htmlspecialchars($var, ENT_QUOTES, 'UTF-8');
  }
}
// 制御文字の存在を確認する。無効な文字列と判断した場合にFALSE
function checkControlStr($array) {
  if (is_array($array)) {
    return FALSE;
  }
  if (preg_match('/\A[\r\n\t[:^cntrl:]]{0,100}\z/u', $array) == 0) {
    error_log('Invalid control characters: ' . rawurlencode($array), 0);
    return FALSE;
  }
  return TRUE;
}
header('X-FRAME-OPTIONS: SAMEORIGIN');

// セッションを開始する
session_start();
$logininfo = array();
$userid = '';
$usercd = '';
$username = '';
$pCd = '';
$ppNo = '';
$ppInfo = array();
$permid = '';
$decodedpass = '';
$errormes = '';

// ユーザ名をCookieへ保存
// setcookie('user_name', $user_name, time() + 60 * 60 * 24 * 365);
// 認証済みかどうかのセッション変数を初期化
if ($_SESSION['auth'] == null || $_SESSION['auth'] == '' || $_SESSION['ppNo'] == null || $_SESSION['ppNo'] == '') {
  // if (!isset($_SESSION['auth'])) {
  $_SESSION['auth'] = false;
}
// ログイン情報が入力された場合、認証を行う
if (isset($_POST['usercd']) && isset($_POST['password']) && isset($_POST['ppNo'])) {
  if(checkControlStr($_POST['usercd']) === TRUE
    && (checkControlStr($_POST['password']) === TRUE) && (checkControlStr($_POST['ppNo']) === TRUE)) {
    $logininfo = readUsersLoginInfo((string)h(str_replace("\0","",$_POST['usercd'])),
      (string)h(str_replace("\0","",$_POST['password'])));
    $ppNo = $_POST['ppNo'];
    if (count($logininfo) > 0) {
      foreach ($logininfo as $row) {
        $userid = $row['USER_ID'];
        $usercd = $row['USER_CD'];
        $username = $row['USER_NAME'];
        $permid = $row['USER_PERMISSION_ID'];
        $decodedpass = $row['decpass'];
        // 復号したパスワードを照合
        if ($_POST['password'] === $decodedpass) {
          // 権限情報を取得
          $perminfo = array();
          $perminfo = readPermissionsByID($permid);
          //　自社情報を設定
          $companycd = readHouseCompany();
          // 製造指示Noが存在するかチェック＆製造指示のNoと品名取得
          $ppInfo = readProductPlan($ppNo);
          if (count($ppInfo) === 0) {
            // データ取得不可の場合
            $errormes = '該当の製造指示Noがありません。';
            break;
          }
          if (count($perminfo) > 0) {
            // 認証に成功した場合、セッションの情報を代入する
            session_regenerate_id(true);
            $_SESSION['auth'] = true;
            $_SESSION['userid'] = $userid;
            $_SESSION['usercd'] = $usercd;
            $_SESSION['username'] = $username;
            $_SESSION['permid'] = $permid;
            $_SESSION['perminfo'] = $perminfo[0];
            $_SESSION['secrndnum'] = rand(1, 9999);
            $_SESSION['companycd'] = $companycd;
            $_SESSION['ppNo'] = $ppNo;
            if(null != ($proxy = getenv("HTTP_CLIENT_IP"))){
              $_SESSION['previp'] = $proxy;
            }else{
              $_SESSION['previp'] = getenv("REMOTE_ADDR");
            }
            break;
          } else {
            $errormes = '対象ユーザーに権限が割当されていません。';
          }
        }
      }
    }
  }
  if ($_SESSION['auth'] === false && $errormes === '') {
    $errormes = 'ユーザーコードまたはパスワードに誤りがあります。';
  }
}
$clientip = '';
if(null != ($proxy = getenv("HTTP_CLIENT_IP"))){
  $clientip = $proxy;
} else {
  $clientip = getenv("REMOTE_ADDR");
}
// ログインページを表示
// || get_request_method() !== 'POST'
if ($_SESSION['auth'] !== true || $_SESSION['previp'] !== $clientip || $_SESSION['ppNo'] !== $ppNo ) {
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>生産管理システム - 製造実績詳細ログイン</title>
</head>
<body>
<div id="login" style="text-align:center;">
  <h1>製造実績登録ログイン画面</h1>
  <?php
  // エラー表示
  if ($errormes) {
    echo '<p style="color:red;">' . h($errormes) . '</p>';
  }
  ?>
  <form action="<?php echo h($_SERVER['SCRIPT_NAME']); ?>" method="post">
    <table align="center">
    <tr>
      <td style="text-align:right;"><label for="usercd">ユーザーコード：</label></td>
      <td style="text-align:left;"><input type="text" name="usercd" id="usercd" value="" size="18"></td>
    </tr>
    <tr>
      <td style="text-align:right;"><label for="password">パスワード：</label></td>
      <td style="text-align:left;"><input type="password" name="password" id="password" maxlength="16" value="" size="18"></td>
    </tr>
    <tr>
      <td style="text-align:right;"><label for="pcd">品名CD：</label></td>
      <td style="text-align:left;"><input type="pcd" name="pcd" id="pcd" maxlength="16" value="" size="18"></td>
    </tr>
    <tr>
      <td style="text-align:right;"><label for="ppNo">製造指図No：</label></td>
      <td style="text-align:left;"><input type="ppNo" name="ppNo" id="ppNo" maxlength="16" value="" size="18" required ></td>
    </tr>
    </table>
    <input type="submit" name="submit" value="実行">
    <input type="button" name="cancel" value="キャンセル">
  </form>
  <hr>
  <!-- <div>
    Copyright (C) 2018 SysDevLink Corp. All Rights Reserved.
  </div> -->
</div>
</body>
</html>
<?php
  exit();
}
