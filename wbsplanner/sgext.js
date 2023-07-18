'use strict';

/**
 * @fileOverview SlickGrid用関数及び列定義など
 * @author Fumihiko Kondo
 */

/**
 * セル編集時用ドロップリストエディタ
 * @param {*} args 
 */
function SelectCellEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    args['column']['options'].forEach(function (elem) {
      if (!vartype) {
        vartype = (typeof elem['key']);
      }
      option_str += '<option value="' + elem['key'] + '">' + elem['key'] + (elem['val'] ? ':' + elem['val'] : '') + '</option>';
    });
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

/**
 * セル編集時用ドロップリストエディタ
 * @param {*} args 
 */
function SelectCellEditorValue(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    args['column']['options'].forEach(function (elem) {
      if (!vartype) {
        vartype = (typeof elem['key']);
      }
      // option_str += '<option value="' + elem['key'] + '">' + elem['key'] + (elem['val'] ? ':' + elem['val'] : '') + '</option>'; 
      option_str += '<option value="' + elem['key'] + '">' + (elem['val'] ? elem['val'] : '') + '</option>';
    });
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    // このタイミングで初回描画完了フラグをリセット
    morderestimateTypeSubject.isFirstRenderFinished = false; // 発注書の科目区分
    morderestimateInventoryType.isFirstRenderFinished = false; // 発注書の在庫区分
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

/***
 * セレクトボックス　単位
 */
function selectCellUnitEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in master['unit']) {
      if (!vartype) {
        vartype = (typeof master['unit'][rec]['u_cd']);
      }
      option_str += '<option value="' + master['unit'][rec]['u_cd'] + '">' + (master['unit'][rec]['u_name'] ? master['unit'][rec]['u_name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}


function selectCellParrangeEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in master['parrangement']) {
      if (!vartype) {
        vartype = (typeof master['parrangement'][rec]['par_cd']);
      }
      option_str += '<option value="' + master['parrangement'][rec]['par_cd'] + '">' + (master['parrangement'][rec]['par_name'] ? master['parrangement'][rec]['par_name'] : '') + '</option>'; 
      // option_str += '<option value="' + master['parrangement'][rec]['par_cd'] + '">' + master['parrangement'][rec]['par_cd'] +
      //   (master['parrangement'][rec]['par_name'] ? ':' + master['parrangement'][rec]['par_name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    // プルダウン選択時に初回描画完了フラグをリセット
    estimateParrangement.isFirstRenderFinished = false; // 見積書の製品手配方法
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}
    
/**
 * 発注書画面 在庫区分 編集時用ドロップリストエディタ
 * @param {*} args 
 */
function SelectCellEditorMorderestimateTypeSubject(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    args['column']['options'].forEach(function (elem) {
      if (!vartype) {
        vartype = (typeof elem['key']);
      }
      // option_str += '<option value="' + elem['key'] + '">' + elem['key'] + (elem['val'] ? ':' + elem['val'] : '') + '</option>'; 
      option_str += '<option value="' + elem['key'] + '">' + (elem['val'] ? elem['val'] : '') + '</option>';
    });
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    // プルダウン選択時に初回描画完了フラグをリセット
    morderestimateTypeSubject.isFirstRenderFinished = false; // 発注書の科目区分
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}
    
/**
 * 発注書画面 在庫区分 編集時用ドロップリストエディタ
 * @param {*} args 
 */
function SelectCellEditorMorderestimateInventoryType(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    args['column']['options'].forEach(function (elem) {
      if (!vartype) {
        vartype = (typeof elem['key']);
      }
      // option_str += '<option value="' + elem['key'] + '">' + elem['key'] + (elem['val'] ? ':' + elem['val'] : '') + '</option>'; 
      option_str += '<option value="' + elem['key'] + '">' + (elem['val'] ? elem['val'] : '') + '</option>';
    });
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    // プルダウン選択時に初回描画完了フラグをリセット
    morderestimateInventoryType.isFirstRenderFinished = false; // 発注書の在庫区分
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

function selectCellArrangeEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in master['arrangement']) {
      if (!vartype) {
        vartype = (typeof master['arrangement'][rec]['ar_sub_cd']);
      }
      option_str += '<option value="' + master['arrangement'][rec]['ar_sub_cd'] + '">' + master['arrangement'][rec]['ar_sub_cd'] +
        (master['arrangement'][rec]['ar_name'] ? ':' + master['arrangement'][rec]['ar_name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    // プルダウン選択時に初回描画完了フラグをリセット
    estimateArrangement.isFirstRenderFinished = false; // 見積書の加工内容
    morderestimateArrangement.isFirstRenderFinished = false; // 発注書の加工内容
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

function selectCellManufactureEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in master['manufacture']) {
      if (!vartype) {
        vartype = (typeof master['manufacture'][rec]['mn_cd']);
      }
      option_str += '<option value="' + master['manufacture'][rec]['mn_cd'] + '">' + master['manufacture'][rec]['mn_cd'] +
        (master['manufacture'][rec]['mn_name'] ? ':' + master['manufacture'][rec]['mn_name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}


function selectCellTransportEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in master['transportcompany']) {
      if (!vartype) {
        vartype = (typeof master['transportcompany'][rec]['tc_short_name']);
      }
      option_str += '<option value="' + master['transportcompany'][rec]['tc_short_name'] + '">' + master['transportcompany'][rec]['tc_short_name'] + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}


function selectCellIgnoreEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (let rec in master['wbsctrl']) {
      if (!vartype) {
        vartype = (typeof master['wbsctrl'][rec]['Wbsctrl_id']);
      }
      option_str += '<option value="' + master['wbsctrl'][rec]['Wbsctrl_id'] + '">' + master['wbsctrl'][rec]['Wbsctrl_id'] +
        (master['wbsctrl'][rec]['name'] ? ':' + master['wbsctrl'][rec]['name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}


/**
 * 場所データ取得
 */
function selectCellWarehouseEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in master['warehouse']) {
      if (!vartype) {
        vartype = (typeof master['warehouse'][rec]['w_cd']);
      }
      option_str += '<option value="' + master['warehouse'][rec]['w_cd'] + '">' + master['warehouse'][rec]['w_cd'] +
        (master['warehouse'][rec]['w_name'] ? ':' + master['warehouse'][rec]['w_name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

/**
 * 品名分類①セレクトボックス用
 * @param {*} args 
 */
function selectCellPRCEditor(args) {
  var $select;
  var defaultValue;
  var scope = this;
  let num = 0;
  let layer = '1';  // 階層
  let fieldName = 'prc_cat_01_cd';  // 該当階層CDのカラム名
  let cd1 = '';
  let cd2 = '';
  if (args.column.field === 'prc_cat_02_cd') {
    layer = '2';
    fieldName = 'prc_cat_02_cd';
    cd1 = args.item['prc_cat_01_cd'];
  } else if (args.column.field === 'prc_cat_03_cd') {
    layer = '3';
    fieldName = 'prc_cat_03_cd';
    cd1 = args.item['prc_cat_01_cd'];
    cd2 = args.item['prc_cat_02_cd'];
  }

  // masterオブジェクトのデータのうち第1階層取得
  let objData = {};
  for (let record of Object.values(master['productcategory'])) {
    if (layer === record['prc_cd']) {
      if (layer === '2' && record['prc_cat_01_cd'] === cd1) {
        objData[num] = record;
        ++num;
      } else if (layer === '3' && record['prc_cat_01_cd'] === cd1 && record['prc_cat_02_cd'] === cd2) {
        objData[num] = record;
        ++num;
      } else if (layer === '1') {
        objData[num] = record;
        ++num;
      }
    }
  }

  scope['init'] = function () {
    var option_str = '';
    var vartype = null;
    for (var rec in objData) {
      if (!vartype) {
        vartype = (typeof objData[rec][fieldName]);
      }
      option_str += '<option value="' + objData[rec][fieldName] + '">' + objData[rec][fieldName] +
        (objData[rec]['prc_name'] ? ':' + objData[rec]['prc_name'] : '') + '</option>';
    }
    $select = $('<select tabIndex="0" class="editor-select" style="width:100%" data-vartype="' +
      vartype + '">' + option_str + '</select>');
    $select.appendTo(args['container']);
    $select.focus();
  };
  scope['destroy'] = function () {
    $select.remove();
  };
  scope['focus'] = function () {
    $select.focus();
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };
  scope['serializeValue'] = function () {
    return $select.attr('data-vartype') === 'number' ? Number($select.val()) : $select.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] =
      $select.attr('data-vartype') === 'number' ? Number(state) : state;
  };
  scope['isValueChanged'] = function () {
    return ($select.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($select.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}




/**
 * セル編集時用色エディタ
 * @param {*} args 
 */
function ColorEditor(args) {
  var $input;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    $input = $('<INPUT type="color"  class="editor-text" />')
      .appendTo(args['container'])
      .on('keydown.nav', function (e) {
        if (e.keyCode === $['ui']['keyCode']['LEFT'] || e.keyCode === $['ui']['keyCode']['RIGHT']) {
          e.stopImmediatePropagation();
        }
      })
      .focus()
      .select();
  };
  scope['destroy'] = function () {
    $input.remove();
  };
  scope['focus'] = function () {
    $input.focus();
  };
  scope['getValue'] = function () {
    return $input.val();
  };
  scope['setValue'] = function (val) {
    $input.val(val);
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']] || '';
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };
  scope['serializeValue'] = function () {
    return $input.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] = state;
  };
  scope['isValueChanged'] = function () {
    return (!($input.val() === '' && !defaultValue)) && ($input.val() !== defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($input.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

/**
 * フィルタ結果を取得
 * @param {Slick.Data.DataView} dataView 対象データビュー
 */
function getFilteredData(dataView) {
  var len = dataView.getLength();
  var filtered = [];
  for (var i = 0; i < len; i++) {
    filtered.push(dataView.getItem(i));
  }
  return filtered;
}

/**
 * 変更のあったデータを取得する
 * (セルの変更処理時にisDirtyをtrueとしておき、判定に使用する)
 * @param {Slick.Data.DataView} dataView 対象データビュー
 */
function getDirtyData(dataView) {
  var data = dataView.getItems();
  var len = data.length;
  var filtered = [];
  for (var i = 0; i < len; i++) {
    if (data[i]['isDirty'] === true) {
      filtered.push(data[i]);
    }
  }
  return filtered;
}

/**
 * 指定したDataViewアイテムの配列中から最大のidを返す
 * @param {Array} data 
 */
function getMaxIdFormItems(data, subName) {
  var maxId = 0;
  if (data.length === 0) {
    // データが0の時は0を返す
    maxId = 0;
    return maxId;
  }
  if (isSet(subName)) {
    for (var i = 0; i < data.length; i++) {
      maxId = data[i][subName] > maxId ? data[i][subName] : maxId;
    }
  } else {
    if (data.length === 1 && data[0]['id'] === 0) {
      maxId = 1;
    } else {
      // 見積明細データ更新時正式なデータが取得できないため追加↓
      maxId = data.length;
      // ↑
      for (var i = 0; i < data.length; i++) {
        maxId = data[i]['id'] > maxId ? data[i]['id'] : maxId;
      }
    }
  }
  return maxId;
}

/**
 * 対象のグリッドに行を追加する
 * @param {PlannerGrid} pg 対象の計画グリッド
 */
function addRow(pg) {
  let flg = false;
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var idx = pg.grid.getActiveCell() ? pg.grid.getActiveCell().row : (pg.dataView.getItems().length - 1);
  var data = pg.dataView.getItems();
  var newRow = [];
  switch (pg) {
    case editPGs.pgED.d:
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'ed_estimate_sub_no': ('00' + (Number(getMaxIdFormItems(data, 'ed_estimate_sub_no')) + 1)).slice(-3),
        // デフォルト値をセット
        'ed_type_04': '0',
        'ed_sub_06': 'mm',
        // 'ed_unit_tran': '枚',
        'ed_prod_plan_sign': '0',   // 製造計画実装時に修正
        'isNewRow': true,
      };
      break;
    case editPGs.pgSD.d:
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'sd_estimate_sub_no': data[idx]['sd_estimate_sub_no'],
        'sd_statement_sub_no': data[idx]['sd_statement_sub_no'],
        'sd_shipment_sub_no': ('00' + (Number(data[idx]['sd_shipment_sub_no']) + 1)).slice(-2),
        'sd_p_cd': data[idx]['sd_p_cd'],
        'sd_p_name_supple': data[idx]['sd_p_name_supple'],
        'sd_unit_price': data[idx]['sd_unit_price'],
        'sd_unit_tran': data[idx]['sd_unit_tran'],
        'sd_unit_tran_02': data[idx]['sd_unit_tran_02'],
        'sd_estimate_quantity': data[idx]['sd_estimate_quantity'],
        'sd_tax_rate': data[idx]['sd_tax_rate'],
        'isNewRow': true
      };
      break;
    case editPGs.pgAT.d:
    case editPGs.pgAOO.d:
      // 部分検収画面 moed_unit_priceは単価。金額データ計算のためにデータセット
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'moed_sub_no': data[idx]['moed_sub_no'],
        'moed_accept_sub_no': ('00' + (Number(data[idx]['moed_accept_sub_no']) + 1)).slice(-2),
        'moed_product_cd': data[idx]['moed_product_cd'],
        'moed_unit_price': data[idx]['moed_unit_price'],
        'moed_unit_tran': data[idx]['moed_unit_tran'],
        'moed_refer_no':  data[idx]['moed_refer_no'],
        'moed_parrangement_cd': data[idx]['moed_parrangement_cd'],
        'moed_sub_08': data[idx]['moed_sub_08'],
        'moed_sub_09': data[idx]['moed_sub_09'],
        'moed_unit_eval': data[idx]['moed_unit_eval'],
        'isNewRow': true
      };
      break;
    case editPGs.pgOST.d:
    case editPGs.pgMST.d:
      // 入庫画面 moed_order_noは、内部保持データ。ロットNo生成のために、データセット。
      // 受注引継ぎレコードの場合は、受注番号を引き継ぐ。検収日が入っている新規追加レコードは、入庫で枝番別れ(ロット違いにより)するケースのため。
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'moed_sub_no': data[idx]['moed_sub_no'],
        'moed_accept_sub_no': ('00' + (Number(data[idx]['moed_accept_sub_no']) + 1)).slice(-2),
        'moed_product_cd': data[idx]['moed_product_cd'],
        'moed_order_no': data[idx]['moed_order_no'],
        'moed_customer_cd': data[idx]['moed_customer_cd'],
        'moed_sub_num_04': 0,
        'moed_quantity': data[idx]['moed_quantity'],
        'moed_unit_tran': data[idx]['moed_unit_tran'],
        'moed_unit_qty': data[idx]['moed_unit_qty'],
        'moed_unit_eval': data[idx]['moed_unit_eval'],
        'moed_refer_no':  data[idx]['moed_refer_no'],
        'moed_refer_sub_no':  data[idx]['moed_refer_sub_no'],
        'moed_accept_date':  data[idx]['moed_accept_date'],
        'moed_buy_type':  data[idx]['moed_buy_type'],
        // 'moed_unit_price':  data[idx]['moed_unit_price'],
        // 'moed_arrival_plan_date': data[idx]['moed_arrival_plan_date'],
        'moed_customer_charge_cd': data[idx]['moed_customer_charge_cd'],
        'moed_salesman_cd': data[idx]['moed_salesman_cd'],
        'moed_order_date': data[idx]['moed_arrival_plan_date'],
        'moed_arrival_hd_date': data[idx]['moed_arrival_hd_date'],
        'moed_parrangement_cd': data[idx]['moed_parrangement_cd'],
        'moed_manufacture_cd': data[idx]['moed_manufacture_cd'],
        'moed_type_subject': data[idx]['moed_type_subject'],
        'moed_inventory_type': data[idx]['moed_inventory_type'],
        'moed_shipper_cd': data[idx]['moed_shipper_cd'],
        'moed_delivery_cd': data[idx]['moed_delivery_cd'],
        'moed_sub_08': data[idx]['moed_sub_08'],
        'moed_sub_09': data[idx]['moed_sub_09'],
        'moed_type_04': data[idx]['moed_type_04'],
        'isNewRow': true
      };
      break;
    case editPGs.pgOOD.d:
    case editPGs.pgMOD.d:
      // 発注編集では、検収の有無にかかわらずデータ参照が可能なため、処理を分岐
      flg = isAcceptSheet(pg);
      if (flg) {
        alert('既に検収済みなので編集できません。');
        return;
      } else {
        // 未検収ならば、一律、発注枝番をインクリメント
        newRow = {
          'id': getMaxIdFormItems(data) + 1,
          'moed_sub_no': ('000' + (Number(getMaxIdFormItems(data, 'moed_sub_no')) + 1)).slice(-3),
          'moed_accept_sub_no': '01',
          'isNewRow': true
        };
      }
      break;
    case editPGs.pgProdplans.d:
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'pd_prod_plan_sub_no': ('000' + (Number(getMaxIdFormItems(data, 'pd_prod_plan_sub_no')) + 1)).slice(-3),
        'pd_p_cd': data[0]['pd_p_cd'],
        'pd_p_name': data[0]['pd_p_name'],
        'pd_ed_sub_01': data[0]['pd_ed_sub_01'],
        'pd_ed_sub_02': data[0]['pd_ed_sub_02'],
        'pd_ed_sub_03': data[0]['pd_ed_sub_03'],
        'pd_ed_sub_04': data[0]['pd_ed_sub_04'],
        'pd_ed_sub_05': data[0]['pd_ed_sub_05'],
        'pd_ed_sub_06': data[0]['pd_ed_sub_06'],

        'isNewRow': true
      };
      break;
    case editPGs.pgSTPProduce.d:
      newRow = {        
        'id': getMaxIdFormItems(data) + 1,
        'stc_arrange_type': '610',    // デフォルト値をセット。
        'stc_sub_no_01': data[idx]['stc_sub_no_01'],
        'isNewRow': true
      };
      break;
    case settingPGs.pgSettingProc:
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'ppr_prod_plan_no': data[idx]['ppr_prod_plan_no'],
        'isNewRow': true,
      };
      break;
    case masterPGs.pgCustomerpost:
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'CP_CUSTOMER_CD': data[idx]['CP_CUSTOMER_CD'],
        'isNewRow': true,
      };
      break;
    // case checkdatPGs.pgAssignstock:
    //   newRow = {
    //     'id': getMaxIdFormItems(data) + 1,
    //     'isNewRow': true,
    //   };
    //   break;
    default:
      newRow = {
        'id': getMaxIdFormItems(data) + 1,
        'isNewRow': true
      };
      break;
  }
  data.splice(idx, 0, newRow);
  pg.dataView.setItems(data);
  pg.dataView.refresh();
}

/**
 * 対象のグリッドを空にする
 * @param {PlannerGrid} pg 対象の計画グリッド
 */
function clearRows(pg) {
  // 編集途中の閉じるボタン押下で、validatorループが入ってしまうので、コメントにした
  // if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
  //   return;
  // }
  pg.dataView.setItems([]);
  pg.dataView.refresh();
}

/**
 * 発注画面のみ使用可
 */
function removeEmptyRow(pg) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return false;
  }
  let data = pg.dataView.getItems();
  let dataLen = data.length;
  let datAfter = '';
  if (dataLen === 0) {
    return true;
  }
  if (dataLen < 0) {
    return false;
  }
  // 製品CDがないものを省く　登録時のvalidateに発注枝番がひっかかるため
  if (pg.divId === 'EditMOD') {
    // 発注画面
    datAfter = data.filter(item => item.moed_product_cd !== undefined);
    if (datAfter.length < 1) {
      alert('品名CDが入力されていません。必須入力です。');
      return false;
    }
  } else if (pg.divId === 'EditOOD') {
    // 委託発注画面
    datAfter = data.filter(item => item.moed_product_cd !== undefined);
    if (datAfter.length < 1) {
      alert('品名CDが入力されていません。必須入力です。');
      return false;
    }
  }
  pg.dataView.setItems(datAfter);
  pg.dataView.refresh();
  return true;
}

/**
 * 行IDを採番して、新規行を作成する
 * @param {Array} items 追加対象の配列(idの採番に使用)
 * @return {*} 新規行のオブジェクト
 */
function makeNewRowObj(items) {
  return {
    'id': getMaxIdFormItems(items) + 1,
    'isSelected': true,
    'isDirty': true,
    'isNewRow': true,
  };
}

/**
 * 対象のグリッドから行を削除する
 * @param {PlannerGrid} pg 対象の計画グリッド
 */
function removeRow(pg, process) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    // 編集行をロックする。
    return;
  }
  if (!pg.grid.getActiveCell()) {
    window.alert('削除対象行を選択して下さい。');
    return;
  }
  var idx = pg.grid.getActiveCell() ? pg.grid.getActiveCell().row : pg.dataView.getItems().length;
  var data = pg.dataView.getItems();
  if (data.length <= 0) {
    return;
  }
  let dataCell = pg.dataView.getItem(pg.grid.getActiveCell().row);
  switch (pg) {
    // エラーチェック
    case editPGs.pgOOD.d:
    case editPGs.pgMOD.d:      
      if (isSet(dataCell['moed_accept_date'])) {
        alert('検収済みのデータは削除できません');
        return;
      }  
      if (isSet(dataCell['moed_order_date'])) {
        // 発注書発行済み
        if (!confirm('発注書発行済みですが、データ削除しますか？')) {
          return;
        }
      }  
      break;
    case editPGs.pgAOO.d:
    case editPGs.pgAT.d:
      // 部分検収 
      if (isSet(dataCell['moed_accept_date'])) {
        alert('検収済みのデータは削除できません');
        return;
      }  
      if (isSet(dataCell['moed_order_date'])) {
        // 発注書発行済み
        if (!confirm('発注書発行済みですが、データ削除しますか？')) {
          return;
        }
      }
      break;
    case editPGs.pgMST.d:      
      // 入庫登録 
      if (isSet(dataCell['moed_accept_date'])) {
        alert('検収済みのデータは削除できません');
        return;
      }  
      if (isSet(dataCell['moed_order_date'])) {
        // 発注書発行済み
        if (!confirm('発注書発行済みですが、データ削除しますか？')) {
          return;
        }
      }
      break;
    // case editPGs.pgOOD.d:
    //   // let dataCell = pg.dataView.getItem(pg.grid.getActiveCell().row);
    //   if (isSet(dataCell['moed_accept_date'])) {
    //     alert('検収済みのデータは削除できません');
    //     return;
    //   }
    //   if (isSet(dataCell['moed_order_date'])) {
    //     // 発注書発行済み
    //     if (!confirm('発注書発行済みですが、データ削除しますか？')) {
    //       return;
    //     }
    //   }
    //   break;
    // case editPGs.pgAOO.d:
    //   // let dataCell = pg.dataView.getItem(pg.grid.getActiveCell().row);
    //   if (isSet(dataCell['moed_accept_date'])) {
    //     alert('検収済みのデータは削除できません');
    //     return;
    //   }
    //   if (isSet(dataCell['moed_order_date'])) {
    //     // 発注書発行済み
    //     if (!confirm('発注書発行済みですが、データ削除しますか？')) {
    //       return;
    //     }
    //   }
    //   break;
    case editPGs.pgProdplans.d:
      if (isSet(dataCell['pd_leaf_create_date'])) {
        alert('製造リーフ発行済みデータは削除できません');
        return;
      }
      // if (dC['pd_weave_sign'] === '1') {
      //   alert('金網指示作成済みデータは削除できません');
      //   return;
      // }
      break;
    // case editPGs.pgProdMold.d:
    //   // 金網指図
    //   if (isSet(dataCell['pw_leaf_create_date'])) {
    //     alert('製造リーフ発行済みデータは削除できません。');
    //     return;
    //   }
    //   break;
    case editPGs.pgED.d:
      // 見積画面
      if (parseInt(dataCell['ed_prod_plan_sign']) >= 1) {
        // 製造指示がでていたら削除不可
        alert('製造指示済みデータは削除できません。');
        return;
      }
      break;

    case editPGs.pgSD.d:
      // 出荷予定画面
      if (isSet(dataCell['sd_shipment_date']))  {
        // if (isSet(dataCell['s_shipping_date'])) {}
        // 出荷日が入っていたら削除不可
        alert('出荷済みなので、削除できません。');
        return;
      }
      break;
    default:
      if (!pg.dataView.getItem(pg.grid.getActiveCell().row)['isNewRow']) {
        // window.alert('登録済みの行を削除する場合は、[削除]列にチェックを入れてから[登録]を押して下さい。');
        window.alert('データが入力されている行は削除できません。');
        return;
      }
  }
  data.splice(idx, 1);
  pg.dataView.setItems(data);
  pg.dataView.refresh();
}

/**
 * 検収済みのデータかどうか。true:検収済み　
 */
function isAcceptSheet(pg) {
  let detail = pg.dataView.getItems();
  let cnt = 0;
  let cntData = 0;
  let screenMode = pg.divId;
  // 指定画面が一覧画面か、編集画面かによって発注番号の取得もとデータが異なるため、指定画面を判定
  let arActive;
  if (~screenMode.indexOf('Edit')){
    arActive = pg.dataView.getItems()[0]; 
  } else {
    arActive = pg.getActiveRow();
  }

  for (let i = 0; i < detail.length; i++) {
    if (arActive['moed_order_no'] !== detail[i]['moed_order_no']) {
      // 一覧画面で、指定した行の注文番号のみを調査するため、一覧画面指定の場合はこのif文を通る
      continue;
    }
    ++cntData;
    if (isSet(detail[i]['moed_accept_date'])) {
      ++cnt;
    }
  }
  if (cnt === cntData) {
    // 発注データの明細が全て検収済みの場合
    return true;
  }
  return false;
}

/**
 * 全レコード発注書発行済みか　true発行済み
 */
function isOrderSheet(pg) {
  let header = pg.h.dataView.getItems();
  let detail = pg.d.dataView.getItems();
  let cnt = 0;

  for (let i = 0; i < detail.length; i++) {
    if (isSet(detail[i]['moed_order_date'])) {
      cnt++;
    }
  }
  if (cnt === detail.length) {
    return true;
  }
  return false;
}

/**
 * メイン画面データから発注書発行済みかチェック
 * 検収済みチェックを追加する。
 */
function isOrderSheetMain(pgMain) {
  // 選択行データを取得
  let activeRow = pgMain.getActiveRow();
  let cnt = 0;
  for (let i = 0; i < activeRow.length; i++) {
    const elem = activeRow[i];
    if (isSet(elem['moed_order_date'])) {
      cnt++;
    }
  }
  if (cnt === activeRow.length) {
    return true;
  }
  return false;
}

/**
 * ヘッダー名の存在チェック
 */
function findColumnIndexByName(cols, name) {
  for (var i = 0; i < cols.length; i++) {
    if (cols[i]['name'] === name) {
      // チェックボックスがカラムに入っていてCSVには出力しないため、-1した値を返す
      return i-1;
    }
  }
  return -1; // ヘッダー名が見つからなかった場合
}

/**
 * CSVファイルを出力する
 * @param {PlannerGrid} pg 
 */
function exportGridToCSV(pg) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var processRow = function (row, orderNoIndex) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null || typeof row[j] == 'undefined' ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      // 「受注No」の列の場合
      if (j == orderNoIndex) { 
        innerValue = '="' + innerValue + '"';
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|;|\n)/g) >= 0)
        result = '"' + result + '"';
      if (j > 0)
        finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };
  var cols = pg.grid.getColumns();
  var csvFile = '';
  var rows = [];
  var colname = [];
  // 列見出し
  var grlen = pg.grid.getColumns().length;
  for (var j = 0; j < grlen; j++) {
    if (pg.grid.getColumns()[j].name.indexOf('checkbox') >= 0) {
      // チェックボックスは表記しない
    } else {
      colname.push(pg.grid.getColumns()[j].name);
    }
  }
  rows.push(colname);
  // 各行の内容を代入
  var singlerow = [];
  var dvlen = pg.dataView.getLength();
  for (var i = 0; i < dvlen; i++) {
    for (var k = 0; k < grlen; k++) {
      // フォーマッターが指定されていれば適用
      if (cols[k]['formatter']) {
        var v = cols[k]['formatter'](null, null, pg.grid.getDataItem(i)[cols[k]['field']], null, pg.grid.getDataItem(i));
        if (String(v).indexOf('checkbox') >= 0) {
          // チェックボックスは省く
        } else if (cols[k]['field'] === "ignore_cal" && (v['value']).toString() === '0') {
          // リストボックスの場合、0は0として代入させる
          singlerow.push(0);
        } else {
          singlerow.push(v['value'] ? v['value'] : v['text']);
        }
      } else {
        singlerow.push(pg.grid.getDataItem(i)[cols[k]['field']]);
      }
    }
    rows.push(singlerow);
    singlerow = [];
  }
  var rowlen = rows.length;
  var orderNoIndex = findColumnIndexByName(cols, '受注No');
  for (var l = 0; l < rowlen; l++) {
    csvFile += processRow(rows[l], orderNoIndex);
  }
  // ダウンロード
  let csvName = '';
  // CSVの名前を設定
  switch (pg.divId) {
    case 'Prodplans':
      csvName = '製造計画';
      break;
    case 'Shipplans':
      csvName = '出荷計画';
      break;
    case 'ED':
      csvName = '見積書データ';
      break;
    case 'LP':
      csvName = '製作指示書';
      break;
    // case 'MOED':
    //   csvName = '材料見積依頼書データ';
    //   break;
    case 'MOD':
      csvName = '発注データ';
      break;
    // case 'OOED':
    //   csvName = '外注見積依頼書データ';
    //   break;
    case 'OOD':
      csvName = '外注注文書データ';
      break;
    case 'SD':
      csvName = '納品書データ';
      break;
    case 'BD':
      csvName = '請求書データ';
      break;
    case 'ST':
      csvName = '入出庫履歴';
      break;
    case 'User':
      csvName = '社員';
      break;
    case 'Customer':
      csvName = '客先';
      break;
    case 'Customerpost':
      csvName = '客先部署';
      break;
    case 'Customercharge':
      csvName = '客先担当者';
      break;
    case 'Material':
      csvName = '材料';
      break;
    case 'Process':
      csvName = '工程';
      break;
    case 'Permissions':
      csvName = '権限';
      break;
    case 'Housecompany':
      csvName = '自社';
      break;
    case 'Product':
      csvName = '製品';
      break;
    case 'Bom':
      csvName = 'BOM';
      break;
    case 'BomAssignableTo':
      csvName = 'BOM割当';
      break;
    case 'Projects':
      csvName = 'プロジェクト';
      break;
    case 'Members':
      csvName = 'メンバー';
      break;
    case 'Storereasons':
      csvName = '事由';
      break;
    case 'Warehouse':
      csvName = '倉庫';
      break;
    case 'Unit':
      csvName = '数量単位';
      break;
    case 'Tax':
      csvName = '税率';
      break;
    case 'Inspection':
      csvName = '検査数';
      break;
    case 'Inspectionview':
      csvName = '検査表示';
      break;
    case 'Payment':
      csvName = '受払種別';
      break;
    case 'Arrangement':
      csvName = '加工内容';
      break;
    // case 'Storage':
    //   csvName = '在庫';
    // break;
    case 'Gari':
      csvName = 'ガリ機';
      break;
    case 'Weave':
      csvName = '織機';
      break;
    case 'Cam':
      csvName = 'カム';
      break;
    case 'Mold':
      csvName = '金型';
      break;
    case 'Transportcompany':
      csvName = '運送会社';
      break;
    case 'wbsctrl':
      csvName = 'リーフ設定';
      break;
    case 'Currency':
      csvName = '金種';
      break;
    case 'Packing':
      csvName = '荷姿';
      break;
    case 'EditED':
      csvName = '見積取込';
      break;
    default:
      csvName = 'export';
      break;
  }
  var blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvFile], { type: 'text/csv' });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, csvName + '.csv');
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', csvName + '.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}


function exportGridToExcel(pg) {
  if (Slick.GlobalEditorLock.isActive() && !Slick.GlobalEditorLock.commitCurrentEdit()) {
    return;
  }
  var processRow = function (row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null || typeof row[j] == 'undefined' ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|;|\n)/g) >= 0)
        result = '"' + result + '"';
      if (j > 0)
        finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };
  var cols = pg.grid.getColumns();
  var csvFile = '';
  var rows = [];
  var colname = [];
  // 列見出し
  var grlen = pg.grid.getColumns().length;
  for (var j = 0; j < grlen; j++) {
    if (pg.grid.getColumns()[j].name.indexOf('checkbox') >= 0) {
      // チェックボックスは表記しない
    } else {
      colname.push(pg.grid.getColumns()[j].name);
    }
  }
  rows.push(colname);
  // 各行の内容を代入
  var singlerow = [];
  var dvlen = pg.dataView.getLength();
  for (var i = 0; i < dvlen; i++) {
    for (var k = 0; k < grlen; k++) {
      // フォーマッターが指定されていれば適用
      if (cols[k]['formatter']) {
        var v = cols[k]['formatter'](null, null, pg.grid.getDataItem(i)[cols[k]['field']], null, pg.grid.getDataItem(i));
        if (String(v).indexOf('checkbox') >= 0) {
          // チェックボックスは省く
        } else if (cols[k]['field'] === "ignore_cal" && (v['value']).toString() === '0') {
          // リストボックスの場合、0は0として代入させる
          singlerow.push(0);
        } else {
          singlerow.push(v['value'] ? v['value'] : v['text']);
        }
      } else {
        singlerow.push(pg.grid.getDataItem(i)[cols[k]['field']]);
      }
    }
    rows.push(singlerow);
    singlerow = [];
  }
  var rowlen = rows.length;
  for (var l = 0; l < rowlen; l++) {
    csvFile += processRow(rows[l]);
  }
  // ダウンロード
  let csvName = '見積取込';
  // var blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvFile], { type: 'text/csv' });
  var blob = new Blob([csvFile], { type: ''});
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, csvName + '.xlsx');
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', csvName + '.xlsx');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

/**
 * 主キーの列名を返す
 * @param {*} column
 */
function getPKField(column) {
  var result;
  column.forEach(function (elem) {
    if (elem['isPK'] === true) {
      result = elem['field'];
    }
  });
  return result;
}

/**
 * 列情報初期設定
 */
