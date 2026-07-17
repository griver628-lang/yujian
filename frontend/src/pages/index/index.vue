<template>
  <view class="index-container">
    <!-- 自定义固定导航栏 (整合状态栏占位，防止滑动时内容穿透状态栏) -->
    <view class="fixed-nav-header" :style="{ height: (statusBarHeight + 44) + 'px' }">
      <view class="status-bar-fill" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-bar-content">
        <text class="nav-title">🌸 愈见</text>
        <view class="nav-action" @tap="goToSettings">
          <text class="nav-btn-icon">⚙️</text>
        </view>
      </view>
    </view>
    <view class="nav-bar-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <!-- 1. 顶部消息公告栏 (支持关闭) -->
    <view v-if="showMessage" class="notice-bar">
      <view class="notice-content">
        <text class="notice-icon">📢</text>
        <text class="notice-text">今日预测：身体状况良好，多喝温水，注意防寒保暖哦~</text>
      </view>
      <view class="notice-close" @tap="showMessage = false">
        <text class="close-symbol">×</text>
      </view>
    </view>

    <!-- 2. 日历控件区 -->
    <view class="calendar-card">
      <!-- 年月选择与快捷键 -->
      <view class="calendar-header">
        <picker mode="date" fields="month" :value="currentDateStr" @change="onDatePickerChange">
          <view class="date-selector">
            <text class="date-text">{{ currentYear }} 年 {{ currentMonth }} 月</text>
            <text class="arrow-down">▼</text>
          </view>
        </picker>
        <view v-if="!isTodayInView" class="back-today" @tap="goBackToToday">
          <text class="today-text">回今天</text>
        </view>
      </view>

      <!-- 星期标题 -->
      <view class="week-days">
        <view class="week-day" v-for="w in weeks" :key="w">{{ w }}</view>
      </view>

      <!-- 可滑动切换月份的日历网格 -->
      <swiper 
        class="calendar-swiper" 
        :current="swiperCurrent" 
        @change="onSwiperChange"
        circular
      >
        <swiper-item v-for="(monthPage, pageIdx) in calendarPages" :key="pageIdx">
          <view class="days-grid">
            <view 
              v-for="(day, dIdx) in monthPage.days" 
              :key="dIdx" 
              class="day-cell"
              :class="{
                'not-current-month': !day.isCurrentMonth,
                'is-today': day.isToday,
                'is-selected': selectedDate === day.dateString
              }"
              @tap="selectDay(day)"
            >
              <!-- 日期数值 -->
              <text class="day-num">{{ day.dayNumber }}</text>
              
              <!-- 生理期标记背景圈 -->
              <view 
                class="period-dot" 
                :class="day.periodType"
                v-if="day.periodType !== 'none'"
              ></view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 3. 颜色图例 (支持点击跳转名词解释) -->
    <view class="legends-box" @tap="goToGlossary">
      <view class="legend-item">
        <view class="legend-dot color-menstrual"></view>
        <text class="legend-label">月经期</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot color-predict"></view>
        <text class="legend-label">预测经期</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot color-ovulation-window"></view>
        <text class="legend-label">排卵期</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot color-ovulation-day"></view>
        <text class="legend-label">排卵日</text>
      </view>
      <text class="legend-tip-arrow">{{ glossaryLinkText }}</text>
    </view>

    <!-- 4. 设置信息展示卡 -->
    <view class="config-summary-card">
      <view class="summary-left">
        <text class="summary-title">我的生理周期设置</text>
        <text class="summary-desc">平均周期 {{ userStore.userConfig.periodCycle }} 天 / 经期 {{ userStore.userConfig.periodDuration }} 天</text>
      </view>
      <view class="btn-edit-config" @tap="goToSettings">
        <text class="btn-text">去修改</text>
      </view>
    </view>

    <!-- 5. 每日多维度记录面板 (固定展示在下方，方便点选日期即时记录) -->
    <view class="logging-panel">
      <view class="panel-header">
        <text class="panel-title">✏️ 每日身体健康记录</text>
        <text class="selected-date-indicator">{{ formattedSelectedDate }}</text>
      </view>

      <!-- A. 月经开关与闭环文案 -->
      <view class="log-row justify-between align-center card-row">
        <view class="row-label-group">
          <text class="row-label">{{ menstrualToggleText }}</text>
          <text class="row-sublabel">{{ menstrualStatusDesc }}</text>
        </view>
        <switch 
          :checked="hasMenstruation" 
          color="#FF5A79" 
          @change="toggleMenstrualStatus"
        />
      </view>

      <!-- 仅在开启月经标记或当天有记录时，展示经期专属的多维度记录 -->
      <block v-if="hasMenstruation">
        <!-- 经量记录 -->
        <view class="log-section">
          <text class="section-title">🩸 经量大小</text>
          <view class="icon-selector-grid">
            <view 
              v-for="item in flowOptions" 
              :key="item.value"
              class="icon-select-item"
              :class="{ active: currentRecord.flow === item.value }"
              @tap="currentRecord.flow = item.value"
            >
              <text class="emoji-icon">{{ item.icon }}</text>
              <text class="icon-name">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 痛经程度 -->
        <view class="log-section">
          <text class="section-title">⚡ 痛经程度</text>
          <view class="icon-selector-grid">
            <view 
              v-for="item in painOptions" 
              :key="item.value"
              class="icon-select-item"
              :class="{ active: currentRecord.pain === item.value }"
              @tap="currentRecord.pain = item.value"
            >
              <text class="emoji-icon">{{ item.icon }}</text>
              <text class="icon-name">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 经血颜色 -->
        <view class="log-section">
          <text class="section-title">🎨 经血颜色</text>
          <view class="color-selector-grid">
            <view 
              v-for="item in colorOptions" 
              :key="item.value"
              class="color-select-item"
              :class="{ active: currentRecord.color === item.value }"
              @tap="currentRecord.color = item.value"
            >
              <view class="color-circle" :style="{ backgroundColor: item.color }"></view>
              <text class="color-name">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 分泌物 -->
        <view class="log-section">
          <text class="section-title">💧 宫颈分泌物</text>
          <view class="tag-selector-grid">
            <view 
              v-for="item in dischargeOptions" 
              :key="item.value"
              class="tag-select-item"
              :class="{ active: currentRecord.discharge === item.value }"
              @tap="currentRecord.discharge = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>
      </block>

      <!-- 身体症状 (头部/胸部/全身) -->
      <view class="log-section">
        <text class="section-title">👤 身体症状 (多选)</text>
        
        <!-- 头部 -->
        <view class="symptom-subgroup">
          <text class="symptom-group-label">头部</text>
          <view class="tag-selector-grid">
            <view 
              v-for="item in headSymptoms" 
              :key="item.value"
              class="tag-select-item"
              :class="{ active: hasSymptom('head', item.value) }"
              @tap="toggleSymptom('head', item.value)"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 胸部 -->
        <view class="symptom-subgroup">
          <text class="symptom-group-label">胸部</text>
          <view class="tag-selector-grid">
            <view 
              v-for="item in breastSymptoms" 
              :key="item.value"
              class="tag-select-item"
              :class="{ active: hasSymptom('breast', item.value) }"
              @tap="toggleSymptom('breast', item.value)"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 全身 -->
        <view class="symptom-subgroup">
          <text class="symptom-group-label">全身</text>
          <view class="tag-selector-grid">
            <view 
              v-for="item in bodySymptoms" 
              :key="item.value"
              class="tag-select-item"
              :class="{ active: hasSymptom('body', item.value) }"
              @tap="toggleSymptom('body', item.value)"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 数值输入 (体温、体重) -->
      <view class="log-section">
        <text class="section-title">📊 生理数值测量</text>
        <view class="input-row-grid">
          <view class="input-card">
            <text class="input-label">基础体温</text>
            <view class="input-wrapper">
              <input 
                type="digit" 
                v-model="currentRecord.basalTemperature" 
                placeholder="0.0" 
                class="num-input" 
              />
              <text class="input-unit">°C</text>
            </view>
          </view>
          <view class="input-card">
            <text class="input-label">今日体重</text>
            <view class="input-wrapper">
              <input 
                type="digit" 
                v-model="currentRecord.weight" 
                placeholder="0.0" 
                class="num-input" 
              />
              <text class="input-unit">斤</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 情绪状态 -->
      <view class="log-section">
        <text class="section-title">🎭 情绪状态</text>
        <view class="icon-selector-grid">
          <view 
            v-for="item in emotionOptions" 
            :key="item.value"
            class="icon-select-item"
            :class="{ active: currentRecord.emotion === item.value }"
            @tap="currentRecord.emotion = item.value"
          >
            <text class="emoji-icon">{{ item.icon }}</text>
            <text class="icon-name">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 保存操作栏 -->
      <button class="btn-save-record" @tap="saveRecord">保存今日记录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUserStore } from '../../store/user';
