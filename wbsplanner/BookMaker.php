<?php

// データベース通信クラス
class BookMaker
{

  /**
   * 見積書ファイルを作成する
   */
  public static function issueEstimateFile($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // // 処理時間を延長
      // ini_set('max_execution_time', 60);
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      // $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/template_est.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 54;
      $nPageRowNum = 8;   //  1ページあたりの行数
      $STR_GROUP = '一式';
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      $price = 0;   // 合計金額
      // 品名CD、規格が同じデータで並べ替え
      $detailItems = self::sortEstimateDatas($items);
      $itemLineNum = 0;

      // 明細データが最終難行になるか確認
      foreach ($detailItems as $item) {
        $itemLineNum++;
        if ($item['itemCnt'] > 1 && $item['isFirstRow']) {
          $itemLineNum++;
        }
        if ($itemLineNum === $nPageRowNum && $item['itemCnt'] > 1) {
          $itemLineNum++;
        }
      }

      // 何ページになるか算出
      $nPage = ceil($itemLineNum / $nPageRowNum);

      // 明細内容出力
      for ($i = 0; $i < count($detailItems); $i++) {
        $dat = $detailItems[$i];
        // 各ページ先頭部分
        if ($row === 0) {
          // ヘッダセット
          self::makeLogoDrawing(10, 4 + $pagecnt * $pagelen, 10, 5, 445, 43)->setWorksheet($sheet);                 // 社名
          self::makeCertificationType2Drawing(10, 7 + $pagecnt * $pagelen, 53, 15, 195, 92)->setWorksheet($sheet);  // 認証マーク
          self::makeTitleType2Drawing(10, 12 + $pagecnt * $pagelen, 45, 0, 231, 13)->setWorksheet($sheet);          // 自社工場
          self::makeTitleDrawing(10, 5 + $pagecnt * $pagelen, 20, 15, 430, 65)->setWorksheet($sheet);               // 自社住所、部署、連絡先
          self::makeQR(16, 8, 90, $dat['e_estimate_no'], self::setQRMode('est'))->setWorksheet($sheet);             // QRコード
          $sheet->setCellValueByColumnAndRow(2, 4 + $pagecnt * $pagelen, $dat['C_CUSTOMER_NAME']);
          $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, is_null($dat['CP_POST_NAME']) ? '' : $dat['CP_POST_NAME']);
          $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, is_null($dat['CC_CHARGE_NAME']) ? '' : $dat['CC_CHARGE_NAME']);

          // 客先名にアンダーバーが含まれる場合、アンダーバーの前後を２行に分けて表示する
          $splitedCustomerName = explode('_', $dat['C_CUSTOMER_NAME'], 2);
          if (count($splitedCustomerName) > 1) {
            $sheet->setCellValueByColumnAndRow(2, 4 + $pagecnt * $pagelen, $splitedCustomerName[0]);
            $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, $splitedCustomerName[1]);
          }
          if ($dat['e_customer_charge_cd'] !== '') {
            $sheet->setCellValueByColumnAndRow(7, 6 + $pagecnt * $pagelen, ' 様');
            $sheet->setCellValueByColumnAndRow(7, 4 + $pagecnt * $pagelen, ''); // 御中消す
          } else {
            $sheet->setCellValueByColumnAndRow(7, 4 + $pagecnt * $pagelen, ' 御中');
            $sheet->setCellValueByColumnAndRow(7, 6 + $pagecnt * $pagelen, '');
          }
          // 件名
          $sheet->setCellValueByColumnAndRow(4, 23 + $pagecnt * $pagelen, $dat['e_title']);
          // 納期　文字列を表示。適宜その時に変更 「見積後3日」など
          $sheet->setCellValueByColumnAndRow(4, 8 + $pagecnt * $pagelen, $dat['e_delivery_string']);
          // 見積有効期限
          $sheet->setCellValueByColumnAndRow(4, 10 + $pagecnt * $pagelen, '本見積提出後' . $dat['e_valid_month'] . 'ヶ月');
          // 御社注文No
          $sheet->setCellValueByColumnAndRow(4, 18 + $pagecnt * $pagelen, $dat['e_customer_order_no']);
          // 明細ヘッダ
          $sheet->setCellValueByColumnAndRow(2, 21 + $pagecnt * $pagelen, self::formatStrToDate2($dat['curdate']));
          $sheet->setCellValueByColumnAndRow(6, 21 + $pagecnt * $pagelen, $dat['e_estimate_no']);

          // $nPage = ceil( (count($detailItems) + $multilineNum) / $nPageRowNum);
          $sheet->setCellValueByColumnAndRow(12, 21 + $pagecnt * $pagelen, ($pagecnt + 1) . ' / ' . $nPage);
          $sheet->setCellValueByColumnAndRow(14, 21 + $pagecnt * $pagelen, $dat['salesmanname']);
          // フッタセット
          $sheet->setCellValueByColumnAndRow(3, 43 + $pagecnt * $pagelen, $dat['stname']);
          $sheet->setCellValueByColumnAndRow(10, 43 + $pagecnt * $pagelen, $dat['shname']);

