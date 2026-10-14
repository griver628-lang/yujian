/**
 * 微信小程序「服务通知」订阅消息模板配置
 * 
 * 微信官方机制说明：
 * 1. 微信服务通知采用「订阅消息」机制，推送到用户的微信聊天列表 ->「服务通知」。
 * 2. 需在「微信公众平台 (mp.weixin.qq.com) -> 功能 -> 订阅消息 -> 我的模板」中选用模板，并复制模板 ID 填入下方。
 * 3. 推荐选用的官方公共模板关键词：
 *    - 每日打卡提醒：包含「提醒事项」、「打卡时间」、「温馨提示」等字段
 *    - 经期来潮提醒：包含「经期阶段」、「预计日期」、「关怀建议」等字段
 *    - 排卵期健康提醒：包含「周期状态」、「受孕几率」、「健康提示」等字段
 */

export const WECHAT_SUBSCRIBE_TEMPLATES = {
  // 1. 当天10点前未记录打卡提醒模板 ID
  DAILY_RECORD_TEMPLATE_ID: 'YnDZQ5IxfiDyLG5fx6xHFdD4czABRwzIwvyvmgiJ_uo',

  // 2. 经期来临暖心关怀模板 ID
  PERIOD_START_TEMPLATE_ID: 'pXM5zboE5ZM1wVKMU8y5hqFwVawgbZ3MkR1_RvIX8MI',

  // 3. 排卵期与排卵日关照提醒模板 ID
  OVULATION_TEMPLATE_ID: 'pR-25321EybQ2aIqaeilBkp8D9zaHsnafnzf_fcz_0M',
};

/**
 * 检查是否已配置真实的微信官方模板 ID
 */
export const hasConfiguredTemplateIds = (): boolean => {
  return (
    !!WECHAT_SUBSCRIBE_TEMPLATES.DAILY_RECORD_TEMPLATE_ID.trim() ||
    !!WECHAT_SUBSCRIBE_TEMPLATES.PERIOD_START_TEMPLATE_ID.trim() ||
    !!WECHAT_SUBSCRIBE_TEMPLATES.OVULATION_TEMPLATE_ID.trim()
  );
};

/**
 * 获取所有已配置的合法模板 ID 列表（一次最多请求 3 个）
 */
export const getActiveTemplateIds = (): string[] => {
  const ids: string[] = [];
  if (WECHAT_SUBSCRIBE_TEMPLATES.DAILY_RECORD_TEMPLATE_ID.trim()) {
    ids.push(WECHAT_SUBSCRIBE_TEMPLATES.DAILY_RECORD_TEMPLATE_ID.trim());
  }
  if (WECHAT_SUBSCRIBE_TEMPLATES.PERIOD_START_TEMPLATE_ID.trim()) {
    ids.push(WECHAT_SUBSCRIBE_TEMPLATES.PERIOD_START_TEMPLATE_ID.trim());
  }
  if (WECHAT_SUBSCRIBE_TEMPLATES.OVULATION_TEMPLATE_ID.trim()) {
    ids.push(WECHAT_SUBSCRIBE_TEMPLATES.OVULATION_TEMPLATE_ID.trim());
  }
  return ids.slice(0, 3);
};