function definePGColumns() {
  // メイングリッド初期設定(editorは登録画面でのみ有効とする)
  mainPGs.pgProdplans.columns = [ // 製造計画
    { id: 'pd_prod_plan_no', name: '製造指図No', field: 'pd_prod_plan_no', isHeaderPK: true, width: 100, },
    { id: 'pd_place_cd', name: '場所', field: 'pd_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, width: 120, isHeader: true, },
    { id: 'pd_finish_plan_date_h', name: '製造完了予定日', field: 'pd_finish_plan_date_h', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 120, isHeader: true, },
    { id: 'pd_ar_cd', name: '選択', field: 'pd_ar_cd', editor: selectCellParrangeEditor, formatter: selectCellParrangeFormatter, isHeader: true, width: 100, },
    { id: 'pd_ins_level', name: '検査水準', field: 'pd_ins_level', editor: SelectCellEditorValue, /*formatter: function (r, c, v, dC, dC) { return inspectionNum(dC, 'pd_ins_level', 'pd_ins_num'); },*/paramfunc: inspectionNum, SelectCellFormatter, options: [{ key: 1, val: '1' }, { key: 2, val: '2' },], isHeader: true, width: 90, },
    { id: 'pd_process_cd_30', name: '30:切断', field: 'pd_process_cd_30', editor: Slick.Editors.Text, isHeader: true, width: 80, },
    { id: 'pd_process_cd_40', name: '40:加工', field: 'pd_process_cd_40', editor: Slick.Editors.Text, isHeader: true, width: 80, },
    { id: 'pd_process_cd_50', name: '50:振動篩', field: 'pd_process_cd_50', editor: Slick.Editors.Text, isHeader: true, width: 80, },
    { id: 'pd_process_cd_80', name: '80:シート製作', field: 'pd_process_cd_80', editor: Slick.Editors.Text, isHeader: true, width: 90, },
    // ^^^^^^^^^^^detail
    { id: 'pd_prod_plan_sub_no', name: '製枝', field: 'pd_prod_plan_sub_no', editor: Slick.Editors.Text, validator: preventModifyValidator, width: 60, isPK: true, },
    { id: 'pd_disp_order', name: '指示G', field: 'pd_disp_order', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 50, },
    { id: 'pd_e_estimate_no', name: '受注No', field: 'pd_e_estimate_no', width: 100 },
    { id: 'pd_e_estimate_sub_no', name: '受枝', field: 'pd_e_estimate_sub_no', width: 50, },
    { id: 'pd_p_cd', name: '品名CD', field: 'pd_p_cd', editor: IdEditor, ref: 'product', width: 100, },
    { id: 'pd_p_name', name: '品名', field: 'pd_p_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'pd_p_name', 'p_name', 'product', dC['pd_p_cd']); }, width: 160, },
    { id: 'pd_par_cd', name: '加工内容', field: 'pd_par_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, width: 100, },
    { id: 'pd_ed_sub_01', name: '線径・線幅①', field: 'pd_ed_sub_01', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'pd_ed_sub_01', dC); }, cssClass: 'right-align', },
    { id: 'pd_ed_sub_12', name: '線厚み①', field: 'pd_ed_sub_12', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return set0ToEmpty(dC, 'pd_ed_sub_12'); }, cssClass: 'right-align', },
    { id: 'pd_ed_sub_02', name: '線径・線幅②', field: 'pd_ed_sub_02', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputSameValueN(dC, 'pd_ed_sub_02', dC['pd_ed_sub_01']); }, cssClass: 'right-align', },
    { id: 'pd_ed_sub_13', name: '線厚み②', field: 'pd_ed_sub_13', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return set0ToEmpty(dC, 'pd_ed_sub_13'); }, cssClass: 'right-align', },
    { id: 'pd_wire', name: '線番', field: 'pd_wire', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return viewInteger(dC, 'pd_wire'); }, cssClass: 'right-align' },
    { id: 'pd_ed_sub_03', name: '目合', field: 'pd_ed_sub_03', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '', val: '' }, { key: 'P', val: 'P' },], },
    { id: 'pd_ed_sub_04', name: 'W', field: 'pd_ed_sub_04', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'pd_ed_sub_04', dC); }, cssClass: 'right-align', },
    { id: 'pd_ed_sub_05', name: 'L', field: 'pd_ed_sub_05', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputSameValueN(dC, 'pd_ed_sub_05', dC['pd_ed_sub_04']); }, cssClass: 'right-align', },
    { id: 'pd_ed_sub_06', name: '単位', field: 'pd_ed_sub_06', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: 'mm', val: 'mm' }, { key: 'mesh', val: 'mesh' },], width: 50, },
    { id: 'pd_ed_sub_08', name: '寸法➀', field: 'pd_ed_sub_08', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'pd_ed_sub_08', dC); }, cssClass: 'right-align', },
    { id: 'pd_ed_sub_10', name: '寸法➀補足', field: 'pd_ed_sub_10', editor: Slick.Editors.Text, },
    { id: 'pd_ed_sub_09', name: '寸法➁', field: 'pd_ed_sub_09', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'pd_ed_sub_09', dC); }, cssClass: 'right-align' },
    { id: 'pd_ed_sub_11', name: '寸法➁補足', field: 'pd_ed_sub_11', editor: Slick.Editors.Text, },
    { id: 'pd_ed_quantity', name: '製造数量', field: 'pd_ed_quantity', formatter: decimal0Formatter, editor: Slick.Editors.Text,cssClass: 'right-align' },
    { id: 'pd_unit', name: '単位', field: 'pd_unit', formatter: function (r, c, v, cD, dC) { return masterFormatterProdUnit(dC, 'pd_unit', dC['pd_p_cd']); }, },
    { id: 'pd_ins_qty', name: '検査数', field: 'pd_ins_qty', editor: Slick.Editors.Text, formatter: decimal0Formatter, /*validator: integerValidator,*/ width: 50, },
    { id: 'pd_finish_plan_date', name: '完了予定日', field: 'pd_finish_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 100, },
    { id: 'pd_e_customer_cd', name: '客先CD', field: 'pd_e_customer_cd', width: 80, },
    { id: 'pd_e_customer_charge_cd', name: '営業担当者CD', field: 'pd_e_customer_charge_cd', width: 100, },
    { id: 'pd_e_desired_delivery_date', name: '希望納期', field: 'pd_e_desired_delivery_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 100, },
    { id: 'pd_leaf_create_flg', name: 'リーフ発行区分', field: 'pd_leaf_create_flg', /*editor: SelectCellEditorValue,*/ formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 100, },
    { id: 'pd_finish_date', name: '製造完了日', field: 'pd_finish_date', width: 100, },
    { id: 'pd_ed_remarks', name: '備考(受注備考修正)', field: 'pd_ed_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 300, width: 150, },
  ];
  mainPGs.pgED.columns = [  // 見積書画面
    // Header======================================================================================
    { id: 'e_customer_cd', name: '客先CD', field: 'e_customer_cd', editor: IdEditor, ref: 'customer', validator: masterNNValidator, isHeaderPK: true, formatter: function (r, c, v, cD, dC) { return setGridCustomerCD(v, dC, 'e_customer_cd'); }, width: 60, },
    { id: 'e_customer_name', name: '得意先名', field: 'e_customer_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['e_customer_cd']); }, isHeader: true, width: 150, },
    { id: 'e_customer_post_cd', name: '客先部署CD', field: 'e_customer_post_cd', editor: IdEditor, ref: 'customerpost', validator: function (v, i, c) { return masterValidator(i['e_customer_cd'] + '-' + v, i, c); }, isHeaderPK: true, width: 100, },
    { id: 'e_customer_post_name', name: '部署名', field: 'e_customer_post_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_customer_post_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_customer_post_cd']); }, isHeader: true, width: 150, },
    { id: 'e_customer_sales_name', name: '担当者名', field: 'e_customer_sales_name', editor: Slick.Editors.Text, isHeader: true, width: 100, },
    { id: 'e_salesman_cd', name: '受注者CD', field: 'e_salesman_cd', editor: IdEditor, ref: 'user', validator: masterNNValidator, isHeaderPK: true, width: 70, },
    { id: 'e_salesman_name', name: '受注者名', field: 'e_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_salesman_name', 'USER_NAME', 'user', dC['e_salesman_cd']); }, isHeader: true, width: 70, },
    { id: 'e_estimate_date', name: '受注日', field: 'e_estimate_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateNNValidator, isHeaderPK: true, width: 90, },
    // ed_type_03
    { id: 'e_estimate_sign', name: '受注区分', field: 'e_estimate_sign', /*editor: SelectCellEditor,*/ formatter: function (r, c, v, cD, dC) { return setAcceptED(dC, 'e_estimate_sign'); }, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], isHeader: true, width: 60, },
    { id: 'e_desired_delivery_date', name: '希望納期', field: 'e_desired_delivery_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, /* validator: dateValidator,*/ isHeader: true, isInfoHeader: true, width: 100, },
    { id: 'e_delivery_string', name: '帳票用納期欄文字', field: 'e_delivery_string', editor: Slick.Editors.Text, maxlength: 10, isHeader: true, width: 100, },
    { id: 'e_shipplan_date', name: '出荷予定日', field: 'e_shipplan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, isInfoHeader: true, width: 100, },
    { id: 'e_delivery_timing', name: '時期', field: 'e_delivery_timing', editor: SelectCellEditor, formatter: SelectCellFormatter, options: [{ key: '1', val: '頃' }, { key: '2', val: 'まで' }, { key: '3', val: '指定' },], isHeader: true, width: 80, },
    { id: 'e_repeat', name: '受注参照', field: 'e_repeat', formatter: function (r, c, v, cD, dC) { return isRepeat(dC, 'e_repeat', dC['e_repeat_estimate_no']); }, isHeader: true, width: 60, },
    { id: 'e_repeat_estimate_no', name: '参照受注No', field: 'e_repeat_estimate_no', /*editor: Slick.Editors.Text, validator: textValidator,*/ isHeader: true, width: 80, },
    // 2023/4/24　受注Noを先にセットするのではなく、登録ボタン押下でセットするように変更する。
    // { id: 'e_estimate_no', name: '受注No', field: 'e_estimate_no', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return setEstimateNo(v, dC); }, maxlength: 11, isHeaderPK: true, width: 80, },
    { id: 'e_estimate_no', name: '受注No', field: 'e_estimate_no', editor: DisabledTextEditor, maxlength: 11, isHeaderPK: true, width: 80, },
    { id: 'e_customer_order_no', name: '先方注文No.', field: 'e_customer_order_no', editor: Slick.Editors.Text, validator: textValidator, maxlength: 40, isHeader: true, width: 150, },
    { id: 'e_sum_area', name: '合計面積', field: 'e_sum_area', formatter: function (r, c, v, cD, dC) { return viewDecimal(dC, 'e_sum_area', 2); }, isHeader: true, width: 80, cssClass: 'right-align',},
    { id: 'e_sum_price', name: '合計金額', field: 'e_sum_price', formatter: toJPYFormatter, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'e_packing_num', name: '梱包数', field: 'e_packing_num', editor: Slick.Editors.Integer, validator: integerValidator, width: 120, isHeader: true, },
    { id: 'e_tc_short_name', name: '運送会社', field: 'e_tc_short_name', editor: selectCellTransportEditor, formatter: selectCellTransportCompanyFormatter, isHeader: true, width: 120, },
    { id: 'e_shipper_cd', name: '出荷主', field: 'e_shipper_cd', editor: IdEditor, ref: 'customership', /*validator: function (v, i, c) { return masterValidator(i['e_customer_cd']  + '-' + v, i, c); },*/ isHeader: true, width: 60, },
    { id: 'e_shipper_name', name: '出荷主名称', field: 'e_shipper_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_shipper_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_shipper_cd']); }, isHeader: true, width: 130, },
    { id: 'e_delivery_cd', name: '納入先CD', field: 'e_delivery_cd', editor: IdEditor, ref: 'customership', isHeader: true, width: 60, },
    { id: 'e_delivery_name', name: '納入先名称', field: 'e_delivery_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_delivery_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_delivery_cd']); }, isHeader: true, width: 130, },
    { id: 'e_stay_cd', name: '止め先', field: 'e_stay_cd', editor: IdEditor, ref: 'customership', isHeader: true, width: 60, },
    {
      id: 'e_stay_name', name: '止め先名称(支店止め)', field: 'e_stay_name',
      formatter: function (r, c, v, cD, dC) { return /*getEDDeliveryName(v, 'e_stay_name', dC);*/ masterFormatter(dC, 'e_stay_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_stay_cd']); }, isHeader: true, width: 130,
    },
    { id: 'e_title', name: '件名', field: 'e_title', width: 100, editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, isHeader: true, width: 100, },
    { id: 'e_logo_01', name: '現品票ロゴ', field: 'e_logo_01', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: 'STONE', val: 'STONE' }, { key: 'Takenaka Wire Cloth Co,.Ltd', val: 'Takenaka Wire Cloth Co,.Ltd' }, { key: '竹中金網 株式会社', val: '竹中金網 株式会社' }, { key: '', val: '' },], maxlength: 30, isHeader: true, width: 100, },
    { id: 'e_logo_02', name: '現品票ロゴ手入力', field: 'e_logo_02', editor: Slick.Editors.Text, maxlength: 30, isHeader: true, width: 100, },
    { id: 'e_remark_01', name: '備考', field: 'e_remark_01', editor: Slick.Editors.Text, maxlength: 30, isHeader: true, width: 100, },
    { id: 'all_ed_ar_cd', name: '製品手配方法(一括選択)', field: 'all_ed_ar_cd', editor: selectCellParrangeEditor, formatter: SelectAllEstimateParrangement, isHeader: true, width: 130, },
    { id: 'all_ed_parrangement_cd', name: '加工内容(一括選択)', field: 'all_ed_parrangement_cd', editor: selectCellArrangeEditor, formatter: SelectAllEstimateArrangement, isHeader: true, width: 130, },
    // Detail=============================================================
    { id: 'ed_estimate_sub_no', name: '枝番', field: 'ed_estimate_sub_no', formatter: function (c, v, r, cD, dC) { return setSubNo('ed_estimate_sub_no', dC); }, validator: textNNValidator, maxlength: 3, isPK: true, width: 50, },
    { id: 'calcno', name: '計算', field: 'calcno', editor: Slick.Editors.Text, validator: calcTypeValidator, maxlength: 1, width: 50, },
    { id: 'ed_p_cd', name: '品名CD', field: 'ed_p_cd', editor: IdEditor, ref: 'product', /*editor: AutoCompleteEditor, dataSource: master['product'],*/ validator: masterValidator, width: 90, },
    {
      id: 'ed_p_name', name: '品名', field: 'ed_p_name', formatter: function (r, c, v, cD, dC) { return edProductNameFormatter(dC, 'ed_p_name', 'p_name', 'product', dC['ed_p_cd']); },
      validator: textValidator, width: 150,
    },
    { id: 'ed_parrangement_cd', name: '加工内容', field: 'ed_parrangement_cd', editor: selectCellArrangeEditor, formatter: selectCellArrangeFormatter, options: dropdownMaster.arrangement, width: 120, },
    { id: 'ed_sub_01', name: '線径・線幅①', field: 'ed_sub_01', editor: Slick.Editors.Text, cssClass: 'right-align', width: 80, },
    { id: 'ed_sub_12', name: '線厚み①', field: 'ed_sub_12', editor: Slick.Editors.Text, cssClass: 'right-align', width: 60, },
    { id: 'ed_sub_02', name: '線径・線幅②', field: 'ed_sub_02', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputSameValueN(dC, 'ed_sub_02', dC['ed_sub_01']); }, cssClass: 'right-align', width: 80, },
    { id: 'ed_sub_13', name: '線厚み②', field: 'ed_sub_13', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputSameValueN(dC, 'ed_sub_13', dC['ed_sub_12']); }, cssClass: 'right-align', width: 60, },
    { id: 'ed_sub_num_03', name: '線番', field: 'ed_sub_num_03', editor: Slick.Editors.Integer, formatter: decimal0Formatter,  cssClass: 'right-align', width: 50, },
    { id: 'ed_sub_03_str', name: '目合', field: 'ed_sub_03_str', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '', val: '' }, { key: 'P', val: 'P' },], maxlength: 1, width: 50, },
    { id: 'ed_sub_04', name: 'W', field: 'ed_sub_04', editor: Slick.Editors.Text, cssClass: 'right-align', width: 50, },
    { id: 'ed_sub_05', name: 'L', field: 'ed_sub_05', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputSameValueN(dC, 'ed_sub_05', dC['ed_sub_04']); }, cssClass: 'right-align', width: 50, },
    { id: 'ed_sub_06', name: '単位', field: 'ed_sub_06', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: 'mm目', val: 'mm目' }, { key: 'mm', val: 'mm' }, { key: 'mesh', val: 'mesh' },], width: 70, },
    { id: 'ed_sub_08', name: '寸法➀', field: 'ed_sub_08', editor: Slick.Editors.Text, cssClass: 'right-align', width: 60, },
    { id: 'ed_sub_10', name: '寸法➀補足', field: 'ed_sub_10', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 60, },
    { id: 'ed_sub_09', name: '寸法➁', field: 'ed_sub_09', editor: Slick.Editors.Text, cssClass: 'right-align', width: 70, },
    { id: 'ed_sub_11', name: '寸法➁補足', field: 'ed_sub_11', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 70, },
    { id: 'ed_quantity', name: '受注数', field: 'ed_quantity', editor: Slick.Editors.Text, formatter: decimal3Formatter, cssClass: 'right-align', width: 50, },
    { id: 'ed_unit_tran', name: '単位', field: 'ed_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, maxlength: 10, width: 50, },
    // { id: 'ed_unit_tran', name: '単位', field: 'ed_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unitASC, maxlength: 10, width: 50, },
    { id: 'ed_type_subject', name: '科目区分', field: 'ed_type_subject', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '1', val: '製品' }, { key: '2', val: 'リセール品' },  { key: '3', val: '半製品' }, { key: '4', val: '原材料品' }, { key: '5', val: '包装資材' }, { key: '6', val: 'リセール加工品' }, { key: '7', val: '経費' } ], width: 100, },
    { id: 'ed_type_04', name: '現品票枚数', field: 'ed_type_04', editor: SelectCellEditor, formatter: SelectCellFormatter, options: [{ key: '0', val: 'まとめる' }, { key: '1', val: '受注数' },], width: 80, },
    {
      id: 'ed_sub_num_01', name: '面積', field: 'ed_sub_num_01',
      formatter: function (r, c, v, cD, dC) { return calcEstAreaFormatter(dC, 'ed_sub_num_01'); }, cssClass: 'right-align', footerfunc: sumDecimalFooter,
    },
    { id: 'ed_unit_price', name: '単価', field: 'ed_unit_price', editor: Slick.Editors.Integer, formatter: toJPYDec0Formatter, cssClass: 'right-align', width: 80, },
    {
      id: 'ed_price', name: '金額', field: 'ed_price', formatter: function (r, c, v, cD, dC) { return toJPYFormatter(r, c, calcFormatter(dC, 'ed_price', dC['ed_quantity'] * dC['ed_unit_price'])['text'], cD, dC); }, 
      footerfunc: sumJPYFooter, cssClass: 'right-align', width: 80,
    },
    { id: 'ed_cost', name: '原価', field: 'ed_cost', editor: Slick.Editors.Integer, cssClass: 'right-align', width: 80, },
    { id: 'ed_desired_delivery_date', name: '希望納期', field: 'ed_desired_delivery_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, /*maxlength: 100,*/ width: 100, },
    { id: 'ed_customer_order_no', name: '先方注文No. or 図番/JobCD', field: 'ed_customer_order_no', editor: Slick.Editors.Text, validator: textValidator, maxlength: 40, width: 150, },
    { id: 'ed_customer_p_name', name: '先方品名', field: 'ed_customer_p_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 100, width: 150, },
    { id: 'ed_ar_cd', name: '製品手配方法', field: 'ed_ar_cd', editor: selectCellParrangeEditor, formatter: selectCellParrangeFormatter, width: 100, },
    { id: 'ed_warehouse_cd', name: '予定入庫先', field: 'ed_warehouse_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, width: 100, },
    { id: 'ed_prod_plan_sign', name: '製造計画', field: 'ed_prod_plan_sign',  /*editor: SelectCellEditor,*/ formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '指示' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'ed_packing_group', name: '梱包G', field: 'ed_packing_group', editor: Slick.Editors.Text, },
    { id: 'ed_packing_size', name: 'サイズ', field: 'ed_packing_size', editor: Slick.Editors.Text, },
    { id: 'ed_packing_num', name: '梱包数', field: 'ed_packing_num', editor: Slick.Editors.Integer, validator: integerValidator, },
    { id: 'ed_packing_cd', name: '荷姿CD', field: 'ed_packing_cd', ref: 'packing', editor: IdEditor, validator: masterValidator, },
    { id: 'pkg_name', name: '荷姿名', field: 'pkg_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'pkg_name', 'pkg_name', 'packing', dC['ed_packing_cd']); }, },
    { id: 'ed_packing_content', name: '荷姿詳細', field: 'ed_packing_content',  editor: Slick.Editors.Text,  maxlength: 40,},
    // { id: 'ed_delivery_cd', name: '納入先', field: 'ed_delivery_cd', editor: IdEditor, ref: 'customerpost', maxlength: 50, },
    // {
    //   id: 'ed_delivery_name', name: '納入先名', field: 'ed_delivery_name',
    //   formatter: function (r, c, v, cD, dC) { return /*getEDDeliveryName(v, 'ed_delivery_name', dC);*/ masterFormatter(dC, 'ed_delivery_name', 'CP_POST_NAME', 'customerpost', $("#customer-cd").val() + '-' + dC['ed_delivery_cd']); }, maxlength: 50,
    // },
    { id: 'ed_detail_remarks', name: '備考', field: 'ed_detail_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 100, },
    // Detail========================================================================
  ];
  // mainPGs.pgLP.columns = [ // 製作指示書画面
  //   {id:'pd_prod_plan_no', name: '	製造指図No.', field: '	pd_prod_plan_no', isHeaderPK: true, },
  //   {id:'pd_place_cd'	, name:'	場所'	, field:'	pd_place_cd'	, isHeader: true, },
  //   {id:'pd_place_name'	, name:'	場所名'	, field:'	pd_place_name'	, isHeader: true, },
  //   {id:'pd_prod_fin_plan_date'	, name:'	製造完了予定日'	, field:'	pd_prod_fin_plan_date'	, isHeader: true, },
  //   {id:'pd_proj_cd'	, name:'PJCD'	, field:'	pd_proj_cd'	, isHeader: true, },
  //   {id:'pd_proj_name'	, name:'PJ名'	, field:'	pd_proj_name'	, isHeader: true, },
  //   {id:'pd_proj_name'	, name:'選択'	, field:'	pd_proj_name'	, isHeader: true, },
  //   {id:'pd_proj_name'	, name:'加工内容'	, field:'	pd_proj_name'	, isHeader: true, },
  //   {id:'pd_prod_plan_sub_no'	, name:'	製枝'	, field:'	pd_prod_plan_sub_no', isPK: true, },	
  //   {id:'pd_select_type', name:'選択', field:'pd_select_type' },
  //   {id:'pd_disp_order', name:'指示Ｇ', field:'pd_disp_order'	 },
  //   {id:'pd_e_estimate_no', name:'受注No', field:'pd_e_estimate_no'	 },
  //   {id:'pd_e_estimate_sub_no', name:'受枝', field:'pd_e_estimate_sub_no'	 },
  //   {id:'pd_p_cd', name:'製品CD', field:'pd_p_cd',	 },
  //   {id:'pd_p_name', name:'製品名称', field:'pd_p_name',	 },
  //   {id:'pd_ed_sub_01', name:'線径・線幅①', field:'pd_ed_sub_01',	 },
  //   {id:'pd_ed_sub_12', name:'線厚み①', field:'pd_ed_sub_12',	 },
  //   {id:'pd_ed_sub_02', name:'線径・線幅②', field:'pd_ed_sub_02',	 },
  //   {id:'pd_ed_sub_13', name:'線厚み②', field:'pd_ed_sub_13',	 },
  //   {id:'ed_wire_no', name:'線番', field:'ed_wire_no',	 },
  //   {id:'ed_sub_03', name:'目合', field:'ed_sub_03',	 },
  //   {id:'pd_ed_sub_04', name:'W', field:'pd_ed_sub_04',	 },
  //   {id:'pd_ed_sub_05', name:'Ｌ', field:'pd_ed_sub_05',	 },
  //   {id:'pd_ed_sub_06', name:'単位', field:'pd_ed_sub_06', editor: SelectCellEditor, formatter: SelectCellFormatter, options: [{ key: '07', val: 'mm' }, { key: '13', val: 'mesh' },], }, 
  //   {id:'pd_ed_sub_08', name:'寸法①', field:'pd_ed_sub_08' },	
  //   {id:'pd_ed_sub_10', name:'寸法①補足', field:'pd_ed_sub_10' },	
  //   {id:'pd_ed_sub_09', name:'寸法②', field:'pd_ed_sub_09'	 },
  //   {id:'pd_ed_sub_11', name:'寸法他補足', field:'pd_ed_sub_11'	 },
  //   {id:'pd_plan_quantity', name:'製造数量'	, field:'pd_plan_quantity'	 },
  //   {id:'pd_product_unit', name:'単位'	, field:'pd_product_unit' },
  //   {id:'pd_finish_plan_date', name:'	完了予定日', field:'pd_finish_plan_date'	 },
  //   {id:'pd_e_customer_cd', name:'客先ID'	, field:'pd_e_customer_cd' },
  //   {id:'pd_e_customer_varcharge_cd', name:'営業担当ID'	, field:'pd_e_customer_varcharge_cd'	 },
  //   {id:'pd_e_desired_delivery_date', name:'希望納期'	, field:'pd_e_desired_delivery_date' },
  //   {id:'pd_leaf_create_date', name:'	ﾘｰﾌ発行'	, field:'pd_leaf_create_date'	 },
  //   {id:'pd_finish_date', name:'製造完了日', field:'pd_finish_date'	 },
  //   {id:'ed_marks', name:'備考', field:'ed_marks'	 },
  //   {id:'isDelete', name:'削除', field:'isDelete'	 },

  // ];
  mainPGs.pgMOD.columns = [ // 発注一覧
    // 発注画面から遷移する編集画面が3つにわたるので、それぞれisHeader,is2Header,is3Headerで、ここに無理やり設定しているので注意
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, isHeaderPK: true, width: 130, },
    { id: 'moed_customer_cd', name: '仕入先CD', field: 'moed_customer_cd', editor: IdEditor, ref: 'customer', validator: masterNNValidator, maxlength: 3, isHeader: true, },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, isHeader: true, width: 200, },
    { id: 'moed_arrival_hd_date', name: '入荷予定日', field: 'moed_arrival_hd_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 100, },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', editor: Slick.Editors.Text, editor: IdEditor, ref: 'user', validator: masterNNValidator, maxlength: 6, width: 100, isHeader: true, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'SALESMAN_NAME', 'USER_NAME', 'user', dC['moed_salesman_cd']); }, isHeader: true, },
    { id: 'moed_manufacture_cd', name: 'メーカー', field: 'moed_manufacture_cd', editor: IdEditor, ref: 'customermaker', validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); }, maxlength: 4, isHeader: true, },
    { id: 'moed_manufacture_name', name: 'メーカー名', field: 'moed_manufacture_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_manufacture_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_manufacture_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_shipper_cd', name: '出荷主CD', field: 'moed_shipper_cd', editor: IdEditor, ref: 'customership', /*validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); },*/ maxlength: 4, isHeader: true, },
    { id: 'moed_shipper_name', name: '出荷主名', field: 'moed_shipper_name', formatter: function (r, c, v, cD, dC) { return moedMasterFormatter(dC, 'moed_shipper_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_shipper_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_delivery_cd', name: '納品先CD', field: 'moed_delivery_cd', editor: IdEditor, ref: 'customership', /*validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); },*/ maxlength: 4, isHeader: true, },
    { id: 'moed_delivery_name', name: '納品先名', field: 'moed_delivery_name', formatter: function (r, c, v, cD, dC) { return moedMasterFormatter(dC, 'moed_delivery_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_delivery_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', editor: Slick.Editors.Text, validator: /*referNoValidator*/textValidator, isHeader: true, width: 150, },
    { id: 'moed_sales_price', name: '合計金額', field: 'moed_sales_price', formatter: toJPYDec0Formatter, cssClass: 'right-align', isHeader: true, width: 100, },
    // 2023/5/26 消費税額は、支払処理で複数の発注データをまとめた合計金額に10％の消費税額が計算されるため、発注ごとの消費税額は不要ためコメントアウト（moed_tax_sumにデータが入ってこなくなる）
    // { id: 'moed_tax_sum', name: '消費税額', field: 'moed_tax_sum', formatter: toJPYDec0Formatter, isHeader: true, cssClass: 'right-align', width: 100, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', editor: Slick.Editors.Text, isHeader: true, maxlength: 60, width: 150, },
    { id: 'all_moed_type_subject', name: '科目区分(一括選択)', field: 'all_moed_type_subject', editor: SelectCellEditorMorderestimateTypeSubject, formatter: SelectAllMorderestimateTypeSubject, isHeader: true, width: 130, options: [{ key: '1', val: '製品' }, { key: '2', val: 'リセール品' }, { key: '3', val: '半製品' }, { key: '4', val: '原材料品' }, { key: '5', val: '梱包資材' }, { key: '6', val: 'リセール加工品' }, { key: '7', val: '経費' },] },
    { id: 'all_moed_inventory_type', name: '在庫区分(一括選択)', field: 'all_moed_inventory_type', editor: SelectCellEditorMorderestimateInventoryType, formatter: SelectAllMorderestimateInventoryType, isHeader: true, width: 130, options: [{ key: '1', val: '在庫管理対象' }, { key: '2', val: '対象外' },], },
    { id: 'all_moed_parrangement_cd', name: '加工内容(一括選択)', field: 'all_moed_parrangement_cd', editor: selectCellArrangeEditor, formatter: SelectAllMorderestimateArrangement, isHeader: true, width: 130, },

    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', isDetailPK: true, },
    { id: 'moed_accept_sub_no', name: '検収枝番', field: 'moed_accept_sub_no', maxlength: 2, isDetailPK: true, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', ref: 'product', editor: Slick.Editors.Text, validator: masterValidator, maxlength: 30, width: 130, isDetail: true, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', editor: Slick.Editors.Text, validator: textValidator, formatter: function (r, c, v, cD, dC) { return moedProductNameFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50, width: 200, isDetail: true, },
    { id: 'moed_parrangement_cd', name: '加工内容', field: 'moed_parrangement_cd', editor: selectCellArrangeEditor, formatter: selectCellArrangeFormatter, options: dropdownMaster.arrangement, width: 120, isDetail: true, },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, isDetail: true, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, isDetail: true, },
    // { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', editor: Slick.Editors.Text, validator: textValidator, formatter: function (r, c, v, cD, dC) { return getHouseLotNo(dC, 'moed_type_03');}, width: 100, isDetail: true, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 100, isDetail: true, },
    { id: 'moed_quantity', name: '取引数量', field: 'moed_quantity', editor: Slick.Editors.Text,  formatter: toDecimal3JPYFormatter, cssClass: 'right-align', width: 80, isDetail: true, },
    { id: 'moed_unit_tran', name: '単位', field: 'moed_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 80, isDetail: true, },
    // { id: 'moed_unit_tran', name: '単位', field: 'moed_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unitASC, width: 80, isDetail: true, },
    { id: 'moed_unit_qty', name: '単価数量', field: 'moed_unit_qty', editor: Slick.Editors.Text, formatter: toDecimal3JPYFormatter, footerfunc: sumDecimalJPYFooter, cssClass: 'right-align', width: 80, isDetail: true, },
    { id: 'moed_unit_eval', name: '単位', field: 'moed_unit_eval', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 80, isDetail: true, },
    // { id: 'moed_unit_eval', name: '単位', field: 'moed_unit_eval', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unitASC, width: 80, isDetail: true, },
    { id: 'moed_unit_price', name: '単価', field: 'moed_unit_price', editor: Slick.Editors.Text, formatter: toDecimal3JPYFormatter, cssClass: 'right-align', width: 80, isDetail: true, },
    {
      id: 'moed_money', name: '金額', field: 'moed_money', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcPrice(v, dC, 'moed_money', 0)['text'], cD, dC); }, 
      footerfunc: sumJPYFooter, cssClass: 'right-align', width: 80, isDetail: true,
    },
    // { id: 'moed_money_tax', name: '消費税額', field: 'moed_money_tax', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcTaxPrice(v, dC, 'moed_money_tax')['text'], cD, dC); }, cssClass: 'right-align', isDetail: true, },
    // { id: 'moed_money_inc_tax', name: '税込金額', field: 'moed_money_inc_tax', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcIncTaxPrice(v, dC, 'moed_money_inc_tax')['text'], cD, dC); }, cssClass: 'right-align', isDetail: true, },
    /* 発注品の科目区分に製品は入ってこないが、DB取得上の都合を考慮して入れておく */
    { id: 'moed_type_subject', name: '科目区分', field: 'moed_type_subject', editor: SelectCellEditorMorderestimateTypeSubject, formatter: SelectCellMorderestimateTypeSubject,  function (r, c, v, cD, dC) { return moedProductNameFormatter(dC, 'moed_type_subject', 'p_type_subject', 'product', dC['moed_product_cd']); }, options: [{ key: '1', val: '製品' }, { key: '2', val: 'リセール品' }, { key: '3', val: '半製品' }, { key: '4', val: '原材料品' }, { key: '5', val: '梱包資材' }, { key: '6', val: 'リセール加工品' }, { key: '7', val: '経費' },], isDetail: true,/*isHeader: true, */width: 110, },
    { id: 'moed_inventory_type', name: '在庫区分', field: 'moed_inventory_type', editor: SelectCellEditorMorderestimateInventoryType, formatter: SelectCellMorderestimateInventoryType, options: [{ key: '1', val: '在庫管理対象' }, { key: '2', val: '対象外' },], isDetail: true, width: 90, },
    { id: 'moed_dt_remarks', name: '備考', field: 'moed_dt_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 60, width: 150, isDetail: true, },
    { id: 'moed_type_04', name: '用途区分', field: 'moed_type_04', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [ { key: '0', val: '自社在庫' }, { key: '1', val: '受注分' }, { key: '2', val: '支給品' } ], isDetail: true, width: 110, },

    // 検収画面
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return setMoedNo(v, dC, 'moed_order_no'); }, is2HeaderPK: true, width: 120, },
    { id: 'moed_customer_cd', name: '仕入先CD', field: 'moed_customer_cd', editor: DisabledTextEditor, ref: 'customer', validator: masterNNValidator, maxlength: 3, is2HeaderPK: true, width: 130, },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', /*editor: DisabledTextEditor,*/ formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, width: 150, is2HeaderPK: true, },
    { id: 'moed_manufacture_cd', name: 'メーカー', field: 'moed_manufacture_cd', editor: IdEditor, ref: 'customerpost', validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); }, maxlength: 4, is2Header: true, },
    { id: 'moed_manufacture_name', name: 'メーカー名', field: 'moed_manufacture_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_manufacture_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_manufacture_cd']); }, is2Header: true, width: 150, },
    // { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', /*editor: Slick.Editors.Date, */dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 'moed_arrival_hd_date', name: '入荷日', field: 'moed_arrival_hd_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateNNValidator, width: 120, is2Header: true, },
    { id: 'moed_payment_plan_date', name: '支払予定日', field: 'moed_payment_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is2Header: true, width: 120, },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', ref: 'user', editor: DisabledTextEditor, validator: masterValidator, maxlength: 6, width: 100, is2Header: true, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_salesman_name', 'USER_NAME', 'user', dC['moed_salesman_cd']); }, width: 150, is2Header: true, },
    { id: 'moed_sales_price', name: '合計金額', field: 'moed_sales_price', formatter: toJPYDec0Formatter, cssClass: 'right-align', is2Header: true, width: 150, },
    // 2023/5/26 消費税額は、支払処理で複数の発注データをまとめた合計金額に10％の消費税額が計算されるため、発注ごとの消費税額は不要ためコメントアウト（moed_tax_sumにデータが入ってこなくなる）
    // { id: 'moed_tax_sum', name: '消費税額', field: 'moed_tax_sum', formatter: toJPYDec0Formatter, is2Header: true, cssClass: 'right-align', width: 150, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', editor: DisabledTextEditor, maxlength: 60, width: 150, is2Header: true, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', is2Header: true, width: 150, },
    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', editor: DisabledTextEditor, maxlength: 3, is2DetailPK: true, },
    { id: 'moed_accept_sub_no', name: '分割No', field: 'moed_accept_sub_no', editor: DisabledTextEditor, maxlength: 2, is2DetailPK: true, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', editor: DisabledTextEditor, maxlength: 30, is2Detail: true, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50, width: 200, is2Detail: true, },
    { id: 'moed_parrangement_cd', name: '加工内容', field: 'moed_parrangement_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, width: 120, is2Detail: true, },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is2Detail: true, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is2Detail: true, },
    { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_10', name: '先方ロットNo', field: 'moed_sub_10', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_07', name: 'コイル番号', field: 'moed_sub_07', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_11', name: '製鋼番号', field: 'moed_sub_11', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_num_04', name: '引張強度', field: 'moed_sub_num_04', editor: Slick.Editors.Text, validator: textValidator, maxlength: 12, width: 100, is2Detail: true, },
    { id: 'moed_sub_12', name: '荷姿', field: 'moed_sub_12', editor: Slick.Editors.Text, validator: textValidator, maxlength: 5, width: 100, is2Detail: true, },
    { id: 'pkg_name', name: '荷姿名', field: 'pkg_name', editor: Slick.Editors.Text, validator: textValidator, width: 100, is2Detail: true, },
    { id: 'moed_customer_charge_cd', name: '入庫場所', field: 'moed_customer_charge_cd', formatter: selectCellWarehouseFormatter,  width: 100, is2Detail: true, },
    // { id: 'sr_w_cd', name: '入庫場所CD', field: 'sr_w_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 100, is2Detail: true, },
    // { id: 'moed_w_name', name: '場所名', field: 'moed_w_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, is2Detail: true, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 120, is2Detail: true, },
    { id: 'moed_quantity', name: '取引数量', field: 'moed_quantity', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 80, is2Detail: true, },
    { id: 'moed_unit_tran', name: '取引単位', field: 'moed_unit_tran', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 80, is2Detail: true, },
    { id: 'moed_unit_qty', name: '単価数量', field: 'moed_unit_qty', editor: Slick.Editors.Text, validator: textValidator, footerfunc: sumDecimalJPYFooter, maxlength: 10, width: 80, is2Detail: true, },
    { id: 'moed_unit_price', name: '単価', field: 'moed_unit_price', editor: Slick.Editors.Text, formatter: /*function (r, c, v, cD, dC) { return toDecimal3JPYFormatter(r, c, dC['moed_unit_price'], cD, dC); },*/toDecimal3JPYFormatter,  cssClass: 'right-align', width: 80, is2Detail: true, },
    { id: 'moed_money', name: '金額', field: 'moed_money', cssClass: 'right-align', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcPrice(v, dC, 'moed_money', 1)['text'], cD, dC); }, footerfunc: sumJPYFooter, width: 80, is2Detail: true, },
    // { id: 'moed_money_tax', name: '消費税額', field: 'moed_money_tax', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcTaxPrice(v, dC, 'moed_money_tax')['text'], cD, dC); }, cssClass: 'right-align', width: 130, is2Detail: true, },
    // { id: 'moed_money_inc_tax', name: '税込金額', field: 'moed_money_inc_tax', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcIncTaxPrice(v, dC, 'moed_money_inc_tax')['text'], cD, dC); }, cssClass: 'right-align', width: 130, is2Detail: true, },
    { id: 'moed_inventory_type', name: '在庫区分', field: 'moed_inventory_type', /*editor: SelectCellEditorMorderestimateInventoryType,*/ formatter: SelectCellMorderestimateInventoryType, options: [{ key: '1', val: '在庫管理対象' }, { key: '2', val: '対象外' },], is2Detail: true, width: 90, },
    { id: 'moed_dt_remarks', name: '備考', field: 'moed_dt_remarks', editor: Slick.Editors.Text, maxlength: 60, width: 150, is2Detail: true, },

    // 入庫報告画面
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, is3HeaderPK: true, width: 120, },
    { id: 'moed_customer_cd', name: '仕入先CD', field: 'moed_customer_cd', editor: IdEditor, ref: 'customer', validator: masterNNValidator, maxlength: 3, is3HeaderPK: true, width: 70, },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', /*editor: DisabledTextEditor,*/ formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, width: 150, is3HeaderPK: true, },
    { id: 'moed_manufacture_cd', name: 'メーカーCD', field: 'moed_manufacture_cd', editor: IdEditor, ref: 'customerpost', /*validator: function (v, i, c) { return masterValidator(i['moed_customer_cd']  + '-' + v, i, c); },*/ maxlength: 4, is3Header: true, width: 100, },
    { id: 'moed_manufacture_name', name: 'メーカー名', field: 'moed_manufacture_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_manufacture_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_manufacture_cd']); }, is3Header: true, width: 150, },
    { id: 'moed_arrival_hd_date', name: '入荷日', field: 'moed_arrival_hd_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateNNValidator, width: 120, is3Header: true, },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', editor: IdEditor, ref: 'user', validator: masterValidator, maxlength: 6, is3Header: true, width: 100, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_salesman_name', 'USER_NAME', 'user', dC['moed_salesman_cd']); }, width: 150, is3Header: true, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', editor: Slick.Editors.Text, maxlength: 60, width: 150, is3Header: true, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', is3Header: true, width: 150, },
    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', editor: DisabledTextEditor, maxlength: 3, is3DetailPK: true, width: 80, },
    { id: 'moed_accept_sub_no', name: '分割No', field: 'moed_accept_sub_no', editor: DisabledTextEditor, maxlength: 2, is3DetailPK: true, width: 80, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', ref: 'product', editor: Slick.Editors.Text, validator: masterValidator, maxlength: 30, is3Detail: true, width: 120, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50, width: 200, is3Detail: true, },    
    { id: 'moed_parrangement_cd', name: '加工内容', field: 'moed_parrangement_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, is3Detail: true, width: 120, },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is3Detail: true, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is3Detail: true, },
    { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', /*editor: DisabledTextEditor, validator: textValidator, */formatter: function (r, c, v, cD, dC) { return getHouseLotNo(dC, 'moed_type_03'); }, maxlength: 15, width: 100, is3Detail: true, },
    { id: 'moed_sub_10', name: '先方ロットNo', field: 'moed_sub_10', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1150, width: 100, is3Detail: true, },
    { id: 'moed_sub_07', name: 'コイル番号', field: 'moed_sub_07', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is3Detail: true, },
    { id: 'moed_sub_11', name: '製鋼番号', field: 'moed_sub_11', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is3Detail: true, },
    { id: 'moed_sub_num_04', name: '引張強度', field: 'moed_sub_num_04', editor: Slick.Editors.Text, validator: textValidator, maxlength: 12, width: 100, is3Detail: true, },
    { id: 'moed_sub_12', name: '荷姿', field: 'moed_sub_12', ref: 'packing', editor: IdEditor, validator: masterValidator, maxlength: 5, width: 100, is3Detail: true, },
    { id: 'pkg_name', name: '荷姿名', field: 'pkg_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'pkg_name', 'pkg_name', 'packing', dC['moed_sub_12']); }, width: 100, is3Detail: true, },
    { id: 'moed_customer_charge_cd', name: '入庫場所', field: 'moed_customer_charge_cd',  editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter,  width: 100, is3Detail: true, },
    // { id: 'moed_w_name', name: '場所名', field: 'moed_w_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_w_name', 'w_name', 'warehouse', dC['moed_customer_charge_cd']); }, maxlength: 3, width: 100, is3Detail: true, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 120, is3Detail: true, },
    { id: 'moed_quantity', name: '取引数量', field: 'moed_quantity', /*editor: Slick.Editors.Text,*/ validator: textValidator, maxlength: 10, width: 80, is3Detail: true, },
    { id: 'moed_unit_tran', name: '取引単位', field: 'moed_unit_tran', /*editor: Slick.Editors.Text,*/ validator: textValidator, maxlength: 10, width: 80, is3Detail: true, },
    { id: 'moed_unit_qty', name: '単価数量', field: 'moed_unit_qty', /*editor: Slick.Editors.Text,*/ validator: textValidator, footerfunc: sumDecimalJPYFooter, maxlength: 10, width: 80, is3Detail: true, },
    { id: 'moed_unit_eval', name: '単価単位', field: 'moed_unit_eval', /*editor: SelectCellEditorValue,*/ formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 80, is3Detail: true, },
    { id: 'moed_unit_price', name: '単価', field: 'moed_unit_price', editor: Slick.Editors.Text, formatter: /*function (r, c, v, cD, dC) { return toDecimal3JPYFormatter(r, c, dC['moed_unit_price'], cD, dC); },*/toDecimal3JPYFormatter,  cssClass: 'right-align', width: 80, is3Detail: true, },
    { id: 'moed_stock_qty', name: '入荷数(単価数量)', field: 'moed_stock_qty', editor: Slick.Editors.Text, validator: textValidator, maxlength: 12, width: 100, is3Detail: true, },
    { id: 'moed_zaiko_tani', name: '在庫単位(単価単位)', field: 'moed_zaiko_tani', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 100, is3Detail: true, },
    { id: 'moed_inventory_type', name: '在庫区分', field: 'moed_inventory_type', /*editor: SelectCellEditorMorderestimateInventoryType,*/ formatter: SelectCellMorderestimateInventoryType, options: [{ key: '1', val: '在庫管理対象' }, { key: '2', val: '対象外' },], is3Detail: true, width: 90, },
    { id: 'moed_dt_remarks', name: '備考', field: 'moed_dt_remarks', editor: Slick.Editors.Text, is3Detail: true, maxlength: 60, width: 150, },
    { id: 'moed_type_04', name: '用途区分', field: 'moed_type_04', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [ { key: '0', val: '自社在庫' }, { key: '1', val: '受注分' }, { key: '2', val: '支給品' } ], is3Detail: true, width: 110, },
  ];
  mainPGs.pgOOD.columns = [ // 製造委託画面
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, isHeaderPK: true, width: 130, },
    { id: 'moed_customer_cd', name: '委託先CD', field: 'moed_customer_cd', editor: IdEditor, ref: 'customer', validator: masterNNValidator, maxlength: 3, isHeader: true, },
    { id: 'moed_customer_name', name: '委託先名', field: 'moed_customer_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, isHeader: true, width: 200, },
    { id: 'moed_arrival_hd_date', name: '入荷予定日', field: 'moed_arrival_hd_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', editor: Slick.Editors.Text, editor: IdEditor, ref: 'user', validator: masterNNValidator, maxlength: 6, width: 100, isHeader: true, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'SALESMAN_NAME', 'USER_NAME', 'user', dC['moed_salesman_cd']); }, isHeader: true, },
    { id: 'moed_manufacture_cd', name: 'メーカー', field: 'moed_manufacture_cd', editor: IdEditor, ref: 'customermaker', validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); }, maxlength: 4, isHeader: true, },
    { id: 'moed_manufacture_name', name: 'メーカー名', field: 'moed_manufacture_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_manufacture_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_manufacture_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_shipper_cd', name: '出荷主CD', field: 'moed_shipper_cd', editor: IdEditor, ref: 'customership', /*validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); },*/ maxlength: 4, isHeader: true, },
    { id: 'moed_shipper_name', name: '出荷主名', field: 'moed_shipper_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_shipper_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_shipper_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_delivery_cd', name: '納品先CD', field: 'moed_delivery_cd', editor: IdEditor, ref: 'customership', /*validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); },*/ maxlength: 4, isHeader: true, },
    { id: 'moed_delivery_name', name: '納品先名', field: 'moed_delivery_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_delivery_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_delivery_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', editor: Slick.Editors.Text, validator: textValidator, isHeader: true, width: 150, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', editor: Slick.Editors.Text, isHeader: true, maxlength: 60, width: 200, },
    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', isDetailPK: true, },
    { id: 'moed_accept_sub_no', name: '検収枝番', field: 'moed_accept_sub_no', maxlength: 2, isDetailPK: true, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', ref: 'product', editor: Slick.Editors.Text, validator: masterValidator, maxlength: 30, width: 130, isDetail: true, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', editor: Slick.Editors.Text, validator: textValidator, formatter: function (r, c, v, cD, dC) { return moedProductNameFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50, width: 200, isDetail: true, },
    { id: 'moed_parrangement_cd', name: '加工内容', field: 'moed_parrangement_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, width: 120, isDetail: true, },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, isDetail: true, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, isDetail: true, },
    // { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', editor: Slick.Editors.Text, validator: textValidator, formatter: function (r, c, v, cD, dC) { return getHouseLotNo(dC, 'moed_type_03');}, width: 100, isDetail: true, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 120, isDetail: true, },
    { id: 'moed_quantity', name: '取引数量', field: 'moed_quantity', editor: Slick.Editors.Text, validator: textValidator, cssClass: 'right-align', width: 100, isDetail: true, },
    { id: 'moed_unit_tran', name: '単位', field: 'moed_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 80, isDetail: true, },
    { id: 'moed_unit_qty', name: '単価数量', field: 'moed_unit_qty', editor: Slick.Editors.Text, formatter: toDecimal3JPYFormatter, /*coltype: 'decimal',*/ cssClass: 'right-align', width: 150, isDetail: true, },
    { id: 'moed_unit_eval', name: '単位', field: 'moed_unit_eval', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 80, isDetail: true, },
    { id: 'moed_unit_price', name: '単価', field: 'moed_unit_price', editor: Slick.Editors.Text, formatter: toDecimal3JPYFormatter, /*function (r, c, v, cD, dC) { return masterFormatterOrderCost(dC, 'moed_unit_price', dC['moed_product_cd']); },*/ cssClass: 'right-align', width: 100, isDetail: true, },
    {
      id: 'moed_money', name: '金額', field: 'moed_money', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcPrice(v, dC, 'moed_money')['text'], cD, dC); }, cssClass: 'right-align',
      footerfunc: sumJPYFooter, isDetail: true,
    },
    { id: 'moed_money_tax', name: '消費税額', field: 'moed_money_tax', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcTaxPrice(v, dC, 'moed_money_tax')['text'], cD, dC); }, cssClass: 'right-align', isDetail: true, },
    { id: 'moed_money_inc_tax', name: '税込金額', field: 'moed_money_inc_tax', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcIncTaxPrice(v, dC, 'moed_money_inc_tax')['text'], cD, dC); }, cssClass: 'right-align', isDetail: true, },
    { id: 'moed_type_subject', name: '科目区分', field: 'moed_type_subject', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '2', val: 'リセール品' }, { key: '3', val: '半製品' }, { key: '4', val: '原材料品' }, { key: '5', val: '梱包資材' }, { key: '6', val: 'リセール加工品' }, { key: '7', val: '経費' },], isDetail: true,/*isHeader: true, */width: 110, },
    { id: 'moed_inventory_type', name: '在庫区分', field: 'moed_inventory_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '1', val: '在庫管理対象' }, { key: '2', val: '対象外' },], isDetail: true, /*isHeader: true, */width: 110, },
    { id: 'moed_dt_remarks', name: '備考', field: 'moed_dt_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 60, isDetail: true, },

    // 検収画面
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return setMoedNo(v, dC, 'moed_order_no'); }, is2HeaderPK: true, width: 120, },
    { id: 'moed_customer_cd', name: '仕入先CD', field: 'moed_customer_cd', editor: DisabledTextEditor, ref: 'customer', validator: masterNNValidator, maxlength: 3, is2HeaderPK: true, width: 130, },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', /*editor: DisabledTextEditor,*/ formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, width: 150, is2HeaderPK: true, },
    { id: 'moed_manufacture_cd', name: 'メーカー', field: 'moed_manufacture_cd', editor: IdEditor, ref: 'customerpost', validator: function (v, i, c) { return masterValidator(i['moed_customer_cd'] + '-' + v, i, c); }, maxlength: 4, is2Header: true, },
    { id: 'moed_manufacture_name', name: 'メーカー名', field: 'moed_manufacture_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_manufacture_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_manufacture_cd']); }, is2Header: true, width: 150, },
    // { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', /*editor: Slick.Editors.Date, */dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 'moed_arrival_hd_date', name: '入荷日', field: 'moed_arrival_hd_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateNNValidator, width: 120, is2Header: true, },
    { id: 'moed_payment_plan_date', name: '支払予定日', field: 'moed_payment_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is2Header: true, width: 120, },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', ref: 'user', editor: DisabledTextEditor, validator: masterValidator, maxlength: 6, width: 100, is2Header: true, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_salesman_name', 'USER_NAME', 'user', dC['moed_salesman_cd']); }, width: 150, is2Header: true, },
    { id: 'moed_report_remarks', name: '備考', field: 'moed_report_remarks', editor: DisabledTextEditor, maxlength: 60, width: 150, is2Header: true, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', is2Header: true, width: 150, },
    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', editor: DisabledTextEditor, maxlength: 3, is2DetailPK: true, },
    { id: 'moed_accept_sub_no', name: '分割No', field: 'moed_accept_sub_no', editor: DisabledTextEditor, maxlength: 2, is2DetailPK: true, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', editor: DisabledTextEditor, maxlength: 30, is2Detail: true, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50, width: 200, is2Detail: true, },
    { id: 'moed_parrangement_cd', name: '加工内容', field: 'moed_parrangement_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, width: 120, is2Detail: true, },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is2Detail: true, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is2Detail: true, },
    { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_10', name: '先方ロットNo', field: 'moed_sub_10', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_07', name: 'コイル番号', field: 'moed_sub_07', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_11', name: '製鋼番号', field: 'moed_sub_11', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is2Detail: true, },
    { id: 'moed_sub_num_04', name: '引張強度', field: 'moed_sub_num_04', editor: Slick.Editors.Text, validator: textValidator, maxlength: 12, width: 100, is2Detail: true, },
    { id: 'moed_sub_12', name: '荷姿', field: 'moed_sub_12', editor: Slick.Editors.Text, validator: textValidator, maxlength: 5, width: 100, is2Detail: true, },
    { id: 'pkg_name', name: '取引単位', field: 'pkg_name', editor: Slick.Editors.Text, validator: textValidator, width: 100, is2Detail: true, },
    { id: 'sr_w_cd', name: '入庫場所CD', field: 'sr_w_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 100, is2Detail: true, },
    { id: 'moed_w_name', name: '場所名', field: 'moed_w_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, is2Detail: true, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 120, is2Detail: true, },
    { id: 'moed_quantity', name: '取引数量', field: 'moed_quantity', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, is2Detail: true, },
    { id: 'moed_unit_tran', name: '取引単位', field: 'moed_unit_tran', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, is2Detail: true, },
    { id: 'moed_unit_qty', name: '入荷数', field: 'moed_unit_qty', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, is2Detail: true, },
    { id: 'moed_unit_price', name: '単価', field: 'moed_unit_price', editor: Slick.Editors.Text, formatter: /*function (r, c, v, cD, dC) { return toDecimal3JPYFormatter(r, c, dC['moed_unit_price'], cD, dC); },*/toDecimal3JPYFormatter,  cssClass: 'right-align', width: 130, is2Detail: true, },
    { id: 'moed_money', name: '金額', field: 'moed_money', cssClass: 'right-align', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcPrice(v, dC, 'moed_money')['text'], cD, dC); }, width: 130, is2Detail: true, },
    { id: 'moed_money_tax', name: '消費税額', field: 'moed_money_tax', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcTaxPrice(v, dC, 'moed_money_tax')['text'], cD, dC); }, cssClass: 'right-align', width: 130, is2Detail: true, },
    { id: 'moed_money_inc_tax', name: '税込金額', field: 'moed_money_inc_tax', formatter: function (r, c, v, cD, dC) { return toJPYDec0Formatter(r, c, calcIncTaxPrice(v, dC, 'moed_money_inc_tax')['text'], cD, dC); }, cssClass: 'right-align', width: 130, is2Detail: true, },
    { id: 'moed_dt_remarks', name: '備考', field: 'moed_dt_remarks', editor: Slick.Editors.Text, maxlength: 60, is2Detail: true, },

    // 入庫報告画面
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, is3HeaderPK: true, width: 120, },
    { id: 'moed_customer_cd', name: '仕入先CD', field: 'moed_customer_cd', editor: IdEditor, ref: 'customer', validator: masterNNValidator, maxlength: 3, is3HeaderPK: true, width: 70, },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', /*editor: DisabledTextEditor,*/ formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, width: 150, is3HeaderPK: true, },
    { id: 'moed_manufacture_cd', name: 'メーカーCD', field: 'moed_manufacture_cd', editor: IdEditor, ref: 'customerpost', maxlength: 4, is3Header: true, width: 100, },
    { id: 'moed_manufacture_name', name: 'メーカー名', field: 'moed_manufacture_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_manufacture_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_manufacture_cd']); }, is3Header: true, width: 150, },
    { id: 'moed_arrival_hd_date', name: '入荷日', field: 'moed_arrival_hd_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateNNValidator, width: 120, is3Header: true, },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', editor: IdEditor, ref: 'user', validator: masterValidator, maxlength: 6, is3Header: true, width: 100, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_salesman_name', 'USER_NAME', 'user', dC['moed_salesman_cd']); }, width: 150, is3Header: true, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', editor: Slick.Editors.Text, maxlength: 60, width: 200, is3Header: true, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', is3Header: true, width: 150, },
    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', editor: DisabledTextEditor, maxlength: 3, is3DetailPK: true, width: 80, },
    { id: 'moed_accept_sub_no', name: '分割No', field: 'moed_accept_sub_no', editor: DisabledTextEditor, maxlength: 2, is3DetailPK: true, width: 80, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', ref: 'product', editor: Slick.Editors.Text, validator: masterValidator, maxlength: 30, is3Detail: true, width: 120, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50, width: 200, is3Detail: true, },
    { id: 'moed_parrangement_cd', name: '加工内容', field: 'moed_parrangement_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, width: 120, is3Detail: true, },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is3Detail: true, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 100, is3Detail: true, },
    { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', formatter: function (r, c, v, cD, dC) { return getHouseLotNo(dC, 'moed_type_03'); }, maxlength: 15, width: 100, is3Detail: true, },
    { id: 'moed_sub_10', name: '先方ロットNo', field: 'moed_sub_10', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1150, width: 100, is3Detail: true, },
    { id: 'moed_sub_07', name: 'コイル番号', field: 'moed_sub_07', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is3Detail: true, },
    { id: 'moed_sub_11', name: '製鋼番号', field: 'moed_sub_11', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 100, is3Detail: true, },
    { id: 'moed_sub_num_04', name: '引張強度', field: 'moed_sub_num_04', editor: Slick.Editors.Text, validator: textValidator, maxlength: 12, width: 100, is3Detail: true, },
    { id: 'moed_sub_12', name: '荷姿', field: 'moed_sub_12', ref: 'packing', editor: IdEditor, validator: masterValidator, maxlength: 5, width: 100, is3Detail: true, },
    { id: 'pkg_name', name: '取引単位', field: 'pkg_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'pkg_name', 'pkg_name', 'packing', dC['moed_sub_12']); }, width: 100, is3Detail: true, },
    { id: 'moed_customer_charge_cd', name: '入庫場所CD', field: 'moed_customer_charge_cd',  editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter,  width: 100, is3Detail: true, },
    { id: 'moed_w_name', name: '場所名', field: 'moed_w_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_w_name', 'w_name', 'warehouse', dC['moed_customer_charge_cd']); }, maxlength: 3, width: 100, is3Detail: true, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 120, is3Detail: true, },
    { id: 'moed_quantity', name: '取引数量', field: 'moed_quantity', editor: Slick.Editors.Text, maxlength: 12, width: 100, is3Detail: true, },
    { id: 'moed_unit_tran', name: '取引単位', field: 'moed_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 80, is3Detail: true, },
    { id: 'moed_stock_qty', name: '入荷数', field: 'moed_stock_qty', editor: Slick.Editors.Text, validator: textValidator, maxlength: 12, width: 100, is3Detail: true, },
    { id: 'moed_unit_eval', name: '在庫単位', field: 'moed_unit_eval', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 100, is3Detail: true, },
    { id: 'moed_dt_remarks', name: '備考', field: 'moed_dt_remarks', editor: Slick.Editors.Text, is3Detail: true, maxlength: 60, },

  ];
  mainPGs.pgSD.columns = [ // 納品書⇒出荷予定画面に変更
    { id: 's_estimate_no', name: '受注No', field: 's_estimate_no', isHeaderPK: true, width: 150, },
    { id: 's_serial_no', name: '納品No', field: 's_serial_no', isHeaderPK: true, },
    { id: 's_customer_cd', name: '客先CD', field: 's_customer_cd', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return setGridCustomerCD(v, dC, 's_customer_cd'); }, isHeader: true, },
    { id: 's_customer_name', name: '得意先名', field: 's_customer_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['s_customer_cd']); }, isHeader: true, width: 150, },
    {
      id: 's_customer_post_cd', name: '部署CD', field: 's_customer_post_cd', editor: IdEditor, ref: 'customerpost', isRequired: true,
      validator: function (v, i, c) { return masterValidator(i['s_customer_cd'] + '-' + v, i, c); }, isHeader: true,
    },
    { id: 's_customer_post_name', name: '部署名', field: 's_customer_post_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_customer_post_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_customer_post_cd']); }, isHeader: true, },
    { id: 's_customer_charge_cd', name: '担当者CD', field: 's_customer_charge_cd', ref: 'customercharge', editor: IdEditor, isHeader: true, },
    { id: 's_customer_charge_name', name: '担当者名', field: 's_customer_charge_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_customer_charge_name', 'CC_CHARGE_NAME', 'customercharge', dC['s_customer_cd'] + '-' + dC['s_customer_post_cd'] + '-' + dC['s_customer_charge_cd']); }, isHeader: true, },
    { id: 's_salesman_cd', name: '受注者CD', field: 's_salesman_cd', isHeader: true, },
    { id: 's_salesman_name', name: '受注者名', field: 's_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_salesman_name', 'USER_NAME', 'user', dC['s_salesman_cd']); }, isHeader: true, },
    { id: 's_packing_num', name: '梱包数', field: 's_packing_num', editor: Slick.Editors.Integer, validator: integerValidator, width: 120, isHeader: true, },
    { id: 's_tc_short_name', name: '運送会社', field: 's_tc_short_name', editor: selectCellTransportEditor, formatter: selectCellTransportCompanyFormatter, width: 120, isHeader: true, },
    { id: 's_estimate_date', name: '受注日', field: 's_estimate_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 's_desired_delivery_date', name: '希望納期', field: 's_desired_delivery_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 's_shipping_plan_date', name: '出荷予定日', field: 's_shipping_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 's_shipping_date', name: '出荷日', field: 's_shipping_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return setCloseDate(v, dC, 's_shipping_date'); }, validator: dateValidator, isHeader: true, width: 130, },
    { id: 's_customer_order_no', name: '先方注文No', field: 's_customer_order_no',  editor: Slick.Editors.Text, maxlength: 15, isHeader: true, width: 150, },
    { id: 's_bill_close_date', name: '請求締日', field: 's_bill_close_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 120, },
    { id: 's_payment_plan_date', name: '入金予定日', field: 's_payment_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 120, },
    { id: 's_sum_price', name: '合計金額', field: 's_sum_price', formatter: toJPYFormatter, isHeader: true, width: 120, },
    { id: 's_print', name: '納品書タイプ ', field: 's_print', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '受領書なし' }, { key: '1', val: '受領書あり' },], isHeader: true, width: 120, },
    { id: 's_shipper_cd', name: '出荷主', field: 's_shipper_cd', editor: IdEditor, ref: 'customership', validator: function (v, i, c) { return masterValidator(i['s_customer_cd']  + '-' + v, i, c); }, isHeader: true, },
    { id: 's_shipper_name', name: '出荷主名称', field: 's_shipper_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_shipper_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_shipper_cd']); }, isHeader: true, width: 120, },
    { id: 's_delivery_cd', name: '納入先', field: 's_delivery_cd', editor: IdEditor, ref: 'customership', validator: function (v, i, c) { return masterValidator(i['s_customer_cd']  + '-' + v, i, c);  }, isHeader: true, width: 120, },
    { id: 's_delivery_name', name: '納入先名称', field: 's_delivery_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_delivery_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_delivery_cd']); }, isHeader: true, width: 120, },
    { id: 's_stay_cd', name: '止め先', field: 's_stay_cd', editor: IdEditor, ref: 'customership', validator: function (v, i, c) { return masterValidator(i['s_customer_cd']  + '-' + v, i, c); }, isHeader: true, },
    { id: 's_stay_name', name: '止め先名称(支店止め）', field: 's_stay_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_stay_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_stay_cd']); }, isHeader: true, width: 120, },
    { id: 's_title', name: '件名', field: 's_title', editor: Slick.Editors.Text, isHeader: true, },
    { id: 's_remarks', name: '備考', field: 's_remarks', editor: Slick.Editors.Text, isHeader: true, width: 150, },
    { id: 'sd_estimate_sub_no', name: '受注枝番', field: 'sd_estimate_sub_no', isPK: true, },
    { id: 'sd_shipment_sub_no', name: '出荷枝番', field: 'sd_shipment_sub_no', isPK: true, },
    { id: 'sd_p_cd', name: '品名CD', field: 'sd_p_cd', editor: IdEditor, ref: 'product', width: 120, },
    { id: 'sd_p_name', name: '品名', field: 'sd_p_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'sd_p_name', 'p_name', 'product', dC['sd_p_cd']); }, width: 200, },
    { id: 'sd_p_name_supple', name: '品名補足印字内容', field: 'sd_p_name_supple', width: 200, },
    { id: 'sd_estimate_quantity', name: '受注数', field: 'sd_estimate_quantity', formatter: decimal3Formatter, cssClass: 'right-align', },
    { id: 'sd_unit_tran', name: '単位', field: 'sd_unit_tran', width: 80, },
    { id: 'sd_lotNo', name: 'ロットNo', field: 'sd_lotNo', },
    { id: 'sd_estimate_quantity', name: '出荷予定数', field: 'sd_estimate_quantity', formatter: decimal3Formatter, cssClass: 'right-align', },
    // 納品数の値はformatterで受注数の値を自動セット
    { id: 'sd_qty_delivery', name: '納品数', field: 'sd_qty_delivery', editor: Slick.Editors.Integer, formatter: setDeliveryQty, cssClass: 'right-align', },
    { id: 'sd_unit_tran_02', name: '単位', field: 'sd_unit_tran_02', },
    { id: 'sd_packing_group', name: '梱包G', field: 'sd_packing_group', editor: Slick.Editors.Text, },
    { id: 'sd_packing_size', name: 'サイズ', field: 'sd_packing_size', editor: Slick.Editors.Text, },
    { id: 'sd_packing_num', name: '梱包数', field: 'sd_packing_num', editor: Slick.Editors.Integer, validator: integerValidator, },
    { id: 'sd_packing_cd', name: '荷姿CD', field: 'sd_packing_cd', ref: 'packing', editor: IdEditor, validator: masterValidator, },
    { id: 'pkg_name', name: '荷姿名', field: 'pkg_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'pkg_name', 'pkg_name', 'packing', dC['sd_packing_cd']); }, },
    { id: 'sd_packing_content', name: '荷姿詳細', field: 'sd_packing_content', editor: Slick.Editors.Text, },
    { id: 'sd_sub_num_01', name: '面積', field: 'sd_sub_num_01', formatter: function (r, c, v, cD, dC) { return viewDecimal(dC, 'sd_sub_num_01', 2); }, },
    { id: 'sd_unit_price', name: '単価', field: 'sd_unit_price', editor: Slick.Editors.Integer, formatter: toJPYFormatter, cssClass: 'right-align', width: 120, },
    // 納品数の値がformatterで受注数の値を自動セットするため、それに伴い参照先を受注数に変更。
    { id: 'sd_delivery_price', name: '金額', field: 'sd_delivery_price', formatter: function (r, c, v, cD, dC) { return toJPYFormatter(r, c, calcFormatter(dC, 'sd_delivery_price', dC['sd_qty_delivery'] * dC['sd_unit_price'])['text'], cD, dC);  }, footerfunc: sumJPYFooter, cssClass: 'right-align', width: 120, },
    { id: 'sd_desired_delivery_date', name: '希望納期', field: 'sd_desired_delivery_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 130, },
    { id: 'sd_customer_order_no', name: '先方注文No', field: 'sd_customer_order_no', width: 150, editor: Slick.Editors.Text },
    { id: 'sd_customer_p_name', name: '先方品名', field: 'sd_customer_p_name', editor: Slick.Editors.Text, },
    { id: 'sd_delivery_cd', name: '納入先', field: 'sd_delivery_cd', editor: IdEditor, },
    { id: 'sd_delivery_name', name: '納入先名称', field: 'sd_delivery_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'sd_delivery_name', 'CP_POST_NAME', 'customerpost', $("#customer-cd").val() + '-' + dC['sd_delivery_cd']); }, },
    { id: 'sd_ar_cd', name: '製品手配方法', field: 'sd_ar_cd', editor: selectCellParrangeEditor, formatter: selectCellParrangeFormatter, },
    { id: 'sd_parrangement_cd', name: '加工内容', field: 'sd_parrangement_cd',  editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.arrangement, width: 100, },
    { id: 'sd_detail_remarks', name: '備考', field: 'sd_detail_remarks', editor: Slick.Editors.Text, },
  ];
  mainPGs.pgBD.columns = [ // 請求書
    { id: 'bd_bill_no', name: '請求No', field: 'bd_bill_no', editor: DisabledTextEditor, isHeaderPK: true, isPK: true, },
    { id: 'b_customer_cd', name: '客先CD', field: 'b_customer_cd', /*editor: IdEditor, ref: 'customer', validator: masterValidator, formatter: function (r, c, v, cD, dC) { return setGridCustomerCD(v, dC, 'b_customer_cd'); },*/ isHeaderPK: true, width: 60, },
    { id: 'b_customer_name', name: '得意先名', field: 'b_customer_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'b_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['b_customer_cd']); }, isHeader: true, width: 180, },
    { id: 'bd_desired_delivery_date', name: '出荷予定日', field: 'bd_desired_delivery_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_shipment_date', name: '出荷日', field: 'bd_shipment_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_payment_close_date', name: '入金予定日', field: 'bd_payment_close_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_payment_date', name: '入金日', field: 'bd_payment_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'b_sales_price', name: '合計金額',  field: 'b_sales_price', formatter: toJPYDec0Formatter, cssClass: 'right-align',isHeader: true, width: 100, },
    { id: 'b_tax', name: '消費税額', field: 'b_tax', formatter: toJPYDec0Formatter, cssClass: 'right-align', isHeader: true, width: 100, },
    { id: 'bd_cus_payment_cll', name: '集金有無', field: 'bd_cus_payment_cll', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' }, ], isHeader: true, width: 60, },

    { id: 'bd_estimate_no', name: '受注No', field: 'bd_estimate_no', isPK: true, width: 130, },
    { id: 'bd_order_date', name: '受注日', field: 'bd_order_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 90, },
    { id: 'bd_st_details_no', name: '納品No', field: 'bd_st_details_no', isPK: true, },
    { id: 'bd_ed_details_no', name: '受注枝番', field: 'bd_ed_details_no', isPK: true, },
    { id: 'bd_shipment_div', name: '出荷枝番', field: 'bd_shipment_div', isPK: true, },
    { id: 'sd_p_cd', name: '品名CD', field: 'sd_p_cd', isPK: true, },
    { id: 'bd_product_name', name: '製品名称', field: 'bd_product_name', width: 200, },
    { id: 'bd_prod_summary', name: '品名補足印字内容', field: 'bd_prod_summary', width: 200, },
    { id: 'bd_ed_quantity', name: '受注数', field: 'bd_ed_quantity', formatter: decimal3Formatter, cssClass: 'right-align', },
    { id: 'bd_unit_tran', name: '単位', field: 'bd_unit_tran', },
    { id: 'bd_unit_price', name: '単価', field: 'bd_unit_price', formatter: toJPYDec0Formatter, cssClass: 'right-align', },
    { id: 'bd_price', name: '金額', field: 'bd_price', formatter: function (r, c, v, cD, dC) { return toJPYFormatter(r, c, calcFormatter(dC, 'bd_price', dC['bd_ed_quantity'] * dC['bd_unit_price'])['text'], cD, dC); }, footerfunc: sumJPYFooter, cssClass: 'right-align', },
    { id: 'bd_detail_remarks', name: '備考', field: 'bd_detail_remarks', editor: Slick.Editors.Text, width: 120, },
    { id: 'bd_payment_div', name: '入金分割', field: 'bd_payment_div', isPK: true, width: 80, },
    { id: 'bd_payment_sign', name: '入金区分', field: 'bd_payment_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '済' },], width: 80, },
    { id: 's_shipper_cd', name: '出荷主CD', field: 's_shipper_cd', editor: IdEditor, width: 80, },
    { id: 's_shipper_name', name: '出荷主', field: 's_shipper_name', width: 120, },
    { id: 's_delivery_cd', name: '納入先CD', field: 's_delivery_cd', editor: IdEditor, width: 80, },
    { id: 's_delivery_name', name: '納入先名称', field: 's_delivery_name', width: 120, },
    { id: 's_stay_cd', name: '止め先CD', field: 's_stay_cd', editor: IdEditor, width: 80, },
    { id: 's_stay_name', name: '止め先名', field: 's_stay_name', width: 120, },
    { id: 'bd_salesman_cd', name: '受注者CD', field: 'bd_salesman_cd', editor: IdEditor, width: 80, },
    { id: 'bd_salesman_name', name: '受注者名', field: 'bd_salesman_name', },
  ];
  mainPGs.pgSTPlan.columns = [  // 入出庫予定
    // 入出庫予定は、在庫引当と製造使用予定登録が入ってくる
    { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.viewplanpayment, isDetail: true, width: 70, },
    { id: 'stc_report_no', name: '伝票No', field: 'stc_report_no', isHeaderPK: true, width: 100, },
    { id: 'stc_sub_no_01', name: '枝番①', field: 'stc_sub_no_01', isDetail: true, width: 60, },
    { id: 'stc_sub_no_02', name: '枝番②', field: 'stc_sub_no_02', isDetail: true, width: 60, },
    { id: 'stc_update_cnt', name: '更新回数', field: 'stc_update_cnt', isHeader: true, width: 50, },
    { id: 'stc_report_date', name: '伝票日付', field: 'stc_report_date', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isHeader: true, width: 80, },
    { id: 'stc_target_id', name: '相手CD', field: 'stc_target_id', editor: IdEditor, ref: 'customer', isHeader: true, width: 80, },
    { id: 'stc_target_name', name: '相手名', field: 'stc_target_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_target_name', 'C_CUSTOMER_NAME', 'customer', dC['stc_target_id']); }, isHeader: true,  width: 280, },
    { id: 'stc_place_cd', name: '場所名', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, isDetail: true, width: 120, },
    // { id: 'stc_place_name', name: '保管場所', field: 'stc_place_name', width: 70, },
    { id: 'stc_customer_post_cd', name: '担当者ID', field: 'stc_customer_post_cd', editor: IdEditor, ref: 'customerpost', isHeader: true, width: 60, },
    { id: 'productcd', name: '品名CD', field: 'productcd', editor: DisabledTextEditor,/*editor: IdEditor, ref: 'product', validator: masterValidator, */isDetailPK: true, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, isDetail: true,width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', isDetail: true, width: 200, },
    // { id: 'stc_sub_03', name: '目合', field: 'stc_sub_03', width: 80, },
    // { id: 'stc_sub_01', name: '線径①', field: 'stc_sub_01', width: 80, },
    // { id: 'stc_sub_02', name: '線径②', field: 'stc_sub_02', width: 80, },
    // { id: 'stc_sub_06', name: '単位', field: 'stc_sub_06', width: 60, },
    // { id: 'stc_sub_04', name: '目合①', field: 'stc_sub_04', width: 80, },
    // { id: 'stc_sub_05', name: '目合②', field: 'stc_sub_05', width: 80, },
    // { id: 'stc_sub_06', name: '目合単位', field: 'stc_sub_06', width: 60, },
    // { id: 'stc_sub_08', name: '寸法①', field: 'stc_sub_08', width: 100, },
    // { id: 'stc_sub_10', name: '寸法①補足', field: 'stc_sub_10', width: 100, },
    // { id: 'stc_sub_09', name: '寸法②', field: 'stc_sub_09', width: 100, },
    // { id: 'stc_sub_11', name: '寸法②補足他', field: 'stc_sub_11', width: 100, },
    { id: 'stc_qty_trans', name: '取引数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, isDetail: true, cssClass: 'right-align', width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, isDetail: true, width: 60, },
    { id: 'stc_price_trans', name: '取引金額', field: 'stc_price_trans', cssClass: 'right-align', isDetail: true,width: 100, },
    { id: 'stc_cost_eva_qty', name: '評価数量', field: 'stc_cost_eva_qty', cssClass: 'right-align', isDetail: true,width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', isDetail: true,width: 40, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', formatter: Slick.Editors.Text, isDetail: true,width: 100, },
    { id: 'stc_inventory_type', name: '棚卸区分', field: 'stc_inventory_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_recv_type', name: '売掛区分', field: 'stc_recv_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_pay_type', name: '買掛区分', field: 'stc_pay_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_expence_type', name: '経費区分', field: 'stc_expence_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' }, { key: '', val: '-' }], isDetail: true, width: 50, },
    { id: 'stc_cost_type', name: '原価区分', field: 'stc_cost_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_unit_price', name: '原価', field: 'stc_unit_price', cssClass: 'right-align', isDetail: true, width: 70, },

    { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isDetail: true, width: 80, },
    { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, isDetail: true, width: 60, },
    { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', isDetail: true, width: 60, },
    { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_update_name', 'USER_NAME', 'user', dC['stc_update_cd']); }, isHeader: true,width: 70, },

    // 製造使用予定登録
    { id: 'stc_report_no', name: '受注番号', field: 'stc_report_no', editor: Slick.Editors.Text, /* stc_target_idも同様 */ /*validator: estimateValidator,*/ is2HeaderPK: true, width: 100, },    
    { id: 'stc_report_date_complete', name: '製造完了日', field: 'stc_report_date_complete',  editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, is2Header: true, width: 100, },
    { id: 'stc_report_date', name: '製造予定日', field: 'stc_report_date',  editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, is2Header: true, width: 100, },
    { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.viewplanpaymentproduct, is2HeaderPK: true, width: 100, },
    { id: 'stc_sub_no_01', name: '枝番', field: 'stc_sub_no_01', is2DetailPK: true, width: 60, },
    // { id: 'stc_sub_no_02', name: '工程CD', field: 'stc_sub_no_02', is2DetailPK: true, width: 60, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, is2Detail: true, width: 120, },
    { id: 'productcd', name: '品名CD', field: 'productcd', editor: IdEditor, ref: 'product', validator: masterValidator, is2Detail: true, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, is2Detail: true, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', is2Detail: true, width: 200, },
    { id: 'stc_qty_trans', name: '使用数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', is2Detail: true, width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, is2Detail: true, width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: Slick.Editors.Text, is2Detail: true, width: 100, },
    // { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is2Detail: true, width: 80, },
    // { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, is2Detail: true, width: 60, },
    // { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', is2Detail: true, width: 60, },
    // { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_update_name', 'USER_NAME', 'user', dC['stc_update_cd']); }, is2Detail: true, width: 70, },

    // 未受注客先引当
    { id: 'stc_report_no', name: '仮伝票番号', field: 'stc_report_no', /* stc_target_idも同様 */  is3HeaderPK: true, width: 80, },
    { id: 'stc_target_id', name: '客先CD', field: 'stc_target_id', editor: IdEditor, ref: 'customer', is3HeaderPK: true, width: 80, },
    { id: 'stc_target_name', name: '相手名', field: 'stc_target_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_target_name', 'C_CUSTOMER_NAME', 'customer', dC['stc_target_id']); }, is3Header: true, width: 280, },
    { id: 'stc_report_date', name: '引当日', field: 'stc_report_date', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is3HeaderPK: true, width: 80, },
    { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', /* editor: SelectCellEditorValue, */ formatter: SelectCellFormatterValue, options: [{ key: '515', val: '未受注引当' }, ], is3HeaderPK: true, width: 100, },
    // { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.viewplanpayment, is3HeaderPK: true, width: 100, },
    { id: 'stc_sub_no_01', name: '納品枝番', field: 'stc_sub_no_01', is3DetailPK: true, width: 60, },
    { id: 'stc_sub_no_02', name: '受注枝番', field: 'stc_sub_no_02', is3DetailPK: true, width: 60, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, is3Detail: true, width: 120, },
    { id: 'productcd', name: '品名CD', field: 'productcd', /*formatter: Slick.Editors.Text, editor: IdEditor, ref: 'product',*/  is3Detail: true, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, is3Detail: true, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', is3Detail: true, width: 200, },
    { id: 'stc_qty_trans', name: '数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', is3Detail: true, width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, is3Detail: true, width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: Slick.Editors.Text, is3Detail: true, width: 100, },
    // { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is3Detail: true, width: 80, },
    // { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, is3Detail: true, width: 60, },
    // { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', is3Detail: true, width: 60, },
    // { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_update_name', 'USER_NAME', 'user', dC['stc_update_cd']); }, is3Detail: true, width: 70, },
  ];
  mainPGs.pgST.columns = [  // 入出庫履歴
    { id: 'stc_yearmonth', name: '整理年月', field: 'stc_yearmonth', isHeaderPK: true, width: 50, },
    { id: 'stc_report_no', name: '伝票No', field: 'stc_report_no', isHeaderPK: true, width: 90, },
    { id: 'stc_report_date', name: '伝票日付', field: 'stc_report_date', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isHeaderPK: true, width: 80, },
    { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type',  editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.viewpayment, isDetail: true,  width: 100, },
    { id: 'stc_sub_no_01', name: '枝番①', field: 'stc_sub_no_01', isDetailPK: true, width: 40, },
    { id: 'stc_sub_no_02', name: '枝番②', field: 'stc_sub_no_02', isDetailPK: true, width: 40, },
    { id: 'stc_update_cnt', name: '更新回数', field: 'stc_update_cnt', isDetailPK: true, width: 50, },
    // { id: 'stc_pjcd', name: 'PJCD', field: 'stc_pjcd', width: 60, },
    { id: 'stc_target_id', name: '相手CD', field: 'stc_target_id', isDetail: true, width: 80, },
    { id: 'stc_target_name', name: '相手名', field: 'stc_target_name', isDetail: true, width: 280, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', isDetail: true, width: 50, },
    { id: 'stc_place_name', name: '保管場所', field: 'stc_place_name', isDetail: true, width: 70, },
    // { id: 'stc_customer_post_cd', name: '担当者ID', field: 'stc_customer_post_cd', isDetail: true, width: 60, },
    { id: 'stc_product_cd', name: '品名CD', field: 'stc_product_cd', editor: Slick.Editors.Text, isDetail: true, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', editor: Slick.Editors.Text, isDetail: true, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', isDetail: true, width: 200, },
    // { id: 'stc_sub_03', name: '目合', field: 'stc_sub_03', width: 80, },
    // { id: 'stc_sub_01', name: '線径①', field: 'stc_sub_01', width: 80, },
    // { id: 'stc_sub_02', name: '線径②', field: 'stc_sub_02', width: 80, },
    // { id: 'stc_sub_06', name: '単位', field: 'stc_sub_06', width: 60, },
    // { id: 'stc_sub_04', name: '目合①', field: 'stc_sub_04', width: 80, },
    // { id: 'stc_sub_05', name: '目合②', field: 'stc_sub_05', width: 80, },
    // { id: 'stc_sub_06', name: '目合単位', field: 'stc_sub_06', width: 60, },
    // { id: 'stc_sub_08', name: '寸法①', field: 'stc_sub_08', width: 100, },
    // { id: 'stc_sub_10', name: '寸法①補足', field: 'stc_sub_10', width: 100, },
    // { id: 'stc_sub_09', name: '寸法②', field: 'stc_sub_09', width: 100, },
    // { id: 'stc_sub_11', name: '寸法②補足他', field: 'stc_sub_11', width: 100, },
    { id: 'stc_qty_trans', name: '取引数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', isDetail: true, width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', isDetail: true, width: 60, },
    { id: 'stc_price_trans', name: '取引金額', field: 'stc_price_trans', cssClass: 'right-align', isDetail: true, width: 100, },
    { id: 'stc_cost_eva_qty', name: '評価数量', field: 'stc_cost_eva_qty', cssClass: 'right-align',  isDetail: true, width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', isDetail: true, width: 40, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', isDetail: true, width: 100, },
    { id: 'stc_inventory_type', name: '棚卸区分', field: 'stc_inventory_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_recv_type', name: '売掛区分', field: 'stc_recv_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_pay_type', name: '買掛区分', field: 'stc_pay_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_expence_type', name: '経費区分', field: 'stc_expence_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' }, { key: '', val: '-' }], isDetail: true, width: 50, },
    { id: 'stc_cost_type', name: '原価区分', field: 'stc_cost_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], isDetail: true, width: 50, },
    { id: 'stc_unit_price', name: '原価', field: 'stc_unit_price', cssClass: 'right-align', isDetail: true, width: 70, },
    // { id: 'stc_type_01', name: '棚卸締', field: 'stc_type_01', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 50, },
    // { id: 'stc_type_02', name: '売掛締', field: 'stc_type_02', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 50, },
    // { id: 'stc_type_03', name: '買掛締', field: 'stc_type_03', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' }, { key: '', val: '-' },], width: 50, },
    // { id: 'stc_type_05', name: '区５', field: 'stc_type_05', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '-' }, { key: '1', val: '完了' },], width: 50, },
    { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isDetail: true, width: 80, },
    { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, isDetail: true, width: 60, },
    { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', isDetail: true, width: 60, },
    { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', isDetail: true, width: 70, },


    // 在庫調整用
    { id: 'stc_report_no', name: '伝票No', field: 'stc_report_no', /* stc_target_idも同様 */  is2HeaderPK: true, width: 80, },
    { id: 'stc_report_date', name: '調整日付', field: 'stc_report_date',  editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, is2Header: true, width: 100, },
    // { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.viewpayment, is2DetailPK: true, width: 100, },
    { id: 'stc_sub_no_01', name: '枝番①', field: 'stc_sub_no_01', is2DetailPK: true, width: 60, },
    // { id: 'stc_sub_no_02', name: '枝番②', field: 'stc_sub_no_02', is2DetailPK: true, width: 60, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, is2Detail: true, width: 120, },
    { id: 'productcd', name: '品名CD', field: 'productcd', /*editor: IdEditor, ref: 'product', validator: masterValidator,*/ is2Detail: true, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, is2Detail: true, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', is2Detail: true, width: 200, },
    { id: 'stc_qty_trans', name: '現在数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', is2Detail: true, width: 80, },
    { id: 'stc_qty_trans_upd', name: '更新後数量', field: 'stc_qty_trans_upd', editor: Slick.Editors.Text, cssClass: 'right-align', is2Detail: true, width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, is2Detail: true, width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', formatter: Slick.Editors.Text, is2Detail: true, width: 100, },
    { id: 'makercd', name: 'メーカーCD', field: 'makercd', formatter: Slick.Editors.Text, is2Detail: true, width: 100, },
    { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is2Detail: true, width: 80, },
    { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, is2Detail: true, width: 60, },
    { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', is2Detail: true, width: 60, },
    { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_update_name', 'USER_NAME', 'user', dC['stc_update_cd']); }, is2Detail: true, width: 70, },

    
    // 在庫移動用
    { id: 'stc_report_no', name: '伝票No', field: 'stc_report_no', /* stc_target_idも同様 */  is3HeaderPK: true, width: 80, },
    { id: 'stc_report_date', name: '移動日付', field: 'stc_report_date',  editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, is3Header: true, width: 100, },
    // { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.viewpayment, is3DetailPK: true, width: 100, },
    { id: 'stc_sub_no_01', name: '枝番①', field: 'stc_sub_no_01', is3DetailPK: true, width: 60, },
    { id: 'stc_sub_no_02', name: '枝番②', field: 'stc_sub_no_02', is3DetailPK: true, width: 60, },
    { id: 'stc_place_cd', name: '移動前場所', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, is3Detail: true, width: 120, },
    { id: 'stc_place_cd_transfer', name: '移動後場所', field: 'stc_place_cd_transfer', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, is3Detail: true, width: 120, },
    { id: 'productcd', name: '品名CD', field: 'productcd', /*editor: IdEditor, ref: 'product', validator: masterValidator,*/ is3Detail: true, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, is3Detail: true, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', is3Detail: true, width: 200, },
    { id: 'stc_qty_trans', name: '数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', is3Detail: true, width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, is3Detail: true, width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', formatter: Slick.Editors.Text, is3Detail: true, width: 100, },
    { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, is3Detail: true, width: 80, },
    { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, is3Detail: true, width: 60, },
    { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', is3Detail: true, width: 60, },
    { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_update_name', 'USER_NAME', 'user', dC['stc_update_cd']); }, is3Detail: true, width: 70, },


  ];
  // マスタ
  // 品名
  masterPGs.pgProduct.columns = [
    { id: 'prc_cat_01_cd', name: '階①', field: 'prc_cat_01_cd', editor: selectCellPRCEditor, maxlength: 2, width: 60, },
    { id: 'prc_cat_01_name', name: '階①名称', field: 'prc_cat_01_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'prc_cat_01_name', 'prc_name', 'productcategory', '1-' + dC['prc_cat_01_cd'] + '-000-000'); }, maxlength: 2, width: 80, },
    { id: 'prc_cat_02_cd', name: '階②', field: 'prc_cat_02_cd', editor: Slick.Editors.Text,/*selectCellPRCEditor,*/ maxlength: 3, width: 100, },
    { id: 'prc_cat_02_name', name: '階②名称', field: 'prc_cat_02_name', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return masterProdCategoryFormatter(dC, v, 'prc_cat_02_name', 'prc_name', '2-' + dC['prc_cat_01_cd'] + '-' + dC['prc_cat_02_cd'] + '-000', '2'); }, maxlength: 2, width: 100, },
    { id: 'prc_cat_03_cd', name: '階③', field: 'prc_cat_03_cd', editor: Slick.Editors.Text,/*selectCellPRCEditor,*/  maxlength: 3, width: 60, },
    { id: 'prc_cat_03_name', name: '階③名称', field: 'prc_cat_03_name', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return masterProdCategoryFormatter(dC, v, 'prc_cat_03_name', 'prc_name', '3-' + dC['prc_cat_01_cd'] + '-' + dC['prc_cat_02_cd'] + '-' + dC['prc_cat_03_cd'], '3'); }, maxlength: 2, width: 100, },
    { id: 'prc_cat_04_cd', name: '階④', field: 'prc_cat_04_cd', editor: Slick.Editors.Text, maxlength: 3, width: 60, },
    { id: 'prc_cat_04_name', name: '階④名称', field: 'prc_cat_04_name', editor: Slick.Editors.Text, maxlength: 44, width: 100, },
    { id: 'p_cd', name: '品名CD', field: 'p_cd', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return makeCombineStr('p_cd', v, dC); }, width: 100, },
    { id: 'p_name', name: '品名', field: 'p_name', editor: DisabledTextEditor, /*editor: Slick.Editors.Text,*/ validator: textValidator, formatter: function (r, c, v, cD, dC) { return makeEstPrdNameFormatter('p_name', v, dC); },  width: 300, },
    
    // { id: 'p_type_04', name: '重点品名区分', field: 'p_type_04', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '対象外' }, { key: '1', val: '対象' }, ], width: 100, },
    // { id: 'p_standard_cost', name: '標準原価', field: 'p_standard_cost', editor: Slick.Editors.Text, formatter: decimalFormatter, /*Validator: decimal2Validator,*/ cssClass: 'right-align', isHeader: true, },
    // { id: 'p_purchase_price', name: '最終仕入単価', field: 'p_purchase_price', editor: Slick.Editors.Text, formatter: decimalFormatter, /*validator:decimal2Validator,*/ cssClass: 'right-align', isHeader: true, width: 100,},
    { id: 'p_unit_eval', name: '評価単位', field: 'p_unit_eval', width: 90, editor: selectCellUnitEditor, formatter: selectCellUnitFormatter, },
    { id: 'p_unit_tran', name: '取引単位', field: 'p_unit_tran', width: 90, editor: selectCellUnitEditor, formatter: selectCellUnitFormatter, },
    { id: 'p_type_subject', name: '科目区分', field: 'p_type_subject', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '1', val: '1:製品' }, { key: '2', val: '2:リセール品' }, { key: '3', val: '3:半製品' }, { key: '4', val: '4:原材料品' },  { key: '5', val: '5:包装資材' },  { key: '6', val: '6:リセール加工品' }, { key: '7', val: '7:経費' }, ], width: 130, },
    // { id: 'p_fig_num', name: '図番', field: 'p_fig_num', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, },
    {
      id: 'p_type', name: '品種区分', field: 'p_type', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue,
      options: [{ key: ' ', val: ' ' }, { key: '1', val: '金網' },], width: 100,
    },
    // { id: 'p_type_cost', name: '原価区分', field: 'p_type_cost', width: 90, /*editor: SelectCellEditorValue,*/ formatter: SelectCellFormatterValue, options: [{ key: '0', val: 'マスタ標準原価' }, { key: '1', val: '原価個別登録' }, ], width: 130, },
    // { id: 'p_type_02', name: '仕入ロット区分', field: 'p_type_02', width: 90, /*editor: SelectCellEditorValue,*/ formatter: SelectCellFormatterValue, options: [{ key: '0', val: '発注時' }, { key: '1', val: '入荷時' }, ], width: 130, },
    // { id: 'p_raw_material_cd', name: '材質品名CD', field: 'p_raw_material_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 14, formatter: function (r, c, v, cD, dC) { return makeEstMaterialFormatter('p_name01', v, dC); }, width: 100, },
    // { id: 'p_tool_name', name: '材料品名', field: 'p_tool_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 25, width: 200,},
    // { id: 'p_price_per_m', name: '金網加工@(kg)', field: 'p_price_per_m', cssClass: 'right-align', footerfunc: sumJPYFooter, width: 150,},
    // { id: 'p_price_per_m', name: '金網加工@(㎡)', field: 'p_price_per_m', cssClass: 'right-align', footerfunc: sumJPYFooter, width: 150,},
    // { id: 'p_remarks', name: '備考(原材料の規格登録)', field: 'p_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, },
    // { id: 'p_update_at', name: '更新日', field: 'p_update_at', editor: Slick.Editors.Date, width: 120, },
    // { id: 'p_update_cd', name: '更新者', field: 'p_update_cd', editor: Slick.Editors.Text, width: 120, },
  ];
  // 材質マスタ
  masterPGs.pgMaterial.columns = [
    { id: 'm_cd', name: '材質CD', field: 'm_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, isDetailPK: true },
    { id: 'm_name', name: '材質名称', field: 'm_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 24, width: 300, },
    { id: 'm_s_gravity', name: '比重', field: 'm_s_gravity', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return FloatFormatter(r, c, v, cD, dC, 3); } },
    { id: 'm_s_gravity_Fe', name: '鉄基準', field: 'm_s_gravity_Fe', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return FloatFormatter(r, c, v, cD, dC, 3); } },
  ];
  // 重量マスタ
  masterPGs.pgWeight.columns = [
    { id: 'wm_cd', name: '織方', field: 'wm_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, },
    { id: 'wm_dia_num', name: '線径', field: 'wm_dia_num', editor: Slick.Editors.Text, validator: textValidator, maxlength: 5, },
    {
      id: 'wm_type_mesh', name: '目合区分', field: 'wm_type_mesh', editor: SelectCellEditor, formatter: SelectCellFormatterValue,
      options: [{ key: 0, val: ' ' }, { key: 1, val: 'P' },], maxlength: 5,
    },
    { id: 'wm_mesh_num', name: '目合', field: 'wm_mesh_num', editor: Slick.Editors.Text, validator: textValidator, maxlength: 5, },
    { id: 'wm_unit_cd', name: '数量単位CD(目合単位)', field: 'wm_unit_cd', formatter: SelectCellFormatterValue, options: [{ key: 'mm', val: 'mm' }, { key: 'mesh', val: 'mesh' },], maxlength: 2, width: 150, },
    { id: 'wm_weight_num', name: '重量', field: 'wm_weight_num', editor: Slick.Editors.Text, formatter: decimalFormatter, validator: decimal2Validator, },
  ];
  // 倉庫マスタ
  masterPGs.pgWarehouse.columns = [
    { id: 'w_cd', name: '場所CD', field: 'w_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 100, },
    { id: 'w_name', name: '場所名', field: 'w_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 40, width: 200, },
    { id: 'w_short_name', name: '倉庫名略称', field: 'w_short_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 5, width: 100, },
  ];
  // クリンプ機
  masterPGs.pgGari.columns = [
    { id: 'g_cd', name: 'ガリ機CD', field: 'g_cd', editor: Slick.Editors.Integer, maxlength: 1, isDetailPK: true, width: 100, },
    { id: 'g_name', name: 'ガリ機名称', field: 'g_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 200, },
    { id: 'g_velocity', name: '製造速度', field: 'g_velocity', editor: Slick.Editors.Integer, validator: integerValidator, rangefilter: true, maxlength: 10, width: 150, },
  ];
  // 織機
  masterPGs.pgWeave.columns = [
    { id: 'wv_cd', name: '織機CD', field: 'wv_cd', editor: Slick.Editors.Text, maxlength: 2, isDetailPK: true, width: 100, },
    { id: 'wv_name', name: '織機名称', field: 'wv_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 150, },
    { id: 'wv_rate', name: '比率', field: 'wv_rate', editor: Slick.Editors.Text, formatter: decimalFormatter, validator: decimal2Validator, rangefilter: true, maxlength: 5, width: 100, },
  ];
  // カム
  masterPGs.pgCam.columns = [
    { id: 'cam_cd', name: '織方', field: 'cam_cd', editor: Slick.Editors.Text, maxlength: 3, isDetailPK: true, width: 90, },
    { id: 'cam_lower_lim', name: '下限値', field: 'cam_lower_lim', editor: Slick.Editors.Text, formatter: decimalFormatter, validator: decimal2Validator, rangefilter: true, maxlength: 5, width: 90, },
    { id: 'cam_upper_lim', name: '上限値', field: 'cam_upper_lim', editor: Slick.Editors.Text, validator: textValidator, rangefilter: true, maxlength: 5, width: 90, },
    { id: 'cam_control', name: 'カム', field: 'cam_control', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 90, },
    { id: 'cam_remarks', name: '備考', field: 'cam_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 90, },
  ];
  // 金型
  masterPGs.pgMold.columns = [
    { id: 'ml_cd', name: '型番', field: 'ml_cd', isDetailPK: true, maxlength: 5, width: 100, },
    { id: 'ml_size', name: 'サイズ', field: 'ml_size', formatter: SelectCellFormatter, options: [{ key: '0', val: '大' }, { key: '1', val: '中' }, { key: '2', val: '小' },], width: 100, },
    { id: 'ml_model', name: '型式', field: 'ml_model', maxlength: 20, width: 150, },
    { id: 'ml_mark_01', name: 'マーク①', field: 'ml_mark_01', maxlength: 10, width: 100, },
    { id: 'ml_mark_02', name: 'マーク②', field: 'ml_mark_02', maxlength: 10, width: 100, },
    { id: 'ml_gear_num', name: '歯数', field: 'ml_gear_num', rangefilter: true, maxlength: 4, width: 100, },
    { id: 'ml_pitch', name: 'ピッチ', field: 'ml_pitch', rangefilter: true, maxlength: 7, width: 100, },
    { id: 'ml_pitch_factor', name: 'ピッチ倍率', field: 'ml_pitch_factor', rangefilter: true, maxlength: 5, width: 80, },
    { id: 'ml_apply', name: '適用', field: 'ml_apply', maxlength: 3, width: 100, },
    { id: 'ml_control_num', name: '金型管理番号', field: 'ml_control_num', maxlength: 2, width: 150, },
    { id: 'ml_inspection', name: '点検', field: 'ml_inspection', maxlength: 20, width: 150, },
    { id: 'ml_inspection_way', name: '点検方法', field: 'ml_inspection_way', maxlength: 20, width: 150, },
    { id: 'ml_remarks', name: '備考', field: 'ml_remarks', maxlength: 30, width: 150, },
  ];
  masterPGs.pgManufacture.columns = [
    { id: 'mn_cd', name: '工程CD', field: 'mn_cd', isDetailPK: true, maxlength: 2, width: 50, },
    { id: 'mn_name', name: '工程名', field: 'mn_name', /*editor: Slick.Editors.text, validator: textValidator, formatter: paddingFormatter, isDetailPK: true,*/  width: 80, },
    { id: 'mn_content_cd', name: '加工内容CD', field: 'mn_content_cd', isDetailPK: true, maxlength: 3, width: 100, },
    { id: 'mn_content_name', name: '加工内容名称', field: 'mn_content_name', width: 100, },
    { id: 'mn_content_init', name: '作業内容初期表示用', field: 'mn_content_init', width: 100, },
    { id: 'mn_inspection_01', name: '検査1', field: 'mn_inspection_01', width: 100, },
    { id: 'mn_inspection_02', name: '検査2', field: 'mn_inspection_02', width: 100, },
    { id: 'mn_inspection_03', name: '検査3', field: 'mn_inspection_03', width: 100, },
    { id: 'mn_cd_01', name: '工程30初期表示', field: 'mn_cd_01', width: 100, },
    { id: 'mn_cd_02', name: '工程40初期表示', field: 'mn_cd_02', width: 100, },
    { id: 'mn_cd_03', name: '工程50初期表示', field: 'mn_cd_03', width: 100, },
  ];
  // 検査項目
  masterPGs.pgInspectionitem.columns = [
    { id: 'ini_cd', name: '検査項目CD', field: 'ini_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 150, },
    { id: 'ini_name', name: '検査項目名称', field: 'ini_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 150, },
    /*{ id: 'ini_manage_cd', name: '管理単位CD', field: 'ini_manage_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 150, },*/
    { id: 'ini_remark', name: '備考', fieldt: 'ini_remark', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 150, },
  ];
  // 線径
  masterPGs.pgWire.columns = [
    { id: 'wi_cd', name: '線番CD', field: 'wi_cd', editor: Slick.Editors.Text, width: 60, isDetailPK: true, maxlength: 3, width: 100, },
    { id: 'wi_standard', name: '基準値', field: 'wi_standard', editor: Slick.Editors.Text, validator: textValidator, rangefilter: true, maxlength: 6, width: 100, },
    { id: 'wi_upper', name: '上限値', field: 'wi_upper', editor: Slick.Editors.Text, rangefilter: true, maxlength: 6, width: 150, },
    { id: 'wi_lower', name: '下限値', field: 'wi_lower', editor: Slick.Editors.Text, rangefilter: true, maxlength: 6, width: 150, },
  ];
  // 運送会社
  masterPGs.pgTransportCompany.columns = [
    { id: 'tc_short_name', name: '運送会社略称', field: 'tc_short_name', editor: Slick.Editors.Text, isDetailPK: true, maxlength: 12, width: 200, },
    { id: 'tc_name', name: '運送会社名', field: 'tc_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 200, },
    { id: 'tc_type_report', name: '帳票区分', field: 'tc_type_report', /*editor: SelectCellEditorValue,*/ formatter: SelectCellFormatterValue, options: [{ key: '0', val: '不要' }, { key: '1', val: '必要' },], isHeader: true, width: 150, },
    { id: 'tc_dealer', name: '取扱店名', field: 'tc_dealer', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 120, },
    { id: 'tc_tel_main', name: '電話番号（代表）', field: 'tc_tel_main', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 150, },
    { id: 'tc_tel_pick', name: '電話番号（集荷）', field: 'tc_tel_pick', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 150, },
    { id: 'tc_tel_ship', name: '電話番号（出荷）', field: 'tc_tel_ship', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 150, },
    { id: 'tc_owner', name: '荷主コード', field: 'tc_owner', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 100, },
    { id: 'tc_owner_name', name: '荷主名', field: 'tc_owner_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 40, width: 100, },
  ];
  // 品名分類 
  masterPGs.pgProductcategory.columns = [
    { id: 'prc_cd', name: '分類区分', field: 'prc_cd', formatter: SelectCellFormatterValue, options: [{ key: '1', val: '大' }, { key: '2', val: '中' }, { key: '3', val: '小' },],isDetailPK: true, maxlength: 1, width: 80, },
    { id: 'prc_cat_01_cd', name: '大分類CD', field: 'prc_cat_01_cd', isDetailPK: true, maxlength: 2, width: 80, },
    { id: 'prc_cat_02_cd', name: '中分類CD', field: 'prc_cat_02_cd', isDetailPK: true, maxlength: 3, width: 80, },
    { id: 'prc_cat_03_cd', name: '小分類CD', field: 'prc_cat_03_cd', isDetailPK: true, maxlength: 3, width: 80, },
    { id: 'prc_name', name: '分類名称', field: 'prc_name', editor: Slick.Editors.Text, maxlength: 50, width: 100, },
    { id: 'prc_short_name', name: '分類略称', field: 'prc_short_name', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'prc_short_name', 'prc_short_name', 'productcategory', dC['prc_cd'] + '-' + dC['prc_cat_01_cd'] + '-' + dC['prc_cat_02_cd'] + '-' + dC['prc_cat_03_cd']) }, validator: textValidator, },
  ];
  // 荷姿マスタ
  masterPGs.pgPacking.columns = [
    { id: `pkg_cd`, name: '荷姿CD', field: 'pkg_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 100, },
    { id: `pkg_name`, name: '荷姿名', field: 'pkg_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 40, width: 100, },
    { id: `pkg_content`, name: '荷姿詳細', field: 'pkg_content', editor: Slick.Editors.Text, validator: textValidator, maxlength: 40, width: 100, },
    /*{ id: `pkg_type_01`, name: '区分1', field: 'pkg_type_01', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 100, },
    { id: `pkg_type_02`, name: '区分2', field: 'pkg_type_02', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 100, },
    { id: `pkg_type_03`, name: '区分3', field: 'pkg_type_03', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 100, },
    { id: `pkg_type_04`, name: '区分4', field: 'pkg_type_04', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 100, },*/
  ];
  // 客先
  masterPGs.pgCustomer.columns = [
    { id: 'C_CUSTOMER_CD', name: '客先CD', field: 'C_CUSTOMER_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, isDetailPK: true },
    { id: 'C_CUSTOMER_NAME', name: '客先名', field: 'C_CUSTOMER_NAME', width: 100, editor: Slick.Editors.Text, validator: textValidator, maxlength: 300, width: 300, },
    {
      id: 'C_CUSTOMER_SIGN', name: '客先区分', field: 'C_CUSTOMER_SIGN', formatter: SelectCellFormatterValue,
      options: [{ key: 'K', val: '顧客' }, { key: 'T', val: '委託先' }, { key: 'Z', val: '材料調達先' }, { key: 'S', val: 'その他' },], width: 90,
    },
    { id: 'C_ADDRESS_NO', name: '郵便番号', field: 'C_ADDRESS_NO', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, },
    { id: 'C_ADDRESS_01', name: '住所1', field: 'C_ADDRESS_01', editor: Slick.Editors.Text, validator: textValidator, maxlength: 150, width: 300, },
    { id: 'C_ADDRESS_02', name: '住所2', field: 'C_ADDRESS_02', editor: Slick.Editors.Text, validator: textValidator, maxlength: 150, width: 300, },
    { id: 'C_TEL', name: '電話番号', field: 'C_TEL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 120, },
    // { id: 'C_SALESMAN_CD', name: '営業担当者CD', field: 'C_SALESMAN_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 100, },
    // { id: 'C_PAYMENT_WAY2', name: '集金区分', field: 'C_PAYMENT_WAY2', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無 ' }, { key: '1', val: '有' },], width: 90, },
    // { id: 'C_OFFSET_SIGN', name: '相殺区分', field: 'C_OFFSET_SIGN', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無 ' }, { key: '1', val: '有' },], width: 90, },
    { id: 'C_FINALDAY', name: '請求締日', field: 'C_FINALDAY', editor: Slick.Editors.Text, validator: textValidator, maxlength: 2, width: 90, },
    {
      id: 'C_RECEPTION_PAYMENT_SIGN', name: '入出金予定区分', field: 'C_RECEPTION_PAYMENT_SIGN', formatter: SelectCellFormatterValue,
      options: [{ key: '0', val: '当月(都度)' }, { key: '1', val: '翌月' }, { key: '2', val: '翌々月' }, { key: '3', val: '3か月後' },], width: 90,
    },
    { id: 'C_RECEPTION_PAYMENT_DAY', name: '支払・回収日', field: 'C_RECEPTION_PAYMENT_DAY', editor: Slick.Editors.Text, validator: textValidator, maxlength: 2, width: 100, },
    { id: 'C_BILL_NO_PREVIOUS', name: '登録番号(インボイス)', field: 'C_BILL_NO_PREVIOUS', editor: Slick.Editors.Text, width: 100, },
    { id: 'C_REMARKS', name: '備考', field: 'C_REMARKS', editor: Slick.Editors.Text, validator: textValidator, maxlength: 300, width: 150, },
  ];
  // 社員
  masterPGs.pgUser.columns = [
    { id: 'USER_CD', name: '社員CD', field: 'USER_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 6, isDetailPK: true },
    { id: 'USER_NAME', name: '社員名', field: 'USER_NAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 200, },
    {
      id: 'POSITION_SIGN', name: '所属区分', field: 'POSITION_SIGN', editor: SelectCellEditor, formatter: SelectCellFormatter,
      options: [{ key: 'S', val: '営業' }, { key: 'P', val: '製造' },], width: 100,
    },
  ];
  // 客先部署
  masterPGs.pgCustomerpost.columns = [
    { id: 'CP_POST_CD', name: '客先部署CD', field: 'CP_POST_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, isDetailPK: true, width: 100, },
    { id: 'CP_POST_NAME', name: '出荷主、納入先、止め先名', field: 'CP_POST_NAME', editor: Slick.Editors.Text, maxlength: 50, width: 100, formatter: function (r, c, v, cD, dC) { return getMasterDataCustomerPost(dC, 'CP_POST_NAME', v, dC['CP_CUSTOMER_CD'], dC['CP_POST_CD']); }, width: 200, },
    { id: 'CP_ADDRESS_NO', name: '郵便番号', field: 'CP_ADDRESS_NO', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 100, },
    { id: 'CP_ADDRESS_01', name: '住所1', field: 'CP_ADDRESS_01', editor: Slick.Editors.Text, validator: textValidator, maxlength: 150, width: 300, },
    { id: 'CP_ADDRESS_02', name: '住所2', field: 'CP_ADDRESS_02', editor: Slick.Editors.Text, validator: textValidator, maxlength: 150, width: 300, },
    { id: 'CP_TEL', name: '電話番号', field: 'CP_TEL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 120, },
    { id: 'CP_CUSTOMER_CD', name: '客先CD', field: 'CP_CUSTOMER_CD', editor: Slick.Editors.Text, validator: masterNNValidator, ref: 'customer', maxlength: 3, isDetailPK: true },
    { id: 'CP_CUSTOMER_NAME', name: '客先名', field: 'CP_CUSTOMER_NAME', /*editor: Slick.Editors.Text,*/ width: 100, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'CUSTOMER_NAME', 'C_CUSTOMER_NAME', 'customer', dC['CP_CUSTOMER_CD']); }, width: 200, },
  ];
  // 客先担当者
  masterPGs.pgCustomercharge.columns = [
    { id: 'CC_CUSTOMER_CD', name: '客先CD', field: 'CC_CUSTOMER_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, isDetailPK: true },
    { id: 'CC_POST_CD', name: '客先部署CD', field: 'CC_POST_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, isDetailPK: true, width: 100, },
    { id: 'CC_CHARGE_CD', name: '客先担当者CD', field: 'CC_CHARGE_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, isDetailPK: true, width: 150, },
    { id: 'CUSTOMER_NAME', name: '客先名', field: 'CUSTOMER_NAME', editor: DisabledTextEditor, width: 100, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'CUSTOMER_NAME', 'C_CUSTOMER_NAME', 'customer', dC['CC_CUSTOMER_CD']); }, width: 250, },
    { id: 'POST_NAME', name: '客先部署名', field: 'POST_NAME', editor: DisabledTextEditor, width: 100, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'POST_NAME', 'CP_POST_NAME', 'customerpost', dC['CC_CUSTOMER_CD'] + '-' + dC['CC_POST_CD']); }, width: 250, },
    { id: 'CC_CHARGE_NAME', name: '客先担当者', field: 'CC_CHARGE_NAME', editor: Slick.Editors.Text, width: 100, validator: textValidator, maxlength: 50, width: 100, },
  ];
  // 単位マスタ
  // masterPGs.pgUnitHeader.columns = [
  //   { id: 'u_row_order', name: '表示順', field: 'u_row_order', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unitASC, maxlength: 6, },
  // ];
  masterPGs.pgUnit.columns = [
    { id: 'u_cd', name: '数量単位CD', field: 'u_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 6, },
    { id: 'u_name', name: '数量単位', field: 'u_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, },
    { id: 'u_row_order', name: '表示順', field: 'u_row_order', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, },
  ];
  // 製品手配マスタ
  masterPGs.pgParrangement.columns = [
    { id: 'par_cd', name: '製品手配区分', field: 'par_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150, },
    { id: 'par_name', name: '製品手配名称', field: 'par_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 200, },
  ];
  // 加工内容マスタ
  masterPGs.pgArrangement.columns = [
    { id: 'ar_sub_cd', name: '加工内容CD', field: 'ar_sub_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 2, width: 100, },
    { id: 'ar_name', name: '加工内容', field: 'ar_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 200, },
    { id: 'ar_cd', name: '加工区分', field: 'ar_cd',  editor: SelectCellEditor, formatter: SelectCellFormatter,
    options: [{ key: '1', val: '振動篩' }, { key: '2', val: '加工なし' }, { key: '3', val: 'その他加工' }, { key: '4', val: '金型' },], maxlength: 2, width: 100, },
  ];
  // 税率
  masterPGs.pgTax.columns = [
    { id: 't_cd', name: '税率CD', field: 't_cd', editor: Slick.Editors.Text, width: 60, validator: textValidator, maxlength: 3, },
    { id: 't_before_rate', name: '指定日前税率', field: 't_before_rate', editor: Slick.Editors.Text, formatter: decimalFormatter, validator: decimal2Validator, width: 150, },
    { id: 't_rate_change_date', name: '税率変更日', field: 't_rate_change_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 150, },
    { id: 't_rate', name: '指定日後税率', field: 't_rate', editor: Slick.Editors.Text, formatter: decimalFormatter, validator: decimal2Validator, width: 150, },
  ];
  // 検査数マスタ
  masterPGs.pgInspection.columns = [
    { id: 'ins_quantity', name: '製造数', field: 'ins_quantity', editor: Slick.Editors.Integer, maxlength: 3, },
    { id: 'ins_level_01', name: '検査水準1', field: 'ins_level_01', editor: Slick.Editors.Integer, maxlength: 3, },
    { id: 'ins_level_02', name: '検査水準2', field: 'ins_level_02', editor: Slick.Editors.Integer, maxlength: 3, },
  ];
  masterPGs.pgProcess.columns = [
    { id: 'pc_cd', name: '工程CD', field: 'pc_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 2, isDetailPK: true },
    { id: 'pc_name', name: '工程名', field: 'pc_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width:150,},
  ];
  // masterPGs.pgPermissions.columns = [
  //   { id: 'PERMISSION_ID', name: '権限ID', field: 'PERMISSION_ID', editor: Slick.Editors.Text, validator: textValidator, maxlength: 5, isDetailPK: true },
  //   { id: 'PERMISSION_NAME', name: '権限名', field: 'PERMISSION_NAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, },
  //   {
  //     id: 'PERMISSION_CONTROL_TABLE', name: 'コントロールテーブル', field: 'PERMISSION_CONTROL_TABLE', width: 130, editor: SelectCellEditor, formatter: SelectCellFormatter,
  //     options: [{ key: '0', val: '閲覧のみ' }, { key: '1', val: '閲覧及び更新' },], width:180,
  //   },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter }
  // ];
  // masterPGs.pgHousecompany.columns = [
  //   //{ id: 'H_COMPANY_ID', name: '自社（場所）ID', field: 'H_COMPANY_ID', editor: Slick.Editors.Text, isDetailPK: true },
  //   { id: 'H_COMPANY_CD', name: '自社（場所）コード', field: 'H_COMPANY_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, isDetailPK: true, width: 150, },
  //   { id: 'H_COMPANY_NAME', name: '自社（場所）名', field: 'H_COMPANY_NAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 300, width: 150, },
  //   { id: 'H_COMPANY_SHORT', name: '自社（場所）略称', field: 'H_COMPANY_SHORT', editor: Slick.Editors.Text, validator: textValidator, maxlength: 300, width: 150, },
  //   { id: 'H_COMPANY_SIGN', name: '本支店区分', field: 'H_COMPANY_SIGN', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 200, },
  //   //{ id: 'H_MAIN_COMPANY_ID', name: '本社ID（本社の場合は空欄）', field: 'H_MAIN_COMPANY_ID', editor: Slick.Editors.Text },
  //   { id: 'H_MAIN_COMPANY_CD', name: '本社CD', field: 'H_MAIN_COMPANY_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, },
  //   //{ id: 'H_SALESMAN_ID', name: '責任者ID', field: 'H_SALESMAN_ID', editor: Slick.Editors.Text },
  //   { id: 'H_SALESMAN_CD', name: '責任者CD', field: 'H_SALESMAN_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, },
  //   { id: 'H_NO', name: '郵便番号', field: 'H_NO', editor: Slick.Editors.Text, validator: textValidator, maxlength: 8, width: 120, },
  //   { id: 'H_ADDRESS', name: '住所', field: 'H_ADDRESS', editor: Slick.Editors.Text, validator: textValidator, maxlength: 300, width: 300, },
  //   { id: 'H_EMAIL', name: '代表Eメール', field: 'H_EMAIL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,  },
  //   { id: 'H_TEL', name: '電話番号', field: 'H_TEL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 130,  },
  //   { id: 'H_FAX', name: 'FAX', field: 'H_FAX', editor: Slick.Editors.Text, validator: textValidator, maxlength: 15, width: 130,  },
  //   { id: 'H_FINALDAY', name: '決算日', field: 'H_FINALDAY', editor: Slick.Editors.Text, validator: textValidator, maxlength: 2, width: 120,  },
  //   { id: 'H_REMARKS', name: '備考', field: 'H_REMARKS', editor: Slick.Editors.Text, validator: textValidator, maxlength: 100, },
  //   // { id: 'H_TAXRATE_CURRENT', name: '現在消費税率', field: 'H_TAXRATE_CURRENT', editor: Slick.Editors.Text },
  //   // { id: 'H_TAXRATE_PLANNED', name: '予定消費税率', field: 'H_TAXRATE_PLANNED', editor: Slick.Editors.Text },
  //   // { id: 'H_TAXRATE_CHANGE_DATE', name: '消費税率変更日', field: 'H_TAXRATE_CHANGE_DATE', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, },
  //   { id: 'H_INVOICE_TAX_SUM', name: '消費税合算区分', field: 'H_INVOICE_TAX_SUM', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150, },
  //   { id: 'H_INVOICE_TAX_CAL', name: '消費税計算区分', field: 'H_INVOICE_TAX_CAL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150,},
  //   // { id: 'H_INVOICE_TAX_DISPLAY', name: '消費税表示区分', field: 'H_INVOICE_TAX_DISPLAY', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, },
  //   { id: 'H_F_SWIFT', name: 'SWIFTコード', field: 'H_F_SWIFT', editor: Slick.Editors.Text, validator: textValidator, maxlength: 8, width: 100, },
  //   { id: 'H_F_IBAN', name: 'IBANコード', field: 'H_F_IBAN', editor: Slick.Editors.Text, validator: textValidator, maxlength: 34, width: 150, },
  //   { id: 'H_F_COUNTRY', name: '国名', field: 'H_F_COUNTRY', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150, },		
  //   { id: 'H_F_BANK_NAME', name: '送金銀行名', field: 'H_F_BANK_NAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},		
  //   { id: 'H_F_BANK_BRANCHNAME', name: '支店名', field: 'H_F_BANK_BRANCHNAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50,width: 150, },		
  //   { id: 'H_F_BANK_ADDRESS', name: '銀行住所', field: 'H_F_BANK_ADDRESS', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 300,},		
  //   { id: 'H_F_BANK_TEL', name: '銀行電話番号', field: 'H_F_BANK_TEL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 150, width: 150,},
  //   { id: 'H_F_APPLIC_NAME', name: '依頼人名', field: 'H_F_APPLIC_NAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 100, width: 150,},
  //   { id: 'H_F_APPLIC_ADDRESS', name: '依頼人住所', field: 'H_F_APPLIC_ADDRESS', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 200,},
  //   { id: 'H_F_APPLIC_TEL', name: '依頼人電話番号', field: 'H_F_APPLIC_TEL', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 150, },
  //   { id: 'H_BANK_CODE1', name: '金融機関コード1', field: 'H_BANK_CODE1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},
  //   { id: 'H_BANK_NAME1', name: '金融機関名', field: 'H_BANK_NAME1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 150,},
  //   { id: 'H_BANK_BRANCH1', name: '支店コード1', field: 'H_BANK_BRANCH1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 150,},
  //   { id: 'H_BANK_BRANCH1_NAME', name: '金融機関支店名', field: 'H_BANK_BRANCH1_NAME', editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 150,},	
  //   { id: 'H_ACCOUNT_TYPE1', name: '科目コード1', field: 'H_ACCOUNT_TYPE1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150, },
  //   { id: 'H_ACCOUNT_NUMBER1'	, name: '口座番号1', field: 'H_ACCOUNT_NUMBER1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 7, width: 150, },
  //   { id: 'H_ACCOUNT_NAME1', name: '口座名義人1', field: 'H_ACCOUNT_NAME1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_ACCOUNT_KANA1', name: '口座名義人（カナ）1', field: 'H_ACCOUNT_KANA1', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_BANK_CODE2', name: '金融機関コード2', field: 'H_BANK_CODE2', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},	
  //   { id: 'H_BANK_BRANCH2', name: '支店コード2', field: 'H_BANK_BRANCH2', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 150,},	
  //   { id: 'H_ACCOUNT_TYPE2', name: '科目コード2', field: 'H_ACCOUNT_TYPE2', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150,},
  //   { id: 'H_ACCOUNT_NUMBER2', name: '口座番号2', field: 'H_ACCOUNT_NUMBER2', editor: Slick.Editors.Text, validator: textValidator, maxlength: 7, width: 150,},	
  //   { id: 'H_ACCOUNT_NAME2', name: '口座名義人2', field: 'H_ACCOUNT_NAME2', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_ACCOUNT_KANA2', name: '口座名義人（カナ）2', field: 'H_ACCOUNT_KANA2', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_BANK_CODE3', name: '金融機関コード3', field: 'H_BANK_CODE3', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},
  //   { id: 'H_BANK_BRANCH3', name: '支店コード3', field: 'H_BANK_BRANCH3', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 150,},
  //   { id: 'H_ACCOUNT_TYPE3', name: '科目コード3', field: 'H_ACCOUNT_TYPE3', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150,},
  //   { id: 'H_ACCOUNT_NUMBER3', name: '口座番号3', field: 'H_ACCOUNT_NUMBER3', editor: Slick.Editors.Text, validator: textValidator, maxlength: 7, width: 150,},
  //   { id: 'H_ACCOUNT_NAME3', name: '口座名義人3', field: 'H_ACCOUNT_NAME3', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_ACCOUNT_KANA3', name: '口座名義人（カナ）3', field: 'H_ACCOUNT_KANA3', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_BANK_CODE4', name: '金融機関コード4', field: 'H_BANK_CODE4', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},
  //   { id: 'H_BANK_BRANCH4', name: '支店コード4', field: 'H_BANK_BRANCH4', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 150,},
  //   { id: 'H_ACCOUNT_TYPE4', name: '科目コード4', field: 'H_ACCOUNT_TYPE4', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150,},
  //   { id: 'H_ACCOUNT_NUMBER4', name: '口座番号4', field: 'H_ACCOUNT_NUMBER4', editor: Slick.Editors.Text, validator: textValidator, maxlength: 7, width: 150,},
  //   { id: 'H_ACCOUNT_NAME4', name: '口座名義人4', field: 'H_ACCOUNT_NAME4', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_ACCOUNT_KANA4', name: '口座名義人（カナ）4', field: 'H_ACCOUNT_KANA4', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},	
  //   { id: 'H_BANK_CODE5', name: '金融機関コード5', field: 'H_BANK_CODE5', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},
  //   { id: 'H_BANK_BRANCH5', name: '支店コード5', field: 'H_BANK_BRANCH5', editor: Slick.Editors.Text, validator: textValidator, maxlength: 3, width: 150,},
  //   { id: 'H_ACCOUNT_TYPE5', name: '科目コード5', field: 'H_ACCOUNT_TYPE5', editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150,},	
  //   { id: 'H_ACCOUNT_NUMBER5', name: '口座番号5', field: 'H_ACCOUNT_NUMBER5', editor: Slick.Editors.Text, validator: textValidator, maxlength: 7, width: 150,},	
  //   { id: 'H_ACCOUNT_NAME5', name: '口座名義人5', field: 'H_ACCOUNT_NAME5', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_ACCOUNT_KANA5', name: '口座名義人（カナ）5', field: 'H_ACCOUNT_KANA5', editor: Slick.Editors.Text, validator: textValidator, maxlength: 50, width: 150,},
  //   { id: 'H_ZACCOUNT_CD', name: '材料注文科目コード', field: 'H_ZACCOUNT_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},
  //   { id: 'H_GACCOUNT_CD', name: '外注注文科目コード', field: 'H_GACCOUNT_CD', editor: Slick.Editors.Text, validator: textValidator, maxlength: 4, width: 150,},
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter }
  // ];


  // masterPGs.pgBom.columns = [   // BOMマスタ
  //   { id: 'b_parent_id', name: '親製品ID', field: 'b_parent_id', editor: Slick.Editors.Integer, isDetailPK: true },
  //   {
  //     id: 'b_child_id', name: '子製品ID', field: 'b_child_id', editor: Slick.Editors.Integer, isDetailPK: true },
  //   { id: 'parent_p_name', name: '親製品名称', field: 'parent_p_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'parent_p_name', 'p_name', 'product', dC['b_parent_id']); } },
  //   { id: 'child_p_name', name: '子製品名称', field: 'child_p_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'child_p_name', 'p_name', 'product', dC['b_child_id']); } },
  //   { id: 'b_typeA', name: 'typeA', field: 'b_typeA', editor: Slick.Editors.Integer,  },
  //   { id: 'b_typeB', name: 'typeB', field: 'b_typeB', editor: Slick.Editors.Integer,  },
  //   { id: 'b_quantity', name: '所要数量', field: 'b_quantity', editor: Slick.Editors.Integer },
  //   { id: 'b_time_fix', name: '時間(固定)', field: 'b_time_fix', editor: Slick.Editors.Integer },
  //   { id: 'b_time_amount', name: '時間(比例)', field: 'b_time_amount', editor: Slick.Editors.Integer },
  //   {
  //     id: 'b_proc_name', name: '工程名(子製品ID未指定時に有効)', field: 'b_proc_name', width: 180, editor: Slick.Editors.Text, validator: BOMProcValidator, maxlength: 200,
  //   },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter }
  // ];
  // masterPGs.pgBomAssignableTo.columns = [ // BOM割当
  //   { id: 'bas_id', name: '割当ID', field: 'bas_id', editor: Slick.Editors.Integer, isDetailPK: true },
  //   { id: 'b_parent_id', name: '親製品ID', field: 'b_parent_id', editor: Slick.Editors.Integer, },
  //   { id: 'parent_p_name', name: '親製品名称', field: 'parent_p_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'parent_p_name', 'p_name', 'product', dC['b_parent_id']); } },
  //   { id: 'members_id_01', name: 'メンバーID(装置)', field: 'members_id_01', editor: Slick.Editors.Integer, },
  //   { id: 'members_name', name: 'メンバ名', field: 'members_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'members_name', 'name', 'members', dC['members_id']); } },
  //   { id: 'bas_rank', name: '優先順位', field: 'bas_rank', editor: Slick.Editors.Integer, },
  //   { id: 'members_id_02', name: 'メンバーID(作業者)', field: 'members_id_02', editor: Slick.Editors.Integer, },
  //   { id: 'process_cd', name: '工程CD', field: 'process_cd', editor: Slick.Editors.Text, },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter }
  // ];
  // masterPGs.pgProjects.columns = [
  //   { id: 'prj_id', name: 'プロジェクトID', field: 'prj_id', editor: Slick.Editors.Integer, isDetailPK: true, },
  //   { id: 'name', name: '名称', field: 'name', width: 200, editor: Slick.Editors.Text, formatter: treeNodeFormatter, validator: textValidator, maxlength: 255, },
  //   { id: 'start_plan', name: '開始日時', field: 'start_plan', editor: Slick.Editors.Date, width: 150,},
  //   { id: 'finish_plan', name: '完了日時', field: 'finish_plan', editor: Slick.Editors.Date, width: 150, },
  //   { id: 'parent_id', name: '親プロジェクトID', field: 'parent_id', editor: Slick.Editors.Integer, width: 250,},
  //   // { id: 'depth', name: '深さ', field: 'depth', },
  //   // { id: 'dir', name: '階層', field: 'dir', editor: Slick.Editors.Text, },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter, }
  // ];
  // masterPGs.pgMembers.columns = [
  //   { id: 'mem_id', name: 'メンバーID', field: 'mem_id', editor: Slick.Editors.Integer, width: 150, },
  //   { id: 'name', name: 'メンバー名', field: 'name', width: 150, editor: Slick.Editors.Text, validator: textValidator, maxlength: 255, },
  //   {
  //     id: 'roles_id', name: '区分', field: 'roles_id', width: 90, editor: SelectCellEditor, formatter: SelectCellFormatter,
  //     options: [{ key: 1, val: '担当者' }, { key: 2, val: '設備' },]
  //   },
  //   {
  //     id: 'ignore_cal', name: '勤務形態', field: 'ignore_cal', width: 90, editor: selectCellIgnoreEditor, formatter: selectCellIgnoreFormatter,
  //   },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter, }
  // ];
  // masterPGs.pgStorereasons.columns = [
  //   { id: 'sre_id', name: '事由ID', field: 'sre_id', editor: Slick.Editors.Integer, width: 60, },
  //   { id: 'sre_name', name: '入出庫事由', field: 'sre_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 200, },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter, }
  // ];
  // masterPGs.pgInspectionview.columns = [
  //   // { id: 'inv_belong_cd', name: '会社CD', field: 'inv_belong_cd', editor: Slick.Editors.Text, validator: textValidator,width: 60, maxlength: 3, },
  //   { id: 'inv_type', name: '種類', field: 'inv_type', editor: selectCellManufactureEditor, formatter: selectCellManufactureFormatter, validator: textValidator, maxlength: 1, width: 200,  },
  //   { id: 'inv_pattern', name: 'パターン', field: 'inv_pattern',editor: Slick.Editors.Text, validator: textValidator, maxlength: 1, width: 150, },
  //   { id: 'inv_row_num', name: '行位置', field: 'inv_row_num', editor: Slick.Editors.Integer, width: 2, width: 150, },    
  //   { id: 'inv_name', name: '初期表示内容(大項目)', field: 'inv_name',editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 200,  },
  //   { id: 'inv_name_02', name: '初期表示内容(中項目)', field: 'inv_name_02',editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 200,  },
  //   { id: 'inv_name_03', name: '初期表示内容(小項目)', field: 'inv_name_03',editor: Slick.Editors.Text, validator: textValidator, maxlength: 10, width: 200,  },
  //   { id: 'inv_remarks', name: '備考', field: 'inv_remarks',editor: Slick.Editors.Text, validator: textValidator, maxlength: 30, width: 200,  },
  // ];
  masterPGs.pgStorage.columns = [  // 在庫
    // {id: 'sr_cd', name: '部門', field: 'sr_cd', editor:Slick.Editors.Text, },
    // {id: 'sr_w_cd', name: '場所', field: 'sr_w_cd', editor: Slick.Editors.Text, },
    {id: 'w_name', name: '場所名', field: 'w_name', editor: Slick.Editors.Text, },
    {id: 'sr_p_cd', name: '品名CD', field: 'sr_p_cd', editor: Slick.Editors.Text, },
    {id: 'p_name', name: '品名', field: 'p_name', editor: Slick.Editors.Text, width: 150, },
    {id: 'sr_sub_01', name: '線径・線幅①', field: 'sr_sub_01', editor: Slick.Editors.Text, },
    {id: 'sr_sub_12', name: '線厚み①', field: 'sr_sub_12', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_02', name: '線径・線幅②', field: 'sr_sub_02', editor: Slick.Editors.Text, },
    {id: 'sr_sub_13', name: '線厚み②', field: 'sr_sub_13', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_03', name: '目合区分', field: 'sr_sub_03', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_04', name: '目合横', field: 'sr_sub_04', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_05', name: '目合縦', field: 'sr_sub_05', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_06', name: '目合単位', field: 'sr_sub_06', editor: Slick.Editors.Text,width: 70, },
    // {id: 'sr_sub_07', name: 'コイル番号', field: 'sr_sub_07'	, editor: Slick.Editors.Text,} 
    {id: 'sr_sub_08', name: 'サイズ横', field: 'sr_sub_08', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_10', name: '横補足(仕入LotNo)', field: 'sr_sub_10',  editor: Slick.Editors.Text, width: 100, },
    {id: 'sr_sub_09', name: 'サイズ縦', field: 'sr_sub_09', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_sub_11', name: '縦補足(製鋼番号)', field: 'sr_sub_11', editor: Slick.Editors.Text, width: 100, },
    {id: 'sr_sub_14', name: '自社LotNo', field: 'sr_sub_14',  editor: Slick.Editors.Text, width: 100, },
    {id: 'sr_quantity', name: '在庫数量', field: 'sr_quantity', editor: Slick.Editors.Text, width: 70, },
    {id: 'sr_unit_cd', name: '管理単位', field: 'sr_unit_cd', editor: Slick.Editors.Text, width: 60, },
    {id: 'makername', name: 'メーカー', field: 'makername', editor: Slick.Editors.Text, width: 120, },
    {id: 'sr_remarks', name: '状態', field: 'sr_remarks', editor: Slick.Editors.Text, width: 120, },
  ];
  // チェックボックス付加
  masterPGs.pgStorage.columns.unshift(masterPGs.pgStorage.checkboxSelector.getColumnDefinition(),);
  // masterPGs.pgPayment.columns = [
  //   { id: 'py_cd', name: '受払種別CD', field: 'py_cd', editor: Slick.Editors.Integer, width: 60, isDetailPK: true, width: 100, },
  //   { id: 'py_name', name: '受払種別名称', field: 'py_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 250, },
  //   { id: 'py_type', name: '受払区分', field: 'py_type', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 100,  },
  //   { id: 'py_inventory_type', name: '棚卸', field: 'py_inventory_type', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 100, },
  //   { id: 'py_receive_type', name: '売掛', field: 'py_receive_type', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 100, },
  //   { id: 'py_payment_type', name: '買掛', field: 'py_payment_type', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 100, },
  //   { id: 'py_expense_type', name: '経費', field: 'py_expense_type', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 100,  },
  //   { id: 'py_cost_type', name: '製造原価', field: 'py_cost_type', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, width: 100,  },
  //   // { id: 'upy_update_at_name', name: '更新日', field: 'py_update_at', /*editor: Slick.Editors.Text, validator: textValidator, */maxlength: 200, },
  //   // { id: 'py_update_cd', name: '更新者', field: 'py_update_cd', /*editor: Slick.Editors.Text, validator: textValidator, */maxlength: 200, },
  //   // { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter, }
  // ];


  // masterPGs.pgWbsctrl.columns = [
  //   { id: 'wctrl_id', name: '勤務形態ID', field: 'wctrl_id', editor: Slick.Editors.Integer, width: 60, isDetailPK: true, },
  //   { id: 'name', name: '名称', field: 'name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 200, },
  //   { id: 'day_st_hour', name: '始業時間', field: 'day_st_hour', editor: Slick.Editors.Integer, },
  //   { id: 'day_en_hour', name: '終業時間', field: 'day_en_hour', editor: Slick.Editors.Integer, },
  //   // { id: 'overtime_default', name: '最大残業時間', field: 'overtime_default', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_num', name: '休憩回数', field: 'breaktime_num', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_start_1', name: '休憩開始時間_1', field: 'breaktime_start_1', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_finish_1', name: '休憩終了時間_1', field: 'breaktime_finish_1', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_start_2', name: '休憩開始時間_2', field: 'breaktime_start_2', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_finish_2', name: '休憩終了時間_2', field: 'breaktime_finish_2', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_start_3', name: '休憩開始時間_3', field: 'breaktime_start_3', editor: Slick.Editors.Integer, },
  //   // { id: 'breaktime_finish_3', name: '休憩終了時間_3', field: 'breaktime_finish_3', editor: Slick.Editors.Integer, },
  // ];
  // masterPGs.pgCurrency.columns = [
  //   // { id: `cu_belong_cd`, name: '', field: 'tc_owner', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 100,},
  //   { id: `cu_cd`, name: '金種コード', field: 'cu_cd', editor: Slick.Editors.Text, validator: textValidator, maxlength: 2, width: 100,},
  //   { id: `cu_name`, name: '金種名', field: 'cu_name', editor: Slick.Editors.Text, validator: textValidator, maxlength: 20, width: 100,},
  //   { id: `cu_sight` , name: 'サイト要否', field: 'cu_sight', editor: SelectCellEditor, formatter: SelectCellFormatter,
  //   options: [{ key: '0', val: '不要' }, { key: '1', val: '必要' } ,], width: 100,},
  //   { id: `cu_type_continue` , name: '存続区分', field: 'cu_type_continue', editor: SelectCellEditor, formatter: SelectCellFormatter,
  //   options: [{ key: '0', val: '存続' }, { key: '1', val: '廃止' }, ], maxlength: 1, width: 100,},
  //   // { id: `cu_update_at` 
  //   // { id: `cu_update_time`
  //   // { id: `cu_update_cd` 
  // ];

  // checkdatPGs.pgCheckbom.columns = [    // BOM展開結果
  //   { id: 'p_name', name: '製品名称', field: 'p_name', width: 150, formatter: treeNodeFormatter },
  //   { id: 'b_parent_id', name: '親製品ID', field: 'b_parent_id', width: 60, },
  //   { id: 'b_child_id', name: '子製品ID', field: 'b_child_id', width: 60, },
  //   { id: 'b_quantity', name: '所要数量', field: 'pcs', width: 60, },
  //   { id: 'b_time_fix', name: '時間(固定)', field: 'b_time_fix', width: 60, },
  //   { id: 'b_time_amount', name: '時間(比例)', field: 'b_time_amount', width: 60, },
  //   { id: 'req_time', name: '所要時間', field: 'req_time', },
  //   { id: 'dtstart', name: '開始時間', field: 'dtstart', width: 110, },
  //   { id: 'dtfinish', name: '完了時間', field: 'dtfinish', width: 110, },
  //   // { id: 'depth', name: '深さ', field: 'depth', },
  //   // { id: 'dir', name: '階層', field: 'dir', },
  // ];
  checkdatPGs.pgAssignstock.columns = [ // 在庫引当
  { id: 'stc_sub_no_02', name: '受注枝番', field: 'stc_sub_no_02', width: 60, },
  { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, width: 120, },
  { id: 'productcd', name: '品名CD', field: 'productcd', width: 100, },
  { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, width: 200, },
  { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', width: 200, },
  { id: 'stc_qty_trans', name: '数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', width: 80, },
  { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 60, },
  { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: Slick.Editors.Text, width: 100, },
    // { id: 'sas_p_cd', name: '品名CD', field: 'sr_p_cd', editor: IdEditorStock, width: 100, },
    // { id: 'sas_p_name', name: '品名', field: 'sas_p_name', width: 100, },
    // { id: 'sas_parrangement_name', name: '加工内容', field: 'sas_parrangement_name', width: 100, },
    // { id: 'sas_p_supple', name: '品名補足印字内容', field: 'sas_p_supple', width: 200, },
    // { id: 'sas_location', name: '場所CD', field: 'sas_location', width: 100, },
    // { id: 'wname', name: '場所名', field: 'wname', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'wname', 'w_name', 'warehouse', dC['sas_location']); }, width: 100, },
    // { id: 'sas_lot_no', name: 'LotNo', field: 'sas_lot_no', width: 100, },
    // { id: 'updateat', name: '入荷日', field: 'updateat', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 100, },
    // { id: 'qty', name: '在庫数', field: 'qty', width: 100, },
    // { id: 'sas_unit_tran', name: '単位', field: 'sas_unit_tran', width: 50, },
    // { id: 'sas_estimate_no', name: '受注No', field: 'sas_estimate_no', width: 100, },
    // { id: 'sas_estimate_sub_no', name: '受注枝番', field: 'sas_estimate_sub_no', width: 100, },
    // { id: 'sas_shipment_sub_no', name: '出荷枝番', field: 'sas_shipment_sub_no', width: 100, },
    // { id: 'sas_quantity', name: '引当数', field: 'sas_quantity', editor: Slick.Editors.Text, validator: textValidator, width: 100, },
    // { id: 'sas_unit_tran', name: '取引単位', field: 'sas_unit_tran', width: 50, },
  ];
  checkdatPGs.pgManufacturingUse.columns = [ // 製造使用
    { id: 'stc_report_no', name: '受注番号', field: 'stc_report_no', width: 80, },    
    { id: 'stc_report_date_complete', name: '製造完了日', field: 'stc_report_date_complete',  editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 100, },
    { id: 'stc_report_date', name: '製造予定日', field: 'stc_report_date',  editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 100, },
    { id: 'stc_sub_no_01', name: '枝番', field: 'stc_sub_no_01', is2DetailPK: true, width: 60, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', editor: selectCellWarehouseEditor, formatter: selectCellWarehouseFormatter, width: 120, },
    { id: 'productcd', name: '品名CD', field: 'productcd', editor: IdEditor, ref: 'product', validator: masterValidator, width: 100, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', width: 200, },
    { id: 'stc_qty_trans', name: '使用数量', field: 'stc_qty_trans', editor: Slick.Editors.Text, cssClass: 'right-align', width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: Slick.Editors.Text, width: 100, },
    // { id: 'sp_product_cd', name: '品名CD', field: 'sp_product_cd', /*editor: Slick.Editors.Text,*/ width: 80, },
    // { id: 'sp_product_name', name: '品名', field: 'sp_product_name', /*editor: Slick.Editors.Text,*/ width: 150, },
    // { id: 'sp_parrangement_name', name: '加工内容名', field: 'sp_parrangement_name', /*editor: Slick.Editors.Text,*/ width: 120, },
    // { id: 'sp_product_supple', name: '品名補足印字内容', field: 'sp_product_supple', /*editor: Slick.Editors.Text,*/ width: 200, },
    // { id: 'sp_place_cd', name: '場所名', field: 'sp_place_cd', /*editor: selectCellWarehouseEditor,*/ formatter: selectCellWarehouseFormatter, width: 100, },
    // { id: 'sp_type_04', name: 'LotNo', field: 'sp_type_04', /*editor: Slick.Editors.Text, */width: 100, },
    // { id: 'sp_qty_trans', name: '引当数', field: 'sp_qty_trans', /*editor: Slick.Editors.Text,*/ width: 100, },
    // { id: 'sp_unit_tran', name: '取引単位', field: 'sp_unit_tran', /*editor: Slick.Editors.Text,*/ width: 100, },
  ];

  // checkdatPGs.pgTransferstock.columns = [   // 在庫移動
  //   { id: 'sp_place_cd', name: '場所CD', field: 'sp_place_cd', width: 100, },
  //   { id: 'sp_place_name', name: '場所名', field: 'sp_place_name', width: 100, },
  //   { id: 'sp_product_cd', name: '品名CD', field: 'sp_product_cd', width: 100, },
  //   { id: 'sp_product_name', name: '品名', field: 'sp_product_name', width: 100, },
  //   { id: 'p_type_subject', name: '科目', field: 'p_type_subject', width: 100, },
  //   { id: 'sp_sub_01', name: '線径横', field: 'sp_sub_01', width: 100, },
  //   { id: 'sp_sub_02', name: '線径縦', field: 'sp_sub_02', width: 100, },
  //   { id: 'sp_sub_03', name: '目合', field: 'sp_sub_03', width: 100, },
  //   { id: 'sp_sub_04', name: '目合横', field: 'sp_sub_04', width: 100, },
  //   { id: 'sp_sub_05', name: '目合縦', field: 'sp_sub_05', width: 100, },
  //   { id: 'sp_sub_06', name: '目合単位', field: 'sp_sub_06', width: 100, },
  //   { id: 'sp_sub_08', name: 'サイズ横', field: 'sp_sub_08', width: 100, },
  //   { id: 'sp_sub_09', name: 'サイズ縦', field: 'sp_sub_09', width: 100, },
  //   { id: 'sp_type_04', name: 'LotNo', field: 'sp_type_04', width: 100, },
  //   { id: 'sp_report_date', name: '製造日', field: 'sp_report_date', width: 100, },
  //   { id: 'sp_update_at', name: '最終移動日', field: 'sp_update_at', width: 100, },
  //   { id: 'sp_stock', name: '在庫数', field: 'sp_stock', width: 100, },
  //   { id: 'sp_unit_eval', name: '単位', field: 'sp_unit_eval', width: 100, },
  //   { id: 'stockplus', name: '入庫予定', field: 'stockplus', width: 100, },
  //   { id: 'stockminus', name: '出庫予定', field: 'stockminus', width: 100, },
  //   { id: 'stockremain', name: '残見込数', field: 'stockremain', width: 100, },
  //   { id: 'issuedate', name: '受払日', field: 'issuedate', width: 100, },
  //   { id: 'qtyinout', name: '入出庫数', field: 'qtyinout', width: 100, },
  //   { id: 'sp_arrangement_type', name: '受払種別', field: 'sp_arrangement_type',  editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.mstpayment, width: 100, },
  //   { id: 'target', name: '相手', field: 'target', width: 100, },
  //   { id: 'target_name', name: '相手名称', field: 'target_name', width: 100, },
  //   { id: 'remarks', name: '補足', field: 'remarks', width: 100, },
  // ];
  settingPGs.pgSettingProc.columns = [  // 加工内容編集
    { id: 'ppr_prod_plan_no', name: '指示No', field: 'ppr_prod_plan_no', width: 100, },
    { id: 'ppr_proc_cd', name: '工程区分', field: 'ppr_proc_cd', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.mstprocess, width: 80, },
    { id: 'ppr_mn_content_cd', name: '加工No', field: 'ppr_mn_content_cd', editor: IdEditor, ref: 'manufacture', width: 80, },
    { id: 'ppr_mn_content_name', name: '加工名称', field: 'ppr_mn_content_name', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'ppr_mn_content_name', 'mn_content_name', 'manufacture', dC['ppr_proc_cd'] + '-' + dC['ppr_mn_content_cd']); }, width: 100, },
    { id: 'ppr_details', name: '加工内容説明', field: 'ppr_details', editor: Slick.Editors.Text, width: 120, },
    { id: 'ppr_ins_cd_01', name: '検査CD1', field: 'ppr_ins_cd_01', editor: IdEditor, ref: 'inspectionitem', width: 50, },
    { id: 'ppr_ins_name_01', name: '検査名1', field: 'ppr_ins_name_01', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'ppr_ins_name_01', 'ini_name', 'inspectionitem', dC['ppr_ins_cd_01']); }, width: 100, },
    { id: 'ppr_ins_cd_02', name: '検査CD2', field: 'ppr_ins_cd_02', editor: IdEditor, ref: 'inspectionitem', width: 50, },
    { id: 'ppr_ins_name_02', name: '検査名2', field: 'ppr_ins_name_02', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'ppr_ins_name_02', 'ini_name', 'inspectionitem', dC['ppr_ins_cd_02']); }, width: 100, },
    { id: 'ppr_ins_cd_03', name: '検査CD3', field: 'ppr_ins_cd_03', editor: IdEditor, ref: 'inspectionitem', width: 50, },
    { id: 'ppr_ins_name_03', name: '検査名3', field: 'ppr_ins_name_03', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'ppr_ins_name_03', 'ini_name', 'inspectionitem', dC['ppr_ins_cd_03']); }, width: 100, },
    // { id: 'ppr_type_02', name: '人数', field: 'ppr_type_02', editor: Slick.Editors.Text,  width: 100, },
    { id: 'ppr_plan_interval', name: '作業予定時間', field: 'ppr_plan_interval', editor: Slick.Editors.Text, width: 100, },
  ];
  calcPGs.pgEDCalc.columns = [  // 見積計算画面
    // header
    { id: 'ec_estimate_no', name: '受注No', field: 'ec_estimate_no', isHeader: true, width: 80, },
    { id: 'ec_estimatecalc_no', name: '計算No', field: 'ec_estimatecalc_no', isHeader: true, width: 50, },
    { id: 'p_name', name: '品名', field: 'p_name', isHeader: true, width: 200, },
    { id: 'e_shipplan_date', name: '出荷予定日', field: 'e_shipplan_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 100, },
    { id: 'm_cd', name: '材質CD', field: 'm_cd', isHeader: true, width: 60, },
    { id: 'w_cd', name: '織方CD', field: 'w_cd', isHeader: true, width: 60, },
    { id: 'ec_ed_sub_01', name: '線径・平線①', field: 'ec_ed_sub_01', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ec_ed_sub_01', dC); }, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_ed_sub_12', name: '厚み①', field: 'ec_ed_sub_12', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ec_ed_sub_12', dC); }, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_ed_sub_02', name: '線径・平線②', field: 'ec_ed_sub_02', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ec_ed_sub_02', dC); }, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_ed_sub_13', name: '厚み②', field: 'ec_ed_sub_13', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ec_ed_sub_13', dC); }, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_ed_sub_03', name: '目合区分', field: 'ec_ed_sub_03', isHeader: true, width: 60, },
    { id: 'ec_ed_sub_04', name: '目合①', field: 'ec_ed_sub_04', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ec_ed_sub_04', dC); }, cssClass: 'right-align', isHeader: true, width: 60, },
    { id: 'ec_ed_sub_05', name: '目合②', field: 'ec_ed_sub_05', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ec_ed_sub_05', dC); }, cssClass: 'right-align', isHeader: true, width: 60, },
    { id: 'ec_ed_sub_06', name: '単位', field: 'ec_ed_sub_06', isHeader: true, width: 50, },
    { id: 'ec_sum_sheet', name: '合計枚数', field: 'ec_sum_sheet', cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_loss_rate', name: 'ロス率[%]', field: 'ec_loss_rate', editor: Slick.Editors.Integer, formatter: decimal0Formatter, validator: integerValidator, paramfunc: calcSUMUnitPrice, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_w_digits', name: '有効桁', field: 'ec_w_digits', editor: Slick.Editors.Integer, validator: integerValidator, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_calc_area', name: '正味㎡', field: 'ec_calc_area', cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_loss_area', name: 'ロス含㎡', field: 'ec_loss_area', cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_calc_weight_01', name: '正味重量', field: 'ec_calc_weight_01', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_area_weight', name: '㎡重量(従)', field: 'ec_area_weight', cssClass: 'right-align', isHeader: true, width: 80, },

    { id: 'ec_loss_weight', name: 'ロス含重量(従)', field: 'ec_loss_weight', /*formatter: function (r, c, v, cD, dC) { return calcLossWeight(dC, 'ec_loss_weight'); },*/ cssClass: 'right-align', isHeader: true, width: 80, },
    // 新版
    // { id: 'ec_calc_area_02', name: '正味㎡(詳)', field: 'ec_calc_area_02', cssClass: 'right-align', isHeader: true, width: 80, },
    // { id: 'ec_loss_area_02', name: 'ロス含㎡', field: 'ec_loss_area_02', editor: Slick.Editors.Integer, formatter: decimal0Formatter, validator: integerValidator, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_calc_weight_02', name: '正味重量(詳)', field: 'ec_calc_weight_02', cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_area_weight_02', name: '㎡重量(詳)', field: 'ec_area_weight_02', /*formatter: function (r,c,v,cD,dC) { return calcWeightPerAreaFormatter(dC);},*/ cssClass: 'right-align', isHeader: true, width: 80, },
    // { id: 'ec_w_digits_02', name: '有効桁(詳)', field: 'ec_w_digits_02', editor: Slick.Editors.Integer, validator: integerValidator, cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'ec_loss_weight_02', name: 'ロス含重量(詳)', field: 'ec_loss_weight_02', /*formatter: function (r,c,v,cD,dC) { return calcLossWeight(dC, 'ec_loss_weight_02');},*/ cssClass: 'right-align', isHeader: true, width: 80, },
    { id: 'shrink_mag_1', name: '縮み倍率①', field: 'shrink_mag_1', cssClass: 'right-align', editor: Slick.Editors.Text, isHeader: true, width: 80 },
    { id: 'shrink_mag_2', name: '縮み倍率②', field: 'shrink_mag_2', cssClass: 'right-align', editor: Slick.Editors.Text, isHeader: true, width: 80 },
    // header2**************************************************************************************************
    { id: 'ec_reserve_01', name: '算出値選択', field: 'ec_reserve_01', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '従来' }, { key: '1', val: '詳細' },], isHeader2: true, width: 100, },
    { id: 'ec_material_unit_cost', name: '材料＠', field: 'ec_material_unit_cost', editor: Slick.Editors.Integer, formatter: decimal0Formatter, paramfunc: calcSUMUnitPrice, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_material_cost', name: '材料費', field: 'ec_material_cost', formatter: function (r, c, v, cD, dC) { return calcMaterialCost(dC, 'ec_material_cost'); }, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_wage', name: '工賃＠', field: 'ec_wage', editor: Slick.Editors.Integer, validator: integerValidator, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_calc_wage', name: '工賃費', field: 'ec_calc_wage', formatter: function (r, v, c, cD, dC) { return calcWage(dC, 'ec_calc_wage'); }, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_packing_cost', name: '梱包費', field: 'ec_packing_cost', editor: Slick.Editors.Integer, validator: integerValidator, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_transport_cost', name: '運送費', field: 'ec_transport_cost', editor: Slick.Editors.Integer, validator: integerValidator, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_drawing_cost', name: '作図経費', field: 'ec_drawing_cost', editor: Slick.Editors.Integer, validator: integerValidator, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_sum_proc_price', name: '合計金額', field: 'ec_sum_proc_price', formatter: function (r, c, v, cD, dC) { return calcSumProcPrice(dC, 'ec_sum_proc_price'); }, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_area_cost_digit', name: '有効桁', field: 'ec_area_cost_digit', editor: Slick.Editors.Integer, validator: integerValidator, formatter: function (r, c, v, cD, dC) { return setCostDigit(v, dC); }, paramfunc: calcSUMUnitPrice, cssClass: 'right-align', isHeader2: true, width: 80, },
    { id: 'ec_area_cost', name: '基本㎡＠', field: 'ec_area_cost', formatter: function (r, c, v, cD, dC) { return calcCostPerArea(dC, 'ec_area_cost'); }, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_cut_cost', name: '切断＠', field: 'ec_cut_cost', editor: Slick.Editors.Integer, validator: integerValidator, paramfunc: setCutCost, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_cut_sum_cost', name: '切断金額', field: 'ec_cut_sum_cost', formatter: function (r, c, v, cD, dC) { return calcCutCost(v, dC); }, cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'ec_factor', name: '係数', field: 'ec_factor', editor: Slick.Editors.Text, formatter: decimalFormatter, paramfunc: calcSUMUnitPrice, formatter: function (r, c, v, cD, dC) { return setFactor(v, dC); }, validator: decimal2Validator, cssClass: 'right-align', isHeader2: true, width: 80, },
    { id: 'ec_sum_price', name: '合計金額', field: 'ec_sum_price', cssClass: 'right-align', isHeader2: true, width: 100, },
    { id: 'length_1_net_sum', name: '長さ①合計(正味)', field: 'length_1_net_sum', cssClass: 'right-align', width: 100, isHeader2: true },
    { id: 'length_2_net_sum', name: '長さ②合計(正味)', field: 'length_2_net_sum', cssClass: 'right-align', width: 100, isHeader2: true },
    { id: 'length_1_loss_sum', name: '長さ①(ロス含む)', field: 'length_1_loss_sum', cssClass: 'right-align', width: 100, isHeader2: true },
    { id: 'length_2_loss_sum', name: '長さ②(ロス含む)', field: 'length_2_loss_sum', cssClass: 'right-align', width: 100, isHeader2: true },
    { id: 'length_3_loss_sum', name: '長さ③(ロス含む)', field: 'length_3_loss_sum', cssClass: 'right-align', width: 100, isHeader2: true },
    // detail
    { id: 'ecd_estimate_sub_no', name: '枝番', field: 'ecd_estimate_sub_no', isPK: true, width: 50, },
    { id: 'ecd_ed_sub_08', name: '寸法➀', field: 'ecd_ed_sub_08', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ecd_ed_sub_08', dC); }, cssClass: 'right-align', width: 80, },
    { id: 'ecd_ed_sub_10', name: '寸法➀補足', field: 'ecd_ed_sub_10', width: 100, maxlength: 15, width: 80, },
    { id: 'ecd_ed_sub_09', name: '寸法➁', field: 'ecd_ed_sub_09', formatter: function (r, c, v, cD, dC) { return decimalGridFormatter(v, 'ecd_ed_sub_09', dC); }, cssClass: 'right-align', width: 80, },
    { id: 'ecd_ed_sub_11', name: '寸法➁補足', field: 'ecd_ed_sub_11', width: 100, maxlength: 15, width: 80, },
    { id: 'ecd_sub_14', name: '寸法③', field: 'ecd_sub_14', editor: Slick.Editors.Text, cssClass: 'right-align', width: 80, },
    { id: 'ecd_quantity', name: '受注数', field: 'ecd_quantity', editor: Slick.Editors.Text, formatter: decimal3Formatter, editorFixedDecimalPlaces: 0, validator: integerValidator, toheaderfunc: calcSUMArea, cssClass: 'right-align', width: 80, },
    { id: 'ecd_remarks', name: '単位', field: 'ecd_remarks', width: 50, },
    { id: 'ecd_net_area', name: '正味㎡', field: 'ecd_net_area', formatter: function (r, c, v, cD, dC) { return calcRealArea(dC, 'ecd_net_area'); }, cssClass: 'right-align', width: 80, },
    { id: 'ecd_loss_area', name: 'ロス含㎡', field: 'ecd_loss_area', formatter: function (r, c, v, cD, dC) { return calcAreaIncludeLoss(dC, 'ecd_loss_area'); }, toheaderfunc: calcSUMArea, cssClass: 'right-align', width: 80, },
    { id: 'ec_unit_price', name: '単価①', field: 'ec_unit_price', editor: Slick.Editors.Integer, cssClass: 'right-align', width: 100, },
    { id: 'ecd_cut_cost', name: '切断@', field: 'ecd_cut_cost', editor: Slick.Editors.Integer, toheaderfunc: calcSUMCutCost, cssClass: 'right-align', width: 100, },
    { id: 'ecd_process_01', name: '加工①', field: 'ecd_process_01', editor: Slick.Editors.Integer, /*toheaderfunc: setECDPriceSUM,*/ cssClass: 'right-align', width: 100, },
    { id: 'ecd_process_02', name: '加工②', field: 'ecd_process_02', editor: Slick.Editors.Integer, /*toheaderfunc: setECDPriceSUM,*/ cssClass: 'right-align', width: 100, },
    { id: 'ecd_process_03', name: '加工③', field: 'ecd_process_03', editor: Slick.Editors.Integer, /*toheaderfunc: setECDPriceSUM,*/ cssClass: 'right-align', width: 100, },
    { id: 'ecd_process_04', name: '加工➃', field: 'ecd_process_04', editor: Slick.Editors.Integer, /*toheaderfunc: setECDPriceSUM,*/ cssClass: 'right-align', width: 100, },
    { id: 'ecd_process_05', name: '加工➄', field: 'ecd_process_05', editor: Slick.Editors.Integer, /*toheaderfunc: setECDPriceSUM,*/ cssClass: 'right-align', width: 100, },
    { id: 'ecd_proc_cost', name: '合計単価', field: 'ecd_proc_cost', formatter: function (r, c, v, cD, dC) { return calcProcCost(dC, 'ecd_proc_cost', 1); }, cssClass: 'right-align', width: 100, },
    { id: 'ecd_fix_unit_cost', name: '修正単価', field: 'ecd_fix_unit_cost', toheaderfunc: setECDPriceSUM, editor: Slick.Editors.Integer, cssClass: 'right-align', width: 100, },
    { id: 'ecd_price', name: '金額', field: 'ecd_price', formatter: function (r, c, v, cD, dC) { return calcECDPrice(dC, 'ecd_price'); }, cssClass: 'right-align', width: 100, },
    { id: 'ecd_cost_price', name: '原価', field: 'ecd_cost_price', formatter: function (r, c, v, cD, dC) { return calcProcCost(dC, 'ecd_cost_price', 0); }, cssClass: 'right-align', width: 100, },
    { id: 'ec_remarks', name: '備考', field: 'ec_remarks', editor: Slick.Editors.Text, validator: textValidator, maxlength: 60, width: 150, },
    { id: 'number_1_net', name: '本数①(正味)', field: 'number_1_net', cssClass: 'right-align', width: 90, },
    { id: 'length_1_net', name: '長さ①(正味)', field: 'length_1_net', cssClass: 'right-align', width: 90, },
    { id: 'number_2_net', name: '本数②(正味)', field: 'number_2_net', cssClass: 'right-align', width: 90, },
    { id: 'length_2_net', name: '長さ②(正味)', field: 'length_2_net', cssClass: 'right-align', width: 90, },
    { id: 'number_1_loss', name: '本数①(ロス含)', field: 'number_1_loss', cssClass: 'right-align', width: 90, },
    { id: 'length_1_loss', name: '長さ①(ロス含)', field: 'length_1_loss', cssClass: 'right-align', width: 90, },
    { id: 'number_2_loss', name: '本数②(ロス含)', field: 'number_2_loss', cssClass: 'right-align', width: 90, },
    { id: 'length_2_loss', name: '長さ②(ロス含)', field: 'length_2_loss', cssClass: 'right-align', width: 90, },
    { id: 'length_3_loss', name: '長さ③(ロス含)', field: 'length_3_loss', cssClass: 'right-align', width: 90, },

  ];
  calcPGs.pgProdMold.columns = [    // 金網指図画面
    { id: 'pp_p_cd', name: '品名CD', field: 'pp_p_cd', isHeader: true, },
    { id: 'pp_p_material', name: '材質', field: 'pp_p_material', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.mstmaterial, isHeader: true, },
    { id: 'pp_p_weave', name: '織方', field: 'pp_p_weave', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: dropdownMaster.mstpcategory03, isHeader: true, width: 120, },
    { id: 'pp_bump_num', name: '山数', field: 'pp_bump_num', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return calcCam(dC, 'pp_bump_num'); }, cssClass: 'right-align', isHeader: true, },
    { id: 'pp_spec', name: '仕様', field: 'pp_spec', editor: Slick.Editors.Text, isHeader: true, },
    { id: 'pp_ed_sub_01', name: '線径①', field: 'pp_ed_sub_01', cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_12', name: '厚み①', field: 'pp_ed_sub_12', cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_04', name: '目合①', field: 'pp_ed_sub_04', cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_06', name: '単位①', field: 'pp_ed_sub_06', editor: SelectCellEditorValue, formatter: SelectCellFormatterValue, options: [{ key: 'mm', val: 'mm' }, { key: 'mesh', val: 'mesh' },], width: 50, isHeader: true, },
    { id: 'pp_depth_01', name: '深さ①', field: 'pp_depth_01', editor: Slick.Editors.Text, cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_02', name: '線径②', field: 'pp_ed_sub_02', cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_13', name: '厚み②', field: 'pp_ed_sub_13', cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_05', name: '目合②', field: 'pp_ed_sub_05', cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_ed_sub_06', name: '単位②', field: 'pp_ed_sub_06', formatter: SelectCellFormatterValue, options: [{ key: 'mm', val: 'mm' }, { key: 'mesh', val: 'mesh' },], width: 50, isHeader: true, },
    { id: 'pp_depth_02', name: '深さ②', field: 'pp_depth_02', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return setSameValue(dC, 'pp_depth_02', 'pp_depth_01', v); }, cssClass: 'right-align', width: 50, isHeader: true, },
    { id: 'pp_prod_plan_no', name: '製造指示番号', field: 'pp_prod_plan_no', editor: Slick.Editors.Text, isHeader: true, width: 120, },
    { id: 'pp_mold_01', name: '金型', field: 'pp_mold_01', editor: IdEditor, ref: 'mold', validator: textNNValidator, formatter: function (r, c, v, cD, dC) { return calcAtMold(dC, 'pp_mold_01'); }, isHeader: true, },
    { id: 'ml_gear_num_01', name: '歯数', field: 'ml_gear_num_01', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_gear_num', 'mold', dC['pp_mold_01']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'ml_pitch_01', name: 'ピッチ', field: 'ml_pitch_01', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_pitch', 'mold', dC['pp_mold_01']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'ml_apply_01', name: '適用', field: 'ml_apply_01', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_apply', 'mold', dC['pp_mold_01']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'ml_pitch_factor_01', name: 'ピッチ倍率', field: 'ml_pitch_factor_01', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_pitch_factor', 'mold', dC['pp_mold_01']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'pp_mold_02', name: '金型②', field: 'pp_mold_02', editor: Slick.Editors.Text, validator: textNNValidator, formatter: function (r, c, v, cD, dC) { return setSameValue(dC, 'pp_mold_02', 'pp_mold_01', v); }, isHeader: true, },
    { id: 'ml_gear_num_02', name: '歯数', field: 'ml_gear_num_02', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_gear_num', 'mold', dC['pp_mold_02']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'ml_pitch_02', name: 'ピッチ', field: 'ml_pitch_02', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_pitch', 'mold', dC['pp_mold_02']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'ml_apply_02', name: '適用', field: 'ml_apply_02', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_apply', 'mold', dC['pp_mold_02']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'ml_pitch_factor_02', name: 'ピッチ倍率', field: 'ml_pitch_factor_02', formatter: function (r, c, v, cD, dC) { return getMasterValue('ml_pitch_factor', 'mold', dC['pp_mold_02']); }, cssClass: 'right-align', isHeader: true, },
    { id: 'pp_sum_sheets', name: '総枚数', field: 'pp_sum_sheets', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', isHeader: true, },
    { id: 'pp_dimension', name: '総面積', field: 'pp_dimension', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', isHeader: true, },
    { id: 'pp_unit_weight', name: '1㎡の重量', field: 'pp_unit_weight', cssClass: 'right-align', isHeader: true, },
    { id: 'pp_loss_rate', name: 'ロス率', field: 'pp_loss_rate', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return calcLossRate(dC, 'pp_loss_rate', v); }, cssClass: 'right-align', isHeader: true, },
    { id: 'pp_weight', name: '重量(kg)', field: 'pp_weight', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return calcWeight(dC, 'pp_weight'); }, cssClass: 'right-align', isHeader: true, },
    { id: 'pp_weave_cd', name: '網織機No.', field: 'pp_weave_cd', editor: IdEditor, ref: 'weave', formatter: function (r, c, v, cD, dC) { return setRate(dC, 'pp_weave_cd'); }, isHeader: true, },
    { id: 'pp_weave_name', name: '織機名称', field: 'pp_weave_name', formatter: function (r, c, v, cD, dC) { return getMasterValue('wv_name', 'weave', dC['pp_weave_cd']); }, isHeader: true, },
    { id: 'pp_gari_cd', name: 'ガリ機No.', field: 'pp_gari_cd', editor: IdEditor, ref: 'gari', isHeader: true, },
    { id: 'pp_gari_name', name: 'ガリ機械名称', field: 'pp_gari_name', formatter: function (r, c, v, cD, dC) { return getMasterValue('g_name', 'gari', dC['pp_gari_cd']); }, isHeader: true, },
    { id: 'pp_recalc_sign', name: '再計算', field: 'pp_recalc_sign', editor: SelectCellEditor, formatter: SelectCellFormatter, options: [{ key: '0', val: '手修正' }, { key: '1', val: '自動計算' }], isHeader2: true, },
    { id: 'pp_left', name: '左', field: 'pp_left', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, width: 50, },
    { id: 'pp_weave_cnt', name: '織前本数', field: 'pp_weave_cnt', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, width: 50, },
    { id: 'pp_right', name: '右', field: 'pp_right', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, width: 50, },
    { id: 'pp_rate', name: '序列', field: 'pp_rate', /*editor: Slick.Editors.Text,*/ isHeader2: true, width: 200, },
    { id: 'pp_cam', name: 'カム', field: 'pp_cam', editor: Slick.Editors.Text, isHeader2: true, width: 50, },
    { id: 'pp_ins_level', name: '検査水準', field: 'pp_ins_level', editor: Slick.Editors.Text, paramfunc: inspectionNum, cssClass: 'right-align', isHeader2: true, width: 50, },
    { id: 'pp_transfer_day', name: '輸送日数', field: 'pp_transfer_day', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, width: 50, },
    { id: 'pp_packing_day', name: '枠付・梱包	', field: 'pp_packing_day', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, width: 70, },
    { id: 'pp_purchase_cd', name: '仕入先', field: 'pp_purchase_cd', editor: Slick.Editors.Text, isHeader2: true, width: 50, },
    { id: 'pp_purchase_name', name: '仕入先名', field: 'pp_purchase_name', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'pp_purchase_name', 'C_CUSTOMER_NAME', 'customer', dC['pp_purchase_cd']); }, isHeader2: true, },
    { id: 'pp_material_cd_01', name: '材料CD①', field: 'pp_material_cd_01', editor: Slick.Editors.Text, isHeader2: true, },
    { id: 'pp_material_name_01', name: '材料名①', field: 'pp_material_name_01', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return getMasterValue('p_name', 'product', dC['pp_material_cd_01']); }, isHeader2: true, width: 160, },
    { id: 'pp_raw_material_01', name: '材質①', field: 'pp_raw_material_01', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return getMasterValue('p_raw_material_cd', 'product', dC['pp_material_cd_01']); }, isHeader2: true, },
    { id: 'pp_material_cd_02', name: '材料CD②', field: 'pp_material_cd_02', editor: Slick.Editors.Text, isHeader2: true, },
    { id: 'pp_material_name_02', name: '材料名②', field: 'pp_material_name_02', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return getMasterValue('p_name', 'product', dC['pp_material_cd_02']); }, isHeader2: true, },
    { id: 'pp_raw_material_02', name: '材質②', field: 'pp_raw_material_02', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return getMasterValue('p_raw_material_cd', 'product', dC['pp_material_cd_02']); }, isHeader2: true, },
    { id: 'pp_sum_plan_cost', name: '予定原価合計', field: 'pp_sum_plan_cost', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    { id: 'pp_area_cost', name: '㎡単価', field: 'pp_area_cost', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return calcAreaUnitPrice(dC, 'pp_area_cost'); }, cssClass: 'right-align', isHeader2: true, },
    // 金網関連の工程のみ、こちらの画面にて設定
    { id: 'pp_proc_time_01', name: '10:段取', field: 'pp_proc_time_01', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    { id: 'pp_proc_time_02', name: '20:縦抜', field: 'pp_proc_time_02', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    { id: 'pp_proc_time_03', name: '21:横抜', field: 'pp_proc_time_03', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    { id: 'pp_proc_time_04', name: '22:組付', field: 'pp_proc_time_04', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    { id: 'pp_proc_time_05', name: '23:縦抜/組付', field: 'pp_proc_time_05', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    { id: 'pp_proc_time_06', name: '24:織・切断', field: 'pp_proc_time_06', editor: Slick.Editors.Text, cssClass: 'right-align', isHeader2: true, },
    // ここまでヘッダ***************************************************************************************
    { id: 'pw_change_sign', name: "選", field: "pw_change_sign", width: 40, /*sortable: true, */formatter: toggleButtonFormatter, },
    { id: 'pw_prod_plan_sub_no', name: '製枝', field: 'pw_prod_plan_sub_no', width: 40, },
    { id: 'pw_ed_sub_08', name: '寸法横', field: 'pw_ed_sub_08', formatter: decimal1Formatter, cssClass: 'right-align', width: 50, },
    { id: 'pw_ed_sub_09', name: '寸法縦', field: 'pw_ed_sub_09', formatter: decimal1Formatter, cssClass: 'right-align', width: 50, },
    { id: 'pw_dimension', name: '㎡', field: 'pw_dimension', cssClass: 'right-align', maxlength: 10, width: 40, },
    { id: 'pw_estimate_no', name: '受注番号', field: 'pw_estimate_no', width: 120, },
    { id: 'pw_estimate_sub_no', name: '受枝', field: 'pw_estimate_sub_no', width: 40, },
    { id: 'pw_finish_plan_date', name: '完了予定日', field: 'pw_finish_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 100, },
    { id: 'pw_quantity', name: '受注数', field: 'pw_quantity', formatter: decimal3Formatter, cssClass: 'right-align', width: 50, },
    { id: 'pp_unit', name: '単位', field: 'pp_unit', width: 40, },
    { id: 'pw_ins_qty', name: '検数', field: 'pw_ins_qty', editor: Slick.Editors.Integer, formatter: decimal0Formatter, validator: decimalValidator, cssClass: 'right-align', width: 50, },
    { id: 'pw_calc_dimension', name: '面積', field: 'pw_calc_dimension', /* formatter: function (r, c, v, cD, dC) { return calcPwAreaFormatter(dC, 'pw_dimension', 1); },*/ cssClass: 'right-align', width: 50, },
    { id: 'pp_shipment_cd', name: '出荷先', field: 'pp_shipment_cd', },
    { id: 'pp_delivery_cd', name: '納入先', field: 'pp_delivery_cd', },
    { id: 'pw_width_size', name: '横サイズ', field: 'pw_width_size', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputResultValue('pw_width_size', 'pw_ed_sub_08', dC, v); }, cssClass: 'right-align', width: 60, },
    { id: 'pw_side_num', name: '横枚数', field: 'pw_side_num', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return calcPChain(dC, 'pw_side_num', v); }, validator: integerValidator, cssClass: 'right-align', maxlength: 2, width: 50, },
    { id: 'pw_vertical_size', name: '縦サイズ', field: 'pw_vertical_size', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return inputResultValue('pw_vertical_size', 'pw_ed_sub_09', dC, v); }, cssClass: 'right-align', width: 60, },
    { id: 'pw_sheets_num', name: '枚数', field: 'pw_sheets_num', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return calcSheetsFormatter(dC, 'pw_sheets_num'); }, cssClass: 'right-align', width: 40, },
    { id: 'pw_side_count', name: '横本数', field: 'pw_side_count', cssClass: 'right-align', width: 50, },
    { id: 'pw_chain_num', name: 'チェン数', field: 'pw_chain_num', cssClass: 'right-align', width: 60, },
    { id: 'pw_group_sign', name: 'G', field: 'pw_group_sign', editor: Slick.Editors.Integer, velidator: integerValidator, cssClass: 'right-align', width: 40, },
    { id: 'pp_ch_calc', name: 'ch計算', field: 'pp_ch_calc', cssClass: 'right-align', width: 60, },
    { id: 'pp_ch_cut', name: 'ch切上', field: 'pp_ch_cut', cssClass: 'right-align', width: 60, },
    { id: 'pp_ch_result', name: 'ch決定', field: 'pp_ch_result', editor: Slick.Editors.Integer, cssClass: 'right-align', width: 60, },
    { id: 'pp_size_cut', name: '寸法切上', field: 'pp_size_cut', cssClass: 'right-align', width: 60, },
    { id: 'pp_size_result', name: '寸法決定', field: 'pp_size_result', cssClass: 'right-align', width: 60, },
    { id: 'pp_loss_cut', name: 'ロス切上', field: 'pp_loss_cut', cssClass: 'right-align', width: 60, },
    { id: 'pp_loss_result', name: 'ロス決定', field: 'pp_loss_result', cssClass: 'right-align', width: 60, },
    { id: 'pw_vert_num', name: '本数計算', field: 'pw_vert_num', cssClass: 'right-align', width: 60, },
    { id: 'pp_result_num', name: '本数決定', field: 'pp_result_num', editor: Slick.Editors.Integer, /*formatter: function (r, c, v, cD, dC) { return resultNumFormatter(dC, 'pp_result_num'); },*/ cssClass: 'right-align', width: 60, },
    { id: 'pp_push_side', name: '突出し', field: 'pp_push_side', cssClass: 'right-align', width: 60, },
    { id: 'pp_out_dia', name: '線外々', field: 'pp_out_dia', cssClass: 'right-align', width: 60, },
    { id: 'pp_push_vertical', name: '突出し', field: 'pp_push_vertical', cssClass: 'right-align', width: 60, },
    { id: 'pw_prod_remark', name: '製造コメント', field: 'pw_prod_remark', editor: Slick.Editors.Text, width: 100, },
    { id: 'pw_e_shipper_name', name: '出荷主名', field: 'pw_e_shipper_name', },
    { id: 'pw_e_delivery_name', name: '納品先名', field: 'pw_e_delivery_name', },
    // ここまで明細**********************************************************************************************************
    { id: 'pw_group_sign', name: 'G', field: 'pw_group_sign', editor: Slick.Editors.Integer, isDetail2: true, width: 40, },
    { id: 'pw_g_size_side', name: '寸法横', field: 'pw_g_size_side', editor: Slick.Editors.Text, validator: textNNValidator, cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_size', name: '実寸法', field: 'pw_g_size', editor: Slick.Editors.Text, validator: textNNValidator, cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_loss', name: 'ロス', field: 'pw_g_loss', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_sum_size', name: '全寸法', field: 'pw_g_sum_size', isDetail2: true, formatter: function (r, c, v, cD, dC) { return calcGrSumSize(v, dC); }, cssClass: 'right-align', width: 50, },
    { id: 'pw_g_vert', name: '一回長', field: 'pw_g_vert', editor: Slick.Editors.Text, formatter: function (r, c, v, cD, dC) { return calcPChain(dC, 'pw_g_vert', v); }, cssClass: 'right-align', isDetail2: true },
    { id: 'pw_g_num', name: '回数', field: 'pw_g_num', editor: Slick.Editors.Text, cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_ch_calc', name: 'ch計算', field: 'pw_g_ch_calc', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_ch_cut', name: 'ch切上', field: 'pw_g_ch_cut', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_ch_result', name: 'ch決定', field: 'pw_g_ch_result', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_size_cut', name: '寸法切上', field: 'pw_g_size_cut', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_size_result', name: '寸法決定', field: 'pw_g_size_result', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_loss_cut', name: 'ロス切上', field: 'pw_g_loss_cut', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_loss_result', name: 'ロス決定', field: 'pw_g_loss_result', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_sheets_calc', name: '本数計算', field: 'pw_g_sheets_calc', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_sheets_result', name: '本数決定', field: 'pw_g_sheets_result', editor: Slick.Editors.Integer, formatter: function (r, c, v, cD, dC) { return resultNumFormatter(dC, 'pw_g_sheets_result'); }, cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_push_side', name: '突出し', field: 'pw_g_push_side', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_out_dia', name: '線外々', field: 'pw_g_out_dia', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_push_vertical', name: '突出し', field: 'pw_g_push_vertical', cssClass: 'right-align', isDetail2: true, width: 50, },
    { id: 'pw_g_remark', name: '製造コメント', field: 'pw_g_remark', editor: Slick.Editors.Text, isDetail2: true, width: 100, },
    { id: 'isDeleted', name: '削除', field: 'isDeleted', editor: Slick.Editors.Checkbox, cssClass: 'cell-effort-driven', formatter: checkmarkFormatter, width: 50, },
  ];

   // 番号一覧 見積書
   numberListPGs.pgED.columns = [
    { id: 'e_estimate_no', name: '受注No', field: 'e_estimate_no', editor: DisabledTextEditor, width: 80 },
    { id: 'e_estimate_date', name: '受注日', field: 'e_estimate_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 90 },
    { id: 'e_customer_name', name: '得意先名', field: 'e_customer_name', editor: DisabledTextEditor, width: 130 },
    { id: 'p_name', name: '製品名称', field: 'p_name', editor: DisabledTextEditor, width: 150 },
    { id: 'sd_p_name_supple_01', name: '線径×目合', field: 'sd_p_name_supple_01', editor: DisabledTextEditor, width: 80 },
    { id: 'sd_p_name_supple_02', name: '寸法', field: 'sd_p_name_supple_02', editor: DisabledTextEditor, width: 80 },
    { id: 'ed_quantity', name: '受注数', field: 'ed_quantity', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'ed_unit_tran', name: '単位', field: 'ed_unit_tran', editor: DisabledTextEditor, width: 70 },
    { id: 'e_shipplan_date', name: '出荷予定日', field: 'e_shipplan_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 100 },
    { id: 'ed_same_no_count', name: '行数', field: 'ed_same_no_count', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'e_customer_order_no', name: '先方注文No.', field: 'e_customer_order_no', editor: DisabledTextEditor, width: 150 },
    { id: 'e_delivery_name', name: '納入先名称', field: 'e_delivery_name', editor: DisabledTextEditor, width: 100 },
    { id: 'e_title', name: '件名', field: 'e_title', width: 100, editor: DisabledTextEditor, maxlength: 50, width: 100 },
    { id: 'e_estimate_sign', name: '受注', field: 'e_estimate_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 60, },
    { id: 'label_issue', name: '現品票', field: 'label_issue', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 60, },
    { id: 'ed_type_moed', name: '発注', field: 'ed_type_moed', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '発注済' }, { key: '2', val: '入庫済' }, { key: '-', val: '-' },], width: 60, },
    { id: 'ed_prod_plan_sign', name: '製造', field: 'ed_prod_plan_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '指示' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'ed_ship_status_sign', name: '出荷', field: 'ed_ship_status_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '', val: '未' }, { key: '0', val: '指示' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'ed_delivery_sign', name: '納品', field: 'ed_delivery_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '未' }, { key: '2', val: '完了' },], width: 60, },
  ];
  // チェックボックス付加
  numberListPGs.pgED.columns.unshift(numberListPGs.pgED.checkboxSelector.getColumnDefinition(),);

  // 番号一覧 発注
  numberListPGs.pgMOD.columns = [
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', editor: DisabledTextEditor, width: 200 },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', editor: DisabledTextEditor, width: 270 },
    { id: 'moed_quantity', name: '発注数', field: 'moed_quantity', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'moed_unit_tran', name: '単位', field: 'moed_unit_tran', editor: DisabledTextEditor, width: 70 },
    { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_arrival_hd_date', name: '入荷予定日', field: 'moed_arrival_hd_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_same_no_count', name: '行数', field: 'moed_same_no_count', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'moed_salesman_name', name: '発注者', field: 'moed_salesman_name', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_report_remarks', name: '伝票備考', field: 'moed_report_remarks', editor: DisabledTextEditor, width: 80 },
    { id: 'label_issue', name: '現品票', field: 'label_issue', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 60, },
    { id: 'moed_order_sign', name: '発注', field: 'moed_order_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 60, },
    { id: 'moed_receive_sign', name: '受入', field: 'moed_receive_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 60,  },
    { id: 'moed_accept_sign', name: '検収', field: 'moed_accept_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 60,  },
  ];
  // チェックボックス付加
  numberListPGs.pgMOD.columns.unshift(numberListPGs.pgMOD.checkboxSelector.getColumnDefinition(),);

  // 番号一覧 製造委託
  numberListPGs.pgOOD.columns = [
    { id: 'moed_order_no', name: '委託No', field: 'moed_order_no', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_customer_name', name: '委託先名', field: 'moed_customer_name', editor: DisabledTextEditor, width: 150 },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', editor: DisabledTextEditor, width: 270 },
    { id: 'moed_quantity', name: '委託数', field: 'moed_quantity', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'moed_unit_tran', name: '単位', field: 'moed_unit_tran', editor: DisabledTextEditor, width: 70 },
    { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_arrival_hd_date', name: '入荷予定日', field: 'moed_arrival_hd_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_same_no_count', name: '行数', field: 'moed_same_no_count', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'moed_salesman_cd', name: '発注者', field: 'moed_salesman_cd', editor: DisabledTextEditor, width: 80, },
    { id: 'moed_report_remarks', name: '伝票備考', field: 'moed_report_remarks', editor: DisabledTextEditor, width: 80 },
  ];

  // 番号一覧 出荷予定
  numberListPGs.pgSD.columns = [
    { id: 's_estimate_no', name: '受注No', field: 's_estimate_no', width: 80 },
    { id: 's_estimate_date', name: '受注日', field: 's_estimate_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 's_serial_no', name: '納品連番', field: 's_serial_no', width: 80 },
    { id: 's_customer_name', name: '得意先名', field: 's_customer_name', editor: DisabledTextEditor, width: 150 },
    { id: 'sd_p_name', name: '品名', field: 'sd_p_name', editor: DisabledTextEditor, width: 200 },
    { id: 'sd_p_name_supple', name: '品名補足印字内容', field: 'sd_p_name_supple', editor: DisabledTextEditor, width: 150 },
    { id: 'sd_estimate_quantity', name: '受注数', field: 'sd_estimate_quantity', editor: DisabledTextEditor, width: 70, cssClass: 'right-align',  },
    { id: 'sd_unit_tran', name: '単位', field: 'sd_unit_tran', editor: DisabledTextEditor, width: 70 },
    { id: 's_shipping_plan_date', name: '出荷予定日', field: 's_shipping_plan_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 's_shipping_date', name: '出荷日', field: 's_shipping_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 's_salesman_name', name: '営業担当者', field: 's_salesman_name', width: 100 },
    { id: 's_shipper_name', name: '出荷主', field: 's_shipper_name', editor: DisabledTextEditor, width: 120  },
    { id: 's_delivery_name', name: '納入先', field: 's_delivery_name', editor: DisabledTextEditor, width: 120  },
    { id: 's_stay_name', name: '止め先', field: 's_stay_name', editor: DisabledTextEditor, width: 120 },
    { id: 's_sales_sign', name: '納品確定', field: 's_sales_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 70 },
    { id: 's_tc_short_name', name: '運送会社略称', field: 's_tc_short_name', editor: DisabledTextEditor, width: 120 },
    { id: 's_title', name: '件名', field: 's_title', editor: DisabledTextEditor, },
    { id: 's_remarks', name: '備考', field: 's_remarks', editor: DisabledTextEditor, width: 150 },
    { id: 'ed_ship_status_sign', name: '出荷', field: 'ed_ship_status_sign', formatter: SelectCellFormatterValue, options: [{ key: '', val: '未' }, { key: '0', val: '指示' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 50, },
    { id: 'ed_delivery_sign', name: '納品', field: 'ed_delivery_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '未' }, { key: '2', val: '完了' },], width: 50, },
    { id: 'ed_bill_sign', name: '請求', field: 'ed_bill_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 50, },
    { id: 'ed_payment_sign', name: '入金', field: 'ed_payment_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 50, },
  ];
  // チェックボックス付加
  numberListPGs.pgSD.columns.unshift(numberListPGs.pgSD.checkboxSelector.getColumnDefinition(),);

  // 番号一覧 請求書
  numberListPGs.pgBD.columns = [
    { id: 'b_bill_no', name: '請求No.', field: 'b_bill_no', editor: DisabledTextEditor },
    { id: 'bd_estimate_no', name: '受注No', field: 'bd_estimate_no', editor: DisabledTextEditor },
    { id: 'bd_order_date', name: '受注日', field: 'bd_order_date', editor: DisabledTextEditor, dateformat: 'yy/m/d',
    formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, },
    { id: 'b_customer_name', name: '得意先名', field: 'b_customer_name', editor: DisabledTextEditor, width: 150 },
    { id: 'bd_product_name', name: '品名', field: 'bd_product_name', editor: DisabledTextEditor, width: 250 },
    { id: 'bd_prod_summary', name: '品名補足印字内容', field: 'bd_prod_summary', editor: DisabledTextEditor, width: 150 },
    { id: 'bd_ed_quantity', name: '受注数', field: 'bd_ed_quantity', editor: DisabledTextEditor, width: 70, cssClass: 'right-align', },
    { id: 'bd_unit_tran', name: '単位', field: 'bd_unit_tran', editor: DisabledTextEditor, width: 70 },
    { id: 'bd_shipment_date', name: '出荷日', field: 'bd_shipment_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80 },
    { id: 'bd_payment_close_date', name: '入金予定日', field: 'bd_payment_close_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80 },
    { id: 'bd_payment_date', name: '入金日', field: 'bd_payment_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80 },
    { id: 'bd_payment_div', name: '入金分割', field: 'bd_payment_div', editor: DisabledTextEditor, width: 80 },
    { id: 'bd_payment_sign', name: '入金区分', field: 'bd_payment_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '済' },], width: 80 },
    { id: 'bd_cus_payment_cll', name: '集金有無', field: 'bd_cus_payment_cll', editor: DisabledTextEditor, width: 80 },
    { id: 'bd_salesman_name', name: '受注者名', field: 'bd_salesman_name', editor: DisabledTextEditor, width: 80 },
    { id: 'bd_detail_remarks', name: '備考', field: 'bd_detail_remarks', editor: DisabledTextEditor, width: 80 },
  ];
  // チェックボックス付加
  numberListPGs.pgBD.columns.unshift(numberListPGs.pgBD.checkboxSelector.getColumnDefinition(),);

  Object.keys(stockPGs).forEach((elem) => {
    let pg = stockPGs[elem];
    if (elem === 'pgCR15MSUS') {
      // SUS在庫
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'psupple', name: '品名補足印字内容', field: 'psupple',  width: 120,},
        { id: 'domestic15', name: '15M 国産', field: 'domestic15', cssClass: 'right-align', width: 60,},
        { id: 'overseas15', name: '15M 外材', field: 'overseas15', cssClass: 'right-align',  width: 60,},
        { id: 'unknown15', name: '15M 不明', field: 'unknown15', cssClass: 'right-align',  width: 60,},
        { id: 'domestic20', name: '20M 国産', field: 'domestic20', cssClass: 'right-align',  width: 60,},
        { id: 'overseas20', name: '20M 外材', field: 'overseas20', cssClass: 'right-align',  width: 60,},
        { id: 'unknown20', name: '20M 不明', field: 'unknown20', cssClass: 'right-align',  width: 60,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 120,},
        // { id: 'remarks', name: '備考', field: 'remarks',  width: 120,},
        // { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        // { id: 'placecd', name: '場所CD', field: 'placecd',  width: 80,},
      ];
    } else if (elem === 'pgCR15MZN') { 
      // 亜鉛在庫
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'psupple', name: '品名補足印字内容', field: 'psupple',  width: 120,},
        { id: 'domestic15_910', name: '910×15M 国産', field: 'domestic15_910', cssClass: 'right-align', width: 80,},
        { id: 'overseas15_910', name: '910×15M 外材', field: 'overseas15_910', cssClass: 'right-align',  width: 80,},
        { id: 'unknown15_910', name: '910×15M 不明', field: 'unknown15_910', cssClass: 'right-align',  width: 80,},
        { id: 'domestic15_1000', name: '1000×15M 国産', field: 'domestic15_1000', cssClass: 'right-align', width: 80,},
        { id: 'overseas15_1000', name: '1000×15M 外材', field: 'overseas15_1000', cssClass: 'right-align',  width: 80,},
        { id: 'unknown15_1000', name: '1000×15M 不明', field: 'unknown15_1000', cssClass: 'right-align',  width: 80,},
        { id: 'domestic20', name: '20M 国産', field: 'domestic20', cssClass: 'right-align',  width: 60,},
        { id: 'overseas20', name: '20M 外材', field: 'overseas20', cssClass: 'right-align',  width: 60,},
        { id: 'unknown20', name: '20M 不明', field: 'unknown20', cssClass: 'right-align',  width: 60,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 120,},
        // { id: 'remarks', name: '備考', field: 'remarks',  width: 120,},
        // { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        // { id: 'placecd', name: '場所CD', field: 'placecd',  width: 80,},
      ];
    } else if (elem.indexOf('CRRSVRYOKI') >= 0) { 
      // 引当有りクリンプ｛リョーキ｝※「詳細」ボタンなし
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'parrangementname', name: '加工内容', field: 'parrangementname', width: 150,},
        { id: 'psupple', name: '線径×目合', field: 'psupple', width: 100,},
        { id: 'sub08', name: '寸法', field: 'sub08', width: 80,},
        { id: 'sumqty', name: '数量', field: 'sumqty',  editor: Slick.Editors.Integer, cssClass: 'right-align',  width: 80,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 120,},
        { id: 'remarks', name: '状態', field: 'remarks',  width: 140,},
        { id: 'customername', name: '客先', field: 'customername',  width: 150,},
        { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
        { id: 'placename', name: '場所名', field: 'placename',  width: 90,},
        { id: 'transferdate', name: '在庫日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'placecd', name: '場所CD', field: 'placecd',  width: 80,},
      ];        
    } else if (elem.indexOf('CRRSVSHT') >= 0) { 
      // 引当有りクリンプ｛製品｝※「詳細」ボタンなし
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'psupple', name: '線径×目合', field: 'psupple', width: 100,},
        { id: 'sub08', name: '寸法', field: 'sub08', width: 80,},
        { id: 'parrangementname', name: '加工内容', field: 'parrangementname', width: 150,},
        { id: 'sumqty', name: '数量', field: 'sumqty',  editor: Slick.Editors.Integer, cssClass: 'right-align',  width: 80,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 120,},
        { id: 'remarks', name: '状態', field: 'remarks',  width: 140,},
        { id: 'customername', name: '客先', field: 'customername',  width: 150,},
        { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
        { id: 'placename', name: '場所名', field: 'placename',  width: 90,},
        { id: 'transferdate', name: '在庫日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'placecd', name: '場所CD', field: 'placecd',  width: 80,},
      ];        
    } else if (elem.indexOf('pgCR') >= 0) {
      // 引当無しクリンプ｛全ての切売・SUS304クリンプシート・SUS304平織シート・その他シート｝※「詳細」ボタンなし
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'psupple', name: '線径×目合', field: 'psupple',  width: 100,},
        { id: 'sub08', name: '寸法', field: 'sub08', width: 80,},
        { id: 'sumqty', name: '数量', field: 'sumqty',  editor: Slick.Editors.Integer, cssClass: 'right-align',  width: 80,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 80,},
        { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 120,},
        { id: 'remarks', name: '状態', field: 'remarks',  width: 140,},
        { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
        { id: 'placename', name: '場所名', field: 'placename',  width: 90,},
        { id: 'transferdate', name: '在庫日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'placecd', name: '場所CD', field: 'placecd',  width: 80,},
      ];        
    } else if (elem.indexOf('pgWV') >= 0) {
      // 織網
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'dimensions', name: '寸法', field: 'dimensions', width: 80,},
        { id: 'sumqty', name: '数量', field: 'sumqty',  editor: Slick.Editors.Integer, width: 80,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 80,},
        { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 120,},
        { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
        { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
        { id: 'transferdate', name: '入荷日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'placecd', name: '場所CD', field: 'placecd',  width: 60,},
      ];        
    } else if (elem.indexOf('pgWD') >= 0) {
      // welding
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'dimensions', name: '寸法', field: 'dimensions',  width: 80,},
        { id: 'sumqty', name: '数量', field: 'sumqty',  editor: Slick.Editors.Integer, cssClass: 'right-align', width: 60,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 80,},
        { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 120,},
        { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
        { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
        { id: 'transferdate', name: '在庫日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'placecd', name: '場所CD', field: 'placecd',  width: 60,},
      ];
    } else if (elem.indexOf('pgWRM') >= 0) {
      // 線材の材料価格表
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'material', name: '材質', field: 'material',  width: 100,},
        { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
        { id: 'diameter', name: '線径', field: 'diameter', width: 80,},
        { id: 'property', name: '仕様', field: 'property', width: 60,},
        { id: 'sumqty', name: '数量合計', field: 'sumqty', cssClass: 'right-align',  width: 80, /*groupTotalsFormatter: sumTotalsFormatter*/},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'estimatedprice', name: '見積単価', field: 'estimatedprice', editor: Slick.Editors.Integer, formatter: toJPYDec0Formatter, cssClass: 'right-align', width: 80,},
        { id: 'avgunitprice', name: '手持ち平均', field: 'avgunitprice', cssClass: 'right-align', width: 80,},
        { id: 'sumprice', name: '合計金額', field: 'sumprice', cssClass: 'right-align',  width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'makercd', name: 'メーカーCD', field: 'makercd',  width: 80,},
      ];
    } else if (elem.indexOf('pgWR') >= 0) {
      // wire
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'diameter', name: '線径', field: 'diameter',  width: 100,},
        { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
        { id: 'sumqty', name: '数量合計', field: 'sumqty', cssClass: 'right-align',  width: 80, /*groupTotalsFormatter: sumTotalsFormatter*/},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 80,},
        // { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
        // { id: 'placename', name: '場所名', field: 'placename',  width: 80,},
        { id: 'avgunitprice', name: '単価平均', field: 'avgunitprice', cssClass: 'right-align',  width: 80,},
        { id: 'sumprice', name: '合計金額', field: 'sumprice', cssClass: 'right-align',  width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'makercd', name: 'メーカーCD', field: 'makercd',  width: 80,},
        // { id: 'placecd', name: '場所CD', field: 'placecd',  width: 60,},
      ];        

    } else if (elem.indexOf('pgMTPLATE') >= 0) {
      // 金型プレートのみ寸法欄なし
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'sumqty', name: '数量', field: 'sumqty', width: 60,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        // { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
        // { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
        { id: 'transferdate', name: '購入日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'makercd', name: 'メーカーCD', field: 'makercd',  width: 80,},
        // { id: 'placecd', name: '場所CD', field: 'placecd',  width: 60,},
      ];   
    } else {
      // material その他
      pg.columns = [
        { id: 'productname', name: '品名', field: 'productname',  width: 150,},
        { id: 'dimensions', name: '寸法', field: 'dimensions', width: 150,},
        { id: 'sumqty', name: '数量', field: 'sumqty', width: 60,},
        { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
        { id: 'plannum', name: '使用予定数', field: 'plannum', /*editor: Slick.Editors.Text,*/ cssClass: 'right-align', width: 80,},
        // { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
        // { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
        { id: 'transferdate', name: '購入日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'updatedate', name: '更新日', field: 'updatedate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
        { id: 'productcd', name: '品名CD', field: 'productcd',  width: 80,},
        { id: 'makercd', name: 'メーカーCD', field: 'makercd',  width: 80,},
        // { id: 'placecd', name: '場所CD', field: 'placecd',  width: 60,},
      ];        
    }
  });
  // クリンプ詳細
  detailStockPGs.pgDTCRIMP.columns = [
    { id: 'psupple', name: '品名補足印字内容', field: 'psupple',  width: 120,},
    { id: 'sub08', name: 'サイズ横', field: 'sub08', width: 60,},
    { id: 'sub09M', name: 'M', field: 'sub09M', width: 60,},
    { id: 'qty', name: '数量', field: 'qty', cssClass: 'right-align', width: 60,},
    { id: 'lotno', name: 'LotNo', field: 'lotno', width: 60,},
    { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
    { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
    { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
  ];
  // 線材詳細
  detailStockPGs.pgDTWIRE.columns = [
    { id: 'diameter', name: '線径', field: 'diameter',  width: 120,},
    { id: 'qty', name: '数量', field: 'qty', cssClass: 'right-align',  width: 60,},
    { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
    { id: 'sub10', name: '仕入LotNo', field: 'sub10',  width: 80,},
    { id: 'sub11', name: '製鋼番号', field: 'sub11',  width: 80,},
    { id: 'sub07', name: 'コイル番号', field: 'sub07',  width: 80,},
    { id: 'unitprice', name: '単価', field: 'unitprice', formatter: toJPYDec0Formatter, cssClass: 'right-align', width: 80},
    { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 100,},
    { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
    { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
    { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
    { id: 'transferdate', name: '購入日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
  ];
  // 材料詳細
  detailStockPGs.pgDTMATERIAL.columns = [
    { id: 'productname', name: '品名', field: 'productname',  width: 150,},
    { id: 'sub10', name: '仕入LotNo', field: 'sub10',  width: 80,},
    { id: 'sub11', name: '製鋼番号', field: 'sub11',  width: 80,},
    { id: 'sub07', name: 'コイル番号', field: 'sub07',  width: 80,},
    { id: 'qty', name: '数量', field: 'qty', cssClass: 'right-align',  width: 60, },
    { id: 'unitname', name: '単位', field: 'unitname',  width: 40,},
    { id: 'unitprice', name: '単価', field: 'unitprice', formatter: toJPYDec0Formatter, cssClass: 'right-align',  width: 80,},
    { id: 'lotno', name: 'ロットNo', field: 'lotno',  width: 100,},
    { id: 'remarks', name: '状態', field: 'remarks',  width: 150,},
    { id: 'makername', name: 'メーカー', field: 'makername',  width: 150,},
    { id: 'placename', name: '場所名', field: 'placename',  width: 120,},
    { id: 'transferdate', name: '購入日', field: 'transferdate', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 80,},
  ];
  makeSortable();
  applyCSStoColumns();
}

// function defineSgColumns() {
//   editSGs.sgSubProcess.columns = [
//     { id: 'planno', name: '作業指示No', field: 'planno', width: 120,},
//     { id: 'processcd', name: '区分', field: 'processcd', width: 200,},
//     { id: 'contentno', name: '加工No', field: 'contentno', width: 150,},
//     { id: 'contentname', name: '加工名称', field: 'contentname', width: 200,},
//     { id: 'details', name: '加工内容説明', field: 'details', width: 300,},
//     { id: 'ppr_type_02', name: '人数', field: 'ppr_type_02', width: 80,},
//     { id: 'ppr_plan_interval', name: '作業時間', field: 'ppr_plan_interval', width: 100,},
//   ];
//   editSGs.sgStock.columns = [
//     { id: 'sp_place_cd', name: '場所', field: 'sp_place_cd',  width: 120,},
//     { id: 'sp_place_name', name: '場所名', field: 'sp_place_name',  width: 120,},
//     { id: 'sp_type_04', name: 'ロットNo', field: 'sp_type_04',  width: 120,},
//     { id: 'sp_report_date', name: '入荷日', field: 'sp_report_date',  width: 120,},
//     { id: 'stock_num', name: '在庫数', field: 'stock_num',  width: 120,},
//     { id: 'sp_unit', name: '単位', field: 'sp_unit',  width: 120,},
//     { id: 'ship_sub_no', name: '出荷枝番', field: 'ship_sub_no',  width: 120,},
//     { id: 'attract_num', name: '引当数', field: 'attract_num',  width: 120,},
//   ];
//   // sgSubProcess.sgSubProcess.column = [
//   //   { id: 'planno', name: '作業指示No', field: 'planno', width: 120,},
//   //   { id: 'processcd', name: '区分', field: 'processcd', width: 200,},
//   //   { id: 'contentno', name: '加工No', field: 'contentno', width: 150,},
//   //   { id: 'contentname', name: '加工名称', field: 'contentname', width: 200,},
//   //   { id: 'details', name: '加工内容説明', field: 'details', width: 300,},
//   //   { id: 'ppr_type_02', name: '人数', field: 'ppr_type_02', width: 80,},
//   //   { id: 'ppr_plan_interval', name: '作業時間', field: 'ppr_plan_interval', width: 100,},
//   // ];
// }

/**
 * 全列についてヘッダクリックによるソート機能を有効化する
 */
function makeSortable() {
  Object.keys(mainPGs).forEach(function (elem) {
    mainPGs[elem].columns.forEach(function (c) {
      c['sortable'] = true;
    });
  });
  Object.keys(masterPGs).forEach(function (elem) {
    masterPGs[elem].columns.forEach(function (c) {
      c['sortable'] = true;
    });
  });
  Object.keys(stockPGs).forEach((elem) => {
    stockPGs[elem].columns.forEach((c) => {
      c['sortable'] = true;
    });
  });
  Object.keys(calcPGs).forEach((elem) => {
    calcPGs[elem].columns.forEach((c) => {
      c['sortable'] = true;
    });
  })
}

/**
 * 全列についてCSSを適用する
 */
function applyCSStoColumns() {
  Object.keys(mainPGs).forEach(function (elem) {
    mainPGs[elem].columns.forEach(function (c) {
      if (c['validator']) {
        if (c['validator'] === requiredFieldValidator ||
          c['validator'] === textNNValidator ||
          c['validator'] === integerNNValidator ||
          c['validator'] === decimal2NNValidator ||
          c['validator'] === decimal4NNValidator ||
          c['validator'] === masterNNValidator ||
          c['isRequired'] === true) {
          c['headerCssClass'] = 'requiredcol';
        }
      }
      if (c['isHeaderPK'] || c['isDetailPK'] || c['isPK']) {
        c['cssClass'] = 'cell-title';
      }
      var isEditable = false;
      if (c['editor']) {
        if (c['editor'] !== DisabledTextEditor) {
          isEditable = true;
        }
      }
      if (!isEditable) {
        c['headerCssClass'] = c['headerCssClass'] ? c['headerCssClass'] + ' disabledcol' : 'disabledcol';
      }
    });
  });
  Object.keys(masterPGs).forEach(function (elem) {
    masterPGs[elem].columns.forEach(function (c) {
      if (c['isHeaderPK'] || c['isDetailPK'] || c['isPK']) {
        c['cssClass'] = 'cell-title';
      }
      var isEditable = false;
      if (c['editor']) {
        if (c['editor'] !== DisabledTextEditor) {
          isEditable = true;
        }
      }
      if (!isEditable) {
        c['headerCssClass'] = c['headerCssClass'] ? c['headerCssClass'] + ' disabledcol' : 'disabledcol';
      }
    });
  });
}

/**
 * メイングリッドへの書込を禁止する
 */
function disableEditorOptions() {
  // 2023/1/27　マージした際に必要か迷ったため追加するが、不要であれば削除する
  // mainPGs.pgBD.columns.forEach((c) => {
  //   if (c['field'] !== 'isSelected' && c['field'] !== 'bd_bill_no') {
  //     delete c['editor'];
  //   }
  // });
  Object.keys(mainPGs).forEach(function (elem) {
    mainPGs[elem].columns.forEach(function (c) {
      if (c['field'] !== 'isSelected' && elem !== 'pgED' && elem !== 'pgProdplans' && elem !== 'pgSTPlan' && elem !== 'pgST' && elem !== 'pgMOD') {
        delete c['editor'];
      }
    });
  });
}

/***
 * 一覧項目の再設定
 * 本来なら、definePGColumnsで項目は設定したものを表示しているが、一覧にて余計な項目が存在するため、再設定してやる。
 * キー項目を削除すると編集画面にデータが表示できなくなるため注意
 */
function resetList() {
  mainPGs.pgProdplans.columns = [];
  mainPGs.pgProdplans.columns = [
    { id: 'pd_e_estimate_no', name: '受注No', field: 'pd_e_estimate_no', editor: DisabledTextEditor, width: 100 },
    { id: 'pd_e_estimate_date', name: '受注日', field: 'pd_e_estimate_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); },width: 80 },
    { id: 'pd_e_customer_name', name: '得意先名', field: 'pd_e_customer_name', width: 200 },
    { id: 'pd_p_name', name: '製品名称', field: 'pd_p_name', width: 220, width: 160, },
    { id: 'pd_disp_order', name: '指示G', field: 'pd_disp_order', maxlength: 1, width: 70, },
    { id: 'pd_e_estimate_sub_no', name: '受枝', field: 'pd_e_estimate_sub_no', width: 70, },
    { id: 'pd_p_name_supple_01', name: '線径×目合', field: 'pd_p_name_supple_01', isHeader: true, width: 120, },
    { id: 'pd_p_name_supple_02', name: '寸法', field: 'pd_p_name_supple_02', isHeader: true, width: 120, },
    { id: 'pd_ed_quantity', name: '製造数量', field: 'pd_ed_quantity', cssClass: 'right-align', width: 80,  },
    { id: 'pd_unit', name: '単位', field: 'pd_unit',  width: 80, },
    { id: 'pd_fin_plan_date_d', name: '製造完了予定日', field: 'pd_fin_plan_date_d', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); },width: 100, },
    { id: 'pd_e_shipplan_date', name: '出荷予定日', field: 'pd_e_shipplan_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); },width: 80, },
    { id: 'pd_prod_plan_no', name: '製造指図No', field: 'pd_prod_plan_no', editor: DisabledTextEditor, isHeaderPK: true, width: 100, },
    { id: 'pd_prod_plan_sub_no', name: '製枝', field: 'pd_prod_plan_sub_no',  width: 70, isPK: true, },
    { id: 'pd_leaf_create_flg', name: 'リーフ発行区分', field: 'pd_leaf_create_flg', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 100, },
    { id: 'pd_ed_remarks', name: '備考(受注備考修正)', field: 'pd_ed_remarks', maxlength: 300, width: 150, },

    { id: 'pd_p_cd', name: '品名CD', field: 'pd_p_cd', /*ref: 'product', validator: masterNNValidator, editor: IdEditor, */ },
  ];

  mainPGs.pgProdplans.columns.unshift(mainPGs.pgProdplans.checkboxSelector.getColumnDefinition(),);


  mainPGs.pgED.columns = [];
  mainPGs.pgED.columns = [
    { id: 'e_estimate_no', name: '受注No', field: 'e_estimate_no', editor: DisabledTextEditor, width: 130, isHeaderPK: true, },
    { id: 'e_estimate_date', name: '受注日', field: 'e_estimate_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 110, },
    { id: 'e_customer_name', name: '得意先名', field: 'e_customer_name', editor: DisabledTextEditor, isHeader: true, width: 200, },
    { id: 'ed_p_name', name: '製品名称', field: 'ed_p_name', width: 100, editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'ed_p_name', 'p_name', 'product', dC['ed_p_cd']); }, validator: textValidator, width: 200, },
    { id: 'ed_estimate_sub_no', name: '枝番', field: 'ed_estimate_sub_no', editor: DisabledTextEditor, isHeader: true, width: 50, },
    { id: 'sd_p_name_supple_01', name: '線径×目合', field: 'sd_p_name_supple_01', editor: DisabledTextEditor, isHeader: true, width: 100, },
    { id: 'sd_p_name_supple_02', name: '寸法', field: 'sd_p_name_supple_02', editor: DisabledTextEditor, isHeader: true, width: 100, },
    { id: 'ed_quantity', name: '受注数', field: 'ed_quantity', editor: DisabledTextEditor, formatter: decimal3Formatter, cssClass: 'right-align', numberfilter: true, width: 80, },
    { id: 'ed_unit_tran', name: '単位', field: 'ed_unit_tran', editor: DisabledTextEditor, maxlength: 10, width: 50, },
    { id: 'ed_ar_cd', name: '製品手配方法', field: 'ed_ar_cd', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '1', val: '金網製造' }, { key: '2', val: '定尺切断' }, { key: '3', val: '在庫品' }, { key: '4', val: '購入' }, { key: '5', val: '支給' },], width: 120, },
    { id: 'ed_desired_delivery_date', name: '出荷予定日', field: 'ed_desired_delivery_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, maxlength: 100, width: 110, },
    { id: 'e_estimate_sign', name: '受注', field: 'e_estimate_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 60, },
    { id: 'ed_type_moed', name: '発注', field: 'ed_type_moed', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '発注済' }, { key: '2', val: '入庫済' }, { key: '-', val: '-' },], width: 60, },
    { id: 'ed_prod_plan_sign', name: '製造', field: 'ed_prod_plan_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '指示' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'ed_ship_status_sign', name: '出荷', field: 'ed_ship_status_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '', val: '未' }, { key: '0', val: '指示' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 60, },
    // 納品ステータスについては、納品書発行時にデータを更新し、納品確定にて、データを再度更新にかけるため部分を非表示にする。
    { id: 'ed_delivery_sign', name: '納品', field: 'ed_delivery_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '未' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'ed_bill_sign', name: '請求', field: 'ed_bill_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'ed_payment_sign', name: '入金', field: 'ed_payment_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'e_tc_short_name', name: '運送会社', field: 'e_tc_short_name', editor: DisabledTextEditor, width: 80, },
    { id: 'e_shipper_name', name: '出荷主名称', field: 'e_shipper_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_shipper_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_shipper_cd']); }, isHeader: true, width: 100, },
    { id: 'e_delivery_name', name: '納入先名称', field: 'e_delivery_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_delivery_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_delivery_cd']); }, isHeader: true, width: 100, },
    // { id: 'ed_delivery_name', name: '納入先名称', field: 'ed_delivery_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'ed_delivery_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['ed_delivery_cd']); }, isHeader: true, width: 100, },
    { id: 'e_stay_name', name: '止め先名称', field: 'e_stay_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_stay_name', 'CP_POST_NAME', 'customerpost', dC['e_customer_cd'] + '-' + dC['e_stay_cd']); }, isHeader: true, width: 100, },
    { id: 'e_customer_cd', name: '客先CD', field: 'e_customer_cd', editor: DisabledTextEditor, ref: 'customer', isHeader: true, width: 50, },
    { id: 'ed_p_cd', name: '品名CD', field: 'ed_p_cd', width: 100, editor: DisabledTextEditor, validator: textValidator, maxlength: 30, width: 70, },
    { id: 'e_shipper_cd', name: '出荷主', field: 'e_shipper_cd', editor: DisabledTextEditor, ref: 'customerpost', isHeader: true, width: 80, },
    { id: 'ed_delivery_cd', name: '納入先CD', field: 'ed_delivery_cd', editor: DisabledTextEditor, ref: 'customerpost', isHeader: true, width: 80, },
    { id: 'e_stay_cd', name: '止め先', field: 'e_stay_cd', editor: DisabledTextEditor, ref: 'customerpost', isHeader: true, width: 80, },
    { id: 'e_salesman_cd', name: '受注者CD', field: 'e_salesman_cd', editor: DisabledTextEditor, ref: 'user', validator: masterNNValidator, isHeader: true, width: 80, },
    { id: 'e_salesman_name', name: '受注者名', field: 'e_salesman_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'e_salesman_name', 'USER_NAME', 'user', dC['e_salesman_cd']); }, isHeader: true, width: 80, },
    { id: 'ed_sub_num_03', name: '線番', field: 'ed_sub_num_03', editor: DisabledTextEditor, cssClass: 'right-align', numberfilter:true, width: 70, },
    { id: 'ed_unit_price', name: '単価', field: 'ed_unit_price', editor: DisabledTextEditor, formatter: toJPYDec0Formatter, numberfilter: true, cssClass: 'right-align', width: 80,},
    { id: 'ed_price', name: '金額', field: 'ed_price', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return toJPYFormatter(r, c, calcFormatter(dC, 'ed_price', dC['ed_quantity'] * dC['ed_unit_price'])['text'], cD, dC); }, cssClass: 'right-align', footerfunc: sumJPYFooter, numberfilter: true, width: 80, },
    { id: 'ed_cost', name: '原価', field: 'ed_cost', editor: DisabledTextEditor, /*editor: Slick.Editors.Integer,*/ formatter: toJPYDec0Formatter, cssClass: 'right-align', numberfilter: true, width: 80, },
    { id: 'e_logo_01', name: '現品票ロゴ', field: 'e_logo_01', editor: DisabledTextEditor, validator: textValidator, maxlength: 60, isHeader: true, width: 80, }, 
  ];
  // チェックボックス付加
  mainPGs.pgED.columns.unshift(mainPGs.pgED.checkboxSelector.getColumnDefinition(),);

  // 発注書一覧
  mainPGs.pgMOD.columns = [];
  mainPGs.pgMOD.columns = [ // 発注一覧
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, isHeaderPK: true, width: 100, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no',  editor: DisabledTextEditor, width: 100, },
    { id: 'moed_customer_name', name: '仕入先名', field: 'moed_customer_name', width: 150, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', editor: DisabledTextEditor, /*formatter: function (r, c, v, cD, dC) { return moedProductNameFormatter2(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, maxlength: 50,*/ width: 250, },
    { id: 'moed_sub_no', name: '発枝', field: 'moed_sub_no', isDetailPK: true, width: 80, },
    { id: 'moed_p_name_supple_01', name: '線径×目合', field: 'moed_p_name_supple_01', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_p_name_supple_02', name: '寸法 メーカLot 製鋼番号', field: 'moed_p_name_supple_02', editor: DisabledTextEditor, width: 150 },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', width: 120, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', width: 120, },
    { id: 'moed_quantity', name: '発注数', field: 'moed_quantity', formatter: decimal3Formatter,  cssClass: 'right-align', width: 70, },
    { id: 'moed_unit_tran', name: '単位', field: 'moed_unit_tran', width: 50, },
    { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isHeader: true, width: 100, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 100, },
    { id: 'moed_type_03', name: 'ロットNo', field: 'moed_type_03', editor: DisabledTextEditor, maxlength: 15, width: 120, },
    { id: 'moed_order_sign', name: '発注', field: 'moed_order_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 60, },
    { id: 'moed_ship_status_sign', name: '出荷', field: 'moed_ship_status_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '', val: '未' }, { key: '0', val: '指示' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 60, },
    { id: 'moed_receive_sign', name: '受入', field: 'moed_receive_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 60,  },
    { id: 'moed_inventory_type', name: '在庫管理', field: 'moed_inventory_type', formatter: SelectCellMorderestimateInventoryType, options: [{ key: '1', val: '対象' }, { key: '2', val: '対象外' },], isDetail: true, width: 60, },
    { id: 'moed_accept_sign', name: '検収', field: 'moed_accept_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 60,  },
    { id: 'moed_payment_no', name: '支払No', field: 'moed_payment_no', width: 80, },
    { id: 'moed_customer_cd', name: '仕入先CD', field: 'moed_customer_cd', maxlength: 3, width: 80, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', maxlength: 30, width: 100, },
    { id: 'moed_salesman_cd', name: '発注者', field: 'moed_salesman_cd', width: 80, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', width: 100, },
    // 2023/5/23　金額の小数点以下は全て切り捨て　※単価数量＋単価単位をカラム追加
    { id: 'moed_unit_qty', name: '単価数量', field: 'moed_unit_qty', formatter: decimal3Formatter, cssClass: 'right-align', width: 80, },
    { id: 'moed_unit_eval', name: '単価単位', field: 'moed_unit_eval', width: 60, },
    { id: 'moed_unit_price', name: '単価', field: 'moed_unit_price', formatter: toDecimal3JPYFormatter, width: 100, cssClass: 'right-align' },
    { id: 'moed_money', name: '金額', field: 'moed_money', cssClass: 'right-align', formatter: toJPYDec0Formatter, width: 100, },
    // 2023/4/12　正しくない値が入っている為、コメントアウト
    // { id: 'moed_money_tax', name: '消費税額', field: 'moed_money_tax', formatter: toJPYDec0Formatter, cssClass: 'right-align', width: 100, },
    // { id: 'moed_money_inc_tax', name: '税込金額', field: 'moed_money_inc_tax', formatter: toJPYDec0Formatter, coltype: 'decimal', cssClass: 'right-align', width: 100, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', width: 300, },
    { id: 'moed_shipper_cd', name: '出荷主CD', field: 'moed_shipper_cd', ref: 'customership', maxlength: 3, width: 80, },
    { id: 'moed_shipper_name', name: '出荷主名', field: 'moed_shipper_name', formatter: function (r, c, v, cD, dC) { return moedMasterFormatter(dC, 'moed_shipper_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_shipper_cd']); }, width: 150, },
    { id: 'moed_delivery_cd', name: '納品先CD', field: 'moed_delivery_cd', ref: 'customership', maxlength: 3, width: 80, },
    { id: 'moed_delivery_name', name: '納品先名', field: 'moed_delivery_name', formatter: function (r, c, v, cD, dC) { return moedMasterFormatter(dC, 'moed_delivery_name', 'CP_POST_NAME', 'customerpost', dC['moed_customer_cd'] + '-' + dC['moed_delivery_cd']); }, width: 150, },
    { id: 'moed_update_at', name: '更新日', field: 'moed_update_at', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'moed_update_name', name: '更新者', field: 'moed_update_name', width: 80, },
  ];
  // チェックボックス付加
  mainPGs.pgMOD.columns.unshift(mainPGs.pgMOD.checkboxSelector.getColumnDefinition(),);


  // 製造委託一覧
  mainPGs.pgOOD.columns = [];
  mainPGs.pgOOD.columns = [ // 製造委託
    { id: 'moed_order_no', name: '委託No', field: 'moed_order_no', isHeaderPK: true, width: 100, },
    { id: 'moed_refer_no', name: '受注No', field: 'moed_refer_no', editor: Slick.Editors.Text, width: 100, },
    { id: 'moed_customer_name', name: '委託先名', field: 'moed_customer_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['moed_customer_cd']); }, isHeader: true, width: 150, },
    { id: 'moed_product_name', name: '品名', field: 'moed_product_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'moed_product_name', 'p_name', 'product', dC['moed_product_cd']); }, width: 250, },    
    { id: 'moed_sub_no', name: '委枝', field: 'moed_sub_no', editor: Slick.Editors.Text, isDetailPK: true, width: 40, },
    { id: 'moed_accept_sub_no', name: '検枝', field: 'moed_accept_sub_no', editor: Slick.Editors.Text, isDetailPK: true, width: 40, },
    { id: 'moed_p_name_supple_01', name: '線径×目合', field: 'moed_p_name_supple_01', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_p_name_supple_02', name: '寸法', field: 'moed_p_name_supple_02', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_sub_08', name: 'サイズ①', field: 'moed_sub_08', editor: Slick.Editors.Text, width: 100, },
    { id: 'moed_sub_09', name: 'サイズ②', field: 'moed_sub_09', editor: Slick.Editors.Text, width: 100, },
    { id: 'moed_quantity', name: '依頼数', field: 'moed_quantity', editor: Slick.Editors.Text, cssClass: 'right-align', width: 80, },
    { id: 'moed_unit_tran', name: '取引単位', field: 'moed_unit_tran', editor: Slick.Editors.Text, width: 80, },
    { id: 'moed_order_date', name: '委託日', field: 'moed_order_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'moed_arrival_plan_date', name: '入荷予定日', field: 'moed_arrival_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'moed_payment_plan_date', name: '支払予定日', field: 'moed_payment_plan_date', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'moed_order_sign', name: '発注', field: 'moed_order_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '済' },], width: 70, },
    { id: 'moed_receive_sign', name: '受入', field: 'moed_receive_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], width: 70, },
    { id: 'moed_accept_sign', name: '検収', field: 'moed_accept_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '完了' },], isHeader: true, width: 70, },
    { id: 'moed_payment_no', name: '支払No', field: 'moed_payment_no', editor: Slick.Editors.Text, isHeader: true, width: 100, },
    { id: 'moed_customer_cd', name: '委託先CD', field: 'moed_customer_cd', ref: 'customer', validator: masterValidator, isHeader: true, width: 80, },
    { id: 'moed_product_cd', name: '品名CD', field: 'moed_product_cd', ref: 'product', validator: masterValidator, editor: Slick.Editors.Text, isDetail: true, width: 100, },
    { id: 'moed_salesman_cd', name: '発注者', field: 'moed_salesman_cd', editor: Slick.Editors.Text, isHeader: true, width: 80, },
    { id: 'moed_salesman_name', name: '発注者名', field: 'moed_salesman_name', editor: Slick.Editors.Text, isHeader: true, width: 100, },
    { id: 'moed_unit_price', name: '委託単価', field: 'moed_unit_price', editor: Slick.Editors.Text, width: 100, },
    { id: 'moed_money', name: '金額', field: 'moed_money', editor: Slick.Editors.Text, cssClass: 'right-align', width: 100, },
    { id: 'moed_money_tax', name: '消費税', field: 'moed_money_tax', editor: Slick.Editors.Text, cssClass: 'right-align', width: 100, },
    { id: 'moed_money_inc_tax', name: '税込金額', field: 'moed_money_inc_tax', editor: Slick.Editors.Text, cssClass: 'right-align', width: 100, },
    { id: 'moed_remarks', name: '備考', field: 'moed_remarks', editor: Slick.Editors.Text, width: 120, },
    { id: 'moed_update_at', name: '更新日', field: 'moed_update_at', editor: Slick.Editors.Date, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'moed_update_name', name: '更新者', field: 'moed_update_name', editor: Slick.Editors.Text, width: 80, }, 
  ];
  // チェックボックス付加
  mainPGs.pgOOD.columns.unshift(mainPGs.pgOOD.checkboxSelector.getColumnDefinition(),);

  // 出荷一覧
  mainPGs.pgSD.columns = [];
  mainPGs.pgSD.columns = [
    { id: 's_estimate_no', name: '受注No', field: 's_estimate_no',  editor: DisabledTextEditor, isHeaderPK: true, width: 90, },
    { id: 's_estimate_date', name: '受注日', field: 's_estimate_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isHeader: true, width: 90, },
    { id: 'sd_statement_sub_no', name: '納品枝番', field: 'sd_statement_sub_no', isHeaderPK: true, width: 70, },
    { id: 'sd_estimate_sub_no', name: '受注枝番', field: 'sd_estimate_sub_no', isPK: true, width: 70, },
    { id: 'sd_shipment_sub_no', name: '出荷枝番', field: 'sd_shipment_sub_no', isPK: true, width: 70, },
    { id: 's_customer_name', name: '得意先名', field: 's_customer_name', isHeader: true, width: 200, },
    { id: 'sd_p_name', name: '品名', field: 'sd_p_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'sd_p_name', 'p_name', 'product', dC['sd_p_cd']); }, width: 200, },
    { id: 'sd_p_name_supple', name: '品名補足印字内容', field: 'sd_p_name_supple', editor: DisabledTextEditor, width: 200, },
    { id: 'sd_estimate_quantity', name: '受注数', field: 'sd_estimate_quantity', formatter: decimal3Formatter, cssClass: 'right-align', width: 70, },
    { id: 'sd_unit_tran', name: '単位', field: 'sd_unit_tran', width: 60, },
    { id: 's_shipping_plan_date', name: '出荷予定日', field: 's_shipping_plan_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isHeader: true, width: 130, },
    { id: 's_shipping_date', name: '出荷日', field: 's_shipping_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, isHeader: true, width: 130, },
    { id: 's_bill_close_date', name: '請求締日', field: 's_bill_close_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 's_payment_plan_date', name: '入金予定日', field: 's_payment_plan_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    // 在庫の意図が、現状在庫が存在するレコードの意図で作成したようだが、該当データないため、在庫引き当て処理終了後に再表示させることにする
    // { id: 'ed_stock_sign', name: '在庫', field: 'ed_stock_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '指示' }, { key: '2', val: '完了' },], width: 50, },
    { id: 'ed_ship_status_sign', name: '出荷', field: 'ed_ship_status_sign', formatter: SelectCellFormatterValue, options: [{ key: '', val: '未' }, { key: '0', val: '指示' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 50, },
    // 納品ステータスについては、納品書発行時にデータ更新してしまうため、部分納品ステータスについては、「未」表示とする。
    { id: 'ed_delivery_sign', name: '納品', field: 'ed_delivery_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '未' }, { key: '2', val: '完了' },], width: 50, },
    { id: 'ed_bill_sign', name: '請求', field: 'ed_bill_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 50, },
    { id: 'ed_payment_sign', name: '入金', field: 'ed_payment_sign', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '完了' },], width: 50, },
    { id: 's_tc_short_name', name: '運送会社', field: 's_tc_short_name', width: 140, },
    { id: 's_shipper_name', name: '出荷主名称', field: 's_shipper_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_shipper_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_shipper_cd']); }, isHeader: true, width: 150, },
    { id: 's_delivery_name', name: '納入先名称', field: 's_delivery_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_delivery_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_delivery_cd']); }, isHeader: true, width: 150, },
    { id: 's_stay_name', name: '止め先名称', field: 's_stay_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_stay_name', 'CP_POST_NAME', 'customerpost', dC['s_customer_cd'] + '-' + dC['s_stay_cd']); }, isHeader: true, width: 100, },
    { id: 'sd_p_cd', name: '品名CD', field: 'sd_p_cd', width: 80, },
    { id: 's_customer_cd', name: '客先CD', field: 's_customer_cd', editor: DisabledTextEditor, width: 60, isHeader: true, },
    { id: 's_shipper_cd', name: '出荷主', field: 's_shipper_cd', /*editor: IdEditor, ref: 'customerpost',*/ isHeader: true, width: 60, },
    { id: 's_delivery_cd', name: '納入先CD', field: 's_delivery_cd', /*editor: IdEditor, ref: 'customerpost',*/ isHeader: true, width: 60, },
    { id: 's_stay_cd', name: '止め先', field: 's_stay_cd', /*editor: IdEditor, ref: 'customerpost',*/ isHeader: true, width: 60, },
    { id: 's_salesman_cd', name: '受注者CD', field: 's_salesman_cd', /*editor: IdEditor, ref: 'user', validator: masterNNValidator,*/ isHeader: true, width: 80, },
    { id: 's_salesman_name', name: '受注者名', field: 's_salesman_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 's_salesman_name', 'USER_NAME', 'user', dC['s_salesman_cd']); }, isHeader: true, width: 80, },
    { id: 'sd_lotNo', name: 'ロットNo', field: 'sd_lotNo', width: 100, },
    { id: 'sd_allocate_num', name: '引当数', field: 'sd_allocate_num', width: 70, },
    { id: 'sd_unit_price', name: '単価', field: 'sd_unit_price', formatter: toJPYFormatter, cssClass: 'right-align', width: 70, },
    { id: 'sd_price', name: '金額', field: 'sd_price', formatter: toJPYFormatter, cssClass: 'right-align', width: 70, },
    { id: 's_logo', name: '現品票ロゴ', field: 's_logo', isHeader: true, width: 100, },
  ];
  // チェックボックス付加
  mainPGs.pgSD.columns.unshift(mainPGs.pgSD.checkboxSelector.getColumnDefinition(),);

  // 請求一覧
  mainPGs.pgBD.columns = [];
  mainPGs.pgBD.columns = [
    { id: 'bd_bill_no', name: '請求No', field: 'bd_bill_no', editor: DisabledTextEditor, isHeaderPK: true, width: 80, },
    { id: 'bd_estimate_no', name: '受注No', field: 'bd_estimate_no', editor: DisabledTextEditor, width: 90, },
    { id: 'bd_order_date', name: '受注日', field: 'bd_order_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, width: 90, },
    { id: 'bd_st_details_no', name: '納品No', field: 'bd_st_details_no', editor: DisabledTextEditor, width: 70, },
    { id: 'bd_ed_details_no', name: '受注枝番', field: 'bd_ed_details_no', editor: DisabledTextEditor, width: 70, },
    { id: 'bd_shipment_div', name: '出荷枝番', field: 'bd_shipment_div', editor: DisabledTextEditor, width: 70, },
    { id: 'b_customer_cd', name: '客先CD', field: 'b_customer_cd', editor: DisabledTextEditor, width: 60, isHeaderPK: true, },
    { id: 'b_customer_name', name: '得意先名', field: 'b_customer_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'b_customer_name', 'C_CUSTOMER_NAME', 'customer', dC['b_customer_cd']); }, isHeader: true, width: 180, },
    { id: 'sd_p_cd', name: '品名CD', field: 'sd_p_cd', editor: DisabledTextEditor, width: 80, },
    { id: 'bd_product_name', name: '製品名称', field: 'bd_product_name', editor: DisabledTextEditor, width: 200, },
    { id: 'bd_prod_summary', name: '品名補足印字内容', field: 'bd_prod_summary', editor: DisabledTextEditor, width: 200, },
    { id: 'bd_ed_quantity', name: '受注数', field: 'bd_ed_quantity', editor: DisabledTextEditor, formatter: decimal3Formatter, cssClass: 'right-align', width: 70, },
    { id: 'bd_unit_tran', name: '単位', field: 'bd_unit_tran', editor: DisabledTextEditor, width: 60, },
    { id: 'bd_unit_price', name: '単価', field: 'bd_unit_price', editor: DisabledTextEditor, formatter: toJPYDec0Formatter, cssClass: 'right-align', width: 70, },
    { id: 'bd_price', name: '金額', field: 'bd_price', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return toJPYFormatter(r, c, calcFormatter(dC, 'bd_price', dC['bd_ed_quantity'] * dC['bd_unit_price'])['text'], cD, dC); }, footerfunc: sumJPYFooter, cssClass: 'right-align', width: 70, },
    { id: 'b_sales_price', name: '合計金額',  field: 'b_sales_price', editor: DisabledTextEditor, formatter: toJPYDec0Formatter, cssClass: 'right-align',isHeader: true, width: 70, },
    { id: 'b_tax', name: '消費税額', field: 'b_tax', editor: DisabledTextEditor, formatter: toJPYDec0Formatter, cssClass: 'right-align', isHeader: true, width: 70, },
    { id: 'bd_desired_delivery_date', name: '出荷予定日', field: 'bd_desired_delivery_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_shipment_date', name: '出荷日', field: 'bd_shipment_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_payment_close_date', name: '入金予定日', field: 'bd_payment_close_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_payment_date', name: '入金日', field: 'bd_payment_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, validator: dateValidator, isHeader: true, width: 90, },
    { id: 'bd_cus_payment_cll', name: '集金有無', field: 'bd_cus_payment_cll', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' }, ], isHeader: true, width: 60, },
    { id: 'bd_payment_div', name: '入金分割', field: 'bd_payment_div', editor: DisabledTextEditor, width: 60, },
    { id: 'bd_payment_sign', name: '入金区分', field: 'bd_payment_sign', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: [{ key: '0', val: '未' }, { key: '1', val: '部分' }, { key: '2', val: '済' },], width: 60, },
    { id: 's_shipper_cd', name: '出荷主CD', field: 's_shipper_cd', editor: DisabledTextEditor, width: 60, },
    { id: 's_shipper_name', name: '出荷主', field: 's_shipper_name', editor: DisabledTextEditor, width: 120, },
    { id: 's_delivery_cd', name: '納入先CD', field: 's_delivery_cd', editor: DisabledTextEditor, width: 60, },
    { id: 's_delivery_name', name: '納入先名称', field: 's_delivery_name', editor: DisabledTextEditor, width: 120, },
    { id: 's_stay_cd', name: '止め先CD', field: 's_stay_cd', editor: DisabledTextEditor, width: 60, },
    { id: 's_stay_name', name: '止め先名', field: 's_stay_name', editor: DisabledTextEditor, width: 120, },
    { id: 'bd_salesman_cd', name: '受注者CD', field: 'bd_salesman_cd', editor: DisabledTextEditor, width: 60, },
    { id: 'bd_salesman_name', name: '受注者名', field: 'bd_salesman_name', editor: DisabledTextEditor, width: 100, },
    { id: 'bd_detail_remarks', name: '備考', field: 'bd_detail_remarks', editor: DisabledTextEditor, width: 120, },
  ];
  // チェックボックス付加
  mainPGs.pgBD.columns.unshift(mainPGs.pgBD.checkboxSelector.getColumnDefinition(),);

  mainPGs.pgSTPlan.columns = [];
  mainPGs.pgSTPlan.columns = [
    { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', formatter: SelectCellFormatterValue, options: dropdownMaster.viewplanpayment, width: 70, },
    { id: 'ed_estimate_no', name: '受注No', field: 'ed_estimate_no',  editor: DisabledTextEditor, width: 90, },
    { id: 'stc_report_no', name: '伝票No', field: 'stc_report_no', editor: DisabledTextEditor, isHeaderPK: true, width: 90, },
    { id: 'stc_report_date', name: '伝票日付', field: 'stc_report_date', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'stc_target_name', name: '相手名', field: 'stc_target_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_target_name', 'C_CUSTOMER_NAME', 'customer', dC['stc_target_id']); },  width: 280, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', editor: DisabledTextEditor, formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_product_name', 'p_name', 'product', dC['productcd']); }, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', editor: DisabledTextEditor, width: 200, },
    { id: 'stc_sub_no_01', name: '枝番①', field: 'stc_sub_no_01', width: 60, },
    { id: 'stc_sub_no_02', name: '枝番②', field: 'stc_sub_no_02',  width: 60, },
    { id: 'stc_qty_trans', name: '取引数量', field: 'stc_qty_trans', editor: DisabledTextEditor, cssClass: 'right-align', width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', editor: DisabledTextEditor, formatter: SelectCellFormatterValue, options: dropdownMaster.unit, width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: DisabledTextEditor, width: 100, },
    { id: 'stc_update_cnt', name: '更新回数', field: 'stc_update_cnt', width: 50, },
    { id: 'stc_cost_eva_qty', name: '評価数量', field: 'stc_cost_eva_qty', cssClass: 'right-align', width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', width: 40, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: DisabledTextEditor, width: 120, },
    { id: 'stc_inventory_type', name: '棚卸区分', field: 'stc_inventory_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_recv_type', name: '売掛区分', field: 'stc_recv_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_pay_type', name: '買掛区分', field: 'stc_pay_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_expence_type', name: '経費区分', field: 'stc_expence_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' }, { key: '', val: '-' }], width: 50, },
    { id: 'stc_cost_type', name: '原価区分', field: 'stc_cost_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, width: 60, },
    { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', width: 60, },
    { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', formatter: function (r, c, v, cD, dC) { return masterFormatter(dC, 'stc_update_name', 'USER_NAME', 'user', dC['stc_update_cd']); }, width: 70, },
    { id: 'stc_price_trans', name: '取引金額', field: 'stc_price_trans', cssClass: 'right-align', width: 100, },
    { id: 'stc_unit_price', name: '原価', field: 'stc_unit_price', cssClass: 'right-align', width: 70, },
    { id: 'stc_target_id', name: '相手CD', field: 'stc_target_id', editor: DisabledTextEditor, ref: 'customer', width: 80, },
    { id: 'productcd', name: '品名CD', field: 'productcd', width: 100, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', editor: DisabledTextEditor, formatter: selectCellWarehouseFormatter, width: 120, },
    { id: 'stc_customer_post_cd', name: '担当者ID', field: 'stc_customer_post_cd', editor: DisabledTextEditor, ref: 'customerpost', isHeader: true, width: 60, },
  ];
  // チェックボックス付加
  mainPGs.pgSTPlan.columns.unshift(mainPGs.pgSTPlan.checkboxSelector.getColumnDefinition(),);


  mainPGs.pgST.columns = [];
  mainPGs.pgST.columns = [
    { id: 'stc_arrange_type', name: '種別', field: 'stc_arrange_type', formatter: SelectCellFormatterValue, options: dropdownMaster.viewpayment, width: 90, },
    { id: 'ed_estimate_no', name: '受注No', field: 'ed_estimate_no',  editor: DisabledTextEditor, width: 90, },
    { id: 'stc_report_no', name: '伝票No', field: 'stc_report_no', editor: DisabledTextEditor, isHeaderPK: true, width: 90, },
    { id: 'stc_report_date', name: '伝票日付', field: 'stc_report_date', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'stc_target_name', name: '相手名', field: 'stc_target_name', width: 280, },
    { id: 'stc_product_name', name: '品名', field: 'stc_product_name', editor: DisabledTextEditor, width: 200, },
    { id: 'stc_product_supple', name: '品名補足印字内容', field: 'stc_product_supple', editor: DisabledTextEditor, width: 200, },
    { id: 'stc_sub_no_01', name: '枝番①', field: 'stc_sub_no_01', width: 40, },
    { id: 'stc_sub_no_02', name: '枝番②', field: 'stc_sub_no_02', width: 40, },
    { id: 'stc_place_name', name: '保管場所', field: 'stc_place_name', width: 80, },
    { id: 'stc_qty_trans', name: '取引数量', field: 'stc_qty_trans', editor: DisabledTextEditor, cssClass: 'right-align', width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', width: 60, },
    { id: 'stc_type_04', name: '自社LotNo', field: 'stc_type_04', editor: DisabledTextEditor, width: 120, },
    { id: 'stc_update_cnt', name: '更新回数', field: 'stc_update_cnt', width: 50, },
    { id: 'stc_cost_eva_qty', name: '評価数量', field: 'stc_cost_eva_qty', cssClass: 'right-align', width: 80, },
    { id: 'stc_unit_tran', name: '単位', field: 'stc_unit_tran', width: 40, },
    { id: 'stc_inventory_type', name: '棚卸区分', field: 'stc_inventory_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_recv_type', name: '売掛区分', field: 'stc_recv_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_pay_type', name: '買掛区分', field: 'stc_pay_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_expence_type', name: '経費区分', field: 'stc_expence_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' }, { key: '', val: '-' }], width: 50, },
    { id: 'stc_cost_type', name: '原価区分', field: 'stc_cost_type', formatter: SelectCellFormatterValue, options: [{ key: '0', val: '無' }, { key: '1', val: '有' },], width: 50, },
    { id: 'stc_yearmonth', name: '整理年月', field: 'stc_yearmonth', width: 50, },
    { id: 'stc_update_at', name: '更新日', field: 'stc_update_at', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80, },
    { id: 'stc_update_time', name: '更新時間', field: 'stc_update_time', formatter: function (r, c, v, cD, dC) { return timeFormatter(v, dC); }, width: 60, },
    { id: 'stc_update_cd', name: '更新者CD', field: 'stc_update_cd', width: 60, },
    { id: 'stc_update_name', name: '更新者', field: 'stc_update_name', width: 70, },
    { id: 'stc_price_trans', name: '取引金額', field: 'stc_price_trans', cssClass: 'right-align', width: 100, },
    { id: 'stc_unit_price', name: '原価', field: 'stc_unit_price', cssClass: 'right-align', width: 70, },
    { id: 'stc_target_id', name: '相手CD', field: 'stc_target_id', width: 80, },
    { id: 'stc_product_cd', name: '品名CD', field: 'stc_product_cd', editor: DisabledTextEditor, width: 100, },
    { id: 'stc_place_cd', name: '場所CD', field: 'stc_place_cd', width: 50, },
    { id: 'stc_customer_post_cd', name: '担当者ID', field: 'stc_customer_post_cd', width: 60, },
  ];
  // チェックボックス付加
  mainPGs.pgST.columns.unshift(mainPGs.pgST.checkboxSelector.getColumnDefinition(),);

  makeSortable();
  applyCSStoColumns();
}

