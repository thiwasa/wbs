'use strict';

/**
 * @fileOverview 計画画面メイン処理
 * @author Fumihiko Kondo
 */

// 読み込み完了時に初期化処理を実行する
$(function () {
  initApp();
});

/**
 * エラー発生時の処理
 */
window.onerror = function (message, url, lineNumber, columnNo, error) {
  // urlが空の場合、警告表示しない
  if (url === '') {
    return;
  }
  var errortxt = 'ページでエラーが発生しました。\n\n';
  errortxt += 'Error: ' + message + '\n';
  errortxt += 'Url: ' + url + '\n';
  errortxt += 'Line: ' + lineNumber + '\n';
  reportMsg(error['stack'] ? error['stack'] : errortxt);
  window.alert(errortxt);
  return;
};

/**
 * メイン画面と編集タブの種類別ページ番号一覧
 */
var MAINTABS = {
  Prodplans: 0,
  ED: 1,
  MOD: 2,
  OOD: 5,
  SD: 8,
  BD: 9,
  STPlan: 10,
  ST: 13,
};

/**
 * 主画面のグリッド
 */
 var mainPGs = {
  pgProdplans: new PlannerGrid('Prodplans'),
  pgED: new PlannerGrid('ED'),
  pgMOD: new PlannerGrid('MOD'),
  pgOOD: new PlannerGrid('OOD'),
  pgSD: new PlannerGrid('SD'),
  pgBD: new PlannerGrid('BD'),
  pgSTPlan: new PlannerGrid('STPlan'),
  pgST: new PlannerGrid('ST'),
};

/**
 * 編集画面のグリッド(ヘッダ及び明細)
 */
var editPGs = {
  pgProdplans: new PGHeaderDetail(new PlannerGrid('EditProdplansHeader'), new PlannerGrid('EditProdplans'), mainPGs.pgProdplans),
  pgED: new PGHeaderDetail(new PlannerGrid('EditEDHeader'), new PlannerGrid('EditED'), mainPGs.pgED),
  pgMOD: new PGHeaderDetail(new PlannerGrid('EditMODHeader'), new PlannerGrid('EditMOD'), mainPGs.pgMOD),
  pgAT: new PGHeaderDetail(new PlannerGrid('EditATHeader'), new PlannerGrid('EditAT'), mainPGs.pgMOD),
  pgMST: new PGHeaderDetail(new PlannerGrid('EditMSTHeader'), new PlannerGrid('EditMST'), mainPGs.pgMOD),
  pgOOD: new PGHeaderDetail(new PlannerGrid('EditOODHeader'), new PlannerGrid('EditOOD'), mainPGs.pgOOD),
  pgAOO: new PGHeaderDetail(new PlannerGrid('EditAOOHeader'), new PlannerGrid('EditAOO'), mainPGs.pgOOD),
  pgOST: new PGHeaderDetail(new PlannerGrid('EditOSTHeader'), new PlannerGrid('EditOST'), mainPGs.pgOOD),
  pgSD: new PGHeaderDetail(new PlannerGrid('EditSDHeader'), new PlannerGrid('EditSD'), mainPGs.pgSD),
  pgBD: new PGHeaderDetail(new PlannerGrid('EditBDHeader'), new PlannerGrid('EditBD'), mainPGs.pgBD),
  pgSTPlan: new PGHeaderDetail(new PlannerGrid('EditSTPlanHeader'), new PlannerGrid('EditSTPlan'), mainPGs.pgSTPlan),
  pgSTPProduce: new PGHeaderDetail(new PlannerGrid('EditSTPProduceHeader'), new PlannerGrid('EditSTPProduce'), mainPGs.pgSTPlan),
  pgSTPReceive: new PGHeaderDetail(new PlannerGrid('EditSTPReceiveHeader'), new PlannerGrid('EditSTPReceive'), mainPGs.pgSTPlan),
  pgST: new PGHeaderDetail(new PlannerGrid('EditSTHeader'), new PlannerGrid('EditST'), mainPGs.pgST),
  // 2023/2/8　在庫調整、在庫移動は在庫マスタで行うためコメントアウト
  // pgSTAdjust: new PGHeaderDetail(new PlannerGrid('EditSTAdjustHeader'), new PlannerGrid('EditSTAdjust'), mainPGs.pgST),
  // pgSTTransfer: new PGHeaderDetail(new PlannerGrid('EditSTTransferHeader'), new PlannerGrid('EditSTTransfer'), mainPGs.pgST),
};

// 計算用テンポラリ画面
let calcPGs = {
  pgProdMold: new PGDoubleHeaderDetail(new PlannerGrid('CalcProdplanHeader1'), new PlannerGrid('CalcProdplanHeader2'), new PlannerGrid('CalcProdplan1'), new PlannerGrid('CalcProdplan2'), mainPGs.pgProdplans),
  pgEDCalc: new PGDoubleHeaderDetail(new PlannerGrid('CalcEstimateHeader1'), new PlannerGrid('CalcEstimateHeader2'), new PlannerGrid('CalcEstimate1'), '', mainPGs.pgED),
}

let brProductPGs = {
  pgBrProduct: '',
}


let editSGs = {
  sgSubProcess: '',
}

// 各画面の番号一覧
let numberListPGs = {
  pgED: new PlannerGrid('NumberListED'),
  pgMOD: new PlannerGrid('NumberListMOD'),
  pgOOD: new PlannerGrid('NumberListOOD'),
  pgSD: new PlannerGrid('NumberListSD'),
  pgBD: new PlannerGrid('NumberListBD'),
}

/**
 * マスタ画面の種類別ページ番号一覧
 * 画面表示時には使用していないため、順番がhtmlと一致するように設定すること
 */
var MASTERTABS = {
  Product: 0,
  Material: 1,
  Weight: 2,
  Warehouse: 3,
  Gari: 4,
  Weave: 5,
  Cam: 6,
  Mold: 7,
  Manufacture: 8,
  Inspectionitem: 9,
  Wire: 10,
  Transportcompany: 11,
  Productcategory: 12,
  Packing: 13,
  Customer: 14,
  User: 15,
  Customerpost: 16,
  Customercharge: 17,
  Storage: 23,
  Process: 24,
};
/**
 * マスタ画面のグリッド
 */
var masterPGs = {
  pgProduct: new PlannerGrid('Product'),
  pgMaterial: new PlannerGrid('Material'),
  pgWeight: new PlannerGrid('Weight'),
  pgWarehouse: new PlannerGrid('Warehouse'),
  pgGari: new PlannerGrid('Gari'),
  pgWeave: new PlannerGrid('Weave'),
  pgCam: new PlannerGrid('Cam'),
  pgMold: new PlannerGrid('Mold'),
  pgManufacture: new PlannerGrid('Manufacture'),
  pgInspectionitem: new PlannerGrid('Inspectionitem'),
  pgWire: new PlannerGrid('Wire'),
  pgTransportCompany: new PlannerGrid('Transportcompany'),
  pgProductcategory: new PlannerGrid('Productcategory'),
  pgPacking: new PlannerGrid('Packing'),
  pgCustomer: new PlannerGrid('Customer'),
  pgUser: new PlannerGrid('User'),
  pgCustomerpost: new PlannerGrid('Customerpost'),
  pgCustomercharge: new PlannerGrid('Customercharge'),
  pgUnit: new PlannerGrid('Unit'),
  // pgUnitHeader: new PlannerGrid('UnitHeader'),
  pgParrangement: new PlannerGrid('Parrangement'),
  pgArrangement: new PlannerGrid('Arrangement'),
  pgTax: new PlannerGrid('Tax'),
  pgInspection: new PlannerGrid('Inspection'),
  pgStorage: new PlannerGrid('Storage'),
  pgProcess: new PlannerGrid('Process'),
};


/** 在庫一覧ダイアログ */
let i = 0;
let STOCKTABS = {
  CR15MSUS: 0,
  CRZN15M: 1,
  CRSUS08: 2,
  // CRSUS10: 3,
  CRSUS12: 3,
  CRSUS15: 4,
  CRSUS1510: 5,
  CRSUS1515: 6,
  CRSUS16: 7,
  CRSUS19: 8,
  CRSUS20: 9,
  CRSUS23: 10,
  CR316L: 11,
  CRZN: 12,
  CRRSVSHT: 13,
  CRSHTSUS: 14,
  CRSHTPLAIN: 16,
  CRSHTOTHER: 17,
  CRRSVRYOKI: 18,
  // CRRSV: 19,

  WVSUS304: 20,
  WVSUS316: 21,
  WVZN: 22,
  WVHEX: 23,
  WVSHT: 24,
  // WVOTH: 25,

  WDSUS: 26,
  WDFE: 27,
  WDOTH: 27,

  // WRMSUS: 28,
  // WRMOTH: 29,
  WRSUS304W1: 30,
  WRSUS304W2: 31,
  WRSUS316: 32,
  WRSUS309W1: 33,
  WRSUS309W2: 34,
  WRSUS310W1: 35,
  WRSUS310W2: 36,
  WRSUSOTH: 37,
  WRFLAT: 38,
  WRAL: 39,
  WRCU: 40,
  WRZN2: 41,
  WRZN3: 42,
  WRHSTEEL: 43,
  WRVINYL: 44,
  WROTH: 45,
  WRMSUS: 46,
  WRMOTH: 47,

  MTPUNCH: 48,
  MTFLATBAR: 49,
  MTROUND: 50,
  MTANGLE: 51,
  MTFE: 52,
  MTBASKET: 53,
  MTBOARD: 54,
  MTPLATE: 55,
  MTOTH: 56,
}

let stockPGs = {
  pgCR15MSUS: new PlannerGrid('CR15MSUS'),
  pgCR15MZN: new PlannerGrid('CR15MZN'),
  pgCRSUS08: new PlannerGrid('CRSUS08'),
  // pgCRSUS10: new PlannerGrid('CRSUS10'),
  pgCRSUS12: new PlannerGrid('CRSUS12'),
  pgCRSUS15: new PlannerGrid('CRSUS15'),
  pgCRSUS1510: new PlannerGrid('CRSUS1510'),
  pgCRSUS1515: new PlannerGrid('CRSUS1515'),
  pgCRSUS16: new PlannerGrid('CRSUS16'),
  pgCRSUS19: new PlannerGrid('CRSUS19'),
  pgCRSUS20: new PlannerGrid('CRSUS20'),
  pgCRSUS23: new PlannerGrid('CRSUS23'),
  pgCR316L: new PlannerGrid('CR316L'),
  pgCRZN: new PlannerGrid('CRZN'),
  pgCRRSVSHT: new PlannerGrid('CRRSVSHT'),
  pgCRSHTSUS: new PlannerGrid('CRSHTSUS'),
  pgCRSHTPLAIN: new PlannerGrid('CRSHTPLAIN'),
  pgCRSHTOTHER: new PlannerGrid('CRSHTOTHER'),
  pgCRRSVRYOKI: new PlannerGrid('CRRSVRYOKI'),

  pgWVSUS304: new PlannerGrid('WVSUS304'),
  pgWVSUS316: new PlannerGrid('WVSUS316'),
  pgWVZN: new PlannerGrid('WVZN'),
  pgWVSHT: new PlannerGrid('WVSHT'),
  pgWVHEX: new PlannerGrid('WVHEX'),
  // pgWVOTH: new PlannerGrid('WVOTH'),
  
  pgWDSUS: new PlannerGrid('WDSUS'),
  pgWDFE: new PlannerGrid('WDFE'),
  pgWDOTH: new PlannerGrid('WDOTH'),
  
  pgWRSUS304W1: new PlannerGrid('WRSUS304W1'),
  pgWRSUS304W2: new PlannerGrid('WRSUS304W2'),
  pgWRSUS316: new PlannerGrid('WRSUS316'),
  pgWRSUS309W1: new PlannerGrid('WRSUS309W1'),
  pgWRSUS309W2: new PlannerGrid('WRSUS309W2'),
  pgWRSUS310W1: new PlannerGrid('WRSUS310W1'),
  pgWRSUS310W2: new PlannerGrid('WRSUS310W2'),
  pgWRSUSOTH: new PlannerGrid('WRSUSOTH'), 
  pgWRFLAT: new PlannerGrid('WRFLAT'),
  pgWRAL: new PlannerGrid('WRAL'),
  pgWRCU: new PlannerGrid('WRCU'),
  pgWRZN2: new PlannerGrid('WRZN2'),
  pgWRZN3: new PlannerGrid('WRZN3'),
  pgWRHSTEEL: new PlannerGrid('WRHSTEEL'), 
  pgWRVINYL: new PlannerGrid('WRVINYL'),
  pgWRFE: new PlannerGrid('WRFE'),
  pgWROTH: new PlannerGrid('WROTH'),
  pgWRMSUS: new PlannerGrid('WRMSUS'),
  pgWRMOTH: new PlannerGrid('WRMOTH'),

  pgMTPUNCH: new PlannerGrid('MTPUNCH'), 
  pgMTFLATBAR: new PlannerGrid('MTFLATBAR'),
  pgMTROUND: new PlannerGrid('MTROUND'),
  pgMTANGLE: new PlannerGrid('MTANGLE'), 
  pgMTFE: new PlannerGrid('MTFE'),
  pgMTBASKET: new PlannerGrid('MTBASKET'),
  pgMTBOARD: new PlannerGrid('MTBOARD'), 
  pgMTPLATE: new PlannerGrid('MTPLATE'), 
  pgMTOTH: new PlannerGrid('MTOTH'),
}

/**
 * BOM展開結果等確認画面の種類別ページ番号一覧
 */
var CHECKDATTABS = {
  // Checkbom: 0,
  Assignstock: 0,
  // Currentstock: 1,
  // Transferstock: 2,
  // Monthstock: 3,
};

/**
 * BOM展開結果等確認画面のグリッド
 */
var checkdatPGs = {
  // pgCheckbom: new PlannerGrid('Checkbom'),
  pgAssignstock: new PlannerGrid('Assignstock'),
  pgManufacturingUse: new PlannerGrid('ManufacturingUse'),
  // pgCurrentstock: new PlannerGrid('Currentstock'),
  // pgTransferstock: new PlannerGrid('Transferstock'),
  // pgMonthstock: new PlannerGrid('Monthstock'),
};


/**
 * 在庫詳細画面用
 */
let DETAILSTOCKTABS =  {
  DTCRIMP: 0,
  DTWIRE: 1,
  DTMATERIAL: 2,
}

let detailStockPGs = {
  pgDTCRIMP: new PlannerGrid('DTCRIMP'),
  pgDTWIRE: new PlannerGrid('DTWIRE'),
  pgDTMATERIAL: new PlannerGrid('DTMATERIAL'),
};

/**
 * 加工内容編集ダイアログ用
 */
var SETTINGTABS = {
  SettingProc: 0,
};

/**
 * 工程編集画面のグリッド
 */
var settingPGs = {
  pgSettingProc: new PlannerGrid('SettingProc'),
};

// マスタの情報を保存（初期カラム定義用）
var dropdownMaster = {
  unit: [],
  // unitASC: [],
  arrangement: [],
  mstpayment: [],
  // mstpaymentplan: [],
  viewplanpayment: [],
  viewplanpaymentproduct: [],
  viewpayment: [],
  viewpaymentadj: [],
  mstmaterial: [],
  mstpcategory03: [],
  mstprocess: [],
};

dropdownMaster.viewplanpayment = [
  { key: '110', val: '入荷予定'},
  { key: '111', val: 'サンプル入荷予定'},
  { key: '119', val: '入荷品返品予定'},
  { key: '210', val: '製造予定'},
  { key: '211', val: '製造予定(副次生成)'},
  { key: '219', val: '在庫数量調整(増加分)'},
  { key: '410', val: '在庫移動(入庫分)'},
  { key: '510', val: '出荷予定'},
  { key: '511', val: 'サンプル出荷予定'},
  { key: '515', val: '未受注引当'},
  { key: '519', val: '出荷返品予定'},
  { key: '610', val: '製造用材料'},
  { key: '611', val: 'その他使用'},
  { key: '619', val: '在庫数量調整(減少分)'},
  { key: '810', val: '在庫移動(出庫分)'},
  { key: '910', val: '廃棄処分'},
];

dropdownMaster.viewplanpaymentproduct = [
  // 副次生成品については、在庫マスタからの新規登録で追加してもらう。
  // { key: '210', val: '製造予定'},
  // { key: '211', val: '製造予定(副次生成)'},
  { key: '610', val: '製造用材料'},
  { key: '611', val: 'その他使用'},
];

dropdownMaster.viewpayment = [
  { key: '110', val: '入荷'},
  { key: '111', val: 'サンプル入荷'},
  { key: '119', val: '入荷品返品'},
  { key: '210', val: '製造'},
  { key: '211', val: '製造(副次生成)'},
  { key: '219', val: '在庫数量調整(増加分)'},
  { key: '410', val: '在庫移動(入庫分)'},
  { key: '510', val: '納品'},
  { key: '511', val: 'サンプル納品'},
  { key: '519', val: '出荷返品'},
  { key: '610', val: '製造用材料'},
  { key: '611', val: 'その他使用'},
  { key: '619', val: '在庫数量調整(減少分)'},
  { key: '810', val: '在庫移動(出庫分)'},
  { key: '910', val: '廃棄処分'},
];

dropdownMaster.viewpaymentadj = [
  { key: '219', val: '在庫数量調整(増加分)'},
  { key: '410', val: '在庫移動(入庫分)'},
  { key: '619', val: '在庫数量調整(減少分)'},
  { key: '810', val: '在庫移動(出庫分)'},
  { key: '910', val: '廃棄処分'},
];


const STOCKCATEGORY = [
  // crimp: 0,
  // weave: 1,
  // welding: 2,
  // wire: 3,
  // material: 4,
  'crimp',
  'weave',
  'welding',
  'wire',
  'material',
];

const STPLAN_RECEIVE = 'RECEIVE';
const STPLAN_RECEIVE_DT = 'RECEIVEDT';
const STPLAN_PRODUCE = 'PROD';
const STPLAN_PRODUCE_DT = 'PRODDT';
const ST_ADJUST = 'ADJUST';
const ST_TRANSFER = 'TRANSFER';


/**
 * 初期化処理
 */
