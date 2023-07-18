/**
 * @fileOverview データベース接続関数
 * @author Fumihiko Kondo
 */

/**
 * Ajax通信の設定(通信リトライ処理またはエラー表示)
 */
function setupAjax() {
  // コントローラのajax.phpのパスをURL指定で使用するためパス取得
  var getUrl = window.location;
  ajaxUrl = getUrl.protocol + '//' + getUrl.host + '/' + getUrl.pathname.split('/')[1] + '/';
  ajaxUrl = ajaxUrl + 'index.php/';
  // if (location.pathname.indexOf('index.php/') != -1) {
  //   ajaxUrl = '';
  // } else {
  //   ajaxUrl = 'index.php/';
  // }
  $.ajaxSetup({
    'cache': false,
    trycnt: 0,
    // Ajax通信が失敗した場合
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      // エラーメッセージの表示
      console.log('通信エラー。(' + this.trycnt + '/3)');
      console.log(this['data']);
      console.log(XMLHttpRequest);
      console.log(textStatus);
      console.log(errorThrown);
      this.trycnt++;
      if (this.trycnt <= 3) {
        $.ajax(this);
        return;
      } else {
        console.log('再送中断。');
        window.alert('通信エラー: ' + errorThrown);
      }
      return;
    }
  });
}

/**
 * データベース内容再読み込み
 * @param {Function} func 成功時に実行する関数
 */
function ajaxReload(func) {
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/reload',
    data: {
      'number': 1
    },
    dataType: 'json',
    success: function (data) {
      // 詳細情報初期データ
      // ws.m.d.leaf_details = data['leaf_details'];
      ws.m.d.schedule_details = data['schedule_details'];
      ws.m.d.leaf_assignable_to = data['leaf_assignable_to'];
      ws.m.d.calbdt = data['calbdt'];
      ws.m.d.bdtmembers = data['bdtmembers'];
      ws.m.d.bdtmembers1 = data['bdtmembers1'];
      ws.m.d.wbsctrl = data['wbsctrl'];
      ws.m.d.ctrl = data['ctrl'];
      // ws.m.d.leaflist = data['leaflist'];
      // 初回読み込み時にコントロールテーブルの内容を反映
      /* if (!ws.gts.prodStaff.isInited) {
        ws.gts.prodStaff.v.fixval.DAY_ST_HOUR = Number(data['wbsctrl'][0]['day_st_hour']);
        ws.gts.prodStaff.v.fixval.DAY_EN_HOUR = Number(data['wbsctrl'][0]['day_en_hour']);
        ws.gts.prodStaffSim.v.fixval.DAY_ST_HOUR = Number(data['wbsctrl'][0]['day_st_hour']);
        ws.gts.prodStaffSim.v.fixval.DAY_EN_HOUR = Number(data['wbsctrl'][0]['day_en_hour']);
      } */
      ws.refreshView();
      if (typeof func != 'undefined') {
        func(data);
      }
    }
  });
}

/**
 * データベース内容再読み込み
 * @param {CVSGantt=} gtProdStaff 製造工程表(人員)のガントチャート
 * @param {CVSGantt=} gtProdEquipment 製造工程表(設備)のガントチャート
 * @param {CVSGantt=} gtProj 製造工程表のガントチャート
 */
