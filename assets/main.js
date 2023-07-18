'use strict';

/**
 * @fileOverview 工程表メイン処理
 * @author Fumihiko Kondo
 */

/**
 * 工程表画面のメインオブジェクト
 * @type {WSAPP}
 */
var ws = new WSAPP();

/** ブラウザの情報 */
var userAgent = window.navigator.userAgent.toLowerCase();
var isIE = (userAgent.indexOf('msie') != -1) || (userAgent.indexOf('trident/7.0') > -1);

/** タイマのカウント(画面処理用) */
var timerCnt = 0;
/** タイマのカウント(再読込処理用) */
var timerReload = 0;
/** Ajax時のURLの先頭部分 */
var ajaxUrl = '';

// 初期化処理
$(function () {
  $('#tabs-gantt')['tabs']({
    'active': 0,
    'activate': function (event, ui) {
      ws.refreshView();
      ws.gts.prodStaff.toggleContextmenu(false);
      ws.gts.prodEquipment.toggleContextmenu(false);
      ws.gts.ship.toggleContextmenu(false);
      ws.gts.proj.toggleContextmenu(false);
      // ws.gts.prodStaffSim.toggleContextmenu(false);
      // ws.gts.prodEquipmentSim.toggleContextmenu(false);
      // ws.gts.shipSim.toggleContextmenu(false);
      // ws.gts.projSim.toggleContextmenu(false);
      
      var actGant = ws.getActiveGantt();
      actGant.scrollTableXAbs(showDate);
    }
  });
  // 自動整列のフラグセット
  // 後工程自動整列
  ws.swAutoplaceParent = $('#switch-autoplace-parent');
  // 前工程自動整列
  ws.swAutoplaceChild = $('#switch-autoplace-child');
  // 配置行自動整列
  ws.swAutoplaceSamerow = $('#switch-autoplace-samerow');
  // 影響行自動整列
  ws.swAutoplaceAffectedrow = $('#switch-autoplace-affectedrow');
  // 実績入力時整列
  ws.swAutoplaceResult = $('#switch-autoplace-result');

  ws.gts.prodStaff.initElems('canvas-prod-staff-a', 'canvas-prod-staff-b', 'canvas-prod-staff-c', 'contextmenu-prod-staff');
  ws.gts.prodStaff.v.title = '製作日程表(人員)';
  ws.gts.prodStaff.v.axistype = 1;
  ws.gts.prodStaff.checkWorkableHour = checkWorkableHourFunc;

  ws.gts.prodEquipment.initElems('canvas-prod-equipment-a', 'canvas-prod-equipment-b', 'canvas-prod-equipment-c', 'contextmenu-prod-equipment');
  ws.gts.prodEquipment.v.title = '製作日程表(設備)';
  ws.gts.prodEquipment.v.axistype = 2;
  ws.gts.prodEquipment.checkWorkableHour = checkWorkableHourFunc;

  ws.gts.ship.initElems('canvas-ship-a', 'canvas-ship-b', 'canvas-ship-c', 'contextmenu-ship');
  ws.gts.ship.v.title = '出荷日程表';
  ws.gts.ship.v.axistype = 0;   // 縦軸参照なし
  // ws.gts.ship.checkWorkableHour = checkWorkableHourFunc;

  ws.gts.proj.initElems('canvas-proj-a', 'canvas-proj-b', 'canvas-proj-c', 'contextmenu-proj');
  ws.gts.proj.v.title = 'プロジェクト';
  ws.gts.proj.v.axistype = -1;
  ws.gts.proj.checkWorkableHour = checkWorkableHourFunc;

  // ws.gts.prodStaffSim.initElems('canvas-prod-staff-sim-a', 'canvas-prod-staff-sim-b', 'canvas-prod-staff-sim-c', 'contextmenu-prod-staff-sim');
  // ws.gts.prodStaffSim.v.title = '製作日程表(人員)[シミュレーション]';
  // ws.gts.prodStaffSim.v.axistype = 1;
  // ws.gts.prodStaffSim.checkWorkableHour = checkWorkableHourFunc;
  // ws.gts.prodStaffSim.v.fixval.LOADING_MSG = 'メニューの[シミュレーション]で新規シミュレーションを開始...';

  // ws.gts.prodEquipmentSim.initElems('canvas-prod-equipment-sim-a', 'canvas-prod-equipment-sim-b', 'canvas-prod-equipment-sim-c', 'contextmenu-prod-equipment-sim');
  // ws.gts.prodEquipmentSim.v.title = '製作日程表(設備)[シミュレーション]';
  // ws.gts.prodEquipmentSim.v.axistype = 2;
  // ws.gts.prodEquipmentSim.checkWorkableHour = checkWorkableHourFunc;
  // ws.gts.prodEquipmentSim.v.fixval.LOADING_MSG = 'メニューの[シミュレーション]で新規シミュレーションを開始...';

  // ws.gts.shipSim.initElems('canvas-ship-sim-a', 'canvas-ship-sim-b', 'canvas-ship-sim-c', 'contextmenu-ship-sim');
  // ws.gts.shipSim.v.title = '出荷日程表[シミュレーション]';
  // ws.gts.shipSim.v.fixval.LOADING_MSG = 'メニューの[シミュレーション]で新規シミュレーションを開始...';

  // ws.gts.projSim.initElems('canvas-proj-sim-a', 'canvas-proj-sim-b', 'canvas-proj-sim-c', 'contextmenu-proj-sim');
  // ws.gts.projSim.v.title = 'プロジェクト[シミュレーション]';
  // ws.gts.projSim.v.axistype = -1;
  // ws.gts.projSim.v.fixval.LOADING_MSG = 'メニューの[シミュレーション]で新規シミュレーションを開始...';
  initChartConfig();
  // 選択用メニュー
  $('.task-contextmenu')['menu']({
    'items': '.cmenu-item'
  }).css({
    'opacity': '0.95'
  });
  // 稼働率読込時待機表示
  $('#loadfactor-graph-wait').hide();
  $('#loadfactor-graph-progressbar')['progressbar']({
    'value': false
  });
  $('#currentstock-graph-progressbar')['progressbar']({
    'value': false
  });
  // アップロードダイアログ
  $('#dlg-upload')['dialog']({
    'autoOpen': false,
    'height': 300,
    'width': 500,
    'modal': true
  });
  // アップロード確定処理
  $('#frm-upload').submit(function (e) {
    e.preventDefault();
    var fd = new FormData($('#frm-upload').get(0));
    $.ajax({
      url: $('#frm-upload').attr('action'),
      type: 'post',
      data: fd,
      cache: false,
      contentType: false,
      processData: false,
      dataType: 'html'
    }).done(function (data, textStatus, jqXHR) {
      window.alert(data);
      showAttachmentsList($('#frm-upload [name=leafsid]').val());
    }).fail(function (jqXHR, textStatus, errorThrown) {
      window.alert('アップロードに失敗しました');
    });
  });
  // リーフ編集ダイアログ
  $('#dlg-editleaf')['dialog']({
    'autoOpen': false,
    'height': 300,
    'width': 400,
    'modal': true
  });
  // 編集内容確定処理
  $('#frm-editleaf').submit(function (e) {
    e.preventDefault();
    var dat = {
      'schedulesid': $('input[name^=schedulesid]').val()
    };
    convertInputForm('#editleaf-keylist', dat);
    ajaxEditLeaf(dat);
    $('#dlg-editleaf')['dialog']('close');
  });
  // 製造実績入力ダイアログ
  $('#dlg-prodresult')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true
  });
  // 製造実績入力内容確定処理
  $('#frm-prodresult').submit(function (e) {
    e.preventDefault();    
    // 前回データを削除するか
    let bMod = document.getElementById('delreport').checked;
    // 完了フラグ
    let bFin = $('#frm-prodresult input[name=prodfinflg]').val();
    if (bFin === '') {
      bFin = false;
    }
    // 前回データ削除のみの更新だった場合
    if (!WSUtils.isSet($('#frm-prodresult input[name=thisinterval]').val()) && !bMod) {
      alert('今回の時間が取得できませんでした。終了時間をセットしてください。');
      return;
    }
    if (!WSUtils.isSet($('#frm-prodresult input[name=start_dt]').val()) && !bMod) {
      alert('開始時間をセットしてください。');
      return;
    }
    var leafsid = $('#frm-prodresult input[name=leafno]').val();
    var lf = ws.gts.prodStaff.getItemByLeafsId(leafsid);
    
     /**
      * 各値のvalidation　工程開始時間がセットされていたらそちらを優先
        終了日時がはいっていなかったら、intervalから計算
        今回の実績時間と、開始日時は必須入力項目＆画面上で入力確認済み。つまり、開始日時と実績時間を優先とする。
    **/
    let start = WSUtils.convertDlgStringToDate($('#frm-prodresult input[name=prodstartdate]').val());  
    let start2 = WSUtils.convertDlgStringToDate($('#frm-prodresult input[name=start_dt]').val());
    let finish = WSUtils.convertDlgStringToDate($('#frm-prodresult input[name=finish_dt]').val());
    if (WSUtils.compareHours(start, start2) > 0) {
      // 工程開始時間を優先
      start2 = start;
    }
    if (finish.getTime() === new Date(0).getTime()) {
      // データが入力されていないため、時間データからデータを算出する
      finish = start;
      finish = finish.setMinutes(finish.getMinutes() + Number($('#frm-prodresult input[name=thisinterval]').val()));
      finish = new Date(finish);
    } else {
      if ($('#frm-prodresult input[name=prodabortcnt]').val() > 0) {
        // 中断回数が0より大きければそのまま
      } else {
        // 中断回数が無しならば、今回の実績時間に合わせる
        finish = start;
        finish = finish.setMinutes(finish.getMinutes() + Number($('#frm-prodresult input[name=thisinterval]').val()));
        finish = new Date(finish);
      }
    }
    // String型に整形 
    let strStart = '';
    let strFinish = '';
    if(start.getTime() > new Date(0).getTime()) {
      strStart = WSUtils.makeDateString(start);
    }
    if(finish.getTime() > new Date(0).getTime()) {
      strFinish = WSUtils.makeDateString(finish);
    }

    var dat = {
      'delreport': String(bMod),
      'finflg': String(bFin),
      'companycd': $('#frm-prodresult input[name=companycd]').val(),
      'leafno': $('#frm-prodresult input[name=leafno]').val(),
      'interval': $('#frm-prodresult input[name=thisinterval]').val(),
      'startdate': strStart,
      'finishdate': strFinish,
      'abortcnt': $('#frm-prodresult input[name=prodabortcnt]').val(),
    };
    ajaxInsertprodresult(dat);
    // 実績時間をリーフデータにセット
    lf.data['l_pd_real_interval'] = lf.data['l_pd_real_interval'] + Number(dat['interval']);
    lf.start_date = start;
    lf.finish_date = finish;
    
    // 実績入力時の後続リーフ整列処理を実行
    var gt = ws.getActiveGantt();
    var queue = ws.getQueue(gt);
    queue.push(lf);
    doAutoplaceByResult(gt, lf);
    // リーフ配置時に影響したリーフについてDBを更新
    ajaxUpdateProdLeafPlans(queue, gt);
    // 別画面で対応するリーフの内容を更新しておく
    queue.forEach(function (elem) {
      var lfEquipment = ws.gts.prodEquipment.getItemByLeafsId(elem.leafs_id);
      lfEquipment.members_id = elem.members_id;
      var lfProject = ws.gts.proj.getItemByLeafsId(elem.leafs_id);
      lfProject.members_id = elem.members_id;
    });
    queue.splice(0);
    
    // 完了フラグリセット
    $('#frm-prodresult input[name=prodfinflg]').val('');
    // 工程開始日時をリセット
    $('#frm-prodresult input[name=prodstartdate]').val('');
    ws.refreshView();
    $('#dlg-prodresult')['dialog']('close');
  });
  // 製造詳細実績ダイアログ
  $('#dlg-proddetailresult')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true
  });  
  // 材料使用量登録ダイアログ
  $('#dlg-prodresultmaterial')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true
  });  
  // 確認項目入力ダイアログ
  $('#dlg-prodresultinspect01')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true
  });
  // 検査実績入力ダイアログ
  $('#dlg-prodresultinspect02')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true
  });
  // // 出荷実績入力ダイアログ
  // $('#dlg-shipresult')['dialog']({
  //   'autoOpen': false,
  //   'height': 480,
  //   'width': 640,
  //   'modal': true
  // });
  // 出荷実績入力内容確定処理
  // $('#frm-shipresult').submit(function (e) {
  //   e.preventDefault();
  //   // 出荷実績自体は様式にて報告を上げる
  //   // 出荷詳細で、対象枝番の製品を表示する。
  //   // need modify  @sono 20200807
  //   // var dat = {
  //   //   'leafs_id': $('#frm-shipresult input[name^=leafsid]').val(),
  //   //   'qty_good': $('#frm-shipresult input[name^=qty_good]').val(),
  //   //   'qty_bad': $('#frm-shipresult input[name^=qty_bad]').val(),
  //   //   'start_date': $('#frm-shipresult input[name^=start_date]').val() +
  //   //     ' ' + $('#frm-shipresult select[name^=start_date_hour]').val() + ':00',
  //   //   'finish_date': $('#frm-shipresult input[name^=finish_date]').val() +
  //   //     ' ' + $('#frm-shipresult select[name^=finish_date_hour]').val() + ':00',
  //   // };
  //   // ajaxInsertshipresult(dat);
  //   $('#dlg-shipresult')['dialog']('close');
  // });
  // カレンダーダイアログ
  $('#dlg-calendar')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true
  });
  // カレンダーダイアログ等日時指定用入力部
  $('#frm-calendar input[name^=bt_date_start],' +
    '#frm-calendar input[name^=bt_date_end],' +
    '#frm-prodresult input[name^=finish_date],' +
    '#frm-shipresult input[name^=finish_date]')['datepicker']({
      'dateFormat': 'yy-mm-dd',
      'minDate': '2018-01-01',
      'maxDate': '2028-12-31',
    }).val($['datepicker']['formatDate']('yy-mm-dd', new Date()));
  
  // カレンダー設定処理
  $('#frm-calendar').submit(function (e) {
    e.preventDefault(); 
    var dat = {
      'bt_date_start': $('#frm-calendar input[name^=bt_date_start]').val() +
      ' ' + $('#frm-calendar select[name^=bt_date_start_hour]').val() + ':00',
    'bt_date_end': $('#frm-calendar input[name^=bt_date_end]').val() +
      ' ' + $('#frm-calendar select[name^=bt_date_end_hour]').val() + ':00',
    'bt_members_id': $('#frm-calendar select[name^=bt_members_id]').val(),
      'bt_holiday': $('#frm-calendar input[name=radioHoliday]:checked').val(),
    
      // 'bt_date_start': $('#frm-calendar input[name^=bt_date_start]').val(),
      // 'bt_date_end': $('#frm-calendar input[name^=bt_date_end]').val(),
      // 'bt_members_id': $('#frm-calendar select[name^=bt_members_id]').val(),
      // 'bt_holiday': $('#frm-calendar input[name=radioHoliday]:checked').val(),
      // 'bt_start_hour': $('#frm-calendar select[name^=bt_start_hour]').val(),
      // 'bt_finish_hour': $('#frm-calendar select[name^=bt_finish_hour]').val(),
      // 'bt_date_start': $('#frm-calendar input[name^=bt_date_start]').val() + ' ' + '00:00',
      // 'bt_date_end': $('#frm-calendar input[name^=bt_date_end]').val() + ' ' + '00:00',
      // 'bt_members_id': $('#frm-calendar select[name^=bt_members_id]').val(),
      // 'bt_holiday': $('#frm-calendar input[name=radioHoliday]:checked').val(),
      // 'bt_datetime_start': $('#frm-calendar input[name^=bt_datetime_start]').val() +
      //   ' ' + $('#frm-calendar select[name^=bt_date_starttime_hour]').val() + ':00',
      // 'bt_datetime_end': $('#frm-calendar input[name^=bt_datetime_end]').val() +
      //   ' ' + $('#frm-calendar select[name^=bt_date_datetime_end_hour]').val() + ':00',
      // 'bt_date_start': $('#frm-calendar input[name^=bt_date_start]').val() +
      //   ' ' + $('#frm-calendar select[name^=bt_date_start_hour]').val() + ':00',
      // 'bt_date_end': $('#frm-calendar input[name^=bt_date_end]').val() +
      //   ' ' + $('#frm-calendar select[name^=bt_date_end_hour]').val() + ':00',
      // 'bt_members_id': $('#frm-calendar select[name^=bt_members_id]').val(),
      // 'bt_holiday': $('#frm-calendar input[name=radioHoliday]:checked').val(),
    };
    ajaxUpdateCalendar(dat); 
    // ajaxUpdateCalendar(dat, function () {
    //   ajaxReload();
    //   window.alert('登録が完了しました。');
    // });
    //$('#dlg-calendar')['dialog']('close');
  });
  $('#dlg-calendar')['dialog']({
    close: function (event, ui) {
      // 画面リフレッシュ
      // $('option').attr('selected', false);
      // $('input:radio').attr('checked', false);
      // $('#bt_start_hour').val('0:00');
      // $('#bt_finish_hour').val('23:00');
      // $('input[name=radioHoliday]').val(['1']);
      $('#bt_date_start_hour').val('0:00');
      $('#bt_date_end_hour').val('23:00');
      $('input[name=radioHoliday').val(['1']);
    }
  });
  
  // 設定ダイアログ
  $('#dlg-configure')['dialog']({
    'autoOpen': false,
    'height': 480,
    'width': 640,
    'modal': true,
    
    close: function (event, ui) {
    }
  });

  // リーフ分割・結合ダイアログ
  $('#dlg-divide')['dialog']({
    'autoOpen': false,
    'height': 580,
    'width': 950,
    'modal': true
  });
  // リーフ分割・結合処理
  $('#frm-divide').submit(function (e) {
    e.preventDefault();
    var lfs = $('#gridDivide')['jsGrid']('option', 'data');
    var combineRows = lfs.filter(function (elem) {
      return elem['do_combine'] === true;
    });
    if (combineRows.length > 0) {
      var invalidRows = lfs.filter(function (elem) {
        return elem['result_num'] > 0;
      });
      if (invalidRows.length > 0) {
        window.alert('実績入力済みのリーフを結合することはできません。');
        return;
      }
      if (combineRows.length < 2) {
        window.alert('結合するリーフを2つ以上選択してください。');
        return;
      }
    }
    var dat = {
      'leaftype': ws.getActiveGantt().id,
      'leafs': lfs,
    };
    $.ajax({
      'url': $('#frm-divide').attr('action'),
      'type': 'post',
      'data': {
        'json': JSON.stringify(dat)
      },
      'success': function (data) {
        reloadTabLeafs(dat['leaftype']);
      }
    });
    $('#dlg-divide')['dialog']('close');
  });
  // 出荷詳細ダイアログ
  $('#dlg-shipdetails')['dialog']({
    'autoOpen': false,
    'height': 500,
    'width': 1500,
    'modal': true
  });
  // リーフ検索ダイアログ
  $('#dlg-search')['dialog']({
    'autoOpen': false,
    'height': 600,
    'width': 800,
    'modal': true
  });
  // コンテキストメニュータスク内容編集ボタン
  $('.leafcontextmenu.editleaf').on('click', function () {
    ws.openEditLeafDlg();
  });
  // コンテキストメニュー製造実績登録ボタン
  $('.leafcontextmenu.prodresult').on('click', function () {
    ws.openProdResultDlg();
  });
  // コンテキストメニュー製造実績詳細登録
  $('.leafcontextmenu.proddetailresult').on('click', function () {
    ws.openProdDetailResultDlg();
  });
  // コンテキストメニュー原料使用量登録
  $('.leafcontextmenu.prodresultmaterial').on('click', function () {
    alert('材料使用量');
    ws.openProdDetailResultDlg();
    // ws.openProdResultDlg();
  });
  // コンテキストメニュー確認項目入力
  $('.leafcontextmenu.prodresultinspect01').on('click', function () {
    alert('確認項目');
    ws.openProdDetailResultDlg();
    // ws.openProdResultDlg();
  });
  // コンテキストメニュー検査実績報告
  $('.leafcontextmenu.prodresultinspect02').on('click', function () {
    alert('検査実績報告');
    ws.openProdResultDlg();
    // ws.openProdResultDlg();
  });
  // コンテキストメニュー出荷実績登録ボタン
  $('.leafcontextmenu.shipresult').on('click', function () {
    ws.openShipResultDlg();
  });
  // コンテキストメニュー関連ファイルボタン
  $('.leafcontextmenu.uploadfile').on('click', function () {
    ws.openUploadFileDlg();
  });
  // コンテキストメニュー自動配置ボタン
  $('.leafcontextmenu.autoplaceleaf').on('click', function () {
    ws.execAutoPlaceLeaf();
  });
  // コンテキストメニュー予想在庫ボタン
  $('.leafcontextmenu.estimatestock').on('click', function () {
    ws.countEstimateStock();
  });
  // コンテキストメニューリーフ分割・結合ボタン
  $('.leafcontextmenu.divideleaf').on('click', function () {
    ws.openDivideLeafDlg();
  });
  // コンテキストメニュー出荷詳細ボタン
  $('.leafcontextmenu.shipdetails').on('click', function () {
    ws.openShipdetailsDlg();
  });
  // リーフ新規登録ダイアログ
  $('#dlg-insertleaf')['dialog']({
    'autoOpen': false,
    'width': 400,
    'height': 300,
    'modal': true
  });

  // 出荷詳細画面 登録ボタン押下イベント ※実績登録は行わないため、コメントアウト予定
  $('#dlg-shipdetails .register-button').on('click', function () {
    var leafNo = $('#contextmenu-ship').data('leaf-no');
    var remarks = $('#dlg-shipdetails .shipdetail-remarks textarea').val();
    var estimatedShippingQuantity = [];
    var actualQuantity = [];

    // 出荷予定数量の配列作成
    $('#dlg-shipdetails .shipproductdetail-container tbody tr .estimated-shipping-quantity').each(function (index) {
      estimatedShippingQuantity.push($(this).data('value'));
    });

    // 実績数量の配列作成
    $('#dlg-shipdetails .shipproductdetail-container tbody tr .actual-quantity').each(function (index) {
      actualQuantity.push($(this).children('input').val());
    });

    // 出荷予定数量と実績数量が同じであることを判定
    var isError = false;
    estimatedShippingQuantity.forEach(function (elm, i) {
      if (elm !== actualQuantity[i]) {
        isError = true;
      }
    })

    // 予定数量と実績数量が異なる場合、エラーポップアップ表示
    if (isError) {
      alert('出荷数が異なります。実績数量を確認してください。');
      return false;
    }
    // 出荷詳細情報の更新処理
    ajaxupdateshipdetails(leafNo, remarks, ws.gts.ship.toggleContextmenu);
  });

  // 出荷詳細画面 キャンセルボタン押下イベント
  $('#dlg-shipdetails .close-button').on('click', function () {
    $('#dlg-shipdetails')['dialog']('close');
    ws.gts.ship.toggleContextmenu(false);
  });


  // 新規登録内容確定処理
  $('#frm-insertleaf').submit(function (e) {
    e.preventDefault();
    var leafAssignableTo;
    try {
      leafAssignableTo = String($('input[name^=leafassignableto]').val()).split(',');
    } catch (error) {
      window.alert('配置可能メンバーのIDを正しく指定してください');
      return;
    }
    var dat = {
      'requiredtime': Number($('input[name^=requiredtime]').val()),
      'leafassignableto': leafAssignableTo,
      //'autoplace-enabled': $('[name^=autoplace-enabled]').prop('checked'),
      'leafdetails': {},
      'scheduledetails': {}
    };
    convertInputForm('#insertleaf-keylist-leaf-details', dat['leafdetails']);
    convertInputForm('#insertleaf-keylist-schedule-details', dat['scheduledetails']);
    ajaxInsertNewLeaf(dat);
    $('#dlg-insertleaf')['dialog']('close');
  });
  // 新規登録ボタン
  $('#header-menu-insertleaf').on('click', function () {
    // 入力欄出力及び入力形式を設定して、新規登録ダイアログを開く
    $('#insertleaf-keylist-leaf-details').empty();
    ws.m.d.leaf_details.forEach(function (elem) {
      $('#insertleaf-keylist-leaf-details').append($.parseHTML('<div><label for="' + elem['colkey'] +
        '">' + elem['coldesc'] +
        ':</label><input name="' + elem['colkey'] + '" size="20" value="" data-coltype="' + elem['coltype'] + '" /></div>'));
    });
    $('#insertleaf-keylist-schedule-details').empty();
    ws.m.d.schedule_details.forEach(function (elem) {
      $('#insertleaf-keylist-schedule-details').append($.parseHTML('<div><label for="' + elem['colkey'] +
        '">' + elem['coldesc'] +
        ':</label><input name="' + elem['colkey'] + '" size="20" value="" data-coltype="' + elem['coltype'] + '" /></div>'));
    });
    assignInputsForm('#insertleaf-keylist-leaf-details, #insertleaf-keylist-schedule-details');
    $('input[name^=leafassignableto]').val('1,6');
    $('input[name^=requiredtime]').val('600');
    $('#dlg-insertleaf')['dialog']('open');
  });
  // 日付ジャンプダイアログ
  $('#dlg-jumpdate')['dialog']({
    'autoOpen': false,
    'width': 200,
    'height': 100,
    'modal': true
  });
  // 表示日付選択欄(日付指定で対象位置へ画面表示移動)
  $('#dp-jumpdate')['datepicker']({
    'dateFormat': 'yy-mm-dd',
    'minDate': '2018-01-01',
    'maxDate': '2028-12-31',
    'onSelect': function (dateText, inst) {
      // 指定日付表示処理
      var selectedDate = new Date(dateText);
      ws.getActiveGantt().scrollTableXAbs(selectedDate);
      ws.gts.prodStaff.scrollTableXAbs(selectedDate);
      ws.gts.prodEquipment.scrollTableXAbs(selectedDate);
      ws.gts.ship.scrollTableXAbs(selectedDate);
      ws.gts.proj.scrollTableXAbs(selectedDate);
      // ws.gts.prodEquipmentSim.scrollTableXAbs(selectedDate);
      // ws.gts.prodStaffSim.scrollTableXAbs(selectedDate);
      // ws.gts.shipSim.scrollTableXAbs(selectedDate);
      // ws.gts.projSim.scrollTableXAbs(selectedDate);

      $(this)['datepicker']('hide');
      $('#dlg-jumpdate')['dialog']('close');
      //$('.mdl-layout__drawer').toggleClass('is-visible');
      document.querySelector('.mdl-layout')['MaterialLayout']['toggleDrawer']();
    }
  }).val($['datepicker']['formatDate']('yy-mm-dd', new Date()));
  // 画面サイズ変更対応
  $(window).resize(function () {
    ws.refreshView();
  });
  // // 横軸切替ボタン
  // $('.link-leftaxis').on('click', function (event) {
  //   // 軸種類が-1の場合、プロジェクト表示。1以上の場合は役割別表示
  //   ws.getActiveGantt().v.axistype = Number($(this).attr('data-leftaxis'));
  //   reloadTabLeafs(ws.getActiveGantt().id); //ajaxReload();
  // });
  // 日付範囲切り替え
  $('.link-datespan').on('click', function (event) {
    ws.getActiveGantt().v.col = Number($(this).attr('data-span'));
    // 全画面対応
    ws.gts.prodStaff.v.col = Number($(this).attr('data-span'));
    // ws.gts.prodStaffSim.v.col = Number($(this).attr('data-span'));
    ws.gts.prodEquipment.v.col = Number($(this).attr('data-span'));
    // ws.gts.prodEquipmentSim.v.col = Number($(this).attr('data-span'));
    ws.gts.proj.v.col = Number($(this).attr('data-span'));
    // ws.gts.projSim.v.col = Number($(this).attr('data-span'));
    ws.gts.ship.v.col = Number($(this).attr('data-span'));
    // ws.gts.shipSim.v.col = Number($(this).attr('data-span'));

    ws.refreshView();
    reloadTabLeafs(ws.getActiveGantt().id); //ajaxReload();
  });
  // アンドゥ処理
  $('#header-menu-undo').on('click', function (event) {
    ajaxUndoPlacing(ws.getActiveGantt(), function () {
      reloadTabLeafs(ws.getActiveGantt().id);
      window.alert('直前の配置操作を取り消しました。');
    });
  });
  // カレンダー設定ダイアログ
  $('#dlg-insertleaf')['dialog']({
    'autoOpen': false,
    'width': 400,
    'height': 300,
    'modal': true
  });
  // 時間範囲切り替え
  $('.link-hourspan').on('click', function () {
    var gt = ws.getActiveGantt();
    if (Number($(this).attr('data-span')) === 1) {
      gt.v.fixval.DAY_ST_HOUR = Number(ws.m.d.wbsctrl[0]['day_st_hour']); // 8
      gt.v.fixval.DAY_EN_HOUR = Number(ws.m.d.wbsctrl[0]['day_en_hour']); // 20
    } else {
      gt.v.fixval.DAY_ST_HOUR = 0;
      gt.v.fixval.DAY_EN_HOUR = 24;
    }
    ws.refreshView();
  });
  // 日付表示指定移動
  $('.jumpdatedialog').on('click', function (event) {
    $('#dp-jumpdate')['datepicker']().val(
      $['datepicker']['formatDate']('yy-mm-dd', ws.getActiveGantt().v.displayingDate)
    );
    $('#dlg-jumpdate')['dialog']('open');
  });
  // エクセル出力1
  $('.outputexcel-leaf-type1').on('click', function (event) {
    exportToExcel('book_template1');
  });
  // エクセル出力2
  $('.outputexcel-leaf-type2').on('click', function (event) {
    exportToExcel('book_template2');
  });
  // 日付別稼働率表示
  $('.count-leaf-day').on('click', function (event) {
    countLeaf(ws.getActiveGantt());
  });
  // 現在在庫数表示
  $('.count-current-stock').on('click', function (event) {
    countCurrentStock();
  });
  // シミュレーション開始
  $('.start-sim').on('click', function (event) {
    ajaxStartSim();
  });
  // カレンダー設定ダイアログ
  $('.set-calendar').on('click', function (event) {
    $('#frm-calendar select[name^=bt_members_id]').empty();
    $('#frm-calendar select[name^=bt_members_id]').append($('<option>').html(
      WSUtils.escapeHtml('(全メンバー)')).val(''));
    ws.gts.prodStaff.v.rowdata.forEach(function (elem) {
      $('#frm-calendar select[name^=bt_members_id]').append($('<option>').html(
        WSUtils.escapeHtml(elem['title'])).val(elem['id']));
    });
    ws.gts.prodEquipment.v.rowdata.forEach(function (elem) {
      $('#frm-calendar select[name^=bt_members_id]').append($('<option>').html(
        WSUtils.escapeHtml(elem['title'])).val(elem['id']));
    });
    $('#dlg-calendar')['dialog']('open');
  });
  $('.setConfigure').on('click', function (event) {
    $('#dlg-configure')['dialog']('open');    
  })
  // 負荷率グラフ表示ダイアログ
  $('#dialog-loadfactor-graph')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': 600,
    'height': 500,
    'modal': true,
    'buttons': {
      'OK': function () {
        $(this)['dialog']('close');
      },
    },
    'close': function (event, ui) {
    }
  });
  // 現在在庫数グラフ表示ダイアログ
  $('#dialog-currentstock-graph')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': 600,
    'height': 500,
    'modal': true,
    'buttons': {
      'OK': function () {
        $(this)['dialog']('close');
      },
    },
    'close': function (event, ui) {
    }
  });
  // 現在在庫数グラフ表示ダイアログ
  $('#dialog-estimatestock-graph')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': 600,
    'height': 500,
    'modal': true,
    'buttons': {
      'OK': function () {
        $(this)['dialog']('close');
      },
    },
    'close': function (event, ui) {
    }
  });
  // ツールチップ設定
  $(document)['tooltip']({
    'track': true,
    'show': { 'effect': 'fade', 'duration': 100 },
    'hide': { 'effect': 'fade', 'duration': 100 }
  });
  // 検索機能(Enterで検索)
  /* $('.search-button').on('click', function (event) {
    searchText(String($('#fixed-header-drawer-search').val()));
    ws.openSearchedResultDlg();
  }); */
  // 検索窓
  $('#fixed-header-drawer-search').keypress(function (event) {
    if (event.which === 13) {
      searchText(String($('#fixed-header-drawer-search').val()));
      ws.openSearchedResultDlg();
    }
  });
  // 検索結果ダブルクリックで、選択リーフの位置に画面表示を移動
  $('#lb-search').dblclick(function () {
    ws.moveToSearchedResult();
    isDialogOpened = false;
    $('#dialog-search')['dialog']('close');
  });
  // 製造日程表(人員)初期化処理
  ws.gts.prodStaff.initEventListener();
  // カスタムイベント処理
  $(ws.gts.prodStaff.canvas).on('tableScrolledV', function (e) {
    //console.log(e);
  });
  $(ws.gts.prodStaff.canvas).on('tableScrolledH', function (e) {
    // 表示日時が変更された場合、リーフ等を再読込
    ajaxReadprodplan();
    // setShowDate(ws.gnt.v.displayingDate);
    //ajaxReload();
  });
  $(ws.gts.prodStaff.canvas).on('leafPlaced',
    /**
     * @param {Event} e
     * @param {TaskObject} placedLeaf
     */
    function (e, placedLeaf) {
      var gt = ws.gts.prodStaff;
      var queue = ws.getQueue(gt);
      // 配置されたリーフを更新対象に追加
      queue.push(placedLeaf);
      // 配置されたリーフを起点に自動配置を実行
      doAutoplace(gt, placedLeaf);
      // リーフ配置時に影響したリーフについてDBを更新
      ajaxUpdateProdLeafPlans(queue, gt);
      // 別画面で対応するリーフの内容を更新しておく
      queue.forEach(function (elem) {
        var lfEquipment = ws.gts.prodEquipment.getItemByLeafsId(elem.leafs_id);
        lfEquipment.members_id = elem.members_id;
        var lfProject = ws.gts.proj.getItemByLeafsId(elem.leafs_id);
        // lfProject.members_id = elem.members_id;
        lfProject.members_id = elem.projects_id;
      });
      queue.splice(0);
      // // 日付表示
      // ws.gnt.v.displayingDate = function () { getShowDate(); };
    }
  );
  $(ws.gts.prodStaff.canvas).on('mouseOveredLeaf', function (e, lf) {
    // リーフへのツールチップ表示
    //assignProdToolTip(ws.gts.prodStaff, lf);
    ws.gts.prodStaff.setToolTip(lf.tooltip);
  });
  // $(ws.gts.prodStaff.canvas).on('menuOpen', function (e) {});
  // $(ws.gts.prodStaff.canvas).on('menuClose', function (e) {});

  // 製造日程表(設備)初期化処理
  ws.gts.prodEquipment.initEventListener();
  $(ws.gts.prodEquipment.canvas).on('tableScrolledH', function (e) {
    ajaxReadprodplan();
    // setShowDate(ws.gnt.v.displayingDate);
  });
  $(ws.gts.prodEquipment.canvas).on('leafPlaced',
    /**
     * @param {Event} e
     * @param {TaskObject} placedLeaf
     */
    function (e, placedLeaf) {
      var gt = ws.gts.prodEquipment;
      var queue = ws.getQueue(gt);
      // 配置されたリーフを更新対象に追加
      queue.push(placedLeaf);
      // 配置されたリーフを起点に自動配置を実行
      doAutoplace(gt, placedLeaf);
      // リーフ配置時に影響したリーフについてDBを更新
      ajaxUpdateProdLeafPlans(queue, gt);
      // ajaxReadprodplan();
      // 別画面で対応するリーフの内容を更新しておく
      queue.forEach(function (elem) {
        var lfStaff = ws.gts.prodStaff.getItemByLeafsId(placedLeaf.leafs_id);
        lfStaff.equipments_id = placedLeaf.equipments_id;
        var lfProject = ws.gts.proj.getItemByLeafsId(placedLeaf.leafs_id);
        lfProject.equipments_id = placedLeaf.equipments_id;
      });
      queue.splice(0);
    }
  );
  $(ws.gts.prodEquipment.canvas).on('mouseOveredLeaf', function (e, lf) {
    ws.gts.prodEquipment.setToolTip(lf.tooltip);
  });

  // 出荷日程表初期化処理
  ws.gts.ship.initEventListener();
  $(ws.gts.ship.canvas).on('tableScrolledH', function (e) {
    ajaxReadshipplan();
    // setShowDate(ws.gnt.v.displayingDate);
  });
  $(ws.gts.ship.canvas).on('leafPlaced',
    /**
     * @param {Event} e
     * @param {TaskObject} placedLeaf
     */
    function (e, placedLeaf) {
      ajaxUpdateShipLeafPlan(placedLeaf, ws.gts.ship);
    }
  );
  $(ws.gts.ship.canvas).on('mouseOveredLeaf', function (e, lf) {
    assignShipToolTip(ws.gts.ship, lf);
  });

  // プロジェクト表初期化処理
  ws.gts.proj.initEventListener();
  $(ws.gts.proj.canvas).on('tableScrolledH', function (e) {
    ajaxReadprodplan();
    // setShowDate(ws.gnt.v.displayingDate);
    //ajaxReload();
  });
  $(ws.gts.proj.canvas).on('leafPlaced', function (e, placedLeaf) {
    //ajaxUpdateProjectLeafPlan(placedLeaf);
  });
  $(ws.gts.proj.canvas).on('mouseOveredLeaf', function (e, lf) {
    //assignProdToolTip(ws.gts.proj, lf);
    ws.gts.proj.setToolTip(lf.tooltip);
  });
  // Todo: プロジェクト画面でのリーフ操作は不可として、計画画面で設定する
  $(ws.gts.proj.canvas).on('leafDragStart', function (e, lf) {
    e.preventDefault();
  });
  // $(ws.gts.proj.canvas).on('leafDrag', function (e, lf) {
  //   e.preventDefault();
  // });

  // シミュレーション時の処理
  // ws.gts.prodStaffSim.initEventListener();
  // $(ws.gts.prodStaffSim.canvas).on('tableScrolledH', function (e) {
  //   ajaxReadprodplan(ws.gts.prodStaffSim, ws.gts.prodEquipmentSim, ws.gts.projSim);
  // });
  // $(ws.gts.prodStaffSim.canvas).on('leafPlaced',
  //   /**
  //    * @param {Event} e
  //    * @param {TaskObject} placedLeaf
  //    */
  //   function (e, placedLeaf) {
  //     var gt = ws.gts.prodStaffSim;
  //     var queue = ws.getQueue(gt);
  //     // 配置されたリーフを更新対象に追加
  //     queue.push(placedLeaf);
  //     // 配置されたリーフを起点に自動配置を実行
  //     doAutoplace(gt, placedLeaf);
  //     // リーフ配置時に影響したリーフについてDBを更新
  //     ajaxUpdateProdLeafPlans(queue, gt);
  //     // 別画面で対応するリーフの内容を更新しておく
  //     queue.forEach(function (elem) {
  //       var lfEquipment = ws.gts.prodEquipmentSim.getItemByLeafsId(elem.leafs_id);
  //       lfEquipment.members_id = elem.members_id;
  //       var lfProject = ws.gts.projSim.getItemByLeafsId(elem.leafs_id);
  //       lfProject.members_id = elem.members_id;
  //     });
  //     queue.splice(0);
  //   }
  // );
  // $(ws.gts.prodStaffSim.canvas).on('mouseOveredLeaf', function (e, lf) {
  //   ws.gts.prodStaffSim.setToolTip(lf.tooltip);
  // });

  // ws.gts.prodEquipmentSim.initEventListener();
  // $(ws.gts.prodEquipmentSim.canvas).on('tableScrolledH', function (e) {
  //   ajaxReadprodplan(ws.gts.prodStaffSim, ws.gts.prodEquipmentSim, ws.gts.projSim);
  // });
  // $(ws.gts.prodEquipmentSim.canvas).on('leafPlaced',
  //   /**
  //    * @param {Event} e
  //    * @param {TaskObject} placedLeaf
  //    */
  //   function (e, placedLeaf) {
  //     var gt = ws.gts.prodEquipmentSim;
  //     var queue = ws.getQueue(gt);
  //     // 配置されたリーフを更新対象に追加
  //     queue.push(placedLeaf);
  //     // 配置されたリーフを起点に自動配置を実行
  //     doAutoplace(gt, placedLeaf);
  //     // リーフ配置時に影響したリーフについてDBを更新
  //     ajaxUpdateProdLeafPlans(queue, gt);
  //     // 別画面で対応するリーフの内容を更新しておく
  //     queue.forEach(function (elem) {
  //       var lfStaff = ws.gts.prodStaffSim.getItemByLeafsId(placedLeaf.leafs_id);
  //       lfStaff.equipments_id = placedLeaf.equipments_id;
  //       var lfProject = ws.gts.projSim.getItemByLeafsId(placedLeaf.leafs_id);
  //       lfProject.equipments_id = placedLeaf.equipments_id;
  //     });
  //     queue.splice(0);
  //   }
  // );
  // $(ws.gts.prodEquipmentSim.canvas).on('mouseOveredLeaf', function (e, lf) {
  //   ws.gts.prodEquipmentSim.setToolTip(lf.tooltip);
  // });

  // ws.gts.shipSim.initEventListener();
  // $(ws.gts.shipSim.canvas).on('tableScrolledH', function (e) {
  //   ajaxReadshipplan(ws.gts.shipSim);
  // });
  // $(ws.gts.shipSim.canvas).on('leafPlaced', function (e, placedLeaf) {
  //   ajaxUpdateShipLeafPlan(placedLeaf, ws.gts.shipSim);
  // });
  // $(ws.gts.shipSim.canvas).on('mouseOveredLeaf', function (e, lf) {
  //   ws.gts.shipSim.setToolTip(lf.tooltip);
  // });

  // // プロジェクト表初期化処理
  // ws.gts.projSim.initEventListener();
  // $(ws.gts.projSim.canvas).on('tableScrolledH', function (e) {
  //   ajaxReadprodplan(ws.gts.prodStaffSim, ws.gts.prodEquipmentSim, ws.gts.projSim);
  // });
  // $(ws.gts.projSim.canvas).on('leafPlaced', function (e, placedLeaf) {
  //   //ajaxUpdateProjectLeafPlan(placedLeaf);
  // });
  // $(ws.gts.projSim.canvas).on('mouseOveredLeaf', function (e, lf) {
  //   ws.gts.projSim.setToolTip(lf.tooltip);
  // });
  // $(ws.gts.projSim.canvas).on('leafDragStart', function (e, lf) {
  //   e.preventDefault();
  // });

  setTimeout(tickTimer, 100);
  setTimeout(tickRedraw, 1000.0 / 60.0);
  ws.refreshView();
  setupAjax();
  // 初期データ読込
  ajaxReload(function () {
    ajaxReadprodplan();
    ajaxReadshipplan();
    // ws.gts.prodStaffSim.v.axistype = Number(ws.gts.prodStaff.v.axistype);
    // ajaxReadprodplan(ws.gts.prodStaffSim, ws.gts.prodEquipmentSim, ws.gts.projSim);
    // ajaxReadshipplan(ws.gts.shipSim);
  });
});