function initApp() {
  let mainHeader = []; 

  $('#inittext').hide();
  // DatePicker初期設定
  $['datepicker']['setDefaults']($['datepicker']['regional']['ja']);
  $['datepicker']['setDefaults']({ 'dateFormat': 'yy/mm/dd' });
  // マスタ読込
  readMaster();
  // マスタ情報を取得
  readDropdownMaster();
  // 列情報設定
  definePGColumns();
  // 在庫ビュー読込
  readStockView('', 'CREATE');

  // ユーザー情報を取得
  Object.keys(mainPGs).forEach(function (element) {
    /** @type {PlannerGrid} */
    var mPG = mainPGs[element];
    if (mPG.divId === 'MOD') {
      /** @type {PGHeaderDetail} */
      var ePG = editPGs['pgMOD'];
      var ePG2 = editPGs['pgAT'];
      var ePG3 = editPGs['pgMST'];
      mPG.columns.forEach(function (elem) {
        if (elem['isMain']) {
          // 親画面
          mainHeader.push(Object.assign({}, elem));
        }
        if (elem['isDetailPK'] || elem['isDetail']) {
          ePG.d.columns.push(Object.assign({}, elem));
        }
        if (elem['isHeaderPK'] || elem['isHeader']) {
          ePG.h.columns.push(Object.assign({}, elem));
        }
        if (elem['is2Detail'] || elem['is2DetailPK']) {
          ePG2.d.columns.push(Object.assign({}, elem));
        }
        if (elem['is2Header'] || elem['is2HeaderPK']) {
          ePG2.h.columns.push(Object.assign({}, elem));
        }
        if (elem['is3Detail'] || elem['is3DetailPK']) {
          ePG3.d.columns.push(Object.assign({}, elem));
        }
        if (elem['is3Header'] || elem['is3HeaderPK']) {
          ePG3.h.columns.push(Object.assign({}, elem));
        }
      });
    } else if (mPG.divId === 'OOD') {
      /** @type {PGHeaderDetail} */
      var ePG = editPGs['pgOOD'];
      var ePG2 = editPGs['pgAOO'];
      var ePG3 = editPGs['pgOST'];
      mPG.columns.forEach(function (elem) {
        if (elem['isMain']) {
          // 親画面
          mainHeader.push(Object.assign({}, elem));
        }
        if (elem['isDetailPK'] || elem['isDetail']) {
          ePG.d.columns.push(Object.assign({}, elem));
        }
        if (elem['isHeaderPK'] || elem['isHeader']) {
          ePG.h.columns.push(Object.assign({}, elem));
        }
        if (elem['is2Detail'] || elem['is2DetailPK']) {
          ePG2.d.columns.push(Object.assign({}, elem));
        }
        if (elem['is2Header'] || elem['is2HeaderPK']) {
          ePG2.h.columns.push(Object.assign({}, elem));
        }
        if (elem['is3Detail'] || elem['is3DetailPK']) {
          ePG3.d.columns.push(Object.assign({}, elem));
        }
        if (elem['is3Header'] || elem['is3HeaderPK']) {
          ePG3.h.columns.push(Object.assign({}, elem));
        }
      });
    } else if (mPG.divId === 'STPlan') {
      // 入出庫予定は編集画面が製造使用と客先引当の2種。
      let ePG = editPGs['pgSTPlan'];
      let ePG2 = editPGs['pgSTPProduce'];
      let ePG3 = editPGs['pgSTPReceive'];
      mPG.columns.forEach(function (elem) {
        if (elem['isMain']) {
          // 親画面
          mainHeader.push(Object.assign({}, elem));
        }
        if (elem['isDetailPK'] || elem['isDetail']) {
          ePG.d.columns.push(Object.assign({}, elem));
        }
        if (elem['isHeaderPK'] || elem['isHeader']) {
          ePG.h.columns.push(Object.assign({}, elem));
        }
        if (elem['is2Detail'] || elem['is2DetailPK']) {
          ePG2.d.columns.push(Object.assign({}, elem));
        }
        if (elem['is2Header'] || elem['is2HeaderPK']) {
          ePG2.h.columns.push(Object.assign({}, elem));
        }
        if (elem['is3Detail'] || elem['is3DetailPK']) {
          ePG3.d.columns.push(Object.assign({}, elem));
        }
        if (elem['is3Header'] || elem['is3HeaderPK']) {
          ePG3.h.columns.push(Object.assign({}, elem));
        }
      });
    } else if (mPG.divId === 'ST') {
      // 入出庫予定は編集画面が製造使用と客先引当の2種。
      let ePG = editPGs['pgST'];
      // let ePG2 = editPGs['pgSTAdjust'];
      // let ePG3 = editPGs['pgSTTransfer'];
      mPG.columns.forEach(function (elem) {
        if (elem['isMain']) {
          // 親画面
          mainHeader.push(Object.assign({}, elem));
        }
        if (elem['isDetailPK'] || elem['isDetail']) {
          ePG.d.columns.push(Object.assign({}, elem));
        }
        if (elem['isHeaderPK'] || elem['isHeader']) {
          ePG.h.columns.push(Object.assign({}, elem));
        }
        // if (elem['is2Detail'] || elem['is2DetailPK']) {
        //   ePG2.d.columns.push(Object.assign({}, elem));
        // }
        // if (elem['is2Header'] || elem['is2HeaderPK']) {
        //   ePG2.h.columns.push(Object.assign({}, elem));
        // }
        // if (elem['is3Detail'] || elem['is3DetailPK']) {
        //   ePG3.d.columns.push(Object.assign({}, elem));
        // }
        // if (elem['is3Header'] || elem['is3HeaderPK']) {
        //   ePG3.h.columns.push(Object.assign({}, elem));
        // }
      });
    } else {
      /** @type {PGHeaderDetail} */
      var ePG = editPGs[element];
      mPG.columns.forEach(function (elem) {
        if (elem['isMain']) {
          // 親画面
          mainHeader.push(Object.assign({}, elem));
        }
        if (!(elem['isHeaderPK'] || elem['isHeader'] || elem['isMain'])) {
          // 明細画面 
          ePG.d.columns.push(Object.assign({}, elem));
        }
        if ((elem['isHeader'] || elem['isHeaderPK']) && !elem['isMain']) {
          // 明細画面　ヘッダー
          ePG.h.columns.push(Object.assign({}, elem));
        }
      });
    }
  });

  // 一覧の表示項目を再設定
  resetList();

  Object.keys(editPGs).forEach(function (elem) {
    /** @type {PGHeaderDetail} */
    var ePG = editPGs[elem];
    ePG.d['options']['showHeaderRow'] = false;
    ePG.h['options']['showHeaderRow'] = false;
    ePG.d['options']['createFooterRow'] = true;
    ePG.d['options']['showFooterRow'] = true;
    ePG.d['options']['footerRowHeight'] = 21;
  });
  disableEditorOptions();
  // 計算用Grid
  Object.keys(calcPGs).forEach(function (element) {
    /** @type {PGDoubleHeaderDetail} */
    let caPG = calcPGs[element];
    caPG.columns.forEach(function (elem) {
      if (elem['isHeader']) {
        // ヘッダー
        caPG.h1.columns.push(Object.assign({}, elem));
      } else if (elem['isHeader2']) {
        caPG.h2.columns.push(Object.assign({}, elem));
      } else if (elem['isDetail2']) {
        caPG.d2.columns.push(Object.assign({}, elem));
      } else {
        caPG.d1.columns.push(Object.assign({}, elem));
      }
    });
  })
  Object.keys(calcPGs).forEach(function (elem) {
    /** @type {PGDoubleHeaderDetail} */
    let caPG = calcPGs[elem];
    caPG.d1['options']['showHeaderRow'] = false;
    if (elem === 'pgProdMold') {
      caPG.d2['options']['showHeaderRow'] = false;
    }
    caPG.h1['options']['showHeaderRow'] = false;
    caPG.h2['options']['showHeaderRow'] = false;
    caPG.d1['options']['createFooterRow'] = false;
    caPG.d1['options']['showFooterRow'] = false;
    caPG.d1['options']['footerRowHeight'] = 21;
    if (elem === 'pgProdMold') {
      caPG.d2['options']['createFooterRow'] = false;
      caPG.d2['options']['showFooterRow'] = false;
      caPG.d2['options']['footerRowHeight'] = 21;
    }
  });
  Object.keys(calcPGs).forEach(function (elem) {
    /** @type {PGDoubleHeaderDetail} */
    let caPG = calcPGs[elem];
    if (elem === 'pgProdMold') {
      caPG.d2.initGrid();
      caPG.d2.assignGrid();
    }
    caPG.d1.initGrid();
    caPG.d1.assignGrid();
    caPG.h2.initGrid();
    caPG.h2.assignGrid();
    caPG.h1.initGrid();
    caPG.h1.assignGrid();
  });

  Object.keys(mainPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var mPG = mainPGs[elem];
    if (elem === 'pgMOD') {
      /** @type {PGHeaderDetail} */
      var ePG = editPGs['pgMOD'];
      var ePG2 = editPGs['pgAT'];
      var ePG3 = editPGs['pgMST'];
      mPG.initGrid();
      ePG.d.initGrid();
      ePG.h.initGrid();
      ePG2.d.initGrid();
      ePG2.h.initGrid();
      ePG3.d.initGrid();
      ePG3.h.initGrid();
      mPG.assignGrid();
      ePG.d.assignGrid();
      ePG.h.assignGrid();
      ePG2.d.assignGrid();
      ePG2.h.assignGrid();
      ePG3.d.assignGrid();
      ePG3.h.assignGrid();
    } else if (elem === 'pgOOD') {
      /** @type {PGHeaderDetail} */
      var ePG = editPGs['pgOOD'];
      var ePG2 = editPGs['pgAOO'];
      var ePG3 = editPGs['pgOST'];
      mPG.initGrid();
      ePG.d.initGrid();
      ePG.h.initGrid();
      ePG2.d.initGrid();
      ePG2.h.initGrid();
      ePG3.d.initGrid();
      ePG3.h.initGrid();
      mPG.assignGrid();
      ePG.d.assignGrid();
      ePG.h.assignGrid();
      ePG2.d.assignGrid();
      ePG2.h.assignGrid();
      ePG3.d.assignGrid();
      ePG3.h.assignGrid();
    } else if (elem === 'pgSTPlan') {
      /** @type {PGHeaderDetail} */
      let ePG = editPGs['pgSTPlan'];
      let ePG2 = editPGs['pgSTPProduce'];
      let ePG3 = editPGs['pgSTPReceive'];
      mPG.initGrid();
      ePG.d.initGrid();
      ePG.h.initGrid();
      ePG2.d.initGrid();
      ePG2.h.initGrid();
      ePG3.d.initGrid();
      ePG3.h.initGrid();
      mPG.assignGrid();
      ePG.d.assignGrid();
      ePG.h.assignGrid();
      ePG2.d.assignGrid();
      ePG2.h.assignGrid();
      ePG3.d.assignGrid();
      ePG3.h.assignGrid();
    } else if (elem === 'pgST') {
      /** @type {PGHeaderDetail} */
      let ePG = editPGs['pgST'];
      // let ePG2 = editPGs['pgSTAdjust'];
      // let ePG3 = editPGs['pgSTTransfer'];
      mPG.initGrid();
      ePG.d.initGrid();
      ePG.h.initGrid();
      // ePG2.d.initGrid();
      // ePG2.h.initGrid();
      // ePG3.d.initGrid();
      // ePG3.h.initGrid();
      mPG.assignGrid();
      ePG.d.assignGrid();
      ePG.h.assignGrid();
      // ePG2.d.assignGrid();
      // ePG2.h.assignGrid();
      // ePG3.d.assignGrid();
      // ePG3.h.assignGrid();
    } else {
      /** @type {PGHeaderDetail} */
      var ePG = editPGs[elem];
      mPG.initGrid();
      ePG.d.initGrid();
      ePG.h.initGrid();
      mPG.assignGrid();
      ePG.d.assignGrid();
      ePG.h.assignGrid();
    }
  });

  // 番号一覧 初期設定
  Object.keys(numberListPGs).forEach(function (elem) {
    let pg = numberListPGs[elem];
    pg['options']['showHeaderRow'] = true;
    pg.initGrid();
    pg.assignGrid();
  });

  Object.keys(masterPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var mPG = masterPGs[elem];
    mPG.initGrid();
    mPG.assignGrid();
  });

  // 在庫画面
  Object.keys(stockPGs).forEach((elem) => {
    let pg = stockPGs[elem];
    pg['options']['showHeaderRow'] = true;
    pg.initGrid();
    pg.assignGrid();
  });

  Object.keys(detailStockPGs).forEach((elem) => {
    /** @type {PlannerGrid} */
    let pg = detailStockPGs[elem];
    pg['options']['showHeaderRow'] = true;
    pg.initGrid();
    pg.assignGrid();
  });

  Object.keys(checkdatPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var cPG = checkdatPGs[elem];
    cPG.initGrid();
    cPG.assignGrid();
  });

  Object.keys(settingPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var sPG = settingPGs[elem];
    sPG.initGrid();
    sPG.assignGrid();
  });

  // タブ毎のボタンを追加
  Object.keys(mainPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var mPG = mainPGs[elem];
    /** @type {PGHeaderDetail} */
    var ePG = editPGs[elem];
    mPG.addButton('読込', function () {
      readdata(mPG);
    });
    if (elem === 'pgED' || elem === 'pgMOD') {
      // 受注タブ・発注タブのみ「過去データ」ボタンを追加し、リミット制限を解除して読込
      mPG.addButton('過去データ', function () {
        readUnlimited(mPG);
      });
    }
    mPG.addButton('CSV出力', function () { exportGridToCSV(mPG); });
    if (elem !== 'pgOOD' && elem !== 'pgMOD' && elem !== 'pgSTPlan') {
      // 入出庫履歴は編集機能別途
      // 製造委託画面・発注画面は画面遷移が異なるので別途
      mPG.addButton('編集(F2)', function () { 
        editData(mPG, ePG.h, ePG.d);
      });
    }
    // if (elem === 'pgLP') {    
    //   editPGs.pgLP.d.addButton('製造指示ファイル', function () {
    //     // if (IsDirtyCheck(editPGs.pgLP.d)) {
    //     //   // 転記の場合、DB登録しているか
    //     //   window.alert('データ登録してからファイル発行をしてください');
    //     // } else {
    //     //   window.open('./db.php?req=makeLPFile' +
    //     //     makeHeaderPKQuery(mainPGs.pgLP.columns, editPGs.pgLP.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
    //     // }
    //   });
    // }
  });
  mainPGs.pgProdplans.addButton('新規登録(F3)', function () { 
    insertNewData(mainPGs.pgProdplans, editPGs.pgProdplans.h, editPGs.pgProdplans.d); 
  });
  mainPGs.pgProdplans.addButton('製造指示引継取消', () => {
    cancelProdplans(mainPGs.pgProdplans).done((data)=> {
      if (data.msg) {
        alert(data.msg);
      } else {
        alert('データ取消が完了しました。');
      }
      readdata(mainPGs.pgProdplans);
    });
  });

  // 受注一覧************************************************************
  mainPGs.pgED.addButton('新規登録(F3)', function () {
    insertNewData(mainPGs.pgED, editPGs.pgED.h, editPGs.pgED.d);
  });
  mainPGs.pgED.addButton('リピート', function () { repeatEstimate(); });
  // 2023/2/10　製造計画の開発開始まで不要のため以下コメントアウト
  /*
  mainPGs.pgED.addButton('製造指示', function () {
    issueProdPlans();
  });
  mainPGs.pgED.addButton('製造完了', function () {
    // 見積書の全データ
    const items = mainPGs.pgED.grid.getData().getItems() || [];
    // 選択行の要素番号
    const selectedIndexList = mainPGs.pgED.grid.getSelectedRows();
    // 選択されたデータ
    const selectedItems = [];
    selectedIndexList.forEach(function (selectedIndex) {
      const matchedData =  items.find(function (item, i) {
        return selectedIndex === i;
      });

      if (matchedData) {
        selectedItems.push(matchedData);
      }
    });

    // 選択行なしの場合、エラーメッセージを表示
    if (selectedItems.length === 0) {
      alert('データを選択してください。');
      return;
    }

    // 製品手配方法　が「金網製造」か「定尺切断」以外の場合、エラーメッセージを表示
    let isError = selectedItems.some(function (item) {
      return item['ed_ar_cd'] === '' || parseInt(item['ed_ar_cd']) > 2 ;
    });
    if (isError) {
      alert('製造手配方法が「金網製造」「定尺切断」のデータを選択してください。');
      return;
    }

    // let isStored = selectedItems.some(function (item) {
    //   return item['ed_warehouse_cd'];
    // });

    // if (!isStored) {
    //   alert('予定入庫先を指定してください。');
    //   return;
    // }

    // 製造完了処理
    completeProd(selectedItems);
  });
  */
  mainPGs.pgED.addButton('出荷引継', function () {
    issueShipPlans(editPGs.pgED.h, editPGs.pgED.d);
  });
  mainPGs.pgED.addButton('発注引継', function () {
    isMoedNewRegistration = true;
    issueMOrder();
  });  
  // 2023/2/10　製造委託はしないためコメントアウト（最終的に製造委託のタブも除ける）
  // mainPGs.pgED.addButton('製造委託引継', function () {
  //   issueOOrder();
  // });
  mainPGs.pgED.addButton('現品票発行', function () { 
    exportIDSheet(); 
    // printQR(editPGs.pgMOD.h, editPGs.pgMOD.d);
  });
  mainPGs.pgED.addButton('受注取消', function () {
    // チェックした行の要素番号
    const rowIndexList = mainPGs.pgED.grid.getSelectedRows();
    // 全受注データ
    const estimateDataList =  mainPGs.pgED.dataView.getItems()
    // 明細データ取得
    const detailRows = [];
    rowIndexList.forEach(function (rowIndex) {
      const activeRow = mainPGs.pgED.dataView.getItem(rowIndex);
      estimateDataList.forEach(function (estimateData) {
        if (activeRow['ed_estimate_no'] === estimateData['ed_estimate_no']) {
          detailRows.push(estimateData);
        }
      })
    });

    // 受注Noが重複しないように編集する
    const uniqueEstimateNoDataList = [];
    detailRows.forEach(function (detailRow) {
      // 受注Noが重複しないようデータを追加する
      const existSameEstimateNo = uniqueEstimateNoDataList.some(function (uniqueData) {
        return uniqueData['ed_estimate_no'] === detailRow['ed_estimate_no'];
      })
      if (!existSameEstimateNo) {
        uniqueEstimateNoDataList.push(detailRow);
      }
    });

    // 複数行チェックされている場合、エラーメッセージを表示
    if (uniqueEstimateNoDataList.length > 1) {
      alert('複数の受注Noが選択されています。\n受注取消は、1受注ずつ行って下さい。')
      return;
    }

    // チェック行が無い場合は処理を終了
    if (uniqueEstimateNoDataList.length === 0) {
      alert('受注取消する行を選択してください。');
      return;
    }

    for (let i = 0; i < detailRows.length; i++) {
      if(detailRows[i]['ed_type_moed'] === '1' || detailRows[i]['ed_ship_status_sign'] === '1' || detailRows[i]['ed_ship_status_sign'] === '2') {
        alert('引継されたデータが含まれているため、受注取消できません。');
        return;
      }
    }

    // 受注データの削除処理
    deletedata(mainPGs.pgED, detailRows).done(function () {
      readdata(mainPGs.pgED);
      alert('受注取消が完了しました。');
    });
  });
  // 2023/4/6　QRは読み取りした内容の書き込みのためコメントアウト
  // mainPGs.pgED.addButton('QR検索', function () {
  //   // 読取後にsetQRData()が呼ばれ、検索が走り、子画面は閉じる
  //   window.open('./qrscan/index.php?mode=est', 'QRScan', 'top=200, left=200, width=400, height=300');
  // });
  mainPGs.pgED.addButton('番号一覧', function () {
    displayNumberList(mainPGs.pgED, numberListPGs.pgED);
  });

  // 発注一覧*************************************************************
  mainPGs.pgMOD.addButton('編集(F2)', function () {
    isMoedNewRegistration = false;
    editOrderDetails(mainPGs.pgMOD, '0');
  })
  mainPGs.pgMOD.addButton('新規登録(F3)', function () {
    isMoedNewRegistration = true;
    insertNewData(mainPGs.pgMOD, editPGs.pgMOD.h, editPGs.pgMOD.d);
  });
  mainPGs.pgMOD.addButton('リピート', function () {
    isMoedNewRegistration = true;
    repeatMoed();
  });
  mainPGs.pgMOD.addButton('現品票発行', function () { 
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // チェックが入っているレコード取得
    let activeRowsMOD = [];
    let rowsData = mainPGs.pgMOD.grid.getData().getFilteredItems();
    let nIndex = mainPGs.pgMOD.grid.getSelectedRows();
    nIndex.sort(function (a, b) {
      return a - b;
    })
    for (var i = 0; i < nIndex.length; i++) {
      if (rowsData.length <= nIndex[i] ) {
        // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
        break;
      }
      if (rowsData[nIndex[i]]['moed_inventory_type'] != '1' && rowsData[nIndex[i]]['moed_type_02'] != '1') {
        alert('入庫報告済み、在庫管理対象の発注データを選択してください。');
        return;  
      }
      activeRowsMOD.push(rowsData[nIndex[i]]);
    }
    if (activeRowsMOD.length <= 0) {
      alert('現品票発行可能な発注データを選択してください。');
      return;
    }
    let str = '';
    for (let i = 0; i < activeRowsMOD.length; i++) {
      activeRowsMOD[i]['moed_sub_cd'] = SetPadding(activeRowsMOD[i]);
      // 場所CDは「moed_customer_charge_cd」で表示されているため注意。
      if (i === 0) {
        str += 'str' + i + '=' + activeRowsMOD[i]['moed_customer_charge_cd'] + ',' + activeRowsMOD[i]['moed_product_cd'] + ',' + activeRowsMOD[i]['moed_sub_cd'] + ',' + activeRowsMOD[i]['moed_unit_eval'] + ',' + activeRowsMOD[i]['moed_type_subject'] + ',' + activeRowsMOD[i]['moed_parrangement_cd'];
      } else {
        str += '&str' + i + '=' + activeRowsMOD[i]['moed_customer_charge_cd'] + ',' + activeRowsMOD[i]['moed_product_cd'] + ',' + activeRowsMOD[i]['moed_sub_cd'] + ',' + activeRowsMOD[i]['moed_unit_eval'] + ',' + activeRowsMOD[i]['moed_type_subject'] + ',' + activeRowsMOD[i]['moed_parrangement_cd'];
      }
    }
    window.open('./db.php?req=makeStorageIDSheet&' + 
    str, '現品票データダウンロード', 'top=200, left=200, width=400, height=300');   
  
    // 仕入れ先、発注No、材料品名、ロットNo、重量、入荷日
    // window.open('./db.php?req=reissueQR&' + str, '_blank', 'width=400, height=300');
    // return;
  });

  mainPGs.pgMOD.addButton('発注引継取消', function () {
    // 全明細リスト
    let activeRows = [];
    const detailRows = mainPGs.pgMOD.grid.getData().getFilteredItems();
    // チェックされた要素番号リスト
    const selectedfRowIndexList = mainPGs.pgMOD.grid.getSelectedRows();
    selectedfRowIndexList.sort(function (a, b) {
      return a - b;
    });
    for (var i = 0; i < selectedfRowIndexList.length; i++) {
      if (detailRows.length < selectedfRowIndexList[i] ) {
        // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
        break;
      }
      activeRows.push(detailRows[selectedfRowIndexList[i]]);
    }
    if (activeRows.length <= 0) {
      alert('取消する行を選択してください。');
      return;
    }

    // 引継ぎではない発注データが含まれる場合は除外
    for (let i = 0; i < activeRows.length; i++) {
      let record = activeRows[i];
      // let record = detailRows[selectedfRowIndexList[i]];
      if (!isSet(record['moed_refer_no'])) {
        alert('選択したデータは引継されたデータではありません。');
        return;
      }
    }

    // 発注番号が重複しないように編集する
    const selectedRows = [];
    selectedfRowIndexList.forEach(function (selectedIndex) {
      // 発注番号が重複しないようデータを追加する
      const existModeNoItem = selectedRows.find(function (selectedRow) {
        return selectedRow['moed_order_no'] === detailRows[selectedIndex]['moed_order_no'];
      })
      if (!existModeNoItem) {
        selectedRows.push(detailRows[selectedIndex]);
      }
    });

    // 発注引継ぎの取消処理
    cancelOrderTakeover(selectedRows);
  });

  mainPGs.pgMOD.addButton('入庫報告', function () {
    editDataStored(mainPGs.pgMOD, editPGs.pgMST.h, editPGs.pgMST.d);
  });
  mainPGs.pgMOD.addButton('検収報告', function () { acceptanceReport(mainPGs.pgMOD, 1); });
  mainPGs.pgMOD.addButton('部分検収', function () {
    editOrderDetails(mainPGs.pgMOD, '1');
  });
  mainPGs.pgMOD.addButton('検収取消', function () { acceptanceReport(mainPGs.pgMOD, 0); });
  // 2023/4/6　QRは読み取りした内容の書き込みのためコメントアウト
  // mainPGs.pgMOD.addButton('QR使用入庫報告', function () {
  //   var activeRow = mainPGs.pgMOD.getActiveRow();
  //   if (!activeRow) {
  //     window.alert('入庫登録する行を選択してください。');
  //     return;
  //   }
  //   window.open('./qrscan/index.php?mode=storage&orderno=' + activeRow['moed_order_no'], 'QR入庫', 'top=200, left=200, width=800, height=800');
  // });
  // 2023/4/6　QRは読み取りした内容の書き込みのためコメントアウト
  // mainPGs.pgMOD.addButton('QR使用検収', function () { 
  //   var activeRow = mainPGs.pgMOD.getActiveRow();
  //   if (!activeRow) {
  //     window.alert('検収登録する行を選択してください。');
  //     return;
  //   }
  //   window.open('./qrscan/index.php?mode=accept&orderno=' + activeRow['moed_order_no'], 'QR検収', 'top=200, left=200, width=800, height=800');
  // });
  // 2023/4/6　QRは読み取りした内容の書き込みのためコメントアウト
  // mainPGs.pgMOD.addButton('QR検索', function () {
  //   // 読取後にsetQRData()が呼ばれ、検索が走り、子画面は閉じる
  //   window.open('./qrscan/index.php?mode=moed', 'QRScan', 'top=200, left=200, width=400, height=300');
  // });
  mainPGs.pgMOD.addButton('番号一覧', function () {
    displayNumberList(mainPGs.pgMOD, numberListPGs.pgMOD);
  });

  // 外注委託****************************************************************
  mainPGs.pgOOD.addButton('編集(F2)', function () {
    editOrderDetails(mainPGs.pgOOD, '0');
  })
  mainPGs.pgOOD.addButton('新規登録(F3)', function () {
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
      let gdat = editPGs.pgOOD.h.dataView.getItems();
      gdat['moed_order_no'] = strOrderNo;
      gdat['moed_data_status'] = '0'  // 新規登録

      insertNewData(mainPGs.pgOOD, editPGs.pgOOD.h, editPGs.pgOOD.d);
    });
  });
  mainPGs.pgOOD.addButton('リピート', function () { repeatOod(); });
  
  mainPGs.pgOOD.addButton('入庫報告', function () {
    editDataStored(mainPGs.pgOOD, editPGs.pgOST.h, editPGs.pgOST.d);
  });
  mainPGs.pgOOD.addButton('検収報告', function () { acceptanceReport(mainPGs.pgOOD, 1); });
  mainPGs.pgOOD.addButton('部分検収', function () {
    editOrderDetails(mainPGs.pgOOD, '1');
  });
  mainPGs.pgOOD.addButton('検収取消', function () { acceptanceReport(mainPGs.pgOOD, 0); });
  // 2023/4/6　QRは読み取りした内容の書き込みのためコメントアウト
  // mainPGs.pgOOD.addButton('QR検索', function () {
  //   // 読取後にsetQRData()が呼ばれ、検索が走り、子画面は閉じる
  //   window.open('./qrscan/index.php?mode=ood', 'QRScan', 'top=200, left=200, width=400, height=300');
  // });
  mainPGs.pgOOD.addButton('番号一覧', function () {
    displayNumberList(mainPGs.pgOOD, numberListPGs.pgOOD);
  });

  // 出荷予定一覧***********************************************
  mainPGs.pgSD.addButton('送状発行', function () {
    // チェックしたレコードの送状データ出力
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // チェックが入っているレコード取得
    let activeRowsSD = [];
    let rowsData = mainPGs.pgSD.grid.getData().getFilteredItems();
    let nIndex = mainPGs.pgSD.grid.getSelectedRows();
    nIndex.sort(function (a, b) {
      return a - b;
    })
    let str = '';
    let bCSV = false;
    let bCSVSG = false;
    let bExcel = false;
    let bStay = false;  // 止め先指定があるか
    for (var i = 0; i < nIndex.length; i++) {
      if (rowsData.length < nIndex[i] ) {
        // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
        break;
      }
      if (isSet(rowsData[nIndex[i]]['s_stay_cd'])) {
        bStay = true;
      }
      activeRowsSD.push(rowsData[nIndex[i]]);
    }
    if (activeRowsSD.length <= 0) {
      alert('送状データを出力する行を選択してください');
      return;
    }
    if (IsDirtyCheck(editPGs.pgSD.d) && IsDirtyCheck(editPGs.pgSD.h)) {
      alert('編集中の出荷予定データを登録してから、送状データ出力して下さい。');
      return;
    }
    if (bStay) {
      // 止め先が指定されている場合は、メッセージ表示
      alert('止め先が指定されています。送状データ取込時に別途指定する必要があります。');
    }
    
    for (let i = 0; i < activeRowsSD.length; i++) {
      // マスタデータのフラグを取得するように変更すること。
      // 送状発行するデータを選択時、納品枝番毎に出荷指示が登録されているため、チェック行はより細かい枝番で指定しているが、出荷枝番まででデータを取得するように変更。
      if ((String)(activeRowsSD[i]['s_tc_short_name']).match('福山')) {
        bCSV = true;
      } else if ((String)(activeRowsSD[i]['s_tc_short_name']).match('佐川')) {
        bCSVSG = true;
      } else {
        bExcel = true;
      }

      if (i === 0) {
        str += 'str' + i + '="' + activeRowsSD[i]['sd_e_estimate_no'] + '","' + activeRowsSD[i]['sd_statement_sub_no'] + '","' + activeRowsSD[i]['sd_estimate_sub_no'] + '","' + activeRowsSD[i]['sd_shipment_sub_no'] + '"';
      } else {
        str += '&str' + i + '="' + activeRowsSD[i]['sd_e_estimate_no'] + '","' + activeRowsSD[i]['sd_statement_sub_no'] + '","' + activeRowsSD[i]['sd_estimate_sub_no'] + '","' + activeRowsSD[i]['sd_shipment_sub_no'] + '"';
      }
    }
    if (bExcel) {
      window.open('./db.php?req=createShippingLabel&' +
      str, '送状データダウンロード', 'top=200, left=200, width=400, height=300');
    }
    if (bCSV) {
      window.open('./db.php?req=createShippingLabelCSV&' +
      str, '福通専用送状ダウンロード', 'top=200, left=200, width=400, height=300');
    }
    if (bCSVSG) {
      window.open('./db.php?req=createShippingLabelCSVSG&' +
      str, '佐川専用送状ダウンロード', 'top=200, left=200, width=400, height=300');
    }
  });

  // $("#download").on('click',function(){
  //     $('<form/>',{action:'makeMonthlyShippingLabel.php', method:'post'})
  //         .append($('<input/>', {type: 'hidden', name: "foo", value: "bar"}))
  //         .appendTo(document.body)
  //         .submit()
  //         .remove();
  // });
  mainPGs.pgSD.addButton('出荷引継取消', function () {
    // チェックしたレコードの送状データ出力
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if (IsDirtyCheck(editPGs.pgSD.d) && IsDirtyCheck(editPGs.pgSD.h)) {
      alert('編集中の出荷予定データを登録してから、出荷引継取消を行ってください。');
      return;
    }
    // チェックが入っているレコード取得
    let activeRowsSD = [];
    let rowsData = mainPGs.pgSD.grid.getData().getFilteredItems();
    let nIndex = mainPGs.pgSD.grid.getSelectedRows();
    nIndex.sort(function (a, b) {
      return a - b;
    })
    let alertData = [];
    
    let j = 0;
    for (let i = 0; i < nIndex.length; i++) {
      if (rowsData.length < nIndex[i] ) {
        // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
        break;
      }
      if (isSet(rowsData[nIndex[i]]['sd_shipment_date'])) {
        alertData[j] = rowsData[nIndex[i]];
        j++;
      }
      activeRowsSD.push(rowsData[nIndex[i]]);
    }
    if (activeRowsSD.length <= 0) {
      alert('出荷引継取消する行を選択してください。');
      return;
    }
    if (alertData.length > 0) {
      let str = '';
      for (let j = 0; j < alertData.length; j++) {
        str += alertData[j]['sd_e_estimate_no'] + ' ' + alertData[j]['sd_statement_sub_no'] + '\n';
      }
      alert('既に出荷されたデータが選択されています。出荷後は引継取消できません。\n ' + str);
      return;
    }
    ajaxCancelShipPlans(activeRowsSD).then(function (data, textStatus, jqXHR) {
      if (data['succeed']) {
        alert('出荷引継を取り消しました。');
      } else {
        alert(data['msg']);
      }

      readdata(mainPGs.pgSD);
      readdata(mainPGs.pgED);
    });
  });
  // 2023/2/10　受注画面から受注取消を行うように変更するためコメントアウト
  /*
  mainPGs.pgSD.addButton('受注取消', function () {
    // チェックしたレコードの送状データ出力
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if (IsDirtyCheck(editPGs.pgSD.d) && IsDirtyCheck(editPGs.pgSD.h)) {
      alert('編集中の出荷予定データを登録してから、受注取消を行ってください。');
      return;
    }
    // チェックが入っているレコード取得
    let activeRowsSD = [];
    let rowsData = mainPGs.pgSD.grid.getData().getFilteredItems();
    let nIndex = mainPGs.pgSD.grid.getSelectedRows();
    nIndex.sort(function (a, b) {
      return a - b;
    })
    let alertData = [];
    let j = 0;
    for (var i = 0; i < nIndex.length; i++) {
      if (rowsData.length < nIndex[i] ) {
        // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
        break;
      }
      if (isSet(rowsData[nIndex[i]]['sd_shipment_date'])) {
        alertData[j] = rowsData[nIndex[i]];
        j++;
      }
      activeRowsSD.push(rowsData[nIndex[i]]);
    }
    if (activeRowsSD.length <= 0) {
      alert('受注取消する行を選択してください。');
      return;
    }
    // for (let i = 0; i < nIndex.length; i++) {
    //   if (isSet(rowsData[nIndex[i]]['sd_shipment_date'])) {
    //     alertData[j] = rowsData[nIndex[i]];
    //     j++;
    //   }
    //   activeRowsSD.push(rowsData[nIndex[i]]);
    // }
    if (alertData.length > 0) {
      let str = '';
      for (let j = 0; j < alertData.length; j++) {
        str += alertData[j]['sd_e_estimate_no'] + ' ' + alertData[j]['sd_statement_sub_no'] + '\n';
      }
      alert('既に出荷されたデータが選択されています。出荷後は受注取消できません。\n ' + str);
      return;
    }
    cancelEstimateInheriting(activeRowsSD).then(function (data, textStatus, jqXHR) {
      if (data['succeed']) {
        alert('受注取消が完了しました。');
      } else {
        alert(data['msg']);
      }
      readdata(mainPGs.pgSD);
    });
  });
  */

  // mainPGs.pgSD.addButton('請求書発行前確認シート', () => {
  //   window.open('./db.php?req=createCheckStatementSheet', '請求書発行前確認シート', 'top=200, left=200, width=400, height=300')
  // });
  // 2023/4/6　QRは読み取りした内容の書き込みのためコメントアウト
  // mainPGs.pgSD.addButton('QR検索', function () {
  //   // 読取後にsetQRData()が呼ばれ、検索が走り、子画面は閉じる
  //   window.open('./qrscan/index.php?mode=sd', 'QRScan', 'top=200, left=200, width=400, height=300');
  // });
  mainPGs.pgSD.addButton('番号一覧', function () {
    displayNumberList(mainPGs.pgSD, numberListPGs.pgSD);
  });


  // 入出庫予定 ********************************************************************************************
  mainPGs.pgSTPlan.addButton('編集', () => {
    // データによって編集可能

    // 製造のレコードでない場合は、編集不可
    const activeRow = mainPGs.pgSTPlan.getActiveRow();
    if (!isSet(activeRow)) {
      alert('データを選択してください。');
      return;
    }

    if (activeRow['stc_arrange_type'] === '610' || activeRow['stc_arrange_type'] === '611') {
      // 製造材料
      editSTPlanDetails(mainPGs.pgSTPlan, editPGs.pgSTPProduce.h, editPGs.pgSTPProduce.d, STPLAN_PRODUCE_DT);
    } else if (activeRow['stc_arrange_type'] === '515' && activeRow['stc_report_no'].substring(0,1) === 'P' ) {
      // 未受注引当
      editSTPlanDetails(mainPGs.pgSTPlan, editPGs.pgSTPReceive.h, editPGs.pgSTPReceive.d, STPLAN_RECEIVE_DT);
    } else {
      alert('編集ができるデータは、製造用材料と、未受注引当分のみです。');
      return;
    }
    // editSTPlanDetails(mainPGs.pgSTPlan, editPGs.pgSTPlan.h, editPGs.pgSTPlan.d);
  });
  mainPGs.pgSTPlan.addButton('製造使用材料登録', function () {
    // // 製造使用材料もしくは、定尺切断用の金網を指定させる。
    // // 製造指示番号は先頭Sの10文字
    // const PROD_PLAN_CD_LENGTH = 10;   

    // // 製造のレコードでない場合は、編集不可
    // const activeRow = mainPGs.pgSTPlan.getActiveRow();
    // if (!isSet(activeRow)) {
    //   alert('データを選択してください。');
    //   return;
    // }

    // // ※入出庫予定と入出庫で同じ画面定義を使用していたため、データテーブルと異なる定義になっているため注意！
    // if ((activeRow['stc_report_no'].length >= PROD_PLAN_CD_LENGTH) && (String(activeRow['stc_report_no']).slice(0,1) === 'S')) {
    //   // 否定条件で記載する方が詳細な分岐になるため、このような分岐とした。
    // } else {
    //   alert('製造に関するデータを選択してください。');
    //   return;
    // }

    editSTPlanDetails(mainPGs.pgSTPlan, editPGs.pgSTPProduce.h, editPGs.pgSTPProduce.d, STPLAN_PRODUCE);
  });

  mainPGs.pgSTPlan.addButton('未受注引当登録', () => {
    // 受注無しの在庫引当　受注有の在庫引当は、編集画面からどの在庫か指定。
    editSTPlanDetails(mainPGs.pgSTPlan, editPGs.pgSTPReceive.h, editPGs.pgSTPReceive.d, STPLAN_RECEIVE);
  })

  // mainPGs.pgST.addButton('在庫調整', () => {
  //   editSTDetails(mainPGs.pgST, editPGs.pgSTAdjust.h, editPGs.pgSTAdjust.d, ST_ADJUST);
  // });

  // mainPGs.pgST.addButton('在庫移動', () => {
  //   editSTDetails(mainPGs.pgST, editPGs.pgSTTransfer.h, editPGs.pgSTTransfer.d, ST_TRANSFER);
  // });

  // mainPGs.pgST.addButton('編集', function () {
  //   // 選択している行が編集不可データであればはじく
  //   let activeRow = mainPGs.pgST.getActiveRow();
  //   if (!activeRow) {
  //     window.alert('編集対象とする行を選択してください。');
  //     return;
  //   }
  //   // if (activeRow['stc_report_no'].substr(0, 1) !== 'U') {
  //   //   alert('伝票番号がUで始まる入出庫データのみ編集が可能です。');
  //   //   return;
  //   // }
  //   // showCheckdatDialog(CHECKDATTABS.Transferstock);
  //   // readDataStock(checkdatPGs.pgTransferstock, activeRow['stc_product_cd']);
  // });
  // mainPGs.pgST.addButton('在庫確認', function () {
  //   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
  //     return;
  //   }
  //   showCheckdatDialog(CHECKDATTABS.Currentstock);
  //   // 選択行があればその品名CDで画面表示。なければ全件表示
  //   readStockData(checkdatPGs.pgCurrentstock);
  // });

  Object.keys(editPGs).forEach(function (elem) {
    /** @type {PGHeaderDetail} */
    var ePG = editPGs[elem];
    if (ePG.d !== editPGs.pgProdplans.d && ePG.d !== editPGs.pgED.d && ePG.d !== editPGs.pgMOD.d && ePG.d !== editPGs.pgBD.d && ePG.d !== editPGs.pgOOD.d && ePG.d !== editPGs.pgAOO) { //  && ePG.d !== editPGs.pgLP.d 
      ePG.d.addButton('行追加', function () { addRow(ePG.d); });
      if (ePG.d !== editPGs.pgSTPlan.d || ePG.d !== editPGs.pgSTPReceive.d || ePG.d !== editPGs.pgSTPProduce.d || ePG.d !== editPGs.pgST.d ) {
        ePG.d.addButton('行削除', function () { removeRow(ePG.d); });
      }
    }

    // if (ePG.d === editPGs.pgOOD.d) {
    //   ePG.d.addButton('登録', function () {
    //     updatedetaildata(ePG.h, ePG.d, function () {
    //       $('#dialog-insert')['dialog']('close');
    //       clearRows(ePG.h);
    //       clearRows(ePG.d);
    //       readdata(ePG.m);
    //     });
    //   }); 
    // }

    // base 各画面で登録処理が異なる。共通処理でよい場合は、こちらを使用すること
    // ePG.d.addButton('登録', function () {
    //   updatedetaildata(ePG.h, ePG.d, function () {
    //     $('#dialog-insert')['dialog']('close');
    //     clearRows(ePG.h);
    //     clearRows(ePG.d);
    //     readdata(ePG.m);
    //   });
    // }); 
  });
  // 製造計画**************************************************************
  editPGs.pgProdplans.d.addButton('行追加', function () {
    existProdplansWire(editPGs.pgProdplans.h.dataView.getItems()).done(function (data, jqXHR, textStatus) {
      let result = JSON.parse(data);
      if (result.length > 0) {
        alert('金網製造指示を作成済みのため、編集できません。金網製造指示データを削除してから編集してください。');
        return;
      } else {
        addRow(editPGs.pgProdplans.d);
      }
    });
  });
  editPGs.pgProdplans.d.addButton('行削除', function () {
    existProdplansWire(editPGs.pgProdplans.h.dataView.getItems()).done(function (data, jqXHR, textStatus) {
      let result = JSON.parse(data);
      if (result.length > 0) {
        alert('金網製造指示を作成済みのため、編集できません。金網製造指示データを削除してから編集してください。');
        return;
      } else {
        removeRow(editPGs.pgProdplans.d, 'Prodplans');
      }
    });
  });
  editPGs.pgProdplans.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // let arData = editPGs.pgProdplans.d.getItems();
    // // 製造リーフの実績がはいっていたら更新不可　実績はいってなくても、リーフ発行されてたら、リーフが作り直される旨をメッセージ表示
    // if (isSet(arData[0]['pd_leaf_no'])) {
    //   if (!confirm('製造リーフが発行済みです。製造リーフを作り直しますがよろしいですか？')) {
    //     return;
    //   }
    // }
    const gridData = editPGs.pgProdplans.h.dataView.getItems();
    existProdplansWire(gridData).done(function (data, jqXHR, textStatus) {
      const upData = JSON.parse(data);
      if (upData.length > 0) {
        if (!confirm('金網製造指示を作成済みです。指示Gのみ編集可能ですがよろしいですか？')) {
          // alert('金網製造指示を削除した後に編集してください。');
          return;
        }
      } else {
        updateProdPlans(editPGs.pgProdplans.h, editPGs.pgProdplans.d).then(function (rsltdata, jqXHR, textStatus) {
          let result = rsltdata['succeed'];
          if (result) {
            alert('登録完了しました。');
          } else {
            if (rsltdata['message']) {
              alert(rsltdata['message']);
            } else {
              alert('登録に失敗しました。');
            }
            return;
          }
          $('#dialog-insert')['dialog']('close');
          clearRows(editPGs.pgProdplans.h);
          clearRows(editPGs.pgProdplans.d);
          readdata(editPGs.pgProdplans.m);
          // // 見積書作成画面から遷移した場合
          clearRows(editPGs.pgED.h);
          clearRows(editPGs.pgED.d);
          readdata(editPGs.pgED.m);
        });
      }
    });
  });


  // 受注 ******************************************************************
  editPGs.pgED.d.addButton('行追加', function () {
    // 既に請求書発行済みのレコードに関しては行追加は行えない
    let dat = editPGs.pgED.d.dataView.getItems();
    if (dat.length > 0) {
      if (dat[0]['ed_bill_sign'] >= 2) {
        alert('既に請求書発行済みのデータは、編集を行えません。');
        return;
      }
    }
    addRow(editPGs.pgED.d);
  });
  editPGs.pgED.d.addButton('行削除', function () { removeRow(editPGs.pgED.d, 'ED'); });
  // 見積画面
  editPGs.pgED.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // 線径マスタにて線径チェック 見積書のみのチェック項目なので、あえて下記functionでは呼ばない
    if (checkWireDiameter()) {
      if (!confirm('線径が線番の範囲外ですが、よろしいですか？')) {
        return;
      }
    }
    // 受注済みの場合は、出荷予定日が必須
    let arHeader = editPGs.pgED.h.dataView.getItems();
    if (isSet(arHeader[0]['e_estimate_date'])) {
      if (!isSet(arHeader[0]['e_shipplan_date'])) {
        alert('出荷予定日は入力必須項目です。');
        return;
      }
    }
    // 在庫引当完了しているか
    let arDetails = editPGs.pgED.d.dataView.getItems();
    let bKeep = true;
    for (let i = 0; i < arDetails.length; i++) {
      if (arDetails[i]['ed_ar_cd'] === '3') {
        // 在庫の時、計画済みかどうかチェック
        if (arDetails[i]['ed_prod_plan_sign'] === '0') {
          bKeep = false;
        }
      }
    }
    if (!bKeep) {
      // 在庫引当が終了していない場合
      // alert('引当する処理が完了したら、アラート有効化');
      // alert('在庫引当が完了していない、もしくは、引当できる在庫がないデータは製品手配方法を変更してください。');
      // return;
    }
    
    var headerData = editPGs.pgED.h.dataView.getItems();

    // 既存の客先CDが変更されている場合、エラーメッセージを表示する。
    // if (headerData.length > 0) {
    //   var beforeData = _beforeEstimateInfo.find(function (elem) {
    //     return elem['e_estimate_no'] === _beforeEstimateNo;
    //   });

    //   if (beforeData) {
    //     if (beforeData['e_customer_cd'] !== headerData[0]['e_customer_cd']) {
    //       alert('客先変更の場合は、新規登録をお願いします。');
    //       return;
    //     }
    //   }
    // }
    // そのままでよければスルー
    updatedetaildata(editPGs.pgED.h, editPGs.pgED.d, function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgED.h);
      clearRows(editPGs.pgED.d);
      readdata(editPGs.pgED.m);
    });
  });
  // 発注 ******************************************************************
  editPGs.pgMOD.d.addButton('行追加', function () {
    // 検収の有無などのチェックはaddrow側で行う。
    addRow(editPGs.pgMOD.d);
  });
  editPGs.pgMOD.d.addButton('行削除', function () {
    // 検収の有無などのチェックはremoveRow側で行う。
    removeRow(editPGs.pgMOD.d);
  });
  editPGs.pgMOD.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if (!removeEmptyRow(editPGs.pgMOD.d)) {
      return;
    }
    const arHD = editPGs.pgMOD.h.dataView.getItems();
    let strDBStatus = '0';    // デフォルト値は新規登録
    if ('moed_data_status' in arHD[0]) {
      // キーがあれば、見積画面からの登録=新規登録
      strDBStatus = arHD[0]['moed_data_status'];
    } else {
      strDBStatus = '1';
    }
    existEstimateNo(arHD['refer_no'])
    updatedetaildataMOD(editPGs.pgMOD.h, editPGs.pgMOD.d, '0', strDBStatus, function () {
      $('#dialog-insert')['dialog']('close');
      readMaster();
      clearRows(editPGs.pgMOD.h);
      clearRows(editPGs.pgMOD.d);
      readdata(editPGs.pgMOD.m);
      readdata(mainPGs.pgED);
    });
  });
  editPGs.pgMOD.d.addButton('発注書作成', function () {
    // 登録後に印刷処理に入るよう変更
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if  (!removeEmptyRow(editPGs.pgMOD.d)) {
      return;
    }
    const arHD = editPGs.pgMOD.h.dataView.getItems();
    let strDBStatus = '0';      // デフォルト値は新規登録
    if ('moed_data_status' in arHD[0]) {
      strDBStatus = arHD[0]['moed_data_status'];
    } else {
      strDBStatus = '1';
    }

    updatedetaildataMOD(editPGs.pgMOD.h, editPGs.pgMOD.d, '0', strDBStatus, () => {
      const result = window.open('./db.php?req=makeMaterialOrderFile' + 
        makeHeaderPKQuery(mainPGs.pgMOD.columns, editPGs.pgMOD.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
      $("#dialog-insert")["dialog"]("close");
      readMaster();
      clearRows(editPGs.pgMOD.h);
      clearRows(editPGs.pgMOD.d);
      readdata(editPGs.pgMOD.m);
      readdata(mainPGs.pgMOD);
    })

    // if (IsDirtyCheck(editPGs.pgMOD.d)) {
    //   // 転記の場合、DB登録しているか
    //   window.alert('データ登録してからファイル発行をしてください');
    // } else {
    //   const result = window.open('./db.php?req=makeMaterialOrderFile' +
    //     makeHeaderPKQuery(mainPGs.pgMOD.columns, editPGs.pgMOD.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
    //   // 画面更新が入るため、エラーを防ぐため画面を閉じる
    //   $('#dialog-insert')['dialog']('close');
    //   clearRows(editPGs.pgMOD.h);
    //   clearRows(editPGs.pgMOD.d);
    //   readdata(editPGs.pgMOD.m);
    // }    
    // readdata(mainPGs.pgMOD);
  });
  // 2023/6/12　発注の新規登録と同時に検収登録をすることがないため、以下の処理をコメントアウト
  // editPGs.pgMOD.d.addButton('発注・検収登録', function () {
  //   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit) {
  //     return;
  //   }
  //   if (!removeEmptyRow(editPGs.pgMOD.d)) {
  //     // 枝番を最初に振っているので、データが入力されていないレコードを先に強制的に削除する
  //     return;
  //   }
  //   let ar = [];
  //   ar = editPGs.pgMOD.h.dataView.getItems();
  //   for (let i = 0; i < ar.length; i++) {
  //     if (!isSet(ar[i]['moed_arrival_hd_date'])) {
  //       alert('入荷予定日が入力されていません。入力をお願いします。');
  //       return;
  //     }
  //   }
  //   const arHD = editPGs.pgMOD.h.dataView.getItems();
  //   let strDBStatus = '0';    // デフォルト値は新規登録
  //   if ('moed_data_status' in arHD[0]) {
  //     // キーがあれば、見積画面からの登録=新規登録
  //     strDBStatus = arHD[0]['moed_data_status'];
  //   } else {
  //     strDBStatus = '1';
  //   }

  //   updatedetaildataMOD(editPGs.pgMOD.h, editPGs.pgMOD.d, '1', strDBStatus, function () {
  //     $('#dialog-insert')['dialog']('close');
  //     clearRows(editPGs.pgMOD.h);
  //     clearRows(editPGs.pgMOD.d);
  //     readdata(editPGs.pgMOD.m);
  //   });
  // });
  editPGs.pgMOD.d.addButton('現品票発行', function () {
    exportMATLIDSheet('pgMOD');
    // printQR(editPGs.pgMOD.h, editPGs.pgMOD.d);
  });

  //部分検収 ***********************************************************
  // 部分検収
  editPGs.pgAT.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    updatedetaildataMOD(editPGs.pgAT.h, editPGs.pgAT.d, '2', function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgAT.h);
      clearRows(editPGs.pgAT.d);
      // readdata(editPGs.pgAT.m);
      readdata(editPGs.pgMOD.m);
    });
  });

  editPGs.pgAT.d.addButton('現品票発行', function () {
    exportMATLIDSheet('pgAT');
    // printQR(editPGs.pgMOD.h, editPGs.pgMOD.d);
  });

  // 入庫 ***********************************************
  // 入庫報告画面
  editPGs.pgMST.d.addButton('入庫', function () {
    updateDetailDataMST(editPGs.pgMST.h, editPGs.pgMST.d, 0, function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgMST.h);
      clearRows(editPGs.pgMST.d);
      readdata(editPGs.pgMOD.m);
    });
  });
  // 2023/6/12　発注の新規登録と同時に入庫登録をすることがないため、以下の処理をコメントアウト
  // editPGs.pgMST.d.addButton('注文・入庫一括登録', function () {
  //   updateDetailDataMST(editPGs.pgMST.h, editPGs.pgMST.d, 1, function () {
  //     $('#dialog-insert')['dialog']('close');
  //     clearRows(editPGs.pgMST.h);
  //     clearRows(editPGs.pgMST.d);
  //     readdata(editPGs.pgMOD.m);
  //   });
  // });
  editPGs.pgMST.d.addButton('入庫取消', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit) {
      return;
    }
    let ar = [];
    ar = editPGs.pgMST.d.dataView.getItems();
    for (let i = 0; i < ar.length; i++) {
      if (ar[i]['moed_type_02'] !== '1') {
        alert('入庫されていないデータは、入庫取消できません。');
        return;
      }
    }
    cancelMST(editPGs.pgMST.h, editPGs.pgMST.d, function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgMST.h);
      clearRows(editPGs.pgMST.d);
      readdata(editPGs.pgMOD.m);
    });
  });
  // 2023/6/21　入庫報告後の在庫品のみ、現品票発行が可能に変更
  // editPGs.pgMST.d.addButton('現品票発行', function () {
  //   exportMATLIDSheet();
  // });

  // 入庫 ***************************************************************
  // 入庫登録
  // editPGs.pgMST.d.addButton('入庫', function () {
  //   updateDetailDataMST(editPGs.pgMST.h, editPGs.pgMST.d, function () {
  //     $('#dialog-insert')['dialog']('close');
  //     clearRows(editPGs.pgMST.h);
  //     clearRows(editPGs.pgMST.d);
  //     readdata(editPGs.pgMST.m);
  //   }); 
  // });

  // 委託発注
  editPGs.pgOOD.d.addButton('行追加', function () {
    addRow(editPGs.pgOOD.d);
  });
  editPGs.pgOOD.d.addButton('行削除', function () {
    removeRow(editPGs.pgOOD.d);
  });
  editPGs.pgOOD.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // 発注情報と検収情報を同時登録
    if (!removeEmptyRow(editPGs.pgOOD.d)) {
      // 枝番を最初に振っているので、データが入力されていないレコードを先に強制的に削除する
      return;
    }
    // 入力内容のバリデーションを実行
    if (!editPGs.pgOOD.h.validateItems()) {
      return;
    }
    if (!editPGs.pgOOD.d.validateItems()) {
      return;
    }

    const arHD = editPGs.pgOOD.h.dataView.getItems();
    let strDBStatus = '0';    // デフォルト値は新規登録
    if ('moed_data_status' in arHD[0]) {
      // キーがあれば、見積画面からの登録=新規登録
      strDBStatus = arHD[0]['moed_data_status'];
    } else {
      strDBStatus = '1';
    }
    updateDetailDataOOD(editPGs.pgOOD.h, editPGs.pgOOD.d, 0, strDBStatus).done(function (data, jqXHR, textStatus) {
      if (data['succeed']) {
        alert('データ登録を完了しました。');
        $('#dialog-insert')['dialog']('close');
        clearRows(editPGs.pgOOD.h);
        clearRows(editPGs.pgOOD.d);
        readdata(editPGs.pgOOD.m);
      }
    });
  });
  editPGs.pgOOD.d.addButton('委託発注書作成', function () {
    if (IsDirtyCheck(editPGs.pgOOD.d) || IsDirtyCheck(editPGs.pgOOD.h)) {
      // 転記の場合、DB登録しているか
      window.alert('データ登録してからファイル発行をしてください');
      return;
    }
    window.open('./db.php?req=makeOutsideOrderFile' +
      makeHeaderPKQuery(mainPGs.pgOOD.columns, editPGs.pgOOD.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
    
    setTimeout(readdata(mainPGs.pgOOD), 200000);
    
    $('#dialog-insert')['dialog']('close');
    // readdata(mainPGs.pgOOD);
  });
  editPGs.pgOOD.d.addButton('委託・検収登録', function () {
    // 発注情報と検収情報を同時登録
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if (!removeEmptyRow(editPGs.pgOOD.d)) {
      // 枝番を最初に振っているので、データが入力されていないレコードを先に強制的に削除する
      return;
    }
    // 入力内容のバリデーションを実行
    if (!editPGs.pgOOD.h.validateItems()) {
      return;
    }
    if (!editPGs.pgOOD.d.validateItems()) {
      return;
    }

    const arHD = editPGs.pgOOD.h.dataView.getItems();
    let strDBStatus = '0';    // デフォルト値は新規登録
    if ('moed_data_status' in arHD[0]) {
      // キーがあれば、見積画面からの登録=新規登録
      strDBStatus = arHD[0]['moed_data_status'];
    } else {
      strDBStatus = '1';
    }

    updateDetailDataOOD(editPGs.pgOOD.h, editPGs.pgOOD.d, 1, strDBStatus).then(function (data, textStatus, jqXHR) {
      let resp = data;
      if (resp['succeed']) {
        alert('登録完了しました');
        $('#dialog-insert')['dialog']('close');
        clearRows(editPGs.pgOOD.h);
        clearRows(editPGs.pgOOD.d);
        readdata(editPGs.pgOOD.m);
      } 
    });
  });
  

  // // 委託発注の検収 
  // editPGs.pgAOO.d.addButton('行追加', function () {
  //   if (isAcceptSheet(editPGs.pgAOO)) {
  //     // 全レコード検収済みなので、追加不可
  //     alert('全件検収済みなので、編集はできません。');
  //   }
  //   addRow(editPGs.pgAOO.d, 'AOO');
  // });
  // editPGs.pgAOO.d.addButton('行削除', function () {
  //   // 検収済みのレコードに関しては行削除は行えない
  //   if (isAcceptSheet(editPGs.pgAOO)) {
  //     alert('検収済みのデータなので、行削除できません。');
  //     return;
  //   }
  //   removeRow(editPGs.pgAOO.d, 'AOO');
  // });
  editPGs.pgAOO.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // 入力内容のバリデーションを実行
    if (!editPGs.pgOOD.h.validateItems()) {
      return;
    }
    if (!editPGs.pgOOD.d.validateItems()) {
      return;
    }
    updateDetailDataOOD(editPGs.pgAOO.h, editPGs.pgAOO.d, 2).done(function (data, jqXHR, textStatus) {
      let resp = data;
      if (resp['succeed']) {
        alert('データ登録を完了しました。');
        $('#dialog-insert')['dialog']('close');
        clearRows(editPGs.pgAOO.h);
        clearRows(editPGs.pgAOO.d);
        readdata(editPGs.pgOOD.m);
      } else {
        window.alert(resp['msg']);
      }
    });
  });

  // 入庫 ***********************************************
  // 入庫報告画面
  editPGs.pgOST.d.addButton('入庫登録', function () {
    updateDetailDataMST(editPGs.pgOST.h, editPGs.pgOST.d, 0, function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgOST.h);
      clearRows(editPGs.pgOST.d);
      // readdata(editPGs.pgOST.m);
      readdata(editPGs.pgOOD.m);
    });
  });

  editPGs.pgOST.d.addButton('注文・入庫一括登録', function () {
    updateDetailDataMST(editPGs.pgOST.h, editPGs.pgOST.d, 1, function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgOST.h);
      clearRows(editPGs.pgOST.d);
      // readdata(editPGs.pgOST.m);
      readdata(editPGs.pgOOD.m);
    });
  });

  // 納品 ***********************************************
  editPGs.pgSD.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // チェック
    let res = checkBeforeUpdateSD(editPGs.pgSD.h, editPGs.pgSD.d);
    if (!res['success']) {
      switch (res['mode']) {
        case 'shipflg':
          alert(res['msg']);
          return;
          // break;
        case 'stateflg':
          alert(res['msg']);
          return;
          // break;
        case 'qty':
          if (confirm(res['msg'])) {

          } else {
            return;
          }
          break;
        default:
          return;
      }
    }
    updatedetaildata(editPGs.pgSD.h, editPGs.pgSD.d, function () {
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgSD.h);
      clearRows(editPGs.pgSD.d);
      // editData(ePG.m, ePG.h, ePG.d);
      readdata(editPGs.pgSD.m);
      readdata(mainPGs.pgSD);
      readdata(mainPGs.pgED);
    });
  });
  // 請求書******************************************************
  // 請求データ削除は、請求書単位で行う。
  editPGs.pgBD.d.addButton('行追加', function () {
    addRow(editPGs.pgBD.d);
  });
  editPGs.pgBD.d.addButton('行削除', function () {
    removeRow(editPGs.pgBD.d);
  });
  editPGs.pgBD.d.addButton('登録', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    updatedetaildata(editPGs.pgBD.h, editPGs.pgBD.d, function () {
      clearRows(editPGs.pgBD.h);
      clearRows(editPGs.pgBD.d);
      readdata(editPGs.pgBD.m);
    });
  });
  editPGs.pgBD.d.addButton('請求書再発行', function () {
    window.open('./db.php?req=reissueBillFile&' +
    makeHeaderPKQuery(mainPGs.pgBD.columns, editPGs.pgBD.h.grid.getDataItem(0)), '請求書', 'top=200, left=200, width=400, height=300');
  });

  // 入出庫予定（未受注引当）******************************************************
  editPGs.pgSTPReceive.d.addButton('登録', function () {
    // エラーチェック追加　2023/2/8
    const arHD = editPGs.pgSTPReceive.h.dataView.getItems();
    const dat = editPGs.pgSTPReceive.d.dataView.getItems();
    let bol = false;
    if (!isSet(arHD[0]['stc_target_id'])) {
      alert('客先CDを入力してください。');
      return;
    }
    for (let i = 0; i < dat.length; i++) {
      if (isSet(dat[i]['productcd'])) {
        bol = true;
      }
    }
    if (bol === false) {
      alert('引当登録できる明細がありませんでした。');
      return;
    }
    // 2023/2/21　更新前のエラーチェック　※客先CDの変更不可
    if (arHD[0]['stc_report_no'].substr(0, 1) === 'P' && arHD[0]['stc_report_no'].substr(1, 3) !== arHD[0]['stc_target_id']) {
      alert('登録された客先CDが変更されています。\n更新する場合、客先CDは変更できません。');
      return;
    }
    // 2023/2/21　全て新規登録になるため、条件分岐を追加する。
    if (arHD[0]['stc_report_no'].substr(0, 1) === 'P') {
      updateSTPlanReceive(editPGs.pgSTPReceive.h, editPGs.pgSTPReceive.d, '1', () => {
        $('#dialog-insert')['dialog']('close');
        // 在庫ビュー読込
        readStockView('', 'CREATE');
  
        clearRows(editPGs.pgSTPReceive.h);
        clearRows(editPGs.pgSTPReceive.d);
        readdata(editPGs.pgSTPlan.m);
      });
    } else {
      updateSTPlanReceive(editPGs.pgSTPReceive.h, editPGs.pgSTPReceive.d, '0', () => {
        $('#dialog-insert')['dialog']('close');
        // 在庫ビュー読込
        readStockView('', 'CREATE');
  
        clearRows(editPGs.pgSTPReceive.h);
        clearRows(editPGs.pgSTPReceive.d);
        readdata(editPGs.pgSTPlan.m);
      });
    }
  });

  // 2023/2/22　データ削除機能追加
  editPGs.pgSTPReceive.d.addButton('引当取消', () => {
    const arHD = editPGs.pgSTPReceive.h.dataView.getItems();
    if (arHD[0]['stc_report_no'].substr(0, 1) !== 'P') {
      alert('登録されていないデータの引当取消できません。');
      return;
    }
    deleteSTPlanReceive(editPGs.pgSTPReceive.h, () => {
      $('#dialog-insert')['dialog']('close');
      // 在庫ビュー読込
      readStockView('', 'CREATE');

      clearRows(editPGs.pgSTPReceive.h);
      clearRows(editPGs.pgSTPReceive.d);
      readdata(editPGs.pgSTPlan.m);
    });
  });

  editPGs.pgSTPReceive.d.addButton('在庫一覧参照', () => {
    showStockViewDialog();
  });

  // 入出庫予定（製造使用材料）******************************************************
  editPGs.pgSTPProduce.d.addButton('登録', function () {
    // エラーチェック追加　2023/2/8
    const arHD = editPGs.pgSTPProduce.h.dataView.getItems();
    const dat = editPGs.pgSTPProduce.d.dataView.getItems();
    let bol = false;
    if (!isSet(arHD[0]['stc_report_no'])) {
      alert('受注番号を入力してください。');
      return;
    }
    if (!isSet(arHD[0]['stc_report_date'])) {
      alert('製造予定日を入力してください。');
      return;
    }
    for (let i = 0; i < dat.length; i++) {
      if (isSet(dat[i]['productcd'])) {
        bol = true;
      }
    }
    if (bol === false) {
      alert('使用材料として登録できる明細がありませんでした。');
      return;
    }
    updateSTPlanProduce(editPGs.pgSTPProduce.h, editPGs.pgSTPProduce.d, () => {
      $('#dialog-insert')['dialog']('close');
      // 在庫ビュー読込
      readStockView('', 'CREATE');
      
      clearRows(editPGs.pgSTPProduce.h);
      clearRows(editPGs.pgSTPProduce.d);
      readdata(editPGs.pgSTPlan.m);
    });    
  })

  editPGs.pgSTPProduce.d.addButton('製造完了', function () {
    // エラーチェック追加　2023/2/8
    const arHD = editPGs.pgSTPProduce.h.dataView.getItems();
    const dat = editPGs.pgSTPProduce.d.dataView.getItems();
    let bol = false;
    if (!isSet(arHD[0]['stc_report_no'])) {
      alert('受注番号を入力してください。');
      return;
    }
    if (!isSet(arHD[0]['stc_report_date'])) {
      alert('製造完了日を入力してください。');
      return;
    }
    if (!isSet(arHD[0]['stc_report_date'])) {
      alert('製造予定日を入力してください。');
      return;
    }
    for (let i = 0; i < dat.length; i++) {
      if (isSet(dat[i]['productcd'])) {
        bol = true;
      }
    }
    if (bol === false) {
      alert('使用材料として登録できる明細がありませんでした。');
      return;
    }
    // 入出庫データ登録
    transPlanToStock(editPGs.pgSTPProduce.h, editPGs.pgSTPProduce.d, () => {
      $('#dialog-insert')['dialog']('close');
      // 在庫ビュー読込
      readStockView('', 'CREATE');
      
      clearRows(editPGs.pgSTPProduce.h);
      clearRows(editPGs.pgSTPProduce.d);
      readdata(editPGs.pgSTPlan.m);
    });
  })

  editPGs.pgSTPProduce.d.addButton('在庫一覧参照', () => {
    if (Slick.GlobalEditorLock.isActive() &&
      !Slick.GlobalEditorLock.cancelCurrentEdit()) {
      return;
    }
    showStockViewDialog();
  })
  
  editPGs.pgSTPlan.d.addButton('在庫一覧参照', () => {
    showStockViewDialog();
  });

  // editPGs.pgST.d.addButton('登録', () => {
  //   // 行ごとにレポート番号採番すること
  // });
  editPGs.pgST.d.addButton('在庫一覧参照', () => {
    showStockViewDialog();
  });

  // 2023/2/8　在庫調整、在庫移動は在庫マスタで行うためコメントアウト
  // editPGs.pgSTAdjust.d.addButton('登録', () => {
  //   // 在庫調整 登録
  //   updateStockAdjust(editPGs.pgSTAdjust.h, editPGs.pgSTAdjust.d, function () {
  //     // 登録が完了したら編集画面を閉じる
  //     $('#dialog-insert')['dialog']('close');
  //     // 在庫ビュー読込
  //     readStockView('', 'CREATE');

  //     clearRows(editPGs.pgSTAdjust.h);
  //     clearRows(editPGs.pgSTAdjust.d);
  //     readdata(editPGs.pgSTAdjust.m);
  //   });
  // });
  
  // editPGs.pgSTAdjust.d.addButton('在庫一覧参照', () => {
  //   showStockViewDialog();
  // });
  
  // 2023/2/8　在庫調整、在庫移動は在庫マスタで行うためコメントアウト
  // editPGs.pgSTTransfer.d.addButton('登録', () => {
  //   updateStockTransfer(editPGs.pgSTTransfer.h, editPGs.pgSTTransfer.d, function () {
  //     // 登録が完了したら編集画面を閉じる
  //     $('#dialog-insert')['dialog']('close');
  //     // 在庫ビュー読込
  //     readStockView('', 'CREATE');
      
  //     clearRows(editPGs.pgSTAdjust.h);
  //     clearRows(editPGs.pgSTAdjust.d);
  //     readdata(editPGs.pgSTAdjust.m);
  //   });
  // });
  
  // editPGs.pgSTTransfer.d.addButton('在庫一覧参照', () => {
  //   showStockViewDialog();
  // });

  // editPGs.pgBD.d.addButton('請求書発行', function () {
  //   // DB取得用に配列セット
  //   let conditions = {
  //     'closeDate' : '20201225',
  //     'customeroutputdate' : '',
  //     'customercd': 'K01',
  //     'customerpost': '',
  //     'billtypeusual': 'true',
  //     'billtyperyoki': 'false',
  //   };
  //   let str = 'closeDate=' + conditions['closeDate'] + '' + '&customeroutputdate=' + conditions['customeroutputdate'] + '&customercd=' + conditions['customercd'] + '&customerpost' + conditions['customerpost'] + '&billtypeusual=' + conditions['billtypeusual'] + '&billtyperyoki=' + conditions['billtyperyoki'];
  //   window.open('./db.php?req=makeBillFileData&' + str, '請求書発行', 'width=400, height=300');
  // });
  // // 製造計画 ***********************************************
  // editPGs.pgProdplans.d.addButton('登録', function () {
  //   updatedetaildata(editPGs.pgProdplans.h, editPGs.pgProdplans.d, function () {
  //     // $('#dialog-insert')['dialog']('close');
  //     // editData(mPG, ePG.h, ePG.d);
  //     clearRows(editPGs.pgProdplans.h);
  //     clearRows(editPGs.pgProdplans.d);
  //     readdata(editPGs.pgProdplans.m);
  //   });
  // });

  // // 製作指示書
  // editPGs.pgLP.d.addButton('登録', function () {
  //   if (window.confirm('製作指示書を更新する場合、製造リーフの順序表示や在庫計算等に影響する可能性があります。\n登録を続行しますか？'))
  //   updatedetaildata(editPGs.pgLP.h, editPGs.pgLP.d, function () {
  //     $('#dialog-insert')['dialog']('close');
  //     // clearRows(ePG.h);
  //     // clearRows(ePG.d);
  //     readdata(editPGs.pgLP.m);
  //     // 削除時にエラーがでたので一時的にコメントアウト　sono　2019/06/05
  //     // コメントアウトによりデータ削除時にデータが更新されなくなる
  //     // readdata(pgProdplans.m);
  //   });
  // });


  // 在庫検索ダイアログ　ボタン付加
  Object.keys(checkdatPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var cPG = checkdatPGs[elem];
    cPG.addButton('登録', function () {
      if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
        return;
      }
      let tbName = $('#mother-grid').val();
      let motherData = [];
      if (tbName === 'ED') {
        motherData = editPGs.pgED.d.getActiveRow();
      } else {
        motherData = editPGs.pgSD.d.getActiveRow();
      } 
      let activeRow = cPG.dataView.getItems();
      // 在庫数以上の引当は許さない
      if (+ activeRow[0]['assignqty'] < + activeRow[0]['stc_qty_trans']) {
        alert('在庫数量より多く引当されています。');
        return;
      }
      if (!IsDirtyCheck(pgAssignstock) ) {
        return;
      }
      updateStockData(cPG, motherData, tbName).then(function (data, textStatus, jqXHR) {
        if (data['succeed'] === true) {
          alert('登録完了しました。');
          // // 在庫引当画面を更新
          // readDataStock(checkdatPGs.pgAssignstock, activeRow, tbName);
          $('#dialog-checkdat')['dialog']('close');
          return;
        }
      });
    });
    cPG.addButton('キャンセル', function () {
      clearRows(cPG);
      $('#dialog-checkdat')['dialog']('close');
    });
    cPG.addButton('在庫追加登録', () => {
      showStockViewDialog(0);
    });
    // } else {
    //   // 製品CD指定なしでの検索
    //   // let tblName = $('#mother-grid').val();
    //   let tblName = document.getElementById('mother-grid').value;
    //   cPG.addButton('読込', function () {
    //     let tblName = document.getElementById('mother-grid').value;
    //     readStockData(cPG, tblName).done(function (data, jqXHR, textStatus) {
    //       let ar = [];
    //       let i = 0;
    //       if (data.length > 0) {
    //         Object.keys(data).forEach(function (elem) {
    //           data[elem]['stc_unit_tran'] = '01';
    //           data[elem]['stc_type_subject'] = '02';
    //           data[elem]['stc_parrangement_cd'] = '03';
    //           data[elem]['id'] = i++;
    //           ar.push(data[elem]);
    //         });
    //         cPG.dataView.setItems(ar);
    //         cPG.grid.setSortColumns([]);
    //       } // その他は該当データ0
    //     });
    //   });
    //   cPG.addButton('予定セット', function () {
    //     setExpectStock(cPG).done(function (data, jqXHR, textStatus) {
    //       let ar = [];
    //       let i = 0;
    //       if (data.length > 0) {
    //         Object.keys(data).forEach(function (elem) {
    //           data[elem]['id'] = i++;
    //           ar.push(data[elem]);
    //         });
    //         cPG.dataView.setItems(ar);
    //         cPG.grid.setSortColumns([]);
    //       }
    //     });
    //   });
    //   cPG.addButton('CSV出力', function () { exportGridToCSV(cPG); });

  });

  // 加工内容編集画面のボタン追加
  Object.keys(settingPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var sPG = settingPGs[elem];
    sPG.addButton('行追加', function () { addRow(sPG) });
    sPG.addButton('行削除', function () { removeRow(sPG) });
    sPG.addButton('登録', function () {
      if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
        return;
      }
      updateProdplansproc(sPG).done(function (data, jqXHR, textStatus) {
        if (data['succeed']) {
          window.alert('工程内容を登録しました。');
          $('#dialog-setting')['dialog']('close');
          clearRows(sPG);
          readdata(editPGs.pgProdplans.m);
        }
        if (data['msg'] !== '') {
          alert(data['msg']);
        }
      });
    });
  });


  var makeHeaderPKQuery = function (cols, item) {
    var str = '';
    cols.forEach(function (col) {
      if (col['isHeaderPK']) {
        str += '&' + col['field'] + '=' + item[col['field']];
      }
    });
    return str;
  };

  let makeSQLPKQuery = function (cols, itemh, itemd) {
    let str = '';
    let i = 0;
    str = 'sd_belong_cd' + '=' + itemh['sd_belong_cd'] + '&' + 'sd_e_estimate_no' + '=' + itemh['sd_e_estimate_no'] + '&' + 'sd_statement_sub_no' + '=' + itemh['sd_statement_sub_no'];
    return str;
  }


  editPGs.pgProdplans.d.addButton('製造リーフ発行', function () {
    issueProdLeaf();
    // 画面閉じる

  });
  editPGs.pgProdplans.d.addButton('製造リーフ取消', function () {
    // issueProdLeaf();
  });
  // editPGs.pgProdplans.d.addButton('製造リーフ発行', function () { issueProdLeaf() });
  // editPGs.pgShipplans.d.addButton('出荷リーフ発行', function () { issueShipLeaf(); });
  // editPGs.pgShipplans.d.addButton('納品書作成', function () { makeStatementFromSPD(); });


  editPGs.pgED.d.addButton('見積書作成', function () {
    // 登録してから印刷処理に変更
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // 受注済みの場合は出荷予定日が必須
    let arHeader = editPGs.pgED.h.dataView.getItems();
    if (isSet(arHeader[0]['e_estimate_date'])) {
      if (!isSet(arHeader[0]['e_shipplan_date'])) {
        alert('出荷予定日は入力必須項目です。');
        return;
      }
    }
    let arDetails = editPGs.pgED.d.dataView.getItems();
    let bKeep = true;
    for (let i = 0; i < arDetails.length; i++) {
      if (arDetails[i]['ed_ar_cd'] === '3') {
        if (arDetails[i]['ed_prod_plan_sign'] === '0') {
          bKeep = false;
        }
      }
    }
    if (!bKeep) {
      alert('在庫引当が完了していない、もしくは、引当できる在庫がないデータは製品手配方法を変更してください。');
      return;
    }
    // let headerData = editPGs.pgED.h.dataView.dataView.getItems();

    updatedetaildata(editPGs.pgED.h, editPGs.pgED.d, () => {
      // 印刷処理
      let activeRow = editPGs.pgED.h.grid.getDataItem(0);
      let processingRow = editPGs.pgED.d.getActiveRow();
      window.open('./db.php?req=makeEstimateFile' + makeHeaderPKQuery(mainPGs.pgED.columns, activeRow), '_blank', 'width=400, height=300');
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgED.h);
      clearRows(editPGs.pgED.d);
      readdata(editPGs.pgED.m);
    });

    // var activeRow = editPGs.pgED.h.grid.getDataItem(0);
    // let processingRow = editPGs.pgED.d.getActiveRow();
    // if (IsDirtyCheck(editPGs.pgED.d)) {
    //   window.alert('編集中のデータを保存してから、ファイル発行して下さい。');
    // } else {
    //   window.open('./db.php?req=makeEstimateFile' +
    //     makeHeaderPKQuery(mainPGs.pgED.columns, activeRow), '_blank', 'width=400, height=300');
    // }
  });
  editPGs.pgED.d.addButton('注文請書作成', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }

    // 受注済みの場合は、出荷予定日が必須
    let arHeader = editPGs.pgED.h.dataView.getItems();
    if (isSet(arHeader[0]['e_estimate_date'])) {
      if (!isSet(arHeader[0]['e_shipplan_date'])) {
        alert('出荷予定日は入力必須項目です。');
        return;
      }
    }
    // 在庫引当完了しているか
    let arDetails = editPGs.pgED.d.dataView.getItems();
    let bKeep = true;
    for (let i = 0; i < arDetails.length; i++) {
      if (arDetails[i]['ed_ar_cd'] === '3') {
        // 在庫の時、計画済みかどうかチェック
        if (arDetails[i]['ed_prod_plan_sign'] === '0') {
          bKeep = false;
        }
      }
    }
    if (!bKeep) {
      // 在庫引当が終了していない場合
      alert('在庫引当が完了していない、もしくは、引当できる在庫がないデータは製品手配方法を変更してください。');
      return;
    }
    
    // var headerData = editPGs.pgED.h.dataView.getItems();
    // そのままでよければスルー
    updatedetaildata(editPGs.pgED.h, editPGs.pgED.d, function () {
      let activeRow = editPGs.pgED.h.grid.getDataItem(0);
      // let processingRow = editPGs.pgED.d.getActiveRow();
      window.open('./db.php?req=makeEstimateAcceptFile' +
        makeHeaderPKQuery(mainPGs.pgED.columns, activeRow), '_blank', 'width=400, height=300');
      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgED.h);
      clearRows(editPGs.pgED.d);
      readdata(editPGs.pgED.m);
    });


    // let activeRow = editPGs.pgED.h.grid.getDataItem(0);
    // let processingRow = editPGs.pgED.d.getActiveRow();
    // if (IsDirtyCheck(editPGs.pgED.d) || IsDirtyCheck(editPGs.pgED.h)) {
    //   window.alert('編集中のデータを保存してから、ファイル発行して下さい。');
    // } else {
    //   window.open('./db.php?req=makeEstimateAcceptFile' +
    //     makeHeaderPKQuery(mainPGs.pgED.columns, activeRow), '_blank', 'width=400, height=300');
    // }
  });
  // 2023/2/10　見積書から在庫引当は行わない。
  // editPGs.pgED.d.addButton('在庫引当', function () {
  //   let activeRow = editPGs.pgED.d.getActiveRow();
  //   if (!activeRow) {
  //     window.alert('編集対象とする行を選択してください。');
  //     return;
  //   }
  //   if (activeRow['ed_ar_cd'] < 3) {
  //     // 在庫もしくは発注でない場合は戻る
  //     alert('在庫もしくは購入品が対象です。対象のデータを選択して下さい');
  //     return;
  //   }
  //   showCheckdatDialog(0);
  //   // 元の画面IDセット
  //   $("#mother-grid").val('ED');
  //   readDataStock(checkdatPGs.pgAssignstock, activeRow, 'ED');
  // });

  // 2023/2/10　製造使用予定登録（引当）は製造計画が完成するまで使用しない。
  // editPGs.pgED.d.addButton('製造使用予定登録', function () {

  //   showCheckdatDialog(1);
  //   // 元の画面IDセット
  //   $("#mother-grid").val('ED');
  //   readDataStock(checkdatPGs.pgAssignstock, activeRow, 'ED');
  // });

  // 2023/2/10　見積計算は使っていない。
  // editPGs.pgED.d.addButton('見積計算', function () {
  //   showCalcEDDlg();
  // });

  editPGs.pgED.d.addButton('重点品名コード一覧', function () {
    // 既に他工程に進んでいる場合は追加不可
    let ar = editPGs.pgED.d.dataView.getItems();
    if (ar[0]['ed_prod_plan_sign'] >= 1 || ar[0]['ed_deliv_create_date'] >= 1) {
      alert('既に後工程に進んでいるデータについては、新たなデータの追加はできません。');
      return;
    }
    showSubProductDlg();
  });


  editPGs.pgED.d.addButton('取込用ファイル出力', function () {
    var activeRow = editPGs.pgED.h.grid.getDataItem(0);
    if (IsDirtyCheck(editPGs.pgED.d)) {
      window.alert('編集中のデータを保存してから、ファイル出力して下さい。');
    } else {
      window.open('./db.php?req=makeEstimateOutput' +
      makeHeaderPKQuery(mainPGs.pgED.columns, activeRow), '_blank', 'width=400, height=300');
      // window.open('template/EstimateDataFile_.xlsx', '_blank', 'width=400, height=300');
    }

  });

  editPGs.pgED.d.addImportButton('取込ファイルを指定', function () {
    let detail = editPGs.pgED.d.dataView.getItems();
    for (let m = 0; m < detail.length; m++) {
      if (detail[m]['ed_delivery_sign'] > 0) {
        // 後工程にデータが進んでいた場合はメッセージを表示
        alert('納品確定済みです。データを確認してください。');
        return;
      }

      if (detail[m]['ed_type_07'] > 0) {
        alert('発注引継ぎ済みです。データを確認してください。');
        return;
      }

      if (detail[m]['ed_prod_plan_sign'] > 0) {
        alert('製造指示済みです。データを確認してください。');
        return;
      }

      if (detail[m]['ed_ship_status_sign'] > 0) {
        alert('出荷予定引継済みです。データを確認してください。');
        return;
      }
    }
    const input = document.getElementById('fileid');
    input.click();
    input.addEventListener('change', readEstimateFiles, false);
    input.addEventListener('click', (e) => {
      // 同じファイルを開くことができるように、読み込んだらリセットかける
      this.value = null;
    }, false);
  });

  // editPGs.pgED.d.addButton('Debug在庫データ登録', function () {
  //   let ar = editPGs.pgED.d.dataView.getItems();
  //   updateStorageTable(ar);
  // });



  // editPGs.pgED.d.addButton('出荷計画作成', function () { issueShipPlans(); });
  // editPGs.pgProdplans.d.addButton('製作指示作成', function () { issueLeafProdAtStock(); });
  // editPGs.pgShipplans.d.addButton('納品書作成', function () { makeStatementFromSPD(); });

  // editPGs.pgLP.d.addButton('製造リーフ配置', function () { scheduleLeafProd(); });
  //editPGs.pgED.d.addButton('製作指示書作成', function () { makeLeafFromEstimate(); });
  //editPGs.pgED.d.addButton('図面アップロード', function () { window.alert('Not Implemented'); });

  // editPGs.pgLP.d.addButton('製作指示書ファイル発行', function () {
  //   // if (IsDirtyCheck(editPGs.pgLP.d)) {
  //   //   // 転記の場合、DB登録しているか
  //   //   window.alert('データ登録してからファイル発行をしてください');
  //   // } else {
  //   //   window.open('./db.php?req=makeLPFile' +
  //   //     makeHeaderPKQuery(mainPGs.pgLP.columns, editPGs.pgLP.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
  //   // }
  // });
  

  editPGs.pgSD.d.addButton('仮納品書作成', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    let res = checkBeforeUpdateSD(editPGs.pgSD.h, editPGs.pgSD.d);
    if (!res['success']) {
      switch (res["mode"]) {
        case "shipflg":
          alert(res['msg']);
          return;
        case "stateflg":
          alert(res['msg']);
          return;
        case "qty":
          if (confirm(res['msg'])) {

          } else {
            return;
          }
          break;
        default:
          return;
      }
    }
    updatedetaildata(editPGs.pgSD.h, editPGs.pgSD.d, () => {
      // let arr = editPGs.pgSD.h.dataView.getItems();
      // 納品書タイプによって作成処理変更
      if (IsPrintReceipt() === 'A') {
        // 納品書A
        window.open('./db.php?req=makeStatementFile&' +
          makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '納品書発行', 'width=400, height=300');
      } else {
        // 納品書B
        window.open('./db.php?req=makeStatementFileAccept&' +
          makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '納品書発行', 'top=200, left=200, width=400, height=300');
      }

      $('#dialog-insert')['dialog']('close');
      clearRows(editPGs.pgSD.h);
      clearRows(editPGs.pgSD.d);
      // editData(ePG.m, ePG.h, ePG.d);
      readdata(editPGs.pgSD.m);
      readdata(mainPGs.pgSD);
      readdata(mainPGs.pgED);
    })



    // let arr = editPGs.pgSD.h.dataView.getItems();
    // if (IsDirtyCheck(editPGs.pgSD.d)) {
    //   // 転記の場合、DB登録しているか
    //   // 受領書フラグが宙ぶらりんだと変更判定にひっかかるので、ヘッダは判定していない
    //   window.alert('データ登録してから納品書作成をしてください');
    // } else {
    //   // 納品書タイプによって作成処理変更
    //   if (IsPrintReceipt() === 'A') {
    //     // 納品書A
    //     window.open('./db.php?req=makeStatementFile&' +
    //       makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '納品書発行', 'width=400, height=300');
    //   } else {
    //     // 納品書B
    //     window.open('./db.php?req=makeStatementFileAccept&' +
    //       makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '納品書発行', 'top=200, left=200, width=400, height=300');
    //   }
    // }
    // $('#dialog-insert')['dialog']('close');
    // clearRows(editPGs.pgSD.h);
    // clearRows(editPGs.pgSD.d);
    // readdata(editPGs.pgSD.m);
    // readdata(mainPGs.pgSD);
    // readdata(mainPGs.pgED);
  });
  // 2023/2/28　不要のためコメントアウト
  // editPGs.pgSD.d.addButton('CSV出力', function () { exportGridToCSV(editPGs.pgSD.d); });
  // editPGs.pgSD.d.addButton('請求書ファイル仮発行', function () {
  //   if (IsDirtyCheck(editPGs.pgSD.d)) {
  //     // 転記の場合、DB登録しているか
  //     window.alert('データ登録してからファイル発行をしてください');
  //   } else {
  //     window.open('./db.php?req=makeBillFromStatementFile' +
  //       makeHeaderPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
  //   }
  // });
  
  editPGs.pgSD.d.addButton('納品確定', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if (IsDirtyCheck(editPGs.pgSD.h)) {
      alert('データ更新後に納品確定してください。');
      return;
    }
    if (IsDirtyCheck(editPGs.pgSD.d)) {
      alert('データ更新後に納品確定してください。');
      return;
    }

    let arr = editPGs.pgSD.h.dataView.getItems();
    let arrDetail = editPGs.pgSD.d.dataView.getItems();

    if (!isSet(arrDetail[0]['sd_deliv_create_date'])) {
      alert('納品書を発行した後に、納品確定へ進んでください。');
      return;
    }
    if (!isSet(arr[0]['s_shipping_date'])) {
      alert('出荷日が未定です。出荷した後に納品確定へ進んでください。');
      return;
    }
    if (!isSet(arr[0]['s_shipping_plan_date'])) {
      alert('出荷予定日が未定です。出荷予定日を入力した後に納品確定へ進んでください。');
      return;
    }
    if (arr[0]['s_sales_sign'] === '1') {
      alert('納品確定済みです。納品取消後に再度確定してください。');
      return;
    }
    confirmStatementFlg(editPGs.pgSD.h, editPGs.pgSD.d).done(function (data, jqXHR, textStatus) {
      if (data['succeed']) {
        window.alert('納品確定しました。');
        $('#dialog-insert')['dialog']('close');
        clearRows(editPGs.pgSD.h);
        clearRows(editPGs.pgSD.d);
        readdata(editPGs.pgSD.m);
      }
      if (data['msg'] !== '') {
        window.alert(data['msg']);
      }
    });
  });

  editPGs.pgSD.d.addButton('納品取消', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    let arr = editPGs.pgSD.h.dataView.getItems();
    // 
    // if (!isSet(arr[0]['sd_deliv_create_date']) || !isSet(arr[0]['sd_shipment_date'])) {
    if (!isSet(arr[0]['s_sales_sign']) || arr[0]['s_sales_sign'] === '0') {
      alert('納品確定されていません。');
      return;
    }
    cancelStatementFlg(editPGs.pgSD.h, editPGs.pgSD.d).done(function (data, jqXHR, textStatus) {
      if (data['succeed']) {
        window.alert('納品確定を取り消しました。');
        $('#dialog-insert')['dialog']('close');
        clearRows(editPGs.pgSD.h);
        clearRows(editPGs.pgSD.d);
        readdata(editPGs.pgSD.m);
      }
      if (data['msg'] !== '') {
        window.alert(data['msg']);
      }
    });
  });
  // 2023/2/28　不要のためコメントアウト
  // editPGs.pgSD.d.addButton('在庫引当確認', function () {
  //   let activeRow = editPGs.pgSD.d.getActiveRow();
  //   if (!activeRow) {
  //     window.alert('編集対象とする行を選択してください。');
  //     return;
  //   }
  //   // if (activeRow[0]['ed_ar_cd'] < 3) {
  //   //   // 3:在庫か4:購入のみ先に進める
  //   //   alert('在庫引当対象データではありません。');
  //   //   return;
  //   // }
  //   showCheckdatDialog(0);
  //   // 元の画面IDセット
  //   $("#mother-grid").val('SD');
  //   readDataStock(checkdatPGs.pgAssignstock, activeRow, 'SD');
  //   //   checkdatPGs.pgAssignstock.displayIndicator(false);
  //   //   if (data.length > 0) {
  //   //     checkdatPGs.pgAssignstock.dataView.setItems(objs);
  //   //     checkdatPGs.pgAssignstock.grid.setSortColumns([]);
  //   //     checkdatPGs.pgAssignstock.grid.setSelectedRows([]);
  //   //     checkdatPGs.pgAssignstock.grid.invalidate();
  //   //   }
  //   // })
  // });
  editPGs.pgSD.d.addButton('LIXIL納品書エクセル出力', function () {
    // LIXIL納品書用のエクセルファイル作成
    window.open('./db.php?req=makeStatementFileLIXIL&' +
    makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '専用伝票発行', 'top=200, left=200, width=400, height=300');
  });
  editPGs.pgSD.d.addButton('材料ミルシート出力', function () {
    // 材料ミルシートのエクセルファイル作成
    window.open('./db.php?req=makeMaterialMillSheet&' +
    makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '材料ミルシート', 'top=200, left=200, width=400, height=300');
  });

  editPGs.pgSD.d.addButton('チャーター用送状発行', function () {
    // 材料ミルシートのエクセルファイル作成
    let editSd = editPGs.pgSD.h.grid.getDataItem(0);
    // if (editSd && editSd.s_tc_short_name === 'チャーター') {
      window.open('./db.php?req=makeCharterInvoice&' +
      makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), 'チャーター用送状', 'top=200, left=200, width=400, height=300');
    // }
  });
  editPGs.pgSD.d.addButton('納品書再発行', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // 納品確定済みになっていて納品書が出せない時のみ以下の処理を可能とする。
    let arr = editPGs.pgSD.h.dataView.getItems();
    if (!isSet(arr[0]['s_sales_sign']) || arr[0]['s_sales_sign'] === '0') {
      alert('納品確定前のデータは「仮納品書作成」から納品書の出力を行って下さい。');
      return;
    }

    // 納品書タイプによって作成処理変更
    if (IsPrintReceipt() === 'A') {
      // 納品書A
      window.open('./db.php?req=makeStatementReFile&' +
        makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '納品書発行', 'width=400, height=300');
    } else {
      // 納品書B
      window.open('./db.php?req=makeStatementReFileAccept&' +
        makeSQLPKQuery(mainPGs.pgSD.columns, editPGs.pgSD.h.grid.getDataItem(0), editPGs.pgSD.d.dataView.getItems()), '納品書発行', 'top=200, left=200, width=400, height=300');
    }
    $('#dialog-insert')['dialog']('close');
    // updatedetaildata(editPGs.pgSD.h, editPGs.pgSD.d, () => {
    //   // let arr = editPGs.pgSD.h.dataView.getItems();
    //   clearRows(editPGs.pgSD.h);
    //   clearRows(editPGs.pgSD.d);
    //   // editData(ePG.m, ePG.h, ePG.d);
    //   readdata(editPGs.pgSD.m);
    //   readdata(mainPGs.pgSD);
    //   readdata(mainPGs.pgED);
    // })
  });

  mainPGs.pgBD.addButton('請求データ作成', function () { openSDForBillDlg(); });
  // 2023/3/2　出荷予定タブから移行
  mainPGs.pgBD.addButton('請求一覧表', function () { openCheckBillDlg(); });
  // 2023/3/14　請求書のデータ作成と帳票作成を分解
  mainPGs.pgBD.addButton('請求書発行', function () { openOutputBillDlg(); });
  mainPGs.pgBD.addButton('LIXIL請求書発行', function () {
    let editBd = mainPGs.pgBD.dataView.getItems();
    window.open('./db.php?req=makeBillFileLIXIL', 'LIXIL請求書', 'top=200, left=200, width=400, height=300');
  });
  mainPGs.pgBD.addButton('請求書取消', function () { openDeleteDlg(); });
  mainPGs.pgBD.addButton('番号一覧', function () {
    displayNumberList(mainPGs.pgBD, numberListPGs.pgBD);
  });

  // infoPGs.pgED.h1.addButton('登録', function () {
  //   // updatedetaildata(ePG.h, ePG.d, function () {
  //   //   $('#dialog-insert')['dialog']('close');
  //   //   clearRows(ePG.h);
  //   //   clearRows(ePG.d);
  //   //   readdata(ePG.m);
  //   // });
  // })
  // mainPGs.pgBD.addButton('在庫確認', function () {
  //     if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
  //       return;
  //     }
  //     showCheckdatDialog(CHECKDATTABS.Currentstock);
  //     readdata(checkdatPGs.pgCurrentstock);
  //   });
  Object.keys(masterPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var mstPG = masterPGs[elem];
    // web画面からマスタ登録関連ボタンを隠す　modify @sono 10/12
    mstPG.addButton('読込', function () { 
      mstPG.clearFilters();
      readMaster(); });
    if (elem === 'pgProduct' || elem === 'pgCustomerpost') {
      mstPG.addButton('行追加', function () { addRow(mstPG); });
      mstPG.addButton('登録', function () {
        if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
          return;
        }
        if (checkRecordData(mstPG)) {
          updatedata(mstPG, readMaster);
        }
      });
    } else if (elem === 'pgStorage' ) {
      mstPG.addButton('現品票発行', function () {
        exportIDSheetStorage();
      });
      mstPG.addButton('登録', function () {
        if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
          return;
        }
        if (checkRecordData(mstPG)) {
          updatedata(mstPG, readMaster);
        }
      });
      
    }
    mstPG.addButton('CSV出力', function () { exportGridToCSV(mstPG); });
  });
  // editPGs.pgProdplans.d.addButton('展開結果確認', function () {
  //   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
  //     return;
  //   }
  //   var pgMaster = getActiveEditPG();
  //   var itemMaster = pgMaster.getActiveRow();
  //   if (!itemMaster) {
  //     window.alert('展開結果確認対象の行を選択してください。');
  //     return;
  //   }
  //   var checkId = itemMaster['ppd_products_id'];
  //   var qty = itemMaster['ppd_quantity'];
  //   var finishdt = itemMaster['ppd_finish_plan'];
  //   if (!checkId) {
  //     window.alert('製品IDを指定してください。');
  //     return;
  //   }
  //   if ($.isNumeric(qty) === false) {
  //     window.alert('数量を指定してください。');
  //     return;
  //   }
  //   showCheckdatDialog(CHECKDATTABS.Checkbom);
  //   readdata(checkdatPGs.pgCheckbom, { 'checkId': checkId, 'qty': qty, 'finishdt': finishdt });
  // });

  // 金網指図画面 *********************************************************************************
  editPGs.pgProdplans.d.addButton('金網製造指示', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    // 金網製造指示画面に遷移　既存かどうかは下位にて確認
    showCalcProdplanDlg();
  });

  editPGs.pgProdplans.d.addButton('加工内容編集', function (pgHeader) {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }

    // 加工工程に時間がセットされていなければメッセージ表示
    let optionProcess = editPGs.pgProdplans.h.dataView.getItems();
    if (!WSUtils.validateStringNumber(optionProcess[0]['pd_process_cd_30']) 
        && !WSUtils.validateStringNumber(optionProcess[0]['pd_process_cd_40'])
        && !WSUtils.validateStringNumber(optionProcess[0]['pd_process_cd_50'])
        && !WSUtils.validateStringNumber(optionProcess[0]['pd_process_cd_80'])) {
      alert('必要な工程に時間を入力してください。');
      return;
    }

    showSettingDialog(SETTINGTABS.SettingProc);
    readSettingProc(settingPGs.pgSettingProc, optionProcess);

  });

  editPGs.pgProdplans.d.addButton('製造指示書出力', function () {
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    if (IsDirtyCheck(editPGs.pgProdplans.h) || IsDirtyCheck(editPGs.pgProdplans.d)) {
      alert('編集中のデータを保存してから製造指示書を出力してください。');
      return;
    }

    // 製造指示書(エクセルファイル)発行
    window.open('./db.php?req=makeProductPlanSheet' + 
    makeHeaderPKQuery(mainPGs.pgProdplans.columns, editPGs.pgProdplans.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
    // // 受注書コピー添付 
    // window.open('./db.php?req=makeEstimateLPFile&' + 
    // makeHeaderPKQuery(mainPGs.pgProdplans.columns, editPGs.pgProdplans.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');
    // // 作業確認検査表
    // window.open('./db.php?req=makeInspectionLPFile&' +
    //   makeHeaderPKQuery(mainPGs.pgProdplans.columns, editPGs.pgProdplans.h.grid.getDataItem(0)), '_blank', 'width=400, height=300');

  });


  editPGs.pgProdplans.d.addButton('引当確認', () => {
    let activeRow = editPGs.pgProdplans.d.dataView.getItems();
    const TAB_MANUFACTURINGUSE = 1;
    showCheckdatDialog(TAB_MANUFACTURINGUSE);
    // 元の画面IDセット
    $("#mother-grid").val('Prodplans');
    readManufacturingUseProduct(checkdatPGs.pgManufacturingUse, activeRow[0]);
    // readDataStock(checkdatPGs.pgAssignstock, activeRow[0], 'Prodplans');
  });

  // editPGs.pgProdplans.d.addButton('QRシート発行', function () {

  // });
  // masterPGs.pgBom.addButton('展開結果確認', function () {
  //   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
  //     return;
  //   }
  //   var pgMaster = getActiveMasterPG();
  //   var itemMaster = pgMaster.getActiveRow();
  //   if (!itemMaster) {
  //     window.alert('展開結果確認対象の行を選択してください。');
  //     return;
  //   }
  //   var checkId = itemMaster['b_parent_id'];
  //   if (!checkId) {
  //     window.alert('製品IDを指定してください。');
  //     return;
  //   }
  //   var checkParentId = itemMaster['b_parent_id'];
  //   if (!checkId) {
  //     window.alert('製品IDを指定してください。');
  //     return;
  //   }
  //   showCheckdatDialog(CHECKDATTABS.Checkbom);
  //   readdata(checkdatPGs.pgCheckbom, { 'checkId': checkId, 'qty': 1, 'finishdt': $['datepicker']['formatDate']('yy/mm/dd', new Date()) });
  // });
  // masterPGs.pgStorages.addButton('在庫確認', function () {
  //   if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
  //     return;
  //   }
  //   showCheckdatDialog(CHECKDATTABS.Currentstock);
  //   readdata(checkdatPGs.pgCurrentstock);
  // });

  // 番号一覧画面 選択ボタン追加
  Object.keys(numberListPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    let mPG = numberListPGs[elem];
    mPG.addButton('選択', function () {
      filterMainNumber(mPG);
    });

    // 見積書の番号一覧だけCSV出力ボタンを表示
    if (mPG.divId === 'NumberListED') {            
      mPG.addButton('CSV出力', function () {
        exportGridToCSV(mPG);
      });
    }

    // 全機能で対応する場合はコメントを外す
    // mPG.addButton('選択行非表示', function () {
    //   let bRslt = confirm('指定されたデータを非表示にしますが、よろしいですか');
    //   if (!bRslt) {
    //     return;
    //   }
    //   changeVisible(mPG, false).done( function (data) {
    //     if (data['succeed']) {
    //       alert('選択されたデータを非表示にしました。');
    //       // メイン画面リロード
    //       reloadMainList(mPG);
    //       $('#dialog-number-list')['dialog']('close');
          
    //     } else {
    //       alert('非表示に更新できませんでした。');
    //     }
    //   });
    // });
    
    readUserInfo().done(function (userInfo) {
      if (userInfo[0]['PERMISSION_ID'] === '00001' || userInfo[0]['PERMISSION_ID'] === '00002') {
        if (['NumberListED', 'NumberListMOD', 'NumberListSD', 'NumberListBD'].includes(mPG.divId)) {
          mPG.addButton('選択行非表示', function () {
            let bRslt = confirm('指定されたデータを非表示にしますが、よろしいですか');
            if (!bRslt) {
              return;
            }
            changeVisible(mPG, false).done( function (data) {
              if (data['succeed']) {
                alert('選択されたデータを非表示にしました。');
                // メイン画面リロード
                reloadMainList(mPG);
                $('#dialog-number-list')['dialog']('close');
                
              } else {
                alert('非表示に更新できませんでした。');
              }
            });
          });

          mPG.addButton('非表示データ読込', function () {
            loadInvisible(mPG);
          });
      
          mPG.addButton('選択行表示', function () {
            let bRslt = confirm('指定されたデータを表示にしますが、よろしいですか');
            if (!bRslt) {
              return;
            }
            changeVisible(mPG, true).done( function (data) {
              if (data['succeed']) {
                alert('選択されたデータを表示にしました。');
                // メイン画面リロード
                reloadMainList(mPG);
                $('#dialog-number-list')['dialog']('close');
                
              } else {
                alert('表示に更新できませんでした。');
              }
            });
          });
        }
      }

      // 管理者以外の場合も表示するボタン
      if (mPG.divId === 'NumberListED') {                    
        mPG.addButton('編集(F2)', function () { 
          editData(mPG, editPGs.pgED.h, editPGs.pgED.d);
        });

        mPG.addButton('新規登録(F3)', function () {
          insertNewData(mainPGs.pgED, editPGs.pgED.h, editPGs.pgED.d);
        });

        mPG.addButton('見積書リピート', function () { 
          repeatEstimate('NumberListED');
        });

        mPG.addButton('現品票発行', function () { 
          exportIDSheet(); 
        });
      }
    });

    // readUserInfo(document.getElementById('login-user').textContent).done(function (data) { 
    //   userPermData = data[0]; 
    //   if (userPermData['PERMISSION_CONTROL_TABLE'] === '1') {
    //     // 1:更新、参照許可
    //     mPG.addButton('非表示データ読込', function() {

    //       loadInvisible(mPG, false);
    //     });      
    //     mPG.addButton('非表示データ解除', function() {
    //       let bRslt = confirm('指定されたデータを表示するように変更しますが、よろしいですか');
    //       if (!bRslt) {
    //         return;
    //       }
    //       changeVisible(mPG, true).done( function (data) {
    //         if (data['succeed']) {
    //           alert('選択されたデータを表示するように変更しました。');
    //           // メイン画面リロード
    //           reloadMainList(mPG);
    //           $('#dialog-number-list')['dialog']('close');
              
    //         } else {
    //           alert('表示に更新できませんでした。');
    //         }
    //       });
    //     });
    //   }
    // });
  });

  /// 在庫ダイアログ用
  Object.keys(stockPGs).forEach((elem) => {
    /** @type {PlannerGrid} */
    let stPG = stockPGs[elem];
    stPG.addButton('CSV出力', () => {
      exportGridToCSV(stPG);
    });
    if (elem.indexOf('pgCR15M') >= 0) {
      stPG.addButton('引当・使用予定数セット', () => {
        setGridToPlanNum(stPG);
      });

      // クリンプロール
      stPG.addButton('詳細', ()=> {
        let activeRow = stPG.getActiveRow();

        if (!activeRow) {
          alert('行を選択してください。');
          return;
        }
        showDetailStockDialog(stPG, activeRow);

      })
    } else if (elem.indexOf('pgWR') >= 0) {
      stPG.addButton('引当・使用予定数セット', () => {
        setGridToPlanNum(stPG);
      });

      // 鋼線
      stPG.addButton('詳細', () => {
        let activeRow = stPG.getActiveRow();

        if (!activeRow) {
          alert('行を選択してください。');
          return;
        }
        showDetailStockDialog(stPG, activeRow);

      });
    } else if (elem.indexOf('pgMT') >= 0) {
      // 鋼線
      stPG.addButton('引当・使用予定数セット', () => {
        setGridToPlanNum(stPG);
      });

      stPG.addButton('詳細', () => {
        let activeRow = stPG.getActiveRow();

        if (!activeRow) {
          alert('行を選択してください。');
          return;
        }
        showDetailStockDialog(stPG, activeRow);

      });
    }
    if (elem.indexOf('pgCRRSVRYOKI') >= 0 || elem.indexOf('pgCRRSVSHT') >= 0) {
      // 否定条件を指定した方が早いため、空のif文とする
    } else if ((elem.indexOf('pgCR') >= 0 && elem.indexOf('pgCR15M') < 0) || elem.indexOf('pgWV')  >= 0 || elem.indexOf('pgWD') >= 0) {
      // クリンプ(本管理以外)、織、溶接金網は引当数を表示させる機能が必要。
      stPG.addButton('引当・使用予定数セット', () => {
        setGridToPlanNum(stPG);
      });
    }
  });

  /** 編集画面でのアクティブセル位置変更対応イベントを追加する */
  var detectEditingGrid = function (pgDetail, pgHeader) {
    pgDetail.grid.onActiveCellChanged.subscribe(function (e, args) {
      pgHeader.isEditing = false;
      pgDetail.isEditing = (pgDetail.grid.getActiveCell() ? true : false);
    });
    pgHeader.grid.onActiveCellChanged.subscribe(function (e, args) {
      pgDetail.isEditing = false;
      pgHeader.isEditing = (pgHeader.grid.getActiveCell() ? true : false);
    });
  };
  var detectEditingGridpgCalc = function (pgHeader1, pgHeader2, pgDetail1) {
    // d2は全てのcalcPGsが持っているわけではない、かつ、activerowをとることはないためd2を排除。
    pgDetail1.grid.onActiveCellChanged.subscribe(function (e, args) {
      pgHeader1.isEditing = false;
      pgHeader1.isEditing = false;
      pgDetail1.isEditing = (pgDetail1.grid.getActiveCell() ? true : false);
    });
    pgHeader1.grid.onActiveCellChanged.subscribe(function (e, args) {
      pgDetail1.isEditing = false;
      pgHeader2.isEditing = false;
      pgHeader1.isEditing = (pgHeader1.grid.getActiveCell() ? true : false);
    });
    pgHeader2.grid.onActiveCellChanged.subscribe(function (e, args) {
      pgDetail1.isEditing = false;
      pgHeader1.isEditing = false;
      pgHeader2.isEditing = (pgHeader2.grid.getActiveCell() ? true : false);
    });
  }
  Object.keys(editPGs).forEach(function (elem) {
    /** @type {PGHeaderDetail} */
    var ePG = editPGs[elem];
    detectEditingGrid(ePG.d, ePG.h);
  });
  Object.keys(calcPGs).forEach(function (elem) {
    /** @type {PGDoubleHeaderDetail} */
    var ePG = calcPGs[elem];
    detectEditingGridpgCalc(ePG.h1, ePG.h2, ePG.d1);
  })
  // オプション項目ボタン
  $('#btn-showmaster').on('click', function () {
    readMaster();
    showMasterDialog();
  });

  // 在庫一覧表示
  $('#btn-showstockview').on('click', function () {
    // 在庫ビュー読込
    readStockView('', 'CREATE');
    showStockViewDialog();
  });

  $("#tabs-stockview").tabs({
    activate: function (event, ui) {
      switch (ui.newTab.index()) {
        case 0:
          changeStockViewCategory('crimp');
          break;        
        case 1:
          changeStockViewCategory('weave');
          stockPGs.pgWVSUS304.redraw();
          break;            
        case 2:
          changeStockViewCategory('welding');
          stockPGs.pgWDSUS.redraw();
          break;          
        case 3:
          changeStockViewCategory('wire');
          stockPGs.pgWRSUS304W1.redraw();
          break;
        case 4:
          changeStockViewCategory('material');
          stockPGs.pgMTPUNCH.redraw();
          break;
        default:
          changeStockViewCategory('crimp');
      }
    },
  });
  $("#tabs-stockview-crimp").tabs({
    activate: ( event, ui) => {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('CR') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
    create: function (event, ui) {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('CR') > 0) {
          stockPGs[elem].redraw();
        }
      });
    }
  });
  $("#tabs-stockview-weave").tabs({
    activate: ( event, ui) => {      
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('WV') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
    create: function ( event, ui) {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('WV') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
  });
  $("#tabs-stockview-welding").tabs({
    activate: ( event, ui) => {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('WD') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
    create: function ( event, ui) {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('WD') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
  });
  $("#tabs-stockview-wire").tabs({
    activate: ( event, ui) => {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('WR') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
    create: function ( event, ui) {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('WR') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
  });
  $("#tabs-stockview-material").tabs({
    activate: ( event, ui) => {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('MT') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
    create: function ( event, ui) {
      Object.keys(stockPGs).forEach(function (elem) {
        if (elem.indexOf('MT') > 0) {
          stockPGs[elem].redraw();
        }
      });
    },
  });

  // 在庫詳細
  $('#tabs-detailstock').tabs({
    activate: ( event, ui) => {
      Object.keys(detailStockPGs).forEach(function (elem) {
        detailStockPGs[elem].redraw();
      });
    },
  })
  // 見積書データ読み込み済みフラグ
  let isReadED = false;
  // メイン画面タブの初期設定
  $('div#tabs').css({ 'display': 'inherit' })['tabs']({
    'beforeActivate': function (event, ui) {
      $('#dialog-code')['dialog']('close');
    },
    'activate': function (event, ui) {
      Object.keys(mainPGs).forEach(function (elem) {
        mainPGs[elem].redraw();
      });

      // 2023/2/10　初期表示しないように再度要望があったためコメントアウト
      // 見積書一覧を開いたときに番号一覧を初期表示する
      // if (ui.newPanel.selector.match(/#tabs-main-ED/)) {
      //   // 初回の見積書データだけ読み込むことで、タブ切替毎にデータ読込のリクエストを送ることを防ぐ
      //   if (!isReadED) {
      //     isReadED = true;
      //     readdata(mainPGs['pgED'], null, function () {
      //       displayNumberList(mainPGs['pgED'], numberListPGs['pgED'])
      //     });
      //   } else {
      //     displayNumberList(mainPGs['pgED'], numberListPGs['pgED'])
      //   }        
      // }
    }
  });
  // 登録ウィンドウ画面タブの初期設定
  $('div#tabs-insert')['tabs']({
    'activate': function (event, ui) {
      Object.keys(editPGs).forEach(function (elem) {
        editPGs[elem].d.redraw();
        editPGs[elem].h.redraw();
      });
    },
    'beforeActivate': function (event, ui) {
      event.preventDefault();
    },
  }).css({ 'display': 'inherit' });
  // マスタウィンドウ画面タブの初期設定
  $('div#tabs-master')['tabs']({
    'activate': function (event, ui) {
      Object.keys(masterPGs).forEach(function (elem) {
        masterPGs[elem].redraw();
      });
    }
  }).css({ 'display': 'inherit' });
  // BOM展開結果確認画面等タブの初期設定
  $('div#tabs-checkdat')['tabs']({
    'activate': function (event, ui) {
      Object.keys(checkdatPGs).forEach(function (elem) {
        checkdatPGs[elem].redraw();
      });
    }
  }).css({ 'display': 'inherit' });
  // 加工内容編集初期設定
  $('div#tabs-setting')['tabs']({
    'activate': function (event, ui) {
      Object.keys(settingPGs).forEach(function (elem) {
        settingPGs[elem].redraw();
      });
    }
  }).css({ 'display': 'inherit' });

  // ショートカットキーの設定
  window.onhelp = function () { return false; };
  $(document).keydown(function (e) {
    var keyCode = e.keyCode;
    if (keyCode == 112) { // F1:マスタ参照または選択項目記入
      e.preventDefault();

      if ($('#dialog-detailstock')['dialog']('isOpen')) {
        // 在庫詳細
        inputSelectedItemStock(2);

      } else if ($('#dialog-stockview')['dialog']('isOpen')) {
        // 在庫画面はクリンプのｍ、シート管理と、織網、溶接金網のみF1キー対応。他は在庫詳細画面。
        // 在庫画面
        inputSelectedItemStock(1);

      } else if ($('#dialog-code')['dialog']('isOpen') === false) {
        // マスタ画面を表示する
        if (Slick.GlobalEditorLock.isActive() &&
          !Slick.GlobalEditorLock.cancelCurrentEdit()) {
          return;
        }
        displayCodeInputForm();
      } else {
        // 既にマスタ画面が表示されている場合、選択項目をメイン画面のアクティブセルに記入する
        inputSelectedCode();
        $('#dialog-code')['dialog']('close');
      }
      return false;
    }
    if (keyCode == 113) { // F2:編集画面表示
      e.preventDefault();
      switch (getActiveMainPG()) {
        case mainPGs.pgProdplans:
          editData(mainPGs.pgProdplans, editPGs.pgProdplans.h, editPGs.pgProdplans.d);
          break;
        // case mainPGs.pgShipplans:
        //   editData(mainPGs.pgShipplans, editPGs.pgShipplans.h, editPGs.pgShipplans.d);
        //   break;
        case mainPGs.pgED:
          editData(mainPGs.pgED, editPGs.pgED.h, editPGs.pgED.d);
          break;
        // case mainPGs.pgLP:
        //   editData(mainPGs.pgLP, editPGs.pgLP.h, editPGs.pgLP.d);
        //   break;
        // case mainPGs.pgMOED:
        //   editData(mainPGs.pgMOED, editPGs.pgMOED.h, editPGs.pgMOED.d);
        //   break;
        case mainPGs.pgMOD:
          editData(mainPGs.pgMOD, editPGs.pgMOD.h, editPGs.pgMOD.d);
          break;
        // case mainPGs.pgOOED:
        //   editData(mainPGs.pgOOED, editPGs.pgOOED.h, editPGs.pgOOED.d);
        //   break;
        case mainPGs.pgOOD:
          editData(mainPGs.pgOOD, editPGs.pgOOD.h, editPGs.pgOOD.d);
          break;
        case mainPGs.pgSD:
          editData(mainPGs.pgSD, editPGs.pgSD.h, editPGs.pgSD.d);
          break;
        case mainPGs.pgBD:
          editData(mainPGs.pgBD, editPGs.pgBD.h, editPGs.pgBD.d);
          break;
        default:
          break;
      }
      return false;
    }
    if (keyCode == 114) { // F3:新規登録
      e.preventDefault();
      switch (getActiveMainPG()) {
        case mainPGs.pgProdplans:
          insertNewData(mainPGs.pgProdplans, editPGs.pgProdplans.h, editPGs.pgProdplans.d);
          break;
        // case mainPGs.pgShipplans:
        //   insertNewData(mainPGs.pgShipplans, editPGs.pgShipplans.h, editPGs.pgShipplans.d);
        //   break;
        case mainPGs.pgED:
          insertNewData(mainPGs.pgED, editPGs.pgED.h, editPGs.pgED.d);
          break;
        // case mainPGs.pgLP:
        //   insertNewData(mainPGs.pgLP, editPGs.pgLP.h, editPGs.pgLP.d);
        //   break;
        // case mainPGs.pgMOED:
        //   insertNewData(mainPGs.pgMOED, editPGs.pgMOED.h, editPGs.pgMOED.d);
        //   break;
        case mainPGs.pgMOD:
          insertNewData(mainPGs.pgMOD, editPGs.pgMOD.h, editPGs.pgMOD.d);
          break;
        // case mainPGs.pgOOED:
        //   insertNewData(mainPGs.pgOOED, editPGs.pgOOED.h, editPGs.pgOOED.d);
        //   break;
        case mainPGs.pgOOD:
          insertNewData(mainPGs.pgOOD, editPGs.pgOOD.h, editPGs.pgOOD.d);
          break;
        // case mainPGs.pgSD:
        //   insertNewData(mainPGs.pgSD, editPGs.pgSD.h, editPGs.pgSD.d);
        //   break;
        // case mainPGs.pgBD:
        //   insertNewData(mainPGs.pgBD, editPGs.pgBD.h, editPGs.pgBD.d);
        //   break;
        default:
          break;
      }
      return false;
    }
  });
  // マスタ一覧表示ダイアログ
  $('#dialog-code')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 500,
    //'modal': true,
    // 'buttons': {
    //   'OK': function () {
    //     $(this)['dialog']('close');
    //   }
    // },
    'resize': function (event, ui) {
      Object.keys(masterPGs).forEach(function (elem) {
        masterPGs[elem].redraw();
      });
    }
  });
  // BOM展開結果確認ダイアログ
  $('#dialog-checkdat')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 600,
    //'modal': true,
    'buttons': {
      // 'OK': function () {
      //   $(this)['dialog']('close');
      // }
    },
    'resize': function (event, ui) {
      Object.keys(checkdatPGs).forEach(function (elem) {
        checkdatPGs[elem].redraw();
      });
    }
  });
  // 加工内容編集ダイアログ
  $('#dialog-setting')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 600,
    //'modal': true,
    'buttons': {
      // 'OK': function () {
      //   $(this)['dialog']('close');
      // }
    },
    'resize': function (event, ui) {
      Object.keys(settingPGs).forEach(function (elem) {
        settingPGs[elem].redraw();
      });
    }
  });
  // 見積計算ダイアログ
  $('#dialog-calc-estimate')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 500,
    // 'modal': true, 
    'close': function () {
      clearRows(calcPGs.pgEDCalc.h1);
      clearRows(calcPGs.pgEDCalc.h2);
      clearRows(calcPGs.pgEDCalc.d1);

    },
    'resize': function (event, ui) {
      Object.keys(calcPGs).forEach(function (elem) {
        calcPGs[elem].d1.redraw();
        calcPGs[elem].h1.redraw();
        calcPGs[elem].h2.redraw();
      });
    }
  });
  $('#btn-calc-estimate-reg').on('click', function () {
    // 見積計算データを登録する
    // updatedetaildata()
    updateEDCalc(calcPGs.pgEDCalc.h1, calcPGs.pgEDCalc.h2, calcPGs.pgEDCalc.d1, function (resp) {
      // 登録できたらリストをクリアして戻る
      if (resp) {
        clearRows(calcPGs.pgEDCalc.h1);
        clearRows(calcPGs.pgEDCalc.h2);
        clearRows(calcPGs.pgEDCalc.d1);
        $('#dialog-calc-estimate')['dialog']('close');

        // 編集した金額が画面更新されないので、画面を閉じる
        // また既存機能として、表示データがメイン画面のデータを使用しているため、画面リロード時に該当データを記憶させておかないと編集画面での該当データリロードが不可能。
        clearRows(editPGs.pgED.h);
        clearRows(editPGs.pgED.d);
        readdata(editPGs.pgED.m);
        $('#dialog-insert')['dialog']('close');
      }
    });
  });
  $('#btn-calc-estimate-cancel').on('click', function () {
    // データをクリアして閉じる。
    clearRows(calcPGs.pgEDCalc.h1);
    clearRows(calcPGs.pgEDCalc.h2);
    clearRows(calcPGs.pgEDCalc.d1);
    $('#dialog-calc-estimate')['dialog']('close');
  });
  // 指図金網ダイアログ
  $('#dialog-calc-prodplan')['dialog']({
    'autoOpen': false,
    'resizable': true,
    // 'modal': true,
    'width': '80%',
    'height': 600,
    'close': function () {
      clearRows(calcPGs.pgProdMold.h1);
      clearRows(calcPGs.pgProdMold.h2);
      clearRows(calcPGs.pgProdMold.d1);
      clearRows(calcPGs.pgProdMold.d2);
    },
    'resize': function () {
      calcPGs.pgProdMold.d1.redraw();
      calcPGs.pgProdMold.d2.redraw();
      calcPGs.pgProdMold.h1.redraw();
      calcPGs.pgProdMold.h2.redraw();
    },
  });
  // 指図金網の行削除ボタンは、リスト右端の削除チェックにより行う事とする
  // $('#btn-calc-prodplan-deleterow').on('click', function () {
  //   // 指図金網行削除
  //   removeRow(calcPGs.pgProdMold.d1, 'ProdMold');
  // });
  $('#btn-calc-prodplan-reg').on('click', function () {
    // 指図金網データを登録する
    if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }
    updateCalcProdPlans(calcPGs.pgProdMold.h1, calcPGs.pgProdMold.h2, calcPGs.pgProdMold.d1, calcPGs.pgProdMold.d2).done(function (data, jqXHR, textStatus) {
      if (data['succeed']) {
        alert('登録が完了しました。');
        clearRows(calcPGs.pgProdMold.h1);
        clearRows(calcPGs.pgProdMold.h2);
        clearRows(calcPGs.pgProdMold.d1);
        clearRows(calcPGs.pgProdMold.d2);
        // 画面を閉じる
        $('#dialog-calc-prodplan')['dialog']('close');
      }
      if (data['msg'] !== '') {
        alert(data['msg']);
      }
    });

  });
  // $('#btn-calc-prodplan-cancel').on('click', function () {
  //   // データをクリアして閉じる。
  //   clearRows(calcPGs.pgProdMold.h1);
  //   clearRows(calcPGs.pgProdMold.h2);
  //   clearRows(calcPGs.pgProdMold.d1);
  //   clearRows(calcPGs.pgProdMold.d2);
  //   $('#dialog-calc-prodplan')['dialog']('close');
  // });
  // 登録画面ダイアログ
  $('#dialog-insert')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 500,
    'modal': true,
    'resize': function (event, ui) {
      Object.keys(editPGs).forEach(function (elem) {
        editPGs[elem].d.redraw();
        editPGs[elem].h.redraw();
      });
    },
    'close': function (event, ui) {
      Object.keys(editPGs).forEach(function (elem) {
        clearRows(editPGs[elem].h);
        clearRows(editPGs[elem].d);
      });


      // 見積書の番号一覧を開いている時に編集画面を閉じると、重複する受注Noをハイフンにする処理を行う
      if ($('#dialog-number-list')['dialog']('isOpen') && numberListCurrentTab == '#tabs-NumberListED') {
        let numberListEDRows = numberListPGs.pgED.dataView.getItems();
        let prevEstimateNo = '';
        // 選択した受注Noの明細を絞り込み
        numberListEDRows = numberListEDRows.filter(function (elem, index) {
          if (elem['e_estimate_no'] === prevEstimateNo && elem['e_estimate_no'] !== '-') {
            elem['e_estimate_no'] = '-';
            return true;
          }

          // 前回と違う受注Noの場合はそのまま
          prevEstimateNo = elem['e_estimate_no'];
          return true;
        });
        numberListPGs.pgED.setItemsAndRefresh(numberListEDRows);
        numberListPGs.pgED.redraw();
      }
    }
    // 'buttons': {
    //   'OK': function () {
    //     $(this)['dialog']('close');
    //   }
    // },
  });
  // 在庫表示グラフ
  $('#dialog-graph')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': 600,
    'height': 500,
    'buttons': {
      'OK': function () {
        $(this)['dialog']('close');
      }
    },
  });
  // 重点品名コードダイアログ
  $('#dialog-br-product')['dialog']({
    'autoOpen': false,
    'resizable': false,
    'modal': true,
    'height': 480,
    'width': 640,
  });
  $('#btn-br-product-yes').on('click', function () {
    // データを保持したまま見積編集画面に戻る
    setBrProductCD(editPGs.pgED.d);
    $('#dialog-br-product')['dialog']('close');
  });
  $('#btn-br-product-cancel').on('click', function () {
    // キャンセルボタン
    $('#dialog-br-product')['dialog']('close');
  });
  $('#brProduct').on('dblclick', function () {
    // 画面で空いているセルにデータセットするように変更
    setBrProductCD(editPGs.pgED.d);
    $('#dialog-br-product')['dialog']('close');
  });

  // // 在庫引きあてダイアログ
  // $('#dialog-sub-stock')['dialog']({
  //   'autoOpen': false,
  //   'resizable': false,
  //   'modal': true,
  //   'height': 480,
  //   'width': 640,
  // });
  // $('#btn-sub-stock-reg').on('click', function () {
  //   // 在庫引当
  //   // setBrProductCD(editPGs.pgED.d);
  //   $('#dialog-sub-stock')['dialog']('close');
  // });
  // $('#btn-sub-stock-cancel').on('click', function () {
  //   // キャンセルボタン
  //   $('#dialog-sub-stock')['dialog']('close');
  // });
  // $('#subStock').on('dblclick', function () {
  //   // 在庫引当する
  //   // setBrProductCD(editPGs.pgED.d);
  //   $('#dialog-sub-stock')['dialog']('close');
  // });
  // QR読み取りダイアログ
  $('dialog-qr-scanner')['dialog']({
    'autoOpen': false,
    'resizable': false,
    'modal': true,
    'height': 480,
    'width': 640,
  })
  // 請求データ作成ダイアログ
  $('#dialog-sdforbill')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'modal': true,
    'width': 300,
    'height': 200,
    'buttons': {
      '請求データ作成': function () {
        searchStatementsForBill();
      }
    },
  });
  // 請求一覧表ダイアログ
  $('#dialog-checkbill')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'modal': true,
    'width': 300,
    'height': 200,
    'buttons': {
      '請求一覧表': function () {
        searchCheckBill();
      }
    },
  });
  // 請求書発行ダイアログ
  $('#dialog-outputbill')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'modal': true,
    'width': 300,
    'height': 250,
    'buttons': {
      '請求書発行': function () {
        searchOutputBill();
      }
    },
  });
  // 請求書削除ダイアログ
  $('#dialog-deletebill')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'modal': true,
    'width': 300,
    'height': 200,
    'buttons': {
      '請求書取消': function () {
        deleteBillData();
      }
    },
  });
  // エクセルコピーダイアログ
  $('#dialog-XLS-copy')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'modal': true,
    'width': 400,
    'height': 300,
    'buttons': {
      '取込': function () {
        
      }
    },
    // 'open': function() {
    //   $(document).keydown(function(e) {
    //     if (e.which == 90 && (e.ctrlKey || e.metaKey)) {    // CTRL + (shift) + Z
    //       if (e.shiftKey) {
    //         undoRedoBuffer.redo();
    //       } else {
    //         // undoRedoBuffer.undo();
    //       }
    //     }
    //   });
    // },
  });
  // 製造リーフ登録中ダイアログ
  $('#dialog-leafprod-issue')['dialog']({
    'autoOpen': false,
    'modal': true,
    'width': 300,
    'height': 80,
    'closeOnEscape': false,
    'open': function (event, ui) {
      $('.ui-dialog-titlebar-close', this['parentNode']).hide();
    }
  });

  // 番号一覧ダイアログ 選択ボタン 初期設定
  let numberListCurrentTab = "";
  $('div#tabs-number-list')['tabs']({
    'activate': function (event, ui) {
      Object.keys(numberListPGs).forEach(function (elem) {
        numberListPGs[elem].redraw();
      });

      // 見積書一覧を開いたときに番号一覧を初期表示する
      if (ui.newPanel.selector.match(/#tabs-main-ED/)) {
        // 初回の見積書データだけ読み込むことで、タブ切替毎にデータ読込のリクエストを送ることを防ぐ
        if (!isReadED) {
          isReadED = true;
          readdata(mainPGs['pgED'], null, function () {
            displayNumberList(mainPGs['pgED'], numberListPGs['pgED'])
          });
        } else {
          displayNumberList(mainPGs['pgED'], numberListPGs['pgED'])
        }        
      }
      numberListCurrentTab = ui.newPanel.selector;
    },
    'beforeActivate': function (event, ui) {
      event.preventDefault();
    }
  }).css({ 'display': 'inherit' });

  // 番号一覧ダイアログ 初期設定
  $('#dialog-number-list')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '98%',
    'height': window.innerHeight - 100,
    'position': {
      my: "center bottom",
      at: "center bottom", 
      of: window
    },
    'modal': true,
    'resize': function (event, ui) {
      Object.keys(numberListPGs).forEach(function (elem) {
        numberListPGs[elem].redraw();
      });
    },
    'close': function (event, ui) {
      Object.keys(numberListPGs).forEach(function (elem) {
        clearRows(numberListPGs[elem]);
      });
    }
  });
  // 在庫一覧ダイアログ
  $('#dialog-stockview')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 600,
    'resize': function (event, ui) {
      Object.keys(stockPGs).forEach(function (elem) {
        stockPGs[elem].redraw();
      });
    }
  });
  // 在庫詳細ダイアログ
  $('#dialog-detailstock')['dialog']({
    'autoOpen': false,
    'resizable': true,
    'width': '80%',
    'height': 600,
    'resize': function (event, ui) {
      Object.keys(detailStockPGs).forEach(function (elem) {
        detailStockPGs[elem].redraw();
      });
    }
  })


  // プログレスバー設定
  $('.progressbar')['progressbar']({
    'value': false,
    'height': 10,
  });
  // リサイズ時イベント
  $(window).resize(function () {
    Object.keys(mainPGs).forEach(function (elem) {
      mainPGs[elem].div.css({
        'height': ($(window).height() - 220) + 'px'
      });
      mainPGs[elem].redraw();
    });
  });
  // // マスタ読込
  // readMaster();
  // 再描画
  $(window).trigger('resize');
}

