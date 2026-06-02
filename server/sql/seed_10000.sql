-- ============================================
-- 追加 10000 条订单数据 + 2000 条访问日志 + 新增用户
-- ============================================

USE dashboard_db;

-- 先多插一些用户，让数据更多样
INSERT IGNORE INTO users (username, password_hash, role, email, created_at) VALUES
('user03', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user03@company.cn', '2025-06-01 08:00:00'),
('user04', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user04@company.cn', '2025-06-05 09:00:00'),
('user05', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user05@company.cn', '2025-06-10 10:00:00'),
('user06', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user06@company.cn', '2025-07-01 11:00:00'),
('user07', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user07@company.cn', '2025-08-15 12:00:00'),
('user08', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user08@company.cn', '2025-09-01 13:00:00'),
('user09', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user09@company.cn', '2025-10-01 14:00:00'),
('user10', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user10@company.cn', '2025-11-01 15:00:00'),
('user11', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user11@company.cn', '2025-12-01 16:00:00'),
('user12', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user12@company.cn', '2026-01-01 08:00:00'),
('user13', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user13@company.cn', '2026-02-01 09:00:00'),
('user14', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user14@company.cn', '2026-03-01 10:00:00'),
('user15', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'user15@company.cn', '2026-04-01 11:00:00'),
('test01', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'test01@company.cn', '2026-05-01 08:00:00'),
('test02', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'test02@company.cn', '2026-05-10 09:00:00'),
('test03', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'test03@company.cn', '2026-05-15 10:00:00'),
('test04', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'test04@company.cn', '2026-05-18 11:00:00'),
('test05', '$2b$10$nilhiiqi5XY7r6oc26eQXO423vXuF5ydAlkB9zLwc8yEa2a7QwtCy', 'viewer', 'test05@company.cn', '2026-05-20 12:00:00');

-- ============================================
-- 生成 10000 条订单（覆盖最近 90 天）
-- ============================================
DELIMITER $$
CREATE PROCEDURE generate_orders_big()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE total INT DEFAULT 10000;
  DECLARE uid INT;
  DECLARE amt DECIMAL(12,2);
  DECLARE reg VARCHAR(50);
  DECLARE cat VARCHAR(50);
  DECLARE st ENUM('pending','completed','cancelled');
  DECLARE dt DATETIME;
  DECLARE ri INT;
  DECLARE ci INT;
  DECLARE base_date DATE;
  DECLARE ref_id INT;
  DECLARE order_no_prefix VARCHAR(20);

  SELECT COALESCE(MAX(id), 0) + 1 INTO ref_id FROM orders;
  SET base_date = '2026-05-25';

  WHILE i <= total DO
    SET uid = FLOOR(1 + RAND() * 38);
    SET amt = ROUND(50 + RAND() * 19950, 2);
    SET ri = FLOOR(1 + RAND() * 34);
    SET ci = FLOOR(1 + RAND() * 6);
    SET dt = DATE_SUB(DATE_ADD(base_date, INTERVAL FLOOR(RAND() * 86400) SECOND), INTERVAL FLOOR(RAND() * 90) DAY);

    CASE ri
      WHEN 1 THEN SET reg = '北京'; WHEN 2 THEN SET reg = '上海'; WHEN 3 THEN SET reg = '广州';
      WHEN 4 THEN SET reg = '深圳'; WHEN 5 THEN SET reg = '杭州'; WHEN 6 THEN SET reg = '成都';
      WHEN 7 THEN SET reg = '武汉'; WHEN 8 THEN SET reg = '南京'; WHEN 9 THEN SET reg = '重庆';
      WHEN 10 THEN SET reg = '苏州'; WHEN 11 THEN SET reg = '天津'; WHEN 12 THEN SET reg = '长沙';
      WHEN 13 THEN SET reg = '西安'; WHEN 14 THEN SET reg = '郑州'; WHEN 15 THEN SET reg = '东莞';
      WHEN 16 THEN SET reg = '青岛'; WHEN 17 THEN SET reg = '沈阳'; WHEN 18 THEN SET reg = '宁波';
      WHEN 19 THEN SET reg = '昆明'; WHEN 20 THEN SET reg = '大连'; WHEN 21 THEN SET reg = '厦门';
      WHEN 22 THEN SET reg = '合肥'; WHEN 23 THEN SET reg = '佛山'; WHEN 24 THEN SET reg = '福州';
      WHEN 25 THEN SET reg = '哈尔滨'; WHEN 26 THEN SET reg = '济南'; WHEN 27 THEN SET reg = '温州';
      WHEN 28 THEN SET reg = '长春'; WHEN 29 THEN SET reg = '石家庄'; WHEN 30 THEN SET reg = '常州';
      WHEN 31 THEN SET reg = '泉州'; WHEN 32 THEN SET reg = '南宁'; WHEN 33 THEN SET reg = '贵阳';
      WHEN 34 THEN SET reg = '南昌';
    END CASE;

    CASE ci
      WHEN 1 THEN SET cat = '电子产品'; WHEN 2 THEN SET cat = '服装鞋帽';
      WHEN 3 THEN SET cat = '食品饮料'; WHEN 4 THEN SET cat = '家居用品';
      WHEN 5 THEN SET cat = '美妆个护'; WHEN 6 THEN SET cat = '图书文具';
    END CASE;

    IF RAND() < 0.72 THEN SET st = 'completed';
    ELSEIF RAND() < 0.88 THEN SET st = 'pending';
    ELSE SET st = 'cancelled';
    END IF;

    SET order_no_prefix = CONCAT('ORD', DATE_FORMAT(dt, '%Y%m%d'));
    INSERT IGNORE INTO orders (order_no, user_id, amount, status, region, category, created_at)
    VALUES (CONCAT(order_no_prefix, LPAD(ref_id + i, 6, '0')), uid, amt, st, reg, cat, dt);

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL generate_orders_big();
DROP PROCEDURE IF EXISTS generate_orders_big;

-- ============================================
-- 生成 2000 条访问日志
-- ============================================
DELIMITER $$
CREATE PROCEDURE generate_logs_big()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE uid INT;
  DECLARE pg VARCHAR(100);
  DECLARE ip VARCHAR(45);
  DECLARE dev VARCHAR(50);
  DECLARE dur INT;
  DECLARE dt DATETIME;
  DECLARE pi INT;
  DECLARE total INT DEFAULT 2000;
  DECLARE base_date DATE;

  SET base_date = '2026-05-25';

  WHILE i <= total DO
    SET uid = FLOOR(1 + RAND() * 38);
    SET pi = FLOOR(1 + RAND() * 6);
    SET dt = DATE_SUB(DATE_ADD(base_date, INTERVAL FLOOR(RAND() * 86400) SECOND), INTERVAL FLOOR(RAND() * 30) DAY);
    SET dur = FLOOR(5 + RAND() * 595);
    SET ip = CONCAT(FLOOR(10 + RAND() * 220), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(1 + RAND() * 254));

    CASE pi
      WHEN 1 THEN SET pg = '/dashboard'; WHEN 2 THEN SET pg = '/dashboard/orders';
      WHEN 3 THEN SET pg = '/dashboard/analytics'; WHEN 4 THEN SET pg = '/dashboard/users';
      WHEN 5 THEN SET pg = '/dashboard/settings'; WHEN 6 THEN SET pg = '/dashboard/reports';
    END CASE;

    IF RAND() < 0.45 THEN SET dev = 'Desktop';
    ELSEIF RAND() < 0.75 THEN SET dev = 'Mobile';
    ELSEIF RAND() < 0.9 THEN SET dev = 'Tablet';
    ELSE SET dev = 'Pad';
    END IF;

    INSERT INTO access_logs (user_id, page, ip, device, duration, access_time)
    VALUES (uid, pg, ip, dev, dur, dt);

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL generate_logs_big();
DROP PROCEDURE IF EXISTS generate_logs_big;

-- ============================================
-- 更新 regions 统计数据
-- ============================================
UPDATE regions r
SET
  order_count = (SELECT COUNT(*) FROM orders o WHERE o.region = r.name),
  sales_amount = (SELECT COALESCE(SUM(o.amount), 0) FROM orders o WHERE o.region = r.name);

-- ============================================
-- 最终统计
-- ============================================
SELECT CONCAT('最终订单数: ', COUNT(*)) AS result FROM orders;
SELECT CONCAT('用户数: ', COUNT(*)) AS result FROM users;
SELECT CONCAT('访问日志数: ', COUNT(*)) AS result FROM access_logs;
