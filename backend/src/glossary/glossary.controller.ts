import {
  Controller, Get, Post, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { GlossaryService, CreateGlossaryDto } from './glossary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/** 小程序端开放接口（无需鉴权） */
@Controller('glossary')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  /** GET /api/v1/glossary */
  @Get()
  findAll() {
    return this.glossaryService.findAll();
  }

  /** GET /api/v1/glossary/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.glossaryService.findOne(id);
  }
}

/** 管理后台专用接口（需要 JWT 鉴权） */
@UseGuards(JwtAuthGuard)
@Controller('admin/glossary')
export class AdminGlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  /** POST /api/v1/admin/glossary */
  @Post()
  upsert(@Body() dto: CreateGlossaryDto) {
    return this.glossaryService.upsert(dto);
  }

  /** DELETE /api/v1/admin/glossary/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.glossaryService.remove(id);
  }
}
