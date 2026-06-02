# 智慧数据运营中心 — 数据可视化大屏系统

企业级数据可视化大屏系统，用于实时监控业务核心指标。支持多维度数据呈现、实时数据推送、自适应分辨率布局，适用于运维监控中心、业务指挥大厅等场景。

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.0 | 前端框架 (Composition API + `<script setup>`) |
| TypeScript | ^5.3.3 | 类型安全 |
| Vite 5 | ^5.1.4 | 构建工具 |
| Vue Router 4 | ^4.3.0 | 前端路由 (Hash 模式) |
| Pinia | ^2.1.7 | 状态管理 |
| ECharts 5 | ^5.5.0 | 可视化图表 |
| Vue-ECharts | ^6.6.9 | ECharts Vue 封装 |
| Axios | ^1.6.7 | HTTP 请求 |
| Socket.io-client | ^4.7.4 | 实时通信 |
| SCSS | ^1.71.1 | CSS 预处理器 |
| vuedraggable | ^4.1.0 | 拖拽排序 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | ^4.18.2 | Web 框架 |
| TypeScript | ^5.3.3 | 类型安全 |
| tsx | ^4.7.1 | TypeScript 热重载 |
| MySQL2 | ^3.9.1 | 数据库驱动 (连接池) |
| Socket.io | ^4.7.4 | WebSocket 实时推送 |
| jsonwebtoken | ^9.0.3 | JWT 身份认证 |
| bcryptjs | ^3.0.3 | 密码加密 |

### 数据库

- **MySQL 8+** (utf8mb4 字符集)

## 项目结构

```
data-dashboard/
├── client/                     # 前端项目
│   ├── src/
│   │   ├── components/         # 7 个可视化组件
│   │   │   ├── BarChart.vue    # 排名柱状图
│   │   │   ├── BorderBox.vue   # 装饰边框容器 (可拖拽)
│   │   │   ├── GaugeChart.vue  # 仪表盘
│   │   │   ├── KpiCard.vue     # KPI 指标卡
│   │   │   ├── MapChart.vue    # 中国地图
│   │   │   ├── PieChart.vue    # 饼图/环形图
│   │   │   └── TrendChart.vue  # 趋势折线图
│   │   ├── composables/        # 组合式函数
│   │   │   ├── useAutoScale.ts # 自适应缩放
│   │   │   └── useWebSocket.ts # WebSocket 管理
│   │   ├── directives/         # 自定义指令
│   │   ├── layout/             # 布局组件
│   │   ├── router/             # 路由配置 (动态路由)
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── authStore.ts    # 认证状态
│   │   │   ├── dataStore.ts    # 大屏数据
│   │   │   ├── permissionStore.ts # 权限状态
│   │   │   └── uiStore.ts      # UI 状态
│   │   ├── styles/             # 全局样式 (暗色科技风)
│   │   ├── types/              # TypeScript 类型
│   │   ├── utils/              # 工具函数
│   │   └── views/              # 页面组件
│   │       ├── Dashboard.vue   # 大屏总览 (核心页面)
│   │       ├── Login.vue       # 登录页
│   │       ├── profile/        # 个人信息页
│   │       ├── userList/       # 用户管理 (CRUD)
│   │       └── dataList/       # 数据列表 (CRUD)
│   ├── vite.config.ts          # Vite 配置
│   └── package.json
│
├── server/                     # 后端项目
│   ├── src/
│   │   ├── config/             # 数据库/服务器配置
│   │   ├── controllers/        # 控制器
│   │   ├── middleware/         # JWT 认证中间件
│   │   ├── routes/             # RESTful 路由
│   │   ├── services/
│   │   │   ├── dataService.ts      # MySQL 数据查询
│   │   │   └── mockDataService.ts  # 模拟数据生成器
│   │   ├── types/              # 类型定义
│   │   └── index.ts            # 服务端入口
│   ├── sql/                    # SQL 脚本
│   │   ├── init.sql            # 建库建表
│   │   ├── permissions.sql     # 权限表 + 菜单数据
│   │   ├── optimize.sql        # 索引 + 汇总表 + 触发器
│   │   ├── seed.sql            # 500 条种子数据
│   │   └── seed_10000.sql      # 10000 条大数据测试
│   ├── scripts/                # 初始化脚本
│   └── package.json
│
├── package.json                # 根配置 (并行启动脚本)
└── README.md
```

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8+
- npm 9+

### 1. 克隆项目

```bash
git clone https://github.com/your-username/data-dashboard.git
cd data-dashboard
```

### 2. 数据库初始化

```bash
# 登录 MySQL
mysql -u root -p

# 按顺序执行以下 SQL 脚本 (在 mysql 命令行中执行)
source server/sql/init.sql
source server/sql/permissions.sql
source server/sql/optimize.sql
source server/sql/seed.sql

# 退出 mysql
exit
```