/**
 * 製造リーフツールチップの内容を設定する
 * @param {CVSGantt} gt 対象のガントチャート
 * @param {TaskObject} lf ツールチップ表示対象のリーフ
 */
function assignProdToolTip(gt, lf) {
  var key = '';
  var checkKey = function (elem) {
    return (elem['colkey'] === key);
  };
  var ttrow = 2;
  var strs = ['', '', ''];
  strs[0] = 'プロジェクト:' + (lf.projects_id > 0 ? lf.projects_name : '-');
  if (lf.projects_start_plan.getTime() === 0 && lf.projects_finish_plan.getTime() === 0) {
    strs[1] = '期間:-';
  } else {
    strs[1] = '期間:' +
      (lf.projects_start_plan.getTime() !== 0 ? $['datepicker']['formatDate']('yy-mm-dd', lf.projects_start_plan) : '-') +
      ' ～ ' +
      (lf.projects_finish_plan.getTime() !== 0 ? $['datepicker']['formatDate']('yy-mm-dd', lf.projects_finish_plan) : '-');
  }
  var scheduleInfo = '';
  if (lf.schedules_detail_parsed) {
    for (key in lf.schedules_detail_parsed) {
      var colinfo = ws.m.d.schedule_details.filter(checkKey);
      if (colinfo.length > 0) {
        scheduleInfo += (scheduleInfo.length > 0 ? ', ' : '') + colinfo[0]['coldesc'] + ':' + convertCustomColValue(colinfo[0]['coltype'], lf.schedules_detail_parsed[key]);
      } else {
        scheduleInfo += (scheduleInfo.length > 0 ? ', ' : '') + key + ':' + convertCustomColValue(colinfo[0]['coltype'], lf.schedules_detail_parsed[key]);
      }
    }
  }
  strs[2] = scheduleInfo;
  gt.setToolTip(strs);
}


