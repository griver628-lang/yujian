import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional } from 'class-validator';

export class CreateGlossaryDto {
  @IsString() name: string;
  @IsString() brief: string;
  @IsString() content: string;
  @IsString() colorTag: string;
  @IsOptional() @IsString() id?: string;
}

export const INITIAL_GLOSSARY_TERMS = [
  {
    name: '月经期',
    brief: '子宫内膜脱落出血的时期，标志着女性每个生理周期的正式开始。',
    colorTag: 'coral',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>月经期</b>，俗称“例假”或“大姨妈”，是指女性子宫内膜在卵巢激素水平下降的影响下发生周期性脱落，并伴随血液从阴道排出的生理过程。通常持续 3-7 天。</p>
        <p style="margin-top:14px; font-size:16px; color:#FF5A79;"><b>🩸 身体正在发生什么？</b></p>
        <p>此时体内的雌激素和孕激素水平降至整个周期的最低点，子宫内膜功能层剥脱。由于前列腺素（PGF2α）的分泌，子宫平滑肌会出现节律性收缩，可能引起轻重不等的痛经感。</p>
        <p style="margin-top:14px; font-size:16px; color:#FF5A79;"><b>💡 经期贴心护理指南：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>注意腹部保暖</b>：多饮温开水或生姜红糖水，避免冰冷饮食刺激子宫平滑肌加剧痉挛。</li>
          <li><b>勤换卫生用品</b>：建议每 2-3 小时更换一次卫生巾或安心裤，防止细菌在潮湿温热环境中滋生。</li>
          <li><b>温水淋浴清洁</b>：每日用温水轻柔冲洗外阴，经期严禁盆浴、泡澡或游泳，以防逆行感染。</li>
          <li><b>适度放松身心</b>：避免剧烈快跑或高强度跳跃运动，可选择散步或轻柔伸展舒缓盆腔淤血。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '预测经期',
    brief: '基于历史周期长度智能推算的下一次大姨妈来访区间，提前从容应对。',
    colorTag: 'pink',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>预测经期</b>是由算法基于你设定的“平均生理周期长度”与“历史经期起始日”推算出的预计经期范围。</p>
        <p style="margin-top:14px; font-size:16px; color:#FF5A79;"><b>📅 为什么需要预测经期？</b></p>
        <p>提前掌握下一次大姨妈的大致来临时间，有助于提前安排出行、考试、运动计划，并随身备好卫生巾或止痛药，避免尴尬与突发不适。</p>
        <p style="margin-top:14px; font-size:16px; color:#FF5A79;"><b>💡 算法小贴士：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>记录越准，预测越精</b>：建议在每次月经第一天及时在小程序打卡标记“月经来喽”，持续记录 3 个周期以上，算法预测准确率将大幅提升。</li>
          <li><b>周期偶有波动属正常</b>：情绪紧张、长途旅行、熬夜压力或环境变化都会影响下丘脑-垂体-卵巢轴，提前或延后 3-5 天均无需过度焦虑。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '卵泡期',
    brief: '经期结束至排卵前的黄金生长期，卵泡逐渐成熟，机体活力充沛。',
    colorTag: 'green',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>卵泡期</b>是指月经干净后到排卵日之前的这一阶段，通常持续约 7-10 天。这是女性整月中身心状态最好的“黄金期”。</p>
        <p style="margin-top:14px; font-size:16px; color:#27AE60;"><b>🌱 身体机能状态：</b></p>
        <p>垂体分泌的促卵泡激素（FSH）刺激卵巢中的优势卵泡发育并分泌大量雌激素。随着雌激素稳步上升，子宫内膜开始增生修复变厚。</p>
        <p style="margin-top:14px; font-size:16px; color:#27AE60;"><b>💡 生活与运动建议：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>精力旺盛期</b>：大脑思维敏捷，情绪积极愉悦，代谢率提升，非常适合攻克高难度工作与学习任务。</li>
          <li><b>运动减脂黄金期</b>：身体对胰岛素敏感度高，耐力增强，可适当增加力量训练与有氧减脂运动。</li>
          <li><b>皮肤光彩亮丽</b>：雌激素让皮脂分泌均衡，角质层保水力强，是护肤和吸收营养的绝佳时期。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '排卵期',
    brief: '排卵日前5天至排卵日后1天，受孕几率极高的黄金受孕窗口。',
    colorTag: 'light-purple',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>排卵期</b>（也称易孕期）是指卵子最有可能排出的关键时间窗口。一般指排卵日的前 5 天至排卵日后 1 天，包含排卵日当天在内，共约 7 天。</p>
        <p style="margin-top:14px; font-size:16px; color:#8E44AD;"><b>⏳ 为什么受孕窗口会长达7天？</b></p>
        <p>女性卵子排出后通常只能存活 12-24 小时，但健康精子在女性生殖道内可存活长达 3-5 天。因此在排卵前数天同房，精子仍有可能在输卵管壶腹部“守株待兔”完成受精。</p>
        <p style="margin-top:14px; font-size:16px; color:#8E44AD;"><b>💡 备孕与避孕指引：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>备孕女性</b>：可在排卵期内隔天同房一次，保持心态轻松自然，能显著提高受孕概率。</li>
          <li><b>无生育计划者</b>：此期间务必采取严密、全程且规范的避孕措施（如医用安全套或短效口服避孕药），切勿心存侥幸。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '排卵日',
    brief: '下次月经来潮前推约14天，成熟卵子排出卵巢的关键一天。',
    colorTag: 'purple',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>排卵日</b>是指成熟的优势卵泡破裂，将卵细胞排出卵巢进入输卵管的当天。在规律的周期中，排卵日通常位于下一次月经来潮前的第 14 天左右。</p>
        <p style="margin-top:14px; font-size:16px; color:#8E44AD;"><b>🥚 排卵日的典型身体信号：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>蛋清样宫颈分泌物</b>：白带量明显增多，质地透明、清亮、稀薄，拉丝长度可达 8-12 厘米以上。</li>
          <li><b>基础体温极低点</b>：排卵当天体温通常会出现一个短暂轻微的低点，次日由于孕酮作用迅速上升 0.3°C - 0.5°C。</li>
          <li><b>轻微排卵痛</b>：约 20% 女性会感到下腹单侧隐隐作痛或下坠感，通常持续数小时至一天即可自行缓解。</li>
          <li><b>少量排卵期出血</b>：极少数女性因雌激素短暂骤降会有极少许粉褐色点滴出血，持续1-2天属于正常生理现象。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '黄体期',
    brief: '排卵后到下一次经期来潮前，孕酮维持高水平，体温升高。',
    colorTag: 'orange',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>黄体期</b>是指卵子排出后到下一次月经来潮前的时期，时间相对固定，正常通常为 12-14 天。</p>
        <p style="margin-top:14px; font-size:16px; color:#E67E22;"><b>🍂 激素变化与身体反应：</b></p>
        <p>排卵后残余的卵泡壁塌陷形成富含血管的“黄体”，大量分泌孕酮（黄体酮）和雌激素。孕酮作用于体温调节中枢，使基础体温维持高位（通常上升 0.3-0.5°C）。同时促使子宫内膜充血松软，富含糖原，全力迎接胚胎着床。</p>
        <p style="margin-top:14px; font-size:16px; color:#E67E22;"><b>💡 日常调理：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li>若未受孕，黄体在第 12-14 天萎缩退化，孕酮与雌激素断崖式下跌，子宫内膜血管痉挛坏死脱落，引发生理期。</li>
          <li>黄体后期新陈代谢稍慢，体内水钠潴留，体重可能微增 1-2 斤，少吃高盐饮食可有效预防肢体浮肿。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '经前综合征 (PMS)',
    brief: '月经前7-10天反复出现的情绪波动、腹胀、胸胀等身心反应。',
    colorTag: 'gold',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>经前综合征（PMS）</b>是指在月经来潮前 7-10 天反复出现的生理、心理及行为方面的综合改变，月经来潮后症状会迅速消失或明显减轻。</p>
        <p style="margin-top:14px; font-size:16px; color:#F39C12;"><b>⚡ 常见表现：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>心理情绪</b>：易怒烦躁、焦虑忧郁、情绪低落、注意力不集中或无端疲惫。</li>
          <li><b>身体感觉</b>：乳房胀痛触痛、头痛偏头痛、腹部发胀、背酸腰痛、便秘或嗜甜食食欲大增。</li>
        </ul>
        <p style="margin-top:14px; font-size:16px; color:#F39C12;"><b>💡 科学舒缓策略：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>饮食调节</b>：减少咖啡因、浓茶与酒精摄入；限制食盐摄入以减轻水肿；多摄入富含复合碳水、钙、镁和维生素B6的食物（如香蕉、坚果、全麦）。</li>
          <li><b>适度有氧</b>：慢跑、瑜伽或冥想能够刺激大脑分泌内啡肽，天然改善情绪与躯体不适。</li>
        </ul>
      </div>
    `,
  },
  {
    name: '基础体温 (BBT)',
    brief: '晨起未进行任何活动时测得的最低体温，呈典型双相曲线。',
    colorTag: 'teal',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>基础体温（BBT）</b>是指经过 6-8 小时充足睡眠后醒来、在尚未进行任何说话、起床或翻身活动前，立即用高精度体温计测得的舌下体温。</p>
        <p style="margin-top:14px; font-size:16px; color:#16A085;"><b>📈 典型“双相型”体温曲线解读：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>低温相（排卵前）</b>：体温较低，一般在 36.2°C - 36.5°C 之间。</li>
          <li><b>排卵日低谷</b>：排卵当天体温通常会出现一个短暂轻微的低点。</li>
          <li><b>高温相（排卵后）</b>：排卵后孕激素使体温迅速上升 0.3°C - 0.5°C（多在 36.7°C 以上），并稳定持续 12-14 天。</li>
        </ul>
        <p style="margin-top:14px; font-size:16px; color:#16A085;"><b>💡 测量注意事项：</b></p>
        <p>需使用精确到小数点后两位的专业基础体温计，固定于每天早晨同一时间醒来后立即测量并记录。</p>
      </div>
    `,
  },
  {
    name: '宫颈黏液 (白带)',
    brief: '随激素呈周期性规律变化的阴道分泌物，女性健康的天然指示标。',
    colorTag: 'cyan',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>宫颈黏液（常称白带）</b>是宫颈腺体和阴道黏膜渗出液的混合物，其分泌量与外观质地受体内雌孕激素水平的调控，呈现周期性变化规律。</p>
        <p style="margin-top:14px; font-size:16px; color:#009688;"><b>💧 周期性性状对照表：</b></p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>经期刚过</b>：体内雌激素较低，分泌物量少，外阴感觉干燥或微有粘稠乳白色分泌物。</li>
          <li><b>排卵日前后</b>：雌激素达到高峰，分泌物量显著增多，呈现无色透明、拉丝度极佳的鸡蛋清状，滑润易拉丝。</li>
          <li><b>排卵过后（黄体期）</b>：孕激素升高，黏液迅速变得浓稠、浑浊且拉丝度差，形成保护栓阻挡病菌侵入。</li>
        </ul>
        <p style="margin-top:14px; font-size:16px; color:#009688;"><b>⚠️ 异常警示：</b></p>
        <p>如出现白色凝乳或豆腐渣状、泡沫状黄绿色脓性分泌物，或伴有明显腥臭味、外阴瘙痒红肿，通常提示阴道炎等妇科感染，请及时前往正规医院妇科就诊。</p>
      </div>
    `,
  },
  {
    name: '安全期与科学避孕',
    brief: '俗称“前七后八”，但失败率高达20%，不宜作为主要避孕手段。',
    colorTag: 'blue',
    content: `
      <div style="font-size:15px; color:#555; line-height:1.8;">
        <p><b>安全期</b>是指女性每个生理周期中理论上受孕几率较低的时期，民间俗称“经期前七天和经期后八天”。</p>
        <p style="margin-top:14px; font-size:16px; color:#2980B9;"><b>❌ 为什么“安全期避孕”极不安全？</b></p>
        <p>现代医学统计显示，单纯依靠安全期推算避孕的年失败率高达 <b>15% - 20%</b> 以上，属于低效避孕方法：</p>
        <ul style="padding-left:20px; margin-top:6px;">
          <li><b>排卵极易受外界干扰</b>：情绪焦虑、失眠倒时差、高压疲劳、感冒生病甚至轻微的生活变动，都可能导致排卵提前、延后，甚至是额外排卵。</li>
          <li><b>精子体内超强存活期</b>：精子在女性体内最长可存活 5 天，如果排卵提前发生，极易意外受孕。</li>
        </ul>
        <p style="margin-top:14px; font-size:16px; color:#2980B9;"><b>💡 推荐科学高效避孕方案：</b></p>
        <p>全程规范佩戴合格医用安全套（同时防病防感染）、规律服用现代低剂量复方短效口服避孕药或放置宫内节育器（IUD）。</p>
      </div>
    `,
  },
];

@Injectable()
export class GlossaryService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.seedInitialGlossaries();
    } catch (err) {
      console.warn('科普名词初始化检查跳过或稍后重试:', err);
    }
  }

  /**
   * 初始化/更新默认科普名词库
   */
  async seedInitialGlossaries() {
    for (const item of INITIAL_GLOSSARY_TERMS) {
      await this.prisma.glossary.upsert({
        where: { name: item.name },
        update: {
          brief: item.brief,
          content: item.content,
          colorTag: item.colorTag,
        },
        create: {
          name: item.name,
          brief: item.brief,
          content: item.content,
          colorTag: item.colorTag,
        },
      });
    }
    console.log(
      `✅ [科普词库] 成功初始化/同步 ${INITIAL_GLOSSARY_TERMS.length} 条女性健康科普名词数据`,
    );
  }

  /** 获取科普名词列表（若数据库为空则自愈初始化） */
  async findAll() {
    let items = await this.prisma.glossary.findMany({
      select: { id: true, name: true, brief: true, colorTag: true },
      orderBy: { createdAt: 'asc' },
    });

    if (items.length === 0) {
      await this.seedInitialGlossaries();
      items = await this.prisma.glossary.findMany({
        select: { id: true, name: true, brief: true, colorTag: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    return items;
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
