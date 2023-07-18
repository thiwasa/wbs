/**
 * @fileOverview 工程表アプリケーションオブジェクト
 * @desc -
 * @author Fumihiko Kondo
 */
'use strict';

/**
 * 各種ガントチャート画面オブジェクト
 * @constructor
 */
function  Gantts() {
  /**
   * 製作日程表画面(人員表示)
   * @type {CVSGantt}
   * @instance
   */
  this.prodStaff = new CVSGantt('PROD_STAFF');
  /**
   * 製作日程表画面(設備表示)
   * @type {CVSGantt}
   * @instance
   */
  this.prodEquipment = new CVSGantt('PROD_EQUIPMENT');
  /**
   * 出荷日程表画面
   * @type {CVSGantt}
   * @instance
   */
  this.ship = new CVSGantt('SHIP');
  /**
   * プロジェクト画面
   * @type {CVSGantt}
   * @instance
   */
  this.proj = new CVSGantt('PROJ');
//   /**
//    * 製作日程表(シミュレーション)画面(人員表示)
//    * @type {CVSGantt}
//    * @instance
//    */
//   this.prodStaffSim = new CVSGantt('PROD_STAFF_SIM');
//   /**
//    * 製作日程表(シミュレーション)画面(設備表示)
//    * @type {CVSGantt}
//    * @instance
//    */
//   this.prodEquipmentSim = new CVSGantt('PROD_EQUIPMENT_SIM');
//   /**
//    * 出荷日程表(シミュレーション)画面
//    * @type {CVSGantt}
//    * @instance
//    */
//   this.shipSim = new CVSGantt('SHIP_SIM');
//   /**
//    * プロジェクト(シミュレーション)画面
//    * @type {CVSGantt}
//    * @instance
//    */
//   this.projSim = new CVSGantt('PROJ_SIM');
}

/**
 * 工程表オブジェクト
 * @constructor
 */
function WSAPP() {
  /**
   * @type {WSAPP}
   * @instance
   */
  var self = this;
  /**
   * サーバから取得したDB内容
   * @type {Model}
   * @instance
   */
  this.m = new Model();
  /**
   * 画面オブジェクト
   * @type {Gantts}
   * @instance
   */
  this.gts = new Gantts();
  /**
   * 製造実績登録ダイアログの履歴グリッド
   * @type {jQuery}
   * @instance
   */
  this.gridProdResult = null;
  /**
   * 出荷実績登録ダイアログの履歴グリッド
   * @type {jQuery}
   * @instance
   */
  this.gridShipResult = null;
  /**
   * リーフ分割・結合ダイアログのグリッド
   * @type {jQuery}
   * @instance
   */
  this.gridDivide = null;
  /**
   * サーバへの作業予定日時変更要求用製造リーフ配列。一括更新時に使用
   * @type {TaskObject[]}
   * @instance
   */
  this.leafsProdUpdatePlanQueue = [];
  /**
   * サーバへの作業予定日時変更要求用出荷リーフ配列。一括更新時に使用
   * @type {TaskObject[]}
   * @instance
   */
  this.leafsShipUpdatePlanQueue = [];
  /**
   * サーバへの作業予定日時変更要求用シミュレーションモード製造リーフ配列。一括更新時に使用
   * @type {TaskObject[]}
   * @instance
   */
  this.leafsProdSimUpdatePlanQueue = [];
  /**
   * サーバへの作業予定日時変更要求用シミュレーションモード出荷リーフ配列。一括更新時に使用
   * @type {TaskObject[]}
   * @instance
   */
  this.leafsShipSimUpdatePlanQueue = [];
  /**
   * 後工程自動整列のスイッチ
   * @type {jQuery}
   * @instance
   */
  this.swAutoplaceParent = null;
  /**
   * 前工程自動整列のスイッチ
   * @type {jQuery}
   * @instance
   */
  this.swAutoplaceChild = null;
  /**
   * 配置行自動整列のスイッチ
   * @type {jQuery}
   * @instance
   */
  this.swAutoplaceSamerow = null;
  /**
   * 影響行自動整列のスイッチ
   * @type {jQuery}
   * @instance
   */
  this.swAutoplaceAffectedrow = null;
  /**
   * 実績入力時整列のスイッチ
   * @type {jQuery}
   * @instance
   */
  this.swAutoplaceResult = null;
}

/**
 * タスクデータ明示用オブジェクト
 * @constructor
 */