import type { DailyRecord, FlowLevel, PainLevel, BloodColor, DischargeType, EmotionType, Symptoms } from '../../types/index';
import { onLoad, onShow } from '@dcloudio/uni-app';

const userStore = useUserStore();

// 强制绕过编译器静态优化的名词解释按钮文本
const glossaryLinkText = ref('📚 名词解释 >');

// 自定义导航栏相关
const statusBarHeight = ref(20);
onLoad(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
});

// 状态控制
const showMessage = ref(true);
const selectedDate = ref('');
const currentYear = ref(2026);
const currentMonth = ref(7);
const swiperCurrent = ref(1); // 默认显示当前月

// 数据枚举定义
const weeks = ['日', '一', '二', '三', '四', '五', '六'];

const flowOptions = [
  { value: 'micro' as FlowLevel, label: '极少', icon: '💧' },
  { value: 'light' as FlowLevel, label: '少', icon: '💧💧' },
  { value: 'medium' as FlowLevel, label: '中', icon: '🩸' },
  { value: 'heavy' as FlowLevel, label: '多', icon: '🩸🩸' },
  { value: 'extreme' as FlowLevel, label: '极多', icon: '🌊' }
];

const painOptions = [
  { value: 'none' as PainLevel, label: '完全不痛', icon: '☺️' },
  { value: 'mild' as PainLevel, label: '轻微痛', icon: '🥱' },
  { value: 'moderate' as PainLevel, label: '比较痛', icon: '🙁' },
  { value: 'severe' as PainLevel, label: '非常痛', icon: '😖' },
  { value: 'extreme' as PainLevel, label: '痛到极致', icon: '⚡' }
];

