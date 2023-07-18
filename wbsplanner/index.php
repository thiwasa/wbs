<?php
require_once './login.php';
?>
<!DOCTYPE HTML>
<html lang='ja'>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!-- <link rel="shortcut icon" type="image/ico" href="favicon.ico" /> -->
  <title>生産管理システム - 計画画面</title>
  <link rel="stylesheet" href="./lib/slickgrid/slick.grid.css?ver=<?php echo date("YmdHi"); ?>" type="text/css"/>
  <link rel="stylesheet" href="./lib/slickgrid/css/smoothness/jquery-ui-1.11.3.custom.css?ver=<?php echo date("YmdHi"); ?>" type="text/css"/>
  <link rel="stylesheet" href="planner.css?ver=<?php echo date("YmdHi"); ?>" type="text/css"/>
  <link rel="stylesheet" href="./lib/slickgrid/controls/slick.columnpicker.css" type="text/css"/>
</head>
<body>
  <div>
    <h1>様式一覧</h1>
  </div>
  <div id="inittext">読込中...</div>
  <div class="contents">
    <div id="tabs">
      <ul>
        <?php 
          $dbtables = array(
            'Prodplans' => '製造計画',
            // 'Shipplans' => '出荷計画',
            'ED' => '受注',
            // 'LP' => '製作指示書',
            // 'MOED' => '材料見積依頼書',
            'MOD' => '発注',
            // 'OOED' => '外注見積依頼書',
            'OOD' => '製造委託',
            'SD' => '出荷予定',
            'BD' => '請求書',
            'STPlan' => '入出庫予定',
            'ST' => '入出庫',
          ); 
          foreach ($dbtables as $key => $value) {
        ?>
        <li><a href="#tabs-main-<?php echo $key ?>"><?php echo $value ?></a></li>
        <?php 
          } 
        ?>
        <!-- <li><a href="#tabs-main-STOCK">在庫</a></li> -->
      </ul>
      <?php 
        $pagecnt = 0; 
        foreach ($dbtables as $key => $value) { 
      ?>
      <div id="tabs-main-<?php echo $key ?>" class="master-tab">
        <div id="btns-<?php echo $key ?>"></div>
        <div class="master-grid-container">
          <div class="grid-header">
            <label><?php echo $value ?></label>
          </div>
          <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
        </div>
      </div>
      <?php 
        $pagecnt++; 
        } 
      ?>
    </div>
  </div>
  <div>
    <h2>オプション:</h2>
    <div>
      <button id="btn-showmaster">マスタ一覧表示(F1)</button>
      <button id="btn-showstockview">在庫一覧表示</button>
      <a href="../index.php" target="_blank"><button>工程表画面を表示</button></a>
      <!-- <a href="../index.php">工程表画面</a> -->
      ユーザ:<span id="login-user-cd"><?php echo h($_SESSION['username']); ?></span>
      <span id="login-user" hidden><?php echo h($_SESSION['usercd']); ?></span>
      <span id="user-occp" hidden><?php echo h($_SESSION['perminfo']); ?></span>
      <span id="company-cd" ><?php echo h($_SESSION['companycd']); ?></span>
      <a href="./logout.php">ログアウト</a>
    </div>
  </div>

  <!-- 番号一覧ダイアログ -->
  <div id="dialog-number-list" title="番号一覧">
    <div id="tabs-number-list">
      <?php $dbtables = array(
        'Prodplans' => '製造計画',
        'ED' => '受注',
        'MOD' => '発注',
        'AT' => '発注検収',
        'MST' => '入庫',
        'OOD' => '製造委託',
        'AOO' => '委託検収',
        'OST' => '入庫(委託品)',
        'SD' => '出荷予定',
        'BD' => '請求書',
      ); ?>
      <ul>
      <?php foreach ($dbtables as $key => $value) { ?>
        <li><a href="#tabs-NumberList<?php echo $key ?>"><?php echo $value ?></a></li>
      <?php } ?>
      </ul>
      <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
      <!-- <?php echo $value ?>編集 -->
      <div id="tabs-NumberList<?php echo $key ?>" class="master-tab">
        <div id="btns-NumberList<?php echo $key ?>">
        </div>
        <div class="master-grid-container">
          <div class="grid-header">
            <label><?php echo $value ?></label>
          </div>
          <div id="gridNumberList<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
        </div>
      </div>
      <?php $pagecnt++; } ?>
    </div>
  </div>
  <!-- 在庫表示ダイアログ -->
  <div id="dialog-graph" title="在庫">
    <canvas id="stockchart"></canvas>
  </div>

  <!-- 編集ダイアログ -->
  <div id="dialog-insert" title="データ編集">
    <div id="tabs-insert">
      <?php $dbtables = array(
        'Prodplans' => '製造計画',
        // 'Shipplans' => '出荷計画',
        'ED' => '受注',
        // 'LP' => '製作指示書',
        // 'MOED' => '材料見積依頼書',
        'MOD' => '発注',
        'AT' => '発注検収',
        'MST' => '入庫',
        // 'OOED' => '外注見積依頼書',
        'OOD' => '製造委託',
        'AOO' => '委託検収',
        'OST' => '入庫(委託品)',
        'SD' => '出荷予定',
        'BD' => '請求書',
        'STPlan' => '入出庫予定',
        'STPProduce' => '製造使用材料',
        'STPReceive' => '未受注引当',
        'ST' => '入出庫',
        // 'STAdjust' => '在庫調整',
        // 'STTransfer' => '在庫移動',
    ); ?>
      <ul>
      <?php foreach ($dbtables as $key => $value) { ?>
        <li><a href="#tabs-insert-Edit<?php echo $key ?>"><?php echo $value ?></a></li>
      <?php } ?>
      </ul>
      <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
      <!-- <?php echo $value ?>編集 -->
      <div id="tabs-insert-Edit<?php echo $key ?>" class="master-tab">
        <div id="btns-Edit<?php echo $key ?>">
        </div>
        <div class="master-grid-container">
          <div class="grid-header">
            <label><?php echo $value ?></label>
          </div>
          <div id="gridEdit<?php echo $key ?>Header" data-pagecnt="<?php echo $pagecnt ?>"></div>
          <div id="gridEdit<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
        </div>
      </div>
      <?php $pagecnt++; } ?>
    </div>
  </div>

  <!-- マスタ一覧兼コード選択補助ダイアログ -->
  <div id="dialog-code" title="マスタ一覧">
    <div id="tabs-master">
      <?php $dbtables = array(
        'Product' => '品名',
        'Material' => '材質',
        'Weight' => '基本重量',
        'Warehouse' => '倉庫',
        'Gari' => 'ガリ機',
        'Weave' => '織機',
        'Cam' => 'カム決定',
        'Mold' => '金型',
        'Manufacture' => '加工内容詳細',
        'Inspectionitem' => '検査項目',
        'Wire' => '線番',
        'Transportcompany' => '運送会社',
        'Productcategory' => '品名分類',
        'Packing' => '荷姿',
        'Customer' => '客先',
        'User' => '社員',
        'Customerpost' => '客先部署',
        'Customercharge' => '客先担当者',
        'Unit' => '数量単位',
        'Parrangement' => '製品手配方法',
        'Arrangement' => '加工内容',
        'Tax' => '税率',
        'Inspection' => '検査数',
        'Storage' => '在庫',
        'Process' => '工程',
      ); ?>
      <ul>
      <?php foreach ($dbtables as $key => $value) { ?>
        <li><a href="#tabs-master-<?php echo $key ?>"><?php echo $value ?></a></li>
      <?php } ?>
      </ul>
      <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
      <!-- <?php echo $value ?>マスタ -->
      <div id="tabs-master-<?php echo $key ?>" class="master-tab">
        <div id="btns-<?php echo $key ?>">
        </div>
        <div class="master-grid-container">
          <div class="grid-header">
            <label><?php echo $value ?></label>
          </div>
          <!-- <?php if ($key === "Unit") { ?>
          <div id="grid<?php echo $key ?>Header" data-pagecnt="<?php echo $pagecnt ?>"></div>
          <?php } ?> -->
          <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
        </div>
      </div>
      <?php $pagecnt++; } ?>
    </div>
  </div>

  <div id="dialog-setting" title="工程設定">     
    <p><input type="hidden" id="prodplan-no" name="prodplan-no" value="0000000000"></p>
    <p><input type="hidden" id="p-cd" name="p-cd" value="00000000000"></p>
    <div id="tabs-setting">
      <?php $dbtables = array(
          'SettingProc' => '加工内容編集',
        ); ?>
      <ul>
      <?php foreach ($dbtables as $key => $value) { ?>
        <li><a href="#tabs-setting-<?php echo $key ?>"><?php echo $value ?></a></li>
      <?php } ?>
      </ul>
      <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
      <div id="tabs-setting-<?php echo $key ?>" class="master-tab">
        <div id="btns-<?php echo $key ?>">
        </div>
        <div class="master-grid-container">
          <div class="grid-header">
            <label><?php echo $value ?></label>
          </div>
          <div id="grid<?php echo $key ?>"></div>
        </div>
      </div>
      <?php $pagecnt++; } ?>
    </div>
  </div>

    <!-- 在庫一覧画面 -->
    <div id="dialog-stockview" title="在庫一覧">
      <div id="tabs-stockview">
        <ul>
          <li><a href="#stockcrimp">クリンプ</a></li>
          <li><a href="#stockweave">織金網/亀甲金網</a></li>
          <li><a href="#stockwelding">溶接金網</a></l>
          <li><a href="#stockwire">線材</a></li>
          <li><a href="#stockmaterial">材料在庫</a></li>
        </ul>
        <div id="stockcrimp">
          <div id="tabs-stockview-crimp">
          <?php $dbtables = array(
            'CR15MSUS' => 'SUS在庫',
            'CR15MZN' => '亜鉛在庫',
            'CRSUS08' => '切売 φ0.8,φ1.0',
            'CRSUS12' => '切売 φ1.2',
            'CRSUS15' => '切売 φ1.5',
            'CRSUS1510' => 'φ1.5×10',
            'CRSUS1515' => 'φ1.5×15',
            'CRSUS16' => '切売 φ1.6',
            'CRSUS19' => '切売 φ1.9',
            'CRSUS20' => '切売 φ2.0',
            'CRSUS23' => '切売 φ2.3～',
            'CR316L' => '切売 SUS316L',
            'CRZN' => '切売 亜鉛',
            'CRRSVSHT' => '製品',
            'CRSHTSUS' => 'SUS304クリンプシート',
            'CRSHTPLAIN' => 'SUS304平織シート',
            'CRSHTOTHER' => 'その他シート',
            'CRRSVRYOKI' => 'リョーキ',
          ); ?>
            <ul>
              <?php foreach ($dbtables as $key => $value) { ?>
              <li><a href="#contents-stockview-<?php echo $key ?>"><?php echo $value ?></a></li>
              <?php } ?>
            </ul>
            <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
            <div id="contents-stockview-<?php echo $key ?>" class="master-tab">
              <div id="btns-<?php echo $key ?>"></div>
              <div class="master-grid-container">
                <div class="grid-header">
                  <label><?php echo $value ?></label>
                </div>
                <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
              </div>
            </div>
            <?php $pagecnt++; } ?>
          </div>
        </div>
        <div id="stockweave">
          <div id="tabs-stockview-weave">
            <?php $dbtables = array(
              'WVSUS304' => 'テクノ織網SUS304',
              'WVSUS316' => 'テクノ織網SUS316/SUS316L',
              'WVZN' => 'テクノ織網亜鉛/真鍮/その他',
              'WVHEX' => '亀甲網',
              'WVSHT' => '織網ハンパ',
              // 'WVOTH' => '織網 その他',
            ); ?>
            <ul>
            <?php foreach ($dbtables as $key => $value) { ?>
              <li><a href="#contents-stockview-<?php echo $key ?>"><?php echo $value ?></a></li>
            <?php } ?>
            </ul>
            <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
            <div id="contents-stockview-<?php echo $key ?>" class="master-tab">
              <div id="btns-<?php echo $key ?>"></div>
              <div class="master-grid-container">
                <div class="grid-header">
                  <label><?php echo $value ?></label>
                </div>
                <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
              </div>
            </div>
            <?php $pagecnt++; } ?>
          </div>
        </div>
        <div id="stockwelding">
          <div id="tabs-stockview-welding">          
            <?php $dbtables = array(
              'WDSUS' => 'SUS',
              'WDFE' => '鉄',
              'WDOTH' => 'その他',
            ); ?>
            <ul>
            <?php foreach ($dbtables as $key => $value) { ?>
              <li><a href="#contents-stockview-<?php echo $key ?>"><?php echo $value ?></a></li>
            <?php } ?>
            </ul>
            <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
            <div id="contents-stockview-<?php echo $key ?>" class="master-tab">
              <div id="btns-<?php echo $key ?>"></div>
              <div class="master-grid-container">
                <div class="grid-header">
                  <label><?php echo $value ?></label>
                </div>
                <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
              </div>
            </div>
            <?php $pagecnt++; } ?>
          </div>
        </div>
        <div id="stockwire">          
          <div id="tabs-stockview-wire">   
            <?php $dbtables = array(
              // 'WRMSUS' => 'SUS',
              // 'WRMOTH' => 'その他',
              'WRSUS304W1' => 'SUS304 W1',
              'WRSUS304W2' => 'SUS304 W2',
              'WRSUS316' => 'SUS316/SUS316L',
              'WRSUS309W1' => 'SUS309S W1',
              'WRSUS309W2' => 'SUS309S W2',
              'WRSUS310W1' => 'SUS310S W1',
              'WRSUS310W2' => 'SUS310S W2',
              'WRSUSOTH' => 'SUSその他',
              'WRFLAT' => '平線',
              'WRAL' => 'アロイ・アルミ',
              'WRCU' => '銅・チタン・真鍮',
              'WRZN2' => '亜鉛2種',
              'WRZN3' => '亜鉛3種/その他亜鉛',
              'WRHSTEEL' => '硬鋼線',
              'WRVINYL' => 'ビニール線',
              'WRFE' => '鉄',
              'WROTH' => 'その他',
              'WRMSUS' => '材料価格_SUS',
              'WRMOTH' => '材料価格_その他',
            ); ?>
            <ul>
            <?php foreach ($dbtables as $key => $value) { ?>
              <li><a href="#contents-stockview-<?php echo $key ?>"><?php echo $value ?></a></li>
            <?php } ?>
            </ul>
            <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
            <div id="contents-stockview-<?php echo $key ?>" class="master-tab">
              <div id="btns-<?php echo $key ?>">
              </div>
              <div class="master-grid-container">
                <div class="grid-header">
                  <label><?php echo $value ?></label>
                </div>
                <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
              </div>
            </div>
            <?php $pagecnt++; } ?>
          </div>
        </div>
        <div id="stockmaterial">
          <div id="tabs-stockview-material">  
            <?php $dbtables = array(
              'MTPUNCH' => 'パンチング/エキスパンド',
              'MTFLATBAR' => '鋼材　フラットバー',
              'MTROUND' => '鋼材　丸鋼',
              'MTANGLE' => '鋼材　アングル・角棒',
              'MTFE' => '鋼材　鉄',
              'MTBASKET' => 'カゴ枠用資材',
              'MTBOARD' => '板材',
              'MTPLATE' => '金型プレート',
              'MTOTH' => 'その他',
            ); ?>
            <ul>
            <?php foreach ($dbtables as $key => $value) { ?>
              <li><a href="#contents-stockview-<?php echo $key ?>"><?php echo $value ?></a></li>
            <?php } ?>
            </ul>
            <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
            <div id="contents-stockview-<?php echo $key ?>" class="master-tab">
              <div id="btns-<?php echo $key ?>">
              </div>
              <div class="master-grid-container">
                <div class="grid-header">
                  <label><?php echo $value ?></label>
                </div>
                <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
              </div>
            </div>
            <?php $pagecnt++; } ?>
          </div>
        </div>
      </div>
    </div>

    <div id="dialog-detailstock" title="在庫詳細">
      <div id="tabs-detailstock">
        <?php $dbtables = array(
              'DTCRIMP' => 'クリンプ詳細',
              'DTWIRE' => '線材詳細',
              'DTMATERIAL' => '材料詳細',
            ); 
        ?>
        <ul>
        <?php $pagecnt = 0; 
          foreach ($dbtables as $key => $value) { ?>
          <li><a href="#contents-detailstock-<?php echo $key ?>"><?php echo $value ?></a></li>
          <?php } ?>          
        </ul>
        <?php $pagecnt = 0; foreach ($dbtables as $key => $value) { ?>
        <div id="contents-detailstock-<?php echo $key ?>" class="master-tab">
          <div id="btns-<?php echo $key ?>">
          </div>
          <div class="master-grid-container">
            <div class="grid-header">
              <label><?php echo $value ?></label>
            </div>
            <div id="grid<?php echo $key ?>" data-pagecnt="<?php echo $pagecnt ?>"></div>
          </div>
        </div>
        <?php $pagecnt++; } ?>
      </div>
    </div>

  <!-- データ確認ダイアログ -->
  <div id="dialog-checkdat" title="在庫確認">
    <div id="tabs-checkdat">
      <?php $dbtables = array(
        // 'Checkbom' => 'BOM展開結果',
        'Assignstock' => '在庫引当',
        'ManufacturingUse' => '製造使用',
      ); ?>
      <ul>
      <?php foreach ($dbtables as $key => $value) { ?>
        <li><a href="#tabs-checkdat-<?php echo $key ?>"><?php echo $value ?></a></li>
      <?php } ?>
      </ul>
      <?php foreach ($dbtables as $key => $value) { ?>
      <!-- <?php echo $value ?>マスタ -->
      <p><input type="hidden" id="mother-grid" name="mother-grid" value=""></p>
      <p><input type="hidden" id="estimateno" name="estimateno" value=""></p>
      <div id="tabs-checkdat-<?php echo $key ?>" class="master-tab">
        <div id="btns-<?php echo $key ?>">
        </div>
        <div class="master-grid-container">
          <div class="grid-header">
            <label><?php echo $value ?></label>
          </div>
          <div id="grid<?php echo $key ?>"></div>
        </div>
      </div>
      <?php } ?>
    </div>
  </div>
  <!-- 見積計算ダイアログ -->
  <div id="dialog-calc-estimate" title="見積計算">
  <button id="btn-calc-estimate-reg">登録</button>
  <button id="btn-calc-estimate-cancel">キャンセル</button>
    <div class="grid-estimate-container">
      <div class="grid-header">
        <label>見積計算</label>
        <p><input type="hidden" id="calc-estimate-no" name="calc-estimate-no" value="00000000000"></p>
      </div>
      <div id="gridCalcEstimateHeader1"></div>
      <div id="gridCalcEstimateHeader2"></div>
      <div id="gridCalcEstimate1"></div>
    </div>  
  </div>
  <!-- 指図金網ダイアログ -->
  <div id="dialog-calc-prodplan" title="金網製造指示">
  <!-- <button id="btn-calc-prodplan-deleterow">行削除</button> -->
  <button id="btn-calc-prodplan-reg">登録</button>
  <!-- <button id="btn-calc-prodplan-cancel">キャンセル</button> -->
    <div class="grid-prodplan-container">
      <div class="grid-header">
        <label>製造計画</label>
        <p><input type="hidden" id="customer-cd" name="customer-cd" value="000"></p>
        <p><input type="hidden" id="sub_no" name="sub_no" value="001"></p>
        <p><input type="hidden" id="sum-area" name="sum-area" value="0.00"></p>
        <p><input type="hidden" id="sum-price" name="sum-price" value="0"></p>
      </div>
      <div id="gridCalcProdplanHeader1"></div>
      <div id="gridCalcProdplanHeader2"></div>
      <div id="gridCalcProdplan1"></div>
      <div id="gridCalcProdplan2"></div>
    </div>
  </div>
  <div id="dialog-br-product" title="重点品名コード一覧">
    <button id="btn-br-product-yes">選択</button>
    <button id="btn-br-product-cancel">キャンセル</button>
    <table>
      <tr>
        <td>
          <div id="brProduct"></div>
        </td>
      </tr>
    </table>
  </div>
  <!-- <div id="dialog-sub-process" title="加工内容編集">
    <button id="btn-sub-process-insert">追加</button>
    <button id="btn-sub-process-delete">削除</button>
    <button id="btn-sub-process-update">更新</button>
    <table>
      <tr>
        <td>
          <div id="subProcess"></div>
        </td>
      </tr>
    </table>
  </div> -->
  <!-- 製造リーフ登録中ダイアログ -->
  <div id="dialog-leafprod-issue" title="データ登録中">
    <div id="loadfactor-graph-wait"> 
      <div style="text-align:center;">製造リーフ登録中です。しばらくお待ちください...</div>
      <div class="progressbar"></div>
    </div>
  </div>
  <div id="dialog-sdforbill" title="請求データ作成">
    <p><請求データ作成></p>
    <p>請求締日 <input id="txt-sdforbill-closedate" type="text"></p>
    <p>客先コード <input id="txt-sdforbill-custcd" type="text" pattern="^([a-zA-Z0-9]{1,3})$"></p>
  </div>
  <div id="dialog-checkbill" title="請求一覧表">
    <p><請求一覧表></p>
    <p>請求締日 <input id="txt-checkbill-closedate" type="text"></p>
  </div>
  <div id="dialog-outputbill" title="請求書発行">
    <p><請求書発行></p>
    <p>請求締日 <input id="txt-outputbill-closedate" type="text"></p>
    <p>客先コード <input id="txt-outputbill-custcd" type="text" pattern="^([a-zA-Z0-9]{1,3})$"></p>
    <input type="checkbox" id="billtype1" name="billtype1" value="usual" checked>
    <label for="billtype1">通常請求</label>
    <input type="checkbox" id="billtype2" name="billtype2" value="dedicated1">
    <label for="billtype2">リョーキ様分</label>
  </div>
  <div id="dialog-deletebill" title="請求書取消">
    <p><請求書取消></p>
    <div>請求No <input id="txt-delete-billno" type="text"></div>
  </div>
  <div id="dialog-LP-sheet" title="製造指示書">
  <div class="message">
    <p>登録テスト完了しました</p>
  </div>  
  </div>
    <!-- <div id="dialog-XLS-copy"  title="エクセルコピー" style="width:600px;">
    <div id="myGrid" style="width:100%;height:300px;"></div>
    </div> -->
  <script src="./lib/jquery-2.2.4.min.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <!-- <script src="./lib/slickgrid/lib/jquery-1.11.2.min.js?ver=<?php echo date("YmdHi"); ?>"></script> -->
  <script src="./lib/slickgrid/lib/jquery-ui-1.11.3.min.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/jquery-ui-1.11.4.custom/datepicker-ja.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/lib/jquery.event.drag-2.3.0.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/lib/jquery.tmpl.min.js"></script>

  <script src="./lib/slickgrid/slick.core.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.checkboxselectcolumn.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.autotooltips.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.cellrangedecorator.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.cellexternalcopymanager.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.cellrangeselector.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.cellselectionmodel.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.cellcopymanager.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/plugins/slick.rowselectionmodel.js?ver=<?php echo date("YmdHi"); ?>"></script> 
  <script src="./lib/slickgrid/controls/slick.columnpicker.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/slick.dataview.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/slick.formatters.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slick.editors.mod.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/slickgrid/slick.grid.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/chartjs/Chart.bundle.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/currencyFormatter.min.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="./lib/moment-with-locales.min.js"></script>
  <!-- <script src="./dist/shim.min.js"></script> -->
  <script src="./dist/xlsx.full.min.js"></script>
  <script src="pg.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="plandb.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="sgext.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="sgcolopt.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="logic.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="wsutils.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script src="planner.js?ver=<?php echo date("YmdHi"); ?>"></script>
</body>
</html>