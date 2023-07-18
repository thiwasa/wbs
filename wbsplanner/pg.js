'use strict';

/**
 * 生産管理システム計画画面グリッドオブジェクト
 * @param {string} strDivId グリッドとして使用するdiv
 * @constructor
 * @author Fumihiko Kondo
 */
function PlannerGrid(strDivId) {
  /**
   * @type {PlannerGrid}
   * @instance
   */
  var self = this;
  /**
   * 要素のID
   * @type {string}
   * @instance
   */
  this.divId = strDivId;
  /**
   * グリッド要素のJQueryオブジェクト
   * @type {jQuery}
   * @instance
   */
  this.div = $('#grid' + this.divId);
  /**
   * 高さ
   * @type {number}
   * @instance
   */
  this.height = 6;
  /**
   * グリッド
   * @type {Slick.Grid}
   * @instance
   */
  this.grid = null;
  /**
   * データビュー
   * @type {Slick.Data.DataView}
   * @instance
   */
  this.dataView = new Slick.Data.DataView();
  /**
   * フィルタ設定
   * @instance
   */
  this.columnFilters = {};
  /**
   * 部分一致検索有無
   * @type {boolean}
   * @instance
   */
  this.isFilterAmb = true;
  /**
   * フィルタ用関数
   * @param {*} item 
   * @instance
   */
  this.filter = function (item) {
    var beforeData = '';
    var c;
    var isTarget = false;
    var isSelectData = false; // ステータス確認時、ステータスフラグが空の状態がある場合。
    var bResult = false; 
    for (var columnId in self.columnFilters) {
      // カラム毎にデータチェック
      if (columnId === '_checkbox_selector' || !isSet(self.columnFilters[columnId])) {
        // チェックフィルターに文字入っても無視。
        continue;
      } 
      if (!isSet(columnId) && !isSet(self.columnFilters[columnId])) {
        // データ読込時 or Filterが空
        return true;
      }  else {
        // レコード設定取得
        c = self.grid.getColumns()[self.grid.getColumnIndex(columnId)];
      }
      if (columnId !== 'ed_ship_status_sign' && isSet(self.columnFilters[columnId]) && !isSet(item[c['field']])) {
        // Filterは入っていて、データが空の場合はfalse
        return false;
      }
      // バーコードスキャナ読取は↓にコード入れるか？　見積書の場合は先頭に10が付与されるので、それを排除する仕組みを入れる
      // エンターキ―押下を検知しているかどうかでイベントの動作も替えた方がいいかも
      if (c['rangefilter']) {
        // 範囲指定の場合
        if (self.columnFilters[columnId].indexOf('-') === -1) {
          // 範囲ない場合は通常の検索
          if (isSet(item[c['field']])) {
            if (String(item[c['field']]).replace(/\n/g, ' ').indexOf(self.columnFilters[columnId]) === -1) {
              return false;
            }
          }
        } else if (self.columnFilters[columnId].length > 1) {
          // 範囲ある場合
          let rg = self.columnFilters[columnId].split('-');
          let strpl = self.columnFilters[columnId].indexOf('-');
          if (strpl === 0 && item[c['field']] >= Number(rg[1])) {
            // -3
            return false;
          } 
          if (!isSet(rg[1])) {
            // 最大値なし
            if (item[c['field']] < Number(rg[0])) {
              return false;
            }
          } else {
            // あり
            if (item[c['field']] < Number(rg[0]) || item[c['field']] >= Number(rg[1])) {
              return false;
            }
          }             
        }
      } else if (columnId === 'ed_ship_status_sign') {
        for (let i = 0; i < c['options'].length; i++) {
          // セレクトボックスの要素で回す
          if (item[c['field']] !== '' && self.columnFilters[columnId] === '未') {
            return false;
          }
        }
      } else if (columnId.indexOf('_sign') !== -1 || columnId.indexOf('_SIGN') !== -1) {
        // ステータス表示セレクトボックス
        for (let i = 0; i < c['options'].length; i++) {
          // セレクトボックスの要素で回す
          if ((c['options'][i].val.indexOf(self.columnFilters[columnId]) !== -1) || c['options'][i].key === self.columnFilters[columnId]) {
            // 完了などの漢字入力か、1などのフラグ入力か どちらかが一致する場合
            beforeData = self.columnFilters[columnId];
            self.columnFilters[columnId] = c['options'][i].key;
            // ステータス　未が空文字の場合は、この時点で判定しないと、次のセレクトボックス要素との比較に入ってしまうため追加
            if (self.columnFilters[columnId] === '') {
              if (item[c['field']] !== '') {
                return false;
              }
            }
          }
        }
        if (String(item[c['field']]).replace(/\n/g, ' ').indexOf(self.columnFilters[columnId]) === -1) {
          return false;
        } 
      } else if (c['numberfilter']) {
        // 数値の場合は完全一致のみ
        var str = String(item[c['field']]).replace(/\n/g, ' ');
        if (str !== self.columnFilters[columnId]) {
          return false;
        }
      } else {
        if (isSet(item[c['field']])) {
          if (c['formatter'] === SelectCellFormatterValue) {
            for (var i = 0; i < c['options'].length; i++) {
              if ((c['options'][i].val.indexOf(self.columnFilters[columnId]) > -1) || c['options'][i].key === self.columnFilters[columnId]) {
                beforeData = self.columnFilters[columnId];
                self.columnFilters[columnId] = c['options'][i].key;
              }
            }
            if (String(item[c['field']]).replace(/\n/g, ' ').indexOf(self.columnFilters[columnId]) === -1) {
              self.columnFilters[columnId] = beforeData;
              return false;
            } 
          }
          if (String(item[c['field']]).replace(/\n/g, ' ').indexOf(self.columnFilters[columnId]) === -1) {
            return false;
          }
        } else {
          // データがセットされてない場合
          if (c['formatter']) {
            if (c['formatter'](null, null, null, null, self.dataView.getItemById(item.id))['text'].indexOf(self.columnFilters[columnId]) === -1) {
              return false;
            }
          } 
          // else {
          //   return false;
          // }
        }
      }
    }
    return true;
  };
  /**
   * 列設定
   * @type {Array}
   * @instance
   * 
   */
  this.columns = [];
  /**
   * グリッドについてのオプション
   * @type {Object}
   * @instance
   */
  this.options = {
    'editable': true,
    // 自動で1行追加された状態になる↓
    // 'enableAddRow': true,  
    'enableCellNavigation': true,
    'asyncEditorLoading': true,
    'showHeaderRow': true,
    'headerRowHeight': 27,
    'explicitInitialization': true,
    'enableAsyncPostRender': true,
    'autoEdit': true,
    // 'enableAddRow': true,
    // 'autoEdit': false,
  };
  /**
   * 読込中表示マーク
   * @type {Object}
   * @instance
   */
  this.loadingIndicator = null;
  /**
   * 編集画面用アクティブグリッド判定用フラグ
   * @type {boolean}
   * @instance
   */
  this.isEditing = false;
  /** 
   * チェックボックス 
   */
  this.checkboxSelector = new Slick.CheckboxSelectColumn({
    cssClass: "slick-cell-checkboxsel"
  });

  // this.loader = new Slick.Data.RemoteModel();
  
}