const colorOptions = [
  { value: 'light_red' as BloodColor, label: '浅红', color: '#FF7088' },
  { value: 'bright_red' as BloodColor, label: '鲜红', color: '#FF0000' },
  { value: 'deep_red' as BloodColor, label: '深红', color: '#B30000' },
  { value: 'dark_red' as BloodColor, label: '暗红', color: '#800020' },
  { value: 'black' as BloodColor, label: '黑色', color: '#2B2B2B' }
];

const dischargeOptions = [
  { value: 'none' as DischargeType, label: '无异味' },
  { value: 'dry' as DischargeType, label: '干燥' },
  { value: 'sticky' as DischargeType, label: '粘稠' },
  { value: 'pasty' as DischargeType, label: '稀糊状' },
  { value: 'watery' as DischargeType, label: '水状' },
  { value: 'egg_white' as DischargeType, label: '蛋清状' }
];

const headSymptoms = [
  { value: 'none', label: '无不适' },
  { value: 'headache', label: '头痛' },
  { value: 'dizziness', label: '眩晕' },
  { value: 'heavy_head', label: '昏沉' },
  { value: 'bloating_head', label: '发胀' }
];

const breastSymptoms = [
  { value: 'none', label: '无不适' },
  { value: 'swelling_pain', label: '胀痛' },
  { value: 'sharp_pain', label: '刺痛' },
  { value: 'hardening', label: '发硬' },
  { value: 'sagging', label: '下坠感' }
];

