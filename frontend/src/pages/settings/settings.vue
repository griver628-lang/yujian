<template>
  <view class="settings-page-container">
    <!-- 背景柔和光晕 (采用独立固定层，避免破坏页面滚动边界) -->
    <view class="bg-glow-layer">
      <view class="bg-glow bg-glow-pink"></view>
      <view class="bg-glow bg-glow-purple"></view>
    </view>

    <!-- 自定义固定顶部导航栏 -->
    <view class="fixed-nav-header" :style="{ height: (statusBarHeight + 44) + 'px' }">
      <view class="status-bar-fill" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-bar-content" :style="{ paddingRight: navBarPaddingRight + 'px' }">
        <view class="nav-left">
          <!-- 返回按钮：随时随地平滑返回主页 -->
          <view class="nav-back-btn" @tap="handleBack" hover-class="nav-btn-hover">
            <text class="back-arrow">‹</text>
            <text class="back-label">返回</text>
          </view>
        </view>
        <view class="nav-center">
          <text class="nav-page-title">系统设置</text>
        </view>
        <view class="nav-right"></view>
      </view>
    </view>
    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <!-- 设置主体内容滚动区 -->
    <view class="settings-content-wrapper">
      <!-- 页面简短引导 -->
      <view class="settings-header-desc">
        <text class="main-title">偏好与提醒设置</text>
        <text class="sub-title">在这里管理你的每日背景音乐、操作音效与服务推送关怀</text>
      </view>

      <!-- 1. 背景音乐与音效设置卡片 -->
      <view class="settings-group-card">
        <view class="group-title-bar">
          <view class="title-left">
            <text class="title-icon">🎵</text>
            <text class="title-text">声音与治愈音乐</text>
          </view>
        </view>

        <!-- 每日背景音乐开关 -->
        <view class="setting-row">
          <view class="row-info">
            <text class="row-label">每日背景音乐</text>
            <text class="row-desc">每天随机精选播放适合生理期的自然白噪音与治愈轻音乐</text>
          </view>
          <switch 
            :checked="musicEnabled" 
            color="#FF5A79" 
            @change="onMusicSwitchChange" 
          />
        </view>

        <!-- 今日推荐音乐试听展示卡片 (开启音乐时显示) -->
        <view v-if="musicEnabled" class="today-music-banner">
          <view class="music-meta">
            <view class="badge-row">
              <text class="badge-tag">今日专属</text>
              <text class="music-category">{{ todayTrack.category }}</text>
            </view>
            <text class="music-title">《{{ todayTrack.title }}》</text>
            <text class="music-desc">{{ todayTrack.subtitle }}</text>
          </view>
          <view class="music-ctrl-btn" @tap="togglePreviewAudio" hover-class="btn-hover">
            <text class="ctrl-icon">{{ isPlayingMusic ? '⏸️' : '▶️' }}</text>
            <text class="ctrl-text">{{ isPlayingMusic ? '暂停' : '试听' }}</text>
          </view>
        </view>

        <view class="card-divider"></view>

        <!-- 触控操作音效开关 -->
        <view class="setting-row">
          <view class="row-info">
            <text class="row-label">操作微触感与音效</text>
            <text class="row-desc">打卡与修改数值时的轻柔反馈声音，关闭后全局静音</text>
          </view>
          <switch 
            :checked="soundEffectsEnabled" 
            color="#FF5A79" 
            @change="onSoundEffectsSwitchChange" 
          />
        </view>
      </view>

      <!-- 2. 服务通知与生理期关怀提醒设置卡片 -->
      <view class="settings-group-card">
        <view class="group-title-bar">
          <view class="title-left">
            <text class="title-icon">🔔</text>
            <text class="title-text">服务通知与关怀提醒</text>
          </view>
        </view>

        <!-- 服务通知总开关 -->
        <view class="setting-row">
          <view class="row-info">
            <text class="row-label">服务通知总开关</text>
            <text class="row-desc">接收经期来潮、排卵期及每日记录等微信服务通知与关心</text>
          </view>
          <switch 
            :checked="notificationEnabled" 
            color="#FF5A79" 
            @change="onNotificationSwitchChange" 
          />
        </view>

        <template v-if="notificationEnabled">
          <view class="card-divider"></view>

          <!-- 规则1：晚 10:00 前未记录则提醒，记录则不提醒 -->
          <view class="setting-row sub-row">
            <view class="row-info">
              <view class="label-with-tag">
                <text class="row-label">晚 10:00 前未记录提醒</text>
                <text class="tag-green">智能免打扰</text>
              </view>
              <text class="row-desc">当天 22:00 (10点) 前未进行身体记录则提醒；若已打卡记录则自动免打扰</text>
            </view>
            <switch 
              :checked="remindDailyRecord" 
              color="#FF5A79" 
              @change="onRemindDailyRecordChange" 
            />
          </view>

          <view class="card-divider"></view>

          <!-- 规则2：经期开始提醒与关心 -->
          <view class="setting-row sub-row">
            <view class="row-info">
              <view class="label-with-tag">
                <text class="row-label">经期开始提醒与关怀</text>
                <text class="tag-pink">暖心关怀</text>
              </view>
              <text class="row-desc">预测大姨妈到访首日或记录开始时，发送保暖避寒饮水提醒与体贴关照</text>
            </view>
            <switch 
              :checked="remindPeriodStart" 
              color="#FF5A79" 
              @change="onRemindPeriodStartChange" 
            />
          </view>

          <view class="card-divider"></view>

          <!-- 规则3：排卵期与排卵日关照 -->
          <view class="setting-row sub-row">
            <view class="row-info">
              <view class="label-with-tag">
                <text class="row-label">排卵期与排卵日健康提醒</text>
                <text class="tag-purple">受孕关照</text>
              </view>
              <text class="row-desc">预测进入排卵黄金期及排卵日当天，提示受孕几率、荷尔蒙分泌与身体变化</text>
            </view>
            <switch 
              :checked="remindOvulation" 
              color="#FF5A79" 
              @change="onRemindOvulationChange" 
            />
          </view>

          <!-- 微信订阅消息授权按钮 -->
          <view class="subscribe-action-box" @tap="handleRequestSubscribe" hover-class="btn-hover">
            <text class="subscribe-icon">📩</text>
            <text class="subscribe-text">授权微信订阅消息 (服务通知)</text>
          </view>

          <!-- 内部测试专用入口 (默认对普通用户完全隐藏，点击版本号5次才可开启) -->
          <view v-if="isDevMode" class="test-notice-btn-box" @tap="handleSendTestNotice" hover-class="btn-hover">
            <text class="test-icon">🧪</text>
            <text class="test-text">[内部调试] 发送一条测试微信服务通知</text>
          </view>
        </template>
      </view>

      <!-- 3. 生理周期参数入口项 (仅作为便捷跳转项，不在此处堆放复杂输入) -->
      <view class="settings-group-card">
        <view class="group-title-bar">
          <view class="title-left">
            <text class="title-icon">🌸</text>
            <text class="title-text">生理周期规律</text>
          </view>
        </view>

        <view class="setting-link-row" @tap="goToPeriodSetup" hover-class="link-hover">
          <view class="link-info">
            <text class="link-label">修改经期周期与持续天数</text>
            <text class="link-desc">当前设置：周期 {{ cycle }} 天 · 经期持续 {{ duration }} 天</text>
          </view>
          <text class="link-arrow">›</text>
        </view>
      </view>

      <!-- 4. 关于与说明卡片 -->
      <view class="settings-group-card about-card">
        <view class="about-header">
          <image class="about-logo" src="/static/logo.png" mode="aspectFit" />
          <view class="about-texts">
            <text class="about-name">愈见 · 女性生理期助手</text>
            <text class="about-ver" @tap="handleVersionTap">Version 1.2.0 · 守护每位女性的身心健康</text>
          </view>
        </view>
        <text class="about-tip">
          💡 愈见严格保护你的个人隐私数据，所有预测提醒算法均在本地结合医学规律运算，为你提供最懂你的温暖陪伴。
        </text>
      </view>

      <!-- 底部安全返回按钮 -->
      <view class="bottom-back-action">
        <button class="btn-return-home" @tap="handleBack">
          返回主界面
        </button>
      </view>
    </view>

    <!-- 微信服务通知真机效果高保真预览弹窗 -->
    <view v-if="showNoticePreviewModal" class="modal-overlay" @tap="showNoticePreviewModal = false">
      <view class="wechat-notice-card-modal" @tap.stop>
        <!-- 头部：微信官方服务通知风格卡头 -->
        <view class="wx-modal-header">
          <view class="wx-brand-left">
            <view class="wx-bell-icon">✉️</view>
            <view class="wx-title-col">
              <text class="wx-brand-name">服务通知</text>
              <text class="wx-app-name">愈见 · 女性生理期助手</text>
            </view>
          </view>
          <text class="wx-close-btn" @tap="showNoticePreviewModal = false">✕</text>
        </view>

        <!-- 卡片主体：真实还原微信聊天中的服务通知卡片 -->
        <view class="wx-card-body">
          <view class="wx-card-title-row">
            <text class="wx-card-title">今日身体打卡未记录提醒</text>
            <text class="wx-card-tag">未记录关怀</text>
          </view>
          <text class="wx-card-time">发送时间：今天 21:50</text>

          <view class="wx-card-divider"></view>

          <view class="wx-field-row">
            <text class="wx-field-label">关怀提醒：</text>
            <text class="wx-field-value">已接近晚间 10 点，今天还没记录身体状态哦~ 睡前花 10 秒打卡体征与经期，愈见为你精准护航。</text>
          </view>

          <view class="wx-field-row">
            <text class="wx-field-label">触发规则：</text>
            <text class="wx-field-value wx-highlight">晚 10:00 前未打卡则提醒，已记录则免打扰</text>
          </view>

          <view class="wx-field-row">
            <text class="wx-field-label">绑定模板：</text>
            <text class="wx-field-value wx-code">YnDZQ5IxfiDyLG5fx6xHFdD4czABRwzIwvyvmgiJ_uo</text>
          </view>

          <view class="wx-card-footer-tip" @tap="simulateNotificationDeepLink">
            <text class="footer-tip-text">进入小程序查看并记录</text>
            <text class="footer-arrow">›</text>
          </view>
        </view>

        <!-- 弹窗底部交互按钮 -->
        <view class="wx-modal-actions">
          <button class="btn-direct-link" @tap="simulateNotificationDeepLink">
            <text class="btn-icon">⚡</text>
            <text>模拟点击卡片：直达今日打卡</text>
          </button>
          <button class="btn-call-backend" @tap="sendRealBackendNotice">
            <text class="btn-icon">🚀</text>
            <text>调用后端云端真实下发</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user';
