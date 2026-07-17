<template>
  <view class="setup-container">
    <!-- 背景渐变光晕 -->
    <view class="bg-glow bg-glow-pink"></view>
    <view class="bg-glow bg-glow-purple"></view>

    <view class="content-card">
      <!-- 头部图标及标题 -->
      <view class="header-section">
        <view class="logo-wrapper">
          <text class="heart-icon">🌸</text>
        </view>
        <text class="app-title">经期助手</text>
        <text class="app-subtitle">你的专属女性生理期管理管家</text>
      </view>

      <!-- 核心设置卡片 -->
      <view class="settings-card">
        <!-- 经期周期设置 -->
        <view class="setting-item">
          <view class="label-area">
            <text class="title-text">经期周期 (天)</text>
            <text class="desc-text">相邻两次月经第一天之间的天数</text>
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
            <text class="desc-text">每次月经来潮持续的平均天数</text>
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
        <text class="tip-text">设置经期周期和持续天数，将根据你的设置，为你预测下个月的经期日期</text>
      </view>

      <!-- 保存操作 -->
      <button class="btn-submit" @tap="handleSave" :loading="loading">
        {{ isFirstTime ? '开启经期助手' : '保存设置' }}
      </button>

      <!-- 取消按钮 (非首次配置时显示) -->
      <button 
        v-if="!isFirstTime" 
        class="btn-cancel" 
        @tap="handleBack"
      >
        取消修改
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const cycle = ref(28);
const duration = ref(5);
const isFirstTime = ref(true);
const loading = ref(false);

onLoad((options) => {
  isFirstTime.value = userStore.userConfig.isFirstTime ?? true;
  cycle.value = userStore.userConfig.periodCycle || 28;
  duration.value = userStore.userConfig.periodDuration || 5;
  
  if (options && options.mode === 'edit') {
    isFirstTime.value = false;
  }
});

const adjustCycle = (val: number) => {
  const target = cycle.value + val;
  if (target >= 20 && target <= 45) {
    cycle.value = target;
  }
};

const adjustDuration = (val: number) => {
  const target = duration.value + val;
  if (target >= 2 && target <= 15) {
    duration.value = target;
  }
};

const handleSave = async () => {
  loading.value = true;
  const success = await userStore.saveConfig(cycle.value, duration.value);
  loading.value = false;
  if (success) {
    uni.reLaunch({
      url: '/pages/index/index',
    });
  }
};

const handleBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss">
.setup-container {
  min-height: 100vh;
  background-color: #FFF8F8;
  position: relative;
  overflow: hidden;
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
}

// 头部区域
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .logo-wrapper {
    width: 140rpx;
    height: 140rpx;
    background: linear-gradient(135deg, #FFF0F2 0%, #FFE3E6 100%);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 30rpx rgba(255, 112, 136, 0.1);
    margin-bottom: 24rpx;
    
    .heart-icon {
      font-size: 70rpx;
    }
  }
  
  .app-title {
    font-size: 48rpx;
    font-weight: 600;
    color: #2D2727;
    margin-bottom: 12rpx;
  }
  
  .app-subtitle {
    font-size: 26rpx;
    color: #8E8282;
  }
}

// 设置主卡片
.settings-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 48rpx;
  padding: 40rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 112, 136, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.6);
  margin-bottom: 40rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  
  .label-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 20rpx;
    
    .title-text {
      font-size: 34rpx;
      font-weight: 600;
      color: #2D2727;
      margin-bottom: 8rpx;
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
  margin: 30rpx 0;
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
  border-radius: 30rpx;
  align-items: flex-start;
  margin-bottom: 60rpx;
  border: 1px dashed rgba(255, 112, 136, 0.3);
  
  .tip-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
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
.btn-submit {
  width: 100%;
  height: 100rpx;
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
  height: 100rpx;
  border-radius: 32rpx;
  background: transparent;
  color: #8E8282;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(142, 130, 130, 0.3);
  margin-top: 24rpx;
  
  &:active {
    background: rgba(142, 130, 130, 0.05);
  }
}
</style>
