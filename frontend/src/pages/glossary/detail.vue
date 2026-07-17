<template>
  <view class="detail-container">
    <view class="detail-card" v-if="term">
      <view class="title-area">
        <view class="badge" :style="{ backgroundColor: getColor(term.colorTag) }"></view>
        <text class="term-name">{{ term.name }}</text>
      </view>
      
      <view class="divider"></view>
      
      <view class="article-content">
        <!-- 富文本内容 -->
        <rich-text :nodes="term.content || defaultContent"></rich-text>
      </view>
    </view>
    
    <view class="loading-box" v-else>
      <text>内容加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { GlossaryTerm } from '../../types/index';
import { request } from '../../utils/request';
import { onLoad } from '@dcloudio/uni-app';

const term = ref<GlossaryTerm | null>(null);
const defaultContent = ref('<p>暂无详细科普数据，生理期健康需结合医生专业诊断建议。</p>');

onLoad(async (options) => {
  if (options && options.id) {
    try {
      const res = await request<GlossaryTerm>({
        url: `/glossary/${options.id}`,
        method: 'GET',
      });
      term.value = res.data;
    } catch (err) {
      // 降级兜底静态数据
      const staticDataMap: Record<string, GlossaryTerm> = {
        '1': {
          id: '1',
          name: '月经期',
          brief: '子宫内膜脱落出血的时期，代表本次周期的开始。',
          colorTag: 'coral',
          content: `
            <div style="font-size:15px; color:#555; line-height:1.8;">
              <p><b>月经期</b>，俗称“例假”或“大姨妈”，是指女性子宫内膜在卵巢激素影响下发生周期性脱落，并从阴道排出血液的过程。</p>
              <p style="margin-top:12px;"><b>💡 健康指南：</b></p>
              <ul>
                <li>建议每日用温水清洗外阴，保持干燥卫生。</li>
                <li>注意腹部保暖，避免饮用冰冷冷饮，以缓解平滑肌收缩引发的痛经。</li>
                <li>勤换卫生巾（建议每2-3小时更换一次），预防细菌滋生。</li>
              </ul>
            </div>
          `
        },
        '2': {
          id: '2',
          name: '预测经期',
          brief: '基于你设定的周期长度计算，预测的下一次经期日期范围。',
          colorTag: 'pink',
          content: `
            <div style="font-size:15px; color:#555; line-height:1.8;">
              <p><b>预测经期</b>是由算法基于你设定的“生理周期长度”与“历史经期第一天”进行推算得到的预计经期范围。</p>
              <p style="margin-top:12px;">如果你的生理周期极不规则（如标准差大于3天），预测区间会扩展显示为渐变的起止日期，提醒你防备大姨妈的突然造访。</p>
            </div>
          `
        },
        '3': {
          id: '3',
          name: '排卵日',
          brief: '下一次月经前推14天为排卵日，是受孕可能性最高的一天。',
          colorTag: 'purple',
          content: `
            <div style="font-size:15px; color:#555; line-height:1.8;">
              <p><b>排卵日</b>是指成熟卵子从卵巢中排出的当天。一般在下次月经来潮前的第14天左右，黄体期通常相对固定，长约为 14 天。</p>
              <p style="margin-top:12px;"><b>🥚 生理特征：</b></p>
              <ul>
                <li><b>白带变化</b>：分泌物呈现清亮、稀薄、拉丝度长（像生蛋清状）的特征。</li>
                <li><b>基础体温</b>：排卵日当天体温处于周期的最低点，排卵后体温会上升 0.3°C - 0.5°C 左右并维持到经前。</li>
              </ul>
            </div>
          `
        },
        '4': {
          id: '4',
          name: '排卵期',
          brief: '排卵日前5天到排卵日后1天，在这期间受孕几率极高。',
          colorTag: 'light-purple',
          content: `
            <div style="font-size:15px; color:#555; line-height:1.8;">
              <p><b>排卵期</b>（也称易孕期）是指卵子可能排出的时间段。一般指排卵日的前5天至排卵日后1天，包含排卵日当天，共约 7 天时间。</p>
              <p style="margin-top:12px;">在这段期间，由于卵子处于存活窗口（通常为12-24小时）且精子在女性体内可存活3-5天，因此同房受孕的几率非常高。</p>
            </div>
          `
        }
      };
      
      term.value = staticDataMap[options.id] || null;
    }
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
</script>

<style lang="scss">
.detail-container {
  min-height: 100vh;
  background-color: #FFF8F8;
  padding: 40rpx;
  box-sizing: border-box;
}

.detail-card {
  background: #FFF;
  border-radius: 48rpx;
  padding: 48rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 112, 136, 0.04);
  border: 1px solid rgba(255, 112, 136, 0.05);
}

.title-area {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  
  .badge {
    width: 16rpx;
    height: 48rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
  }
  
  .term-name {
    font-size: 38rpx;
    font-weight: 700;
    color: #2D2727;
  }
}

.divider {
  height: 1px;
  background-color: rgba(255, 112, 136, 0.1);
  margin-bottom: 40rpx;
}

.article-content {
  color: #555555;
  line-height: 1.8;
}

.loading-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  color: #8E8282;
  font-size: 28rpx;
}
</style>
