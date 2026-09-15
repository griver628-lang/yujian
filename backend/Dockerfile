# ==================== Build Stage ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖定义
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

# 安装依赖并生成 Prisma Client
RUN npm ci
RUN npx prisma generate

# 复制源文件并构建编译
COPY src ./src
RUN npm run build

# 双向兼容映射：保证 dist/main.js 与 dist/src/main.js 同时存在
RUN if [ -f dist/main.js ]; then mkdir -p dist/src && cp -f dist/main.js dist/src/main.js; fi
RUN if [ -f dist/src/main.js ] && [ ! -f dist/main.js ]; then cp -f dist/src/main.js dist/main.js; fi

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

# 运行镜像中再次确保两处路径全部存在
RUN if [ -f dist/main.js ] && [ ! -f dist/src/main.js ]; then mkdir -p dist/src && cp -f dist/main.js dist/src/main.js; fi
RUN if [ -f dist/src/main.js ] && [ ! -f dist/main.js ]; then cp -f dist/src/main.js dist/main.js; fi

# 暴露微信云托管容器默认的 80 端口
EXPOSE 80

# 容器启动命令：执行数据库同步，并启动服务（无论指定哪条路径都能命中）
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]