/**
 * アクティブセルについてのコード入力補助ダイアログを表示する
 */
function displayCodeInputForm() {
  var activeGrid = getActiveEditPG().grid; //getActiveMainPG().grid;
  var activeCell = activeGrid.getActiveCell();
  let activeSettingPG = getActiveSettingPG().grid;
  let activeSettingCell = activeSettingPG.getActiveCell();

  if (!activeCell && !activeSettingCell) {
    showMasterDialog();
    return;
  }
  // アクティブセルでコード欄が指定されている場合、ダイアログ表示時に対応するタブを開く
  var tableName = '';
  var activeGridName = '';

  if (activeSettingCell && $('#dialog-setting')['dialog']('isOpen') === true) {  
    activeGrid = activeSettingPG;
    tableName = activeSettingPG.getColumns()[activeSettingCell.cell]['ref'];
    activeGridName = getActiveSettingPG().divId;
  } else {
    tableName = activeGrid.getColumns()[activeCell.cell]['ref'];
    activeGridName = getActiveEditPG().divId;
  } 

  let record = [];
  switch (tableName) {
    case 'customership':
      // 出荷元、納入先、止め先用絞り込み追加
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Customerpost });
      var textData = '';
      record = activeGrid.getData().getItems()[0];
      // 親画面によって指定カラム変更
      if (activeGridName.match(/SD/)) {
        textData = record['s_customer_cd'];
      } else if (activeGridName.match(/ED/)) {
        textData = record['e_customer_cd'];
      } else if (activeGridName.match(/MOD/) || activeGridName.match(/OOD/) ) {
        textData = record['moed_customer_cd'];
      }
      if (!textData) {
        // なかったらfilterかけずに表示
      } else {
        masterPGs.pgCustomerpost.columnFilters['CP_CUSTOMER_CD'] = textData;
        masterPGs.pgCustomerpost.dataView.refresh();
      }
      break;
    case 'customermaker':
      // 発注先メーカー
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Customerpost });
      // 見積画面
      record = activeGrid.getData().getItems()[0];
      if (!record['moed_customer_cd']) {
        // なかったらfilterかけずに表示
      } else {
        masterPGs.pgCustomerpost.columnFilters['CP_CUSTOMER_CD'] = record['moed_customer_cd'];
        masterPGs.pgCustomerpost.dataView.refresh();
      }
      break;
    case 'user':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.User });
      break;
    case 'customer':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Customer });
      // 見積画面
      // record = activeGrid.getData().getItems()[0];
      // if (!record['moed_customer_cd']) {
      //   // 見積
      //   masterPGs.pgCustomer.columnFilters['C_CUSTOMER_SIGN'] = 'K';
      //   masterPGs.pgCustomer.dataView.refresh();
      // } else {
      //   // // 仕入
      //   // masterPGs.pgCustomer.columnFilters['C_CUSTOMER_SIGN'] = 'Z';
      //   // masterPGs.pgCustomer.dataView.refresh();
      // }
      break;
    case 'customerpost':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Customerpost });
      var textData = '';
      record = activeGrid.getData().getItems()[0];
      // 親画面によって指定カラム変更
      if (activeGridName.match(/SD/)) {
        textData = record['s_customer_cd'];
      } else if (activeGridName.match(/ED/)) {
        textData = record['e_customer_cd'];
      } 
      if (!textData) {
        // なかったらfilterかけずに表示
      } else {
        masterPGs.pgCustomerpost.columnFilters['CP_CUSTOMER_CD'] = textData;
        masterPGs.pgCustomerpost.dataView.refresh();
      }
      break;
    case 'customercharge':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Customercharge });
      break;
    case 'material':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Material });
      break;
    case 'process':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Process });
      break;
    case 'permissions':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Permissions });
      break;
    case 'housecompany':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Housecompany });
      break;
    case 'product':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Product });
      break;
    case 'bom':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Bom });
      break;
    case 'bom_assignable_to':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.BomAssignableTo });
      break;
    case 'projects':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Projects });
      break;
    case 'members':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Members });
      break;
    case 'storages':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Storages });
      break;
    case 'storereasons':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Storereasons });
      break;
    case 'warehouse':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Warehouse });
      break;
    case 'unit':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Unit });
      break;
    case 'tax':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Tax });
      break;
    case 'weight':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Weight });
      break;
    case 'inspection':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Inspection });
      break;
    case 'inspectionview':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Inspectionview });
      break;
    case 'storage':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Storage });
      break;
    case 'payment':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Payment });
      break;
    case 'arrangement':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Arrangement });
      break;
    case 'gari':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Gari });
      break;
    case 'weave':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Weave });
      break;
    case 'cam':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Cam });
      break;
    case 'mold':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Mold });
      break;
    case 'wbsctrl':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Wbsctrl });
      break;
      case 'manufacture':
        $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Manufacture });
        record = activeGrid.getData().getItems()[0];
        // if (!record['ppr_proc_cd']) {
        //   // なかったらfilterかけずに表示
        //   masterPGs.pgManufacture.dataView.refresh();
        // } else {
        //   masterPGs.pgManufacture.columnFilters['mn_cd'] = record['ppr_proc_cd'];
        //   masterPGs.pgManufacture.dataView.refresh();
        // }
        break;
      case 'parrangement':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Parrangement });
      break;
    case 'inspectionitem':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Inspectionitem });
      break;
    case 'transportcompany':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Transportcompany });
      break;
    case 'wire':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Wire });
      break;
    case 'packing':
      $('div#tabs-master')['tabs']({ 'active': MASTERTABS.Packing });
      break;
    default:
      return null;
  }
  showMasterDialog();
  return;
}