function TaskObject() {
  // DB取得分
  this.belong_cd = '';
  this.leaf_no = '';
  this.estimate_no = '';
  this.statement_sub_no = '';
  this.estimate_sub_no = '';
  this.shipment_sub_no = '';
  this.p_cd = '';
  this.p_name = '';
  this.p_name_spec = '';
  this.p_name_supple = '';
  this.process_name = '';
  this.quantity = '';
  this.customer_cd = '';
  this.customer_post_cd = '';
  this.customer_charge_cd = '';
  this.salesman_cd = '';
  this.order_no = '';
  this.shipper_cd = '';
  this.stay_cd = '';
  this.delivery_cd = '';
  this.tc_short_name = '';
  this.title = '';
  this.handorver = '';
  this.start_plan_date = '';
  this.start_plan_time = '';
  this.finish_plan_date = '';
  this.finish_plan_time = '';
  this.interval = 0;
  this.warehouse_cd = '';
  this.org_leaf_no = '';
  this.start_prod_date = '';
  this.start_prod_time = '';
  this.finish_prod_date = '';
  this.finish_prod_time = '';
  this.remarks = '';
  this.row_no = 1;
  // this.deadline = '';


  this.prod_plan_no = '';   
  this.leafs_id = 0;
  this.leafs_detail = '';
  this.process_cd = '';
  this.leaf_sub_no = '';
  this.projects_id = 0;
  this.projects_name = '';
  this.projects_start_plan = new Date(0);
  this.projects_finish_plan = new Date(0);
  this.schedules_id = 0;
  this.schedules_start_plan = new Date(0);
  this.schedules_required_time = 0;
  this.schedules_detail = '';
  this.schedule_members_id = 0;
  this.schedule_members_requied_roles_id = 0;
  this.members_id = 0;
  this.members_name = '';
  this.roles_id = 0;
  this.roles_name = '';
  this.parent_id = 0;
  this.divide_id = 0;
  this.start_date = new Date(0);
  this.finish_date = new Date(0);
  // JS作成分
  this.equipments_id = 0;
  this.equipments_name = '';
  this.leafs_detail_parsed = null;
  this.schedules_detail_parsed = null;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.row = -1; //0;
  this.start_plan = new Date(0);
  this.selected = false;
  this.bgcolor = '#00E676';
  this.bordercolor = '#000000';
  this.textcolor = '#000000';
  this.effectType = [];
  this.visible = true;
  this.titleText = '';
  this.subText = '';
  this.isHitBySearch = false;
  this.canvasTextTitle = new CanvasText();
  this.canvasTextSub = new CanvasText();
  this.assignableTo = [];
  this.tooltip = [];
  /**
   * 親リーフのキャッシュ
   * @type {TaskObject[]}
   * @instance
   */
  this.cachedParentTasks = null;
  /**
   * 子リーフのキャッシュ
   * @type {TaskObject[]}
   * @instance
   */
  this.cachedChildTasks = null;
  /** その他の取得データ */
  this.data = {};
}

/**
 * データ用オブジェクト
 * @constructor
 */
function Model() {
  this.d = new ModelData();
  this.tasks = [new TaskObject()]; // DB側から取得するテーブル結合済みデータ
}

/**
 * DBから取得したデータ。
 * @constructor
 */
function ModelData() {
  this.leafship = [];


  this.leafs = [];
  this.leaf_details = [];
  this.members = [];
  this.projects = [];
  this.roles = [];
  this.schedules = [];
  this.schedule_details = [];
  this.schedule_members = [];
  this.leaf_assignable_to = [];
  this.calbdt = [];
  this.bdtmembers = [];
  this.bdtmembers1 = [];
  this.wbsctrl = [];
  this.ctrl = [];
  this.leaflist = [];
}

/**
 * ビューの表示設定を更新する。
 */
WSAPP.prototype.refreshView = function () {
  var self = this;
  var newWidth = $(window).width();
  //var newHeight = $(window).height();
  $('.cvsganttcanvas').attr('width', newWidth);

  Object.keys(self.gts).forEach(function (elem) {
    /** @type {CVSGantt} */
    var gt = self.gts[elem];
    gt.v.screenWidth = newWidth;
    // gt.v.screenHeight = newHeight;
    gt.v.tableWidth = gt.canvas.clientWidth - gt.v.tableX - 90;
    gt.v.tableHeight = gt.v.cellHeight * gt.v.row;
    gt.v.cellWidth = gt.v.tableWidth / gt.v.col;
    //gt.v.cellHeight = gt.v.tableHeight / gt.v.row;
    if (gt.id === 'SHIP') {
      gt.assignShipLeafPositions();
    } else {
      gt.assignLeafPositions();
    }
    gt.gridImg.firstTimeDraw = true;
    gt.holidayImg.firstTimeDraw = true;
    gt.redrawCanvas.call(ws);
  });
};

