<template>
  <view class="setup-container" @touchstart.passive="onContainerTouch">
    <!-- 背景渐变光晕 -->
    <view class="bg-glow bg-glow-pink"></view>
    <view class="bg-glow bg-glow-purple"></view>

    <!-- 自定义固定顶部导航栏 -->
    <view class="fixed-nav-header" :style="{ height: (statusBarHeight + 44) + 'px' }">
      <view class="status-bar-fill" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-bar-content" :style="{ paddingRight: navBarPaddingRight + 'px' }">
        <view class="nav-left">
          <!-- 返回按钮：点击不保存任何设置直接返回主页 -->
          <view 
            v-if="canGoBack" 
            class="nav-back-btn" 
            @tap="handleBack" 
            hover-class="nav-btn-hover"
          >
            <text class="back-arrow">‹</text>
            <text class="back-label">返回</text>
          </view>
        </view>
        <view class="nav-center">
          <text class="nav-page-title">{{ isFirstTime ? '初始化经期' : '经期周期设置' }}</text>
        </view>
        <view class="nav-right"></view>
      </view>
    </view>
    <!-- 导航栏占位块 -->
    <view class="nav-bar-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <view class="content-card">
      <!-- 头部图标及标题 -->
      <view class="header-section">
        <view class="logo-wrapper">
          <image class="app-logo-img" src="/static/logo.png" mode="aspectFit" />
        </view>
        <text class="app-title">愈见</text>
        <text class="app-subtitle">{{ isFirstTime ? '你的专属女性生理期管理管家' : '调整你的生理周期与规律参数' }}</text>
      </view>

      <!-- 核心周期规律设置卡片 -->
      <view class="settings-card">
        <view class="card-title-bar">
          <text class="card-icon">🌸</text>
          <text class="card-title">生理周期规律</text>
        </view>

        <!-- 经期周期设置 -->
        <view class="setting-item">
          <view class="label-area">
            <text class="title-text">经期周期 (天)</text>
            <text class="desc-text">相邻两次月经第一天之间的平均天数</text>
          </view>
          <view class="counter-box">
            <view 
              class="btn-minus" 
              :class="{ disabled: cycle <= 20 }" 
              @tap="adjustCycle(-1)"
            >
              <text class="btn-symbol">-</text>
            </view>
            <text class="value-text">{{ cycle }}</text>
            <view 
              class="btn-plus" 
              :class="{ disabled: cycle >= 45 }" 
              @tap="adjustCycle(1)"
            >
              <text class="btn-symbol">+</text>
            </view>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 持续天数设置 -->
        <view class="setting-item">
          <view class="label-area">
            <text class="title-text">持续天数 (天)</text>
            <text class="desc-text">每次月经来潮持续出血液的平均天数</text>
          </view>
          <view class="counter-box">
            <view 
              class="btn-minus" 
              :class="{ disabled: duration <= 2 }" 
              @tap="adjustDuration(-1)"
            >
              <text class="btn-symbol">-</text>
            </view>
            <text class="value-text">{{ duration }}</text>
            <view 
              class="btn-plus" 
              :class="{ disabled: duration >= 15 }" 
              @tap="adjustDuration(1)"
            >
              <text class="btn-symbol">+</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 解释说明文案 -->
      <view class="tip-box">
        <text class="tip-icon">💡</text>
        <text class="tip-text">设置准确的经期周期和持续天数，愈见将为你智能预测未来的经期与排卵期。</text>
      </view>

      <!-- 底部操作按钮组 -->
      <view class="actions-group">
        <!-- 保存操作 -->
        <button class="btn-submit" @tap="handleSave" :loading="loading">
          {{ isFirstTime ? '开启愈见' : '保存经期设置' }}
        </button>

        <!-- 取消/放弃修改按钮：不保存直接返回上一页/首页 -->
        <button 
          v-if="canGoBack" 
          class="btn-cancel" 
          @tap="handleBack"
          hover-class="btn-cancel-hover"
        >
          <text class="btn-cancel-text">不保存，返回</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user';
import { audioService } from '../../utils/audio';

const userStore = useUserStore();

// 生理周期核心参数
const cycle = ref(28);
const duration = ref(5);
const isFirstTime = ref(true);
const loading = ref(false);

// 顶部自定义导航栏适配
const statusBarHeight = ref(20);
const navBarPaddingRight = ref(96);

// 是否允许返回
const canGoBack = computed(() => {
  // 1. 若当前页面栈深度大于 1，说明是从上一页导航进入，必须允许直接返回
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages && pages.length > 1) {
    return true;
  }
  // 2. 若非初次使用状态，允许返回
  if (!isFirstTime.value) {
    return true;
  }
  // 3. 检查本地是否有历史保存配置
  try {
    const local = uni.getStorageSync('user_config');
    if (local) {
      return true;
    }
  } catch (e) {}

  return false;
});

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

// 屏幕手势唤醒兜底（确保 iOS 环境无感解锁自动播放限制）
const onContainerTouch = () => {
  audioService.handleUserInteraction();
};

onLoad((options) => {
  // 1. 默认自动播放治愈背景音乐
  audioService.autoPlay();

  initNavLayout();

  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const hasHistoryPage = pages && pages.length > 1;

  if (options && options.mode === 'edit') {
    isFirstTime.value = false;
  } else if (hasHistoryPage) {
    isFirstTime.value = false;
  } else {
    isFirstTime.value = userStore.userConfig.isFirstTime ?? true;
  }

  // 载入已有周期参数
  cycle.value = userStore.userConfig.periodCycle || 28;
  duration.value = userStore.userConfig.periodDuration || 5;
});

