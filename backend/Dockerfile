# ==================== Build Stage ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖定义
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# 安装依赖并生成 Prisma Client
RUN npm ci
RUN npx prisma generate

# 复制源文件并构建编译
COPY src ./src
RUN npm run build

# ==================== Production Stage ====================
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量为生产环境
ENV NODE_ENV=production
ENV PORT=80

# 复制依赖和构建产物
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# 暴露微信云托管容器默认的 80 端口
EXPOSE 80

# 容器启动命令：先执行数据库同步（无损更新表结构），再启动 NestJS 实例
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/src/main.js"]