/**
 * グリッドの内容を初期化する
 * @alias PlannerGrid.prototype.initGrid
 */
PlannerGrid.prototype.initGrid = function () {
  this.grid = new Slick.Grid(this.div, this.dataView, this.columns, this.options);
  this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
  //チェックボックスをregist
  this.grid.registerPlugin(this.checkboxSelector);
};

/**
 * グリッドを要素に適用する
 * @alias PlannerGrid.prototype.assignGrid
 */
PlannerGrid.prototype.assignGrid = function () {
  assignSlickGrid(this.grid, this.dataView, this.columnFilters, this.filter);
};

/**
 * 読み込み状態を表示する
 * @param {boolean} showIndicator trueで表示、falseで非表示
 * @alias PlannerGrid.prototype.displayIndicator
 */
PlannerGrid.prototype.displayIndicator = function (showIndicator) {
  if (!this.loadingIndicator) {
    this.loadingIndicator = $('<span class="loading-indicator"><label>読込中...</label></span>').appendTo(document.body);
  }
  if (showIndicator) {
    this.loadingIndicator
      .css('position', 'absolute')
      .css('top', this.div.offset().top + this.div.height() / 2 - this.loadingIndicator.height() / 2)
      .css('left', this.div.offset().left + this.div.width() / 2 - this.loadingIndicator.width() / 2)
      .show();
  } else {
    this.loadingIndicator.fadeOut();
  }
};

