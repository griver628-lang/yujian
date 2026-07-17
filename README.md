# 🌸 经期助手全栈项目 (Menstrual Helper)

这是一个面向微信小程序生态的生理周期管理与健康助手全栈项目，包含以下核心模块：
*   **小程序前端 (`/frontend`)**：采用 `uni-app (Vue 3 + TS + Vite)` 开发。
*   **后端 API 服务 (`/backend`)**：采用 `NestJS (TypeScript + Prisma)` 开发，支持一键容器化部署至微信云托管。

---

## 📂 项目目录结构

```text
经期助手/
├── PRD.md                       # 产品需求文档
├── SYSTEM_DESIGN.md             # 系统架构设计 & 技术规范
├── API_AND_TESTS.md             # API 契约设计 & 核心算法单元测试用例
├── README.md                    # 本说明文件
│
├── frontend/                    # 小程序前端项目 (uni-app)
│   ├── src/
│   │   ├── pages/               # 页面 (index-首页, setup-设置, glossary-科普)
│   │   ├── store/               # Pinia 状态管理 (登录、设置、记录缓存)
│   │   ├── types/               # TypeScript 类型定义
│   │   └── utils/               # request.ts 请求工具封装 (支持云托管与标准HTTP)
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                     # 后端服务项目 (NestJS)
    ├── src/
    │   ├── auth/                # 微信静默登录与 JWT 授权守卫
    │   ├── user/                # 用户生理配置与 GDPR 重置
    │   ├── records/             # 每日记录 (含痛经、经量、体温等多维度及闭环校验)
    │   ├── predictions/         # 加权移动平均与不规则周期预测算法
    │   ├── glossary/            # 名词科普 & 管理后台 API
    │   ├── prisma/              # Prisma 数据库服务
    │   └── common/              # 全局响应拦截器与异常过滤器
    ├── prisma/
    │   └── schema.prisma        # PostgreSQL 数据库表结构定义
    ├── Dockerfile               # 微信云托管部署 Docker 容器配置
    ├── container.config.json    # 微信云托管实例缩容与配置规则
    ├── .env.example             # 环境变量配置模板
    └── package.json
```

---

## 🚀 快速启动指南

### 1. 小程序前端 (Client)
进入 `frontend` 目录安装依赖并开启开发监听：
```bash
cd frontend
npm install
npm run dev:mp-weixin
```
**预览方式**：
1. 打开 **微信开发者工具**。
2. 选择 **导入项目**，选中目录 `frontend/dist/dev/mp-weixin`。
3. 填入您的 AppID，即可在模拟器中进行预览与真机调试。

---

### 2. 后端服务 (Server)
进入 `backend` 目录安装依赖：
```bash
cd backend
npm install
```
**配置本地数据库**：
1. 复制 `.env.example` 为 `.env`。
2. 修改 `DATABASE_URL` 指向您的本地 PostgreSQL 数据库。
3. 生成数据库表结构：
   ```bash
   npx prisma db push
   ```
**启动运行**：
*   **开发模式**：`npm run start:dev`
*   **生产编译**：`npm run build`

---

## ☁️ 微信云托管 (WeChat Cloud Container) 一键部署

本项目后端已完全适配微信云托管一键部署，实现免域名、免备案、自动弹性缩容：

1.  **开通云托管**：登录微信公众平台，进入“腾讯微信云托管”开通服务。
2.  **绑定数据库**：在云托管控制台新建一个 PostgreSQL 数据库，并将其连接串填入云托管控制台的「环境变量」`DATABASE_URL` 中。
3.  **配置密钥**：在「环境变量」中添加 `JWT_SECRET`（设置一个随机高强度密钥）。
4.  **推送部署**：
    *   微信云托管支持直接绑定 GitHub/Gitee 仓库，或者直接上传代码包。
    *   部署时，云托管会自动识别并读取根目录下的 `Dockerfile` 和 `container.config.json` 进行全自动构建并发布。
    *   云托管部署完成后，在小程序 `frontend/src/utils/request.ts` 中，将 `USE_CLOUD_CONTAINER` 设为 `true` 并修改对应的云环境 ID 即可直接免域名调通！
