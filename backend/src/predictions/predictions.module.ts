import { Module } from '@nestjs/common';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