/**
 * ボタンを指定したグリッドに追加する
 * @param {string} buttonName ボタン名称
 * @param {Function} func ボタン押下時に実行する関数
 */
PlannerGrid.prototype.addButton = function (buttonName, func) {
  var btnTag = '<button>' + buttonName + '</button>';
  $(btnTag).appendTo('#btns-' + this.divId).on('click', func);
  return;
};

PlannerGrid.prototype.addImportButton = function (buttonName,  func) {
  var btnTag = '<input id="fileid" type="file" hidden/><button>' + buttonName + '</button>';
  $(btnTag).appendTo('#btns-' + this.divId).on('click', func);
  return;
};

/**
 * フィルタ条件をクリアする
 * @alias PlannerGrid.prototype.clearFilters
 */
PlannerGrid.prototype.clearFilters = function () {
  $(this.grid.getHeaderRow()).find(':input').val('').trigger('change');
};

/**
 * グリッド中のアクティブセルがある行を取得して返す
 * @return {Object} アクティブ行のオブジェクト。セルが選択されていなければnull
 */
PlannerGrid.prototype.getActiveRow = function () {
  var activeCell = this.grid.getActiveCell();
  return (activeCell ? this.dataView.getItem(activeCell.row) : null);
};

/**
 * フッター行を再描画する。
 */
PlannerGrid.prototype.redrawFooter = function () {
  if (!this.grid.getOptions()['showFooterRow']) {
    return;
  }
  var cols = this.grid.getColumns();
  var columnIdx = this.grid.getColumns().length;
  while (columnIdx--) {
    var columnId = cols[columnIdx].id;
    var columnElement = this.grid.getFooterRowColumn(columnId);
    if (cols[columnIdx]['footerfunc']) {
      $(columnElement).html(cols[columnIdx]['footerfunc'](columnId, this.grid, this.dataView));
      // headerを設定
      if (this.divId === 'ED') {
        var arrData = editPGs.pgED.h.dataView.getIetms();
        if (columnIdx === 22) {
          arrData[0]['e_sum_area'] = cols[columnIdx]['footerfunc'](columnId, this.grid, this.dataView);
        }
        if (columnIdx === 24) {
          arrData[0]['e_sum_price'] = cols[columnIdx]['footerfunc'](columnId, this.grid, this.dataView);
        }
      } else if (this.divId === 'SD') {
        var arrData = editPGs.pgSD.h.dataView.getIetms();
        if (columnIdx === 19) {
          arrData[0]['s_sum_price'] = cols[columnIdx]['footerfunc'](columnId, this.grid, this.dataView);
        }
      } 
    } else {
      $(columnElement).html('&nbsp;');
    }
  }
};

/**
 * 指定要素についてSlickGridを設定する。
 * @param {Slick.Grid} grid
 * @param {Slick.Data.DataView} dataView
 * @param {*} columnFilters
 * @param {*} filter
 */