function ajaxReadprodplan(gtProdStaff, gtProdEquipment, gtProj) {
  if (!gtProdStaff) {
    gtProdStaff = ws.gts.prodStaff;
  }
  if (!gtProdEquipment) {
    gtProdEquipment = ws.gts.prodEquipment;
  }
  if (!gtProj) {
    gtProj = ws.gts.proj;
  }
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/readleafplan',
    data: {
      'leaftype': gtProdStaff.id
    },
    dataType: 'json',
    success: function (data) {
      // ドラッグ中の再読込回避
      if (ws.getActiveGantt().i.draggingLeaf) {
        return;
      }
      // 表示行の設定
      gtProdStaff.v.rowdata = [];
      gtProdEquipment.v.rowdata = [];
      gtProj.v.rowdata = [];
      // メンバー(人員)表示
      var rowcnt = 0;
      data['members'].forEach(function (elem) {
        if (Number(elem['roles_id']) === gtProdStaff.v.axistype) {
          var rowdat = new RowObject();
          rowdat.id = Number(elem['id']);
          rowdat.title = elem['name'];
          rowdat.start_plan = new Date(0);
          rowdat.finish_plan = new Date(0);
          rowdat.row = rowcnt;
          rowdat.isDayOnlyPlaceable = elem['ignore_cal'] === '0' ? true : false;
          gtProdStaff.v.rowdata.push(rowdat);
          rowcnt++;
        }
      });
      gtProdStaff.v.row = gtProdStaff.v.rowdata.length > 10 ? 10 : gtProdStaff.v.rowdata.length;
      if (gtProdStaff.v.rowdata.length < gtProdStaff.v.displayingRow + 10) {
        gtProdStaff.v.displayingRow = Math.max(gtProdStaff.v.rowdata.length - 10, 0);
      }
      // showDate = gtProdStaff.v.displayingDate;

      // メンバー(設備)表示
      rowcnt = 0;
      data['members'].forEach(function (elem) {
        if (Number(elem['roles_id']) === gtProdEquipment.v.axistype) {
          var rowdat = new RowObject();
          rowdat.id = Number(elem['id']);
          rowdat.title = elem['name'];
          rowdat.start_plan = new Date(0);
          rowdat.finish_plan = new Date(0);
          rowdat.row = rowcnt;
          // 24時間勤務かどうか 0:定時
          rowdat.isDayOnlyPlaceable = elem['ignore_cal'] === '0' ? true : false;
          gtProdEquipment.v.rowdata.push(rowdat);
          rowcnt++;
        }
      });
      gtProdEquipment.v.row = gtProdEquipment.v.rowdata.length > 10 ? 10 : gtProdEquipment.v.rowdata.length;
      if (gtProdEquipment.v.rowdata.length < gtProdEquipment.v.displayingRow + 10) {
        gtProdEquipment.v.displayingRow = Math.max(gtProdEquipment.v.rowdata.length - 10, 0);
      }
      // プロジェクト表示
      rowcnt = 0;
      data['projects'].forEach(function (elem) {
        var rowdat = new RowObject();
        rowdat.id = Number(elem['id']);
        var str = Array(Number(elem['depth']) + 1).join('+');
        rowdat.title = elem['name'];
        rowdat.start_plan = WSUtils.convertMysqlDatetime(elem['start_plan']);
        rowdat.finish_plan = WSUtils.convertMysqlDatetime(elem['finish_plan']);
        rowdat.row = rowcnt;
        rowdat.indent = Number(elem['depth']) * 12 + 8;
        rowdat.textAlign = 'left';
        rowdat.isDayOnlyPlaceable = false;
        gtProj.v.rowdata.push(rowdat);
        rowcnt++;
      });
      gtProj.v.row = gtProj.v.rowdata.length > 10 ? 10 : gtProj.v.rowdata.length;
      if (gtProj.v.rowdata.length < gtProj.v.displayingRow + 10) {
        gtProj.v.displayingRow = Math.max(gtProj.v.rowdata.length - 10, 0);
      }
      // タスク配列初期化
      ws.m.tasks.splice(0, ws.m.tasks.length);
      gtProdStaff.items.splice(0, gtProdStaff.items.length);
      gtProdEquipment.items.splice(0, gtProdEquipment.items.length);
      gtProj.items.splice(0, gtProj.items.length);
      // 各タスク情報及びdetailのJSON内容取得後、代入
      /** @type {Array} */
      var insertedSchedulesId = [];
      let dDate = '';
      data['tasks'].forEach(function (elem) {
        // DB取得分
        var lf = new TaskObject();
        lf.belong_cd = elem['l_belong_cd'];
        lf.leaf_no = elem['l_leaf_no'];
        lf.estimate_no = elem['l_estimate_no_01'] & ',' & elem['l_estimate_no_02'] & ',' & elem['l_estimate_no_03'];
        lf.p_cd = elem['l_p_cd'];
        lf.p_name = elem['p_name'];
        // 製品規格は画面表示時に整形する
        lf.p_name_spec = '';
        lf.start_plan_date = elem['l_pd_start_plan_date'];
        lf.start_plan_time = elem['l_pd_start_plan_time'];
        lf.start_plan = WSUtils.convertStrToDate(elem['l_pd_start_plan_date'] + elem['l_pd_start_plan_time']);
        lf.finish_plan_date = elem['l_pd_finish_plan_date'];
        lf.finish_plan_time = elem['l_pd_finish_plan_time'];
        lf.finish_plan = WSUtils.convertStrToDate(elem['l_pd_finish_plan_date'] + elem['l_pd_finish_plan_time']);

        lf.leafs_id = elem['l_leaf_no'];
        lf.leafs_detail = '';
        lf.l_process_cd = String(elem['l_process_cd']);
        lf.l_process_name = String(elem['pc_name']);
        lf.projects_id = '1001';
        lf.equipments_id = Number(elem['l_equipment_member_id']);
        lf.equipments_name = elem['name'];
        lf.prod_plan_no = elem['l_prod_plan_no'];
        lf.interval = elem['l_pd_plan_interval'];
        lf.l_required_time = elem['l_pd_real_interval'];
        lf.projects_start_plan = '';
        lf.projects_finish_plan = '';
        lf.schedules_id = elem['l_leaf_no'];
        lf.schedules_start_plan = WSUtils.convertMysqlDatetime(elem['l_pd_start_plan_date']);
        lf.schedules_required_time = Number(elem['l_required_time']);
        lf.schedules_detail = '';
        lf.schedule_members_id = 1;
        lf.schedule_members_requied_roles_id = 1;
        lf.members_id = Number(elem['l_worker_member_id']);   // default
        lf.start_date = WSUtils.convertStrToDate(elem['l_pd_start_date'] + elem['l_pd_start_time']);
        lf.finish_date = WSUtils.convertStrToDate(elem['l_pd_finish_date'] + elem['l_pd_finish_time']);
        lf.title = elem['e_title'];
        // lf.schedule_members_id = Number(elem['schedule_members_id']);
        // lf.schedule_members_requied_roles_id = Number(elem['schedule_members_requied_roles_id']);
        // lf.roles_id = Number(elem['roles_id']);
        // lf.parent_id = Number(elem['l_parent_id']);
        // lf.divide_id = Number(elem['l_divide_id']);
        // lf.start_date = WSUtils.convertMysqlDatetime(elem['l_pd_start_date']);
        // lf.finish_date = WSUtils.convertMysqlDatetime(elem['l_pd_finish_date']);

        /* switch (gtProdStaff.v.axistype) {
          case 1:
            lf.members_id = Number(elem['l_worker_member_id']);
            break;
          case 2:
            lf.members_id = Number(elem['l_equipment_member_id']);
            break;
          case -1:
            lf.members_id = Number(elem['l_projects_id']);
            break;
          default:
            lf.members_id = Number(elem['members_id']);
            break;
        } */
        // JS作成分
        lf.leafs_detail_parsed = {}; //JSON.parse(elem['leafs_detail']);
        lf.schedules_detail_parsed = {}; //JSON.parse(elem['schedules_detail']);
        lf.width = gtProdStaff.v.fixval.LEAF_DEF_WIDTH;
        lf.height = gtProdStaff.v.fixval.LEAF_DEF_HEIGHT;
        // lf.titleText = elem['l_ppd_prodplan_id'];
        // リーフの表示項目 subTextは画面上で処理(リーフデータは作業者タブと設備タブで共通のため)
        lf.titleText = elem['l_prod_plan_no'];

        // if (!WSUtils.isSet(elem['ppd_finish_plan'])) {
        //   lf.subText = '';
        //   lf.subText = '';
        // } else {
        //   // lf.subText = elem['ppd_finish_plan'];
        //   // lf.subText = elem['pp_title'];
        //   // lf.subText = elem['customer_cd'];
        //   lf.subText = elem['e_title'];
        // }

        // $text = '';
        // if (elem['l_worker_member_id'] === null) {
        //   $text = elem[''];
        // } else {
        //   for ($i = 0; $i < data['members'].length; $i++) {
        //     if (data['members'][$i]['id'] == elem['l_worker_member_id']) {
        //       $text = data['members'][$i]['name'];  
        //     } 
        //   }
        // }
        // lf.subText = $text;
        // ↑　ここまで
        lf.tooltip.push('客先:' + (elem['C_CUSTOMER_NAME'] ? elem['C_CUSTOMER_NAME'] : '-'));
        lf.tooltip.push('件名:' + (elem['e_title'] ? elem['e_title'] : '-'));
        lf.tooltip.push('品名:' + (elem['p_name'] ? elem['p_name'] : '-'));
        // lf.tooltip.push('数量:' + (elem['l_estimate_quantity'] ? elem['l_estimate_quantity'] : '-'));
        // lf.tooltip.push('数量:' + Math.ceil(elem['l_estimate_quantity']));
        // 製造工程追加
        // lf.tooltip.push('製造工程:' + elem['l_process_cd']);

        lf.assignableTo = ws.m.d.leaf_assignable_to.filter(function (elemB) {
          return lf.leafs_id === elemB['leafs_id'];
        }).map(function (elem) {
          return elem['members_id'];
        }).toString();
        lf.data = elem;
        ws.m.tasks.push(lf);
        // 左軸に対応するスケジュールデータのみ表示
        //if (Number(elem['schedule_members_requied_roles_id']) === gtProd.v.axistype) {}
        gtProdStaff.items.push($.extend(true, {}, lf));
        gtProdEquipment.items.push($.extend(true, {}, lf));
        // プロジェクト表示の際のリーフ重複回避
        if (insertedSchedulesId.findIndex(function (elemB) {
          return Number(elem['l_leaf_no']) === elemB;
        }) === -1) {
          gtProj.items.push($.extend(true, {}, lf));
        }
        insertedSchedulesId.push(Number(lf.schedules_id));
      });
      // 表示スタイルを更新
      gtProdStaff.isInited = true;
      gtProdEquipment.isInited = true;
      gtProj.isInited = true;
      ws.refreshView();
    }
  });
}

