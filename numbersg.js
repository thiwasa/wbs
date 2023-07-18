  // 番号一覧 見積書
  numberListPGs.pgED.columns = [
    { id: 'e_estimate_no', name: '受注No', field: 'e_estimate_no', editor: DisabledTextEditor, width: 80 },
    { id: 'e_customer_cd', name: '客先CD', field: 'e_customer_cd', editor: DisabledTextEditor, width: 60 },
    { id: 'e_customer_post_cd', name: '部署CD', field: 'e_customer_post_cd', editor: DisabledTextEditor, width: 100 },
    {
      id: 'e_customer_charge_cd', name: '担当者CD', field: 'e_customer_charge_cd', editor: DisabledTextEditor, editor: DisabledTextEditor, width: 100 },
    { id: 'e_salesman_cd', name: '営業担当CD', field: 'e_salesman_cd', editor: DisabledTextEditor, ref: 'user', validator: masterNNValidator, width: 70 },
    { id: 'e_estimate_date', name: '受注日', field: 'e_estimate_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 90 },
    { id: 'e_desired_delivery_date', name: '希望納期', field: 'e_desired_delivery_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 100 },
    { id: 'e_shipplan_date', name: '出荷予定日', field: 'e_shipplan_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 100 },
    { id: 'e_customer_order_no', name: '先方注文No.', field: 'e_customer_order_no', editor: DisabledTextEditor, width: 150 },
    { id: 'e_shipper_cd', name: '出荷主CD', field: 'e_shipper_cd', editor: DisabledTextEditor, width: 60 },
    { id: 'e_stay_cd', name: '止め先CD', field: 'e_stay_cd', editor: DisabledTextEditor, width: 60 },
    { id: 'e_delivery_cd', name: '納入先CD', field: 'e_delivery_cd', editor: DisabledTextEditor, width: 60 },
    { id: 'e_tc_short_name', name: '運送会社略称', field: 'e_tc_short_name', editor: DisabledTextEditor, width: 120 },
    { id: 'e_title', name: '件名', field: 'e_title', width: 100, editor: DisabledTextEditor, maxlength: 50, width: 100 },
    { id: 'e_remarks', name: '備考', field: 'e_remarks', editor: SelectCellEditorValue, width: 100 }
  ];

  // 番号一覧 発注
  numberListPGs.pgMOD.columns = [
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, width: 120 },
    { id: 'moed_customer_cd', name: '客先CD', field: 'moed_customer_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_customer_post_cd', name: '部署CD', field: 'moed_customer_post_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_customer_charge_cd', name: '客先担当者CD', field: 'moed_customer_charge_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_arrival_hd_date', name: '入荷予定日', field: 'moed_arrival_hd_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_report_remarks', name: '伝票備考', field: 'moed_report_remarks', editor: DisabledTextEditor, width: 80 }
  ];

  // 番号一覧 製造委託
  numberListPGs.pgOOD.columns = [
    { id: 'moed_order_no', name: '発注No', field: 'moed_order_no', editor: DisabledTextEditor, width: 120 },
    { id: 'moed_customer_cd', name: '客先CD', field: 'moed_customer_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_customer_post_cd', name: '部署CD', field: 'moed_customer_post_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_customer_charge_cd', name: '客先担当者CD', field: 'moed_customer_charge_cd', editor: DisabledTextEditor, width: 80 },
    { id: 'moed_salesman_cd', name: '発注者CD', field: 'moed_salesman_cd', editor: DisabledTextEditor, width: 80, },
    { id: 'moed_order_date', name: '発注日', field: 'moed_order_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_arrival_hd_date', name: '入荷予定日', field: 'moed_arrival_hd_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 80 },
    { id: 'moed_report_remarks', name: '伝票備考', field: 'moed_report_remarks', editor: DisabledTextEditor, width: 80 }
  ];

  // 番号一覧 出荷予定
  numberListPGs.pgSD.columns = [
    { id: 's_estimate_no', name: '受注No', field: 's_estimate_no', width: 150 },
    { id: 's_serial_no', name: '納品連番', field: 's_serial_no', width: 150 },
    { id: 's_customer_cd', name: '客先CD', field: 's_customer_cd', editor: DisabledTextEditor },
    { id: 's_customer_post_cd', name: '部署CD', field: 's_customer_post_cd', editor: DisabledTextEditor },
    { id: 's_customer_charge_cd', name: '担当者CD', field: 's_customer_charge_cd', editor: DisabledTextEditor, },
    { id: 's_salesman_cd', name: '営業担当CD', field: 's_salesman_cd', },
    { id: 's_estimate_date', name: '受注日', field: 's_estimate_date', dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 130 },
    { id: 's_desired_delivery_date', name: '希望納期', field: 's_desired_delivery_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 130 },
    { id: 's_customer_order_no', name: '先方注文No.', field: 's_customer_order_no',  editor: DisabledTextEditor, width: 150 },
    { id: 's_shipper_cd', name: '出荷主CD', field: 's_shipper_cd', editor: DisabledTextEditor },
    { id: 's_stay_cd', name: '止め先CD', field: 's_stay_cd', editor: DisabledTextEditor },
    { id: 's_delivery_cd', name: '納入先CD', field: 's_delivery_cd', editor: DisabledTextEditor },
    { id: 's_tc_short_name', name: '運送会社略称', field: 's_tc_short_name', editor: DisabledTextEditor, width: 120 },
    { id: 's_title', name: '件名', field: 's_title', editor: DisabledTextEditor, },
    { id: 's_remarks', name: '備考', field: 's_remarks', editor: DisabledTextEditor, width: 150 },
    { id: 's_shipping_plan_date', name: '出荷予定日', field: 's_shipping_plan_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 130 },
    { id: 's_shipping_date', name: '出荷日', field: 's_shipping_date', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 130 },
    { id: 's_sales_sign', name: '納品確定', field: 's_sales_sign', editor: DisabledTextEditor, dateformat: 'yy/m/d', formatter: function (r, c, v, cD, dC) { return dateFormatter(v, dC); }, width: 130 }
  ];

  // 番号一覧 請求書
  numberListPGs.pgBD.columns = [
    { id: 'b_customer_cd', name: '客先CD', field: 'b_customer_cd', editor: DisabledTextEditor, ref: 'customer', validator: masterValidator, formatter: function (r, c, v, cD, dC) { return setGridCustomerCD(v, dC, 'b_customer_cd'); }, width: 60, },
    { id: 'b_bill_no', name: '請求No.', field: 'b_bill_no', editor: DisabledTextEditor, isPK: true, }
  ];