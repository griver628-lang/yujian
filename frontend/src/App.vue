<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { audioService } from "./utils/audio";

onLaunch(() => {
  console.log("App Launch");
  // 1. 初始化微信云环境
  // @ts-ignore
  if (typeof wx !== "undefined" && wx.cloud) {
    try {
      // @ts-ignore
      wx.cloud.init({
        env: "prod-d6gaj80107becb742",
        traceUser: true,
      });
    } catch (e) {
      console.warn("微信云托管初始化异常:", e);
    }
  }

  // 2. 默认自动播放治愈背景音乐 (遵照用户偏好，零延迟即时发声)
  audioService.autoPlay();
});

onShow(() => {
  console.log("App Show");
  // 切回前台时，若音乐开启且未在播放，恢复默认播放
  audioService.autoPlay();
});

onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* 全局重置盒模型，防止任何边框与内边距引起页面元素错位 */
page, view, text, swiper, swiper-item, scroll-view {
  box-sizing: border-box;
}
</style>