/**
 * 表示中の画面オブジェクトを取得する
 * @returns {CVSGantt} 表示中の画面
 */
WSAPP.prototype.getActiveGantt = function () {
  var self = this;
  switch ($('#tabs-gantt')['tabs']('option', 'active')) {
    case 0: //製造計画(人員)
      return self.gts.prodStaff;
    case 1: //製造計画(設備)
      return self.gts.prodEquipment;
    case 2: // 出荷
      return self.gts.ship;
    case 3: //プロジェクト
      return self.gts.proj;
    // case 3: //製造計画(人員)[シミュレーション]
    //   return self.gts.prodStaffSim;
    // case 4: //製造計画(設備)[シミュレーション]
    //   return self.gts.prodEquipmentSim;
    // case 6: //[シミュレーション]
    //   return self.gts.shipSim;
    // case 5: //プロジェクト[シミュレーション]
    //   return self.gts.projSim;
    default:
      return null;
  }
};

/**
 * 指定ガントチャートに対応する更新用キューを取得する
 * @param {CVSGantt} gt キューを取得する対象のCVSGantt
 * @returns {TaskObject[]} 対応するキュー
 */
WSAPP.prototype.getQueue = function (gt) {
  var self = this;
  switch (gt) {
    case self.gts.prodStaff: //製造計画(人員)
    case self.gts.prodEquipment: //製造計画(設備)
    case self.gts.proj: //プロジェクト
      return self.leafsProdUpdatePlanQueue;
    case self.gts.ship: //
      return self.leafsShipUpdatePlanQueue;
    // case self.gts.prodStaffSim: //製造計画(人員)[シミュレーション]
    // case self.gts.prodEquipmentSim: //製造計画(設備)[シミュレーション]
    // case self.gts.projSim: //プロジェクト[シミュレーション]
    //   return self.leafsProdSimUpdatePlanQueue;
    // case self.gts.shipSim: //[シミュレーション]
    //   return self.leafsShipSimUpdatePlanQueue;
    default:
      return null;
  }
};

/**
 * 後工程自動整列の有効状態を返す
 */
WSAPP.prototype.autoplaceParentEnabled = function () {
  return this.swAutoplaceParent.prop('checked');
};

/**
 * 前工程自動整列の有効状態を返す
 */
WSAPP.prototype.autoplaceChildEnabled = function () {
  return this.swAutoplaceChild.prop('checked');
};

/**
 * 配置行自動整列の有効状態を返す
 */
WSAPP.prototype.autoplaceSameRowEnabled = function () {
  return this.swAutoplaceSamerow.prop('checked');
};

/**
 * 影響行自動整列の有効状態を返す
 */
WSAPP.prototype.autoplaceAffectedRowEnabled = function () {
  return this.swAutoplaceAffectedrow.prop('checked');
};

/**
 * 実績入力時整列の有効状態を返す
 */
WSAPP.prototype.autoplaceResultEnabled = function () {
  return this.swAutoplaceResult.prop('checked');
};

/**
 * 入力欄出力及び入力形式を設定して、リーフ編集ダイアログを開く
 */
WSAPP.prototype.openEditLeafDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetSchedulesid = gt.contextmenu.attr('data-schedulesid');
  $('#frm-editleaf [name=schedulesid]').val(targetSchedulesid);
  var targetSchedule = gt.items.filter(function (elem) {
    return Number(elem.schedules_id) === Number(targetSchedulesid);
  });
  $('#editleaf-keylist').empty();
  ws.m.d.schedule_details.forEach(function (elem) {
    var curval = targetSchedule[0].schedules_detail_parsed[elem['colkey']];
    $('#editleaf-keylist').append($.parseHTML('<div><label for="' + elem['colkey'] +
      '">' + elem['coldesc'] +
      ':</label><input name="' + elem['colkey'] + '" size="20" value="' +
      (curval !== undefined && curval !== null ? curval : '') +
      '" data-coltype="' + elem['coltype'] + '" /></div>'));
  });
  assignInputsForm('#editleaf-keylist');
  $('#dlg-editleaf')['dialog']('open');
  gt.toggleContextmenu(false);
};

/**
 * 入力欄出力及び入力形式を設定して、製造実績登録ダイアログを開く
 */