const bodySymptoms = [
  { value: 'none', label: '无不适' },
  { value: 'lumbago', label: '腰酸' },
  { value: 'backache', label: '背痛' },
  { value: 'bloating_abdomen', label: '腹胀' },
  { value: 'abdominal_pain', label: '腹痛' }
];

const emotionOptions = [
  { value: 'happy' as EmotionType, label: '开心', icon: '😄' },
  { value: 'normal' as EmotionType, label: '一般', icon: '😐' },
  { value: 'unhappy' as EmotionType, label: '不开心', icon: '😢' },
  { value: 'annoyed' as EmotionType, label: '烦躁', icon: '😤' },
  { value: 'irritable' as EmotionType, label: '易怒', icon: '😡' }
];

// 初始化单日空记录
const getEmptyRecord = (dateStr: string): DailyRecord => ({
  date: dateStr,
  menstrualStatus: 'none',
  symptoms: { head: [], breast: [], body: [] },
  basalTemperature: undefined,
  weight: undefined,
  emotion: undefined
});

const currentRecord = ref<DailyRecord>(getEmptyRecord(''));

// 登录验证及启动流程
onLoad(() => {
  // 立即同步初始化本地日历，防止网络延迟或接口报错导致日历显示空白
  const today = new Date();
  setYearMonth(today.getFullYear(), today.getMonth() + 1);
  selectedDate.value = formatDateString(today);
});

onShow(async () => {
  try {
    const isFirstTime = await userStore.wxLogin();
    if (isFirstTime) {
      uni.redirectTo({
        url: '/pages/setup/setup',
      });
    } else {
      // 加载当前设置
      await userStore.fetchConfig();
      // 获取最新云端生理记录并刷新日历标识
      await userStore.fetchMonthlyRecords(String(currentYear.value), String(currentMonth.value));
      generateCalendarSwiperPages(currentYear.value, currentMonth.value);
    }
  } catch (err) {
    console.error('初始化登录或加载数据失败，降级为本地离线显示', err);
  }
});

// 监听日期选中，同步加载记录
watch(selectedDate, async (newVal) => {
  if (!newVal) return;
  
  // 查找缓存
  const record = userStore.monthlyRecords.find(r => r.date === newVal);
  if (record) {
    currentRecord.value = JSON.parse(JSON.stringify(record));
  } else {
    currentRecord.value = getEmptyRecord(newVal);
  }
});

// 计算属性
const currentDateStr = computed(() => {
  const m = currentMonth.value < 10 ? `0${currentMonth.value}` : `${currentMonth.value}`;
  return `${currentYear.value}-${m}-01`;
});

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return '请选择日期';
  const parts = selectedDate.value.split('-');
  return `${parts[0]}年${parts[1]}月${parts[2]}日`;
});

const hasToday = (year: number, month: number) => {
  const today = new Date();
  return today.getFullYear() === year && (today.getMonth() + 1) === month;
};

const isTodayInView = computed(() => {
  return hasToday(currentYear.value, currentMonth.value);
});

// 闭环判断逻辑
const hasMenstruation = computed(() => {
  return currentRecord.value.menstrualStatus === 'start' || currentRecord.value.menstrualStatus === 'end';
});

const menstrualToggleText = computed(() => {
  return currentRecord.value.menstrualStatus === 'end' ? '月经走喽？' : '月经来喽？';
});

const menstrualStatusDesc = computed(() => {
  if (currentRecord.value.menstrualStatus === 'start') {
    return '（已标记今日大姨妈开始）';
  } else if (currentRecord.value.menstrualStatus === 'end') {
    return '（已标记今日经期正式结束）';
  }
  return '（未标记姨妈来访）';
});

