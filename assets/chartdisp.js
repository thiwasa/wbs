/** 負荷率グラフ用オブジェクト */
var loadFactorChart = null;

/** 現在在庫グラフ用オブジェクト */
var currentStockChart = null;

/** 予想在庫グラフ用オブジェクト */
var esChart = null;

/**
 * グラフの初期設定を行う
 */
function initChartConfig() {
  var defChart = Chart['defaults']['global'];
  defChart['animation']['duration'] = 500;
  defChart['hover']['mode'] = 'index';
  defChart['hover']['intersect'] = false;
  defChart['tooltips']['mode'] = 'index';
  defChart['tooltips']['intersect'] = false;
  defChart['layout']['padding']['left'] = 2;
  defChart['layout']['padding']['right'] = 20;
  defChart['layout']['padding']['top'] = 2;
  defChart['layout']['padding']['bottom'] = 4;
  defChart['elements']['point']['hitRadius'] = 5;
}

/**
 * 負荷率グラフを表示する(人員基準)
 * @param {Array} results データ内容。
 * @param {CVSGantt} gt 基準軸として使用するガントチャート
 */
function displayLoadFactorChart(results, gt) {
  // データ準備
  var dataLeafCount = [];
  var stockPredict = 0;
  var dateMin = new Date(WSUtils.convertMysqlDatetime(results[0]['dts']).getTime());
  var dateMax = new Date(WSUtils.convertMysqlDatetime(results[results.length - 1]['dts']).getTime() + 86400000);
  results.forEach(function (elem) {
    var obj = {
      't': WSUtils.convertMysqlDatetime(elem['dts']),
      'y': Math.round(Number(elem['num']) / gt.v.rowdata.length * 1000) / 10
    };
    dataLeafCount.push(obj);
  });
  // グラフ設定
  var ctx = document.getElementById('loadfactor-chart').getContext('2d');
  var config = {
    'type': 'line',
    'data': {
      'datasets': [{
        'label': '稼働率',
        'backgroundColor': 'rgba(54, 162, 235, 0.25)',
        'borderColor': 'rgba(54, 162, 235, 1)',
        'data': dataLeafCount,
        'borderWidth': 1,
        'pointRadius': 0,
        'fill': true,
        'steppedLine': true
      }]
    },
    'options': {
      'responsive': true,
      'maintainAspectRatio': false,
      'title': {
        'display': true,
        'text': '稼働率予想'
      },
      'legend': {
        display: true,
        position: 'right',
        labels: {
          fontsize: 18,
          boxWidth: 10
        }
      },
      'scales': {
        'xAxes': [{
          'type': 'time',
          'time': {
            'parser': 'YYYY-MM-DD HH:mm',
            'tooltipFormat': 'YYYY-MM-DD HH:mm',
            'unit': 'hour',
            'unitStepSize': 1,
            /* 'stepSize': gt.v.fixval.DAY_EN_HOUR - gt.v.fixval.DAY_ST_HOUR, */
            'displayFormats': { 'hour': 'YYYY-MM-DD HH:mm' },
            'max': $['datepicker']['formatDate']('yy-mm-dd', dateMax),
            'min': $['datepicker']['formatDate']('yy-mm-dd', dateMin)
          },
          'ticks': {
            'callback': function (value) {
              return (Number(value.slice(11, 13)) === gt.v.fixval.DAY_ST_HOUR) ? value.slice(0, 10) : '';
            },
            'autoSkip': false,
            'maxRotation': 90,
            'minRotation': 90
          },
          'gridLines': {
            'display': false
          },
        }],
        'yAxes': [{
          'display': true,
          'scaleLabel': {
            'display': true,
            'labelString': '稼働率[%]'
          },
          'ticks': {
            'min': 0,
            'max': 100,
          }
        }]
      }
    }
  };
  if (loadFactorChart) {
    loadFactorChart['data']['datasets'] = config['data']['datasets'];
    loadFactorChart['config']['options']['scales']['xAxes'][0]['time']['max'] = $['datepicker']['formatDate']('yy-mm-dd', dateMax);
    loadFactorChart['config']['options']['scales']['xAxes'][0]['time']['min'] = $['datepicker']['formatDate']('yy-mm-dd', dateMin);
    loadFactorChart['update']();
  } else {
    loadFactorChart = new Chart(ctx, config);
  }
}