WSAPP.prototype.openProdResultDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetLeafsid = gt.contextmenu.attr('data-leafsid');
  var lf = gt.getItemByLeafsId(targetLeafsid);
  $('#dlg-prodresult')['dialog']('open');
  gt.toggleContextmenu(false);
  $('#frm-prodresult input[name=companycd]').val(lf.belong_cd);
  // $('#prodresult-storages-loadmsg').text('読込中...');
  // 各種実績入力欄初期化
  $('#frm-prodresult input[name=leafno]').val(lf.leaf_no);
  $('#frm-prodresult input[name=prodplanno]').val(lf.prod_plan_no);
  let str = makeStrProductStandard(lf);
  $('#frm-prodresult input[name=productname]').val(lf.p_name + ' ' + str);
  $('#frm-prodresult input[name=process]').val(lf.l_process_cd + ' ' + lf.process_name);
  // $('#frm-prodresult input[name=prodgroup]').val(lf.);   // G値
  $('#frm-prodresult input[name=planinterval]').val(WSUtils.decFloor(lf.interval, 0));
  $('#frm-prodresult input[name=interval]').val(WSUtils.decFloor(lf.l_required_time, 0));
  $('#frm-prodresult input[name=thisinterval]').val('');
  $('#frm-prodresult input[name=equipmentname]').val(lf.equipments_name);
  $('#frm-prodresult input[name=prodstartdate]').val('');
  $('#frm-prodresult input[name=prodabortcnt]').val('');
  $('#frm-prodresult input[name=start_dt]').val('');
  $('#frm-prodresult input[name=finish_dt]').val('');

  // 既存データ欄  
  let strDate = WSUtils.makeDateString(lf.start_date);
  if (lf.start_date.getTime() === new Date(0).getTime()) {
    strDate = '';
  } 
  $('#frm-prodresult input[name=prodrepstartdt]').val(strDate);
  strDate = WSUtils.makeDateString(lf.finish_date);
  if (lf.finish_date.getTime() === new Date(0).getTime()) {
    strDate = '';
  } 
  $('#frm-prodresult input[name=prodrepfindt]').val(strDate);
  if (lf.l_required_time <= 0) {
    $('#frm-prodresult input[name=prodrepinterval]').val('');
  } else {
    $('#frm-prodresult input[name=prodrepinterval]').val(WSUtils.decFloor(lf.l_required_time, 0));
  }
  $('#frm-prodresult input[type=checkbox]').prop('checked',false);
};

/***
 * 製造実績詳細入力画面
 */
