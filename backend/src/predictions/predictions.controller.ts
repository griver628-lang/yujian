import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /** GET /api/v1/predictions */
  @Get()
  getPredictions(@Req() req: any) {
    return this.predictionsService.getPredictions(req.userId);
  }
}
