import { IsInt, Min, Max } from 'class-validator';

export class UpdateConfigDto {
  @IsInt({ message: '周期长度必须是整数' })
  @Min(20, { message: '生理周期不能小于 20 天' })
  @Max(45, { message: '生理周期不能超过 45 天' })
  periodCycle: number;

  @IsInt({ message: '经期天数必须是整数' })
  @Min(2, { message: '经期天数不能小于 2 天' })
  @Max(15, { message: '经期天数不能超过 15 天' })
  periodDuration: number;
}
