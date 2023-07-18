<?php
session_start();
// ログイン済みでなければ処理を禁止
if ($_SESSION['auth'] == null || $_SESSION['auth'] == '') {
  // if (!isset($_SESSION['auth'])) {
  die();
}
if ($_SESSION['auth'] !== TRUE) {
  die();
}
$uinfo = $_SESSION['perminfo'];
$usrid = $_SESSION['userid'];
$usrcd = $_SESSION['usercd'];
$companycd = $_SESSION['companycd'];
session_write_close();
// データベース通信用クラスを読込
include __DIR__ . '/Plannerdbmgr.php';
include __DIR__ . '/BookMaker.php';
// ログイン中のユーザ権限を確認(変数uinfo使用)
function hasPermission($reqperm) {
  global $uinfo;
  if ($uinfo[$reqperm] != '0') {
    return TRUE;
  }
  return FALSE;
}
try {
  // クライアントからの要求に対応した関数を呼び出す
  $candisprow = ($uinfo['PERMISSION_CONTROL_TABLE'] != '0');
  $postInput = isset($_POST['postdata']) ? $_POST['postdata'] : $_GET['req'];
  switch ($postInput) {
    case 'reportMsg':
      Plannerdbmgr::reportMsg(json_decode($_POST['sdatjson'], true));
      break;
    case 'checkShippingAssign':
      Plannerdbmgr::checkShippingAssign(json_decode($_POST['sdatjson'], true));
      break;
    case 'readProdplans':
      Plannerdbmgr::readProdplans();
      break;
    case 'updateProdPlans':
      Plannerdbmgr::updateProdPlans(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'readShipplans':
      Plannerdbmgr::readShipplans();
      break;
    case 'updateEditShipplans':
      Plannerdbmgr::updateShipplans(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'deleteShipPlans':
      Plannerdbmgr::deleteShipplans(json_decode($_POST['sdatjson'], true));
      break;
    case 'deleteBD':
      Plannerdbmgr::deleteBD(json_decode($_POST['sdatjson'], true));
      break;
    case 'cancelEstimateInheriting':
      Plannerdbmgr::cancelEstimateInheriting(json_decode($_POST['sdatjson'], true));
      break;
    case 'readED':
      Plannerdbmgr::readED();
      break;
    case 'readUnlimitedED':
      Plannerdbmgr::readUnlimitedED();
      break;
    case 'updateEditED':
      Plannerdbmgr::updateED(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'deleteED':
      Plannerdbmgr::deleteED(json_decode($_POST['sdatjsondetail']));
      break;
    case 'readL':
      Plannerdbmgr::readL();
      break;
    case 'updateEditL':
      Plannerdbmgr::updateL(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'readLP':
      Plannerdbmgr::readLP();
      break;
    case 'readUserInfo':
      Plannerdbmgr::readUserInfo();
      break;
    case 'readManufacturingUseProduct':  
      Plannerdbmgr::readManufacturingUseProduct(json_decode($_POST['row'], true));
      break;
    case 'updateEditLP':
      Plannerdbmgr::updateLP(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'updateEDCalc':
      Plannerdbmgr::updateEDCalc(json_decode($_POST['sdatjsonheader1'], true), json_decode($_POST['sdatjsonheader2'], true), json_decode($_POST['sdatjsondetail1'], true));
      break;
    case 'updateEditMOED':
      Plannerdbmgr::updateMOED(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'readMOD':
      Plannerdbmgr::readMOD();
      break;
    case 'readUnlimitedMOD':
      Plannerdbmgr::readUnlimitedMOD();
      break;
    case 'updateEditMOD':
      Plannerdbmgr::updateMOD(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), json_decode($_POST['mode'], true), $_POST['dbstatus']);
      break;
    case 'updateEditAT':  //  部分検収画面からの遷移
      Plannerdbmgr::updateMOD(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), json_decode($_POST['mode'], true));
      break;
    // case 'updateMST':  // 入庫
    //   Plannerdbmgr::updateMST(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), mode);
    //   break;
    case 'updateEditMST':
    case 'updateEditOST':
      Plannerdbmgr::updateMST(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), $_POST['mode']);
      break;
    case 'cancelMST':
      Plannerdbmgr::cancelMST(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'updateMODAccept':  // 一括　検収登録　検収取消
      Plannerdbmgr::updateMODAccept(json_decode($_POST['sdatjson'], true), json_decode($_POST['mode'], true));
      break;
    case 'updateEditOOD':
      Plannerdbmgr::updateOOD(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), $_POST['mode'], $_POST['dbstatus']);
      break;
    case 'updateEditAOO':  //  部分検収画面からの遷移
      Plannerdbmgr::updateOOD(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), json_decode($_POST['mode'], true));
      break;
    // case 'updateEditOOED':
    //   Plannerdbmgr::updateOOED(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
    //   break;
    case 'readOOD':
      Plannerdbmgr::readOOD();
      break;
    case 'readSD':
      Plannerdbmgr::readSD();
      break;
    case 'updateEditSD':
      Plannerdbmgr::updateSD(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'updateSTPlanReceive':
      Plannerdbmgr::updateSTPlanReceive( json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), json_decode($_POST['mode'], true) );
      break;
    // 2023/2/22 「引当取消」処理追加
    case 'deleteSTPlanReceive':
      Plannerdbmgr::deleteSTPlanReceive( json_decode($_POST['sdatjsonheader'], true) );
      break;
    case 'updateSTPlanProduce':
      Plannerdbmgr::updateSTPlanProduce( json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'transPlanToStock':
      Plannerdbmgr::transPlanToStock( json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'readBD':
      Plannerdbmgr::readBD();
      break;
    case 'readSTPlan':
      Plannerdbmgr::readSTPlan();
      break;
    case 'readST':
      Plannerdbmgr::readST();
      break;
    case 'readcrimp':
      Plannerdbmgr::drillCrimpData(json_decode($_POST['diglevel'], true));
      break;
    case 'readStockView':
      Plannerdbmgr::readStockView(json_decode($_POST['category'], true), $_POST['mode']);
      break;
    case 'readDetailStock':
      Plannerdbmgr::readDetailStock(json_decode($_POST['category'], true), json_decode($_POST['row'], true));
      break;
    case 'updateStockAdjust':
      Plannerdbmgr::updateStockAdjust(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'updateStockTransfer':
      Plannerdbmgr::updateStockTransfer(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'cancelProdplans':
      Plannerdbmgr::cancelProdplans(json_decode($_POST['sdatjson'], true));
      break;
    case 'readED':
      Plannerdbmgr::readED();
      break;
    case 'updateEditBD':
      Plannerdbmgr::updateBD(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'createBD':
      Plannerdbmgr::createBD(json_decode($_POST['sdatjson'], true));
      break;
    case 'outputBD':
      Plannerdbmgr::outputBD(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateEDStatementFlg':
      Plannerdbmgr::updateEDStatementFlg(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true), $_POST['flg']);
    break;
    case 'updateUser':
      Plannerdbmgr::updateUser(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateCustomer':
      Plannerdbmgr::updateCustomer(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateCustomerpost':
      Plannerdbmgr::updateCustomerpost(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateCustomercharge':
      Plannerdbmgr::updateCustomercharge(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateMaterial':
      Plannerdbmgr::updateMaterial(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateProcess':
      Plannerdbmgr::updateProcess(json_decode($_POST['sdatjson'], true));
      break;
    case 'updatePermissions':
      Plannerdbmgr::updatePermissions(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateHousecompany':
      Plannerdbmgr::updateHousecompany(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateProduct':
      Plannerdbmgr::updateProduct(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateCurrency':
      Plannerdbmgr::updateCurrency(json_decode($_POST['sdatjson'], true));
      break;
    case 'ajaxGetEstimateNo':
      Plannerdbmgr::ajaxGetEstimateNo(json_decode($_POST['sdatjson'], true));
    break;
    case 'ajaxGetMoedSerialNo':
      Plannerdbmgr::ajaxGetMoedSerialNo();
      break;
    case 'updateBom':
      Plannerdbmgr::updateBom(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateBomAssignableTo':
      Plannerdbmgr::updateBomAssignableTo(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateProjects':
      Plannerdbmgr::updateProjects(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateMembers':
      Plannerdbmgr::updateMembers(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateUnit':
      Plannerdbmgr::updateUnit(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateArrangement':
      Plannerdbmgr::updateArrangement(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateTax':
      Plannerdbmgr::updateTax(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateWeight':
      Plannerdbmgr::updateWeight(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateInspection':
      Plannerdbmgr::updateInspection(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateInspectionview':
      Plannerdbmgr::updateInspectionview(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateInspectionitem':
      Plannerdbmgr::updateInspectionitem(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateWire':
      Plannerdbmgr::updateWire(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateTransportcompany':
      Plannerdbmgr::updateTransportcompany(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateStorage':
      Plannerdbmgr::updateStorage(json_decode($_POST['sdatjson'], true));
      break;
    case 'updatePayment':
      Plannerdbmgr::updatePayment(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateGari':
      Plannerdbmgr::updateGari(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateWeave':
      Plannerdbmgr::updateWeave(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateCam':
      Plannerdbmgr::updateCam(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateMold':
      Plannerdbmgr::updateMold(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateParrangement':
      Plannerdbmgr::updateParrangement(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateManufacture':
      Plannerdbmgr::updateManufacture(json_decode($_POST['sdatjson'], true));
      break;
    // case 'updateConfirm':
    //   Plannerdbmgr::updateConfirm(json_decode($_POST['sdatjson'], true));
    //   break;
    // case 'updateStorages':　sono　2019/5/20
    //   Plannerdbmgr::updateStorages(json_decode($_POST['sdatjson'], true));
    //   break;
    case 'updateStorereasons':
      Plannerdbmgr::updateStorereasons(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateWarehouse':
      Plannerdbmgr::updateWarehouse(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateProdplansproc':
      Plannerdbmgr::updateProdplansproc(json_decode($_POST['sdatjson'], true));
      break;
    case 'updateStockData':
      Plannerdbmgr::updateStockData(json_decode($_POST['sdatjson'], true), json_decode($_POST['sdatjsonMD'], true), $mode);
      break;
    // case 'updateShippingAssign':
    //   Plannerdbmgr::updateShippingAssign(json_decode($_POST['sdatjson'], true));
    //   break;
    case 'readMaster':
      Plannerdbmgr::readMaster();
      break;
    case 'makeEstimateFile':
      Plannerdbmgr::makeEstimateFile($_GET);
      break;
    case 'makeEstimateAcceptFile':
      Plannerdbmgr::makeEstimateAcceptFile($_GET);
      break;
    case 'makeEstimateLPFile':  // 指示用受注ファイル
      Plannerdbmgr::makeEstimateLPFile($_GET);
      break;
    case 'makeEstimateOutput':  // 取込用ファイル出力
      Plannerdbmgr::makeEstimateOutput($_GET);
      break;
    case 'makeIDSheet':
      Plannerdbmgr::makeIDSheet($_GET);
      break;
    case 'makeStorageIDSheet';
      Plannerdbmgr::makeStorageIDSheet($_GET);
      break;
    // case 'makeMATLIDSheet':
    //   Plannerdbmgr::makeMATLIDSheet($_GET);
    //   break;
    case 'makeProductPlanSheet':
      Plannerdbmgr::makeProductPlanSheet($_GET);
      break;
    case 'makeInspectionLPFile':  
      Plannerdbmgr::makeInspectionLPSheet($_GET);
      break;
    // case 'makeLeafFile':
    //   Plannerdbmgr::makeLeafFile($_GET);
    //   break;
    // case 'makeLeafCostFile':
    //   Plannerdbmgr::makeLeafCostFile($_GET);
    //   break;

    // ↓新規追加する納品書出力のクラスを指定する
    // case 'makeMaterialOrderEstimateFile':
    //   Plannerdbmgr::makeMaterialOrderEstimateFile($_GET);
    //   break;
    // case 'makeMaterialOrderEstimateFile':
    //   Plannerdbmgr::makeMaterialOrderEstimateFile($_GET);
    //   break;
    case 'makeMaterialOrderFile':
      Plannerdbmgr::makeMaterialOrderFile($_GET);
      break;
    // case 'makeOutsideOrderEstimateFile':
    //   Plannerdbmgr::makeOutsideOrderEstimateFile($_GET);
    //   break;
    case 'makeOutsideOrderFile':
      Plannerdbmgr::makeOutsideOrderFile($_GET);
      break;
    // case 'makeMonthlyShippingLabel':
    //   Plannerdbmgr::makeMonthlyShippingLabel($_GET);
    break;
    case 'makeStatementFileAccept':
      Plannerdbmgr::makeStatementFile($_GET, true, '0');
      break;
    case 'makeStatementFile':
      Plannerdbmgr::makeStatementFile($_GET, false, '0');
      break;
    case 'makeStatementReFileAccept':
      Plannerdbmgr::makeStatementFile($_GET, true, '1');
      break;
    case 'makeStatementReFile':
      Plannerdbmgr::makeStatementFile($_GET, false, '1');
      break;
    case 'makeStatementFileLIXIL':
      Plannerdbmgr::makeStatementFileLIXIL($_GET, false);
      break;
    case 'makeBillFileData':
      Plannerdbmgr::makeBillFileData($_GET, false);
      break;
    case 'makeBillDedicatedFileData':
      Plannerdbmgr::makeBillDedicatedFileData($_GET, false);
      break;
    case 'makeBillFromStatementFile':
      Plannerdbmgr::makeBillFromStatementFile($_GET);
      break;
    case 'makeBillFileLIXIL':
      Plannerdbmgr::makeBillFileLIXIL($_GET);
      break;
    case 'makeMaterialMillSheet':
      Plannerdbmgr::makeMaterialMillSheet($_GET);
      break;
    // case 'makeBillFile':
    //   Plannerdbmgr::makeBillFile($_GET);
    //   break;
    // case 'readCheckbom':
    //   Plannerdbmgr::readCheckbom($_POST['option']);
    //   break;
    case 'readCurrentstock':
      Plannerdbmgr::readCurrentstock($_POST['sdatjson'], true);
      break;
    case 'readAssignStock':
      Plannerdbmgr::readAssignStock(json_decode($_POST['row'], true), json_decode($_POST['option'], true));
      break;
    // case 'readTransferstock':
    //   Plannerdbmgr::readTransferstock($_POST['row']);
    //   break;
    case 'searchMaterialsbom':
      Plannerdbmgr::searchMaterialsbom(json_decode($_POST['sdatjson'], true));
      break;
    case 'issueLeaflist':
      Plannerdbmgr::issueLeaflist(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
      break;
    case 'issueProdLeaf':
      Plannerdbmgr::issueProdLeaf(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetails'], true));
      break;
    case 'deployLeaf':
      Plannerdbmgr::deployLeaf(json_decode($_POST['sdatjson'], true));
      break;
    case 'createShippingLabel':
      // Plannerdbmgr::makeMonthlyShippingLabel(json_decode($_POST['sdatjson'], true));
      Plannerdbmgr::makeShippingLabel($_GET);
    break;
    case 'createCheckBillSheet':
      Plannerdbmgr::createCheckBillSheet($_GET);
      break;

    // case 'createCheckStatementSheet':
    //   Plannerdbmgr::createCheckStatementSheet();
    //   break;
    case 'createShippingLabelCSV':
      Plannerdbmgr::makeShippingLabelCSV($_GET, '1');
      break;
    case 'createShippingLabelCSVSG':
      Plannerdbmgr::makeShippingLabelCSV($_GET, '2');
      break;
    // case  'scheduleLeafProd':
    //   plannerdbmgr::scheduleLeafProd(json_decode($_POST['sdatjson'], true));
    //   break;
    case 'issueShipLeaf':
      Plannerdbmgr::issueShipLeaf(json_decode($_POST['sdatjson'], true));
      break;
    case 'searchED':
      Plannerdbmgr::searchED(json_decode($_POST['sdatjson'], true));
      break;
    case 'searchStatementData':
      Plannerdbmgr::searchStatementData(json_decode($_POST['sdatjson'], true));
      break;
    case 'readEDCalc':
      Plannerdbmgr::readEDCalc(json_decode($_POST['sdatjson'],  true));
      break;
    case 'readProdPlansWire':
      Plannerdbmgr::readProdPlansWire(json_decode($_POST['sdatjson'],  true));
      break;
    case 'readExpectStock':
      Plannerdbmgr::readExpectStock(json_decode($_POST['sdatjson'],  true));
      break;
    case 'readSettingProc':
      Plannerdbmgr::readSettingProc(json_decode($_POST['row'],  true));
      break;
    // case 'insertEDCalc':
    //   Plannerdbmgr::insertEDCalc(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
    //   break;
    // case 'makeShippingLabel':
    //   Plannerdbmgr::makeShippingLabel($_GET);
    //   break;
    case 'existEstimateNo':
      Plannerdbmgr::existEstimate($_POST['referno']);
      break;
    case 'searchEDMCond':
      Plannerdbmgr::searchEDMCond(json_decode($_POST['sdatjson'], true));
      break;
    // case 'existMOrder':
    //   Plannerdbmgr::existMOrder(json_decode($_POST['sdatjson'], true));
    //   break; 
    case 'existProdplan':
      Plannerdbmgr::existProdplan(json_decode($_POST['sdatjson'], true));
      break; 
    case 'existProdplansWire':
      Plannerdbmgr::existProdplansWire(json_decode($_POST['sdatjson'], true), true);
      break;
    case 'getProdPlanNo':
      Plannerdbmgr::getProdPlanNo(json_decode($_POST['sdatjson'], true));
      break;
    case 'ajaxGetEDShipSubNo':
      plannerdbMgr::getMaxShipNo(json_decode($_POST['sdatjsonheader'], true));
      break;
    case 'ajaxGetStatementSerialNo':
      Plannerdbmgr::ajaxGetStatementSerialNo(json_decode($_POST['sdatjson'], true));
      break;
      case 'getProdPlanNo':
        Plannerdbmgr::getProdPlanNo();
        break;
    case 'getActiveRowReserveNum':
      Plannerdbmgr::getActiveRowReserveNum(json_decode($_POST['stockpage'], true), json_decode($_POST['sdatjson'], true));
      break;
    // case 'insertProdPlans':
    //   Plannerdbmgr::insertProdPlans(json_decode($_POST['sdatjsonheader'], true), json_decode($_POST['sdatjsondetail'], true));
    //   break;
    // existStatement
    case 'existStatement':
      Plannerdbmgr::existStatement(json_decode($_POST['sdatjson'], true));
      break;
    case 'checkShipmentFlg':
      Plannerdbmgr::checkShipmentFlg(json_decode($_POST['sdatjson'], true));
      break;
    case 'searchProdPlans':
      Plannerdbmgr::searchProdPlans(json_decode($_POST['sdatjsonheader'], true), true);
      break;
    case 'updateCalcProdplans':
      Plannerdbmgr::updateCalcProdplans(json_decode($_POST['sdatjsonheader1'], true), json_decode($_POST['sdatjsonheader2'], true),json_decode($_POST['sdatjsondetail1'], true), json_decode($_POST['sdatjsondetail2'], true),true);
      break;
    case 'searchStatement':
      Plannerdbmgr::updateCalcProdplans(json_decode($_POST['sdatjsonheader1'], true), json_decode($_POST['sdatjsonheader2'], true),json_decode($_POST['sdatjsondetail1'], true), json_decode($_POST['sdatjsondetail2'], true),true);
      break;
    case 'searchWireMaster':
      Plannerdbmgr::searchWireMaster(json_decode($_POST['sdatjson'], true));
      break;
    // case 'printQR':
    //   Plannerdbmgr::printQR($_GET);
    //   break;
    // case 'reissueQR':
    //   Plannerdbmgr::reissueQR($_GET);
    //   break;
    case 'updateStorageTable':
      Plannerdbmgr::updateStorageTable(json_decode($_POST['sdatjson'], true));
      break;
    case 'readDropdownMaster':
      Plannerdbmgr::readDropdownMaster();
      break;
    case 'updateVisibleFlg':
      Plannerdbmgr::updateVisibleFlg(json_decode($_POST['sdatjson'], true), json_decode($_POST['mode'], true), $_POST['gridname']);
      break;
    case 'readNumberData':
      Plannerdbmgr::readNumberData(json_decode($_POST['gridname'], true), json_decode($_POST['mode'], true));
      break;
    case 'makeMaterialMillSheet':
      Plannerdbmgr::makeMaterialMillSheet($_GET);
      break;
    case 'makeCharterInvoice':
      Plannerdbmgr::makeCharterInvoice($_GET);
      break;
    case 'reissueBillFile':
      Plannerdbmgr::reissueBillFile($_GET);
      break;
    case 'completeProd':
      Plannerdbmgr::completeProd(json_decode($_POST['sdatjson'], true));
      break;
    case 'cancelOrderTakeover':
      Plannerdbmgr::cancelOrderTakeover(json_decode($_POST['sdatjson'], true));
      break;
  }
} catch (Exception $e) {
  throw $e;
}
exit();