/**
 * 製造リーフツールチップの内容を設定する
 * @param {CVSGantt} gt 対象のガントチャート
 * @param {TaskObject} lf ツールチップ表示対象のリーフ
 */
function assignShipToolTip(gt, lf) {
  gt.setToolTip(lf.tooltip);
}

/**
 * 選択中のリーフに関する情報をExcelに出力する。
 * @param {string} templateFilename 出力時のテンプレートファイル名(拡張子.xlsxなし)。
 */
function exportToExcel(templateFilename) {
  var leafIds = ws.getActiveGantt().items.filter(function (elem) {
    return (elem.selected === true);
  });
  var strIds = '';
  if (leafIds.length === 0) {
    window.alert('Excelへの出力対象とするリーフを選択後、実行してください');
    return;
  }
  leafIds.forEach(function (elem) {
    strIds += '&ids[]=' + elem.leafs_id;
  });
  window.open(ajaxUrl + 'makedoc/leaf/?template=' + templateFilename + strIds,
    '_blank', 'width=380, height=150');
}

/**
 * 添付ファイルの一覧を表示する
 * @param {number} leafsid 表示対象のleafs_id
 */
function showAttachmentsList(leafsid) {
  var gt = ws.getActiveGantt();
  $('#filelist').empty().append('<li>読込中...</li>');
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/attachmentsinfo/' + gt.id + '/' + leafsid,
    dataType: 'json',
    success: function (data) {
      $('#filelist').empty();
      if (data['attachments'].length > 0) {
        data['attachments'].forEach(function (elem) {
          $('#filelist').append('<li class="attachmentdl" data-attachmentsid="' +
            elem['id'] + '">' + elem['actual_filename'] + ' (' + elem['uploaded'] + ')</li>');
        });
        $('.attachmentdl').on('click', function () {
          window.open(ajaxUrl + 'upload/dlfile/' + gt.id + '/' +
            $(this).attr('data-attachmentsid'),
            '_blank', 'width=380, height=150');
        }).css({
          'cursor': 'pointer',
          'color': '#0000ff'
        });
      } else {
        $('#filelist').append('<li>データはありません</li>');
      }
    },
    error: function () {
      $('#filelist').append('<li>ファイル一覧の読込に失敗しました</li>');
    }
  });
}