function assignSlickGrid(grid, dataView, columnFilters, filter) {
/** フッター行を更新する(有効時のみ) */
  var updateAllFooters = function () {
    if (!grid.getOptions()['showFooterRow']) {
      return;
    }
    var cols = grid.getColumns();
    var columnIdx = grid.getColumns().length;
    while (columnIdx--) {
      var columnId = cols[columnIdx].id;
      var columnElement = grid.getFooterRowColumn(columnId);
      if (cols[columnIdx]['footerfunc']) {
        $(columnElement).html(cols[columnIdx]['footerfunc'](columnId, grid, dataView));
        // headerを設定
        if (columnId.substring(0, 2) === 'ed') {
          // let sumValue01 = sumValue.split(':');
          var arrData = editPGs.pgED.h.dataView.getItems();
          if (columnIdx === 22) {
            // 初回表示時は、明細の平方メートル計算よりもこちらが早いため、正確な面積が表示されない
            // よって、読込時には計算値を別途セットしておいてやる。
            let sumVal = setHeaderSUM(columnId, grid, dataView, 2);
            arrData[0]['e_sum_area'] = sumVal;
          }
          if (columnIdx === 24) {
            let sumVal = setHeaderSUM(columnId, grid, dataView, 0);
            arrData[0]['e_sum_price'] = sumVal;
          }
          editPGs.pgED.h.grid.invalidateRow(0);
          editPGs.pgED.h.grid.render();
        } else if (columnId.substring(0, 2) === 'pw') {
          var arrData = calcPGs.pgProdMold.h1.dataView.getItems();
          if (columnIdx === 11) {
            let sumVal = setHeaderSUM(columnId, grid, dataView, 2);
            arrData[0]['pp_dimension'] = sumVal;
          }
        } else if (columnId.substring(0, 2) === 'sd') {
          var arrData = editPGs.pgSD.h.dataView.getItems();
          if (arrData.length === 0) { 
            break;
          }
          if (columnIdx === 19) {
            let sumVal = setHeaderSUM(columnId, grid, dataView, 0);
            arrData[0]['s_sum_price'] = sumVal;
          }
          editPGs.pgSD.h.grid.invalidateRow(0);
          editPGs.pgSD.h.grid.render();
        } 
      } else {
        $(columnElement).html('&nbsp;');
      }
    }
  };
  let updateDetailCell = function (args) {
    let cols = grid.getColumns();
    let arData = args.dataView.getItems();
    for (let i = 0; i < cols.length; i++) {
      if (cols[i]['paramfunc']) {
        if (isSet(arData[cols[i]['field']])) {
          cols[i]['paramfunc'](arData[0][cols[i]['field']]);
        }
      }
      // if (cols[i].field === 'pp_ed_sub_01' || cols[i].field === 'pp_ed_sub_04') {
      //   cols[i]['paramfunc']('', arData[0][cols[i]['field']]);
      // }
      // if (cols[i].field === 'pp_bump_num') {
      //   cols[i]['paramfunc'](arData[0][cols[i]['field']], '');
      // }     
      // if (cols[i].field === 'pd_ins_level') {
      //   cols[i]['paramfunc']();
      // }
      if (cols[i].field === 'ec_loss_rate') { // ロス率
        cols[i]['paramfunc'](arData[0][cols[i]['field']]);
      }
      if (cols[i].field === 'ec_material_unit_cost') {
        cols[i]['paramfunc'](arData[0][cols[i]['field']]);
      }
      if (cols[i].field === 'ec_cut_cost') {
        cols[i]['paramfunc'](arData[0][cols[i]['field']]);
      }
      if (cols[i].field === 'ec_area_cost_digit') {
        cols[i]['paramfunc'](0, arData[0][cols[i]['field']]);
      }
      if (cols[i].field === 'ec_factor') {
        cols[i]['paramfunc'](arData[0][cols[i]['field']], 0);
      }
    }
  };
  let updateHSUMCell = function (args) {
    let cols = grid.getColumns();
    if (cols.length > 0) {
      let arData = args.dataView.getItems();
      let arH1 = calcPGs.pgEDCalc.h1.dataView.getItems();
      let arH2 = calcPGs.pgEDCalc.h2.dataView.getItems();
      if (cols[0].id.substring(0,3) === 'ecd') {
        for (let i = 0; i < cols.length; i++) {
          // 1列全て更新するが、該当セルの該当functionを読み込むために、forでセルを回す。
          if (!isSet(cols[i]['toheaderfunc']) && !isSet(arData[cols[i]['field']])) {
            continue;
          }
          if (cols[i].field === 'ecd_quantity') { // calcSUMArea呼出 戻り値は配列のためindexを追記
            arH1[0]['ec_sum_sheet'] = cols[i]['toheaderfunc'](dataView)[1];
            arH1[0]['ec_calc_area'] = cols[i]['toheaderfunc'](dataView)[0];
            arH1[0]['ec_loss_area'] = cols[i]['toheaderfunc'](dataView)[2];
          } else if (cols[i].field === 'ecd_cut_cost') { // calcSUMCutCost呼出
            arH1[0]['ec_cut_sum_cost'] = cols[i]['toheaderfunc'](dataView);
          } else if (cols[i].field === 'ecd_fix_unit_cost') { // setECDPriceSUM呼出
            arH1[0]['ec_sum_price'] = cols[i]['toheaderfunc'](dataView);
          }
        }
      }

      if (arH1[0] && arH2[0]) {
        // ロス含重量(従)
        arH1[0]['ec_loss_weight'] = WSUtils.decCeil(arH1[0]['ec_loss_area'] * arH1[0]['ec_area_weight'] * (arH1[0]['ec_loss_rate'] / 100), arH1[0]['ec_w_digits']);

        // ロス含重量(詳細) 
        var val1 = arH1[0]['ec_ed_sub_01'] / 2 * arH1[0]['ec_ed_sub_01'] / 2 * Math.PI * arH2[0]['length_1_net_sum'] / Math.pow(10, 6) * arH1[0]['m_s_gravity'];
        var val2 = arH1[0]['ec_ed_sub_02'] / 2 * arH1[0]['ec_ed_sub_02'] / 2 * Math.PI * arH2[0]['length_2_net_sum'] / Math.pow(10, 6)  * arH1[0]['m_s_gravity'];
        var val3 = arH1[0]['ec_ed_sub_02'] / 2 * arH1[0]['ec_ed_sub_02'] / 2 * Math.PI * arH2[0]['length_3_loss_sum'] / Math.pow(10, 6)  * arH1[0]['m_s_gravity'];
        arH1[0]['ec_loss_weight_02'] = WSUtils.decCeil((val1 + val2 + val3) * arH1[0]['ec_loss_rate'] / 100, arH1[0]['ec_w_digits']);

        // 平方重量(詳細)
        if (arH1[0]['shrink_mag_1'] === undefined) {
          arH1[0]['shrink_mag_1'] = 0;
        }
        var val5 = WSUtils.decFloor((1000/(arH1[0]['ec_ed_sub_01'] + arH1[0]['ec_ed_sub_04']) + 1) * 2, 0);
        arH1[0]['ec_area_weight_02'] = WSUtils.decCeil(arH1[0]['ec_ed_sub_01'] / 2 * arH1[0]['ec_ed_sub_01'] / 2 * Math.PI * arH2[0]['length_1_net_sum'] / Math.pow(10, 6) * 1000 * val5 * arH1[0]['shrink_mag_1'] / Math.pow(10, 6) * arH1[0]['m_s_gravity'], 2);

        // 材料費、工賃費計算
        var resultCalcObj = calcWageAndMaterialCost(arH1[0], arH2[0]);
        arH2[0]['ec_material_cost'] = resultCalcObj.materialCost;
        arH2[0]['ec_calc_wage'] = resultCalcObj.wage;
      }

      calcPGs.pgEDCalc.h1.grid.invalidateRow(0);
      calcPGs.pgEDCalc.h1.grid.render();
      calcPGs.pgEDCalc.h2.grid.invalidateRow(0);
      calcPGs.pgEDCalc.h2.grid.render();
    }
  };
  var data = [];
  grid.onAddNewRow.subscribe(function (e, args) {
    var item = args['item'];
    var column = args.column;
    grid.invalidateRow(data.length);
    data.push(item);
    grid.updateRowCount();
    grid.render();
  });
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });
  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args['rows']);
    updateDetailCell(args);
    updateHSUMCell(args);
    updateAllFooters();
    grid.render();
  });
  dataView.getItemMetadata = function (row) {
    var dvitem = dataView.getItem(row);
    if (dvitem) {
      if (dvitem['isDirty'] === true) {
        return { 'cssClasses': 'dirty' };
      }
    }
  };
  // grid.onSelectedRowsChanged.subscribe(function (e, args) {
  //   let dvItem2 = dataView.getItem(args['row']);
  //   dvItem2['isSelected'] = true;
  //   dataView['updateItem'](dvItem2.id, dvItem2);
  // }); 
  // grid.onViewportChanged.subscribe(function (e, args) {
  //   var vp = grid.getViewport();
  //   loader.ensureData(vp.top, vp.bottom);
  // });

  grid.onCellChange.subscribe(function (e, args) {
    // if (args.item.ppd_prodplan_id > 0 && args.item.isSelected !== null) {
    //   // 製造計画画面のヘッダー画面だったらisDirtyは使わない。もっといい表記あったら換える
    // } else {

    if (args['item'] && args['item']['ec_reserve_01']) {
      let arH1 = calcPGs.pgEDCalc.h1.dataView.getItems();
      let arH2 = calcPGs.pgEDCalc.h2.dataView.getItems();

      if (arH1 && arH2) {
        var resultCalcObj = calcWageAndMaterialCost(args['item'], args['item']);
        arH2[0]['ec_material_cost'] = resultCalcObj.materialCost;
        arH2[0]['ec_calc_wage'] = resultCalcObj.wage;
        calcPGs.pgEDCalc.h1.grid.render();
        calcPGs.pgEDCalc.h2.grid.render();
      }
    }
    var dvitem = dataView.getItem(args['row']);
    dvitem['isDirty'] = true;
    dataView['updateItem'](dvitem.id, dvitem);
    updateAllFooters();
      // grid.render();
    // }
  });
  $(grid.getHeaderRow()).on('change keyup input', ':input', function (e) {
    var columnId = $(this).data('columnId');
    if (columnId !== null) {
      columnFilters[columnId] = $.trim($(this).val());
      dataView.refresh();
    }
  });
  grid.onHeaderRowCellRendered.subscribe(function (e, args) {
    $(args['node']).empty();
    $('<input type="text">')
      .data('columnId', args['column']['id'])
      .val(columnFilters[args['column']['id']])
      .attr('data-columnId', args['column']['id'])
      .appendTo(args['node']);
  });
  grid.onSort.subscribe(function (e, args) {
    var items = dataView.getItems();
    // フォーマッターが指定されていれば適用
    if (args['sortCol']['formatter']) {
      for (var i = 0; i < items.length; i++) {
        items[i][args['sortCol']['field']] = args['sortCol']['formatter'](null, null, items[i][args['sortCol']['field']], args['sortCol'], dataView.getItemById(items[i].id))['value'];
      }
    }
    // 数値または文字列でソート
    var field = args['sortCol']['field'];
    var sign = args['sortAsc'] ? 1 : -1;
    var value1 = '';
    var value2 = '';
    items.sort(function (dataRow1, dataRow2) {
      if (field === 'USER_CD') {
        value1 = parseInt(dataRow1[field]);
        value2 = parseInt(dataRow2[field]);
      } 
      // if (field === "ppd_quantity") {
      //   // decimal型は文字列として判定してしまうため、別途処理
      //   value1 = parseFloat(dataRow1[field]) ? parseFloat(dataRow1[field]) : '', value2 = parseFloat(dataRow2[field]) ? parseFloat(dataRow2[field]) : '';
      // } else {
      //   value1 = dataRow1[field] ? dataRow1[field] : '', value2 = dataRow2[field] ? dataRow2[field] : '';
      // }
      // Default値修正
      value1 = dataRow1[field];
      value2 = dataRow2[field];
      var result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
      if (result !== 0) {
        return result;
      }
    });
    dataView.setItems(items);
  });
  grid.onColumnsReordered.subscribe(function (e, args) {
    updateAllFooters();
  });
  grid.onValidationError.subscribe(function (e, args) {
    window.alert('[' + args['column']['name'] + ']の入力内容が正しくありません: ' + args['validationResults']['msg']);
  });
  grid.init();
  dataView.beginUpdate();
  dataView.setItems(data);
  dataView.setFilter(filter);
  dataView.endUpdate();
  //updateAllFooters();
}

