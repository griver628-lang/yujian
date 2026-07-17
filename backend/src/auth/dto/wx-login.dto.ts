import { IsString, IsNotEmpty, Length } from 'class-validator';

export class WxLoginDto {
  @IsString()
  @IsNotEmpty({ message: '微信 code 不能为空' })
  @Length(1, 100)
  code: string;
}
