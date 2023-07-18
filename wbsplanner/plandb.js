'use strict';

/**
 * @fileOverview 計画画面用通信オブジェクト
 * @author Fumihiko Kondo
 */

/** Ajax通信の設定 */
function setupAjax() {
  $.ajaxSetup({
    'cache': false,
    trycnt: 0,
    // Ajax通信が失敗した場合
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      var self = this;
      // エラーメッセージの表示
      console.log('通信エラー。(' + self.trycnt + '/1)');
      console.log(self['data']);
      console.log(XMLHttpRequest);
      console.log(textStatus);
      console.log(errorThrown);
      self.trycnt++;
      if (self.trycnt <= 1) {
        $.ajax(self);
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
 * サーバに文字列情報を送る
 * @param {string} str サーバに送信する情報
 */
function reportMsg(str) {
  var dat = {
    'postdata': 'reportMsg',
    'sdatjson': JSON.stringify(str)
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    trycnt: 0,
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      var self = this;
      self.trycnt++;
      if (self.trycnt <= 1) {
        $.ajax(self);
      }
      return;
    }
  });
}

/**
 * データベースから読込を実行する
 * @param {PlannerGrid} pg
 * @param {*=} option
 */
function readdata(pg, option, callback) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'read' + pg.divId,
    'option': option,
  };  
  $.ajax({
    'timeout': 60000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data || "null");
      var i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
          if ('e_customer_cd' in elem) {
            elem['e_customer_cd_BEFORE'] = elem['e_customer_cd'];
          }
          // 納品書一覧から遷移の場合は前回値として数量と納品金額を保持
          // if ('s_desired_delivery_date' in elem) {
          //   elem['s_desired_delivery_date_BEFORE'] = elem['s_desired_delivery_date'];
          // }
          // 出荷予定データの出荷実績登録時に、以前のデータがあった場合は、締日の更新が必要なため
          if ('s_shipping_plan_date' in elem) {
            elem['s_shipping_plan_date_BEFORE'] = elem['s_shipping_plan_date'];
          }
          if ('s_shipping_date' in elem) {
            elem['s_shipping_date_BEFORE'] = elem['s_shipping_date'];
          }
          if ('s_bill_close_date' in elem) {
            elem['s_bill_close_date_BEFORE'] = elem['s_bill_close_date'];
          }
          if ('s_payment_plan_date' in elem) {
            elem['s_payment_plan_date_BEFORE'] = elem['s_payment_plan_date'];
          }
          
          if ('sd_qty_delivery' in elem) {
            elem['sd_qty_delivery_BEFORE'] = elem['sd_qty_delivery'];
          }
          if ('sd_delivery_price' in elem) {
            elem['sd_delivery_price_BEFORE'] = elem['sd_delivery_price'];
          }
          // 製造指示データの場合は前回値取得
          if ('pd_disp_order' in elem) {
            elem['pd_disp_order_BEFORE'] = elem['pd_disp_order'];
          }

          // 発注・委託データの場合は発注数量
          if ('moed_quantity' in elem) {
            elem['moed_quantity_BEFORE'] = elem['moed_quantity'];
          }
          if ('moed_unit_qty' in elem) {
            elem['moed_unit_qty_BEFORE'] = elem['moed_unit_qty'];
          } 
          if ('moed_sales_price' in elem) {
            elem['moed_sales_price_BEFORE'] = elem['moed_sales_price'];
          }
          if ('moed_tax_sum' in elem) {
            elem['moed_tax_sum_BEFORE'] = elem['moed_tax_sum'];
          }


          
        });
        pg.columns.forEach(function (col) {
          // 主キーの前回値を代入
          if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK']) {
            // || col['isHeader']
            objs.forEach(function (elem) {
              elem[col['id'] + '_PREVVAL'] = elem[col['id']];
            });
          }
          // Decimal型の場合、StringからNumberに変換する
          if (col['coltype'] === 'decimal') {
            var numcol = col['id'];
            objs.forEach(function (elem) {
              elem[numcol] = Number(elem[numcol]);
            });
          }
        });
        pg.clearFilters();
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();//grid.render();
        pg.displayIndicator(false);

        // データ取得後の追加処理
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}

/**
 * データベースから無制限で読込を実行する
 * @param {PlannerGrid} pg
 * @param {*=} option
 */
function readUnlimited(pg, option, callback) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'readUnlimited' + pg.divId,
    'option': option,
  };  
  $.ajax({
    'timeout': 120000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data || "null");
      var i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
          if ('e_customer_cd' in elem) {
            elem['e_customer_cd_BEFORE'] = elem['e_customer_cd'];
          }
          // 発注・委託データの場合は発注数量
          if ('moed_quantity' in elem) {
            elem['moed_quantity_BEFORE'] = elem['moed_quantity'];
          }
          if ('moed_unit_qty' in elem) {
            elem['moed_unit_qty_BEFORE'] = elem['moed_unit_qty'];
          } 
          if ('moed_sales_price' in elem) {
            elem['moed_sales_price_BEFORE'] = elem['moed_sales_price'];
          }
          if ('moed_tax_sum' in elem) {
            elem['moed_tax_sum_BEFORE'] = elem['moed_tax_sum'];
          }
        });
        pg.columns.forEach(function (col) {
          // 主キーの前回値を代入
          if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK']) {
            // || col['isHeader']
            objs.forEach(function (elem) {
              elem[col['id'] + '_PREVVAL'] = elem[col['id']];
            });
          }
          // Decimal型の場合、StringからNumberに変換する
          if (col['coltype'] === 'decimal') {
            var numcol = col['id'];
            objs.forEach(function (elem) {
              elem[numcol] = Number(elem[numcol]);
            });
          }
        });
        pg.clearFilters();
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();//grid.render();
        pg.displayIndicator(false);

        // データ取得後の追加処理
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}

/**
 * データの削除処理
 * @param {PlannerGrid} pg
 */
function deletedata(pg, data) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'delete' + pg.divId,
    'sdatjsondetail': JSON.stringify(data), 
  };  
  return $.ajax({
    'timeout': 60000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}

/**
 * データベースから読込を実行する
 * @param {PlannerGrid} pg
 * @param {*=} option
 */
 function returnReadData(pg, option) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'read' + pg.divId,
    'option': option,
  };  
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data || "null");
      var i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
          if ('e_customer_cd' in elem) {
            elem['e_customer_cd_BEFORE'] = elem['e_customer_cd'];
          }
          // 納品書一覧から遷移の場合は前回値として数量と納品金額を保持
          // if ('s_desired_delivery_date' in elem) {
          //   elem['s_desired_delivery_date_BEFORE'] = elem['s_desired_delivery_date'];
          // }
          if ('s_shipping_plan_date' in elem) {
            elem['s_shipping_plan_date_BEFORE'] = elem['s_shipping_plan_date'];
          }
          if ('sd_qty_delivery' in elem) {
            elem['sd_qty_delivery_BEFORE'] = elem['sd_qty_delivery'];
          }
          if ('sd_delivery_price' in elem) {
            elem['sd_delivery_price_BEFORE'] = elem['sd_delivery_price'];
          }
          // 製造指示データの場合は前回値取得
          if ('pd_disp_order' in elem) {
            elem['pd_disp_order_BEFORE'] = elem['pd_disp_order'];
          }

          // 発注・委託データの場合は発注数量
          if ('moed_quantity' in elem) {
            elem['moed_quantity_BEFORE'] = elem['moed_quantity'];
          }
          if ('moed_unit_qty' in elem) {
            elem['moed_unit_qty_BEFORE'] = elem['moed_unit_qty'];
          }           
        });
        pg.columns.forEach(function (col) {
          // 主キーの前回値を代入
          if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK']) {
            // || col['isHeader']
            objs.forEach(function (elem) {
              elem[col['id'] + '_PREVVAL'] = elem[col['id']];
            });
          }
          // Decimal型の場合、StringからNumberに変換する
          if (col['coltype'] === 'decimal') {
            var numcol = col['id'];
            objs.forEach(function (elem) {
              elem[numcol] = Number(elem[numcol]);
            });
          }
        });
        pg.clearFilters();
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();//grid.render();
        pg.displayIndicator(false);
      }
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}

/**
 * 入出庫予定データ読込
 * @param {*} pg 
 * @param {*} option 
 */
function readSTPlanData(pg, option) {
  pg.displayIndicator(true);
  let dat = {
    'postdata': 'readSTPlan',
    'option': option,
  }; 
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data || "null");
      var i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
        });
        pg.columns.forEach(function (col) {
          // 主キーの前回値を代入
          if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK']) {
            // || col['isHeader']
            objs.forEach(function (elem) {
              elem[col['id'] + '_PREVVAL'] = elem[col['id']];
            });
          }
          // Decimal型の場合、StringからNumberに変換する
          if (col['coltype'] === 'decimal') {
            var numcol = col['id'];
            objs.forEach(function (elem) {
              elem[numcol] = Number(elem[numcol]);
            });
          }
        });
        pg.clearFilters();
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();//grid.render();
        pg.displayIndicator(false);
      }
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  }); 
}


/***
 * 在庫データ表示
 */
function readStockData(pg, tblName, option) {
  pg.displayIndicator(true);
  let productCD = '';
  // pg.displayIndicator(true);
  let activeRow = [];
  // if (pg.divId === 'Currentstock') {
  //   let activeRow = mainPGs.pgST.getActiveRow();
  //   if(!isSet(activeRow)) {
  //     productCD = '';
  //   } else {
  //     productCD = activeRow['stc_product_cd'];
  //   }
  // }
  if (tblName === 'ED') {
    activeRow = editPGs.pgED.d.getActiveRow();
    productCD = activeRow['ed_p_cd'];
  } else if (tblName === 'SD') {
    activeRow = editPGs.pgSD.d.getActiveRow();
    productCD = activeRow['sd_p_cd'];
  } 
  var dat = {
    'postdata': 'read' + pg.divId,
    'sdatjson': productCD,
    'option': option,
  }; 
  return $.ajax({
    timeout: 10000,
    url: 'db.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    pg.displayIndicator(false);
    console.log("在庫データ取得に失敗しました。");
  }); 
}

/**
 * 在庫データの予定セット
 * @param {*} pg 
 * @param {*} option 
 */
function setExpectStock(pg, option) {
  // 表示データ取得
  let pgDetail = [];
  if (pg.divId === 'Currentstock') {
    pgDetail = pg.dataView.getItems();
  }
  var dat = {
    'postdata': 'readExpectStock',
    'sdatjson': pgDetail,
    'option': option,
  }; 
  return $.ajax({
    timeout: 10000,
    url: 'db.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("在庫予定データ取得に失敗しました。");
  }); 
}

/**
 * 見積計算データ取得
 * @param {plannerGrid} pg 
 * @param {*} pgEditData 
 * @param {*} option 
 */