WSAPP.prototype.openProdDetailResultDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetLeafsid = gt.contextmenu.attr('data-leafsid');
  var lf = gt.getItemByLeafsId(targetLeafsid);
  $('#dlg-proddetailresult')['dialog']('open');
  gt.toggleContextmenu(false);
  // グリッド表示*****************************************************
  self.gridProdDetailResult = $('#gridProdDetailResult');
  jsGrid['locale']('ja');
  let ar = {
    'prodplanno': lf.prod_plan_no,
    'processcd': lf.l_process_cd,
  }
  // 工程毎に表示項目が異なるので注意。更新先は共通の項目と共通でない項目があるので注意すること
  if (lf.l_process_cd === '24' || lf.process_cd.substr(0,1) === '2') {
    self.gridProdDetailResult['jsGrid']({
      'autoload': true,
      'width': '100%',
      'height': '240px',
      'inserting': false,
      'editing': true,
      'sorting': false,
      'paging': false,
      'controller': {
        loadData: function() {
          let deferred = $.Deferred();

          $.ajax({
            type: 'post',
            url: ajaxUrl + 'ajax/readProdDetail',
            dataType: 'json',
            data: {
              'json': JSON.stringify(ar)
            },
            success: function(data){
              deferred.resolve(data.results);
            }
          });
          return deferred.promise();
        }
      },
      'fields': [
        { 'name': 'pw_disp_num', 'title': 'G', 'type': 'text', },
        { 'name': 'pw_ed_sub_08', 'title': '横サイズ', 'type': 'text', },
        { 'name': 'pw_ed_sub_09', 'title': '縦サイズ', 'type': 'text', },
        { 'name': 'pw_quantity', 'title': '枚数', 'type': 'text', },
        { 'name': 'pw_vert_num', 'title': '横本数', 'type': 'text', },
        { 'name': 'pw_chain_num', 'title': 'チェン数', 'type': 'text', },
        { 'name': 'prodflg', 'title': '状態', 'type': 'text', },
        { 'name': 'pw_result_number', 'title': '横本数', 'type': 'text', },
        { 'name': 'pw_result_chain', 'title': 'チェン数', 'type': 'text', },
        { 'type': 'control', 'editButton': false, 'deletebutton': false, 'width': 150,
          itemTemplate: function(value, item) {
            let fixBtn = $("<button>")
            .text('完了')
            .on('click', function(e) {
              e.stopPropagation();
              // データアップデート
              alert(item.id);
            });
            return $("<div>").append(fixBtn);
          },  
        },
      ],
    });
  } else {
    self.gridProdDetailResult['jsGrid']({
      'autoload': true,
      'width': '100%',
      'height': '240px',
      'inserting': false,
      'editing': true,
      'sorting': false,
      'paging': false,
      'controller': {
        loadData: function() {
          let deferred = $.Deferred();
          $.ajax({
            type: 'post',
            url: ajaxUrl + 'ajax/readProdDetail',
            dataType: 'json',
            data: {
              'json': JSON.stringify(ar)
            },
            success: function(data){
              deferred.resolve(data.results);
            }
          });
          return deferred.promise();
        }
      },
      'fields': [
        { 'name': 'pw_disp_num', 'title': '枝番', 'type': 'text', },
        { 'name': 'pw_ed_sub_08', 'title': '横サイズ', 'type': 'text', },
        { 'name': 'pw_ed_sub_10', 'title': '横補足', 'type': 'text', },
        { 'name': 'pw_ed_sub_09', 'title': '枚数', 'type': 'text', },
        { 'name': 'pw_ed_sub_11', 'title': '横本数', 'type': 'text', },
        { 'name': 'pw_chain_num', 'title': 'チェン数', 'type': 'text', },
        { 'name': 'prodflg', 'title': '状態', 'type': 'text', },
        { 'name': 'pw_result_number', 'title': '横本数', 'type': 'text', },
        { 'name': 'pw_result_chain', 'title': 'チェン数', 'type': 'text', },
        { 'type': 'control', 'editButton': false, 'deletebutton': false, 'width': 150,
          itemTemplate: function(value, item) {
            let abortBtn = $("<button>")
              .text('中断')
              .on('click', function(e) {
                alert("ID: " + item.id);
                e.stopPropagation();
  
              });
            let space = $("<label>").text('  ');
            let fixBtn = $("<button>")
            .text('完了')
            .on('click', function(e) {
              alert("ID: " + item.id);
              e.stopPropagation();
  
            });
            return $("<div>").append(abortBtn)
                             .append(space)
                             .append(fixBtn);
          },  
        },
      ],
    });
  }
}

// WSAPP.prototype.open

/**
 * 入力欄出力及び入力形式を設定して、実績登録ダイアログを開く
 */
WSAPP.prototype.openShipResultDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetLeafsid = gt.contextmenu.attr('data-leafsid');
  var lf = gt.getItemByLeafsId(targetLeafsid);
  $('#frm-shipresult [name=leafsid]').val(targetLeafsid);
  $('#dlg-shipresult')['dialog']('open');
  gt.toggleContextmenu(false);
  $('#shipresult-storages-loadmsg').text('読込中...');
  // 各種実績入力欄初期化
  if (lf.finish_date.getTime() === 0) {
    var startPlan = new Date(lf.start_plan.getTime());
    $('#frm-shipresult input[name^=start_date]').val($['datepicker']['formatDate']('yy-mm-dd', startPlan));
    $('#frm-shipresult select[name^=start_date_hour]').val(startPlan.getHours().toString() + ':00');
    var finishPlan = gt.getFinishPlan(lf);
    $('#frm-shipresult input[name^=finish_date]').val($['datepicker']['formatDate']('yy-mm-dd', finishPlan));
    $('#frm-shipresult select[name^=finish_date_hour]').val(finishPlan.getHours().toString() + ':00');
  } else {
    $('#frm-shipresult input[name^=start_date]').val($['datepicker']['formatDate']('yy-mm-dd', lf.start_date));
    $('#frm-shipresult select[name^=start_date_hour]').val(lf.start_date.getHours().toString() + ':00');
    $('#frm-shipresult input[name^=finish_date]').val($['datepicker']['formatDate']('yy-mm-dd', lf.finish_date));
    $('#frm-shipresult select[name^=finish_date_hour]').val(lf.finish_date.getHours().toString() + ':00');
  }
  $('#frm-shipresult input[name^=qty_good]').val('');
  $('#frm-shipresult input[name^=qty_bad]').val('');
  // グリッド初期化
  self.gridShipResult = $('#gridShipResult');
  jsGrid['locale']('ja');
  self.gridShipResult['jsGrid']({
    'width': '100%',
    'height': '240px',
    'inserting': false,
    'editing': false,
    'sorting': false,
    'paging': false,
    'fields': [
      { 'name': 'sto_product_id', 'title': '製品ID', 'type': 'text', },
      { 'name': 'p_name', 'title': '製品名', 'type': 'text', },
      { 'name': 'sto_created_at', 'title': '登録日時', 'type': 'text', },
      { 'name': 'sto_qty_good', 'title': '数量(良品)', 'type': 'text', },
      { 'name': 'sto_qty_bad', 'title': '数量(不良品)', 'type': 'text', },
      // { 'name': 'sto_qty_buy', 'title': '数量(手配時)', 'type': 'text', },
    ],
  });
  // self.gridShipResult.hide();
  // // 在庫情報を取得する
  // $.ajax({
  //   url: ajaxUrl + 'ajax/readleafstorage',
  //   type: 'post',
  //   data: {
  //     'leaftype': gt.id,
  //     'l_id': targetLeafsid,
  //   },
  //   success: function (data) {
  //     // グリッドに読込内容を表示
  //     var gridItems = data;
  //     self.gridShipResult['jsGrid']({ 'data': gridItems });
  //     self.gridShipResult.show();
  //     self.gridShipResult['jsGrid']('refresh');
  //     $('#shipresult-storages-loadmsg').text('');
  //   }
  // });
};

