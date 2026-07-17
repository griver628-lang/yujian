import {
  IsString, IsDateString, IsOptional, IsNumber,
  IsIn, Min, Max, IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SymptomsDto {
  @IsOptional() head?: string[];
  @IsOptional() breast?: string[];
  @IsOptional() body?: string[];
}

export class SaveRecordDto {
  @IsDateString({}, { message: '日期格式必须为 YYYY-MM-DD' })
  date: string;

  @IsOptional()
  @IsIn(['none', 'start', 'end'], { message: '月经状态值不合法' })
  menstrualStatus?: string;

  @IsOptional()
  @IsIn(['none', 'micro', 'light', 'medium', 'heavy', 'extreme'], { message: '经量枚举值不合法' })
  flow?: string;

  @IsOptional()
  @IsIn(['none', 'mild', 'moderate', 'severe', 'extreme'], { message: '痛经枚举值不合法' })
  pain?: string;

  @IsOptional()
  @IsIn(['none', 'light_red', 'bright_red', 'deep_red', 'dark_red', 'black'], { message: '经血颜色枚举值不合法' })
  color?: string;

  @IsOptional()
  @IsIn(['none', 'dry', 'sticky', 'pasty', 'watery', 'egg_white'], { message: '分泌物枚举值不合法' })
  discharge?: string;

  @IsOptional()
  @IsObject()
  @Type(() => SymptomsDto)
  symptoms?: SymptomsDto;

  @IsOptional()
  @IsNumber({}, { message: '体温必须是数字' })
  @Min(35.0, { message: '体温数值异常，须在 35.0°C 至 42.0°C 之间' })
  @Max(42.0, { message: '体温数值异常，须在 35.0°C 至 42.0°C 之间' })
  basalTemperature?: number;

  @IsOptional()
  @IsNumber({}, { message: '体重必须是数字' })
  @Min(10, { message: '体重数值异常，须在 10 至 300 斤之间' })
  @Max(300, { message: '体重数值异常，须在 10 至 300 斤之间' })
  weight?: number;

  @IsOptional()
  @IsIn(['happy', 'normal', 'unhappy', 'annoyed', 'irritable'], { message: '情绪类型不匹配，请选择系统规定的情绪选项' })
  emotion?: string;

  @IsOptional()
  clientTimestamp?: number; // 用于离线同步冲突解决
}
