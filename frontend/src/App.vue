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
<style></style>