import { audioService } from '../../utils/audio';
import { notificationService } from '../../utils/notification';

const userStore = useUserStore();

// 导航栏安全高度
const statusBarHeight = ref(20);
const navBarPaddingRight = ref(96);

// 声音与治愈音乐状态
const musicEnabled = ref(true);
const soundEffectsEnabled = ref(true);
const isPlayingMusic = computed(() => audioService.isPlaying.value);
const todayTrack = computed(() => audioService.currentTrack.value);

// 服务通知状态
const notificationEnabled = ref(true);
const remindDailyRecord = ref(true);
const remindPeriodStart = ref(true);
const remindOvulation = ref(true);
const showNoticePreviewModal = ref(false);

// 开发者调试模式开关（默认对所有普通用户隐藏）
const isDevMode = ref(false);

// 经期周期参数预览
const cycle = computed(() => userStore.userConfig.periodCycle || 28);
const duration = computed(() => userStore.userConfig.periodDuration || 5);

// 初始化导航栏尺寸
const initNavLayout = () => {
  try {
    let sbHeight = 20;
    // @ts-ignore
    if (typeof wx !== 'undefined' && typeof wx.getWindowInfo === 'function') {
      // @ts-ignore
      sbHeight = wx.getWindowInfo().statusBarHeight || 20;
    } else if (typeof uni !== 'undefined' && typeof uni.getWindowInfo === 'function') {
      sbHeight = uni.getWindowInfo().statusBarHeight || 20;
    }
    statusBarHeight.value = sbHeight;

    let padRight = 96;
    // @ts-ignore
    const getMenu = (typeof uni !== 'undefined' && typeof uni.getMenuButtonBoundingClientRect === 'function')
      ? uni.getMenuButtonBoundingClientRect
      // @ts-ignore
      : (typeof wx !== 'undefined' && typeof wx.getMenuButtonBoundingClientRect === 'function' ? wx.getMenuButtonBoundingClientRect : null);

    if (getMenu) {
      const menuBtn = getMenu();
      const winInfo = (typeof uni !== 'undefined' && typeof uni.getWindowInfo === 'function')
        ? uni.getWindowInfo()
        // @ts-ignore
        : (typeof wx !== 'undefined' && typeof wx.getWindowInfo === 'function' ? wx.getWindowInfo() : null);
      const screenWidth = winInfo?.windowWidth || 375;
      if (menuBtn && menuBtn.left) {
        padRight = (screenWidth - menuBtn.left) + 8;
      }
    }
    navBarPaddingRight.value = Math.max(padRight, 80);
  } catch (e) {
    statusBarHeight.value = 20;
    navBarPaddingRight.value = 96;
  }
};