/**
 * マスタ一覧画面を表示する
 */
function showMasterDialog() {
  $('#dialog-code')['dialog']('open');
  Object.keys(masterPGs).forEach(function (elem) {
    masterPGs[elem].redraw();
  });
}


function showStockViewDialog() {
  $('#dialog-stockview')['dialog']('open');
  changeStockViewCategory('crimp');
  Object.keys(stockPGs).forEach((elem) => {
    stockPGs[elem].redraw();
  })
}

/**
 * 指定の在庫データを抽出する。
 */
 function showDetailStockDialog(page, activeRow) {
  // どの在庫タブが開かれているか
  let activeTab = page.divId;
  let tabNo = '';
  let pg = detailStockPGs.pgDTWIRE;
  let category = 'WR';

  $('#dialog-detailstock')['dialog']('open');
  Object.keys(detailStockPGs).forEach((elem) => {
    let stPG = detailStockPGs[elem];
    stPG.redraw();
  })

  switch (activeTab.substr(0, 2)) {
    case 'CR':
      tabNo = DETAILSTOCKTABS.DTCRIMP;
      pg = detailStockPGs.pgDTCRIMP;
      if (activeTab.substr(-3) === 'SUS') {
        category = 'CRSUS';
      } else if (activeTab.substr(-3) === 'MZN') {
        category = 'CRMZN';
      } else {
        alert('詳細データを取得出来ませんでした。');
        return;    
      }
      break;
    case 'WR':
      tabNo = DETAILSTOCKTABS.DTWIRE;
      pg = detailStockPGs.pgDTWIRE;
      break;
    case 'MT':
      tabNo = DETAILSTOCKTABS.DTMATERIAL;
      pg = detailStockPGs.pgDTMATERIAL;
      category = 'MT';
      break;
    default:
      activeTab = '';
  }
  if (activeTab === '') {
    alert('詳細データを取得出来ませんでした。');
    return;
  }

  $('div#tabs-detailstock').tabs({
    active: tabNo,
  }); 

  readDetailStock(pg, category, activeRow);

}
/**
 * マスタ画面ダイアログで指定されたコードをメイン画面のグリッドに転記する
 */
