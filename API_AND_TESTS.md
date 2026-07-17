# 经期助手 API 接口规范与测试用例文档

本文档定义了“经期助手”全栈系统的 API 接口标准、数据字典以及核心业务逻辑（特别是预测算法和经期闭环状态机）的测试用例。

---

## 1. 全局 API 规范

*   **基准 URL (Base URL)**: `https://api.periodhelper.com/api/v1`
*   **请求与响应格式**: `application/json` (UTF-8)
*   **统一鉴权方式**:
    *   除 `POST /auth/wx-login` 外，所有接口均需在 Header 中携带 JWT Token：
        `Authorization: Bearer <JWT_TOKEN>`
*   **通用响应结构 (Common Response)**:
    ```json
    {
      "code": 200,      // 200-成功, 400-参数错误, 401-未授权, 403-无权限, 500-系统异常
      "message": "success",
      "data": null      // 具体业务返回数据
    }
    ```

---

## 2. API 接口契约

### 2.1 用户授权模块 (Authentication)

#### 2.1.1 微信小程序登录
*   **接口**: `POST /auth/wx-login`
*   **说明**: 客户端调用 `wx.login` 获取临时 `code` 后提交至后台换取 JWT 令牌。
*   **请求参数**:
    ```json
    {
      "code": "033xxxxxx22xxxx" // 微信临时登录凭证，必填
    }
    ```
