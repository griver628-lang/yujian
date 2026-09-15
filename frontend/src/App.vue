<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
  // 初始化微信云环境
  // @ts-ignore
  if (typeof wx !== "undefined" && wx.cloud) {
    // @ts-ignore
    wx.cloud.init({
      env: "prod-d6gaj80107becb742",
      traceUser: true,
    });
  }
});
onShow(() => {
  console.log("App Show");
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
