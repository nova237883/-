-- ============================================
-- 性能优化脚本
-- 1. 添加复合索引
-- 2. 创建聚合汇总表
-- 3. 初始化汇总数据
-- ============================================

USE dashboard_db;

-- ============================================
-- 1. 添加复合索引
-- ============================================
ALTER TABLE orders ADD INDEX idx_created_at_date (created_at);
ALTER TABLE orders ADD INDEX idx_region_created (region, created_at);
ALTER TABLE orders ADD INDEX idx_category_created (category, created_at);
ALTER TABLE orders ADD INDEX idx_status_category (status, category);
ALTER TABLE orders ADD INDEX idx_region_status (region, status);

-- ============================================
-- 2. 创建日汇总表
-- ============================================
CREATE TABLE IF NOT EXISTS daily_summary (
  stat_date DATE NOT NULL PRIMARY KEY,
  total_orders INT NOT NULL DEFAULT 0,
  total_sales DECIMAL(15,2) NOT NULL DEFAULT 0,
  completed_orders INT NOT NULL DEFAULT 0,
  pending_orders INT NOT NULL DEFAULT 0,
  cancelled_orders INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. 创建地区汇总表
-- ============================================
CREATE TABLE IF NOT EXISTS region_summary (
  region VARCHAR(50) NOT NULL PRIMARY KEY,
  total_orders INT NOT NULL DEFAULT 0,
  total_sales DECIMAL(15,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. 创建品类汇总表
-- ============================================
CREATE TABLE IF NOT EXISTS category_summary (
  category VARCHAR(50) NOT NULL PRIMARY KEY,
  total_orders INT NOT NULL DEFAULT 0,
  total_sales DECIMAL(15,2) NOT NULL DEFAULT 0,
  completed_orders INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. 创建小时级趋势表
-- ============================================
CREATE TABLE IF NOT EXISTS hourly_summary (
  stat_date DATE NOT NULL,
  hour TINYINT NOT NULL,
  order_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (stat_date, hour)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. 刷新汇总数据（存储过程）
-- ============================================
DELIMITER $$
CREATE PROCEDURE refresh_summary()
BEGIN
  -- 刷新日汇总
  INSERT INTO daily_summary (stat_date, total_orders, total_sales, completed_orders, pending_orders, cancelled_orders)
  SELECT
    DATE(created_at) AS stat_date,
    COUNT(*) AS total_orders,
    COALESCE(SUM(amount), 0) AS total_sales,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
  FROM orders
  GROUP BY DATE(created_at)
  ON DUPLICATE KEY UPDATE
    total_orders = VALUES(total_orders),
    total_sales = VALUES(total_sales),
    completed_orders = VALUES(completed_orders),
    pending_orders = VALUES(pending_orders),
    cancelled_orders = VALUES(cancelled_orders);

  -- 刷新地区汇总
  INSERT INTO region_summary (region, total_orders, total_sales)
  SELECT
    region,
    COUNT(*) AS total_orders,
    COALESCE(SUM(amount), 0) AS total_sales
  FROM orders
  GROUP BY region
  ON DUPLICATE KEY UPDATE
    total_orders = VALUES(total_orders),
    total_sales = VALUES(total_sales);

  -- 刷新品类汇总
  INSERT INTO category_summary (category, total_orders, total_sales, completed_orders)
  SELECT
    category,
    COUNT(*) AS total_orders,
    COALESCE(SUM(amount), 0) AS total_sales,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders
  FROM orders
  GROUP BY category
  ON DUPLICATE KEY UPDATE
    total_orders = VALUES(total_orders),
    total_sales = VALUES(total_sales),
    completed_orders = VALUES(completed_orders);

  -- 刷新小时级趋势
  INSERT INTO hourly_summary (stat_date, hour, order_count)
  SELECT
    DATE(created_at) AS stat_date,
    HOUR(created_at) AS hour,
    COUNT(*) AS order_count
  FROM orders
  GROUP BY DATE(created_at), HOUR(created_at)
  ON DUPLICATE KEY UPDATE
    order_count = VALUES(order_count);
END$$
DELIMITER ;

-- ============================================
-- 7. 初始化汇总数据
-- ============================================
CALL refresh_summary();

-- ============================================
-- 8. 创建触发器：新订单插入后自动更新汇总
-- ============================================
DELIMITER $$
CREATE TRIGGER after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  INSERT INTO daily_summary (stat_date, total_orders, total_sales, completed_orders, pending_orders, cancelled_orders)
  VALUES (DATE(NEW.created_at), 1, NEW.amount,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END)
  ON DUPLICATE KEY UPDATE
    total_orders = total_orders + 1,
    total_sales = total_sales + NEW.amount,
    completed_orders = completed_orders + (CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END),
    pending_orders = pending_orders + (CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END),
    cancelled_orders = cancelled_orders + (CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END);

  INSERT INTO region_summary (region, total_orders, total_sales)
  VALUES (NEW.region, 1, NEW.amount)
  ON DUPLICATE KEY UPDATE
    total_orders = total_orders + 1,
    total_sales = total_sales + NEW.amount;

  INSERT INTO category_summary (category, total_orders, total_sales, completed_orders)
  VALUES (NEW.category, 1, NEW.amount,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END)
  ON DUPLICATE KEY UPDATE
    total_orders = total_orders + 1,
    total_sales = total_sales + NEW.amount,
    completed_orders = completed_orders + (CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END);

  INSERT INTO hourly_summary (stat_date, hour, order_count)
  VALUES (DATE(NEW.created_at), HOUR(NEW.created_at), 1)
  ON DUPLICATE KEY UPDATE
    order_count = order_count + 1;
END$$
DELIMITER ;

-- ============================================
-- 9. 验证汇总数据
-- ============================================
SELECT CONCAT('日汇总天数: ', COUNT(*)) FROM daily_summary;
SELECT CONCAT('地区数: ', COUNT(*)) FROM region_summary;
SELECT CONCAT('品类数: ', COUNT(*)) FROM category_summary;
SELECT CONCAT('小时趋势行数: ', COUNT(*)) FROM hourly_summary;