/**
 * 関連ファイルアップロードダイアログを開く
 */
WSAPP.prototype.openUploadFileDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  $('#frm-upload [name=leafsid]').val(gt.contextmenu.attr('data-leafsid'));
  $('#frm-upload [name=leaftype]').val(gt.id);
  $('#dlg-upload')['dialog']('open');
  // アップロードファイル一覧表示の後でコンテキストメニューを隠す
  showAttachmentsList(gt.contextmenu.attr('data-leafsid'));
  gt.toggleContextmenu(false);
};

/**
 * リーフ分割・結合ダイアログを開く
 */
WSAPP.prototype.openDivideLeafDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetLeafsid = gt.contextmenu.attr('data-leafsid');
  $('#frm-divide [name=leafsid]').val();
  $('#dlg-divide')['dialog']('open');
  gt.toggleContextmenu(false);
  $('#divide-loadmsg').text('読込中...');
  // グリッド初期化
  self.gridDivide = $('#gridDivide');
  jsGrid['locale']('ja');
  self.gridDivide['jsGrid']({
    'width': '100%',
    'height': '320px',
    'inserting': false,
    'editing': true,
    'sorting': false,
    'paging': false,
    'fields': [
      { 'name': 'l_id', 'title': 'リーフID', 'type': 'text', 'editing': false },
      { 'name': 'l_start_plan', 'title': '開始日時', 'type': 'text', 'editing': false },
      { 'name': 'l_required_time', 'title': '所要時間', 'type': 'number', 'editing': false },
      { 'name': 'l_amount', 'title': '予定数量', 'type': 'number', 'editing': false },
      { 'name': 'do_divide', 'title': '分割', 'type': 'checkbox', },
      { 'name': 'divide_amount', 'title': '分割先数量', 'type': 'number', },
      { 'name': 'do_combine', 'title': '結合', 'type': 'checkbox', },
      { 'name': 'result_num', 'title': '実績入力回数', 'type': 'number', 'editing': false },
      { 'type': 'control', 'deleteButton': false }
      // { 'name': 'l_divide_id', 'title': '分割グループ', 'type': 'text', },
    ],
  });
  self.gridDivide.hide();
  // リーフ分割状態を取得する
  var lf = gt.getItemByLeafsId(targetLeafsid);
  $.ajax({
    url: ajaxUrl + 'ajax/readdivideleaf',
    type: 'post',
    data: {
      'leaftype': gt.id,
      'lf': lf.data,
    },
    success: function (data) {
      // グリッドに読込内容を表示
      var gridItems = data;
      self.gridDivide['jsGrid']({ 'data': gridItems });
      self.gridDivide.show();
      self.gridDivide['jsGrid']('refresh');
      $('#divide-loadmsg').text('');
    }
  });
};

/**
 * 検索結果表示ダイアログを開く
 */
