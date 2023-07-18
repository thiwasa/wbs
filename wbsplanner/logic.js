'use strict';

/**
 * @fileOverview 生産管理システムビジネスロジック(寄合型生産管理向け)
 * @author Fumihiko Kondo
 */

/**
 * キー名称に'_PREVVAL'を含むプロパティを削除する
 * @param {Array} items 行の配列
 */
function removePrevvals(items) {
  items.forEach(function (item) {
    Object.keys(item).forEach(function (key) {
      if (String(key).indexOf('_PREVVAL') >= 0) {
        delete item[key];
      }
    });
  });
}


function removeBefore(items) {
  items.forEach(function (item) {
    Object.keys(item).forEach(function (key) {
      if (String(key).indexOf('_BEFORE') >= 0) {
        delete item[key];
      }
    });
  });
}

/**
 * 製造リーフを発行する
 */
function issueProdLeaf() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgEdit = editPGs.pgProdplans;
  // var activeRow = pgEdit.getActiveRow();
  // let pgHeader = editPGs.pgProdplans.h.dataView.getItems();
  // let pgDetail = editPGs.pgProdplans.d.dataView.getItems();
  // if (!activeRow) {
  //   window.alert('発行対象とする行を選択してください。');
  //   return;
  // }
  if (IsDirtyCheck(editPGs.pgProdplans.d)) {
    window.alert('編集中の製造計画を保存してから、製造リーフを発行してください。');
    return;
  }
  if (!window.confirm('選択行のリーフを発行してもよろしいですか？')) {
    return;
  }
  // deployLeafは自動配置なので今回は外す
  ajaxIssueProdLeaf(pgEdit, function () {
    alert('リーフ発行が完了しました。');
    return;
  })

  // ajaxIssueLeaflist(editPGs.pgProdplans, function(resp) {
  //   windows.alert(resp);
  // })

  // 金網前のもの
  // ajaxIssueProdLeaf(pgEdit, activeRow, function () {
  //   // $('#dialog-insert')['dialog']('close');
  //   // // 既にリーフ発行済みのデータをリーフ発行しようとするとエラーとなり、データが残り続けるので、エラー発生の有無なく
  //   // // データをクリアさせる
  //   // clearRows(editPGs.pgProdplans.h);
  //   // clearRows(editPGs.pgProdplans.d);
  //   // // readdata(ePG.m);
  //   // readdata(editPGs.pgProdplans.m);
  // }).then(()=>ajaxDeployLeaf(pgEdit,activeRow));
  
}

// /**
//  * 出荷計画で選択している行についてリーフを発行する
//  */
// function issueShipLeaf() {
//   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
//     return;
//   }
//   var pgEdit = editPGs.pgShipplans.d;
//   var activeRow = pgEdit.getActiveRow();
//   if (!activeRow) {
//     window.alert('発行対象とする行を選択してください。');
//     return;
//   } 
//   if (IsDirtyCheck(editPGs.pgShipplans.d)) {
//     window.alert('編集中の出荷計画を保存してから、出荷リーフを発行してください。');
//     return;
//   }
//   if (!window.confirm('選択行のリーフを発行してもよろしいですか？')) {
//     return;
//   }
//   ajaxIssueShipLeaf(pgEdit, activeRow, function () {
//     $('#dialog-insert')['dialog']('close');
//     readdata(editPGs.pgShipplans.m);
//   });
// }

/**
 * 指定した見積書をリピートして新規作成する
 */
function repeatEstimate(divId) {
  /** メイン画面のグリッド */
  var pgMain = mainPGs.pgED;
  // 番号一覧の場合は該当のデータを使用する
  if (divId === 'NumberListED') {
    pgMain = numberListPGs.pgED;
  }
  /** 編集画面のグリッド(ヘッダ) */
  var pgEditHeader = editPGs.pgED.h;
  /** 編集画面のグリッド(明細) */
  var pgEdit = editPGs.pgED.d;
  var activeRow = pgMain.getActiveRow();

  if (!activeRow) {
    window.alert('リピート対象とする行を選択してください。');
    return;
  }
  // 列情報を取得
  var cols = pgMain.grid.getColumns();
  var detailRows = pgMain.dataView.getItems().filter(function (elem) {
    var isDetail = true;
    cols.forEach(function (c) {
      if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
        isDetail = false;
      }
    });
    return isDetail;
  });

  // 番号一覧画面の場合、番号一覧のデータ取得
  if (pgMain.divId === 'NumberListED') {
    // 選択した要素番号を取得
    const activeRowIndex = detailRows.findIndex(function (elem) {
      return elem['id'] === activeRow['id'];
    });
    let estiamteNo = activeRow['e_estimate_no'];
    if (estiamteNo === '-') {
      for (let i = activeRowIndex; i >= 0; i -= 1) {
        if (detailRows[i]['e_estimate_no'] !== '-') {
          estiamteNo = detailRows[i]['e_estimate_no'];
          break;
        }
      }
    }
    const mainDetailRows = mainPGs.pgED.dataView.getItems();
    // 選択した受注Noの明細を絞り込み
    detailRows = mainDetailRows.filter(function (elem) {
      // 受注Noがハイフンの場合、編集画面の受注Noが正常に表示されないのでハイフンを受注Noで上書き
      if (estiamteNo === elem['ed_estimate_no']) {
        elem['e_estimate_no'] = estiamteNo;
        return true;
      }
    });
  }
  // 選択された明細及びヘッダの内容を編集画面のグリッドにコピー
  var editActiveRow = [Object.assign({}, activeRow)];
  var editDetailRows = [];
  let usercd = document.getElementById('login-user').textContent;
  detailRows.forEach(function (elem) {
    editDetailRows.push(Object.assign({}, elem));
  });
  removePrevvals(editActiveRow);
  removePrevvals(editDetailRows);
  removeBefore(editActiveRow);
  // リピート登録時に必要な箇所を空欄とする
  // editActiveRow[0]['e_customer_cd'] = '';
  editActiveRow[0]['e_salesman_cd'] = usercd; // ログインユーザーの初期値セット
  editActiveRow[0]['e_estimate_date'] = '';
  // editActiveRow[0]['e_customer_post_cd'] = '';
  // editActiveRow[0]['e_customer_charge_cd'] = '';
  // editActiveRow[0]['e_customer_sales_name'] = '';
  editActiveRow[0]['e_desired_delivery_date'] = '';
  editActiveRow[0]['e_repeat'] = 'リピート';
  editActiveRow[0]['e_repeat_estimate_no'] = editActiveRow[0]['e_estimate_no'];
  editActiveRow[0]['e_estimate_no'] = '';
  // editActiveRow[0]['e_customer_order_no'] = '';
  // editActiveRow[0]['e_shipper_cd'] = '';
  // editActiveRow[0]['e_stay_cd'] = '';
  // editActiveRow[0]['e_delivery_cd'] = '';
  // editActiveRow[0]['e_tc_short_name'] = '';
  // editActiveRow[0]['e_title'] = '';
  editActiveRow[0]['e_logo_01'] = 'STONE';  // 初期値セット
  // editActiveRow[0]['e_update_at'] = '';
  // editActiveRow[0]['e_update_cd'] = '';
  editActiveRow[0]['e_delivery_timing'] = '';
  editActiveRow[0]['e_shipplan_date'] = '';
  editActiveRow[0]['e_delivery_string'] = '';
  // editActiveRow[0]['ed_ship_status_sign'] = '';
  // editActiveRow[0]['e_sum_area'] = 0;
  editDetailRows.forEach(function (elem) {
    elem['ed_estimate_no'] = '';
    // elem['ed_estimate_sub_no'] = '';
    elem['ed_shipment_sub_no'] = '';
    elem['ed_update_cnt'] = 0;
    // elem['ed_quantity'] = 0;
    elem['ed_desired_delivery_date'] = '';
    elem['ed_customer_order_no'] = '';
    elem['ed_customer_p_name'] = '';
    elem['ed_delivery_cd'] = '';
    elem['ed_detail_remarks'] = '';
    elem['ed_prod_plan_sign'] = 0;
    elem['ed_prod_plan_date'] = '';
    elem['ed_prod_fin_date'] = '';
    elem['ed_ar_cd'] = '';
    elem['ed_ship_status_sign'] = '';
    elem['ed_shipment_date'] = '';
    elem['ed_qty_shipment'] = 0;
    elem['ed_qty_delivery'] = 0;
    elem['ed_delivery_price'] = 0;
    elem['ed_delivery_sign'] = '';
    elem['ed_deliv_create_date'] = '';
    elem['ed_bill_close_date'] = '';
    elem['ed_bill_price'] = 0;
    elem['ed_bill_sign'] = '';
    elem['ed_bill_create_date'] = '';
    elem['ed_payment_close_date'] = '';
    elem['ed_payment_price'] = 0;
    elem['ed_payment_sign'] = '';
    elem['ed_payment_del_date'] = '';
    elem['ed_remarks'] = '';
    elem['ed_update_at'] = '';
    elem['ed_update_cd'] = '';
    // elem['calcno'] = '';
    // elem['ed_sub_07'] = '';
    // elem['ed_sub_08'] = '';
    // elem['ed_sub_09'] = '';
    // elem['ed_sub_10'] = '';
    // elem['ed_sub_11'] = '';
    elem['ed_sub_num_01'] = 0;
    elem['ed_sub_num_02'] = 0;
    // elem['ed_sub_num_03'] = '';
    elem['ed_type_01'] = '';  // 製造加工内容のためコピーしない
    elem['ed_type_02'] = '';
    elem['ed_type_03'] = '';
    elem['ed_type_04'] = '0';
    elem['ed_type_05'] = '';
    elem['ed_type_06'] = '';
    elem['ed_type_07'] = '';
    elem['ed_pack_size'] = '';
    elem['ed_pack_num'] = '';
    elem['ed_warehouse_cd'] = '';
    elem['ed_lot_no'] = '';
    elem['ed_inventory_type'] = '';
    // elem['ed_parrangement_cd'] = '';
    // elem['ed_unit_price'] = 0;
  });
  // グリッドにデータを設定して再描画
  pgEditHeader.setItemsAndRefresh(editActiveRow);
  pgEdit.setItemsAndRefresh(editDetailRows);
  let num = getMainTabNo(pgMain);
  displayInsertForm(num);
}

/**
 * 見積書編集画面で選択している行について製造計画明細を転記する
 * 既存データの場合メッセージに出力
 */
function issueProdPlans() {
  // 製造計画ヘッダ＆明細
  let pgProdH = editPGs.pgProdplans.h;
  let pgProdD = editPGs.pgProdplans.d;

  // 今フォーカスが当たっている所もコミット
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }  
  if (IsDirtyCheck(editPGs.pgED.d) && IsDirtyCheck(editPGs.pgED.h)) {
    window.alert('編集中の見積データを登録してから、製造計画を作成して下さい。');
    return;
  }

  // チェックが入っているレコード取得
  let activeRowsED = [];
  const rowsData = mainPGs.pgED.grid.getData().getFilteredItems();
  const nIndex = mainPGs.pgED.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRowsED.push(rowsData[nIndex[i]]);
  }
  if (activeRowsED.length <= 0) {
    window.alert('製造指示を作成する行を選択してください');
    return;
  }
  for (let j = 0; j < activeRowsED.length; j++) {
    if (activeRowsED[j]['ed_prod_plan_sign'] >= 1) {
      // 製造指示フラグが立っていたら、既に移行済みとメッセージ
      alert('既に製造指示済みのデータが含まれています。確認してください。');
      return;
    }
  } 

  // 製造選択されていない場合をフラグで持ち、製造指示画面が表示されるのを防ぐ
  // 選択工程が選択されているか。true＝選択済み
  let bNotSelectedPr = false; 

  // リストクリア
  clearRows(pgProdH);
  clearRows(pgProdD);

  // 製造指示データ発行済みの場合は、画面遷移せず、製造指示画面
  getProdPlanNo().done(function(data, textStatus, jqXHR) {
    // 製造指示番号
    const prodplanno = JSON.parse(data);
    // データの移行
    // 新規ヘッダ＆明細
    let arHeader = makeNewRowObj([]);
    let arDetailRows = editPGs.pgProdplans.d.dataView.getItems();
    let arDetailRow;  

    // 配列をソート 見積書番号の昇順
    activeRowsED.sort( function (a, b) {
      if (a.ed_estimate_no > b.ed_estimate_no) {
        return 1;
      } 
      if (a.ed_estimate_no < b.ed_estimate_no) {
        return -1;
      }
      if (a.ed_estimate_sub_no > b.ed_estimate_sub_no) {
        return 1;
      }
      if (a.ed_estimate_sub_no < b.ed_estimate_sub_no) {
        return -1;
      }
    })

    // 製造手法により表示グループ変更
    for (let i = 0; i < activeRowsED.length; i++) {
      // arrangedCd(選択)は、1:金網製造もしくは2:定尺切断、5:金型製造のみ移行可能とする

      // 加工
      const arrangeCD = activeRowsED[i]['ed_ar_cd'];
      // 加工内容
      const manufactureCD = activeRowsED[i]['ed_parrangement_cd'];

      if (!isSet(arrangeCD)) {
        // データが空だったら出る
        alert('製品手配方法がセットされていません。');
        bNotSelectedPr = true;
        break;
      }

      if (arrangeCD === '3' || arrangeCD === '4' || arrangeCD === '6') {
        // 製造選択が異なっていた場合もループを出る
        alert('金網製造、定尺切断のみ製造指示への移行が可能です。');
        bNotSelectedPr = true;
        break;
      } 

      if (arrangeCD === '1' || arrangeCD === '2' || arrangeCD === '5') {
        // 金網製造、定尺切断、支給のみ移行
        arHeader['pd_prod_plan_no'] = prodplanno;

        // 製造完了予定日はとりあえずdefaultは納品日3日前
        arHeader['pd_place_cd'] = activeRowsED[0]['ed_warehouse_cd'];
        // arHeader['pd_place_name'] = '';
        arHeader['pd_finish_plan_date'] = activeRowsED[0]['e_shipplan_date'] - 1;
        arHeader['pd_proj_cd'] = '';  
        arHeader['pd_project_name'] = '';
        // ※他テーブルと定義名異なるので注意
        arHeader['pd_ar_cd'] = arrangeCD;
        // 検査水準はdefault値1とする
        arHeader['pd_ins_level'] = '1';       

        // 明細
        arDetailRow =  makeNewRowObj(arDetailRows);
        arDetailRow['pd_prod_plan_sub_no'] = ('000' + (i + 1)).slice(-3);
        arDetailRow['pd_e_estimate_no'] = activeRowsED[i]['e_estimate_no'];
        arDetailRow['pd_e_estimate_sub_no'] = activeRowsED[i]['ed_estimate_sub_no'];
        arDetailRow['pd_p_cd'] = activeRowsED[i]['ed_p_cd'];
        arDetailRow['pd_par_cd'] = manufactureCD;   // 加工内容
        arDetailRow['pd_ed_sub_01'] = activeRowsED[i]['ed_sub_01'];
        arDetailRow['pd_ed_sub_02'] = activeRowsED[i]['ed_sub_02'];
        arDetailRow['pd_ed_sub_03'] = activeRowsED[i]['ed_sub_03'];
        arDetailRow['pd_ed_sub_04'] = activeRowsED[i]['ed_sub_04'];
        arDetailRow['pd_ed_sub_05'] = activeRowsED[i]['ed_sub_05'];
        arDetailRow['pd_ed_sub_06'] = activeRowsED[i]['ed_sub_06'];
        arDetailRow['pd_ed_sub_08'] = activeRowsED[i]['ed_sub_08'];
        arDetailRow['pd_ed_sub_09'] = activeRowsED[i]['ed_sub_09'];
        arDetailRow['pd_ed_sub_10'] = activeRowsED[i]['ed_sub_10'];
        arDetailRow['pd_ed_sub_11'] = activeRowsED[i]['ed_sub_11'];
        arDetailRow['pd_ed_sub_12'] = activeRowsED[i]['ed_sub_12'];
        arDetailRow['pd_ed_sub_13'] = activeRowsED[i]['ed_sub_13'];
        arDetailRow['pd_wire'] = activeRowsED[i]['ed_sub_num_03'];
        arDetailRow['pd_ed_quantity'] = activeRowsED[i]['ed_quantity'];
        arDetailRow['pd_unit'] = activeRowsED[i]['ed_unit_tran'];
        arDetailRow['pd_e_desired_delivery_date'] = isSet(activeRowsED[i]['e_shipplan_date']) ? activeRowsED[i]['e_shipplan_date'] : activeRowsED[i]['e_desired_delivery_date'];
        arDetailRow['pd_e_customer_cd'] = activeRowsED[i]['e_customer_cd']; 
        arDetailRow['pd_customer_post_cd'] = activeRowsED[i]['ed_customer_post_cd'];     
        arDetailRow['pd_e_customer_charge_cd'] = activeRowsED[i]['e_customer_charge_cd'];
        // 画面表示はしないが、データとして引き継ぐ物
        arDetailRow['pd_e_shipper_cd'] = activeRowsED[i]['e_shipper_cd'];
        arDetailRow['pd_e_stay_cd'] = activeRowsED[i]['e_stay_cd'];
        arDetailRow['pd_e_delivery_cd'] = activeRowsED[i]['e_delivery_cd'];
        arDetailRow['pd_unit'] = activeRowsED[i]['ed_unit_tran'];

        // Defaultの検査水準は1なので、1固定で取得
        arDetailRow['pd_ins_qty'] = getMasterValue('ins_level_01', 'inspection', '000-' + WSUtils.decCeil(arDetailRow['pd_ed_quantity'], 0));
        arDetailRow['pd_finish_plan_date_d'] = activeRowsED[i]['e_shipplan_date'] - 1;
        arDetailRow['pd_leaf_create_flg'] = '0';    // 製造指示移行時、リーフは未発行のため、未発行固定。
        arDetailRow['pd_finish_date'] = '';
        arDetailRow['pd_ed_remarks'] = activeRowsED[i]['ed_remarks'];
        // 金網指図用 2021/12/14　原価は単価ではなく、幾つかまとめての金額に仕様変更したので注意
        arDetailRow['pd_material_unit_cost'] = 0;
        arDetailRows.push(arDetailRow);
      }
    }
    if (!bNotSelectedPr) {
      // 選択されていなければ開かない
      pgProdH.setItemsAndRefresh([arHeader]);
      pgProdD.setItemsAndRefresh(arDetailRows);
      displayInsertForm(MAINTABS.Prodplans);
      activateInsertTab(MAINTABS.Prodplans); // 製造計画タブを表示 
    }

  });   
}



/****************************************************************************************
 * 発注リピート機能
 */
function repeatMoed() {
  /** メイン画面のグリッド */
  var pgMain = mainPGs.pgMOD;
  /** 編集画面のグリッド(ヘッダ) */
  var pgEditHeader = editPGs.pgMOD.h;
  /** 編集画面のグリッド(明細) */
  var pgEdit = editPGs.pgMOD.d;
  var activeRow = pgMain.getActiveRow();
  var arDetail = [];
  if (!activeRow) {
    window.alert('リピート対象とする行を選択してください。');
    return;
  }
  // 列情報を取得
  var cols = pgMain.grid.getColumns();
  var detailRows = pgMain.dataView.getItems().filter(function (elem) {
    var isDetail = true;
    cols.forEach(function (c) {
      if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
        isDetail = false;
      }
    });
    return isDetail;
  });
  // 選択された明細及びヘッダの内容を編集画面のグリッドにコピー
  let nCnt = 0;
  let data = [];
  var editActiveRow = [Object.assign({}, activeRow)];
  var editDetailRows = [];
  detailRows.forEach(function (elem) {
    // 明細の行削除が行えるように変更
    data[nCnt] = {
      'isDirty': false,
      'isNewRow': true,
    };
    if (elem['moed_accept_sub_no'] === '01') {
      // 検収枝番の分かれているものは削除する。検収枝番は1開始
      // もし数量を移行させたいといわれた場合は、検収枝番が分かれているものを合体させる必要があるので注意。
      if (Number(elem['moed_sub_no']) !== (nCnt + 1)) {
        elem['moed_sub_no'] = ('000' + (nCnt + 1)).slice(-3);
      }
      editDetailRows.push(Object.assign(data[nCnt], elem));
      nCnt++;
    }
  });
  removePrevvals(editActiveRow);
  removePrevvals(editDetailRows);
  
  // リピート登録時に必要な箇所を空欄とする 発注用のデータをセット
  const usercd = document.getElementById('login-user').textContent;

  editActiveRow[0]['moed_order_no'] = '';
  editActiveRow[0]['moed_order_date'] = '';
  editActiveRow[0]['moed_accept_sub_no'] = '';
  editActiveRow[0]['moed_refer_no'] = '';
  editActiveRow[0]['moed_sub_01'] = '';
  editActiveRow[0]['moed_buy_type'] = '';
  editActiveRow[0]['moed_sub_06'] = '';
  editActiveRow[0]['e_sh_name'] = '';
  editActiveRow[0]['moed_arrival_hd_date'] = '';
  editActiveRow[0]['moed_remarks'] = '';
  editActiveRow[0]['moed_salesman_cd'] = usercd;
  editActiveRow[0]['moed_salesman_name'] = '';
  editActiveRow[0]['moed_accept_sign'] = 0;
  editActiveRow[0]['moed_accept_date'] = '';
  editActiveRow[0]['moed_payment_plan_date'] = '';
  // editActiveRow[0]['moed_unit_qty'] = 0;
  editActiveRow[0]['moed_arrival_plan_date'] = '';
  editActiveRow[0]['moed_dt_remarks'] = '';
  editActiveRow[0]['moed_qty_quit'] = 0;
  editActiveRow[0]['moed_pay_type'] = '0';
  editActiveRow[0]['moed_payment_no'] = '';
  editActiveRow[0]['moed_payment_date'] = '';
  editActiveRow[0]['moed_update_at'] = '';
  editActiveRow[0]['moed_update_cd'] = '';
  editActiveRow[0]['moed_data_status'] = '0';   // 新規登録

  editDetailRows.forEach(function (elem) {
    elem['moed_accept_date'] = '';
    elem['moed_order_date'] = '';
    elem['moed_arrival_plan_date'] = '';
    elem['moed_refer_no'] = '';
    elem['moed_accept_sign'] = 0;
    elem['moed_payment_plan_date'] = '';
    elem['moed_quantity'] = 0;
    elem['moed_unit_qty'] = 0;
    elem['moed_unit_price'] = 0;
    elem['moed_money'] = 0;
    elem['moed_money_tax'] = 0;
    elem['moed_money_inc_tax'] = 0;
    elem['moed_qty_quit'] = 0;
    elem['moed_unit_qty'] = 0;
    elem['moed_update_at'] = '';
    elem['moed_update_cd'] = '';
    elem['moed_sub_num_01'] = 0;
    elem['moed_sub_num_02'] = 0;
    elem['moed_sub_num_03'] = 0;
    elem['moed_sub_num_04'] = 0;
    elem['moed_type_01'] = '';
    elem['moed_type_02'] = '';
    elem['moed_type_03'] = '';
    elem['moed_type_04'] = '';
    elem['moed_payment_plan_date'] = '';
    elem['moed_arrival_plan_date'] = '';
    elem['moed_dt_remarks'] = '';
    elem['moed_qty_quit'] = 0;
    elem['moed_pay_type'] = '0';
    elem['moed_payment_no'] = '';
    elem['moed_payment_date'] = '';
  });
  // グリッドにデータを設定して再描画
  pgEditHeader.setItemsAndRefresh(editActiveRow);
  pgEdit.setItemsAndRefresh(editDetailRows);
  let num = getMainTabNo(pgMain);
  displayInsertForm(num);
}