function readDataEDCalc(pg, pgEditData, option) {
  var dat = {
    'postdata': 'readEDCalc',
    'sdatjson': JSON.stringify(pgEditData),
    'option': option,
  };  
  return $.ajax({
    timeout: 10000,
    url: 'db.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("見積計算データ取得に失敗しました。");
  });
}


/**
 * 指図金網データ取得
 * @param {*} pg 
 * @param {*} pgEditData 
 * @param {*} option 
 */
function readProdPlansWire(pgEditData) {
  var dat = {
    'postdata': 'readProdPlansWire',
    'sdatjson': JSON.stringify(pgEditData),
  };  
  return $.ajax({
    timeout: 20000,
    url: 'db.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("指図金網データ取得に失敗しました。");
  });
}


/***
 * 在庫引当画面読込
 */
function readDataStock(pg, row, option) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'readAssignStock',
    'row': JSON.stringify(row),
    'option': option,
  }; 
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      let objs = JSON.parse(data || "null");
      let i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
        });
        // 空の時は空のデータ行を前もって追加しておく
        if (objs.length <= 0) {
          for(let j = 0; j < 15; j++) {
            objs[j] = {
              'id': j + 1,
            }
          }
        }
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();
        pg.displayIndicator(false);
      } 
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}


/***
 * 製造使用材料もしくは、製品
 */
function readManufacturingUseProduct(pg, row) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'readManufacturingUseProduct',
    'row': JSON.stringify(row),
  }; 
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      let objs = JSON.parse(data || "null");
      let i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
        });
        // 空の時は空のデータ行を前もって追加しておく
        if (objs.length <= 0) {
          for(let j = 0; j < 15; j++) {
            objs[j] = {
              'id': j + 1,
            }
          }
        }
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();
        pg.displayIndicator(false);
      } 
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}


/**
 * 
 * @param {*} cat 中分類
 * @param {*} row 選択行データ
 */
function readDetailStock(pg, cat, row) {
  // pg.displayIndicator(true);
  var dat = {
    'postdata': 'readDetailStock',
    'category': JSON.stringify(cat),
    'row': JSON.stringify(row),
  }; 
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data || "null");
      var i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
        });
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();
      }
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      // pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}


/***
 * 加工内容データ取得
 */
function readSettingProc(pg, row, option) {
  pg.displayIndicator(true);
  var dat = {
    'postdata': 'readSettingProc',
    'row': JSON.stringify(row),
    'option': option,
  };  
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data || "null");
      var i = 0;
      if (objs) {
        objs.forEach(function (elem) {
          elem['id'] = i++;
        });
        pg.columns.forEach(function (col) {
          // 主キーの前回値を代入
          if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK']) {
            // || col['isHeader']
            objs.forEach(function (elem) {
              elem[col['id'] + '_PREVVAL'] = elem[col['id']];
            });
          }
          // Decimal型の場合、StringからNumberに変換する
          if (col['coltype'] === 'decimal') {
            var numcol = col['id'];
            objs.forEach(function (elem) {
              elem[numcol] = Number(elem[numcol]);
            });
          }
        });
        pg.dataView.setItems(objs);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();
        pg.displayIndicator(false);
      } else {
        let data = [];
        for (let i = 0; i < 20; i++) {
          data[i] = {
            'id': i + 1,
            'isDirty': false,
            'isNewRow': false,
          };
        }
        pg.dataView.setItems(data);
        pg.grid.setSortColumns([]);
        pg.grid.setSelectedRows([]);
        pg.grid.invalidate();
        pg.displayIndicator(false);
      }
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      alert('データ取得に失敗しました。');
      pg.displayIndicator(false);
      console.log("jqXHR          : " + jqXHR.status);
      console.log("textStatus     : " + textStatus);
      console.log("errorThrown    : " + errorThrown.message);
    }
  });
}


/***
 * 工程内容詳細を更新
 */
function updateProdplansproc(pg, option) {
  let dat = {
    'postdata': 'updateProdplansproc',
    'sdatjson': JSON.stringify(pg.dataView.getItems()),
    'option': option,
  };
  return $.ajax({
    timeout: 30000,
    url: 'db.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("加工内容のデータ更新に失敗しました。");
  });

}


// 最新受注番号取得
function getEstimateNo(str, func) {
  var dat = {
    'postdata': 'ajaxGetEstimateNo',
    'sdatjson': JSON.stringify(str)
  };
  return $.ajax({
      timeout: 10000,
      url: 'db.php',
      type: 'POST',
      dataType: 'json',
      data: dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("見積書番号の採番に失敗しました");
  });
}

// 最新製造指示番号取得
function getProdPlanNo() {
  let dat = {
    'postdata': 'getProdPlanNo',
  };
  return $.ajax({
    'timeout': 3000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("製造指示番号の採番に失敗しました");
  });
}

// 最新納品書連番取得
function getStatementSerialNo(str, func) {
  let dat = {
    'postdata': 'ajaxGetStatementSerialNo',
    'sdatjson': JSON.stringify(str)
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("納品書連番の採番に失敗しました");
  });
}

function getEDShipSubNo(array, func) {
  let dat = {
    'postdata': 'ajaxGetEDShipSubNo',
    'sdatjsonheader': JSON.stringify(array)
  };
  return $.ajax({
    'timeout': 3000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("出荷枝番の採番に失敗しました");
  });
}


// 発注連番取得
function getMoedSerialNo(func) {
  let dat = {
    'postdata': 'ajaxGetMoedSerialNo',
  };
  return $.ajax({
    'timeout': 10000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("発注番号の採番に失敗しました");
  });
}

function existEstimateNo(refno) {
  let dat = {
    'referno': refno,
    'postdata': 'existEstimateNo',
  };
  return $.ajax({
    'timeout': 10000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("受注番号の存在確認に失敗しました。");
  });
}

function existProdplansWire(pgHeader, option) {
  let dat = {
    'postdata': 'existProdplansWire',
    'sdatjson': JSON.stringify(pgHeader)
  };
  return $.ajax({
    'timeout': 3000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("指図金網のデータ取得に失敗しました。");
  });
}


/**
 * データベースに書込を実行する
 * @param {PlannerGrid} pg
 * @param {Function=} svrfuncAfterUpdate
 */
function updatedata(pg, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var dat = {
    'postdata': 'update' + pg.divId,
    'sdatjson': JSON.stringify(getDirtyData(pg.dataView))
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      if (pg.divId !== 'Product' || pg.divId !== 'Storage') {
        if (data == null || data == '' || data == undefined) {
          window.alert('登録に失敗しました。');
          return;
        } 
      }
      var resp = JSON.parse(data);
      if (resp['succeed'] === true) {
        window.alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate(pg);
        }
      }
      if (resp['msg'] !== '') {
        window.alert(resp['msg']);
      }
    }
  });
}

// 受注画面の新規登録 or 更新か判別するフラグ
let isNewRegistration;

/**
 * データベースに書込を実行する(明細及びヘッダデータ)
 * @param {PlannerGrid} pgHeader
 * @param {PlannerGrid} pgDetail
 * @param {Function=} svrfuncAfterUpdate
 */
function updatedetaildata(pgHeader, pgDetail, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetail = pgDetail.dataView.getItems();
  let arData = {};
  let recCnt = 0;
  isNewRegistration = false;  // フラグ初期化
  // 入力前に確認する項目については下記で確認。エラーは出すがそのままスルーするものについてもここに記載
  if (pgHeader.divId === 'EditEDHeader') {
    // 見積データ
    for (let i = 0; i < arDetail.length; i++) {
      if (isSet(arDetail[i]['ed_p_cd'])) {
        arData[i] = arDetail[i];
        recCnt++;
      }
    }
    if (recCnt === 0) {
      alert('明細データを設定してください。');
      return;
    }
  } 
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }

  // 新規登録の場合（受注Noが空）のみ、登録時に発注Noの採番を行う
  if (!isSet(arHeader[0]['e_estimate_no'])) {
    isNewRegistration = true;
  }
  updateLatestEstimateNo(arHeader[0]['e_customer_cd'], arHeader[0]['e_estimate_date'], function() {
    // // 変更されたデータがない場合は戻る
    // if (!IsDirtyCheck(pgHeader) && !IsDirtyCheck(pgDetail)) {
    //   return;
    // }
    // サーバにデータを送信して、入力内容を反映
    var dat;
    if (pgHeader.divId !== 'EditEDHeader') {
      dat = { 
        'postdata': 'update' + pgDetail.divId,
        'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), 
        'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), 
      };
    } else {
      dat = { 
        'postdata': 'update' + pgDetail.divId,
        'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), 
        'sdatjsondetail': JSON.stringify(arData), 
      };
    }
    $.ajax({
      'timeout': 30000,
      'type': 'POST',
      'url': 'db.php',
      'data': dat,
      'success': function (data, dataType) {
        // var resp = JSON.parse(data || "null");
        var resp = JSON.parse(data);
        if (resp['succeed'] === true) {
          window.alert('登録が完了しました。');
          // $('.message').animate({ opacity: 1.0 }, 500).fadeOut();
          if (svrfuncAfterUpdate) {
            svrfuncAfterUpdate();
          }
          // マスタ再読込
          readMaster();
        } else if (resp['succeed'] === false) {
          if (resp['msg'] !== '') {
            window.alert(resp['msg']);
          } else {
            alert('登録に失敗しました。');
          }
        }
      },
      'error': function (e) {
        console.log(e);
      }
    });
  });
}

/**
 * 最新の受注Noを採番する
 */
function updateLatestEstimateNo (cstCD, estDate, callback) {
  // 新規登録の場合は発注Noを採番する
  if (isNewRegistration) {
    // 今日の最大連番取得
    let today = new Date(estDate);
    let y = ("00" + today.getFullYear()).slice(-2);
    let m = ("00" + (today.getMonth() + 1)).slice(-2);
    let d = ("00" + today.getDate()).slice(-2);
    let strDate = y + m + d;
    let strEstimateNo = strDate + cstCD;
    getEstimateNo(strEstimateNo).done(function (data, textStatus, jqXHR) {
      let serialNo = '01';
      // 現在の番号
      if (!data[0]['maxno']) {
        serialNo = '01';
      } else {
        let num = data[0]['maxno'].slice(9);
        serialNo = ('00' + (Number(num) + 1)).slice(-2);
      }
  
      const headerList = editPGs.pgED.h.dataView.getItems();
      // 受注Noを既存データにセットする
      for (let i = 0; i < headerList.length; i++) {
        headerList[i]['e_estimate_no'] = strEstimateNo + serialNo;
      }
      editPGs.pgED.h.dataView.setItems(headerList);
      callback();
    });
  } else {
    // 更新の場合は受注Noを採番しない
    callback();
  }
}

