export function getAdminHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>缓缓愈见 · 管理后台看板</title>
  <style>
    :root {
      --primary: #FF6B8B;
      --primary-light: #FFF0F3;
      --primary-dark: #E84370;
      --accent: #6C5CE7;
      --accent-light: #F0EDFF;
      --success: #10B981;
      --success-light: #ECFDF5;
      --warning: #F59E0B;
      --warning-light: #FEF3C7;
      --danger: #EF4444;
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --text: #1E293B;
      --text-muted: #64748B;
      --border: #E2E8F0;
      --radius-sm: 8px;
      --radius: 14px;
      --radius-lg: 20px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
      --shadow-hover: 0 20px 30px -10px rgba(0,0,0,0.08);
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* 顶部导航 */
    .navbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.92);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 12px rgba(255, 107, 139, 0.25);
    }
    .brand-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .brand-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--primary-light);
      color: var(--primary);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .env-tag {
      font-size: 12px;
      color: var(--success);
      background: var(--success-light);
      padding: 4px 10px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }
    .env-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn:hover {
      border-color: #CBD5E1;
      background: #F8FAFC;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border: none;
      box-shadow: 0 4px 12px rgba(255, 107, 139, 0.25);
    }
    .btn-primary:hover {
      box-shadow: 0 6px 16px rgba(255, 107, 139, 0.35);
      background: linear-gradient(135deg, #FF5277, #D82F5F);
    }
    .btn-sm {
      padding: 4px 10px;
      font-size: 12px;
    }

    /* 主内容区 */
    .main-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    /* 欢迎 Banner */
    .welcome-header {
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .welcome-title {
      font-size: 26px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 6px;
    }
    .welcome-desc {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* 4 个指标统计卡片 */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 22px 24px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      border-color: #CBD5E1;
    }
    .metric-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--card-accent, var(--primary));
    }
    .metric-card:nth-child(1) { --card-accent: #FF6B8B; }
    .metric-card:nth-child(2) { --card-accent: #10B981; }
    .metric-card:nth-child(3) { --card-accent: #6C5CE7; }
    .metric-card:nth-child(4) { --card-accent: #F59E0B; }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .metric-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .metric-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .metric-number-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.02em;
    }
    .metric-delta {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 6px;
      background: var(--success-light);
      color: var(--success);
    }
    .metric-footer {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
    }

    /* 趋势图表卡片 */
    .chart-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 24px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      margin-bottom: 32px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .chart-title {
      font-size: 16px;
      font-weight: 700;
      color: #0F172A;
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .svg-container {
      width: 100%;
      height: 180px;
      position: relative;
    }

    /* 用户列表区域 */
    .section-card {
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .section-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .filter-tabs {
      display: flex;
      background: #F1F5F9;
      padding: 4px;
      border-radius: var(--radius-sm);
      gap: 2px;
    }
    .tab-btn {
      border: none;
      background: transparent;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .tab-btn.active {
      background: #FFFFFF;
      color: var(--text);
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .filter-tools {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .search-input {
      padding: 8px 14px;
      font-size: 13px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      width: 240px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--primary);
    }

    /* 数据表格 */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    th {
      background: #F8FAFC;
      color: var(--text-muted);
      font-weight: 600;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    td {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      color: var(--text);
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background: #FAFBFD;
    }

    .user-id-box {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: #F1F5F9;
      padding: 3px 8px;
      border-radius: 6px;
      color: #334155;
    }
    .copy-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--text-muted);
      padding: 0 2px;
    }
    .copy-btn:hover { color: var(--primary); }

    /* 用户状态标签 */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-new {
      background: #FFF7ED;
      color: #EA580C;
      border: 1px solid #FFEDD5;
    }
    .badge-active {
      background: var(--success-light);
      color: #059669;
      border: 1px solid #A7F3D0;
    }
    .badge-established {
      background: var(--accent-light);
      color: var(--accent);
      border: 1px solid #DDD6FE;
    }
    .badge-dormant {
      background: #F1F5F9;
      color: #64748B;
      border: 1px solid #E2E8F0;
    }

    /* 分页控制器 */
    .pagination-bar {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      background: #FAFBFD;
    }
    .page-info {
      font-size: 13px;
      color: var(--text-muted);
    }
    .page-controls {
      display: flex;
      gap: 8px;
    }

    /* 弹窗抽屉 (User Details Modal) */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-overlay.show { display: flex; }
    .modal-box {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 680px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      animation: modalFadeIn 0.25s ease-out;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      background: #FFFFFF;
      z-index: 2;
    }
    .modal-title { font-size: 17px; font-weight: 700; color: #0F172A; }
    .modal-close {
      background: #F1F5F9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }
    .modal-close:hover { background: #E2E8F0; color: #0F172A; }
    .modal-body { padding: 24px; }

    .record-card {
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    .record-card:last-child { margin-bottom: 0; }
    .record-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .record-date { font-weight: 700; font-size: 14px; color: #0F172A; }
    .record-badges { display: flex; gap: 6px; }
    .record-details { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

    /* 鉴权密钥弹窗 */
    .auth-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }
    .auth-overlay.show { display: flex; }
    .auth-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 32px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);
      text-align: center;
    }
    .auth-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .auth-title { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
    .auth-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
    .auth-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      outline: none;
      margin-bottom: 16px;
      text-align: center;
      font-family: inherit;
    }
    .auth-input:focus { border-color: var(--primary); }

    /* 空状态与加载中 */
    .empty-state {
      padding: 48px 0;
      text-align: center;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 36px; margin-bottom: 10px; }

    /* 响应式调整 */
    @media (max-width: 1024px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .metrics-grid { grid-template-columns: 1fr; }
      .nav-container { padding: 0 16px; }
      .main-container { padding: 20px 16px 60px; }
      .section-header { flex-direction: column; align-items: stretch; }
      .filter-tabs { overflow-x: auto; }
      .search-input { width: 100%; }
    }
  </style>
</head>
<body>

  <!-- 顶部导航 -->
  <header class="navbar">
    <div class="nav-container">
      <div class="brand">
        <div class="brand-icon">🌸</div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="brand-title">缓缓愈见</span>
            <span class="brand-badge">管理后台</span>
          </div>
        </div>
      </div>
      <div class="nav-actions">
        <div class="env-tag">
          <span class="env-dot"></span>
          <span>云托管运行中</span>
        </div>
        <button class="btn" onclick="refreshAll()" title="刷新全部数据">
          <span>🔄 刷新</span>
        </button>
        <button class="btn btn-sm" onclick="promptChangeKey()" title="修改管理密钥">
          <span>🔑 密钥设置</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 主体区域 -->
  <main class="main-container">
    <div class="welcome-header">
      <div>
        <h1 class="welcome-title">运营数据与用户看板</h1>
        <p class="welcome-desc">实时监控新用户增长、老用户留存及活跃打卡状态</p>
      </div>
      <div style="font-size: 12px; color: var(--text-muted);" id="last-updated-text">
        更新于: 刚刚
      </div>
    </div>

    <!-- 4 个核心数据指标卡片 -->
    <div class="metrics-grid">
      <!-- 卡片 1: 总注册用户 -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">总注册用户 (Users)</span>
          <div class="metric-icon" style="color: #FF6B8B; background: #FFF0F3;">👥</div>
        </div>
        <div class="metric-number-row">
          <span class="metric-value" id="val-total-users">-</span>
          <span class="metric-delta" id="val-today-new">+0 今日</span>
        </div>
        <div class="metric-footer">
          <span>近 7 天新增</span>
          <strong id="val-new-7d" style="color: var(--text);">- 人</strong>
        </div>
      </div>

      <!-- 卡片 2: 活跃用户概览 -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">活跃用户 (DAU / WAU)</span>
          <div class="metric-icon" style="color: #10B981; background: #ECFDF5;">⚡️</div>
        </div>
        <div class="metric-number-row">
          <span class="metric-value" id="val-today-active">-</span>
          <span class="metric-delta" style="background: #ECFDF5; color: #059669;" id="val-dau-rate">今日活跃</span>
        </div>
        <div class="metric-footer">
          <span>7日活跃 / 30日月活</span>
          <strong id="val-active-range" style="color: var(--text);">- / -</strong>
        </div>
      </div>

      <!-- 卡片 3: 新老用户结构 -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">用户结构 (新老划分)</span>
          <div class="metric-icon" style="color: #6C5CE7; background: #F0EDFF;">🌿</div>
        </div>
        <div class="metric-number-row">
          <span class="metric-value" id="val-established">-</span>
          <span class="metric-delta" style="background: #F0EDFF; color: #6C5CE7;">稳定老用户</span>
        </div>
        <div class="metric-footer">
          <span>沉睡预警 (>14天)</span>
          <strong id="val-dormant" style="color: #EF4444;">- 人</strong>
        </div>
      </div>

      <!-- 卡片 4: 记录与周期健康 -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">累计打卡记录 (Records)</span>
          <div class="metric-icon" style="color: #F59E0B; background: #FEF3C7;">📝</div>
        </div>
        <div class="metric-number-row">
          <span class="metric-value" id="val-total-records">-</span>
          <span class="metric-delta" style="background: #FEF3C7; color: #D97706;" id="val-today-records">+0 今日</span>
        </div>
        <div class="metric-footer">
          <span>平均生理周期</span>
          <strong id="val-avg-cycle" style="color: var(--text);">28天 / 5天经期</strong>
        </div>
      </div>
    </div>

    <!-- 近 14 天趋势图表 -->
    <div class="chart-card">
      <div class="chart-header">
        <span class="chart-title">近 14 天每日用户增长与打卡频次趋势</span>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background: #FF6B8B;"></span>
            <span>每日新增用户</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #6C5CE7;"></span>
            <span>每日打卡流水</span>
          </div>
        </div>
      </div>
      <div class="svg-container" id="trend-chart-container">
        <!-- SVG 动态绘制趋势图 -->
      </div>
    </div>

    <!-- 用户管理列表 -->
    <div class="section-card">
      <div class="section-header">
        <div class="filter-tabs">
          <button class="tab-btn active" onclick="switchFilter('all', this)">全部用户</button>
          <button class="tab-btn" onclick="switchFilter('new', this)">🌟 新用户 (&lt;7天)</button>
          <button class="tab-btn" onclick="switchFilter('active', this)">⚡️ 活跃用户</button>
          <button class="tab-btn" onclick="switchFilter('established', this)">🌿 稳定老用户</button>
          <button class="tab-btn" onclick="switchFilter('dormant', this)">💤 沉睡用户</button>
        </div>
        <div class="filter-tools">
          <input 
            type="text" 
            class="search-input" 
            id="search-input" 
            placeholder="搜索 OpenID..." 
            onkeydown="if(event.key==='Enter') doSearch()"
          />
          <button class="btn btn-primary btn-sm" onclick="doSearch()">搜索</button>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>用户标识 (OpenID)</th>
              <th>用户分类</th>
              <th>首次加入时间</th>
              <th>最后活跃时间</th>
              <th>累计访问</th>
              <th>周期设置</th>
              <th>打卡记录</th>
              <th style="text-align: right;">操作</th>
            </tr>
          </thead>
          <tbody id="user-table-body">
            <tr>
              <td colspan="8" class="empty-state">
                <div class="empty-icon">⏳</div>
                <div>正在加载用户数据...</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页栏 -->
      <div class="pagination-bar">
        <div class="page-info" id="pagination-info">显示第 1 - 20 条，共 0 条</div>
        <div class="page-controls">
          <button class="btn btn-sm" id="btn-prev" onclick="prevPage()">上一页</button>
          <button class="btn btn-sm" id="btn-next" onclick="nextPage()">下一页</button>
        </div>
      </div>
    </div>
  </main>

  <!-- 用户打卡记录详情抽屉/弹窗 -->
  <div class="modal-overlay" id="user-modal">
    <div class="modal-box">
      <div class="modal-header">
        <div>
          <div class="modal-title">用户打卡流水明细</div>
          <div style="font-size: 12px; color: var(--text-muted); font-family: monospace;" id="modal-userid">-</div>
        </div>
        <button class="modal-close" onclick="closeUserModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom: 18px; padding: 12px 16px; background: #F8FAFC; border-radius: 8px; font-size: 13px; display: flex; gap: 20px;" id="modal-config-summary">
          <!-- 周期配置汇总 -->
        </div>
        <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #0F172A;">最近 30 条生理记录</h4>
        <div id="modal-records-list">
          <!-- 记录列表 -->
        </div>
      </div>
    </div>
  </div>

  <!-- 管理员密钥验证弹窗 -->
  <div class="auth-overlay" id="auth-modal">
    <div class="auth-card">
      <div class="auth-icon">🔐</div>
      <h3 class="auth-title">管理员身份认证</h3>
      <p class="auth-desc">请输入管理员访问密钥以解锁管理后台看板数据</p>
      <input type="password" class="auth-input" id="admin-key-input" placeholder="请输入管理密钥 (默认: yujian2026)" />
      <button class="btn btn-primary" style="width: 100%; padding: 12px;" onclick="submitAuthKey()">
        确认进入后台
      </button>
    </div>
  </div>

  <script>
    let currentFilter = 'all';
    let currentPage = 1;
    let totalPages = 1;
    let currentSearch = '';
    const API_BASE = window.location.pathname.replace(/\/admin\/?$/, '') + '/admin/api';

    function getAdminKey() {
      return localStorage.getItem('yujian_admin_key') || 'yujian2026';
    }

    function setAdminKey(key) {
      localStorage.setItem('yujian_admin_key', key);
    }

    async function fetchWithKey(url, options = {}) {
      options.headers = {
        ...options.headers,
        'x-admin-key': getAdminKey(),
        'Content-Type': 'application/json'
      };
      const res = await fetch(url, options);
      if (res.status === 401) {
        document.getElementById('auth-modal').classList.add('show');
        throw new Error('Unauthorized');
      }
      const json = await res.json();
      return json.data || json;
    }

    async function submitAuthKey() {
      const input = document.getElementById('admin-key-input').value.trim();
      if (!input) return alert('请输入密钥');
      try {
        const res = await fetch(API_BASE + '/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': input },
          body: JSON.stringify({ key: input })
        });
        if (res.ok) {
          setAdminKey(input);
          document.getElementById('auth-modal').classList.remove('show');
          refreshAll();
        } else {
          alert('密钥错误，请重试');
        }
      } catch (e) {
        alert('验证失败: ' + e.message);
      }
    }

    function promptChangeKey() {
      const old = getAdminKey();
      const newKey = prompt('请输入新的管理密钥 (环境变量 ADMIN_KEY):', old);
      if (newKey) {
        setAdminKey(newKey);
        refreshAll();
      }
    }

    // 格式化相对时间
    function formatRelativeTime(dateStr) {
      if (!dateStr) return '暂无记录';
      const date = new Date(dateStr);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return '刚刚';
      if (diffSec < 3600) return Math.floor(diffSec / 60) + ' 分钟前';
      if (diffSec < 86400) return Math.floor(diffSec / 3600) + ' 小时前';
      if (diffSec < 86400 * 7) return Math.floor(diffSec / 86400) + ' 天前';
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    // 加载全局统计
    async function loadStats() {
      try {
        const stats = await fetchWithKey(API_BASE + '/stats');
        document.getElementById('val-total-users').innerText = stats.totalUsers || 0;
        document.getElementById('val-today-new').innerText = '+' + (stats.todayNewUsers || 0) + ' 今日';
        document.getElementById('val-new-7d').innerText = (stats.newUsers7d || 0) + ' 人';
        document.getElementById('val-today-active').innerText = stats.todayActiveUsers || 0;
        document.getElementById('val-active-range').innerText = (stats.activeUsers7d || 0) + ' / ' + (stats.activeUsers30d || 0);
        document.getElementById('val-established').innerText = stats.establishedUsers || 0;
        document.getElementById('val-dormant').innerText = (stats.dormantUsers || 0) + ' 人';
        document.getElementById('val-total-records').innerText = stats.totalRecords || 0;
        document.getElementById('val-today-records').innerText = '+' + (stats.todayRecords || 0) + ' 今日';
        document.getElementById('val-avg-cycle').innerText = (stats.avgPeriodCycle || 28) + '天周期 / ' + (stats.avgPeriodDuration || 5) + '天经期';

        renderTrendChart(stats.trend || []);
      } catch (e) {
        console.error('加载统计失败', e);
      }
    }

    // 绘制 14 天平滑趋势 SVG 图表
    function renderTrendChart(data) {
      const container = document.getElementById('trend-chart-container');
      if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无趋势数据</div>';
        return;
      }

      const w = container.clientWidth || 800;
      const h = 160;
      const padL = 40;
      const padR = 20;
      const padT = 20;
      const padB = 30;

      const maxVal = Math.max(1, ...data.map(d => Math.max(d.newUsers, d.records)));
      const stepX = (w - padL - padR) / (data.length - 1);

      let ptsNewUsers = '';
      let ptsRecords = '';
      let labelsHtml = '';

      data.forEach((d, i) => {
        const x = padL + i * stepX;
        const yNew = padT + (1 - d.newUsers / maxVal) * (h - padT - padB);
        const yRec = padT + (1 - d.records / maxVal) * (h - padT - padB);

        ptsNewUsers += (i === 0 ? 'M' : 'L') + x + ',' + yNew;
        ptsRecords += (i === 0 ? 'M' : 'L') + x + ',' + yRec;

        labelsHtml += '<text x="' + x + '" y="' + (h - 6) + '" text-anchor="middle" font-size="11" fill="#94A3B8">' + d.date + '</text>';
      });

      container.innerHTML = \`
        <svg width="100%" height="\${h}" viewBox="0 0 \${w} \${h}" style="overflow: visible;">
          <!-- 坐标基准线 -->
          <line x1="\${padL}" y1="\${h - padB}" x2="\${w - padR}" y2="\${h - padB}" stroke="#E2E8F0" stroke-dasharray="4"/>
          <line x1="\${padL}" y1="\${padT}" x2="\${w - padR}" y2="\${padT}" stroke="#E2E8F0" stroke-dasharray="4"/>
          <text x="\${padL - 8}" y="\${h - padB}" text-anchor="end" font-size="10" fill="#94A3B8">0</text>
          <text x="\${padL - 8}" y="\${padT + 4}" text-anchor="end" font-size="10" fill="#94A3B8">\${maxVal}</text>

          <!-- 折线 1: 新增用户 (粉色) -->
          <path d="\${ptsNewUsers}" fill="none" stroke="#FF6B8B" stroke-width="3" stroke-linecap="round"/>
          <!-- 折线 2: 打卡流水 (紫色) -->
          <path d="\${ptsRecords}" fill="none" stroke="#6C5CE7" stroke-width="3" stroke-linecap="round"/>

          \${labelsHtml}
        </svg>
      \`;
    }

    // 加载用户列表
    async function loadUsers() {
      const tbody = document.getElementById('user-table-body');
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-icon">⏳</div><div>正在加载数据...</div></td></tr>';

      try {
        const url = API_BASE + '/users?page=' + currentPage + '&pageSize=20&filter=' + currentFilter + '&search=' + encodeURIComponent(currentSearch);
        const data = await fetchWithKey(url);

        totalPages = data.totalPages || 1;
        document.getElementById('pagination-info').innerText = '显示第 ' + ((currentPage - 1) * 20 + 1) + ' - ' + Math.min(currentPage * 20, data.total) + ' 条，共 ' + data.total + ' 位用户';
        document.getElementById('btn-prev').disabled = currentPage <= 1;
        document.getElementById('btn-next').disabled = currentPage >= totalPages;

        if (!data.list || data.list.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-icon">🍃</div><div>没有匹配的用户数据</div></td></tr>';
          return;
        }

        let html = '';
        data.list.forEach(u => {
          const badgeClass = u.status === 'new' ? 'badge-new' : u.status === 'active' ? 'badge-active' : u.status === 'established' ? 'badge-established' : 'badge-dormant';
          const cycleText = u.isFirstTime ? '<span style="color:#94A3B8;">待首次配置</span>' : u.periodCycle + '天周期 / ' + u.periodDuration + '天经期';

          html += \`
            <tr>
              <td>
                <div class="user-id-box" title="\${u.userId}">
                  <span>\${u.maskedUserId}</span>
                  <button class="copy-btn" onclick="copyText('\${u.userId}')" title="复制完整 OpenID">📋</button>
                </div>
              </td>
              <td><span class="badge \${badgeClass}">\${u.statusLabel}</span></td>
              <td style="color:#475569; font-size:12px;">\${new Date(u.createdAt).toLocaleDateString('zh-CN')}</td>
              <td>
                <span style="font-weight:600; color:#1E293B;">\${formatRelativeTime(u.lastActiveAt)}</span>
              </td>
              <td><span style="font-weight:600;">\${u.visitCount || 1}</span> 次</td>
              <td>\${cycleText}</td>
              <td>
                <span style="font-weight:700; color:var(--primary);">\${u.recordCount}</span> 天
              </td>
              <td style="text-align: right;">
                <button class="btn btn-sm" onclick="showUserDetails('\${u.userId}')">🔍 历史明细</button>
              </td>
            </tr>
          \`;
        });
        tbody.innerHTML = html;
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-icon">⚠️</div><div>加载失败，请检查管理密钥</div></td></tr>';
      }
    }

    function switchFilter(filter, el) {
      currentFilter = filter;
      currentPage = 1;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      loadUsers();
    }

    function doSearch() {
      currentSearch = document.getElementById('search-input').value.trim();
      currentPage = 1;
      loadUsers();
    }

    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        loadUsers();
      }
    }

    function nextPage() {
      if (currentPage < totalPages) {
        currentPage++;
        loadUsers();
      }
    }

    async function showUserDetails(userId) {
      document.getElementById('modal-userid').innerText = 'OpenID: ' + userId;
      document.getElementById('user-modal').classList.add('show');
      const listEl = document.getElementById('modal-records-list');
      listEl.innerHTML = '<div class="empty-state">正在查询该用户的生理打卡数据...</div>';

      try {
        const data = await fetchWithKey(API_BASE + '/users/' + encodeURIComponent(userId) + '/records');
        const cfg = data.config;
        document.getElementById('modal-config-summary').innerHTML = \`
          <div><strong>平均周期:</strong> \${cfg ? cfg.periodCycle + ' 天' : '未设置'}</div>
          <div><strong>经期天数:</strong> \${cfg ? cfg.periodDuration + ' 天' : '未设置'}</div>
          <div><strong>累计打卡:</strong> \${data.totalRecords} 条记录</div>
        \`;

        if (!data.recentRecords || data.recentRecords.length === 0) {
          listEl.innerHTML = '<div class="empty-state">该用户尚未添加过任何生理记录</div>';
          return;
        }

        let rHtml = '';
        data.recentRecords.forEach(r => {
          const statusMap = { start: '🩸 经期开始', end: '✨ 经期结束', none: '日常记录' };
          const emotionIconMap = { happy: '😄 开心', normal: '😐 一般', unhappy: '😢 难过', annoyed: '😤 烦躁', irritable: '😡 易怒' };

          rHtml += \`
            <div class="record-card">
              <div class="record-head">
                <span class="record-date">\${r.date}</span>
                <div class="record-badges">
                  <span class="badge" style="background:#FFE4E6; color:#E11D48;">\${statusMap[r.menstrualStatus] || '无'}</span>
                  \${r.emotion ? '<span class="badge" style="background:#FEF3C7; color:#B45309;">' + (emotionIconMap[r.emotion] || r.emotion) + '</span>' : ''}
                </div>
              </div>
              <div class="record-details">
                \${r.flow ? '<strong>经量:</strong> ' + r.flow + ' ；' : ''}
                \${r.pain ? '<strong>痛感:</strong> ' + r.pain + ' ；' : ''}
                \${r.color ? '<strong>血色:</strong> ' + r.color + ' ；' : ''}
                \${r.basalTemperature ? '<strong>体温:</strong> ' + r.basalTemperature + '°C ；' : ''}
                \${r.weight ? '<strong>体重:</strong> ' + r.weight + '斤 ；' : ''}
                <div style="font-size:11px; color:#94A3B8; margin-top:4px;">提交时间: \${new Date(r.createdAt).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          \`;
        });
        listEl.innerHTML = rHtml;
      } catch (e) {
        listEl.innerHTML = '<div class="empty-state">加载详情失败: ' + e.message + '</div>';
      }
    }

    function closeUserModal() {
      document.getElementById('user-modal').classList.remove('show');
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制 OpenID: ' + text);
      }).catch(() => {
        prompt('请手动复制:', text);
      });
    }

    function refreshAll() {
      loadStats();
      loadUsers();
      document.getElementById('last-updated-text').innerText = '更新于: ' + new Date().toLocaleTimeString('zh-CN');
    }

    // 初始化运行
    window.addEventListener('DOMContentLoaded', () => {
      refreshAll();
    });
  </script>
</body>
</html>`;
}