function inputSelectedCode() {
  var pgActive = getActiveEditPG();//getActiveMainPG();
  var pgMaster = getActiveMasterPG();
  var activeCellEdit = pgActive.grid.getActiveCell();
  var activeCellMaster = pgMaster.grid.getActiveCell();
  var pgSettingActive = getActiveSettingPG();  
  var activeSettingCellEdit = pgSettingActive.grid.getActiveCell();

  // メイン画面やマスタ画面での指定先セルが適切でない場合には代入しない
  if ((!activeCellEdit && !activeSettingCellEdit) || !activeCellMaster) {
    return;
  }
    
  if (activeSettingCellEdit) {
    pgActive = pgSettingActive;
    activeCellEdit = activeSettingCellEdit;
  }

  var destEditor = pgActive.grid.getColumns()[activeCellEdit.cell].editor;
  var itemMaster = pgMaster.dataView.getItem(activeCellMaster.row);
  var itemActive = pgActive.dataView.getItem(activeCellEdit.row);
  var fieldMaster = pgMaster.grid.getColumns()[activeCellMaster.cell].field;
  var fieldActive = pgActive.grid.getColumns()[activeCellEdit.cell].field;

  if (!destEditor || destEditor === DisabledTextEditor || destEditor === SelectCellEditor || !activeCellMaster ||
    !itemMaster || !itemActive || fieldActive === 'isDeleted' || fieldMaster === 'isDeleted' ) {
    return;
  }
  // 選択されているマスタによって、戻り値を指定する
  switch (pgMaster.divId) {
    case 'Customer':
      itemActive[fieldActive] = itemMaster['C_CUSTOMER_CD'];
      break;
    case 'Customerpost':
      itemActive[fieldActive] = itemMaster['CP_POST_CD'];
      break;
    case 'User':
      itemActive[fieldActive] = itemMaster['USER_CD'];
      break;
    case 'Product':
      itemActive[fieldActive] = itemMaster['p_cd'];
      break;
    case 'Packing':
      itemActive[fieldActive] = itemMaster['pkg_cd'];
      break;
    case 'Warehouse':
      itemActive[fieldActive] = itemMaster['w_cd'];
      break;
    case 'Customercharge':
      itemActive[fieldActive] = itemMaster['CC_CHARGE_CD'];
      break;
    case 'Manufacture':
      itemActive[fieldActive] = itemMaster['mn_content_cd'];
      break;
    case 'Process':
      itemActive[fieldActive] = itemMaster['pc_cd'];
      break;
    case 'Inspectionitem':
      itemActive[fieldActive] = itemMaster['ini_cd'];
      break;
    case 'Mold':
      itemActive[fieldActive] = itemMaster['ml_cd'];
      break;
    default:
      itemActive[fieldActive] = itemMaster[fieldMaster];
  }
  // マスタ画面での指定値を代入
  // itemActive[fieldActive] = itemMaster[fieldMaster];
  itemActive['isDirty'] = true;
  pgActive.dataView.updateItem(itemActive['id'], itemActive);
  //pgActive.grid.gotoCell(activeCellEdit.row, activeCellEdit.cell, true);
  //Slick.GlobalEditorLock.commitCurrentEdit();
}


