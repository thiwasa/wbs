<?php
class Reportquery {
  /**
   * 通信設定
   * @return PDO
   */
  private static function dbPDO() {
    // データベース通信設定
    // $dsn = 'mysql:dbname=wsdb;host=localhost;charset=utf8';
    $dsn = 'mysql:dbname=wsdb;host=192.168.1.201;charset=utf8';
    $user = 'user1';
    $password = getenv('WSDBPass');
    $dbh = new PDO($dsn, $user, $password, array(
      PDO::ATTR_EMULATE_PREPARES => false,
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ));
    return $dbh;
  }

  /**
   * データ取得の最大値セット
   * 設定ファイルで設定するべきであるが、定義がないのでPHPにて設定クラスを設けた
   */
  private static function setDataLimit() {
    $row = 5000;
    return $row;
  }

  /***
   * 製造指示データのステータス取得
   */
  public static function getProdplans($ppNo) {
    $dbh = self::dbPDO();
    try {
      $sth = $dbh->prepare('SELECT * FROM prodplans WHERE :PPNO');
      $sth->bindValue(':PPNO', $ppNo, PDO::PARAM_STR);
      $sth->execute();
      $result = $sth->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($result);
    } catch (Exception $e) {
      throw $e;
    }
  }

}