WSAPP.prototype.openSearchedResultDlg = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var lfsFound = gt.items.filter(function (elem) {
    return elem.isHitBySearch === true;
  });
  $('#dlg-search')['dialog']('open');
  // 検索結果のオブジェクトを保持
  $('#dlg-search')['data']('leafarray', lfsFound);
  // 検索結果を表示
  var lfsLen = lfsFound.length;
  $('#lb-search').empty();
  for (var i = 0; i < lfsLen; i++) {
    var strColor = '#000000';
    var dtStr = getDBDatetimeMinutesStrForPHP(lfsFound[i].start_plan);
    var itemName = lfsFound[i].leafs_id + ':' + lfsFound[i].titleText + ' / ' + lfsFound[i].subText +
      ' / ' + (dtStr ? dtStr : '-');
    if (lfsFound[i].finish_date.getTime() !== 0) {
      itemName += ' [完了済]';
    }
    $('#lb-search').append('<option value="' + i + '" style="color:' + strColor + '">'
      + itemName + '</option>');
  }
  $('#search-amount').text('検索結果:' + lfsFound.length + '件');
};

/**
 * 検索結果に移動する
 */
WSAPP.prototype.moveToSearchedResult = function () {
  var self = this;
  var gt = self.getActiveGantt();
  /** @type {TaskObject[]} */
  var lfsFound = [];
  // 選択された項目を取得
  lfsFound = $('#dlg-search')['data']('leafarray');
  if (lfsFound === null) {
    return;
  }
  var idx = Number($('#lb-search').val());
  var lf = lfsFound[idx];
  // 項目の配置位置に移動
  gt.scrollTableYAbs(lf.row);
  gt.scrollTableXAbs(lf.start_plan);
  // 選択状態を切り替え
  gt.items.forEach(function (elem) {
    elem.selected = false;
    elem.isHitBySearch = false;
  });
  gt.v.searchedId = lf.leafs_id;
};

/**
 * 自動配置を実行する
 */
WSAPP.prototype.execAutoPlaceLeaf = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetSchedulesid = gt.contextmenu.attr('data-schedulesid');
  var targetSchedule = gt.items.filter(function (elem) {
    return Number(elem.schedules_id) === Number(targetSchedulesid);
  });
  autoPlaceLeaf(targetSchedule[0]);
  gt.toggleContextmenu(false);
};

/**
 * 予想在庫数量を数えてグラフを表示する
 */
WSAPP.prototype.countEstimateStock = function () {
  var self = this;
  var gt = self.getActiveGantt();
  var targetLeafsid = gt.contextmenu.attr('data-leafsid');
  $('#frm-prodresult [name=leafsid]').val(targetLeafsid);
  var item = gt.items.filter(function (elem) {
    return elem.leafs_id === Number(targetLeafsid);
  })[0];
  var isSimMode = (gt.id === 'PROD_STAFF_SIM' || gt.id === 'PROD_EQUIPMENT_SIM' ||
    gt.id === 'PROJ_SIM' || gt.id === 'SHIP_SIM') ? true : false;
  var dat = {
    'sim': isSimMode,
    'p_id': item.data['l_p_id'],
  };
  $('#estimatestock-graph-wait').show();
  $('#estimatestock-chart').css('opacity', '0.5'); //hide();
  $('#dialog-estimatestock-graph')['dialog']('open');
  ajaxPost('countestimatestock', dat, function (resp) {
    $('#estimatestock-graph-wait').hide();
    // $('#estimatestock-chart').show();
    $('#estimatestock-chart').css('opacity', '1.0'); //hide();
    var objs = resp;//JSON.parse(resp);
    var results = {
      'prod': [],
      'ship': [],
      'mat': [],
      'current': [],
      'info': []
    };
    objs['prod'].forEach(function (elem) {
      var obj = {
        'plan_date': WSUtils.convertMysqlDatetime(elem['plan_date']),
        'qty_good': Number(elem['qty_good']),
        'dy': Number(elem['dy']),
      };
      results['prod'].push(obj);
    });
    objs['ship'].forEach(function (elem) {
      var obj = {
        'plan_date': WSUtils.convertMysqlDatetime(elem['plan_date']),
        'qty_good': Number(elem['qty_good']),
        'dy': Number(elem['dy']),
      };
      results['ship'].push(obj);
    });
    objs['mat'].forEach(function (elem) {
      var obj = {
        'plan_date': WSUtils.convertMysqlDatetime(elem['plan_date']),
        'qty_good': Number(elem['qty_good']),
        'dy': Number(elem['dy']),
      };
      results['mat'].push(obj);
    });
    objs['current'].forEach(function (elem) {
      var obj = {
        'qty_good': Number(elem['qty_good']),
      };
      results['current'].push(obj);
    });
    objs['info'].forEach(function (elem) {
      var obj = {
        'p_id': elem['p_id'],
        'p_name': elem['p_name'],
      };
      results['info'].push(obj);
    });
    displayEstimateStockChart(results);
  });
};