/***
 * 在庫画面の選択レコードを元の画面にセット。F1キー押下後処理
 */
function inputSelectedItemStock(mode) {
  const STOCK_SUMMARY = 1;
  const STOCK_DETAIL = 2;
  let itemActive = [];

  // 他の編集画面からの呼び出しではない場合は、F1キーを無視
  const callGrid = getActiveEditSTPG();
  if (!callGrid) { 
    return; 
  }

  // どの在庫画面か確認 詳細画面でなければはじく
  const stPG = checkOpenGrid(mode)
  if (stPG === false) {
    return;
  }

  // 在庫画面のデータ取得
  const activeCellStockView = stPG.grid.getActiveCell(); 
  let activeIndex = activeCellStockView ? activeCellStockView.row : 0;
  let itemStockView = stPG.dataView.getItem(activeIndex);

  const placeCD = itemStockView['placecd'];
  const productCD = itemStockView['productcd'];
  const psupple = itemStockView['psupple'];
  const lotno = itemStockView['lotno'];
  const unitTran = itemStockView['unitname'];
  const subjectCD = itemStockView['subjectcd'] ? itemStockView['subjectcd'] : '';
  const parrangementCD = itemStockView['parrangementcd'] ? itemStockView['parrangementcd'] : '';
  const sub01 = itemStockView['sub01'] ? itemStockView['sub01'] : '';
  const sub02 = itemStockView['sub02'] ? itemStockView['sub02'] : '';
  const sub03 = itemStockView['sub03'] ? itemStockView['sub03'] : '';
  const sub04 = itemStockView['sub04'] ? itemStockView['sub04'] : '';
  const sub05 = itemStockView['sub05'] ? itemStockView['sub05'] : '';
  const sub06 = itemStockView['sub06'] ? itemStockView['sub06'] : '';
  const sub07 = itemStockView['sub07'] ? itemStockView['sub07'] : '';
  const sub08 = itemStockView['sub08'] ? itemStockView['sub08'] : '';
  const sub09 = itemStockView['sub09'] ? itemStockView['sub09'] : '';
  const sub10 = itemStockView['sub10'] ? itemStockView['sub10'] : '';
  const sub11 = itemStockView['sub11'] ? itemStockView['sub11'] : '';
  const sub12 = itemStockView['sub12'] ? itemStockView['sub12'] : '';
  const sub13 = itemStockView['sub13'] ? itemStockView['sub13'] : '';
  const makerCD = itemStockView['makerCD'] ? itemStockView['makerCD'] : '';
  const planNum = isSet(itemStockView['plannum']) ? itemStockView['plannum'] : 0;

  // activerecordの現在数量取得
  setGridToPlanNum(stPG);

  // 呼出側の選択カラム
  const activeCellCall = callGrid.grid.getActiveCell();

  activeIndex = activeCellCall ? activeCellCall.row : 0;
  itemActive = callGrid.dataView.getItem(activeIndex);

  itemActive['stc_place_cd'] = placeCD;
  itemActive['productcd'] = productCD;
  itemActive['stc_product_supple'] = psupple;
  itemActive['stc_qty_trans'] = '';
  itemActive['stc_unit_tran'] = unitTran;
  itemActive['stc_type_04'] = lotno;
  itemActive['stc_sub_01'] = sub01;
  itemActive['stc_sub_02'] = sub02;
  itemActive['stc_sub_03'] = sub03;
  itemActive['stc_sub_04'] = sub04;
  itemActive['stc_sub_05'] = sub05;
  itemActive['stc_sub_06'] = sub06;
  itemActive['stc_sub_07'] = sub07;
  itemActive['stc_sub_08'] = sub08;
  itemActive['stc_sub_09'] = sub09;
  itemActive['stc_sub_10'] = sub10;
  itemActive['stc_sub_11'] = sub11;
  itemActive['stc_sub_12'] = sub12;
  itemActive['stc_sub_13'] = sub13;
  itemActive['stc_type_04'] = lotno;
  itemActive['stc_type_subject'] = subjectCD;
  itemActive['stc_parrangement_cd'] = parrangementCD;
  itemActive['stc_maker_cd'] = makerCD;

  // 現在数量をセットする
  let remainQty = 0;
  const length = isSet(itemStockView['sumqty']) ? itemStockView['sumqty'] : 0;
  const qty = isSet(itemStockView['qty']) ? itemStockView['qty'] : 0;
  if (length === 0 && qty > 0){
    remainQty = qty -  planNum;
  } else {
    remainQty = length - planNum;
  }
    
  itemActive['stc_qty_trans'] = remainQty;
  itemActive['assignqty'] = itemActive['stc_qty_trans'];
  
  itemActive['isDirty'] = true;
  callGrid.dataView.updateItem(itemActive['id'], itemActive);

  if (mode === STOCK_DETAIL) {
    $('#dialog-detailstock')['dialog']('close');
  } 
  $('#dialog-stockview')['dialog']('close');
  
  return;

}