/**
 * グリッドを再描画する
 * @alias PlannerGrid.prototype.redraw
 */
PlannerGrid.prototype.redraw = function () {
  this.grid.resetActiveCell();
  this.grid.invalidateAllRows();
  this.grid.resizeCanvas();
};

/**
 * グリッド内容のバリデーションを行う
 * @return {boolean} 行内容全てについてのバリデーション成功時にtrue, 失敗時にfalseを返す
 * @alias PlannerGrid.prototype.validateItems
 */
PlannerGrid.prototype.validateItems = function () {
  var cols = this.grid.getColumns();
  var items = this.dataView.getItems();
  var leafissue = 0;
  var isInvalid = false;
  if (items.length === 0) {
    return true;
  }
  isInvalid = items.some(function (elem) {
    var foundInvalidItem = false;
    for (var c in cols) {
      var col = cols[c];
      if (col['validator']) {
        var result = col['validator'](elem[col['field']], elem, col);
        if(!result['valid']){
          window.alert('[' +col['name'] + ']の入力内容が正しくありません: ' + result['msg']);
          foundInvalidItem = true;
          break;
        }
      }
      if (elem['isDeleted']) {
        if (elem['leaf_issued']) {
          window.alert('リーフ発行済みのデータは削除できません: ' + result['msg']);
          foundInvalidItem = true;
          break;
        }
      } 
    }
    return foundInvalidItem;
  });
  return !isInvalid;
};