/**
 * 出荷日程表画面情報を読込
 * @param {CVSGantt=} gtShip 出荷日程表のガントチャート
 */
function ajaxReadshipplan(gtShip) {
  if (!gtShip) {
    gtShip = ws.gts.ship;
  }
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/readleafplan',
    data: {
      'leaftype': gtShip.id
    },
    dataType: 'json',
    success: function (data) {
      // ドラッグ中の再読込回避
      if (gtShip.i.draggingLeaf) {
        return;
      }
      // 表示行の設定
      let rowcnt = 0;
      let cnt = 1;    // リーフ表示用連番
      gtShip.v.rowdata = [];
      // メンバー表示 
      // for (let i = 0; i < gtShip.v.fixval.LIST_DEF_VERTICAL_NUM; i++ ) {
      //   let rowdat = new RowObject();
      //   rowdat.id = i;
      //   rowdat.title = '';
      //   rowdat.start_plan = new Date(0);
      //   rowdat.finish_plan = new Date(0);
      //   rowdat.row = rowcnt;
      //   rowdat.isDayOnlyPlaceable = true;
      //   gtShip.v.rowdata.push(rowdat);
      //   rowcnt++;
      // }
      data['warehouse'].forEach(function (elem) {
        var rowdat = new RowObject();
        rowdat.id = Number(elem['w_id']);
        rowdat.title = elem['w_name'];
        rowdat.start_plan = new Date(0);
        rowdat.finish_plan = new Date(0);
        rowdat.row = rowcnt;
        rowdat.isDayOnlyPlaceable = true;
        gtShip.v.rowdata.push(rowdat);
        rowcnt++;
      });
      // defaultの縦軸表示セル数が10なので、10より大きければ10表示、小さければ該当数表示
      gtShip.v.row = gtShip.v.rowdata.length > 10 ? 10 : gtShip.v.rowdata.length;
      if (gtShip.v.rowdata.length < gtShip.v.displayingRow + 10) {
        gtShip.v.displayingRow = Math.max(gtShip.v.rowdata.length - 10, 0);
      }
      // タスク配列初期化
      gtShip.items.splice(0, gtShip.items.length);
      // 各タスク情報及びdetailのJSON内容取得後、代入
      data['leafship'].forEach(function (elem) {
        // 2023/6/23 受注データが削除されている場合があるため、以下の処理で対応
        if (elem['e_shipplan_date'] == '' || elem['e_shipplan_date'] == null) {
          return;
        }
        // DB取得分
        var lf = new TaskObject();
        cnt++;
        lf.belong_cd = elem['l_belong_cd'];
        lf.leaf_no = elem['l_leaf_no'];
        lf.estimate_no = elem['l_estimate_no'];
        lf.statement_sub_no = elem['l_statement_sub_no'];
        lf.estimate_sub_no = elem['l_estimate_sub_no'];
        lf.shipment_sub_no = elem['l_shipment_sub_no'];
        lf.p_cd = elem['l_p_cd'];
        lf.p_name_supple = elem['l_p_name_supple'];
        lf.quantity = elem['l_quantity'];
        lf.customer_cd = elem['l_customer_cd'];
        lf.customer_post_cd = elem['l_customer_post_cd'];
        lf.customer_charge_cd = elem['l_customer_charge_cd'];
        lf.salesman_cd = elem['l_salesman_cd'];
        lf.order_no = elem['l_order_no'];
        lf.shipper_cd = elem['l_shipper_cd'];
        lf.stay_cd = elem['l_stay_cd'];
        lf.delivery_cd = elem['l_delivery_cd'];;
        lf.tc_short_name = elem['l_tc_short_name'];
        lf.title = elem['l_title'];
        lf.handorver = elem['l_handorver'];
        lf.start_plan_date = elem['l_start_plan_date'];
        lf.start_plan_time = elem['l_start_plan_time'];
        lf.interval = elem['l_interval'];
        lf.row_no = elem['row_num'];
        // lf.deadline = elme['l_deadline']; // 納期確保用
        // lf.warehouse_cd = elem['l_warehouse_cd'];
        // lf.warehouse_cd = elem['l_warehouse_cd'];
        lf.org_leaf_no = elem['l_org_leaf_no'];
        // PG用はstart_date:Datetime型。DBはstart_date:String型(yyyymmdd),start_time:String型(hhmm)なので、PG用に変換して変数セット。
        // 変数名が同じなので、混同しないように注意
        // lf.start_date = WSUtils.convertMysqlDatetime(elem['l_start_date']);
        // lf.finish_date = WSUtils.convertMysqlDatetime(elem['l_finish_date']);
        lf.start_date = WSUtils.convertStrToDate(elem['l_start_date'] + elem['l_start_time']);
        lf.finish_date = WSUtils.convertStrToDate(elem['l_finish_date'] + elem['l_finish_time']);
        lf.start_prod_date = elem['l_start_date'];
        lf.start_prod_time = elem['l_start_time'];
        lf.finish_prod_date = elem['l_finish_date'];
        lf.finish_prod_time = elem['l_finish_time'];
        lf.remarks = elem['l_remarks'];
        // JS
        lf.leafs_detail_parsed = {};
        lf.schedules_detail_parsed = {};
        lf.width = gtShip.v.fixval.LEAF_DEF_WIDTH;
        lf.height = gtShip.v.fixval.LEAF_DEF_HEIGHT;
        lf.row = -1;

        lf.start_plan = WSUtils.convertMysqlDatetime(elem['l_start_plan_date']);
        lf.schedules_required_time = Number(elem['l_interval']);
        // lf.schedules_required_time = Number(elem['l_pd_plan_interval']);
        // lf.titleText = String(elem['l_estimate_no'] + '-' + elem['l_statement_sub_no']);
        // lf.subText = String(elem['l_customer_cd']); //String(elem['l_order_no']);

        // リーフ表示名（受注No）
        lf.titleText = String(elem['l_estimate_no']);
        lf.subText = String('（受注No）');

        // lf.tooltip.push('品　　名:' + (elem['sd_p_name'] ? elem['sd_p_name'] : '-'));
        lf.tooltip.push(' 客 先 名: ' + (elem['C_CUSTOMER_NAME'] ? elem['C_CUSTOMER_NAME'] : '-'));
        if (elem['ed_shipment_date'] !== '' && elem['ed_shipment_date'] !== null) {
          lf.tooltip.push(' 出 荷 日: ' + elem['ed_shipment_date'].replace(/^(\d{4})(\d{2})(\d{2})$/, '$1/$2/$3'));
        } else {
          lf.tooltip.push(' 出 荷 日: -');
        }
        if (elem['ed_delivery_sign'] === '0') {
          lf.tooltip.push('納品確定: 未');
        } else if (elem['ed_delivery_sign'] === '2') {
          lf.tooltip.push('納品確定: 済');
        } else {
          lf.tooltip.push('納品確定: -');
        }

        lf.members_id = elem['row_num'];
        lf.schedules_id = elem['row_num'];

        // リーフ背景色の設定
        var start_plan_date = elem['e_shipplan_date'] ? parseInt(elem['e_shipplan_date']) : 0;
        var today = parseInt(formatDateToYYYYMMDD(new Date()));
        /* if (elem['ed_shipment_date']) {
           lf.bgcolor = '#A9A9A9';
         } else if (today > start_plan_date && !elem['ed_shipment_date']) {
           lf.bgcolor = '#FF4B00';
         }
        */ // 背景色変更 230718
        if (elem['ed_shipment_date'] && elem['ed_delivery_sign'] === '0') {
          lf.bgcolor = '#87ceeb'; //出荷済未納品
        } else if (today > start_plan_date && !elem['ed_shipment_date']) {
          lf.bgcolor = '#FF4B00'; //期限切れ
        } else if (elem['ed_delivery_sign'] === '2') {
          lf.bgcolor = '#A9A9A9'; //納品確定済み
        }


        // lf.leafs_id = Number(elem['l_id']);
        // lf.members_id = Number(elem['l_warehouses_id']);
        // lf.schedules_id = Number(elem['l_id']);
        // lf.start_date = WSUtils.convertMysqlDatetime(elem['l_start_date']);
        // lf.finish_date = WSUtils.convertMysqlDatetime(elem['l_finish_date']);
        // JS作成分
        // lf.leafs_detail_parsed = {};
        // lf.schedules_detail_parsed = {};
        // lf.width = gtShip.v.fixval.LEAF_DEF_WIDTH;
        // lf.height = gtShip.v.fixval.LEAF_DEF_HEIGHT;
        // lf.row = -1;
        // lf.start_plan = WSUtils.convertMysqlDatetime(elem['l_start_plan']);
        // lf.schedules_required_time = Number(elem['l_required_time']);
        // // lf.schedules_required_time = Number(elem['l_pd_plan_interval']);
        // lf.titleText = String(elem['l_spd_shipplan_id'] + '-' + elem['l_spd_row']);
        // lf.subText = String(elem['l_summary']);
        // lf.tooltip.push('件名:' + (elem['sp_title'] ? elem['sp_title'] : '-'));
        // lf.tooltip.push('納期:' + (elem['spd_delivery_date'] ? elem['spd_delivery_date'] : '-'));
        // lf.tooltip.push('品名:' + (elem['p_name'] ? elem['p_name'] : '-'));
        // lf.tooltip.push('数量:' + (elem['l_amount'] ? elem['l_amount'] : '-'));
        // 出荷リーフは、基本的に表示可否の判断はこちらでは不要。リーフ発行時に指示がなされている。
        lf.assignableTo = '';
        // lf.assignableTo = ws.m.d.leaf_assignable_to.filter(function (elemB) {
        //   return lf.leafs_id === Number(elemB['leafs_id']);
        // }).map(function (elem) {
        //   return elem['members_id'];
        // }).toString();
        lf.data = elem;
        ws.m.tasks.push(lf);
        gtShip.items.push($.extend(true, {}, lf));
      });
      // 表示スタイルを更新
      gtShip.isInited = true;
      ws.refreshView();
    }
  });
}