function updateProdPlans(pgHeader, pgDetail) {
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }
  let arDetail = pgDetail.dataView.getItems();
  let arData = {};
  let recCnt = 0;
  // 入力前に確認する項目については下記で確認。エラーは出すがそのままスルーするものについてもここに記載
  for (let i = 0; i < arDetail.length; i++) {
    if (isSet(arDetail[i]['pd_p_cd'])) {
      arData[i] = arDetail[i];
      recCnt++;
    }
  }
  if (recCnt === 0) {
    alert('明細データを設定してください。');
    return;
  }
  // 変更されたデータがない場合は戻る
  // データ削除、データ追加の場合ここでリターンされるので、コメントアウト
  // if (!IsDirtyCheck(pgHeader) && !IsDirtyCheck(pgDetail)) {
  //   return;
  // }
  let dat = {
    'postdata': 'updateProdPlans',
    'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()),  
    'sdatjsondetail': JSON.stringify(arData), 
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("データ登録に失敗しました。");
    alert('データ登録に失敗しました。');
  });
}



/***
 * 製造指示取消
 */
function cancelProdplans(pg) {
  let activeRows = [];
  let rowsData = pg.grid.getData().getFilteredItems();
  let nIndex = pg.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRows.push(rowsData[nIndex[i]]);
  }

  let dat = {
    'postdata': 'cancelProdplans',
    'sdatjson': JSON.stringify(activeRows),  
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("データ登録に失敗しました。");
    alert('データ登録に失敗しました。');
  });
}

/**
 * 金網製造指図データ登録
 * @param {*} pgHeader1 
 * @param {*} pgHeader2 
 * @param {*} pgDetail1 
 * @param {*} pgDetail2 
 * @param {*} option 
 */
function updateCalcProdPlans(pgHeader1, pgHeader2, pgDetail1, pgDetail2, option) {
  let dat = {
    'postdata': 'updateCalcProdplans',
    'sdatjsonheader1': JSON.stringify(pgHeader1.dataView.getItems()), 
    'sdatjsonheader2': JSON.stringify(pgHeader2.dataView.getItems()), 
    'sdatjsondetail1': JSON.stringify(pgDetail1.dataView.getItems()), 
    'sdatjsondetail2': JSON.stringify(pgDetail2.dataView.getItems()), 
    'option': option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("データ登録に失敗しました。");
    alert('データ登録に失敗しました。');
  });
}

/**
 * 外注委託udpate
 * @param {*} pgHeader 
 * @param {*} pgDetail 
 * @param {*} mode 
 * @param {*} dbstatus  データ更新の場合１
 * 
 */
function updateDetailDataOOD(pgHeader, pgDetail, mode, dbstatus = '1') {

  let arDetail = pgDetail.dataView.getItems();
  let arData = [];
  let recCnt = 0;
  let strNo = '';  // 発注番号
  let nSubCnt = 0;
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems() || !pgDetail.validateItems()) {
    return;
  }
  
  // 表示データ取得
  for (let i = 0; i < arDetail.length; i++) {
    if (isSet(arDetail[i]['moed_product_cd'])) {
      // 製品コードがあるレコードのみ保持
      arData[i] = arDetail[i];
    }
  }
  // 委託発注データ
  let dat = {
    'postdata': 'update' + pgDetail.divId,
    'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()),
    'sdatjsondetail': JSON.stringify(arData),
    'mode': mode, 
    'dbstatus': dbstatus,
  }
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    alert('委託データ登録に失敗しました。');
  });
}


// 発注画面の新規登録 or 更新か判別するフラグ
let isMoedNewRegistration = false;

/**
 * データベースに書込を実行する(明細及びヘッダデータ)
 * @param {PlannerGrid} pgHeader
 * @param {PlannerGrid} pgDetail
 * @param {Integer} mode  発注・検収登録:1　発注登録のみ:0  部分検収:2
 * @param {String} dbstatus  DBステータス。0:新規登録、1:更新
 * @param {Function=} svrfuncAfterUpdate
 */
function updatedetaildataMOD(pgHeader, pgDetail, mode, dbstatus, svrfuncAfterUpdate) {
  let bOrderFlg = false;
  let bAcceptFlg = false;
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems() || !pgDetail.validateItems()) {
    return;
  }

  // 新規登録の場合のみ、登録時に発注Noの採番を行う
  updateLatestMoedOrderNo(function () {
    // 表示データ取得
    let arDetail = pgDetail.dataView.getItems();
    let arData = [];
    for (let i = 0; i < arDetail.length; i++) {
      if (isSet(arDetail[i]['moed_product_cd'])) {
        // 製品コードがあるレコードのみ保持
        arData[i] = arDetail[i];
      }
    }
    // サーバにデータを送信して、入力内容を反映
    var dat;
    // 発注データ
    dat = {
      'postdata': 'update' + pgDetail.divId,
      'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()),
      'sdatjsondetail': JSON.stringify(arData),
      'mode': JSON.stringify(mode), 
      'dbstatus': dbstatus, 
    }
    $.ajax({
      'timeout': 30000,
      'type': 'POST',
      'url': 'db.php',
      'data': dat,
      'success': function (data, dataType) {
        var resp = JSON.parse(data || "null");
        if (resp['succeed'] === true) {
          window.alert('登録が完了しました。');
          if (svrfuncAfterUpdate) {
            svrfuncAfterUpdate();
          }
        } else {
          if (resp['msg'] !== '') {
            window.alert(resp['msg']);
          } else {
            window.alert('エラーが発生しました');
          }
        }
      },
      'error': function (jqXHR, textStatus, errorThrown) {
        console.log('データ登録に失敗しました。');
        console.log("jqXHR          : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
      }
    });
  });
}

/**
 * 最新の発注Noを採番する
 */
function updateLatestMoedOrderNo (callback) {
  // 新規登録の場合は発注Noを採番する
  if (isMoedNewRegistration) {
    // 今日の最大連番取得
    let today = new Date();
    let y = ("00" + today.getFullYear()).slice(-2);
    let m = ("00" + (today.getMonth() + 1)).slice(-2);
    let d = ("00" + today.getDate()).slice(-2);
    let strDate = y + m + d;
    let strOrderNo = 'H' + strDate + '0001';
    getMoedSerialNo().then(function (data, textStatus, jqXHR) {
      let resp = JSON.parse(data);
      if (resp[0]['maxno'] !== null) {
        strOrderNo = 'H' + String((Number(resp[0]['maxno']) + 1));
      }

      const headerList = editPGs.pgMOD.h.dataView.getItems();
      const detailList = editPGs.pgMOD.d.dataView.getItems();
      // 発注Noを既存データにセットする
      for (let i = 0; i < headerList.length; i++) {
        headerList[i]['moed_order_no'] = strOrderNo;
      }
      for (let i = 0; i < detailList.length; i++) {
        detailList[i]['moed_order_no'] = strOrderNo;
      }

      editPGs.pgMOD.h.dataView.setItems(headerList);
      editPGs.pgMOD.d.dataView.setItems(detailList);

      callback();
    });
  } else {
    // 編集画面での更新の場合は発注Noを採番しない
    callback();
  }
}

/**
 * 入庫登録
 * @param {*} pgHeader 
 * @param {*} pgDetail 
 * @param {*} mode  0:入庫登録　1:発注・入庫同時登録　数値
 * @param {*} svrfuncAfterUpdate 
 */
function updateDetailDataMST(pgHeader, pgDetail, mode, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetail = pgDetail.dataView.getItems();
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }
  // データチェック
  if(!isSet(arHeader[0]['moed_arrival_hd_date'])) {
    alert('入荷日を入力してください。');
    return;
  }
  if (mode === 0) {
    // 入庫登録の場合のみ発注処理チェック
    if(!isSet(arHeader[0]['moed_order_sign']) || arHeader[0]['moed_order_sign'] === '0') {
      alert('発注書未発行です。');
      return;
    }
  }

  let subNo = 1;
  let qty1 = 0; 
  let qty2 = 0;
  let arBeforeQty = [];
  let arQty = [];
  let flgMatchQty = true;

  // // 合計値が、登録されている発注数量と異なる場合アラート表示
  // const qtytest = arDetail.reduce((sum, i) => sum + i.moed_unit_qty_BEFORE, 0);
  // const qtytest2 = arDetail.reduce((sum, i) => sum + i.moed_unit_qty_BEFORE, 0);

  for (let i = 0; i < arDetail.length; i++) {
    // 入荷数データチェック
    if (arDetail[i]['moed_stock_qty'] <= 0) {
      alert('入荷数を入力してください');
      return;
    }
    // 在庫管理対象データかつ、すでに入荷登録済みのデータは更新させない。（取消後に再度、入庫登録してもらう）
    if (arDetail[i]['moed_type_02'] == '1' && arDetail[i]['moed_inventory_type'] == '1') {
      alert('在庫マスタにデータが重複する恐れがあります。\n入庫取消後、再度入庫登録をして下さい。');
      return;
    }
    if (subNo === 1) {
      subNo = parseInt(arDetail[i]['moed_sub_no']);
      arBeforeQty[arDetail[i]['moed_sub_no']] = 0;
      arQty[arDetail[i]['moed_sub_no']] = 0;
    }
    if (arDetail[i]['moed_sub_no'] === ( '000' + subNo ).slice( -3 )) {
      qty1 = isSet(arDetail[i]['moed_unit_qty_BEFORE']) ? parseFloat(arDetail[i]['moed_unit_qty_BEFORE']) : 0;
      qty2 = isSet(arDetail[i]['moed_unit_qty']) ? parseFloat(arDetail[i]['moed_unit_qty']) : 0;
      arBeforeQty[arDetail[i]['moed_sub_no']] = qty1 + arBeforeQty[arDetail[i]['moed_sub_no']]; 
      arQty[arDetail[i]['moed_sub_no']] += qty2;
    } else {
      subNo = parseInt(arDetail[i]['moed_sub_no']);
      arBeforeQty[arDetail[i]['moed_sub_no']] = 0;
      arQty[arDetail[i]['moed_sub_no']] = 0;
    }
  }

  for (let i = 0; i < arBeforeQty.length; i++) {
    if (arBeforeQty[( '000' + i ).slice( -3 )] !== arQty[( '000' + i ).slice( -3 )]) {
      if (!confirm('発注時の合計数量と異なりますがよろしいですか')) {
        return;
      } else {
        flgMatchQty = false;
      }
    }
  }

  // 2023/3/6　取引数量と単価数量が異なっていても入庫報告できるように以下コメントアウト
  // for (let i = 0; i < arDetail.length; i++) {
  //   if (!isSet(arDetail[i]['moed_unit_qty']) && !isSet(arDetail[i]['moed_stock_qty'])) {
  //     continue;
  //   }
  //   if (parseFloat(arDetail[i]['moed_unit_qty']) !== parseFloat( arDetail[i]['moed_stock_qty'])) {
  //     // 差異がある場合

  //     if (mode > 0) {
  //       // 注文・入庫一括
  //       if (Math.ceil(arDetail[i]['moed_stock_qty']) == 0) {
  //         // 0は次回入庫
  //         continue;
  //       }

  //       if (!confirm('発注数量と異なります。入庫数量で更新しますか。')) {
  //         // 入庫数量が異なる場合
  //         return;
  //       }
  //     } else {
  //       // 入庫のみ        
  //       alert('発注数量と異なります。修正をお願いします');
  //       return;
  //     }
  //   }
  // }

  // サーバにデータを送信して、入力内容を反映
  var dat;
  dat = { 
    'postdata': 'update' + pgDetail.divId,
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arDetail), 
    'mode': mode,
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('登録に失敗しました。');
        }
      }
    }
  });
}