/**
 * 外注委託リピート
 */
function repeatOod() {
  /** メイン画面のグリッド */
  var pgMain = mainPGs.pgOOD;
  /** 編集画面のグリッド(ヘッダ) */
  var pgEditHeader = editPGs.pgOOD.h;
  /** 編集画面のグリッド(明細) */
  var pgEdit = editPGs.pgOOD.d;
  var activeRow = pgMain.getActiveRow();
  var arDetail = [];
  if (!activeRow) {
    window.alert('リピート対象とする行を選択してください。');
    return;
  }
  // 列情報を取得
  var cols = pgMain.grid.getColumns();
  var detailRows = pgMain.dataView.getItems().filter(function (elem) {
    var isDetail = true;
    cols.forEach(function (c) {
      if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
        isDetail = false;
      }
    });
    return isDetail;
  });
  // 選択された明細及びヘッダの内容を編集画面のグリッドにコピー
  let nCnt = 0;
  let data = [];
  var editActiveRow = [Object.assign({}, activeRow)];
  var editDetailRows = [];
  detailRows.forEach(function (elem) {
    // 明細の行削除が行えるように変更
    data[nCnt] = {
      'isDirty': false,
      'isNewRow': true,
    };
    if (elem['moed_accept_sub_no'] === '01') {
      // 検収枝番の分かれているものは削除する。検収枝番1開始
      // もし数量を移行させたいといわれた場合は、検収枝番が分かれているものを合体させる必要があるので注意。
      editDetailRows.push(Object.assign(data[nCnt], elem));
      nCnt++;
    }
  });
  removePrevvals(editActiveRow);
  removePrevvals(editDetailRows);

  // リピート登録時に必要な箇所を空欄とする 発注用のデータをセット
  let today = new Date();
  let y = ("00" + today.getFullYear()).slice(-2);
  let m = ("00" + (today.getMonth()+1)).slice(-2);
  let d = ("00" + today.getDate()).slice(-2);
  let strDate  = y + m + d;
  let strOrderNo = 'H' + strDate + '0001';
  const usercd = document.getElementById('login-user').textContent;

  getMoedSerialNo().then(function(data, textStatus, jqXHR) {
    let resp = JSON.parse(data);
    if (resp[0]['maxno'] !== null) {
      strOrderNo = 'H' + String((Number(resp[0]['maxno']) + 1));
    } 
    editActiveRow[0]['moed_order_no'] = strOrderNo;
    editActiveRow[0]['moed_accept_sub_no'] = '';
    editActiveRow[0]['moed_refer_no'] = '';
    editActiveRow[0]['moed_sub_01'] = '';
    editActiveRow[0]['moed_buy_type'] = '';
    editActiveRow[0]['moed_sub_06'] = '';
    editActiveRow[0]['e_sh_name'] = '';
    editActiveRow[0]['moed_arrival_hd_date'] = '';
    editActiveRow[0]['moed_remarks'] = '';
    editActiveRow[0]['moed_salesman_cd'] = usercd;
    editActiveRow[0]['moed_salesman_name'] = '';
    editActiveRow[0]['moed_accept_sign'] = 0;
    editActiveRow[0]['moed_accept_date'] = '';
    editActiveRow[0]['moed_payment_plan_date'] = '';
    editActiveRow[0]['moed_unit_qty'] = 0;
    editActiveRow[0]['moed_update_at'] = '';
    editActiveRow[0]['moed_update_cd'] = '';
    editActiveRow[0]['moed_accept_sign'] = '0';
    editActiveRow[0]['moed_receive_sign'] = '0';
    editActiveRow[0]['moed_order_sign'] = '0';
    editActiveRow[0]['moed_order_date'] = '';
    editActiveRow[0]['moed_data_status'] = '0';   // データとしては新規登録

    editDetailRows.forEach(function (elem) {
      elem['moed_accept_date'] = '';
      elem['moed_order_date'] = '';
      elem['moed_refer_no'] = '';
      elem['moed_accept_sign'] = 0;
      elem['moed_receive_sign'] = 0;
      elem['moed_order_sign'] = 0;
      elem['moed_quantity'] = 0;
      elem['moed_unit_qty'] = 0;
      elem['moed_unit_price'] = 0;
      elem['moed_money'] = 0;
      elem['moed_money_tax'] = 0;
      elem['moed_money_inc_tax'] = 0;
      elem['moed_qty_quit'] = 0;
      elem['moed_update_at'] = '';
      elem['moed_update_cd'] = '';
      elem['moed_sub_num_01'] = 0;
      elem['moed_sub_num_02'] = 0;
      elem['moed_sub_num_03'] = 0;
      elem['moed_sub_num_04'] = 0;
      elem['moed_type_01'] = '';
      elem['moed_type_02'] = '';
      elem['moed_type_03'] = '';
      elem['moed_payment_plan_date'] = '';
      elem['moed_arrival_plan_date'] = '';
      elem['moed_payment_no'] = '';
      elem['moed_payment_date'] = '';
    });
    // グリッドにデータを設定して再描画
    pgEditHeader.setItemsAndRefresh(editActiveRow);
    pgEdit.setItemsAndRefresh(editDetailRows);
    let num = getMainTabNo(pgMain);
    displayInsertForm(num);
  }); 
}

/**
 * 見積書編集画面から製造計画明細を開く。データ既存の場合
 * issueProdPlansの処理とほぼ同じ
 */
function issueProdPlansEditing() {
  // 見積データ
  let pgEDHeader = editPGs.pgED.h;
  let pgED = editPGs.pgED.d;
  // 製造計画ヘッダ＆明細
  let pgProdH = editPGs.pgProdplans.h;
  let pgProdD = editPGs.pgProdplans.d;
  let strNo;
  let strSNo;
  
  // チェックが入っているレコード取得
  let activeRowsED = [];
  // 既存データのみ抽出
  let activeRows = [];
  let rowsData = mainPGs.pgED.dataView.getItems();
  let nIndex = mainPGs.pgED.grid.getSelectedRows();

  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // リストクリア
  clearRows(pgProdH);
  clearRows(pgProdD);
  for (var i = 0; i < nIndex.length; i++) {
    activeRowsED.push(rowsData[nIndex[i]]);
  }
  if (activeRowsED.length <= 0) {
    window.alert('製造指示を作成する行を選択してください');
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d)) {
    window.alert('編集中の見積データを登録してから、製造計画を作成して下さい。');
    return;
  }
  // 既存データか
  checkProdPlans(activeRowsED).then(function (data) {
    if (data.length < 1) {
      alert('選択したデータは製造計画データが未作成です。新規ボタンから新規作成してください。');
      return;
    }
    if(data) {
      data.forEach(function (elem) {
        elem['id'] = i++;
        if ('pd_belong_cd' in elem) {
          elem['pd_belong_cd_PREVVAL'] = elem['pd_belong_cd'];
        }
      });
    }
    editPGs.pgProdplans.d.columns.forEach(function (col) {
      // 主キーの前回値を代入
      if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK'] || col['isHeader']) {
        data.forEach(function (elem) {
          elem[col['id'] + '_PREVVAL'] = elem[col['id']];
        });
      }
      // Decimal型の場合、StringからNumberに変換する
      if (col['coltype'] === 'decimal') {
        var numcol = col['id'];
        data.forEach(function (elem) {
          elem[numcol] = Number(elem[numcol]);
        });
      }
    });
    if (data.length > 0) {
      let obj = [];
      obj.push(data[0]);
      
      pgProdH.setItemsAndRefresh(obj);
      pgProdD.setItemsAndRefresh(data);
      displayInsertForm(MAINTABS.Prodplans);
      // activateInsertTab(MAINTABS.Prodplans); // 製造計画タブを表示
    }
  }); 
}

/***
 * 発注引継
 */
function issueMOrder() {
  // 発注ヘッダ＆明細
  let pgHeader = editPGs.pgMOD.h;
  let pgDetail = editPGs.pgMOD.d;
  let strEstNo = '';

  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // リストクリア
  clearRows(pgHeader);
  clearRows(pgDetail);
  
  // チェックが入っているレコード取得
  let activeRowsED = [];
  let rowsData = mainPGs.pgED.grid.getData().getFilteredItems();
  let nIndex = mainPGs.pgED.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRowsED.push(rowsData[nIndex[i]]);
  }
  if (activeRowsED.length <= 0) {
    window.alert('発注引継する行を選択してください');
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d) && IsDirtyCheck(editPGs.pgED.h)) {
    window.alert('編集中の見積データを登録してから、発注引継して下さい。');
    return;
  }
  
  for (let i = 0; i < activeRowsED.length; i++) {
    // 同一受注番号内のみOK
    if (!isSet(strEstNo)) {
      strEstNo = activeRowsED[i]['e_estimate_no'];
    }
    if (strEstNo != activeRowsED[i]['e_estimate_no']) {
      alert('同じ受注番号のもののみ選択可能です');
      return;
    } 
    
    if (parseInt(activeRowsED[i]['ed_type_07']) > 0) {
      alert('発注引継済みです。');
      return;
    }
  }

  // 発注画面に展開
  let str = '';
  for (let i = 0; i < activeRowsED.length; i++) {
    str += String(activeRowsED[i]['ed_estimate_sub_no']) + ',';
  }
  str = str.slice(0, -1);
  // リストクリア
  clearRows(pgHeader);
  clearRows(pgDetail);
  let arHeader = makeNewRowObj([]);
  let arDetailRows = editPGs.pgMOD.d.dataView.getItems();
  arHeader['moed_salesman_cd'] = activeRowsED[0]['e_salesman_cd'];
  arHeader['moed_refer_no'] = activeRowsED[0]['e_estimate_no'];
  arHeader['moed_shipper_cd'] = activeRowsED[0]['e_shipper_cd'] ? 'xxxx' : '';
  arHeader['moed_shipper_cd_ed'] = activeRowsED[0]['e_shipper_cd'];
  arHeader['moed_shipper_name'] = activeRowsED[0]['e_shipper_name'];
  arHeader['moed_delivery_cd'] = activeRowsED[0]['e_delivery_cd'] ? 'xxxx' : '';
  arHeader['moed_delivery_cd_ed'] = activeRowsED[0]['e_delivery_cd'];
  arHeader['moed_delivery_name'] = activeRowsED[0]['e_delivery_name'];
  arHeader['moed_order_takeover'] = activeRowsED[0]['e_customer_cd'];
      // 見積書画面の客先CDを保持
  // 発注画面の出荷主名、納入先名の表示に使用
  orderTakeover.customerCd = activeRowsED[0]['e_customer_cd'];
  arHeader['is_order_takeover'] = true;
  // arHeader['moed_refer_sub_no'] = activeRowsED[0]['ed_estimate_sub_no'];
  for (let i = 0; i < activeRowsED.length; i++) {
    let arDetailRow = makeNewRowObj(arDetailRows);
    arDetailRow['id'] = i;
    arDetailRow['moed_sub_no'] = ('000' + (i + 1)).slice(-3);
    arDetailRow['moed_accept_sub_no'] = '01';
    // arDetailRow['moed_refer_no_subno'] = str;
    arDetailRow['moed_refer_no_subno'] = str;
    arDetailRow['moed_refer_sub_no'] = activeRowsED[i]['ed_estimate_sub_no'];
    arDetailRow['moed_product_cd'] = activeRowsED[i]['ed_p_cd'];
    arDetailRow['moed_sub_01'] = activeRowsED[i]['ed_sub_01'];
    arDetailRow['moed_sub_02'] = activeRowsED[i]['ed_sub_02'];
    arDetailRow['moed_sub_03'] = activeRowsED[i]['ed_sub_03'];
    arDetailRow['moed_sub_04'] = activeRowsED[i]['ed_sub_04'];
    arDetailRow['moed_sub_05'] = activeRowsED[i]['ed_sub_05'];
    arDetailRow['moed_sub_06'] = (isSet(activeRowsED[i]['ed_sub_04']) || isSet(activeRowsED[i]['ed_sub_05'])) ? activeRowsED[i]['ed_sub_06'] : '';
    arDetailRow['moed_sub_07'] = activeRowsED[i]['ed_sub_07'];
    // 発注機能の規格文字列の寸法以降は、sub08に全て持っていく。サイズ①とサイズ②にあえて割らないのは、発注書の規格文字列表示に修正が不要なように考慮したため。
    const productStandardArr = makeArrProductStandard(activeRowsED[i]);
    arDetailRow['moed_sub_08'] = productStandardArr[2];
    arDetailRow['moed_sub_09'] = '';
    arDetailRow['moed_sub_10'] = ''; 
    arDetailRow['moed_sub_11'] = ''; 
    arDetailRow['moed_sub_12'] = activeRowsED[i]['ed_sub_12'];
    arDetailRow['moed_sub_13'] = activeRowsED[i]['ed_sub_13'];
    arDetailRow['moed_quantity'] = activeRowsED[i]['ed_quantity'];
    arDetailRow['moed_dt_remarks'] = activeRowsED[i]['ed_detail_remarks'];
    arDetailRow['moed_unit_tran'] = activeRowsED[i]['ed_unit_tran'];
    arDetailRow['moed_refer_no'] = activeRowsED[i]['e_estimate_no'];
    arDetailRow['moed_type_01'] = activeRowsED[i]['ed_type_01'];
    arDetailRow['moed_sub_num_01'] = activeRowsED[i]['ed_sub_num_01'];
    arDetailRow['moed_sub_num_02'] = activeRowsED[i]['ed_sub_num_02'];
    arDetailRow['moed_sub_num_03'] = activeRowsED[i]['ed_sub_num_03'];
    arDetailRow['moed_sub_num_04'] = activeRowsED[i]['ed_sub_num_04'];
    arDetailRow['moed_parrangement_cd'] = activeRowsED[i]['ed_parrangement_cd'];
    // 発注引継ぎ品なので、使用区分は基本的に受注分となる
    arDetailRow['moed_type_04'] = '1';
    arDetailRow['moed_type_subject'] = activeRowsED[i]['p_type_subject'];
    arDetailRows.push(arDetailRow);
  }
  
  // グリッドにデータを設定して再描画
  pgHeader.setItemsAndRefresh([arHeader]);
  pgDetail.setItemsAndRefresh(arDetailRows);
  displayInsertForm(MAINTABS.MOD);
        
  // readdata(mainPGs.pgED);
}


/***
 * 製造委託画面引継
 */
function issueOOrder() {
  let pgHeader = editPGs.pgOOD.h;
  let pgDetail = editPGs.pgOOD.d;

  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // リストクリア
  clearRows(pgHeader);
  clearRows(pgDetail);
  
  // チェックが入っているレコード取得
  let activeRowsED = [];
  let rowsData = mainPGs.pgED.grid.getData().getFilteredItems();
  let nIndex = mainPGs.pgED.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRowsED.push(rowsData[nIndex[i]]);
  }
  if (activeRowsED.length <= 0) {
    window.alert('製造委託引継する行を選択してください');
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d) && IsDirtyCheck(editPGs.pgED.h)) {
    window.alert('編集中の見積データを登録してから、製造委託引継して下さい。');
    return;
  }
  
  for (let i = 0; i < activeRowsED.length; i++) {
    if (parseInt(activeRowsED[i]['ed_type_07']) > 0) {
      alert('製造委託引継済みです。');
      return;
    }
  }

  // 発注画面に展開
  getMoedSerialNo().done(function (data1, textStatus, jqXHR) {
    let arData = JSON.parse(data1);
    // 枝番取得
    let str = '';
    for (let i = 0; i < activeRowsED.length; i++) {
      str += String(activeRowsED[i]['ed_estimate_sub_no']) + ',';
    }
    str = str.slice(0, -1);
    // リストクリア
    clearRows(pgHeader);
    clearRows(pgDetail);
    let arHeader = makeNewRowObj([]);
    let arDetailRows = editPGs.pgOOD.d.dataView.getItems();
    let strOrderNo = '';
    if (isSet(arData[0]['maxno'])) {
      strOrderNo = 'H' + (String)(parseInt(arData[0]['maxno'], 10) + 1);
    } else {
      // 今日の最大連番取得
      let today = new Date();
      let y = ("00" + today.getFullYear()).slice(-2);
      let m = ("00" + (today.getMonth()+1)).slice(-2);
      let d = ("00" + today.getDate()).slice(-2);
      let strDate  = y + m + d;
      strOrderNo = 'H' + strDate + '0001';
    }
    arHeader['moed_order_no'] = strOrderNo;
    arHeader['moed_salesman_cd'] = activeRowsED[0]['e_salesman_cd'];
    arHeader['moed_refer_no'] = activeRowsED[0]['e_estimate_no'];
    // arHeader['moed_refer_sub_no'] = activeRowsED[0]['ed_estimate_sub_no'];
    arHeader['moed_data_status'] = '0'; // insert
    for (let i = 0; i < activeRowsED.length; i++) {
      let arDetailRow = makeNewRowObj(arDetailRows);
      arDetailRow['id'] = i;
      arDetailRow['moed_sub_no'] = ('000' + (i + 1)).slice(-3);
      arDetailRow['moed_accept_sub_no'] = '01';
      arDetailRow['moed_refer_no_subno'] = str;
      arDetailRow['moed_refer_sub_no'] = activeRowsED[i]['ed_estimate_sub_no'];
      arDetailRow['moed_product_cd'] = activeRowsED[i]['ed_p_cd'];
      arDetailRow['moed_sub_01'] = activeRowsED[i]['ed_sub_01'];
      arDetailRow['moed_sub_02'] = activeRowsED[i]['ed_sub_02'];
      arDetailRow['moed_sub_03'] = activeRowsED[i]['ed_sub_03'];
      arDetailRow['moed_sub_04'] = activeRowsED[i]['ed_sub_04'];
      arDetailRow['moed_sub_05'] = activeRowsED[i]['ed_sub_05'];
      arDetailRow['moed_sub_06'] = activeRowsED[i]['ed_sub_06'];
      arDetailRow['moed_sub_07'] = activeRowsED[i]['ed_sub_07'];
      arDetailRow['moed_sub_08'] = activeRowsED[i]['ed_sub_08'];
      arDetailRow['moed_sub_09'] = activeRowsED[i]['ed_sub_09'];
      arDetailRow['moed_sub_10'] = activeRowsED[i]['ed_sub_10'];
      arDetailRow['moed_sub_11'] = activeRowsED[i]['ed_sub_11'];
      arDetailRow['moed_sub_12'] = activeRowsED[i]['ed_sub_12'];
      arDetailRow['moed_sub_13'] = activeRowsED[i]['ed_sub_13'];
      arDetailRow['moed_quantity'] = activeRowsED[i]['ed_quantity'];
      arDetailRow['moed_dt_remarks'] = activeRowsED[i]['ed_detail_remarks'];
      arDetailRow['moed_unit_tran'] = activeRowsED[i]['ed_unit_tran'];
      arDetailRow['moed_refer_no'] = activeRowsED[i]['e_estimate_no'];

      arDetailRow['moed_type_01'] = activeRowsED[i]['ed_type_01'];
      arDetailRow['moed_sub_num_01'] = activeRowsED[i]['ed_sub_num_01'];
      arDetailRow['moed_sub_num_02'] = activeRowsED[i]['ed_sub_num_02'];
      arDetailRow['moed_sub_num_03'] = activeRowsED[i]['ed_sub_num_03'];
      arDetailRow['moed_sub_num_04'] = activeRowsED[i]['ed_sub_num_04'];
      arDetailRow['moed_parrangement_cd'] = activeRowsED[i]['ed_parrangement_cd'];

      arDetailRows.push(arDetailRow);
    }
    // グリッドにデータを設定して再描画
    pgHeader.setItemsAndRefresh([arHeader]);
    pgDetail.setItemsAndRefresh(arDetailRows);
    displayInsertForm(MAINTABS.OOD);
              
    readdata(mainPGs.pgED);
  });
}

/**
 * 見積書編集画面で選択している行について出荷計画明細を転記する
 */