/**
 * 製造リーフ配置処理
 * @param {TaskObject} lf 
 * @param {CVSGantt} gt
 */
function ajaxUpdateProdLeafPlan(lf, gt) {
  var axistype = gt.v.axistype; //軸種類(1:担当者,2:設備,-1:プロジェクト)
  var senddata = {
    'leaftype': gt.id,
    'l_leaf_no': lf.l_leaf_no,
    'l_worker_member_id': lf.members_id,
    'l_equipment_member_id': lf.equipments_id,
    'l_start_plan': lf.start_plan,
    'l_start_plan_date': getStrTimeForPHP(lf.start_plan),
    'l_start_plan_time': '0000',
  };
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/updateleafplan',
    data: {
      'json': JSON.stringify(senddata)
    },
    success: function (data) {
      //ajaxReload();
    }
  });
}

/**
 * 出荷リーフ配置処理
 * @param {TaskObject} lf 
 * @param {CVSGantt} gt
 */
function ajaxUpdateShipLeafPlan(lf, gt) {
  var senddata = {
    'leaftype': gt.id,
    // 'l_id': Number(lf.schedules_id),
    'l_leaf_no': lf.leaf_no,
    'l_estimate_no': lf.estimate_no,
    // 'leaf_no': Number(lf.leaf_no),
    'l_start_plan_date': WSUtils.convertDateToStr(lf.start_plan),
    'l_start_plan_time': '0000',
    'l_start_plan': lf.start_plan,
    'l_warehouse_cd': lf.members_id
  };
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/updateleafplan',
    data: {
      'json': JSON.stringify(senddata)
    },
    success: function (data) {
      // ajaxReload();
      ajaxReadshipplan();
    }
  });
}