/**
 * 指定した要素に含まれる入力欄について、入力形式を割り当てる。
 * @param {string} strSelector 入力欄を含む要素のセレクタ
 */
function assignInputsForm(strSelector) {
  $(strSelector).find('input').each(function (idx) {
    switch ($(this).attr('data-coltype')) {
      case 'DATE':
        if ($(this).val() !== '') {
          var curval = convertCustomColValue($(this).attr('data-coltype'), $(this).val());
          $(this)['datepicker']({
            'dateFormat': 'yy-mm-dd',
            'showOn': 'button'
          }).val(curval);
        } else {
          $(this)['datepicker']({
            'dateFormat': 'yy-mm-dd',
            'showOn': 'button'
          }).val('');
        }
        break;
      case 'INT':
        break;
      default:
        break;
    }
  });
}

/**
 * 指定した要素に含まれる入力欄について、データベース用の値を取得する。
 * @param {string} strSelector 入力欄を含む要素のセレクタ
 * @param {*} datSend データ内容を追記する対象
 */
function convertInputForm(strSelector, datSend) {
  $(strSelector).find('input').each(function (idx) {
    switch ($(this).attr('data-coltype')) {
      case 'DATE':
        datSend[$(this).attr('name')] = Date.parse($(this).val());
        break;
      case 'INT':
        var filtered = WSUtils.filterInt($(this).val());
        datSend[$(this).attr('name')] = (isNaN(filtered) === false ? filtered : null);
        break;
      default:
        datSend[$(this).attr('name')] = $(this).val();
        break;
    }
  });
}