/**
 * 入庫取消
 */
function cancelMST (pgHeader, pgDetail, svrfuncAfterUpdate) {
  let arHeader = pgHeader.dataView.getItems();
  let arDetail = pgDetail.dataView.getItems();
  let dat = { 
    'postdata': 'cancelMST',
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arDetail), 
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('入庫の取消が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('入庫の取消に失敗しました。');
        }
      }
    }
  });
}


/***
 * 未受注引当追加・更新
 */
function updateSTPlanReceive(pgHeader, pgDetail, mode, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetail = pgDetail.dataView.getItems();
  let arData = {};
  let recCnt = 0;
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }

  for (let i = 0; i < arDetail.length; i++) {
    // 品番が入っていなかったら対象外
    if (isSet(arDetail[i]['productcd'])) {
      arData[i] = arDetail[i];
      recCnt++;
    }
  }

  // サーバにデータを送信して、入力内容を反映
  var dat;
  dat = { 
    'postdata': 'updateSTPlanReceive',
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arData), 
    'mode': mode,
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('登録に失敗しました。');
        }
      }
    }
  });
}


/***
 * 未受注引当取消
 */
function deleteSTPlanReceive(pgHeader, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  // サーバにデータを送信して、入力内容を反映
  var dat;
  dat = { 
    'postdata': 'deleteSTPlanReceive',
    'sdatjsonheader': JSON.stringify(arHeader), 
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('引当取消が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('引当取消に失敗しました。');
        }
      }
    }
  });
}


/***
 * 製造使用追加・更新
 */
function updateSTPlanProduce(pgHeader, pgDetail, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetailTemp = pgDetail.dataView.getItems();

  // 不要なデータ削除
  let arDetail = arDetailTemp.filter((item) => {
    if (isSet(item['productcd'])) {
      return item;
    }
  });
  
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }

  // サーバにデータを送信して、入力内容を反映
  var dat;
  dat = { 
    'postdata': 'updateSTPlanProduce',
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arDetail), 
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('登録に失敗しました。');
        }
      }
    }
  });
}

/***
 * 製造完了に伴い、StockplanからStockへ移行する。
 */
function transPlanToStock(pgHeader, pgDetail, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetailTemp = pgDetail.dataView.getItems();

  let arDetail = arDetailTemp.filter((item) => {
    if (isSet(item['stc_product_name'])) {
      return item;
    }
  });

  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }

  // サーバにデータを送信して、入力内容を反映
  var dat;
  dat = { 
    'postdata': 'transPlanToStock',
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arDetail), 
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('登録に失敗しました。');
        }
      }
    }
  });
}

function getActiveRowReserveNum(pg, stockPage, row) {
  // サーバにデータを送信して、入力内容を反映
var dat = {
  'postdata': 'getActiveRowReserveNum',
  'stockpage': JSON.stringify(stockPage),
  'sdatjson': JSON.stringify(row),
}; 
$.ajax({
  'timeout': 30000,
  'type': 'POST',
  'url': 'db.php',
  'data': dat,
  'success': function (data, dataType) {
    var objs = JSON.parse(data);
    if (objs && Object.keys(objs).length === 0) {
      row['plannum'] = 0;     
    } else {
      row['plannum'] = objs[0]['plannum'];
    }
    pg.grid.invalidate(); 
  },
  'error': function (jqXHR, textStatus, errorThrown) {
    alert('データ取得に失敗しました。');
    // pg.displayIndicator(false);
    console.log("jqXHR          : " + jqXHR.status);
    console.log("textStatus     : " + textStatus);
    console.log("errorThrown    : " + errorThrown.message);
  }
});
}



/***
 * 在庫調整画面更新
 */
function updateStockAdjust(pgHeader, pgDetail, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetail = pgDetail.dataView.getItems().filter(function (elem) { return elem['isDirty'] === true; });
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }
  let dat = { 
    'postdata': 'updateStockAdjust',
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arDetail), 
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('登録に失敗しました。');
        }
      }
    }
  });
}

/***
 * 在庫移動画面更新
 */
function updateStockTransfer(pgHeader, pgDetail, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let arHeader = pgHeader.dataView.getItems();
  let arDetail = pgDetail.dataView.getItems().filter(function (elem) { return elem['isDirty'] === true; });
  // 入力内容のバリデーションを実行
  if (!pgHeader.validateItems()) {
    return;
  }
  if (!pgDetail.validateItems()) {
    return;
  }
  let dat = { 
    'postdata': 'updateStockTransfer',
    'sdatjsonheader': JSON.stringify(arHeader), 
    'sdatjsondetail': JSON.stringify(arDetail), 
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate();
        }
      } else {
        if (resp['msg'] !== '') {
          alert(resp['msg']);
        } else {
          alert('登録に失敗しました。');
        }
      }
    }
  });
}

function printQR(pgHeader, pgDetail) {
  if (IsDirtyCheck(pgDetail) || IsDirtyCheck(pgHeader)) {
    window.alert('編集中のデータを登録してから、QR発行をしてください。');
    return;
  }
  let ar = pgHeader.dataView.getItems();
  let strSql = 'moed_order_no' + '=' + ar[0]['moed_order_no'];
  // 仕入れ先、発注No、材料品名、ロットNo、重量、入荷日
  window.open('./db.php?req=printQR&' + strSql, '_blank', 'width=400, height=300');
  return;
}

function readQRTest() {
  const video  = document.querySelector('#js-video')
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: {
          exact: 'environment'
        }
      }
    })
    .then(function(stream) {
      video.srcObject = stream
      video.onloadedmetadata = function(e) {
        video.play()
      }
    })
    .catch(function(err) {
      alert('Error!!')
    })
}

// function readQRTest() {
//   var video = document.createElement("video");
//   var canvasElement = document.getElementById("canvas");
//   var canvas = canvasElement.getContext("2d");
//   var loadingMessage = document.getElementById("loadingMessage");
//   var outputContainer = document.getElementById("output");
//   var outputMessage = document.getElementById("outputMessage");
//   var outputData = document.getElementById("outputData");

//   navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
//     video.srcObject = stream;
//     video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
//     video.play();
//     requestAnimationFrame(tick);
//   });
// }

// function tick() {
//   loadingMessage.innerText = "⌛ Loading video..."
//   if (video.readyState === video.HAVE_ENOUGH_DATA) {
//     loadingMessage.hidden = true;
//     canvasElement.hidden = false;
//     outputContainer.hidden = false;

//     canvasElement.height = video.videoHeight;
//     canvasElement.width = video.videoWidth;
//     canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
//     var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
//     var code = jsQR(imageData.data, imageData.width, imageData.height, {
//       inversionAttempts: "dontInvert",
//     });
//     if (code) {
//       drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
//       drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
//       drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
//       drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
//       outputMessage.hidden = true;
//       outputData.parentElement.hidden = false;
//       outputData.innerText = code.data;
//     } else {
//       outputMessage.hidden = false;
//       outputData.parentElement.hidden = true;
//     }
//   }
//   requestAnimationFrame(tick);
// }


// /**
//  * データベースに書込を実行する(明細及びヘッダデータ)
//  * @param {PlannerGrid} pgHeader
//  * @param {PlannerGrid} pgDetail
//  * @param {Function=} svrfuncAfterUpdate
//  */
// function updatedetailDefer(pgHeader, pgDetail) {
//   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
//     return;
//   }
//   // 入力内容のバリデーションを実行
//   if (!pgHeader.validateItems()) {
//     return;
//   }
//   if (!pgDetail.validateItems()) {
//     return;
//   }
//   // 変更されたデータがない場合は戻る
//   if (!IsDirtyCheck(editPGs.pgED.d) && !IsDirtyCheck(editPGs.pgED.h)) {
//     return;
//   }
//   // サーバにデータを送信して、入力内容を反映
//   let dat = {
//     'postdata': 'update' + pgDetail.divId,
//     'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), 
//     'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), 
//   };
//   fetch('db.php', {
//     method:'POST',
//     headers: {
//       'content-type':'application/json',
//     },
//     body: dat,
//   })
//   .then(function (response) {
//     if (response.ok) {
//       return response.text();
//     }
//     throw new error('データ取得に失敗しました');
//   })
//   .catch(function (error) {
//     window.alert('Error:' + error.message);
//   })
// }


// function UpdateEDCalc(pgHeader, pgDetail) {
//   // var defer = new $.Deferred;
//   var dat = {
//     'postdata': 'insertEDCalc',
//     'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()),
//     'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems())
//   };
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//     'success': function (data) {
//       var resp = JSON.parse(data);
//       if (resp['succeed'] === true) {
//         window.alert('登録が完了しました。');
//       }
//     },
//     'error': function(jqXHR, textStatus, errorThrown) {
//       alert('失敗しました');
//     }
//   });
// }

// function insertEstimateCalc(pgHeader, pgDetail) {
//   var dat = {
//     'postdata': 'insertEDCalc',
//     'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()),
//     'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems())
//   };
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//     'success': function (data) {
//       var resp = JSON.parse(data);
//       if (resp['succeed'] === true) {
//         window.alert('登録が完了しました。');
//       }
//     },
//     'error': function(jqXHR, textStatus, errorThrown) {
//       alert('失敗しました');
//     }
//   });
// }

// function insertEstimateCalc(pgHeader, pgDetail) {
//   let dat = {
//     'postdata': 'insertEDCalc',
//     'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()),
//     'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems())
//   };
//   fetch('db.php', {
//     method:'POST',
//     headers: {
//       'content-type':'application/json',
//     },
//     body: dat,
//   })
//     .then(function (response) {
//       if (response.ok) {
//         return response.text();
//       }
//       throw new error('データ取得に失敗しました');
//     })
//     .catch(function (error) {
//       window.alert('Error:' + error.message);
//   })
// }


// function insertEstimateCalc(pgHeader, pgDetail) {
//   // サーバにデータを送信して、入力内容を反映
//   var defer = new $.Deferred;
//   var dat = {
//     'postdata': 'insertEDCalc',
//     'sdatjsonheader': JSON.stringify(getDirtyData(pgHeader.dataView)),
//     'sdatjsondetail': JSON.stringify(getDirtyData(pgDetail.dataView))
//   };
//   $.ajax({
//     // 'timeout': 5000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//   })
//   //   'success':function(data) {
//   //     // if (svrfuncAfterUpdate) {
//   //     //   svrfuncAfterUpdate();
//   //     // }
//   //     defer.resolve(data);
//   //   },
//   //   error: function(jqXHR, textStatus, errorThrown) {
//   //     defer.reject(jqXHR, textStatus, errorThrown);
//   //   }
//   // });
//   .done(function (data, dataType) {
//     setTimeout(function () {
//       var resp = JSON.parse(data || null);
//       if (resp['msg'] !== '') {
//         window.alert(resp['msg']);
//       }
//       if (resp['succeed'] === true) {
//         // if (svrfuncAfterUpdate) {
//         //   svrfuncAfterUpdate(pg);
//         // }
//       } else {
//         return defer.reject();
//       }
//       console.log();
//       defer.resolve();
//     }, 1000); 
//   })
//   .fail(function () {
//     alert('データ登録に失敗しました');
//   })
//   return defer.promise();
// }