          // 備考
          $sheet->setCellValueByColumnAndRow(2, 46 + $pagecnt * $pagelen, '備考:' . $dat['e_remark_01']);
        }

        // 明細行内容
        // 品名に_が入っていた場合は規格へ分岐する
        $ar = self::makeArrayProductSpec($dat);

        // 同じ品名、規格が1行のみか
        $isOnlyOneRow = false;
        // 初回の行は品名、規格を表示
        if ($dat['isFirstRow']) {
          if (!isset($detailItems[$i + 1]['isFirstRow']) || $detailItems[$i + 1]['isFirstRow']) {
            $isOnlyOneRow = true;
            // 明細行内容
            // $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $dat['row']);
            // 品名
            $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $ar[0] . ' ' . ($dat['ar_name'] === 'なし' ? '' : $dat['ar_name']));
            // 寸法
            $sheet->setCellValueByColumnAndRow(2, 26 + $row * 2 + $pagecnt * $pagelen, $ar[1] . ' ' . $ar[2]);
            // 客先品名があったら、品名に表示。アンダーバーが含まれる場合は、品名に前方文字列、規格に後方文字列をセット
            if ($dat['ed_customer_p_name'] !== '') {
              $arr = explode('_', $dat['customerpname']);
              $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $arr[0]);
              $sheet->setCellValueByColumnAndRow(2, 26 + $row * 2 + $pagecnt * $pagelen, $arr[1]);
            }
          } else {
            // 品名
            $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $ar[0] . ' ' . ($dat['ar_name'] === 'なし' ? '' : $dat['ar_name']));
            // 規格
            $sheet->setCellValueByColumnAndRow(2, 26 + $row * 2 + $pagecnt * $pagelen, $ar[1]);

            // 客先品名があったら、品名に表示。アンダーバーが含まれる場合は、品名に前方文字列、規格に後方文字列をセット
            if ($dat['ed_customer_p_name'] !== '') {
              $arr = explode('_', $dat['customerpname']);
              $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $arr[0]);
              $sheet->setCellValueByColumnAndRow(2, 26 + $row * 2 + $pagecnt * $pagelen, $arr[1]);
            }
            // 初回行の書き込みが終了したら次の行へ移動
            $row++;
          }
        }

        if (!$isOnlyOneRow) {
          // 明細行内容
          // $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $dat['row']);
          // 寸法
          $sheet->setCellValueByColumnAndRow(2, 25 + $row * 2 + $pagecnt * $pagelen, $ar[2]);
        }

        if ($dat['ed_unit_tran'] === $STR_GROUP) {
          // 単位が一式だった場合は、数量、単位は空文字。単価は一式、金額は金額表示にする。
          $dat['ed_unit_tran'] = '';
          $dat['ed_quantity'] = '';
          $dat['ed_unit_price'] = $STR_GROUP;
        }
        if ($dat['ed_quantity'] !== ''  && (float)$dat['ed_quantity'] === 0) {
          $dat['ed_quantity'] = '';
          $dat['ed_unit_tran'] = '';
          $dat['ed_unit_price'] = '';
        }
        $sheet->setCellValueByColumnAndRow(9, 25 + $row * 2 + $pagecnt * $pagelen, $dat['ed_quantity']);
        $sheet->setCellValueByColumnAndRow(10, 25 + $row * 2 + $pagecnt * $pagelen, $dat['ed_unit_tran']);
        $sheet->setCellValueByColumnAndRow(11, 25 + $row * 2 + $pagecnt * $pagelen, $dat['ed_unit_price']);
        $sheet->setCellValueByColumnAndRow(13, 25 + $row * 2 + $pagecnt * $pagelen, $dat['ed_price'] === 0 ? '' : $dat['ed_price']);
        $sheet->setCellValueByColumnAndRow(15, 25 + $row * 2 + $pagecnt * $pagelen, $dat['ed_detail_remarks']);
        $price += $dat['ed_price'];
        $row++;

        $nextDat = $detailItems[$i + 1];
        if (($nextDat['isFirstRow'] && $nextDat['itemCnt'] > 1 && $row === ($nPageRowNum - 1)) ||
          ($row > ($nPageRowNum - 1) && ($nPage > ($pagecnt + 1)))
        ) {
          // 1ページを超える場合は、次ページ作成
          $row = 0;
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 26, $pagelen);
          $pagecnt++;
          // データクリア
          for ($j = 0; $j < $nPageRowNum; $j++) {
            $sheet->setCellValueByColumnAndRow(2, 25 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(2, 26 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(9, 25 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(10, 25 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(11, 25 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(13, 25 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(15, 25 + $j * 2 + $pagecnt * $pagelen, '');
          }
          // 改ページ
          $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }
        if ($i === (count($items) - 1)) {
          // 最終行だったら合計金額表記
          $sheet->setCellValueByColumnAndRow(4, 12 + $pagecnt * $pagelen, $price);
          $sheet->setCellValueByColumnAndRow(13, 41 + $pagecnt * $pagelen, $price);
        }
      }
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:R' . (($pagecnt + 1) * $pagelen));
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, '御見積書' . '_' . $items[0]['e_estimate_no'], true);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 見積請書を作成する
   */
  public static function issueEstimateConfirmationFile($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // // 処理時間を延長
      // ini_set('max_execution_time', 60);
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      // $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/template_estAc.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 63;      // 1ページの行数（67）
      $recordlen = 58;      // 客先使用欄まで
      $nPageRowNum = 8;   // 1ページあたりの行数
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      $price = 0;   // 合計金額
      $bQR = false;   // QR書いたかどうか
      $STR_GROUP = '一式';
      // 品名CD、規格が同じデータで並べ替え
      $detailItems = self::sortEstimateDatas($items);
      $firstRowNum = 0;
      $itemLineNum = 0;

      foreach ($detailItems as $item) {
        // if ($item['isFirstRow']) {
        //   $firstRowNum ++;
        // }
        $itemLineNum++;
        if ($item['itemCnt'] > 1 && $item['isFirstRow']) {
          $itemLineNum++;
        }
        if ($itemLineNum === $nPageRowNum && $item['itemCnt'] > 1) {
          $itemLineNum++;
        }
      }

      $nPage = ceil($itemLineNum / $nPageRowNum);

      // 明細内容出力
      for ($i = 0; $i < count($detailItems); $i++) {
        $dat = $detailItems[$i];
        // 各ページ先頭部分
        if ($row === 0) {
          self::makeLogoDrawing(10, 3 + $pagecnt * $pagelen, 5, 14, 436, 42)->setWorksheet($sheet);                 // 社名
          self::makeTitleType2Drawing(9, 10 + $pagecnt * $pagelen, 35, 13, 232, 14)->setWorksheet($sheet);          // 自社工場
          self::makeCertificationType2Drawing(9, 6 + $pagecnt * $pagelen, 45, 25, 202, 96)->setWorksheet($sheet);   // 認証マーク
          self::makeTitleDrawing(10, 4 + $pagecnt * $pagelen, 25, 25, 423, 66)->setWorksheet($sheet);               // 自社住所、部署、連絡先
          $sheet->setCellValueByColumnAndRow(2, 4 + $pagecnt * $pagelen, $dat['C_CUSTOMER_NAME']);
          $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, is_null($dat['CP_POST_NAME']) ? '' : $dat['CP_POST_NAME']);
          $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, is_null($dat['CC_CHARGE_NAME']) ? '' : $dat['CC_CHARGE_NAME']);
          // 客先名にアンダーバーが含まれる場合、アンダーバーの前後を２行に分けて表示する
          $splitedCustomerName = explode('_', $dat['C_CUSTOMER_NAME'], 2);
          if (count($splitedCustomerName) > 1) {
            $sheet->setCellValueByColumnAndRow(2, 4 + $pagecnt * $pagelen, $splitedCustomerName[0]);
            $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, $splitedCustomerName[1]);
          }
          if ($dat['e_customer_charge_cd'] !== '') {
            $sheet->setCellValueByColumnAndRow(8, 6 + $pagecnt * $pagelen, ' 様');
            $sheet->setCellValueByColumnAndRow(8, 4 + $pagecnt * $pagelen, '');
          } else {
            $sheet->setCellValueByColumnAndRow(8, 6 + $pagecnt * $pagelen, '');
          }
          // 御社注文No
          $sheet->setCellValueByColumnAndRow(4, 11 + $pagecnt * $pagelen, $dat['e_customer_order_no']);

          // 明細ヘッダ
          $sheet->setCellValueByColumnAndRow(2, 14 + $pagecnt * $pagelen, isset($dat['e_estimate_date']) ? self::formatStrToDate2($dat['e_estimate_date']) : '');
          $sheet->setCellValueByColumnAndRow(5, 14 + $pagecnt * $pagelen, self::formatStrToDate2($dat['e_shipplan_date']));
          $sheet->setCellValueByColumnAndRow(8, 14 + $pagecnt * $pagelen, self::formatStrToDate2($dat['e_desired_delivery_date']));
          $sheet->setCellValueByColumnAndRow(11, 14 + $pagecnt * $pagelen, $dat['e_estimate_no']);
          // 何ページになるか算出
          // $nPage = ceil( (count($items) + $firstRowNum) / $nPageRowNum);
          $sheet->setCellValueByColumnAndRow(15, 14 + $pagecnt * $pagelen, ($pagecnt + 1) . ' / ' . $nPage);
          $sheet->setCellValueByColumnAndRow(16, 14 + $pagecnt * $pagelen, $dat['salesmanname']);

          // フッタセット
          $sheet->setCellValueByColumnAndRow(3, 39 + $pagecnt * $pagelen, $dat['delvname']);
          $sheet->setCellValueByColumnAndRow(3, 40 + $pagecnt * $pagelen, '〒' . $dat['delvaddno']);
          // $sheet->setCellValueByColumnAndRow(3, 41 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['delvadd1']));
          $str = self::trimSpaceForCustomerAddress($dat['delvadd1']);
          $sheet->setCellValueByColumnAndRow(3, 41 + $pagecnt * $pagelen, $str);
          $sheet->setCellValueByColumnAndRow(3, 42 + $pagecnt * $pagelen, $dat['delvadd2']);
          $sheet->setCellValueByColumnAndRow(13, 40 + $pagecnt * $pagelen, $dat['delvtel']);
          // 出荷主
          $sheet->setCellValueByColumnAndRow(3, 43 + $pagecnt * $pagelen, $dat['shname']);
          $sheet->setCellValueByColumnAndRow(3, 44 + $pagecnt * $pagelen, '〒' . $dat['shaddno']);
          // $sheet->setCellValueByColumnAndRow(3, 45 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['shadd1']));
          $str = self::trimSpaceForCustomerAddress($dat['shadd1']);
          $sheet->setCellValueByColumnAndRow(3, 45 + $pagecnt * $pagelen, $str);
          $sheet->setCellValueByColumnAndRow(3, 46 + $pagecnt * $pagelen, $dat['shadd2']);
          $sheet->setCellValueByColumnAndRow(13, 44 + $pagecnt * $pagelen, $dat['shtel']);

          $sheet->setCellValueByColumnAndRow(2, 35 + $pagecnt * $pagelen, '備考:' . $dat['e_remark_01']);

          // フッターの承認欄
          self::makeApproval2(5, 56 + $pagecnt * $pagelen, 25, 3, 805, 142)->setWorksheet($sheet);

          if (!$bQR) {
            self::makeQR(2, 58, 85, $dat['e_estimate_no'], self::setQRMode('est'), 5, 7)->setWorksheet($sheet);
            $bQR = true;
          }
        }

        // 品名に_が入っていた場合は規格へ分岐する
        $ar = self::makeArrayProductSpec($dat);
        // 同じ品名、規格が1行のみか
        $isOnlyOneRow = false;
        // 初回の行は品名、規格を表示
        if ($dat['isFirstRow']) {
          if (!isset($detailItems[$i + 1]['isFirstRow']) || $detailItems[$i + 1]['isFirstRow']) {
            $isOnlyOneRow = true;
            // 品名
            $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $ar[0] . ' ' . ($dat['ar_name'] === 'なし' ? '' : $dat['ar_name']));
            // 寸法
            $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[1] . ' ' . $ar[2]);
            // 先方注文No row * 2 + $pagecnt * $pagelen, $dat['ed_customer_order_no']);

            if ($dat['ed_customer_p_name'] !== '') {
              // 客先品名があったら、品名に表示。アンダーバーが含まれる場合は、品名に前方文字列、規格に後方文字列をセット
              $arr = explode('_', $dat['customerpname']);
              $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $arr[0]);
              $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $arr[1]);
            }
          } else {
            // 品名
            $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $ar[0] . ' ' . ($dat['ar_name'] === 'なし' ? '' : $dat['ar_name']));
            // 規格
            $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[1]);

            // 客先品名があったら、品名に表示。アンダーバーが含まれる場合は、品名に前方文字列、規格に後方文字列をセット
            if ($dat['ed_customer_p_name'] !== '') {
              $arr = explode('_', $dat['customerpname']);
              $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $arr[0]);
              $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $arr[1]);
            }
            // 初回行の書き込みが終了したら次の行へ移動
            $row++;
          }
        }
        if (!$isOnlyOneRow) {
          // 先方注文No
          // $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $dat['ed_customer_order_no']);
          // 寸法
          $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $ar[2]);

          if ($dat['ed_customer_p_name'] !== '') {
            // 客先品名があったら、品名に表示。アンダーバーが含まれる場合は、品名に前方文字列、規格に後方文字列をセット
            $arr = explode('_', $dat['customerpname']);
            $sheet->setCellValueByColumnAndRow(2, 17 + $row * 2 + $pagecnt * $pagelen, $arr[0]);
            $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $arr[1]);
          }
        }

        // 製品規格を記載
        if ($dat['ed_unit_tran'] === $STR_GROUP) {
          // 単位が一式だった場合は、数量、単位は空文字。単価は一式、金額は金額表示にする。
          $dat['ed_unit_tran'] = '';
          $dat['ed_quantity'] = '';
          $dat['ed_unit_price'] = $STR_GROUP;
        }
        if ($dat['ed_quantity'] !== ''  && (float)$dat['ed_quantity'] === 0) {
          $dat['ed_quantity'] = '';
          $dat['ed_unit_tran'] = '';
          $dat['ed_unit_price'] = '';
        }

        $sheet->setCellValueByColumnAndRow(8, 17 + $row * 2 + $pagecnt * $pagelen, $dat['ed_quantity']);
        $sheet->setCellValueByColumnAndRow(9, 17 + $row * 2 + $pagecnt * $pagelen, $dat['ed_unit_tran']);
        $sheet->setCellValueByColumnAndRow(10, 17 + $row * 2 + $pagecnt * $pagelen, $dat['ed_unit_price']);
        $sheet->setCellValueByColumnAndRow(12, 17 + $row * 2 + $pagecnt * $pagelen, $dat['ed_price'] === 0 ? '' : $dat['ed_price']);
        $sheet->setCellValueByColumnAndRow(14, 17 + $row * 2 + $pagecnt * $pagelen, $dat['ed_detail_remarks']);

        $price += $dat['ed_price'] === '' ? 0 : $dat['ed_price'];
        $row++;

        // if ( $row >= $nPageRowNum) {
        $nextDat = $detailItems[$i + 1];
        if (($nextDat['isFirstRow'] && $nextDat['itemCnt'] > 1 && $row === ($nPageRowNum - 1)) ||
          ($row > ($nPageRowNum - 1) && ($nPage > ($pagecnt + 1)))
        ) {
          // 1ページを超える場合は、次ページ作成
          $row = 0;
          // 自社入力欄を最終ページのみに付加する場合は、セルのマージを外してから貼り付け　$recordlen
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 28, $pagelen);
          $pagecnt++;
          // データクリア
          for ($j = 0; $j < $nPageRowNum; $j++) {
            // 明細行内容
            // 製品規格
            $sheet->setCellValueByColumnAndRow(2, 17 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(2, 18 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(8, 17 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(9, 17 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(10, 17 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(12, 17 + $j * 2 + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(14, 17 + $j * 2 + $pagecnt * $pagelen, '');
          }
          $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }
        if ($i === (count($items) - 1)) {
          // 最終行だったら合計金額表記
          $sheet->setCellValueByColumnAndRow(12, 33 + $pagecnt * $pagelen, $price);
        }
      }
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:R' . (($pagecnt + 1) * $pagelen));
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, '注文請書' . '_' . $items[0]['e_estimate_no'], true);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 取込用ファイル出力を作成する 11/11修正途中
   */
  public static function issueEstimateOutputFile($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // // 処理時間を延長
      // ini_set('max_execution_time', 60);
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      // $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/EstimateDataFile.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $row = 3;
      // 明細内容出力
      for ($i = 0; $i < count($items); $i++) {
        $dat = $items[$i];
        // 受注枝番
        $sheet->setCellValueByColumnAndRow(1, $row, $dat['ed_estimate_sub_no']);
        // ？計算？
        // $sheet->setCellValueByColumnAndRow(2, $row, $dat['']);
        // 品名CD
        $sheet->setCellValueByColumnAndRow(3, $row, $dat['ed_p_cd']);
        // 品名
        $sheet->setCellValueByColumnAndRow(4, $row, $dat['p_name']);
        // 加工内容
        $sheet->setCellValueByColumnAndRow(5, $row, $dat['ed_parrangement_cd']);
        // 線径・線幅1
        $sheet->setCellValueByColumnAndRow(6, $row, $dat['ed_sub_01']);
        // 線厚み1
        $sheet->setCellValueByColumnAndRow(7, $row, $dat['ed_sub_12']);
        // 線径・線幅2
        $sheet->setCellValueByColumnAndRow(8, $row, $dat['ed_sub_02']);
        // 線厚み2
        $sheet->setCellValueByColumnAndRow(9, $row, $dat['ed_sub_13']);
        // 線番
        $sheet->setCellValueByColumnAndRow(10, $row, $dat['ed_sub_num_03']);
        // 目合区分
        $sheet->setCellValueByColumnAndRow(11, $row, $dat['ed_sub_03']);
        // W（目合1）
        $sheet->setCellValueByColumnAndRow(12, $row, $dat['ed_sub_04']);
        // L（目合2）
        $sheet->setCellValueByColumnAndRow(13, $row, $dat['ed_sub_05']);
        // 数量単位CD（目合サイズ）
        $sheet->setCellValueByColumnAndRow(14, $row, $dat['ed_sub_06']);
        // 寸法1
        $sheet->setCellValueByColumnAndRow(15, $row, $dat['ed_sub_08']);
        // 寸法1補足
        $sheet->setCellValueByColumnAndRow(16, $row, $dat['ed_sub_10']);
        // 寸法2
        $sheet->setCellValueByColumnAndRow(17, $row, $dat['ed_sub_09']);
        // 寸法2補足
        $sheet->setCellValueByColumnAndRow(18, $row, $dat['ed_sub_11']);
        // 受注数
        $sheet->setCellValueByColumnAndRow(19, $row, $dat['ed_quantity']);
        // 単位
        $sheet->setCellValueByColumnAndRow(20, $row, $dat['ed_unit_tran']);
        // 科目区分
        $sheet->setCellValueByColumnAndRow(21, $row, $dat['ed_type_subject']);
        // 現品票枚数
        $sheet->setCellValueByColumnAndRow(22, $row, $dat['ed_type_04']);
        // 面積
        $sheet->setCellValueByColumnAndRow(23, $row, $dat['ed_sub_num_01']);
        // 単価
        $sheet->setCellValueByColumnAndRow(24, $row, $dat['ed_unit_price']);
        // 金額
        $sheet->setCellValueByColumnAndRow(25, $row, $dat['ed_price']);
        // 原価
        $sheet->setCellValueByColumnAndRow(26, $row, $dat['ed_cost']);
        // 希望納期
        $sheet->setCellValueByColumnAndRow(27, $row, self::formatStrToDate($dat['ed_desired_delivery_date']));
        // 先方注文No/図番
        $sheet->setCellValueByColumnAndRow(28, $row, $dat['ed_customer_order_no']);
        // 先方品名
        $sheet->setCellValueByColumnAndRow(29, $row, $dat['ed_customer_p_name']);
        // 製品手配方法
        $sheet->setCellValueByColumnAndRow(30, $row, $dat['ed_ar_cd']);
        // 予定入庫先（場所CD）
        $sheet->setCellValueByColumnAndRow(31, $row, $dat['ed_warehouse_cd']);
        // 製造計画
        $sheet->setCellValueByColumnAndRow(32, $row, $dat['ed_prod_plan_sign']);
        // 梱包G
        $sheet->setCellValueByColumnAndRow(33, $row, $dat['ed_packing_group']);
        // 梱包サイズ
        $sheet->setCellValueByColumnAndRow(34, $row, $dat['ed_packing_size']);
        // 梱包数
        $sheet->setCellValueByColumnAndRow(35, $row, $dat['ed_packing_num']);
        // 荷姿CD
        $sheet->setCellValueByColumnAndRow(36, $row, $dat['ed_packing_cd']);
        // 荷姿詳細
        $sheet->setCellValueByColumnAndRow(37, $row, $dat['ed_packing_content']);
        // 備考
        $sheet->setCellValueByColumnAndRow(38, $row, $dat['ed_remarks']);

        $row++;
      }
      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'Excel出力' . '_' . $items[0]['ed_estimate_no'], true);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 品名CD、規格が同じデータで並べ替えした配列を返却
   */
  private static function sortEstimateDatas($items)
  {
    $detailItems = [];
    // 行数カウント
    $rowCount = 0;
    // 何行目か
    $row = 1;
    // 前回の内容
    $prevData = array('ed_p_cd' => "", 'standard' => "", 'ar_name' => "");
    foreach ($items as $item) {
      // 規格
      $standard = $item['ed_customer_p_name'] !== '' ? explode('_', $item['customerpname'])[1] : self::makeArrayProductSpec($item)[1];
      $item['standard'] = $standard;
      // 明細行のデータに該当の品名CD、規格が存在するか判定
      if ($prevData['ed_p_cd'] === $item['ed_p_cd'] && $prevData['standard'] === $standard && self::compareArrangementName($prevData['ar_name'], $item['ar_name'])) {
        $rowCount += 1;
      } else {
        $rowCount = 0;
      }
      $item['isFirstRow'] = $rowCount === 0 ? true : false;
      $item['row'] = $row;
      array_push($detailItems, $item);
      $row += 1;

      // 今回の情報を保持しておく
      $prevData['ed_p_cd'] = $item['ed_p_cd'];
      $prevData['standard'] = $item['standard'];
      $prevData['ar_name'] = $item['ar_name'];
    }

    // itemCnt（同じ品名コード、規格、加工内容のデータが何件あるか）を設定
    $itemCnt = 1;
    for ($i = 0; $i < count($detailItems); $i += 1) {
      if ($detailItems[$i]['isFirstRow']) {

        // isFirstRowがtrueでitemCntはリセット
        $itemCnt = 1;
        // 次行からループ開始
        for ($j = $i + 1; $j < count($detailItems); $j += 1) {
          // 次行のisFirstRowがtrueならループ終了
          if (isset($detailItems[$j]) && $detailItems[$j]['isFirstRow']) {
            break;
          }

          // 次行のisFirstRowがfalseなら、同じ内容のデータなのでitemCntは+1する
          if (isset($detailItems[$j]) && !$detailItems[$j]['isFirstRow']) {
            $itemCnt += 1;
          }
        }
      }
      // itemCntを設定
      $detailItems[$i]['itemCnt'] = $itemCnt;
    }

    return $detailItems;
  }

  /**
   * 指示書添付用受注書を作成する
   */
  public static function issueEstimateLPFile($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // // 処理時間を延長
      // ini_set('max_execution_time', 60);
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      // $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/template_LPe.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 53;
      $nPageRowNum = 14;   //  1ページあたりの行数
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      $price = 0;
      // 明細内容出力
      for ($i = 0; $i < count($items); $i++) {
        $dat = $items[$i];
        // 各ページ先頭部分
        if ($row === 0) {
          $sheet->setCellValueByColumnAndRow(2, 3 + $pagecnt * $pagelen, '〒' . $dat['customeraddno']);
          $sheet->setCellValueByColumnAndRow(2, 4 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['customeradd01']));
          $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, $dat['customeradd02']);
          $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, $dat['customername']);
          $sheet->setCellValueByColumnAndRow(2, 7 + $pagecnt * $pagelen, $dat['postname'] . ' 御中');
          // 明細ヘッダ
          $sheet->setCellValueByColumnAndRow(2, 11 + $pagecnt * $pagelen, $dat['chargename'] . ' 様');
          $sheet->setCellValueByColumnAndRow(4, 11 + $pagecnt * $pagelen, isset($dat['e_estimate_date']) ? self::formatStrToDate2($dat['e_estimate_date']) : '');
          $sheet->setCellValueByColumnAndRow(6, 11 + $pagecnt * $pagelen, self::formatStrToDate2($dat['e_desired_delivery_date']));
          $sheet->setCellValueByColumnAndRow(9, 11 + $pagecnt * $pagelen, $dat['orderno']);
          // 何ページになるか算出
          $nPage = ceil(count($items) / $nPageRowNum);
          $sheet->setCellValueByColumnAndRow(12, 11 + $pagecnt * $pagelen, ($pagecnt + 1) . ' / ' . $nPage);
          $sheet->setCellValueByColumnAndRow(13, 11 + $pagecnt * $pagelen, $dat['salesmanname']);

          // フッタセット
          $sheet->setCellValueByColumnAndRow(3, 43 + $pagecnt * $pagelen, $dat['delvname']);
          $sheet->setCellValueByColumnAndRow(3, 44 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['delvadd1']));
          $sheet->setCellValueByColumnAndRow(3, 45 + $pagecnt * $pagelen, $dat['delvadd2']);
          $sheet->setCellValueByColumnAndRow(12, 44 + $pagecnt * $pagelen, $dat['delvtel']);
          $sheet->setCellValueByColumnAndRow(12, 45 + $pagecnt * $pagelen, $dat['delvfax']);
          // 止め先
          $sheet->setCellValueByColumnAndRow(3, 46 + $pagecnt * $pagelen, $dat['stname']);
          $sheet->setCellValueByColumnAndRow(3, 47 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['stadd1']));
          $sheet->setCellValueByColumnAndRow(3, 48 + $pagecnt * $pagelen, $dat['stadd2']);
          $sheet->setCellValueByColumnAndRow(12, 47 + $pagecnt * $pagelen, $dat['sttel']);
          $sheet->setCellValueByColumnAndRow(12, 48 + $pagecnt * $pagelen, $dat['stfax']);
          // 出荷主
          $sheet->setCellValueByColumnAndRow(3, 49 + $pagecnt * $pagelen, $dat['shname']);
          $sheet->setCellValueByColumnAndRow(3, 50 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['shadd1']));
          $sheet->setCellValueByColumnAndRow(3, 51 + $pagecnt * $pagelen, $dat['shadd2']);
          $sheet->setCellValueByColumnAndRow(12, 50 + $pagecnt * $pagelen, $dat['shtel']);
          $sheet->setCellValueByColumnAndRow(12, 51 + $pagecnt * $pagelen, $dat['shfax']);
        }
        // 明細行内容
        $sheet->setCellValueByColumnAndRow(2, 13 + $row * 2 + $pagecnt * $pagelen, self::formatStrToDate($dat['ed_desired_delivery_date']));
        // 品名に_が入っていた場合は規格へ分岐する
        $ar = self::makeArrayProductSpec($dat);
        // $sheet->setCellValueByColumnAndRow(3, 13 + $row * 2 + $pagecnt * $pagelen, $dat['p_name']);
        $sheet->setCellValueByColumnAndRow(3, 13 + $row * 2 + $pagecnt * $pagelen, $ar[0] . $dat['ar_name']);
        if (strpos($dat['ar_name'], 'なし') !== false) {
          // 加工なし、なし等加工が実質ない場合は、品名に付加しない。上書き。
          $sheet->setCellValueByColumnAndRow(3, 13 + $row * 2 + $pagecnt * $pagelen, $ar[0]);
        }
        // 製品規格を記載 
        $sheet->setCellValueByColumnAndRow(3, 14 + $row * 2 + $pagecnt * $pagelen, $ar[1] . ' ' . $ar[2]);
        // $sheet->setCellValueByColumnAndRow(3, 14 + $row * 2 + $pagecnt * $pagelen, self::makeStrProductSpec($dat));
        $sheet->setCellValueByColumnAndRow(9, 13 + $row * 2 + $pagecnt * $pagelen, $dat['ed_quantity']);
        $sheet->setCellValueByColumnAndRow(10, 13 + $row * 2 + $pagecnt * $pagelen, $dat['ed_unit_tran']);
        $sheet->setCellValueByColumnAndRow(15, 13 + $row * 2 + $pagecnt * $pagelen, $dat['ed_detail_remarks']);
        $price += $dat['ed_price'];
        $row++;
        if ($row > 20) {
          // 1ページを超える場合は、次ページ作成
          $row = 0;
          $pagecnt++;
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 10, $pagelen);
        }
      }
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:P' . (($pagecnt + 1) * $pagelen));
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, '注文一覧(製造用)', true);
    } catch (Exception $e) {
      die();
    }
  }


  /**
   * 製作指示書
   */
  public static function issueProductPlanSheet($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/template_pp.xlsx');

      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 73;
      $nPageRowNum = 13;   //  1ページあたりの行数
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      $estNo  = '';           // 見積書番号
      $header = $items[0];
      $strEstNo = '';       // 連結後の見積書番号
      // 見積書番号　文字列連結
      foreach ($items as $rec) {
        if ($rec['pw_estimate_no'] === '') {
          continue;
        }
        if ($estNo ===  '' || $estNo !== $rec['pw_estimate_no']) {
          if ($strEstNo === '') {
            $strEstNo = $rec['pw_estimate_no'];
          } else {
            $strEstNo .= ',' . $rec['pw_estimate_no'];
          }
          $estNo = $rec['pw_estimate_no'];
        }
      }
      // ヘッダ **********************************************************************
      if ($header['e_estimate_date'] === '' || $header['e_estimate_date'] === null) {
        // 空の場合はスルー　
      } else {
        $temp = substr($header['e_estimate_date'], 0, 4) . '年' . substr($header['e_estimate_date'], 4, 2) . '月' . substr($header['e_estimate_date'], 6, 2) . '日';
        $sheet->setCellValueByColumnAndRow(6, 1 + $pagecnt * $pagelen, $temp);
      }
      $sheet->setCellValueByColumnAndRow(44, 1 + $pagecnt * $pagelen, $header['pp_prod_plan_no']);
      $sheet->setCellValueByColumnAndRow(3, 4 + $pagecnt * $pagelen, $header['customername']);
      $sheet->setCellValueByColumnAndRow(33, 4 + $pagecnt * $pagelen, $header['shippername']);
      $sheet->setCellValueByColumnAndRow(33, 6 + $pagecnt * $pagelen, $header['delivname']);
      $sheet->setCellValueByColumnAndRow(58, 4 + $pagecnt * $pagelen, $header['crimpmachinename']);
      $sheet->setCellValueByColumnAndRow(58, 6 + $pagecnt * $pagelen, $header['wvmachinename']);
      $sheet->setCellValueByColumnAndRow(3, 8 + $pagecnt * $pagelen, $header['materialname']);
      $sheet->setCellValueByColumnAndRow(13, 8 + $pagecnt * $pagelen, $header['pp_spec']);
      $sheet->setCellValueByColumnAndRow(20, 8 + $pagecnt * $pagelen, $header['weavename']);
      $sheet->setCellValueByColumnAndRow(29, 8 + $pagecnt * $pagelen, $header['pp_bump_num']);
      $sheet->setCellValueByColumnAndRow(40, 8 + $pagecnt * $pagelen, (float)$header['pp_ed_sub_01']);
      $sheet->setCellValueByColumnAndRow(40, 10 + $pagecnt * $pagelen, (float)$header['pp_ed_sub_02']);
      $sheet->setCellValueByColumnAndRow(51, 8 + $pagecnt * $pagelen, $header['pp_ed_sub_04']);
      $sheet->setCellValueByColumnAndRow(51, 10 + $pagecnt * $pagelen, $header['pp_ed_sub_05']);
      $sheet->setCellValueByColumnAndRow(62, 8 + $pagecnt * $pagelen, $header['pp_ed_sub_06']);
      $sheet->setCellValueByColumnAndRow(62, 10 + $pagecnt * $pagelen, $header['pp_ed_sub_06_02']);
      $sheet->setCellValueByColumnAndRow(5, 12 + $pagecnt * $pagelen, $header['m1cd']);
      $sheet->setCellValueByColumnAndRow(5, 14 + $pagecnt * $pagelen, $header['m2cd']);
      $sheet->setCellValueByColumnAndRow(10, 12 + $pagecnt * $pagelen, $header['m1ml_mark_01'] . '×' . $header['m1ml_mark_02']);
      $sheet->setCellValueByColumnAndRow(10, 14 + $pagecnt * $pagelen, $header['m2ml_mark_01'] . '×' . $header['m2ml_mark_02']);
      $sheet->setCellValueByColumnAndRow(22, 12 + $pagecnt * $pagelen, $strEstNo);    // 受注番号文字列結合
      $sheet->setCellValueByColumnAndRow(36, 12 + $pagecnt * $pagelen, $header['m1ml_gear_num']);
      $sheet->setCellValueByColumnAndRow(36, 14 + $pagecnt * $pagelen, $header['m2ml_gear_num']);
      $sheet->setCellValueByColumnAndRow(45, 12 + $pagecnt * $pagelen, $header['m1ml_pitch']);
      $sheet->setCellValueByColumnAndRow(45, 14 + $pagecnt * $pagelen, $header['m2ml_pitch']);
      $sheet->setCellValueByColumnAndRow(53, 12 + $pagecnt * $pagelen, $header['m1ml_apply']);
      $sheet->setCellValueByColumnAndRow(53, 14 + $pagecnt * $pagelen, $header['m2ml_apply']);
      $sheet->setCellValueByColumnAndRow(60, 12 + $pagecnt * $pagelen, Plannerdbmgr::convertStrRoundDownToNumber($header['pp_weight']) . 'kg');
      $sheet->setCellValueByColumnAndRow(5, 17 + $pagecnt * $pagelen, $header['pp_depth_01']);
      $sheet->setCellValueByColumnAndRow(15, 17 + $pagecnt * $pagelen, $header['pp_depth_02']);
      $sheet->setCellValueByColumnAndRow(25, 17 + $pagecnt * $pagelen, $header['pp_left']);
      $sheet->setCellValueByColumnAndRow(35, 17 + $pagecnt * $pagelen, $header['pp_weave_cnt']);
      $sheet->setCellValueByColumnAndRow(41, 17 + $pagecnt * $pagelen, $header['pp_right']);
      $sheet->setCellValueByColumnAndRow(51, 17 + $pagecnt * $pagelen, $header['pp_rate']);
      $sheet->setCellValueByColumnAndRow(60, 17 + $pagecnt * $pagelen, $header['pp_cam']);
      // 使用材
      $sheet->setCellValueByColumnAndRow(9, 59 + $pagecnt * $pagelen, $header['purchasename']);    // 材料メーカ
      $sheet->setCellValueByColumnAndRow(17, 59 + $pagecnt * $pagelen, $header['pp_material_cd_01']);
      $sheet->setCellValueByColumnAndRow(22, 59 + $pagecnt * $pagelen, $header['materialname']);     // 品名
      // QR
      self::makeQR(54, 52 + $pagecnt * $pagelen, 100, $header['pp_prod_plan_no'], self::setQRMode('est'))->setWorksheet($sheet);
      // 織工程のデータ
      $sdat24 = array_filter($items, function ($elem) {
        if ($elem['pw_process_cd'] === '24') {
          return true;
        }
        return false;
      });
      // 縦抜き工程のデータ
      $sdat20 = array_filter($items, function ($elem) {
        if ($elem['pw_process_cd'] === '20') {
          return true;
        }
        return false;
      });
      // 変数リセット
      $i = 0;
      $estNo  = '';
      foreach ($sdat24 as $rec) {
        if ($estNo === '' || $estNo !== $rec['ed_estimate_no']) {
          $sheet->setCellValueByColumnAndRow(3, 20 + ($i * 2) + $pagecnt * $pagelen, '<' . $rec['ed_estimate_no'] . '>');
          $estNo = $rec['ed_estimate_no'];
        }
        $sheet->setCellValueByColumnAndRow(3, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['ed_estimate_sub_no']);
        // 寸法
        $arr = self::makeArrayProductSpec($rec);
        $sheet->setCellValueByColumnAndRow(5, 21 + ($i * 2) + $pagecnt * $pagelen, $arr[2]);
        $sheet->setCellValueByColumnAndRow(17, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_quantity']);
        $sheet->setCellValueByColumnAndRow(20, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_ins_qty']);
        $sheet->setCellValueByColumnAndRow(23, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_side_num']);
        $sheet->setCellValueByColumnAndRow(24, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_width_size']);
        $sheet->setCellValueByColumnAndRow(32, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_vertical_size']);
        $sheet->setCellValueByColumnAndRow(40, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_sheets_num']);
        $sheet->setCellValueByColumnAndRow(42, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_vert_num']);
        $sheet->setCellValueByColumnAndRow(48, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_chain_num']);
        $sheet->setCellValueByColumnAndRow(54, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_group_sign']);
        $sheet->setCellValueByColumnAndRow(56, 21 + ($i * 2) + $pagecnt * $pagelen, $rec['pw_prod_remark']);
        $i++;
      }
      $i = 0; // リセット
      foreach ($sdat20 as $rec) {
        $sheet->setCellValueByColumnAndRow(3, 47 + $i + $pagecnt * $pagelen, $rec['pw_width_size']);
        $sheet->setCellValueByColumnAndRow(10, 47 + $i + $pagecnt * $pagelen, $rec['pw_result_size']);
        $sheet->setCellValueByColumnAndRow(32, 47 + $i + $pagecnt * $pagelen, $rec['pw_vertical_size']);
        $sheet->setCellValueByColumnAndRow(39, 47 + $i + $pagecnt * $pagelen, $rec['pw_sheets_num']);
        $sheet->setCellValueByColumnAndRow(44, 47 + $i + $pagecnt * $pagelen, $rec['pw_chain_num']);
        $sheet->setCellValueByColumnAndRow(50, 47 + $i + $pagecnt * $pagelen, $rec['pw_vert_num']);
        $sheet->setCellValueByColumnAndRow(56, 47 + $i + $pagecnt * $pagelen, $rec['pw_prod_remark']);
        $i++;
      }

      // クライアント側に出力
      self::outputToBrowser($objPHPE, '製造指示書_' . $header['pp_prod_plan_no'], true);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 作業確認検査記録表
   * $items1:受注情報
   * $items2:工程・検査情報
   * $items3:梱包情報
   */
  public static function issueInspectionSheet($items1, $items2, $items3)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/template_ins.xlsx');

      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 131;
      // $nPageRowNum = 13;   //  1ページあたりの行数
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;

      $strEstNo = '';
      $strDeliveryDate = '';
      // 受注情報 **************************************************************************
      foreach ($items1 as $rec) {
        // 複数受注番号がある場合連結
        if ($rec['pd_e_estimate_no'] !== '') {
          if ($strEstNo === '') {
            $strEstNo = $rec['pd_e_estimate_no'];
          } else if ($strEstNo !== $rec['pd_e_estimate_no']) {
            $strEstNo .= ',' . $rec['pd_e_estimate_no'];
          }
          // 納期　最も早いの取得
          if ($strDeliveryDate === '') {
            $strDeliveryDate = $rec['ed_desired_delivery_date'];
          } else if ($strDeliveryDate < $rec['ed_desired_delivery_date']) {
            $strDeliveryDate = $rec['ed_desired_delivery_date'];
          }
        }
      }

      $record = $items1[0];
      $arr = [];
      $str = '';
      $sheet->setCellValueByColumnAndRow(17, 1 + $pagecnt * $pagelen, $strEstNo);
      $sheet->setCellValueByColumnAndRow(32, 1 + $pagecnt * $pagelen, $record['customername']);
      $sheet->setCellValueByColumnAndRow(3, 4 + $pagecnt * $pagelen, $record['par_name']);
      $sheet->setCellValueByColumnAndRow(26, 4 + $pagecnt * $pagelen, '0');    // 時間　　合計実績　目標時間はエクセルにて計算
      $sheet->setCellValueByColumnAndRow(7, 8 + $pagecnt * $pagelen, $record['ed_p_cd']);
      $sheet->setCellValueByColumnAndRow(7, 10 + $pagecnt * $pagelen, $record['p_name']);
      // 規格
      $arr = self::makeArrayProductSpec($rec);
      $sheet->setCellValueByColumnAndRow(7, 12 + $pagecnt * $pagelen, $arr[1]);  // 規格
      // フッタ
      $sheet->setCellValueByColumnAndRow(33, 63 + $pagecnt * $pagelen, $record['delivname']);   // 送り先
      $sheet->setCellValueByColumnAndRow(33, 65 + $pagecnt * $pagelen, $record['stayname']);  // 止め荷物 
      $sheet->setCellValueByColumnAndRow(33, 67 + $pagecnt * $pagelen, $record['shippername']);  // 出荷人
      // $sheet->setCellValueByColumnAndRow(29, 71 + $pagecnt * $pagelen, $record['par_name']);  // 金網上がり予定日
      $sheet->setCellValueByColumnAndRow(44, 71 + $pagecnt * $pagelen, self::formatStrToDate2($record['pd_finish_plan_date_h']));  // 加工上がり予定日
      $sheet->setCellValueByColumnAndRow(34, 86 + $pagecnt * $pagelen, self::formatStrToDate2($strDeliveryDate));  // 納入日
      switch ($record['ed_type_02']) {
        case '1':
          $str = '頃';
          break;
        case '2':
          $str = 'まで';
          break;
        case '3':
          $str = '指定';
          break;
      }
      $sheet->setCellValueByColumnAndRow(49, 86 + $pagecnt * $pagelen, $str);  // 1:頃、2:まで、3:指定

      // レコード数
      $cnt = 0;
      $cnt10 = 0;
      $cnt30 = 0;
      $cnt40 = 0;
      $cnt50 = 0;
      // 検査項目保持
      $arInpItem = [];
      foreach ($items2 as $rec) {
        // 検査項目取得
        if ($rec['ppr_ins_cd_01']) {
          $arInpItem[$cnt]['cd'] = $rec['ppr_ins_cd_01'];
          $arInpItem[$cnt]['name'] = $rec['ini_name'];
          $cnt += 1;
        }
        if ($rec['ppr_ins_cd_02']) {
          $arInpItem[$cnt]['cd'] = $rec['ppr_ins_cd_01'];
          $arInpItem[$cnt]['name'] = $rec['ini_name'];
          $cnt += 1;
        }
        if ($rec['ppr_ins_cd_03']) {
          $arInpItem[$cnt]['cd'] = $rec['ppr_ins_cd_01'];
          $arInpItem[$cnt]['name'] = $rec['ini_name'];
          $cnt += 1;
        }
        // 製造プロセスは、金網製造指示の時間で枠表示させる
        if ($rec['ppr_proc_cd'] >= 30 && $rec['ppr_proc_cd'] < 40) {
          // 切断プロセス 30
          $sheet->setCellValueByColumnAndRow(1, 48 + ($cnt30 * 2) + $pagecnt * $pagelen, $rec['ppr_mn_content_name']);
          $sheet->setCellValueByColumnAndRow(7, 48 + ($cnt30 * 2) + $pagecnt * $pagelen, $rec['ppr_details']);
          $sheet->setCellValueByColumnAndRow(20, 48 + ($cnt30 * 2) + $pagecnt * $pagelen, $rec['ppr_interval']);
          $cnt30 += 1;
        } else if ($rec['ppr_proc_cd'] >= 40 && $rec['ppr_proc_cd'] < 50) {
          // 加工　40
          $sheet->setCellValueByColumnAndRow(1, 66 + ($cnt40 * 2) + $pagecnt * $pagelen, $rec['ppr_mn_content_name']);
          $sheet->setCellValueByColumnAndRow(7, 66 + ($cnt40 * 2) + $pagecnt * $pagelen, $rec['ppr_details']);
          $sheet->setCellValueByColumnAndRow(20, 66 + ($cnt40 * 2) + $pagecnt * $pagelen, $rec['ppr_interval']);
          $cnt40 += 1;
        } else if ($rec['ppr_proc_cd'] >= 50 && $rec['ppr_proc_cd'] < 60) {
          // 振動篩　50
          $sheet->setCellValueByColumnAndRow(1, 92 + ($cnt50 * 2) + $pagecnt * $pagelen, $rec['ppr_mn_content_name']);
          $sheet->setCellValueByColumnAndRow(7, 92 + ($cnt50 * 2) + $pagecnt * $pagelen, $rec['ppr_details']);
          $sheet->setCellValueByColumnAndRow(20, 92 + ($cnt50 * 2) + $pagecnt * $pagelen, $rec['ppr_interval']);
          $cnt50 += 1;
        }
      }
      // 検査項目
      $cnt = 0;
      $flg = false;     // その他判別用
      ksort($arInpItem);  // キーでソート
      foreach ($arInpItem as $rec) {
        $flg = false;
        if (strpos($rec['name'], '寸法') !== false) {
          $sheet->setCellValueByColumnAndRow(33, 21 + $pagecnt * $pagelen, '☑　寸法');
          $flg = true;
        }
        if (strpos($rec['name'], '数量') !== false) {
          $sheet->setCellValueByColumnAndRow(33, 23 + $pagecnt * $pagelen, '☑　数量');
          $flg = true;
        }
        if (strpos($rec['name'], '外観') !== false) {
          $sheet->setCellValueByColumnAndRow(33, 25 + $pagecnt * $pagelen, '☑　外観');
          $flg = true;
        }
        if (strpos($rec['name'], '曲げ') !== false) {
          $sheet->setCellValueByColumnAndRow(33, 27 + $pagecnt * $pagelen, '☑　曲げ');
          $flg = true;
        }
        if (strpos($rec['name'], '振動篩') !== false) {
          $sheet->setCellValueByColumnAndRow(33, 29 + $pagecnt * $pagelen, '☑　振動篩');
          $flg = true;
        }
        if (strpos($rec['name'], '溶接') !== false) {
          $sheet->setCellValueByColumnAndRow(45, 21 + $pagecnt * $pagelen, '☑　溶接');
          $flg = true;
        }
        if (strpos($rec['name'], '接着') !== false) {
          $sheet->setCellValueByColumnAndRow(45, 23 + $pagecnt * $pagelen, '☑　接着');
          $flg = true;
        }
        if (strpos($rec['name'], '洗浄') !== false) {
          $sheet->setCellValueByColumnAndRow(45, 25 + $pagecnt * $pagelen, '☑　洗浄');
          $flg = true;
        }
        if (!$flg) {
          // どの項目とも違う場合 2項目しか表記不可(レイアウト上)
          if ($cnt < 2) {
            $sheet->setCellValueByColumnAndRow(45, 27 + $cnt + $pagecnt * $pagelen, '☑' . $rec['name']);
            $cnt += 1;
          }
        }
      }

      // 梱包指示
      $cnt = 0; // カウンターリセット
      $transComp = '';
      foreach ($items3 as $rec) {
        if (isset($rec['pkg_name'])) {
          $sheet->setCellValueByColumnAndRow(31, 43 + ($cnt * 2) + $pagecnt * $pagelen, $rec['pkg_name']);
          $sheet->setCellValueByColumnAndRow(35, 43 + ($cnt * 2) + $pagecnt * $pagelen, $rec['pkg_content']);
          $sheet->setCellValueByColumnAndRow(40, 43 + ($cnt * 2) + $pagecnt * $pagelen, $rec['sd_packing_size']);
          $cnt += 1;
        }
      }

      // フッタ
      // $sheet->setCellValueByColumnAndRow(33, 76 + $pagecnt * $pagelen, $record['par_name']);  // 出荷予定日
      $sheet->setCellValueByColumnAndRow(33, 82 + $pagecnt * $pagelen, $cnt);  // 梱包口数
      $sheet->setCellValueByColumnAndRow(50, 76 + $pagecnt * $pagelen, $items3[0]['s_tc_short_name']);  // 運送会社

      // クライアント側に出力
      self::outputToBrowser($objPHPE, '作業検査記録表_' . $items1[0]['pd_prod_plan_no']);
    } catch (Exception $e) {
      die();
    }
  }

  // /**
  //  * 製作指示書ファイル(製造リーフベース)を作成する
  //  */
  // public static function issueLPFile($items)
  // {
  //   require_once 'vendor/autoload.php';
  //   try {
  //     // テンプレートファイルを読込
  //     $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');
  //     $objReader->setIncludeCharts(true);
  //     $objPHPE = $objReader->load('./template/template_lp.xls');
  //     // 内容を書き込み
  //     $objPHPE->getActiveSheet();
  //     $sheet = $objPHPE->setActiveSheetIndex(0);
  //     $pagelen = 33;
  //     // 先頭ページ処理
  //     $sumPlanTime = 0;
  //     $sumResultTime = 0;
  //     $pagecnt = 0;
  //     $row = 0;
  //     self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 16, $pagelen);
  //     // 明細内容出力
  //     for ($i = 0; $i < count($items); $i++) {
  //       $dat = $items[$i];
  //       // 各ページ先頭部分
  //       if ($row === 0) {
  //         // 客先名など表示
  //         $sheet->setCellValueByColumnAndRow(1, 3 + $pagecnt * $pagelen, $items[0]['l_ppd_prodplan_id'] . '-' . $items[0]['l_ppd_row']);
  //         $sheet->setCellValueByColumnAndRow(2, 4 + $pagecnt * $pagelen, $items[0]['C_CUSTOMER_NAME']);
  //         $sheet->setCellValueByColumnAndRow(6, 4 + $pagecnt * $pagelen, $items[0]['CC_CHARGE_NAME']);
  //         $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, $items[0]['ppd_quantity']);
  //         $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, $items[0]['ppd_finish_plan']);

  //         $sheet->setCellValueByColumnAndRow(10, 3 + $pagecnt * $pagelen, $items[0]['pp_title']);
  //         $sheet->setCellValueByColumnAndRow(10, 4 + $pagecnt * $pagelen, $items[0]['p_drawing']);
  //         $sheet->setCellValueByColumnAndRow(10, 5 + $pagecnt * $pagelen, $items[0]['parent_p_name']);

  //         $sheet->setCellValueByColumnAndRow(9, 29 + $pagecnt * $pagelen, $items[0]['SALESMAN_NAME']);
  //         if ($items[0]['E_REPEAT'] === 'R') {
  //           $sheet->setCellValueByColumnAndRow(10, 6 + $pagecnt * $pagelen, 'リピート');
  //         } elseif ($items[0]['E_REPEAT'] === 'N') {
  //           $sheet->setCellValueByColumnAndRow(10, 6 + $pagecnt * $pagelen, '新規');
  //         }
  //         // ページ左下
  //         $sheet->setCellValueByColumnAndRow(2, 29 + $pagecnt * $pagelen, $items[0]['l_ppd_prodplan_id'] . '-' . $items[0]['l_ppd_row']);
  //         $sheet->setCellValueByColumnAndRow(2, 30 + $pagecnt * $pagelen, $items[0]['pp_title']);
  //         $sheet->setCellValueByColumnAndRow(2, 31 + $pagecnt * $pagelen, $items[0]['ppd_quantity']);
  //         $sheet->setCellValueByColumnAndRow(2, 32 + $pagecnt * $pagelen, self::formatStrToDate($items[0]['ppd_finish_plan'], 'n/j'));
  //       }
  //       // 明細行内容
  //       //$sheet->getStyleByColumnAndRow(1, 10 + $row + $pagecnt * $pagelen)->getAlignment()->setWrapText(true);
  //       // 予定
  //       $sheet->setCellValueByColumnAndRow(1, 10 + $row + $pagecnt * $pagelen, $dat['b_proc_name']); //$dat['p_name']);
  //       $sheet->setCellValueByColumnAndRow(4, 10 + $row + $pagecnt * $pagelen, $dat['l_amount']);
  //       $sheet->setCellValueByColumnAndRow(2, 10 + $row + $pagecnt * $pagelen, $dat['l_required_time']);
  //       $sheet->setCellValueByColumnAndRow(6, 10 + $row + $pagecnt * $pagelen, self::formatStrToDate($dat['l_start_plan'], 'n/j H:i'));
  //       // 実績
  //       $sheet->setCellValueByColumnAndRow(9, 10 + $row + $pagecnt * $pagelen, self::formatStrToDate($dat['l_start_date'], 'n/j H:i'));
  //       $sheet->setCellValueByColumnAndRow(10, 10 + $row + $pagecnt * $pagelen, $dat['l_result_time'] > 0 ? $dat['l_result_time'] : '');
  //       //$sheet->setCellValueByColumnAndRow(12, 10 + $row + $pagecnt * $pagelen, self::formatStrToDate($dat['l_summary'], 'n/j'));
  //       $sheet->setCellValueByColumnAndRow(13, 10 + $row + $pagecnt * $pagelen, $dat['l_result_time'] > 0 ? $dat['WORKER_NAME'] : '');
  //       $sumPlanTime += $dat['l_required_time'];
  //       $sumResultTime += isset($dat['l_result_time']) ? $dat['l_result_time'] : 0;
  //       // 改行または改ページ
  //       $row++;
  //       if ($row >= 15) {
  //         $row = 0;
  //         $pagecnt++;
  //         self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 16, $pagelen);
  //         $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
  //       }
  //     }
  //     // 合計値(最終ページに表示)
  //     $sheet->setCellValueByColumnAndRow(2, 25 + $pagecnt * $pagelen, $sumPlanTime);
  //     $sheet->setCellValueByColumnAndRow(10, 25 + $pagecnt * $pagelen, $sumResultTime > 0 ? $sumResultTime : '');
  //     if ($row === 0) {
  //       $pagecnt--;
  //     }
  //     // 最終ページを削除
  //     $sheet->removeRow(($pagecnt + 1) * $pagelen + 1, $pagelen);
  //     // 印刷時設定
  //     $objPHPE->getActiveSheet()
  //       ->getPageSetup()
  //       ->setPrintArea('A1:O' . (($pagecnt + 1) * $pagelen));
  //     $objPHPE->setActiveSheetIndex(0);
  //     // クライアント側に出力
  //     self::outputToBrowser($objPHPE, 'lp');
  //   } catch (Exception $e) {
  //     die();
  //   }
  // }

  // /**
  //  * 製作指示書ファイルを作成する
  //  */
  // public static function issueLeafFile($items, $repeatData)
  // {
  //   require_once 'vendor/autoload.php';
  //   try {
  //     // テンプレートファイルを読込
  //     $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');
  //     $objReader->setIncludeCharts(true);
  //     $objPHPE = $objReader->load('./template/template_l.xls');
  //     // 内容を書き込み
  //     $objPHPE->getActiveSheet();
  //     $sheet = $objPHPE->setActiveSheetIndex(0);
  //     $pagelen = 24;
  //     // 先頭ページ処理(製作指示書は1ページかつ工程最大10行までとする)
  //     $pagecnt = 0;
  //     $row = 0;
  //     //self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 12, $pagelen);
  //     $strReEstDetailNum = $items[0]['L_ESTIMATE_DETAILS_NO'];
  //     $sheet->setCellValueByColumnAndRow(12, 1, self::formatStrToDate($items[0]['L_ISSUE_DATE']));
  //     $sheet->setCellValueByColumnAndRow(
  //       1,
  //       3,
  //       $items[0]['L_CUSTOMER_CD'] .
  //         $items[0]['L_CUSTOMER_POST_ID'] .
  //         $items[0]['L_ESTIMATE_DATE'] .
  //         $items[0]['L_SALESMAN_CD'] .
  //         $items[0]['L_ESTIMATE_SEQ_NO'] .
  //         $items[0]['L_ESTIMATE_VER'] .
  //         $items[0]['L_ESTIMATE_DETAILS_NO'] .
  //         $items[0]['L_LEAF_SEQ_NO'] .
  //         $items[0]['L_LEAF_VER']
  //     );
  //     $sheet->setCellValueByColumnAndRow(2, 4, $items[0]['C_CUSTOMER_NAME']);
  //     $sheet->setCellValueByColumnAndRow(6, 4, $items[0]['CC_CHARGE_NAME']);
  //     $sheet->setCellValueByColumnAndRow(2, 5, $items[0]['L_MATERIAL_NAME']);
  //     $sheet->setCellValueByColumnAndRow(2, 6, $items[0]['L_MATERIAL_DIMENSIONS']);
  //     if ($items[0]['L_MATERIAL_ORDER_SIGN'] === 'S') {
  //       $sheet->setCellValueByColumnAndRow(2, 7, '在庫使用');
  //     } elseif ($items[0]['L_MATERIAL_ORDER_SIGN'] === 'K') {
  //       if (isset($items[0]['L_ARRIVAL_DATE'])) {
  //         $sheet->setCellValueByColumnAndRow(2, 7, '客先支給(' . self::formatStrToDate($items[0]['L_ARRIVAL_DATE'], 'n/j') . '入荷予定)');
  //       } else {
  //         $sheet->setCellValueByColumnAndRow(2, 7, '客先支給');
  //       }
  //     } else {
  //       if ($items[0]['L_MATERIAL_ARRIVAL_SIGN'] === '1') {
  //         $sheet->setCellValueByColumnAndRow(2, 7, '入荷済み');
  //       } else {
  //         $sheet->setCellValueByColumnAndRow(2, 7, self::formatStrToDate($items[0]['L_ARRIVAL_DATE'], 'n/j'));
  //       }
  //     }

  //     if ($items[0]['L_MILLSHEETS_CHECK'] === 'Y') {
  //       $sheet->setCellValueByColumnAndRow(4, 8, '要');
  //     } else {
  //       $sheet->setCellValueByColumnAndRow(4, 8, '不要');
  //     }

  //     if ($items[0]['L_INSPECTIONSHEETS_CHECK'] === 'Y') {
  //       $sheet->setCellValueByColumnAndRow(4, 9, '要');
  //     } else {
  //       $sheet->setCellValueByColumnAndRow(4, 9, '不要');
  //     }
  //     $sheet->setCellValueByColumnAndRow(2, 10, $items[0]['L_ATTENTION']);
  //     $sheet->setCellValueByColumnAndRow(2, 11, $items[0]['L_EXPLANATORY_A']);
  //     $sheet->setCellValueByColumnAndRow(6, 11, $items[0]['L_NO_A']);
  //     $sheet->setCellValueByColumnAndRow(10, 11, $items[0]['L_EXPLANATORY_B']);
  //     $sheet->setCellValueByColumnAndRow(13, 11, $items[0]['L_NO_B']);
  //     //客先注文番号(伝票番号)の指定があれば表示
  //     if ($items[0]['L_CUSTOMER_ORDER_NO'] <> '' && !isset($items[0]['L_CUSTOMER_ORDER_NO'])) {
  //       $sheet->setCellValueByColumnAndRow(9, 2, '発注番号：');
  //       $sheet->setCellValueByColumnAndRow(10, 2, $items[0]['L_CUSTOMER_ORDER_NO']);
  //     } else {
  //       $sheet->setCellValueByColumnAndRow(9, 2, '');
  //       $sheet->setCellValueByColumnAndRow(10, 2, '');
  //     }
  //     $sheet->setCellValueByColumnAndRow(10, 3, $items[0]['L_TITLE_NAME']);
  //     $sheet->setCellValueByColumnAndRow(10, 4, $items[0]['L_PIC_NO']);
  //     $sheet->setCellValueByColumnAndRow(10, 5, $items[0]['L_PRODUCTS_NAME']);
  //     if ($items[0]['L_REPEAT_SIGN'] === 'R') {
  //       $sheet->setCellValueByColumnAndRow(10, 6, 'リピート');
  //     } elseif ($items[0]['L_REPEAT_SIGN'] === 'N') {
  //       $sheet->setCellValueByColumnAndRow(10, 6, '新規');
  //     }
  //     $sheet->setCellValueByColumnAndRow(10, 8, $items[0]['L_PRODUCTS_NO']);
  //     $sheet->setCellValueByColumnAndRow(12, 8, $items[0]['L_UNIT']);
  //     if (isset($items[0]['L_FACTORY_DATE_NEW'])) {
  //       $sheet->setCellValueByColumnAndRow(10, 9, self::formatStrToDate($items[0]['L_FACTORY_DATE_NEW'])); // yyyy/MM/dd HH:mm
  //     } else {
  //       $sheet->setCellValueByColumnAndRow(10, 9, self::formatStrToDate($items[0]['L_FACTORY_DATE'])); // yyyy/MM/dd HH:mm
  //     }
  //     //巡回リーフ番号
  //     $sheet->setCellValueByColumnAndRow(
  //       2,
  //       27,
  //       substr($items[0]['USER_CD'], 1, 1) .
  //         substr($items[0]['L_ISSUE_DATE'], 5, 2) .
  //         substr($items[0]['L_ISSUE_DATE'], 8, 2) .
  //         sprintf("%'.04d", $items[0]['L_SHORT_SEQ'])
  //     );
  //     $sheet->setCellValueByColumnAndRow(
  //       3,
  //       2,
  //       '(' . substr($items[0]['USER_CD'], 1, 1) .
  //         substr($items[0]['L_ISSUE_DATE'], 5, 2) .
  //         substr($items[0]['L_ISSUE_DATE'], 8, 2) .
  //         sprintf("%'.04d", $items[0]['L_SHORT_SEQ']) . ')'
  //     );
  //     //色
  //     if ($items[0]['USER_COLOR_R'] + $items[0]['USER_COLOR_G'] + $items[0]['USER_COLOR_B'] <> 0) {
  //       $color = sprintf("ff%02x%02x%02x", $items[0]['USER_COLOR_R'], $items[0]['USER_COLOR_G'], $items[0]['USER_COLOR_B']);
  //       $sheet->getStyle('A27:A32')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB($color);
  //       $sheet->getStyle('A2:F2')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB($color);
  //     }
  //     $sheet->setCellValueByColumnAndRow(9, 28, $items[0]['SALESMAN']);
  //     $sheet->setCellValueByColumnAndRow(10, 28, $items[0]['CREATER']);
  //     $sheet->setCellValueByColumnAndRow(12, 28, $items[0]['CONFIRM1']);
  //     $sheet->setCellValueByColumnAndRow(13, 28, $items[0]['LASTMAN']);
  //     // 明細内容出力(工程内容01-10)
  //     for ($i = 0; $i < count($items); $i++) {
  //       $dat = $items[$i];
  //       $sheet->setCellValueByColumnAndRow(1, 14 + $row, $dat['L_PROCESS_CD'] . ':' . $dat['PROCESS_NAME']);
  //       $sheet->setCellValueByColumnAndRow(2, 14 + $row, $dat['PROCSUM']);
  //       $sheet->setCellValueByColumnAndRow(4, 14 + $row, sprintf("%'.02d", $dat['L_PROCESS_NO']));
  //       $sheet->setCellValueByColumnAndRow(5, 14 + $row, self::formatStrToDate($dat['L_PLANNED_DATE'], 'n/j'));
  //       $sheet->setCellValueByColumnAndRow(6, 14 + $row, $dat['L_SUPPLIER_CD']);
  //       $sheet->setCellValueByColumnAndRow(7, 14 + $row, self::formatStrToDate($dat['L_IMPRISONMENT_DAY'], 'n/j'));
  //       $row++;
  //     }
  //     // リピート情報があれば追記する
  //     if (isset($repeatData)) {
  //       $sheet->setCellValueByColumnAndRow(10, 6, '(リピート)');
  //       $row = 0;
  //       for ($i = 0; $i < count($items); $i++) {
  //         $dat = $items[$i];
  //         if ($dat['L_PROCESS_CD'] <> 'X') {
  //           $sheet->setCellValueByColumnAndRow(16, 14 + $row, isset($dat['WORKER_NAME']) ? $dat['WORKER_NAME'] : '');
  //           $sheet->setCellValueByColumnAndRow(17, 14 + $row, isset($dat['PROCRESULTTIME']) ? $dat['PROCRESULTTIME'] : '');
  //           $row++;
  //         }
  //       }
  //     }
  //     // 合計値(最終ページに表示)
  //     //$sheet->setCellValueByColumnAndRow(6, 22 + $pagecnt * $pagelen, $dat['MO_TOTAL']);
  //     //if ($row === 0) {
  //     //  $pagecnt--;
  //     //}
  //     // 最終ページを削除
  //     //$sheet->removeRow(($pagecnt + 1) * $pagelen + 1, $pagelen);
  //     // 印刷時設定
  //     $objPHPE->getActiveSheet()
  //       ->getPageSetup()
  //       ->setPrintArea('A1:R32'); //('A1:K' . (($pagecnt + 1) * $pagelen));
  //     $objPHPE->setActiveSheetIndex(0);
  //     // クライアント側に出力
  //     self::outputToBrowser($objPHPE, 'leaf');
  //   } catch (Exception $e) {
  //     die();
  //   }
  // }

  /**
   * 製作金額明細表ファイルを作成する
   */
  public static function issueLeafCostFile($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');
      //$objReader->setIncludeCharts(TRUE);
      $objPHPE = $objReader->load('./template/template_lc.xls');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 54;
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      $sheet->setCellValueByColumnAndRow(4, 16 + $pagecnt * $pagelen, $items[0]['E_TOTAL']);
      // 明細内容出力
      for ($i = 0; $i < count($items); $i++) {
        $dat = $items[$i];
        // 各ページ先頭部分
        if ($row === 0) {
          self::makeLogoDrawing(7, 8 + $pagecnt * $pagelen)->setWorksheet($sheet); // ロゴ表示
          self::makeTitleDrawing(8, 8 + $pagecnt * $pagelen)->setWorksheet($sheet); // 社名表示
          // self::makeMarkDrawing(9, 5 + $pagecnt * $pagelen)->setWorksheet($sheet); // 社印表示
          // 客先名など表示
          $sheet->setCellValueByColumnAndRow(2, 14 + $pagecnt * $pagelen, $items[0]['E_TITLE_NAME']);
          $sheet->setCellValueByColumnAndRow(8, 3 + $pagecnt * $pagelen, self::formatStrToDate($dat['E_ISSUE_DATE']));
          $sheet->setCellValueByColumnAndRow(2, 9 + $pagecnt * $pagelen, self::formatStrToDate($dat['E_DELIVELY_DATE']));
          $sheet->setCellValueByColumnAndRow(9, 13 + $pagecnt * $pagelen, $items[0]['USER_NAME']);
          $sheet->setCellValueByColumnAndRow(8, 52 + $pagecnt * $pagelen, '=SUM(H' . (18 + $pagecnt * $pagelen) . ':H' . (51 + $pagecnt * $pagelen) . ')');
        }
        // 明細行内容
        $sheet->setCellValueByColumnAndRow(1, 18 + $row * 2 + $pagecnt * $pagelen, $dat['ED_DRAWING_NO']);
        $sheet->setCellValueByColumnAndRow(1, 19 + $row * 2 + $pagecnt * $pagelen, $dat['ED_ARTICLE_NAME']);
        $sheet->setCellValueByColumnAndRow(5, 18 + $row * 2 + $pagecnt * $pagelen, $dat['ED_PRODUCTS_NO']);
        $sheet->setCellValueByColumnAndRow(6, 18 + $row * 2 + $pagecnt * $pagelen, $dat['ED_UNIT']);
        $sheet->setCellValueByColumnAndRow(7, 18 + $row * 2 + $pagecnt * $pagelen, $dat['ED_UNITPRICE']);
        $sheet->setCellValueByColumnAndRow(8, 18 + $row * 2 + $pagecnt * $pagelen, $dat['ED_MONEY']);
        $sheet->setCellValueByColumnAndRow(9, 18 + $row * 2 + $pagecnt * $pagelen, $dat['ED_SUMMARY']);
        $row++;
        if (($pagecnt === 0 && $row > 12) || $row > 16) {
          $row = 0;
          $pagecnt++;
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 10, $pagelen);
        }
      }
      // 最終ページを削除
      if ($row === 0) {
        $pagecnt--;
      }
      $sheet->removeRow(($pagecnt + 1) * $pagelen + 1, $pagelen);
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:J' . (($pagecnt + 1) * $pagelen));
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'leafcost');
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 材料注文書ファイルを作成する
   * $mode:0　材料発注　1 外注委託
   */
  public static function issueMaterialOrderFile($items, $mode)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      // $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/template_order.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 57;
      $recNumPerPage = 8;   // 1ページあたりの明細数
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      $arr = [];
      $arrProc = [];
      $orderDate = '';
      $delivDate = '';
      $sumMoney = 0;
      $bQR = false;   // QR入れ込み      
      $strGroup = '一式';
      $writeRecCnt = 0;
      $tempCnt = 0;

      // 品名CD、規格が同じデータで並べ替え
      $detailItems = self::sortMorderestimateDatas($items);
      // 上記レコードで、実質ページ総数を取得
      foreach ($detailItems as $rec) {
        $writeRecCnt++;
        if ($rec['isFirstRow']) {
          $tempCnt = 0;
        } else {
          $tempCnt++;
        }
        if ($tempCnt === 1) {
          $writeRecCnt++;
        }
      }


      // 明細内容出力      
      for ($i = 0; $i < count($detailItems); $i++) {
        // 全ページ数を算出
        $pageAll = ceil($writeRecCnt / $recNumPerPage);

        $dat = $detailItems[$i];
        // 各ページ先頭部分
        if ($row === 0) {
          // ロゴ表示
          self::makeLogoDrawing(10, 4 + $pagecnt * $pagelen, 40, 5, 468, 46)->setWorksheet($sheet);
          self::makeTitleDrawingEMail(10, 5 + $pagecnt * $pagelen, 49, 28, 460, 90)->setWorksheet($sheet);  // 自社住所、部署、連絡先

          // 客先名など表示
          if ($dat['moed_order_date'] === '' || $dat['moed_order_date'] === 'undefined') {
            // 注文日は今日をセット
            $dat['moed_order_date'] = Plannerdbmgr::currentDate();
          }
          $arr = self::convertToEra($dat['moed_order_date']);
          $orderDate = (string)((int)$arr['gyear']) . '年' . (string)((int)$arr['month']) . '月' . (string)((int)$arr['date']) . '日';
          $sheet->setCellValueByColumnAndRow(14, 3 + $pagecnt * $pagelen, $orderDate);
          $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, $dat['C_CUSTOMER_NAME']);
          $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, is_null($dat['CP_POST_NAME']) ? '' : $dat['CP_POST_NAME']);
          $sheet->setCellValueByColumnAndRow(2, 7 + $pagecnt * $pagelen, is_null($dat['CC_CHARGE_NAME']) ? '' : $dat['CC_CHARGE_NAME']);

          // 客先名にアンダーバーが含まれる場合、アンダーバーの前後を２行に分けて表示する
          $splitedCustomerName = explode('_', $dat['C_CUSTOMER_NAME'], 2);
          if (count($splitedCustomerName) > 1) {
            $sheet->setCellValueByColumnAndRow(2, 5 + $pagecnt * $pagelen, $splitedCustomerName[0]);
            $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, $splitedCustomerName[1]);
          } else {
            // 担当者名を後から手入力した際に、様表示のみになるように式を設定
            if (is_null($dat['CP_POST_NAME']) && $pagecnt > 0) {
              // 部署が設定されていなかった場合のみ
              $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, '=IF(B6<>"", B6, "")');
            }
          }
          $sheet->setCellValueByColumnAndRow(5, 9 + $pagecnt * $pagelen, $dat['moed_order_no']);


          // ページ
          if ($pageAll > 1) {
            $sheet->setCellValueByColumnAndRow(8, 9 + $pagecnt * $pagelen, ($pagecnt + 1) . '/' . $pageAll);
          }

          // 希望納期が入ってない場合がほとんどなので、セットされている場合のみ納期をセットする。
          if ($dat['moed_arrival_hd_date'] !== '') {
            $arr = self::convertToEra($dat['moed_arrival_hd_date']);
            $delivDate = (string)((int)$arr['gyear']) . '年' . (string)((int)$arr['month']) . '月' . (string)((int)$arr['date']) . '日';
            $sheet->setCellValueByColumnAndRow(5, 10 + $pagecnt * $pagelen, $delivDate);
          }
          // // 備考
          $sheet->setCellValueByColumnAndRow(5, 8 + $pagecnt * $pagelen, $dat['salesmanname']);

          // 備考
          $sheet->setCellValueByColumnAndRow(2, 36 + $pagecnt * $pagelen, '備考：' . $dat['moed_remarks']);

          // 納入先
          if (isset($dat['delivzip'])) {
            $sheet->setCellValueByColumnAndRow(4, 41 + $pagecnt * $pagelen, $dat['delivname']);
            $sheet->setCellValueByColumnAndRow(4, 42 + $pagecnt * $pagelen, '〒' . $dat['delivzip']);
            // $sheet->setCellValueByColumnAndRow(4, 43 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['delivadd1']));
            $str = self::trimSpaceForCustomerAddress($dat['delivadd1']);
            $sheet->setCellValueByColumnAndRow(4, 43 + $pagecnt * $pagelen, $str);
            $sheet->setCellValueByColumnAndRow(4, 44 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['delivadd2']));
            $sheet->setCellValueByColumnAndRow(13, 42 + $pagecnt * $pagelen, $dat['delivtel']);
          }
          if (!isset($dat['shipzip'])) {
            // 出荷主が設定されていなければ、竹中金網をデフォルト表示する
            $sheet->setCellValueByColumnAndRow(4, 45 + $pagecnt * $pagelen, $dat['H_COMPANY_NAME']);
            $sheet->setCellValueByColumnAndRow(4, 46 + $pagecnt * $pagelen, '〒' . $dat['H_NO']);
            $sheet->setCellValueByColumnAndRow(4, 47 + $pagecnt * $pagelen, $dat['H_ADDRESS']);
            $sheet->setCellValueByColumnAndRow(13, 46 + $pagecnt * $pagelen, $dat['H_TEL']);
          } else {
            $sheet->setCellValueByColumnAndRow(4, 45 + $pagecnt * $pagelen, $dat['shipname']);
            $sheet->setCellValueByColumnAndRow(4, 46 + $pagecnt * $pagelen, '〒' . $dat['shipzip']);
            // $sheet->setCellValueByColumnAndRow(4, 47 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['shipadd1']));
            $str = self::trimSpaceForCustomerAddress($dat['shipadd1']);
            $sheet->setCellValueByColumnAndRow(4, 47 + $pagecnt * $pagelen, $str);
            $sheet->setCellValueByColumnAndRow(4, 48 + $pagecnt * $pagelen, preg_replace("/( |　)/", "", $dat['shipadd2']));
            $sheet->setCellValueByColumnAndRow(13, 46 + $pagecnt * $pagelen, $dat['shiptel']);
          }

          if (!$bQR) {
            self::makeQR(16, 10, 100, $dat['moed_order_no'], self::setQRMode('moed'), 5, 10)->setWorksheet($sheet);
            $bQR = true;
          }
        }
        // 明細行内容
        // 品名に_が入っていた場合は規格へ分岐する（2023/4/12　※発注書作成用に特別処理）
        $ar = self::makeArrayProductSpecForMoed($dat);
        // $ar = self::makeArrayProductSpec($dat);
        $isOnlyOneRow = false;
        // 初回の行は品名、規格を表示
        if ($dat['isFirstRow']) {
          if (!isset($detailItems[$i + 1]['isFirstRow']) || $detailItems[$i + 1]['isFirstRow']) {
            $isOnlyOneRow = true;
            $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[0] . ' ' . $dat['ar_name']);
            $sheet->setCellValueByColumnAndRow(2, 19 + ($row * 2) + $pagecnt * $pagelen, $ar[1] . ' ' . $ar[2]);
            if (strpos($dat['ar_name'], 'なし') !== false) {
              // 加工なし、なし等加工が実質ない場合は、品名に付加しない。上書き。
              $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[0]);
            }
          } else {
            $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[0] . ' ' . $dat['ar_name']);
            if (strpos($dat['ar_name'], 'なし') !== false) {
              // 加工なし、なし等加工が実質ない場合は、品名に付加しない。上書き。
              $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[0]);
            }
            $sheet->setCellValueByColumnAndRow(2, 19 + ($row * 2) + $pagecnt * $pagelen, $ar[1]);
            $row++;
          }
        }

        if (!$isOnlyOneRow) {
          // 寸法
          $sheet->setCellValueByColumnAndRow(2, 18 + $row * 2 + $pagecnt * $pagelen, $ar[2]);
        }

        if ($dat['moed_unit_tran'] === $strGroup) {
          // 数量が0、もしくは単位が一式だった場合は、数量、単位は空文字とする。単価は一式を挿入
          $dat['moed_quantity'] = '';
          $dat['moed_unit_tran'] = '';
          $dat['moed_unit_price'] = $strGroup;
        }
        if ($dat['moed_quantity'] !== '' && (float)$dat['moed_quantity'] === '0.000') {
          $dat['moed_quantity'] = '';
          $dat['moed_unit_tran'] = '';
          $dat['moed_unit_price'] = '';
        }
        $sheet->setCellValueByColumnAndRow(8, 18 + ($row * 2) + $pagecnt * $pagelen, $dat['moed_quantity'] === '0.000' ? '' : $dat['moed_quantity']);

        // 金額が0のとき、単価を空欄表示
        if ($dat['moed_unit_price'] === '0.000') {
          $sheet->setCellValueByColumnAndRow(10, 18 + ($row * 2) + $pagecnt * $pagelen, '');
        } else {
          $sheet->setCellValueByColumnAndRow(10, 18 + ($row * 2) + $pagecnt * $pagelen, $dat['moed_unit_price']);
        }
        $sheet->setCellValueByColumnAndRow(9, 18 + ($row * 2) + $pagecnt * $pagelen, $dat['moed_unit_tran']);

        // 金額が0のとき、金額を空欄表示
        if ($dat['moed_money'] === '0') {
          $sheet->setCellValueByColumnAndRow(12, 18 + ($row * 2) + $pagecnt * $pagelen, '');
        } else {
          $sheet->setCellValueByColumnAndRow(12, 18 + ($row * 2) + $pagecnt * $pagelen, $dat['moed_money']);
        }
        $sheet->setCellValueByColumnAndRow(14, 18 + ($row * 2) + $pagecnt * $pagelen, $dat['moed_dt_remarks']);

        $sumMoney += $dat['moed_money'];
        $row++;
        if ($row >= $recNumPerPage && $writeRecCnt > $recNumPerPage) {
          $row = 0;
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 26, $pagelen);
          $pagecnt++;
          // コピーした行のデータ削除
          for ($j = 0; $j < $recNumPerPage; $j++) {
            // 明細行内容
            $sheet->setCellValueByColumnAndRow(2, 18 + ($j * 2) + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(2, 19 + ($j * 2) + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(8, 18 + ($j * 2) + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(9, 18 + ($j * 2) + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(10, 18 + ($j * 2) + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(12, 18 + ($j * 2) + $pagecnt * $pagelen, '');
            $sheet->setCellValueByColumnAndRow(14, 18 + ($j * 2) + $pagecnt * $pagelen, '');
          }
          // 自社用添付欄削除　ミルシートと検査成績書のカラム削除
          $sheet->setCellValueByColumnAndRow(2, 55 + $pagecnt * $pagelen, '');
          $sheet->setCellValueByColumnAndRow(4, 55 + $pagecnt * $pagelen, '');
          $sheet->setCellValueByColumnAndRow(6, 55 + $pagecnt * $pagelen, '');
          $sheet->setCellValueByColumnAndRow(7, 55 + $pagecnt * $pagelen, '');
          // 罫線削除
          $sheet->getStyle('B' . (55 + $pagecnt * $pagelen) . ':H' . (55 + $pagecnt * $pagelen + 1))
            ->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_NONE);
          $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }

        if (($i === (count($detailItems) - 1))) {
          // 合計値(最終ページに表示)
          $sheet->setCellValueByColumnAndRow(12, 34 + $pagecnt * $pagelen, $sumMoney > 0 ? $sumMoney : '');
        }
      }

      if ($pageAll < 2) {
        // 複数ページ無い場合、ページ数が非表示になるため罫線も合わせて非表示にする。
        $sheet->getStyleByColumnAndRow(8, 9)->getBorders()->getBottom()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_NONE);
      }
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:Q' . (($pagecnt + 1) * $pagelen));
      $objPHPE->setActiveSheetIndex(0);

      // クライアント側に出力
      self::outputToBrowser($objPHPE, '発注書_' . $items[0]['moed_order_no'], true);
    } catch (Exception $e) {
      die();
    }
  }


  /**
   * 品名CD、規格が同じデータで並べ替えした配列を返却
   */
  private static function sortMorderestimateDatas($items)
  {
    $detailItems = [];
    // 行数カウント
    $rowCount = 0;
    // 何行目か
    $row = 1;
    // 前回の内容
    $prevData = array('moed_product_cd' => "", 'standard' => "");
    foreach ($items as $item) {
      // 規格　2023/4/28修正途中　発注明細用に別途規格取得
      $standard = self::makeArrayProductSpecForMoed($item)[1];
      // $standard = self::makeArrayProductSpec($item)[1];
      $item['standard'] = $standard;
      // 明細行のデータに該当の品名CD、規格が存在するか判定
      if ($prevData['moed_product_cd'] === $item['moed_product_cd'] && $prevData['standard'] === $standard) {
        $rowCount += 1;
      } else {
        $rowCount = 0;
      }
      $item['isFirstRow'] = $rowCount === 0 ? true : false;
      $item['row'] = $row;
      array_push($detailItems, $item);
      $row += 1;

      // 今回の情報を保持しておく
      $prevData['moed_product_cd'] = $item['moed_product_cd'];
      $prevData['standard'] = $item['standard'];
    }

    // itemCnt（同じ品名コード、規格、加工内容のデータが何件あるか）を設定
    $itemCnt = 1;
    for ($i = 0; $i < count($detailItems); $i += 1) {
      if ($detailItems[$i]['isFirstRow']) {

        // isFirstRowがtrueでitemCntはリセット
        $itemCnt = 1;
        // 次行からループ開始
        for ($j = $i + 1; $j < count($detailItems); $j += 1) {
          // 次行のisFirstRowがtrueならループ終了
          if (isset($detailItems[$j]) && $detailItems[$j]['isFirstRow']) {
            break;
          }

          // 次行のisFirstRowがfalseなら、同じ内容のデータなのでitemCntは+1する
          if (isset($detailItems[$j]) && !$detailItems[$j]['isFirstRow']) {
            $itemCnt += 1;
          }
        }
      }
      // itemCntを設定
      $detailItems[$i]['itemCnt'] = $itemCnt;
    }

    return $detailItems;
  }


  /**
   * 納品書発行
   */
  public static function issueStatementFile($items, $flg, $ver)
  {
    require_once 'vendor/autoload.php';
    try {
      $pagecnt = 0;                   //ページカウンタ0origin 0=1頁目
      $row = 0;                       //明細行0origin 0=1行目
      $price_sum_nuki = 0;            //税抜き合計
      $price_sum_zei = 0;             //税合計
      $blockRowNum = 0;               // 納品書の行数
      $blockRowNumD = 0;               // 納品書の行数detail
      $pagelen = 72;                  // 1ページの行数　defalut:72(納品書A)
      $unitPageLen = 144;             // 1ファイル分の行数　defalut:144(納品書B)
      $nSheet = 2;                    // Default:2(納品書A)
      $ar = [];
      $pagerow = 36;                  //1ページ：36行
      $pageClm = 10;                  // 1ページの記載アイテム数

      $strGroup = '一式';

      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      // $objReader->setIncludeCharts(true);
      // 受領書ありなしによるテンプレート読み出し(受領書あり＝納品書B)
      // 再発行納品書なのか判定（$ver = '1'：再発行）
      if ($flg) {
        if ($ver == '0') {
          $objPHPE = $objReader->load('./template/template_s_B_deletetax.xlsx');
        } else {
          $objPHPE = $objReader->load('./template/template_s_B_deletetaxVer.xlsx');
        }
        $pagelen = $unitPageLen;
        $nSheet = 4;
      } else {
        if ($ver == '0') {
          $objPHPE = $objReader->load('./template/template_s_A_deletetax.xlsx');
        } else {
          $objPHPE = $objReader->load('./template/template_s_A_deletetaxVer.xlsx');
        }
        $pagelen = $pagelen;
        $nSheet = 2;
      }
      // 内容を書き込みsetCellValue
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);

      // 品名CD、規格が同じデータで並べ替え
      $detailItems = self::sortStatementDatas($items);

      // 規格文字記載行を数える
      $itemLineNum = 0;
      foreach ($detailItems as $item) {
        $itemLineNum++;
        if ($item['itemCnt'] > 1 && $item['isFirstRow']) {
          $itemLineNum++;
        }
      }

      // ページ数 配列の行数から総ページ数を算出(1ページ12行)          
      $pagesu = ceil($itemLineNum / $pageClm);

      for ($i = 0; $i < count($detailItems); $i++) {
        $dat = $detailItems[$i];
        // 1ページ目ヘッダー・フッター
        if ($row === 0) {
          // // ページ数 配列の行数から総ページ数を算出(1ページ12行)          
          // $pagesu = ceil((count($detailItems) + $multilineNum) / $pageClm);
          // 納品書A：納品書(控え)・納品書の２パターン
          // 納品書B：納品書(控え)・納品書・受領書・出荷案内の４パターン
          for ($j = 0; $j < $nSheet; $j++) {
            $blockRowNum = $pagerow * $j + $pagecnt * $pagelen;
            // ロゴ表示
            self::makeLogoDrawing(12, 4 + $blockRowNum, 69, 7, round(400 * 0.9), round(41 * 0.9))->setWorksheet($sheet);
            // 社名表示
            self::makeTitleDrawing(12, 6 + $blockRowNum)->setWorksheet($sheet);
            // QR
            self::makeQR(17, 6 + $blockRowNum, 90, $dat['s_estimate_no'], self::setQRMode('est'), -65)->setWorksheet($sheet);
            // 郵便番号（customerpost）
            $sheet->setCellValueByColumnAndRow(2, 3 + $blockRowNum, '〒' . $dat['dest_zipcd']);
            // 住所１（customerpost）
            $sheet->setCellValueByColumnAndRow(2, 4 + $blockRowNum, self::trimSpaceForCustomerAddress($dat['dest_address_01']));            // 住所２（customerpost）
            $sheet->setCellValueByColumnAndRow(2, 5 + $blockRowNum, $dat['dest_address_02']);
            // 会社名（customerpost）
            $sheet->setCellValueByColumnAndRow(2, 6 + $blockRowNum, $dat['dest_name']);
            // 部署名（customerpost）
            // $sheet->setCellValueByColumnAndRow(2, 7 + $blockRowNum, $dat['dest_post'] . '　御中');  
            $sheet->setCellValueByColumnAndRow(2, 7 + $blockRowNum, '　御中');
            // 客先名にアンダーバーが含まれる場合、アンダーバーの前後を２行に分けて表示する
            $splitedCustomerName = explode('_', $dat['dest_name'],);
            if (count($splitedCustomerName) > 1) {
              $sheet->setCellValueByColumnAndRow(2, 6 + $pagecnt * $pagelen, $splitedCustomerName[0]);
              $sheet->setCellValueByColumnAndRow(2, 7 + $pagecnt * $pagelen, $splitedCustomerName[1] . '　御中');
            }
            // 御社注文No
            if (isset($dat['s_customer_order_no'])) {
              $sheet->setCellValueByColumnAndRow(4, 9 + $blockRowNum, $dat['s_customer_order_no']);
            } else {
              $sheet->setCellValueByColumnAndRow(4, 9 + $blockRowNum, '');
            }
            // 件名
            if (isset($dat['s_title'])) {
              $sheet->setCellValueByColumnAndRow(11, 9 + $blockRowNum, $dat['s_title']);
            } else {
              $sheet->setCellValueByColumnAndRow(11, 9 + $blockRowNum, '');
            }

            // ご担当者名
            $sheet->setCellValueByColumnAndRow(2, 12 + $blockRowNum, $dat['chargename'] . '　様');
            // 取引先コード
            $sheet->setCellValueByColumnAndRow(4, 12 + $blockRowNum, $dat['s_customer_cd']);
            // 伝票日付 出荷予定日をセット
            $sheet->setCellValueByColumnAndRow(6, 12 + $blockRowNum, self::formatStrToDate2($dat['s_shipping_plan_date']));
            // 伝票番号
            $sheet->setCellValueByColumnAndRow(9, 12 + $blockRowNum, $dat['s_estimate_no'] . ' ' . $dat['s_serial_no']);
            // 受注番号
            $sheet->setCellValueByColumnAndRow(13, 12 + $blockRowNum, $dat['s_estimate_no']);
            // 担当者
            $sheet->setCellValueByColumnAndRow(16, 12 + $blockRowNum, $dat['salesmanname']);

            // 納入場所
            // if (preg_match_all('/(引取|配達)/u', $dat['s_tc_short_name'])) {
            //   $sheet->setCellValueByColumnAndRow(3, 34 + $blockRowNum, $dat['s_tc_short_name']);
            // } else {
            $sheet->setCellValueByColumnAndRow(3, 34 + $blockRowNum, $dat['deliv_name'] ? ($dat['deliv_name'] . ' 様') : '');
            // }
            // 備考
            if (trim($dat['s_remarks']) == '') {
              $sheet->setCellValueByColumnAndRow(3, 35 + $blockRowNum, '');
            } elseif (isset($dat['s_remarks'])) {
              $sheet->setCellValueByColumnAndRow(3, 35 + $blockRowNum, $dat['s_remarks']);
            } else {
              $sheet->setCellValueByColumnAndRow(3, 35 + $blockRowNum, '');
            }

            //各ページのページ数更新
            // $tempnum = $pagecnt + 1;
            $sheet->setCellValueByColumnAndRow(12, 12 + $blockRowNum, ($pagecnt + 1) . '/' . $pagesu);
          }
        }
        // 明細行内容 $nSheet;2の時はAタイプ、4の時はBタイプ
        for ($j = 0; $j < $nSheet; $j++) {
          if ($j === 0) {
            // 税抜き合計
            $price_sum_nuki += $dat['price'];
            // 消費税合計
            $price_sum_zei += $dat['taxprice'];
          }
          $blockRowNumD = $pagerow * $j + $pagecnt * $pagelen;

          // 線径横・線径縦
          // makeStrProductSpec
          // 数量(納品数) 仮納品書作成時、受注数を表示
          if ($dat['sd_unit_tran'] === $strGroup) {
            // 数量が0、もしくは単位が一式だった場合は、数量、単位は空文字とする。単価は一式を挿入
            $dat['qty'] = '';
            $dat['sd_unit_tran'] = '';
            $dat['unitprice'] = $strGroup;
          }
          if ($dat['qty'] !== '' && (float)$dat['qty'] === 0.000) {
            // DB定義が変更になった場合は、変更必要あり。ceilで丸めても、戻り値floatなので、結局0.000で比較。
            $dat['qty'] = '';
            $dat['sd_unit_tran'] = '';
            $dat['unitprice'] = '';
          }

          // 規格、寸法を取得
          $arr = self::makeArrayProductSpec($dat);
          if ($dat['isFirstRow'] && $dat['itemCnt'] > 1) {
            // １ページ目と２ページ目で初回行の表示場所がずれるので、調整
            $firstRowCount = $j === 0 ? $row : $row - 1;
            // 品名 客先指定名がある場合はそちらを表示し、ない場合は、社内品名及び規格を表示
            if ($dat['sd_customer_p_name'] !== '') {
              if (strpos($dat['sd_customer_p_name'], '_') !== false) {
                $arrCustp = explode('_', $dat['sd_customer_p_name']);
                $sheet->setCellValueByColumnAndRow(3, 14 + ($firstRowCount * 2) + $blockRowNumD, $arrCustp[0]);
                $sheet->setCellValueByColumnAndRow(3, 15 + ($firstRowCount * 2) + $blockRowNumD, $arrCustp[1]);
                // $sheet->setCellValueByColumnAndRow(3, 15 + ($firstRowCount * 2) + $blockRowNumD, $dat['sd_p_name_supple'] ?  $arr[1] : '');
              } else {
                $sheet->setCellValueByColumnAndRow(3, 14 + ($firstRowCount * 2) + $blockRowNumD, $dat['sd_customer_p_name']);
              }
            } else {
              $ar = explode('_', $dat['p_name']);
              $strProdName = count($ar) > 0 ? $ar[0] : $dat['p_name'];
              $strProdName = ltrim($strProdName);
              if (strpos($dat['ar_name'], 'なし') !== false) {
                // 加工なし、なし等加工が実質ない場合は、表示しない
                $sheet->setCellValueByColumnAndRow(3, 14 + ($firstRowCount * 2) + $blockRowNumD, $strProdName);
              } else {
                $sheet->setCellValueByColumnAndRow(3, 14 + ($firstRowCount * 2) + $blockRowNumD, $strProdName . ' ' . $dat['ar_name']);
              }
              $sheet->setCellValueByColumnAndRow(3, 15 + ($firstRowCount * 2) + $blockRowNumD, $dat['sd_p_name_supple'] ?  $arr[1] : '');
            }
            // 初回行の書き込みが終了したら次の行へ移動
            if ($j === 0) {
              $row++;
            }
          } else if ($dat['itemCnt'] === 1) {
            if ($dat['sd_customer_p_name'] !== '') {
              if (strpos($dat['sd_customer_p_name'], '_') !== false) {
                $arrCustp = explode('_', $dat['sd_customer_p_name']);
                $sheet->setCellValueByColumnAndRow(3, 14 + ($row * 2) + $blockRowNumD, $arrCustp[0]);
                $sheet->setCellValueByColumnAndRow(3, 15 + ($row * 2) + $blockRowNumD, $arrCustp[1]);
                // $sheet->setCellValueByColumnAndRow(3, 15 + ($row * 2) + $blockRowNumD, $dat['sd_p_name_supple']);
              } else {
                $sheet->setCellValueByColumnAndRow(3, 14 + ($row * 2) + $blockRowNumD, $dat['sd_customer_p_name']);
              }
            } else {
              $ar = explode('_', $dat['p_name']);
              $strProdName = count($ar) > 0 ? $ar[0] : $dat['p_name'];
              $strProdName = ltrim($strProdName);
              if (strpos($dat['ar_name'], 'なし') !== false) {
                // 加工なし、なし等加工が実質ない場合は、表示しない
                $sheet->setCellValueByColumnAndRow(3, 14 + ($row * 2) + $blockRowNumD, $strProdName);
              } else {
                $sheet->setCellValueByColumnAndRow(3, 14 + ($row * 2) + $blockRowNumD, $strProdName . ' ' . $dat['ar_name']);
              }
              $sheet->setCellValueByColumnAndRow(3, 15 + ($row * 2) + $blockRowNumD, $dat['sd_p_name_supple']);
            }
          } else {
            // 複数レコードが同じ規格の場合は、品名や規格は記載しない
          }
          // 注文No（先方注文No） 明細の先方注文Noがなかったらヘッダーの客先注文No。それもなければ空文字
          $sheet->getStyle('B' . (14 + ($row * 2) + $pagecnt * $pagelen))->getAlignment()->setWrapText(true);
          if ($dat['sd_customer_order_no'] !== '' && $dat['sd_customer_order_no'] !== $dat['s_customer_order_no']) {
            // アンダーバーが含まれている場合
            if (strpos($dat['sd_customer_order_no'], '_') !== false) {
              $splitedArray = explode('_', $dat['sd_customer_order_no']);
              $sheet->setCellValueByColumnAndRow(2, 14 + ($row * 2) + $blockRowNumD, $splitedArray[0] . "\n" . $splitedArray[1]);
              // アンダーバーが含まれていない場合
            } else {
              $sheet->setCellValueByColumnAndRow(2, 14 + ($row * 2) + $blockRowNumD, $dat['sd_customer_order_no']);
            }
          } else {
            $sheet->setCellValueByColumnAndRow(2, 14 + ($row * 2) + $blockRowNumD, '');
          }
          $sheet->getStyle('B' . (14 + ($row * 2) + $blockRowNumD))->getAlignment()->setWrapText(true);
          if ($dat['itemCnt'] > 1) {
            $sheet->setCellValueByColumnAndRow(3, 14 + ($row * 2) + $blockRowNumD, $arr[2]);
          }
          // 単位　単位が一式の場合は、単位を表示せず空文字をセットする
          $sheet->setCellValueByColumnAndRow(9, 14 + ($row * 2) + $blockRowNumD, $dat['qty']);
          // 単位　単位が一式の場合は、単位を表示せず空文字をセットする
          $sheet->setCellValueByColumnAndRow(10, 14 + ($row * 2) + $blockRowNumD, $dat['sd_unit_tran']);

          if ($j > 1) { // 納品書Bでは金額をセットしない
            continue;
          } else {
            // 単価 
            $sheet->setCellValueByColumnAndRow(11, 14 + ($row * 2) + $blockRowNumD, $dat['unitprice']);
            // 金額税抜(納品金額)
            $sheet->setCellValueByColumnAndRow(13, 14 + ($row * 2) + $blockRowNumD, $dat['price'] === 0 ? '' : $dat['price']);
            // //消費税
            // $sheet->setCellValueByColumnAndRow(15, 14 + ($row * 2) + $blockRowNumD, $dat['taxprice'] === 0 ? '' : $dat['taxprice']);
            // 備考
            $sheet->setCellValueByColumnAndRow(15, 14 + ($row * 2) + $blockRowNumD, $dat['sd_detail_remarks']);
          }
        }
        ++$row;
        // 2ページ以降が発生する場合 
        $nextDat = $detailItems[$i + 1];
        if (($nextDat['isFirstRow'] && $nextDat['itemCnt'] > 1 && $row === ($pageClm - 1)) ||
          ($row > ($pageClm - 1) && ($pagesu > ($pagecnt + 1)))
        ) {
          $row = 0;
          $pagecnt++;
          //改ページ
          if ($flg) {
            self::copyRows($sheet, 1, $pagecnt * $pagelen + 1, 18, $unitPageLen);
            $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
            $sheet->setBreakByColumnAndRow(1, $pagecnt * $unitPageLen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
          } else {
            self::copyRows($sheet, 1, $pagecnt * $pagelen + 1, 18, $pagelen);
            $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
          }
          // 次ページの納品書入力項目クリア
          for ($k = 0; $k < $pageClm; $k++) {
            for ($j = 0; $j < $nSheet; $j++) {
              $blockRowNumD = $pagerow * $j + $pagecnt * $pagelen;
              // 注文No（先方注文No） 明細の先方注文Noがなかったらヘッダーの客先注文No。それもなければ空文字
              $sheet->setCellValueByColumnAndRow(2, 14 + ($k * 2) + $blockRowNumD, null);
              // 品名
              $sheet->setCellValueByColumnAndRow(3, 14 + ($k * 2) + $blockRowNumD, null);
              // 線径横・線径縦
              // makeStrProductSpec
              $sheet->setCellValueByColumnAndRow(3, 15 + ($k * 2) + $blockRowNumD, null);
              // 数量(納品数)
              $sheet->setCellValueByColumnAndRow(9, 14 + ($k * 2) + $blockRowNumD, null);
              // 単位
              $sheet->setCellValueByColumnAndRow(10, 14 + ($k * 2) + $blockRowNumD, null);

              if ($j < 2) { // 納品書Bでは金額をセットしない
                // 単価
                $sheet->setCellValueByColumnAndRow(11, 14 + ($k * 2) + $blockRowNumD, null);
                // 金額税抜(納品金額)
                $sheet->setCellValueByColumnAndRow(13, 14 + ($k * 2) + $blockRowNumD, null);
                //消費税
                // $sheet->setCellValueByColumnAndRow(15, 14 + ($k * 2) + $blockRowNumD, null);
                // 備考
                $sheet->setCellValueByColumnAndRow(15, 14 + ($k * 2) + $blockRowNumD, null);
              }
            }
          }
        }
      }
      // 合計表示
      //税抜き合計
      $sheet->setCellValueByColumnAndRow(13, 34 + $pagecnt * $pagelen, $price_sum_nuki);
      $sheet->setCellValueByColumnAndRow(13, 70 + $pagecnt * $pagelen, $price_sum_nuki);
      // //税金合計
      // $sheet->setCellValueByColumnAndRow(15, 34 + $pagecnt * $pagelen, $price_sum_zei);
      // $sheet->setCellValueByColumnAndRow(15, 70 + $pagecnt * $pagelen, $price_sum_zei);
      // //税込み合計
      // $price_sum_komi = $price_sum_nuki + $price_sum_zei;
      // $sheet->setCellValueByColumnAndRow(13, 35 + $pagecnt * $pagelen, $price_sum_komi);
      // $sheet->setCellValueByColumnAndRow(13, 71 + $pagecnt * $pagelen, $price_sum_komi);
      // //税率
      // $sheet->setCellValueByColumnAndRow(15, 35 + $pagecnt * $pagelen, '税率'. floor($dat['t_rate']) . '％');
      // $sheet->setCellValueByColumnAndRow(15, 71 + $pagecnt * $pagelen, '税率'. floor($dat['t_rate']) . '％');

      // 印刷時設定
      if ($flg) {
        // 納品書B
        $sheet->getPageSetup()
          ->setPrintArea('A1:Q' . (($pagecnt + 1) * $unitPageLen));
        // $sheet->setPrintGridForWidth(2)
        // ->setPrintGridForHeight(1);
      } else {
        $objPHPE->getActiveSheet()
          ->getPageSetup()
          ->setPrintArea('A1:Q' . (($pagecnt + 1) * $pagelen));
      }
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, '納品書_' . $dat['s_estimate_no'] . $dat['s_serial_no'], true);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 品名CD、規格が同じデータで並べ替えした配列を返却
   */
  private static function sortStatementDatas($items)
  {
    $detailItems = [];
    // 行数カウント
    $rowCount = 0;
    // 何行目か
    $row = 1;
    // 前回の内容
    $prevData = array('sd_p_cd' => "", 'standard' => "", 'ar_name' => "");
    foreach ($items as $item) {
      // 規格
      $standard = self::makeArrayProductSpec($item)[1];
      $item['standard'] = $standard;
      // 明細行のデータに該当の品名CD、規格が存在するか判定
      if ($prevData['sd_p_cd'] === $item['sd_p_cd'] && $prevData['standard'] === $standard && self::compareArrangementName($prevData['ar_name'], $item['ar_name'])) {
        $rowCount += 1;
      } else {
        $rowCount = 0;
      }
      $item['isFirstRow'] = $rowCount === 0 ? true : false;
      $item['row'] = $row;
      array_push($detailItems, $item);
      $row += 1;

      // 今回の情報を保持しておく
      $prevData['sd_p_cd'] = $item['sd_p_cd'];
      $prevData['standard'] = $item['standard'];
      $prevData['ar_name'] = $item['ar_name'];
    }

    // itemCnt（同じ品名コード、規格、加工内容のデータが何件あるか）を設定
    $itemCnt = 1;
    for ($i = 0; $i < count($detailItems); $i += 1) {
      if ($detailItems[$i]['isFirstRow']) {

        // isFirstRowがtrueでitemCntはリセット
        $itemCnt = 1;
        // 次行からループ開始
        for ($j = $i + 1; $j < count($detailItems); $j += 1) {
          // 次行のisFirstRowがtrueならループ終了
          if (isset($detailItems[$j]) && $detailItems[$j]['isFirstRow']) {
            break;
          }

          // 次行のisFirstRowがfalseなら、同じ内容のデータなのでitemCntは+1する
          if (isset($detailItems[$j]) && !$detailItems[$j]['isFirstRow']) {
            $itemCnt += 1;
          }
        }
      }
      // itemCntを設定
      $detailItems[$i]['itemCnt'] = $itemCnt;
    }

    return $detailItems;
  }


  /**
   * LIXIL納品書用エクセルファイル出力
   */
  public static function issueStatementFileLIXIL($items)
  {
    require_once 'vendor/autoload.php';
    try {
      $pCnt = 5;          // 1行の製品書込可能数
      $recCnt = 0;        // 書込レコードカウント
      $sumPrice = 0;      // 合計金額
      $productCnt = 0;    // 書込み製品数
      $productRow = 1;    // 製品記載行数
      $writeRow = 2;      // データ書込みが何行目か。開始行数は2行目

      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/StatementExcelLIXIL.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);

      foreach ($items as $rec) {
        // ヘッダ項目にあたる項目を先に記載
        if (($recCnt === 0) || (($recCnt % $pCnt) === 0)) {
          if ($recCnt % $pCnt <= 0) {
            $sumPrice = 0;
          }
          if ($recCnt > 0) {
            $writeRow++;
          }
          $sheet->setCellValueByColumnAndRow(1, $writeRow, $rec['sd_e_estimate_no']);
          $sheet->setCellValueByColumnAndRow(2, $writeRow, $rec['sd_statement_sub_no']);
          $sheet->setCellValueByColumnAndRow(3, $writeRow, self::formatStrToDate2($rec['s_shipping_plan_date']));
          $sheet->setCellValueByColumnAndRow(4, $writeRow, substr($rec['s_shipping_plan_date'], 2, 2));
          $sheet->setCellValueByColumnAndRow(5, $writeRow, substr($rec['s_shipping_plan_date'], 4, 2));
          $sheet->setCellValueByColumnAndRow(6, $writeRow, substr($rec['s_shipping_plan_date'], 6, 2));
          $sheet->setCellValueByColumnAndRow(7, $writeRow, $rec['H_COMPANY_NAME']);
          $sheet->setCellValueByColumnAndRow(8, $writeRow, $rec['H_NO']);
          $sheet->setCellValueByColumnAndRow(9, $writeRow, substr($rec['H_NO'], 0, 3));
          $sheet->setCellValueByColumnAndRow(10, $writeRow, substr($rec['H_NO'], 4, 4));
          $sheet->setCellValueByColumnAndRow(11, $writeRow, '愛媛県今治市大西町九王甲281番地');
          $sheet->setCellValueByColumnAndRow(12, $writeRow, $rec['H_TEL']);
          $sheet->setCellValueByColumnAndRow(13, $writeRow, substr($rec['H_TEL'], 0, 4));
          $sheet->setCellValueByColumnAndRow(14, $writeRow, 'TEL(0898)');
          $sheet->setCellValueByColumnAndRow(15, $writeRow, '53-2267(代)');
          $sheet->setCellValueByColumnAndRow(16, $writeRow, '');  // 担当者　客先指定コードなので空白
          $productCnt = 0;  // 製品数リセット
        }

        $cusOrdNo = '';
        if (strstr($rec['sd_customer_order_no'], '_')) {
          $cusOrdNo = str_replace(strstr($rec['sd_customer_order_no'], '_'), '', $rec['sd_customer_order_no']);
        } else {
          $cusOrdNo = $rec['sd_customer_order_no'];
        }
        $sheet->setCellValueByColumnAndRow(17 + $productCnt, $writeRow, $cusOrdNo);
        //先方注文No（注文No）
        // $expPName = explode('　', $rec['ed_customer_p_name']);
        // $sheet->setCellValueByColumnAndRow(22 + $productCnt, $writeRow, $expPName[0]);
        // $sheet->setCellValueByColumnAndRow(43 + $productCnt, $writeRow, $expPName[1]);
        /* ここまで */
        $sheet->setCellValueByColumnAndRow(27 + $productCnt, $writeRow, $rec['sd_qty_delivery']);
        $sheet->setCellValueByColumnAndRow(32 + $productCnt, $writeRow, $rec['sd_unit_price']);
        $sheet->setCellValueByColumnAndRow(37 + $productCnt, $writeRow, $rec['sd_delivery_price']);
        $sumPrice += ($rec['sd_delivery_price'] === '') ? 0 : (int)$rec['sd_delivery_price'];

        // 製品5つ目まで回ったら合計金額記載 都度セットさせる
        $sheet->setCellValueByColumnAndRow(42, $writeRow, $sumPrice);

        // 摘要欄に、明細の備考をセットするように変更@2022/10/24
        $sheet->setCellValueByColumnAndRow(43 + $productCnt, $writeRow, $rec['sd_detail_remarks']);

        ++$productCnt;
        ++$recCnt;
      }
      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'LIXIL納品書用エクセル_' . $items['s_estimate_no'] . $items['s_serial_no']);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 仮請求書を発行する
   */
  public static function issueBillFromStatementFile($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');
      // $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/template_b.xls');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 52;
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 0;
      self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 10, $pagelen);
      // ヘッダ内容出力
      $sheet->setCellValueByColumnAndRow(1, 12, '-'); // $items[0]['B_BEFORE_BILL']
      if (!isset($items[0]['TAXCUR']) || $items[0]['TAXCUR'] === '') {
        $sheet->setCellValueByColumnAndRow(6, 12, '-'); // $items[0]['B_TAX']
        $sheet->setCellValueByColumnAndRow(3, 12, '-'); // $items[0]['B_BILL']
        $sheet->setCellValueByColumnAndRow(8, 12, $items[0]['S_TOTAL_MONEY']); // $items[0]['B_BILL'] + $items[0]['B_TAX']
      } else {
        $numtax = 0.0;
        $currenttax = $items[0]['TAXCUR'] / 100.0;
        switch ((int) $items[0]['C_INVOICE_TAX_CAL']) {
          case 0:
            $numtax = floor($items[0]['S_TOTAL_MONEY'] * $currenttax);
            break;
          case 1:
            $numtax = round($items[0]['S_TOTAL_MONEY'] * $currenttax);
            break;
          case 2:
            $numtax = ceil($items[0]['S_TOTAL_MONEY'] * $currenttax);
            break;
        }
        $sheet->setCellValueByColumnAndRow(6, 12, $numtax); // $items[0]['B_TAX']
        $sheet->setCellValueByColumnAndRow(3, 12, $items[0]['S_TOTAL_MONEY']); // $items[0]['B_BILL']
        $sheet->setCellValueByColumnAndRow(8, 12, $items[0]['S_TOTAL_MONEY'] + $numtax); // $items[0]['B_BILL'] + $items[0]['B_TAX']
      }
      // 明細内容出力
      for ($i = 0; $i < count($items); $i++) {
        $dat = $items[$i];
        // 各ページ先頭部分
        if ($row === 0) {
          self::makeLogoDrawing(7, 3 + $pagecnt * $pagelen, 40)->setWorksheet($sheet); // ロゴ表示
          self::makeTitleDrawing(8, 3 + $pagecnt * $pagelen)->setWorksheet($sheet); // 社名表示
          //self::makeMarkDrawing(9, 5 + $pagecnt * $pagelen)->setWorksheet($sheet); // 社印表示
          // 客先名など表示
          $sheet->setCellValueByColumnAndRow(9, 1 + $pagecnt * $pagelen, 'No.  ' . substr($items[0]['S_STATEMENT_NO'], 5));
          // 請求書には客先名のみ表示
          $sheet->setCellValueByColumnAndRow(1, 5 + $pagecnt * $pagelen, $items[0]['C_CUSTOMER_NAME'] . '　御中');
          $sheet->setCellValueByColumnAndRow(5, 2 + $pagecnt * $pagelen, self::formatStrToDate($items[0]['S_STATEMENT_DATE']));
        }
        // 明細行内容
        $sheet->setCellValueByColumnAndRow(1, 15 + ($row * 2) + $pagecnt * $pagelen, self::formatStrToDate($dat['SD_STATEMENT_DATE'], 'n/j'));
        $sheet->setCellValueByColumnAndRow(2, 15 + ($row * 2) + $pagecnt * $pagelen, $dat['SD_CUSTOMER_ORDER_NO']);
        $sheet->setCellValueByColumnAndRow(3, 15 + ($row * 2) + $pagecnt * $pagelen, $dat['SD_DRAWING_NO']);
        $sheet->setCellValueByColumnAndRow(3, 16 + ($row * 2) + $pagecnt * $pagelen, $dat['SD_ARTICLE_NAME']);

        $sheet->setCellValueByColumnAndRow(6, 15 + ($row * 2) + $pagecnt * $pagelen, self::zeroToBlank($dat['SD_ARTICLE_NO']));
        $sheet->setCellValueByColumnAndRow(7, 15 + ($row * 2) + $pagecnt * $pagelen, self::zeroToBlank($dat['SD_UNITPRICE']));
        $sheet->setCellValueByColumnAndRow(8, 15 + ($row * 2) + $pagecnt * $pagelen, self::zeroToBlank($dat['SD_MONEY']));
        $sheet->setCellValueByColumnAndRow(9, 15 + ($row * 2) + $pagecnt * $pagelen, $dat['SD_SUMMARY']);
        $row++;
        if ($row >= 19) {
          $row = 0;
          $pagecnt++;
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 12, $pagelen);
          $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }
      }
      // 合計値(最終ページに表示)
      //$sheet->setCellValueByColumnAndRow(6, 22 + $pagecnt * $pagelen, $dat['MO_TOTAL']);
      if ($row === 0) {
        $pagecnt--;
      }
      // 最終ページを削除
      $sheet->removeRow(($pagecnt + 1) * $pagelen + 1, $pagelen);
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:I' . (($pagecnt + 1) * $pagelen));
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'billfromstatement');
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 現品票出力 製品用
   */
  public static function createIDSheet($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/IDSheet.xlsx');

      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 63;
      $recPerPage = 7;  // 1ページ分の表記個数
      $rowPerRec = 9;   // 1レコード分の必要行数
      // 先頭ページ処理
      $pagecnt = 0;
      $row = 1;     // 現在の行数
      $estNo = '';  // 受注番号
      $seqNo = 1;   // 通し番号
      $arr = [];    // 規格配列用
      $i = 0;       // レコードカウント
      // 明細内容出力
      foreach ($items as $record) {
        if ($i === 0) {
          $sheet->setBreakByColumnAndRow(1, $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }
        if ($estNo === '' || $estNo !== $record['ed_estimate_no']) {
          // 受注番号が変わった場合は通し番号をリセット
          $estNo = $record['ed_estimate_no'];
          $seqNo = 1;
        }

        // 注文No左
        $customerOrderNoLeft = '';
        if ($record['e_customer_order_no']) {
          $customerOrderNoLeft = $record['e_customer_order_no'];
        } else {
          // 半角ハイフンが含まれている場合
          if (strpos($record['ed_customer_order_no'], '_') !== false) {
            $splitedArray = explode('_', $record['ed_customer_order_no']);
            $customerOrderNoLeft = $splitedArray[0];
            // 全角ハイフンが含まれている場合
          } else if (strpos($record['ed_customer_order_no'], '＿') !== false) {
            $splitedArray = explode('＿', $record['ed_customer_order_no']);
            $customerOrderNoLeft = $splitedArray[0];
            // 全角半角ハイフンが含まれていない場合
          } else {
            $customerOrderNoLeft = $record['ed_customer_order_no'];
          }
        }
        $customerOrderNoLeft = self::excelString($customerOrderNoLeft);

        // 注文No右
        $customerOrderNoRight = '';
        if ($record['e_customer_order_no']) {
          // 半角ハイフンが含まれている場合
          if (strpos($record['e_customer_order_no'], '_') !== false) {
            $splitedArray = explode('_', $record['e_customer_order_no']);
            $customerOrderNoRight = $splitedArray[0];
          } else {
            $customerOrderNoRight = $record['ed_customer_order_no'];
          }
        } else {
          // 半角ハイフンが含まれている場合
          if (strpos($record['ed_customer_order_no'], '_') !== false) {
            $splitedArray = explode('_', $record['ed_customer_order_no']);
            $customerOrderNoRight = $splitedArray[1];
            // 全角ハイフンが含まれている場合
          } else if (strpos($record['ed_customer_order_no'], '＿') !== false) {
            $splitedArray = explode('＿', $record['ed_customer_order_no']);
            $customerOrderNoRight = $splitedArray[1];
          }
        }
        $customerOrderNoRight = self::excelString($customerOrderNoRight);

        // 品名
        $productName = '';
        if ($record['customerpname']) {
          $productName = $record['customerpname'];
        } else if (strpos($record['p_name'], '_') !== false) {
          $splitedArray = explode('_', $record['p_name']);
          $productName = $splitedArray[0] . ($record['arname'] === 'なし' ? '' : $record['arname']);
        } else {
          $productName = $record['p_name'] . ($record['arname'] === 'なし' ? '' : $record['arname']);
        }
        $productName = ltrim($productName);

        // 規格、寸法
        $arr = self::makeArrayProductSpec($record);

        if ($record['ed_type_04'] === '1') {
          // 受注枚数分だった場合、受注数分レコード追加 
          for ($j = 0; $j < (int)$record['ed_quantity']; $j++) {
            if ($i > 0) {
              $row += $rowPerRec;
            }
            $sheet->setCellValueByColumnAndRow(3, $row + 1, $customerOrderNoLeft);   // 客先注文番号
            $sheet->setCellValueByColumnAndRow(6, $row + 1, $customerOrderNoRight);   // JobNo  客先品名
            $sheet->setCellValueByColumnAndRow(3, $row + 2, $record['e_title']);   // 件名
            // $sheet->setCellValueByColumnAndRow(3, $row + 3, $arr[0]);   // 客先品名　OR　品名
            $sheet->setCellValueByColumnAndRow(3, $row + 3, $productName); // 客先品名　OR　品名
            $sheet->setCellValueByColumnAndRow(3, $row + 4, $arr[1]);   // 規格
            $sheet->setCellValueByColumnAndRow(3, $row + 5, $arr[2]);   // 寸法
            $sheet->setCellValueByColumnAndRow(3, $row + 6, '1' . ' ' . $record['ed_unit_tran']);   // 数量
            $sheet->setCellValueByColumnAndRow(3, $row + 7, $record['ed_estimate_no']);   // 管理番号 受注番号
            $sheet->setCellValueByColumnAndRow(3, $row + 8, $record['e_remarks']);   // STONE  
            $sheet->setCellValueByColumnAndRow(8, $row + 8, $seqNo);   // 通し番号 


            $sheet->setBreakByColumnAndRow(1, $row + 9, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);

            self::makeQR(8, $row + 4, 63, $record['qrid'], self::setQRMode('prtag'), 10, 10)->setWorksheet($sheet);
            if ($i % ($recPerPage - 1) === 0 && $i > 0) {
              // 7で割れる数だったらページインクリメント&フォーマットコピー
              self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 9, $pagelen);
              $delRow = $row;
              for ($k = 0; $k < $recPerPage; $k++) {
                $delRow += $rowPerRec;
                $sheet->setCellValueByColumnAndRow(3, $delRow + 1, '');
                $sheet->setCellValueByColumnAndRow(6, $delRow + 1, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 2, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 3, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 4, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 5, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 6, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 7, '');
                $sheet->setCellValueByColumnAndRow(3, $delRow + 8, '');
                $sheet->setCellValueByColumnAndRow(8, $delRow + 8, '');
              }
              // $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
              ++$pagecnt;
            }
            ++$i;
            ++$seqNo;
          }
        } else {
          // まとめて発行モード
          // これから書き込む先頭行の番号
          if ($i > 0) {
            $row += $rowPerRec;
          }
          $sheet->setCellValueByColumnAndRow(3, $row + 1, $customerOrderNoLeft);   // 客先注文番号
          $sheet->setCellValueByColumnAndRow(6, $row + 1, $customerOrderNoRight);   // JobNo
          $sheet->setCellValueByColumnAndRow(3, $row + 2, $record['e_title']);   // 件名
          // $sheet->setCellValueByColumnAndRow(3, $row + 3, $arr[0]);
          // $sheet->setCellValueByColumnAndRow(3, $row + 3, $record['concpname']);
          $sheet->setCellValueByColumnAndRow(3, $row + 3, $productName);
          $sheet->setCellValueByColumnAndRow(3, $row + 4, $arr[1]);   // 規格
          $sheet->setCellValueByColumnAndRow(3, $row + 5, $arr[2]);   // 寸法
          $sheet->setCellValueByColumnAndRow(3, $row + 6, floor($record['ed_quantity']) . ' ' . $record['ed_unit_tran']);   // 数量
          $sheet->setCellValueByColumnAndRow(3, $row + 7, $record['ed_estimate_no']);   // 管理番号 ロット番号
          $sheet->setCellValueByColumnAndRow(3, $row + 8, $record['e_remarks']);   // STONE  
          $sheet->setCellValueByColumnAndRow(8, $row + 8, $seqNo);   // 通し番号 

          $sheet->setBreakByColumnAndRow(1, $row + 9, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);

          self::makeQR(8, $row + 4, 63, $record['qrid'], self::setQRMode('prtag'), 10, 10)->setWorksheet($sheet);
          if ($i % ($recPerPage - 1) === 0 && $i > 0) {
            // 7で割れる数だったらページインクリメント
            self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 9, $pagelen);
            $delRow = $row;
            for ($k = 0; $k < $recPerPage; $k++) {
              $delRow += $rowPerRec;
              $sheet->setCellValueByColumnAndRow(3, $delRow + 1, '');
              $sheet->setCellValueByColumnAndRow(6, $delRow + 1, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 2, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 3, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 4, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 5, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 6, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 7, '');
              $sheet->setCellValueByColumnAndRow(3, $delRow + 8, '');
              $sheet->setCellValueByColumnAndRow(8, $delRow + 8, '');
            }
            // $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
            ++$pagecnt;
          }
          ++$i;
          ++$seqNo;
        }
      }

      // 印刷時設定
      $lastRow = $row + $rowPerRec - 1;
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('B1:H' . $lastRow);
      // ->setPrintArea('B1:H' . (($pagecnt + 1) * $pagelen));
      $objPHPE->getActiveSheet()
        ->getPageSetup()->setScale(90);
      $objPageMargins = $objPHPE->getActiveSheet()->getPageMargins();
      $objPageMargins->setTop(0);
      $objPageMargins->setRight(0);
      $objPageMargins->setLeft(0);
      $objPageMargins->setBottom(0);
      $objPHPE->setActiveSheetIndex(0);

      // クライアント側に出力
      self::outputToBrowser($objPHPE, '現品票_' . Plannerdbmgr::currentDate() . '_' . Plannerdbmgr::currentTime(), true);
      // // QRデータを削除
      // self::delDir();
    } catch (Exception $e) {
      die();
    }
  }

  /***
   * 現品票発行　材料タグ作成用 2023/6/22：在庫品の現品票発行を利用のため、使用しない
   */
  // public static function createMATLIDSheet($items) {
  //   require_once 'vendor/autoload.php';
  //   try {
  //     // テンプレートファイルを読込
  //     $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
  //     $objPHPE = $objReader->load('./template/IDSheet_MATL.xlsx');

  //     // 内容を書き込み 
  //     $objPHPE->getActiveSheet();
  //     $sheet = $objPHPE->setActiveSheetIndex(0);
  //     $pagelen = 63;
  //     $recPerPage = 7;  // 1ページ分の表記個数
  //     $rowPerRec = 9;   // 1レコード分の必要行数
  //     $pagecnt = 0;     // 先頭ページ処理
  //     $row = 1;     // 現在の行数
  //     $morderNo = '';  // 受注番号
  //     $seqNo = 1;   // 通し番号
  //     $arr = [];    // 規格配列用
  //     $i = 0;       // レコードカウント
  //     $storageNum = '';    // 在庫数量 単位含む
  //     $productName = '';    // 品名

  //     // 明細内容出力
  //     foreach ($items as $record) {
  //       if ($morderNo === '' || $morderNo !== $record['moed_order_no']) {
  //         // 発注番号が変わった場合は通し番号をリセット
  //         $morderNo = $record['moed_order_no'];
  //       }

  //       if (strpos($record['moed_product_name'], '_') !== false) {
  //         $splitedArray = explode('_', $record['moed_product_name']);
  //         $productName = $splitedArray[0] . ' ' . ($record['ar_name'] === 'なし' ? '' : $record['ar_name']);
  //         $productName .= ' ' . $splitedArray[1];
  //       } else {
  //         $productName = $record['moed_product_name'] . ' ' . ($record['ar_name'] === 'なし' ? '' : $record['ar_name']);
  //       }
  //       $productName = ltrim($productName);

  //       // 1レコード1タグとして発行
  //       // $sheet->setCellValueByColumnAndRow(2, $row + 1, $record['moed_product_name'] . $record['ar_name']);
  //       $sheet->setCellValueByColumnAndRow(2, $row + 1, $productName);
  //       $sheet->setCellValueByColumnAndRow(3, $row + 2, $record['moed_sub_08']);
  //       $sheet->setCellValueByColumnAndRow(5, $row + 2, $record['moed_sub_09']);
  //       $sheet->setCellValueByColumnAndRow(3, $row + 3, $record['moed_maker_name']);
  //       // 在庫数量をセット
  //       if ($record['moed_unit_qty'] > 0) {
  //         // 入庫前であれば、単価単位入力されていた場合は、計算値がstock_qtyに入るため、そちらの値をセット
  //         $storageNum = intval($record['moed_unit_qty']) . ' ' . $record['moed_unit_eval'];
  //         // $storageNum = intval($record['moed_stock_qty']) . ' ' . $record['moed_unit_eval'];
  //       } else {
  //         $storageNum = intval($record['moed_quantity']) . ' ' . $record['moed_unit_tran'];
  //       }
  //       $sheet->setCellValueByColumnAndRow(3, $row + 4, $storageNum);
  //       $sheet->setCellValueByColumnAndRow(5, $row + 4, self::formatStrToDate($record['moed_arrival_plan_date'])); // yyyy/MM/dd
  //       $colName = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(3);
  //       $sheet->setCellValueExplicit($colName . (String)($row + 5), $record['moed_type_03'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
  //       $sheet->setCellValueByColumnAndRow(2, $row + 6, '【メモ】' . $record['moed_dt_remarks']);
  //       self::makeQR(6, $row + 2, 90, $record['qrid'], self::setQRMode('prtag'))->setWorksheet($sheet);

  //       $row += $rowPerRec;
  //       if ($i % ($recPerPage - 1) === 0 && $i > 0) {
  //         self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 9, $pagelen);
  //         $delRow = $row;
  //         for ($k = 0; $k < $recPerPage; $k++) {
  //           $delRow += $rowPerRec;
  //           $sheet->setCellValueByColumnAndRow(2, $delRow + 1, '');
  //           $sheet->setCellValueByColumnAndRow(3, $delRow + 2, '');
  //           $sheet->setCellValueByColumnAndRow(5, $delRow + 2, ''); 
  //           $sheet->setCellValueByColumnAndRow(3, $delRow + 3, ''); 
  //           $sheet->setCellValueByColumnAndRow(3, $delRow + 4, '');   
  //           $sheet->setCellValueByColumnAndRow(5, $delRow + 4, '');   
  //           $sheet->setCellValueByColumnAndRow(3, $delRow + 5, '');   
  //           $sheet->setCellValueByColumnAndRow(3, $delRow + 6, '');    
  //         }
  //         $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
  //         $pagecnt++;
  //       }      
  //       $i++;
  //     } 

  //     // 印刷時設定
  //     // $lastNum = $row - 1;
  //     $objPHPE->getActiveSheet()
  //       ->getPageSetup()
  //       // ->setPrintArea('B1:G' . $lastNum);
  //       ->setPrintArea('B1:G' . (($pagecnt + 1) * $pagelen));
  //       $objPHPE->getActiveSheet()  
  //       ->getPageSetup()-> setScale(61); 
  //     $objPageMargins = $objPHPE->getActiveSheet()->getPageMargins();
  //     $objPageMargins->setTop(0);
  //     $objPageMargins->setRight(0);
  //     $objPageMargins->setLeft(0);
  //     $objPageMargins->setBottom(0);
  //     $objPHPE->setActiveSheetIndex(0);

  //     // クライアント側に出力 ファイル名：QR_発注書No
  //     self::outputToBrowser($objPHPE, '現品票_' . Plannerdbmgr::currentDate() . '_' . Plannerdbmgr::currentTime(), true);

  //   } catch (Exception $e) {
  //     die();
  //   }
  // }


  /***
   * 現品票発行　在庫タグ発行
   */
  public static function createStorageIDSheet($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/IDSheetStorage.xlsx');
      // $objPHPE = $objReader->load('./template/IDSheet_MATL.xlsx');

      // 内容を書き込み 
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      $pagelen = 41;
      $recPerPage = 5;  // 1ページ分の表記個数
      $rowPerRec = 8;   // 1レコード分の必要行数
      $pagecnt = 0;     // 先頭ページ処理
      $row = 1;     // 現在の行数
      $seqNo = 1;   // 通し番号
      $arr = [];    // 規格配列用
      $i = 0;       // レコードカウント
      $storageNum = '';    // 在庫数量 単位含む

      // 明細内容出力
      foreach ($items as $record) {
        // 1レコード1タグとして発行
        $record['sub08'] = self::roundEstData($record['sub08']);
        $record['sub09'] = self::roundEstData($record['sub09']);
        $ar = self::makeArrayProductSpec($record);
        $strProd = '';
        $strProd = $ar[0] . ' ' . $record['ar_name'];
        if (strpos($record['ar_name'], 'なし') !== false) {
          // 加工なし、なし等加工が実質ない場合は、品名に付加しない。上書き。
          $strProd =  $ar[0];
        }
        $strProd = ltrim($strProd);

        // 品名CDの大分類で表示内容を変更する
        switch (substr($record['sr_p_cd'], 0, 2)) {
            // クリンプ
          case '01':
            // 織金網/亀甲金網
          case '02':
          case '04':
            // 溶接金網
          case '03':
            // 材料在庫(ﾊﾟﾝﾁﾝｸﾞﾒﾀﾙ・ｴｷｽﾊﾟﾝﾄﾞﾒﾀﾙ)
          case '05':
          case '06':
            $sheet->setCellValueByColumnAndRow(3, $row + 1, $strProd);   // 品名
            $sheet->setCellValueByColumnAndRow(3, $row + 2, $ar[1]);   // 規格
            $sheet->setCellValueByColumnAndRow(3, $row + 3, $ar[2]);   // 寸法
            break;
            // 線材
          case '18':
            $sheet->setCellValueByColumnAndRow(3, $row + 1, $strProd);   // 品名
            $pos = mb_strpos($strProd, 'φ');
            if ($pos !== false) {
              $sheet->setCellValueByColumnAndRow(3, $row + 2, mb_substr($strProd, $pos));   // 規格
            }
            break;
            // 材料在庫(鋼材・ｶｺﾞ枠資材・板材)
          case '19':
          case '22':
            $sheet->setCellValueByColumnAndRow(3, $row + 1, $strProd);   // 品名
            if ($ar[1] !== 'φ0.0×0.0') {
              $sheet->setCellValueByColumnAndRow(3, $row + 2, $ar[1]);   // 規格
            }
            $sheet->setCellValueByColumnAndRow(3, $row + 3, $ar[2]);   // 寸法
            break;
            // 材料在庫(金型・その他)
          case '17':
          case '20':
          case '21':
          case '23':
            $sheet->setCellValueByColumnAndRow(3, $row + 1, $strProd);   // 品名
            if ($ar[1] !== 'φ0.0×0.0') {
              $sheet->setCellValueByColumnAndRow(3, $row + 2, $ar[1]);   // 規格
            }
            break;
        }
        // 共通表示内容
        $sheet->setCellValueByColumnAndRow(3, $row + 4, self::roundEstData($record['sr_quantity']) . ' ' . $record['sr_unit_cd']);   // 数量
        $colName = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(3);
        $sheet->setCellValueExplicit($colName . (string)($row + 5), $record['sr_sub_14'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);    // LotNo
        $dateTime = DateTime::createFromFormat('Ymd', $record['sr_transfer_date']);
        $formattedDate = $dateTime->format('Y/m/d');
        $sheet->setCellValueByColumnAndRow(3, $row + 6, $formattedDate);   // 在庫日
        $sheet->setCellValueByColumnAndRow(3, $row + 7, $record['makername']);   // メーカー

        self::makeQR(7, $row + 3, 90, $record['qrid'], self::setQRMode('prtag'))->setWorksheet($sheet);
        // self::makeQR(8, $row + 2, 150, $record['sr_sub_cd'], self::setQRMode('prtag'))->setWorksheet($sheet);
        // self::makeQR(8, $row + 2, 90, $record['qrid'], self::setQRMode('prtag'))->setWorksheet($sheet);

        $row += $rowPerRec;
        if ($i % ($recPerPage - 1) === 0 && $i > 0) {
          self::copyRows($sheet, $pagecnt * $pagelen + 1, ($pagecnt + 1) * $pagelen + 1, 10, $pagelen);
          $delRow = $row;
          for ($k = 0; $k < $recPerPage; $k++) {
            $delRow += $rowPerRec;
            $sheet->setCellValueByColumnAndRow(3, $delRow + 1, '');
            $sheet->setCellValueByColumnAndRow(3, $delRow + 2, '');
            $sheet->setCellValueByColumnAndRow(3, $delRow + 3, '');
            $sheet->setCellValueByColumnAndRow(3, $delRow + 4, '');
            $sheet->setCellValueByColumnAndRow(3, $delRow + 5, '');
            $sheet->setCellValueByColumnAndRow(3, $delRow + 6, '');
            $sheet->setCellValueByColumnAndRow(3, $delRow + 7, '');
          }
          $sheet->setBreakByColumnAndRow(1, $pagecnt * $pagelen, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
          $pagecnt++;
        }
        $i++;
      }

      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('B1:G' . (($pagecnt + 1) * $pagelen));
      // $objPHPE->getActiveSheet()  
      // ->getPageSetup()-> setScale(61); 
      $objPageMargins = $objPHPE->getActiveSheet()->getPageMargins();
      $objPageMargins->setTop(0);
      $objPageMargins->setRight(0);
      $objPageMargins->setLeft(0);
      $objPageMargins->setBottom(0);
      $objPHPE->setActiveSheetIndex(0);

      // クライアント側に出力 ファイル名：QR_発注書No
      self::outputToBrowser($objPHPE, '現品票_' . Plannerdbmgr::currentDate() . '_' . Plannerdbmgr::currentTime(), true);
    } catch (Exception $e) {
      die();
    }
  }

  /** 
   * 送状発行
   */
  public static function exportShippingLabel($items)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/ShippingLabel.xlsx');
      // シート名
      $sheetName = '';
      // 行数
      $row = 1;
      // 明細レコードNo
      $subNo = 0;
      // 見積番号
      $estimateNo = '';
      // 納品書枝番
      $statementSubNo = '';
      $cnt = 0;
      // 行数(ヤマト・西濃以外の運輸会社用)
      $rowOther = 1;
      // 変数に初期値セット
      $arr = [];  // 規格文字列分割用
      $pos = '';
      $str2 = '';
      $intCoType = 0;                   // 運送会社種類(1:ヤマト、2:西濃、3:その他)
      $blnCoType1 = false;              // フラグ-ヤマト
      $blnCoType2 = false;              // フラグ-西濃
      $blnCoType3 = false;              // フラグ-その他運送会社
      $strCoYamato = 'ヤマト運輸';
      $strCoSeino = '西濃運輸';
      $strCoOther = 'その他';
      $SHIP_KORO = '1';   // 頃
      $SHIP_MADE = '2';   // まで
      $SHIP_SHITEI = '3';   // 指定
      foreach ($items as $record) {
        if ($sheetName === '' || $sheetName !== $record['transcomp']) {
          $row = 1;
          // 運送会社でシート選択
          if (strpos($record['transcomp'], $strCoYamato) !== false) {
            $sheetName = $strCoYamato;
            $intCoType = 1;
            $blnCoType1 = true;
            // ヤマトは項目ヘッダ行不要のため行調整
            $row = 0;
          } elseif (strpos($record['transcomp'], $strCoSeino) !== false) {
            $sheetName = $strCoSeino;
            $intCoType = 2;
            $blnCoType2 = true;
          } else {
            $sheetName = $strCoOther;
            $intCoType = 3;
            $blnCoType3 = true;
            $row = $rowOther;
          }
          $sheet = $objPHPE->setActiveSheetIndexByName($sheetName);
          $cnt += 1;
          $subNo = 0;
        }
        // 運送会社毎のコード追加
        if ($estimateNo !== $record['estimateno'] || $statementSubNo !== $record['statementno']) {
          if (isset($estimateNo) && isset($statementSubNo)) {
            // 初回でないとき
            $row += 1;
            $subNo = 0;
            if ($intCoType === 3) {
              // その他の運送会社の場合
              $rowOther += 1;
            }
          }
          $estimateNo = $record['estimateno'];
          $statementSubNo = $record['statementno'];

          if ($intCoType === 1) {
            // ヤマト運輸
            $sheet->setCellValueByColumnAndRow(1, $row, $record['reportno']);             //お客様管理番号
            $sheet->setCellValueByColumnAndRow(2, $row, '0');                             //送り状種類
            $strDate = self::formatStrToDate($record['s_shipping_plan_date']);
            $sheet->setCellValueByColumnAndRow(5, $row, $strDate);                        //出荷予定日   
            $arr = self::splitTelephone($record['staytel']);
            $sheet->setCellValueByColumnAndRow(8, $row, $arr[0] . $arr[1] . $arr[2]);
            $sheet->setCellValueByColumnAndRow(9, $row, $record['staytel']);              //お届け先電話番号 
            $sheet->setCellValueByColumnAndRow(11, $row, $record['receivezip']);          //お届け先郵便番号
            // 全角、半角スペースを削除
            // $str_stayadd1 = preg_replace("/( |　)/", "", $record['stayadd1']);
            $str_stayadd1 = self::trimSpaceForCustomerAddress($record['stayadd1']);
            $sheet->setCellValueByColumnAndRow(12, $row, $str_stayadd1);                //お届け先住所
            if (mb_strlen($str_stayadd1) > 32) {
              // 32文字より多いとき、セル背景色を変更
              self::coloringCell($sheet, 12, $row);
            }
            $sheet->setCellValueByColumnAndRow(13, $row, $record['stayadd2']);            //お届け先アパートマンション名
            if (mb_strlen($record['stayadd2']) > 16) {
              // 16文字より多いとき、セル背景色を変更
              self::coloringCell($sheet, 13, $row);
            }
            $arr = self::splitSpace($record['stayname']);
            $sheet->setCellValueByColumnAndRow(16, $row, $arr[0]);                        //お届け先名
            $sheet->setCellValueByColumnAndRow(14, $row, $arr[1] . ' ' . $arr[2]);        //お届け先会社・部門

            if (mb_strlen($arr[0]) > 16 || mb_strlen($record['s_stay_cd']) > 0) {
              // 16文字より多いとき、またはs_stay_cdにデータがセットされているとき、お届け先名のみセル背景色を変更
              self::coloringCell($sheet, 16, $row);
            }
            $arr = self::splitTelephone($record['shiptel']);
            $sheet->setCellValueByColumnAndRow(19, $row, $arr[0] . $arr[1] . $arr[2]);    //ご依頼主コード
            $sheet->setCellValueByColumnAndRow(20, $row, $record['shiptel']);             //ご依頼主電話番号
            $sheet->setCellValueByColumnAndRow(22, $row, $record['destinationzip']);      //ご依頼主郵便番号
            // 全角、半角スペースを削除
            // $str_shipadd1 = preg_replace("/( |　)/", "", $record['shipadd1']);
            $str_shipadd1 = self::trimSpaceForCustomerAddress($record['shipadd1']);
            $sheet->setCellValueByColumnAndRow(23, $row, $str_shipadd1);                //ご依頼主住所
            if (mb_strlen($str_shipadd1) > 32) {
              // 32文字より多いとき、セル背景色を変更
              self::coloringCell($sheet, 23, $row);
            }
            $sheet->setCellValueByColumnAndRow(24, $row, $record['shipadd2']);            //ご依頼主アパートマンション
            $sheet->setCellValueByColumnAndRow(25, $row, $record['shipname']);            //ご依頼主名
            if (mb_strlen($record['shipname']) > 16) {
              // 16文字より多いとき、セル背景色を変更
              self::coloringCell($sheet, 25, $row);
            }

            // 品名１の前後のスペースを削除
            $str = trim(mb_convert_kana($record['pname'], "s"));
            // 品名に含まれた規格文字列を外す
            $pos = strpos($str, '_');
            if ($pos !== false) {
              // 文字列分割する
              $arr = explode('_', $str);
              $str = $arr[0];
              if (isset($record['ar_name'])) {
                // 加工内容があれば、品名に追加
                $str .= $record['ar_name'];
              }
            }
            // 全文字を全角にする
            $sheet->setCellValueByColumnAndRow(28, $row, mb_convert_kana($str, 'KVAS'));         //品名１
            if (mb_strlen($str) > 25) {
              // 25文字より多いとき、セル背景色を変更
              self::coloringCell($sheet, 28, $row);
            }

            // 全文字を全角にする
            $strProductName = mb_convert_kana($record['sd_p_name_supple'] . '　' . $record['qty'] . $record['unit'], 'KVAS');
            $strProductName = ltrim($strProductName);
            $sheet->setCellValueByColumnAndRow(30, $row, $strProductName);                //品名２
            $arr = self::splitTelephone($record['comptel']);
            $sheet->setCellValueByColumnAndRow(40, $row, $arr[0] . $arr[1] . $arr[2]);    //請求先顧客コード
            $sheet->setCellValueByColumnAndRow(42, $row, '01');                           //運賃管理番号
          } elseif ($intCoType === 2) {
            // 西濃運輸
            $sheet->setCellValueByColumnAndRow(1, $row, /*preg_replace('/[a-zA-Z]/', '-',*/ $record['estimateno']);    // 管理番号
            $sheet->setCellValueByColumnAndRow(2, $row, $record['s_shipping_date']);      //出荷予定日
            $sheet->setCellValueByColumnAndRow(3, $row, '0');                             //原票区分
            $sheet->setCellValueByColumnAndRow(4, $row, '1');                             //元着区分
            $arr = self::splitTelephone($record['staytel']);
            $sheet->setCellValueByColumnAndRow(5, $row, $arr[0] . $arr[1] . $arr[2]);     //お届け先コード
            $sheet->setCellValueByColumnAndRow(6, $row, $record['staytel']);              //お届け先電話番号
            $sheet->setCellValueByColumnAndRow(7, $row, $record['receivezip']);           //お届け先郵便番号
            $arr = self::splitAddress($record['stayadd1']);
            $sheet->setCellValueByColumnAndRow(9, $row, $arr[0]);                         //お届け先住所１
            $sheet->setCellValueByColumnAndRow(10, $row, $arr[1]);                        //お届け先住所２
            $arr = self::splitSpace($record['stayname']);
            $sheet->setCellValueByColumnAndRow(12, $row, $arr[0]);                        //お届け先会社・部門
            $sheet->setCellValueByColumnAndRow(13, $row, $arr[1] . ' ' . $arr[2]);        //お届け先会社・部門
            $sheet->setCellValueByColumnAndRow(16, $row, '1');                            //個数
            // // 記事１の前後のスペースを削除
            $str = trim(mb_convert_kana($record['pname'], "s"));
            // 品名に含まれた規格文字列を外す
            $pos = strpos($str, '_');
            if ($pos !== false) {
              // 文字列分割する
              $arr = explode('_', $str);
              if (isset($record['ar_name'])) {
                // 加工内容があれば、品名に追加
                $str = $arr[0] . $record['ar_name'];
              }
              $str2 = $arr[1];
            }
            $sheet->setCellValueByColumnAndRow(19, $row, $str);                           //記事１
            if (mb_strlen($str) > 15) {
              // 15文字より多いとき、セル背景色を変更
              self::coloringCell($sheet, 19, $row);
            }
            $arr = self::splitSpace($record['sd_p_name_supple']);
            $sheet->setCellValueByColumnAndRow(21, $row, $arr[0]);                        //記事３
            $sheet->setCellValueByColumnAndRow(22, $row, $arr[1] . '　' . $record['qty'] . $record['unit']);    //記事４
            $sheet->setCellValueByColumnAndRow(24, $row, '');                             //輸送指示１
            $sheet->setCellValueByColumnAndRow(27, $row, '');                             //配達指定日付
            // データが「まで」「指定」「最短」どれかで指定値変更
            if ($record['ed_type_02'] === $SHIP_KORO) {
              $sheet->setCellValueByColumnAndRow(28, $row, '8');                            //配達指定日付
            } else if ($record['ed_type_02'] === $SHIP_SHITEI) {
              $sheet->setCellValueByColumnAndRow(28, $row, '0');                            //配達指定日付
            } else {  // 最短
              $sheet->setCellValueByColumnAndRow(28, $row, '');                            //配達指定日付
            }
            $sheet->setCellValueByColumnAndRow(31, $row, '');                             //荷送人コード
            $sheet->setCellValueByColumnAndRow(32, $row, $record['shiptel']);             //荷送人電話番号
            $arr = self::splitAddress($record['shipadd1']);
            $sheet->setCellValueByColumnAndRow(33, $row, $arr[0]);                         //荷送人住所１
            $sheet->setCellValueByColumnAndRow(34, $row, $arr[1]);                        //荷送人住所２
            $arr = self::splitSpace($record['shipname']);
            $sheet->setCellValueByColumnAndRow(35, $row, $arr[0]);                        //荷送人名称
            $sheet->setCellValueByColumnAndRow(37, $row, $arr[1] . ' ' . $arr[2]);        //部署名称
          } else {
            // 最初のレコード用数値フォーマット設定
            $sheet->getStyle('AO' . $row . ':AV' . $row)->getNumberFormat();
            $sheet->getStyle('BD' . $row . ':BJ' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->setCellValueByColumnAndRow(1, $row, $record['estimateno']);
            $sheet->setCellValueByColumnAndRow(2, $row, $record['statementno']);
            $sheet->setCellValueByColumnAndRow(3, $row, $record['deliverydate']);
            $sheet->setCellValueByColumnAndRow(4, $row, $record['year']);
            $sheet->setCellValueByColumnAndRow(5, $row, $record['month']);
            $sheet->setCellValueByColumnAndRow(6, $row, $record['day']);
            $sheet->setCellValueByColumnAndRow(7, $row, $record['housename']);
            $sheet->setCellValueByColumnAndRow(8, $row, $record['housetel']);
            $arr = self::splitTelephone($record['housetel']);
            $sheet->setCellValueByColumnAndRow(9, $row, $arr[0]);
            $sheet->setCellValueByColumnAndRow(10, $row, $arr[1]);
            $sheet->setCellValueByColumnAndRow(11, $row, $arr[2]);
            $sheet->setCellValueByColumnAndRow(12, $row, $record['shipname']);
            $sheet->setCellValueByColumnAndRow(13, $row, $record['destinationzip']);
            $sheet->setCellValueByColumnAndRow(14, $row, $record['destinationzip01']);
            $sheet->setCellValueByColumnAndRow(15, $row, $record['destinationzip02']);
            // $str = preg_replace("/( |　)/", "", $record['shipadd1']);
            $str = self::trimSpaceForCustomerAddress($record['shipadd1']);
            $sheet->setCellValueByColumnAndRow(16, $row, $str);
            $sheet->setCellValueByColumnAndRow(17, $row, $record['shiptel']);
            $arr = self::splitTelephone($record['shiptel']);
            $sheet->setCellValueByColumnAndRow(18, $row, $arr[0]);
            $sheet->setCellValueByColumnAndRow(19, $row, $arr[1]);
            $sheet->setCellValueByColumnAndRow(20, $row, $arr[2]);
            $sheet->setCellValueByColumnAndRow(21, $row, $record['stayname']);
            $sheet->setCellValueByColumnAndRow(22, $row, $record['receivezip']);
            $sheet->setCellValueByColumnAndRow(23, $row, $record['receivezip01']);
            $sheet->setCellValueByColumnAndRow(24, $row, $record['receivezip02']);
            // $str = preg_replace("/( |　)/", "", $record['stayadd1']);
            $str = self::trimSpaceForCustomerAddress($record['stayadd1']);
            $sheet->setCellValueByColumnAndRow(25, $row, $str);
            $sheet->setCellValueByColumnAndRow(26, $row, $record['staytel']);
            $arr = self::splitTelephone($record['staytel']);
            $sheet->setCellValueByColumnAndRow(27, $row, $arr[0]);
            $sheet->setCellValueByColumnAndRow(28, $row, $arr[1]);
            $sheet->setCellValueByColumnAndRow(29, $row, $arr[2]);
            $sheet->setCellValueByColumnAndRow(30, $row, $record['salesmanname']);
            $sheet->setCellValueByColumnAndRow(31, $row, $record['orderno']);
            $sheet->setCellValueByColumnAndRow(39, $row, $record['customer']);
            $sheet->setCellValueByColumnAndRow(41, $row, $record['weight']);
          }
        } else {
          if ($intCoType !== 1 && $intCoType !== 2) {
            if ($subNo < 7) {
              $str = trim(mb_convert_kana($record['pname'], "s"));
              $sheet->setCellValueByColumnAndRow(32 + $subNo, $row, $str . ' ' . self::makeStrProductSpec($record));
              // ↑UPD 2021/5/13 ISHIBASHI [送状発行処理]
              $sheet->setCellValueByColumnAndRow(42 + $subNo, $row, $record['qty']);
              $sheet->setCellValueByColumnAndRow(49 + $subNo, $row, $record['unit']);
              $sheet->setCellValueByColumnAndRow(56 + $subNo, $row, $record['area']);
              $subNo += 1;
            }
          }
        }
      }

      //使用しなかったシートを削除
      if ($blnCoType1 === false) {
        $obj_worksheet = $objPHPE->getSheetByName($strCoYamato);  // ヤマト運輸
        $objPHPE->removeSheetByIndex($objPHPE->getIndex($obj_worksheet) . "\n");
      };
      if ($blnCoType2 === false) {
        $obj_worksheet = $objPHPE->getSheetByName($strCoSeino);   // 西濃運輸
        $objPHPE->removeSheetByIndex($objPHPE->getIndex($obj_worksheet) . "\n");
      };
      if ($blnCoType3 === false) {
        $obj_worksheet = $objPHPE->getSheetByName($strCoOther);   // その他
        $objPHPE->removeSheetByIndex($objPHPE->getIndex($obj_worksheet) . "\n");
      };

      // クライアント側に出力
      self::outputToBrowser($objPHPE, '送状_' . date('Ymd'));
    } catch (Exception $e) {
      die();
    }
  }


  /***
   * 送状発行　運送会社専用CSVファイル発行 福通
   */
  public static function createShippingLabelCSV($items)
  {
    try {
      // データをファイル書込み用にフォーマット
      $arWrData = [];
      foreach ($items as $rec) {
        $arRow = [];
        if (strpos($rec['s_tc_short_name'], '福山') === false) {
          continue;
        }
        if (isset($rec['staytel'])) {
          $arRow[] = str_replace('-', '', $rec['staytel']);    // 荷受人コード
          $arRow[] = $rec['staytel'];      // 電話番号
          // 住所1,2
          $arr = self::splitAddress($rec['stayadd1']);
          $arRow[] = $arr[0];
          $arRow[] = $arr[1];
          // 住所3
          $arRow[] = $rec['stayadd2'];
          // 名前1,2
          $arName = self::explodeSpaceStr($rec['stayname']);
          if (count($arName) === 3) {
            $arRow[] = $arName[0];
            $arRow[] = $arName[1] . ' ' . $arName[2];
          } else if (count($arName) === 2) {
            $arRow[] = $arName[0];
            $arRow[] = $arName[1];
          } else {
            $arRow[] = $rec['stayname'];     //$arName;
            $arRow[] = '';
          }
          $arRow[] = $rec['receivezip'];      // 郵便番号  
        } else if (isset($rec['c_customer_name'])) {
          $arRow[] = str_replace('-', '', $rec['C_TEL']);    // 荷受人コード
          $arRow[] = $rec['C_TEL'];      // 電話番号
          // 住所1,2
          $arr = self::splitAddress($rec['C_ADDRESS_01']);
          $arRow[] = $arr[0];
          $arRow[] = $arr[1];
          $arRow[] = $rec['C_ADDRESS_02'];                  // 住所3
          $arName = self::explodeSpaceStr($rec['c_customer_name']);
          if (count($arName) === 3) {
            $arRow[] = $arName[0];            // 名前
            $arRow[] = $arName[1] . ' ' . $arName[2];      // 名前2
          } else if (count($arName) === 2) {
            $arRow[] = $arName[0];            // 名前
            $arRow[] = $arName[1];            // 名前2
          } else {
            $arRow[] = $rec['c_customer_name'];     // $arName;
            $arRow[] = '';
          }
          $arRow[] = $rec['C_ADDRESS_NO'];                      // 郵便番号
        } else {
          $arRow[] = '';
          $arRow[] = '';
          $arRow[] = '';
          $arRow[] = '';
          $arRow[] = '';
          $arRow[] = '';
          $arRow[] = '';
          $arRow[] = '';
        }
        $arRow[] = '';      // 特殊計
        $arRow[] = '';      // 着点コード
        if (isset($rec['shiptel'])) {
          $arRow[] = str_replace('-', '', $rec['shiptel']);      // 荷送人コード
          $arRow[] = $rec['shipname'];      // 荷送担当者
        } else if (isset($rec['housetel'])) {
          $arRow[] = str_replace('-', '', $rec['housetel']);
          $arRow[] = '';      // 荷送担当者
        } else {
          $arRow[] = '';                      // 荷送人コード
          $arRow[] = '';                      // 荷送担当者
        }
        $arRow[] = 1;                     // 個数
        $arRow[] = '';                    // 才数
        $arRow[] = 0;                     // 重量
        $arRow[] = '';                    // 輸送商品1
        $arRow[] = '';                    // 輸送商品2
        $arProduct = self::explodeSpaceStr($rec['pname']);
        if (count($arProduct) >= 3) {
          $arRow[] = $arProduct[0] . ' ' . $arProduct[1];         // 品名記事1
          $arRow[] = $arProduct[3];                    // 品名記事2
        } else if (count($arProduct) === 2) {
          $arRow[] = $arProduct[0] . ' ' . $arProduct[1];         // 品名記事1
          $arRow[] = '';                    // 品名記事2
        } else {
          $arRow[] = $rec['pname'];   // $arProduct;            // 品名記事1
          $arRow[] = '';                    // 品名記事2
        }
        $arPName = explode(' ', $rec['sd_p_name_supple']);
        $arRow[] = $arPName[0];           // 品名記事3
        $arRow[] = $arPName[1] . ' ' . floor($rec['qty']) . ' ' . $rec['unit'];  // 品名記事4
        $arRow[] = $rec['sd_customer_order_no'];          // 品名記事5
        $arRow[] = '';                                    // 品名記事6

        $arRow[] = '';                                    // 配達指定日 => 空欄
        $arRow[] = $rec['ed_type_02'] < '2' ? 0 : 1;      // 必着区分
        $arRow[] = $rec['estimateno'];                    // お客様管理番号
        $arRow[] = 1;                                     // 元払区分
        $arRow[] = '';                                    // 保険金額
        $arRow[] = $rec['s_shipping_plan_date'];          // 出荷日付→送状なので、出荷予定日をセット
        $arRow[] = '';                                    // 登録日付
        $arWrData[] = $arRow;
      }
      // ファイルオーブン
      $fp = fopen('php://output', 'w');
      // header作成
      header('Content-Type: text/csv');
      header('Content-Disposition: attachment; filename=送状_福通_' . date('Ymd') . '.csv');
      foreach ($arWrData as $record) {
        //↓UPD 2021/11/22 ISHIBASHI [送状発行－CSV出力内容の修正]
        // fputcsv($fp, mb_convert_encoding($record, 'SJIS', 'UTF-8'));
        self::createCSV_withDblQuot($fp, $record);
        //↑UPD 2021/11/22 ISHIBASHI [送状発行－CSV出力内容の修正]
      }
      fclose($fp);
    } catch (Exception $e) {
      throw $e;
    }
  }


  /***
   *  送状発行　運送会社専用CSVファイル発行 佐川
   */
  public static function createShippingLabelCSVSG($items)
  {
    try {
      // データをファイル書込み用にフォーマット
      $arWrData = [];
      foreach ($items as $rec) {
        $arRow = [];
        //
        if ($rec['s_stay_cd'] !== '') {
          // 止め先が空でない
          $arRow[] = str_replace('-', '', $rec['staytel']);             // 住所録コード
          $arRow[] = $rec['staytel'];                                 // お届け先電話番号
          $arRow[] = $rec['receivezip'];                              // お届け先郵便番号
          $arRow[] = preg_replace("/( |　)/", "", mb_substr($rec['stayadd1'], 0, 16, 'UTF-8'));     // お届け先住所１ 
          $arRow[] = preg_replace("/( |　)/", "", mb_substr($rec['stayadd1'], 16, NULL, 'UTF-8'));  // お届け先住所２    
          $arRow[] = preg_replace("/( |　)/", "", $rec['stayadd2']);                                // お届け先住所３  

          $arName = self::splitSpace($rec['stayname']);
          $arRow[] = $arName[0];                                      // お届け先名称１
          // お届け先名称２
          if ($arName[1] !== '' || $arName[2] !== '') {
            $arRow[] = $arName[1] . ' ' . $arName[2];
          } else {
            $arRow[] = '';
          }
        } else if ($rec['s_delivery_cd'] !== '') {
          // 納入先が空でない
          $arRow[] = str_replace('-', '', $rec['staytel']);             // 住所録コード
          $arRow[] = $rec['staytel'];                                 // お届け先電話番号
          $arRow[] = $rec['receivezip'];                              // お届け先郵便番号
          $arRow[] = preg_replace("/( |　)/", "", mb_substr($rec['stayadd1'], 0, 16, 'UTF-8'));     // お届け先住所１ 
          $arRow[] = preg_replace("/( |　)/", "", mb_substr($rec['stayadd1'], 16, NULL, 'UTF-8'));  // お届け先住所２    
          $arRow[] = preg_replace("/( |　)/", "", $rec['stayadd2']);                                // お届け先住所３  

          $arName = self::splitSpace($rec['stayname']);
          $arRow[] = $arName[0];                                      // お届け先名称１
          // お届け先名称２
          if ($arName[1] !== '' || $arName[2] !== '') {
            $arRow[] = $arName[1] . ' ' . $arName[2];
          } else {
            $arRow[] = '';
          }
        } else {
          // 空白セット
          $arRow[] = '';                                              // お届け先電話番号
          $arRow[] = '';                                              // お届け先郵便番号
          $arRow[] = '';                                              // お届け先住所１
          $arRow[] = '';                                              // お届け先住所２
          $arRow[] = '';                                              // お届け先住所３
          $arRow[] = '';                                              // お届け先名称１
          $arRow[] = '';                                              // お届け先名称２
        }

        // $arRow[] = '';                                                // お客様管理ナンバー
        $arRow[] = preg_replace('/[a-zA-Z]/', '-', $rec['estimateno']); // お客様管理ナンバー 受注No
        $arRow[] = '';                                                // お客様コード
        $arRow[] = '';                                                // 部署・担当者
        $arRow[] = $rec['shiptel'];                                   // 荷送人電話番号
        $arRow[] = $rec['shiptel'];                                   // ご依頼主電話番号
        $arRow[] = $rec['destinationzip'];                            // ご依頼主郵便番号
        $arRow[] = preg_replace("/( |　)/", "", $rec['shipadd1']);    // ご依頼主住所１
        $arRow[] = '';                                                // ご依頼主住所２
        $arRow[] = $rec['shipname'];                                  // ご依頼主名称１
        $arRow[] = '';                                                // ご依頼主名称２
        $arRow[] = '';                                                // 荷姿コード

        $arRow[] = mb_substr(mb_convert_kana(trim(mb_convert_kana($rec['pname'], "s")), 'KVAS'), 0, 16);  // 品名１
        $arRow[] = '';                                                // 品名２
        $arPName = explode(' ', $rec['sd_p_name_supple']);
        $arRow[] = mb_substr(mb_convert_kana($arPName[0], 'KVAS'), 0, 16); // 品名３
        $arRow[] = mb_substr(mb_convert_kana($arPName[1] . '　' . floor($rec['qty']) . '　' . $rec['unit'], 'KVAS'), 0, 16);  // 品名４
        $arRow[] = '';                                                // 品名５
        $arRow[] = '1';                                               // 出荷個数
        $arRow[] = '';                                                // 便種
        $arRow[] = '';                                                // 便種(商品）   
        $arRow[] = '';                                                // 配達日     
        $arRow[] = '';                                                // 配達指定時間帯
        $arRow[] = '';                                                // 配達指定時間(時分)
        $arRow[] = '';                                                // 代引き金額
        $arRow[] = '';                                                // 消費税
        $arRow[] = '';                                                // 決済種別
        $arRow[] = '';                                                // 保険金額
        $arRow[] = '';                                                // 保険金額印字
        $arRow[] = '';                                                // 指定シール①
        $arRow[] = '';                                                // 指定シール②
        $arRow[] = '';                                                // 指定シール③
        $arRow[] = $rec['s_stay_cd'] !== '' ? $rec['s_stay_cd'] : ''; // 営業所止め
        $arRow[] = '';                                                // SRC区分
        $arRow[] = '';                                                // 営業店コード
        $arRow[] = '1';                                               // 元着区分
        $arWrData[] = $arRow;
      }
      // ファイルオーブン
      $fp = fopen('php://output', 'w');
      // header作成
      header('Content-Type: text/csv');
      header('Content-Disposition: attachment; filename=送状_佐川_' . date('Ymd') . '.csv');
      foreach ($arWrData as $record) {
        //↓UPD 2021/11/22 ISHIBASHI [送状発行－CSV出力内容の修正]
        // fputcsv($fp, mb_convert_encoding($record, 'SJIS', 'UTF-8'));
        self::createCSV_withDblQuot($fp, $record);
        //↑UPD 2021/11/22 ISHIBASHI [送状発行－CSV出力内容の修正]  
      }
      fclose($fp);
    } catch (Exception $e) {
      throw $e;
    }
  }

  /**
   * 請求書発行【2023/5/1修正：「金種：9(手形手数料)」追加による修正】
   * $customernum:客先CD $results:請求データ, $deposit: 決算時の各客先の開始日付データ
   */
  public static function createBillFile($customernum, $results, $deposit)
  {
    require_once 'vendor/autoload.php';

    $PAGE_LEN_TOP = 37;  // 47;         // 1ページ目の行数 
    $PAGE_LEN_SEQ = 36;  //48;         // 2ページ目以降の1ページ分の行数
    // 先頭ページ処理
    $pagecnt = 0;
    $row = 0;
    $cnt = 0;                   // 作成シート数
    $recCnt = 0;
    $itemcnt = 0;               // 各客先毎のレコード数
    $COPY_WIDTH = 19;           // コピーするセル数(幅側)
    $HEADER_ROW = 13;          // 1枚目のヘッダ行 2枚目はヘッダー無し
    $RECORDCNT = 10;  // 15;          // 1ページ記載可能レコード数    
    $RECORDCNT2 = 16; // 22;          // 2ページ以降の1ページ記載可能レコード数    
    $START_ROW_NUM = 17;      // レコード書込み開始行   
    $START_ROW_NUM2 = 42; // 52;      // 2ページ以降レコード書込み開始行   
    $PAGE_INTERVAL = 6;       // 明細最終行(1行目)から次ページのデータ書込み行まで
    $PAGE_START_OFFSET = 4;   // 2ページ以降のページ開始からデータ開始行までのオフセット
    $FULL_PAGE = 1;           // ページ総数
    $DEP_MONEY_TYPE_01 = '551';   // 現金
    $DEP_MONEY_TYPE_02 = '552';   // 小切手
    $DEP_MONEY_TYPE_03 = '553';   // 銀行振込
    $DEP_MONEY_TYPE_04 = '554';   // 手形
    $DEP_MONEY_TYPE_05 = '555';   // 相殺　↓に同じ内容の定義があるが、枝番比較時わかりやすくするためそのままにする。
    $DEP_MONEY_TYPE_08 = '558';   // 電子記録債券
    $DEP_MONEY_TYPE_09 = '559';   // 手形手数料
    $OFFSET_TYPE = '555';       // 相殺
    $PRICEDOWN_TYPE = '556';     // 値引きコード
    $TAX_AJUST_TYPE = '521';   // 消費税調整額
    $FEE_TYPE = '522';         // 振込手数料
    $createDate = '';
    $strBillNo = '';
    $str = '';
    $lastRow = 0;
    $strDate = date('Ymd');   // ファイル名用
    $flgDraft = false;        // 金種が電子債券
    $arDraftData = [];      // 振込手数料が発生する場合
    $statementNo = '';

    // 処理時間を延長
    ini_set('max_execution_time', 2400);

    // 振込手数料を銀行振込 or 手形の後ろに移動するよう並べ替え
    // $formatResults = self::sortBillDetail($results, $DEP_MONEY_TYPE_03, $DEP_MONEY_TYPE_04, $FEE_TYPE);
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/template_bill_invoice.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);

      // 客先毎に回す
      foreach ($customernum as $ccd) {
        $itemcnt = 0;
        $pagecnt = 1;
        $FULL_PAGE = 1;
        $recCnt = 0;
        $lastRow = $PAGE_LEN_TOP;
        $flgDraft = false;
        // 該当顧客のレコードのみ取得
        $resultCustomer = array_filter($results, function ($rec) use ($ccd) {
          if ($rec['bd_customer_cd'] === $ccd) {
            return $rec;
          }
        });
        $formatResults = $resultCustomer;
        // $formatResults = self::sortBillDetail($resultCustomer, $DEP_MONEY_TYPE_03, $DEP_MONEY_TYPE_04, $DEP_MONEY_TYPE_08, $DEP_MONEY_TYPE_09, $FEE_TYPE);

        $itemcnt = count($resultCustomer);
        if ($itemcnt > $RECORDCNT) {
          $FULL_PAGE += ceil(($itemcnt - $RECORDCNT) / $RECORDCNT2);
        }

        // レコード数によって、コピーするテンプレートを変更
        if ($FULL_PAGE > 1) {
          $clonedWorksheet = clone $objPHPE->getSheetByName('template2');
          $lastRow += $PAGE_LEN_SEQ * ($FULL_PAGE - 1);
        } else {
          $clonedWorksheet = clone $objPHPE->getSheetByName('template');
        }
        $sheetName = $ccd;
        $clonedWorksheet->setTitle($sheetName);
        // 新しい名前のシートを追加
        $objPHPE->addSheet($clonedWorksheet);
        $sheet = $objPHPE->setActiveSheetIndexByName($sheetName);
        $cnt++;

        // 相殺、値引き、訂正額と、 繰越金額を先に算出
        $priceDeposit = 0;    // 入金額
        $priceOffset = 0;     // 相殺
        $priceDiscount = 0;    // 値引き
        $priceTransfer = 0;   // 繰越金額
        $priceAdjust = 0;     // 調整額
        $priceBill = 0;       // 今回請求額

        foreach ($formatResults as $record) {
          if (
            $record['bd_st_details_no'] === $DEP_MONEY_TYPE_01 || $record['bd_st_details_no'] === $DEP_MONEY_TYPE_02 ||
            $record['bd_st_details_no'] === $DEP_MONEY_TYPE_03 || $record['bd_st_details_no'] === $DEP_MONEY_TYPE_04 ||
            $record['bd_st_details_no'] === $DEP_MONEY_TYPE_08 || $record['bd_st_details_no'] === $DEP_MONEY_TYPE_09 ||
            $record['bd_st_details_no'] === $FEE_TYPE || $record['bd_st_details_no'] === $TAX_AJUST_TYPE
          ) {
            // 入金 振込手数料と調整額も含む
            $priceDeposit += $record['bd_delivery_price'];
          } else if ($record['bd_st_details_no'] === $OFFSET_TYPE) {
            // 相殺
            $priceOffset += $record['bd_delivery_price'];
          } else if ($record['bd_st_details_no'] === $PRICEDOWN_TYPE) {
            // 値引
            $priceDiscount += $record['bd_delivery_price'];
          }
          // 2023/4/18 金種：9(手形送金料)を追加したため、以下の処理が不要
          // if ($record['bd_st_details_no'] === $DEP_MONEY_TYPE_04 || $record['bd_st_details_no'] === $DEP_MONEY_TYPE_08) {
          //   // 手形フラグ
          //   $flgDraft = $record['bd_st_details_no'] === $DEP_MONEY_TYPE_08 ? true : false;
          //   // 手形もしくは電子債券
          //   $arDraftData[$record['bd_estimate_no']] = true;
          // } 
        }

        // ヘッダ情報作成用　ヘッダ情報は請求データからのみ取得可能
        foreach ($formatResults as $rec) {
          // 請求データのみが対象
          if (preg_match('/^[0-9]{9}/', $rec['bd_bill_no'])) {
            $item = $rec;
            break;
          }
        }

        // 請求書No
        if ($item['bd_bill_no'] !== '') {
          $strBillNo = '請求書No. S' . $item['bd_bill_no'];
        }
        $sheet->setCellValueByColumnAndRow(13, 2, $strBillNo);
        // 2023/2/7　請求書の右上に記載する日付を客先締日ではなく、発行日（本日日付）に変更
        $arr = self::convertToEra(str_replace('-', '', date('Y-m-d')));
        // 請求書発行日と枚数 　請求書発行日は、請求締日
        // $arr = self::convertToEra(str_replace('-', '', $item['writedate']));    
        $createDate = $arr['gyear'] . '年' . $arr['month'] . '月' . $arr['date'] . '日';
        $sheet->setCellValueByColumnAndRow(17, 2, $createDate . ' ' . $pagecnt . '/' . $FULL_PAGE);
        // ファイル名用
        $strDate = str_replace('-', '', $item['writedate']);

        // ロゴ表示
        // self::makeLogoDrawing(13, 3, 20, 7, 396, 38)->setWorksheet($sheet);
        self::makeLogoDrawing(15, 3, -3, 2, 396, 38)->setWorksheet($sheet);
        // 社名表示
        self::makeTitleDrawingBill(15, 5, 30, -10)->setWorksheet($sheet);
        // 折り目用▼
        self::makeFold(17, 1, 12, 2, 1)->setWorksheet($sheet);
        self::makeFold(19, 22, 30, -15, 2)->setWorksheet($sheet);
        if ($FULL_PAGE === 2) {
          self::makeFold(17, $PAGE_LEN_TOP + 1, 12, 2, 1)->setWorksheet($sheet);
          self::makeFold(19, $PAGE_LEN_TOP + 26, 30, -6, 2)->setWorksheet($sheet);
        }
        // 請求先の宛先
        $sheet->setCellValueByColumnAndRow(2, 2, '〒' . $item['addressno']);
        $strAds =  self::trimSpaceForCustomerAddress($item['address1']);
        $sheet->setCellValueByColumnAndRow(2, 3, $strAds);
        $sheet->setCellValueByColumnAndRow(2, 4, $item['address2']);
        $sheet->setCellValueByColumnAndRow(2, 5, $item['companyname']);
        // 客先名にアンダーバーが含まれる場合、アンダーバーの前後を２行に分けて表示する
        $splitedCustomerName = explode('_', $item['companyname'], 2);
        if (count($splitedCustomerName) > 1) {
          $sheet->setCellValueByColumnAndRow(2, 5, $splitedCustomerName[0]);
          $sheet->setCellValueByColumnAndRow(2, 7, $splitedCustomerName[1]);
        }

        $sheet->setCellValueByColumnAndRow(6, 5, '御中');

        // 請求締日、支払予定日
        if (isset($item['bd_bill_close_date'])) {
          $arr = self::convertToEra($item['bd_bill_close_date']);
          $billDate = $arr['gyear'] . '年' . $arr['month'] . '月' . $arr['date'] . '日';
          $sheet->setCellValueByColumnAndRow(11, 9, $billDate);
        }
        if (isset($item['bd_payment_close_date'])) {
          $arr = self::convertToEra($item['bd_payment_close_date']);
          $paymentDate = $arr['gyear'] . '年' . $arr['month'] . '月' . $arr['date'] . '日';
          $sheet->setCellValueByColumnAndRow(11, 10, $paymentDate);
        }

        // ヘッダ
        if ($priceDeposit <= 0 && !isset($item['b_before_bill_no'])) {
          // 初回請求書発行の場合、前月繰越が過入金なら入金データに記載するため
          $priceTransfer = $item['b_before_bill'] - $item['b_receive'] - $priceOffset - $priceDiscount;
        } else {
          $priceTransfer = $item['b_before_bill'] - $priceDeposit - $priceOffset - $priceDiscount;
        }
        $sheet->setCellValueByColumnAndRow(2, $HEADER_ROW, $item['b_before_bill']);       // 前回請求額
        if ($priceDeposit <= 0 && !isset($item['b_before_bill_no'])) {
          $sheet->setCellValueByColumnAndRow(4, $HEADER_ROW, $item['b_receive']);           // 入金額   
        } else {
          $sheet->setCellValueByColumnAndRow(4, $HEADER_ROW, $priceDeposit);           // 入金額   
        }
        // 集計データを都度使う必要あり
        $sheet->setCellValueByColumnAndRow(6, $HEADER_ROW, $priceOffset + $priceDiscount);  // 相殺・値引き額
        $sheet->setCellValueByColumnAndRow(9, $HEADER_ROW, $priceTransfer);                      // 繰越金額
        $sheet->setCellValueByColumnAndRow(12, $HEADER_ROW, $item['b_sales_price']);      // 今回お買い上げ額
        $sheet->setCellValueByColumnAndRow(15, $HEADER_ROW, $item['b_tax']);              // 今回消費税額
        $sheet->setCellValueByColumnAndRow(17, $HEADER_ROW, $item['b_sales_price'] + $item['b_tax'] + $priceTransfer);   // 今回請求額

        foreach ($formatResults as  $rec) {
          // 記載文字列を記載用に調整する。******************************************************************************
          // 日付フォーマット変更
          $strDeliveryDate = '';
          $strDeliveryDate = self::formatStrToDate($rec['bd_shipment_date']);

          // 加工内容　
          $arname = '';
          if (strpos($rec['ar_name'], 'なし') !== false) {
            $arname = '';
          } else {
            $arname = $rec['ar_name'];
          }

          // 品名
          $pname = '';
          $spec = '';
          if (strpos($rec['bd_product_name'], '_') !== false) {
            // _含む
            $arrayName = explode('_', $rec['bd_product_name'], 2);
            $pname = $arrayName[0] . ' ' . $arname;

            if (strpos($rec['bd_prod_summary'], $arrayName[1]) !== false) {
              // 規格文字を含む
              $spec = $rec['bd_prod_summary'];
            } else {
              $spec = $arrayName[1] . ' ' . $rec['bd_prod_summary'];
            }
          } else {
            // _ない品名
            if ($rec['bd_product_name'] === '' && strpos($rec['bd_product_name'], $rec['ar_name']) !== false) {
              // 加工内容含む 納品データ登録時に、加工内容が書き込まれてしまったレコードデータがあったため。
              $pname = str_replace($rec['ar_name'], '', $rec['bd_product_name']) . ' ' . $arname;
            } else {
              $pname = $rec['bd_product_name'] . ' ' . $arname;
            }
            $spec = $rec['bd_prod_summary'];
          }
          // 2023/4/18 金種：9(手形送金料)を追加したため、以下の処理が不要
          // if (preg_match('/LIXIL/i', $rec['companyname']) && $flgDraft) {
          //   // LIXILでかつ、電子債券の場合は振込手数料の記載でOK.
          // } else if (array_key_exists($rec['bd_estimate_no'], $arDraftData) && $rec['bd_st_details_no'] === $FEE_TYPE) {
          // // } else if ($arDraftData[$rec['bd_estimate_no']] && $rec['bd_st_details_no'] === $FEE_TYPE) {
          //   // 手形送金料は、最終的にはエクセルの入金支払の方で対応する。
          //   $pname = '手形送金料';
          // } 

          $pname = ltrim($pname);

          // 摘要上側　ヘッダの客先注文番号、件名、備考、行毎の備考を表示。プラス、運送会社が引取、配達の場合も摘要に表示。@20220303
          $values = [];
          if (!isset($estimateNo) || $rec['bd_estimate_no'] !== $estimateNo) {
            // 各納品書データの先頭レコードにのみヘッダのデータを記載
            trim($rec['s_customer_order_no']) ? array_push($values, trim($rec['s_customer_order_no'])) : '';
            trim($rec['bd_dt_customer_order_no']) ? array_push($values, trim($rec['bd_dt_customer_order_no'])) : '';
            trim($rec['s_title']) ? array_push($values, trim($rec['s_title'])) : '';
            trim($rec['s_remarks']) ? array_push($values, trim($rec['s_remarks'])) : '';
            array_push($values, "\n");
            $estimateNo = $rec['bd_estimate_no'];
          } else {
            trim($rec['bd_dt_customer_order_no']) ? array_push($values, trim($rec['bd_dt_customer_order_no'])) : '';
            array_push($values, "\n");
          }
          // trim($rec['bd_dt_customer_order_no']) ? array_push($values, trim($rec['bd_dt_customer_order_no'])) : '';
          // trim($rec['bd_detail_remarks']) ? array_push($values, trim($rec['bd_detail_remarks'])) : '';
          array_push($values, "\n");
          // 摘要3行目　自社以外の納品先の場合のみ表示
          $strDeliveryName = '';
          $strDeliveryName = (trim($item['companyname']) !== trim($rec['deliveryname'])) ? $rec['deliveryname'] : '';
          if ($strDeliveryName != '') {
            $strDeliveryName = $strDeliveryName . " 様";
          }
          $strDeliveryName ? array_push($values, $strDeliveryName) : '';
          $strRecRemark = implode(' ', $values);

          // ↑摘要欄を上下2行から結合1行へ変更
          // // 摘要下側　自社以外の納品先の場合のみ表示
          // $strDeliveryName = '';
          // $strDeliveryName = (trim($item['companyname']) !== trim($rec['deliveryname'])) ? $rec['deliveryname'] : '';
          // if ($strDeliveryName != '') {
          //   $strDeliveryName = $strDeliveryName ." 様";
          // }
          // ***********************************************************************************************************

          if ($recCnt < $RECORDCNT) {
            // 1ページ目
            $row = $recCnt * 2 + $START_ROW_NUM;
          } else {
            // 2ページ目以降
            $pagecnt = ceil(($recCnt + 1 - $RECORDCNT) / $RECORDCNT2) + 1;

            if (($recCnt - $RECORDCNT) === 0) {
              // 改ページ
              $sheet->setBreakByColumnAndRow(20, $PAGE_LEN_TOP, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
              // 2ページ目　テンプレートに罫線あるので、データクリア必要なし
              $sheet->setCellValueByColumnAndRow(13, $row + 3, $strBillNo);
              $sheet->setCellValueByColumnAndRow(17, $row + 3, $createDate . ' ' . $pagecnt . '/' . $FULL_PAGE);
            } else if (($recCnt - $RECORDCNT) % $RECORDCNT2 === 0) {
              // 3ページ目以降
              // 2ページ目からコピー
              self::copyRows($sheet, $PAGE_LEN_TOP + 1, $row + 2, $COPY_WIDTH, $PAGE_LEN_SEQ);

              $sheet->setCellValueByColumnAndRow(13, $row + 2, $strBillNo);
              $sheet->setCellValueByColumnAndRow(17, $row + 2, $createDate . ' ' . $pagecnt . '/' . $FULL_PAGE);

              // データクリア
              $tempRow = $row + $PAGE_INTERVAL;
              for ($i = 0; $i < $RECORDCNT2; $i++) {
                $deleteRow = $tempRow + ($i * 2);
                $sheet->setCellValueByColumnAndRow(2, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(2, $deleteRow + 1, '');
                $sheet->setCellValueByColumnAndRow(3, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(3, $deleteRow + 1, '');
                // $sheet->setCellValueByColumnAndRow(9, $deleteRow, '');
                // $sheet->setCellValueByColumnAndRow(9, $deleteRow + 1, '');
                $sheet->setCellValueByColumnAndRow(10, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(10, $deleteRow + 1, '');
                $sheet->setCellValueByColumnAndRow(12, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(12, $deleteRow + 1, '');
                $sheet->setCellValueByColumnAndRow(13, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(13, $deleteRow + 1, '');
                $sheet->setCellValueByColumnAndRow(15, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(15, $deleteRow + 1, '');
                $sheet->setCellValueByColumnAndRow(17, $deleteRow, '');
                $sheet->setCellValueByColumnAndRow(17, $deleteRow + 1, '');
                // $sheet->setCellValueByColumnAndRow(19, $deleteRow, '');
                // $sheet->setCellValueByColumnAndRow(19, $deleteRow + 1, '');
              }
              // 改ページ             
              $sheet->setBreakByColumnAndRow(20, $row + 1, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
            }

            $row = $START_ROW_NUM2 + ($recCnt - $RECORDCNT) * 2 + $PAGE_START_OFFSET * ($pagecnt - 2);
          }
          $sheet->setCellValueByColumnAndRow(2, $row, $strDeliveryDate);
          // if (!preg_match('/^N/', $rec['bd_bill_no'])) {
          if (preg_match('/^[0-9]{9}/', $rec['bd_bill_no'])) {
            $sheet->setCellValueByColumnAndRow(2, $row + 1, $rec['bd_estimate_no'] . $rec['bd_ed_details_no']);
          } else {
            $sheet->setCellValueByColumnAndRow(2, $row + 1, $rec['bd_estimate_no']);
          }
          $sheet->setCellValueByColumnAndRow(3, $row, $pname);
          $sheet->setCellValueByColumnAndRow(3, $row + 1, $spec);
          $sheet->setCellValueByColumnAndRow(10, $row, $rec['bd_qty_delivery']);
          $sheet->setCellValueByColumnAndRow(12, $row, $rec['bd_unit_tran']);
          // $sheet->setCellValueByColumnAndRow(9, $row, $rec['bd_qty_delivery']);
          // $sheet->setCellValueByColumnAndRow(10, $row, $rec['bd_unit_tran']);

          if (preg_match('/^N/', $rec['bd_bill_no'])) {
            if ($rec['bd_unit_price'] < 0) {
              $rec['bd_unit_price'] = -1 * $rec['bd_unit_price'];
            }
            if ($rec['bd_delivery_price'] < 0) {
              $rec['bd_delivery_price'] = -1 * $rec['bd_delivery_price'];
            }
            if ($rec['bd_tax'] < 0) {
              $rec['bd_tax'] = -1 * $rec['bd_tax'];
            }
          }

          $sheet->setCellValueByColumnAndRow(13, $row, $rec['bd_unit_price'] === '0.000' ? '' : $rec['bd_unit_price']);
          // $sheet->setCellValueByColumnAndRow(11, $row, $rec['bd_unit_price'] === '0.000' ? '' : $rec['bd_unit_price']);

          // 半角スペースを削除した品名
          $productName = str_replace(' ', '', $rec['bd_product_name']);
          $sheet->setCellValueByColumnAndRow(15, $row, $rec['bd_delivery_price']);
          // // 品名が「運賃差額」の場合は金額をマイナス表示にする
          // $sheet->setCellValueByColumnAndRow(15, $row, $productName === '運賃差額' ? -$rec['bd_delivery_price'] : $rec['bd_delivery_price']);
          // $sheet->setCellValueByColumnAndRow(13, $row, $productName === '運賃差額' ? -$rec['bd_delivery_price'] : $rec['bd_delivery_price']);
          // $sheet->setCellValueByColumnAndRow(15, $row, $productName === '運賃差額' ? -$rec['bd_tax'] : $rec['bd_tax']);

          if (strpos($rec['bd_estimate_no'], 'N') !== false && ($rec['bd_st_details_no'] === $DEP_MONEY_TYPE_04 || $rec['bd_st_details_no'] === $DEP_MONEY_TYPE_08)) {
            // 入金データかつ、手形、電子債券レコードは期日を記載。手形以外はNULLが入る
            if (isset($rec['bd_detail_remarks'])) {
              $strRecRemark = '期日:' . date('Y/m/d', strtotime($rec['bd_detail_remarks']));
            }
          }
          $sheet->setCellValueByColumnAndRow(17, $row, $strRecRemark);
          $sheet->setCellValueByColumnAndRow(17, $row + 1, $strDeliveryName);
          $recCnt++;
        }

        // 印刷設定ベース 横向きと印刷範囲指定
        $sheet->getPageSetup()
          ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
          ->setPrintArea('A1:S' . $lastRow)
          ->setFitToWidth(1)
          ->setFitToHeight(0);
      }
      // テンプレートシート削除
      $sheetIndex = $objPHPE->getIndex(
        $objPHPE->getSheetByName('template')
      );
      $objPHPE->removeSheetByIndex($sheetIndex);
      $sheetIndex = $objPHPE->getIndex(
        $objPHPE->getSheetByName('template2')
      );
      $objPHPE->removeSheetByIndex($sheetIndex);
      $objPHPE->setActiveSheetIndex(0);

      // クライアント側に出力
      self::outputToBrowser($objPHPE, '請求書_' . $strDate);
    } catch (Exception $e) {
      die();
    }
  }

  /**
   * 請求明細の並び順を変更する 【2023/5/1修正：並び替えロジック修正】※並び替え済みであるため、以下の処理は実行しない。
   * 振込手数料を振込 or 手形の後ろにくるように並べ替える
   */
  private static function sortBillDetail($detailList, $DEP_MONEY_TYPE_03, $DEP_MONEY_TYPE_04, $DEP_MONEY_TYPE_08, $DEP_MONEY_TYPE_09, $FEE_TYPE)
  {
    // 銀行振込か判定フラグ
    $isExistType03 = false;
    // 手形か判定フラグ
    $isExistType04 = false;
    // 電子債権か判定フラグ
    $isExistType08 = false;
    // 手形送金料か判定フラグ
    $isExistType09 = false;
    // 振込手数料か判定フラグ
    $isExistTypeZ2 = false;
    // 振込手数料のデータ 振込レコードが複数の場合を考慮
    $arFeeRecord = [];

    foreach ($detailList as $detail) {
      // 銀行振込のデータを保持する
      if ($detail['bd_st_details_no'] === $DEP_MONEY_TYPE_03) {
        $isExistType03 = true;
      }
      // 手形のデータを保持する
      if ($detail['bd_st_details_no'] === $DEP_MONEY_TYPE_04 || $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_08) {
        $isExistType04 = true;
      }
      // 振込手数料のデータを保持する
      if ($detail['bd_st_details_no'] === $DEP_MONEY_TYPE_09 || $detail['bd_st_details_no'] === $FEE_TYPE) {
        $arFeeRecord[$detail['bd_st_details_no']] = $detail;
      }
    }

    // 並べ替えが必要かの判定フラグ（振込手数料あり & 銀行振込あり or 手形あり）
    $needsSort = ($isExistType03 || $isExistType04) && (count($arFeeRecord) > 0);

    $result = [];
    $i = 0;
    if ($needsSort) {
      // 銀行振込、手形、振込手数料がある場合は、各金種の後ろに手数料を表示する。
      if ($isExistType03 && $isExistType04) {
        foreach ($detailList as $detail) {
          // 銀行振込か判定
          $isMoneyType03 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_03;
          // 手形か判定
          $isMoneyType04 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_04;
          // 電子債権か判定
          $isMoneyType08 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_08;
          // 手形手数料か判定
          $isMoneyType09 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_09;
          // 振込手数料か判定
          $isFeeType = $detail['bd_st_details_no'] === $FEE_TYPE;

          if ($isMoneyType03) {
            array_push($result, $detail);
            if (array_key_exists('522', $arFeeRecord)) {
              array_push($result, $arFeeRecord['522']);
            }
          } else if ($isMoneyType04 || $isMoneyType08) {
            array_push($result, $detail);
            if (array_key_exists('559', $arFeeRecord)) {
              array_push($result, $arFeeRecord['559']);
            }
          } else if (!$isMoneyType09 && !$isFeeType) {
            array_push($result, $detail);
          }
        }
      }

      // 銀行振込、振込手数料がある場合は、銀行振込の後ろに振込手数料を表示する。
      else if ($isExistType03) {
        foreach ($detailList as $detail) {
          // 銀行振込か判定
          $isMoneyType03 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_03;
          // 振込手数料か判定
          $isFeeType = $detail['bd_st_details_no'] === $FEE_TYPE;

          if ($isMoneyType03) {
            array_push($result, $detail);
            if (array_key_exists('522', $arFeeRecord)) {
              array_push($result, $arFeeRecord['522']);
            }
          } else if (!$isFeeType) {
            array_push($result, $detail);
          }
        }
      }

      // 手形、振込手数料がある場合は、手形の後ろに振込手数料を表示する。
      else if ($isExistType04) {
        foreach ($detailList as $detail) {
          // 手形か判定
          $isMoneyType04 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_04;
          // 電子債権か判定
          $isMoneyType08 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_08;
          // 手形手数料か判定
          $isMoneyType09 = $detail['bd_st_details_no'] === $DEP_MONEY_TYPE_09;
          // 振込手数料か判定
          $isFeeType = $detail['bd_st_details_no'] === $FEE_TYPE;

          if ($isMoneyType04 || $isMoneyType08) {
            array_push($result, $detail);
            if (array_key_exists('522', $arFeeRecord)) {
              array_push($result, $arFeeRecord['522']);
            } else if (array_key_exists('559', $arFeeRecord)) {
              array_push($result, $arFeeRecord['559']);
            }
          } else if (!$isMoneyType09 && !$isFeeType) {
            array_push($result, $detail);
          }
        }
      }
    } else {
      $result = $detailList;
    }

    return $result;
  }

  /**
   * 専用の請求書用エクセル作成
   * $sdat:請求データ　$house:自社情報, $deposit:入金情報
   */
  public static function createBillFileForDedicated($sdat, $house, $deposit)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/Bill_dedicated.xlsx');
      // 1ページのレコード数
      $recordCnt = 10;
      // 文字列格納テンポラリー用
      $str = '';
      // シート名
      $sheetName = '';
      // 行数
      $row = 2;
      // レコード数
      $recNo = 1;
      // ページ数
      $pageNo = 1;
      // 明細レコードNo
      $subNo = 0;
      // 請求書番号
      $billNo = '';
      // 埋める文字　今回はスペース
      $padString = ' ';
      // 小計
      $tenSum = 0;
      // 外税消費税
      $taxSum = 0;
      // ページ計
      $pageSum = 0;
      // 受注番号毎の先頭2行判定用　1行目は客先注文No　2行目は備考(ともにヘッダの方)を記載するため。
      $recEstimate = 1;
      $estimateNo = '';
      // 合計
      $sum[] = '';
      $ccd = '';
      $OFFSET_TYPE = '5';       // 相殺
      $PRICEDOWN_TYPE = '6';     // 値引きコード
      $i = 0; //合計額管理用カウンタ
      $j = 0; //請求明細の現在件数管理用カウンタ
      // 内容を書き込み 
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndexByName('ヘッダ');

      // 入金情報のうち、値引きと繰越額を取得
      $price1 = 0;   // 相殺、値引き
      $price2 = 0;   // 登録されている繰越金額
      foreach ($deposit as $record) {
        if ($record['dp_customer_cd'] === $ccd) {
          if ($record['dp_type'] === $PRICEDOWN_TYPE || $record['dp_type'] === $OFFSET_TYPE) {
            // 相殺、値引き
            $price1 += $record['dp_price'];
          }
        }
      }
      // ヘッダ出力及び合計額算出
      $checkBillNo = "";
      $i = -1;
      foreach ($sdat as $record) {
        if ($checkBillNo != $record['bd_bill_no']) {
          $i++;
          $sheet->setCellValueByColumnAndRow(1, $row, $record['b_bill_no']);
          $sheet->setCellValueByColumnAndRow(2, $row, $record['C_FINALDAY']);
          $sheet->setCellValueByColumnAndRow(3, $row, $record['bd_bill_close_date']);
          $arr = self::convertToEra($record['bd_bill_close_date']);
          $sheet->setCellValueByColumnAndRow(4, $row, (int)$arr['year']);
          $sheet->setCellValueByColumnAndRow(5, $row, (int)$arr['month']);
          $sheet->setCellValueByColumnAndRow(6, $row, (int)$arr['date']);
          $sheet->setCellValueByColumnAndRow(7, $row, $house[0]['H_ADDRESS']);
          $sheet->setCellValueByColumnAndRow(8, $row, $house[0]['H_COMPANY_NAME']);
          $sheet->setCellValueByColumnAndRow(9, $row, $house[0]['H_TEL']);
          // $sheet->setCellValueByColumnAndRow(10, $row, $record['USER_NAME']);
          $sheet->setCellValueByColumnAndRow(11, $row, $record['b_customer_cd']);
          $sheet->setCellValueByColumnAndRow(12, $row, $record['b_customer_cd']);
          // 客先の宛名は、受注先。出荷元は関与しない。
          $sheet->setCellValueByColumnAndRow(13, $row, $record['C_CUSTOMER_NAME']);
          // 社名にリョーキも含んで登録しているため、リョーキを除く処理を入れる
          $sheet->setCellValueByColumnAndRow(14, $row, str_replace('株式会社リョーキ ', '', $record['C_CUSTOMER_NAME']));
          $sheet->setCellValueByColumnAndRow(15, $row, $record['C_ADDRESS_NO']);
          $zipno = explode("-", $record['C_ADDRESS_NO']);
          $sheet->setCellValueByColumnAndRow(16, $row, $zipno[0]);
          $sheet->setCellValueByColumnAndRow(17, $row, $zipno[1]);
          $address = str_replace(array(' ', '　'), '', $record['C_ADDRESS_01']) . str_replace(array(' ', '　'), '', $record['C_ADDRESS_02']);
          $sheet->setCellValueByColumnAndRow(18, $row, $address);
          $sheet->setCellValueByColumnAndRow(19, $row, $record['C_TEL']);
          $arr = self::splitTelephone($record['C_TEL']);
          $sheet->setCellValueByColumnAndRow(20, $row, $arr[0]);
          $sheet->setCellValueByColumnAndRow(21, $row, $arr[1]);
          $sheet->setCellValueByColumnAndRow(22, $row, $arr[2]);

          // 入金データ========================================================
          $sheet->setCellValueByColumnAndRow(23, $row, $record['b_before_bill']);
          $sheet->setCellValueByColumnAndRow(24, $row, $record['b_receive']);
          $sheet->setCellValueByColumnAndRow(25, $row, $price1);
          $price2 = $record['b_before_bill'] - $record['b_receive'] - $price1;
          $sheet->setCellValueByColumnAndRow(26, $row, $price2);
          $sheet->setCellValueByColumnAndRow(27, $row, $record['b_sales_price']);
          $sheet->setCellValueByColumnAndRow(28, $row, $record['b_tax']);
          $sheet->setCellValueByColumnAndRow(29, $row, $record['b_bill']);
          // ==================================================================
          $sheet->setCellValueByColumnAndRow(30, $row, $house[0]['H_BANK_CODE1']);
          $sheet->setCellValueByColumnAndRow(31, $row, $house[0]['H_BANK_NAME1']);
          $sheet->setCellValueByColumnAndRow(32, $row, $house[0]['H_BANK_BRANCH1']);
          $sheet->setCellValueByColumnAndRow(33, $row, $house[0]['H_BANK_BRANCH1_NAME']);
          $str = '';
          if ($house[0]['H_ACCOUNT_TYPE1'] === '1') {
            // 普通
            $str = '＝＝　　　';
          } else if ($house[0]['H_ACCOUNT_TYPE1'] === '2') {
            // 当座
            $str = '　　　＝＝';
          } else {
            // マスタ登録がない場合は普通口座
            $str = '＝＝　　　';
          }
          $sheet->setCellValueByColumnAndRow(34, $row, $str);
          $sheet->setCellValueByColumnAndRow(35, $row, $house[0]['H_ACCOUNT_NUMBER1']);
          $sheet->setCellValueByColumnAndRow(36, $row, $house[0]['H_ACCOUNT_NAME1']);
          $row++;
          $checkBillNo = $record['bd_bill_no'];
        }
        // 合計額
        $sum[$i] += ((int)$record['bd_price'] + (int)$record['bd_tax']);
      }
      //明細出力
      $sheet = $objPHPE->setActiveSheetIndexByName('明細');
      $row = 2;
      $i = 0;
      foreach ($sdat as $record) {
        if ($billNo !== '' && $billNo !== $record['bd_bill_no']) {
          $row++;
          // $recNo++;
          $i++;
          $tenSum = 0;
          $taxSum = 0;
          $pageSum = 0;
          $subNo = 0;
          $pageNo = 1;
          $recNo = 1;
        }
        if ($estimateNo !== '' && $estimateNo !== $record['bd_estimate_no']) {
          $recEstimate = 1;
        }
        //1回目か請求番号が異なるとき 枝番リセット
        $billNo = $record['bd_bill_no'];
        $estimateNo = $record['bd_estimate_no'];

        $sheet->setCellValueByColumnAndRow(1, $row, $record['b_bill_no']);
        $sheet->setCellValueByColumnAndRow(2, $row, $record['C_FINALDAY']);
        $sheet->setCellValueByColumnAndRow(3, $row, $record['bd_bill_close_date']);
        $arr = self::convertToEra($record['bd_bill_close_date']);
        $sheet->setCellValueByColumnAndRow(4, $row, (int)$arr['year']);
        $sheet->setCellValueByColumnAndRow(5, $row, (int)$arr['month']);
        $sheet->setCellValueByColumnAndRow(6, $row, (int)$arr['date']);
        $sheet->setCellValueByColumnAndRow(7, $row, $house[0]['H_ADDRESS']);
        $sheet->setCellValueByColumnAndRow(8, $row, $house[0]['H_COMPANY_NAME']);
        $sheet->setCellValueByColumnAndRow(9, $row, $house[0]['H_TEL']);
        // $sheet->setCellValueByColumnAndRow(10, $row, $record['salesman']);
        $sheet->setCellValueByColumnAndRow(11, $row, $record['b_customer_cd']);
        $sheet->setCellValueByColumnAndRow(12, $row, $record['b_customer_cd']);
        // 客先の宛名は、受注先。出荷元は関与しない。
        $sheet->setCellValueByColumnAndRow(13, $row, $record['C_CUSTOMER_NAME']);
        $sheet->setCellValueByColumnAndRow(14, $row, str_replace('株式会社リョーキ ', '', $record['C_CUSTOMER_NAME']));
        $sheet->setCellValueByColumnAndRow(15, $row, $record['C_ADDRESS_NO']);
        $zipno = explode("-", $record['C_ADDRESS_NO']);
        $sheet->setCellValueByColumnAndRow(16, $row, $zipno[0]);
        $sheet->setCellValueByColumnAndRow(17, $row, $zipno[1]);
        $address = str_replace(array(' ', '　'), '', $record['C_ADDRESS_01']) . str_replace(array(' ', '　'), '', $record['C_ADDRESS_02']);
        $sheet->setCellValueByColumnAndRow(18, $row, $address);
        $sheet->setCellValueByColumnAndRow(19, $row, $record['C_TEL']);
        $arr = self::splitTelephone($record['C_TEL']);
        $sheet->setCellValueByColumnAndRow(20, $row, $arr[0]);
        $sheet->setCellValueByColumnAndRow(21, $row, $arr[1]);
        $sheet->setCellValueByColumnAndRow(22, $row, $arr[2]);
        // }

        // 同一請求内連番	同一請求内伝票枚数
        $sheet->setCellValueByColumnAndRow(23, $row, $recNo);
        if ($sdat[$j + 1]['bd_bill_no'] != $record['bd_bill_no'] || !$sdat[$j + 1]['bd_bill_no']) {
          for ($k = 0; ($recNo - $k) >= 1; $k++) {
            $sheet->setCellValueByColumnAndRow(24, $row - $k, $pageNo);
          }
        }
        if ($recEstimate === 1) {
          $sheet->setCellValueByColumnAndRow(25 + $subNo, $row, $record['hdcustomerorderno']);
        } else if ($recEstimate === 2) {
          $sheet->setCellValueByColumnAndRow(25 + $subNo, $row, $record['hdremarks']);
        }
        // 上記以外は空表示

        // $sheet->setCellValueByColumnAndRow(25 + $subNo, $row, $record['hdcustomerorderno']);
        $sheet->setCellValueByColumnAndRow(35 + $subNo, $row, substr($record['bd_shipment_date'], 4, 2) . '/' . substr($record['bd_shipment_date'], 6, 2));
        $sheet->setCellValueByColumnAndRow(45 + $subNo, $row, self::makeStrBill01($record));
        $sheet->setCellValueByColumnAndRow(55 + $subNo, $row, self::makeStrBill02($record));
        // $sheet->setCellValueByColumnAndRow(65 + $subNo, $row, $record['bd_unit_tran']);
        if ($record['bd_unit_tran'] == '一式') {
          // 単位に一式が入っている場合には、数量1もしくは0を出さない。
          $sheet->setCellValueByColumnAndRow(75 + $subNo, $row, $record['bd_unit_tran']);
        } else {
          $sheet->setCellValueByColumnAndRow(75 + $subNo, $row, floor($record['bd_qty_delivery']) . $record['bd_unit_tran']);
        }
        $sheet->setCellValueByColumnAndRow(85 + $subNo, $row, str_pad($record['bd_unit_price'], 6, $padString, STR_PAD_LEFT));
        $sheet->setCellValueByColumnAndRow(95 + $subNo, $row, str_pad($record['bd_price'], 9, $padString, STR_PAD_LEFT));
        // 外税で固定=>現在使用してないので不要になった(2022/4/7)
        // $sheet->setCellValueByColumnAndRow(105 + $subNo, $row, '〇－－');

        // 明細計
        // 小計
        $tenSum += (int)$record['bd_price'];
        // 外税消費税
        $taxSum += (int)$record['bd_tax'];
        // ページ計
        $pageSum += ((int)$record['bd_price'] + (int)$record['bd_tax']);

        $sheet->setCellValueByColumnAndRow(115, $row, $tenSum);
        $sheet->setCellValueByColumnAndRow(116, $row, $taxSum);
        $sheet->setCellValueByColumnAndRow(117, $row, $pageSum);
        //合計額は各請求書Noの最終明細のみに記載する
        if (array_key_exists($j + 1, $sdat) && $sdat[$j + 1]['bd_bill_no'] != $record['bd_bill_no'] || !$sdat[$j + 1]['bd_bill_no']) {
          $sheet->setCellValueByColumnAndRow(118, $row, $sum[$i]);
        }
        $j++;
        $subNo++;
        $recEstimate++;

        if ($subNo % $recordCnt == 0) {
          $tenSum = 0;
          $taxSum = 0;
          $pageSum = 0;
          $row++;
          $recNo++;
          $subNo = 0;
          $pageNo++;
        }
      }

      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'リョーキ様請求書引継データ_' . date('Ymd'));
    } catch (Exception $e) {
      die();
    }
  }


  /**
   * LIXIL請求書を作成
   */
  public static function makeBillFileLIXIL($results, $housecompanyResults)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/template_bill_lixil.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);

      // ページ数
      $pageCount = 0;
      // 1ページの縦セル数
      $pageLength = 40;
      // 表示数
      $count = 0;
      // 列番号
      $row = 19;
      // 税抜金額
      $totalPrice = 0;
      // 消費税
      $totalTax = 0;
      // 税込金額
      $totalIncludeTax = 0;

      foreach ($results as $record) {
        // 客先名称にLIXILが含まれている、かつ有明 or 土浦 or 伊吹が含まれている場合
        if (preg_match("/(?=.*LIXIL)(?=.*(有明|土浦|伊吹))/", $record['C_CUSTOMER_NAME'])) {
          foreach ($housecompanyResults as $hcRecord) {
            // 会計整理月 + 1ヵ月を取得（YYYYMM）
            $hAccontingNextMonth = self::addMonth($hcRecord['H_ACCONTING_MONTH'] . '01', 1);

            // 請求Noの先頭4文字、会計整理月 + 1ヵ月の値が一致する場合
            if (substr($record['bd_bill_no'], 0, 4) === substr($hAccontingNextMonth, 2, 4)) {
              // 既に20件表示済みの場合、次ページを作成
              if ($count === 20) {
                $count = 0;
                $row = 19;
                // ページコピー
                self::copyRows($sheet, $pageCount * $pageLength + 1, ($pageCount + 1) * $pageLength + 1, 11, $pageLength);
                $pageCount++;
                // データクリア
                for ($i = 0; $i < 20; $i++) {
                  $resetRow = $row + $i;
                  // 納品先事業所
                  $sheet->setCellValueByColumnAndRow(5, $resetRow + $pageCount * $pageLength, '');
                  // 摘要
                  $sheet->setCellValueByColumnAndRow(6, $resetRow + $pageCount * $pageLength, '');
                  // 金額
                  $sheet->setCellValueByColumnAndRow(7, $resetRow + $pageCount * $pageLength, '');
                  // 消費税
                  $sheet->setCellValueByColumnAndRow(8, $resetRow + $pageCount * $pageLength, '');
                  // 請求額
                  $sheet->setCellValueByColumnAndRow(9, $resetRow + $pageCount * $pageLength, '');
                }
                // 改ページ
                $sheet->setBreakByColumnAndRow(1, 40, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
              }

              // 1枚目の場合のみ、日付を設定する。（2枚目以降はコピーしているので設定不要）
              if ($count === 0) {
                // 請求書（〇月度）の設定
                $billMonth = ltrim(substr($hAccontingNextMonth, 4), '0');
                $sheet->setCellValueByColumnAndRow(3, 4, '請   求   書  （' . $billMonth . '月度）');

                // 現在日付を取得、「〇年〇月〇日」形式にフォーマット
                $date = new DateTime(Plannerdbmgr::currentDate());
                $currentDate = $date->format('Y') . '年 ' . $date->format('m') . '月 ' . $date->format('d') . '日';
                $sheet->setCellValueByColumnAndRow(9, 5, $currentDate);

                // 自社住所の画像表示
                self::makeImage('Address', 'Address', './template/logo/takenaka_address_bill_lixil.png', 7, 6 + $pageCount * $pageLength, 0, 20, 335, 150)->setWorksheet($sheet);
              }

              // 納品先事業所
              $sheet->setCellValueByColumnAndRow(5, $row + $pageCount * $pageLength, $record['s_delivery_cd'] ? $record['CP_POST_NAME'] : $record['C_CUSTOMER_NAME']);

              // 摘要
              $sheet->setCellValueByColumnAndRow(6, $row + $pageCount * $pageLength, $record['s_remarks']);

              // 金額
              $sheet->setCellValueByColumnAndRow(7, $row + $pageCount * $pageLength, $record['bd_delivery_price']);
              $totalPrice += $record['bd_delivery_price'];

              // 消費税
              $sheet->setCellValueByColumnAndRow(8, $row + $pageCount * $pageLength, $record['bd_tax']);
              $totalTax += $record['bd_tax'];

              // 請求額
              $sheet->setCellValueByColumnAndRow(9, $row + $pageCount * $pageLength, $record['bd_bill_price']);
              $totalIncludeTax += $record['bd_bill_price'];

              $row++;
              $count++;
            }
          }
        }
      }

      // 合計（御買上高合計、金額）
      $sheet->setCellValueByColumnAndRow(7, 15 + $pageCount * $pageLength, $totalPrice);
      $sheet->setCellValueByColumnAndRow(7, 39 + $pageCount * $pageLength, $totalPrice);

      // 合計（消費税）
      $sheet->setCellValueByColumnAndRow(8, 15 + $pageCount * $pageLength, $totalTax);
      $sheet->setCellValueByColumnAndRow(8, 39 + $pageCount * $pageLength, $totalTax);

      // 合計（御請求額、請求額）
      $sheet->setCellValueByColumnAndRow(9, 15 + $pageCount * $pageLength, $totalIncludeTax);
      $sheet->setCellValueByColumnAndRow(9, 39 + $pageCount * $pageLength, $totalIncludeTax);

      $outputCell = ($pageCount + 1) * $pageLength;
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:K' . ($pageCount + 1) * $pageLength);
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'LIXIL請求書' . '_' . Plannerdbmgr::currentDate(), true);
    } catch (Exception $e) {
      throw $e;
    }
  }

  /**
   * 材料ミルシート出力
   */
  public static function makeMaterialMillSheet($results)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objPHPE = $objReader->load('./template/template_material_mill_sheet.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);

      // ページ数
      $pageCount = 0;
      // 1件目の縦セル数
      $firstSheetLength = 23;
      // 2件目の縦セル数
      $secondSheetLength = 23;
      // 1ページの縦セル数
      $pageLength = $firstSheetLength + $secondSheetLength;

      // 表示数
      $count = 0;

      foreach ($results as $record) {
        $row = ($pageCount * $pageLength) + ($count * $firstSheetLength);
        // 既に2件表示済みの場合、次ページを作成
        if ($count === 2) {
          $count = 0;

          // ページコピー
          self::copyRows($sheet, $pageCount * $pageLength + 1, ($pageCount + 1) * $pageLength + 1, 12, $pageLength);
          $pageCount++;
          // データクリア
          for ($i = 0; $i < 2; $i++) {
            $resetRow = ($pageCount * $pageLength) + ($i * $firstSheetLength);
            // 出荷日
            $sheet->setCellValueByColumnAndRow(9, 1 + $resetRow, '年　　　月　　　日');

            // 客先名
            $sheet->setCellValueByColumnAndRow(1, 4 + $resetRow, '御中');

            // 客先担当者名
            $sheet->setCellValueByColumnAndRow(1, 6 + $resetRow, '様');

            // 受注日
            $sheet->setCellValueByColumnAndRow(6, 13 + $resetRow, '');

            // 客先担当者名
            $sheet->setCellValueByColumnAndRow(6, 14 + $resetRow, '');

            // 受注番号
            $sheet->setCellValueByColumnAndRow(6, 15 + $resetRow, '');

            // 材質
            $sheet->setCellValueByColumnAndRow(6, 16 + $resetRow, '');

            // 品名
            $sheet->setCellValueByColumnAndRow(6, 17 + $resetRow, '');

            // 規格
            $sheet->setCellValueByColumnAndRow(6, 18 + $resetRow, '');

            // 部数
            $sheet->setCellValueByColumnAndRow(6, 20 + $resetRow, '');
          }
          // 改ページ
          $sheet->setBreakByColumnAndRow(1, 46, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }

        // 自社住所の画像表示
        self::makeImage('Address', 'Address', './template/logo/takenaka_address.png', 8, 4 + $row, 30, 5, 300, 70)->setWorksheet($sheet);

        // 自社名の画像表示
        self::makeImage('Name', 'Name', './template/logo/takenaka_logo.png', 8, 2 + $row, 30, 5, 300, 30)->setWorksheet($sheet);

        // 自社名（英語）の画像表示
        self::makeImage('Name_EN', 'Name_EN', './template/logo/takenaka_name_en.png', 6, 22 + $row, 0, 5, 230, 25)->setWorksheet($sheet);

        // 出荷日
        $sheet->setCellValueByColumnAndRow(9, 1 + $row, self::formatStrToDate2($record['s_shipping_date'], 'Y年　　n月　　j日'));

        // 客先名
        $customerName = isset($record['C_CUSTOMER_NAME']) ? $record['C_CUSTOMER_NAME'] : '';
        $sheet->setCellValueByColumnAndRow(1, 4 + $row,  $customerName . ' 御中');

        // 客先担当者名
        $chargeName = isset($record['CC_CHARGE_NAME']) ? $record['CC_CHARGE_NAME'] : '';
        $sheet->setCellValueByColumnAndRow(1, 6 + $row, $chargeName . ' 様');

        // 受注日
        $sheet->setCellValueByColumnAndRow(6, 13 + $row, self::formatStrToDate($record['s_estimate_date']));

        // 客先担当者名
        $sheet->setCellValueByColumnAndRow(6, 14 + $row, $chargeName);

        // 受注番号
        $sheet->setCellValueByColumnAndRow(6, 15 + $row, $record['s_estimate_no']);

        // 材質
        $materialName = isset($record['m_name']) ? $record['m_name'] : '';
        $sheet->setCellValueByColumnAndRow(6, 16 + $row, $materialName);

        // 品名
        $sheet->setCellValueByColumnAndRow(6, 17 + $row, ltrim($record['sd_p_name']));

        // 規格
        $sheet->setCellValueByColumnAndRow(6, 18 + $row, $record['sd_p_name_supple']);

        // 部数
        $sheet->setCellValueByColumnAndRow(6, 20 + $row, '2');

        $count++;
      }

      $outputCell = ($pageCount + 1) * $pageLength;
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:K' . ($pageCount + 1) * $pageLength);
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, '材料ミルシート' . '_' . Plannerdbmgr::currentDate(), true);
    } catch (Exception $e) {
      throw $e;
    }
  }


  /**
   * チャーター用送状発行
   */
  public static function makeCharterInvoice($results)
  {
    require_once 'vendor/autoload.php';
    try {
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');

      // 出荷主が存在するか判定
      $isExistShipper = false;
      foreach ($results as $record) {
        if (isset($record['s_shipper_cd']) && $record['s_shipper_cd']) {
          if (strpos($record['CP_SHIPPER_NAME'], '竹中金網') !== false) {
            $isExistShipper = false;
          } else {
            $isExistShipper = true;
          }
        }
      }

      // 出荷主が存在する場合、出荷主記載用のテンプレートを使用
      $templatePath = $isExistShipper ? './template/template_charter_invoice_other.xlsx' : './template/template_charter_invoice_takenaka.xlsx';
      $objPHPE = $objReader->load($templatePath);

      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);

      // 合計数量
      $totalNum = 0;

      // 合計単位
      $totalUnit = '';

      // 取引単位がすべて同じか判定
      $isSameUnit = true;

      // 件数
      $count = 0;

      $companyName = '';

      $beforeProductName = '';
      $beforeSpec = '';
      $arrangementName = '';

      foreach ($results as $record) {
        if ($count === 0) {
          // 出荷主情報
          if ($isExistShipper) {
            // 出荷主　御届先
            $shipperNameList = isset($record['CP_SHIPPER_NAME']) ? explode(' ', $record['CP_SHIPPER_NAME'], 3) : [];
            if (count($shipperNameList) > 1) {
              $companyName = $shipperNameList[0] . ' ' . $shipperNameList[1];
            } else if (count($shipperNameList) === 1) {
              $companyName = $shipperNameList[0];
            }
            // $companyName = count($shipperNameList) > 1 ? $shipperNameList[0] . ' ' . $shipperNameList[1] : '';
            $sheet->setCellValueByColumnAndRow(6, 5, $companyName);

            // 出荷主　住所
            // $shipperAdderess01 = isset($record['CP_SHIPPER_ADDRESS_01']) ? str_replace(array(' ', '　'), '', $record['CP_SHIPPER_ADDRESS_01']) : '';
            $shipperAdderess01 = isset($record['CP_SHIPPER_ADDRESS_01']) ? self::trimSpaceForCustomerAddress($record['CP_SHIPPER_ADDRESS_01']) : '';
            $shipperAdderess02 = isset($record['CP_SHIPPER_ADDRESS_02']) ? $record['CP_SHIPPER_ADDRESS_02'] : '';
            $sheet->setCellValueByColumnAndRow(6, 7, $shipperAdderess01 . $shipperAdderess02);

            // 出荷主　御担当者
            $chargeName = count($shipperNameList) > 2 ? $shipperNameList[2] : '';
            $sheet->setCellValueByColumnAndRow(10, 8, '担当:' . $chargeName);

            // 出荷主　TEL
            $deliveryTel = isset($record['CP_SHIPPER_TEL']) ? $record['CP_SHIPPER_TEL'] : '';
            $sheet->setCellValueByColumnAndRow(6, 8, 'TEL:' . $deliveryTel);
          }

          // 発行日=出荷日
          $shippingPlanDate = isset($record['s_shipping_plan_date']) ? self::formatStrToDate2($record['s_shipping_plan_date']) : '';
          // $sheet->setCellValueByColumnAndRow(9, 3, self::formatStrToDate2(Plannerdbmgr::currentDate()));
          $sheet->setCellValueByColumnAndRow(9, 3, self::formatStrToDate2($shippingPlanDate));

          // 納入日
          // $desiredDeliveryDate = isset($record['s_desired_delivery_date']) ? $record['s_desired_delivery_date'] : '';
          // $sheet->setCellValueByColumnAndRow(3, 3, self::formatStrToDate2($desiredDeliveryDate));

          // 納入先　住所
          // $deliveryAdderess01 = isset($record['CP_DELIVERY_ADDRESS_01']) ? str_replace(array(' ', '　'), '', $record['CP_DELIVERY_ADDRESS_01']) : '';
          $deliveryAdderess01 = isset($record['CP_DELIVERY_ADDRESS_01']) ? self::trimSpaceForCustomerAddress($record['CP_DELIVERY_ADDRESS_01']) : '';
          $deliveryAdderess02 = isset($record['CP_DELIVERY_ADDRESS_02']) ? $record['CP_DELIVERY_ADDRESS_02'] : '';
          $sheet->setCellValueByColumnAndRow(3, 5, $deliveryAdderess01 . $deliveryAdderess02);

          // 納入先　御届先
          $deliveryNameList = isset($record['CP_DELIVERY_NAME']) ? explode(' ', $record['CP_DELIVERY_NAME'], 3) : [];
          $companyName = count($deliveryNameList) > 0 ? $deliveryNameList[0] . ' ' . $deliveryNameList[1] : '';
          $sheet->setCellValueByColumnAndRow(3, 6, $companyName);

          // 納入先　御担当者
          $customerName = count($deliveryNameList) > 2 ? $deliveryNameList[2] : '';
          $sheet->setCellValueByColumnAndRow(3, 7, $customerName);

          // 納入先　TEL
          $deliveryTel = isset($record['CP_DELIVERY_TEL']) ? $record['CP_DELIVERY_TEL'] : '';
          $sheet->setCellValueByColumnAndRow(3, 8, $deliveryTel);

          // 管理番号
          $estimateNo = isset($record['s_estimate_no']) ? $record['s_estimate_no'] : '';
          $sheet->setCellValueByColumnAndRow(3, 12, $estimateNo);

          // 出荷日
          // $shippingPlanDate = isset($record['s_shipping_plan_date']) ? self::formatStrToDate2($record['s_shipping_plan_date']) : '';
          $sheet->setCellValueByColumnAndRow(3, 13, $shippingPlanDate);
        }

        // 4件以上存在する場合
        if ($count >= 3) {
          $isSameUnit = false;

          // 明細の設定値をリセット
          for ($i = 0; $i < 9; $i++) {
            $sheet->setCellValueByColumnAndRow(2, 15 + $i, '');
            $sheet->setCellValueByColumnAndRow(5, 15 + $i, '');
            $sheet->setCellValueByColumnAndRow(6, 15 + $i, '');
            $sheet->setCellValueByColumnAndRow(7, 15 + $i, '');
          }

          //  枝番01の合計数量
          $subNo01TotalNum = 0;

          // 枝番01の品名、線形×目合のみ表示する
          foreach ($results as $sdRecord) {
            if ($sdRecord['sd_shipment_sub_no'] === '01') {
              // 寸法を取得
              $productSpec = self::makeArrayProductSpec($sdRecord);

              // 品名
              $productName = $record['sd_customer_p_name'] ? $record['sd_customer_p_name'] : $record['sd_p_name'];
              $productName = ltrim($productName);

              $arrangementName = $record['ar_name'] === 'なし' ? '' : $record['ar_name'];
              $sheet->setCellValueByColumnAndRow(2, 15, $productName . ' ' . $arrangementName);
              $beforeProductName = $productName;

              // 寸法
              $sheet->setCellValueByColumnAndRow(2, 16, $productSpec[1]);
              $beforeSpec = $productSpec[1];
              // 合計数量計算
              $subNo01TotalNum += $sdRecord['sd_qty_delivery'] ? $sdRecord['sd_qty_delivery'] : 0;
            }
          }

          // 数量欄に合計数量を表示
          $sheet->setCellValueByColumnAndRow(5, 16, $subNo01TotalNum);
          break;
        } else { // 4件未満の場合
          // 品名
          $productName = $record['sd_customer_p_name'] ? $record['sd_customer_p_name'] : $record['sd_p_name'];
          $productName = ltrim($productName);

          $arrangementName = $record['ar_name'] === 'なし' ? '' : $record['ar_name'];
          $sheet->setCellValueByColumnAndRow(2, 15 + $count * 3, $productName . ' ' . $arrangementName);


          // 製品名が一致するか判定
          if ($beforeProductName === ltrim($record['sd_p_name'])) {
            $productSpec = self::makeArrayProductSpec($record);
            if ($beforeSpec === $productSpec[1]) {
              // 線径目合が一緒なので、寸法の未表示
              $sheet->setCellValueByColumnAndRow(2, 16 + $count * 3, $productSpec[2]);
            }
          } else {
            $sheet->setCellValueByColumnAndRow(2, 16 + $count * 3, $record['sd_p_name_supple']);
          }

          // 数量
          $sheet->setCellValueByColumnAndRow(5, 16 + $count * 3, $record['sd_qty_delivery']);

          // 単位
          $sheet->setCellValueByColumnAndRow(6, 16 + $count * 3, $record['sd_unit_tran']);

          // 備考 1行目
          $customerOrderNumberList = explode('_', $record['sd_customer_order_no'], 2);
          $sheet->setCellValueByColumnAndRow(7, 15 + $count * 3, isset($customerOrderNumberList[0]) ? $customerOrderNumberList[0] : '');

          // 備考 2行目
          $sheet->setCellValueByColumnAndRow(7, 16 + $count * 3, isset($customerOrderNumberList[1]) ? $customerOrderNumberList[1] : '');

          // 納品明細の単位が同じか判定
          if ($count === 0) {
            $totalUnit = $record['sd_unit_tran'];
          } else {
            if ($totalUnit !== $record['sd_unit_tran']) {
              $isSameUnit = false;
            }
          }

          $totalNum += $record['sd_qty_delivery'] ? $record['sd_qty_delivery'] : 0;
          $count++;
        }
      }

      if ($isSameUnit) {
        // 合計数量
        $sheet->setCellValueByColumnAndRow(5, 24, $totalNum);

        // 合計単位
        $sheet->setCellValueByColumnAndRow(6, 24, $totalUnit);
      }

      // // 備考　固定の備考表示に変更
      // $remarks = isset($record['s_remarks']) ? $record['s_remarks'] : '';
      // $sheet->setCellValueByColumnAndRow(3, 25, $remarks);

      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:P29');
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, 'チャーター用送状' . '_' . Plannerdbmgr::currentDate(), true);
    } catch (Exception $e) {
      throw $e;
    }
  }

  /**
   * 請求一覧シート出力
   */
  public static function createCheckBillSheet($item)
  {
    require_once 'vendor/autoload.php';
    try {
      // // 処理時間を延長
      ini_set('max_execution_time', 60000);
      // テンプレートファイルを読込
      $objReader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
      $objReader->setIncludeCharts(true);
      $objPHPE = $objReader->load('./template/CheckBillData.xlsx');
      // 内容を書き込み
      $objPHPE->getActiveSheet();
      $sheet = $objPHPE->setActiveSheetIndex(0);
      // 書式設定(セル塗りつぶし)
      $objStyle = $sheet->getStyle('A3:K4');
      $objFill = $objStyle->getFill();
      $objFill->getStartColor()->setARGB('BDD7EE');

      // ページ数
      $pageCount = 0;
      // 1ページの縦セル数
      $pageLength = 26;
      // 1顧客の行数
      $rowLength = 2;
      // 表示数
      $count = 0;
      // 列番号
      $row = 5;
      // 1ページの表示客先数
      $countPerPage = 11;

      $sheet->setCellValueByColumnAndRow(11, 1, date('Y/m/d'));

      foreach ($item as $record) {
        $sheet->setCellValueByColumnAndRow(1, $row, $record['closedate']);
        $sheet->setCellValueByColumnAndRow(2, $row, $record['b_customer_cd']);
        $sheet->setCellValueByColumnAndRow(3, $row, $record['C_CUSTOMER_NAME']);
        // 2023/2/22　↓レイアウト調整による修正↓
        $sheet->setCellValueByColumnAndRow(4, $row, $record['beforebillno']);
        $sheet->setCellValueByColumnAndRow(5, $row, $record['sumprice1']);
        $sheet->setCellValueByColumnAndRow(6, $row, $record['sumprice2']);
        $sheet->setCellValueByColumnAndRow(7, $row, $record['sumprice3']);
        $sheet->setCellValueByColumnAndRow(8, $row, $record['sumprice4']);
        $sheet->setCellValueByColumnAndRow(9, $row, $record['sumprice5']);
        $sheet->setCellValueByColumnAndRow(10, $row, $record['sumprice6']);
        $sheet->setCellValueByColumnAndRow(11, $row, $record['sumprice8']);
        $sheet->setCellValueByColumnAndRow(4, $row + 1, $record['beforeprice']);
        $sheet->setCellValueByColumnAndRow(5, $row + 1, $record['sumpriceZ1']);
        $sheet->setCellValueByColumnAndRow(6, $row + 1, $record['sumpriceZ2']);
        $sheet->setCellValueByColumnAndRow(7, $row + 1, $record['carriedprice']);
        $sheet->setCellValueByColumnAndRow(8, $row + 1, $record['billprice']);
        $sheet->setCellValueByColumnAndRow(9, $row + 1, $record['billtax']);
        $sheet->setCellValueByColumnAndRow(10, $row + 1, $record['thisbillprice']);
        $sheet->setCellValueByColumnAndRow(11, $row + 1, $record['billstatus']);
        $row += 2;
        $count += 1;
        if ($count === $countPerPage) {
          $count = 0;
          // ページコピー ヘッダを利用して表示するので固定で指定
          self::copyRows($sheet, 5, ($pageCount + 1) * $pageLength + 1, 12, $pageLength);
          $pageCount++;
          // データクリア 2ページから記入できる客数が増えるので+2が最大とする
          for ($i = 0; $i < $countPerPage + 2; $i++) {
            $resetRow = ($pageCount * $pageLength) + ($i * $rowLength) + 1;

            $sheet->setCellValueByColumnAndRow(1, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(2, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(3, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(4, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(5, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(6, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(7, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(8, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(9, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(10, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(11, $resetRow, '');
            $sheet->setCellValueByColumnAndRow(4, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(5, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(6, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(7, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(8, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(9, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(10, $resetRow + 1, '');
            $sheet->setCellValueByColumnAndRow(11, $resetRow + 1, '');
          }
          // 改ページ
          // $sheet->setBreakByColumnAndRow(1, 46, \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
        }
      }

      $outputCell = ($pageCount + 1) * $pageLength;
      // 印刷時設定
      $objPHPE->getActiveSheet()
        ->getPageSetup()
        ->setPrintArea('A1:K' . ($pageCount + 1) * $pageLength);
      $objPHPE->setActiveSheetIndex(0);
      // クライアント側に出力
      self::outputToBrowser($objPHPE, '請求一覧' . '_' . Plannerdbmgr::currentDate(), true);
    } catch (Exception $e) {
      throw $e;
    }
  }

  /**
   * 電話番号を分割
   */
  private static function splitTelephone($telno)
  {
    $arr = [];
    if ($telno === null || $telno === '') {
      $arr[0] = '';
      $arr[1] = '';
      $arr[2] = '';
    } else {
      if (strpos($telno, '-')) {
        $arr = explode('-', $telno);
      } else {
        $arr[0] = substr($telno, 0, 4);
        $arr[1] = substr($telno, 5, 6);
        $arr[2] = substr($telno, 7, 10);
      }
    }
    return $arr;
  }

  /**
   * 特殊請求書用　規格文字列　上側
   */
  private static function makeStrBill01($record)
  {
    $ar = self::makeArrayProductSpec($record);
    if ($record['ar_name'] === 'なし' || !isset($record['ar_name']) || $record['ar_name'] === '') {
      $ar = $ar[0] . ' ' . $ar[1];
    } else {
      $ar = $ar[0] . ' ' . $record['ar_name'] . ' ' . $ar[1];
    }
    return $ar;
  }

  /**
   * 特殊請求書用　規格文字列　下側
   */
  private static function makeStrBill02($record)
  {
    $ar = self::makeArrayProductSpec($record);
    $ar = $ar[2];
    return $ar;
  }

  /**
   * 1レコード毎の製品規格文字列を作成　線番が設定されている場合は「＃線番」で表記
   * logic.jsのmakeStrProductStandardと同様処理なので、修正時は注意
   * こちらは、品名補足印字内容の文字列のみ取得する。品名に入っているアンダーバー対応はしていないので注意
   */
  private static function makeStrProductSpec($record)
  {
    $str = '';
    if ($record['p_type_subject'] === 1) {
      // 製造した品でない場合は記入しない
      return $str;
    }
    if ($record['sub01'] === null || $record['sub01'] === '') {
      // 線径1がセットされていない場合は寸法へ進む
    } else {
      // 縦線・横線
      if ($record['sub12'] != null || $record['sub13'] != null) {
        // 平線の場合
        if (($record['sub01'] === $record['sub02']) && ($record['sub12'] === $record['sub13'])) {
          // 縦横同じ厚みt,幅Wならばsub01のみ表示
          $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
        } else if ($record['sub02'] === '' || $record['sub02'] === null) {
          // 縦横同じ設定と同意
          $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
        } else {
          $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'] . '×' . 't' . $record['sub13'] . '×' . 'W' . $record['sub02'];
        }
      } else {
        // 丸線の場合
        // 線番表記の場合を考慮に入れる
        if ($record['sub01'] === $record['sub02']) {
          $str = 'φ' . $record['sub01'];
        } else if ($record['sub02'] === null || $record['sub02'] === '') {
          $str = 'φ' . $record['sub01'];
        } else {
          $str = 'φ' . $record['sub01'] . '×' . $record['sub02'];
        }
      }
      // 目合
      // 目合区分＋目合＋目合単位
      if ($record['sub04'] === $record['sub05']) {
        if ($record['sub03'] != null || $record['sub03'] != ' ') {
          // 目合区分
          $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
        } else {
          $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
        }
      } else if ($record['sub05'] != null || $record['sub05'] != '') {
        if ($record['sub03'] != null || $record['sub03'] != ' ') {
          // 目合区分
          $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
        } else {
          $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
        }
      } else {
        if ($record['sub03'] != null || $record['sub03'] != ' ') {
          $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . '×' . $record['sub03'] . $record['sub05'] . $record['sub06'] . ' ';
        } else {
          $str .= '×' . $record['sub04'] . $record['sub06'] . '×' . $record['sub05'] . $record['sub06'] . ' ';
        }
      }
    }
    // 寸法 円切の場合は寸法②がないため
    if ($record['sub08'] != null) {
      $str .= $record['sub08'];
      if ($record['sub10'] != null) {
        $str .= $record['sub10'];
      }
    }
    if ($record['sub09'] != null) {
      $str .= '×' . $record['sub09'];
      if ($record['sub11'] != null) {
        $str .= $record['sub11'];
      }
    }
    return $str;
  }

  /**
   * 品名規格：線径×目合と寸法を配列保持
   * 各sub項目をsub01～sub13に置換。指定されている品名をproductnameに設定。線番をwirenoに設定。
   * ar 0:品名
   * ar 1:規格
   * ar 2:寸法
   */
  public static function makeArrayProductSpec($record)
  {
    $str = '';
    $ar = [];
    $temp = [];
    $flgProc = false;

    // 金網→品名に規格含む製品の順で規格取得
    if ($record['p_type'] === '100' || isset($record['moed_product_cd']) || isset($record['ed_p_cd']) || isset($record['sr_p_cd']) || isset($record['productcd'])) {
      // 金網
      // 社内品名を取得し、客先品名があれば上書き
      if (strpos($record['productname'], '_') !== false) {
        $temp = explode('_', $record['productname']);
        $ar[0] = ltrim($temp[0]);
        $flgProc = true;
      } else {
        $ar[0] = ltrim($record['productname']);
      }
      if ($record['customerpname'] !== '') {
        if (strpos($record['customerpname'], '_') !== false) {
          $temp = explode('_', $record['customerpname']);
          $ar[0] = $temp[0];
          $flgProc = true;
        } else {
          $ar[0] = $record['customerpname'];
        }
      }
      // if ($record['sub01'] !== '') {
      if (!$flgProc) {
        // 品名に規格を含まない場合
        if (!self::checkEmptyOrZero($record['sub01'])) {
          // 線径指定有
          if ((!self::checkEmptyOrZero($record['sub12'])) || (!self::checkEmptyOrZero($record['sub13']))) {
            // 平線の場合
            if (($record['sub01'] === $record['sub02']) && ($record['sub12'] === $record['sub13'])) {
              // 縦横同じ厚みt,幅Wならばsub01のみ表示
              $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
            } else if (!self::checkEmptyOrZero($record['sub02'])) {
              // 縦横同じ設定と同意
              $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
            } else {
              $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'] . '×' . 't' . $record['sub13'] . '×' . 'W' . $record['sub02'];
            }
          } else {
            // 丸線で線径指定の場合
            if (isset($record['wireno']) && (int)$record['wireno'] > 0) {
              // 線径も線番も指定されている場合は線番優先
              $str = '#' . floor($record['wireno']);
            } else if ($record['sub01'] === $record['sub02']) {
              $str = 'φ' . $record['sub01'];
            } else if ($record['sub02'] === '') {
              $str = 'φ' . $record['sub01'];
            } else {
              $str = 'φ' . $record['sub01'] . '×' . $record['sub02'];
            }
          }
        } else if (isset($record['wireno']) && (int)$record['wireno'] > 0) {
          // 線番指定有
          $str = '#' . floor($record['wireno']);
        }
        // 設定なしは無視

        // 目合区分＋目合＋目合単位
        if (isset($record['sub04'])  && $record['sub04'] !== '' && !self::checkEmptyOrZero($record['sub04'])) {
          // 目合が設定されている場合
          if ($record['sub04'] === $record['sub05']) {
            // 目合①と目合②が同じ場合
            if ($record['sub03'] !== '') {
              // 目合区分
              $str .= '×' . $record['sub03'] . (strpos($record['sub04'], '.0') ? intval($record['sub04']) : $record['sub04']) . $record['sub06'] . ' ';
            } else {
              $str .= '×' . $record['sub03'] . (strpos($record['sub04'], '.0') ? intval($record['sub04']) : $record['sub04']) . $record['sub06'] . ' ';
            }
          } else if (self::checkEmptyOrZero($record['sub05'])) {
            // 目合②が空の場合
            if ($record['sub03'] != null || $record['sub03'] != ' ') {
              // 目合区分
              $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
            } else {
              $str .= '×' . $record['sub03'] . (strpos($record['sub04'], '.0') ? intval($record['sub04']) : $record['sub04']) . $record['sub06'] . ' ';
            }
          } else {
            // 縦横で線が異なる場合
            if ($record['sub03'] !== '') {
              $str .= '×' . $record['sub03'] . (strpos($record['sub04'], '.0') ? intval($record['sub04']) : $record['sub04']) . $record['sub06'] . '×' . $record['sub03'] . (strpos($record['sub05'], '.0') ? intval($record['sub05']) : $record['sub05']) . $record['sub06'] . ' ';
            } else {
              $str .= '×' . (strpos($record['sub04'], '.0') ? intval($record['sub04']) : $record['sub04']) . $record['sub06'] . '×' . (strpos($record['sub05'], '.0') ? intval($record['sub05']) : $record['sub05']) . $record['sub06'] . ' ';
            }
          }
          // 規格文字列から半角スペースを除く。
          $str = preg_replace("/( |　)/", "", $str);
        }
      }
    }
    if ($str === '') {
      // 金網で規格なし　OR　金網でない製品
      if (($record['customerpname']) !== '' && isset($record['customerpname'])) {
        // if (($record['customerpname'] !== '') && (strpos($record['customerpname'], '_') !== false) ) {
        // 客先品名優先
        $arr1 = explode('_', $record['customerpname']);
        // 品名取得
        $ar[0] = $arr1[0];
        $str = $arr1[1];
      } else if (($record['p_name'] !== '') && (strpos($record['p_name'], '_') !== false)) {
        // 自社品名
        $arr1 = explode('_', $record['p_name']);
        // 品名取得
        $ar[0] = ltrim($arr1[0]);
        $str = $arr1[1];
      } else if ($record['productname'] !== '') {
        $ar[0] = ltrim($record['productname']);
        $str = '';
      } else {
        $ar[0] = ltrim(isset($ar[0]) ? $ar[0] : '');
        $str = '';
      }
    }
    // 規格
    $ar[1] = $str;
    // その他は規格空文字
    // 寸法 円切の場合は寸法②がないためそれぞれ存在確認
    $str = '';   // リセット
    if (!self::CheckEmptyOrZero($record['sub08'])) {
      $str = $record['sub08'];
    }

    if (!self::CheckEmptyOrZero($record['sub10'])) {
      $str .= $record['sub08'] ? ' ' . $record['sub10'] : $record['sub10'];
    }

    if ($str && (!self::CheckEmptyOrZero($record['sub08']) && !self::CheckEmptyOrZero($record['sub09']))) {
      $str .= '×';
    }

    if (!self::CheckEmptyOrZero($record['sub09'])) {
      $str .= $record['sub09'];
    }

    if (!self::CheckEmptyOrZero($record['sub11'])) {
      $str .= $str !== '' ? ' ' . $record['sub11'] : $record['sub11'];
      // $str .= $record['sub09'] ? ' ' . $record['sub11'] : $record['sub11'];
      // $str .= ' ' . $record['sub11'];
    }

    if ($str === '') {
      // 品名に含まれる場合、寸法として取得
      if (array_key_exists('ed_customer_p_name', $record)) {
        // if (isset($record['ed_customer_p_name'])) {
        $arr1 = mb_strstr($record['ed_customer_p_name'], '_');
        if ($arr1[2] !== '') {
          $str = $arr1[2];
        }
      }
    }
    $ar[2] = $str;

    // 発注データの時は、サイズ①に文字列が連結されたものが既に入っているため、文字列の再合成はしない。(円切、ドーナツ切りなどのケース) 
    if (strpos($str, 'φ') !== false && isset($record['moed_product_cd'])) {
      return $ar;
    }

    // 加工内容が「円切り」かつ寸法1, 2が同値の場合、「φ寸法1」を設定
    if ((strpos($record['ar_name'], '円切り') !== false) && (strpos($record['ar_name'], '楕円切り') === false) && (strpos($record['ar_name'], '半円切り') === false)) {
      if (isset($record['sub08']) && isset($record['sub09']) && $record['sub08'] === $record['sub09']) {

        $ar[2] = ' φ' . $record['sub08'];

        if ($record['sub10']) {
          $ar[2] .= ' ' . $record['sub10'];
        }

        if ($record['sub11']) {
          $ar[2] .= ' ' . $record['sub11'];
        }
      } else if ($record['sub08'] && $record['sub09'] && ($record['sub08'] !== $record['sub09'])) {
        $ar[2] = ' φ' . $record['sub08'];

        if ($record['sub10']) {
          $ar[2] .= ' ' . $record['sub10'];
        }

        $ar[2] .= '×φ' . $record['sub09'];

        if ($record['sub11']) {
          $ar[2] .= ' ' . $record['sub11'];
        }
        // } else if ($record['sub08'] && (!isset($record['sub09']) || $record['sub09'] === '')) {
      } else {
        $ar[2] = ' φ' . $record['sub08'];

        if (isset($record['sub10']) && $record['sub10'] !== '') {
          $ar[2] .= ' ' . $record['sub10'];
        }
        if (isset($record['sub11']) && $record['sub11'] !== '') {
          $ar[2] .= ' ' . $record['sub11'];
        }
      }
    }

    // 加工内容が「ドーナツ切り」かつ寸法1, 2が数値の場合、「φ寸法1/φ寸法2」を設定
    if (strpos($record['ar_name'], 'ドーナッツ切り') !== false) {
      if (is_numeric($record['sub08']) && is_numeric($record['sub09'])) {

        $ar[2] = ' φ' . $record['sub08'];

        if ($record['sub10']) {
          $ar[2] .= ' '  . $record['sub10'];
        }

        $ar[2] .= '/φ' . $record['sub09'];

        if ($record['sub11']) {
          $ar[2] .= ' ' . $record['sub11'];
        }
      }
    }

    return $ar;
  }

  /** 2023/4/27修正：発注書作成用に別途規格変換
   * ＜修正１＞ｻｲｽﾞ1とｻｲｽﾞ2の間に「×」を入れない。＜修正２＞線径×目合を表示しない。
   * 品名規格：線径×目合と寸法を配列保持
   * 各sub項目をsub01～sub13に置換。指定されている品名をproductnameに設定。線番をwirenoに設定。
   * ar 0:品名
   * ar 1:規格
   * ar 2:寸法
   */
  public static function makeArrayProductSpecForMoed($record)
  {
    $str = '';
    $ar = [];
    $temp = [];
    $flgProc = false;

    // 金網→品名に規格含む製品の順で規格取得
    if ($record['p_type'] === '100' || isset($record['moed_product_cd']) || isset($record['ed_p_cd']) || isset($record['sr_p_cd']) || isset($record['productcd'])) {
      // 金網
      // 社内品名を取得し、客先品名があれば上書き
      if (strpos($record['productname'], '_') !== false) {
        $temp = explode('_', $record['productname']);
        $ar[0] = ltrim($temp[0]);
        $flgProc = true;
      } else {
        $ar[0] = ltrim($record['productname']);
      }
      if ($record['customerpname'] !== '') {
        if (strpos($record['customerpname'], '_') !== false) {
          $temp = explode('_', $record['customerpname']);
          $ar[0] = $temp[0];
          $flgProc = true;
        } else {
          $ar[0] = $record['customerpname'];
        }
      }
      // if ($record['sub01'] !== '') {
      // 2023/4/27　線径×目合を表示しないため、以下コメントアウト
      // if (!$flgProc) {
      //   // 品名に規格を含まない場合
      //   if (!self::checkEmptyOrZero($record['sub01'])) {
      //     // 線径指定有
      //     if ((!self::checkEmptyOrZero($record['sub12'])) || (!self::checkEmptyOrZero($record['sub13']))) {
      //       // 平線の場合
      //       if (($record['sub01'] === $record['sub02']) && ($record['sub12'] === $record['sub13'])) {
      //         // 縦横同じ厚みt,幅Wならばsub01のみ表示
      //         $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
      //       } else if (!self::checkEmptyOrZero($record['sub02'])) {
      //         // 縦横同じ設定と同意
      //         $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
      //       } else {
      //         $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'] . '×' . 't' . $record['sub13'] . '×' . 'W' . $record['sub02'];
      //       }
      //     } else {
      //       // 丸線で線径指定の場合
      //       if (isset($record['wireno']) && (int)$record['wireno'] > 0) {
      //         // 線径も線番も指定されている場合は線番優先
      //         $str = '#' . floor($record['wireno']);
      //       } else if ($record['sub01'] === $record['sub02']) {
      //         $str = 'φ' . $record['sub01'];
      //       } else if ($record['sub02'] === '') {
      //         $str = 'φ' . $record['sub01'];
      //       } else {
      //         $str = 'φ' . $record['sub01'] . '×' . $record['sub02'];
      //       }
      //     }
      //   } else if (isset($record['wireno']) && (int)$record['wireno'] > 0) {
      //     // 線番指定有
      //     $str = '#' . floor($record['wireno']);
      //   } 
      //   // 設定なしは無視

      //   // 目合区分＋目合＋目合単位
      //   if (isset($record['sub04'])  && $record['sub04'] !== '' && !self::checkEmptyOrZero($record['sub04'])) {
      //     // 目合が設定されている場合
      //     if ($record['sub04'] === $record['sub05']) {
      //       // 目合①と目合②が同じ場合
      //       if ($record['sub03'] !== '') {
      //         // 目合区分
      //         $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
      //       } else {
      //         $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
      //       }
      //     } else if (self::checkEmptyOrZero($record['sub05'])) {
      //       // 目合②が空の場合
      //       if ($record['sub03'] != null || $record['sub03'] != ' ') {
      //         // 目合区分
      //         $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
      //       } else {
      //         $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
      //       }
      //     } else {
      //       // 縦横で線が異なる場合
      //       if ($record['sub03'] !== '') {
      //         $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . '×' . $record['sub03'] . $record['sub05'] . $record['sub06'] . ' ';
      //       } else {
      //         $str .= '×' . $record['sub04'] . $record['sub06'] . '×' . $record['sub05'] . $record['sub06'] . ' ';
      //       }
      //     }
      //     // 規格文字列から半角スペースを除く。
      //     $str = preg_replace("/( |　)/", "", $str);
      //   }
      // }
    }
    if ($str === '') {
      // 金網で規格なし　OR　金網でない製品
      if (($record['customerpname']) !== '' && isset($record['customerpname'])) {
        // if (($record['customerpname'] !== '') && (strpos($record['customerpname'], '_') !== false) ) {
        // 客先品名優先
        $arr1 = explode('_', $record['customerpname']);
        // 品名取得
        $ar[0] = $arr1[0];
        $str = $arr1[1];
      } else if (($record['p_name'] !== '') && (strpos($record['p_name'], '_') !== false)) {
        // 自社品名
        $arr1 = explode('_', $record['p_name']);
        // 品名取得
        $ar[0] = ltrim($arr1[0]);
        $str = $arr1[1];
      } else if ($record['productname'] !== '') {
        $ar[0] = ltrim($record['productname']);
        $str = '';
      } else {
        $ar[0] = ltrim(isset($ar[0]) ? $ar[0] : '');
        $str = '';
      }
    }
    // 規格
    $ar[1] = $str;
    // その他は規格空文字
    // 寸法 円切の場合は寸法②がないためそれぞれ存在確認
    $str = '';   // リセット
    if (!self::CheckEmptyOrZero($record['sub08'])) {
      $str = $record['sub08'];
    }

    if (!self::CheckEmptyOrZero($record['sub10'])) {
      $str .= $record['sub08'] ? ' ' . $record['sub10'] : $record['sub10'];
    }

    if ($str && (!self::CheckEmptyOrZero($record['sub08']) && !self::CheckEmptyOrZero($record['sub09']))) {
      $str .= ' ';
      // $str .= '×';
    }

    if (!self::CheckEmptyOrZero($record['sub09'])) {
      $str .= $record['sub09'];
    }

    if (!self::CheckEmptyOrZero($record['sub11'])) {
      $str .= $str !== '' ? ' ' . $record['sub11'] : $record['sub11'];
      // $str .= $record['sub09'] ? ' ' . $record['sub11'] : $record['sub11'];
      // $str .= ' ' . $record['sub11'];
    }

    if ($str === '') {
      // 品名に含まれる場合、寸法として取得
      if (array_key_exists('ed_customer_p_name', $record)) {
        // if (isset($record['ed_customer_p_name'])) {
        $arr1 = mb_strstr($record['ed_customer_p_name'], '_');
        if ($arr1[2] !== '') {
          $str = $arr1[2];
        }
      }
    }
    $ar[2] = $str;

    // 発注データの時は、サイズ①に文字列が連結されたものが既に入っているため、文字列の再合成はしない。(円切、ドーナツ切りなどのケース) 
    if (strpos($str, 'φ') !== false && isset($record['moed_product_cd'])) {
      return $ar;
    }

    // 加工内容が「円切り」かつ寸法1, 2が同値の場合、「φ寸法1」を設定
    if ((strpos($record['ar_name'], '円切り') !== false) && (strpos($record['ar_name'], '楕円切り') === false) && (strpos($record['ar_name'], '半円切り') === false)) {
      if (isset($record['sub08']) && isset($record['sub09']) && $record['sub08'] === $record['sub09']) {

        $ar[2] = ' φ' . $record['sub08'];

        if ($record['sub10']) {
          $ar[2] .= ' ' . $record['sub10'];
        }

        if ($record['sub11']) {
          $ar[2] .= ' ' . $record['sub11'];
        }
      } else if ($record['sub08'] && $record['sub09'] && ($record['sub08'] !== $record['sub09'])) {
        $ar[2] = ' φ' . $record['sub08'];

        if ($record['sub10']) {
          $ar[2] .= ' ' . $record['sub10'];
        }

        $ar[2] .= '×φ' . $record['sub09'];

        if ($record['sub11']) {
          $ar[2] .= ' ' . $record['sub11'];
        }
        // } else if ($record['sub08'] && (!isset($record['sub09']) || $record['sub09'] === '')) {
      } else {
        $ar[2] = ' φ' . $record['sub08'];

        if (isset($record['sub10']) && $record['sub10'] !== '') {
          $ar[2] .= ' ' . $record['sub10'];
        }
        if (isset($record['sub11']) && $record['sub11'] !== '') {
          $ar[2] .= ' ' . $record['sub11'];
        }
      }
    }

    // 加工内容が「ドーナツ切り」かつ寸法1, 2が数値の場合、「φ寸法1/φ寸法2」を設定
    if (strpos($record['ar_name'], 'ドーナッツ切り') !== false) {
      if (is_numeric($record['sub08']) && is_numeric($record['sub09'])) {

        $ar[2] = ' φ' . $record['sub08'];

        if ($record['sub10']) {
          $ar[2] .= ' '  . $record['sub10'];
        }

        $ar[2] .= '/φ' . $record['sub09'];

        if ($record['sub11']) {
          $ar[2] .= ' ' . $record['sub11'];
        }
      }
    }

    return $ar;
  }

  // 品名と規格を作成する用の関数。
  // 線番対応をするために、コード変更するが、製造データ表記時に線径の方を優先する必要があるため、念のためこの関数自体をいったんコメントにした。
  // /**
  //  * 品名規格：線径×目合と寸法を配列保持
  //  * 各sub項目をsub01～sub13に置換。指定されている品名をproductnameに設定。線番をwirenoに設定。
  //  * ar 0:品名
  //  * ar 1:規格
  //  * ar 2:寸法
  //  */
  // private static function makeArrayProductSpec($record) {
  //   $str = '';
  //   $ar = [];
  //   $temp = [];
  //   // 金網→品名に規格含む製品の順で規格取得
  //   if ($record['p_type'] === '100' || isset($record['moed_product_cd']) || isset($record['ed_p_cd'])) {
  //     // 金網
  //     // 社内品名を取得し、客先品名があれば上書き
  //     if (strpos($record['productname'], '_') !== false) {
  //       $temp = explode('_', $record['productname']);
  //       $ar[0] = $temp[0];
  //     } else {
  //       $ar[0] = $record['productname'];
  //     }
  //     if ($record['customerpname'] !== '') {
  //       if (strpos($record['customerpname'], '_') !== false) {
  //         $temp = explode('_', $record['customerpname']);
  //         $ar[0] = $temp[0];
  //       } else {
  //         $ar[0] = $record['customerpname'];
  //       }
  //     }
  //     if ($record['sub01'] !== '') {
  //       // 縦線・横線
  //       if (($record['sub12'] !== '') || ($record['sub13'] !== '')) {
  //         // 平線の場合
  //         if (($record['sub01'] === $record['sub02']) && ($record['sub12'] === $record['sub13'])) {
  //           // 縦横同じ厚みt,幅Wならばsub01のみ表示
  //           $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
  //         } else if ($record['sub02'] === '') {
  //           // 縦横同じ設定と同意
  //           $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'];
  //         } else {
  //           $str = 't' . $record['sub12'] . '×' . 'W' . $record['sub01'] . '×' . 't' . $record['sub13'] . '×' . 'W' . $record['sub02'];
  //         }
  //       } else {
  //         // 丸線の場合
  //         // 線番表記の場合を考慮に入れる
  //         if (isset($record['wireno']) && (int)$record['wireno'] > 0) {
  //           $str = '#' . floor($record['wireno']);
  //         } else if ($record['sub01'] === $record['sub02']) {
  //           $str = 'φ' . $record['sub01'];
  //         } else if ($record['sub02'] === '') {
  //           $str = 'φ' . $record['sub01'];
  //         } else {
  //           $str = 'φ' . $record['sub01'] . '×' . $record['sub02'];
  //         }
  //       }
  //       // 目合区分＋目合＋目合単位
  //       if ($record['sub04'] === $record['sub05']) {
  //         if ($record['sub03'] !== '') {
  //           // 目合区分
  //           $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
  //         } else {
  //           $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
  //         }
  //       } else if ($record['sub05'] !== '') {
  //         if ($record['sub03'] != null || $record['sub03'] != ' ') {
  //           // 目合区分
  //           $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
  //         } else {
  //           $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . ' ';
  //         }
  //       } else {
  //         if ($record['sub03'] !== '') {
  //           $str .= '×' . $record['sub03'] . $record['sub04'] . $record['sub06'] . '×' . $record['sub03'] . $record['sub05'] . $record['sub06'] . ' ';
  //         } else {
  //           $str .= '×' . $record['sub04'] . $record['sub06'] . '×' . $record['sub05'] . $record['sub06'] . ' ';
  //         }
  //       }
  //     }
  //   } 
  //   if ($str === '') {
  //     // 金網で規格なし　OR　金網でない製品
  //     if (($record['customerpname'] !== '') && (strpos($record['customerpname'], '_') !== false) ) {
  //       // 客先品名優先
  //       $arr1 = explode('_', $record['customerpname']);
  //       // 品名取得
  //       $ar[0] = $arr1[0];
  //       $str = $arr1[1];
  //     } else if (($record['p_name'] !== '') && (strpos($record['p_name'], '_') !== false)) {
  //       // 自社品名
  //       $arr1 = explode('_', $record['p_name']);
  //       // 品名取得
  //       $ar[0] = $arr1[0];
  //       $str = $arr1[1];
  //     } else if ($record['productname'] !== '') {
  //       $ar[0] = $record['productname'];
  //       $str = '';
  //     } else {
  //       $ar[0] = isset($ar[0]) ? $ar[0] : '';
  //       $str = '';
  //     }
  //   }    
  //   // 規格
  //   $ar[1] = $str; 
  //   // その他は規格空文字
  //   // 寸法 円切の場合は寸法②がないためそれぞれ存在確認
  //   $str = '';   // リセット
  //   if ($record['sub08'] != null) {
  //     $str = $record['sub08'];
  //     if ($record['sub10'] != null) {
  //       $str .= $record['sub10'];
  //     }
  //   }
  //   if ($record['sub09'] != null) {
  //     if ($str === '') {
  //       $str = $record['sub09'];
  //     } else {
  //       $str .= '×' . $record['sub09'];
  //     }
  //     if ($record['sub11'] != null) {
  //       $str .= $record['sub11'];
  //     }
  //   }
  //   if ($str === '') {
  //     // 品名に含まれる場合、寸法として取得
  //     if (isset($record['ed_customer_p_name'])) {
  //       $arr1 = mb_strstr($record['ed_customer_p_name'], '_');
  //       if ($arr1[2] !== '') {
  //         $str = $arr1[2];
  //       }
  //     }
  //   }
  //   $ar[2] = $str;    
  //   return $ar;
  // }

  /**
   * ロゴを作成する
   */
  private static function makeLogoDrawing($col, $row, $offsetX = 69, $offsetY = 7, $width = 400, $height = 41)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Logo');
    $drawing->setDescription('Logo');
    $drawing->setPath('./template/logo/takenaka_logo.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 社名表示を作成する
   */
  private static function makeTitleDrawing($col, $row, $offsetX = 20, $offsetY = 3, $width = 360, $height = 56)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title');
    $drawing->setDescription('Title');
    $drawing->setPath('./template/logo/takenaka_title.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 社名表示を作成する インボイス制度導入時に登録番号を併記する必要あり
   */
  private static function makeTitleDrawingBill($col, $row, $offsetX = 20, $offsetY = 3)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title');
    $drawing->setDescription('Title');
    $drawing->setPath('./template/logo/takenaka_title.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth(360);
    $drawing->setHeight(56);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 社名表示を作成する メールアドレスあり
   */
  private static function makeTitleDrawingEMail($col, $row, $offsetX = 20, $offsetY = 3, $width = 405, $height = 79)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title');
    $drawing->setDescription('Title');
    $drawing->setPath('./template/logo/takenaka_title_email.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }


  private static function makeFold($col, $row, $offsetX = 0, $offsetY = 10, $orient)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('fold');
    $drawing->setDescription('fold');
    $drawing->setPath('./template/logo/printmark_' . $orient . '.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth(13);
    $drawing->setHeight(13);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }


  /**
   * 自社工場を添付する
   */
  private static function makeTitleType2Drawing($col, $row, $offsetX = 3, $offsetY = 3, $width = 257, $height = 16)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title2');
    $drawing->setDescription('Title2');
    $drawing->setPath('./template/logo/takenaka_title_type2.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 認証マーク　ISO付き
   */
  private static function makeCertificationDrawing($col, $row, $offsetX = 20, $offsetY = 3, $width = 350, $height = 80)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Cert');
    $drawing->setDescription('Cert');
    $drawing->setPath('./template/logo/takenaka_certification.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    // $drawing->setWidth(350);
    // $drawing->setHeight(80);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 認証マーク　ISOなし
   */
  private static function makeCertificationType2Drawing($col, $row, $offsetX = 20, $offsetY = 5, $width = 185, $height = 85)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Cert');
    $drawing->setDescription('Cert');
    $drawing->setPath('./template/logo/takenaka_certification_type2.jpg');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }


  /**
   * 承認、作成項目
   */
  private static function makeApproval($col, $row, $offsetX = 3, $offsetY = 3, $width = 0, $height = 0)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title2');
    $drawing->setDescription('Title2');
    $drawing->setPath('./template/logo/takenaka_approval.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * フッターの承認項目
   */
  private static function makeApproval2($col, $row, $offsetX = 3, $offsetY = 3, $width = 0, $height = 0)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title2');
    $drawing->setDescription('Title2');
    $drawing->setPath('./template/logo/takenaka_approval2.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 自社住所、部署、連絡先
   */
  private static function makeAddress($col, $row, $offsetX = 3, $offsetY = 3, $width = 0, $height = 0)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('Title2');
    $drawing->setDescription('Title2');
    $drawing->setPath('./template/logo/takenaka_address.png');
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }



  /***
   * QRデータ書込み用
   * 下記条件でヘッダ文字にチェック桁をセットする。
   */
  private static function setQRMode($mode)
  {
    $str = '';
    switch ($mode) {
      case 'est':
      case 'moed':
        $str = '10';
        break;
      case 'moedtag':
        $str = '22';
        break;
      case 'prtag':
        $str = '21';
        break;
      default:
        $str = '21';
    }
    return $str;
  }


  /***
   * QRCode作成&ファイル貼付
   */
  private static function makeQR($col, $row, $size = 159, $inputString, $mode, $offsetX = 6, $offsetY = 4)
  {
    // ファイルディレクトリ作成
    $dirQR = __DIR__ . '\temp\\' . Plannerdbmgr::currentDate();
    if (!file_exists($dirQR)) {
      mkdir($dirQR, 0700);
    }
    $qrFile = '';   // ファイルパス
    // QR作成（2023/4/12　※先頭不要文字削除）
    $qrCode = new \Endroid\QrCode\QrCode($inputString);
    // $qrCode = new \Endroid\QrCode\QrCode($mode . $inputString);
    $qrCode->setSize($size);
    // $qrCode->setMargin(10); 
    $qrCode->setMargin($size * 0.03);
    $qrCode->setWriterByName('png');
    $qrCode->setEncoding('UTF-8');
    $qrCode->setErrorCorrectionLevel(\Endroid\QrCode\ErrorCorrectionLevel::QUARTILE());
    $qrCode->setForegroundColor(['r' => 0, 'g' => 0, 'b' => 0, 'a' => 0]);
    $qrCode->setBackgroundColor(['r' => 255, 'g' => 255, 'b' => 255, 'a' => 0]);
    $qrFile = $dirQR . '\\' . Plannerdbmgr::currentSecond() . '.png';
    $qrCode->setValidateResult(false);
    $qrCode->writeFile($qrFile);
    // 貼り付け
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName('QRCode');
    $drawing->setDescription('QRCode');
    $drawing->setPath($qrFile);
    // $drawing->setResizeProportional(false);
    // $drawing->setWidth($sidesize);
    // $drawing->setHeight(85);
    // $drawing->setOffsetX($offsetX);
    // $drawing->setOffsetY($offsetY);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }

  /**
   * 画像出力
   */
  private static function makeImage($name, $description, $path, $col, $row, $offsetX = 3, $offsetY = 3, $width = 0, $height = 0)
  {
    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
    $drawing->setName($name);
    $drawing->setDescription($description);
    $drawing->setPath($path);
    $drawing->setResizeProportional(false);
    $drawing->setWidth($width);
    $drawing->setHeight($height);
    $drawing->setOffsetX($offsetX);
    $drawing->setOffsetY($offsetY);
    $drawing->setCoordinates(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row);
    return $drawing;
  }


  /**
   * 行をコピーする
   */
  private static function copyRows(PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet, $srcRow, $dstRow, $width, $height)
  {
    for ($row = 0; $row < $height; $row++) {
      for ($col = 0; $col < $width; $col++) {
        $cell = $sheet->getCellByColumnAndRow($col, $srcRow + $row);
        $style = $sheet->getStyleByColumnAndRow($col, $srcRow + $row);
        $dstCell = PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . (string) ($dstRow + $row);
        $sheet->setCellValue($dstCell, $cell->getValue());
        $sheet->duplicateStyle($style, $dstCell);
      }
      $h = $sheet->getRowDimension($srcRow + $row)->getRowHeight();
      $sheet->getRowDimension($dstRow + $row)->setRowHeight($h);
    }
    foreach ($sheet->getMergeCells() as $mergeCell) {
      $mc = explode(':', (string)$mergeCell);
      $col_s = preg_replace('/[0-9]*/', '', $mc[0]);
      $col_e = preg_replace('/[0-9]*/', '', $mc[1]);
      $row_s = ((int) preg_replace('/[A-Z]*/', '', $mc[0])) - $srcRow;
      $row_e = ((int) preg_replace('/[A-Z]*/', '', $mc[1])) - $srcRow;
      if (0 <= $row_s && $row_s < $height) {
        $merge = $col_s . (string) ($dstRow + $row_s) . ':' . $col_e . (string) ($dstRow + $row_e);
        $sheet->mergeCells($merge);
      }
    }
  }

  /**
   * 値がゼロの場合のみ、空文字を返す
   */
  private static function zeroToBlank($num)
  {
    return isset($num) ? $num : '';
  }

  /**
   * ブラウザにファイルを出力する
   */
  private static function outputToBrowser($objPHPE, $filename = 'temp', $qrFlg = false)
  {
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $filename . '.xlsx"');
    header('Cache-Control: max-age=0');
    $objWriter = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($objPHPE, 'Xlsx');
    // $objWriter->setPreCalculateFormulas(true);
    $objWriter->save('php://output');
    // $objWriter->exit;
    // 1.18バージョンはdieで終了
    if ($qrFlg) {
      self::delDir();
    }
    die;
  }

  /**
   * MySQLによる文字列形式を日付表示に修正する
   */
  private static function formatStrToDate($str, $pat = 'Y/n/j')
  {
    try {
      if (!isset($str) || $str === '') {
        return '';
      }
      $dt = new DateTime($str);
      return $dt->format($pat);
    } catch (Exception $e) {
      return $str;
    }
  }
  /**
   * MySQLによる文字列形式を日付表示に修正する
   */
  private static function formatStrToDate2($str, $pat = 'Y年n月j日')
  {
    try {
      if (!isset($str) || $str === '') {
        return '';
      }
      $dt = new DateTime($str);
      return $dt->format($pat);
    } catch (Exception $e) {
      return $str;
    }
  }

  /**
   * 和暦変換　簡易版
   */
  private static function convertToEra($date)
  {
    // 初期値は令和設定。令和以前は入らないはずなので。
    $eraDate = [];
    $eraDate['era'] = '令和';
    $eraDate['year'] = 1;
    $eraDate['month'] = 1;
    $eraDate['date'] = 1;
    $eraList = [
      ['year' => 2018, 'name' => '令和'],
      ['year' => 1988, 'name' => '平成'],
      ['year' => 1925, 'name' => '昭和'],
      ['year' => 1911, 'name' => '大正'],
      ['year' => 1867, 'name' => '明治']
    ];
    try {
      if (mb_strlen($date) === 8) {
        // 変換対象
        $year = (int)(substr($date, 0, 4));

        foreach ($eraList as $era) {
          $startYear = $era['year'];
          $eraName = $era['name'];
          // 西暦比較で年号取得
          if ($year > $startYear) {
            $eraYear = $year - $startYear;
            $eraDate['gyear'] = $year;
            $eraDate['era'] = $eraName;
            $eraDate['year'] = $eraYear;
            // 日付は今回は和暦対応にはなっていない。そのまま0埋めの文字列を返す。
            $eraDate['month'] = substr($date, 4, 2);
            $eraDate['date'] = substr($date, 6, 2);
            return $eraDate;
          }
        }
        return $eraDate;
      }
    } catch (Exception $e) {
      throw $e;
    }
  }


  /***
   * QRimageを格納したフォルダを削除
   */
  private static function delDir()
  {
    try {
      $dirQR = __DIR__ . '\temp\\' . Plannerdbmgr::currentDate();
      if (file_exists($dirQR)) {
        $folderHandle = opendir($dirQR);
        if (!$folderHandle) {
          return;
        }
        $files = scandir($dirQR . '\\');
        foreach ($files as $f) {
          if (!preg_match('/^\.(.*)/', $f)) {
            unlink($dirQR . '\\' . $f);
          }
        }
        closedir($folderHandle);
        rmdir($dirQR);
      }
    } catch (Exception $e) {
      throw $e;
    }
  }



  /***
   * 全角・半角スペースで文字列分割
   * 
   */
  private static function explodeSpaceStr($str)
  {
    if (strpos($str, ' ')) {
      // 半角スペース
      return explode($str, ' ');
    } else if (strpos($str, '　')) {
      // 全角スペース
      return explode($str, '　');
    } else {
      return $str;
    }
  }

  /***
   * 半角かどうか
   */
  private static function isHalfWideStr($str)
  {
    // 半角に変換
    $strB = mb_convert_kana($str, 'a');

    $strLen = mb_strlen($strB, 'UTF-8');
    $strWidth = mb_strwidth($str, 'UTF-8');
    if ($strLen === $strWidth) {
      // 半角
      return true;
    } else {
      return false;
    }
  }


  /***
   * 半角スペースを全角スペースに変換
   * 対象文字はスペースだけなので注意
   */
  private static function convertWideStr($str)
  {
    if (self::isHalfWideStr($str)) {
      // 半角文字を全角に変換
      return mb_convert_kana($str, 'S');
    } else {
      return $str;
    }
  }

  // ↓ADD 2021/5/13 ISHIBASHI [送状発行処理]
  /**
   * セルに背景色を付ける
   */
  private static function coloringCell($objSheet, $objCol, $objRow)
  {
    $color = 'ffdac7';    // 淡い橙系の色
    $objSheet->getStyleByColumnAndRow($objCol, $objRow)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB($color);
  }

  /**
   * アドレスを市区町村で分割する
   */
  private static function splitAddress($add)
  {
    $arr = [];
    $str_add1 = '市';
    $str_add2 = '区';
    $str_add3 = '町';
    $str_add4 = '村';
    $str_fullSpace = '　';

    if ($add === null || $add === '') {
      $arr[0] = '';
      $arr[1] = '';
    } else if (strpos($add, $str_fullSpace) === false) {
      // スペースを含まない場合
      if (strpos($add, $str_add1 . $str_fullSpace)) {            // 市で分割
        $arr = explode($str_add1 . $str_fullSpace, $add);
        $arr[0] .= $str_add1;
      } elseif (strpos($add, $str_add2 . $str_fullSpace)) {      // 区で分割
        $arr = explode($str_add2 . $str_fullSpace, $add);
        $arr[0] .= $str_add2;
      } elseif (strpos($add, $str_add3 . $str_fullSpace)) {      // 町で分割
        $arr = explode($str_add3 . $str_fullSpace, $add);
        $arr[0] .= $str_add3;
      } elseif (strpos($add, $str_add4 . $str_fullSpace)) {      // 村で分割
        $arr = explode($str_add4 . $str_fullSpace, $add);
        $arr[0] .= $str_add4;
      } else {
        $arr[0] = $add;
      }
    } else {
      // スペース含む場合 都道府県(4)+市区町村(12)=16　客先マスタはエクセル登録がメイン&&左記のように住所を分割して登録させるため処理追加。
      $arr[0] = mb_substr($add, 0, 16);
      $arr[1] = mb_substr($add, 16, 32);
    }
    //↓ADD 2021/11/11 ISHIBASHI [送状発行－西濃：出力内容変更]
    // スペースが含まれる場合、削除
    $arr[0] = preg_replace("/( |　)/", "", $arr[0]);
    $arr[1] = preg_replace("/( |　)/", "", $arr[1]);
    //↑ADD 2021/11/11 ISHIBASHI [送状発行－西濃：出力内容変更]
    return $arr;
  }

  /**
   * 文字列をスペースで分割する
   */
  private static function splitSpace($objStr)
  {
    $arr = [];
    $strHalfSpace = ' ';

    if ($objStr === null || $objStr === '') {
      $arr[0] = '';
      $arr[1] = '';
      $arr[2] = '';
    } else {
      //スペースを半角に揃える
      $str = mb_convert_kana($objStr, "s");

      if (strpos($str, $strHalfSpace)) {
        //文字列をスペースで分割する
        $arr = explode($strHalfSpace, $str);
      } else {
        $arr[0] = $objStr;
      }
    }
    //変数にセットして返す
    return $arr;
  }
  // ↑ADD 2021/5/13 ISHIBASHI [送状発行処理]

  /**
   * 月を加算する
   */
  private static function addMonth($dateStr, $num)
  {
    if (!$dateStr) {
      return '';
    }

    $date = new DateTime($dateStr);
    $date->modify('+' . $num . ' month');
    return $date->format('Ym');
  }

  //↓ADD 2021/11/22 ISHIBASHI [送状発行－CSV出力内容の修正]
  /**
   * 文字列をダブルクォーテーションで囲み、CSV出力する
   */
  private static function createCSV_withDblQuot($vFp, $vRecord)
  {
    $out = '';
    $record_tmp = '"';
    $record_tmp .= implode('","', mb_convert_encoding($vRecord, 'SJIS', 'UTF-8'));
    $record_tmp .= '"' . "\n";
    $out .= $record_tmp;
    fwrite($vFp, $out);
    return;
  }
  //↑ADD 2021/11/22 ISHIBASHI [送状発行－CSV出力内容の修正]

  private static function roundEstData($value)
  {
    // 数値以外の文字列が含まれている場合、最初の値を返す　※2023/6/29追加
    if (!is_numeric($value)) {
      return $value;
    }

    $nTarget = (float)$value;
    $nTargetInt = (int)$value;

    if (!$value) {
      return $value;
    }

    if (($nTarget - $nTargetInt) > 0) {
      // 小数部分にデータ有り
      return (string)$nTarget;
    } else if (($nTarget - $nTargetInt) < 0) {
      // 切り捨てなので通常発生しないはず。
      return (string)$nTargetInt;
    } else {
      // 小数点以下にデータがない場合
      return (string)$nTargetInt;
    }
  }

  // 加工内容の比較
  private static function compareArrangementName($prevArrangementName, $currentArrangementName)
  {
    // 同じ値の場合
    if ($prevArrangementName === $currentArrangementName) {
      return true;
    }

    // "なし"と値なしは一致と判定する
    if (in_array($prevArrangementName, array('なし', '', null)) && in_array($currentArrangementName, array('なし', '', null))) {
      return true;
    }

    return false;
  }

  /***
   * 文字列の中身が空や0の場合はtrueで返す
   * 0か空文字、null,undefined : true
   */
  private static function checkEmptyOrZero($value)
  {
    if (!isset($value)) {
      // null or undefined
      return true;
    } else if ($value === '') {
      return true;
    }

    // 引数のデータによって判定
    if (gettype($value) === 'integer' || gettype($value) === 'double') {
      if ($value == 0) {
        return true;
      }
    }
    // else if ((float)$value <= 0) {
    //   return true;
    // }

    // 数字以外の文字を含む文字列
    if ($value) {
      return false;
    }
    return true;
  }

  /***
   * 発注画面用
   * φなどの単位文字を含んでいる文字列であれば、trueとして返す。その他については、checkEmptyOrZeroと同様の動き
   */
  // private static function morderCheckEmptyOrZero($value) {
  //   if (!isset($value)) {
  //     return true;
  //   } else if ($value === '') {

  //   }
  //   $result = false;
  //   $result = self::checkEmptyOrZero($value);
  //   return $result;
  // }


  // 納品書住所の空白削除用関数
  // 半角スペース3個以上 or 全角スペース2個以上連続する部分は空白を削除
  private static function trimSpaceForCustomerAddress($addressName)
  {
    // 先頭4+12=16(都道府県と市区町村の文字数) までにスペースがないか確認
    $strOrg = mb_substr($addressName, 0, 16);
    if (strpos($strOrg, '　') !== false) {
      $addressName = preg_replace("/( |　)/", "", $strOrg) . mb_substr($addressName, 16, 32);
    }

    // 半角スペースで住所分割
    $splitedArrayByHalfSpace = explode(' ', $addressName);
    $joinedAddressNameByHalfSpace = '';
    // 半角スペースが3個以上連続する部分は半角スペース削除
    for ($i = 0; $i < count($splitedArrayByHalfSpace); $i += 1) {
      if ($splitedArrayByHalfSpace[$i] !== '') {
        // 文字列の後に半角スペースが何個あるかカウント
        $spaceCount = 0;
        for ($n = $i + 1; $n < count($splitedArrayByHalfSpace); $n += 1) {
          $spaceCount += 1;
          if ($splitedArrayByHalfSpace[$n] !== '') {
            break;
          }
        }
        $joinedAddressNameByHalfSpace .= $spaceCount >= 3 ? $splitedArrayByHalfSpace[$i] : $splitedArrayByHalfSpace[$i] . '  ';
      }
    }

    // 全角スペースで住所分割
    $splitedArrayByFullSpace = explode('　', $joinedAddressNameByHalfSpace);
    $joinedAddressNameByFullSpace = '';
    // 全角スペースが2個以上連続する部分は全角スペース削除
    for ($i = 0; $i < count($splitedArrayByFullSpace); $i += 1) {
      if ($splitedArrayByFullSpace[$i] !== '') {
        // 文字列の後に全角スペースが何個あるかカウント
        $spaceCount = 0;
        for ($n = $i + 1; $n < count($splitedArrayByFullSpace); $n += 1) {
          $spaceCount += 1;
          if ($splitedArrayByFullSpace[$n] !== '') {
            break;
          }
        }
        $joinedAddressNameByFullSpace .= $spaceCount >= 2 ? $splitedArrayByFullSpace[$i] : $splitedArrayByFullSpace[$i] . '　';
      }
    }
    return $joinedAddressNameByFullSpace;
  }


  /***
   * エクセルセット用の文字列チェック。
   * 大きな数字の場合は、エクセルテンプレ―ト側で文字列の書式をしていていても、初回表示が指数表示に強制変換されるため。
   */
  private static function excelString($str)
  {
    if (ctype_digit($str)) {
      return "=\"$str\"";
    } else {
      return $str;
    }
  }
}
