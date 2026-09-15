<template>
  <view class="glossary-container">
    <view class="search-header">
      <view class="brand-header-title">
        <image class="glossary-brand-logo" src="/static/logo.png" mode="aspectFit" />
        <text class="title">名词解释与科普</text>
      </view>
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

const defaultTerms: GlossaryTerm[] = [
  {
    id: '1',
    name: '月经期',
    brief: '子宫内膜脱落出血的时期，标志着女性每个生理周期的正式开始。',
    colorTag: 'coral',
  },
  {
    name: '预测经期',
    id: '2',
    brief: '基于历史周期长度智能推算的下一次大姨妈来访区间，提前从容应对。',
    colorTag: 'pink',
  },
  {
    name: '卵泡期',
    id: '3',
    brief: '经期结束至排卵前的黄金生长期，卵泡逐渐成熟，机体活力充沛。',
    colorTag: 'green',
  },
  {
    name: '排卵期',
    id: '4',
    brief: '排卵日前5天至排卵日后1天，受孕几率极高的黄金受孕窗口。',
    colorTag: 'light-purple',
  },
  {
    name: '排卵日',
    id: '5',
    brief: '下次月经来潮前推约14天，成熟卵子排出卵巢的关键一天。',
    colorTag: 'purple',
  },
  {
    name: '黄体期',
    id: '6',
    brief: '排卵后到下一次经期来潮前，孕酮维持高水平，体温升高。',
    colorTag: 'orange',
  },
  {
    name: '经前综合征 (PMS)',
    id: '7',
    brief: '月经前7-10天反复出现的情绪波动、腹胀、胸胀等身心反应。',
    colorTag: 'gold',
  },
  {
    name: '基础体温 (BBT)',
    id: '8',
    brief: '晨起未进行任何活动时测得的最低体温，呈典型双相曲线。',
    colorTag: 'teal',
  },
  {
    name: '宫颈黏液 (白带)',
    id: '9',
    brief: '随激素呈周期性规律变化的阴道分泌物，女性健康的天然指示标。',
    colorTag: 'cyan',
  },
  {
    name: '安全期与科学避孕',
    id: '10',
    brief: '俗称“前七后八”，但失败率高达20%，不宜作为主要避孕手段。',
    colorTag: 'blue',
  },
];

const terms = ref<GlossaryTerm[]>(defaultTerms);

onLoad(async () => {
  try {
    const res = await request<GlossaryTerm[]>({
      url: '/glossary',
      method: 'GET',
    });
    if (res.data && res.data.length > 0) {
      terms.value = res.data;
    }
  } catch (err) {
    // 降级使用本地默认数据
    terms.value = defaultTerms;
  }
});

const getColor = (tag: string) => {
  switch (tag) {
    case 'coral': return '#FF7088';
    case 'pink': return '#FFB5C5';
    case 'green': return '#58D68D';
    case 'light-purple': return '#D2B4DE';
    case 'purple': return '#8E44AD';
    case 'orange': return '#FFA07A';
    case 'gold': return '#F39C12';
    case 'teal': return '#16A085';
    case 'cyan': return '#48CAE4';
    case 'blue': return '#5DADE2';
    default: return '#FF7088';
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
  
  .brand-header-title {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .glossary-brand-logo {
      width: 46rpx;
      height: 46rpx;
      border-radius: 14rpx;
      margin-right: 14rpx;
      box-shadow: 0 4rpx 10rpx rgba(255, 90, 121, 0.15);
    }

    .title {
      font-size: 40rpx;
      font-weight: 700;
      color: #2D2727;
    }
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