function issueShipPlans() {
  // 出荷予定ヘッダ＆明細
  // 出荷枝番は画面表示しないので、データ取得側で選別
  let pgHeader = editPGs.pgSD.h;
  let pgDetail = editPGs.pgSD.d;
  let strEstNo = '';
  let strDeliv = '';
  let detailSDs = [];
  let strStatementNo = '';
  let stockFlg = false;
  let procFlg = false;
  let moedFlg = false;
  let strSubNo = '';
  let strShipmentSubNo = '';

  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d) && IsDirtyCheck(editPGs.pgED.h)) {
    window.alert('編集中の見積データを登録してから、出荷引継して下さい。');
    return;
  }
  
  // チェックが入っているレコード取得
  let activeRowsED = [];
  let rowsData = mainPGs.pgED.grid.getData().getFilteredItems();
  let nIndex = mainPGs.pgED.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  let statusFlg = false;  // 出荷引継ぎ　true:済　
  for (var i = 0; i < nIndex.length; i++) {    
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRowsED.push(rowsData[nIndex[i]]);
  }
  if (activeRowsED.length <= 0) {
    alert('出荷引継する行を選択してください');
    return;
  }
  for (let i = 0; i < activeRowsED.length; i++) {
    // 同一受注番号内のみOK
    if (!isSet(strEstNo)) {
      strEstNo = activeRowsED[i]['e_estimate_no'];
    }
    if (strEstNo != activeRowsED[i]['e_estimate_no']) {
      alert('同じ受注番号のもののみ選択可能です');
      return;
    } 
    if (!isSet(strDeliv)) {
      // 初期値
      strDeliv = activeRowsED[i]['ed_delivery_cd'];
    } else if (strDeliv !== activeRowsED[i]['ed_delivery_cd']) {
      alert('納入先が異なる製品が含まれています。');
      return;
    }
    if (parseInt(activeRowsED[i]['ed_ship_status_sign']) >= 0) {
      statusFlg = true;
    }
    // 製造品は製造完了前でも出荷引継ぎ可能
    if ((activeRowsED[i]['ed_ar_cd'] <= 2 || activeRowsED[i]['ed_ar_cd'] === '5') && activeRowsED[i]['ed_prod_plan_sign'] < 1) {
      procFlg = true;
    }
    // 在庫品は在庫がなければ出荷引継不可
    if (activeRowsED[i]['ed_ar_cd'] === '3' && !isSet(activeRowsED[i]['ed_lot_no'])) {
      stockFlg = true;
    }
    if (activeRowsED[i]['ed_ar_cd'] === '4' && !isSet(activeRowsED[i]['ed_lot_no'])) {
      moedFlg = true;
    }
    if (!isSet(activeRowsED[i]['e_estimate_date'])) {
      alert('未受注のデータは出荷引継できません。');
      return;
    }
  }

  if (statusFlg) {
    if (!confirm('出荷引継ぎ済みのデータが含まれています。再度出荷引継ぎを行いますか？')) {
      return;
    } 
  }
  
  // if (procFlg) {
  //   alert('製造指示を出してから出荷引継をしてください。');
  // }
  // if (stockFlg) {
  //   alert('在庫引当をしてから出荷引継をしてください。');
  // }
  // if (moedFlg) {
  //   alert('発注してから出荷引継をしてください。');
  // }
  // if (procFlg || stockFlg || moedFlg) {
  //   return;
  // }

  for (let i = 0; i < activeRowsED.length; i++) {
    if (strSubNo === '') {
      strSubNo = activeRowsED[i]['ed_estimate_sub_no'];
    } else {
      strSubNo += ',' + activeRowsED[i]['ed_estimate_sub_no'];
    }
  }

  // 納品連番を取得する 出荷枝番までで検索かけるように変更
  getStatementSerialNo(activeRowsED[0]['e_estimate_no']).then(function(data, textStatus, jqXHR) {
    let resp = JSON.parse(data);
    if (isSet(resp[0]['MAX(s_serial_no)'])) {
      strStatementNo = ('0000' + (Number(resp[0]['MAX(s_serial_no)']) + 1)).slice(-4);
    } else {
      strStatementNo = ('0000' + 1).slice(-4);
    }
    // リストリセット
    clearRows(pgHeader);
    clearRows(pgDetail);

    ajaxSearchData('searchED', {
      'e_belong_cd': $("#company-cd")[0].textContent,
      'e_estimate_no': activeRowsED[0]['e_estimate_no'],
      'ed_estimate_sub_no': strSubNo,
    }, function (resp) {
      /** @type {Array} */
      var items = resp['result'];
      if (items.length <= 0) {
        alert('データ取得に失敗しました。');
        return;
      }
      // 選択された見積の内容を転記
      let price = 0;
      let arHeader = makeNewRowObj([]);
      let arDetailRows = editPGs.pgSD.d.dataView.getItems();
      let arDetailRow = [];  
      // ヘッダデータコピー
      arHeader['s_estimate_no'] = items[0]['ed_estimate_no'];
      if (strStatementNo !== '') {
        arHeader['s_serial_no'] = strStatementNo;
      } else {
        arHeader['s_serial_no'] = '0001';
      }
      arHeader['s_customer_cd'] = items[0]['e_customer_cd'];
      arHeader['s_customer_post_cd'] = items[0]['e_customer_post_cd'];
      arHeader['s_customer_charge_cd'] = items[0]['e_customer_charge_cd'];
      arHeader['s_salesman_cd'] = items[0]['e_salesman_cd'];
      arHeader['s_tc_short_name'] = items[0]['e_tc_short_name'];
      arHeader['s_estimate_date'] = items[0]['e_estimate_date'];
      arHeader['s_desired_delivery_date'] = items[0]['e_desired_delivery_date'];
      arHeader['s_shipping_plan_date'] = items[0]['e_shipplan_date'];
      arHeader['s_customer_order_no'] = items[0]['e_customer_order_no'];
      // 請求締日、入金予定日はグリッド表示時に算出。
      arHeader['s_print'] = items[0]['s_print'];
      arHeader['s_shipper_cd'] = items[0]['e_shipper_cd'];
      arHeader['s_delivery_cd'] = items[0]['e_delivery_cd'];
      arHeader['s_stay_cd'] = items[0]['e_stay_cd'];
      arHeader['s_title'] = items[0]['e_title'];
      arHeader['s_remarks'] = items[0]['e_remark_01']; 
      arHeader['s_valid_month'] = items[0]['e_valid_month'];
      arHeader['s_repeat_estimate_no'] = items[0]['e_repeat_estimate_no'];  
      arHeader['s_packing_num'] = items[0]['e_packing_num'];  
      // 明細
      for (let i = 0; i < items.length; i++) {
        arDetailRow = makeNewRowObj(arDetailRows);
        arDetailRow['sd_statement_sub_no'] = strStatementNo;
        arDetailRow['sd_estimate_sub_no'] = items[i]['ed_estimate_sub_no'];
        arDetailRow['sd_p_cd'] = items[i]['ed_p_cd'];
        arDetailRow['sd_p_name_supple'] = makeStrProductStandard(items[i]);
        arDetailRow['sd_unit_tran'] = items[i]['u_name'];
        arDetailRow['sd_unit_tran_02'] = items[i]['u_name'];
        // ロット番号は製造品は製造指示番号、購入品は入庫で決定する番号
        arDetailRow['sd_lotNo'] = items[i]['ed_lot_no'];
        arDetailRow['sd_estimate_quantity'] = items[i]['ed_quantity'];
        arDetailRow['ed_sub_num_01'] = items[i]['ed_sub_num_01'];
        arDetailRow['sd_unit_price'] = items[i]['ed_unit_price'];
        arDetailRow['sd_tax_rate'] = items[i]['t_rate'];
        arDetailRow['sd_desired_delivery_date'] = items[i]['ed_desired_delivery_date'];
        arDetailRow['sd_customer_order_no'] = items[i]['ed_customer_order_no'];
        arDetailRow['sd_customer_p_name'] = items[i]['ed_customer_p_name'];
        arDetailRow['sd_delivery_cd'] = items[i]['ed_delivery_cd'];
        arDetailRow['sd_ar_cd'] = items[i]['ed_ar_cd'];
        arDetailRow['sd_remarks'] = items[i]['ed_remarks'];
        arDetailRow['sd_detail_remarks'] = items[i]['ed_detail_remarks'];
        arDetailRow['sd_shipment_sub_no'] = items[i]['ed_shipment_sub_no'];
        arDetailRow['sd_cost'] = parseFloat(items[i]['ed_cost']);
        arDetailRow['sd_price'] = parseInt(items[i]['ed_price']);
        price += arDetailRow['sd_price'];
        // 本来ならば、出荷可能数を自動割当しているが、製造機能がないため、引継ぎ時に自動割当を行う。
        // slickgridでの割当も行っているが、データが表示されない場合、slickgridではfomatterが働いていないようなので修正。
        arDetailRow['sd_p_name'] = items[i]['p_name'];
        arDetailRow['sd_qty_delivery'] = items[i]['ed_quantity'];
        arDetailRow['sd_delivery_price'] = items[i]['ed_price'];
        arDetailRow['sd_tax'] = items[i]['ed_price'] * (items[i]['t_rate'] / 100);

        arDetailRow['sd_unit_tran'] = items[i]['ed_unit_tran'];
        arDetailRow['sd_unit_tran_02'] = items[i]['ed_unit_tran'];
        arDetailRow['sd_type_subject'] = items[i]['ed_type_subject'];
        arDetailRow['sd_parrangement_cd'] = items[i]['ed_parrangement_cd'];
        arDetailRow['sd_sub_num_01'] = items[i]['ed_sub_num_01'];
        arDetailRow['sd_packing_group'] = items[i]['ed_packing_group'];
        arDetailRow['sd_packing_cd'] = items[i]['ed_packing_cd'];
        arDetailRow['sd_packing_size'] = items[i]['ed_packing_size'];
        arDetailRow['sd_packing_num'] = items[i]['ed_packing_num'];
        arDetailRow['sd_packing_content'] = items[i]['ed_packing_content'];
        arDetailRows.push(arDetailRow);
      }
      // 合計金額は、画面遷移時にイベントが発生しないため、こちらで設定
      arHeader['s_sum_price'] = price;

      // グリッドにデータを設定して再描画
      pgDetail.setItemsAndRefresh(arDetailRows);
      pgHeader.setItemsAndRefresh([arHeader]);

      displayInsertForm(MAINTABS.SD);
      // フッターの値更新
      pgDetail.redrawFooter();
      
      readdata(mainPGs.pgED);
    });
  });
}

/***
 * 現品票発行　受注一覧から
 */
function exportIDSheet() {
  // チェックしたレコードの現品票データ出力
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // チェックが入っているレコード取得
  let activeRowsED = [];
  let rowsData = mainPGs.pgED.grid.getData().getFilteredItems();
  let nIndex = mainPGs.pgED.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRowsED.push(rowsData[nIndex[i]]);
  }
  if (activeRowsED.length <= 0) {
    alert('現品票データを出力する行を選択してください');
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d) && IsDirtyCheck(editPGs.pgED.h)) {
    alert('編集中の受注データを登録してから、現品票データを出力して下さい。');
    return;
  }
  let str = '';
  let j = 0;
  for (let i = 0; i < activeRowsED.length; i++) {
    if (i <= 0) {
      str += 'str' + i + '=' + activeRowsED[i]['ed_estimate_no'] + ',' + activeRowsED[i]['ed_estimate_sub_no'];
    } else {
      str += '&str' + i + '=' + activeRowsED[i]['ed_estimate_no'] + ',' + activeRowsED[i]['ed_estimate_sub_no'];
    }
  }

  if (str.length > 2048) {
    alert('行数が多いため、発行できません。選択行を減らしてください。');
    return;
  }
  window.open('./db.php?req=makeIDSheet&' + 
  str, '現品票データダウンロード', 'top=200, left=200, width=400, height=300');   
}


/***
 * 現品票発行　材料発注から
 * @param {String} pg 
 */
function exportMATLIDSheet(pg) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // 入庫済みかつ、在庫管理対象である明細のみを抽出し、選択が無ければエラーで返す　2023/6/22
  let targetMOD = [];
  if (pg == 'pgMOD') {
    var dat = editPGs.pgMOD.d.dataView.getItems();
  } else if (pg == 'pgAT') {
    var dat = editPGs.pgAT.d.dataView.getItems();
  }
  for (let i = 0; i < dat.length; i++) {
    if (dat[i]['moed_inventory_type'] == '1' && dat[i]['moed_type_02'] == '1') {
      // 出力できない在庫品が選択されていないかチェック
      if ((dat[i]['moed_product_cd'].substr(0,2) != '07' && dat[i]['moed_product_cd'].substr(0,2) != '08' && dat[i]['moed_product_cd'].substr(0,2) != '09' && 
          dat[i]['moed_product_cd'].substr(0,2) != '10' && dat[i]['moed_product_cd'].substr(0,2) != '11' && dat[i]['moed_product_cd'].substr(0,2) != '12' && 
          dat[i]['moed_product_cd'].substr(0,2) != '13' && dat[i]['moed_product_cd'].substr(0,2) != '14' && dat[i]['moed_product_cd'].substr(0,2) != '24' && 
          dat[i]['moed_product_cd'].substr(0,2) != '25' && dat[i]['moed_product_cd'].substr(0,2) != '26')) {
            targetMOD.push(dat[i]);
      }
    }
  }
  if (targetMOD.length <= 0) {
    alert('入庫報告済み、在庫管理対象の発注データが存在しません。');
    return;
  }
  let str = '';
  for (let i = 0; i < targetMOD.length; i++) {
    targetMOD[i]['moed_sub_cd'] = SetPadding(targetMOD[i]);
    // 場所CDは「moed_customer_charge_cd」で表示されているため注意。
    if (i <= 0) {
      str += 'str' + i + '=' + targetMOD[i]['moed_customer_charge_cd'] + ',' + targetMOD[i]['moed_product_cd'] + ',' + targetMOD[i]['moed_sub_cd'] + ',' + targetMOD[i]['moed_unit_eval'] + ',' + targetMOD[i]['moed_type_subject'] + ',' + targetMOD[i]['moed_parrangement_cd'];
    } else {
      str += '&str' + i + '=' + targetMOD[i]['moed_customer_charge_cd'] + ',' + targetMOD[i]['moed_product_cd'] + ',' + targetMOD[i]['moed_sub_cd'] + ',' + targetMOD[i]['moed_unit_eval'] + ',' + targetMOD[i]['moed_type_subject'] + ',' + targetMOD[i]['moed_parrangement_cd'];
    }
  }
  if (str.length > 2048) {
    alert('選択行が多く、現品票を発行できません。選択行を減らしてください。');
    return;
  }
  window.open('./db.php?req=makeStorageIDSheet&' + 
  str, '現品票データダウンロード', 'top=200, left=200, width=400, height=300');   

  // let ar = editPGs.pgMOD.h.dataView.getItems();
  // let str = 'moed_order_no' + '=' + ar[0]['moed_order_no'];
  // window.open('./db.php?req=makeMATLIDSheet&' + 
  // str, '現品票データダウンロード', 'top=200, left=200, width=400, height=300');   
}



/***
 * 現品票発行　在庫一覧から
 */
 function exportIDSheetStorage() {
  // チェックしたレコードの現品票データ出力
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // チェックが入っているレコード取得
  let activeRows = [];
  let rowsData = masterPGs.pgStorage.grid.getData().getFilteredItems();
  let nIndex = masterPGs.pgStorage.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  });
  for (var i = 0; i < nIndex.length; i++) {
    // 出力できない在庫品が選択されている場合、エラー表示
    if ((rowsData[nIndex[i]]['p_cd'].substr(0,2) == '07' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '08' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '09' && 
        rowsData[nIndex[i]]['p_cd'].substr(0,2) == '10' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '11' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '12' && 
        rowsData[nIndex[i]]['p_cd'].substr(0,2) == '13' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '14' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '24' && 
        rowsData[nIndex[i]]['p_cd'].substr(0,2) == '25' && rowsData[nIndex[i]]['p_cd'].substr(0,2) == '26')) {
          alert('選択された在庫品の現品票が発行できません。');
          return;
    }
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRows.push(rowsData[nIndex[i]]);
  }
  if (activeRows.length <= 0) {
    alert('現品票データを出力する行を選択してください');
    return;
  // } else if (activeRows.length > 10) {
  //   alert('選択行を10行以内にしてください。');
  //   return;
  }
  let str = '';
  for (let i = 0; i < activeRows.length; i++) {
    if (i <= 0) {
      str += 'str' + i + '=' + activeRows[i]['sr_w_cd'] + ',' + activeRows[i]['sr_p_cd'] + ',' + activeRows[i]['sr_sub_cd'] + ',' + activeRows[i]['sr_unit_cd'] + ',' + activeRows[i]['sr_type_subject'] + ',' + activeRows[i]['sr_parrangement_cd'];
    } else {
      str += '&str' + i + '=' + activeRows[i]['sr_w_cd'] + ',' + activeRows[i]['sr_p_cd'] + ',' + activeRows[i]['sr_sub_cd'] + ',' + activeRows[i]['sr_unit_cd'] + ',' + activeRows[i]['sr_type_subject'] + ',' + activeRows[i]['sr_parrangement_cd'];
    }
  }
  if (str.length > 2048) {
    alert('選択行が多く、現品票を発行できません。選択行を減らしてください。');
    return;
  }
  window.open('./db.php?req=makeStorageIDSheet&' + 
  str, '現品票データダウンロード', 'top=200, left=200, width=400, height=300');   
}

/**
 * 見積書画面から製作指示書を作成。在庫引き落としのケース
 */
function issueLeafProdAtStock() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgEdit = editPGs.pgProdplans.d;

  // 複数データ取得モードに変更すること
  var activeRow = pgEdit.getActiveRow();
  if (!activeRow) {
    window.alert('発行対象とする行を選択してください。');
    return;
  }
  if (IsDirtyCheck(editPGs.pgProdplans.d)) {
    window.alert('編集中の製造計画を保存してから、製造リーフを発行してください。');
    return;
  }
  if (!window.confirm('選択行のリーフを発行してもよろしいですか？')) {
    return;
  }
  ajaxIssueProdLeaf(pgEdit, activeRow, function () {
  }).then(()=>ajaxDeployLeaf(pgEdit,activeRow));
}

/***　製作指示データをもとに、リーフを配置 以前1つのprocだったものをプログラムが見えやすくする用に2つに分解
 * 　リーフ配置については工程表が作業すべきと思うので、一旦ボタンを配置するが、のちのち工程表のシミュレーションと統合すべし
 */
function scheduleLeafProd() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgEDHeader = editPGs.pgLP.h;
  var pgED = editPGs.pgLP.d;
  var activeRowED = pgED.getActiveRow();
  let item = pgED.dataView.getItems();
  let isProcessing = false;   // データ編集画面にすでに転記済みのデータがある場合
  if (!activeRowED) {
    window.alert('製作指示データを選択してからボタンを押下してください');
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d)) {
    window.alert('編集中の指示データを登録してから、製造リーフを配置して下さい。');
    return;
  }
  ajaxSearchData('scheduleLeafProd', item, function (resp) {
    var items = resp['results'];
    if (item.length > 0) {
      isProcessing = true;
    } 
  })
}

/**
 * 出荷計画明細から納品書を作成する。
 * 納品書番号の設定は、DBへの新規登録直前に行う
 */