/***
 * 開いている在庫タブを確認
 */
function checkOpenGrid(mode) {
  const STOCK_DETAIL = 2;
  const STOCK_SUMMARY = 1;
  let stPG = null;

  // 開いている画面がどちらかチェック
  if (mode === STOCK_DETAIL) {
    stPG = getActiveStockDetailPG();
  } else if (mode === STOCK_SUMMARY) {
    stPG = getActiveStockPG();
  } else {
    return false;
  }

  // 集計画面の場合は除外する
  let str = stPG.divId.substr(0, 2);
  let str2 = stPG.divId.substr(0, 5);
  if (str === 'CR' && str2 === 'CR15M') {
    return false;  
  }
  if (str === 'WR' || str === 'MT') {
    return false;
  }

  return stPG; 

}


/***
 * 在庫画面から、activeな編集画面へデータ移行
 * mode 1:まとめ画面、2:詳細画面
 */
function inputSelectedStockViewRecord(stGrid) {
  // セット先のデータを取得
  let activeIndex = 0;
  let itemActive = null;
  let pgActive = getActiveEditSTPG(); 
  let activeCellEdit = pgActive.grid.getActiveCell();

  // セット元のデータを取得
  let activeCellStockView = stGrid.grid.getActiveCell();

  if (!pgActive) {
    // 参照で開いてない場合は、そのまま閉じる。
    return;
  }

  if (!activeCellStockView) {
    alert('行を選択してください。');
    return true;
  }

  // 選択行データを取得
  let itemStockView = stGrid.dataView.getItem(activeCellStockView.row);
  
  // セット先のアクティブレコードデータ取得
  if (!activeCellEdit) {
    activeIndex = 0;
  } else {
    activeIndex = activeCellEdit.row;
  }
  itemActive = pgActive.dataView.getItem(activeIndex);
  if (itemActive == null) {
    return;
  }

  // activerecordの現在数量取得
  setGridToPlanNum(pgActive);
  

  // 各フィールドを固定で指定
  // 詳細の場合も、集計結果の数量を渡してやる必要がある。
  itemActive['stc_place_cd'] = itemStockView['placecd'];
  itemActive['productcd'] = itemStockView['pcd'];
  itemActive['stc_product_supple'] = itemStockView['psupple'];
  itemActive['stc_type_04'] = itemStockView['lotno'];
  itemActive['stc_unit_tran'] = itemStockView['unitname'];
  itemActive['sub01'] = itemStockView['sub01'] ? itemStockView['sub01'] : '';
  itemActive['sub02'] = itemStockView['sub02'] ? itemStockView['sub02'] : '';
  itemActive['sub03'] = itemStockView['sub03'] ? itemStockView['sub03'] : '';
  itemActive['sub04'] = itemStockView['sub04'] ? itemStockView['sub04'] : '';
  itemActive['sub05'] = itemStockView['sub05'] ? itemStockView['sub05'] : '';
  itemActive['sub06'] = itemStockView['sub06'] ? itemStockView['sub06'] : '';
  itemActive['sub07'] = itemStockView['sub07'] ? itemStockView['sub07'] : '';
  itemActive['sub08'] = itemStockView['sub08'] ? itemStockView['sub08'] : '';
  itemActive['sub09'] = itemStockView['sub09'] ? itemStockView['sub09'] : '';
  itemActive['sub10'] = itemStockView['sub10'] ? itemStockView['sub10'] : '';
  itemActive['sub11'] = itemStockView['sub11'] ? itemStockView['sub11'] : '';
  itemActive['sub12'] = itemStockView['sub12'] ? itemStockView['sub12'] : '';
  itemActive['sub13'] = itemStockView['sub13'] ? itemStockView['sub13'] : '';  
  itemActive['subjectcd'] = itemStockView['subjectcd'] ? itemStockView['subjectcd'] : '';
  itemActive['parrangementcd'] = itemStockView['parrangementcd'] ? itemStockView['parrangementcd'] : '';
  itemActive['psupple'] = itemStockView['psupple'] ? itemStockView['psupple'] : '';
  itemActive['lotno'] = itemStockView['lotno'] ? itemStockView['lotno'] : '';

  // 現在数量をセットする
  if (!isSet(itemStockView['plannum'])) {
    itemStockView['plannum'] = 0;
  } 

  let transQty = 0;
  // if (isSet(itemStockView['qty'])) {
  //   transQty = parseInt(itemStockView['qty']) - parseInt(itemStockView['plannum']);
  // } else if () {
  //   transQty = parseInt(itemStockView['qty']) - parseInt(itemStockView['plannum']);
  // }

  itemActive['stc_qty_trans'] = itemStockView['sumqty'] - itemStockView['plannum'];
  
  itemActive['isDirty'] = true;
  pgActive.dataView.updateItem(itemActive['id'], itemActive);

}

/**
 * メイン画面で表示中のマスタに相当するPlannerGridを返す。
 * @return {PlannerGrid} 表示中のPlannerGrid
 */
function getActiveMainPG() {
  switch ($('div#tabs')['tabs']('option', 'active')) {
    case MAINTABS.Prodplans:
      return mainPGs.pgProdplans;
    // case MAINTABS.Shipplans:
    //   return mainPGs.pgShipplans;
    case MAINTABS.ED:
      return mainPGs.pgED;
    // case MAINTABS.LP:
    //   return mainPGs.pgLP;
    // case MAINTABS.MOED:
    //   return mainPGs.pgMOED;
    case MAINTABS.MOD:
      return mainPGs.pgMOD;
    // case MAINTABS.OOED:
    //   return mainPGs.pgOOED;
    case MAINTABS.OOD:
      return mainPGs.pgOOD;
    case MAINTABS.SD:
      return mainPGs.pgSD;
    case MAINTABS.BD:
      return mainPGs.pgBD;
    // case MAINTABS.ST:
    //   return mainPGs.pgST;
    // case MAINTABS.STOR:
    // return mainPGs.pgStorages;
    default:
      return null;
  }
}

/**
 * 編集画面で表示中のマスタに相当するPlannerGridを返す。
 * @return {PlannerGrid} 表示中のPlannerGrid
 */
function getActiveEditPG() {
  var activeTab = $('div#tabs-insert')['tabs']('option', 'active');
  var currentPG = null;
  Object.keys(editPGs).forEach(function (elem) {
    /** @type {PGHeaderDetail} */
    var ePG = editPGs[elem];
    if (activeTab === Number(ePG.d.div.data('pagecnt'))) {
      currentPG = ePG.d.isEditing ? ePG.d : ePG.h;
    }
  });
  if (!('#dialog-calc-prodplan')[0].hidden) {
    // もし金網計算画面が表示されていたら、ヘッダ１が編集されているときのみ、マスタダイアログを表示する
    if (calcPGs.pgProdMold.h1.isEditing) {
      currentPG = calcPGs.pgProdMold.h1;
    }
  }
  return currentPG;
}

function getActiveSettingPG() {
  let activeTab = $('div#tabs-setting')['tabs']('option', 'active');
  let currentPG = null;

  Object.keys(settingPGs).forEach((elem) => {
    let ePG = settingPGs[elem];
    currentPG = ePG;
  })
  return currentPG;
}

// function getActiveCalcPG() {
//   let currentPG = null;
//   // 計算ダイアログが開いているか
//   if ($('#dialog-calc-prodplan')['dialog']('isOpen')) {
//     Object.keys(calcPGs).forEach((elem) => {
//       let ePG = calcPGs[elem];
//       currentPG = ePG;
//     })
//   }
//   return currentPG;
// }


/**
 * 在庫画面呼出画面判定
 * @returns 開いているGrid
 */
function getActiveEditSTPG() {
  let currentPG = null;

  if ($('div#tabs-insert-EditSTPProduce').is(':visible')) {
    currentPG = editPGs.pgSTPProduce.d;

  } else if ($('div#tabs-insert-EditSTPReceive').is(':visible')) {
    currentPG = editPGs.pgSTPReceive.d;    

  } else if ($('div#tabs-checkdat-Assignstock').is(':visible')) {
    currentPG = checkdatPGs.pgAssignstock;

  } else if ($('div#tabs-checkdat-ManufacturingUse').is(':visible')) {
    currentPG = checkdatPGs.pgManufacturingUse;

  }

  return currentPG;
}

/**
 * ウィンドウ画面で表示中のマスタに相当するPlannerGridを返す。
 * @return {PlannerGrid} 表示中のPlannerGrid
 */
function getActiveMasterPG() {
  var activeTab = $('div#tabs-master')['tabs']('option', 'active');
  var currentPG = null;
  Object.keys(masterPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    var mPG = masterPGs[elem];
    if (activeTab === Number(mPG.div.data('pagecnt'))) {
      currentPG = mPG;
    }
  });
  return currentPG;
}


/***
 * 在庫画面のアクティブなタブを取得
 */
function getActiveStockPG() {
  let activeCategory = $('#tabs-stockview')['tabs']('option', 'active');
  let activeTab = 0;
  let currentCategoryStr = 'CR';
  let currentPG = null;

  for (let i = 0; i < STOCKCATEGORY.length; i++) {
    if (i === activeCategory) {
      activeTab = $('#tabs-stockview-' + STOCKCATEGORY[i])['tabs']('option', 'active');
      switch (i) {
        case 0:
          currentCategoryStr = 'CR';
          break;
        case 1:
          currentCategoryStr = 'WV';
          break;
        case 2:
          currentCategoryStr = 'WD';
          break;
        case 3:
          currentCategoryStr = 'WR';
          break;
        case 4:
          currentCategoryStr = 'MT';
          break;
        default:
          currentCategoryStr = 'CR';
      }
    }
  }
  
  Object.keys(stockPGs).forEach((elem) => {
    let stPG = stockPGs[elem];
    if (String(elem).substring(2, 4) === currentCategoryStr) {
      if (activeTab === Number(stPG.div.data('pagecnt'))) {
        currentPG = stPG;
      }
    }
  });

  return currentPG;
}


/***
 * 在庫詳細画面でどの画面が開かれているか取得
 */
function getActiveStockDetailPG() {
  let activeTab = $('#tabs-detailstock')['tabs']('option', 'active');
  let currentCategoryStr = '';
  let currentPG = null;

  Object.keys(detailStockPGs).forEach(function (elem) {
    /** @type {PlannerGrid} */
    let stPG = detailStockPGs[elem];
    if (activeTab === Number(stPG.div.data('pagecnt'))) {
      currentPG = stPG;
    }
  });
  return currentPG;

}



/**
 * 新規データを追加する
 * @param {PlannerGrid} pgMain メイン画面のグリッド
 * @param {PlannerGrid} pgEditHeader 編集画面のグリッド(ヘッダ)
 * @param {PlannerGrid} pgEdit 編集画面のグリッド(明細)
 */
function editData(pgMain, pgEditHeader, pgEdit) {
  var activeRow = pgMain.getActiveRow();
  if (!activeRow) {
    window.alert('編集対象とする行を選択してください。');
    return;
  }
  var cols = pgMain.grid.getColumns();
  var detailRows = pgMain.dataView.getItems().filter(function (elem) {
    var isDetail = true;
    cols.forEach(function (c) {
      if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
        isDetail = false;
      }
    });
    if (isDetail) {
      return true;
    } else {
      return false;
    }
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
  var editActiveRow = [Object.assign({}, activeRow)];
  var editDetailRows = [];
  detailRows.forEach(function (elem) {
    editDetailRows.push(Object.assign({}, elem));
  });
  pgEditHeader.setItemsAndRefresh(editActiveRow);
  pgEdit.setItemsAndRefresh(editDetailRows);
  // ヘッダの集計結果を追加
  if (pgEditHeader === editPGs.pgED.h) {
    // 見積
    if (('e_sum_area' in activeRow) === false) {
      activeRow['e_sum_area'] = setHeaderSUM('ed_sub_num_01', pgEdit.grid, pgEdit.dataView);
    }
    if (('e_sum_price' in activeRow) === false) {
      activeRow['e_sum_price'] = setHeaderSUM('ed_price', pgEdit.grid, pgEdit.dataView);
    }
    // if ('ed_cost' in elem) {
    //   if (activeRow['ed_cost'] > 0) {
    //     activeRow['ed_unit_price'] = activeRow['ed_cost'];
    //   } 
    // }
  } else if (pgEditHeader === editPGs.pgSD.h) {
    // 納品
    if (('s_sum_price' in activeRow) === false) {
      activeRow['s_sum_price'] = setHeaderSUM('sd_delivery_price', pgEdit.grid, pgEdit.dataView);
    }
  }
  let num = getMainTabNo(pgMain);
  displayInsertForm(num);
}

/**
 * 複数行データを追加する
 * @param {PlannerGrid} pgMain メイン画面のグリッド
 * @param {PlannerGrid} pgEditHeader 編集画面のグリッド(ヘッダ)
 * @param {PlannerGrid} pgEdit 編集画面のグリッド(明細)
 */
function editBundleData(pgMain, pgEditHeader, pgEdit) {
  var activeRows = [];
  var cols = pgMain.grid.getColumns();
  var rowsData = pgMain.dataView.getItems();
  var nIndex = pgMain.grid.getSelectedRows();
  var editDetailRows = [];
  // pgMain.pgProdplans.checkboxSelector.getColumnDefinition()
  // cols.shift();
  // rowsData.shift();
  for (var i = 0; i < nIndex.length; i++) {
    activeRows.push(rowsData[nIndex[i]]);
  }

  if (!activeRows) {
    window.alert('編集対象とする行を選択してください。');
    return;
  }
  // gridの設定
  var detailRows = activeRows.filter(function (elem) {
    var isDetail = true;
    cols.forEach(function (c) {
      if (c['isHeaderPK'] && elem[c['field']] !== rec[c['field']]) {
        isDetail = false;
      }
    });
    if (isDetail) {
      return true;
    } else {
      return false;
    }
  })
  detailRows.forEach(function (elem) {
    editDetailRows.push(Object.assign({}, elem));
  })
  pgEdit.columns.shift();
  // pgEdit.d.columns.shift();

  pgEdit.columns.unshift(pgEdit.checkboxSelector.getColumnDefinition());

  pgEditHeader.setItemsAndRefresh(activeRows);
  let num = getMainTabNo(pgMain);
  pgEdit.setItemsAndRefresh(editDetailRows);
  displayInsertForm(num);
}

/**
 * 新規データを追加する
 * @param {PlannerGrid} pgMain メイン画面のグリッド
 * @param {PlannerGrid} pgEditHeader 編集画面のグリッド(ヘッダ)
 * @param {PlannerGrid} pgEdit 編集画面のグリッド(明細)
 */
function insertNewData(pgMain, pgEditHeader, pgEdit) {
  // ヘッダーデータ
  let dataD = pgEditHeader.dataView.getItems();
  // 明細初期値セット 300行固定
  let data = [];
  for (let i = 0; i < 300; i++) {
    switch (pgMain) {
      case mainPGs.pgProdplans:
        data[i] = {
          'id': i + 1,
          'pd_prod_plan_sub_no': ('000' + (i + 1)).slice(-3),
          'isDirty': false,
          'isNewRow': false,
        };
        break;
      case mainPGs.pgED:
        data[i] = {
          'id': i + 1,
          'ed_estimate_sub_no': ('000' + (i + 1)).slice(-3),
          'ed_prod_plan_sign': '0',
          'w_name': '-',
          'isDirty': false,
          'isNewRow': false,
          // デフォルト値をセット
          'ed_type_04': '0',
          'ed_sub_06': 'mm',
          // 'ed_unit_tran': '枚',
          // 'ed_p_cd': master['product'][Math.trunc(Math.random() * master['product'].length)],
        };
        break;
      case mainPGs.pgMOD:
      case mainPGs.pgOOD:
        data[i] = {
          'id': i + 1,
          'moed_order_no': dataD['moed_order_no'],
          'moed_sub_no': ('000' + (i + 1)).slice(-3),
          'moed_accept_sub_no': '01',
          // 'moed_type_04': '0',    
          // 'moed_inventory_type': '1',
          'isDirty': false,
          'isNewRow': true,
        };
        break;
      default:
        data[i] = {
          'id': i + 1,
        };
    }
  }
  // ヘッダ初期値セット
  let datH = [];
  let num = 0;
  let usercd = document.getElementById('login-user').textContent;
  switch (pgEditHeader) {
    case editPGs.pgProdplans.h:
      getProdPlanNo().done((dat) => {
        const prodPlanNo = JSON.parse(dat);
        datH[0] = {
          'id': 1, 
          'pd_prod_plan_no': prodPlanNo,
          'isNewRow': true,
        };
        pgEditHeader.setItemsAndRefresh(datH);
        pgEdit.setItemsAndRefresh(data);
        num = getMainTabNo(pgMain);
        displayInsertForm(num);
      });
      break;
    case editPGs.pgED.h:
      datH[0] = {
        'id': 1, 
        'e_salesman_cd': usercd,
        'e_logo_01': 'STONE', 
        'isNewRow': true,
      };
      pgEditHeader.setItemsAndRefresh(datH);
      pgEdit.setItemsAndRefresh(data);
      num = getMainTabNo(pgMain);
      displayInsertForm(num);
      break; 
    case editPGs.pgMOD.h:
    case editPGs.pgOOD.h:
      // data_statusは0が新規登録、1が更新
      datH[0] = {
        'id': 1, 
        'moed_order_no': dataD['moed_order_no'], 
        'moed_salesman_cd': usercd,
        'isNewRow': true,
        'moed_data_status': ('moed_data_status' in dataD) ? dataD['moed_data_status'] : '0',
      };
      pgEditHeader.setItemsAndRefresh(datH);
      pgEdit.setItemsAndRefresh(data);
      num = getMainTabNo(pgMain);
      displayInsertForm(num);
      break;
    default:
      pgEditHeader.setItemsAndRefresh([{ 'id': 1, 'isNewRow': true }]);
      pgEdit.setItemsAndRefresh(data);
      num = getMainTabNo(pgMain);
      displayInsertForm(num);
  }


  // if (pgEditHeader === editPGs.pgMOD.h || pgEditHeader === editPGs.pgOOD.h) {
  //   pgEditHeader.setItemsAndRefresh(datH);
  //   pgEdit.setItemsAndRefresh(data);
  //   displayInsertForm();
  // } else {
  //   pgEditHeader.setItemsAndRefresh([{ 'id': 1, 'isNewRow': true }]);
  //   pgEdit.setItemsAndRefresh(data);
  //   displayInsertForm();
  // }
}

/**
 * 開いているメインタブの設定番号取得 データ編集画面表示用
 * @param {*} pg 
 */
function getMainTabNo(pg) {
  switch (pg) {
    case mainPGs.pgProdplans:
      return MAINTABS.Prodplans;
    case mainPGs.pgED:
      return MAINTABS.ED;
    case mainPGs.pgSD:
      return MAINTABS.SD;
    case mainPGs.pgMOD:
      return MAINTABS.MOD;
    case mainPGs.pgOOD:
      return MAINTABS.OOD;
    case mainPGs.pgBD:
      return MAINTABS.BD;
    case mainPGs.pgSTPlan:
      return MAINTABS.STPlan;
    case mainPGs.pgST:
      return MAINTABS.ST;
    default:
      return 1;
  }
}

/**
 * データ編集画面を表示する
 */
function displayInsertForm(activePG) {
  // 指定された昨日のタブ順番を指定し、どの子画面かを上から指定できるように変更
  let activeTab = '';
  if (isSet(activePG)) {
    activeTab = activePG;
  } else {
    activeTab = $('div#tabs')['tabs']('option', 'active');
  }
  // 開いている機能一覧を番号でのみ取得できるため。
  // 発注画面の子画面の検収と入庫画面の分タブの番号を加算してやり、発注画面以降の編集画面を表示してやる
  // if (activeTab > 3) {
  //   activeTab += 2;
  // }
  activateInsertTab(activeTab);
  showInsertDialog();
  return;
}

/**
 * データ編集画面の指定タブを表示する
 * @param {number} activeTab 表示タブ番号
 */
function activateInsertTab(activeTab) {
  $('div#tabs-insert')['tabs']({
    'beforeActivate': function (event, ui) { },
  });
  $('div#tabs-insert')['tabs']({ 'active': activeTab });
  $('div#tabs-insert')['tabs']({
    'beforeActivate': function (event, ui) {
      event.preventDefault();
    },
  });
}

/**
 * マスタ一覧画面を表示する
 */
function showInsertDialog() {
  $('#dialog-insert')['dialog']('open');
  Object.keys(editPGs).forEach(function (elem) {
    editPGs[elem].d.redraw();
    editPGs[elem].h.redraw();
  });
  $('.slick-viewport').scrollTop(0);
  $('.slick-viewport').scrollLeft(0);
}

/**
 * データ確認ダイアログを表示する
 * @param {number} page 表示するタブ
 */
function showCheckdatDialog(page) {
  $('div#tabs-checkdat')['tabs']({ 'active': page });
  $('#dialog-checkdat')['dialog']('open');
  Object.keys(checkdatPGs).forEach(function (elem) {
    checkdatPGs[elem].redraw();
  });
}

/**
 * 加工内容設定ダイアログ
 * @param {*} page 表示するタブ
 */
function showSettingDialog(page) {
  $('div#tabs-setting')['tabs']({ 'active': page });
  $('#dialog-setting')['dialog']('open');
  Object.keys(settingPGs).forEach(function (elem) {
    settingPGs[elem].redraw();
  });
}

/**
 * 表示する番号一覧画面の指定タブ（見積書、発注など）をアクティブ化する
 * @param {number} activeTab 表示タブ番号
 */
 function activateNumberListTab(activeTab) {
  $('div#tabs-number-list')['tabs']({
    'beforeActivate': function (event, ui) { },
  });
  $('div#tabs-number-list')['tabs']({ 'active': activeTab });
  $('div#tabs-number-list')['tabs']({
    'beforeActivate': function (event, ui) {
      event.preventDefault();
    },
  });
}

/***
 * 部分検収
 */
function editDataAccept(pgMain, pgEditHeader, pgEdit) {
  var activeRow = pgMain.getActiveRow();
  if (!activeRow) {
    window.alert('編集対象とする行を選択してください。');
    return;
  }
  var cols = pgMain.grid.getColumns();
  var detailRows = pgMain.dataView.getItems().filter(function (elem) {
    var isDetail = true;
    cols.forEach(function (c) {
      if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
        isDetail = false;
      }
    });
    if (isDetail) {
      return true;
    } else {
      return false;
    }
  });
  var editActiveRow = [Object.assign({}, activeRow)];
  var editDetailRows = [];
  detailRows.forEach(function (elem) {
    // 検収済みデータは省く
    if (!isSet(elem['moed_accept_date'])) {
      // 未検収のみ表示
      editDetailRows.push(Object.assign({}, elem));
    }
  });
  if (editDetailRows.length === 0) {
    alert('該当発注データは検収済みです。')
    return;
  }
  pgEditHeader.setItemsAndRefresh(editActiveRow);
  pgEdit.setItemsAndRefresh(editDetailRows);
  var activeTab = $('div#tabs')['tabs']('option', 'active') + 1;
  // タブインデックス指定で部分検収画面を表示させる
  activateInsertTab(activeTab);
  showInsertDialog();
}

/***
 * 発注画面からの入庫画面
 */
