import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { RecordsService } from './records.service';
import { SaveRecordDto } from './dto/save-record.dto';
import { MonthlyQueryDto } from './dto/monthly-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /** GET /api/v1/records/monthly */
  @Get('monthly')
  getMonthlyRecords(@Req() req: any, @Query() query: MonthlyQueryDto) {
    return this.recordsService.getMonthlyRecords(req.userId, query);
  }

  /** POST /api/v1/records */
  @Post()
  saveRecord(@Req() req: any, @Body() dto: SaveRecordDto) {
    return this.recordsService.saveRecord(req.userId, dto);
  }

  /** POST /api/v1/records/sync */
  @Post('sync')
  syncRecords(@Req() req: any, @Body('records') records: Partial<SaveRecordDto>[]) {
    return this.recordsService.syncRecords(req.userId, records);
  }
}
