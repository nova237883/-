-- ============================================
-- 权限管理表结构
-- 1. 菜单表（支持树形结构）
-- 2. 角色-菜单关联表
-- 3. 角色-按钮权限关联表
-- ============================================

USE dashboard_db;

-- ============================================
-- 1. 菜单表
-- ============================================
CREATE TABLE IF NOT EXISTS menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '菜单名称',
  path VARCHAR(100) NOT NULL COMMENT '前端路由路径',
  icon VARCHAR(50) DEFAULT '' COMMENT '图标名称',
  component VARCHAR(100) DEFAULT '' COMMENT '前端组件路径',
  parent_id INT DEFAULT 0 COMMENT '父菜单ID(0为顶级)',
  sort_order INT DEFAULT 0 COMMENT '排序(越小越靠前)',
  type ENUM('menu', 'button') DEFAULT 'menu' COMMENT '类型: menu菜单, button按钮',
  permission_code VARCHAR(100) DEFAULT '' COMMENT '权限标识(如 user:list, user:create)',
  visible TINYINT(1) DEFAULT 1 COMMENT '是否可见',
  status TINYINT(1) DEFAULT 1 COMMENT '状态(1启用 0禁用)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_permission (permission_code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 角色-菜单关联表
-- ============================================
CREATE TABLE IF NOT EXISTS role_menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(20) NOT NULL COMMENT '角色标识(admin/viewer)',
  menu_id INT NOT NULL COMMENT '菜单ID',
  UNIQUE KEY uk_role_menu (role, menu_id),
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 角色-权限关联表（按钮级）
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(20) NOT NULL COMMENT '角色标识',
  permission_code VARCHAR(100) NOT NULL COMMENT '权限标识',
  UNIQUE KEY uk_role_perm (role, permission_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 初始化菜单数据
-- ============================================
INSERT INTO menus (name, path, icon, component, parent_id, sort_order, type, permission_code) VALUES
-- 一级菜单
('可视化大屏', '/dashboard', 'Monitor', '', 0, 1, 'menu', 'dashboard:view'),
('个人信息', '/profile', 'User', '', 0, 2, 'menu', 'profile:view'),
('系统管理', '', 'Settings', '', 0, 3, 'menu', 'system:view'),
-- 二级菜单（系统管理下）
('用户列表', '/users', 'Users', '', (SELECT id FROM (SELECT id FROM menus WHERE name='系统管理') AS m), 1, 'menu', 'user:list'),
('数据列表', '/data', 'Database', '', (SELECT id FROM (SELECT id FROM menus WHERE name='系统管理') AS m), 2, 'menu', 'data:list'),
-- 按钮权限
('创建用户', '', '', '', 0, 0, 'button', 'user:create'),
('编辑用户', '', '', '', 0, 0, 'button', 'user:edit'),
('删除用户', '', '', '', 0, 0, 'button', 'user:delete'),
('导出数据', '', '', '', 0, 0, 'button', 'data:export');

-- ============================================
-- 5. 配置角色-菜单权限
-- ============================================
-- admin: 所有菜单可见
INSERT INTO role_menus (role, menu_id)
SELECT 'admin', id FROM menus WHERE type = 'menu';

-- viewer: 仅看大屏和个人信息
INSERT INTO role_menus (role, menu_id)
SELECT 'viewer', id FROM menus WHERE name IN ('可视化大屏', '个人信息');

-- ============================================
-- 6. 配置角色-按钮权限
-- ============================================
-- admin: 所有按钮权限
INSERT INTO role_permissions (role, permission_code)
SELECT 'admin', permission_code FROM menus WHERE type = 'button' AND permission_code != '';

-- viewer: 无按钮权限（仅查看）
-- （不插入任何记录）

-- ============================================
-- 7. 验证数据
-- ============================================
SELECT '=== 菜单列表 ===' AS '';
SELECT id, name, path, icon, parent_id, sort_order, type, permission_code FROM menus ORDER BY sort_order;

SELECT '=== Admin 菜单权限 ===' AS '';
SELECT m.name, m.path FROM role_menus rm JOIN menus m ON rm.menu_id = m.id WHERE rm.role = 'admin' AND m.type = 'menu' ORDER BY m.sort_order;

SELECT '=== Viewer 菜单权限 ===' AS '';
SELECT m.name, m.path FROM role_menus rm JOIN menus m ON rm.menu_id = m.id WHERE rm.role = 'viewer' AND m.type = 'menu' ORDER BY m.sort_order;

SELECT '=== Admin 按钮权限 ===' AS '';
SELECT rp.permission_code FROM role_permissions rp WHERE rp.role = 'admin';