function editDataStored(pgMain, pgEditHeader, pgEdit) {
  // 元々は選択行が対象行になるが、チェックが入った行が対象行と勘違いするUIなので、チェックが入った行を優先対象とする。
  let activeRow = [];
  let nTabNo = 0;
  let cols = [];
  let editActiveRow = [];
  let editDetailRows = [];

  const rowsData = pgMain.grid.getData().getFilteredItems();
  const nIndex = pgMain.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  })
  let selectedRows = [];
  for (var i = 0; i < nIndex.length; i++) {
    if (rowsData.length < nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    if ((i > 0) && (selectedRows[0]['moed_order_no'] !== rowsData[nIndex[i]]['moed_order_no'])) {
      // 異なる発注番号入ったらはじく
      alert('入庫報告は、1つの発注番号が対象です。1つの発注番号にして下さい。');
      return;
    }
    selectedRows.push(rowsData[nIndex[i]]);
  }

  if (selectedRows.length > 0) {
    // チェック行があった場合はそちら優先
    editActiveRow.push(Object.assign({}, selectedRows[0]));
    selectedRows.forEach(function (elem) {
      // 未検収のみ表示
      editDetailRows.push(Object.assign({}, elem));
    });
  } else {
    activeRow = pgMain.getActiveRow();
    // let nTabNo = 0;
    if (!activeRow) {
      window.alert('編集対象とする行を選択してください。');
      return;
    }
    cols = pgMain.grid.getColumns();
    let detailRows = pgMain.dataView.getItems().filter(function (elem) {
      var isDetail = true;
      cols.forEach(function (c) {
        if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
          isDetail = false;
        }
      });
      if (isDetail) {
        return true;
      } else {
        return false;
      }
    });
    editActiveRow = [Object.assign({}, activeRow)];
    // editDetailRows = [];
    detailRows.forEach(function (elem) {
      // 未検収のみ表示
      editDetailRows.push(Object.assign({}, elem));
    });
  }
  
  // var activeRow = pgMain.getActiveRow();
  // let nTabNo = 0;
  // if (!activeRow) {
  //   window.alert('編集対象とする行を選択してください。');
  //   return;
  // }
  // var cols = pgMain.grid.getColumns();
  // var detailRows = pgMain.dataView.getItems().filter(function (elem) {
  //   var isDetail = true;
  //   cols.forEach(function (c) {
  //     if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
  //       isDetail = false;
  //     }
  //   });
  //   if (isDetail) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // });
  // var editActiveRow = [Object.assign({}, activeRow)];
  // var editDetailRows = [];
  // detailRows.forEach(function (elem) {
  //   // 未検収のみ表示
  //   editDetailRows.push(Object.assign({}, elem));
  // });
  pgEditHeader.setItemsAndRefresh(editActiveRow);
  pgEdit.setItemsAndRefresh(editDetailRows);
  if (pgMain.divId === 'OOD') {
    nTabNo = 4;
  } else {
    nTabNo = 2;
  }
  var activeTab = $('div#tabs')['tabs']('option', 'active') + nTabNo;
  // タブインデックス指定で入庫画面を表示させる
  activateInsertTab(activeTab);
  showInsertDialog();
}


/**
 * 委託編集・検収画面のオープン
 * @param {*} pgMain 
 * @param {int} mode : 1は部分検収ボタン　0:は編集ボタンから遷移
 */
function editOrderDetails(pgMain, mode) {
  let activeTab = 0;
  let acptCnt = 0;
  let activeRow = [];
  let editActiveRow = [];
  let editDetailRows = [];

  const rowsData = pgMain.grid.getData().getFilteredItems();
  const nIndex = pgMain.grid.getSelectedRows();
  nIndex.sort(function (a, b) {
    return a - b;
  });
  let selectedRows = [];
  for (var i = 0; i < nIndex.length; i++) {
    if(mode !== '1') {
      // 部分検収時の未チェック有効
      break;
    }
    if (rowsData.length <= nIndex[i] ) {
      // チェック入れてからのデータ処理時、オブジェクトがない箇所を読み込むのを防ぐ
      break;
    }
    if ((i > 0) && (selectedRows[0]['moed_order_no'] !== rowsData[nIndex[i]]['moed_order_no'])) {
      // 異なる発注番号入ったらはじく
      alert('部分検収は、1つの発注番号が対象です。1つの発注番号にして下さい。');
      return;
    }
    selectedRows.push(rowsData[nIndex[i]]);
  }

  // if (!isSet(pgMain)) {
  //   // 行が表示されていなかった場合、戻る
  //   return;
  // }
  if (mode === '1' && selectedRows.length > 0) {
    // 部分検収かつ、チェック行があった場合はそちら優先
    // チェック行があった場合はそちら優先
    editActiveRow.push(Object.assign({}, selectedRows[0]));
    selectedRows.forEach(function (elem) {
      // 未検収のみ表示
      editDetailRows.push(Object.assign({}, elem));
    });
  } else {

    activeRow = pgMain.getActiveRow();
    if (!activeRow) {
      window.alert('編集対象とする行を選択してください。');
      return;
    }
    let cols = pgMain.grid.getColumns();
    let detailRows = pgMain.dataView.getItems().filter(function (elem) {
      let isDetail = true;
      cols.forEach(function (c) {
        if (c['isHeaderPK'] && elem[c['field']] !== activeRow[c['field']]) {
          isDetail = false;
        }
      });
      if (isDetail) {
        return true;
      } else {
        return false;
      }
    });
    editActiveRow = [Object.assign({}, activeRow)];
    editDetailRows = [];
    detailRows.forEach(function (elem) {
      editDetailRows.push(Object.assign({}, elem));
    });
  }

  for (let i = 0; i < editDetailRows.length; i++) {
    if (isSet(editDetailRows[i]['moed_accept_date'])) {
      acptCnt++;
    }
  }

  // 発注済み及び、検収済みは検収用画面へ遷移　未発注かつ未検収の場合は編集画面
  if (mode === '1') {
    // 部分検収ボタンから遷移
    if (acptCnt === editDetailRows.length) {
      // 検収済みデータの部分検収は不可
      alert('既に検収されています。');
      return;
    }
    if (pgMain.divId === 'MOD') {          
      editPGs.pgAT.h.setItemsAndRefresh(editActiveRow);
      editPGs.pgAT.d.setItemsAndRefresh(editDetailRows);
      activeTab = MAINTABS.MOD + 1;
    }
    if (pgMain.divId === 'OOD') {
      editPGs.pgAOO.h.setItemsAndRefresh(editActiveRow);
      editPGs.pgAOO.d.setItemsAndRefresh(editDetailRows);
      activeTab = MAINTABS.OOD + 1;
    }
  } else {
    // 編集ボタンから遷移
    if (isAcceptSheet(pgMain)) {
      // 検収済み
      // if (isOrderSheetMain(pgMain)) {
      //　注文書発行済み
      if (pgMain.divId === 'MOD') {
        editPGs.pgAT.h.setItemsAndRefresh(editActiveRow);
        editPGs.pgAT.d.setItemsAndRefresh(editDetailRows);
        activeTab = MAINTABS.MOD + 1;
      }
      if (pgMain.divId === 'OOD') {
        editPGs.pgAOO.h.setItemsAndRefresh(editActiveRow);
        editPGs.pgAOO.d.setItemsAndRefresh(editDetailRows);
        activeTab = MAINTABS.OOD + 1;
      }
    } else {
      if (pgMain.divId === 'MOD') {
        editPGs.pgMOD.h.setItemsAndRefresh(editActiveRow);
        editPGs.pgMOD.d.setItemsAndRefresh(editDetailRows);
        activeTab = MAINTABS.MOD;
      }
      if (pgMain.divId === 'OOD') {
        editPGs.pgOOD.h.setItemsAndRefresh(editActiveRow);
        editPGs.pgOOD.d.setItemsAndRefresh(editDetailRows);
        activeTab = MAINTABS.OOD;
      }
    }
  }
  // タブインデックス指定で部分検収画面を表示させる
  activateInsertTab(activeTab);
  showInsertDialog();
}


/***
 * 入出庫予定編集画面―在庫引当、製造使用予定画面
 * mode 'RECEIVE':在庫引当、'PROD':製造使用, 'DETAIL':詳細編集
 */
function editSTPlanDetails(pgMain, pgEditHeader, pgEdit, mode) {
  // 製造指示の場合は、フォームを開く前に、製造指示データかどうか確認させる。
  let items = [];
  let data = []; 
  let activeTab = MAINTABS.STPlan;
  let datH = [];
  let usercd = document.getElementById('login-user').textContent;


  if (mode === STPLAN_RECEIVE) {
    items = pgEditHeader.dataView.getItems();
    const today = WSUtils.getTodayString();
    // 300行固定で生成
    for (let i = 0; i < 300; i++) {
      // 伝票番号は未採番なので、画面表示時は0埋め11桁でデータ更新時に仮番号作成。
      data[i] = {
        'id': i + 1, 
        'stc_sub_no_02': ('000' + (i + 1)).slice(-3),
        'stc_sub_no_01': '0001',
        'isDirty': false,
        'isNewRow': true,
      };
    }
    datH[0] = {
      'id': 1,
      'stc_report_no': '00000000000',
      'stc_arrange_type': '515',
      'stc_report_date': today,
      'isNewRow': true,
    }
    
    activeTab = MAINTABS.STPlan + 2;

  } else if (mode === STPLAN_RECEIVE_DT) {
    items = pgMain.getActiveRow();
    if (items) {
      let editDetailRows = [];
      let cols = pgMain.grid.getColumns();
      data = pgMain.dataView.getItems().filter(function (elem) {
        var isDetail = true;
        cols.forEach(function (c) {
          if (c['isHeaderPK'] && elem[c['field']] !== items[c['field']]) {
            isDetail = false;
          }
        });
        if (isDetail) {
          return true;
        } else {
          return false;
        }
      });
      datH = [Object.assign({}, items)];
      data.forEach(function (elem) {
        editDetailRows.push(Object.assign({}, elem));
      });
    }

    activeTab = MAINTABS.STPlan + 2;

  } else if (mode === STPLAN_PRODUCE) {
    items = pgEditHeader.dataView.getItems();

    // 300行固定で生成
    for (let i = 0; i < 300; i++) {
      // 伝票番号は未採番なので、画面表示時は0埋め11桁でデータ更新時に仮番号作成。
      data[i] = {
        'id': i + 1, 
        'stc_sub_no_01': ('000' + (i + 1)).slice(-3),
        'isDirty': false,
        'isNewRow': true,
      };
    }
    datH[0] = {
      'id': 1,
      'stc_arrange_type': '610',
      // 'stc_report_date': today,
      'isNewRow': true,
    }    
    activeTab = MAINTABS.STPlan + 1;

  } else if (mode === STPLAN_PRODUCE_DT) {
    items = pgMain.getActiveRow();
    if (items) {
      let editDetailRows = [];
      let cols = pgMain.grid.getColumns();
      data = pgMain.dataView.getItems().filter(function (elem) {
        var isDetail = true;
        // 2023/2/8 選択した種別以外の明細データを先に省く
        if (items['stc_arrange_type'] !== elem['stc_arrange_type']) {
          isDetail = false;
        }
        cols.forEach(function (c) {
          if (c['isHeaderPK'] && elem[c['field']] !== items[c['field']]) {
            isDetail = false;
          }
        });
        if (isDetail) {
          return true;
        } else {
          return false;
        }
      });
      datH = [Object.assign({}, items)];
      data.forEach(function (elem) {
        editDetailRows.push(Object.assign({}, elem));
      });
    }
    const today = WSUtils.getTodayString();    
    activeTab = MAINTABS.STPlan + 1;

  } else {
    items = pgMain.getActiveRow();
    if (!items) {
      window.alert('編集対象とする行を選択してください。');
      return;
    }

    let editDetailRows = [];
    let cols = pgMain.grid.getColumns();
    data = pgMain.dataView.getItems().filter(function (elem) {
      var isDetail = true;
      cols.forEach(function (c) {
        if (c['isHeaderPK'] && elem[c['field']] !== items[c['field']]) {
          isDetail = false;
        }
      });
      if (isDetail) {
        return true;
      } else {
        return false;
      }
    });
    datH = [Object.assign({}, items)];
    data.forEach(function (elem) {
      editDetailRows.push(Object.assign({}, elem));
    });

    activeTab = MAINTABS.STPlan
  }
    

  

  pgEditHeader.setItemsAndRefresh(datH);
  pgEdit.setItemsAndRefresh(data);
  displayInsertForm(activeTab);

}


/***
 * 入出庫編集画面
 */
function editSTDetails(pgMain, pgEditHeader, pgEdit, mode = ST_ADJUST) {
  // 製造指示の場合は、フォームを開く前に、製造指示データかどうか確認させる。
  let items = [];
  let data = []; 
  let activeTab = MAINTABS.ST;
  let datH = [];
  let usercd = document.getElementById('login-user').textContent;


  if (mode === ST_ADJUST) {
    items = pgEditHeader.dataView.getItems();
    const today = WSUtils.getTodayString();
    // 300行固定で生成
    for (let i = 0; i < 300; i++) {
      // 伝票番号は未採番なので、画面表示時は0埋め11桁でデータ更新時に仮番号作成。
      data[i] = {
        'id': i + 1, 
        'stc_sub_no_01': '0001',
        'stc_sub_no_02': ('000' + (i + 1)).slice(-3),
        'isDirty': false,
        'isNewRow': true,
      };
    }
    datH[0] = {
      'id': 1,
      'stc_report_no': '00000000000',
      'stc_report_date': today,
      'isNewRow': true,
    }
    activeTab = MAINTABS.ST + 1;

  } else if (mode === ST_TRANSFER) {
    items = pgEditHeader.dataView.getItems();
    const today = WSUtils.getTodayString();
    // 300行固定で生成
    for (let i = 0; i < 300; i++) {
      // 伝票番号は未採番なので、画面表示時は0埋め11桁でデータ更新時に仮番号作成。
      data[i] = {
        'id': i + 1, 
        'stc_sub_no_01': ('000' + (i + 1)).slice(-4),
        'stc_sub_no_02': ('000' + (i + 1)).slice(-3),
        'isDirty': false,
        'isNewRow': true,
      };
    }
    datH[0] = {
      'id': 1,
      'stc_report_no': '00000000000',
      'stc_report_date': today,
      'isNewRow': true,
    }
    activeTab = MAINTABS.ST + 2;
  } else {
    items = pgEditHeader.dataView.getItems();
    const today = WSUtils.getTodayString();
    // 300行固定で生成
    for (let i = 0; i < 300; i++) {
      // 伝票番号は未採番なので、画面表示時は0埋め11桁でデータ更新時に仮番号作成。
      data[i] = {
        'id': i + 1, 
        'stc_sub_no_01': '0001',
        'stc_sub_no_02': ('000' + (i + 1)).slice(-3),
        'isDirty': false,
        'isNewRow': true,
      };
    }
    datH[0] = {
      'id': 1,
      'stc_report_no': '00000000000',
      'stc_report_date': today,
      'isNewRow': true,
    }
    activeTab = MAINTABS.ST + 2;
  }

  pgEditHeader.setItemsAndRefresh(datH);
  pgEdit.setItemsAndRefresh(data);
  displayInsertForm(activeTab);

}

/***
 * 出荷画面からの受注取消
 */
function cancelEstimateInheriting(rowData, option) {
  let dat = {
    'postdata': 'cancelEstimateInheriting',
    'sdatjson': JSON.stringify(rowData),
    'option': option,
  };
  return $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'db.php',
    'dataType': 'json',
    'data': dat,
  }).fail(function (jqXHR, textStatus, errorThrown) {
    alert('受注取消に失敗しました。');
  });
}


/***
 * QR検索　データセット
 */
function setQRData(item, mode) {
  // alert('きたよ');
  let searchWord = item;  
  // フィルタ検索
  if (mode === 'est') {
    // 見積画面
    mainPGs.pgED.columnFilters['e_estimate_no'] = searchWord;
    mainPGs.pgED.dataView.refresh();
  } else if ('moed') {
    // 発注画面
    mainPGs.pgMOD.columnFilters['moed_order_no'] = searchWord;
    mainPGs.pgMOD.dataView.refresh();
  } else if ('ood') {
    // 外注委託画面
    mainPGs.pgOOD.columnFilters['moed_order_no'] = searchWord;
    mainPGs.pgOOD.dataView.refresh();
  } else if ('sd') {
    // 出荷予定画面
    mainPGs.pgSD.columnFilters['sd_e_estimate_no'] = searchWord;
    mainPGs.pgSD.dataView.refresh();
  } else {
    // 画面指定なし=エラーが起こっているとき
    alert('エラーが発生しました');
    return;
  }
}


/**
 * 見積ファイル選択時処理
 * @param {*} e 
 */
 function readEstimateFiles(e) {
  let detailList = editPGs.pgED.d.dataView.getItems();
  const input = document.getElementById('fileid');
  const f = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    // エクセルの入力値を取得して格納
    // mod 2022/1/26 一覧表の項目名を参照していたのをフィールド名一致に変更。それに伴い、項目行を1行追加し、カウンターの初期値変更。 
    const itemList = [];
    for(let row = 2; row <= range.e.r; row++) {
      // for(let row = 1; row <= range.e.r; row++) {
      const itemObj = {};
      // エクセルの入力データを取得（2行目以降）=> 3行目以降に変更
      for (let col = range.s.c; col <= range.e.c; col++) {
        // カラムの設定値取得
        // const colAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const colAddress = XLSX.utils.encode_cell({ r: 1, c: col });
        const colCell = sheet[colAddress] || {};
        // const colName = colCell.w || colCell.v || '';
        const colField = colCell.w || colCell.v || '';

        // カラムの設定値取得
        const itemAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const itemCell = sheet[itemAddress] || {};
        const itemValue = itemCell.w || itemCell.v || '';

        // 見積編集画面の明細と一致するカラムを取得
        const matchedCol = editPGs.pgED.d.columns.find(function (elem, i) {
          // return elem['name'] === colName;
          return elem['field'] === colField;
        });
        if (matchedCol) {
          itemObj[matchedCol['id']] = itemValue;
        }

        // エクセル内の枝番を設定
        if (col === 0) {
          // 枝番取得
          const subNoAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
          const subNoCell = sheet[subNoAddress] || {};
          const subNoValue = subNoCell.w || subNoCell.v || '';
          itemObj['ed_estimate_sub_no'] = ('00' + subNoValue).slice(-3);;
        }
      }
      itemList.push(itemObj);
    }

    // ファイルデータの数値、文字列長チェック
    let validationMessage = '';
    itemList.forEach(function (elem) {
      // 数値チェック
      if (!WSUtils.isNumberXls(elem['ed_sub_01'])
        || !WSUtils.isNumberXls(elem['ed_sub_12'])
        || !WSUtils.isNumberXls(elem['ed_sub_02'])
        || !WSUtils.isNumberXls(elem['ed_sub_13'])
        || !WSUtils.isNumberXls(elem['ed_sub_04'])
        || !WSUtils.isNumberXls(elem['ed_sub_05'])
        || !WSUtils.isNumberXls(elem['ed_sub_08'])
        || !WSUtils.isNumberXls(elem['ed_sub_09'])
        || !WSUtils.isNumberXls(elem['ed_quantity'])
        || !WSUtils.isNumberXls(elem['ed_unit_price'])
        || !WSUtils.isNumberXls(elem['ed_cost'])
      ) {
        validationMessage = '数値の欄に文字が入っています。確認をお願いします。';
      }

      // 文字数チェック
      if (!WSUtils.validateStringLength(elem['ed_customer_order_no'], 40) 
        || !WSUtils.validateStringLength(elem['ed_customer_p_name'], 50)
      ) {
        validationMessage = '文字数オーバーです。確認をお願いします。';
      }

      // 空文字チェック 本来はグリッドで表示するべきであるが、テキストで入ってきた場合空文字処理してしまうためこちらで処理
      if (elem['ed_cost'] === '') {
        elem['ed_cost'] = 0;
      }
      if (elem['ed_unit_price'] === '') {
        elem['ed_unit_price'] = 0;
      }
      
    });
    if (validationMessage) {
      // バリデーションメッセージを表示
      alert(validationMessage);
      return;
    }

    // グリッドデータ取得
    detailList.forEach(function (detailItem, i) {
      itemList.forEach(function (item) {
        // 枝番が同じならデータをセットする。データはファイルのデータで上書き。
        if (detailItem['ed_estimate_sub_no'] === item['ed_estimate_sub_no']) {
          detailItem['isDirty'] = true;
          Object.keys(item).forEach(function (colKey) {
            detailItem[colKey] = item[colKey];
          });
          editPGs.pgED.d.grid.invalidateRow(i);
          editPGs.pgED.d.grid.render();
        }
      });
    });

    // ファイルに無いデータは削除する
    detailList = detailList.filter(function (elem) {
      return elem['is_file_inputted_data'];
    })
    
    // 既存データに無いものを抽出
    const addDataLIst = itemList.filter(function (item) {
      // ed_estimate_sub_noが一致するデータを抽出
      const existData = detailList.find(function (detailItem) {
        return detailItem['ed_estimate_sub_no'] === item['ed_estimate_sub_no'];
      });
      // 一致しないデータを抽出
      return !existData && item['ed_estimate_sub_no'] !== '00';
    });

    // 最新のid
    let latestId = getMaxIdFormItems(detailList);
    // idを設定
    addDataLIst.forEach(function (elem) {
      latestId += 1;
      elem['id'] = latestId;
      elem['is_file_inputted_data'] = true;
      detailList.push(elem);
    });

    // グリッドに追加、再描画
    editPGs.pgED.d.dataView.setItems(detailList);
    editPGs.pgED.d.dataView.refresh();
  };
  reader.readAsArrayBuffer(f);
}

/**
 * 番号一覧画面を表示する
 * @param {Object} pgMain メイン画面の情報
 * @param {Object} pgNumberList 番号一覧画面の情報
 */
function displayNumberList (pgMain, pgNumberList) {
  let rows = pgMain.dataView.getItems();
  // データが存在していない OR 読込を行っていない場合
  if (rows.length < 1) {
    alert('データがありません。読込ボタンを押してデータを読み込んでください。');
    return;
  }

  // チェックボックスリセット
  pgNumberList.grid.setSelectedRows([]);

  // 番号一覧 表示データの読み込み
  loadInvisibleData(pgNumberList, true).done(function (data) {
    // アクティブにするタブを選択
    activateNumberListTab(getMainTabNo(pgMain));
    // 表示するデータを設定
    pgNumberList.setItemsAndRefresh(data);
    // フィルタをリセット
    pgNumberList.clearFilters();
    // 画面表示
    $('#dialog-number-list')['dialog']('open');
    // 表示するデータを描画
    Object.keys(numberListPGs).forEach(function (elem) {
      numberListPGs[elem].redraw();
    });
  });
}

/**
 * 選択した番号で一覧画面を絞り込み表示する
 * @param {Object} pgNumberList 番号一覧画面の情報
 */
function filterMainNumber (pgNumberList) {
  let activeRow = pgNumberList.getActiveRow();
  // 行未選択の場合
  if (!activeRow) {
    alert('行を選択してください。');
    return;
  }
  
  let mPG = {};
  let pkColumnList = [];
  let parentSelector = '';
  // フィルター条件のカラム、親要素のグリッドを設定
  switch (pgNumberList.divId) {
    case 'NumberListED':
      mPG = mainPGs.pgED
      pkColumnList = ['e_estimate_no'];
      parentSelector = '#gridED';
      
      // 選択行の要素番号を取得
      const rows = pgNumberList.dataView.getItems();
      const activeRowIndex = rows.findIndex(function (elem) {
        return elem['id'] === activeRow['id'];
      });

      // 受注Noがハイフンの場合は番号一覧で選択すると、フィルターにハイフンが設定されてしまうため
      // 直近で受注Noが設定されているデータを使用することでフィルターが機能するよう対応
      if (activeRow['e_estimate_no'] === '-') {
        for (let i = activeRowIndex; i >= 0; i -= 1) {
          if (rows[i]['e_estimate_no'] !== '-') {
            activeRow = rows[i];
            break;
          }
        }
      }      
      break;

    case 'NumberListMOD':
      mPG = mainPGs.pgMOD
      pkColumnList = ['moed_order_no'];
      parentSelector = '#gridMOD';      
      break;

    case 'NumberListOOD':
      mPG = mainPGs.pgOOD
      pkColumnList = ['moed_order_no'];
      parentSelector = '#gridOOD';
      break;

    case 'NumberListSD':
      mPG = mainPGs.pgSD
      pkColumnList = ['s_estimate_no', 'sd_statement_sub_no'];
      parentSelector = '#gridSD';
      break;

    case 'NumberListBD':
      mPG = mainPGs.pgBD
      pkColumnList = ['bd_bill_no', 'b_customer_cd'];
      parentSelector = '#gridBD';
      break;
  }

  // フィルター処理、フィルターのテキストボックスに値表示
  pkColumnList.forEach(function (elem) {
    mPG.columnFilters[elem] = activeRow[elem];
    $(parentSelector).find('input[data-columnId="'+ elem + '"]').val(activeRow[elem]);
  });

  // 再描画、番号一覧画面を閉じ、再描画する
  mPG.dataView.refresh();
  $('#dialog-number-list')['dialog']('close');
}


/***
 * 番号一覧ダイアログで表示非表示ステータスを変更した場合に使用
 * 
 */
function reloadMainList(pg) {
  let mainGrid = '';
  switch (pg.divId) {
    case 'NumberListED':
      mainGrid = mainPGs.pgED
      break;
    case 'NumberListMOD':
      mainGrid = mainPGs.pgMOD   
      break;
    case 'NumberListOOD':
      mainGrid = mainPGs.pgOOD
      break;
    case 'NumberListSD':
      mainGrid = mainPGs.pgSD
      break;
    case 'NumberListBD':
      mainGrid = mainPGs.pgBD
      break;
  } 
  // チェックボックスリセット
  pg.grid.setSelectedRows([]);
  // 再描画、番号一覧画面を閉じ、再描画する
  readdata(mainGrid, displayNumberList(mainGrid, pg));
}


/***
 * 番号一覧のデータ取得
 */
function loadInvisible(pg) {
  loadInvisibleData(pg, false).done(function (data) {
    if (data) {      
      pg.setItemsAndRefresh(data);
      pg.redraw();
    }
  });
}

// function propStockList(strID, strClass, ) {
//   let element = document.getElementById(strID);
//   let elements = element.getElementsByClassName(strClass);
//   let len = elements.length;
//   for (let i = 0; i < len; i++){
//       elements.item(i).style.display = 'block';
//   }
// }

function propStockTabs(evt, divId) {
  let tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(divId).style.display = "block";
  evt.currentTarget.className += " active";
}


/***
 * 在庫一覧の表示対応
 */
 function changeStockViewCategory(divId) {
  for (let i = 0; i < STOCKCATEGORY.length; i++) {
    if (STOCKCATEGORY[i] === divId) {
      $('#tabs-stockview-' + STOCKCATEGORY[i]).show();
      $('div#tabs-stockview').tabs({
        active: i,
      }); 
      
    } else {
      $('#tabs-stockview-' + STOCKCATEGORY[i]).hide();
    }
  }

} 