/**
 * 製造リーフ一括配置処理
 * @param {TaskObject[]} lfs 
 * @param {CVSGantt} gt
 */
function ajaxUpdateProdLeafPlans(lfs, gt) {
  var lfsDat = [];
  lfs.forEach(function (lf) {
    var lfDat = {
      // 'l_leaf_no': Number(lf.schedules_id),
      'l_leaf_no': lf.schedules_id,
      'l_worker_member_id': lf.members_id,
      'l_equipment_member_id': lf.equipments_id,
      // 'l_projects_id': lf.projects_id,
      'l_pd_start_plan_date': WSUtils.convertDateToStr(lf.start_plan),
      'l_pd_start_plan_time': WSUtils.convertDateToStrTime(lf.start_plan),
      'l_start_plan': lf.start_plan,
    };
    lfsDat.push(lfDat);
  });
  var senddata = {
    'leaftype': gt.id,
    'lfs': lfsDat,
  };
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/updatemultipleleafplan',
    data: {
      'json': JSON.stringify(senddata)
    },
    success: function (data) {
      // ajaxReload();
    }
  });
}

/**
 * 指定ガントチャートについて、リーフUndo処理を実行
 * @param {CVSGantt} gt
 * @param {Function} func 成功時に実行する関数
 */
function ajaxUndoPlacing(gt, func) {
  var senddata = {
    'leaftype': gt.id,
  };
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/undoplacing',
    data: {
      'json': JSON.stringify(senddata)
    },
    success: function (data) {
      if (typeof func != 'undefined') {
        func(data);
      }
    }
  });
}