// 状态切换开关
const toggleMenstrualStatus = (e: any) => {
  const checked = e.detail.value;
  if (!checked) {
    currentRecord.value.menstrualStatus = 'none';
  } else {
    // 闭环判断
    // 查找前面是否存在未关闭的“来喽”
    const activeStart = userStore.monthlyRecords.find(
      r => r.menstrualStatus === 'start' && r.date < selectedDate.value
    );
    // 查找 activeStart 后是否有结束
    const hasEndAfterStart = activeStart 
      ? userStore.monthlyRecords.some(r => r.menstrualStatus === 'end' && r.date >= activeStart.date && r.date < selectedDate.value)
      : false;

    if (activeStart && !hasEndAfterStart) {
      // 存在开始且没有结束，说明处于生理期内，开关自动变为“月经走喽”
      currentRecord.value.menstrualStatus = 'end';
    } else {
      // 不处于生理期内，开关表示月经来了
      currentRecord.value.menstrualStatus = 'start';
    }
  }
};

// 症状单选互斥与多选
const hasSymptom = (group: keyof Symptoms, val: string) => {
  return currentRecord.value.symptoms?.[group]?.includes(val) || false;
};

const toggleSymptom = (group: keyof Symptoms, val: string) => {
  if (!currentRecord.value.symptoms) {
    currentRecord.value.symptoms = { head: [], breast: [], body: [] };
  }
  const arr = currentRecord.value.symptoms[group];
  
  if (val === 'none') {
    // 互斥，选中无不适，清除其他
    currentRecord.value.symptoms[group] = ['none'];
  } else {
    // 清除“无不适”
    const noneIdx = arr.indexOf('none');
    if (noneIdx > -1) arr.splice(noneIdx, 1);
    
    const idx = arr.indexOf(val);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(val);
    }
  }
};

// 日历页生成算法
const calendarPages = ref<any[]>([]);

const setYearMonth = async (year: number, month: number) => {
  currentYear.value = year;
  currentMonth.value = month;
  
  // 1. 立即同步生成日历页面，保证日期数字立刻呈现
  generateCalendarSwiperPages(year, month);
  
  // 2. 异步拉取云端数据，获取后静默更新日历上的经期/排卵期色块
  try {
    await userStore.fetchMonthlyRecords(String(year), String(month));
    generateCalendarSwiperPages(year, month);
  } catch (err) {
    console.warn('获取云端生理数据失败，当前处于本地显示状态', err);
  }
};

const generateCalendarSwiperPages = (y: number, m: number) => {
  const pages = [];
  // 上个月
  const prevDate = new Date(y, m - 2, 1);
  pages.push({
    year: prevDate.getFullYear(),
    month: prevDate.getMonth() + 1,
    days: getMonthDays(prevDate.getFullYear(), prevDate.getMonth() + 1)
  });
  // 当前月
  pages.push({
    year: y,
    month: m,
    days: getMonthDays(y, m)
  });
  // 下个月
  const nextDate = new Date(y, m, 1);
  pages.push({
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() + 1,
    days: getMonthDays(nextDate.getFullYear(), nextDate.getMonth() + 1)
  });

  calendarPages.value = pages;
  swiperCurrent.value = 1; // 始终让Swiper归位在中间一页
};

const getMonthDays = (year: number, month: number) => {
  const days = [];
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();

  const todayStr = formatDateString(new Date());

  // 1. 填充前月尾巴
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateString = `${prevYear}-${padZero(prevMonth)}-${padZero(d)}`;
    days.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      periodType: getPeriodType(dateString)
    });
  }

  // 2. 填充当月
  for (let i = 1; i <= totalDays; i++) {
    const dateString = `${year}-${padZero(month)}-${padZero(i)}`;
    days.push({
      dayNumber: i,
      dateString,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      periodType: getPeriodType(dateString)
    });
  }

  // 3. 填充下月头部
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dateString = `${nextYear}-${padZero(nextMonth)}-${padZero(i)}`;
    days.push({
      dayNumber: i,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      periodType: getPeriodType(dateString)
    });
  }

  return days;
};