onLoad(() => {
  initNavLayout();
  syncCurrentSettings();
});

onShow(() => {
  syncCurrentSettings();
});

const syncCurrentSettings = () => {
  audioService.initSettings();
  notificationService.loadSettings();

  musicEnabled.value = audioService.musicEnabled.value;
  soundEffectsEnabled.value = audioService.soundEffectsEnabled.value;

  // 若音乐开启，保持或唤醒播放
  if (musicEnabled.value) {
    audioService.autoPlay();
  }

  notificationEnabled.value = notificationService.settings.value.enabled;
  remindDailyRecord.value = notificationService.settings.value.remindDailyRecord;
  remindPeriodStart.value = notificationService.settings.value.remindPeriodStart;
  remindOvulation.value = notificationService.settings.value.remindOvulation;
};

// 音乐总开关变更
const onMusicSwitchChange = (e: any) => {
  const val = e.detail.value;
  musicEnabled.value = val;
  audioService.setMusicEnabled(val);
  userStore.saveConfig(cycle.value, duration.value, { musicEnabled: val });
  audioService.playClickFeedback();
};

// 触控音效变更
const onSoundEffectsSwitchChange = (e: any) => {
  const val = e.detail.value;
  soundEffectsEnabled.value = val;
  audioService.setSoundEffectsEnabled(val);
  userStore.saveConfig(cycle.value, duration.value, { soundEffectsEnabled: val });
  audioService.playClickFeedback();
};