/**
 * リーフ新規登録処理
 * @param {*} dat 編集内容を格納したオブジェクト
 */
function ajaxInsertNewLeaf(dat) {
  //var fd = $('#frm-insertleaf').serialize();
  $.ajax({
    url: $('#frm-insertleaf').attr('action'),
    type: 'post',
    data: {
      'json': JSON.stringify(dat)
    },
    cache: false,
    success: function (data) {
      ajaxReload();
    }
  });
}

/**
 * カレンダー情報を更新する
 * @param {Date} senddata 送信データ
 * @param {Function} func 成功時に実行する関数
 */
function ajaxUpdateCalendar(senddata) {

  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/updatecalendar',
    // url: ajaxUrl + 'ajax/updatecalendar',
    data: {
      'json': JSON.stringify(senddata)
    }
  })
    .done(function (data) {
      setTimeout(function () {
        ajaxReload();
        window.alert("登録完了しました。");
      }, 1000);
    })
    .fail(function () {
      console.log("データ登録に失敗しました。");
      window.alert("データ登録に失敗しました。");
    })
  // .always(function () {

  // })
  // })
  // success: function (data) {
  //   if (typeof func != 'undefined') {
  //     func(data);
  //   }
  // }
  // });
}

/**
 * リーフ編集処理
 * @param {*} dat 編集内容を格納したオブジェクト
 */
function ajaxEditLeaf(dat) {
  //var fd = $('#frm-editleaf').serialize();
  $.ajax({
    url: $('#frm-editleaf').attr('action'),
    type: 'post',
    data: {
      'json': JSON.stringify(dat)
    },
    cache: false,
    success: function (data) {
      ajaxReload();
    }
  });
}

/**
 * リーフ長さ計算処理
 * @param {*} dat 編集内容を格納したオブジェクト
 */
function ajaxCalcLength(dat) {
  $.ajax({
    url: $('#frm-editleaf').attr('action'),
    type: 'post',
    data: {
      'json': JSON.stringify(dat)
    },
    cache: false,
    success: function (data) {
      ajaxReload();
    }
  });
}

/**
 * サーバ側との非同期通信を実行する。
 * @param {string} method サーバ側で実行するメソッドを指定する。(updateなど)
 * @param {*} dataObject 送信データの内容を指定する。
 * 例: 'tbl': 'schedules', 'record': rec
 * @param {Function} func 成功時に実行する関数。引数にはサーバからの応答が含まれる。
 */
function ajaxPost(method, dataObject, func) {
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/' + method,
    data: dataObject,
    cache: false,
    success: function (data) {
      // 次に実行する関数が引数で指定されている場合、成功後に実行
      if (typeof func != 'undefined') {
        func(data);
      }
    }
  });
}

/**
 * DB向けに日時文字列を成形する(分単位込み)
 * @param {Date} dateobj 日時
 * @return {string} データベース用の文字列
 */
function getDBDatetimeMinutesStrForPHP(dateobj) {
  if (dateobj === null) {
    return null;
  } else if (dateobj.getTime() === 0) {
    return null;
  }
  return dateobj.getFullYear() + '-' + (dateobj.getMonth() + 1) + '-' +
    dateobj.getDate() + ' ' + dateobj.getHours() + ':' + ('00' + dateobj.getMinutes()).slice(-2) + ':00';
}

/**
 * 製造実績を追加登録する
 * @param {*} dat 実績を格納したオブジェクト
 */