/**
 * 指定した項目についてリーフから検索を実行する。
 * @param {string} searchkey 検索対象の文字列。
 */
function searchText(searchkey) {
  var gt = ws.getActiveGantt();
  var textkey = searchkey.trim().toLowerCase();
  var key = '';
  var checkKey = function (elem) {
    return (elem['colkey'] === key);
  };
  if (textkey === '') {
    gt.i.prevSearchKeyword = textkey;
    return;
  }
  ws.getActiveGantt().items.forEach(function (elem) {
    var isMatched = false;
    /* // leafs_detailから検索(変数型考慮有り)
    for (key in elem.leafs_detail_parsed) {
      var colinfoL = ws.m.d.leaf_details.filter(checkKey);
      var strL = String(convertCustomColValue((colinfoL.length > 0 ? colinfoL[0]['coltype'] : ''),
        elem.schedules_detail_parsed[key]));
      isMatched |= String(convertCustomColValue((colinfoL.length > 0 ? colinfoL[0]['coltype'] : ''),
        elem.leafs_detail_parsed[key])).toLowerCase().indexOf(textkey) >= 0;
    }
    // schedules_detailから検索(変数型考慮有り)
    for (key in elem.schedules_detail_parsed) {
      var colinfoS = ws.m.d.schedule_details.filter(checkKey);
      var strS = String(convertCustomColValue((colinfoS.length > 0 ? colinfoS[0]['coltype'] : ''),
        elem.schedules_detail_parsed[key]));
      isMatched |= strS.toLowerCase().indexOf(textkey) >= 0;
    }
    // プロジェクト名から検索
    isMatched |= elem.projects_id > 0 ? elem.projects_name.toLowerCase().indexOf(textkey) >= 0 : false; */
    isMatched |= String(elem['titleText']).indexOf(textkey) >= 0;
    isMatched |= String(elem['subText']).indexOf(textkey) >= 0;
    if (isMatched) {
      //elem.bordercolor = '#C62828';
      //elem.textcolor = '#C62828';
      //if (gt.i.prevSearchKeyword === searchkey) {
      //  elem.selected = true;
      //} else {
      //  elem.selected = false;
      //}
      elem.isHitBySearch = true;
    } else {
      //elem.bordercolor = '#000000';
      //elem.textcolor = '#000000';
      //elem.selected = false;
      elem.isHitBySearch = false;
    }
    elem.canvasTextTitle.firstTimeDraw = true;
    elem.canvasTextSub.firstTimeDraw = true;
  });
  gt.i.prevSearchKeyword = searchkey;
}