// 试听/暂停切换
const togglePreviewAudio = () => {
  audioService.togglePlay();
};

// 服务通知总开关变更
const onNotificationSwitchChange = (e: any) => {
  const val = e.detail.value;
  notificationEnabled.value = val;
  notificationService.saveSettings({ enabled: val });
  userStore.saveConfig(cycle.value, duration.value, { notificationEnabled: val });
  audioService.playClickFeedback();

  if (val) {
    handleRequestSubscribe();
  }
};

// 晚10点前未记录关怀开关
const onRemindDailyRecordChange = (e: any) => {
  const val = e.detail.value;
  remindDailyRecord.value = val;
  notificationService.saveSettings({ remindDailyRecord: val });
  userStore.saveConfig(cycle.value, duration.value, { remindDailyRecord: val });
  audioService.playClickFeedback();
};

// 经期来潮关怀开关
const onRemindPeriodStartChange = (e: any) => {
  const val = e.detail.value;
  remindPeriodStart.value = val;
  notificationService.saveSettings({ remindPeriodStart: val });
  userStore.saveConfig(cycle.value, duration.value, { remindPeriodStart: val });
  audioService.playClickFeedback();
};

// 排卵期关照开关
const onRemindOvulationChange = (e: any) => {
  const val = e.detail.value;
  remindOvulation.value = val;
  notificationService.saveSettings({ remindOvulation: val });
  userStore.saveConfig(cycle.value, duration.value, { remindOvulation: val });
  audioService.playClickFeedback();
};

// 调起微信订阅消息
const handleRequestSubscribe = async () => {
  await notificationService.requestSubscribeMessage();
};

// 打开测试微信服务通知预览弹窗
const handleSendTestNotice = () => {
  showNoticePreviewModal.value = true;
  audioService.playClickFeedback();
};

