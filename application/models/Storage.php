<?php

class Storage extends CI_Model
{

  public $title;
  public $content;
  public $date;

  public function __construct()
  {
    parent::__construct();
  }

  /**
   * 現在在庫の取得
   */
  public function getCurrentStock($p_id)
  {
    if (isset($p_id)) {
      $query = $this->db->query('
      SELECT
      sto_id,
      sto_warehouse_id,
      sto_product_id,
      SUM(sto_qty_good) AS qty_good,
      SUM(sto_qty_bad) AS qty_bad,
      SUM(sto_qty_buy) AS qty_buy,
      p.p_name
      FROM storages
      LEFT JOIN product AS p ON p_cd = sto_product_id
      WHERE sto_product_id = ?
      GROUP BY sto_warehouse_id, sto_product_id',
        array($p_id));
      return $query->result();
    } else {
      $query = $this->db->query('SELECT
      sto_id,
      sto_warehouse_id,
      sto_product_id,
      SUM(sto_qty_good) AS qty_good,
      SUM(sto_qty_bad) AS qty_bad,
      SUM(sto_qty_buy) AS qty_buy,
      p.p_name
      FROM storages
      LEFT JOIN product AS p ON p_cd = sto_product_id
      GROUP BY sto_warehouse_id, sto_product_id');
      return $query->result();
    }
  }

  /**
   * 現在在庫の取得(全倉庫の数量をまとめて集計する)
   */
  public function checkAllCurrentStock($p_id)
  {
    if (isset($p_id)) {
      $query = $this->db->query('SELECT
      sto_id,
      sto_warehouse_id,
      sto_product_id,
      SUM(sto_qty_good) AS qty_good,
      SUM(sto_qty_bad) AS qty_bad,
      SUM(sto_qty_buy) AS qty_buy,
      p.p_name
      FROM storages
      LEFT JOIN product AS p ON p_cd = sto_product_id
      WHERE sto_product_id = ?
      GROUP BY sto_product_id',
        array($p_id));
      return $query->result();
    } else {
      $query = $this->db->query('SELECT
      sto_id,
      sto_warehouse_id,
      sto_product_id,
      SUM(sto_qty_good) AS qty_good,
      SUM(sto_qty_bad) AS qty_bad,
      SUM(sto_qty_buy) AS qty_buy,
      p.p_name
      FROM storages
      LEFT JOIN product AS p ON p_cd = sto_product_id
      GROUP BY sto_product_id');
      return $query->result();
    }
  }

  /**
   * 製造予定の取得(実績の入力有無を考慮しない)
   */
  public function checkProdPlan($p_id, $isSimMode)
  {
    $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @qty=0;');
    $query = $this->db->query('SELECT
        t1.plan_date,
        (@qty:=@qty+t1.dy) AS qty_good,
        t1.dy
      FROM (
        SELECT
          calcfinishdt(l.l_start_plan, l.l_required_time, @day_st, @day_en) AS plan_date,
          l.l_amount AS dy
        FROM ' . ($isSimMode ? 'leafprod_sim' : 'leafprod' ) . ' AS l
        WHERE l.l_p_id = ?
        AND (calcfinishdt(l.l_start_plan, l.l_required_time, @day_st, @day_en) >= CURDATE()
        AND calcfinishdt(l.l_start_plan, l.l_required_time, @day_st, @day_en) IS NOT NULL)
        ORDER BY calcfinishdt(l.l_start_plan, l.l_required_time, @day_st, @day_en) ASC
      ) AS t1;',
      array($p_id));
    return $query->result();
  }

  /**
   * 出荷予定の取得(実績の入力有無を考慮しない)
   */
  public function checkShipPlan($p_id, $isSimMode)
  {
    $this->db->query('SET @qty=0;');
    $query = $this->db->query('SELECT
      l.l_start_plan AS plan_date,
      (@qty:=@qty+l.l_amount) AS qty_good,
      l.l_amount AS dy
      FROM ' . ($isSimMode ? 'leafship_sim' : 'leafship' ) . ' AS l
      LEFT JOIN shipplandetails AS spd
        ON spd.spd_shipplan_id = l.l_spd_shipplan_id
        AND spd.spd_row = l.l_spd_row
      WHERE spd.spd_products_id = ? AND (l.l_start_plan >= CURDATE() AND l.l_start_plan IS NOT NULL)
      ORDER BY l_start_plan ASC;',
      array($p_id));
    return $query->result();
  }

  /**
   * 消費予定の取得(実績の入力有無を考慮しない)
   * 製造予定製品に対応するBOMテーブルから材料として使用される数量を算出する。
   */
  public function checkMaterialPlan($p_id, $isSimMode)
  {
    $this->db->query('SET @qty=0;');
    $query = $this->db->query('SELECT
        t1.plan_date,
        (@qty:=CAST((@qty+t1.dy) AS DECIMAL(10, 4))) AS qty_good,
        t1.dy
      FROM (
        SELECT
          l.l_start_plan AS plan_date,
          (b.b_quantity*l.l_amount) AS dy
        FROM ' . ($isSimMode ? 'leafprod_sim' : 'leafprod' ) . ' AS l
        LEFT JOIN bom AS b ON b.b_parent_id = l.l_p_id
        WHERE b.b_child_id = ?
          AND (l.l_start_plan >= CURDATE()
          AND l.l_start_plan IS NOT NULL)
        ORDER BY l.l_start_plan ASC
      ) AS t1',
      array($p_id));
    return $query->result();
  }

}
