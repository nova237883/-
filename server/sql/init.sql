-- 创建数据库
CREATE DATABASE IF NOT EXISTS dashboard_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dashboard_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'viewer') DEFAULT 'viewer',
  email VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  region VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_region (region),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 访问日志表
CREATE TABLE IF NOT EXISTS access_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  page VARCHAR(100) NOT NULL,
  ip VARCHAR(45),
  device VARCHAR(50),
  duration INT DEFAULT 0,
  access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_access_time (access_time),
  INDEX idx_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 地区表
CREATE TABLE IF NOT EXISTS regions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  longitude DECIMAL(10,6),
  latitude DECIMAL(10,6),
  order_count INT DEFAULT 0,
  sales_amount DECIMAL(15,2) DEFAULT 0,
  INDEX idx_name (name),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例地区数据
INSERT INTO regions (name, code, longitude, latitude, order_count, sales_amount) VALUES
('北京', '110000', 116.407526, 39.904030, 15234, 45678000.00),
('上海', '310000', 121.473701, 31.230416, 18245, 52340000.00),
('广州', '440100', 113.264434, 23.129162, 12367, 34560000.00),
('深圳', '440300', 114.057868, 22.543099, 14567, 41230000.00),
('杭州', '330100', 120.155070, 30.274084, 9876, 28900000.00),
('成都', '510100', 104.066541, 30.572269, 8234, 23450000.00),
('武汉', '420100', 114.305392, 30.593099, 7234, 19870000.00),
('南京', '320100', 118.796877, 32.060255, 6543, 17650000.00)
ON DUPLICATE KEY UPDATE order_count = VALUES(order_count), sales_amount = VALUES(sales_amount);