function ajaxInsertprodresult(dat) {
  $.ajax({
    type: 'post',
    url: $('#frm-prodresult').attr('action'),
    data: {
      'json': JSON.stringify(dat)
    },
    cache: false,
    success: function (data) {
      reloadTabLeafs(ws.gts.prodStaff.id);
      //ajaxReload();
    }
  });

}

/**
 * 出荷実績を追加登録する
 * @param {*} dat 実績を格納したオブジェクト
 */
function ajaxInsertshipresult(dat) {
  $.ajax({
    url: $('#frm-shipresult').attr('action'),
    type: 'post',
    data: {
      'json': JSON.stringify(dat)
    },
    cache: false,
    success: function (data) {
      ajaxReadshipplan();
    }
  });
}

/**
 * 引当在庫を確認する
 * @param {*} pid 確認対象の製品ID
 */
function ajaxCheckInventory(pid) {
  var dat = {
    'p_id': pid
  };
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/checkinventory',
    data: {
      'json': JSON.stringify(dat)
    },
    cache: false,
    success: function (data) {
      console.log(data);
    }
  });
}

/**
 * シミュレーションを新規開始する。
 * 各種シミュレーションテーブルを初期化後、
 * 指定日以降の開始予定日及び未割当欄に配置されているリーフを追加する。
 */
function ajaxStartSim() {
  // データ初期化
  // ws.gts.prodStaffSim.items.splice(0, ws.gts.prodStaffSim.items.length);
  // ws.gts.prodEquipmentSim.items.splice(0, ws.gts.prodEquipmentSim.items.length);
  // ws.gts.shipSim.items.splice(0, ws.gts.shipSim.items.length);
  // ws.gts.projSim.items.splice(0, ws.gts.projSim.items.length);
  // ws.gts.prodStaffSim.isInited = false;
  // ws.gts.prodEquipmentSim.isInited = false;
  // ws.gts.shipSim.isInited = false;
  // ws.gts.projSim.isInited = false;
  // ws.gts.prodStaffSim.v.fixval.LOADING_MSG = 'シミュレーションデータ準備中...';
  // ws.gts.prodEquipmentSim.v.fixval.LOADING_MSG = 'シミュレーションデータ準備中...';
  // ws.gts.shipSim.v.fixval.LOADING_MSG = 'シミュレーションデータ準備中...';
  // ws.gts.projSim.v.fixval.LOADING_MSG = 'シミュレーションデータ準備中...';
  // 表示中タブに対応するシミュレーション画面を表示
  switch (ws.getActiveGantt().id) {
    case 'PROD_STAFF':
    case 'PROD_STAFF_SIM':
      $('#tabs-gantt')['tabs']({ 'active': 4 });
      break;
    case 'PROD_EQUIPMENT':
    case 'PROD_EQUIPMENT_SIM':
      $('#tabs-gantt')['tabs']({ 'active': 5 });
      break;
    case 'SHIP':
    case 'SHIP_SIM':
      $('#tabs-gantt')['tabs']({ 'active': 6 });
      break;
    case 'PROJ':
    case 'PROJ_SIM':
      $('#tabs-gantt')['tabs']({ 'active': 7 });
      break;
  }
  var dat = {
    'simsdatefrom': getDBDatetimeMinutesStrForPHP(new Date(2018, 0)), //new Date(ws.getActiveGantt().v.displayingDate)
  };
  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/startsim',
    data: {
      'json': JSON.stringify(dat),
    },
    cache: false,
    success: function (data) {
      // シミュレーションテーブル作成後、再読込
      // ws.gts.prodStaffSim.v.fixval.LOADING_MSG = '読込中...';
      // ws.gts.prodEquipmentSim.v.fixval.LOADING_MSG = '読込中...';
      // ws.gts.shipSim.v.fixval.LOADING_MSG = '読込中...';
      // ws.gts.projSim.v.fixval.LOADING_MSG = '読込中...';
      // ajaxReadprodplan(ws.gts.prodStaffSim, ws.gts.prodEquipmentSim, ws.gts.projSim);
      // ajaxReadshipplan(ws.gts.shipSim);
    }
  });
}

/**
 * 出荷詳細情報を取得
 * @param {String} leafNo 出荷リーフNo
 */