*   **返回数据 (`data`)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 自定义 JWT 访问凭证
      "isFirstTime": false, // 是否为首次使用（若为 true，前端需重定向至首次配置页）
      "userConfig": {       // 用户基础设置（若已设置）
        "periodCycle": 28,
        "periodDuration": 5
      }
    }
    ```

---

### 2.2 用户设置模块 (User Config)

#### 2.2.1 获取用户配置
*   **接口**: `GET /user/config`
*   **返回数据 (`data`)**:
    ```json
    {
      "periodCycle": 28,
      "periodDuration": 5,
      "updatedAt": "2026-07-06T12:00:00.000Z"
    }
    ```

#### 2.2.2 修改/保存用户配置
*   **接口**: `PUT /user/config`
*   **请求参数**:
    ```json
    {
      "periodCycle": 30,     // 生理周期长度（值区间限制：20-45）
      "periodDuration": 6    // 每次经期持续天数（值区间限制：2-15）
    }
    ```
*   **返回数据**:
    ```json
    {
      "code": 200,
      "message": "配置更新成功",
      "data": {
        "periodCycle": 30,
        "periodDuration": 6
      }
    }
    ```

#### 2.2.3 重置/抹除用户所有生理数据 (GDPR 合规)
*   **接口**: `POST /user/reset`
*   **说明**: 清空用户在数据库中的所有生理记录和设置，使用户状态重回“首次使用”。
*   **返回数据**:
    ```json
    {
      "code": 200,
      "message": "所有数据已安全抹除，账号已重置"
    }
    ```

---

### 2.3 每日生理记录模块 (Daily Record)

#### 2.3.1 按月查询历史记录
*   **接口**: `GET /records/monthly`
*   **请求 Query 参数**:
    *   `year`: 年份（如 `2026`），必填
    *   `month`: 月份（如 `07`），必填
*   **返回数据 (`data`)**: 返回指定月份用户记录的数组。
    ```json
    [
      {
        "date": "2026-07-01",
        "menstrualStatus": "start", // "start"-月经来了, "end"-月经走了, "none"-无标记
        "flow": "medium",           // 经量
        "pain": "mild",             // 痛经程度
        "color": "bright_red",      // 颜色
        "discharge": "egg_white",   // 分泌物
        "symptoms": {
          "head": ["headache"],
          "breast": ["swelling_pain"],
          "body": ["backache"]
        },
        "basalTemperature": 36.5,
        "weight": 105.4,
        "emotion": "happy"
      }
      // ...其他有记录的日期数据
    ]
    ```

#### 2.3.2 保存/更新单日生理记录
*   **接口**: `POST /records`
*   **请求参数**:
    ```json
    {
      "date": "2026-07-06",         // 格式 YYYY-MM-DD，必填
      "menstrualStatus": "start",   // "start" | "end" | "none"，可选（触发闭环校验）
      "flow": "heavy",              // 可选，枚举见数据字典
      "pain": "severe",             // 可选，枚举见数据字典
      "color": "deep_red",          // 可选，枚举见数据字典
      "discharge": "sticky",        // 可选，枚举见数据字典
      "symptoms": {                 // 身体症状字典，可选
        "head": ["headache", "dizziness"],
        "breast": ["swelling_pain"],
        "body": ["abdominal_pain"]
      },
      "basalTemperature": 36.7,     // 可选，35.0 - 42.0 之间的浮点数
      "weight": 102.5,              // 可选，10.0 - 300.0 之间的浮点数
      "emotion": "annoyed"          // 可选，枚举见数据字典
    }
    ```
*   **常见错误返回**:
    *   若闭环校验失败（如在未结束的经期内重复提交 "start"）：
        `code: 400, message: "状态机异常：上一次月经尚未结束，请先标记走喽。"`

#### 2.3.3 离线增量批量同步
*   **接口**: `POST /records/sync`
*   **请求参数**:
    ```json
    {
      "records": [
        {
          "date": "2026-07-04",
          "menstrualStatus": "start",
          "clientTimestamp": 1783345890000 // 客户端记录时间，解决冲突
        },
        {
          "date": "2026-07-05",
          "flow": "medium",
          "clientTimestamp": 1783345910000
        }
      ]
    }
    ```
*   **返回数据**:
    ```json
    {
      "code": 200,
      "message": "同步成功",
      "syncedDates": ["2026-07-04", "2026-07-05"]
    }
    ```

---

### 2.4 生理期预测模块 (Predictions)

#### 2.4.1 获取未来预测日期
*   **接口**: `GET /predictions`
*   **说明**: 后端运行预测算法，返回下一次经期、排卵日和排卵期的预测时间范围。
*   **返回数据 (`data`)**:
    ```json
    {
      "nextPeriod": {
        "startDate": "2026-08-01",  // 预测开始日
        "endDate": "2026-08-05",    // 预测结束日
        "range": {                  // 若为不规则周期，返回不确定范围
          "startMin": "2026-07-30",
          "startMax": "2026-08-03"
        }
      },
      "ovulationDay": "2026-07-18", // 排卵日当天
      "ovulationWindow": {
        "startDate": "2026-07-13",  // 排卵期开始 (排卵日前 5 天)
        "endDate": "2026-07-19"     // 排卵期结束 (排卵日后 1 天)
      },
      "isIrregular": false          // 是否判定为不规则周期（用于前端决定是否渲染区间）
    }
    ```

---

### 2.5 名词科普与管理后台模块 (Glossary & Admin)

#### 2.5.1 获取名词科普列表
*   **接口**: `GET /glossary`
*   **返回数据 (`data`)**:
    ```json
    [
      {
        "id": "1",
        "name": "排卵期",
        "brief": "受孕几率较高的窗口期，一般在排卵日前5天至后1天。",
        "colorTag": "purple"
      },
      {
        "id": "2",
        "name": "黄体期",
        "brief": "排卵后至下一次月经开始前的时期，通常约为14天。",
        "colorTag": "yellow"
      }
    ]
    ```

#### 2.5.2 [管理后台专用] 创建或更新名词解释
*   **接口**: `POST /admin/glossary`
*   **请求参数**:
    ```json
    {
      "id": "1",                    // 传入 id 为修改，不传为新增
      "name": "排卵期",
      "brief": "科普缩略说明...",
      "content": "<h1>详细科普富文本HTML...</h1>",
      "colorTag": "purple"
    }
    ```

#### 2.5.3 [管理后台专用] 删除名词解释
*   **接口**: `DELETE /admin/glossary/:id`

---

## 3. 数据字典映射 (Data Dictionary)

为了保证数据库的高效存储与检索，多维度记录的所有文字标签在传输和数据库存储时应采用统一的**短字符串枚举值**：

### 3.1 生理指标维度
*   **经量 (`flow`)**:
    *   `none` (无) ｜ `micro` (极少) ｜ `light` (少) ｜ `medium` (中) ｜ `heavy` (多) ｜ `extreme` (极多)
*   **痛经程度 (`pain`)**:
    *   `none` (完全不痛) ｜ `mild` (轻微痛) ｜ `moderate` (比较痛) ｜ `severe` (非常痛) ｜ `extreme` (痛到极致)
*   **经血颜色 (`color`)**:
    *   `none` (无) ｜ `light_red` (浅红色) ｜ `bright_red` (鲜红色) ｜ `deep_red` (深红色) ｜ `dark_red` (暗红色) ｜ `black` (黑色)
*   **分泌物性状 (`discharge`)**:
    *   `none` (无异味) ｜ `dry` (干燥) ｜ `sticky` (粘稠) ｜ `pasty` (稀糊状) ｜ `watery` (水状) ｜ `egg_white` (蛋清状)

### 3.2 身体症状维度 (`symptoms`)
*   **头部症状 (`head`)**:
    *   `none` (无不适) ｜ `headache` (头痛) ｜ `dizziness` (眩晕) ｜ `heavy_head` (昏沉) ｜ `bloating_head` (发胀)
*   **胸部症状 (`breast`)**:
    *   `none` (无不适) ｜ `swelling_pain` (胀痛) ｜ `sharp_pain` (刺痛) ｜ `hardening` (发硬) ｜ `sagging` (下坠感)
*   **全身症状 (`body`)**:
    *   `none` (无不适) ｜ `lumbago` (腰酸) ｜ `backache` (背痛) ｜ `bloating_abdomen` (腹胀) ｜ `abdominal_pain` (腹痛)

### 3.3 情绪维度 (`emotion`)
*   `happy` (开心) ｜ `normal` (一般) ｜ `unhappy` (不开心) ｜ `annoyed` (烦躁) ｜ `irritable` (易怒)

---

## 4. 核心功能测试用例 (Test Cases)

### 4.1 经期闭环状态机测试 (Menstrual State Machine)

为实现月经来喽和走喽的闭环，业务层将用户当前状态分为两种：
*   **CLEARED**：不在经期。只允许发生 `start` (月经来了) 动作。
*   **IN_PERIOD**：处于经期中。只允许发生 `end` (月经走了) 动作。

#### 闭环状态转移矩阵：

| 当前状态 | 输入动作 | 目标状态 | 业务结果 | 备注 |
| --- | --- | --- | --- | --- |
| **CLEARED** | `start` | **IN_PERIOD** | 成功，记录经期开始日 | 正常流程开始 |
| **CLEARED** | `end` | **CLEARED** | 拦截，报错 400 | 未开始不可结束（防误操作） |
| **IN_PERIOD** | `end` | **CLEARED** | 成功，记录经期结束日 | 正常流程结束 |
| **IN_PERIOD** | `start` | **IN_PERIOD** | 拦截，提示自动补齐 | 重复开始，提示处理遗漏的结束日 |

#### 单元测试套件：`menstrual-state-machine.spec.ts` (基于 Jest 编写)
```typescript
import { MenstrualStateMachine, State, Action } from './menstrual-state-machine';