onShow(() => {
  audioService.autoPlay();
});

const adjustCycle = (val: number) => {
  const target = cycle.value + val;
  if (target >= 20 && target <= 45) {
    cycle.value = target;
    audioService.playClickFeedback();
  }
};

const adjustDuration = (val: number) => {
  const target = duration.value + val;
  if (target >= 2 && target <= 15) {
    duration.value = target;
    audioService.playClickFeedback();
  }
};

const handleSave = async () => {
  loading.value = true;
  audioService.playClickFeedback();

  const success = await userStore.saveConfig(cycle.value, duration.value);
  loading.value = false;
  if (success) {
    uni.reLaunch({
      url: '/pages/index/index',
    });
  }
};

/**
 * 返回且不保存任何设置
 */
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
.setup-container {
  min-height: 100vh;
  background-color: #FFF8F8;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

// 顶部固定自定义导航栏
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

// 柔和毛玻璃光晕背景
.bg-glow {
  position: absolute;
  width: 500rpx;
  height: 500rpx;
  border-radius: 50%;
  filter: blur(160rpx);
  opacity: 0.15;
  z-index: 1;
  pointer-events: none;
  
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

.content-card {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 30rpx 40rpx 80rpx 40rpx;
  flex: 1;
  justify-content: center;
}

// 头部区域
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
  
  .logo-wrapper {
    width: 130rpx;
    height: 130rpx;
    background: linear-gradient(135deg, #FFF0F2 0%, #FFE3E6 100%);
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 30rpx rgba(255, 112, 136, 0.1);
    margin-bottom: 20rpx;
    
    .app-logo-img {
      width: 130rpx;
      height: 130rpx;
      border-radius: 32rpx;
      box-shadow: 0 10rpx 30rpx rgba(255, 112, 136, 0.15);
    }
  }
  
  .app-title {
    font-size: 46rpx;
    font-weight: 700;
    color: #2D2727;
    margin-bottom: 10rpx;
  }
  
  .app-subtitle {
    font-size: 26rpx;
    color: #8E8282;
    text-align: center;
  }
}

// 设置主卡片
.settings-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  border-radius: 44rpx;
  padding: 36rpx 40rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 112, 136, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.7);
  margin-bottom: 36rpx;

  .card-title-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .card-icon {
      font-size: 34rpx;
      margin-right: 12rpx;
    }

    .card-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #2D2727;
    }
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  
  .label-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 20rpx;
    
    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #2D2727;
      margin-bottom: 6rpx;
    }
    
    .desc-text {
      font-size: 24rpx;
      color: #9C8E8E;
      line-height: 1.4;
    }
  }
}

.divider {
  height: 1px;
  background-color: rgba(255, 112, 136, 0.1);
  margin: 26rpx 0;
}

// 计数器盒子
.counter-box {
  display: flex;
  align-items: center;
  background: #FFF0F1;
  padding: 8rpx;
  border-radius: 30rpx;
  
  .value-text {
    width: 80rpx;
    text-align: center;
    font-size: 36rpx;
    font-weight: 700;
    color: #FF5A79;
  }
  
  .btn-minus, .btn-plus {
    width: 64rpx;
    height: 64rpx;
    border-radius: 20rpx;
    background: #FFF;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 10rpx rgba(255, 112, 136, 0.08);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.9);
      background: #FFE3E6;
    }
    
    &.disabled {
      opacity: 0.4;
      pointer-events: none;
    }
    
    .btn-symbol {
      font-size: 38rpx;
      font-weight: 600;
      color: #FF5A79;
      line-height: 1;
    }
  }
}

// 提示盒子
.tip-box {
  display: flex;
  background: #FFF0F2;
  padding: 24rpx 30rpx;
  border-radius: 28rpx;
  align-items: flex-start;
  margin-bottom: 40rpx;
  border: 1px dashed rgba(255, 112, 136, 0.3);
  
  .tip-icon {
    font-size: 30rpx;
    margin-right: 14rpx;
    margin-top: 2rpx;
  }
  
  .tip-text {
    font-size: 24rpx;
    color: #FF5A79;
    line-height: 1.6;
    flex: 1;
  }
}

// 按钮组
.actions-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.btn-submit {
  width: 100%;
  height: 98rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #FF6F8B 0%, #FF4D6D 100%);
  color: #FFF;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(255, 77, 109, 0.3);
  border: none;
  transition: all 0.2s ease;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 6rpx 15rpx rgba(255, 77, 109, 0.2);
    opacity: 0.95;
  }
}

.btn-cancel {
  width: 100%;
  height: 96rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 112, 136, 0.22);
  margin-top: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 112, 136, 0.04);
  transition: all 0.2s ease;
  
  .btn-cancel-text {
    color: #7A6E6E;
    font-size: 30rpx;
    font-weight: 500;
  }
  
  &:active,
  &.btn-cancel-hover {
    background: #FFF0F2;
    border-color: rgba(255, 90, 121, 0.35);
    transform: translateY(2rpx);

    .btn-cancel-text {
      color: #FF5A79;
    }
  }
}
</style>