/**
 * detailsの情報をJSONに格納されていた値から変換する。
 * @param {string} coltype 型
 * @param {string} colvalue 値
 * @return {*} 変換後の値。
 */
function convertCustomColValue(coltype, colvalue) {
  var convertedval = null;
  switch (coltype) {
    case 'VARCHAR':
      convertedval = String(colvalue);
      break;
    case 'DATE':
      if (Number(colvalue) > 0) {
        convertedval = $['datepicker']['formatDate']('yy-mm-dd', new Date(Number(colvalue)));
      } else {
        convertedval = '-';
      }
      break;
    case 'INT':
      var filtered = WSUtils.filterInt(colvalue);
      convertedval = (isNaN(filtered) === false ? filtered : null);
      break;
    default:
      convertedval = String(colvalue);
      break;
  }
  return convertedval;
}


/**
 * 規格文字列作成
 * @param {*} item 
 */
function makeStrProductStandard(item) {
  // 線径、目合、大きさ 見積明細から作成
  let str = '';
  if (!WSUtils.isSet(item['l_ed_sub_01'])) {
    // 線径①がセットされてなかったら戻る
    return str;
  }
  if (!WSUtils.isSet(item['l_ed_sub_01'])) {
    // 線径1がセットされていない場合は寸法へ進む
  } else {
    // 縦線・横線
    if (WSUtils.isSet(item['l_ed_sub_12']) || WSUtils.isSet(item['l_ed_sub_13'])) {
      // 平線の場合
      if ((item['l_ed_sub_01'] === item['l_ed_sub_02']) && (item['l_ed_sub_12'] === item['l_ed_sub_13'])) {
        // 縦横同じ厚みt,幅Wならばsub01のみ表示
        str = 't' + item['l_ed_sub_12'] + '×' + 'W' + item['l_ed_sub_01'];
      } else if (!WSUtils.isSet(item['l_ed_sub_02'])) {
        // 縦横同じ設定と同意
        str = 't' + item['l_ed_sub_12'] + '×' + 'W' + item['l_ed_sub_01'];
      } else {
        str = 't' + item['l_ed_sub_12'] + '×' + 'W' + item['l_ed_sub_01'] + '×' + 't' + item['l_ed_sub_13'] + '×' + 'W' + item['l_ed_sub_02'];
      }
    } else {
      // 丸線の場合
      if (item['l_ed_sub_01'] === item['l_ed_sub_02']) {
        // 縦横同じ
        str = 'φ' + item['l_ed_sub_01'];
      } else if (!WSUtils.isSet(item['l_ed_sub_02'])) {
        str = 'φ' + item['l_ed_sub_01'];
      } else {
        str = 'φ' + item['l_ed_sub_01'] + '×' + item['l_ed_sub_02'];
      }
    }
    // 目合
    // 目合区分＋目合＋目合単位
    if (item['l_ed_sub_04'] === item['l_ed_sub_05']) {
      if (WSUtils.isSet(item['l_ed_sub_03'])) {
        // 目合区分
        str += '×' + item['l_ed_sub_03'] + item['l_ed_sub_04'] + item['l_ed_sub_06'] + ' ';
      } else {
        str += '×' + item['l_ed_sub_03'] + item['l_ed_sub_04'] + item['l_ed_sub_06'] + ' ';
      }
    } else if (!WSUtils.isSet(item['l_ed_sub_05'])) {
      if (WSUtils.isSet(item['l_ed_sub_03'])) {
        // 目合区分
        str += '×' + item['l_ed_sub_03'] + item['l_ed_sub_04'] + item['l_ed_sub_06'] + ' ';
      } else {
        $str += '×' + item['l_ed_sub_03'] + item['l_ed_sub_04'] + item['l_ed_sub_06'] + ' ';
      }
    } else {
      if (WSUtils.isSet($record['l_ed_sub_03'])) {
        str += '×' + item['l_ed_sub_03'] + item['l_ed_sub_04'] + item['l_ed_sub_06'] + '×' + item['l_ed_sub_03'] + item['l_ed_sub_05'] + item['l_ed_sub_06'] + ' ';
      } else {
        str += '×' + item['l_ed_sub_04'] + item['l_ed_sub_06'] + '×' + item['l_ed_sub_05'] + item['l_ed_sub_06'] + ' ';
      }
    }
  }
  return str;
}

/**
 * 出荷詳細ダイアログを開く
 */
WSAPP.prototype.openShipdetailsDlg = function () {
  $('#dlg-shipdetails')['dialog']('open');
  var leafNo = $('#contextmenu-ship').data('leaf-no');
  ajaxreadshipdetails(leafNo);
};