// function readInsertEDCalc(pgHeader, pgDetail) {
//   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
//     return;
//   }
//   // 入力内容のバリデーションを実行
//   if (!pgHeader.validateItems()) {
//     return;
//   }
//   if (!pgDetail.validateItems()) {
//     return;
//   }
//   // サーバにデータを送信して、入力内容を反映
//   var dat = {
//     'postdata': 'readCalcEstimate',
//     'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), //JSON.stringify(getDirtyData(pgHeader.dataView)),
//     'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), //JSON.stringify(getDirtyData(pgDetail.dataView))
//   };
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       // var resp = JSON.parse(data);
//       var objs = JSON.parse(data || "null");
//       var i = 0;
//       if (objs) {
//         objs.forEach(function (elem) {
//           elem['id'] = i++;
//         });
//         pgHeader.columns.forEach(function (col) {
//           // 主キーの前回値を代入
//           if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK'] || col['isHeader']) {
//             objs.forEach(function (elem) {
//               elem[col['id'] + '_PREVVAL'] = elem[col['id']];
//             });
//           }
//           // Decimal型の場合、StringからNumberに変換する
//           if (col['coltype'] === 'decimal') {
//             var numcol = col['id'];
//             objs.forEach(function (elem) {
//               elem[numcol] = Number(elem[numcol]);
//             });
//           }
//         });
//         pgDetails.columns.forEach(function (col) {
//           // 主キーの前回値を代入
//           if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK'] || col['isHeader']) {
//             objs.forEach(function (elem) {
//               elem[col['id'] + '_PREVVAL'] = elem[col['id']];
//             });
//           }
//           // Decimal型の場合、StringからNumberに変換する
//           if (col['coltype'] === 'decimal') {
//             var numcol = col['id'];
//             objs.forEach(function (elem) {
//               elem[numcol] = Number(elem[numcol]);
//             });
//           }
//         });
//         pgHeader.dataView.setItems(objs);
//         pgHeader.grid.setSortColumns([]);
//         pgHeader.grid.invalidate();//grid.render();
//         pgHeader.displayIndicator(false);
        
//         pgDetails.dataView.setItems(objs);
//         pgDetails.grid.setSortColumns([]);
//         pgDetails.grid.invalidate();//grid.render();
//         pgDetails.displayIndicator(false);
//       }
//       // if (resp['succeed'] === true) {
//       //   // window.alert('登録が完了しました。');
//       //   if (svrfuncAfterUpdate) {
//       //     svrfuncAfterUpdate();
//       //   }
//       //   return true;
//       // }
//       // if (resp['msg'] !== '') {
//       //   // window.alert(resp['msg']);
//       //   return false;
//       // }
//   //   },
//   //   'error': function (jqXHR, textStatus, errorThrown) {
//   //     window.alert('データ登録に失敗しました。');
//   //     // pg.displayIndicator(false);
//   // 　　console.log("jqXHR          : " + jqXHR.status);
//   // 　　console.log("textStatus     : " + textStatus);
//   //     console.log("errorThrown    : " + errorThrown.message);
//     }
//   });
// }

/**
 * 入力データチェック
 * @param {*} tbl タブオブジェクト
 */
function checkRecordData(tbl) {
  let bOK = true;
  let strErr = '';

  switch (tbl.divId) {
    case 'Product':
      // データカラム数
      let nColNum = tbl.grid.getColumns().length;
      // データレコード数
      let nDtLen = tbl.dataView.getLength();
      // データオブジェクト
      let dDt = tbl.dataView.getItems();
      
      for (var i = 0; i < nDtLen; i++) {
        // for (var k = 0; k < nColNum; k++) {
        if (dDt[i]['p_type'] === 1 && dDt[i]['p_drawing'] == null) {
          strErr = `科目区分=1(製品)の場合、図番は必須入力です。(品名CD:${dDt[i]['p_id']})`;
          bOK = false;
        }
        if (dDt[i]['p_type_cost'] === '0' && dDt[i]['p_standard_cost'] == null) {
          strErr += `原価区分=0(マスタ標準原価有り)の場合、標準原価は必須入力です。(品名CD:${dDt[i]['p_id']})`;
          bOK = false;
        }
        // if (dDt[i]['p_kbn01'] === 1 && dDt[i]['p_detail01'] == null) {
        //   if (strErr) {
        //     strErr = strErr & '\n見積計算区分＝１の場合、比重は必須入力です'; 
        //   } else {
        //     strErr = '見積計算区分＝１の場合、比重は必須入力です'; 
        //   }
        //   bOK = false;
        // }
        if (!bOK) {
          window.alert(strErr);
          break;
        }
        // }
        // if (!bOK) {
        //   break;
        // }
      }
      break;
  }
  return bOK;
}

/***
 * 在庫タブリストの表示
 */
function loadStockData(item, digLevel) {
  var dat = {
    'postdata': 'read' + item,
    'diglevel': digLevel,
  };  
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("データが取得できませんでした");
  });
}


/**
 * マスタを読み込みして連想配列に代入する
 */
function readMaster() {
  var pushToMasterObj = function (tbl, objs, pg) {
    var i = 0;
    var objmasts = [];
    master[tbl] = objs[tbl];
    // 各列の値を代入
    Object.keys(objs[tbl]).forEach(function (elem) {
      objs[tbl][elem]['id'] = i++;
      objmasts.push(objs[tbl][elem]);
    });
    // 主キーの前回値を代入
    objmasts.forEach(function (elem) {  // belong_cd
      if (Object.keys(elem)[0].indexOf('belong_cd') > -1) {
        elem[Object.keys(elem)[0] + '_PREVVAL'] = elem[Object.keys(elem)[0]];
      }
    }); 
    pg.columns.forEach(function (col) {
      if (col['isHeaderPK'] || col['isDetailPK'] || col['isPK'] || col['isHeader']) {
        objmasts.forEach(function (elem) {
          elem[col['id'] + '_PREVVAL'] = elem[col['id']];
        });
      }
      // Decimal型の場合、StringからNumberに変換する
      if (col['coltype'] === 'decimal') {
        var numcol = col['id'];
        objs.forEach(function (elem) {
          elem[numcol] = Number(elem[numcol]);
        });
      }
    });
    pg.dataView.setItems(objmasts);
    pg.grid.setSortColumns([]);
  };
  var dat = {
    'postdata': 'readMaster'
  };
  $.ajax({
    'timeout': 60000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data);
      master = {};
      pushToMasterObj('material', objs, masterPGs.pgMaterial);
      pushToMasterObj('customer', objs, masterPGs.pgCustomer);
      pushToMasterObj('weight', objs, masterPGs.pgWeight);
      pushToMasterObj('warehouse', objs, masterPGs.pgWarehouse);
      pushToMasterObj('gari', objs, masterPGs.pgGari);
      pushToMasterObj('weave', objs, masterPGs.pgWeave);
      pushToMasterObj('cam', objs, masterPGs.pgCam);
      pushToMasterObj('mold', objs, masterPGs.pgMold);
      pushToMasterObj('manufacture', objs, masterPGs.pgManufacture);
      pushToMasterObj('inspectionitem', objs, masterPGs.pgInspectionitem);
      pushToMasterObj('wire', objs, masterPGs.pgWire);
      pushToMasterObj('transportcompany', objs, masterPGs.pgTransportCompany);
      pushToMasterObj('packing', objs, masterPGs.pgPacking);
      pushToMasterObj('user', objs, masterPGs.pgUser);
      pushToMasterObj('customerpost', objs, masterPGs.pgCustomerpost);
      pushToMasterObj('customercharge', objs, masterPGs.pgCustomercharge);      
      pushToMasterObj('unit', objs, masterPGs.pgUnit);
      // pushToMasterObj('unit', objs, masterPGs.pgUnitHeader);
      pushToMasterObj('productcategory', objs, masterPGs.pgProductcategory);
      pushToMasterObj('product', objs, masterPGs.pgProduct);
      pushToMasterObj('parrangement', objs, masterPGs.pgParrangement);
      pushToMasterObj('arrangement', objs, masterPGs.pgArrangement);
      pushToMasterObj('tax', objs, masterPGs.pgTax);
      pushToMasterObj('inspection', objs, masterPGs.pgInspection);
      pushToMasterObj('storage', objs, masterPGs.pgStorage);
      pushToMasterObj('process', objs, masterPGs.pgProcess);

      // 単位マスタを配列に格納（プルダウン表示用）
      var unitList = [];
      Object.keys(master.unit).forEach(function (key) {
        unitList.push({
          key: master.unit[key].u_cd,
          val: master.unit[key].u_name
        });
      });
      unitList.sort(function(a, b){return b-a});
      mainPGs.pgED.columns.forEach(function (element) {
        if(element.id === 'ed_unit_tran') {
          element.options = unitList;
        }
      });
      // 社員マスタの再ソート
      (function (pg, field, sign) {
        var items = pg.dataView.getItems();
          items.sort(function (dataRow1, dataRow2) {
            var value1 = parseInt(dataRow1[field]) ? parseInt(dataRow1[field]) : '';
            var value2 = parseInt(dataRow2[field]) ? parseInt(dataRow2[field]) : '';
            var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
            if (result !== 0) {
              return result;
            }
          });
          pg.dataView.setItems(items);
      }(masterPGs.pgUser, 'USER_CD', 1));

      // pushToMasterObj('process', objs, masterPGs.pgProcess);
      // pushToMasterObj('permissions', objs, masterPGs.pgPermissions);
      // pushToMasterObj('housecompany', objs, masterPGs.pgHousecompany);
      // pushToMasterObj('bom', objs, masterPGs.pgBom);
      // pushToMasterObj('projects', objs, masterPGs.pgProjects);
      // pushToMasterObj('members', objs, masterPGs.pgMembers);
      // // pushToMasterObj('storages', objs, masterPGs.pgStorages);
      // pushToMasterObj('storereasons', objs, masterPGs.pgStorereasons);
      // pushToMasterObj('bom_assignable_to', objs, masterPGs.pgBomAssignableTo);      
      // 
      // 
      // 
      // pushToMasterObj('inspectionview', objs, masterPGs.pgInspectionview);
      // // pushToMasterObj('storage', objs, masterPGs.pgStorage);
      // pushToMasterObj('payment', objs, masterPGs.pgPayment);
      // pushToMasterObj('wbsctrl', objs, masterPGs.pgWbsctrl);
      // pushToMasterObj('currency', objs, masterPGs.pgCurrency);
      // プロジェクトマスタについて再ソートを実行
      // (function (pg, field, sign) {
      //   var items = pg.dataView.getItems();
      //   items.sort(function (dataRow1, dataRow2) {
      //     var value1 = dataRow1[field] ? dataRow1[field] : '', value2 = dataRow2[field] ? dataRow2[field] : '';
      //     var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
      //     if (result !== 0) {
      //       return result;
      //     }
      //   });
      //   pg.dataView.setItems(items);
      // }(masterPGs.pgProjects, 'dir', 1)); // 階層順表示
      // Object.keys(masterPGs).forEach(function (elem) {
      //   /** @type {PlannerGrid} */
      //   var mPG = masterPGs[elem];
      //   mPG.grid.invalidate();
      // });
      
    }
  });
}