// 匹配预测或实际生理期的类型颜色
const getPeriodType = (dateStr: string) => {
  const record = userStore.monthlyRecords.find(r => r.date === dateStr);
  
  // A. 实际月经期 (珊瑚红)
  if (record && (record.menstrualStatus === 'start' || record.menstrualStatus === 'end')) {
    return 'type-menstrual';
  }
  
  // 模拟预测计算结果匹配（实际应根据后端 API /predictions 计算）
  // 此处做简单模拟展示，实际开发将以 api-predictions 返回的范围映射
  const day = parseInt(dateStr.split('-')[2]);
  if (day >= 1 && day <= 5) return 'type-menstrual'; // 经期示例
  if (day === 15) return 'type-ovulation-day';       // 排卵日示例
  if (day >= 10 && day <= 16) return 'type-ovulation-window'; // 排卵期示例

  return 'none';
};

// 事件处理器
const selectDay = (day: any) => {
  selectedDate.value = day.dateString;
  if (!day.isCurrentMonth) {
    const parts = day.dateString.split('-');
    setYearMonth(parseInt(parts[0]), parseInt(parts[1]));
  }
};

const onSwiperChange = (e: any) => {
  const index = e.detail.current;
  if (index === swiperCurrent.value) return;

  const targetPage = calendarPages.value[index];
  if (targetPage) {
    setYearMonth(targetPage.year, targetPage.month);
  }
};

const onDatePickerChange = (e: any) => {
  const val = e.detail.value; // YYYY-MM
  const parts = val.split('-');
  setYearMonth(parseInt(parts[0]), parseInt(parts[1]));
};

const goBackToToday = () => {
  const today = new Date();
  setYearMonth(today.getFullYear(), today.getMonth() + 1);
  selectedDate.value = formatDateString(today);
};

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/setup/setup?mode=edit',
  });
};

const goToGlossary = () => {
  uni.navigateTo({
    url: '/pages/glossary/glossary',
  });
};

const saveRecord = async () => {
  // 数据类型强转
  if (currentRecord.value.basalTemperature) {
    currentRecord.value.basalTemperature = parseFloat(String(currentRecord.value.basalTemperature));
  }
  if (currentRecord.value.weight) {
    currentRecord.value.weight = parseFloat(String(currentRecord.value.weight));
  }

  const success = await userStore.saveDailyRecord(currentRecord.value);
  if (success) {
    // 重新刷新当月日历的圆圈标记
    setYearMonth(currentYear.value, currentMonth.value);
  }
};