/**
 * 現在在庫グラフを表示する
 * @param {Array} results データ内容。
 */
function displayCurrentStockChart(results) {
  // データ準備
  var labels = [];
  var dataStocks = [];
  var bgColors = [];
  var borderColors = [];
  results.forEach(function (elem) {
    labels.push(elem['sto_warehouse_id'] + '/' + elem['p_name']);
    dataStocks.push(Number(elem['qty_good']));
    bgColors.push('rgba(54, 162, 235, 0.5)');
    borderColors.push('rgba(54, 162, 235, 1)');
  });
  // グラフ設定
  var ctx = document.getElementById('currentstock-chart').getContext('2d');
  var config = {
    'type': 'bar',
    'data': {
      'labels': labels,
      'datasets': [{
        'label': '在庫数',
        'data': dataStocks,
        'backgroundColor': bgColors,
        'borderColor': borderColors,
      }],
    },
    'options': {
      'responsive': true,
      'maintainAspectRatio': false,
      'title': {
        'display': true,
        'text': '現在在庫',
      },
      'scales': {
        'xAxes': [{
          'ticks': {
            'autoSkip': false,
            'maxRotation': 30,
            'minRotation': 30
          },
        }],
        'yAxes': [{
          'display': true,
          'scaleLabel': {
            'display': true,
            'labelString': '数量',
          },
        }],
      },
    },
  };
  if (currentStockChart) {
    currentStockChart['data']['datasets'] = config['data']['datasets'];
    currentStockChart['update']();
  } else {
    currentStockChart = new Chart(ctx, config);
  }
}

/**
 * 予想在庫グラフを表示する
 */
