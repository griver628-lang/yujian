import { IsNumberString, Length } from 'class-validator';

export class MonthlyQueryDto {
  @IsNumberString({}, { message: '年份格式不合法' })
  @Length(4, 4, { message: '年份必须是4位数字' })
  year: string;

  @IsNumberString({}, { message: '月份格式不合法' })
  @Length(1, 2, { message: '月份必须是1-2位数字' })
  month: string;
}