// 模拟点击卡片直达今日打卡
const simulateNotificationDeepLink = () => {
  showNoticePreviewModal.value = false;
  const today = new Date().toISOString().split('T')[0];
  uni.reLaunch({
    url: `/pages/index/index?from=notification&action=record&date=${today}`,
  });
};

// 调用后端云端真实下发
const sendRealBackendNotice = async () => {
  uni.showLoading({ title: '正在请求下发...' });
  try {
    const success = await notificationService.sendTestNotification();
    uni.hideLoading();
    if (success) {
      showNoticePreviewModal.value = false;
    }
  } catch (e) {
    uni.hideLoading();
  }
};

// 连续快速点击版本号 5 次开启/关闭开发者调试入口（普通用户无法误触）
let versionTapCount = 0;
let versionTapTimer: any = null;

const handleVersionTap = () => {
  versionTapCount++;
  clearTimeout(versionTapTimer);
  versionTapTimer = setTimeout(() => {
    versionTapCount = 0;
  }, 2000);

  if (versionTapCount >= 5) {
    isDevMode.value = !isDevMode.value;
    versionTapCount = 0;
    audioService.playClickFeedback();
    uni.showToast({
      title: isDevMode.value ? '已开启内部调试入口' : '已隐藏调试入口',
      icon: 'none',
    });
  }
};

// 跳转去修改经期周期
const goToPeriodSetup = () => {
  uni.navigateTo({
    url: '/pages/setup/setup?mode=edit',
  });
};

// 返回上一页
const handleBack = () => {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages && pages.length > 1) {
    uni.navigateBack({
      fail: () => {
        uni.reLaunch({
          url: '/pages/index/index',
        });
      },
    });
  } else {
    uni.reLaunch({
      url: '/pages/index/index',
    });
  }
};
</script>

<style lang="scss">
page {
  background-color: #FFF8F8;
  height: auto;
  min-height: 100%;
}

.settings-page-container {
  min-height: 100vh;
  background-color: #FFF8F8;
  position: relative;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

// 固定顶部导航栏
.fixed-nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background-color: rgba(255, 248, 248, 0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 112, 136, 0.08);
}

.status-bar-fill {
  width: 100%;
}

.nav-bar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28rpx;
  box-sizing: border-box;

  .nav-left {
    display: flex;
    align-items: center;
    min-width: 150rpx;
  }

  .nav-back-btn {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 112, 136, 0.22);
    border-radius: 32rpx;
    padding: 8rpx 20rpx 8rpx 14rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 112, 136, 0.06);
    transition: all 0.2s ease;

    .back-arrow {
      font-size: 38rpx;
      font-weight: 700;
      color: #FF5A79;
      line-height: 1;
      margin-right: 4rpx;
    }

    .back-label {
      font-size: 26rpx;
      font-weight: 600;
      color: #332B2B;
    }

    &:active,
    &.nav-btn-hover {
      background: #FFE8EC;
      border-color: rgba(255, 90, 121, 0.4);
      transform: scale(0.96);
    }
  }

  .nav-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-page-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #2D2727;
      letter-spacing: 1rpx;
    }
  }

  .nav-right {
    min-width: 150rpx;
  }
}

.nav-bar-placeholder {
  width: 100%;
  flex-shrink: 0;
}

// 柔和背景光晕独立层 (fixed 不参与页面滚动计算)
.bg-glow-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;

  .bg-glow {
    position: absolute;
    width: 500rpx;
    height: 500rpx;
    border-radius: 50%;
    filter: blur(160rpx);
    opacity: 0.15;
    
    &-pink {
      background-color: #FF7088;
      top: -100rpx;
      right: -100rpx;
    }
    
    &-purple {
      background-color: #A38EFF;
      bottom: -100rpx;
      left: -100rpx;
    }
  }
}

.settings-content-wrapper {
  position: relative;
  z-index: 2;
  padding: 30rpx 36rpx calc(80rpx + env(safe-area-inset-bottom)) 36rpx;
  box-sizing: border-box;
}

.settings-header-desc {
  display: flex;
  flex-direction: column;
  margin-bottom: 28rpx;

  .main-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #2D2727;
    margin-bottom: 6rpx;
  }

  .sub-title {
    font-size: 24rpx;
    color: #8E8282;
  }
}