/**
 * 指定リーフについて自動配置を実行する
 * @param {TaskObject} lf 配置開始対象のLeafオブジェクト
 */
function autoPlaceLeaf(lf) {
  var dat = {
    'schedulesid': lf.schedules_id
  };
  ajaxPost('autoplaceleaf', dat, reloadTabLeafs);
}

/**
 * 日別のリーフ数を数えてグラフを表示する
 * @param {CVSGantt} gt 基準軸として使用するガントチャート
 */
function countLeaf(gt) {
  var dat = {
    'checkdate': getDBDatetimeMinutesStrForPHP(gt.v.displayingDate),
    'num': gt.v.col
  };
  $('#loadfactor-graph-wait').show();
  $('#loadfactor-chart').hide();
  $('#dialog-loadfactor-graph')['dialog']('open');
  ajaxPost('countleaf', dat, function (resp) {
    $('#loadfactor-graph-wait').hide();
    $('#loadfactor-chart').show();
    //var objs = JSON.parse(resp);
    displayLoadFactorChart(resp, gt);
  });
}

/**
 * 現在在庫数量を数えてグラフを表示する
 */
function countCurrentStock() {
  var dat = {
    'checkdate': getDBDatetimeMinutesStrForPHP(ws.gts.prodStaff.v.displayingDate),
    'num': ws.gts.prodStaff.v.col
  };
  $('#currentstock-graph-wait').show();
  $('#currentstock-chart').hide();
  $('#dialog-currentstock-graph')['dialog']('open');
  ajaxPost('countcurrentstock', dat, function (resp) {
    $('#currentstock-graph-wait').hide();
    $('#currentstock-chart').show();
    //var objs = JSON.parse(resp);
    displayCurrentStockChart(resp);
  });
}

/**
 * 営業日を計算して返す
 * @param {Date} dtSt 開始日時
 * @param {Number} num 日数
 * @return {Date} 営業日を考慮して日数を加算した後の日付
 */
function calcWorkableHourSpan(dtSt, num) {
  if (ws.m.d.calbdt.length === 0) {
    return true;
  }
  var dtMasterStart = new Date(2018, 0, 1, 0);
  var dtCalc = new Date(dtSt.getFullYear(), dtSt.getMonth(), dtSt.getDate(), dtSt.getHours());
  var numCnt = Math.round(num);
  dtCalc.setTime(dtCalc.getTime() - dtMasterStart.getTime());
  var spn = WSUtils.compareHours(new Date(0), dtCalc);
  // カレンダーマスタを参照して休日を計算から除外する
  var isWorkable = false;
  while (numCnt !== 0) {
    // 日数が正の数の場合、後日に向かって確認する。負の数の場合、前日に向かって確認する
    spn += numCnt > 0 ? 1 : -1;
    var dt = new Date(ws.m.d.calbdt[spn]['cbt_date'].replace(/-/g, '/'));
    isWorkable = (ws.m.d.calbdt[spn]['cbt_holiday'] !== 1 &&
      ws.m.d.wbsctrl[0]['day_st_hour'] <= dt.getHours() && dt.getHours() < ws.m.d.wbsctrl[0]['day_en_hour']);
    if (isWorkable) {
      if (numCnt > 0) {
        numCnt--;
      } else {
        numCnt++;
      }
    }
  }
  return new Date(ws.m.d.calbdt[spn]['cbt_date'].replace(/-/g, '/'));
}

/**
 * 指定した日時が勤務可能であるかを確認して返す。
 * @param {Date} dtSt 開始日時
 * @param {RowObject} targetRow 行データ
 * @param {TaskObject=} lf リーフ長さ計算時の場合、対象リーフ
 * @return {boolean} 勤務可能である場合、true
 */