function ajaxreadshipdetails(leafNo) {
  // 出荷詳細内容を非表示、ローディングメッセージを表示
  $('#dlg-shipdetails .content').hide();
  $('#dlg-shipdetails #shipdetail-loadmsg').text('読込中...');
  $('#dlg-shipdetails #shipdetail-loadmsg').show();

  $.ajax({
    type: 'get',
    url: ajaxUrl + 'ajax/readshipdetails',
    data: {
      'leaf_no': leafNo
    },
    dataType: 'json'
  }).done(function (data) {
    var productListHtml = '';
    // 製品名、出荷予定数量、実績数量のhtmlを生成　※ここからスタート※
    for (var i = 0; i < data.product_list.length; i++) {
      // // 製品規格
      // var productNameSupple = data.product_list[i].product_name && data.product_list[i].product_name_supple ? '</br>' + data.product_list[i].product_name_supple : data.product_list[i].product_name_supple;
      // 品名
      var productName = '<td class="product-name">' + data.product_list[i].product_name + '</td>';
      // 加工内容
      var processName = '<td class="process-name">' + data.product_list[i].arrangement_name + '</td>';
      // 規格1(線径１)
      var sub01 = '<td class="subcd-01">' + data.product_list[i].ed_sub_01 + '</td>';
      // 規格12(厚み１)
      var sub12 = '<td class="subcd-12">' + data.product_list[i].ed_sub_12 + '</td>';
      // 規格2(線径２)
      var sub02 = '<td class="subcd-02">' + data.product_list[i].ed_sub_02 + '</td>';
      // 規格13(厚み２)
      var sub13 = '<td class="subcd-13">' + data.product_list[i].ed_sub_13 + '</td>';
      // 規格4(目合１：W)
      var sub04 = '<td class="subcd-04">' + data.product_list[i].ed_sub_04 + '</td>';
      // 規格5(目合２：L)
      var sub05 = '<td class="subcd-05">' + data.product_list[i].ed_sub_05 + '</td>';
      // 規格6(目合サイズ)
      var sub06 = '<td class="subcd-06">' + data.product_list[i].ed_sub_06 + '</td>';
      // 規格8(寸法１)
      var sub08 = '<td class="subcd-08">' + data.product_list[i].ed_sub_08 + '</td>';
      // 規格9(寸法２)
      var sub09 = '<td class="subcd-09">' + data.product_list[i].ed_sub_09 + '</td>';
      // 規格10(寸法１補足)
      var sub10 = '<td class="subcd-10">' + data.product_list[i].ed_sub_10 + '</td>';
      // 規格11(寸法２補足)
      var sub11 = '<td class="subcd-11">' + data.product_list[i].ed_sub_11 + '</td>';
      // 出荷予定数
      var estimatedShippingQuantity = '<td class="estimated-shipping-quantity" data-value="' + data.product_list[i].ed_quantity + '">' + parseInt(data.product_list[i].ed_quantity) + '</td>';
      // 数量単位
      var numUnit = '<td class="subcd">' + data.product_list[i].ed_unit_tran + '</td>';
      // // 規格3(目合区分)
      // var sub03 = '<td class="subcd-03">' + data.product_list[i].ed_sub_03 + '</td>';
      // // 規格7(※)
      // var sub07 = '<td class="subcd-07">' + data.product_list[i].ed_sub_07 + '</td>';
      // // 実績数量 
      // var actualQuantity = '<td class="actual-quantity"><input type="text" value="' + data.product_list[i].estimate_quantity + '" /></td>';
      productListHtml += '<tr>' + productName + processName + sub01 + sub12 + sub02 + sub13 + sub04 + sub05 + sub06 + sub08 + sub09 + sub10 + sub11 + estimatedShippingQuantity + numUnit + '</tr>';
    }

    // 受注先名を表示
    $('.shipdetails-container table tr .customer-name').text(data.customer_name);
    // 受注客先番号(客先No/社内No)を表示
    $('.shipdetails-container table tr .order-number').text(data.order_number ? data.order_number : data.estimate_number);
    // 出荷主を表示
    $('.shipdetails-container table tr .shipper-name').text(data.shipper_name);
    // 納入先を表示
    $('.shipdetails-container table tr .delivery-name').text(data.delivery_name);
    // 止め先を表示
    $('.shipdetails-container table tr .stay-name').text(data.stay_name);
    // 製品名、出荷予定数量、実績数量、実績数量を表示
    $('.shipproductdetail-container table tbody').html(productListHtml);
    // 備考
    $('.shipdetail-remarks .remarks').text(data.remarks);

  }).always(function () {
    // ローディングメッセージを非表示
    $('#dlg-shipdetails #shipdetail-loadmsg').hide();
    // 出荷詳細内容を表示
    $('#dlg-shipdetails .content').show();
  });
}

/**
 * 出荷詳細情報を更新
 * @param {String} leafNo 出荷リーフNo
 * @param {String} remarks 備考
 */
function ajaxupdateshipdetails(leafNo, remarks, toggleContextmenu) {
  var aaa = ws.gts.ship;
  // 出荷詳細内容を非表示、ローディングメッセージを表示
  $('#dlg-shipdetails .content').hide();
  $('#dlg-shipdetails #shipdetail-loadmsg').text('登録中...');
  $('#dlg-shipdetails #shipdetail-loadmsg').show();

  $.ajax({
    type: 'post',
    url: ajaxUrl + 'ajax/updateshipdetail',
    data: {
      'leaf_no': leafNo,
      'remarks': remarks
    },
    dataType: 'json'
  }).done(function () {
    // 出荷日程表更新
    ajaxReadshipplan();

    // 出荷詳細画面を非表示
    $('#dlg-shipdetails')['dialog']('close');
    toggleContextmenu(false);
  }).always(function () {
    // ローディングメッセージを非表示
    $('#dlg-shipdetails #shipdetail-loadmsg').hide();
  });
}

/**
 * 日付をYYYYMMDD形式にフォーマットする
 * @param {Date} date 日付
 * @return {String} YYYYMMDD
 */
function formatDateToYYYYMMDD(date) {
  var yyyy = date.getFullYear()
  var mm = ("00" + (date.getMonth() + 1)).slice(-2)
  var dd = ("00" + date.getDate()).slice(-2)

  return yyyy + mm + dd;
}