### 3. 初始化管理员账号

```bash
cd server
npx tsx scripts/init-auth.ts
cd ..
```

### 4. 安装依赖

```bash
# 根目录安装 (concurrently)
npm install

# 前端依赖
cd client && npm install && cd ..

# 后端依赖
cd server && npm install && cd ..
```

### 5. 配置环境变量

编辑 `server/.env` 文件，修改数据库配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=dashboard_db

# 服务器配置
SERVER_PORT=3001
CORS_ORIGIN=*

# JWT 配置
JWT_SECRET=dashboard_secret_key_2025
JWT_EXPIRES_IN=24h
```

### 6. 启动项目

```bash
# 同时启动前端和后端 (推荐)
npm run dev

# 或分别启动
npm run dev:client   # 前端 → http://localhost:5173
npm run dev:server   # 后端 → http://localhost:3001
```

### 7. 访问系统

打开浏览器访问 **http://localhost:5173**

默认登录账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 (全部权限) |
| viewer | admin123 | 访客 (仅查看大屏) |

## API 接口

| 方法 | 路径 | 认证 | 功能 |
|------|------|------|------|
| GET | `/api/dashboard/overview` | 否 | KPI 概览数据 |
| GET | `/api/dashboard/trend?range=24h\|7d` | 否 | 趋势数据 |
| GET | `/api/dashboard/ranking?region=` | 否 | 排行榜 |
| GET | `/api/dashboard/distribution?region=` | 否 | 分布占比 |
| GET | `/api/dashboard/map` | 否 | 地理分布 |
| GET | `/api/dashboard/region-detail?region=` | 否 | 地区详情 |
| GET | `/api/dashboard/orders?page=&pageSize=` | 否 | 订单列表 |
| POST | `/api/dashboard/orders` | 否 | 创建订单 |
| PUT | `/api/dashboard/orders/:id` | 否 | 更新订单 |
| DELETE | `/api/dashboard/orders/:id` | 否 | 删除订单 |
| POST | `/api/auth/login` | 否 | 用户登录 |
| GET | `/api/auth/profile` | 是 | 个人信息 |
| GET | `/api/permission/menus` | 是 | 菜单树 |
| GET | `/api/permission/permissions` | 是 | 按钮权限 |
| GET | `/api/user/list` | 是 | 用户列表 |
| POST | `/api/user` | 是 | 创建用户 |
| PUT | `/api/user/:id` | 是 | 更新用户 |
| DELETE | `/api/user/:id` | 是 | 删除用户 |
| WS | `/socket.io` | 否 | 实时推送 |

## 核心功能

### 大屏总览

- 自适应布局：基于 1920×1080 设计稿，`transform: scale()` 实现任意分辨率缩放
- KPI 指标卡：总销售额、订单量、活跃用户、转化率 (带数字滚动动画)
- 图表面板：趋势折线图、销售排行柱状图、品类分布饼图、中国地图、目标达成仪表盘
- 实时推送：WebSocket 每 5 秒更新一次数据

### 拖拽布局

图表面板支持鼠标拖拽排序：
- 上排 2 个面板 (趋势图、排行图) 可互换位置
- 下排 3 个面板 (饼图、地图、仪表盘) 可任意排序
- 排序结果自动保存到 localStorage，刷新后保持

### 权限控制

- 动态路由：登录后根据角色从后端获取菜单树
- 按钮级权限：通过 `v-permission` 指令控制
- 两种角色：管理员 (全部权限) / 访客 (仅查看)

### 数据管理

- 用户列表：分页查看、创建、编辑、删除 (关联数据自动清理)
- 数据列表：分页查看、创建订单、编辑、删除、CSV 导出

## 数据库表结构

| 表名 | 用途 |
|------|------|
| `users` | 用户表 (admin/viewer) |
| `orders` | 订单表 |
| `access_logs` | 访问日志表 |
| `regions` | 地区表 |
| `menus` | 菜单树 |
| `role_menus` | 角色菜单关联 |
| `role_permissions` | 角色权限关联 |
| `daily_summary` | 日汇总表 |
| `region_summary` | 地区汇总表 |
| `category_summary` | 品类汇总表 |
| `hourly_summary` | 小时级趋势表 |

## 样式主题

暗色科技风设计风格：

- **背景色**：深蓝/黑 (`#0a1628`, `#1a2332`)
- **强调色**：霓虹青 (`#00f0ff`)、科技蓝 (`#1890ff`)、霓虹紫 (`#7b61ff`)
- **字体**：数字使用等宽字体 DIN / Roboto Mono
- **动画**：扫描线、数字滚动、图表入场、脉冲光效

## 许可证

MIT