describe('经期闭环状态机单元测试', () => {
  let sm: MenstrualStateMachine;

  beforeEach(() => {
    sm = new MenstrualStateMachine();
  });

  test('用例 1.1: 初始状态为 CLEARED 时，标记月经开始应成功转移至 IN_PERIOD', () => {
    const result = sm.transition(State.CLEARED, Action.START, '2026-07-01');
    expect(result.nextState).toBe(State.IN_PERIOD);
    expect(result.success).toBe(true);
  });

  test('用例 1.2: 初始状态为 CLEARED 时，直接标记月经结束应报错拦截', () => {
    expect(() => {
      sm.transition(State.CLEARED, Action.END, '2026-07-01');
    }).toThrow('当前未处于经期中，无法标记月经结束');
  });

  test('用例 1.3: 处于 IN_PERIOD 状态时，标记月经结束应成功转移至 CLEARED', () => {
    const result = sm.transition(State.IN_PERIOD, Action.END, '2026-07-05');
    expect(result.nextState).toBe(State.CLEARED);
    expect(result.success).toBe(true);
  });

  test('用例 1.4: 处于 IN_PERIOD 状态时，再次标记月经开始应报错拦截', () => {
    expect(() => {
      sm.transition(State.IN_PERIOD, Action.START, '2026-07-06');
    }).toThrow('您上一次月经尚未结束，请先标记走喽');
  });

  test('用例 1.5: 异常处理 - 遗漏结束标记超过15天时自动纠正', () => {
    // 若距离上一次 start 过了 20 天仍未标记 end，尝试开启新经期时，系统应当自动在第5天补齐 end 状态
    const lastStart = '2026-06-10';
    const newStartAttempt = '2026-07-02';
    const autoCorrectedEnd = sm.autoPatchEnd(lastStart, newStartAttempt, 5);
    expect(autoCorrectedEnd).toBe('2026-06-14'); // 10 + 5 - 1 = 14
  });
});
```

---

### 4.2 预测算法测试用例 (Prediction Algorithm)

#### 单元测试套件：`prediction-algorithm.spec.ts` (基于 Jest 编写)
```typescript
import { predictNextPeriod } from './prediction-algorithm';