function makeStatementFromSPD() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgSDHeader = editPGs.pgSD.h;
  var pgSD = editPGs.pgSD.d;
  // var pgFromHeader = editPGs.pgShipplans.h;
  // var pgFrom = editPGs.pgShipplans.d;
  var activeRowFrom = pgFrom.getActiveRow();
  if (!activeRowFrom) {
    window.alert('納品書を発行する行を選択してください。');
    return;
  }
  if (activeRowFrom['spd_ed_customer_cd'] === '') {
    window.alert('選択されている出荷計画に対応する見積書がありません。');
    return;
  }
  if (!activeRowFrom['spd_row_PREVVAL']) {
    window.alert('選択されている出荷計画は未登録のため、納品書を発行できません。');
    return;
  }
  // if (IsDirtyCheck(editPGs.pgShipplans.d)) {
  //   window.alert('編集中の出荷計画を保存してから、納品書を作成してください。');
  //   return;
  // }
  var currentSDHeaderItem = pgSDHeader.dataView.getItems();
  if (currentSDHeaderItem.length > 0) {
    if (
      (
        currentSDHeaderItem[0]['S_CUSTOMER_CD'] && currentSDHeaderItem[0]['S_CUSTOMER_POST_ID']
      ) && (
        currentSDHeaderItem[0]['S_CUSTOMER_CD'] !== activeRowFrom['spd_ed_customer_cd'] ||
        currentSDHeaderItem[0]['S_CUSTOMER_POST_ID'] !== activeRowFrom['spd_ed_customer_post_id']
      )
    ) {
      window.alert('指定行の客先が現在作成中の納品書明細の客先と異なるため、追加できません。');
      return;
    }
  }
  
  ajaxSearchData('searchED', {
    'ED_CUSTOMER_ID': activeRowFrom['spd_ed_customer_id'],
    'ED_CUSTOMER_CD': activeRowFrom['spd_ed_customer_cd'],
    'ED_CUSTOMER_POST_ID': activeRowFrom['spd_ed_customer_post_id'],
    'ED_ESTIMATE_DATE': activeRowFrom['spd_ed_estimate_date'],
    'ED_SALESMAN_ID': activeRowFrom['spd_ed_salesman_id'],
    'ED_SALESMAN_CD': activeRowFrom['spd_ed_salesman_cd'],
    'ED_ESTIMATE_SEQ_NO': activeRowFrom['spd_ed_estimate_seq_no'],
    'ED_ESTIMATE_VER': activeRowFrom['spd_ed_estimate_ver'],
    'ED_ESTIMATE_DETAILS_NO': activeRowFrom['spd_ed_estimate_details_no'],
    'ED_DRAWING_NO': '',
  }, function (resp) {
    /** @type {Array} */
    var items = resp['results'];
    if (items.length <= 0) {
      window.alert('指定された行に対応する見積明細データが存在しないため、転記できません。');
      return;
    }
    // 選択された出荷計画の内容を転記
    var currentHeaderSD = pgSDHeader.dataView.getItems();
    var headerRowSD = makeNewRowObj([]);
    var detailRowsSD = pgSD.dataView.getItems();
    var detailRowSD = makeNewRowObj(detailRowsSD);
    // 納品書追記時の明細間客先違いを弾く
    if (currentHeaderSD.length > 0) {
      if (
        (currentHeaderSD[0]['S_CUSTOMER_CD'] && currentHeaderSD[0]['S_CUSTOMER_CD'] !== items[0]['ED_CUSTOMER_CD']) ||
        (currentHeaderSD[0]['S_CUSTOMER_POST_ID'] && currentHeaderSD[0]['S_CUSTOMER_POST_ID'] !== items[0]['ED_CUSTOMER_POST_ID']) ||
        (currentHeaderSD[0]['S_SALESMAN_CD'] && currentHeaderSD[0]['S_SALESMAN_CD'] !== items[0]['ED_SALESMAN_CD'])
      ) {
        window.alert('指定行と編集中の納品書で指定している納品先が異なるため、転記できません。');
        return;
      }
    }
    // 行を転記する
    if (window.confirm('指定行を編集中画面に追記して作成しますか？\n[キャンセル]を選択した場合、指定行のデータから新規作成します。') === false) {
      clearRows(pgSDHeader);
      clearRows(pgSD);
      detailRowsSD = pgSD.dataView.getItems();
      detailRowSD = makeNewRowObj(detailRowsSD);
    }
    headerRowSD['S_CUSTOMER_CD'] = items[0]['ED_CUSTOMER_CD'];
    headerRowSD['S_CUSTOMER_POST_ID'] = items[0]['ED_CUSTOMER_POST_ID'];
    headerRowSD['S_SALESMAN_CD'] = items[0]['ED_SALESMAN_CD'];
    headerRowSD['S_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRowSD['S_STATEMENT_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRowSD['S_AMOUNT_MONEY'] = 0;
    headerRowSD['S_TAX'] = 0;
    headerRowSD['S_TITLE_NAME'] = items[0]['E_TITLE_NAME'];
    headerRowSD['S_CUSTOMER_CHARGE_ID'] = items[0]['E_CUSTOMER_CHARGE_ID'];
    headerRowSD['S_OUTPUT_SIGN'] = '0';
    detailRowSD['SD_CUSTOMER_ORDER_NO'] = items[0]['ED_CUSTOMER_ORDER_NO'];
    detailRowSD['SD_ORDER_DATE'] = items[0]['E_ORDER_DATE'];
    detailRowSD['SD_DRAWING_NO'] = items[0]['ED_DRAWING_NO'];
    detailRowSD['SD_ARTICLE_NAME'] = items[0]['ED_ARTICLE_NAME'];
    detailRowSD['SD_ARTICLE_NO'] = Number(activeRowFrom['spd_quantity']);
    detailRowSD['SD_UNITPRICE'] = items[0]['ED_UNITPRICE'];
    detailRowSD['SD_MONEY'] = detailRowSD['SD_ARTICLE_NO'] * detailRowSD['SD_UNITPRICE'];
    detailRowSD['SD_SUMMARY'] = items[0]['ED_SUMMARY'];
    detailRowSD['SD_CUSTOMER_ID'] = items[0]['ED_CUSTOMER_ID'];
    detailRowSD['SD_CUSTOMER_CD'] = items[0]['ED_CUSTOMER_CD'];
    detailRowSD['SD_CUSTOMER_POST_ID'] = items[0]['ED_CUSTOMER_POST_ID'];
    detailRowSD['SD_ESTIMATE_DATE'] = items[0]['ED_ESTIMATE_DATE'];
    detailRowSD['SD_SALESMAN_ID'] = items[0]['ED_SALESMAN_ID'];
    detailRowSD['SD_SALESMAN_CD'] = items[0]['ED_SALESMAN_CD'];
    detailRowSD['SD_ESTIMATE_SEQ_NO'] = items[0]['ED_ESTIMATE_SEQ_NO'];
    detailRowSD['SD_ESTIMATE_VER'] = items[0]['ED_ESTIMATE_VER'];
    detailRowSD['SD_ESTIMATE_DETAILS_NO'] = items[0]['ED_ESTIMATE_DETAILS_NO'];
    var maxDetailsNum = 0;
    for (var i = 0; i < detailRowsSD.length; i++) {
      maxDetailsNum = Number(detailRowsSD[i]['SD_DETAILS_NO']) > maxDetailsNum ?
        Number(detailRowsSD[i]['SD_DETAILS_NO']) : maxDetailsNum;
    }
    detailRowSD['SD_DETAILS_NO'] = WSUtils.zeroFillStr(maxDetailsNum + 1, 3); // detailRowShipplans['id'];
    detailRowSD['SD_STATEMENT_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    detailRowSD['SD_UNIT'] = items[0]['ED_UNIT'];
    detailRowsSD.push(detailRowSD);
    // グリッドにデータを設定して再描画
    pgSDHeader.setItemsAndRefresh([headerRowSD]);
    pgSD.setItemsAndRefresh(detailRowsSD);
    activateInsertTab(MAINTABS.SD); // 納品書タブを表示
  });
}

/**
 * 見積書から納品書作成
 */
function makeStatementFromED() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let pgSDHeader = editPGs.pgSD.h;
  let pgSD = editPGs.pgSD.d;
  // var pgFromHeader = editPGs.pgED.h;
  let detailSDs = [];
  let i = 0;
  let j = 0;
  let strStatementNo = '';
  let strShipmentSubNo = '00';
  let estimateRec = editPGs.pgED.d.dataView.getItems();
  let estimateHeaderRec = editPGs.pgED.h.dataView.getItems();
  if (!estimateRec[0]['e_estimate_no_PREVVAL']) {
    window.alert('選択されている見積データは未登録のため、納品書を発行できません。');
    return;
  }
  if (IsDirtyCheck(editPGs.pgED.d)) {
    window.alert('編集中の見積データを保存してから、納品書を作成してください。');
    return;
  }

  // 未受注だったら納品書作成不可1
  if (estimateHeaderRec[0]['e_estimate_sign'] === '0') {
    // 未受注
    alert('未受注の見積に対して納品書を発行できません。');
    return;
  }

  // 納品書データ　存在確認
  checkStatement(estimateRec).then(function(data, textStatus, jqXHR) {
    if (data) {
      let str = '';
      for (let i = 0; i < data.length; i++) {
        str += '受注No:' + data[i]['sd_e_estimate_no'] + ' 枝番:' + data[i]['sd_estimate_sub_no'] + '\n';
      }
      if (str) {
        window.alert('以下のデータはすでに納品データ作成済みです。納品残があるもののみ納品書作成に移行します。' + str);
        if (data.length === estimateRec.length) {
          // 選択したデータが全て既存だったら戻る
          return;
        }
        let activeRowsSDCopy = estimateRec.slice(0, estimateRec.length);
        // 選択したデータから既存データを間引く
        // 未納分があるレコードは移行可
        // 未納分のレコードは納品数量を更新せなあかん
        // 出荷フラグがたっていたら移行不可 画面を開いてから時間が空いていたら出荷フラグが立つ可能性があるので、注意。データ登録でフラグが立っていないかチェックしている
        for (let i = 0; i < activeRowsSDCopy.length; i++) {
          for (let j = 0; j < data.length; j++) {
            // 納品完了
            if ((data[j]['sd_e_estimate_no'] === activeRowsSDCopy[i]['ed_estimate_no'] && 
            data[j]['sd_estimate_sub_no'] === activeRowsSDCopy[i]['ed_estimate_sub_no'] ) || 
            (data[j]['sd_e_estimate_no'] === activeRowsSDCopy[i]['ed_estimate_no'] && 
            data[j]['sd_estimate_sub_no'] === activeRowsSDCopy[i]['ed_estimate_sub_no'])) {
              estimateRec.shift();
              break;
            } 
          }
        }
      }
      
      // 画面描画と連番採番
      if (estimateRec.length > 0) {
        // 納品枝番の最大番号取得
        getStatementSerialNo(estimateRec[0]['e_estimate_no']).then(function(data, textStatus, jqXHR) {
          let resp = JSON.parse(data);
          if (resp[0]['MAX(s_serial_no)'] !== null) {
            strStatementNo = ('0000' + (Number(resp[0]['MAX(s_serial_no)']) + 1)).slice(-4);
          } else {
            strStatementNo = ('0000' + 1).slice(-4);
          }
          ajaxSearchData('searchED', {
            'e_belong_cd': $("#company-cd")[0].textContent,
            'e_estimate_no': estimateRec[0]['e_estimate_no'],
          }, function (resp) {
            /** @type {Array} */
            var items = resp['results'];
            if (items.length <= 0) {
              window.alert('データ取得に失敗しました。');
              return;
            }
            // 選択された見積の内容を転記
            let price = 0;
            for (let i = 0; i < items.length; i++) {
              let detailSD = makeNewRowObj(detailSDs);
              // format変換　-を/に変換
              let closedate = (String(items[i]['bill_close_date'])).split('-').join('');
              detailSD['sd_statement_sub_no'] = strStatementNo;
              detailSD['sd_estimate_sub_no'] = items[i]['ed_estimate_sub_no'];
              detailSD['sd_p_cd'] = items[i]['ed_p_cd'];
              detailSD['sd_p_name'] = getMasterValue('p_name', 'product',items[i]['ed_p_cd'] );
              detailSD['ed_sub_01'] = items[i]['ed_sub_01'];
              detailSD['ed_sub_02'] = items[i]['ed_sub_02'];
              detailSD['ed_sub_03'] = items[i]['ed_sub_03'];
              detailSD['ed_sub_04'] = items[i]['ed_sub_04'];
              detailSD['ed_sub_05'] = items[i]['ed_sub_05'];
              detailSD['ed_sub_06'] = items[i]['ed_sub_06'];
              detailSD['ed_sub_08'] = items[i]['ed_sub_08'];
              detailSD['ed_sub_09'] = items[i]['ed_sub_09'];
              detailSD['ed_sub_10'] = items[i]['ed_sub_10'];
              detailSD['ed_sub_11'] = items[i]['ed_sub_11'];
              detailSD['ed_sub_12'] = items[i]['ed_sub_12'];
              detailSD['ed_sub_13'] = items[i]['ed_sub_13'];
              detailSD['sd_estimate_quantity'] = items[i]['ed_quantity'];
              detailSD['sd_qty_delivery'] = items[i]['remain_qty'];
              detailSD['ed_sub_num_01'] = items[i]['ed_sub_num_01'];
              detailSD['sd_unit_price'] = items[i]['ed_unit_price'];
              detailSD['sd_price'] = items[i]['ed_price'];
              detailSD['sd_cost'] = items[i]['sd_cost'];
              price += detailSD['sd_price'];
              detailSD['sd_tax_rate'] = items[i]['t_rate'];
              detailSD['sd_tax'] = detailSD['sd_price'] * (detailSD['sd_tax_rate'] / 100);
              detailSD['sd_desired_delivery_date'] = items[i]['ed_desired_delivery_date'];
              detailSD['sd_customer_order_no'] = items[i]['ed_customer_order_no'];
              detailSD['sd_customer_p_name'] = items[i]['ed_customer_p_name'];
              detailSD['sd_delivery_cd'] = items[i]['ed_delivery_cd'];
              detailSD['sd_payment_close_date'] = closedate;
              detailSD['ed_ar_cd'] = items[i]['ed_ar_cd'];
              detailSD['sd_remarks'] = items[i]['ed_remarks'];
              detailSD['sd_detail_remarks'] = items[i]['ed_detail_remarks'];
              // 表示はしないがデータを保持する
              if (strShipmentSubNo !== '') {
                detailSD['sd_shipment_sub_no'] = strShipmentSubNo;
              } else {
                detailSD['sd_shipment_sub_no'] = '00';
              }
              detailSDs.push(detailSD);
            }
            let headerSD = makeNewRowObj([]);
            headerSD['s_estimate_no'] = items[0]['e_estimate_no'];
            if (strStatementNo !== '') {
              headerSD['s_serial_no'] = strStatementNo;
            } else {
              headerSD['s_serial_no'] = '0001';
            }
            headerSD['s_customer_cd'] = items[0]['e_customer_cd'];
            headerSD['s_customer_post_cd'] = items[0]['e_customer_post_cd'];
            headerSD['s_customer_charge_cd'] = items[0]['e_customer_charge_cd'];
            headerSD['s_salesman_cd'] = items[0]['e_salesman_cd'];
            headerSD['s_estimate_date'] = items[0]['e_estimate_date'];
            headerSD['s_desired_delivery_date'] = items[0]['e_desired_delivery_date'];
            headerSD['s_customer_order_no'] = items[0]['e_customer_order_no'];
            headerSD['s_tc_short_name'] = items[0]['e_tc_short_name'];
            headerSD['s_title'] = items[0]['e_title'];
            headerSD['s_valid_month'] = items[0]['e_valid_month'];
            headerSD['s_repeat_estimate_no'] = items[0]['e_repeat_estimate_no'];
            headerSD['s_remarks'] = items[0]['e_remark_01'];
            headerSD['s_delivery_timing'] = items[0]['ed_type_02'];
            headerSD['s_bill_close_date'] = (String(items[0]['closedate'])).split('-').join('');
            headerSD['s_payment_plan_date'] = (String(items[0]['paymentdate'])).split('-').join('');
            headerSD['s_sum_price'] = price;
            headerSD['s_print'] = items[0]['s_print'];
            headerSD['s_shipper_cd'] = items[0]['e_shipper_cd'];
            headerSD['s_delivery_cd'] = items[0]['e_delivery_cd'];
            headerSD['s_stay_cd'] = items[0]['e_stay_cd'];
            // グリッドにデータを設定して再描画
            pgSD.setItemsAndRefresh(detailSDs);
            pgSDHeader.setItemsAndRefresh([headerSD]);
            activateInsertTab(MAINTABS.SD); 
          });
          
        });
      } else {
        return;
      }
    }
  });
}

/**********************************************************************
 * 請求データ作成ダイアログを表示する
 */
function openSDForBillDlg() {
  $("#txt-sdforbill-closedate")['datepicker']({
    'dateFormat': 'yy/mm/dd',
    'showOn': 'button'
  }).val('');
  $('#txt-sdforbill-custcd').val('');
  $('#dialog-sdforbill')['dialog']('open');  
}

/************************************************************************
 * 請求一覧表ダイアログを表示する
 */
function openCheckBillDlg() {
  // 画面初期化
  $("#txt-checkbill-closedate")['datepicker']({
    'dateFormat': 'yy/mm/dd',
    'showOn': 'button'
  }).val('');
  $('#dialog-checkbill')['dialog']('open');  
}

/**********************************************************************
 * 請求書発行ダイアログを表示する
 */
function openOutputBillDlg() {
  $("#txt-outputbill-closedate")['datepicker']({
    'dateFormat': 'yy/mm/dd',
    'showOn': 'button'
  }).val('');
  $('#txt-outputbill-custcd').val('');
  $('#dialog-outputbill')['dialog']('open');  
}

/************************************************************************
 * 請求書取消画面
 */
function openDeleteDlg() {
  // 画面初期化
  $('#txt-delete-billno').val('');
  $('#dialog-deletebill')['dialog']('open');  
}

/***********************************************************************
 * 請求書作成ボタン押下
 */
function searchStatementsForBill() {
  // 入力項目チェック
  if (!isSet($('#txt-sdforbill-closedate').val())) {
    alert('請求締日は必須入力です。');
    return;
  }
  // DB取得用に配列セット
  let conditions = {
    'closeDate' : $('#txt-sdforbill-closedate').val(),
    'customercd': $('#txt-sdforbill-custcd').val(),
  };
  // 取得した検索結果から請求書データを作成する。
  ajaxCreateBD(conditions).then(function (data, jqXHR, textStatus) {
    if (data['succeed'] === false) {
      // 請求データ作成失敗
      if (isSet(data['msg'])) {
        alert(data['msg']);
      } else {
        alert('請求データ作成に失敗しました。');
      }
      return;
    } else {
      // 画面リロード
      readdata(mainPGs.pgBD);
      readdata(editPGs.pgSD.m);
      readdata(editPGs.pgED.m);
    }
  });
}

/***********************************************************************
 * 請求一覧表ボタン押下
 */
function searchCheckBill() {
  // 入力項目チェック
  if (!isSet($('#txt-checkbill-closedate').val())) {
    alert('請求締日は必須入力です。');
    return;
  }
  var closeDate =new Date($('#txt-checkbill-closedate').val());
  var lastYear = "";
  var lastMonth = "";
  var lastDay = "";
  var year = closeDate.getFullYear();
  var month = ("00" + (closeDate.getMonth()+1)).slice(-2);
  var day = ("00" + (closeDate.getDate())).slice(-2);
  var closeDay = "";
  // 選択された請求締日から前月請求締日までの期間を検索対象とする
  lastMonth = ("00" + (closeDate.getMonth())).slice(-2);
  if (lastMonth === "00" && Number(day) < 27) {
    lastYear = year -1;
    lastMonth = "12"
  } else {
    lastYear = year;
  }
  switch (day) {
    case "15":
      lastDay = "16";
      closeDay = "15"
      break;
    case "20":
      lastDay = "21";
      closeDay = "20"
      break;
    case "25":
      lastDay = "26";
      closeDay = "25"
      break;
    case "28":
    case "29":
    case "30":
    case "31":
      lastMonth = month;
      lastDay = "01";
      closeDay = "31"
      break;
    default:
      alert('存在する客先締日を選択して下さい。');
      return;
  }
  var closeDate_f = lastYear + lastMonth + lastDay;
  var closeDate_t = year + month + day;
  var closeDate_l = year + month + "%";
  var close15 = year + month + "15";
  var close20 = year + month + "20";
  var close25 = year + month + "25";
  var close31 = year + month + day;
  
  // 請求書の確認用
  window.open('./db.php?req=createCheckBillSheet&closeDateF=' + closeDate_f + '&closeDateT=' + closeDate_t + '&closeDay=' + closeDay + '&closeDateL=' + closeDate_l + 
  '&close15=' + close15 + '&close20=' + close20 + '&close25=' + close25 + '&close31=' + close31, '請求一覧表', 'top=200, left=200, width=400, height=300');
}

/***********************************************************************
 * 請求書発行ボタン押下
 */
function searchOutputBill() {
  // 入力項目チェック
  if (!isSet($('#txt-outputbill-closedate').val())) {
    alert('請求締日は必須入力です。');
    return;
  }
  if (document.getElementById("billtype1").checked === false && document.getElementById("billtype2").checked === false ) {
    alert('帳票タイプをどちらか選択してください。');
    return;
  }
  // DB取得用に配列セット
  let conditions = {
    'closeDate' : $('#txt-outputbill-closedate').val(),
    'customercd': $('#txt-outputbill-custcd').val(),
    'billtypeusual': document.getElementById("billtype1").checked,
    'billtyperyoki': document.getElementById("billtype2").checked,
  };
  // 取得した検索結果から請求書データを作成する。
  ajaxOutputBD(conditions).then(function (data, jqXHR, textStatus) {
    if (data['succeed'] === false) {
      // 請求書発行失敗
      if (isSet(data['msg'])) {
        alert(data['msg']);
      } else {
        alert('請求書発行に失敗しました。');
      }
      return;
    } else {
      // POST用の受け渡し文字列作成
      let str = 'closeDate=' + conditions['closeDate'] + '&customercd=' + conditions['customercd'] + '&billtypeusual=' + conditions['billtypeusual'] + '&billtyperyoki=' + conditions['billtyperyoki'];
      if (document.getElementById("billtype1").checked) {
        // 通常請求
        window.open('./db.php?req=makeBillFileData&' + str, '請求書発行', 'width=400, height=300');
      } 
      if (document.getElementById("billtype2").checked) {
        // リョーキ専用
        window.open('./db.php?req=makeBillDedicatedFileData&' + str, '特殊請求書発行', 'width=400, height=300');
      }
    }
  });
}

/************************************************************************
 * 請求データ削除処理
 */
function deleteBillData() {
  // 請求No取得
  let str = '';
  let ar = [];
  if (isSet($('#txt-delete-billno').val())) {
    // カンマ区切りで配列
    str = $('#txt-delete-billno').val();
    ar = str.split(',');
    ajaxDeleteBD(ar).then(function (data, textStatus, jqXHR) {
      if (!data['succeed']) {
        if (isSet(data['msg'])) {
          alert(data['msg']);
        } else {
          alert('データ削除に失敗しました。');
        }
      } else {
        alert('削除完了しました。');
        readdata(mainPGs.pgBD);
        readdata(editPGs.pgSD.m);
        readdata(editPGs.pgED.m);

        $('#dialog-deletebill')['dialog']('close');
      }
    });
  } else {
    alert('請求Noを指定してください。');
    return;
  }
}

/**
 * 請求書登録ウィンドウに納品データ検索結果を転記する
 * @param {Array} items 納品データの配列
 */
function displaySearchedStatements(items) {
  let pgBDHeader = editPGs.pgBD.h;
  let pgBD = editPGs.pgBD.d;
  // 表示用データ
  let headerRowBD = makeNewRowObj([]);
  // 明細データ
  let detailRowsBD = [];
  items.forEach(function (elem) {
    headerRowBD['bd_bill_no'] 
    headerRowBD['bd_estimate_no']
    headerRowBD['bd_ed_details_no'] 
    headerRowBD['bd_dt_customer_order_no']
    headerRowBD['bd_order_date']
    headerRowBD['bd_desired_delivery_date']
    headerRowBD['bd_product_name']
    headerRowBD['bd_ed_quantity']
    headerRowBD['bd_unit_price']
    headerRowBD['bd_price'] 
    headerRowBD['bd_remarks']
    headerRowBD['bd_customer_cd']
    headerRowBD['bd_customer_post_cd']
    headerRowBD['bd_order_date']
    headerRowBD['bd_salesman_cd']
    headerRowBD['bd_salesman_name']
    headerRowBD['bd_invoice_no']
    headerRowBD['bd_bill_close_date']
    headerRowBD['bd_customer_cd']
    headerRowBD['bd_customer_name'] 
    headerRowBD['bd_customer_post_cd']
    headerRowBD['bd_customer_post_name']
    headerRowBD['bd_customer_charge_cd']
    headerRowBD['B_SALESMAN_CD']
    headerRowBD['bd_salesman_cd']
    headerRowBD['bd_tax'] 
    headerRowBD['B_BILL']
    headerRowBD['bd_payment_sign']
    headerRowBD['bd_order_sign']

    // if (!headerRowBD['B_CUSTOMER_CD']) {
    //   headerRowBD['B_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    //   headerRowBD['B_BILL_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    //   headerRowBD['B_CUSTOMER_CD'] = elem['S_CUSTOMER_CD'];
    //   headerRowBD['B_CUSTOMER_POST_ID'] = elem['S_CUSTOMER_POST_ID'];
    //   headerRowBD['B_CUSTOMER_CHARGE_ID'] = elem['S_CUSTOMER_CHARGE_ID'];
    //   headerRowBD['B_SALESMAN_CD'] = elem['S_SALESMAN_CD'];
    //   //headerRowBD['B_BEFORE_BILL'] = elem['C_INVOICE_PREVIOUS'];
    //   //headerRowBD['B_BEFORE_TAX'] = elem['C_TAX_PREVIOUS'];
    //   headerRowBD['C_INVOICE_TAX_SUM'] = elem['C_INVOICE_TAX_SUM'];
    //   headerRowBD['C_INVOICE_TAX_CAL'] = elem['C_INVOICE_TAX_CAL'];
    // }
    // var detailRowBD = makeNewRowObj(detailRowsBD);
    // //detailRowBD['BD_BILL_NO'] = elem[''];
    // var maxDetailsNum = 0;
    // for (var i = 0; i < detailRowsBD.length; i++) {
    //   maxDetailsNum = Number(detailRowsBD[i]['BD_DETAILS_NO']) > maxDetailsNum ?
    //     Number(detailRowsBD[i]['BD_DETAILS_NO']) : maxDetailsNum;
    // }
    // detailRowBD['BD_DETAILS_NO'] = WSUtils.zeroFillStr(maxDetailsNum + 1, 3); // detailRowShipplans['id'];
    // detailRowBD['BD_CUSTOMER_ORDER_NO'] = elem['SD_CUSTOMER_ORDER_NO'];
    // detailRowBD['BD_ORDER_DATE'] = elem['E_ORDER_DATE'];
    // detailRowBD['BD_STATEMENT_DATE'] = elem['SD_STATEMENT_DATE'];
    // //detailRowBD['BD_BILL_DATE'] = elem[''];
    // detailRowBD['BD_DRAWING_NO'] = elem['SD_DRAWING_NO'];
    // detailRowBD['BD_ARTICLE_NAME'] = elem['SD_ARTICLE_NAME'];
    // detailRowBD['BD_ARTICLE_NO'] = elem['SD_ARTICLE_NO'];
    // detailRowBD['BD_UNITPRICE'] = elem['SD_UNITPRICE'];
    // detailRowBD['BD_MONEY'] = elem['SD_ARTICLE_NO'] * elem['SD_UNITPRICE'];
    // detailRowBD['BD_SUMMARY'] = elem['SD_SUMMARY'];
    // detailRowBD['BD_CUSTOMER_ID'] = elem['SD_CUSTOMER_ID'];
    // detailRowBD['BD_CUSTOMER_CD'] = elem['SD_CUSTOMER_CD'];
    // detailRowBD['BD_CUSTOMER_POST_ID'] = elem['SD_CUSTOMER_POST_ID'];
    // detailRowBD['BD_ESTIMATE_DATE'] = elem['SD_ESTIMATE_DATE'];
    // detailRowBD['BD_SALESMAN_ID'] = elem['SD_SALESMAN_ID'];
    // detailRowBD['BD_SALESMAN_CD'] = elem['SD_SALESMAN_CD'];
    // detailRowBD['BD_ESTIMATE_SEQ_NO'] = elem['SD_ESTIMATE_SEQ_NO'];
    // detailRowBD['BD_ESTIMATE_VER'] = elem['SD_ESTIMATE_VER'];
    // detailRowBD['BD_ESTIMATE_DETAILS_NO'] = elem['SD_ESTIMATE_DETAILS_NO'];
    // detailRowBD['BD_STATEMENT_NO'] = elem['SD_STATEMENT_NO'];
    // detailRowBD['BD_STATEMENT_DETAILS_NO'] = elem['SD_DETAILS_NO'];
    // //detailRowBD['BD_TAX'] = elem[''];
    // //detailRowBD['BD_RP_ID'] = elem[''];
    // //detailRowBD['BD_P_CD'] = elem[''];
    // detailRowsBD.push(detailRowBD);
  });
  // グリッドにデータを設定して再描画
  pgBDHeader.setItemsAndRefresh([headerRowBD]);
  pgBD.setItemsAndRefresh(detailRowsBD);
  pgBD.redrawFooter();
}

