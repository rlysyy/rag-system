# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# 生成 Prisma 客户端
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 安装必要的工具
RUN apk add --no-cache bash postgresql-client

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# 复制启动脚本并设置权限
COPY start.sh ./
RUN chmod +x start.sh && \
    dos2unix start.sh    # 修复可能的行尾问题

EXPOSE 3000

# 使用 bash 显式执行脚本
CMD ["/bin/bash", "./start.sh"] 