// 设置卡片
.settings-group-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 40rpx;
  padding: 32rpx 36rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 112, 136, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 28rpx;

  .group-title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .title-left {
      display: flex;
      align-items: center;

      .title-icon {
        font-size: 34rpx;
        margin-right: 12rpx;
      }

      .title-text {
        font-size: 32rpx;
        font-weight: 700;
        color: #2D2727;
      }
    }
  }
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;

  &.sub-row {
    padding-left: 8rpx;
  }

  .row-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 20rpx;

    .label-with-tag {
      display: flex;
      align-items: center;
      margin-bottom: 6rpx;

      .tag-green {
        font-size: 20rpx;
        background: rgba(56, 161, 105, 0.12);
        color: #2F855A;
        padding: 2rpx 12rpx;
        border-radius: 12rpx;
        margin-left: 12rpx;
        font-weight: 600;
      }

      .tag-pink {
        font-size: 20rpx;
        background: rgba(255, 90, 121, 0.12);
        color: #FF5A79;
        padding: 2rpx 12rpx;
        border-radius: 12rpx;
        margin-left: 12rpx;
        font-weight: 600;
      }

      .tag-purple {
        font-size: 20rpx;
        background: rgba(163, 142, 255, 0.15);
        color: #7B61FF;
        padding: 2rpx 12rpx;
        border-radius: 12rpx;
        margin-left: 12rpx;
        font-weight: 600;
      }
    }

    .row-label {
      font-size: 30rpx;
      font-weight: 600;
      color: #2D2727;
      margin-bottom: 6rpx;
    }

    .row-desc {
      font-size: 24rpx;
      color: #9C8E8E;
      line-height: 1.45;
    }
  }
}

// 今日专属音乐试听卡片
.today-music-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFF2F4;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  margin: 12rpx 0 20rpx 0;
  border: 1px solid rgba(255, 90, 121, 0.16);

  .music-meta {
    display: flex;
    flex-direction: column;
    flex: 1;

    .badge-row {
      display: flex;
      align-items: center;
      margin-bottom: 4rpx;

      .badge-tag {
        font-size: 20rpx;
        color: #FF5A79;
        font-weight: 700;
        margin-right: 10rpx;
      }

      .music-category {
        font-size: 20rpx;
        color: #9C8E8E;
      }
    }

    .music-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #2D2727;
    }

    .music-desc {
      font-size: 22rpx;
      color: #9C8E8E;
      margin-top: 2rpx;
    }
  }

  .music-ctrl-btn {
    display: flex;
    align-items: center;
    background: #FFF;
    padding: 12rpx 22rpx;
    border-radius: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 90, 121, 0.12);

    .ctrl-icon {
      font-size: 24rpx;
      margin-right: 6rpx;
    }

    .ctrl-text {
      font-size: 24rpx;
      font-weight: 600;
      color: #FF5A79;
    }
  }
}

// 订阅授权按钮
.subscribe-action-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF5F6 0%, #FFE9ED 100%);
  border-radius: 24rpx;
  padding: 20rpx;
  margin-top: 20rpx;
  border: 1px dashed rgba(255, 90, 121, 0.35);

  .subscribe-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
  }

  .subscribe-text {
    font-size: 26rpx;
    font-weight: 600;
    color: #FF5A79;
  }

  &:active {
    opacity: 0.85;
  }
}

.test-notice-btn-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 16rpx;
  margin-top: 14rpx;
  border: 1px solid rgba(163, 142, 255, 0.25);

  .test-icon {
    font-size: 26rpx;
    margin-right: 8rpx;
  }

  .test-text {
    font-size: 24rpx;
    font-weight: 600;
    color: #7B61FF;
  }

  &:active {
    background: #F4F0FF;
  }
}

.card-divider {
  height: 1px;
  background-color: rgba(255, 112, 136, 0.08);
  margin: 16rpx 0;
}

// 跳转设置条目
.setting-link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;

  .link-info {
    display: flex;
    flex-direction: column;

    .link-label {
      font-size: 30rpx;
      font-weight: 600;
      color: #2D2727;
      margin-bottom: 4rpx;
    }

    .link-desc {
      font-size: 24rpx;
      color: #9C8E8E;
    }
  }

  .link-arrow {
    font-size: 38rpx;
    color: #C5BDBD;
    line-height: 1;
  }

  &:active {
    opacity: 0.7;
  }
}