/**
 * 配列中に含まれるオブジェクトのキーを検索して一致する箇所を置換する
 * @param {Array} arr 対象とする配列
 * @param {string} searchstr 検索文字列
 * @param {string} newstr 置換文字列
 */
function replaceKeys(arr, searchstr, newstr) {
  arr.forEach(function (elem) {
    Object.keys(elem).forEach(function (key) {
      var newkey = key.replace(searchstr, newstr);
      if (newkey !== key) {
        elem[newkey] = elem[key];
        delete elem[key];
      }
    });
  });
}

/**
 * 材料見積依頼書から材料注文書を作成する
 */
function makeMOFromMOE() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // 材料見積データを取得
  var pgFromHeader = editPGs.pgMOED.h;
  var pgFrom = editPGs.pgMOED.d;
  var rowsFromHeader = pgFromHeader.dataView.getItems();
  var rowsFromDetail = pgFrom.dataView.getItems();
  var pgToHeader = editPGs.pgMOD.h;
  var pgToDetails = editPGs.pgMOD.d;
  var rowsToHeader = [];
  var rowsToDetail = [];
  rowsFromHeader.forEach(function (elem) {
    rowsToHeader.push(Object.assign({}, elem));
  });
  rowsFromDetail.forEach(function (elem) {
    rowsToDetail.push(Object.assign({}, elem));
  });

  if (IsDirtyCheck(editPGs.pgMOED.d)) {
    window.alert('編集中のデータを保存してから、材料注文書を作成して下さい。');
    return;
  }
  // 項目内容を調整
  rowsToHeader[0]['MOE_ORDER_NO'] = '';
  rowsToHeader[0]['MOE_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
  rowsToHeader[0]['MOE_ESTIMATE_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
  removePrevvals(rowsToHeader);
  removePrevvals(rowsToDetail);
  replaceKeys(rowsToHeader, 'MOE_', 'MO_');
  replaceKeys(rowsToDetail, 'MOED_', 'MOD_');
  // 全行を転記する
  clearRows(pgToHeader);
  clearRows(pgToDetails);
  pgToHeader.setItemsAndRefresh(rowsToHeader);
  pgToDetails.setItemsAndRefresh(rowsToDetail);
  activateInsertTab(MAINTABS.MOD);
}

/**
 * 外注見積依頼書から外注注文書を作成する
 */
function makeOOFromOOE() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // 外注見積データを取得
  var pgFromHeader = editPGs.pgOOED.h;
  var pgFrom = editPGs.pgOOED.d;
  var rowsFromHeader = pgFromHeader.dataView.getItems();
  var rowsFromDetail = pgFrom.dataView.getItems();
  var pgToHeader = editPGs.pgOOD.h;
  var pgToDetails = editPGs.pgOOD.d;
  var rowsToHeader = [];
  var rowsToDetail = [];
  rowsFromHeader.forEach(function (elem) {
    rowsToHeader.push(Object.assign({}, elem));
  });
  rowsFromDetail.forEach(function (elem) {
    rowsToDetail.push(Object.assign({}, elem));
  });
  if (IsDirtyCheck(editPGs.pgOOED.d)) {
    window.alert('編集中のデータを保存してから、外注注文書を作成して下さい。');
    return;
  }
  // 項目内容を調整
  rowsToHeader[0]['OOE_ORDER_NO'] = '';
  rowsToHeader[0]['OOE_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
  rowsToHeader[0]['OOE_ESTIMATE_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
  removePrevvals(rowsToHeader);
  removePrevvals(rowsToDetail);
  replaceKeys(rowsToHeader, 'OOE_', 'OO_');
  replaceKeys(rowsToDetail, 'OOED_', 'OOD_');
  // 全行を転記する
  clearRows(pgToHeader);
  clearRows(pgToDetails);
  pgToHeader.setItemsAndRefresh(rowsToHeader);
  pgToDetails.setItemsAndRefresh(rowsToDetail);
  activateInsertTab(MAINTABS.OOD);
}

/**
 * 文字列として無効なパラメータなどを空文字に変換する
 */
function nullToStr(str) {
  return str ? String(str) : '';
}

/**
 * 製造リーフから材料見積依頼書を作成する
 * 明細行として、指定リーフの製品IDをBOM展開した子部分で製造工程が指定されていない製品を材料として発行する
 */
function makeMOEFromLP() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgFromHeader = editPGs.pgLP.h;
  var pgFrom = editPGs.pgLP.d;
  var activeRowFrom = pgFrom.getActiveRow();
  if (!activeRowFrom) {
    window.alert('材料注文依頼書を発行する行を選択してください。');
    return;
  }
  if (IsDirtyCheck(editPGs.pgLP.d)) {
    window.alert('編集中のデータを保存してから、材料注文依頼書作成して下さい。');
    return;
  }
  var pgHeader = editPGs.pgMOED.h;
  var pgDetails = editPGs.pgMOED.d;
  var finishDate = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']) : $['datepicker']['formatDate']('yy-mm-dd', new Date());
  ajaxSearchData('searchMaterialsbom', {
    'checkId': activeRowFrom['l_p_id'],
    'qty': activeRowFrom['l_amount'],
    'finishdt': finishDate
  }, function (resp) {
    /** @type {Array} */
    var items = resp['results'];
    if (items.length <= 0) {
      window.alert('指定行の製品については、調達材料を示すBOMが存在しません。');
      return;
    }
    // 選択された見積書の内容を転記
    if (window.confirm('指定行を編集中画面に追記して作成しますか？\n[キャンセル]を選択した場合、指定行のデータから新規作成します。') === false) {
      clearRows(pgHeader);
      clearRows(pgDetails);
    }
    var headerRow = makeNewRowObj([]);
    var detailRows = pgDetails.dataView.getItems();
    headerRow['MOE_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['MOE_ESTIMATE_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['MOE_ORDER_CD'] = nullToStr(activeRowFrom['ED_VENDER_CD']);
    headerRow['MOE_SALESMAN_CD'] = nullToStr(activeRowFrom['ED_SALESMAN_CD']);
    //detailRow['MOED_ORDER_NO'] = nullToStr(items[0]['']);
    //detailRow['MOED_STATEMENT_DETAILS_NO'] = nullToStr(items[0]['']);
    items.forEach(function (elem) {
      var detailRow = makeNewRowObj(detailRows);
      detailRow['MOED_ARTICLE_NAME'] = nullToStr(elem['p_name']);//nullToStr(items[0]['p_name']);
      detailRow['MOED_SIZE'] = '';
      detailRow['MOED_ORDER_QUANTITY'] = nullToStr(elem['b_quantity']) !== '' ? Number(elem['b_quantity']) : 0; //nullToStr(items[0]['ED_PRODUCTS_NO']);
      detailRow['MOED_UNITPRICE'] = '0';
      detailRow['MOED_MONEY'] = ''; //nullToStr(items[0]['MOED_ARTICLE_NO'] * nullToStr(items[0]['MOED_UNITPRICE']);
      //detailRow['MOED_ARRIVALDAY'] = nullToStr(items[0]['']);
      //detailRow['MOED_DELIVERY_PLACE'] = nullToStr(items[0]['']);
      //detailRow['MOED_SEAL'] = nullToStr(items[0]['']);
      detailRow['MOED_HOPE_DELIVERY_DATE'] = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']).slice(0, 10) : '';
      detailRow['MOED_CUSTOMER_ID'] = nullToStr(activeRowFrom['ED_CUSTOMER_ID']);
      detailRow['MOED_CUSTOMER_CD'] = nullToStr(activeRowFrom['ED_CUSTOMER_CD']);
      detailRow['MOED_CUSTOMER_POST_ID'] = nullToStr(activeRowFrom['ED_CUSTOMER_POST_ID']);
      detailRow['MOED_ESTIMATE_DATE'] = nullToStr(activeRowFrom['ED_ESTIMATE_DATE']);
      detailRow['MOED_SALESMAN_ID'] = nullToStr(activeRowFrom['ED_SALESMAN_ID']);
      detailRow['MOED_SALESMAN_CD'] = nullToStr(activeRowFrom['ED_SALESMAN_CD']);
      detailRow['MOED_ESTIMATE_SEQ_NO'] = nullToStr(activeRowFrom['ED_ESTIMATE_SEQ_NO']);
      detailRow['MOED_ESTIMATE_VER'] = nullToStr(activeRowFrom['ED_ESTIMATE_VER']);
      detailRow['MOED_ESTIMATE_DETAILS_NO'] = nullToStr(activeRowFrom['ED_ESTIMATE_DETAILS_NO']);
      //detailRow['MOED_LEAF_SEQ_NO'] = nullToStr(items[0]['']);
      //detailRow['MOED_LEAF_VER'] = nullToStr(items[0]['']);
      //detailRow['MOED_PROCESS_NO'] = nullToStr(items[0]['']);
      //detailRow['MOED_PROCESS_CD'] = nullToStr(items[0]['']);
      //detailRow['MOED_PROCESS_ID'] = nullToStr(items[0]['']);
      //detailRow['MOED_M_ID'] = nullToStr(items[0]['']);
      //detailRow['MOED_ORDER_NUMBER'] = nullToStr(items[0]['']);
      //detailRow['MOED_DRAWING_NO'] = nullToStr(items[0]['ED_DRAWING_NO']);
      //detailRow['MOED_PAYMENT_DATE'] = nullToStr(items[0]['']);
      //detailRow['MOED_ARRIVAL_QUANTITY'] = nullToStr(items[0]['']);
      detailRows.push(detailRow);
    });
    // グリッドにデータを設定して再描画
    pgHeader.setItemsAndRefresh([headerRow]);
    pgDetails.setItemsAndRefresh(detailRows);
    activateInsertTab(MAINTABS.MOED);
    //displayInsertForm();
  });
}

/**
 * 製造リーフから材料注文書を作成する
 * 明細行として、指定リーフの製品IDをBOM展開した子部分で製造工程が指定されていない製品を材料として発行する
 */
function makeMOFromLP() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgFromHeader = editPGs.pgLP.h;
  var pgFrom = editPGs.pgLP.d;
  var activeRowFrom = pgFrom.getActiveRow();
  if (!activeRowFrom) {
    window.alert('材料注文依頼書を発行する行を選択してください。');
    return;
  }
  if (IsDirtyCheck(editPGs.pgLP.d)) {
    window.alert('編集中のデータを保存してから、材料注文書作成して下さい。');
    return;
  }
  var pgHeader = editPGs.pgMOD.h;
  var pgDetails = editPGs.pgMOD.d;
  var finishDate = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']) : $['datepicker']['formatDate']('yy-mm-dd', new Date());
  ajaxSearchData('searchMaterialsbom', {
    'checkId': activeRowFrom['l_p_id'],
    'qty': activeRowFrom['l_amount'],
    'finishdt': finishDate
  }, function (resp) {
    /** @type {Array} */
    var items = resp['results'];
    if (items.length <= 0) {
      window.alert('指定行の製品については、調達材料を示すBOMが存在しません。');
      return;
    }
    // 選択された見積書の内容を転記
    if (window.confirm('指定行を編集中画面に追記して作成しますか？\n[キャンセル]を選択した場合、指定行のデータから新規作成します。') === false) {
      clearRows(pgHeader);
      clearRows(pgDetails);
    }
    var headerRow = makeNewRowObj([]);
    var detailRows = pgDetails.dataView.getItems();
    headerRow['MO_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['MO_ESTIMATE_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['MO_ORDER_CD'] = nullToStr(activeRowFrom['ED_VENDER_CD']);
    headerRow['MO_SALESMAN_CD'] = nullToStr(activeRowFrom['ED_SALESMAN_CD']);
    //detailRow['MOD_ORDER_NO'] = nullToStr(items[0]['']);
    //detailRow['MOD_STATEMENT_DETAILS_NO'] = nullToStr(items[0]['']);
    items.forEach(function (elem) {
      var detailRow = makeNewRowObj(detailRows);
      detailRow['MOD_ARTICLE_NAME'] = nullToStr(elem['p_name']);//nullToStr(items[0]['p_name']);
      detailRow['MOD_SIZE'] = '';
      detailRow['MOD_ORDER_QUANTITY'] = nullToStr(elem['b_quantity']) !== '' ? Number(elem['b_quantity']) : 0; //nullToStr(items[0]['ED_PRODUCTS_NO']);
      detailRow['MOD_UNITPRICE'] = '0';
      detailRow['MOD_MONEY'] = ''; //nullToStr(items[0]['MOD_ARTICLE_NO'] * nullToStr(items[0]['MOD_UNITPRICE']);
      //detailRow['MOD_ARRIVALDAY'] = nullToStr(items[0]['']);
      //detailRow['MOD_DELIVERY_PLACE'] = nullToStr(items[0]['']);
      //detailRow['MOD_CUSTOMERSIGN'] = nullToStr(items[0]['']);
      detailRow['MOD_HOPE_DELIVERY_DATE'] = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']).slice(0, 10) : '';
      detailRow['MOD_CUSTOMER_ID'] = nullToStr(activeRowFrom['ED_CUSTOMER_ID']);
      detailRow['MOD_CUSTOMER_CD'] = nullToStr(activeRowFrom['ED_CUSTOMER_CD']);
      detailRow['MOD_CUSTOMER_POST_ID'] = nullToStr(activeRowFrom['ED_CUSTOMER_POST_ID']);
      detailRow['MOD_ESTIMATE_DATE'] = nullToStr(activeRowFrom['ED_ESTIMATE_DATE']);
      detailRow['MOD_SALESMAN_ID'] = nullToStr(activeRowFrom['ED_SALESMAN_ID']);
      detailRow['MOD_SALESMAN_CD'] = nullToStr(activeRowFrom['ED_SALESMAN_CD']);
      detailRow['MOD_ESTIMATE_SEQ_NO'] = nullToStr(activeRowFrom['ED_ESTIMATE_SEQ_NO']);
      detailRow['MOD_ESTIMATE_VER'] = nullToStr(activeRowFrom['ED_ESTIMATE_VER']);
      detailRow['MOD_ESTIMATE_DETAILS_NO'] = nullToStr(activeRowFrom['ED_ESTIMATE_DETAILS_NO']);
      //detailRow['MOD_LEAF_SEQ_NO'] = nullToStr(items[0]['']);
      //detailRow['MOD_LEAF_VER'] = nullToStr(items[0]['']);
      //detailRow['MOD_PROCESS_NO'] = nullToStr(items[0]['']);
      //detailRow['MOD_PROCESS_CD'] = nullToStr(items[0]['']);
      //detailRow['MOD_PROCESS_ID'] = nullToStr(items[0]['']);
      //detailRow['MOD_M_ID'] = nullToStr(items[0]['']);
      //detailRow['MOD_ORDER_NUMBER'] = nullToStr(items[0]['']);
      //detailRow['MOD_DRAWING_NO'] = nullToStr(items[0]['ED_DRAWING_NO']);
      //detailRow['MOD_PAYMENT_DATE'] = nullToStr(items[0]['']);
      //detailRow['MOD_ARRIVAL_QUANTITY'] = nullToStr(items[0]['']);
      detailRows.push(detailRow);
    });
    // グリッドにデータを設定して再描画
    pgHeader.setItemsAndRefresh([headerRow]);
    pgDetails.setItemsAndRefresh(detailRows);
    activateInsertTab(MAINTABS.MOD);
    //displayInsertForm();
  });
}

/**
 * 製造リーフから外注見積依頼書を作成する
 * 明細行として、指定リーフの製造製品を転記する
 */
function makeOOEFromLP() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgFromHeader = editPGs.pgLP.h;
  var pgFrom = editPGs.pgLP.d;
  var pgHeader = editPGs.pgOOED.h;
  var pgDetails = editPGs.pgOOED.d;
  var activeRowFrom = pgFrom.getActiveRow();
  if (!activeRowFrom) {
    window.alert('外注注文書を発行する行を選択してください。');
    return;
  }
  if (IsDirtyCheck(editPGs.pgLP.d)) {
    window.alert('編集中のデータを保存してから、外注見積依頼書作成して下さい。');
    return;
  }
  ajaxSearchData('searchED', activeRowFrom, function (resp) {
    /** @type {Array} */
    var items = resp['results'];
    if (items.length <= 0) {
      if (window.confirm('指定された行に対応する見積明細データが存在しませんが、転記を行いますか？') === false) {
        return;
      }
      items.push({});
    }
    // 選択された見積書の内容を転記
    if (window.confirm('指定行を編集中画面に追記して作成しますか？\n[キャンセル]を選択した場合、指定行のデータから新規作成します。') === false) {
      clearRows(pgHeader);
      clearRows(pgDetails);
    }
    var headerRow = makeNewRowObj([]);
    var detailRows = pgDetails.dataView.getItems();
    var detailRow = makeNewRowObj(detailRows);
    headerRow['OOE_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['OOE_ESTIMATE_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['OOE_SALESMAN_CD'] = nullToStr(items[0]['ED_SALESMAN_CD']);
    //detailRow['OOED_ORDER_NO'] = nullToStr(items[0]['']);
    //detailRow['OOED_STATEMENT_DETAILS_NO'] = nullToStr(items[0]['']);
    detailRow['OOED_ARTICLE_NAME'] = activeRowFrom['p_name']; //nullToStr(items[0]['ED_ARTICLE_NAME']);
    detailRow['OOED_ORDER_QUANTITY'] = Number(activeRowFrom['l_amount']); //nullToStr(items[0]['ED_PRODUCTS_NO']);
    detailRow['OOED_UNITPRICE'] = '0';
    detailRow['OOED_MONEY'] = ''; //nullToStr(items[0]['OOED_ORDER_QUANNTITY'] * nullToStr(items[0]['OOED_UNITPRICE'];
    //detailRow['OOED_ARRIVALDAY'] = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']).slice(0, 10) : '';
    //detailRow['OOED_SEAL'] = nullToStr(items[0]['']);
    detailRow['OOED_HOPE_DELIVERY_DATE'] = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']).slice(0, 10) : '';
    detailRow['OOED_CUSTOMER_ID'] = nullToStr(items[0]['ED_CUSTOMER_ID']);
    detailRow['OOED_CUSTOMER_CD'] = nullToStr(items[0]['ED_CUSTOMER_CD']);
    detailRow['OOED_CUSTOMER_POST_ID'] = nullToStr(items[0]['ED_CUSTOMER_POST_ID']);
    detailRow['OOED_ESTIMATE_DATE'] = nullToStr(items[0]['ED_ESTIMATE_DATE']);
    detailRow['OOED_SALESMAN_ID'] = nullToStr(items[0]['ED_SALESMAN_ID']);
    detailRow['OOED_SALESMAN_CD'] = nullToStr(items[0]['ED_SALESMAN_CD']);
    detailRow['OOED_ESTIMATE_SEQ_NO'] = nullToStr(items[0]['ED_ESTIMATE_SEQ_NO']);
    detailRow['OOED_ESTIMATE_VER'] = nullToStr(items[0]['ED_ESTIMATE_VER']);
    detailRow['OOED_ESTIMATE_DETAILS_NO'] = nullToStr(items[0]['ED_ESTIMATE_DETAILS_NO']);
    //detailRow['OOED_LEAF_SEQ_NO'] = nullToStr(items[0]['']);
    //detailRow['OOED_LEAF_VER'] = nullToStr(items[0]['']);
    //detailRow['OOED_PROCESS_NO'] = nullToStr(items[0]['']);
    //detailRow['OOED_PROCESS_CD'] = nullToStr(items[0]['']);
    //detailRow['OOED_PROCESS_ID'] = nullToStr(items[0]['']);
    //detailRow['OOED_WORK_NAME'] = nullToStr(items[0]['']);
    detailRows.push(detailRow);
    // グリッドにデータを設定して再描画
    pgHeader.setItemsAndRefresh([headerRow]);
    pgDetails.setItemsAndRefresh(detailRows);
    activateInsertTab(MAINTABS.OOED);
    //displayInsertForm();
  });
}

/**
 * 製造リーフから外注注文書を作成する
 * 明細行として、指定リーフの製造製品を転記する
 */
function makeOOFromLP() {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var pgFromHeader = editPGs.pgLP.h;
  var pgFrom = editPGs.pgLP.d;
  var pgHeader = editPGs.pgOOD.h;
  var pgDetails = editPGs.pgOOD.d;
  var activeRowFrom = pgFrom.getActiveRow();
  if (!activeRowFrom) {
    window.alert('外注注文書を発行する行を選択してください。');
    return;
  }
  if (IsDirtyCheck(editPGs.pgLP.d)) {
    window.alert('編集中のデータを保存してから、外注注文書作成して下さい。');
    return;
  }
  ajaxSearchData('searchED', activeRowFrom, function (resp) {
    /** @type {Array} */
    var items = resp['results'];
    if (items.length <= 0) {
      if (window.confirm('指定された行に対応する見積明細データが存在しませんが、転記を行いますか？') === false) {
        return;
      }
      items.push({});
    }
    // 選択された見積書の内容を転記
    if (window.confirm('指定行を編集中画面に追記して作成しますか？\n[キャンセル]を選択した場合、指定行のデータから新規作成します。') === false) {
      clearRows(pgHeader);
      clearRows(pgDetails);
    }
    var headerRow = makeNewRowObj([]);
    var detailRows = pgDetails.dataView.getItems();
    var detailRow = makeNewRowObj(detailRows);
    headerRow['OO_CREATION_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['OO_ESTIMATE_DATE'] = $['datepicker']['formatDate']('yy-mm-dd', new Date());
    headerRow['OO_SALESMAN_CD'] = nullToStr(items[0]['ED_SALESMAN_CD']);
    //detailRow['OOD_ORDER_NO'] = nullToStr(items[0]['']);
    //detailRow['OOD_STATEMENT_DETAILS_NO'] = nullToStr(items[0]['']);
    detailRow['OOD_ARTICLE_NAME'] = activeRowFrom['p_name']; //nullToStr(items[0]['ED_ARTICLE_NAME']);
    detailRow['OOD_ORDER_QUANTITY'] = Number(activeRowFrom['l_amount']); //nullToStr(items[0]['ED_PRODUCTS_NO']);
    detailRow['OOD_UNITPRICE'] = '0';
    detailRow['OOD_MONEY'] = ''; //nullToStr(items[0]['OOD_ORDER_QUANNTITY'] * nullToStr(items[0]['OOD_UNITPRICE'];
    //detailRow['OOD_ARRIVALDAY'] = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']).slice(0, 10) : '';
    //detailRow['OOD_SEAL'] = nullToStr(items[0]['']);
    detailRow['OOD_HOPE_DELIVERY_DATE'] = activeRowFrom['l_start_plan'] ? String(activeRowFrom['l_start_plan']).slice(0, 10) : '';
    detailRow['OOD_CUSTOMER_ID'] = nullToStr(items[0]['ED_CUSTOMER_ID']);
    detailRow['OOD_CUSTOMER_CD'] = nullToStr(items[0]['ED_CUSTOMER_CD']);
    detailRow['OOD_CUSTOMER_POST_ID'] = nullToStr(items[0]['ED_CUSTOMER_POST_ID']);
    detailRow['OOD_ESTIMATE_DATE'] = nullToStr(items[0]['ED_ESTIMATE_DATE']);
    detailRow['OOD_SALESMAN_ID'] = nullToStr(items[0]['ED_SALESMAN_ID']);
    detailRow['OOD_SALESMAN_CD'] = nullToStr(items[0]['ED_SALESMAN_CD']);
    detailRow['OOD_ESTIMATE_SEQ_NO'] = nullToStr(items[0]['ED_ESTIMATE_SEQ_NO']);
    detailRow['OOD_ESTIMATE_VER'] = nullToStr(items[0]['ED_ESTIMATE_VER']);
    detailRow['OOD_ESTIMATE_DETAILS_NO'] = nullToStr(items[0]['ED_ESTIMATE_DETAILS_NO']);
    //detailRow['OOD_LEAF_SEQ_NO'] = nullToStr(items[0]['']);
    //detailRow['OOD_LEAF_VER'] = nullToStr(items[0]['']);
    //detailRow['OOD_PROCESS_NO'] = nullToStr(items[0]['']);
    //detailRow['OOD_PROCESS_CD'] = nullToStr(items[0]['']);
    //detailRow['OOD_PROCESS_ID'] = nullToStr(items[0]['']);
    //detailRow['OOD_WORK_NAME'] = nullToStr(items[0]['']);
    detailRows.push(detailRow);
    // グリッドにデータを設定して再描画
    pgHeader.setItemsAndRefresh([headerRow]);
    pgDetails.setItemsAndRefresh(detailRows);
    activateInsertTab(MAINTABS.OOD);
    //displayInsertForm();
  });
}


/**
 * 該当登録データが編集中かチェック
 */
function IsDirtyCheck(editPGsName) {
  let cnt = editPGsName.dataView.getItems().length;
  let editArray = editPGsName.dataView.getItem;
  for (var i = 0; i < cnt; i++) {
    if (editArray(i)['isDirty'] === true) {
      return true;
    }
  }
  return false;
}

/**
 * 納品書タイプ選択
 * 0:納品書A 1:納品書B
 */
function IsPrintReceipt() {
  let header = editPGs.pgSD.h.dataView.getItems();
  let IsPrint = '0';
  IsPrint = header[0]['s_print'];
  if (IsPrint === '0') {
    return 'A';
  } else {  
    return 'B';
  }
}

/**
 * 日付フォーマット変更(/を含む年月日文字列のフォーマットを変換)
 */
function dateFormat(dtStr) {
  let dt = new Date(dtStr);
  let y = dt.getFullYear();
  let m = ("00" + (dt.getMonth()+1)).slice(-2);
  let d = ("00" + dt.getDate()).slice(-2);
  let result = y + "-" + m + "-" + d;
  return result;
}

/***
 * 金網製造指示画面表示
 */
function showCalcProdplanDlg() {
  let arGroup = [];
  // 製造指示データから取得
  let pgHeader = editPGs.pgProdplans.h.dataView.getItems();
  let pgDetail = editPGs.pgProdplans.d.dataView.getItems();
  let arDetailD1Rows = calcPGs.pgProdMold.d1.dataView.getItems();
  let arDetailD2Rows = calcPGs.pgProdMold.d2.dataView.getItems();

  let arHeader01 = makeNewRowObj([]);
  let arHeader02 = makeNewRowObj([]);

  if (IsDirtyCheck(editPGs.pgProdplans.h) || IsDirtyCheck(editPGs.pgProdplans.d)) {
    alert('編集中のデータを保存してから金網製造指示画面へ進んでください。');
    return;
  }

  arGroup = countPGRecord(pgDetail, 'pd_disp_order');
  if (arGroup.length <= 0) {
    alert('グループを設定してから、金網製造指示へ進んでください。');
    return;
  }
  if (!validateSelectedSameProdplanRows(arGroup)) {
    // 基本的には、見積データから製造指示データ作成時にチェックしているはずなので、ここには入らないはず。
    alert('同じ規格の製品のみ、同一グループで選択可能です。');
    return;
  }

  // 前回データクリア
  clearRows(calcPGs.pgProdMold.h1);
  clearRows(calcPGs.pgProdMold.h2);
  clearRows(calcPGs.pgProdMold.d1);
  clearRows(calcPGs.pgProdMold.d2);

  // データ取得&データセット
  readProdPlansWire(pgHeader).done((data) => {
    if (data.length > 0) {
      let objs = data;
      // 既存
      calcPGs.pgProdMold.columns.forEach(function (col) {
        // 主キーの前回値を代入
        if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK']) {
          objs.forEach(function (elem) {
            elem[col['id'] + '_PREVVAL'] = elem[col['id']];
          });
        }
      });
      
      let arHeader01 = makeNewRowObj([]);
      let arHeader02 = makeNewRowObj([]);
      let arDetailRow01 = calcPGs.pgProdMold.d1.dataView.getItems();
      let arDetailRow02 = calcPGs.pgProdMold.d2.dataView.getItems();
    
      setCalcProdplanData(objs, arHeader01, arHeader02, arDetailRow01, arDetailRow02);
    
      calcPGs.pgProdMold.h1.setItemsAndRefresh([arHeader01]);
      calcPGs.pgProdMold.h2.setItemsAndRefresh([arHeader02]);
      calcPGs.pgProdMold.d1.setItemsAndRefresh(arDetailRow01);
      calcPGs.pgProdMold.d2.setItemsAndRefresh(arDetailRow02);
      $('#dialog-calc-prodplan')['dialog']('open');

    }

  });
}

/***
 * 金網製造指示画面にデータをセットする。
 */
function setCalcProdplanData(dat, arHeader01, arHeader02, arDetailRow01, arDetailRow02) {

  let nSumCost = 0;
  let nSumQty = 0;
  let nSumDimension = 0;
  let val = 0;

  if (!dat) { return; }

  arHeader01['pp_p_cd'] = dat[0]['pp_p_cd'];
  arHeader01['pp_p_material'] = dat[0]['pp_p_material'];
  arHeader01['pp_p_weave'] = dat[0]['pp_p_weave'];
  arHeader01['pp_bump_num'] = dat[0]['pp_bump_num'];
  arHeader01['pp_spec'] = dat[0]['pp_spec'];
  arHeader01['pp_ed_sub_01'] = dat[0]['pp_ed_sub_01'];
  arHeader01['pp_ed_sub_02'] = dat[0]['pp_ed_sub_02'];
  arHeader01['pp_ed_sub_04'] = dat[0]['pp_ed_sub_04'];
  arHeader01['pp_ed_sub_05'] = dat[0]['pp_ed_sub_05'];
  arHeader01['pp_ed_sub_06'] = dat[0]['pp_ed_sub_06'];
  arHeader01['pp_depth_01'] = dat[0]['pp_depth_01'];
  arHeader01['pp_depth_02'] = dat[0]['pp_depth_02'];
  arHeader01['pp_prod_plan_no'] = dat[0]['pp_prod_plan_no'];
  arHeader01['pp_mold_01'] = dat[0]['pp_mold_01'];
  arHeader01['ml_gear_num_01'] = dat[0]['ml_gear_num_01'];
  arHeader01['ml_pitch_01'] = dat[0]['ml_pitch_01'];
  arHeader01['ml_apply_01'] = dat[0]['ml_apply_01'];
  arHeader01['ml_pitch_factor_01'] = dat[0]['ml_pitch_factor_01'];
  arHeader01['pp_mold_02'] = dat[0]['pp_mold_02'];
  arHeader01['ml_gear_num_02'] = dat[0]['ml_gear_num_02'];
  arHeader01['ml_pitch_02'] = dat[0]['ml_pitch_02'];
  arHeader01['ml_apply_02'] = dat[0]['ml_apply_02'];
  arHeader01['ml_pitch_factor_02'] = dat[0]['ml_pitch_factor_02'];

  // // ロス率は総面積と総枚数を参照するので後に回す
  let weight = 0;
  if (isSet(dat[0]['pp_weight'])) { 
    weight = WSUtils.decFloor(dat[0]['pp_weight'], 0);
  } 
  arHeader01['pp_weight'] = weight;
  arHeader01['pp_weave_cd'] = dat[0]['pp_weave_cd'];         
  arHeader01['pp_gari_cd'] = dat[0]['pp_gari_cd'];
  arHeader01['pp_loss_rate'] = dat[0]['pp_loss_rate'];  
  
  arHeader02['pp_recalc_sign'] = '1';
  arHeader02['pp_left'] = dat[0]['pp_left'];
  arHeader02['pp_weave_cnt'] = dat[0]['pp_weave_cnt'];
  arHeader02['pp_right'] = dat[0]['pp_right'];
  arHeader02['pp_rate'] = dat[0]['pp_rate'];
  arHeader02['pp_cam'] = dat[0]['pp_cam'];
  arHeader02['pp_ins_level'] = dat[0]['pp_ins_level'];
  arHeader02['pp_transfer_day'] = dat[0]['pp_transfer_day'];
  arHeader02['pp_packing_day'] = dat[0]['pp_packing_day'];
  arHeader02['pp_purchase_cd'] = dat[0]['pp_purchase_cd'];
  arHeader02['pp_purchase_name'] = dat[0]['pp_purchase_name'];
  arHeader02['pp_material_cd_01'] = dat[0]['pp_material_cd_01'];
  arHeader02['pp_material_name_01'] = dat[0]['pp_material_name_01'];
  arHeader02['pp_raw_material_01'] = dat[0]['pp_raw_material_01'];
  arHeader02['pp_material_cd_02'] = dat[0]['pp_material_cd_02'];
  arHeader02['pp_material_name_02'] = dat[0]['pp_material_name_02'];
  arHeader02['pp_raw_material_02'] = dat[0]['pp_raw_material_02'];
  // arH2['pp_sum_plan_cost'] = data[0]['pp_sum_plan_cost'];
  arHeader02['pp_area_cost'] = dat[0]['pp_area_cost'];
  arHeader02['pp_proc_time_01'] = dat[0]['pp_proc_time_01'];
  arHeader02['pp_proc_time_02'] = dat[0]['pp_proc_time_02'];
  arHeader02['pp_proc_time_03'] = dat[0]['pp_proc_time_03'];
  arHeader02['pp_proc_time_04'] = dat[0]['pp_proc_time_04'];
  arHeader02['pp_proc_time_05'] = dat[0]['pp_proc_time_05'];
  arHeader02['pp_proc_time_06'] = dat[0]['pp_proc_time_06'];

  // 工程ごとのデータに分離
  let detail01Data = dat.filter((row) => {
    return row['pw_process_cd'] === '24';
  });
  
  let detail02Data = dat.filter((row) => {
    return row['pw_process_cd'] === '20';
  });

  
  for (let j = 0; j < detail01Data.length; j++) {
    nSumDimension += WSUtils.decFloor(detail01Data[j]['pw_dimension'] * detail01Data[j]['pw_quantity'], 2);
    nSumCost += WSUtils.decFloor(detail01Data[j]['pd_material_unit_cost'], 0);
    nSumQty += WSUtils.decFloor(detail01Data[j]['pw_quantity'], 0);
  }
  
  // DBにデータを持たないカラム
  arHeader02['pp_sum_plan_cost'] = nSumCost;
  arHeader01['pp_sum_sheets'] = nSumQty;
  arHeader01['pp_dimension'] = nSumDimension;

  for (let i = 0; i < detail01Data.length; i++) {
    let detailRow = makeNewRowObj(arDetailRow01);

    detailRow['pw_group_sign'] = detail01Data[i]['pw_disp_num'];
    detailRow['pw_prod_plan_sub_no'] = detail01Data[i]['pw_prod_plan_sub_no'];
    detailRow['pw_ed_sub_08'] = detail01Data[i]['pw_ed_sub_08'];
    detailRow['pw_ed_sub_09'] = detail01Data[i]['pw_ed_sub_09'];

    detailRow['pw_dimension'] = WSUtils.toPadDecStr(Number(detail01Data[i]['pw_dimension']), 2);
    detailRow['pw_estimate_no'] = detail01Data[i]['pw_estimate_no'];
    detailRow['pw_estimate_sub_no'] = detail01Data[i]['pw_estimate_sub_no'];
    detailRow['pw_finish_plan_date'] = detail01Data[i]['pw_finish_plan_date'];
    detailRow['pw_quantity'] = detail01Data[i]['pw_quantity'];        
    detailRow['pp_unit'] = detail01Data[i]['pp_unit'];
    detailRow['pw_ins_qty'] = detail01Data[i]['pw_ins_qty'];
    val = 0;
    val = (WSUtils.decFloor(detail01Data[i]['pw_dimension'], 2) * WSUtils.decFloor(detail01Data[i]['pw_quantity'], 2));
    val = WSUtils.decRound(val, 2);
    detailRow['pw_calc_dimension'] = WSUtils.toPadDecStr(val, 2);
    detailRow['pp_shipment_cd'] = detail01Data[i]['pp_shipment_cd'];
    detailRow['pp_delivery_cd'] = detail01Data[i]['pp_delivery_cd'];
    detailRow['pw_width_size'] = detail01Data[i]['pw_ed_sub_08']
    detailRow['pw_side_num'] = detail01Data[i]['pw_side_num'];
    detailRow['pw_vertical_size'] = detail01Data[i]['pw_ed_sub_09'];
    detailRow['pw_sheets_num'] = Number(detail01Data[i]['pw_sheets_num']);
    detailRow['pw_side_count'] = detail01Data[i]['pp_result_num'];
    detailRow['pw_chain_num'] = detail01Data[i]['pw_chain_num'];
    detailRow['pw_group_sign'] = detail01Data[i]['pw_group_sign'];
    arDetailRow01.push(detailRow);
  }



  for (let j = 0; j < detail02Data.length; j++) {
    let detailRow = makeNewRowObj(arDetailRow02);

    detailRow['pw_group_sign'] = detail02Data[j]['pw_disp_num'];
    detailRow['pw_g_size_side'] = detail02Data[j]['pw_width_size'];
    detailRow['pw_g_size'] = detail02Data[j]['pw_result_size'];
    detailRow['pw_g_vert'] = WSUtils.decFloor(detail02Data[j]['pw_vertical_size'], 0);
    detailRow['pw_g_num'] = detail02Data[j]['pw_sheets_num'];
    detailRow['pw_g_ch_result'] = detail02Data[j]['pw_chain_num'];
    detailRow['pw_g_sheets_result'] = Number(detail02Data[j]['pw_vert_num']);
    detailRow['pw_prod_remark'] = detail02Data[j]['pw_g_remark'];
    val = 0;
    val = Number(detailRow['pw_g_size_side']) / (Number(arHeader01['pp_ed_sub_01']) + Number(arHeader01['pp_ed_sub_04']));
    val = WSUtils.decFloor(val,2);
    detailRow['pw_g_sheets_calc'] = WSUtils.toPadDecStr(val, 2);
    detailRow['pw_g_sheets_result'] = WSUtils.decFloor(val, 0);
    arDetailRow02.push(detailRow);
  }

}


/**
 * 検収報告　mode：1が検収報告   0が検収取消
 */
function acceptanceReport(pg, mode) {
  // チェックが入っているレコード取得
  let activeRows = [];
  // let rowsData = pg.dataView.getItems();
  let rowsData = pg.grid.getData().getFilteredItems();
  let nIndex = pg.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  });
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRows.push(rowsData[nIndex[i]]);
  }
  if (activeRows.length <= 0) {
    if (mode === 0) {
      window.alert('検収取消するデータにチェックを入れてください');
    } else {
      window.alert('検収報告を上げるデータにチェックを入れてください');
    }
    return;
  }
  // 検収報告時のデータチェック
  if (mode === 1) {
    for (let i = 0; i < activeRows.length; i++) {
      if(!isSet(activeRows[i]['moed_arrival_hd_date'])) {
        alert('入荷予定日を入力してください。');
        return;
      }
    }
  } else {
    // 検収取消時のデータチェック
    for (let i = 0; i < activeRows.length; i++) {
      if(!isSet(activeRows[i]['moed_accept_date'])) {
        alert('未検収のデータです。');
        return;
      }
      if (activeRows[i]['moed_pay_type'] > 0) {
        alert('支払済みのデータは、検収取消できません。');
        return;
      }
    }
  }
  ajaxUpdateMODAccept(activeRows, mode).then( function (data, jqXHR, textStatus ) {
    // console.log(data);
    if (data['succeed'] === true) {
      alert('登録が完了しました。');
      // 一覧更新
      if (pg.divId === 'OOD') {
        readdata(mainPGs.pgOOD);
      } else {
        readdata(mainPGs.pgMOD);
      }
    } else {
      alert('登録に失敗しました。');
    }
  });
}


