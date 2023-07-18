<?php

class Scandb {
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

  public static function readMOD($orderno) {
    $dbh = self::dbPDO();
    try {
      $sth = $dbh->prepare('
      SELECT
      "" AS qr_id, 
      moed_product_cd AS qr_p_cd,
      moed_product_name AS p_name,
      moed_sub_01 AS qr_sub_01,
      moed_sub_12 AS qr_sub_12,
      moed_sub_02 AS qr_sub_02,
      moed_sub_13 AS qr_sub_13,
      moed_sub_03 AS qr_sub_03,
      moed_sub_04 AS qr_sub_04,
      moed_sub_05 AS qr_sub_05,
      moed_type_03 AS qr_lot_no,
      moed_quantity AS moedqty,
      moed_unit_tran AS qr_unit_eval,
      moed_order_no AS qr_report_no
      FROM morderestimate AS moed
      WHERE moed_order_no = :ORDERNO
      ;');
      $sth->bindValue(':ORDERNO', $orderno, PDO::PARAM_STR);
      $sth->execute();
      $result = $sth->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($result);
    } catch (Exception $e) {
      echo $e;
    }
  }

  /***
   * 入庫　スキャンしたQRデータ、付随情報を取得
   */
  public static function readItems($qrid) {
    $dbh = self::dbPDO();
    try {
      $sth = $dbh->prepare('
      SELECT qr_id, 
      qr_p_cd,
      qr_sub_01,
      qr_sub_02,
      qr_sub_03,
      qr_sub_04,
      qr_sub_05,
      qr_sub_12,
      qr_sub_13,
      qr_report_no,
      qr_lot_no,
      moed_order_no,
      qr_unit_eval,
      IF(moed.moed_order_no = "", "0", "1") AS MFLG,
      IF(moed.moed_order_no = "", 0, moed.moed_quantity) AS moedqty,
      p.p_name,
      c.C_CUSTOMER_NAME AS customername,
      cp.CP_POST_NAME AS makername
      FROM QR
      LEFT JOIN morderestimate AS moed ON moed.moed_order_no = qr_report_no
      LEFT JOIN product AS p ON p.p_cd = qr_p_cd
      LEFT JOIN customer AS c ON c.C_CUSTOMER_CD = qr_customer_cd
      LEFT JOIN customerpost AS cp ON cp.CP_CUSTOMER_CD = LEFT(qr_maker_cd, 3) AND cp.CP_POST_CD = RIGHT(qr_maker_cd, 4)
      WHERE qr_id = :QRID AND qr_update_at=(
        select max(qr_update_at) from qr
        where qr_id = :QRID2 
      )
      ');
      $sth->bindValue(':QRID', $qrid, PDO::PARAM_STR);
      $sth->bindValue(':QRID2', $qrid, PDO::PARAM_STR);
      $sth->execute();
      $result = $sth->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($result);
    } catch (Exception $e) {
      echo $e;
    }
  }

  /**
   * 発注データ更新　入庫登録
   */
  public static function updateMOD($dat) {
    $dbh = self::dbPDO();
    try {
      $dbh->beginTransaction();
      foreach($dat as $rec) {
        if ($rec['qr_id'] === '') {
          // スキャンしてなければ更新しない
          continue;
        }
        $sth = $dbh->prepare('
        SELECT * FROM morderestimate
        WHERE CONCAT(moed_order_no, moed_sub_no, moed_accept_sub_no) = CONCAT("H", :NO)
        ;');
        $sth->bindValue(':NO', $rec['qr_lot_no'], PDO::PARAM_STR);
        $sth->execute();
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($result) > 0) {
          $sth = $dbh->prepare('
          UPDATE morderestimate
          SET moed_update_cnt = moed_update_cnt+1, 
          moed_type_02 = "1", 
          moed_update_at = :UPDATEAT,
          moed_update_cd = :USERCD
          WHERE CONCAT(moed_order_no, moed_sub_no, moed_accept_sub_no) = CONCAT("H", :NO)
          ;');
          $sth->bindValue(':UPDATEAT',self::currentDate(), PDO::PARAM_STR);
          $sth->bindValue(':USERCD', $_SESSION['usercd'], PDO::PARAM_STR);
          $sth->bindValue(':NO', $rec['qr_lot_no'], PDO::PARAM_STR);
          $sth->execute();

          // 履歴データ更新
          $sth = $dbh->prepare('
          INSERT INTO t_morderestimate
          SELECT 
          moed_belong_cd,
          moed_order_no,
          moed_sub_no,
          moed_accept_sub_no,
          moed_update_cnt+1 AS moed_update_cnt,
          moed_buy_type,
          moed_customer_cd,
          moed_customer_post_cd,
          moed_customer_charge_cd,
          moed_salesman_cd,
          moed_order_date,
          moed_arrival_hd_date,
          moed_refer_no,
          moed_report_remarks,
          moed_product_cd,
          moed_quantity,
          moed_unit_qty,
          moed_unit_price,
          moed_money,
          moed_money_tax,
          moed_money_inc_tax,
          moed_arrival_plan_date,
          moed_payment_plan_date,
          moed_dt_remarks,
          moed_accept_date,
          moed_qty_quit,
          moed_pay_type,
          moed_payment_no,
          moed_payment_date,
          moed_remarks,
          :UPDATEAT AS moed_update_at,
          :UPDATECD AS moed_update_cd,
          moed_sub_01,
          "1" AS moed_sub_02,
          moed_sub_03,
          moed_sub_04,
          moed_sub_05,
          moed_sub_06,
          moed_sub_07,
          moed_sub_08,
          moed_sub_09,
          moed_sub_10,
          moed_sub_11,
          moed_sub_12,
          moed_sub_13,
          moed_sub_num_01,
          moed_sub_num_02,
          moed_sub_num_03,
          moed_sub_num_04,
          moed_type_01,
          moed_type_02,
          moed_type_03,
          moed_type_04,
          moed_type_05,
          moed_type_06,
          moed_type_07,
          moed_type_08,
          moed_manufacture_cd,
          moed_warehouse_cd,
          moed_unit_tran,
          moed_type_subject,
          moed_inventory_type,
          moed_product_name,
          moed_unit_eval,
          moed_stock_qty
           FROM morderestimate
          WHERE CONCAT(moed_order_no, moed_sub_no, moed_accept_sub_no) = CONCAT("H", :NO)
          ;');
          $sth->bindValue(':UPDATEAT', self::currentDate(), PDO::PARAM_STR);
          $sth->bindValue(':UPDATECD', $_SESSION['usercd'], PDO::PARAM_STR);
          $sth->bindValue(':NO', $rec['qr_lot_no'], PDO::PARAM_STR);
          $sth->execute();

          // 既存データで更新の場合、受払予定データを更新
          // 既存かどうか確認
          $sth = $dbh->prepare('
          SELECT * FROM stockplan
          WHERE 
          sp_month = "0000" AND 
          sp_arrange_type = "110" AND 
          CONCAT(sp_report_no, sp_sub_no_01,sp_sub_no_02) = CONCAT("H", :REPORTNO) AND 
          sp_update_cnt = :CNT
          ;');
          $sth->bindValue(':REPORTNO', $rec['qr_lot_no'], PDO::PARAM_STR);
          $sth->bindValue(':CNT', 0, PDO::PARAM_INT);
          $sth->execute();
          $rslt = $sth->fetchAll(PDO::FETCH_ASSOC);

          if (count($rslt) > 0) {
            // データ削除           
            $sth = $dbh->prepare('
            DELETE FROM stockplan 
            WHERE sp_belong_cd = :BELONGCD AND 
            sp_month = "0000" AND 
            sp_arrange_type = "110" AND 
            CONCAT(sp_report_no, sp_sub_no_01, sp_sub_no_02) = CONCAT("H", :REPORTNO) AND 
            sp_update_cnt = :CNT
            ;');
            $sth->bindValue(':BELONGCD', $_SESSION['companycd'], PDO::PARAM_STR);
            $sth->bindValue(':REPORTNO', $rslt['sp_report_no'], PDO::PARAM_STR);
            $sth->bindValue(':CNT', $rslt['sp_update_cnt'], PDO::PARAM_STR);
            $sth->execute();            
          }
        } else {
          
        }
      }
      $dbh->commit();
    } catch (Exception $e) {
      $dbh->rollBack();
      echo $e;
    }
  }



  /***
   * 検収登録
   */
  public static function updateMODAccept($dat) {
    $dbh = self::dbPDO();
    try {
      $dbh->beginTransaction();
      foreach($dat as $rec) {
        if ($rec['qr_id'] === '') {
          // スキャンしてなければ更新しない
          continue;
        }
        $sth = $dbh->prepare('
        SELECT * FROM morderestimate
        WHERE CONCAT(moed_order_no, moed_sub_no, moed_accept_sub_no) = CONCAT("H", :NO)
        ;');
        $sth->bindValue(':NO', $rec['qr_lot_no'], PDO::PARAM_STR);
        $sth->execute();
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($result) > 0) {
          if ($result[0]['moed_arrival_plan_date'] === '') {
            throw new exception('入荷予定日がセットされていません。入荷予定日をセットしてください。');
          } 
          if ($result[0]['moed_accept_date'] !== '') {
            // throw new exception('既に検収済みです。');
            // 処理済みは飛ばす
            continue;
          }

          // 請求締日再計算
          $result[0]['moed_payment_plan_date'] = self::getCustomerClosingDay('paymentday', $result[0]['moed_customer_cd'], $result[0]['moed_accept_date'], $dbh);

          $sth = $dbh->prepare('
          UPDATE morderestimate
          SET moed_update_cnt = moed_update_cnt+1, 
          moed_accept_date = moed_arrival_plan_date, 
          moed_qty_quit = 0,
          moed_payment_plan_date = :PAYDAY,
          moed_update_at = :UPDATEAT,
          moed_update_cd = :USERCD
          WHERE CONCAT(moed_order_no, moed_sub_no, moed_accept_sub_no) = CONCAT("H", :NO)
          ;');
          $sth->bindValue(':PAYDAY', $result[0]['moed_payment_plan_date'], PDO::PARAM_STR);
          $sth->bindValue(':UPDATEAT',self::currentDate(), PDO::PARAM_STR);
          $sth->bindValue(':USERCD', $_SESSION['usercd'], PDO::PARAM_STR);
          $sth->bindValue(':NO', $rec['qr_lot_no'], PDO::PARAM_STR);
          $sth->execute();

          // 履歴データ更新
          $sth = $dbh->prepare('
          INSERT INTO t_morderestimate
          SELECT 
          moed_belong_cd,
          moed_order_no,
          moed_sub_no,
          moed_accept_sub_no,
          moed_update_cnt+1 AS moed_update_cnt,
          moed_buy_type,
          moed_customer_cd,
          moed_customer_post_cd,
          moed_customer_charge_cd,
          moed_salesman_cd,
          moed_order_date,
          moed_arrival_hd_date,
          moed_refer_no,
          moed_report_remarks,
          moed_product_cd,
          moed_quantity,
          moed_unit_qty,
          moed_unit_price,
          moed_money,
          moed_money_tax,
          moed_money_inc_tax,
          moed_arrival_plan_date,
          :PAYDAY AS moed_payment_plan_date,
          moed_dt_remarks,
          moed_arrival_plan_date AS moed_accept_date,
          0 AS moed_qty_quit,
          moed_pay_type,
          moed_payment_no,
          moed_payment_date,
          moed_remarks,
          :UPDATEAT AS moed_update_at,
          :UPDATECD AS moed_update_cd,
          moed_sub_01,
          moed_sub_02,
          moed_sub_03,
          moed_sub_04,
          moed_sub_05,
          moed_sub_06,
          moed_sub_07,
          moed_sub_08,
          moed_sub_09,
          moed_sub_10,
          moed_sub_11,
          moed_sub_12,
          moed_sub_13,
          moed_sub_num_01,
          moed_sub_num_02,
          moed_sub_num_03,
          moed_sub_num_04,
          moed_type_01,
          moed_type_02,
          moed_type_03,
          moed_type_04,
          moed_type_05,
          moed_type_06,
          moed_type_07,
          moed_type_08,
          moed_manufacture_cd,
          moed_warehouse_cd,
          moed_unit_tran,
          moed_type_subject,
          moed_inventory_type,
          moed_product_name,
          moed_unit_eval,
          moed_stock_qty
           FROM morderestimate
          WHERE CONCAT(moed_order_no, moed_sub_no, moed_accept_sub_no) = CONCAT("H", :NO)
          ;');
          $sth->bindValue(':UPDATEAT', self::currentDate(), PDO::PARAM_STR);
          $sth->bindValue(':UPDATECD', $_SESSION['usercd'], PDO::PARAM_STR);
          $sth->bindValue(':NO', $rec['qr_lot_no'], PDO::PARAM_STR);
          $sth->execute();

          // 既存データで更新の場合、受払予定データを削除
          // 既存かどうか確認
          $sth = $dbh->prepare('
          SELECT * FROM stockplan
          WHERE 
          sp_month = "0000" AND 
          sp_arrange_type = "110" AND 
          CONCAT(sp_report_no, sp_sub_no_01,sp_sub_no_02) = CONCAT("H", :REPORTNO) AND 
          sp_update_cnt = :CNT
          ;');
          $sth->bindValue(':REPORTNO', $rec['qr_lot_no'], PDO::PARAM_STR);
          $sth->bindValue(':CNT', 0, PDO::PARAM_INT);
          $sth->execute();
          $rslt = $sth->fetchAll(PDO::FETCH_ASSOC);

          if (count($rslt) > 0) {
            // データ削除           
            $sth = $dbh->prepare('
            DELETE FROM stockplan 
            WHERE sp_belong_cd = :BELONGCD AND 
            sp_month = "0000" AND 
            sp_arrange_type = "110" AND 
            CONCAT(sp_report_no, sp_sub_no_01, sp_sub_no_02) = CONCAT("H", :REPORTNO) AND 
            sp_update_cnt = :CNT
            ;');
            $sth->bindValue(':BELONGCD', $_SESSION['companycd'], PDO::PARAM_STR);
            $sth->bindValue(':REPORTNO', $rslt['sp_report_no'], PDO::PARAM_STR);
            $sth->bindValue(':CNT', $rslt['sp_update_cnt'], PDO::PARAM_STR);
            $sth->execute();            
          }

          // 受払明細にinsert
          // 自社マスタから整理月取得
          $updateTime = self::currentTime();    // 更新時刻
          $sth = $dbh->prepare('
          SELECT * FROM housecompany
          ;');
          $sth->execute();
          $housecompany = $sth->fetchAll(PDO::FETCH_ASSOC);
          // 該当整理年月取得
          if (substr($result[0]['moed_payment_plan_date'], 0, 6) <= $housecompany[0]['H_ACCONTING_MONTH']) {
            // 自社マスタの整理年月以前の場合,自社マスタの整理年月＋１でセット
            $acDate = new DateTime($housecompany[0]['H_ACCONTING_MONTH'] . '01');
            $acDate->modify('+1 month');
            $strDate = $acDate->format('Y-m-d');
            $strDate = str_replace('-', '', $strDate);
            $strMonth = substr($strDate, 2, 4);
          } else {
            // 該当業務の取引年月をセット
            $strMonth = substr($result[0]['moed_payment_plan_date'], 2, 4);
          }

          $sth = $dbh->prepare('
          INSERT INTO stock
          VALUES (
            :stc_belong_cd,
            :stc_month,
            "110",
            :stc_report_no,
            :stc_sub_no_01,
            :stc_sub_no_02,
            "",
            "",
            :stc_update_cnt,
            :stc_report_date,
            "",
            :stc_target_id,
            :stc_place_cd,
            :stc_customer_post_cd,
            :stc_product_cd,
            :stc_sub_01,
            :stc_sub_02,
            :stc_sub_12,
            :stc_sub_13,
            :stc_sub_03,
            :stc_sub_04,
            :stc_sub_05,
            :stc_sub_06,
            :stc_sub_07,
            :stc_sub_08,
            :stc_sub_10,
            :stc_sub_09,
            :stc_sub_11,
            :stc_qty_trans,
            :stc_price_trans,
            :stc_price_tax,
            "1",
            "0",
            "0",
            "1",
            "1",
            :stc_cost_eva_qty,
            :stc_unit_price,
            "0",
            "",
            "1",
            :stc_type_04,
            "0",
            :stc_update_at,
            :stc_update_time,
            :stc_update_cd,
            :stc_unit_tran,
            :stc_type_subject,
            :stc_parrange_cd,
            :stc_maker_cd 
          );');
          $sth->bindValue(':stc_belong_cd', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_month', $strMonth, PDO::PARAM_STR);
          $sth->bindValue(':stc_report_no',$result[0]['moed_order_no'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_no_01', $result[0]['moed_sub_no'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_no_02', $result[0]['moed_accept_sub_no'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_sub_no_03', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_sub_no_04', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_update_cnt', $result[0]['moed_update_cnt'] + 1, PDO::PARAM_STR);
          $sth->bindValue(':stc_report_date', $result[0]['moed_accept_date'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_pjcd', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_target_id', $result[0]['moed_customer_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_place_cd', $result[0]['moed_customer_charge_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_customer_post_cd', $result[0]['moed_customer_post_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_product_cd', $result[0]['moed_product_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_01', $result[0]['moed_sub_01'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_02', $result[0]['moed_sub_02'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_12', $result[0]['moed_sub_12'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_13', $result[0]['moed_sub_13'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_03', $result[0]['moed_sub_03'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_04', $result[0]['moed_sub_04'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_05', $result[0]['moed_sub_05'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_06', $result[0]['moed_sub_06'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_07', $result[0]['moed_sub_07'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_08', $result[0]['moed_sub_08'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_10', $result[0]['moed_sub_10'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_09', $result[0]['moed_sub_09'], PDO::PARAM_STR);
          $sth->bindValue(':stc_sub_11', $result[0]['moed_sub_11'], PDO::PARAM_STR);
          $sth->bindValue(':stc_qty_trans', $result[0]['moed_quantity'], PDO::PARAM_STR);
          $sth->bindValue(':stc_price_trans', $result[0]['moed_money'], PDO::PARAM_STR);
          $sth->bindValue(':stc_price_tax', $result[0]['moed_money_tax'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_inventory_type', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_recv_type', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_pay_type', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_expence_type', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_cost_type', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_cost_eva_qty', $result[0]['moed_unit_qty'], PDO::PARAM_STR);
          $sth->bindValue(':stc_unit_price', $result[0]['moed_unit_price'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_type_01', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_type_02', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_type_03', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_type_04', $result[0]['moed_type_03'], PDO::PARAM_STR);
          // $sth->bindValue(':stc_type_05', $result[0]['moed_belong_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_update_at', $result[0]['moed_update_at'], PDO::PARAM_STR);
          $sth->bindValue(':stc_update_time', $updateTime, PDO::PARAM_STR);
          $sth->bindValue(':stc_update_cd', $result[0]['moed_update_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_unit_tran', $result[0]['moed_unit_tran'], PDO::PARAM_STR);
          $sth->bindValue(':stc_type_subject', $result[0]['moed_type_subject'], PDO::PARAM_STR);
          $sth->bindValue(':stc_parrange_cd', $result[0]['moed_parrangement_cd'], PDO::PARAM_STR);
          $sth->bindValue(':stc_maker_cd', $result[0]['moed_customer_cd'] . $result[0]['moed_customer_post_cd'], PDO::PARAM_STR);
          $sth->execute();

        } else {
          
        }
      }
      $dbh->commit();
    } catch (Exception $e) {
      $dbh->rollBack();
      echo $e;
    }
  }
  

    /**
   * 現在日の文字列を返す
   */
  public static function currentDate() {
    return (new DateTime('Now', new DateTimeZone('Asia/Tokyo')))->format('Ymd');
  }

  /**
   * 請求日、支払日、入金日取得
   * $daytype: 請求日、支払日・入金日のどの日を取得するのか
   * $customercd: 客先CD
   * $keyDate: 起点となる日(納品日など)
   * $dbh: DB接続 
   */
  private static function getCustomerClosingDay($daytype, $customerCd, $keyDate, $dbh) { 
    $strDate = '';
    try {
      $sth = $dbh->prepare('
      SELECT *,
	      IF (C_INVOICE_SIGN = "0" OR C_INVOICE_SIGN = "" OR C_INVOICE_SIGN IS NULL OR  C_FINALDAY = "99" OR C_FINALDAY = "" OR C_FINALDAY IS NULL, :KEYDATE, "") AS finday1,
        IF (C_INVOICE_SIGN > 0, IF(C_FINALDAY IS NULL OR C_FINALDAY = "" OR C_FINALDAY >= 31, LAST_DAY(:KEYDATE1 ), ""), "") AS finday2,
        IF (C_INVOICE_SIGN > 0, IF(C_FINALDAY < SUBSTRING(:KEYDATE2, 7, 2), DATE_ADD(DATE_FORMAT(:KEYDATE3, CONCAT("%Y-%m-", C_FINALDAY) ),INTERVAL (C_INVOICE_SIGN + 1) MONTH), ""), "") AS finday3,
        IF (C_INVOICE_SIGN > 0, IF(C_FINALDAY >= SUBSTRING(:KEYDATE4, 7, 2), DATE_ADD(DATE_FORMAT(:KEYDATE5, CONCAT("%Y-%m-", C_FINALDAY)) ,INTERVAL C_INVOICE_SIGN MONTH), ""), "") AS finday4,
        IF (C_RECEPTION_PAYMENT_SIGN = "0" OR C_RECEPTION_PAYMENT_SIGN = "" OR C_RECEPTION_PAYMENT_SIGN IS NULL OR  C_RECEPTION_PAYMENT_DAY = "99" OR C_RECEPTION_PAYMENT_DAY = "" OR C_RECEPTION_PAYMENT_DAY IS NULL, :KEYDATE6, "") AS pday1,
        IF (C_RECEPTION_PAYMENT_SIGN > 0, IF(C_RECEPTION_PAYMENT_DAY IS NULL OR C_RECEPTION_PAYMENT_DAY = "" OR C_RECEPTION_PAYMENT_DAY >= 31, LAST_DAY( :KEYDATE7), ""), "") AS pday2,
        IF (C_RECEPTION_PAYMENT_SIGN > 0, IF(C_RECEPTION_PAYMENT_DAY < SUBSTRING( :KEYDATE8, 7, 2), DATE_ADD(DATE_FORMAT( :KEYDATE9, CONCAT("%Y-%m-", C_RECEPTION_PAYMENT_DAY) ),INTERVAL (C_RECEPTION_PAYMENT_SIGN + 1) MONTH), ""), "") AS pday3,
        IF (C_RECEPTION_PAYMENT_SIGN > 0, IF(C_RECEPTION_PAYMENT_DAY >= SUBSTRING( :KEYDATE10, 7, 2), DATE_ADD(DATE_FORMAT( :KEYDATE11, CONCAT("%Y-%m-", C_RECEPTION_PAYMENT_DAY)) ,INTERVAL C_RECEPTION_PAYMENT_SIGN MONTH), ""), "") AS pday4
      FROM customer
      WHERE trim(C_CUSTOMER_ID) = :CUSCD1 AND 
      C_CUSTOMER_CD = :CUSCD2 
      ;');
      $sth->bindValue(':KEYDATE', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE1', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE2', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE3', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE4', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE5', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE6', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE7', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE8', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE9', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE10', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':KEYDATE11', $keyDate, PDO::PARAM_STR);
      $sth->bindValue(':CUSCD1', $customerCd, PDO::PARAM_STR);
      $sth->bindValue(':CUSCD2', $customerCd, PDO::PARAM_STR);
      $sth->execute();
      $result = $sth->fetchAll(PDO::FETCH_ASSOC);

      if (count($result) > 0) {
        switch ($daytype) {
          case 'finalday':
            // 請求日
            $strDate = self::getPaymentDay($result[0]['finday1'], $result[0]['finday2'], $result[0]['finday3'], $result[0]['finday4']);
            break;
          case 'paymentday':
            // 支払・入金日
            $strDate = self::getPaymentDay($result[0]['pday1'], $result[0]['pday2'], $result[0]['pday3'], $result[0]['pday4']);
            break;
          default:
            $strDate = '';
        }
      }
      return $strDate;
    } catch (Exception $e) {
      throw $e;
    }
  }

    
  /**
   * 支払日・入金日・請求日の算出
   */
  private static function getPaymentDay($pay1, $pay2, $pay3, $pay4) {
    if (self::checkNotSet($pay1) === false) {
      return self::sqlDateToStr($pay1);
    } else if (self::checkNotSet($pay2) === false) {
      return self::sqlDateToStr($pay2);
    } else if (self::checkNotSet($pay3) === false)  {
      return self::sqlDateToStr($pay3);
    } else {
      return self::sqlDateToStr($pay4);
    }
  }

  private static function sqlDateToStr($inStr) {
    // 年月日の各パーツを分割する
    preg_match( "/([0-9]*)-([0-9]*)-([0-9]*)/", $inStr, $data );
    if ( count($data) !== 4 ) {
      return $inStr;
    } 
    // 先頭0埋めでYYYYMMDD形式の日付文字列に変換する
    $outStr = sprintf( '%04.4d%02.2d%02.2d', $data[1], $data[2], $data[3] );
    return $outStr;
  }

  
  /**
   * 指定項目値についてクライアントが値を設定しているかを確認する
   * @param string value 確認対象の値
   * @return boolean 値が設定されていない場合にtrue
   */
  private static function checkNotSet($key) {
    return !isset($key) || $key === '';
  }

      /**
   * 現在時刻の文字列を返す
   */
  public static function currentTime() {
    return (new DateTime('Now', new DateTimeZone('Asia/Tokyo')))->format('Hi');
  }
}