// 辅助方法
const padZero = (n: number) => n < 10 ? `0${n}` : `${n}`;
const formatDateString = (d: Date) => `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
</script>

<style lang="scss">
.index-container {
  min-height: 100vh;
  background-color: #FFF9F9;
  padding-bottom: 60rpx;
}

.fixed-nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background-color: #FFF9F9; /* 设为与页面背景相同的实色，防止内容滚动时穿透 */
  border-bottom: 1px solid rgba(255, 112, 136, 0.05);
}

.status-bar-fill {
  width: 100%;
}

.nav-bar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  box-sizing: border-box;

  .nav-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #2D2727;
  }
  
  .nav-btn-icon {
    font-size: 38rpx;
  }
}

.nav-bar-placeholder {
  width: 100%;
}

// 顶部消息通知
.notice-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFF0F2;
  margin: 20rpx 40rpx;
  padding: 20rpx 30rpx;
  border-radius: 24rpx;
  border: 1px solid rgba(255, 112, 136, 0.08);
  
  .notice-content {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 16rpx;
  }
  
  .notice-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
  }
  
  .notice-text {
    font-size: 24rpx;
    color: #FF5A79;
    line-height: 1.4;
  }
  
  .notice-close {
    font-size: 36rpx;
    color: #FF8F9B;
    line-height: 1;
    padding: 0 10rpx;
  }
}

// 日历卡片
.calendar-card {
  background: #FFF;
  margin: 0 40rpx 30rpx 40rpx;
  padding: 30rpx 20rpx;
  border-radius: 40rpx;
  box-shadow: 0 12rpx 36rpx rgba(255, 112, 136, 0.03);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx 24rpx 20rpx;
  
  .date-selector {
    display: flex;
    align-items: center;
    
    .date-text {
      font-size: 36rpx;
      font-weight: 700;
      color: #2D2727;
      margin-right: 12rpx;
    }
    .arrow-down {
      font-size: 18rpx;
      color: #FF5A79;
    }
  }
  
  .back-today {
    background: #FFF0F1;
    padding: 10rpx 24rpx;
    border-radius: 24rpx;
    
    .today-text {
      font-size: 24rpx;
      color: #FF5A79;
      font-weight: 600;
    }
  }
}

.week-days {
  display: flex;
  margin-bottom: 16rpx;
  
  .week-day {
    flex: 1;
    text-align: center;
    font-size: 24rpx;
    color: #A39696;
    font-weight: 600;
  }
}

.calendar-swiper {
  height: 480rpx;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.day-cell {
  width: 14.28%;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .day-num {
    font-size: 28rpx;
    font-weight: 600;
    color: #2D2727;
    z-index: 2;
  }
  
  &.not-current-month .day-num {
    color: #E0D3D3;
  }
  
  &.is-today {
    .day-num {
      color: #FF5A79;
    }
    &::after {
      content: '';
      position: absolute;
      width: 8rpx;
      height: 8rpx;
      background-color: #FF5A79;
      border-radius: 50%;
      bottom: 6rpx;
      z-index: 3;
    }
  }
  
  &.is-selected {
    border-radius: 20rpx;
    background-color: rgba(255, 90, 121, 0.08);
    border: 1px solid rgba(255, 90, 121, 0.2);
  }
  
  // 生理期标记圈样式
  .period-dot {
    position: absolute;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    z-index: 1;
    
    &.type-menstrual {
      background-color: rgba(255, 112, 136, 0.15);
      border: 1px dashed rgba(255, 112, 136, 0.4);
    }
    &.type-predict {
      background-color: rgba(255, 181, 197, 0.12);
      border: 1px dotted rgba(255, 181, 197, 0.5);
    }
    &.type-ovulation-window {
      background-color: rgba(142, 68, 173, 0.08);
      border: 1px dashed rgba(142, 68, 173, 0.25);
    }
    &.type-ovulation-day {
      background-color: rgba(142, 68, 173, 0.25);
      border: 2px solid #8E44AD;
    }
  }
}

// 颜色图例
.legends-box {
  display: flex;
  align-items: center;
  background: #FFF;
  margin: 0 40rpx 30rpx 40rpx;
  padding: 24rpx 30rpx;
  border-radius: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 112, 136, 0.02);
  
  .legend-item {
    display: flex;
    align-items: center;
    margin-right: 20rpx;
    
    .legend-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      margin-right: 8rpx;
    }
    
    .legend-label {
      font-size: 22rpx;
      color: #8E8282;
    }
  }
  
  .legend-tip-arrow {
    margin-left: auto;
    font-size: 22rpx;
    color: #FF5A79;
    font-weight: 600;
  }
}

.color-menstrual { background-color: #FF7088; }
.color-predict { background-color: #FFB5C5; }
.color-ovulation-window { background-color: #D2B4DE; }
.color-ovulation-day { background-color: #8E44AD; }

// 设置信息汇总卡
.config-summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #FFF5F6 0%, #FFE9EC 100%);
  margin: 0 40rpx 40rpx 40rpx;
  padding: 30rpx 40rpx;
  border-radius: 36rpx;
  border: 1px solid rgba(255, 112, 136, 0.1);
  
  .summary-left {
    display: flex;
    flex-direction: column;
    
    .summary-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #2D2727;
      margin-bottom: 6rpx;
    }
    .summary-desc {
      font-size: 22rpx;
      color: #8E8282;
    }
  }
  
  .btn-edit-config {
    background: #FFF;
    padding: 10rpx 28rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(255, 112, 136, 0.08);
    
    .btn-text {
      font-size: 24rpx;
      color: #FF5A79;
      font-weight: 600;
    }
  }
}

// 每日健康记录面板
.logging-panel {
  background: #FFF;
  margin: 0 40rpx;
  border-radius: 48rpx;
  padding: 40rpx;
  box-shadow: 0 -8rpx 36rpx rgba(0, 0, 0, 0.02);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
  border-left: 8rpx solid #FF5A79;
  padding-left: 16rpx;
  
  .panel-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #2D2727;
  }
  
  .selected-date-indicator {
    font-size: 26rpx;
    color: #FF5A79;
    font-weight: 600;
  }
}

.card-row {
  background: #FFF9FA;
  padding: 30rpx;
  border-radius: 30rpx;
  margin-bottom: 40rpx;
  border: 1px solid rgba(255, 112, 136, 0.05);
}

.row-label-group {
  display: flex;
  flex-direction: column;
}

.row-label {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D2727;
}

.row-sublabel {
  font-size: 22rpx;
  color: #FF8F9B;
  margin-top: 4rpx;
}

.log-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D2727;
  display: block;
  margin-bottom: 24rpx;
}

// 图标/表情单选网络
.icon-selector-grid {
  display: flex;
  gap: 16rpx;
}

.icon-select-item {
  flex: 1;
  background: #FFF9FA;
  border: 1px solid rgba(255, 112, 136, 0.05);
  border-radius: 24rpx;
  padding: 16rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  
  .emoji-icon {
    font-size: 38rpx;
    margin-bottom: 8rpx;
  }
  
  .icon-name {
    font-size: 20rpx;
    color: #8E8282;
  }
  
  &.active {
    background: #FFF0F2;
    border-color: #FF5A79;
    
    .icon-name {
      color: #FF5A79;
      font-weight: 600;
    }
  }
}

// 颜色网格
.color-selector-grid {
  display: flex;
  gap: 16rpx;
}

.color-select-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .color-circle {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-bottom: 8rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  }
  
  .color-name {
    font-size: 20rpx;
    color: #8E8282;
  }
  
  &.active {
    .color-circle {
      border: 3px solid #FFF;
      outline: 2px solid #FF5A79;
    }
    .color-name {
      color: #FF5A79;
      font-weight: 600;
    }
  }
}

// 标签网格 (多选/单选)
.tag-selector-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-select-item {
  background: #FFF9FA;
  border: 1px solid rgba(255, 112, 136, 0.05);
  border-radius: 20rpx;
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  color: #8E8282;
  
  &.active {
    background: #FFF0F2;
    border-color: #FF5A79;
    color: #FF5A79;
    font-weight: 600;
  }
}

// 症状二级分组
.symptom-subgroup {
  margin-top: 16rpx;
  
  .symptom-group-label {
    font-size: 24rpx;
    color: #A39696;
    margin-bottom: 12rpx;
    display: block;
    font-weight: 600;
  }
}

// 输入框网格
.input-row-grid {
  display: flex;
  gap: 30rpx;
}

.input-card {
  flex: 1;
  background: #FFF9FA;
  border-radius: 24rpx;
  padding: 20rpx;
  border: 1px solid rgba(255, 112, 136, 0.05);
  
  .input-label {
    font-size: 22rpx;
    color: #A39696;
    margin-bottom: 10rpx;
    display: block;
  }
  
  .input-wrapper {
    display: flex;
    align-items: center;
    
    .num-input {
      font-size: 36rpx;
      font-weight: 700;
      color: #2D2727;
      flex: 1;
    }
    
    .input-unit {
      font-size: 24rpx;
      color: #8E8282;
      margin-left: 8rpx;
    }
  }
}

// 保存按钮
.btn-save-record {
  width: 100%;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #FF6F8B 0%, #FF4D6D 100%);
  color: #FFF;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(255, 77, 109, 0.2);
  margin-top: 60rpx;
  border: none;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 10rpx rgba(255, 77, 109, 0.1);
  }
}

// 通用对齐
.log-row { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