function showSubStockDlg(pgHeader, pgDetail) {
  // 見積データ取得
  let pgOrgHeader = pgHeader.dataView.getItems();
  let pgOrgDetail = pgDetail.dataView.getItems();

  let arData = [];
  for (let i = 0; i < 10; i++) {
    arData[i] = {
      id: 'id_' + i,
      sp_place_cd: 'sp_place_cd',
      sp_place_name: 'sp_place_name',
      sp_type_04: 'sp_type_04',
      sp_report_date: 'sp_report_date',
      stock_num: 'stock_num',
      sp_unit: 'sp_unit',
      ship_sub_no: 'ship_sub_no',
      attract_num: 'attract_num',
    };    
  }

  let columns = [
    { id: 'sp_place_cd', name: '場所', field: 'sp_place_cd',  width: 120,},
    { id: 'sp_place_name', name: '場所名', field: 'sp_place_name',  width: 120,},
    { id: 'sp_type_04', name: 'ロットNo', field: 'sp_type_04',  width: 120,},
    { id: 'sp_report_date', name: '入荷日', field: 'sp_report_date',  width: 120,},
    { id: 'stock_num', name: '在庫数', field: 'stock_num',  width: 120,},
    { id: 'sp_unit', name: '単位', field: 'sp_unit',  width: 120,},
    { id: 'ship_sub_no', name: '出荷枝番', field: 'ship_sub_no',  width: 120,},
    { id: 'attract_num', name: '引当数', field: 'attract_num',  width: 120,},
  ];

  let options = {
    enableCellNavigation: true,
    enableColumnReorder: false
  }

  sgStock = new Slick.Grid("#subStock", arData, columns, options);

  $( "#dialog-sub-stock" ).dialog( "open" );
  // gridのサイズ調節
  let nW = $("#dialog-sub-stock").width();
  let nH = $("#dialog-sub-stock").height();
  $("#subStock").css('height', nH * (70 / 100));
  $("#subStock").css('width', nW * (90 / 100));
  
}


/**
 * 見積データから取得
 * @param {*} pgHeader 
 * @param {*} pgDetail 
 */
