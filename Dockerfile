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
ENV NODE_ENV=production

# 安装必要的工具和依赖
RUN apk update && apk add --no-cache postgresql-client bash
RUN npm install -g prisma@6.3.1

# 复制 standalone 构建
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# 复制启动脚本
COPY start.sh wait-for-it.sh ./
RUN chmod +x start.sh wait-for-it.sh

# 生成 Prisma 客户端
RUN npx prisma generate

EXPOSE 3000

# 使用 bash 执行脚本
CMD ["/bin/bash", "./start.sh"]