function displayEstimateStockChart(results) {
  $('#dialog-graph')['dialog']('open');
  // データ準備
  var dateMin = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  var dateMax = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  var dataRemain = [];
  var stockPredict = 0;
  if (results['current'].length > 0) {
    stockPredict = Number(results['current'][0]['qty_good']);
  }
  dataRemain.push({
    't': new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    'y': stockPredict
  });
  var changedStocks = [];
  var dataProd = [];
  results['prod'].forEach(function (elem) {
    var obj = {
      't': elem['plan_date'].getTime() !== 0 ? elem['plan_date'] : new Date(),
      'y': /* stockPredict +  */elem['qty_good']
    };
    if (obj['t'].getTime() < dateMin.getTime()) {
      dateMin.setTime(obj['t'].getTime());
    }
    if (obj['t'].getTime() > dateMax.getTime()) {
      dateMax.setTime(obj['t'].getTime());
    }
    dataProd.push(obj);
    var changedStock = {
      't': elem['plan_date'].getTime() !== 0 ? elem['plan_date'] : new Date(),
      'dy': elem['dy']
    };
    changedStocks.push(changedStock);
  });
  var dataShip = [];
  results['ship'].forEach(function (elem) {
    var obj = {
      't': elem['plan_date'].getTime() !== 0 ? elem['plan_date'] : new Date(),
      'y': elem['qty_good']
    };
    if (obj['t'].getTime() < dateMin.getTime()) {
      dateMin.setTime(obj['t'].getTime());
    }
    if (obj['t'].getTime() > dateMax.getTime()) {
      dateMax.setTime(obj['t'].getTime());
    }
    dataShip.push(obj);
    var changedStock = {
      't': elem['plan_date'].getTime() !== 0 ? elem['plan_date'] : new Date(),
      'dy': -elem['dy']
    };
    changedStocks.push(changedStock);
  });
  var dataMat = [];
  results['mat'].forEach(function (elem) {
    var obj = {
      't': elem['plan_date'].getTime() !== 0 ? elem['plan_date'] : new Date(),
      'y': elem['qty_good']
    };
    if (obj['t'].getTime() < dateMin.getTime()) {
      dateMin.setTime(obj['t'].getTime());
    }
    if (obj['t'].getTime() > dateMax.getTime()) {
      dateMax.setTime(obj['t'].getTime());
    }
    dataMat.push(obj);
    var changedStock = {
      't': elem['plan_date'].getTime() !== 0 ? elem['plan_date'] : new Date(),
      'dy': -elem['dy']
    };
    changedStocks.push(changedStock);
  });
  changedStocks.sort(function (a, b) {
    if (a['t'].getTime() > b['t'].getTime()) {
      return 1;
    } else {
      return -1;
    }
  });
  for (var i = 0; i < changedStocks.length; i++) {
    stockPredict += Number(changedStocks[i]['dy']);
    var obj = {
      't': changedStocks[i]['t'],
      'y': stockPredict
    };
    dataRemain.push(obj);
  }
  // グラフ設定
  var ctx = document.getElementById('estimatestock-chart').getContext('2d');
  var config = {
    'type': 'line',
    'data': {
      'datasets': [{
        'label': '予想残数',
        'fill': false,
        'borderDash': [10, 10],
        'backgroundColor': 'rgba(54, 235, 99, 0.25)',
        'borderColor': 'rgba(54, 235, 99, 1)',
        'data': dataRemain,
        'steppedLine': true
      }, {
        'label': '製造予定',
        'backgroundColor': 'rgba(255, 99, 132, 1)',
        'borderColor': 'rgba(255, 99, 132, 1)',
        'data': dataProd,
        'fill': false,
        'steppedLine': true
      }, {
        'label': '出荷予定',
        'fill': false,
        'backgroundColor': 'rgba(54, 162, 235, 1)',
        'borderColor': 'rgba(54, 162, 235, 1)',
        'data': dataShip,
        'steppedLine': true
      }, {
        'label': '消費予定',
        'fill': false,
        'backgroundColor': 'rgba(255, 159, 64, 1)',
        'borderColor': 'rgba(255, 159, 64, 1)',
        'pointStyle': 'rect',
        'borderWidth': 5,
        'data': dataMat,
        'steppedLine': true
      }]
    },
    'options': {
      'responsive': true,
      'maintainAspectRatio': false,
      'title': {
        'display': true,
        'text': results['info'].length > 0 ? '在庫予測(' + results['info'][0]['p_id'] + ':' + results['info'][0]['p_name'] + ')' : '在庫予測'
      },
      'layout': {
        'padding': {
          'left': 2,
          'right': 20,
          'top': 2,
          'bottom': 4
        }
      },
      'animation': {
        'duration': 250
      },
      'hover': {
        'mode': 'nearest',
        'intersect': true
      },
      'tooltips' : {
        'mode': 'nearest',
        'intersect': true //false
      },
      'scales': {
        'xAxes': [{
          'type': 'time',
          'time': {
            'parser': 'YYYY-MM-DD',
            'tooltipFormat': 'YYYY-MM-DD',
            'unit': 'day',
            'displayFormats': { 'day': 'YYYY-MM-DD' },
            'max': $['datepicker']['formatDate']('yy-mm-dd', new Date (dateMax.getTime() + 86400000)),
            'min': $['datepicker']['formatDate']('yy-mm-dd', dateMin)
          },
          'ticks': {
            'autoSkip': false,
            'maxRotation': 90,
            'minRotation': 90
          },
        }],
        'yAxes': [{
          'display': true,
          'scaleLabel': {
            'display': true,
            'labelString': '数量'
          }
        }]
      }
    }
  };
  if (esChart) {
    esChart.data.datasets = config.data.datasets;
    esChart.config.options.scales.xAxes[0].time.max = $['datepicker']['formatDate']('yy-mm-dd', new Date (dateMax.getTime() + 86400000));
    esChart.config.options.scales.xAxes[0].time.min = $['datepicker']['formatDate']('yy-mm-dd', dateMin);
    esChart.config.options.title.text = results['info'].length > 0 ? '在庫予測(' + results['info'][0]['p_id'] + ':' + results['info'][0]['p_name'] + ')' : '在庫予測';
    esChart.update();
  } else {
    esChart = new Chart(ctx, config);
  }
}