function showCalcEDDlg() {
  // 見積データを取得
  let pgOrgHeader = editPGs.pgED.h.dataView.getItems();
  let pgOrgDetail = editPGs.pgED.d.dataView.getItems();

  // rowのデータチェック
  let activeNum = 0;
  let ar = [];
  let prodcd = '';        // 品名CD
  let lengthVert1 = 0;    // 線径・サイズ① 
  let lengthSide1 = 0;    // 厚み①
  let lengthVert2 = 0;    // 線径・サイズ②
  let lengthSide2 = 0;    // 厚み②
  // let diameter = 0;       // 線径
  let pitch = 0;          // 目合タイプ
  let wireVert = 0;       // 目合①
  let wireSide = 0;       // 目合②
  let unit = 0;           // 目合単位
  let bRslt = true;
 
  if (IsDirtyCheck(editPGs.pgED.d) || IsDirtyCheck(editPGs.pgED.h)) {
    window.alert('編集中のデータを保存してから、見積計算に進んでください');
    return;
  }

  let activeRow = editPGs.pgED.d.getActiveRow();
  if (!isSet(activeRow)) {
    alert('見積計算を行う行を選択してください。');
    return;
  }
  activeNum = activeRow['calcno'];
  if (!isSet(activeNum)) {
    alert('見積計算番号が入力されているデータのみ見積計算の対象となります。')
    return;
  }

  // 見積計算番号毎にデータを分ける
  for (let i = 0; i < pgOrgDetail.length; i++ ) {
    if (activeNum === pgOrgDetail[i]['calcno']) {
      // 同じ計算番号のデータのみ取得
      ar.push(pgOrgDetail[i]);
    }
  }
  /***
   * データチェック
   * 製品CD～目合単位までで値が異なるレコードは同一見積計算番号の設定は不可
   */
  for (let i = 0; i < ar.length; i++) {
    if (i === 0) {
      prodcd = ar[i]['ed_p_cd'];
      lengthVert1 = ar[i]['ed_sub_01'];
      lengthSide1 = ar[i]['ed_sub_12'];
      lengthVert2 = ar[i]['ed_sub_02'];
      lengthSide2 = ar[i]['ed_sub_13'];
      pitch = ar[i]['ed_sub_03_str'];
      wireVert = ar[i]['ed_sub_04'];
      wireSide = ar[i]['ed_sub_05'];
      unit = ar[i]['ed_sub_06'];
    } else {  
      if (prodcd !== ar[i]['ed_p_cd']) {
        bRslt = false;
        break;
      }
      if (lengthVert1 !== ar[i]['ed_sub_01']) {
        bRslt = false;
        break;
      }
      if (lengthSide1 !== ar[i]['ed_sub_12']) {
        bRslt = false;
        break;
      }
      if (lengthVert2 !== ar[i]['ed_sub_02']) {
        bRslt = false;
        break;
      }
      if (lengthSide2 !== ar[i]['ed_sub_13']) {
        bRslt = false;
        break;
      }
      if (pitch !== ar[i]['ed_sub_03_str']) {
        bRslt = false;
        break;
      }
      if (wireVert !== ar[i]['ed_sub_04']) {
        bRslt = false;
        break;
      }
      if (wireSide !== ar[i]['ed_sub_05']) {
        bRslt = false;
        break;
      }
      if (unit !== ar[i]['ed_sub_06']) {
        bRslt = false;
        break;
      }
    }
  }
  if (!bRslt) {
    alert('製品CD、線径、目合が同一の行を選択してください。');
    return;
  }

  readDataEDCalc(calcPGs.pgEDCalc, activeRow).done(function(data, textStatus, jqXHR) {
    var i = 0;
    if (data.length > 0) {
      // 長さ（正味、ロス含む）の合計用

      var length1NetSum = 0;
      var length2NetSum = 0;
      var length1LossSum = 0;
      var length2LossSum = 0;
      var length3LossSum = 0;
      let sumSheet = 0;
      let sumArea  = 0;
      let sumLossArea = 0;
      // let sumWeight01 = 0;   // 
      // let sumWeight02 = 0;   // 
      let weight01 = 0; // 線径1側比重(本当の比重)       
      let weight02 = 0; // 線径2側比重(本当の比重)
      data.forEach(function (elem) {
        // if ('ecd_net_area' in elem) { 
        //   sumArea += Number(elem['ecd_net_area']);
        // }
        // if ('ecd_quantity' in elem) {
        //   sumSheet += Number(elem['ecd_quantity']);
        // }
        elem['id'] = i++;
        // belong_cdの前回値付加 
        if ('ec_belong_cd' in elem) {
          elem['ec_belong_cd_PREVVAL'] = elem['ec_belong_cd'];
        }
        if ('ecd_belong_cd' in elem) {
          elem['ecd_belong_cd_PREVVAL'] = elem['ecd_belong_cd'];
        }

        
        // エラー回避のため、値無しの場合0を設定
        elem['ec_ed_sub_01'] = isSet(elem['ec_ed_sub_01']) ? elem['ec_ed_sub_01'] : 0;
        elem['ec_ed_sub_02'] = isSet(elem['ec_ed_sub_02']) ? elem['ec_ed_sub_02'] : 0;
        elem['ec_ed_sub_04'] = isSet(elem['ec_ed_sub_04']) ? elem['ec_ed_sub_04'] : 0;
        elem['ec_ed_sub_05'] = isSet(elem['ec_ed_sub_05']) ? elem['ec_ed_sub_05'] : 0;
        elem['ecd_ed_sub_08'] = isSet(elem['ecd_ed_sub_08']) ? elem['ecd_ed_sub_08'] : 0;
        elem['ecd_ed_sub_09'] = isSet(elem['ecd_ed_sub_09']) ? elem['ecd_ed_sub_09'] : 0;
        elem['ecd_ed_sub_10'] = isSet(elem['ecd_ed_sub_10']) ? elem['ecd_ed_sub_10'] : 0;
        elem['ecd_ed_sub_11'] = isSet(elem['ecd_ed_sub_11']) ? elem['ecd_ed_sub_11'] : 0;
        elem['ecd_sub_14'] = isSet(elem['ecd_sub_14']) ? elem['ecd_sub_14'] : 0;
        elem['ecd_quantity'] = isSet(elem['ecd_quantity']) ? elem['ecd_quantity'] : 0;
        elem['ecd_net_area'] = isSet(elem['ecd_net_area']) ? elem['ecd_net_area'] : 0;
        elem['ecd_loss_area'] = isSet(elem['ec_loss_area']) ? elem['ec_loss_area'] : 0;
  
        // 正味平方
        elem['ecd_net_area'] = WSUtils.decCeil((elem['ecd_ed_sub_08'] * elem['ecd_ed_sub_09']) * (10 ** (-6)) * elem['ecd_quantity'], 2);
        
        // ロス含む平方
        let value = ((parseFloat(elem['ecd_ed_sub_08']) + parseFloat(elem['ecd_ed_sub_10'])) *
          (parseFloat(elem['ecd_ed_sub_09']) + parseFloat(elem['ecd_ed_sub_11'])) * (10 ** (-6)) * elem['ecd_quantity']) +
          ((parseFloat(elem['ecd_ed_sub_08']) + parseFloat(elem['ecd_ed_sub_10'])) * (10 ** (-6)) * 
          parseFloat(elem['ecd_ed_sub_11']) / 2);
        elem['ecd_loss_area'] = WSUtils.decCeil(value, 2);

        // 縮み倍率1（今後マスタから取得予定のため、一旦は固定値を設定）
        elem['shrink_mag_1'] = 1.25;

        // 縮み倍率2（今後マスタから取得予定のため、一旦は固定値を設定）
        elem['shrink_mag_2'] = 1.25;

        // 本数1(正味)
        elem['number_1_net'] = Math.floor(parseFloat(elem['ecd_ed_sub_09']) / (parseFloat(elem['ec_ed_sub_02']) + parseFloat(elem['ec_ed_sub_05'])) + 1);

        // 本数2(正味)
        elem['number_2_net'] = Math.floor(parseFloat(elem['ecd_ed_sub_08']) / (parseFloat(elem['ec_ed_sub_01']) + parseFloat(elem['ec_ed_sub_04'])) + 1);

        // 長さ1(正味)
        elem['length_1_net'] = parseFloat(elem['ecd_ed_sub_08']) * elem['number_1_net'] * parseInt(elem['ecd_quantity']) * elem['shrink_mag_1'];

        // 長さ2(正味)
        elem['length_2_net'] = parseFloat(elem['ecd_ed_sub_09']) * elem['number_2_net'] * parseInt(elem['ecd_quantity']) * elem['shrink_mag_2'];

        // 本数1(ロス含む)
        elem['number_1_loss'] = Math.floor((parseFloat(elem['ecd_ed_sub_09']) + parseInt(elem['ecd_ed_sub_11'])) / (parseFloat(elem['ec_ed_sub_02']) + parseFloat(elem['ec_ed_sub_05'])));

        // 本数2(ロス含む)
        elem['number_2_loss'] = Math.floor((parseFloat(elem['ecd_ed_sub_08']) + parseInt(elem['ecd_ed_sub_10'])) / (parseFloat(elem['ec_ed_sub_01']) + parseFloat(elem['ec_ed_sub_04'])));

        // 長さ1(ロス含む)
        elem['length_1_loss'] = (parseFloat(elem['ecd_ed_sub_08']) + parseInt(elem['ecd_ed_sub_10'])) * elem['number_1_loss'] * parseInt(elem['ecd_quantity']) * elem['shrink_mag_1'];

        // 長さ2(ロス含む)
        elem['length_2_loss'] = (parseFloat(elem['ecd_ed_sub_09']) + parseInt(elem['ecd_ed_sub_11'])) * elem['number_2_loss'] * parseInt(elem['ecd_quantity']) * elem['shrink_mag_2'];

        // 長さ3(ロス含む)
        elem['length_3_loss'] = parseFloat(elem['ecd_sub_14']) * elem['number_2_loss'] * elem['shrink_mag_2'];

        // 長さ1合計(正味)
        length1NetSum += elem['length_1_net'];

        // 長さ2合計(正味)
        length2NetSum += elem['length_2_net'];

        // 長さ1合計(正味)
        length1LossSum += elem['length_1_loss'];

        // 長さ2合計(ロス含む)
        length2LossSum += elem['length_2_loss'];

        // 長さ3合計(ロス含む)
        length3LossSum += elem['length_3_loss'];

        // 正味㎡
        sumArea += Number(elem['ecd_net_area']);
        sumLossArea += Number(elem['ecd_loss_area']);
        // 合計枚数
        sumSheet += Number(elem['ecd_quantity']);
        
        weight01 = elem['wm_weight_01'];
        weight02 = elem['wm_weight_02'];
        
      });
      // 長さ合計(正味、ロス含む)を設定
      data[0]['length_1_net_sum'] = length1NetSum;
      data[0]['length_2_net_sum'] = length2NetSum;
      data[0]['length_1_loss_sum'] = length1LossSum;
      data[0]['length_2_loss_sum'] = length2LossSum;
      data[0]['length_3_loss_sum'] = length3LossSum;

      // ロス含重量(従)はpg.js 434行目で定義　ロス率により可変のため
      data[0]['ec_calc_area'] = Math.round(sumArea * 100) / 100;
      data[0]['ec_loss_area'] = Math.round(sumLossArea * 100) / 100;
      data[0]['ec_sum_sheet'] = sumSheet;
      // ロス含重量(詳)
      data[0]['ec_loss_weight_02'] = (data[0]['ec_ed_sub_01'] / 2) * (data[0]['ec_ed_sub_01'] / 2) * Math.PI * data[0]['length_1_loss_sum'] / Math.pow(10, 6) * data[0]['m_s_gravity'];
      data[0]['ec_loss_weight_02'] += (data[0]['ec_ed_sub_02'] / 2) * (data[0]['ec_ed_sub_02'] / 2) * Math.PI * data[0]['length_2_loss_sum'] / Math.pow(10, 6) * data[0]['m_s_gravity'];
      data[0]['ec_loss_weight_02'] += (data[0]['ec_ed_sub_02'] / 2) * (data[0]['ec_ed_sub_02'] / 2) * Math.PI * data[0]['length_3_loss_sum'] / Math.pow(10, 6) * data[0]['m_s_gravity'];
      data[0]['ec_loss_weight_02'] = WSUtils.decCeil(WSUtils.decCeil(data[0]['ec_loss_weight_02'], 3) * (data[0]['ec_loss_rate'] / 100), data[0]['ec_w_digits']);

      // 正味重量(従来)
      data[0]['ec_calc_weight_01'] = WSUtils.toPadDecStr(WSUtils.decCeil(data[0]['ec_calc_area'] * data[0]['ec_area_weight'], 0), 1);
      // 正味重量(詳細)
      let val = data[0]['ec_ed_sub_01'] / 2 * data[0]['ec_ed_sub_01'] / 2 * Math.PI * data[0]['length_1_net_sum'] / Math.pow(10, 6) * data[0]['m_s_gravity']; 
      let val2 = data[0]['ec_ed_sub_02'] / 2 * data[0]['ec_ed_sub_02'] / 2 * Math.PI * data[0]['length_2_net_sum'] / Math.pow(10, 6) * data[0]['m_s_gravity']; 
      data[0]['ec_calc_weight_02'] = WSUtils.toPadDecStr(WSUtils.decCeil(val + val2, 3), 1);

      
      calcPGs.pgEDCalc.columns.forEach(function (col) {
        // 主キーの前回値を代入
        if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK'] || col['isHeader']) {
          data.forEach(function (elem) {
            elem[col['id'] + '_PREVVAL'] = elem[col['id']];
          });
        }
        // Decimal型の場合、StringからNumberに変換する
        if (col['coltype'] === 'decimal') {
          var numcol = col['id'];
          data.forEach(function (elem) {
            elem[numcol] = Number(elem[numcol]);
          });
        }
      });
      if (data.length > 0) {
        let obj = [];
        obj.push(data[0]);
        // obj[0]['ec_calc_area'] = Math.round(sumArea * 100) / 100;
        // obj[0]['ec_sum_sheet'] = sumSheet;
        calcPGs.pgEDCalc.h1.setItemsAndRefresh(obj);
        calcPGs.pgEDCalc.d1.setItemsAndRefresh(data);
        calcPGs.pgEDCalc.h2.setItemsAndRefresh(obj);
        $('#dialog-calc-estimate')['dialog']('open');
      }
    }
  });
}

/**
 *
 * @param {Object} header1Data ヘッダー1行目データ
 * @param {Object} header2Data ヘッダー2行目データ
 * @return {Object} 計算結果
 */
function calcWageAndMaterialCost(header1Data, header2Data) {
  var result = {
    wage: 0,
    materialCost: 0
  };

  var wage = isSet(header2Data['ec_wage']) ? header2Data['ec_wage'] : 0;
  var materialUnitCost = isSet(header2Data['ec_material_unit_cost']) ? header2Data['ec_material_unit_cost'] : 0;
  // 算出値選択の判定「0:従来 or 1:詳細」
  if (header2Data['ec_reserve_01'] === '0') {
    result.wage = wage * header1Data['ec_loss_weight'];
    result.materialCost = materialUnitCost * header1Data['ec_loss_weight'];

  } else if (header2Data['ec_reserve_01'] === '1') {
    result.wage = wage * header1Data['ec_loss_weight_02'];
    result.materialCost = materialUnitCost * header1Data['ec_loss_weight_02'];
  }

  return result;
}

function showSubProductDlg() {
  // マスタデータ読込
  let ar = master['product'];
  // 現在のデータ取得 key除いて実際のデータ取得
  let arData = [];
  let arr = Object.values(ar);
  let j = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]['p_type_04'] === '1') {
      // 重点品名コードのみ対象
      arData[j] = arr[i];
      j++;
    }
  }
  let columns = [
    { id: 'p_cd', name: '品名CD', field: 'p_cd', width: 150,},
    { id: 'p_name', name: '品名', field: 'p_name',  width: 300,},
  ];

  let options = {
    enableCellNavigation: true,
    enableColumnReorder: false
  };
  brProductPGs = new Slick.Grid("#brProduct", arData, columns, options);
  
  $( "#dialog-br-product" ).dialog( "open" );
  // gridのサイズ調節
  let nW = $("#dialog-br-product").width();
  let nH = $("#dialog-br-product").height();
  $("#brProduct").css('height', nH * (70 / 100));
  $("#brProduct").css('width', nW * (90 / 100));
}

/***
 * 重点品名画面の選択行取得
 */
function getSubGridRow() {
  let activeCell = brProductPGs.getActiveCell();
  if (!isSet(activeCell)) {
    return '';
  }
  return brProductPGs.getDataItem(activeCell.row);
}

/***
 * 受注画面に選択した重点品名コードをセットする
 */
function setBrProductCD(pgDetail) {
  // 画面にセット
  let ar = editPGs.pgED.d.dataView.getItems();
  let activeRow = editPGs.pgED.d.getActiveRow();
  let arr = [];
  let nRowNum = 0;
  let j = 0;

  // どの行が対象か判断 未選択の場合は1行目をセット
  if (isSet(activeRow)) {
    nRowNum = ar.findIndex(item => item.id === activeRow.id);
  } else {
    nRowNum = 0;
  }
  
  // 選択した重点品名コードを取得
  let data = getSubGridRow();
  if (!isSet(data)) {
    return;
  }
  editPGs.pgED.d.dataView.getItems()[nRowNum]['ed_p_cd'] = data['p_cd'];
  editPGs.pgED.d.dataView.getItems()[nRowNum]['isDirty'] = true;
  editPGs.pgED.d.grid.invalidateRow(nRowNum);
  editPGs.pgED.d.grid.render();
}

/**
 * 出荷データ登録前チェック
 * @param {*} pgHeader 
 * @param {*} pgDetails 
 */
function checkBeforeUpdateSD(pgHeader, pgDetails) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let headerData = pgHeader.dataView.getItems();
  let detailData = pgDetails.dataView.getItems();
  let isDel = false;

  let result = [];
  result['success'] = true;
  result['mode'] = '';
  result['msg'] = '';
  
  for (let i = 0; i < detailData.length; i++) {

    if (isSet(detailData[i]['sd_bill_create_date']) ) {
      result['success'] = false;
      result['mode'] = 'shipflg';
      result['msg'] = 'すでに請求書発行しているため、編集できません。';
      return result;
    }

    // 納品確定していたらエラー
    if (detailData[i]['s_sales_sign'] === '1') {
      result['success'] = false; 
      result['mode'] = 'shipflg';
      result['msg'] = 'すでに納品確定しているため、編集できません。';
      return result;
    }
  }
  for (let i = 0; i < headerData.length; i++) {
    if (headerData[i]['isDeleted']) {
      isDel = 1;
    }
  }
  for (let i = 0; i < detailData.length; i++) {
    if (Number(detailData[i]['sd_qty_delivery']) > Number(detailData[i]['sd_estimate_quantity']) ) {
      if (result['msg'] === '') {
        result['msg'] += '受注枝番:' + detailData[i]['sd_estimate_sub_no'];
      } else {
        result['msg'] += '\n' + detailData[i]['sd_estimate_sub_no'];
      }
    }
  }
  if (result['msg'] !== '') {
    result['success'] = false; 
    result['mode'] = 'qty';
    result['msg'] = '下記枝番の納品数量が、受注数量を超えています。登録を続けますか。\n' + result['msg'];
    return result;
  }
  return result;
}

/**
 * 検収報告　mode：0が検収報告
 */
// function acceptanceReport(pg, mode) {
//   // チェックが入っているレコード取得
//   let activeRows = [];
//   let rowsData = mainPGs.pgMOD.dataView.getItems();
//   let nIndex = mainPGs.pgMOD.grid.getSelectedRows();
//   for (var i = 0; i < nIndex.length; i++) {
//     activeRows.push(rowsData[nIndex[i]]);
//   }
//   if (activeRows.length <= 0) {
//     if (mode === 1) {
//       window.alert('検収取消するデータにチェックを入れてください');
//     } else {
//       window.alert('検収報告を上げるデータにチェックを入れてください');
//     }
//     return;
//   }
//   // 検収報告時のデータチェック
//   if (mode === 0) {
//     for (let i = 0; i < activeRows.length; i++) {
//       if(!isSet(activeRows[i]['moed_arrival_plan_date'])) {
//         alert('入荷予定日を入力してください。');
//         return;
//       }
//     }
//   }
//   ajaxUpdateMODAccept(activeRows, mode).then( function (data, jqXHR, textStatus ) {
//     if (data['succeed'] === true) {
//       alert('登録が完了しました。');
//       // 一覧更新
//       readdata(mainPGs.pgMOD);
//     } else {
//       alert('登録に失敗しました。');
//     }
//   });
// }

/**
 * 規格文字列作成 jsでは、見積書からの出荷予定引継ぎでのみ使用
 * @param {*} item 
 */