/**
 * データ項目をグリッドに設定して再描画する
 * @param {Array} items グリッドのDataViewに設定するデータ項目の配列
 */
PlannerGrid.prototype.setItemsAndRefresh = function (items) {
  this.dataView.setItems(items);
  this.dataView.refresh();
  this.grid.setSortColumns([]);
};

/**
 * 生産管理システム編集画面オブジェクト
 * @param {PlannerGrid} headerPG ヘッダーのPlannerGrid
 * @param {PlannerGrid} detailPG 明細のPlannerGrid
 * @param {PlannerGrid} mainPG メイン画面のPlannerGrid
 * @constructor
 */
function PGHeaderDetail(headerPG, detailPG, mainPG) {
  /**
   * @type {PGHeaderDetail}
   * @instance
   */
  var self = this;
  /**
   * ヘッダー
   * @type {PlannerGrid}
   * @instance
   */
  this.h = headerPG;
  /**
   * 明細
   * @type {PlannerGrid}
   * @instance
   */
  this.d = detailPG;
  /**
   * メイン画面で対応するPlannerGrid
   * @type {PlannerGrid}
   * @instance
   */
  this.m = mainPG;
}

/**
 * ヘッダー2つの場合
 * @param {PlannerGrid} headerPG1 
 * @param {PlannerGrid} headerPG2 
 * @param {PlannerGrid} detailPG1 
 * @param {PlannerGrid} detailPG2 
 * @param {PlannerGrid} mainPG 
 */
function PGDoubleHeaderDetail(headerPG1, headerPG2, detailPG1, detailPG2, mainPG) {
  /**
   * @type {PGHeaderDetail}
   * @instance
   */
  var self = this;
  /**
   * ヘッダー
   * @type {PlannerGrid}
   * @instance
   */
  this.h1 = headerPG1;
  /**
   * ヘッダー
   * @type {PlannerGrid}
   * @instance
   */
  this.h2 = headerPG2;
  /**
   * 明細
   * @type {PlannerGrid}
   * @instance
   */
  this.d1 = detailPG1;
    /**
   * 明細
   * @type {PlannerGrid}
   * @instance
   */
  this.d2 = detailPG2;
  /**
   * メイン画面で対応するPlannerGrid
   * @type {PlannerGrid}
   * @instance
   */
  this.m = mainPG;
}

