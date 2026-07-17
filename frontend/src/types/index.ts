// 首次配置及全局设置类型
export interface UserConfig {
  periodCycle: number;      // 周期长度，默认 28
  periodDuration: number;   // 经期持续天数，默认 5
  isFirstTime?: boolean;    // 是否首次配置
}

// 经期数据状态枚举
export type MenstrualStatus = 'none' | 'start' | 'end';

// 经量枚举
export type FlowLevel = 'none' | 'micro' | 'light' | 'medium' | 'heavy' | 'extreme';

// 痛经等级枚举
export type PainLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'extreme';

// 经血颜色枚举
export type BloodColor = 'none' | 'light_red' | 'bright_red' | 'deep_red' | 'dark_red' | 'black';

// 分泌物性状枚举
export type DischargeType = 'none' | 'dry' | 'sticky' | 'pasty' | 'watery' | 'egg_white';

// 情绪枚举
export type EmotionType = 'happy' | 'normal' | 'unhappy' | 'annoyed' | 'irritable';

// 身体症状细节
export interface Symptoms {
  head: string[];   // head: none, headache, dizziness, heavy_head, bloating_head
  breast: string[]; // breast: none, swelling_pain, sharp_pain, hardening, sagging
  body: string[];   // body: none, lumbago, backache, bloating_abdomen, abdominal_pain
}

// 每日生理多维度记录数据结构
export interface DailyRecord {
  date: string;              // 日期格式: YYYY-MM-DD
  menstrualStatus: MenstrualStatus;
  flow?: FlowLevel;
  pain?: PainLevel;
  color?: BloodColor;
  discharge?: DischargeType;
  symptoms?: Symptoms;
  basalTemperature?: number; // 基础体温 °C
  weight?: number;           // 体重 (斤)
  emotion?: EmotionType;
}

// 生理期预测返回值结构
export interface PredictionData {
  nextPeriod: {
    startDate: string;
    endDate: string;
    range?: {
      startMin: string;
      startMax: string;
    };
  };
  ovulationDay: string;
  ovulationWindow: {
    startDate: string;
    endDate: string;
  };
  isIrregular: boolean;
}

// 科普名词定义结构
export interface GlossaryTerm {
  id: string;
  name: string;
  brief: string;
  content?: string;
  colorTag: string;
}

// 统一 API 响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