describe('生理周期预测算法单元测试', () => {

  test('用例 2.1: 仅有配置，无任何历史记录 (首次使用预测)', () => {
    const userConfig = { periodCycle: 28, periodDuration: 5 };
    const history: string[] = []; // 无历史月经开始日期
    const recentStart = '2026-07-01'; // 假设配置后当场记了一次月经来潮

    const prediction = predictNextPeriod(recentStart, history, userConfig);

    expect(prediction.nextPeriod.startDate).toBe('2026-07-29'); // 07-01 + 28 = 07-29
    expect(prediction.nextPeriod.endDate).toBe('2026-08-02');   // 07-29 + 5 - 1 = 08-02
    expect(prediction.ovulationDay).toBe('2026-07-15');          // 07-29 - 14 = 07-15
    expect(prediction.ovulationWindow.startDate).toBe('2026-07-10'); // 07-15 - 5 = 07-10
    expect(prediction.ovulationWindow.endDate).toBe('2026-07-16');   // 07-15 + 1 = 07-16
    expect(prediction.isIrregular).toBe(false);
  });

  test('用例 2.2: 规则历史周期计算 (历史3次周期均为30天)', () => {
    const userConfig = { periodCycle: 28, periodDuration: 5 };
    const history = ['2026-04-01', '2026-05-01', '2026-05-31']; // 两次间隔：30天，30天
    const recentStart = '2026-05-31';

    const prediction = predictNextPeriod(recentStart, history, userConfig);
    // 此时算法应基于历史的 30 天平均周期，而不是初始配置的 28 天
    expect(prediction.nextPeriod.startDate).toBe('2026-06-30'); // 05-31 + 30 = 06-30
  });

  test('用例 2.3: 不规则周期边界测试 (周期标准差大于3天，输出预测区间)', () => {
    const userConfig = { periodCycle: 28, periodDuration: 5 };
    // 历史开始日期：03-01 -> 04-02 (32天) -> 04-27 (25天) -> 05-27 (30天)
    const history = ['2026-03-01', '2026-04-02', '2026-04-27', '2026-05-27'];
    const recentStart = '2026-05-27';

    const prediction = predictNextPeriod(recentStart, history, userConfig);

    // 标准差大，isIrregular 应返回 true
    expect(prediction.isIrregular).toBe(true);
    // 应给出范围区间而不仅仅是一个确定日期
    expect(prediction.nextPeriod.range).toBeDefined();
    expect(new Date(prediction.nextPeriod.range!.startMin).getTime()).toBeLessThanOrEqual(new Date(prediction.nextPeriod.startDate).getTime());
    expect(new Date(prediction.nextPeriod.range!.startMax).getTime()).toBeGreaterThanOrEqual(new Date(prediction.nextPeriod.startDate).getTime());
  });

  test('用例 2.4: 算法防护 - 剔除大于60天的长期闭经异常值', () => {
    const userConfig = { periodCycle: 28, periodDuration: 5 };
    // 两次正常 28 天，中间出现一次因为怀孕/停经导致的 90 天超长间隔
    const history = ['2026-01-01', '2026-01-29', '2026-04-29', '2026-05-27']; // 间隔: 28, 90 (忽略), 28
    const recentStart = '2026-05-27';

    const prediction = predictNextPeriod(recentStart, history, userConfig);
    // 90天应当被算法自动剔除，预测依然基于 28 天计算
    expect(prediction.nextPeriod.startDate).toBe('2026-06-24'); // 05-27 + 28 = 06-24
  });
});
```

---

### 4.3 接口字段格式校验测试 (Request Validation Tests)

本部分用例测试控制器（Controllers）层基于 `class-validator` 管道对客户端输入数据的校验拦截情况：

| 测试字段 | 输入测试数据 | 预期校验结果 | 错误提示/异常拦截信息 |
| --- | --- | --- | --- |
| **周期参数 (`periodCycle`)** | `15` / `50` | **拦截 (400 Bad Request)** | `"生理周期必须在 20 - 45 天之间"` |
| **基础体温 (`basalTemperature`)** | `34.5` / `43.0` | **拦截 (400 Bad Request)** | `"体温数值异常，须在 35.0°C 至 42.0°C 之间"` |
| **体重 (`weight`)** | `-10` / `500` | **拦截 (400 Bad Request)** | `"体重数值异常，须在 10 至 300 斤之间"` |
| **单日日期 (`date`)** | `"2026/07/06"` / `"abc"` | **拦截 (400 Bad Request)** | `"日期格式必须为 YYYY-MM-DD"` |
| **情绪参数 (`emotion`)** | `"angry"` (不在枚举内) | **拦截 (400 Bad Request)** | `"情绪类型不匹配，请选择系统规定的情绪选项"` |
