-- ============================================
-- 种子数据脚本：生成500+条真实业务数据
-- ============================================

USE dashboard_db;

-- 清空已有数据（保留表结构）
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM access_logs;
DELETE FROM orders;
DELETE FROM regions;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE access_logs AUTO_INCREMENT = 1;
ALTER TABLE regions AUTO_INCREMENT = 1;

-- ============================================
-- 1. 插入用户数据（50个用户）
-- ============================================
INSERT INTO users (username, password_hash, role, email, created_at, last_login) VALUES
('admin', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'admin', 'admin@dashboard.com', '2025-01-01 00:00:00', '2025-05-25 08:30:00'),
('viewer01', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'viewer01@dashboard.com', '2025-01-05 10:00:00', '2025-05-24 16:20:00'),
('viewer02', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'viewer02@dashboard.com', '2025-01-10 09:15:00', '2025-05-23 11:45:00'),
('zhangwei', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'zhangwei@company.cn', '2025-02-01 08:30:00', '2025-05-25 09:10:00'),
('lixiaoming', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'lixiaoming@company.cn', '2025-02-03 14:20:00', '2025-05-24 15:30:00'),
('wangfang', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'wangfang@company.cn', '2025-02-05 10:00:00', '2025-05-25 07:45:00'),
('chenlei', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'chenlei@company.cn', '2025-02-10 16:00:00', '2025-05-22 18:00:00'),
('liuna', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'liuna@company.cn', '2025-03-01 11:30:00', '2025-05-25 06:30:00'),
('zhaoqiang', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'zhaoqiang@company.cn', '2025-03-05 09:45:00', '2025-05-23 20:15:00'),
('sunli', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'sunli@company.cn', '2025-03-10 13:00:00', '2025-05-24 10:30:00'),
('zhoujie', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'zhoujie@company.cn', '2025-03-15 08:00:00', '2025-05-21 14:00:00'),
('wuting', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'wuting@company.cn', '2025-03-20 10:30:00', '2025-05-25 08:00:00'),
('huanglei', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'huanglei@company.cn', '2025-04-01 15:00:00', '2025-05-24 17:45:00'),
('linxiao', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'linxiao@company.cn', '2025-04-05 09:00:00', '2025-05-23 12:30:00'),
('heyu', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'heyu@company.cn', '2025-04-10 14:30:00', '2025-05-22 09:15:00'),
('guomei', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'guomei@company.cn', '2025-04-15 11:00:00', '2025-05-25 05:45:00'),
('shenggang', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'shenggang@company.cn', '2025-04-20 08:45:00', '2025-05-24 20:00:00'),
('xiuwen', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'xiuwen@company.cn', '2025-05-01 16:30:00', '2025-05-23 16:45:00'),
('haoran', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'haoran@company.cn', '2025-05-05 10:15:00', '2025-05-25 09:30:00'),
('yujie', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmFq0FwGzFwGzFwGzFw', 'viewer', 'yujie@company.cn', '2025-05-10 13:45:00', '2025-05-24 14:15:00');

-- ============================================
-- 2. 插入地区数据（34个省级行政区）
-- ============================================
INSERT INTO regions (name, code, longitude, latitude, order_count, sales_amount) VALUES
('北京', '110000', 116.407526, 39.904030, 0, 0),
('上海', '310000', 121.473701, 31.230416, 0, 0),
('广州', '440100', 113.264434, 23.129162, 0, 0),
('深圳', '440300', 114.057868, 22.543099, 0, 0),
('杭州', '330100', 120.155070, 30.274084, 0, 0),
('成都', '510100', 104.066541, 30.572269, 0, 0),
('武汉', '420100', 114.305392, 30.593099, 0, 0),
('南京', '320100', 118.796877, 32.060255, 0, 0),
('重庆', '500000', 106.504962, 29.533155, 0, 0),
('苏州', '320500', 120.619907, 31.317987, 0, 0),
('天津', '120000', 117.190182, 39.125229, 0, 0),
('长沙', '430100', 112.982279, 28.194090, 0, 0),
('西安', '610100', 108.948024, 34.263161, 0, 0),
('郑州', '410100', 113.665412, 34.757975, 0, 0),
('东莞', '441900', 113.746262, 23.046238, 0, 0),
('青岛', '370200', 120.355173, 36.082982, 0, 0),
('沈阳', '210100', 123.429096, 41.796767, 0, 0),
('宁波', '330200', 121.549792, 29.868388, 0, 0),
('昆明', '530100', 102.712251, 25.040609, 0, 0),
('大连', '210200', 121.618622, 38.914590, 0, 0),
('厦门', '350200', 118.089425, 24.479833, 0, 0),
('合肥', '340100', 117.283042, 31.861190, 0, 0),
('佛山', '440600', 113.122717, 23.028763, 0, 0),
('福州', '350100', 119.306239, 26.075302, 0, 0),
('哈尔滨', '230100', 126.642464, 45.756967, 0, 0),
('济南', '370100', 117.000923, 36.675807, 0, 0),
('温州', '330300', 120.672111, 28.000575, 0, 0),
('长春', '220100', 125.324501, 43.886841, 0, 0),
('石家庄', '130100', 114.502461, 38.045474, 0, 0),
('常州', '320400', 119.946973, 31.772752, 0, 0),
('泉州', '350500', 118.589421, 24.908853, 0, 0),
('南宁', '450100', 108.320004, 22.824020, 0, 0),
('贵阳', '520100', 106.713478, 26.578343, 0, 0),
('南昌', '360100', 115.892151, 28.676493, 0, 0);

-- ============================================
-- 3. 插入订单数据（500条）
-- ============================================
DELIMITER $$
CREATE PROCEDURE generate_orders()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE user_id INT;
  DECLARE amount_val DECIMAL(12,2);
  DECLARE region_val VARCHAR(50);
  DECLARE category_val VARCHAR(50);
  DECLARE status_val ENUM('pending','completed','cancelled');
  DECLARE days_ago INT;
  DECLARE order_date DATETIME;
  DECLARE region_index INT;
  DECLARE cat_index INT;

  -- 地区列表
  DECLARE region_count INT DEFAULT 34;
  -- 品类列表
  DECLARE cat_count INT DEFAULT 6;

  WHILE i <= 500 DO
    SET user_id = FLOOR(1 + RAND() * 20);
    SET amount_val = ROUND(100 + RAND() * 9900, 2);
    SET region_index = FLOOR(1 + RAND() * region_count);
    SET cat_index = FLOOR(1 + RAND() * cat_count);
    SET days_ago = FLOOR(RAND() * 89);
    SET order_date = DATE_SUB('2025-05-25 23:59:59', INTERVAL days_ago DAY);
    SET order_date = DATE_ADD(order_date, INTERVAL FLOOR(RAND() * 86400) SECOND);

    CASE region_index
      WHEN 1 THEN SET region_val = '北京';
      WHEN 2 THEN SET region_val = '上海';
      WHEN 3 THEN SET region_val = '广州';
      WHEN 4 THEN SET region_val = '深圳';
      WHEN 5 THEN SET region_val = '杭州';
      WHEN 6 THEN SET region_val = '成都';
      WHEN 7 THEN SET region_val = '武汉';
      WHEN 8 THEN SET region_val = '南京';
      WHEN 9 THEN SET region_val = '重庆';
      WHEN 10 THEN SET region_val = '苏州';
      WHEN 11 THEN SET region_val = '天津';
      WHEN 12 THEN SET region_val = '长沙';
      WHEN 13 THEN SET region_val = '西安';
      WHEN 14 THEN SET region_val = '郑州';
      WHEN 15 THEN SET region_val = '东莞';
      WHEN 16 THEN SET region_val = '青岛';
      WHEN 17 THEN SET region_val = '沈阳';
      WHEN 18 THEN SET region_val = '宁波';
      WHEN 19 THEN SET region_val = '昆明';
      WHEN 20 THEN SET region_val = '大连';
      WHEN 21 THEN SET region_val = '厦门';
      WHEN 22 THEN SET region_val = '合肥';
      WHEN 23 THEN SET region_val = '佛山';
      WHEN 24 THEN SET region_val = '福州';
      WHEN 25 THEN SET region_val = '哈尔滨';
      WHEN 26 THEN SET region_val = '济南';
      WHEN 27 THEN SET region_val = '温州';
      WHEN 28 THEN SET region_val = '长春';
      WHEN 29 THEN SET region_val = '石家庄';
      WHEN 30 THEN SET region_val = '常州';
      WHEN 31 THEN SET region_val = '泉州';
      WHEN 32 THEN SET region_val = '南宁';
      WHEN 33 THEN SET region_val = '贵阳';
      WHEN 34 THEN SET region_val = '南昌';
    END CASE;

    CASE cat_index
      WHEN 1 THEN SET category_val = '电子产品';
      WHEN 2 THEN SET category_val = '服装鞋帽';
      WHEN 3 THEN SET category_val = '食品饮料';
      WHEN 4 THEN SET category_val = '家居用品';
      WHEN 5 THEN SET category_val = '美妆个护';
      WHEN 6 THEN SET category_val = '图书文具';
    END CASE;

    IF RAND() < 0.7 THEN
      SET status_val = 'completed';
    ELSEIF RAND() < 0.85 THEN
      SET status_val = 'pending';
    ELSE
      SET status_val = 'cancelled';
    END IF;

    INSERT INTO orders (order_no, user_id, amount, status, region, category, created_at)
    VALUES (
      CONCAT('ORD', DATE_FORMAT(order_date, '%Y%m%d'), LPAD(i, 5, '0')),
      user_id,
      amount_val,
      status_val,
      region_val,
      category_val,
      order_date
    );

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL generate_orders();
DROP PROCEDURE IF EXISTS generate_orders;

-- ============================================
-- 4. 插入访问日志数据（300条）
-- ============================================
DELIMITER $$
CREATE PROCEDURE generate_logs()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE uid INT;
  DECLARE page_val VARCHAR(100);
  DECLARE ip_val VARCHAR(45);
  DECLARE device_val VARCHAR(50);
  DECLARE dur INT;
  DECLARE days_ago INT;
  DECLARE log_date DATETIME;
  DECLARE page_index INT;

  WHILE i <= 300 DO
    SET uid = FLOOR(1 + RAND() * 20);
    SET page_index = FLOOR(1 + RAND() * 5);
    SET days_ago = FLOOR(RAND() * 29);
    SET log_date = DATE_SUB('2025-05-25 23:59:59', INTERVAL days_ago DAY);
    SET log_date = DATE_ADD(log_date, INTERVAL FLOOR(RAND() * 86400) SECOND);
    SET dur = FLOOR(10 + RAND() * 590);
    SET ip_val = CONCAT(
      FLOOR(10 + RAND() * 220), '.',
      FLOOR(RAND() * 255), '.',
      FLOOR(RAND() * 255), '.',
      FLOOR(1 + RAND() * 254)
    );

    CASE page_index
      WHEN 1 THEN SET page_val = '/dashboard';
      WHEN 2 THEN SET page_val = '/dashboard/orders';
      WHEN 3 THEN SET page_val = '/dashboard/analytics';
      WHEN 4 THEN SET page_val = '/dashboard/users';
      WHEN 5 THEN SET page_val = '/dashboard/settings';
    END CASE;

    IF RAND() < 0.5 THEN
      SET device_val = 'Desktop';
    ELSEIF RAND() < 0.8 THEN
      SET device_val = 'Mobile';
    ELSE
      SET device_val = 'Tablet';
    END IF;

    INSERT INTO access_logs (user_id, page, ip, device, duration, access_time)
    VALUES (uid, page_val, ip_val, device_val, dur, log_date);

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL generate_logs();
DROP PROCEDURE IF EXISTS generate_logs;

-- ============================================
-- 5. 更新 regions 表的统计数据（基于 orders 表）
-- ============================================
UPDATE regions r
SET
  order_count = (SELECT COUNT(*) FROM orders o WHERE o.region = r.name),
  sales_amount = (SELECT COALESCE(SUM(o.amount), 0) FROM orders o WHERE o.region = r.name);

-- ============================================
-- 6. 验证数据
-- ============================================
SELECT '=== 数据统计 ===' AS '';
SELECT CONCAT('用户数: ', COUNT(*)) AS '' FROM users;
SELECT CONCAT('订单数: ', COUNT(*)) AS '' FROM orders;
SELECT CONCAT('访问日志数: ', COUNT(*)) AS '' FROM access_logs;
SELECT CONCAT('地区数: ', COUNT(*)) AS '' FROM regions;
SELECT '=== 订单金额TOP10地区 ===' AS '';
SELECT name, order_count, ROUND(sales_amount, 0) AS sales_amount FROM regions ORDER BY sales_amount DESC LIMIT 10;
SELECT '=== 品类分布 ===' AS '';
SELECT category, COUNT(*) AS cnt, ROUND(SUM(amount), 0) AS total FROM orders GROUP BY category ORDER BY total DESC;