// 关于软件卡片
.about-card {
  .about-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .about-logo {
      width: 68rpx;
      height: 68rpx;
      border-radius: 18rpx;
      margin-right: 16rpx;
    }

    .about-texts {
      display: flex;
      flex-direction: column;

      .about-name {
        font-size: 28rpx;
        font-weight: 700;
        color: #2D2727;
      }

      .about-ver {
        font-size: 22rpx;
        color: #9C8E8E;
      }
    }
  }

  .about-tip {
    font-size: 22rpx;
    color: #FF7088;
    line-height: 1.5;
  }
}

// 底部返回按钮
.bottom-back-action {
  margin-top: 10rpx;

  .btn-return-home {
    width: 100%;
    height: 96rpx;
    border-radius: 32rpx;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 112, 136, 0.22);
    box-shadow: 0 6rpx 20rpx rgba(255, 112, 136, 0.05);
    color: #5C5252;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      background: #FFF0F2;
      color: #FF5A79;
    }
  }
}

// 微信服务通知真机预览弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 12, 14, 0.55);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.wechat-notice-card-modal {
  width: 100%;
  max-width: 640rpx;
  background: #FFFFFF;
  border-radius: 40rpx;
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.22);
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.wx-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  background: #F7F9FA;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .wx-brand-left {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .wx-bell-icon {
      font-size: 32rpx;
      line-height: 1;
    }

    .wx-title-col {
      display: flex;
      flex-direction: column;

      .wx-brand-name {
        font-size: 26rpx;
        font-weight: 700;
        color: #1AAD19;
      }

      .wx-app-name {
        font-size: 20rpx;
        color: #8C8282;
      }
    }
  }

  .wx-close-btn {
    font-size: 36rpx;
    color: #9C8E8E;
    padding: 8rpx 16rpx;
    line-height: 1;
  }
}

.wx-card-body {
  padding: 32rpx;

  .wx-card-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8rpx;

    .wx-card-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #1A1818;
    }

    .wx-card-tag {
      font-size: 20rpx;
      font-weight: 600;
      color: #FF5A79;
      background: #FFE8ED;
      padding: 4rpx 14rpx;
      border-radius: 12rpx;
    }
  }

  .wx-card-time {
    font-size: 22rpx;
    color: #9C8E8E;
    display: block;
    margin-bottom: 20rpx;
  }

  .wx-card-divider {
    height: 1px;
    background: #F0EDED;
    margin-bottom: 20rpx;
  }

  .wx-field-row {
    display: flex;
    font-size: 24rpx;
    line-height: 1.5;
    margin-bottom: 16rpx;

    .wx-field-label {
      color: #8C8282;
      width: 140rpx;
      flex-shrink: 0;
    }

    .wx-field-value {
      color: #332D2D;
      flex: 1;

      &.wx-highlight {
        color: #E0355B;
        font-weight: 600;
      }

      &.wx-code {
        font-family: monospace;
        font-size: 20rpx;
        color: #6C5CE7;
        word-break: break-all;
      }
    }
  }

  .wx-card-footer-tip {
    margin-top: 24rpx;
    padding: 20rpx 24rpx;
    background: #F7F9FA;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #576B95;
    font-size: 24rpx;
    font-weight: 600;

    .footer-arrow {
      font-size: 28rpx;
    }

    &:active {
      background: #EDF0F2;
    }
  }
}

.wx-modal-actions {
  padding: 0 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .btn-direct-link {
    width: 100%;
    height: 88rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #FF5A79, #FF7E98);
    box-shadow: 0 10rpx 24rpx rgba(255, 90, 121, 0.35);
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    .btn-icon {
      font-size: 30rpx;
    }

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  .btn-call-backend {
    width: 100%;
    height: 80rpx;
    border-radius: 26rpx;
    background: #F2F5F8;
    color: #4A5568;
    font-size: 26rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;

    .btn-icon {
      font-size: 28rpx;
    }

    &:active {
      background: #E6EBF0;
    }
  }
}
</style>