function checkWorkableHourFunc(dtSt, targetRow, lf) {
  /**
   * 行データ
   * @type {Array}
   */
  var rowdata;
  let jsNullDate = new Date(dtSt)
  if (Number(jsNullDate) === 0) {
    // 開始日時が空だったらどこでも配置可
    return true;
  }
  // if (lf === undefined) {
  //   return false;
  // }
  if (lf) {
    var rowobjStaff = ws.gts.prodStaff.v.rowdata.filter(function (elem) {
      return lf.members_id === elem.id;
    });
    var rowobjEquipment = ws.gts.prodEquipment.v.rowdata.filter(function (elem) {
      return lf.equipments_id === elem.id;
    });
    rowdata = [
      rowobjStaff.length > 0 ? rowobjStaff[0] : null,
      rowobjEquipment.length > 0 ? rowobjEquipment[0] : null,
    ];
  } else {
    rowdata = [targetRow];
  }
  var isDayOnly = false;
  if (rowdata.length > 0) {
    isDayOnly = rowdata.some(function (elem) {
      if (elem) {
        return elem.isDayOnlyPlaceable;
      }
      return false;
    });
  }
  //var isDayOnly = rowdata ? rowdata.isDayOnlyPlaceable : false;
  //var dtMasterStart = new Date(2018, 0, 1, 0).getTime(); //= 1514732400000;
  var dtCalc = new Date(dtSt.getFullYear(), dtSt.getMonth(), dtSt.getDate(), dtSt.getHours());
  // 個人別カレンダーの行を指定メンバーIDに絞る 個人別カレンダーにない場合samerowsはlength = 0
  var sameRows = ws.m.d.bdtmembers.filter(function (elem) {
    return rowdata.some(function (row) {
      return row ? (Number(elem['bt_members_id']) === row.id) : false;
    });
  });
  // 個人別カレンダーによる勤務可能日時確認
  var workerCalendar = sameRows.filter(function (elem) {
    elem['toDate'] = new Date(elem['bt_date'].replace(/-/g, '/'));
    if (elem['toDate'].getTime() === dtCalc.getTime() && elem['bt_holiday'] !== '1') {
      return true;
    }
    // if (!elem['toDate']) {
    //   elem['toDate'] = new Date(elem['bt_date'].replace(/-/g, '/'));
    // }
    // return sameRows.some(function (row) {
    //   return elem['toDate'].getTime() === dtCalc.getTime();
    // });
  });
  // 下記　　1があったとき以外(設定なしか０の時)はreturn true
  // (これから休日か営業日か確認)
  // if (workerCalendar.length > 0) {
  //   if (workerCalendar.some(function (elem) {
  //     return elem['bt_holiday'] === '1';
  //   })) {
  //     return false;
  //   }
  //   if (workerCalendar.some(function (elem) {
  //     return elem['bt_holiday'] === '0';
  //   })) {
  //     return true;
  //   }
  // }
  // 会社カレンダーによる勤務可能日時確認
  var spn = Math.floor((dtCalc.getTime() - 1514732400000) / 3600000);     //WSUtils.compareHours(new Date(0), dtCalc);
  if (spn < 0 || ws.m.d.calbdt.length <= spn) {
    return true;
  }
  if (!ws.m.d.calbdt[spn]['toDate']) {
    ws.m.d.calbdt[spn]['toDate'] = new Date(ws.m.d.calbdt[spn]['cbt_date'].replace(/-/g, '/'));
  }
  var dt = ws.m.d.calbdt[spn]['toDate'];
  /* var isWorkable = (!isDayOnly || (ws.m.d.calbdt[spn]['cbt_holiday'] !== '1' &&
    (isDayOnly &&
      ws.m.d.wbsctrl[0]['day_st_hour'] <= dt.getHours() &&
      dt.getHours() < ws.m.d.wbsctrl[0]['day_en_hour']))
  ); */
  var st = isDayOnly ? ws.m.d.wbsctrl[0]['day_st_hour'] : -1;
  var en = isDayOnly ? ws.m.d.wbsctrl[0]['day_en_hour'] : 24;
  var isWorkable = (ws.m.d.calbdt[spn]['cbt_holiday'] !== '1' &&
    (st <= dt.getHours() && dt.getHours() < en)
  );
  return isWorkable;
}

/**
 * 指定タブのリーフ情報及び横軸情報を再読込する
 * @param {string} leaftype 対応するCVSGanttのID
 */
function reloadTabLeafs(leaftype) {
  switch (leaftype) {
    case 'PROD_STAFF':
    case 'PROD_EQUIPMENT':
    case 'PROJ':
      //ajaxReload();
      ajaxReadprodplan();
      break;
    case 'SHIP':
      ajaxReadshipplan();
      break;
    // case 'PROD_STAFF_SIM':
    // case 'PROD_EQUIPMENT_SIM':
    // case 'PROJ_SIM':
    //   ajaxReadprodplan(ws.gts.prodStaffSim, ws.gts.prodEquipmentSim, ws.gts.projSim);
    //   break;
    // case 'SHIP_SIM':
    //   ajaxReadshipplan(ws.gts.shipSim);
    //   break;
    default:
      break;
  }
}

/**
 * 配列内でのオブジェクトの重複を避けながら、DB更新用配列にリーフを追加する。
 * @param {TaskObject[]} queue 対象キュー。
 * @param {TaskObject} lf 追加リーフ。
 */
function pushToLeafsQueue(queue, lf) {
  /**
   * 重複リーフ。
   * @type {TaskObject}
   */
  var lfDuplicated = null;
  // 重複リーフを検索
  queue.forEach(function (elem) {
    if (elem.leafs_id === lf.leafs_id) {
      lfDuplicated = elem;
    }
  });
  if (lfDuplicated === null) {
    // DB更新用配列にまだ指定リーフが無い場合は追加する
    queue.push(lf);
  } else {
    // すでに配列に指定リーフがある場合には内容を更新する
    lfDuplicated = lf;
  }
}

/*
 * 行ID(members_id,equipments_id,projects_id)から、行オブジェクトを取得する
 * @param {Number} rowId リーフID
 * @param {string} leaftype 行種類
 * @return {RowObject} 指定行のオブジェクト。対応するオブジェクトが存在しない場合にはnull
 */
/* this.getRowById = function (rowId, leaftype) {
  return row;
}; */

/**
 * 子リーフの移動により影響する親リーフを取得する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} childLeaf 移動された子リーフのオブジェクト
 */
function findAndMoveParentLeaf(gt, childLeaf) {
  // TK版は工程を確認.l_process_cd
  if (childLeaf.process_cd === '00') {
    return;
  }
  var queue = ws.getQueue(gt);
  var placedFinishPlan = gt.getFinishPlan(childLeaf, true);
  var checkAffectedParent = function (elem) {
    return Number(elem.process_cd) <= childLeaf.process_cd && 
      elem.start_plan.getTime() < placedFinishPlan.getTime();
    // return elem.divide_id === childLeaf.parent_id &&
    //   elem.start_plan.getTime() < placedFinishPlan.getTime();
  };
  // 影響する親リーフについて全て処理した時点で終了
  var lfsParentToMove = gt.items.filter(checkAffectedParent);
  lfsParentToMove.forEach(function (elem) {
    // 親リーフの配置日時を変更
    var replaceDate = gt.getNextPlaceableDate(elem, placedFinishPlan);
    elem.start_plan.setTime(replaceDate.getTime());
    pushToLeafsQueue(queue, elem);
    if (ws.autoplaceAffectedRowEnabled()) {
      doAutoplace(gt, elem);
    }
    findAndMoveParentLeaf(gt, elem);
  });
}

/**
 * 親リーフの移動により影響する子リーフを取得する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} parentLeaf 移動された子リーフのオブジェクト
 */
function findAndMoveChildLeaf(gt, parentLeaf) {
  if (parentLeaf.process_cd === '00') {
    return;
  }
  var queue = ws.getQueue(gt);
  var placedStartPlan = new Date(parentLeaf.start_plan.getTime());
  var checkAffectedChild = function (elem) {
    return parentLeaf.process_cd <= elem.process_cd && 
      gt.getFinishPlan(elem, true).getTime() > placedStartPlan.getTime();
    // return parentLeaf.divide_id === elem.parent_id &&
    //   gt.getFinishPlan(elem, true).getTime() > placedStartPlan.getTime();
  };
  // 影響する子リーフについて全て処理した時点で終了
  var lfsChildToMove = gt.items.filter(checkAffectedChild);
  lfsChildToMove.forEach(function (elem) {
    // 子リーフの配置日時を変更
    var replaceDate = gt.getStartPlan(elem, gt.getPrevPlaceableDate(elem, placedStartPlan));
    elem.start_plan.setTime(replaceDate.getTime());
    pushToLeafsQueue(queue, elem);
    if (ws.autoplaceAffectedRowEnabled()) {
      doAutoplace(gt, elem);
    }
    findAndMoveChildLeaf(gt, elem);
  });
}

/**
 * 指定リーフに重なっているリーフを取得して、後日程へ移動する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} placedLeaf 移動された子リーフのオブジェクト 
 */
function findAndMoveOverlappedLeafLater(gt, placedLeaf) {
  var queue = ws.getQueue(gt);
  var placedFinishPlan = gt.getFinishPlan(placedLeaf, true);
  // 重複するリーフを取得
  var lfsToMove = gt.getDuplicatedLeafs(placedLeaf, placedLeaf.start_plan, placedFinishPlan, true);
  // 移動対象リーフ
  lfsToMove.forEach(function (elem) {
    // 現実的にはあまりないはずだが、実績入力されていた場合は無視して重ねる
    // 親リーフの配置日時を変更
    // if (elem.start_date !== null || elem.start_date !== new Date(0)) {
    if (elem.start_date > new Date(0)) {
      return;
    }
    var replaceDate = gt.getNextPlaceableDate(elem, placedFinishPlan);
    elem.start_plan.setTime(replaceDate.getTime());
    pushToLeafsQueue(queue, elem);
    if (ws.autoplaceAffectedRowEnabled()) {
      doAutoplace(gt, elem);
    }
    findAndMoveOverlappedLeafLater(gt, elem);
  });
}

/**
 * 指定リーフに重なっているリーフを取得して、前日程へ移動する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} placedLeaf 移動された子リーフのオブジェクト
 */
function findAndMoveOverlappedLeafEarlier(gt, placedLeaf) {
  var queue = ws.getQueue(gt);
  var placedFinishPlan = gt.getFinishPlan(placedLeaf, true);
  // 重複するリーフを取得
  var lfsToMove = gt.getDuplicatedLeafs(placedLeaf, placedLeaf.start_plan, placedFinishPlan, true);
  lfsToMove.forEach(function (elem) {
    // 親リーフの配置日時を変更
    var replaceDate = gt.getPrevPlaceableDate(elem, placedLeaf.start_plan);
    elem.start_plan.setTime(replaceDate.getTime());
    pushToLeafsQueue(queue, elem);
    if (ws.autoplaceAffectedRowEnabled()) {
      doAutoplace(gt, elem);
    }
    findAndMoveOverlappedLeafEarlier(gt, elem);
  });
}

