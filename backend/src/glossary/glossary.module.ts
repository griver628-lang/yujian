import { Module } from '@nestjs/common';
import { GlossaryController, AdminGlossaryController } from './glossary.controller';
import { GlossaryService } from './glossary.service';

@Module({
  controllers: [GlossaryController, AdminGlossaryController],
  providers: [GlossaryService],
})
export class GlossaryModule {}
