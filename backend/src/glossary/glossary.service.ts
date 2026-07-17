import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional } from 'class-validator';

export class CreateGlossaryDto {
  @IsString() name: string;
  @IsString() brief: string;
  @IsString() content: string;
  @IsString() colorTag: string;
  @IsOptional() @IsString() id?: string;
}

@Injectable()
export class GlossaryService {
  constructor(private readonly prisma: PrismaService) {}

  /** 获取科普名词列表（仅返回摘要，不返回富文本正文） */
  async findAll() {
    return this.prisma.glossary.findMany({
      select: { id: true, name: true, brief: true, colorTag: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** 获取单条科普名词详情（含富文本正文） */
  async findOne(id: string) {
    const item = await this.prisma.glossary.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('科普名词不存在');
    return item;
  }

  /** [管理后台] 创建或更新科普名词 */
  async upsert(dto: CreateGlossaryDto) {
    if (dto.id) {
      return this.prisma.glossary.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          brief: dto.brief,
          content: dto.content,
          colorTag: dto.colorTag,
        },
      });
    }
    return this.prisma.glossary.create({
      data: {
        name: dto.name,
        brief: dto.brief,
        content: dto.content,
        colorTag: dto.colorTag,
      },
    });
  }

  /** [管理后台] 删除科普名词 */
  async remove(id: string) {
    await this.findOne(id); // 先校验存在
    return this.prisma.glossary.delete({ where: { id } });
  }
}