/**
 * 指定リーフに重なっているリーフを取得して、後日程へ移動する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} resultLeaf 移動された子リーフのオブジェクト
 * @param {Date} resultFinishDate 完了日時
 */
function findAndMoveLeafLaterByResult(gt, resultLeaf) {
  var queue = ws.getQueue(gt);
  var finishPlan = gt.getFinishPlan(resultLeaf);
  // 隣接または重複しているリーフを、実績完了日時の場所に移動する。
  // その後、移動したリーフを親リーフとして連続で整列を行う。
  // 重複するリーフを取得
  var finishDateCheck = new Date(resultLeaf.finish_date.getTime() + 1000);
  var lfsToMove = gt.getDuplicatedLeafs(resultLeaf, resultLeaf.start_date, finishDateCheck);
  lfsToMove.forEach(function (elem) {
    // 親リーフの配置日時を変更
    var replaceDate = gt.getNextPlaceableDate(elem, resultLeaf.finish_date);
    elem.start_plan.setTime(replaceDate.getTime());
    pushToLeafsQueue(queue, elem);
    if (ws.autoplaceAffectedRowEnabled()) {
      doAutoplace(gt, elem);
    }
    findAndMoveOverlappedLeafLater(gt, elem); //移動の結果、重なったリーフについて処理
  });
}

/**
 * 指定リーフに重なっているリーフを取得して、前日程へ移動する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} resultLeaf 移動された子リーフのオブジェクト
 * @param {Date} resultFinishDate 完了日時
 */
function findAndMoveLeafEarlierByResult(gt, resultLeaf) {
  var queue = ws.getQueue(gt);
  var finishPlan = gt.getFinishPlan(resultLeaf);
  var checkingFinishDate = new Date(finishPlan.getTime());
  var continousLfs = [resultLeaf];
  var continousLfId = 0;
  var continousLfStaff = 0;
  var continousLfEquip = 0;
  /**
   * 実績入力リーフに接続されているリーフを全て取得する。
   * メンバーが片方でも一致している場合、接続されているとみなす
   * @param {TaskObject} elem 確認対象
   * @returns {boolean} 重複する場合にtrue
   */
  var checkConnected = function (elem) {
    var elemId = elem.leafs_id;
    var elemStaff = elem.members_id;
    var elemEquip = elem.equipments_id;
    return checkingFinishDate.getTime() === elem.start_plan.getTime() && continousLfId !== elemId &&
      (continousLfStaff === elemStaff || continousLfEquip === elemEquip);
  };
  while (true) {
    continousLfId = continousLfs[0].leafs_id;
    continousLfStaff = continousLfs[0].members_id;
    continousLfEquip = continousLfs[0].equipments_id;
    continousLfs = gt.items.filter(checkConnected);
    if (continousLfs.length <= 0) {
      break;
    }
    checkingFinishDate.setTime(gt.getFinishPlan(continousLfs[0]).getTime());
    continousLfs[0].data['isContinous'] = true;
  }
  // 重複するリーフを取得して、開始日時順に整列
  var lfsToMove = gt.items.filter(function (elem) {
    return elem.data['isContinous'] === true;
  }); //gt.getDuplicatedLeafs(resultLeaf, resultLeaf.start_date, finishDateCheck);
  lfsToMove.sort(function (a, b) {
    if (Number(a.start_plan.getTime()) > Number(b.start_plan.getTime())) {
      return 1;
    } else {
      return -1;
    }
  });
  var finishDateCheck = new Date(resultLeaf.finish_date.getTime());
  // 整列処理を実行
  lfsToMove.forEach(function (elem) {
    var finishPlanByResult = new Date(finishDateCheck.getTime()); //gt.getFinishPlan(elem, true);
    var dtSt = elem.start_date.getTime() !== 0 ? new Date(elem.start_date.getTime()) : new Date(elem.start_plan.getTime());
    var dtEn = finishPlanByResult.getTime() !== 0 ? new Date(finishPlanByResult.getTime()) : new Date(gt.getFinishPlan(elem).getTime());
    //finishDateCheck.setTime(dtEn.getTime() + 1000);
    // 接続されているリーフを順番に前方へずらす
    var replaceDate = gt.getNextPlaceableDate(elem, dtEn);
    elem.start_plan.setTime(replaceDate.getTime());
    finishDateCheck.setTime(gt.getFinishPlan(elem, true)); //replaceDate.getTime());
    pushToLeafsQueue(queue, elem);
    if (ws.autoplaceAffectedRowEnabled()) {
      doAutoplace(gt, elem);
    }
    //findAndMoveOverlappedLeafEarlier(gt, elem);
  });
}

/**
 * 指定リーフを移動した場合について自動配置を実行する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} lf 自動配置の起点とするリーフのオブジェクト
 */
function doAutoplace(gt, lf) {
  if (gt === 'SHIP') {
    // 出荷予定を並べるのみなので、横軸でのリーフ移動考慮しない
  } else {
    // 配置リーフと同じ行で、後日程に移動する可能性のあるリーフを取得
    if (ws.autoplaceSameRowEnabled()) {
      findAndMoveOverlappedLeafLater(gt, lf);
    }
    // 親リーフの内、後日程に移動する可能性のあるリーフを取得
    if (ws.autoplaceParentEnabled() && !ws.autoplaceChildEnabled()) {
      findAndMoveParentLeaf(gt, lf);
    }
    // 子リーフの内、前日程に移動する可能性のあるリーフを取得
    if (ws.autoplaceChildEnabled() && !ws.autoplaceParentEnabled()) {
      findAndMoveChildLeaf(gt, lf);
    }
  }
}

/**
 * 指定リーフを移動した場合について自動配置を実行する
 * @param {CVSGantt} gt 対象とするガントチャート
 * @param {TaskObject} lf 自動配置の起点とするリーフのオブジェクト
 */
function doAutoplaceByResult(gt, lf) {
  //if (ws.autoplaceSameRowEnabled()) {}
  if (ws.autoplaceResultEnabled()) {
    // 特定リーフの完了予定を取得し、実績の方が時間がかかっていたら後ろへリーフをずらす
    var finishPlan = gt.getFinishPlan(lf);
    if (finishPlan.getTime() <= lf.finish_date.getTime()) {
      findAndMoveLeafLaterByResult(gt, lf);
    } else {
      // コメントアウト　2020/11/14 sono 前方へずらす場合、前方に空きがあるまでずっとずらし続けるため、一旦コメントアウト
      // findAndMoveLeafEarlierByResult(gt, lf);
    }
  }
}

/**
 * 製造実績登録画面クローズ
 */
function dlgProdResultClose() {
  // 完了フラグリセット
  $('#frm-prodresult input[name=prodfinflg]').val('');
  // 工程開始時間をリセット
  $('#frm-prodresult input[name=prodstartdate]').val('');
  $('#dlg-prodresult')['dialog']('close');
}

/***
 * 製造実績登録画面　開始ボタン押下
 */
function dlgProdResultStartBtn() {
  // 時間が既にセットされていた場合は、その時間をリーフの製造開始時間として保持しておく。キャンセルボタン押下、もしくは、更新ボタン押下でリセットする。
  if (!WSUtils.isSet($('#frm-prodresult input[name=start_dt]').val())) {
    // セットされていない場合、現在時刻をセット。ちなみにセットされていれば、そのままスルー
    $('#frm-prodresult input[name=prodstartdate]').val(WSUtils.makeDateString(new Date()));
  }   
  // 開始ボタン押下時の日時を取得し、テキストボックスにセット
  $('#frm-prodresult input[name=start_dt]').val(WSUtils.makeDateString(new Date()));
  // 完了時間をクリア
  $('#frm-prodresult input[name=finish_dt]').val('');
}

/***
 * 製造実績登録画面　中断ボタン押下
 */
function dlgProdResultAbortBtn() {
  // 中断ボタン押下時の日時を取得し、テキストボックスにセット 中断時間までの時間をセット
  let start = WSUtils.convertDlgStringToDate($('#frm-prodresult input[name=start_dt]').val());
  let abort = new Date();
  let interval = 0;
  // ダイアログを開いてからのabort回数を取得
  let abortNum = $('#frm-prodresult input[name=prodabortcnt]').val();
  if (!WSUtils.isSet(abortNum) || abortNum === 0) {
    abortNum = 0;
  }
  $('#frm-prodresult input[name=finish_dt]').val(WSUtils.makeDateString(abort));
  if (start.getTime() === new Date(0).getTime()) {
    alert('開始時刻が設定されていないため、作業時間が算出できませんでした。');
  } else {   
    abortNum = abortNum + 1;
    // abort回数をセット
    $('#frm-prodresult input[name=prodabortcnt]').val(String(abortNum));
    interval = WSUtils.compareMinutes(start, abort);
  }
  $('#frm-prodresult input[name=thisinterval]').val(interval);
}

/***
 * 製造実績登録画面　完了ボタン押下
 */
function dlgProdResultFinBtn() {
  // 完了フラグ立てる
  $('#frm-prodresult input[name=prodfinflg]').val('true');
  let abortNum = $('#frm-prodresult input[name=prodabortcnt]').val();
  if (!WSUtils.isSet(abortNum) || abortNum === 0) {
    abortNum = 0;
    $('#frm-prodresult input[name=prodabortcnt]').val('0');
  }
  // 完了ボタン押下時の日時を取得し、テキストボックスにセット
  // また、データのintervalと開始時間、中断回数のインクリメント、完了時間をDB登録
  $('#frm-prodresult input[name=finish_dt]').val(WSUtils.makeDateString(new Date()));
}