function makeStrProductStandard(item) {
  // 線径、目合、大きさ 見積明細から作成
  let str = '';
  if (isSet(item['ed_p_cd'])) {
    if (String(item['p_name']).indexOf('_') !== -1) {
      // _を含む場合は、品名に入っている規格を優先
      const arr = item['p_name'].split('_');
      str = arr[1] + ' ';
    }
  }
  if (!isSet(item['ed_sub_01']) || (str !== '')) {
    // 線径1がセットされていない場合は寸法へ進む
    // 線径セットなしで、線番が指定されている場合
    if (isSet(item['ed_sub_num_03']) && parseFloat(item['ed_sub_num_03']) > 0) {
      // 線番がセットされていた場合
      str += '#' + WSUtils.decFloor(item['ed_sub_num_03'], 0);
    } 
  } else {
    // 縦線・横線
    if (isSet(item['ed_sub_12']) || isSet(item['ed_sub_13'])) {
      // 平線の場合
      if ((item['ed_sub_01'] === item['ed_sub_02']) && (item['ed_sub_12'] === item['ed_sub_13'])) {
        // 縦横同じ厚みt,幅Wならばsub01のみ表示
        str += 't' + item['ed_sub_12'] + '×' + 'W' + item['ed_sub_01'];
      } else if (!isSet(item['ed_sub_02'])) {
        // 縦横同じ設定と同意
        str += 't' + item['ed_sub_12'] + '×' + 'W' + item['ed_sub_01'];
      } else {
        str += 't' + item['ed_sub_12'] + '×' + 'W' + item['ed_sub_01'] + '×' + 't' + item['ed_sub_13'] + '×' + 'W' + item['ed_sub_02'];
      }
    } else {
      // 丸線の場合
      if (isSet(item['ed_sub_num_03']) && parseFloat(item['ed_sub_num_03']) > 0) {
        // 線番がセットされていた場合
        str = '#' + WSUtils.decFloor(item['ed_sub_num_03'], 0);
      } else if (item['ed_sub_01'] === item['ed_sub_02']) {
        // 縦横同じ
        str = 'φ' + item['ed_sub_01'];
      } else if (!isSet(item['ed_sub_02'])) {
        str = 'φ' + item['ed_sub_01'];
      } else {
        str = 'φ' + item['ed_sub_01'] + '×' + item['ed_sub_02'];
      }
    }
  }
  if (isSet(item['ed_sub_04'])) {
    // 目合
    // 目合区分＋目合＋目合単位
    if (item['ed_sub_04'] === item['ed_sub_05']) {
      if (isSet(item['ed_sub_03'])) {
        // 目合区分
        str += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      } else {
        // str += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
        str += '×' + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      }
    } else if (!isSet(item['ed_sub_05'])) {
      if (isSet(item['ed_sub_03'])) {
        // 目合区分
        str += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      } else {
        // str += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
        str += '×' + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      }
    } else {
      if (isSet(item['ed_sub_03'])) {
        str += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + '×' + item['ed_sub_03'] + item['ed_sub_05'] + item['ed_sub_06'] + ' ';
      } else {
        // str += '×' + item['ed_sub_04'] + item['ed_sub_06'] + '×' + item['ed_sub_05'] + item['ed_sub_06'] + ' ';
        str += '×' + item['ed_sub_04'] + item['ed_sub_06'] + '×' + item['ed_sub_05'] + item['ed_sub_06'] + ' ';
      }
    }
  }
  // 寸法
  let strSize = '';
  if (isSet(item['ed_sub_08'])) {
    strSize = item['ed_sub_08'];
  }  
  if (isSet(item['ed_sub_10'])) {
    strSize += item['ed_sub_08'] ? (' ' + item['ed_sub_10']) : item['ed_sub_10'];
  }
  if (strSize && (isSet(item['ed_sub_08']) && isSet(item['ed_sub_09']))) {
    strSize += '×';
  }
  if (isSet(item['ed_sub_09'])) {
    strSize += item['ed_sub_09'];
  }
  if (isSet(item['ed_sub_11'])) {
    strSize += isSet(strSize) ? (' ' + item['ed_sub_11']) : item['ed_sub_11'];
    // strSize += item['ed_sub_09'] ? (' ' + item['ed_sub_11']) : item['ed_sub_11'];
  }

  // 加工の種類によって文字の連結処理を変更する。
  if (!isSet(item['ed_parrangement_name'])) {
    return str + strSize;
  }
  if (item['ed_parrangement_name'].match(/円切り/) && !item['ed_parrangement_name'].match(/楕円切り/) && !item['ed_parrangement_name'].match(/半円切り/)) {
    strSize = ''; // リセット
    // 円切り 加工内容マスタ変更の際は、比較値を変更すること
    if (!isSet(item['ed_sub_08']) && !isSet(item['ed_sub_09']) && !isSet(item['ed_sub_10']) && !isSet(item['ed_sub_11'])) {
      // どの値も入ってない場合はif文抜ける
      
    } else if (isSet(item['ed_sub_08']) && isSet(item['ed_sub_09']) && (item['ed_sub_08'] === item['ed_sub_09'])) {
      // 寸法縦横指定かつ同じ寸法
      strSize = ' φ' + item['ed_sub_08'];

      if (isSet(item['ed_sub_10'])) {
        strSize += ' ' + item['ed_sub_10'];
      }
      
      if (isSet(item['ed_sub_11'])) {
        strSize += ' ' + item['ed_sub_11'];
      }
    } else if (isSet(item['ed_sub_08']) && !isSet(item['ed_sub_09'])) {
      // 寸法縦のみ指定ずみ
      strSize = ' φ' + item['ed_sub_08'];

      if (isSet(item['ed_sub_10'])) {
        strSize += ' ' + item['ed_sub_10'];
      }
      
      if (isSet(item['ed_sub_11'])) {
        strSize += ' ' + item['ed_sub_11'];
      }
    } else {
      // 寸法縦横指定かつ寸法異なる場合
      strSize = ' φ' + item['ed_sub_08'];

      if (isSet(item['ed_sub_10'])) {
        strSize += ' ' + item['ed_sub_10'];
      }

      if (isSet(item['ed_sub_09'])) {
        strSize += '×' + 'φ' + item['ed_sub_09'];
      }
      
      if (isSet(item['ed_sub_11'])) {
        strSize += ' ' + item['ed_sub_11'];
      }
    }
  } else if (item['ed_parrangement_name'].match(/ドーナッツ切り/)) {
    // ドーナッツ切り　こちらも上記同様、加工内容マスタ変更の際は、比較値を変更する必要あり
    strSize = '';   // リセット
    if (isSet(item['ed_sub_08'])) {
      strSize = ' φ' + item['ed_sub_08'];
    }
    if (isSet(item['ed_sub_10'])) {
      strSize += isSet(item['ed_sub_10']) ? (' ' + item['ed_sub_10']) : '';
    }
    if (isSet(item['ed_sub_09'])) {
      strSize += '/φ' + item['ed_sub_09'];
    }
    if (isSet(item['ed_sub_11'])) {
      strSize += isSet(item['ed_sub_11']) ? (' ' + item['ed_sub_11']) : '';
    }
    // if (isSet(item['ed_sub_08']) && isSet(item['ed_sub_09'])) {    
    //   strSize = ' φ' + item['ed_sub_08'];
    //   strSize += isSet(item['ed_sub_10']) ? (' ' + item['ed_sub_10']) : '';
    //   strSize += '/φ' + item['ed_sub_09'];
    //   strSize += isSet(item['ed_sub_11']) ? (' ' + item['ed_sub_11']) : '';
    // }
  }

  return str + strSize;
}

/* 発注引継時のデータ作成用 品名を除く規格文字列のみ取得
 */
function makeArrProductStandard(item) {
  // 線径、目合、大きさ 見積明細から作成
  let arSpec = [];
  let arr = [];
  if (isSet(item['ed_p_cd'])) {
    if (String(item['p_name']).indexOf('_') !== -1) {
      // _を含む場合は、品名に入っている規格を優先
      const arr = item['p_name'].split('_');
      arSpec[0] = arr[0];
      arSpec[1] = arr[1] + ' ';
    } else {
      arSpec[0] = arr[0];
    }
  }
  if (!isSet(item['ed_sub_01']) || (arSpec[1] !== '')) {
    // 線径1がセットされていない場合は寸法へ進む
    // 線径セットなしで、線番が指定されている場合
    if (isSet(item['ed_sub_num_03']) && parseFloat(item['ed_sub_num_03']) > 0) {
      // 線番がセットされていた場合
      arSpec[1] += '#' + WSUtils.decFloor(item['ed_sub_num_03'], 0);
    } 
  } else {
    // 縦線・横線
    if (isSet(item['ed_sub_12']) || isSet(item['ed_sub_13'])) {
      // 平線の場合
      if ((item['ed_sub_01'] === item['ed_sub_02']) && (item['ed_sub_12'] === item['ed_sub_13'])) {
        // 縦横同じ厚みt,幅Wならばsub01のみ表示
        arSpec[1] += 't' + item['ed_sub_12'] + '×' + 'W' + item['ed_sub_01'];
      } else if (!isSet(item['ed_sub_02'])) {
        // 縦横同じ設定と同意
        arSpec[1] += 't' + item['ed_sub_12'] + '×' + 'W' + item['ed_sub_01'];
      } else {
        arSpec[1] += 't' + item['ed_sub_12'] + '×' + 'W' + item['ed_sub_01'] + '×' + 't' + item['ed_sub_13'] + '×' + 'W' + item['ed_sub_02'];
      }
    } else {
      // 丸線の場合
      if (isSet(item['ed_sub_num_03']) && parseFloat(item['ed_sub_num_03']) > 0) {
        // 線番がセットされていた場合
        arSpec[1] = '#' + WSUtils.decFloor(item['ed_sub_num_03'], 0);
      } else if (item['ed_sub_01'] === item['ed_sub_02']) {
        // 縦横同じ
        arSpec[1] = 'φ' + item['ed_sub_01'];
      } else if (!isSet(item['ed_sub_02'])) {
        arSpec[1] = 'φ' + item['ed_sub_01'];
      } else {
        arSpec[1] = 'φ' + item['ed_sub_01'] + '×' + item['ed_sub_02'];
      }
    }
  }
  if (isSet(item['ed_sub_04'])) {
    // 目合
    // 目合区分＋目合＋目合単位
    if (item['ed_sub_04'] === item['ed_sub_05']) {
      if (isSet(item['ed_sub_03'])) {
        // 目合区分
        arSpec[1] += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      } else {
        arSpec[1] += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      }
    } else if (!isSet(item['ed_sub_05'])) {
      if (isSet(item['ed_sub_03'])) {
        // 目合区分
        arSpec[1] += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      } else {
        arSpec[1] += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + ' ';
      }
    } else {
      if (isSet(item['ed_sub_03'])) {
        arSpec[1] += '×' + item['ed_sub_03'] + item['ed_sub_04'] + item['ed_sub_06'] + '×' + item['ed_sub_03'] + item['ed_sub_05'] + item['ed_sub_06'] + ' ';
      } else {
        arSpec[1] += '×' + item['ed_sub_04'] + item['ed_sub_06'] + '×' + item['ed_sub_05'] + item['ed_sub_06'] + ' ';
      }
    }
  }
  // 寸法
  let strSize = '';
  if (isSet(item['ed_sub_08'])) {
    strSize = item['ed_sub_08'];
  }  
  if (isSet(item['ed_sub_10'])) {
    strSize += item['ed_sub_08'] ? (' ' + item['ed_sub_10']) : item['ed_sub_10'];
  }
  if (strSize && (isSet(item['ed_sub_08']) && isSet(item['ed_sub_09']))) {
    strSize += '×';
  }
  if (isSet(item['ed_sub_09'])) {
    strSize += item['ed_sub_09'];
  }
  if (isSet(item['ed_sub_11'])) {
    strSize += isSet(strSize) ? (' ' + item['ed_sub_11']) : item['ed_sub_11'];
    // strSize += item['ed_sub_09'] ? (' ' + item['ed_sub_11']) : item['ed_sub_11'];
  }

  // 加工の種類によって文字の連結処理を変更する。
  if (!isSet(item['ed_parrangement_cd'])) {
    arSpec[2] = strSize;
    return arSpec;
  }
  item['ed_parrangement_name'] = master['arrangement'][$("#company-cd")[0].textContent + '-' + item['ed_parrangement_cd']]['ar_name'];
  if (item['ed_parrangement_name'].match(/円切り/) && !item['ed_parrangement_name'].match(/楕円切り/) && !item['ed_parrangement_name'].match(/半円切り/)) {
    strSize = ''; // リセット
    // 円切り 加工内容マスタ変更の際は、比較値を変更すること
    if (isSet(item['ed_sub_08']) && isSet(item['ed_sub_09']) && (item['ed_sub_08'] === item['ed_sub_09'])) {
      strSize = ' φ' + item['ed_sub_08'];

      if (isSet(item['ed_sub_10'])) {
        strSize += ' ' + item['ed_sub_10'];
      }
      
      if (isSet(item['ed_sub_11'])) {
        strSize += ' ' + item['ed_sub_11'];
      }
    } else if (isSet(item['ed_sub_08']) && !isSet(item['ed_sub_09'])) {
      strSize = ' φ' + item['ed_sub_08'];

      if (isSet(item['ed_sub_10'])) {
        strSize += ' ' + item['ed_sub_10'];
      }
      
      if (isSet(item['ed_sub_11'])) {
        strSize += ' ' + item['ed_sub_11'];
      }
    } else {
      strSize = ' φ' + item['ed_sub_08'];

      if (isSet(item['ed_sub_10'])) {
        strSize += ' ' + item['ed_sub_10'];
      }

      if (strSize && (item['sub08'] && item['sub09'])) {
        strSize += '×';
      }

      if (isSet(item['sub09'])) {
        strSize += 'φ' + item['sub09'];
      }
      
      if (isSet(item['ed_sub_11'])) {
        strSize += ' ' + item['ed_sub_11'];
      }
    }
  } else if (item['ed_parrangement_name'].match(/ドーナッツ切り/)) {
    // ドーナッツ切り　こちらも上記同様、加工内容マスタ変更の際は、比較値を変更する必要あり
    strSize = '';   // リセット
    if (isSet(item['ed_sub_08'])) {
      strSize = ' φ' + item['ed_sub_08'];
    }
    if (isSet(item['ed_sub_10'])) {
      strSize += isSet(item['ed_sub_10']) ? (' ' + item['ed_sub_10']) : '';
    }
    if (isSet(item['ed_sub_09'])) {
      strSize += '/φ' + item['ed_sub_09'];
    }
    if (isSet(item['ed_sub_11'])) {
      strSize += isSet(item['ed_sub_11']) ? (' ' + item['ed_sub_11']) : '';
    }
    // if (isSet(item['ed_sub_08']) && isSet(item['ed_sub_09'])) {    
    //   strSize = ' φ' + item['ed_sub_08'];
    //   strSize += isSet(item['ed_sub_10']) ? (' ' + item['ed_sub_10']) : '';
    //   strSize += '/φ' + item['ed_sub_09'];
    //   strSize += isSet(item['ed_sub_11']) ? (' ' + item['ed_sub_11']) : '';
    // }
  }
  arSpec[2] = strSize;
  return arSpec;
}


/**
 * 製品コードに基づく、品名分類データの取得
 * @param {*} productCd 
 */
function getProductCategoryCD(productCd) {
  // 金網であることを上位で判断しておくこと
  let ar = [];  // 製品の材質、織り方コード取得
  if (!isSet(productCd)) {
    // 単体　織り方と材料コード
    ar['mcd'] = '';
    ar['wcd'] = '';
    // productcategory検索用織り方、材料コード
    ar['pmcd'] = '';
    ar['pwcd'] = '';
    ar['mname'] = '';
    ar['wname'] = '';
    return ar;
  }
  ar['mcd'] = productCd.substr(2,3);
  ar['wcd'] = productCd.substr(5,3);
  ar['pmcd'] = '2-' + productCd.substr(0,2) + '-' + productCd.substr(2,3) + '-' + '000';
  ar['pwcd'] = '3-' + productCd.substr(0,2) + '-' + productCd.substr(2,3) + '-' + productCd.substr(5,3);
  ar['mname'] = getMasterValue('prc_name', 'productcategory', ar['pmcd']);
  ar['wname'] = getMasterValue('prc_name', 'productcategory', ar['pwcd']);
  return ar;
}


/***
 * 指定カラムがデータセットされているレコードのみ取得
 */
function countPGRecord(pgData, columnName) {
  let ar = [];
  for (let i = 0; i < pgData.length; i++) {
    if (pgData[i][columnName] !== '') {
      ar.push(pgData[i]);
    }
  }
  return ar;
}


/****
 * 金網製造指示では、同じ線径、目合、目合区分、単位のもののみグルーピング可能。データチェック。
 * データに問題なし
 */
function validateSelectedSameProdplanRows(pgData) {
  let nSub01 = 0;
  let nSub02 = 0;
  let strSub03 = '';
  let nSub04 = 0;
  let nSub05 = 0;
  let strSub06 = '';
  let nSub12 = 0;
  let nSub13 = 0;
  let bRslt = true;

  for (let i = 0; i < pgData.length; i++) {
    if (i <= 0) {
      nSub01 = parseFloat(pgData[i]['pd_ed_sub_01']);
      nSub02 = parseFloat(pgData[i]['pd_ed_sub_02']);
      strSub03 = pgData[i]['pd_ed_sub_03'].trim();
      nSub04 = parseFloat(pgData[i]['pd_ed_sub_04']);
      nSub05 = parseFloat(pgData[i]['pd_ed_sub_05']);
      strSub06 = pgData[i]['pd_ed_sub_06'].trim();
      nSub12 = parseFloat(pgData[i]['pd_ed_sub_12'] ? pgData[i]['pd_ed_sub_12'] : 0);
      nSub13 = parseFloat(pgData[i]['pd_ed_sub_13'] ? pgData[i]['pd_ed_sub_13'] : 0);
      continue;
    }

    if (nSub01 !== parseFloat(pgData[i]['pd_ed_sub_01'])
     || nSub02 !== parseFloat(pgData[i]['pd_ed_sub_02']) 
     || strSub03 !== pgData[i]['pd_ed_sub_03'].trim() 
     || nSub04 !== parseFloat(pgData[i]['pd_ed_sub_04']) 
     || nSub05 !== parseFloat(pgData[i]['pd_ed_sub_05']) 
     || strSub06 !== pgData[i]['pd_ed_sub_06'].trim() 
     || nSub12 !== parseFloat(pgData[i]['pd_ed_sub_12'] ? pgData[i]['pd_ed_sub_12'] : 0) 
     || nSub13 !== parseFloat(pgData[i]['pd_ed_sub_13'] ? pgData[i]['pd_ed_sub_13'] : 0) ) {
      // いずれかが不一致ならばエラー
      bRslt = false;
    }
  }

  return bRslt;
}

function setProductMoldHeader(orgData, setHeader, setHeader2) {
  setHeader['pp_p_cd'] = orgData[0]['pd_p_cd'];
  setHeader['pp_p_material'] = orgData[0]['pd_p_cd'].substring(2, 5);
  setHeader['pp_p_weave'] = orgData[0]['pd_p_cd'];
  setHeader['pp_ed_sub_01'] = orgData[0]['pd_ed_sub_01'];
  setHeader['pp_ed_sub_02'] = orgData[0]['pd_ed_sub_02'];
  setHeader['pp_ed_sub_03'] = orgData[0]['pd_ed_sub_03'];
  setHeader['pp_ed_sub_04'] = orgData[0]['pd_ed_sub_04'];
  setHeader['pp_ed_sub_05'] = orgData[0]['pd_ed_sub_05'];
  setHeader['pp_ed_sub_06'] = orgData[0]['pd_ed_sub_06'];
  setHeader['pp_ed_sub_06'] = orgData[0]['pd_ed_sub_06'];
  setHeader['pp_ed_sub_12'] = orgData[0]['pd_ed_sub_12'];
  setHeader['pp_ed_sub_13'] = orgData[0]['pd_ed_sub_13'];
  setHeader['pp_prod_plan_no'] = orgData[0]['pp_prod_plan_no'];

  let nSumSheets = 0;
  let nDimension = 0;
  for (let i = 0; i < orgData.length; i++) {
    nSumSheets += parseFloat(orgData[i]['pd_ed_quantity']);
    nDimension += parseFloat(orgData[i]['pd_dimension']);
  }

  setHeader['pp_sum_sheets'] = nSumSheets;
  setHeader['pp_dimension'] = nDimension;

  setHeader2['pp_recalc_sign'] = '1';
  setHeader2['pp_left'] = '';
  setHeader2['pp_weave_cnt'] = '';
  setHeader2['pp_right'] = '';
  setHeader2['pp_rate'] = '';
  setHeader2['pp_cam'] = '';
  setHeader2['pp_ins_level'] = '';
  setHeader2['pp_transfer_day'] = '';
  setHeader2['pp_packing_day'] = '';
  setHeader2['pp_purchase_cd'] = '';
  // setHeader2['pp_purchase_name'] = '';
  setHeader2['pp_material_cd_01'] = '';
  setHeader2['pp_raw_material_01'] = '';
  setHeader2['pp_material_cd_02'] = '';
  setHeader2['pp_raw_material_02'] = '';
  setHeader2['pp_sum_plan_cost'] = 0;
  setHeader2['pp_area_cost'] = 0;
  setHeader2['pp_proc_time_01'] = 0;
  setHeader2['pp_proc_time_02'] = 0;
  setHeader2['pp_proc_time_03'] = 0;
  setHeader2['pp_proc_time_04'] = 0;
  setHeader2['pp_proc_time_05'] = 0;
  setHeader2['pp_proc_time_06'] = 0;

}

function setProductMoldDetails(orgData, setDetails, setDetails2) {

  for (let i = 0; i < setDetails.length; i++) {
    let arDetailRow =  makeNewRowObj(arDetailRows);
  }

}

/**
 * paddingして文字列形成
 * （2023/6/22：発注から在庫品を探すときに「160桁の品名補助CD」を作成）※他の箇所の呼び出しは想定していない。
 * deletelot:ロットNoを含まない場合=>true
 * 製品用
 */
function SetPadding(ar, deltelot = false) {
  let str = '';
  let num = 0;

  if ('ed_sub_01' in ar) {
      for (let i = 1; i <= 6; i++) {
          num = ar[`ed_sub_0${i}`] ? ar[`ed_sub_0${i}`] * 10 : 0;
          str += String(num).padStart(5, '0');
      }

      if (!deltelot) {
          str += (ar['ed_lot_no'] || '').padEnd(15, ' ');
      }
  }

  if ('moed_order_no' in ar) {
    // 線径１
    if ('moed_sub_01' in ar && ar['moed_sub_01'] !== '') {  // 5桁
      num = ar['moed_sub_01'] * 10;
    }
    str += String(num).padStart(5, '0');

    num = 0;
    // 線径２
    if ('moed_sub_02' in ar && ar['moed_sub_02'] !== '') {  // 5桁
      num = ar['moed_sub_02'] * 10;
    }
    str += String(num).padStart(5, '0');
    // 目合区分
    str += (ar['moed_sub_03'] || '').padEnd(5, ' ');

    num = 0;
    // 目合１
    if ('moed_sub_04' in ar && ar['moed_sub_04'] !== '') {  // 5桁
      num = ar['moed_sub_04'] * 10;
    }
    str += String(num).padStart(5, '0');

    num = 0;
    // 目合２
    if ('moed_sub_05' in ar && ar['moed_sub_05'] !== '') {  // 5桁
      num = ar['moed_sub_05'] * 10;
    }
    str += String(num).padStart(5, '0');
    // 数量単位CD
    str += (ar['moed_sub_06'] || '').padEnd(5, ' ');
    // コイル番号
    str += (ar['moed_sub_07'] || '').padEnd(15, ' ');
    // 寸法１
    str += (ar['moed_sub_08'] || '').padStart(30, ' ');
    // 寸法２
    str += (ar['moed_sub_09'] || '').padStart(30, ' ');
    // 10,11
    str += ''.padEnd(15, ' ');
    str += ''.padEnd(15, ' ');
    // 厚み１
    str += (ar['moed_sub_12'] || '').padEnd(5, ' ');
    // 厚み２
    str += (ar['moed_sub_13'] || '').padEnd(5, ' ');

    if (!deltelot) {
      if ('moed_type_03' in ar && ar['moed_type_03'] !== '') {
          str += ar['moed_type_03'].padEnd(15, ' ');
      } else {
          str += ''.padEnd(15, ' ');
      }
    }
  }

  if ('stc_report_no' in ar) {
      str += ar['stc_report_no'].padStart(15, '0');
      str += ar['st_no'].padStart(5, '0');
      str += ar['st_date'].replace(/-/g, '');
  }

  return str;
}




