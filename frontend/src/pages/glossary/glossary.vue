<template>
  <view class="glossary-container">
    <view class="search-header">
      <text class="title">名词解释与科普</text>
      <text class="subtitle">帮你更好地理解身体所处的各个生理周期</text>
    </view>

    <!-- 名词列表 -->
    <view class="list-wrapper">
      <view 
        v-for="item in terms" 
        :key="item.id" 
        class="term-card" 
        @tap="goToDetail(item.id)"
      >
        <view class="card-left">
          <view class="color-badge" :style="{ backgroundColor: getColor(item.colorTag) }"></view>
          <view class="text-content">
            <text class="term-name">{{ item.name }}</text>
            <text class="term-brief">{{ item.brief }}</text>
          </view>
        </view>
        <view class="card-right">
          <text class="arrow">🧭</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { GlossaryTerm } from '../../types/index';
import { request } from '../../utils/request';
import { onLoad } from '@dcloudio/uni-app';

const terms = ref<GlossaryTerm[]>([]);

onLoad(async () => {
  try {
    const res = await request<GlossaryTerm[]>({
      url: '/glossary',
      method: 'GET',
    });
    terms.value = res.data;
  } catch (err) {
    // 降级兜底静态数据
    terms.value = [
      {
        id: '1',
        name: '月经期',
        brief: '子宫内膜脱落出血的时期，代表本次周期的开始。',
        colorTag: 'coral',
      },
      {
        id: '2',
        name: '预测经期',
        brief: '基于你设定的周期长度计算，预测的下一次经期日期范围。',
        colorTag: 'pink',
      },
      {
        id: '3',
        name: '排卵日',
        brief: '下一次月经前推14天为排卵日，是受孕可能性最高的一天。',
        colorTag: 'purple',
      },
      {
        id: '4',
        name: '排卵期',
        brief: '排卵日前5天到排卵日后1天，在这期间受孕几率极高。',
        colorTag: 'light-purple',
      }
    ];
  }
});

const getColor = (tag: string) => {
  switch (tag) {
    case 'coral': return '#FF7088';
    case 'pink': return '#FFB5C5';
    case 'purple': return '#8E44AD';
    case 'light-purple': return '#D2B4DE';
    default: return '#BDC3C7';
  }
};

const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/glossary/detail?id=${id}`,
  });
};
</script>

<style lang="scss">
.glossary-container {
  min-height: 100vh;
  background-color: #FFF8F8;
  padding: 40rpx;
  box-sizing: border-box;
}

.search-header {
  margin-bottom: 48rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: 600;
    color: #2D2727;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .subtitle {
    font-size: 26rpx;
    color: #8E8282;
  }
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.term-card {
  background: #FFF;
  border-radius: 36rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 24rpx rgba(255, 112, 136, 0.03);
  border: 1px solid rgba(255, 112, 136, 0.05);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    background-color: #FFF3F3;
  }
  
  .card-left {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 20rpx;
  }
  
  .color-badge {
    width: 24rpx;
    height: 80rpx;
    border-radius: 12rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }
  
  .text-content {
    display: flex;
    flex-direction: column;
  }
  
  .term-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #2D2727;
    margin-bottom: 6rpx;
  }
  
  .term-brief {
    font-size: 24rpx;
    color: #8E8282;
    line-height: 1.4;
  }
  
  .card-right {
    flex-shrink: 0;
    
    .arrow {
      font-size: 32rpx;
      color: #C0C0C0;
    }
  }
}
</style>