/**
 * 在庫データ読込
 * @param {string} categoryLevel 大分類の分類タイプ(頭文字2文字で指定)
 * @param {string} mode 'CREATE': createviewを含む　'READ':readのみ
 *  */
function readStockView(categoryLevel, mode) {
  let pushToStockViewObj = (category, objs, pg) => {
    let i = 0;
    let objStockViews = [];
    stockView[category] = objs[category];
    // 各列の値を代入
    Object.keys(objs[category]).forEach(function (elem) {
      objs[category][elem]['id'] = i++;
      objStockViews.push(objs[category][elem]);
    });
    // 主キーの前回値を代入
    objStockViews.forEach(function (elem) {  // belong_cd
      if (Object.keys(elem)[0].indexOf('belong_cd') > -1) {
        elem[Object.keys(elem)[0] + '_PREVVAL'] = elem[Object.keys(elem)[0]];
      }
    }); 

    pg.dataView.setItems(objStockViews);
    pg.grid.setSortColumns([]);

    pg.dataView.getItemMetadata = (row) => {

      const category = String(pg.divId).substring(0,2);      
      let listData = pg.dataView.getItems();
      let item = pg.dataView.getItem(row);

      let listIDs = [];
      let uniq = [];
      let result = 0;

      switch (category) {
        // 大分類ごとにカラーリングする項目が異なるため下記で調整
        case 'CR':

          if (String(pg.divId) === 'CR15MSUS' || String(pg.divId) === 'CR15MZN') {
            // ロールで管理
            listIDs = listData.map(item => item.sub01);
            uniq = [...new Set(listIDs)];
            result = uniq.indexOf(item.sub01);     

          } else if (String(pg.divId) === 'CRRSVSHT') {
            // 製品
            listIDs = listData.map(item => item.customername);
            uniq = [...new Set(listIDs)];
            result = uniq.indexOf(item.customername);            

          } else if (String(pg.divId) === 'CRRSVRYOKI') {
            // リョーキ専用
            listIDs = listData.map(item => item.sub01 + item.sub04);
            uniq = [...new Set(listIDs)];
            result = uniq.indexOf(item.sub01 + item.sub04);      
          } else if (String(pg.divId) === 'CRSUS1510' || String(pg.divId) === 'CRSUS1515') {
            // φ1.5x10 or φ1.5x15
            listIDs = listData.map(item => item.sub08);
            uniq = [...new Set(listIDs)];
            result = uniq.indexOf(item.sub08);     

          } else {
            listIDs = listData.map(item => item.psupple);
            uniq = [...new Set(listIDs)];
            result = uniq.indexOf(item.psupple);   

          }
          break;

        case 'WV':
        case 'WD':
        case 'MT':
          // pcd
          listIDs = listData.map(item => item.productcd);
          uniq = [...new Set(listIDs)];          
          result = uniq.indexOf(item.productcd);   

          break;

        case 'WR':
          // if (String(pg.divId).substring(0,5) === 'WRSUS')
          // makername
          listIDs = listData.map(item => item.productcd);
          uniq = [...new Set(listIDs)];          
          result = uniq.indexOf(item.productcd);   
          break;

        default:          
      }

      let number = parseInt(String(result).slice(-1)) + 1;
      // console.log(number);
      return { cssClasses: 'sgbackcolor' + String(number) };
    }
    pg.grid.invalidate();
    pg.grid.render();

  };
  
  let dat = {
    'postdata': 'readStockView',
    'category': categoryLevel,
    'mode': mode,
  };
  $.ajax({
    'timeout': 60000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var objs = JSON.parse(data);
      pushToStockViewObj('CR15MSUS', objs, stockPGs.pgCR15MSUS);
      pushToStockViewObj('CR15MZN', objs, stockPGs.pgCR15MZN);
      pushToStockViewObj('CRSUS08', objs, stockPGs.pgCRSUS08);
      pushToStockViewObj('CRSUS12', objs, stockPGs.pgCRSUS12);
      pushToStockViewObj('CRSUS15', objs, stockPGs.pgCRSUS15);
      pushToStockViewObj('CRSUS1510', objs, stockPGs.pgCRSUS1510);
      pushToStockViewObj('CRSUS1515', objs, stockPGs.pgCRSUS1515);
      pushToStockViewObj('CRSUS16', objs, stockPGs.pgCRSUS16);
      pushToStockViewObj('CRSUS19', objs, stockPGs.pgCRSUS19);
      pushToStockViewObj('CRSUS20', objs, stockPGs.pgCRSUS20);
      pushToStockViewObj('CRSUS23', objs, stockPGs.pgCRSUS23);
      pushToStockViewObj('CR316L', objs, stockPGs.pgCR316L);
      pushToStockViewObj('CRZN', objs, stockPGs.pgCRZN);
      pushToStockViewObj('CRRSVSHT', objs, stockPGs.pgCRRSVSHT);
      pushToStockViewObj('CRSHTSUS', objs, stockPGs.pgCRSHTSUS);
      pushToStockViewObj('CRSHTPLAIN', objs, stockPGs.pgCRSHTPLAIN);
      pushToStockViewObj('CRSHTOTHER', objs, stockPGs.pgCRSHTOTHER);
      pushToStockViewObj('CRRSVRYOKI', objs, stockPGs.pgCRRSVRYOKI);
      
      pushToStockViewObj('WVSUS304', objs, stockPGs.pgWVSUS304);
      pushToStockViewObj('WVSUS316', objs, stockPGs.pgWVSUS316);
      pushToStockViewObj('WVZN', objs, stockPGs.pgWVZN);
      pushToStockViewObj('WVHEX', objs, stockPGs.pgWVHEX);
      pushToStockViewObj('WVSHT', objs, stockPGs.pgWVSHT);
      // pushToStockViewObj('WVOTH', objs, stockPGs.pgWVOTH);      

      pushToStockViewObj('WDSUS', objs, stockPGs.pgWDSUS);
      pushToStockViewObj('WDFE', objs, stockPGs.pgWDFE);
      pushToStockViewObj('WDOTH', objs, stockPGs.pgWDOTH);

      pushToStockViewObj('WRSUS304W1', objs, stockPGs.pgWRSUS304W1);
      pushToStockViewObj('WRSUS304W2', objs, stockPGs.pgWRSUS304W2);
      pushToStockViewObj('WRSUS316', objs, stockPGs.pgWRSUS316);
      pushToStockViewObj('WRSUS309W1', objs, stockPGs.pgWRSUS309W1);
      pushToStockViewObj('WRSUS309W2', objs, stockPGs.pgWRSUS309W2);
      pushToStockViewObj('WRSUS310W1', objs, stockPGs.pgWRSUS310W1);
      pushToStockViewObj('WRSUS310W2', objs, stockPGs.pgWRSUS310W2);
      pushToStockViewObj('WRSUSOTH', objs, stockPGs.pgWRSUSOTH); 
      pushToStockViewObj('WRFLAT', objs, stockPGs.pgWRFLAT);
      pushToStockViewObj('WRAL', objs, stockPGs.pgWRAL);
      pushToStockViewObj('WRCU', objs, stockPGs.pgWRCU);
      pushToStockViewObj('WRZN2', objs, stockPGs.pgWRZN2);
      pushToStockViewObj('WRZN3', objs, stockPGs.pgWRZN3);
      pushToStockViewObj('WRHSTEEL', objs, stockPGs.pgWRHSTEEL); 
      pushToStockViewObj('WRVINYL', objs, stockPGs.pgWRVINYL);
      pushToStockViewObj('WRFE', objs, stockPGs.pgWRFE);
      pushToStockViewObj('WROTH', objs, stockPGs.pgWROTH);

      pushToStockViewObj('WRMSUS', objs, stockPGs.pgWRMSUS);
      pushToStockViewObj('WRMOTH', objs, stockPGs.pgWRMOTH);

      
      pushToStockViewObj('MTPUNCH', objs, stockPGs.pgMTPUNCH); 
      pushToStockViewObj('MTFLATBAR', objs, stockPGs.pgMTFLATBAR);
      pushToStockViewObj('MTROUND', objs, stockPGs.pgMTROUND); 
      pushToStockViewObj('MTANGLE', objs, stockPGs.pgMTANGLE); 
      pushToStockViewObj('MTFE', objs, stockPGs.pgMTFE);
      pushToStockViewObj('MTBASKET', objs, stockPGs.pgMTBASKET);
      pushToStockViewObj('MTBOARD', objs, stockPGs.pgMTBOARD); 
      pushToStockViewObj('MTPLATE', objs, stockPGs.pgMTPLATE); 
      pushToStockViewObj('MTOTH', objs, stockPGs.pgMTOTH);

    }
  });
}


/**
 * 
 * @param {*} dat 線番
 */
function ajaxGetwireMaster(wireno, option) {
  let sdat = {
    postdata: 'searchWireMaster',
    sdatjson: JSON.stringify(wireno),
    option: option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': sdat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("線番データが取得できませんでした");
  });
}


/**
 * leaflist登録
 * @param {*} pg 
 * @param {*} item 
 * @param {*} serverfunc 
 */
function ajaxIssueLeaflist(pg, serverfunc) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }  
  let sdat = {
    postdata: 'issueLeaflist',
    sdatjsonheader: JSON.stringify(pg.h.dataView.getItems()),
    sdatjsondetails: JSON.stringify(pg.d.dataView.getItems())
  };

  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': sdat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data);
      if (resp['succeed'] === true) {
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate(pg);
        }
      }
      if (resp['msg'] !== '') {
        window.alert(resp['msg']);
      }
    }
  });
}

function ajaxUpdateProdLeaf() {
  ajaxIssueProdLeaf();
}

/**
 * 製造リーフを登録する
 * @param {PlannerGrid} pg
 * @param {*} item
 * @param {Function=} svrfuncAfterUpdate
 */
