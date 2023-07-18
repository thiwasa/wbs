<?php
defined('BASEPATH') or exit('No direct script access allowed');
?>
<!DOCTYPE html>
<html lang="jp">

<head>
  <meta charset="utf-8">
  <link type="text/css" rel="stylesheet" href="<?= base_url(); ?>assets/lib/jquery-ui-1.11.4.custom/jquery-ui.min.css">
  <link type="text/css" rel="stylesheet" href="<?= base_url(); ?>assets/lib/jquery-ui-1.11.4.custom/jquery-ui.theme.min.css">
  <link type="text/css" rel="stylesheet" href="<?= base_url(); ?>assets/lib/jsgrid/jsgrid.min.css" />
  <link type="text/css" rel="stylesheet" href="<?= base_url(); ?>assets/lib/jsgrid/jsgrid-theme.min.css" />
  <link type="text/css" rel="stylesheet" href="<?= base_url(); ?>assets/lib/material.min.css">
  <link type="text/css" rel="stylesheet" href="<?= base_url(); ?>assets/css/schedule_main.css?ver=<?php echo date('YmdHi'); ?>">
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/jquery-2.2.3.min.js"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/jquery-ui-1.11.4.custom/jquery-ui.min.js"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/jquery-ui-1.11.4.custom/datepicker-ja.js"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/jquery.cookie.js"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/jsgrid/jsgrid.min.js"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/jsgrid/i18n/jsgrid-ja.js?ver=<?php echo date("YmdHi"); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/chartjs/Chart.bundle.js"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/wsutils.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/canvasutils.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/cvsgantt.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/database.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/draw.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/wsapp.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/chartdisp.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/main.js?ver=<?php echo date('YmdHi'); ?>"></script>
  <script type="text/javascript" src="<?= base_url(); ?>assets/lib/material.min.js"></script>
  <title>Scheduler - SysDevLink</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
  <!-- Always shows a header, even in smaller screens. -->
  <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <header class="mdl-layout__header">
      <div class="mdl-layout__header-row">
        <!-- Title -->
        <span class="mdl-layout-title">寄合型生産管理システム</span>
        <!-- Add spacer, to align navigation to the right -->
        <div class="mdl-layout-spacer"></div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--expandable
                  mdl-textfield--floating-label mdl-textfield--align-right">
          <label class="mdl-button mdl-js-button mdl-button--icon search-button" for="fixed-header-drawer-search">
            <i class="material-icons">search</i>
          </label>
          <div class="mdl-textfield__expandable-holder">
            <input class="mdl-textfield__input" type="text" name="searchtext" id="fixed-header-drawer-search">
          </div>
        </div>
        <!-- Navigation. We hide it in small screens. -->
        <!-- <nav class="mdl-navigation mdl-layout--large-screen-only"> -->
        <nav class="mdl-navigation">
          <!-- <a class="mdl-navigation__link" href="#" id="header-menu-undo">Undo</a> -->
          <a class="mdl-navigation__link" href="#" id="header-menu-datespan">日数切替</a>
          <ul class="mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect" for="header-menu-datespan">
            <li class="mdl-menu__item link-datespan" data-span="3">3日間</li>
            <li class="mdl-menu__item link-datespan" data-span="7">7日間</li>
            <li class="mdl-menu__item link-datespan" data-span="14">14日間</li>
            <li class="mdl-menu__item link-datespan" data-span="21">21日間</li>
            <li class="mdl-menu__item link-datespan" data-span="30">30日間</li>
            <li class="mdl-menu__item link-datespan mdl-menu__item--full-bleed-divider" data-span="90">90日間</li>
          </ul>
          <a class="mdl-navigation__link" href="<?php echo base_url() . 'index.php/schedule/logout' ?>">ログアウト</a>
        </nav>
      </div>
    </header>
    <div class="mdl-layout__drawer">
      <span class="mdl-layout-title">メニュー</span>
      <nav class="mdl-navigation">
        <a class="mdl-navigation__link jumpdatedialog" href="#">指定日付表示</a>
        <!-- <a class="mdl-navigation__link outputexcel-leaf-type1" href="#">書類出力(書式1)</a> -->
        <!-- <a class="mdl-navigation__link outputexcel-leaf-type2" href="#">書類出力(書式2)</a> -->
        <a class="mdl-navigation__link count-leaf-day" href="#">日付別稼働率表示</a>
        <a class="mdl-navigation__link count-current-stock" href="#">現在在庫表示</a>
        <a class="mdl-navigation__link start-sim" href="#">シミュレーションモード</a>
        <a class="mdl-navigation__link set-calendar" href="#">カレンダー設定</a>
        <a class="mdl-navigation__link">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-autoplace-samerow">
            <input type="checkbox" id="switch-autoplace-samerow" class="mdl-switch__input" checked>
            <span class="mdl-switch__label">配置行自動整列</span>
          </label>
        </a>
        <a class="mdl-navigation__link">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-autoplace-parent">
            <input type="checkbox" id="switch-autoplace-parent" class="mdl-switch__input">
            <span class="mdl-switch__label">後工程自動整列</span>
          </label>
        </a>
        <a class="mdl-navigation__link">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-autoplace-child">
            <input type="checkbox" id="switch-autoplace-child" class="mdl-switch__input">
            <span class="mdl-switch__label">前工程自動整列</span>
          </label>
        </a>
        <a class="mdl-navigation__link">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-autoplace-affectedrow">
            <input type="checkbox" id="switch-autoplace-affectedrow" class="mdl-switch__input" checked>
            <span class="mdl-switch__label">影響行自動整列</span>
          </label>
        </a>
        <a class="mdl-navigation__link">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-autoplace-result">
            <input type="checkbox" id="switch-autoplace-result" class="mdl-switch__input" checked>
            <span class="mdl-switch__label">実績入力時整列</span>
          </label>
        </a>
        <a class="mdl-navigation__link" href="auth">ユーザー管理</a>
        <a class="mdl-navigation__link setConfigure" href="#">設定</a>
        <!-- <a class="mdl-navigation__link" href="https://192.168.1.201/wbs/wbsplanner/" target="_blank">生産管理システム</a> -->
        <a class="mdl-navigation__link" href="https://localhost/wbs/wbsplanner/" target="_blank">生産管理システム</a>
        <!-- <a class="mdl-navigation__link" href="<?= base_url(); ?>../wbsmaster/">マスタ管理</a> -->
      </nav>
    </div>
    <main class="mdl-layout__content">
      <div class="page-content">
        <!-- Your content goes here -->
        <div id="mainarea">
          <div id="tabs-gantt">
            <ul>
              <li><a href="#tabs-gantt-prod-staff">担当者</a></li>
              <li><a href="#tabs-gantt-prod-equipment">設備</a></li>
              <li><a href="#tabs-gantt-ship">出荷日程</a></li>
              <!-- <li><a href="#tabs-gantt-proj">プロジェクト</a></li> -->
              <!-- <li><a href="#tabs-gantt-prod-staff-sim">担当者[Sim]</a></li>
            <li><a href="#tabs-gantt-prod-equipment-sim">設備[Sim]</a></li>
            <li><a href="#tabs-gantt-ship-sim">出荷日程[Sim]</a></li>
            <li><a href="#tabs-gantt-proj-sim">プロジェクト[Sim]</a></li> -->
            </ul>
            <!-- 製作日程表(担当者)タブ -->
            <div id="tabs-gantt-prod-staff">
              <canvas id="canvas-prod-staff-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
              <canvas id="canvas-prod-staff-b" class="cvsganttcanvas" height="720"></canvas>
              <canvas id="canvas-prod-staff-c" class="cvsganttcanvas" height="720"></canvas>
              <ul id="contextmenu-prod-staff" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
                <li class="cmenu-item prodleaf leafcontextmenu uploadfile">関連ファイル...</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresult">実績入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu proddetailresult">実績詳細入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresultmaterial">材料使用量入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresultinspect01">確認項目入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresultinspect02">検査実績報告</li>
                <li class="cmenu-item prodleaf leafcontextmenu divideleaf">作業分割</li>
                <!-- <li class="cmenu-item prodleaf leafcontextmenu estimatestock">予想在庫表示</li> -->
              </ul>
            </div>
            <!-- 製作日程表(設備)タブ -->
            <div id="tabs-gantt-prod-equipment">
              <canvas id="canvas-prod-equipment-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
              <canvas id="canvas-prod-equipment-b" class="cvsganttcanvas" height="720"></canvas>
              <canvas id="canvas-prod-equipment-c" class="cvsganttcanvas" height="720"></canvas>
              <ul id="contextmenu-prod-equipment" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
                <li class="cmenu-item prodleaf leafcontextmenu uploadfile">関連ファイル...</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresult">実績入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu proddetailresult">実績詳細入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresultmaterial">材料使用量入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresultinspect01">確認項目入力</li>
                <li class="cmenu-item prodleaf leafcontextmenu prodresultinspect02">検査実績報告</li>
                <li class="cmenu-item prodleaf leafcontextmenu divideleaf">作業分割</li>
              </ul>
            </div>
            <!-- 出荷日程表タブ -->
            <div id="tabs-gantt-ship">
              <canvas id="canvas-ship-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
              <canvas id="canvas-ship-b" class="cvsganttcanvas" height="720"></canvas>
              <canvas id="canvas-ship-c" class="cvsganttcanvas" height="720"></canvas>
              <ul id="contextmenu-ship" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
                <!-- <li class="cmenu-item shipleaf leafcontextmenu uploadfile">関連ファイル...</li> -->
                <!-- <li class="cmenu-item shipleaf leafcontextmenu divideleaf">分割・結合</li> -->
                <!-- <li class="cmenu-item shipleaf leafcontextmenu estimatestock">予想在庫表示</li> -->
                <li class="cmenu-item shipleaf leafcontextmenu shipdetails">出荷詳細</li>
                <!-- <li class="cmenu-item shipleaf leafcontextmenu shipresult">実績入力</li> -->
              </ul>
            </div>
            <!-- プロジェクトタブ -->
            <div id="tabs-gantt-proj">
              <canvas id="canvas-proj-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
              <canvas id="canvas-proj-b" class="cvsganttcanvas" height="720"></canvas>
              <canvas id="canvas-proj-c" class="cvsganttcanvas" height="720"></canvas>
              <ul id="contextmenu-proj" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
                <li class="cmenu-item projleaf leafcontextmenu uploadfile">関連ファイル...</li>
                <li class="cmenu-item projleaf leafcontextmenu estimatestock">予想在庫表示</li>
              </ul>
            </div>
            <!-- 製作日程表(担当者)[シミュレーション]タブ -->
            <!-- <div id="tabs-gantt-prod-staff-sim">
            <p></p>
            <p></p>
            <canvas id="canvas-prod-staff-sim-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
            <canvas id="canvas-prod-staff-sim-b" class="cvsganttcanvas" height="720"></canvas>
            <canvas id="canvas-prod-staff-sim-c" class="cvsganttcanvas" height="720"></canvas>
            <ul id="contextmenu-prod-staff-sim" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
              <li class="cmenu-item prodleaf leafcontextmenu uploadfile">関連ファイル...</li>
              <li class="cmenu-item shipleaf leafcontextmenu divideleaf">分割・結合</li>
              <li class="cmenu-item prodleaf leafcontextmenu estimatestock">予想在庫表示</li>
            </ul>
          </div> -->
            <!-- 製作日程表(設備)[シミュレーション]タブ -->
            <!-- <div id="tabs-gantt-prod-equipment-sim">
            <p></p>
            <p></p>
            <canvas id="canvas-prod-equipment-sim-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
            <canvas id="canvas-prod-equipment-sim-b" class="cvsganttcanvas" height="720"></canvas>
            <canvas id="canvas-prod-equipment-sim-c" class="cvsganttcanvas" height="720"></canvas>
            <ul id="contextmenu-prod-equipment-sim" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
              <li class="cmenu-item prodleaf-sim leafcontextmenu uploadfile">関連ファイル...</li>
              <li class="cmenu-item prodleaf-sim leafcontextmenu divideleaf">分割・結合</li>
              <li class="cmenu-item prodleaf-sim leafcontextmenu estimatestock">予想在庫表示</li>
            </ul>
          </div> -->
            <!-- 出荷日程表[シミュレーション]タブ -->
            <!-- <div id="tabs-gantt-ship-sim">
            <p></p>
            <p></p>
            <canvas id="canvas-ship-sim-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
            <canvas id="canvas-ship-sim-b" class="cvsganttcanvas" height="720"></canvas>
            <canvas id="canvas-ship-sim-c" class="cvsganttcanvas" height="720"></canvas>
            <ul id="contextmenu-ship-sim" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
              <li class="cmenu-item shipleaf-sim leafcontextmenu uploadfile">関連ファイル...</li>
              <li class="cmenu-item shipleaf-sim leafcontextmenu divideleaf">分割・結合</li>
              <li class="cmenu-item shipleaf-sim leafcontextmenu estimatestock">予想在庫表示</li>
            </ul>
          </div> -->
            <!-- プロジェクト[シミュレーション]タブ -->
            <!-- <div id="tabs-gantt-proj-sim">
            <p></p>
            <p></p>
              <canvas id="canvas-proj-sim-a" class="cvsganttcanvas" height="720">Canvasの動作するブラウザでのみ表示できます</canvas>
              <canvas id="canvas-proj-sim-b" class="cvsganttcanvas" height="720"></canvas>
              <canvas id="canvas-proj-sim-c" class="cvsganttcanvas" height="720"></canvas>
              <ul id="contextmenu-proj-sim" class="task-contextmenu" data-schedulesid="-1" data-leafsid="-1">
                <li class="cmenu-item projleaf-sim leafcontextmenu estimatestock">予想在庫表示</li>
              </ul>
          </div> -->
          </div>
        </div>
        <div id="dialogs">
          <div id="dlg-upload" title="関連ファイル追加">
            <?php echo form_open_multipart('upload/do_upload', 'id="frm-upload"'); ?>
            <input name="leaftype" type="hidden" />
            <input name="leafsid" type="hidden" />
            <input type="file" name="userfile" size="20" />
            <br>
            <input type="submit" value="アップロード" />
            </form>
            <hr>
            <div>関連ファイル一覧:
              <ul id="filelist"></ul>
            </div>
          </div>
          <div id="dlg-insertleaf" title="リーフ新規登録">
            <?php echo form_open_multipart('ajax/insertleaf', 'id="frm-insertleaf"'); ?>
            <div id="insertleaf-keylist-leaf-details">
            </div>
            <div id="insertleaf-keylist-schedule-details">
            </div>
            <label for="leafassignableto">配置可能メンバー:</label><input name="leafassignableto" size="20"><br>
            <!--<label for="title">件名:</label>
            <input name="title" size="20" />
            <br>
            <label for="subtitle">詳細:</label>
            <input name="subtitle" size="20" />
            <br>-->
            <label for="requiredtime">予定時間[分]:</label><input name="requiredtime" size="20"><br>
            <!-- <input type="checkbox" name="autoplace-enabled">システムによる自動配置<br> -->
            <input type="submit" value="登録">
            </form>
          </div>
          <div id="dlg-editleaf" title="リーフ編集">
            <?php echo form_open_multipart('ajax/editleaf', 'id="frm-editleaf"'); ?>
            <input name="schedulesid" type="hidden" />
            <div id="editleaf-keylist">
            </div>
            <br>
            <input type="submit" value="更新" />
            </form>
          </div>
          <div id="dlg-prodresult" title="製造実績入力">
            <?php echo form_open_multipart('ajax/prodresult', 'id="frm-prodresult"'); ?>
            <input id="companycd" name="companycd" type="hidden" value="" />
            <input id="prodstartdate" name="prodstartdate" type="hidden" value="" />
            <input id="prodabortcnt" name="prodabortcnt" type="hidden" value="" />
            <input id="prodfinflg" name="prodfinflg" type="hidden" value="" />
            <!-- <input name="leafsid" type="hidden" />
            <div id="prodresult-keylist"> -->
            <ul>
              <li><label for="leafno">リーフID</label><input id="leafno" type="text" name="leafno" size="10" value="" readonly></li>
              <li><label for="prodplanno">製造指示No</label><input id="prodplanno" type="text" name="prodplanno" size="10" value="" readonly><input id="productname" type="text" name="productname" size="30" value="" readonly></li>
              <!-- <li><label for="productname">品名</label><input id="productname" type="text" name="productname" size="30" value="" readonly></li> -->
              <li><label for="process">工程</label><input id="process" type="text" name="process" size="10" value="" readonly></li>
              <li><label for="planinterval">予定時間</label><input id="planinterval" type="text" name="planinterval" size="5" value="" readonly>分</li>
              <li><label for="interval">報告済み</label><input id="interval" type="text" name="interval" size="5" value="" readonly>分</li>
              <li><label for="thisinterval">今回の報告時間</label><input id="thisinterval" type="text" name="thisinterval" size="5" title="" pattern="[0-9]+" value="">分</li>
              <li><label for="equipmentname">使用装置</label><input id="equipmentname" type="text" name="equipmentname" value="" readonly></li>
              <li><label for="start_dt">開始時間</label><input name="start_dt" type="text" readonly>
                <?php
                $js = 'onClick="dlgProdResultStartBtn()"';
                echo form_button('prodstartbtn', '開始', $js);
                ?>
              </li>
              <li><label for="finish_dt">終了時間</label><input name="finish_dt" type="text" readonly>
                <?php
                $js = 'onClick="dlgProdResultAbortBtn()"';
                echo form_button('prodabortbtn', '中断', $js);
                $js = 'onClick="dlgProdResultFinBtn()"';
                echo form_button('prodfinbtn', '完了', $js);
                ?>
              <li>
                <div id="prodrepored">【報告済】
                  <ul>
                    <li><label for="prodrepstartdt">開始時間</label><input name="prodrepstartdt" type="text" readonly></li>
                    <li><label for="prodrepfindt">完了時間</label><input name="prodrepfindt" type="text" readonly></li>
                    <li><label for="prodrepinterval">作業時間</label><input name="prodrepinterval" type="text" readonly></li>
                    <li><input type="checkbox" id="delreport" name="delete" value="">削除</li>
                  </ul>
                </div>
              </li>
              <!-- <div id="prodresult-reported-loadmsg">読込中...</div> -->
              <!-- <table id="prodresult-reported-table"></table>
            <div id="gridProdResult"></div></li> -->
            </ul>
            <input type="submit" value="更新" />
            <?php
            $js = 'onClick="dlgProdResultClose()"';
            echo form_button('prodcancelbtn', 'キャンセル', $js);
            ?>
            <!-- <button id="prodcancelbtn" type="button">キャンセル</button> -->
            <!-- <div><label>リーフID:</label><label id="leafno"><\label></div>
              <div><label>製造指示No:</label><label id="prodplanno"><\label></div>
              <div><label>品名:</label><label id="leafno"><\label></div>
              <div><label>報告済み</label>
                <table id="prodresult-reported-table"></table>
                <div id="gridProdResult"></div>
              </div> -->
            <!-- <div><label for="result_time">実績時間[分]:</label><input name="result_time" pattern="-*[0-9]+" size="20" /></div>
              <div><label for="start_date">製造開始日時:</label><input name="start_date" size="20" />
                <select name="start_date_hour">
                  <option value="0:00" selected="selected">0:00</option>
                  <option value="1:00">1:00</option>
                  <option value="2:00">2:00</option>
                  <option value="3:00">3:00</option>
                  <option value="4:00">4:00</option>
                  <option value="5:00">5:00</option>
                  <option value="6:00">6:00</option>
                  <option value="7:00">7:00</option>
                  <option value="8:00">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                </select>
              </div>
              <div><label for="finish_date">製造完了日時:</label><input name="finish_date" size="20" />
                <select name="finish_date_hour">
                  <option value="0:00" selected="selected">0:00</option>
                  <option value="1:00">1:00</option>
                  <option value="2:00">2:00</option>
                  <option value="3:00">3:00</option>
                  <option value="4:00">4:00</option>
                  <option value="5:00">5:00</option>
                  <option value="6:00">6:00</option>
                  <option value="7:00">7:00</option>
                  <option value="8:00">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                </select>
              </div>
              <div><label for="qty_good">良品数:</label><input name="qty_good" pattern="-*[0-9]+" size="20" /></div>
              <div><label for="qty_bad">不良品数:</label><input name="qty_bad" pattern="-*[0-9]+" size="20" /></div> -->
            <!--<label for="subtitle">備考:</label><input name="subtitle" size="20" />-->
            <!-- </div>
            <div id="prodresult-storages-loadmsg">読込中...</div>
            <table id="prodresult-storages-table"></table>
            <div id="gridProdResult"></div>
            <br> -->
            </form>
          </div>
          <div id="dlg-proddetailresult" title="製造実績詳細入力">
            <?php echo form_open_multipart('ajax/proddetailresult', 'id="frm-proddetailresult"'); ?>
            <table id="proddetailresult-table"></table>
            <div id="gridProdDetailResult"></div>
            <input type="submit" value="更新" />
            <?php
            $js = 'onClick="dlgProdDetailResultClose()"';
            echo form_button('prodcancelbtn', 'キャンセル', $js);
            ?>
          </div>
          <div id="dlg-prodresultmaterial" title="材料使用量入力">
            <?php echo form_open_multipart('ajax/prodresultmaterial', 'id="frm-prodresultmaterial"'); ?>
            <table id="prodresultmaterial-table"></table>
            <div id="gridProdResultMaterial"></div>
            <input type="submit" value="更新" />
            <?php
            $js = 'onClick="dlgprodresultmaterialClose()"';
            echo form_button('prodcancelbtn', 'キャンセル', $js);
            ?>
          </div>
          <div id="dlg-prodresultinspect01" title="確認項目結果入力">
            <?php echo form_open_multipart('ajax/prodresultinspect01', 'id="frm-prodresultinspect01"'); ?>
            <table id="prodresultinspect01-table"></table>
            <div id="gridProdResultInspect01"></div>
            <input type="submit" value="更新" />
            <?php
            $js = 'onClick="dlgprodresultinspect01Close()"';
            echo form_button('prodcancelbtn', 'キャンセル', $js);
            ?>
          </div>
          <div id="dlg-prodresultinspect02" title="検査実績入力">
            <?php echo form_open_multipart('ajax/prodresultinspect02', 'id="frm-prodresultinspect02"'); ?>
            <table id="prodresultinspect02-table"></table>
            <div id="gridProdResultInspect02"></div>
            <input type="submit" value="更新" />
            <?php
            $js = 'onClick="dlgprodresultinspect02Close()"';
            echo form_button('prodcancelbtn', 'キャンセル', $js);
            ?>
          </div>
          <!-- <div id="dlg-shipresult" title="出荷実績入力">
          <?php echo form_open_multipart('ajax/shipresult', 'id="frm-shipresult"'); ?>
            <input name="leafno" type="hidden" />
            <div id="shipresult-keylist">
              <div><label for="start_date">出荷開始日時:</label><input name="start_date" size="20" />
                <select name="start_date_hour">
                  <option value="0:00">0:00</option>
                  <option value="1:00">1:00</option>
                  <option value="2:00">2:00</option>
                  <option value="3:00">3:00</option>
                  <option value="4:00">4:00</option>
                  <option value="5:00">5:00</option>
                  <option value="6:00">6:00</option>
                  <option value="7:00">7:00</option>
                  <option value="8:00" selected="selected">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                </select>
              </div>
              <div><label for="finish_date">出荷完了日時:</label><input name="finish_date" size="20" />
                <select name="finish_date_hour">
                  <option value="0:00">0:00</option>
                  <option value="1:00">1:00</option>
                  <option value="2:00">2:00</option>
                  <option value="3:00">3:00</option>
                  <option value="4:00">4:00</option>
                  <option value="5:00">5:00</option>
                  <option value="6:00">6:00</option>
                  <option value="7:00">7:00</option>
                  <option value="8:00" selected="selected">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                </select>
              </div> -->
          <!-- <div><label for="qty_good">良品数:</label><input name="qty_good" pattern="-*[0-9]+" size="20" /></div>
              <div><label for="qty_bad">不良品数:</label><input name="qty_bad" pattern="-*[0-9]+" size="20" /></div> -->
          <!-- <label for="subtitle">備考:</label><input name="subtitle" size="20" />
            </div>
            <div id="shipresult-storages-loadmsg">読込中...</div>
            <div id="gridShipResult"></div> -->
          <!-- <div id="gridShipResult" style="font-size: 14px;"></div> -->
          <!-- <br>
            <input type="submit" value="更新" />
          </form>
        </div> -->
          <div id="dlg-calendar" title="カレンダー設定">
            <?php echo form_open_multipart('ajax/updatecalendar', 'id="frm-calendar"'); ?>
            <input name="leafsid" type="hidden" />
            <ul>
              <div id="calendar-keylist">
                <!-- <div>全体休日</div> -->
                <!-- <ul id="calendar-keylist"> -->
                <!-- <div id="calendar-keylist"> -->
                <!-- <p></p>
              <div>
                <li><label for="bt_date_start">開始日:</label><input name="bt_date_start" size="20" />
                </li>
              </div>
              <div>
                <li><label for="bt_date_end">終了日:</label><input name="bt_date_end" size="20" />
                </li>
              </div> -->
                <!-- <div id="holiday_choice">
              <label class="mdl-radio mdl-js-radio" for="radioHoliday01">
                <input type="radio" id="radioHoliday01" name="radioHoliday" class="mdl-radio__button"  value="1" checked>
                <span class="mdl-radio__label">休暇</span>
              </label>
              <label class="mdl-radio mdl-js-radio" for = "radioHoliday02">
                <input type="radio" id="radioHoliday02" name="radioHoliday" class="mdl-radio__button"  value="0" checked>
                <span class="mdl-radio__label">休暇解除</span>
              </label>
              </div> -->
                <!-- <div class="radioHoliday">
                <input id="radioHoliday01" type="radio" name="radioHoliday" value="1" checked>
                <label for="radioHoliday01">休暇</label>
                <input id="radioHoliday02" type="radio" name="radioHoliday" value="0">
                <label for="radioHoliday02">休暇解除</label>
              </div>
              <br>
              <input class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" type="submit" value="更新" />
              <p></p> -->
                <div>個人休日</div>
                <div>
                  <li><label for="bt_members_id">メンバーID:</label><select name="bt_members_id" id="bt_members_id"></select></li>
                </div>
                <div>
                  <li><label for="bt_date_start">開始日時:</label><input name="bt_date_start" size="20" />
                    <select name="bt_date_start_hour" id="bt_date_start_hour">
                      <!-- <li><label for="bt_datetime_start">開始日時:</label><input name="bt_datetime_start" size="20" />
                <select name="bt_datetime_start_hour" id="bt_datetime_start_hour"> -->
                      <!-- <li><label for="bt_start_hour">開始日時:</label> -->
                      <!-- <input name="bt_datetime_start" size="20" /> -->
                      <!-- <select name="bt_start_hour" id="bt_start_hour"> -->
                      <option value="0:00" selected>0:00</option>
                      <option value="1:00">1:00</option>
                      <option value="2:00">2:00</option>
                      <option value="3:00">3:00</option>
                      <option value="4:00">4:00</option>
                      <option value="5:00">5:00</option>
                      <option value="6:00">6:00</option>
                      <option value="7:00">7:00</option>
                      <option value="8:00">8:00</option>
                      <option value="9:00">9:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                      <option value="22:00">22:00</option>
                      <option value="23:00">23:00</option>
                    </select>
                  </li>
                  <div>
                    <div>
                      <li><label for="bt_date_end">終了日時:</label><input name="bt_date_end" size="20" />
                        <select name="bt_date_end_hour" id="bt_date_end_hour">
                          <!-- <li><label for="bt_datetime_end">終了日時:</label><input name="bt_datetime_end" size="20" />
                  <select name="bt_datetime_end_hour" id="bt_datetime_end_hour"> -->
                          <!-- <li><label for="bt_finish_hour">終了日時:</label>
                  <select name="bt_finish_hour" id="bt_finish_hour"> -->
                          <option value="0:00">0:00</option>
                          <option value="1:00">1:00</option>
                          <option value="2:00">2:00</option>
                          <option value="3:00">3:00</option>
                          <option value="4:00">4:00</option>
                          <option value="5:00">5:00</option>
                          <option value="6:00">6:00</option>
                          <option value="7:00">7:00</option>
                          <option value="8:00">8:00</option>
                          <option value="9:00">9:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="12:00">12:00</option>
                          <option value="13:00">13:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                          <option value="18:00">18:00</option>
                          <option value="19:00">19:00</option>
                          <option value="20:00">20:00</option>
                          <option value="21:00">21:00</option>
                          <option value="22:00">22:00</option>
                          <option value="23:00" selected>23:00</option>
                        </select>
                      </li>
                    </div>
                    <p></p>
                    <div class="radioHoliday">
                      <input id="radioHoliday01" type="radio" name="radioHoliday" value="1" checked>
                      <label for="radioHoliday01">休暇</label>
                      <input id="radioHoliday02" type="radio" name="radioHoliday" value="0">
                      <label for="radioHoliday02">休暇解除</label>
                    </div>
                  </div>
            </ul>
            <input type="submit" value="更新" />
            </form>
          </div>
          <!-- <div id="dlg-configure" title="設定">
          <?php echo form_open_multipart('ajax/configure', 'id="frm-configure"'); ?>
            <p>仮</p>
            <label>始業時間</label>
            <label>終業時間</label>
          </form>
        </div> -->
          <div id="dlg-divide" title="リーフ分割・結合">
            <?php echo form_open_multipart('ajax/divide', 'id="frm-divide"'); ?>
            <input name="leafsid" type="hidden" />
            <div id="divide-loadmsg">読込中...</div>
            <div id="gridDivide"></div>
            <br>
            <input type="submit" value="更新" />
            </form>
          </div>

          <div id="dlg-shipdetails" title="出荷詳細">
            <div id="shipdetail-loadmsg"></div>
            <div class="content">
              <div class="shipdetails-container">
                <table>
                  <tr>
                    <td class="padding-right hide-border">受注先名</td>
                    <td class="customer-name"></td>
                  </tr>
                  <tr>
                    <td class="padding-right hide-border">受注客先番号(客先No/受注No)</td>
                    <td class="order-number"></td>
                  </tr>
                  <tr>
                    <td class="padding-right hide-border">出荷主</td>
                    <td class="shipper-name"></td>
                  </tr>
                  <tr>
                    <td class="padding-right hide-border">納入先</td>
                    <td class="delivery-name"></td>
                  </tr>
                  <tr>
                    <td class="padding-right hide-border">止め先</td>
                    <td class="stay-name"></td>
                  </tr>
                </table>
              </div>

              <div class="shipproductdetail-container">
                <table>
                  <thead>
                    <tr>
                      <td class="head">品名</td>
                      <td class="head">加工内容</td>
                      <td class="head">線径①</td>
                      <td class="head">線厚み①</td>
                      <td class="head">線径②</td>
                      <td class="head">線厚み②</td>
                      <td class="head">W</td>
                      <td class="head">L</td>
                      <td class="head">単位</td>
                      <td class="head">寸法①</td>
                      <td class="head">寸法①補足</td>
                      <td class="head">寸法②</td>
                      <td class="head">寸法②補足</td>
                      <td class="head">出荷予定数</td>
                      <td class="head">単位</td>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>

              <!-- <div class="shipdetail-remarks">
              <div class="title">備考</div>
              <textarea class="remarks"></textarea>
            </div>

            <div class="shipdetails-buttons-container">
              <button class="register-button" type="button">登録</button>
              <button class="close-button" type="button">閉じる</button>
            </div> -->
            </div>
          </div>

          <div id="dlg-search" title="検索結果">
            <div id="search-amount">検索結果:</div>
            <select size="20" id="lb-search"></select>
          </div>
          <div id="dlg-jumpdate" title="指定日付表示">
            <input id="dp-jumpdate" type="text" value="" size="12">
          </div>
          <div id="dialog-loadfactor-graph" title="稼働率表示">
            <div id="loadfactor-graph-wait">
              <div style="text-align:center;">集計中。しばらくお待ちください...</div>
              <div id="loadfactor-graph-progressbar"></div>
            </div>
            <canvas id="loadfactor-chart" width="400px" height="400px"></canvas>
          </div>
          <div id="dialog-currentstock-graph" title="現在在庫数表示">
            <div id="currentstock-graph-wait">
              <div style="text-align:center;">集計中。しばらくお待ちください...</div>
              <div id="currentstock-graph-progressbar"></div>
            </div>
            <canvas id="currentstock-chart" width="400px" height="400px"></canvas>
          </div>
          <div id="dialog-estimatestock-graph" title="予想在庫数表示">
            <div id="estimatestock-graph-wait">
              <div style="text-align:center;">集計中。しばらくお待ちください...</div>
              <div id="estimatestock-graph-progressbar"></div>
            </div>
            <canvas id="estimatestock-chart" width="400px" height="400px"></canvas>
          </div>
        </div>
        <div id="footer">
          <hr>
          <div>
            <span>Copyright (C) 2018 SysDevLink Corp. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>

</html>