function ajaxIssueProdLeaf(pg, svrfuncAfterUpdate) {
  var defer = $.Deferred();
  $('#dialog-leafprod-issue')['dialog']('open');
  var dat = {
    'postdata': 'issueProdLeaf',
    'sdatjsonheader': JSON.stringify(pg.h.dataView.getItems()),
    'sdatjsondetails': JSON.stringify(pg.d.dataView.getItems()),
  };
  $.ajax({
    timeout: 30000,
    type: 'POST',
    url: 'db.php',
    data: dat,
  })
    .done(function (data, dataType) {
      setTimeout(function () {
        var resp = JSON.parse(data || null);
        if (resp['msg'] !== '') {
          window.alert(resp['msg']);
        }
        if (resp['succeed'] === true) {
          if (svrfuncAfterUpdate) {
            svrfuncAfterUpdate(pg);
          }
        } else {
          return defer.reject();
        }
        console.log();
        defer.resolve();
      }, 1000); 
      // ステータスバーを閉じる
      $('#dialog-leafprod-issue')['dialog']('close');
    })
    .fail(function () {
      alert('リーフ登録に失敗しました');
      // ステータスバーを閉じる
      $('#dialog-leafprod-issue')['dialog']('close');
    })
  return defer.promise();
}

/**
 * ajax連続テスト
 * @param {PlannerGrid} pg
 * @param {*} item 
 */
function ajaxDeployLeaf(pg, item) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var deffer = $.Deferred();
  $('#dialog-leafprod-issue')['dialog']('open');
  var dat = {
    postdata: 'deployLeaf',
    sdatjson: JSON.stringify(item)
  };
  $.ajax({
    // timeout: 30000,
    type: 'POST',
    url: 'db.php',
    data: dat,
  })
    .done(function (data, dataType) {
      setTimeout(function () {
        var resp = JSON.parse(data || null);
        if (resp['msg'] !== '') {
          window.alert(resp['msg']);
        }
        if (resp['succeed'] === false) {
          return defer.reject();
        }
        console.log();
        deffer.resolve();
      }, 1000); 
    })
    .fail(function () {
      alert('リーフ登録に失敗しました');
    })
    .always(function () {
      $('#dialog-leafprod-issue')['dialog']('close');
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgProdplans.h);
      clearRows(editPGs.pgProdplans.d);
      // readdata(ePG.m);
      readdata(editPGs.pgProdplans.m);
    })
  return deffer.promise();
//   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
//     return;
//   }
//   var dfd = $.Deferred();
//   var dat = {
//     'postdata': 'deployLeaf',
//     'sdatjson': JSON.stringify(item)
//   };
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//   })
//     .done(function (data) {
//       var resp = JSON.parse(data || null);
//       console.log();
//       if (resp['msg'] !== '') {
//         window.alert(resp['msg']);
//       }
//       dfd.resolve();
//     })
//     .fail(function () {
//       alert('登録に失敗しました')
//     })
//   return dfd.promise();
}

/**
 * 出荷リーフを登録する
 * @param {PlannerGrid} pg
 * @param {*} item
 * @param {Function=} svrfuncAfterUpdate
 */
function ajaxIssueShipLeaf(pg, item, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var dat = {
    'postdata': 'issueShipLeaf',
    'sdatjson': JSON.stringify(item)
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data);
      if (resp['succeed'] === true) {
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate(pg);
        }
      }
      if (resp['msg'] !== '') {
        window.alert(resp['msg']);
      }
    }
  });
}


// function getNewID(func, dat) {
//   fetch('db.php?' + func)
//   .then(function (response) {
//       // console.log(response.headers.get('Content-Type')); //text/html; charset=UTF-8
//       // console.log(response.headers.get('Date')); //Wed, 16 Jan 2019 03:08:21 GMT
//       // console.log(response.status); //200
//       return response.json();
//   })
//   .then(function (data) {
//     let resp = JSON.parse(data);
//   })
//   .catch(function (error) {
//     // document.getElementById('result').textContent = error;
//     window.alert(error);
//   })
// }



/**
 * サーバから各種データを検索して取得する
 * @param {string} funcName サーバ側で実行する関数
 * @param {*} conditions 検索条件
 * @param {Function=} svrfuncAfterUpdate 検索処理成功時に実行する関数
 */
function ajaxSearchData(funcName, conditions, svrfuncAfterUpdate) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var dat = {
    'postdata': funcName,
    'sdatjson': JSON.stringify(conditions)
  };
  // 検索結果を取得後、転記等の処理を行う
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data);
      if (resp['succeed'] === true) {
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate(resp);
        }
      }
      if (resp['msg'] !== '') {
        window.alert(resp['msg']);
      }
    }
  });
}

/**
 * サーバから各種データを検索して取得する
 * @param {string} funcName サーバ側で実行する関数
 * @param {*} conditions 検索条件
 * @param {Function=} svrfuncAfterUpdate 検索処理成功時に実行する関数
 */
function ajaxSearchShowData(funcName, conditions) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  let dat = {
    'postdata': funcName,
    'sdatjson': JSON.stringify(conditions)
  };
  return $.ajax({
    'timeout': 5000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("データの検索に失敗しました。");
  });
  // $.ajax({
  //   'timeout': 30000,
  //   'type': 'POST',
  //   'url': 'db.php',
  //   'data': dat,
  //   'success': function (data, dataType) {
  //     var resp = JSON.parse(data);
  //     if (resp['succeed'] === true) {
  //       if (svrfuncAfterUpdate) {
  //         svrfuncAfterUpdate(resp);
  //       }
  //     }
  //     if (resp['msg'] !== '') {
  //       window.alert(resp['msg']);
  //     }
  //   }
  // });
}

/**
 * 請求データ作成
 */
function ajaxCreateBD(conditions) {
  // 2023/4/6　データ作成中に重複登録を防ぐため、ウィンドウを閉じる
  $('#dialog-sdforbill')['dialog']('close');
  return new Promise((resolve, reject) => {
    let dat = {
      'postdata': 'createBD',
      'sdatjson': JSON.stringify(conditions)
    };
    setupAjax();
    $.ajax({
      'timeout': 60000,
      'type': 'POST',
      'url': 'db.php',
      'dataType': 'json',
      'data': dat,
    }).done(function(data){
      // Ajax通信が成功した場合
      // 返答データの代入
      return resolve(data)
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("請求データ作成に失敗しました。");
    });
  });
};

/**
 * 請求書発行
 */
function ajaxOutputBD(conditions) {
  return new Promise((resolve, reject) => {
    let dat = {
      'postdata': 'outputBD',
      'sdatjson': JSON.stringify(conditions)
    };
    setupAjax();
    $.ajax({
      'timeout': 60000,
      'type': 'POST',
      'url': 'db.php',
      'dataType': 'json',
      'data': dat,
    }).done(function(data){
      // Ajax通信が成功した場合
      // 返答データの代入
      return resolve(data)
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("請求書発行に失敗しました。");
    });
  });
};

// function ajaxCreateBD(conditions) {
//   let dat = {
//     'postdata': 'createBD',
//     'sdatjson': JSON.stringify(conditions)
//   };
//   return $.ajax({
//     'timeout': 50000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("請求データ作成に失敗しました。");
//   });
// }


// /**
//  * 送状エクセル作成
//  */
// function exportShippingLabel(ar) {
//   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
//     return;
//   }
//   let dat = {
//     'postdata': 'createShippingLabel',
//     'sdatjson': JSON.stringify(ar),
//   };
//   return $.ajax({
//     'timeout': 3000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("送状データの取得に失敗しました。");
//   });
// }


/**
 * 見積計算データ登録
 * @param {*} pgHeader1 
 * @param {*} pgHeader2 
 * @param {*} pgDetail1 
 * @param {*} svrfuncAfterUpdate 
 */
function updateEDCalc(pgHeader1, pgHeader2, pgDetail1, svrfuncAfterUpdate) {
  let dat = {
    'postdata': 'updateEDCalc',
    'sdatjsonheader1': JSON.stringify(pgHeader1.dataView.getItems()),
    'sdatjsonheader2': JSON.stringify(pgHeader2.dataView.getItems()),
    'sdatjsondetail1': JSON.stringify(pgDetail1.dataView.getItems())
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'data': dat,
    'success': function (data, dataType) {
      var resp = JSON.parse(data || "null");
      if (resp['succeed'] === true) {
        window.alert('登録が完了しました。');
        if (svrfuncAfterUpdate) {
          svrfuncAfterUpdate(resp['succeed']);
        }
      }
      if (resp['msg'] !== '') {
        window.alert(resp['msg']);
      }
    }
  });
}

// // 製品計画データを作成　見積データを渡す
// function ajaxInsertProdPlans(pgHeader, pgDetail, func) {

//   // サーバにデータを送信して、入力内容を反映
//   var dat = {
//     'postdata': 'insertProdPlans',
//     'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), 
//     'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), 
//   };
//   $.ajax({
//     'timeout': 10000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       var resp = JSON.parse(data || "null");
//       if (resp['succeed'] === true) {
//         window.alert('登録が完了しました。');
//         if (func) {
//           func();
//         }
//       }
//       if (resp['msg'] !== '') {
//         window.alert(resp['msg']);
//       }
//     }
//   });
// }

/**
 * 製造計画データに既存かどうか
 * @param {*} pg 
 */
function checkProdPlans(pg, option) {
  let dat = {
    'postdata': 'existProdplan',
    'sdatjson': JSON.stringify(pg), 
    'option': option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("製造計画データの検索に失敗しました。");
  });
}

// function checkMOD(pg, option) {
//   let dat = {
//     'postdata': 'existMOrder',
//     'sdatjson': JSON.stringify(pg), 
//     'option': option,
//   };
//   return $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("発注引継ぎの検索に失敗しました。");
//   });
// }



function ajaxUpdateMODAccept(rows, mode) {
  let dat = {
    'postdata': 'updateMODAccept',
    'sdatjson':JSON.stringify(rows),
    'mode':JSON.stringify(mode),
  }
  return $.ajax({
    'timeout': 50000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("検収データアップデート失敗");
  });
}

function ajaxDeleteMODRow(rows) {
  let dat = {
    'postdata': 'deleteMODRow',
    'sdatjson':JSON.stringify(rows),
  }
  return $.ajax({
    'timeout': 50000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("発注レコードデータ削除失敗");
  });
}

/***
 * 請求データ削除
 * billno:削除対象の請求Noの配列
 */
function ajaxDeleteBD(billno) {
  let dat = {
    'postdata': 'deleteBD',
    'sdatjson': JSON.stringify(billno),
  }
  return $.ajax({
    'timeout': 50000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("請求データの検索に失敗しました。");
  });
}


/**
 * 納品書データに既存かどうか
 * @param {*} pg 
 */
function checkStatement(pg, option) {
  let dat = {
    'postdata': 'existStatement',
    'sdatjson': JSON.stringify(pg), 
    'option': option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("納品データの検索に失敗しました。");
  });
}

/**
 * 出荷フラグ確認
 * @param {*} pg 
 */
function checkShipmentFlg(pg, option) {
  let dat = {
    'postdata': 'checkShipmentFlg',
    'sdatjson': JSON.stringify(pg), 
    'option': option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("出荷フラグの確認に失敗しました。");
  });
}


// /**
//  * 出荷確定ボタン押下
//  */
// function confirmShipmentFlg(pg, option) {
//   // 該当納品データの見積明細データの出荷数量を更新する
//   let dat = {
//     'postdata': 'updateShipmentFlg',
//     'sdatjson': JSON.stringify(pg), 
//     'option': option,
//   };
//   return $.ajax({
//     'timeout': 3000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("出荷実績登録に失敗しました");
//   });
// }

/**
 * 納品確定ボタン押下
 * @param {*} pgHeader 
 * @param {*} pgDetail 
 * @param {*} option 
 */
function confirmStatementFlg(pgHeader, pgDetail, option) {
  let dat = {
    'postdata': 'updateEDStatementFlg',
    'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), 
    'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), 
    'flg': '1',
    'option': option,
  };
  return $.ajax({
    'timeout': 10000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("納品確定に失敗しました");
  });
}


/**
 * 納品取消ボタン押下
 * @param {*} pgHeader 
 * @param {*} pgDetail 
 * @param {*} option 
 */
function cancelStatementFlg(pgHeader, pgDetail, option) {
  let dat = {
    'postdata': 'updateEDStatementFlg',
    'sdatjsonheader': JSON.stringify(pgHeader.dataView.getItems()), 
    'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), 
    'flg': '0',
    'option': option,
  };
  return $.ajax({
    'timeout': 10000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("納品取消に失敗しました");
  });
}

/**
 * 出荷引継取消
 * @param {*} pgHeader 
 * @param {*} pgDetail 
 */
function ajaxCancelShipPlans(rowData, option) {
  let dat = {
    'postdata': 'deleteShipPlans',
    'sdatjson': JSON.stringify(rowData), 
    // 'sdatjsondetail': JSON.stringify(pgDetail.dataView.getItems()), 
    'option': option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    alert('出荷引継取消に失敗しました。');
  });
}


/**
 * 在庫引当処理
 */
function updateStockData(pg, motherData, mode) {
  let dat = {
    'postdata': 'updateStockData',
    'sdatjson': JSON.stringify(pg.dataView.getItems()), 
    // 'sdatjsonRow': JSON.stringify(row), 
    'sdatjsonMD': JSON.stringify(motherData),
    'mode': mode,
  };
  return $.ajax({
    'timeout': 100000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail (function (jqXHR, textStatus, errorThrown) {
    alert('引当処理が完了できませんでした。');
  });
}

/**
 * 在庫引当可否の確認　
 * @param {*} dataContext 
 */
function ajaxCheckShippingAssign(dataContext) {
  let dat = {
    'postdata': 'checkShippingAssign',
    'sdatjson': JSON.stringify(dataContext), 
  };
  return $.ajax({
    'timeout': 3000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail (function (jqXHR, textStatus, errorThrown) {
    console.log("在庫確認できませんでした。");
  });
}

function ajaxReadProdplans(pgHeader, pgDetails, option) {
  let dat = {
    'postdata': 'ReadProdplans',
    'sdatjsonheader': JSON.stringify(pgHeader), 
    'sdatjsondetail': JSON.stringify(pgDetails), 
    'option': option,
  };
  return  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("製造計画データの取得に失敗しました。");
  });
}


/**
 * 検索項目ありの製造指示検索
 * @param {*} pgHeader 
 * @param {*} pgDetails 
 * @param {*} option 
 */
function ajaxSearchProdPlans(pgHeader, option) {
  let dat = {
    'postdata': 'searchProdPlans',
    'sdatjsonheader': JSON.stringify(pgHeader),  
    'option': option,
  };
  return  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("製造計画データの取得に失敗しました。");
  });
}

/***
 * 在庫データ登録　現在debug用
 */
function updateStorageTable(pgDetail) {
  let dat = {
    'postdata': 'updateStorageTable',
    'sdatjson': JSON.stringify(pgDetail),  
    // 'option': option,
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).done(function (data) {
    console.log(data);
    console.log('0000');
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log('在庫データ登録に失敗しました。');
  });
}


/***
 * マスタ情報を取得
 */
 function readDropdownMaster() {
  let dat = {
    'postdata': 'readDropdownMaster'
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'async': false,
    'dataType': 'json',
    'data': dat,
  }).done(function(data) {
    if(data) {
      // 単位マスタをグローバル変数に保存
      data.unit.forEach(function (element) {
        dropdownMaster.unit.push({
          key: element.u_cd,
          val: element.u_name
        });
      });

      // // 昇順に並び変えた単位マスタ
      // data.unit.sort((a, b) => a.u_row_order - b.u_row_order).forEach(function (element) {
      //   dropdownMaster.unitASC.push({
      //     key: element.u_cd,
      //     val: element.u_name
      //   });
      // });

      // 加工内容マスタをグローバル変数に保存
      data.arrangement.forEach(function (element) {
        dropdownMaster.arrangement.push({
          key: element.ar_sub_cd,
          val: element.ar_name
        });
      });

      data.mstpayment.forEach(function (element) {
        dropdownMaster.mstpayment.push({
          key: element.py_cd,
          val: element.py_name
        });
        // if (element.py_cd === '210' || element.py_cd === '211' || element.py_cd === '610') {
        //   dropdownMaster.mstpaymentplan.push({
        //     key: element.py_cd,
        //     val: element.py_name
        //   });
        // }
      });

      data.mstmaterial.forEach((elem) => {
        dropdownMaster.mstmaterial.push({
          key: elem.m_cd,
          val: elem.m_name
        });
      });

      data.mstpcategory03.forEach((elem) => {
        dropdownMaster.mstpcategory03.push({
          key: elem.prc_cat_cd,
          val: elem.prc_name
        });
      });

      data.mstprocess.forEach(function (elem) {
        dropdownMaster.mstprocess.push({
          key: elem.pc_cd,
          val: elem.pc_name
        });
      });



    }
  });
}

// ユーザーの権限データを取得
function readUserInfo() {
  let dat = {
    'postdata': 'readUserInfo',
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }); 
}

/***
 * 表示、非表示の変更
 * pg:メイン画面
 * mode：見えるようにする→true、見えないようにする→false
 */
function changeVisible(pg, mode) {
  let activeRows = [];
  let rowsData = pg.grid.getData().getFilteredItems()
  let nIndex = pg.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length <= nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    activeRows.push(rowsData[nIndex[i]]);
  }
  let data = {
    'postdata': 'updateVisibleFlg',
    'sdatjson': JSON.stringify(activeRows),
    'mode': JSON.stringify(mode),
    'gridname': pg.divId,
  }
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': data,
  })  
}


/***
 * 番号一覧の表示データを表示
 * pg: 画面
 * mode: false => 現状非表示リストのみ取得であるが、何かあった場合はセットする
 */
function loadInvisibleData(pg, mode) {
  let data = {
    'postdata': 'readNumberData',
    'gridname': JSON.stringify(pg.divId),
    'mode': JSON.stringify(mode),
  }
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': data,
  })
}


// function ajaxGetStockDetails(category, rowdata) {
//   let dat = {
//     'postdata': 'getStockDetails',
//     'sdatjson': JSON.stringify(rowdata),
//     'mode': category,
//   };
//   return $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("詳細データの検索に失敗しました。");
//   });
// }


// function ajaxGetProdplanNo(pg, option) {
//   let dat = {
//     'postdata': 'getProdplan',
//     'sdatjson': JSON.stringify(pg), 
//     'option': option,
//   };
//   return $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("製造計画データの検索に失敗しました。");
//   });
// }

// /**
//  * 見積書から製造計画データを取得
//  * @param {*} pg 
//  * @param {*} option 
//  */
// function ajaxReadProdPlansRecord(pg, option) {
//   let dat = {
//     'postdata': 'ReadProdPlansRecord',
//     'sdatjson': JSON.stringify(pg), 
//     'option': option,
//   }
//   return $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'dataType': 'json',
//     'data': dat,
//   }).fail(function(jqXHR, textStatus, errorThrown) {
//     console.log("製造計画データの取得に失敗しました。");
//   });
// }

// /***製造リーフ作成 */
// function ajaxLocateLeaf(funcName, conditions, svrfuncAfterUpdate) {
//   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
//     return;
//   }
//   var dat = {
//     'postdata': funcName,
//     'sdatjson': JSON.stringify(conditions)
//   };
//   // 検索結果を取得後、転記等の処理を行う
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       var resp = JSON.parse(data);
//       if (resp['succeed'] === true) {
//         if (svrfuncAfterUpdate) {
//           svrfuncAfterUpdate(resp);
//         }
//       }
//       if (resp['msg'] !== '') {
//         window.alert(resp['msg']);
//       }
//     }
//   });
// }

// function updateEDCalc(pg, func) {
//   let dat = {
//     'postdata': 'updateEDCalc',
//     'sdatjsonheader1': JSON.stringify(pg.h1.dataView.getItems()),
//     'sdatjsonheader2': JSON.stringify(pg.h2.dataView.getItems()),
//     'sdatjsondetail': JSON.stringify(pg.d1.dataView.getItems())
//   };
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'db.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       var resp = JSON.parse(data);
//       if (resp['succeed'] === true) {
//         if (svrfuncAfterUpdate) {
//           svrfuncAfterUpdate(resp);
//         }
//       }
//       if (resp['msg'] !== '') {
//         window.alert(resp['msg']);
//       }
//     }
//   });
  // fetch('db.php?updateEDCalc', {
  //   method:'POST',
  //   headers: {
  //     'content-type':'application/json',
  //   },
  //   body: dat,
  // })
  //   .then(function (response) {
  //     if (response.ok) {
  //       clearRows(calcPGs.pgEDCalc.h1);
  //       clearRows(calcPGs.pgEDCalc.h2);
  //       clearRows(calcPGs.pgEDCalc.d1);
  //       return response.text();
  //     }
  //     throw new error('データ取得に失敗しました');
  //   })
  //   .catch(function (error) {
  //     window.alert('Error:' + error.message);
  // })

// }

/**
 * 製造完了
 * @param {Array} items
 */
 function completeProd(items) {
  const dat = {
    'postdata': 'completeProd',
    'sdatjson': JSON.stringify(items)
  };
  $.ajax({
    timeout: 30000,
    type: 'POST',
    url: 'db.php',
    data: dat,
  })
  .done(function (data) {
    const response = JSON.parse(data || {});
    alert(response['msg']);
    readdata(editPGs.pgED.m);
  });
}

/**
 * 発注引継取消
 * @param {Array} items
 */
 function cancelOrderTakeover(items) {
  const dat = {
    'postdata': 'cancelOrderTakeover',
    'sdatjson': JSON.stringify(items)
  };
  $.ajax({
    timeout: 30000,
    type: 'POST',
    url: 'db.php',
    data: dat,
  })
  .done(function (data) {
    const response = JSON.parse(data || {});
    alert(response['msg']);
    readdata(mainPGs.pgMOD);
    readdata(mainPGs.pgED);
  });
}